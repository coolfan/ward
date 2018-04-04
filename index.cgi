#!/n/fs/rooms/venv/bin/python

# Note that the server will not automatically update this file from the repo.
# you must place it at /n/fs/rooms/webdirectory/index.cgi


import json
import os
import sys
import traceback

sys.path.append("/n/fs/rooms/COS333")

activate_this = '/n/fs/rooms/venv/bin/activate_this.py'
exec(open(activate_this).read(), dict(__file__=activate_this))

from wsgiref.handlers import CGIHandler
try:
    from rooms import app
    app.config['SERVICE_URL'] = "http://rooms.cs.princeton.edu/"
    CGIHandler().run(app)
except Exception as e:
    sys.stdout.write(str(e) + "\n")
    sys.stdout.write(traceback.format_exc() + "\n")
