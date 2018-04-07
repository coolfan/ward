function get_card(val) {
	var card = $("<div>").addClass("card")
	var container_fluid = $("<div>").addClass("container-fluid")
	var card_body = $("<div>").addClass("card-body")
	var row1 = $("<div>").addClass("row")
	var row2 = $("<div>").addClass("row")
	var col1 = $("<div>").addClass("col-sm-12")
	var col2 = $("<div>").addClass("col-sm-12")
	var header = $("<p>").addClass("card-text")
	var text = $("<p>").addClass("card-text")

	header.text(val.from_user)
	text.text(val.message)

	col1.append(header)
	col2.append(text)

	row1.append(col1)
	row2.append(col2)
	card_body.append(row1)
	card_body.append(row2)
	container_fluid.append(card_body)
	card.append(container_fluid)

	card.css("margin-bottom", "10px")

	return card
}

$(document).ready(function() {
	$.get("/pending_requests", function(data) {
		$.each(data, function(i, val) {
			var card = get_card(val)
			$("#pending").append(card)
			console.log(val)
		})
	})

	$("#add_member_form").submit(function(e) {
		e.preventDefault()
		$.get("/request_group", {other_netid: $("#add_member").val()}, function() {
			alert("Request has sent!");
		})
		$("$add_member").val("")
	})
})
