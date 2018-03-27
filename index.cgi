#!/n/fs/rooms/venv/bin/python
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
    CGIHandler().run(app)
except Exception as e:
    sys.stdout.write(str(e) + "\n")
    sys.stdout.write(traceback.format_exc() + "\n")
