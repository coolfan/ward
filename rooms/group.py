from collections import defaultdict

from flask import logging, request, jsonify, Response
from pony.orm import select
from rooms.flask_extensions import AuthBlueprint

from rooms import cas, conf
from rooms import dbmanager as dbm

blueprint = AuthBlueprint("group", __name__)
logger = logging.getLogger(conf.LOGGER)


@blueprint.auth_route("/pending_requests")
def pending_requests(my_user, db):
    """
    Produce a JSON of the pending requests to any of your groups 
    """
    groups = my_user.groups

    pending_requests = select(
        req for req in db.GroupRequest
        if req.to_group in groups
        and req.status == "Pending"
    )

    requests_info = defaultdict(list)
    for pr in pending_requests:
        d = pr.to_dict()
        d["from_user"] = pr.from_user.netid
        requests_info[pr.to_group.name].append(d)

    return jsonify(requests_info)


@blueprint.auth_route("/pending_invites")
def pending_invites(my_user, db):
    """
    Produce a JSON of your pending invites 
    """
    invites = select(
        inv for inv in db.GroupInvite
        if inv.to_user == my_user
        and inv.status == "Pending"
    )

    invites_list = []
    for inv in invites:
        d = inv.to_dict()
        group_info = inv.from_group.to_dict()
        group_info["members"] = [m.netid for m in inv.from_group.members]
        d["from_group"] = group_info
        invites_list.append(d)

    return jsonify(invites_list)


@blueprint.auth_route("/request_group", methods=["GET"])
def request_group(my_user, db):
    """
    Sends a request to join the group of another person.
    """
    message = request.args.get("message", "")

    to_group_id = request.args.get("to_group_id")
    to_group = db.Group.get(id=to_group_id)
    if to_group is None:
        return Response("Invalid to_group_id", 422)

    if to_group in my_user.groups:
        return jsonify({"success": True})

    group_request = db.GroupRequest(
        from_user=my_user,
        to_group=to_group,
        message=message,
        status="Pending"
    )

    return jsonify({"success": True})


@blueprint.auth_route("/invite_to_group", methods=["GET"])
def invite_to_group(my_user, db):
    """
    Invites a user to join one of your groups 
    """
    message = request.args.get("message", "")

    to_netid = request.args.get("to_netid")
    from_group_id = request.args.get("from_group_id")
    from_group = db.Group.get(id=from_group_id)

    if not to_netid:
        return Response("Missing to_netid", 400)
    if from_group is None:
        return Response("Invalid from_group_id", 422)
    if from_group not in my_user.groups:
        return Response("You are not in this group", 403)

    group_invite = db.GroupInvite(
        to_user=db.User.get_or_create(netid=to_netid),
        from_group=from_group,
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

    # Check for validity and authorization to access this group
    if not db.GroupRequest.exists(id=request_id):
        return Response("Invalid request_id", 422)
    group_request = db.GroupRequest.get(id=request_id)

    if action not in {"accept", "reject"}:
        message = "Invalid action: must be one of {'accept', 'reject'}"
        return Response(message, 422)

    if group_request.to_group not in user.groups:
        return Response("You are not in this group.", 403)

    if group_request.status == "Approved":
        message = "This request has been approved or cancelled"
        return Response(message, 410)

    if action == "reject":
        group_request.status = "Denied"
        return jsonify({"status": True})

    group_request.status = "Approved"
    from_user = group_request.from_user
    group_request.to_group.members.add(from_user)

    return jsonify({"success": True})


@blueprint.auth_route("/approve_invite", methods=["GET"])
def approve_invite(user, db):
    """
    Accept or reject a pending invite to join a group 
    """
    if "invite_id" not in request.args:
        return Response("Missing invite_id", 400)
    if "action" not in request.args:
        return Response("Missing action", 400)

    invite_id = request.args.get("invite_id")
    action = request.args.get("action")

    # Check the validity of the arguments
    if not db.GroupInvite.exists(id=invite_id):
        return Response("Invalid invite_id", 422)
    group_invite = db.GroupInvite.get(id=invite_id)

    if action not in {"accept", "reject"}:
        message = "Invalid action: must be one of {'accept', 'reject'}"
        return Response(message, 422)

    if group_invite.to_user != user:
        return Response("You do not own this invitation", 403)

    if group_invite.status == "Approved":
        return Response("The invitation has already been approved", 410)

    if action == "reject":
        group_invite.status = "Denied"
        return jsonify({"status": True})

    group_invite.status = "Approved"
    user.groups.add(group_invite.from_group)
    return jsonify({"success": True})


@blueprint.auth_route("/my_group")
def my_group(my_user, db):
    return my_groups()


@blueprint.auth_route("/my_groups")
def my_groups(my_user, db):
    groups = my_user.groups
    netid = my_user.netid

    groups_info = []
    for group in groups:
        d = group.to_dict()
        d["members"] = [
            member.netid for member in group.members
            if member.netid != netid
        ]
        groups_info.append(d)

    return jsonify(groups_info)