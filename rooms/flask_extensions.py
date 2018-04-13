from flask import Blueprint
from rooms import cas, conf
from rooms import dbmanager as dbm
from functools import wraps
from pony.orm.core import Query as PonyQuery
from pony.orm.core import Entity as PonyEntity
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
                user = db.User.get_or_create(netid=my_netid)
                return f(user, db, *args, **kwargs)
            return wrapped
        return wrapper


class ExtendedJSONEncoder(JSONEncoder):
    def default(self, o):
        """
        Extends the flask json encoder to make it work on our database
        objects, and pony queries, when need be.
        """
        if isinstance(o, PonyQuery):
            return list(o)
        elif isinstance(o, PonyEntity):
            db = dbm.get_app_db()

            # assert it is from the current database
            assert isinstance(o, db.Entity)

            if isinstance(o, db.GroupRequest):
                req = o.to_dict()
                req["from_user"] = db.User[req["from_user"]].netid
                return req
            return o.to_dict()
        return JSONEncoder.default(self, o)
