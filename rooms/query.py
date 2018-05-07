from flask import request, logging, jsonify, current_app
from pony.orm import select

import rooms.dbmanager as dbm
from rooms.flask_extensions import AuthBlueprint
from rooms.likelihood import likelihood
from .conf import LOGGER

blueprint = AuthBlueprint("query", __name__)

logger = logging.getLogger(LOGGER)


@blueprint.route("/colleges", methods=["GET"])
@dbm.use_app_db
def colleges(db):
    college_list = select(r.college for r in db.Room)[:]
    return jsonify(college_list)


@blueprint.route("/buildings", methods=["GET"])
@dbm.use_app_db
def buildings(db):
    colleges = request.args.getlist("college")

    if len(colleges) == 0:
        colleges = select(r.college for r in db.Room)[:]

    building_by_college = {}
    for college in colleges:
        q = select(r.building for r in db.Room if r.college == college)
        building_by_college[college] = q[:]

    return jsonify(building_by_college)


def rich_query(q: str, db):
    """parses a free form query string!"""
    print(f"Evaluating query: {q}")
    tokens = q.lower().split()
    all_colleges = list(select(r.college for r in db.Room))
    all_buildings = list(select(r.building for r in db.Room))
    all_roomnums = list(select(r.roomnum for r in db.Room))

    college_aliases = {c.split()[0].lower(): i for i, c in enumerate(all_colleges)}
    building_aliases = {" ".join(b.split()[:-1]).lower(): i for i, b in enumerate(all_buildings)}
    room_aliases = {r.lower(): i for i, r in enumerate(all_roomnums)}

    print(building_aliases)

    colleges = []
    buildings = []
    roomnums = []

    for tok in tokens:
        if tok == "hall": continue
        if tok == "college": continue
        if tok == "rocky": tok = "rockefeller"
        if tok in {"dodge", "osborn"}: tok = "dodge osborn"
        if len(tok) < 3 and tok.isdecimal(): tok = f"{int(tok):03d}"
        if tok in college_aliases:
            colleges.append(all_colleges[college_aliases[tok]])
        elif tok in building_aliases:
            buildings.append(all_buildings[building_aliases[tok]])
        elif tok in room_aliases:
            roomnums.append(all_roomnums[room_aliases[tok]])
        else:
            colleges = ["FAKE COLLEGE"]
            break

    return colleges, buildings, roomnums


@blueprint.auth_route("/query", methods=["GET"])
def query(user, db):
    q = request.args.get("q", "")
    rich_colleges, rich_buildings, rich_roomnums = rich_query(q, db)
    current_app.logger.debug(f"Discovered colleges: {rich_colleges}")
    current_app.logger.debug(f"Discovered buildings: {rich_buildings}")
    current_app.logger.debug(f"Discovered roomnums: {rich_roomnums}")

    limit = int(request.args.get("limit", 50))
    continue_from = int(request.args.get("continueFrom", 0))
    order_by = request.args.get("orderBy", "college")

    # TODO: automate how this is done
    colleges = request.args.getlist("college")
    buildings = request.args.getlist("building")
    floor = request.args.get("floor")
    roomnum = request.args.get("roomnum")

    sqft = request.args.get("sqft")
    occupancy = request.args.get("occupancy")
    numrooms = request.args.get("numrooms")
    subfree = request.args.get("subfree")

    sqft = int(sqft) if sqft is not None else 0
    occupancy = int(occupancy) if occupancy else occupancy
    numrooms = int(numrooms) if numrooms else numrooms
    subfree = bool(subfree) if subfree else subfree

    if len(colleges) == 0:
        colleges = select(r.college for r in db.Room)[:]
    if len(buildings) == 0:
        buildings = select(r.building for r in db.Room)[:]

    rooms = select(
        room for room in db.Room
        if (room.college in colleges)
        and (room.college in rich_colleges or len(rich_colleges) == 0)
        and (room.building in buildings)
        and (room.building in rich_buildings or len(rich_buildings) == 0)
        and (room.floor == floor or floor is None)
        and (room.roomnum == roomnum or roomnum is None)
        and (room.roomnum in rich_roomnums or len(rich_roomnums) == 0)
        and (sqft is None or room.sqft >= sqft)
        and (room.occupancy == occupancy or occupancy is None)
        and (room.numrooms == numrooms or numrooms is None)
        and (room.subfree == subfree or subfree is None)
    )[:]

    # get the ids of logged in user's favorite user
    fave_roomids = set()
    fave_roomids |= {
        rr.room.id
        for rr in user.getfavoritelist().ranked_rooms
    }

    rooms.sort(key=lambda room: getattr(room, order_by) if order_by != "sqft" else -1 * getattr(room, "sqft"))
    limited = rooms[continue_from:continue_from + limit]

    room_dicts = [r.to_dict(user=user) for r in limited]

    return jsonify(room_dicts)
