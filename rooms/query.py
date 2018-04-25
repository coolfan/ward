import math

from flask import request, logging, jsonify, Blueprint, current_app
import numpy as np
from pony.orm import db_session, select
import scipy.stats

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
    college = request.args.get("college")

    building_list = select(
        r.building for r in db.Room
        if (college is None or r.college == college)
    )[:]

    return jsonify(building_list)


def likelihood(my_groups, room) -> int:
    # TODO: This crashes!  make it look for the draw group corresponding to the room
    if len(my_groups) == 0: return 50
    my_time = my_groups.timefromstart
    if my_time is None: return 50
    times = [d.timefromstart for d in room.drawings]
    if len(times) == 0: return 50
    mean = np.mean(times)
    stddev = np.std(times)
    current_app.logger.debug(f"Mean: {mean}, Std: {stddev}")
    stddev = stddev if stddev > 0.0 else 10*60*60
    prob = 1.0 - scipy.stats.norm.cdf(my_time, mean, stddev)
    return int(prob * 100.0)


@blueprint.route("/query", methods=["GET"])
@dbm.use_app_db
def query(db):
    query_string = request.args.get("q")

    limit = int(request.args.get("limit", 50))
    continue_from = int(request.args.get("continueFrom", 0))
    order_by = request.args.get("orderBy", "college")

    # TODO: automate how this is done
    college = request.args.get("college")
    building = request.args.get("building")
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

    rooms = select(
        room for room in db.Room
        if (room.college == college or college is None)
        and (room.building == building or building is None)
        and (room.floor == floor or floor is None)
        and (room.roomnum == roomnum or roomnum is None)

        and (sqft is None or room.sqft >= sqft)
        and (room.occupancy == occupancy or occupancy is None)
        and (room.numrooms == numrooms or numrooms is None)
        and (room.subfree == subfree or subfree is None)
    )[:]

    # get the ids of logged in user's favorite user
    fave_roomids = set()
    groups = []
    if cas.netid() is not None:
        netid = cas.netid()
        groups = db.User.get_or_create(netid=netid).groups
        fave_roomids = {fav.room.id for fav in groups.ranked_room_lists.ranked_rooms}

    limited = rooms[continue_from:continue_from+limit]
    room_dicts = []
    for room in limited:
        d = room.to_dict()
        d['favorited'] = d['id'] in fave_roomids
        d['likelihood'] = likelihood(groups, room)
        room_dicts.append(d)
    room_dicts.sort(key=lambda d: d[order_by])

    return jsonify(room_dicts)
