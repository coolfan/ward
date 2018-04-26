from flask import request, logging, jsonify, session, Response, Blueprint, \
    abort, current_app
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
    current_app.logger.debug(f"favorite received room id {roomid}")

    if not db.Room.exists(id=roomid):
        return Response("Invalid roomid", 422)
    room = db.Room[roomid]

    netid = cas.netid()

    user = db.User.get_or_create(netid=netid)

    # User must have a personal favorites list!
    # TODO: generalize this process
    ranked_room_list = user.getfavoritelist()

    if room in ranked_room_list:
        current_app.logger.debug("Favoriting an already favorite room")
    else:
        fav = db.RankedRoom(
            room=room, rank=len(ranked_room_list), ranked_room_list=ranked_room_list
        )

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

    ranked_room_list = user.getfavoritelist()
    if room in ranked_room_list:
        rr = ranked_room_list.get_by_room(room)
        current_app.logger.debug(f"Deleting ranked room {rr}")
        deleted_rank = rr.rank
        rr.delete()
        for rr in ranked_room_list.ranked_rooms:
            if rr.rank > deleted_rank:
                rr.rank -= 1
    else:
        current_app.logger.debug("Unfavoriting a non favorite room")

    return jsonify({'success': True})


@blueprint.route("/reorder_favorites", methods=["POST"])
@cas.authenticated
@dbm.use_app_db
def reorder_favorites(db):
    netid = cas.netid()
    user = db.User.get_or_create(netid=netid)

    favoriteid_list = request.get_json()
    real_favoriteid_list = select(room for room in db.FavoriteRoom if
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
    groups = user.groups

    lists = dict()
    for group in groups:
        # Even though DB allows multiple lists per group--logically we will only allow 1
        ranked_room_lists = group.ranked_room_lists.select()[:]

        # Select all the ranked rooms in the list
        ranked_room_list = ranked_room_lists[0].ranked_rooms.select()[:]

        # Sort by rank
        ranked_room_list.sort(key=lambda ranked_room: ranked_room.rank)

        name = group.name if group.name else f"Group {group.id}"
        lists[name] = [ranked_room.room.to_dict() for ranked_room in ranked_room_list]

    rrl = user.getfavoritelist()
    lists["Personal Favorites"] = [rr.room.to_dict() for rr in rrl.ranked_rooms.select()]

    return jsonify(lists)
