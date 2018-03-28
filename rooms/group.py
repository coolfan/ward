from flask import logging, Blueprint
from pony.orm import db_session, select

from rooms import cas, conf
from rooms import dbmanager as dbm

blueprint = Blueprint("group", __name__)
db = dbm.connect(conf.DB_NAME, conf.DB_TYPE)
logger = logging.getLogger(conf.LOGGER)


@blueprint.route("/request_group", methods=["POST"])
@cas.authenticated
@db_session
def request_group():
    # TODO: make new entry in group request table
    raise NotImplementedError()