function get_reviews_card(reviews) {
	var card = $("<div>").addClass("card w-100");
	var container_fluid = $("<div>").addClass("container-fluid");
	var card_body = $("<div>").addClass("card-body");
	if (reviews.length > 0) {
		$.each(reviews, function(i, val) {
			var row = $("<div>").addClass("row");
			var col = $("<div>").addClass("col-sm-12");
			var rating = $("<h6>").text("Rating: " + val.rating)
			col.append(rating)
			row.append(col)
			card_body.append(row)
			
			row = $("<div>").addClass("row");
			col = $("<div>").addClass("col-sm-12");
			var comment = $("<p>").text("Comments: " + val.text)
			col.append(comment)
			row.append(col)
			card_body.append(row)
			
			$.each(val.pictures, function(i, url) {
				row = $("<div>").addClass("row");
				col = $("<div>").addClass("col-sm-12");
				var img = $("<img>").attr("src", url).attr("style", "max-width: 100%; max-height: 100%")
				col.append(img)
				row.append(col)
				card_body.append(row)
			})
		})
	} else {
		var row = $("<div>").addClass("row");
		var col = $("<div>").addClass("col-sm-12");
		var rating = $("<h6>").text("No reviews yet.")
		col.append(rating)
		row.append(col)
		card_body.append(row)
			
	}
	
	container_fluid.append(card_body);
	card.append(container_fluid);

	return card
}
