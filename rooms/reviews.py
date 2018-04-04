import flask
from flask import request, logging, jsonify, session, Response, Blueprint, render_template, redirect
from pony.orm import db_session, select

from rooms import app, cas, conf
from rooms import dbmanager as dbm

blueprint = Blueprint("reviews", __name__)

db = dbm.connect(conf.DB_NAME, conf.DB_TYPE)
logger = logging.getLogger(conf.LOGGER)

@blueprint.route("/test_review")
def test_review_page():
    return render_template("test_reviews.html")


@blueprint.route("/review", methods=["POST"])
@db_session
def review():
    uploaded_pictures = request.files.getlist('pictures')
    logger = flask.logging.getLogger()
    logger.debug("PLS HELP????")
    logger.debug(uploaded_pictures)
    return redirect("/test_review")