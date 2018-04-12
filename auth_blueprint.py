from flask import Blueprint
from rooms import cas, conf
from rooms import dbmanager as dbm

class AuthBlueprint(Blueprint):
    def auth_route(self, rule, **options):
        """
        Automates adding CAS and db to a route decorator.
        """
        route_decorator = self.route(rule, **options)
        def decorator(f):
            routed_f = route_decorator(f)
            return cas.authenticated(dbm.use_app_db(routed_f))
        return decorator
