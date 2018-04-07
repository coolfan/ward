import os,sys
INTERP = "/n/fs/rooms/venv/bin/python"
if sys.executable != INTERP: os.execl(INTERP, INTERP, *sys.argv)

sys.path.append("/n/fs/rooms/COS333")

from rooms import app as application

# import pwd
# import grp
#
# def get_username():
#     return pwd.getpwuid(os.getuid()).pw_name
#
# def get_groups():
#     return grp.getgrgid(os.getgid()).gr_name
#
# def application(env, start_response):
#     start_response('200 OK', [('Content-Type','text/html')])
#     return ["Hello World!"]