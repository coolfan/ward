import json
import os

from flask import request, logging, jsonify, Blueprint, \
    current_app, send_from_directory, url_for
from pony.orm import flush
from werkzeug.utils import secure_filename

import rooms.dbmanager as dbm
from rooms import conf
from flask_login import current_user, login_required

blueprint = Blueprint("reviews", __name__)

logger = logging.getLogger(conf.LOGGER)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_file(filename: str) -> bool:
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@blueprint.route('/uploads/<filename>')
@login_required
def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_DIR'], filename)


@blueprint.route("/review", methods=["POST"])
@login_required
@dbm.use_app_db
def review(db):
    roomid = request.form['roomid']
    room = db.Room.get(id=roomid)

    netid = current_user.id
    user = current_user.data

    rating = request.form.get('rating')
    text = request.form.get('text')

    # TODO: # automate this with the rating attributes
    room_review = db.Review(owner=user, room=room, rating=rating, text=text)
    flush()
    pictures = []

    uploaded_pictures = request.files.getlist('pictures')
    upload_folder = current_app.config['UPLOAD_DIR']
    for i, picture in enumerate(uploaded_pictures):
        if allowed_file(picture.filename):
            # filename = secure_filename(picture.filename)
            filename, extension = os.path.splitext(secure_filename(picture.filename))
            filename = f"{room_review.id}_{i}{extension}"
            filepath = os.path.join(upload_folder, filename)
            picture.save(filepath)
            pictures.append(filename)
    room_review.pictures = json.dumps(pictures)
    return jsonify({"success": True})


@blueprint.route("/reviews", methods=["GET"])
@login_required
@dbm.use_app_db
def reviews(db):
    roomid = request.args.get("roomid")
    room = db.Room.get(id=roomid)
    room_reviews = room.reviews.select()
    review_dicts = []
    for r in room_reviews:
        d = r.to_dict()
        d['text'] = r.text
        picture_filenames = json.loads(r.pictures)
        d['pictures'] = [url_for("reviews.uploaded_file", filename=f) for f in picture_filenames]
        # d['pictures'] = json.loads(r.pictures)
        review_dicts.append(d)
    return jsonify(review_dicts)
