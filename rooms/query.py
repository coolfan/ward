from flask import request, logging, jsonify, Blueprint
from pony.orm import db_session, select

from .conf import DB_NAME, DB_TYPE, LOGGER
from .dbmanager import connect

blueprint = Blueprint("query", __name__)

db = connect(DB_NAME, DB_TYPE)

logger = logging.getLogger(LOGGER)


@blueprint.route("/query", methods=["GET"])
@db_session
def query():
    query_string = request.args.get("q")

    college = request.args.get("college")
    building = request.args.get("building")
    floor = request.args.get("floor")
    roomnum = request.args.get("roomnum")

    sqft = request.args.get("sqft")
    occupancy = request.args.get("occupancy")
    numrooms = request.args.get("numrooms")
    subfree = request.args.get("subfree")

    sqft = int(sqft) if sqft is not None else sqft
    occupancy = int(occupancy) if occupancy else occupancy
    numrooms = int(numrooms) if numrooms else numrooms
    subfree = bool(subfree) if subfree else subfree

    res = select(
        room for room in db.Room
        if (room.college == college or college is None)
        and (room.building == building or building is None)
        and (room.floor == floor or floor is None)
        and (room.roomnum == roomnum or roomnum is None)

        and (room.sqft == sqft or sqft is None)
        and (room.occupancy == occupancy or occupancy is None)
        and (room.numrooms == numrooms or numrooms is None)
        and (room.subfree == subfree or subfree is None)
    )
    res = [room.to_dict() for room in res]
    return jsonify(res)