import json
import os

from flask import request, logging, jsonify, session, Response, Blueprint, \
    render_template, redirect, current_app, send_from_directory
from werkzeug.utils import secure_filename

from rooms import cas, conf
import rooms.dbmanager as dbm

blueprint = Blueprint("reviews", __name__)

logger = logging.getLogger(conf.LOGGER)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


@blueprint.route("/test_review")
def test_review_page():
    return render_template("test_reviews.html")


def allowed_file(filename: str) -> bool:
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@blueprint.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)


@blueprint.route("/review", methods=["POST"])
@cas.authenticated
@dbm.use_app_db
def review(db):
    roomid = request.form['roomid']
    room = db.Room.get(id=roomid)

    netid = cas.netid()
    user = db.User.get_or_create(netid=netid)

    rating = request.form.get('rating')
    text = request.form.get('text')

    # TODO: # automate this with the rating attributes
    review = db.Review(owner=user, room=room, rating=rating, text=text)
    pictures = []

    uploaded_pictures = request.files.getlist('pictures')
    upload_folder = current_app.config['UPLOAD_DIR']
    for picture in uploaded_pictures:
        if allowed_file(picture.filename):
            filename = secure_filename(picture.filename)
            filepath = os.path.join(upload_folder, filename)
            picture.save(filepath)
            pictures.append(filename)
    review.pictures = json.dumps(pictures)
    return jsonify({"success": True})


@blueprint.route("/reviews", methods=["GET"])
@cas.authenticated
@dbm.use_app_db
def reviews(db):
    roomid = request.args.get("roomid")
    room = db.Room.get(id=roomid)
    room_reviews = room.reviews.select()
    review_dicts = []
    for r in room_reviews:
        d = r.to_dict()
        d['text'] = r.text
        d['pictures'] = json.loads(r.pictures)
        review_dicts.append(d)
    return jsonify(review_dicts)
