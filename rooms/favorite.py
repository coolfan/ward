from flask import request, logging, jsonify, session, Response, Blueprint, \
    abort
from pony.orm import db_session, select

from rooms import app, cas, conf
import rooms.dbmanager as dbm

blueprint = Blueprint("favorite", __name__)

logger = logging.getLogger(conf.LOGGER)


@blueprint.route("/favorite", methods=["GET"])
@cas.authenticated
@dbm.use_app_db
def favorite(db) -> Response:
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
        app.logger.debug(f"{netid} has favorited room {roomid}")
        curr_faves = group.favorites
        fav = db.FavoriteRoom(
            group=group, room=room, rank=len(curr_faves)
        )
    else:
        app.logger.debug(f"{netid} attempted to favorite room {roomid} again")
    return jsonify({'success': True})


@blueprint.route("/unfavorite", methods=["GET"])
@cas.authenticated
@dbm.use_app_db
def unfavorite(db):
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
        app.logger.debug(f"{netid} unfavorited room {roomid}")
        deleted_rank = fav.rank
        fav.delete()

        for fav in group.favorites:
            if fav.rank > deleted_rank:
                fav.rank -= 1
    else:
        debug_msg = f"{netid} unfavorited room {roomid} that was not favorite"
        app.logger.debug(debug_msg)

    return jsonify({'success': True})


@blueprint.route("/reorder_favorites", methods=["POST"])
@cas.authenticated
@dbm.use_app_db
def reorder_favorites(db):
    netid = cas.netid()
    user = db.User.get_or_create(netid=netid)

    favoriteid_list = request.get_json()
    real_favoriteid_ls = select(room for room in db.FavoriteRoom if
                                room.group == user.group)
    if set(favoriteid_list) != set(real_favoriteid_list):
        abort(400)

    faverooms = [db.FavoriteRoom.get(id=fid) for fid in favoriteid_list]
    for faveroom in faverooms:
        if faveroom is None or faveroom.group != user.group:
            abort(403)

    for newrank, faveroom in enumerate(faverooms): # this should fix things??
        faveroom.rank = newrank

    return jsonify({"success": True})


@blueprint.route("/favorites", methods=["GET"])
@cas.authenticated
@dbm.use_app_db
def favorites(db):
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
