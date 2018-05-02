from flask import request, logging, jsonify, session, Response, Blueprint, \
    abort, current_app
from pony.orm import db_session, select

from rooms import cas, conf
from rooms.flask_extensions import AuthBlueprint
import rooms.dbmanager as dbm

blueprint = AuthBlueprint("favorite", __name__)

logger = logging.getLogger(conf.LOGGER)


def _verify_args(request_args, user, db):
    """
    Verify the args to a favorite function - checks valid roomid, groupid.
    :returns: if valid, returns the room, group
    """
    if "roomid" not in request_args:
        return False, Response("Missing roomid", 400), None
    room_id = request_args["roomid"]

    if not db.Room.exists(id=room_id):
        return False, Response("Invalid roomid", 422), None
    room = db.Room[room_id]

    group = None
    if "groupid" in request_args:
        group_id = request_args["groupid"]
        if not db.Group.exists(id=group_id):
            return False, Response("Invalid groupid", 422), None
        group = db.Group[group_id]

        if user not in group.members:
            return False, Response("You are not in this group", 403), None

    return True, room, group




@blueprint.auth_route("/favorite", methods=["GET"])
def favorite(user, db) -> Response:
    """
    Adds a room to favorites list of group to which the currently logged in
    user belongs.  Expects parameters in url params:
        - roomid: id of the room to add to favorites list
    :return: Response(200) if successful
    """

    # falg indicates validity.  Other holds error response, or tuple room, group
    flag, *other = _verify_args(request.args, user, db)
    if not flag:
        return other[0]
    room, group = other
    ranked_room_list = user.getfavoritelist()
    if group is not None:
        ranked_room_list = group.getfavoritelist()

    if room in ranked_room_list:
        current_app.logger.debug("Favoriting an already favorite room")
    else:
        fav = db.RankedRoom(
            room=room,
            rank=len(ranked_room_list.ranked_rooms),
            ranked_room_list=ranked_room_list
        )

    return jsonify({'success': True})


@blueprint.auth_route("/unfavorite", methods=["GET"])
def unfavorite(user, db):
    """
    Removes a room from favorites list of group to which the currently
    logged in user belongs.  Expects parameters in form data:
        - roomid: id of the room to remove from favorite list
    :return:
    """
    flag, *other = _verify_args(request.args, user, db)
    if not flag:
        return other[0]
    room, group = other
    ranked_room_list = user.getfavoritelist()
    if group is not None:
        ranked_room_list = group.getfavoritelist()

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


@blueprint.auth_route("/reorder_favorites", methods=["POST"])
def reorder_favorites(user, db):
    flag, *other = _verify_args(request.args, user, db)
    if not flag:
        return other[0]
    room, group = other
    ranked_room_list = user.getfavoritelist()
    if group is not None:
        ranked_room_list = group.getfavoritelist()

    favoriteid_list = request.get_json()
    real_favoriteid_list = {rr.id for rr in ranked_room_list.ranked_rooms}
    if set(favoriteid_list) != set(real_favoriteid_list):
        abort(400)

    faverooms = [db.RankedRoom.get(id=fid) for fid in favoriteid_list]

    for newrank, faveroom in enumerate(faverooms): # this should fix things??
        faveroom.rank = newrank

    return jsonify({"success": True})


@blueprint.auth_route("/favorites", methods=["GET"])
def favorites(user, db):
    """
    Return a list of the rooms in your favorites list, sorted by rank
    :return:
    """
    groups = user.groups

    group_id = request.args.get("id")

    if group_id is None:
        lists = dict()
        for group in groups:
            # Even though DB allows multiple lists per group--logically we will only allow 1
            group_list = group.getfavoritelist()

            # Select all the ranked rooms in the list
            ranked_room_list = group_list.ranked_rooms.select()[:]

            # Sort by rank
            ranked_room_list.sort(key=lambda ranked_room: ranked_room.rank)

            name = group.name if group.name else f"Group {group.id}"
            lists[name] = [ranked_room.room.to_dict() for ranked_room in ranked_room_list]

        rrl = user.getfavoritelist()
        lists["Personal Favorites"] = [rr.room.to_dict() for rr in rrl.ranked_rooms.select()]

        return jsonify(lists)
    else:
        group = db.Group.get(id=group_id)
        if group is None:
            return Response("invalid group id", 422)
        if group not in groups:
            return Response("not in this group", 403)
        group_list = group.getfavoritelist()
        rrl = group_list.ranked_rooms.select()[:]
        rrl.sort(key=lambda rr: rr.rank)
        return jsonify([rr.room.to_dict() for rr in rrl])