from flask import Blueprint
from rooms import cas, conf
from rooms import dbmanager as dbm
from functools import wraps
from pony.orm.core import Query as PonyQuery
from flask.json import JSONEncoder

class AuthBlueprint(Blueprint):
    def auth_route(self, rule, **options):
        """
        Creates a decorator for a CAS authenticated user in the
        database.
        """
        def wrapper(f):
            @self.route(rule, **options)
            @cas.authenticated
            @dbm.use_app_db
            @wraps(f)
            def wrapped(db, *args, **kwargs): # name??
                my_netid = cas.netid()
                my_user = db.User.get_or_create(netid=my_netid)
                return f(my_netid, my_user, db, *args, **kwargs)
            return wrapped
        return wrapper


class ExtendedJSONEncoder(JSONEncoder):
    """
    Extends the flask json encoder to make it work on our database
    objects, and pony queries, when need be.
    """
    @dbm.use_app_db
    def default(db, self, o): # correct place?
        print("HI", db, self, o)
        if isinstance(o, PonyQuery):
            return list(o)
        elif isinstance(o, db.GroupRequest):
            req = o.to_dict()
            req["from_user"] = db.User[req["from_user"]].netid
            return req # or use self??
        return JSONEncoder.default(self, o)
