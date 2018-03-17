from flask import session, Response
from functools import lru_cache


def is_logged_in():
    return session.get("logged_in", False)


def authenticated():
    def wrapped(func):
        if is_logged_in():
            return func
        else:
            return lambda: Response(401)
    return wrapped