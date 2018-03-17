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
def favorite() -> Response:
    """
    Adds a room to favorites list of group to which the currently logged in
    user belongs.  Expects parameters in form data:
        - roomid: id of the room to add to favorites list
    :return: Response(200) if successful
    """
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


@app.route("/unfavorite", methods=["POST"])
@cas.authenticated()
@db_session
def unfavorite():
    """
    Removes a room from favorites list of group to which the currently
    logged in user belongs.  Expects parameters in form data:
        - roomid: id of the room to remove from favorite list 
    :return: 
    """
    roomid = request.form.get("roomid")
    room = db.Room[roomid]

    netid = session.get("netid")
    user = db.User.get(netid=netid)
    group = user.group

    curr_faves = group.favorites

    # TODO: finish this function
    raise NotImplementedError()


@app.route("/favorites", methods=["GET"])
@cas.authenticated()
@db_session
def favorites():
    # TODO: return json list of rooms in your group's list
    netid = session.get("netid")
    user = db.User.get(netid=netid)
    group = user.group

    curr_faves = group.favorites
    rooms = [fave.room.to_dict() for fave in curr_faves]
    return jsonify(rooms)