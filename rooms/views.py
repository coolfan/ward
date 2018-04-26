import traceback

from flask import render_template, Blueprint, jsonify, current_app
from pony.orm import select

from rooms import dbmanager as dbm
from rooms import cas

blueprint = Blueprint("views", __name__)


@blueprint.route("/")
@dbm.use_app_db
@cas.authenticated
def table(db):
    query = select(r for r in db.Room)
    room_data = [r.to_dict() for r in query]
    return render_template('search_page/search_page.html', room_data=room_data)


@blueprint.route("/favorites_page")
def favorites():
    return render_template('favorites_page/favorites_page.html')


@blueprint.route("/reviews_page")
def reviews():
    return render_template('reviews_page/reviews_page.html')


@blueprint.route("/account_page")
def account():
    return render_template('account_page/account_page.html')
