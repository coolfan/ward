import os

from flask import Flask

app = Flask(__name__)             # create the application instance
app.config.from_object(__name__)  # load config from this file , rooms.py


# Load default config and override config from an environment variable
app.config.update(dict(
    DATABASE=os.path.join(app.root_path, 'rooms.sqlite'),
    SECRET_KEY='cos333project_SeCrEtKeY',
    USERNAME='admin',
    PASSWORD='admin'
))

app.config.from_envvar('ROOMS_SETTINGS', silent=True)