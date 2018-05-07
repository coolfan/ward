var card_manager = {
	lru_cache: [],
	big_card_bodies: [null, null],
	big_card_values: [null, null],
	big_card_left: [null, null],
	big_card_right: [null, null],
	locked_count: 0
};

var is_sorting = false;

function click_card(order, index, step, left, avoid) {
	if (step == 0) {
		if (left) {
			console.log("clicking " + order[index])
			$("#card-" + order[index]).click()
		} else {
			$("#card-" + order[index]).contextmenu()
		}
	} else {
		index += step;
		index += order.length;
		index %= order.length;
		while (avoid && $("#card-" + order[index]).hasClass("selected")) {
			index += step
			index += order.length
			index %= order.length
		}
		if (left) {
			console.log("clicking " + order[index])
			$("#card-" + order[index]).click()
		} else {
			$("#card-" + order[index]).contextmenu()
		}
	}
}

function get_order() {
	let list = $($("#cards").children()[0]).children();
	let ret = [];
	$.each(list, function(i, val) {
		ret.push($(val).attr("id").slice(5))
	});
	
	return ret
}

function get_big_card_frame(big_card) {
	var parent = $(big_card.parent())
	parent = $(parent.parent())
	parent = $(parent.parent())
	return parent;
}

function reset_big_cards() {
	$.each(card_manager.big_card_bodies, function(i, val) {
		val.empty()
		get_big_card_frame(val).removeClass("locked")
	})

	card_manager.lru_cache = []
	card_manager.big_card_values = [null, null]
	card_manager.locked_count = 0
}

function lock_big_card(val) {
	if (is_displaying(0, val)) {
		get_big_card_frame(card_manager.big_card_bodies[0]).addClass("locked")
		toggle_button(card_manager.big_card_left[0], false)
		toggle_button(card_manager.big_card_right[0], false)
	}

	if (is_displaying(1, val)) {
		get_big_card_frame(card_manager.big_card_bodies[1]).addClass("locked")
		toggle_button(card_manager.big_card_left[1], false)
		toggle_button(card_manager.big_card_right[1], false)
	}
}

function unlock_big_card(val) {
	if (is_displaying(0, val)) {
		get_big_card_frame(card_manager.big_card_bodies[0]).removeClass("locked")
		toggle_button(card_manager.big_card_left[0], true)
		toggle_button(card_manager.big_card_right[0], true)
	}

	if (is_displaying(1, val)) {
		get_big_card_frame(card_manager.big_card_bodies[1]).removeClass("locked")
		toggle_button(card_manager.big_card_left[1], true)
		toggle_button(card_manager.big_card_right[1], true)
	}
}

function is_displaying(i, val) {
	if (val == null && card_manager.big_card_values[i] == null) {
		return true
	}

	if (val != null && card_manager.big_card_values[i] != null && card_manager.big_card_values[i].id == val.id) {
		return true
	}

	return false
}

function is_in_array(arr, id) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].id == id) {
			return true;
		}
	}
	return false
}

function remove_compare(card, attr) {
	var box = card.find("." + attr)
	console.log(box)
	box.removeClass("better")
	box.removeClass("worse")
}

function set_compare(card, attr, comp) {
	var box = card.find("." + attr)
	console.log(box)
	if (comp == 1) {
		box.addClass("better")
	} else {
		box.addClass("worse")
	}
}

function toggle_button(button, enable) {
	if (enable) {
		$(button.children()[0]).removeClass("disabled")
	} else {
		console.log($(button.children()[0]))
		$(button.children()[0]).addClass("disabled")
	}
}

function is_button_enabled(button) {
	if ($(button.children()[0]).hasClass("disabled")) {
		return false;
	}

	return true;
}

function compare_stats() {
	var left = card_manager.big_card_values[0]
	var left_card = card_manager.big_card_bodies[0]

	var right = card_manager.big_card_values[1]
	var right_card = card_manager.big_card_bodies[1]

	if (left == null && right != null) {
		remove_compare(right_card, "sqft")
		remove_compare(right_card, "numrooms")
	}

	if (right == null && left != null) {
		remove_compare(left_card, "sqft")
		remove_compare(left_card, "numrooms")
	}

	if (right != null && left != null) {
		if (left.occupancy != right.occupancy) {
			remove_compare(left_card, "sqft")
			remove_compare(left_card, "numrooms")
			remove_compare(right_card, "sqft")
			remove_compare(right_card, "numrooms")
		} else {
			if (left.sqft < right.sqft) {
				set_compare(left_card, "sqft", 0)
				set_compare(right_card, "sqft", 1)
			}

			if (right.sqft < left.sqft) {
				set_compare(right_card, "sqft", 0)
				set_compare(left_card, "sqft", 1)
			}

			if (left.numrooms < right.numrooms) {
				set_compare(left_card, "numrooms", 0)
				set_compare(right_card, "numrooms", 1)
			}

			if (right.numrooms < left.numrooms) {
				set_compare(right_card, "numrooms", 0)
				set_compare(left_card, "numrooms", 1)
			}
		}
	}
}

function display_big_card(val) {
	card_manager.lru_cache.push(val)
	if (card_manager.lru_cache.length > 2) {
		for (var i = 0; i < card_manager.lru_cache.length; i++) {
			if (!card_manager.lru_cache[i].bool_locked) {
				var ret = card_manager.lru_cache[i]
				card_manager.lru_cache.splice(i, 1)
				if (ret.id != val.id) {
					click_card([ret.id], 0, 0, true, false)
				}
				break;
			}
		}
	}
	if (!is_in_array(card_manager.lru_cache, val.id)) {
		return false;
	}
	var index = 0
	if (!is_displaying(index, null) && is_displaying((index + 1) % 2, null)) {
		index = (index + 1) % 2
	}
	
	display_big_card_at(val, index)

	return true;
}

function display_big_card_at(val, index) {
	$.get("/reviews", {roomid: val.id}, function(data) {
		card_manager.big_card_bodies[index].empty()
		card_manager.big_card_bodies[index].append(get_big_card(val, data))
		card_manager.big_card_values[index] = val
		compare_stats()
	})
	card_manager.big_card_values[index] = val
	get_big_card_frame(card_manager.big_card_bodies[index]).addClass("selected")

	toggle_button(card_manager.big_card_left[index], true)
	toggle_button(card_manager.big_card_right[index], true)

}

function undisplay_big_card(val) {
	if (is_displaying(0, val)) {
		card_manager.big_card_bodies[0].empty()
		card_manager.big_card_values[0] = null
		get_big_card_frame(card_manager.big_card_bodies[0]).removeClass("selected")
		toggle_button(card_manager.big_card_left[0], false)
		toggle_button(card_manager.big_card_right[0], false)
	}

	if (is_displaying(1, val)) {
		card_manager.big_card_bodies[1].empty()
		card_manager.big_card_values[1] = null
		get_big_card_frame(card_manager.big_card_bodies[1]).removeClass("selected")
		toggle_button(card_manager.big_card_left[1], false)
		toggle_button(card_manager.big_card_right[1], false)
	}

	for (var i = 0; i < card_manager.lru_cache.length; i++) {
		if (card_manager.lru_cache[i].id === val.id) {
			card_manager.lru_cache.splice(i, 1)
			break;
		}
	}

	compare_stats()
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
	let li = $("<li>").attr("id", "elem-" + val.id);
	let card = $("<div>").addClass("card selectable-card");
	var container_fluid = $("<div>").addClass("container-fluid");
	var card_body = $("<div>").addClass("card-body");
	var row = $("<div>").addClass("row");
	var col1 = $("<div>").addClass("col col-sm-10").attr("id", "hitbox" + val.id);
	var col2 = $("<div>").addClass("col col-sm-2");
	var text = $("<p>").addClass("card-text");
	var del_btn_hitbox = $("<div>")
	var del_btn = $("<i>").addClass("far fa-trash-alt fa-lg hover-button")

	del_btn_hitbox.append(del_btn)
	text.append(val.building + " " + val.roomnum);
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
		if (!is_sorting && !val.bool_locked) {
			if (val.bool_filled) {
				card.removeClass("selected")
				undisplay_big_card(val)
			} else {
				if (!display_big_card(val)) {
					return;
				}
				card.addClass("selected")
			}
			val.bool_filled = !val.bool_filled
		}
	});
	card.attr("id", "card-" + val.id);
	
	card.contextmenu(function() {
		if (!is_sorting) {
			if (!val.bool_locked) {
				if (card_manager.locked_count >= 2) {
					return false
				}
				card.addClass("locked")
				if (!val.bool_filled) {
					click_card([val.id], 0, 0, true, false)
				}
				lock_big_card(val)
				toggle_button(del_btn_hitbox, false)
				card_manager.locked_count++
			} else {
				card.removeClass("locked")
				unlock_big_card(val)
				toggle_button(del_btn_hitbox, true)
				card_manager.locked_count--
			}
			val.bool_locked = !val.bool_locked
		}
		return false
	})

	del_btn_hitbox.click(function() {
		if (!is_sorting && !val.bool_locked) {
			is_sorting = true
			setTimeout(function() {
				is_sorting = false
			}, 500)
			$.get("/unfavorite", {groupid: $("#groups").val(), roomid: val.id}, function(data) {
				var list = $($("#cards").children()[0]).children()
				$.each(list, function(i, item) {
					if ($(item).attr("id") == "elem" + val.id) {
						if (val.bool_filled) {
							undisplay_big_card(val)
						}
						$("#cards").children()[0].removeChild(item)
					}
				})
			})
		}
	})

	li.append(card);
	return li
}

$(document).ready(function() {
	card_manager.big_card_bodies = [$("#big-card-0-body"), $("#big-card-1-body")];
	card_manager.big_card_left = [$("#big-card-0-left"), $("#big-card-1-left")];
	card_manager.big_card_right = [$("#big-card-0-right"), $("#big-card-1-right")];

	$.each(card_manager.big_card_left, function(i, val) {
		toggle_button(val, false)
		val.click(function() {
			if (is_button_enabled(val)) {
				var cur_id = card_manager.big_card_values[i].id
				var order = get_order()
				console.log(cur_id)
				console.log(order)
				for (var index = 0; index < order.length; index++) {
					if (order[index] == cur_id) {
						click_card(order, index, 0, true, false)
						click_card(order, index, -1, true, true)
					}
				}
			}
		})
	})

	$.each(card_manager.big_card_right, function(i, val) {
		toggle_button(val, false)
		val.click(function() {
			if (is_button_enabled(val)) {
				var cur_id = card_manager.big_card_values[i].id
				var order = get_order()

				for (var index = 0; index < order.length; index++) {
					if (order[index] == cur_id) {
						click_card(order, index, 0, true, false)
						click_card(order, index, 1, true, true)
					}
				}
			}
		})
	})

	let ul = $("<ul>").addClass("draggable no-bullets padding-0").attr("id", "fav-list");
	ul.css("max-width: 100%")
	$("#cards").append(ul);
	$.get("/favorites",  function(data) {
		ul.empty()
		data = data["-1"]
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
			is_sorting = true
		},
		stop: function(a, b, c) {
			let order = get_order();
			console.log(order);
			//$.post("/reorder_favorites", {}
			setTimeout(function() {
				is_sorting = false
			}, 500)
		},
		scroll: false
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
		reset_big_cards()
	})

	$.each(card_manager.big_card_bodies, function(i, val) {
		var frame = get_big_card_frame(val)
		frame.contextmenu(function() {
			var room = card_manager.big_card_values[i]
			console.log(room)
			if (room != null) {
				click_card([room.id], 0, 0, false, false)
			}
			return false;
		})
	})
	
	navbar_set("#nav_favorites")
	console.log(RegExp('multipage', 'gi'))
	if (RegExp('multipage', 'gi').test(window.location.search)) {
		introJs().setOptions({prevLabel: " < ", nextLabel: " > ", skipLabel: " X "}).start().oncomplete(function() {
			window.location.href = "/";
		});
	}
});
