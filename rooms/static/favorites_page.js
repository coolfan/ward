var card_queue = []

function display_bigcard(s) {
	if (typeof display_bigcard.disp1 === "undefined") {
		display_bigcard.disp1 = true
	}

	if (display_bigcard.disp1) {
		$("#bigcard1_body").text(s)
	} else {
		$("#bigcard2_body").text(s)
	}

	display_bigcard.disp1 = !display_bigcard.disp1
}

function undisplay_bigcard(s) {
	if ($("#bigcard1_body").text() === s) {
		$("#bigcard1_body").text("")
		display_bigcard.disp1 = true
	}

	if ($("#bigcard2_body").text() === s) {
		$("#bigcard2_body").text("")
		display_bigcard.disp1 = false
	}
}

function get_card(s, id) {
	var card = $("<div>").addClass("card")
	var container_fluid = $("<div>").addClass("container-fluid")
	var card_body = $("<div>").addClass("card-body")
	var row = $("<div>").addClass("row")
	var col = $("<div>").addClass("col-sm-12")
	var text = $("<p>").addClass("card-text")
	text.append(s)
	col.append(text)
	row.append(col)
	card_body.append(row)
	container_fluid.append(card_body)
	card.append(container_fluid)

	card.css("margin-bottom", "10px")
	card.bool_filled = false

	card.click(function() {
		if (card.bool_filled) {
			card.css("background-color", "white")
			undisplay_bigcard(s)
			for (var i = 0; i < card_queue.length; i++) {
				if (card_queue[i] === card) {
					card_queue.splice(i, 1)
					break;
				}
			}
		} else {
			card.css("background-color", "#f2f5ff")
			display_bigcard(s)
			card_queue.push(card)
			if (card_queue.length > 2) {
				var ret = card_queue.shift()
				ret.click()
			}
		}
		card.bool_filled = !card.bool_filled
	});

	return card
}

$("#cards").ready(function() {
	$.getJSON("/favorites", function(data) {
		console.log(data)
		$.each(data, function(i, val) {
			$("#cards").append(get_card(val.building + " " + val.roomnum, val.id))
		});
	});
});
