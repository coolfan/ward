from flask import logging, request, jsonify, Response
from pony.orm import select
from flask_extensions import AuthBlueprint

from rooms import cas, conf
from rooms import dbmanager as dbm

blueprint = AuthBlueprint("group", __name__)
logger = logging.getLogger(conf.LOGGER)


@blueprint.auth_route("/pending_requests")
def pending_requests(my_netid, my_user, db):
    my_group = my_user.group

    pending_requests = select(
        req for req in db.GroupRequest
        if req.to_group == my_group
        and req.status == "Pending"
    )

    pending_requests = [req.to_dict() for req in pending_requests]
    for req in pending_requests:
        req["from_user"] = db.User[req["from_user"]].netid

    return jsonify(pending_requests)


@blueprint.auth_route("/request_group", methods=["GET"])
def request_group(my_netid, my_user, db):
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
def approve_group(my_netid, my_user, db):
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
        return Response("Invalid action: must be one of {'accept', 'reject'}", 422)

    my_group = my_user.group

    if group_request.to_group != my_group:
        return Response("You are not in this group.", 403)

    if group_request.status == "Approved":
        return Response("This request has been approved or cancelled", 410)

    if action == "reject":
        group_request.status = "Denied"
        return jsonify({"status": True})

    group_request.status = "Approved"
    from_user = group_request.from_user
    from_user.group = my_group

    return jsonify({"success": True})


@blueprint.auth_route("/my_group")
def my_group(netid, my_user, db):
    my_group = my_user.group
    other_members = my_group.members.select(lambda user: user.netid != netid)
    return jsonify([user.to_dict() for user in other_members])
