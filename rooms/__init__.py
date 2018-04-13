import os

import logging
from flask import Flask, g

from .conf import LOGGER, DB_TYPE, DB_NAME

from rooms.cas import blueprint as cas_blueprint
from rooms.favorite import blueprint as favorite_blueprint
from rooms.group import blueprint as group_blueprint
from rooms.query import blueprint as query_blueprint
from rooms.reviews import blueprint as reviews_blueprint
from rooms.views import blueprint as views_blueprint

from rooms.flask_extensions import ExtendedJSONEncoder

FLASK_APP_DIR = os.path.dirname(os.path.realpath(__file__))
GIT_ROOT = os.path.split(FLASK_APP_DIR)[0]
PROJECT_ROOT = os.path.split(GIT_ROOT)[0]
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "uploads")

logging_format_string = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
formatter = logging.Formatter(logging_format_string)
handler = logging.FileHandler(os.path.join(PROJECT_ROOT, "rooms.log"))
handler.setLevel(level=logging.DEBUG)
handler.setFormatter(formatter)
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)             # create the application instance
app.config.from_object(__name__)  # load config from this file , rooms.py


# Load default config and override config from an environment variable
app.config.update(dict(
    DATABASE=os.path.join(app.root_path, 'rooms.sqlite'),
    SECRET_KEY='cos333project_SeCrEtKeY',
    USERNAME='admin',
    PASSWORD='admin',
    SERVICE_URL='http://localhost:5000/',
    UPLOAD_DIR=UPLOAD_DIR
))

app.logger.addHandler(handler)

# -----------------------------------------------------------------------------
# Register the blueprints
# -----------------------------------------------------------------------------

app.register_blueprint(cas_blueprint)

app.register_blueprint(favorite_blueprint)

app.register_blueprint(group_blueprint)

app.register_blueprint(query_blueprint)

app.register_blueprint(reviews_blueprint)

app.register_blueprint(views_blueprint)

app.json_encoder = ExtendedJSONEncoder
