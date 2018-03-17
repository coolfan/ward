from flask import request, logging, jsonify
from pony.orm import db_session, select

from rooms import app
import rooms.conf as conf
import rooms.dbmanager as dbm

db = dbm.connect(conf.DB_NAME, conf.DB_TYPE)

logger = logging.getLogger(conf.LOGGER)


@app.route("/query", methods=["GET"])
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