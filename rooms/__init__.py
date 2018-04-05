import os
from flask import Flask

FLASK_APP_DIR = os.path.dirname(os.path.realpath(__file__))
PROJECT_ROOT = os.path.split(FLASK_APP_DIR)[0]
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "uploads")

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

# app.config.from_envvar('ROOMS_SETTINGS', silent=True)

from rooms.cas import blueprint as cas_blueprint
app.register_blueprint(cas_blueprint)

from rooms.favorite import blueprint as favorite_blueprint
app.register_blueprint(favorite_blueprint)

from rooms.group import blueprint as group_blueprint
app.register_blueprint(group_blueprint)

from rooms.query import blueprint as query_blueprint
app.register_blueprint(query_blueprint)

from rooms.reviews import blueprint as reviews_blueprint
app.register_blueprint(reviews_blueprint)

from rooms.views import blueprint as views_blueprint
app.register_blueprint(views_blueprint)