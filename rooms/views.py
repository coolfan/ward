from flask import render_template
from pony.orm import select

from rooms import app
import rooms.dbmanager as dbm
import rooms.conf as conf


@app.route("/")
def table():
    db = dbm.connect(conf.DB_NAME, conf.DB_TYPE)
    query = select(r for r in db.Room)
    room_data = [r.to_dict() for r in query]
    return render_template('table.html', room_data=room_data)