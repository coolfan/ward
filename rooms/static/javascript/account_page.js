function get_pending_card(val) {
	var card = $("<div>").addClass("card")
	var container_fluid = $("<div>").addClass("container-fluid")
	var card_body = $("<div>").addClass("card-body")
	var row1 = $("<div>").addClass("row")
	var row2 = $("<div>").addClass("row")
	var col11 = $("<div>").addClass("col-sm-10")
	var col12 = $("<div>").addClass("col-sm-1")
	var col13 = $("<div>").addClass("col-sm-1")
	var col21 = $("<div>").addClass("col-sm-12")
	var header = $("<p>").addClass("card-text")
	var text = $("<p>").addClass("card-text")


	var check = $("<a>")
	check.append($("<i>").addClass("fa").addClass("fa-check"))
	check.click(function() {
		$.get("/approve_group", {request_id: val.id, action: "accept"}, function(data) {
			update_group()
			update_pending()
		})
	})

	var cross = $("<a>")
	cross.append($("<i>").addClass("fa").addClass("fa-close"))
	cross.click(function() {
		$.get("/approve_group", {request_id: val.id, action: "reject"}, function(data) {
			update_group()
			update_pending()
		})
	})

	header.text(val.from_user)
	text.text(val.message)

	col11.append(header)
	col12.append(check)
	col13.append(cross)
	col21.append(text)

	row1.append(col11)
	row1.append(col12)
	row1.append(col13)
	row2.append(col21)
	card_body.append(row1)
	card_body.append(row2)
	container_fluid.append(card_body)
	card.append(container_fluid)

	card.css("margin-bottom", "10px")

	return card
}

function get_group_card(val) {
	var card = $("<div>").addClass("card")
	var container_fluid = $("<div>").addClass("container-fluid")
	var card_body = $("<div>").addClass("card-body")
	var row1 = $("<div>").addClass("row")
	var col11 = $("<div>").addClass("col-sm-12")
	var header = $("<p>").addClass("card-text")

	header.text(val.netid)

	col11.append(header)

	row1.append(col11)
	card_body.append(row1)
	container_fluid.append(card_body)
	card.append(container_fluid)

	card.css("margin-bottom", "10px")

	return card
}

function update_pending() {
	$("#pending").empty()
	$.get("/pending_requests", function(data) {
		$.each(data, function(i, val) {
			var card = get_pending_card(val)
			$("#pending").append(card)
		})
	})
}

function update_group() {
	$("#members").empty()
	$.get("/my_group", function(data) {
		$.each(data, function(i, val) {
			var card = get_group_card(val)
			$("#members").append(card)
		})
	})
}

$(document).ready(function() {
	
	update_group()
	update_pending()

	$("#add_member_form").submit(function(e) {
		e.preventDefault()
		$.get("/request_group", {other_netid: $("#add_member").val()}, function() {
			alert("Request has sent!");
		})
		$("$add_member").val("")
	})

	navbar_set("#nav_account")
})
