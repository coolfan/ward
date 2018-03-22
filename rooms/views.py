from flask import render_template
from pony.orm import db_session
from pony.orm import select

from rooms import app
import rooms.dbmanager as dbm
import rooms.conf as conf

db = dbm.connect(conf.DB_NAME, conf.DB_TYPE)


@app.route("/")
@db_session
def table():
    query = select(r for r in db.Room)
    room_data = [r.to_dict() for r in query]
    return render_template('search_page/table.html', room_data=room_data)