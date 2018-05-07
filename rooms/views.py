import traceback

from flask import render_template, Blueprint, jsonify, current_app
from pony.orm import select

from rooms import dbmanager as dbm
from rooms import cas
from rooms.flask_extensions import AuthBlueprint

blueprint = AuthBlueprint("views", __name__)


@blueprint.auth_route("/")
def table(user, db):
    name = user.netid
    if user.name: name = user.name
    return render_template('search_page/search_page.html', name=name)


@blueprint.auth_route("/favorites_page")
def favorites(user, db):
    name = user.netid
    if user.name: name = user.name
    return render_template('favorites_page/favorites_page.html', name=name)


@blueprint.auth_route("/reviews_page")
def reviews(user, db):
    name = user.netid
    if user.name: name = user.name
    return render_template('reviews_page/reviews_page.html', name=name)


@blueprint.auth_route("/about_page")
def about(user, db):
    name = user.netid
    if user.name: name = user.name
    return render_template('about_page/about_page.html', name=name)


@blueprint.auth_route("/account_page")
def account(user, db):
    name = user.netid
    if user.name: name = user.name
    return render_template('account_page/account_page.html', name=name)
