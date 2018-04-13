from flask import Blueprint
from rooms import cas, conf
from rooms import dbmanager as dbm
from functools import wraps

class AuthBlueprint(Blueprint):
    def auth_route(self, rule, **options):
        """
        Creates a decorator for a CAS authenticated user in the database.
        """
        def wrapper(f):
            @self.route(rule, **options)
            @cas.authenticated
            @dbm.use_app_db
            @wraps(f)
            def wrapped(*args, **kwargs): # name??
                my_netid = cas.netid()
                my_user = db.User.get_or_create(netid=my_netid)
                return f(my_netid, my_user, *args, **kwargs)
            return wrapped
        return wrapper
# 
# from flask.json import JSONEncoder
# class ExtendedJSONEncoder(JSONEncoder):
#     @dbm.use_app_db
#     def default(self, o):
#         if isinstance(o, db.GroupRequest):
#
