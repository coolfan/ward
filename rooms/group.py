from flask import logging, request, jsonify, Response
from pony.orm import select
from rooms.flask_extensions import AuthBlueprint

from rooms import cas, conf
from rooms import dbmanager as dbm

blueprint = AuthBlueprint("group", __name__)
logger = logging.getLogger(conf.LOGGER)


@blueprint.auth_route("/pending_requests")
def pending_requests(my_user, db):
    my_group = my_user.group

    pending_requests = select(
        req for req in db.GroupRequest
        if req.to_group == my_group
        and req.status == "Pending"
    )

    return jsonify(pending_requests)


@blueprint.auth_route("/request_group", methods=["GET"])
def request_group(my_user, db):
    """
    Sends a request to join the group of another person.
    """

    message = request.args.get("message", "")

    other_netid = request.args.get("other_netid")
    other_user = db.User.get_or_create(netid=other_netid)
    other_group = other_user.group

    if other_group == my_user.group:
        return jsonify({"success": True})

    group_request = db.GroupRequest(
        from_user=my_user,
        to_group=other_group,
        message=message,
        status="Pending"
    )

    return jsonify({"success": True})


@blueprint.auth_route("/approve_group", methods=["GET"])
def approve_group(user, db):
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

    if group_request.to_group != user.group:
        return Response("You are not in this group.", 403)

    if group_request.status == "Approved":
        message = "This request has been approved or cancelled"
        return Response(message, 410)

    if action == "reject":
        group_request.status = "Denied"
        return jsonify({"status": True})

    group_request.status = "Approved"
    from_user = group_request.from_user
    from_user.group = user.group

    return jsonify({"success": True})


@blueprint.auth_route("/my_group")
def my_group(my_user, db):
    my_group = my_user.group
    my_netid = my_user.netid

    other_members = my_group.members.select(
        lambda other_user: other_user.netid == my_netid
        )

    return jsonify(other_members)
