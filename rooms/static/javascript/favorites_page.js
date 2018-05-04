var card_mgr = {
	card_data_arr: [],
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

function get_room_id(s) {
	return s.slice(4)
}

function display_bigcard(val) {
	var index = card_mgr.cur_bigcard1 ? 0 : 1
	
	card_mgr.bigcard_arr[index].empty()
	
	$.get("/reviews", {roomid: val.id}, function(data) {
		card_mgr.bigcard_arr[index].append(get_big_card(val, data))
	})
	card_mgr.bigcard_disp_arr[index] = val
	
	card_mgr.cur_bigcard1 = !card_mgr.cur_bigcard1;

	card_mgr.card_queue.push(val)
	if (card_mgr.card_queue.length > 2) {
		var ret = card_mgr.card_queue.shift()
		$("#hitbox" + ret.id).click()
	}
}

function undisplay_bigcard(val) {
	if (card_mgr.bigcard_disp_arr[0] !== null && card_mgr.bigcard_disp_arr[0].id === val.id) {
		card_mgr.bigcard_arr[0].empty()
		card_mgr.bigcard_disp_arr[0] = null
		card_mgr.cur_bigcard1 = true
	}

	if (card_mgr.bigcard_disp_arr[1] !== null && card_mgr.bigcard_disp_arr[1].id === val.id) {
		card_mgr.bigcard_arr[1].empty()
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

function card_onclick(card, val) {
	if (val.bool_filled) {
		card.css("backgroundColor", "white")
		undisplay_bigcard(val)
	} else {
		card.css("backgroundColor", "#f2f5ff")
		display_bigcard(val)
	}
	val.bool_filled = !val.bool_filled
}

function get_empty_card() {
	let li = $("<li>");
	let card = $("<div>").addClass("card");
	var container_fluid = $("<div>").addClass("container-fluid");
	var card_body = $("<div>").addClass("card-body");
	var row = $("<div>").addClass("row");
	var col = $("<div>").addClass("col-sm-12");
	var text = $("<p>").addClass("card-text");
	
	text.append("Sorry, you do not have any favorites yet. Try going to the search page and clicking on the stars!");
	col.append(text);
	row.append(col);
	card_body.append(row);
	container_fluid.append(card_body);
	card.append(container_fluid);
	
	card.css("margin-bottom", "10px");

	li.append(card);
	return li

}

function get_card(val) {
	let li = $("<li>").attr("id", "elem" + val.id);
	let card = $("<div>").addClass("card");
	var container_fluid = $("<div>").addClass("container-fluid");
	var card_body = $("<div>").addClass("card-body");
	var row = $("<div>").addClass("row");
	var col1 = $("<div>").addClass("col col-sm-10").attr("id", "hitbox" + val.id);
	var col2 = $("<div>").addClass("col col-sm-2");
	var text = $("<p>").addClass("card-text");
	var del_btn_hitbox = $("<div>")
	var del_btn = $("<i>").addClass("fa fa-close")

	del_btn_hitbox.append(del_btn)
	text.append(to_header(val));
	col1.append(text);
	col2.append(del_btn_hitbox)
	row.append(col1);
	row.append(col2)
	card_body.append(row);
	container_fluid.append(card_body);
	card.append(container_fluid);
	
	card.css("margin-bottom", "10px");
	val.bool_filled = false;

	col1.click(function() {
		if (val.bool_filled) {
			card.css("backgroundColor", "white");
			undisplay_bigcard(val)
		} else {
			card.css("backgroundColor", "#f2f5ff");
			display_bigcard(val)
		}
		val.bool_filled = !val.bool_filled
	});
	card.attr("id", get_dom_id(val));

	del_btn_hitbox.click(function() {
		$.get("/unfavorite", {roomid: val.id}, function(data) {
			var list = $($("#cards").children()[0]).children()
			$.each(list, function(i, item) {
				console.log($(item).attr("id"))
				if ($(item).attr("id") == "elem" + val.id) {
					if (val.bool_filled) {
						$("#hitbox" + val.id).click()
					}
					$("#cards").children()[0].removeChild(item)
				}
			})
		})
	})

	li.append(card);
	return li
}

function get_new_order() {
	let list = $($("#cards").children()[0]).children();
	let ret = [];
	$.each(list, function(i, val) {
		ret.push(get_room_id($(val).attr("id")))
	});
	
	return ret
}

$(document).ready(function() {
	card_mgr.bigcard_arr = [$("#bigcard1_body"), $("#bigcard2_body")];
	let ul = $("<ul>").addClass("draggable no-bullets padding-0").attr("id", "fav-list");
	$("#cards").append(ul);
	$.getJSON("/favorites", /*{groupid: $("groups").val()},*/ function(data) {
		ul.empty()
		data = data["-1"]
		//console.log(data)
		if (data.length > 0) {
			$.each(data, function(i, val) {
				let card = get_card(val);
				ul.append(get_card(val))
			});
		} else {
			ul.append(get_empty_card())
		}
	});
	ul.sortable({
		stop: function(a, b, c) {
			let order = get_new_order();
			console.log(order);
			$.ajax({
				url:"/reorder_favorites",
				type:"POST",
				data:JSON.stringify({"data": order}),
				contentType: "application/json",
				dataType: "json",
				success: null
			})
		}
	});
	$.get("/my_groups", function(data) {
		$.each(data, function(i, val) {
			$("#groups").append($("<option>").attr("value", val.id).text(val.name))
		})
	})
	$("#groups").change(function() {
		$.getJSON("/favorites", function(data) {
			ul.empty()
			data = data[$("#groups").val()]
			if (data.length > 0) {
				$.each(data, function(i, val) {
					let card = get_card(val);
					ul.append(get_card(val))
				});
			} else {
				ul.append(get_empty_card())
			}
		});
	})

	navbar_set("#nav_favorites")
});
