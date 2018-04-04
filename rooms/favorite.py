from flask import request, logging, jsonify, session, Response, Blueprint
from pony.orm import db_session, select

from rooms import app, cas, conf
from rooms import dbmanager as dbm

blueprint = Blueprint("favorite", __name__)

db = dbm.connect(conf.DB_NAME, conf.DB_TYPE)
logger = logging.getLogger(conf.LOGGER)


@blueprint.route("/favorite", methods=["GET"])
@cas.authenticated
@db_session
def favorite() -> Response:
    """
    Adds a room to favorites list of group to which the currently logged in
    user belongs.  Expects parameters in url params:
        - roomid: id of the room to add to favorites list
    :return: Response(200) if successful
    """
    if "roomid" not in request.args:
        return Response("Missing roomid", 400)
    roomid = request.args.get("roomid")

    if not db.Room.exists(id=roomid):
        return Response("Invalid roomid", 422)
    room = db.Room[roomid]

    netid = cas.netid()

    user = db.User.get_or_create(netid=netid)
    group = user.group

    if db.FavoriteRoom.get(group=group, room=room) is None:
        app.logger.debug("%s has favorited room id #%s" % (netid, roomid))
        curr_faves = group.favorites
        fav = db.FavoriteRoom(
            group=group, room=room, rank=len(curr_faves)
        )
    else:
        app.logger.debug("%s attempted to favorite room %s again" % (netid, roomid))
    return jsonify({'success': True})


@blueprint.route("/unfavorite", methods=["GET"])
@cas.authenticated
@db_session
def unfavorite():
    """
    Removes a room from favorites list of group to which the currently
    logged in user belongs.  Expects parameters in form data:
        - roomid: id of the room to remove from favorite list 
    :return: 
    """
    if "roomid" not in request.args:
        return Response("Missing roomid", 400)
    roomid = request.args.get("roomid")

    if not db.Room.exists(id=roomid):
        return Response("Invalid roomid", 422)
    room = db.Room[roomid]

    netid = cas.netid()
    user = db.User.get_or_create(netid=netid)
    group = user.group

    fav = db.FavoriteRoom.get(room=room, group=group)
    if fav is not None:
        app.logger.debug("%s unfavorited room %s" % (netid, roomid))
        deleted_rank = fav.rank
        fav.delete()

        for fav in group.favorites:
            if fav.rank > deleted_rank:
                fav.rank -= 1
    else:
        app.logger.debug("%s unfavorited room %s that was not favorite" % (netid, roomid))

    return jsonify({'success':True})


@blueprint.route("/favorites", methods=["GET"])
@cas.authenticated
@db_session
def favorites():
    """
    Return a list of the rooms in your favorites list, sorted by rank
    :return: 
    """
    netid = cas.netid()
    user = db.User.get_or_create(netid=netid)
    group = user.group

    curr_faves = group.favorites.select()[:]
    curr_faves.sort(key=lambda fav: fav.rank)
    rooms = [fave.room.to_dict() for fave in curr_faves]
    return jsonify(rooms)