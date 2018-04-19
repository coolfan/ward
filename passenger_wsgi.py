import os
import sys

# Make sure to use the right version of python as set in venv
INTERP = "/n/fs/rooms/venv/bin/python"
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

# Use the virtual environment packages and stuff
activate_this = '/n/fs/rooms/venv/bin/activate_this.py'
exec(open(activate_this).read(), dict(__file__=activate_this))

# Keep this line! Passenger Phusion requires a callable 'application'
from rooms import app as application

# enabled when the site is running in production
os.environ['ENV'] = "PRODUCTION"

sys.path.append("/n/fs/rooms/COS333")
