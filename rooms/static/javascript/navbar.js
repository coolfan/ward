function navbar_set(tag) {
	var navbar_items = $("#nav_whole").children();
	$.each(navbar_items, function(i, val) {
		$(val).removeClass("active")
		$($(val).children()[0]).removeClass("selected");
	})
	$(tag).addClass("active");
	$($(tag).children()[0]).addClass("selected");
}
