function get_reviews_card(reviews) {
	var card = $("<div>").addClass("card");
	var container_fluid = $("<div>").addClass("container-fluid");
	var card_body = $("<div>").addClass("card-body");
	var row = $("<div>").addClass("row");
	var col = $("<div>").addClass("col-sm-12");
	
	$.each(reviews, function(i, val) {
		var rating = $("<h6>").text(val.rating)
		var comment = $("<p>").text(val.text)

		col.append(rating)
		col.append(comment)

		$.each(val.pictures, function(i, url) {
			var img = $("<img>").attr("src", url)
			col.append(img)
		})

	})

	col.append(text);
	row.append(col);
	card_body.append(row);
	container_fluid.append(card_body);
	card.append(container_fluid);

	return card
}
