from flask import request, logging, jsonify, session, Response
from pony.orm import db_session, select

from rooms import app
import rooms.cas as cas
import rooms.conf as conf
import rooms.dbmanager as dbm

db = dbm.connect(conf.DB_NAME, conf.DB_TYPE)
logger = logging.getLogger(conf.LOGGER)


@app.route("/favorite", methods=["POST"])
@cas.authenticated()
@db_session
def favorite():
    roomid = request.form.get("roomid")
    room = db.Room[roomid]

    netid = session.get("netid")
    user = db.User.get(netid=netid)
    group = user.group

    curr_faves = group.favorites
    fav = db.FavoriteRoom(
        group=group, room=room, rank=len(curr_faves)
    )

    return Response(200)
