from flask import request, logging, jsonify, Blueprint
from pony.orm import db_session, select

from .conf import DB_NAME, DB_TYPE, LOGGER
import rooms.dbmanager as dbm
from rooms import cas

blueprint = Blueprint("query", __name__)

logger = logging.getLogger(LOGGER)


@blueprint.route("/colleges", methods=["GET"])
@dbm.use_app_db
def colleges(db):
    college_list = select(r.college for r in db.Room)[:]
    return jsonify(college_list)


@blueprint.route("/buildings", methods=["GET"])
@dbm.use_app_db
def buildings(db):
    # college = request.args.get("college")
    colleges = request.args.getlist("college")

    if len(colleges) == 0:
        colleges = select(r.college for r in db.Room)[:]

    building_by_college = {}
    for college in colleges:
        q = select(r.building for r in db.Room if r.college == college)
        building_by_college[college] = q[:]

    return jsonify(building_by_college)

@blueprint.route("/query", methods=["GET"])
@dbm.use_app_db
def query(db):
    query_string = request.args.get("q")

    limit = int(request.args.get("limit", 50))
    continue_from = int(request.args.get("continueFrom", 0))
    order_by = request.args.get("orderBy", "id")

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

    res = select(
        room for room in db.Room
        if (room.college in colleges)
        and (room.building in buildings)
        and (room.floor == floor or floor is None)
        and (room.roomnum == roomnum or roomnum is None)

        and (sqft is None or room.sqft >= sqft)
        and (room.occupancy == occupancy or occupancy is None)
        and (room.numrooms == numrooms or numrooms is None)
        and (room.subfree == subfree or subfree is None)
    )
    res = [room.to_dict() for room in res]

    # get the ids of logged in user's favorite user
    fave_roomids = set()
    if cas.netid() is not None:
        netid = cas.netid()
        group = db.User.get_or_create(netid=netid).group
        fave_roomids = {fav.room.id for fav in group.favorites.select()}

    res.sort(key=lambda room_dict: room_dict[order_by] if order_by != "sqft" else -room_dict["sqft"])
    limited = res[continue_from:continue_from+limit]
    for room in limited:
        room['favorited'] = (room['id'] in fave_roomids)

    return jsonify(limited)
