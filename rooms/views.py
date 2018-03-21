import traceback

from flask import render_template, Blueprint, jsonify, current_app
from pony.orm import db_session
from pony.orm import select

from rooms import conf
from rooms import dbmanager as dbm

blueprint = Blueprint("views", __name__)


@blueprint.route("/")
@dbm.use_app_db
def table(db):
    query = select(r for r in db.Room)
    room_data = [r.to_dict() for r in query]
<<<<<<< HEAD
    return render_template('search_page/table.html', room_data=room_data)
=======
    return render_template('search_page/table.html', room_data=room_data)
>>>>>>> Revert "Revert "Started reorganizing structure of app by creating seperate folders for favorite and search pages, starting to include rooms_data in search page""
