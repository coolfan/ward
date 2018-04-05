import os

import flask
from flask import request, logging, jsonify, session, Response, Blueprint, render_template, redirect, current_app
from pony.orm import db_session, select
from werkzeug.utils import secure_filename

from rooms import app, cas, conf
from rooms import dbmanager as dbm

blueprint = Blueprint("reviews", __name__)

db = dbm.connect(conf.DB_NAME, conf.DB_TYPE)
logger = logging.getLogger(conf.LOGGER)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


@blueprint.route("/test_review")
def test_review_page():
    return render_template("test_reviews.html")


def allowed_file(filename: str) -> bool:
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@blueprint.route("/review", methods=["POST"])
@cas.authenticated
@db_session
def review():
    roomid = request.form['roomid']
    room = db.Room.get(id=roomid)

    netid = cas.netid()
    user = db.User.get_or_create(netid=netid)

    rating = request.form.get('rating')
    text = request.form.get('text')

    review = db.Review(owner=user, room=room, rating=rating, text=text)
    review.pictures = []

    uploaded_pictures = request.files.getlist('pictures')
    upload_folder = current_app.config['UPLOAD_DIR']
    for picture in uploaded_pictures:
        if allowed_file(picture.filename):
            filename = secure_filename(picture.filename)
            filepath = os.path.join(upload_folder, filename)
            picture.save(filepath)
            review.pictures.append(filename)
    return jsonify({"success": True})


@blueprint.route("/reviews", methods=["GET"])
@cas.authenticated
@db_session
def reviews():
    roomid = request.args.get("roomid")
    room = db.Room.get(id=roomid)
    room_reviews = room.reviews.select()
    review_dicts = []
    for r in room_reviews:
        d = r.to_dict()
        d['text'] = r.text
        review_dicts.append(d)
    return jsonify(review_dicts)

