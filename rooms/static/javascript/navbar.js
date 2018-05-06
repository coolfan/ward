function navbar_set(tag) {
	var navbar_items = $("#nav_whole").children()
	$.each(navbar_items, function(i, val) {
		$(val).removeClass("active")
	})
	$(tag).addClass("active")
}
