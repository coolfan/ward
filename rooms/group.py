from flask import logging
from pony.orm import db_session, select

from rooms import app, cas, conf
from rooms import dbmanager as dbm

db = dbm.connect(conf.DB_NAME, conf.DB_TYPE)

logger = logging.getLogger(conf.LOGGER)


@app.route("/request_group", methods=["POST"])
@cas.authenticated
@db_session
def request_group():
    # TODO: make new entry in group request table
    raise NotImplementedError()