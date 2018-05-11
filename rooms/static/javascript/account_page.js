function get_group_card(val) {
	var card = $("<div>").addClass("card selectable-card")
	var container_fluid = $("<div>").addClass("container-fluid")
	var card_body = $("<div>").addClass("card-body")
	var row1 = $("<div>").addClass("row")
	var col11 = $("<div>").addClass("col-sm-12")
	var header = $("<p>").addClass("card-text")

	header.text(val.name)

	col11.append(header)

	row1.append(col11)
	card_body.append(row1)
	container_fluid.append(card_body)
	card.append(container_fluid)

	card.css("margin-bottom", "10px")
	card.attr("id", "group" + val.id)

	card.click(function() {
		update_members(val.members)
		update_addinfo(val.drawtime)
		update_selected(val.id)
	})

	return card
}

function get_member_card(val) {
	var card = $("<div>").addClass("card")
	var container_fluid = $("<div>").addClass("container-fluid")
	var card_body = $("<div>").addClass("card-body")
	var row1 = $("<div>").addClass("row")
	var col11 = $("<div>").addClass("col-sm-12")
	var header = $("<p>").addClass("card-text")

	header.text(val)

	col11.append(header)

	row1.append(col11)
	card_body.append(row1)
	container_fluid.append(card_body)
	card.append(container_fluid)

	card.css("margin-bottom", "10px")

	return card
}

function update_groups() {
	$.get("/my_groups", function(data) {
		$("#groups").empty()
		$.each(data, function(i, val) {
			var card = get_group_card(val)
			$("#groups").append(card)
		})
	})
}

function update_members(data) {
	$.each(data, function(i, val) {
		$("#members").empty()
		var card = get_member_card(val)
		$("#members").append(card)
	})
}

function update_addinfo(time) {
	var addinfo_cont = $("#add-info")
	addinfo_cont.empty()
	addinfo_cont.append($("<p>").text("Draw time: " + time))

}

function update_selected(id) {
	var cardlist = $("#groups").children()
	$.each(cardlist, function(i, val) {
		var card = $(val)
		if (card.attr("id") != "group" + id) {
			card.removeClass("selected")
		} else {
			card.addClass("selected")
		}
	})
}

$(document).ready(function() {
	update_groups()
	navbar_set("#nav_account")
})
