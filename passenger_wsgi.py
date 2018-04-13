import os
import sys
from rooms import app as application  # not sure why this is here tbh?!

INTERP = "/n/fs/rooms/venv/bin/python"
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

# enabled when the site is running in production!
os.environ['ENV'] = "PRODUCTION"

sys.path.append("/n/fs/rooms/COS333")
