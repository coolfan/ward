import json

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

    return True, room


@blueprint.auth_route("/favorite", methods=["GET"])
def favorite(user, db) -> Response:
    """
    Adds a room to favorites list of group to which the currently logged in
    user belongs.  Expects parameters in url params:
        - roomid: id of the room to add to favorites list
    :return: Response(200) if successful
    """

    # flag indicates validity.  room might actuall be an error,
    # which can be returned
    flag, room = _verify_args(request.args, user, db)
    if not flag: return room

    ranked_room_list = user.getfavoritelist()
    group_rrl = user.getfavoritelist(room=room)

    if room in ranked_room_list:
        current_app.logger.debug("Favoriting an already favorite room")
    else:
        fav_personal = db.RankedRoom(
            room=room,
            rank=len(ranked_room_list.ranked_rooms),
            ranked_room_list=ranked_room_list,
            creator=user
        )
        if group_rrl is not None:
            fav_group = db.RankedRoom(
                room=room,
                rank=len(group_rrl.ranked_rooms),
                ranked_room_list=group_rrl,
                creator=user
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
    # flag indicates validity.  room might actuall be an error,
    # which can be returned
    flag, room = _verify_args(request.args, user, db)
    if not flag: return room

    ranked_room_list = user.getfavoritelist()
    group_rrl = user.getfavoritelist(room=room)

    ranked_room_list.remove(room)
    if group_rrl is not None: group_rrl.remove(room)

    return jsonify({'success': True})


@blueprint.auth_route("/reorder_favorites", methods=["POST"])
def reorder_favorites(user, db):
    post_data = json.loads(request.get_data())
    group_id = post_data.get("groupid", "-1")
    ranked_room_list = user.getfavoritelist()
    if group_id != "-1":
        group = db.Group.get(id=group_id)
        if group is None: return Response("Invalid groupid", 422)
        ranked_room_list = group.getfavoritelist()

    # Ensure that they give us a list of all the room ids
    roomid_list = post_data["data"]
    real_roomid_list = {rr.room.id for rr in ranked_room_list.ranked_rooms}
    if set(roomid_list) != set(real_roomid_list):
        abort(400)

    ranked_rooms = [
        ranked_room_list.get_by_room(db.Room[rid])
        for rid in roomid_list
    ]

    for newrank, ranked_room in enumerate(ranked_rooms):
        ranked_room.rank = newrank

    return jsonify({"success": True})


@blueprint.auth_route("/favorites", methods=["GET"])
def favorites(user, db):
    """
    Return a list of the rooms in your favorites list, sorted by rank
    :return:
    """
    groups = user.groups

    group_id = request.args.get("groupid", "-1")

    if group_id == "-1":
        lists = dict()
        for group in groups:
            # Even though DB allows multiple lists per group--logically we will only allow 1
            group_list = group.getfavoritelist()

            # Select all the ranked rooms in the list
            ranked_room_list = group_list.ranked_rooms.select()[:]

            # Sort by rank
            ranked_room_list.sort(key=lambda ranked_room: ranked_room.rank)

            name = str(group.id)
            lists[name] = [rr.to_dict(user=user) for rr in ranked_room_list]

        rrl = user.getfavoritelist()
        lists["-1"] = [rr.to_dict(user=user) for rr in rrl.ranked_rooms.select()]

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
        return jsonify([rr.to_dict(user=user) for rr in rrl])