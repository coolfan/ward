function navbar_set(tag) {
	var navbar_items = $("#nav_whole").children();
	$.each(navbar_items, function(i, val) {
		$(val).removeClass("active")
		$($(val).children()[0]).attr("style","font-size:25px;color: white !important");
	})
	$(tag).addClass("active");
	$($(tag).children()[0]).attr("style","font-size:25px;color: lightgrey !important");
}$