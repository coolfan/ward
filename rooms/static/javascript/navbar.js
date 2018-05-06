function navbar_set(tag) {
	var navbar_items = $("#nav_whole").children()
	$.each(navbar_items, function(i, val) {
		$(val).removeClass("active")
		$(val).css("color:white");
	})
	$(tag).addClass("active")
	$(val).css("color:lightgrey");
}
