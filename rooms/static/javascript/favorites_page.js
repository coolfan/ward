var card_mgr = {
	card_data_arr: [],
	card_queue: [],
	bigcard_arr: [null, null],
	bigcard_disp_arr: [null, null],
	cur_bigcard1: true,
	locked_count: 0
};

var is_being_sorted = false;

function to_header(val) {
	return val.roomnum + " " + val.building
}

function get_dom_id(val) {
	return "card" + val.id
}

function get_room_id(s) {
	return s.slice(4)
}

function get_bigcard_frame(bigcard) {
	var parent = $(bigcard.parent())
	parent = $(parent.parent())
	parent = $(parent.parent())
	return parent;
}

function reset_bigcards() {
	$.each(card_mgr.bigcard_arr, function(i, val) {
		val.empty()
		get_bigcard_frame(val).removeClass("locked")
	})

	card_mgr.card_queue = []
	card_mgr.bigcard_disp_arr = [null, null]
	card_mgr.cur_bigcard1 = true
	card_mgr.locked_count = 0
}

function lock_bigcard(val) {
	if (card_mgr.bigcard_disp_arr[0] !== null && card_mgr.bigcard_disp_arr[0].id === val.id) {
		get_bigcard_frame(card_mgr.bigcard_arr[0]).addClass("locked")
	}

	if (card_mgr.bigcard_disp_arr[1] !== null && card_mgr.bigcard_disp_arr[1].id === val.id) {
		get_bigcard_frame(card_mgr.bigcard_arr[1]).addClass("locked")
	}
}

function unlock_bigcard(val) {
	if (card_mgr.bigcard_disp_arr[0] !== null && card_mgr.bigcard_disp_arr[0].id === val.id) {
		get_bigcard_frame(card_mgr.bigcard_arr[0]).removeClass("locked")
	}

	if (card_mgr.bigcard_disp_arr[1] !== null && card_mgr.bigcard_disp_arr[1].id === val.id) {
		get_bigcard_frame(card_mgr.bigcard_arr[1]).removeClass("locked")
	}
}

function display_bigcard(val) {
	var index = card_mgr.cur_bigcard1 ? 0 : 1
	
	if (get_bigcard_frame(card_mgr.bigcard_arr[index]).hasClass("locked")) {
		index = (index + 1) % 2
		if (get_bigcard_frame(card_mgr.bigcard_arr[index]).hasClass("locked")) {
			return false;
		}
	}
	card_mgr.bigcard_arr[index].empty()
	
	$.get("/reviews", {roomid: val.id}, function(data) {
		card_mgr.bigcard_arr[index].append(get_big_card(val, data))
	})
	card_mgr.bigcard_disp_arr[index] = val
	
	card_mgr.cur_bigcard1 = !card_mgr.cur_bigcard1;

	card_mgr.card_queue.push(val)
	if (card_mgr.card_queue.length > 2) {
		for (var i = 0; i < card_mgr.card_queue.length; i++) {
			if (!card_mgr.card_queue[i].bool_locked) {
				var ret = card_mgr.card_queue[i]
				card_mgr.card_queue.splice(i, 1)
				$("#hitbox" + ret.id).click()
				break;
			}
		}
	}

	return true;
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
	var del_btn = $("<i>").addClass("far fa-trash-alt fa-lg")

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
	val.bool_locked = false;
	card.click(function() {
		if (!is_being_sorted && !val.bool_locked) { 
			console.log(to_header(val))
			if (val.bool_filled) {
				card.css("backgroundColor", "white");
				undisplay_bigcard(val)
			} else {
				if (!display_bigcard(val)) {
					return;
				}
				card.css("backgroundColor", "#f2f5ff");
			}
			val.bool_filled = !val.bool_filled
		}
	});
	card.attr("id", get_dom_id(val));
	
	card.contextmenu(function() {
		if (!is_being_sorted) {
			if (!val.bool_locked) {
				if (card_mgr.locked_count >= 2) {
					return false
				}
				card.addClass("locked")
				if (!val.bool_filled) {
					card.click()
				}
				lock_bigcard(val)
				card_mgr.locked_count++
			} else {
				card.removeClass("locked")
				unlock_bigcard(val)
				card_mgr.locked_count--
			}
			val.bool_locked = !val.bool_locked
		}
		return false
	})

	del_btn_hitbox.click(function() {
		is_being_sorted = true
		setTimeout(function() {
			is_being_sorted = false
		}, 500)
		$.get("/unfavorite", {groupid: $("#groups").val(), roomid: val.id}, function(data) {
			var list = $($("#cards").children()[0]).children()
			$.each(list, function(i, item) {
				if ($(item).attr("id") == "elem" + val.id) {
					if (val.bool_filled) {
						undisplay_bigcard(val)
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
	//reset_bigcards()
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
		start: function(a, b, c) {
			is_being_sorted = true
		},
		stop: function(a, b, c) {
			let order = get_new_order();
			console.log(order);
			//$.post("/reorder_favorites", {}
			setTimeout(function() {
				is_being_sorted = false
			}, 500)
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
		reset_bigcards()
	})

	navbar_set("#nav_favorites")
});
