from flask import session, Response
from functools import lru_cache


def is_logged_in() -> bool:
    """Returns if the user is authenticated with CAS"""
    # TODO: check CAS cookie and its TTL
    # return session.get("logged_in", False)
    return False


def authenticated():
    """Decorator for functions that require CAS authentication"""
    def wrapped(func):
        if is_logged_in():
            return func
        else:
            return lambda: Response(401)
    return wrapped