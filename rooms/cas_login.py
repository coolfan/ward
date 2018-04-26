# derived from https://github.com/maxcountryman/flask-login
# and from https://github.com/cameronbwhite/Flask-CAS
import urllib.parse
import urllib.request
from rooms import dbmanager as dbm
from flask import jsonify, Blueprint, current_app, request, session, logging
import flask_login
from flask_login import current_user, login_required
from rooms.conf import CAS_URL, LOGGER
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

login_manager = flask_login.LoginManager()


blueprint = Blueprint("cas_login", __name__)
logger = logging.getLogger(LOGGER)


class User(flask_login.UserMixin):
    @dbm.use_app_db
    def __init__(db, self, netid):
        self.id = netid # these are unique per user??
        self.data = db.User.get_or_create(netid=netid)


@login_manager.user_loader
def user_loader(netid):
    return User(netid)


@login_manager.request_loader
def load_user_from_request(request):
    if 'ticket' in request.args:
        ticket = request.args['ticket']
        service_url = current_app.config['SERVICE_URL']
        redirect_url = construct_url("login", service=request.base_url,
                                     ticket = ticket)
        
        if netid is not None:  # ensure token validity
            return User(netid)
    return None


def validate(ticket: str) -> bool:
    """
    Returns True if ticket represents a valid CAS session.
    :param ticket: ticket as returned by the CAS login url
    """
    service_url = current_app.config['SERVICE_URL']
    url = construct_url("validate", service=service_url+"login2", ticket=ticket)

    # returns 2 lines, first is yes, second is netid
    response = urllib.request.urlopen(url).readlines() # this seems bad!??

    if len(response) == 2 and b"yes" in response[0]:
        netid = response[1].strip().decode()
        logger.debug("Validated session: %s" % netid)
        return netid
    return None



# @login_manager.request_loader
# def request_loader(request):
#     email = request.form.get('email')
#     if email not in users:
#         return
#
#     user = User()
#     user.id = email
#
#     # DO NOT ever store passwords in plaintext and always compare password
#     # hashes using constant-time comparison!
#     user.is_authenticated = request.form['password'] == users[email]['password']
#
#     return user

# https://fed.princeton.edu/cas/login?locale=en&service=http://localhost:5000/login2
@blueprint.route("/login") # POST???
def login(redirect_url = '/'):
    """
    Handles traffic in two directions.  First user goes to /login, which
    redirects to CAS where they log in.  Then redirects back to /login
    with the query parameter 'ticket'.  Ticket is stored in session 'CAS_TOKEN'

    Then checks whether the CAS_TOKEN is valid using validate(token).
    :return:
    """
    service_url = current_app.config['SERVICE_URL']
    redirect_url = construct_url("login", service=service_url+"login2")
    if 'ticket' in request.args:
        ticket = request.args["ticket"]
        # There is a token already, but we might not trust it
        netid = validate(ticket)
        if netid is not None:  # ensure token validity
            flask_login.login_user(User(netid))
        else:
            return jsonify({'success': False})  #TODO: LOGOUT
    return redirect(redirect_url)



@blueprint.route("/protected2")
@login_required
def protected2():
    return jsonify(current_user.data)



def authenticated(function):
    """Decorator for functions that require CAS authentication"""
    @wraps(function)
    def wrap(*args, **kwargs):
        if not current_user.is_authenticated:
            session['CAS_AFTER_LOGIN_SESSION_URL'] = request.path
            return login()
        else:
            return function(*args, **kwargs)

    return wrap
