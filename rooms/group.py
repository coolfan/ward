from flask import logging, request, jsonify, Response, Blueprint
from pony.orm import select

from flask_login import current_user, login_required
from rooms import conf
from rooms import dbmanager as dbm

blueprint = Blueprint("group", __name__)
logger = logging.getLogger(conf.LOGGER)


@blueprint.route("/pending_requests")
@login_required
@dbm.use_app_db
def pending_requests(db):
    my_group = current_user.data.group

    pending_requests = select(
        req for req in db.GroupRequest
        if req.to_group == my_group
        and req.status == "Pending"
    )

    return jsonify(pending_requests)


@blueprint.route("/request_group", methods=["GET"])
@login_required
@dbm.use_app_db
def request_group(db):
    """
    Sends a request to join the group of another person.
    """

    message = request.args.get("message", "")

    other_netid = request.args.get("other_netid")
    other_user = db.User.get_or_create(netid=other_netid)
    other_group = other_user.group

    if other_group == current_user.data.group:
        return jsonify({"success": True})

    group_request = db.GroupRequest(
        from_user=current_user.data,
        to_group=other_group,
        message=message,
        status="Pending"
    )

    return jsonify({"success": True})


@blueprint.route("/approve_group", methods=["GET"])
@login_required
@dbm.use_app_db
def approve_group(db):
    """"""
    # Check for presence of required parameters
    if "request_id" not in request.args:
        return Response("Missing request_id", 400)
    if "action" not in request.args:
        return Response("Missing action", 400)

    request_id = request.args.get("request_id")
    action = request.args.get("action")

    if not db.GroupRequest.exists(id=request_id):
        return Response("Invalid request_id", 422)
    group_request = db.GroupRequest.get(id=request_id)

    if action not in {"accept", "reject"}:
        message = "Invalid action: must be one of {'accept', 'reject'}"
        return Response(message, 422)

    if group_request.to_group != current_user.data.group:
        return Response("You are not in this group.", 403)

    if group_request.status == "Approved":
        message = "This request has been approved or cancelled"
        return Response(message, 410)

    if action == "reject":
        group_request.status = "Denied"
        return jsonify({"status": True})

    group_request.status = "Approved"
    from_user = group_request.from_user
    from_user.group = current_user.data.group

    return jsonify({"success": True})


@blueprint.route("/my_group")
@login_required
@dbm.use_app_db
def my_group(db):
    my_group = current_user.data.group
    my_netid = current_user.id

    other_members = my_group.members.select(
        lambda other_user: other_user.netid != my_netid
        )

    return jsonify(other_members)
