import urllib.parse
import urllib.request
from functools import wraps

from flask import redirect, Response, request, session, url_for, \
    Blueprint, logging, current_app
from rooms.conf import CAS_URL, LOGGER

# Reference this https://github.com/cameronbwhite/Flask-CAS

blueprint = Blueprint("cas", __name__)
logger = logging.getLogger(LOGGER)


def construct_url(function: str, **kwargs) -> str:
    """
    Construct a CAS url
    :param function:
    :param kwargs:
    :return:
    """
    assert function in {"login", "validate"}
    url = CAS_URL  # "https://fed.princeton.edu/cas/"
    url = urllib.parse.urljoin(url, function)
    params = urllib.parse.urlencode(kwargs)
    url = urllib.parse.urljoin(url, "?" + params)
    return url


@blueprint.route("/login")
def login():
    """
    Handles traffic in two directions.  First user goes to /login, which
    redirects to CAS where they log in.  Then redirects back to /login
    with the query parameter 'ticket'.  Ticket is stored in session 'CAS_TOKEN'

    Then checks whether the CAS_TOKEN is valid using validate(token).
    :return:
    """
    service_url = current_app.config['SERVICE_URL']
    redirect_url = construct_url("login", service=service_url+"login")

    if "ticket" in request.args:  # This means CAS has redirected back to us
        session["CAS_TOKEN"] = request.args["ticket"]

    if "CAS_TOKEN" in session:
        # There is a token already, but we might not trust it
        if validate(session["CAS_TOKEN"]):  # ensure token validity
            if 'CAS_AFTER_LOGIN_SESSION_URL' in session:
                redirect_url = session.pop('CAS_AFTER_LOGIN_SESSION_URL')
            else:
                redirect_url = "/"
        else:
            del session["CAS_TOKEN"]
    return redirect(redirect_url)


@blueprint.route("/logout")
def logout():
    """
    Logs the user out of our site, but not CAS overall. (don't want to
    inconvenience the user)
    """
    if "CAS_NETID" in session:
        del session["CAS_NETID"]
    if "CAS_TOKEN" in session:
        del session["CAS_TOKEN"]

    logger.debug('Logged out.  Redirecting to home.')

    return redirect("/")


def validate(ticket: str) -> bool:
    """
    Returns True if ticket represents a valid CAS session.
    :param ticket: ticket as returned by the CAS login url
    """
    service_url = current_app.config['SERVICE_URL']
    url = construct_url("validate", service=service_url+"login", ticket=ticket)

    # returns 2 lines, first is yes, second is netid
    response = urllib.request.urlopen(url).readlines()

    if len(response) == 2 and b"yes" in response[0]:
        session["CAS_NETID"] = response[1].strip().decode()
        logger.debug("Validated session: %s" % session["CAS_NETID"])
        return True
    return False


def netid():
    """Returns the NETID of the currently logged in user"""
    return session.get("CAS_NETID")


def authenticated(function):
    """Decorator for functions that require CAS authentication"""
    @wraps(function)
    def wrap(*args, **kwargs):
        if "CAS_TOKEN" not in session:
            session['CAS_AFTER_LOGIN_SESSION_URL'] = request.path
            return login()
        else:
            return function(*args, **kwargs)

    return wrap
