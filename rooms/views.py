from flask import render_template, Blueprint
from pony.orm import db_session
from pony.orm import select

from rooms import app, conf
from rooms import dbmanager as dbm

# DON'T REMOVE THESE!!!  They appear unused but need them for flask app
# routings.
import rooms.cas
import rooms.favorite
import rooms.group

db = dbm.connect(conf.DB_NAME, conf.DB_TYPE)
blueprint = Blueprint("views", __name__)


@blueprint.route("/")
@db_session
def table():
    query = select(r for r in db.Room)
    room_data = [r.to_dict() for r in query]
    return render_template('table.html', room_data=room_data)