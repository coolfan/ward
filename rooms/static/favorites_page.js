var card_mgr = {
	card_queue: [],
	bigcard_arr: [null, null],
	bigcard_disp_arr: [null, null],
	cur_bigcard1: true
}

function to_header(val) {
	return val.roomnum + " " + val.building
}

function get_dom_id(val) {
	return "card" + val.id
}

function display_bigcard(val) {
	if (card_mgr.cur_bigcard1) {
		card_mgr.bigcard_arr[0].text(to_header(val))
		card_mgr.bigcard_disp_arr[0] = val
	} else {
		card_mgr.bigcard_arr[1].text(to_header(val))
		card_mgr.bigcard_disp_arr[1] = val
	}
	
	card_mgr.cur_bigcard1 = !card_mgr.cur_bigcard1;

	card_mgr.card_queue.push(val)
	if (card_mgr.card_queue.length > 2) {
		var ret = card_mgr.card_queue.shift()
		$("#" + get_dom_id(ret)).click()
	}
}

function undisplay_bigcard(val) {
	if (card_mgr.bigcard_disp_arr[0] !== null && card_mgr.bigcard_disp_arr[0].id === val.id) {
		card_mgr.bigcard_arr[0].text("")
		card_mgr.bigcard_disp_arr[0] = null
		card_mgr.cur_bigcard1 = true
	}

	if (card_mgr.bigcard_disp_arr[1] !== null && card_mgr.bigcard_disp_arr[1].id === val.id) {
		card_mgr.bigcard_arr[1].text("")
		card_mgr.bigcard_disp_arr[1] = null
		card_mgr.cur_bigcard1 = false
	}

	for (var i = 0; i < card_mgr.card_queue.length; i++) {
		if (card_mgr.card_queue[i].id === val.id) {
			card_mgr.card_queue.splice(i, 1)
			break;
		}
	}
}

function get_card(val) {
	var card = $("<div>").addClass("card")
	var container_fluid = $("<div>").addClass("container-fluid")
	var card_body = $("<div>").addClass("card-body")
	var row = $("<div>").addClass("row")
	var col = $("<div>").addClass("col-sm-12")
	var text = $("<p>").addClass("card-text")
	
	text.append(to_header(val))
	col.append(text)
	row.append(col)
	card_body.append(row)
	container_fluid.append(card_body)
	card.append(container_fluid)
	
	card.css("margin-bottom", "10px")
	val.bool_filled = false

	card.click(function() {
		if (val.bool_filled) {
			card.css("backgroundColor", "white")
			undisplay_bigcard(val)
		} else {
			card.css("backgroundColor", "#f2f5ff")
			display_bigcard(val)
		}
		val.bool_filled = !val.bool_filled
	});
	card.attr("id", get_dom_id(val))
	return card
}

$("#cards").ready(function() {
	card_mgr.bigcard_arr = [$("#bigcard1_body"), $("#bigcard2_body")]
	$.getJSON("/favorites", function(data) {
		$.each(data, function(i, val) {
			var card = get_card(val)
			$("#cards").append(get_card(val))
		});
	});
});
