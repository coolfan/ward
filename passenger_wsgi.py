import os,sys
INTERP = "/n/fs/rooms/venv/bin/python"
if sys.executable != INTERP: os.execl(INTERP, INTERP, *sys.argv)
os.environ['ENV'] = "PRODUCTION"  # enabled when the site is running in production!

sys.path.append("/n/fs/rooms/COS333")

from rooms import app as application