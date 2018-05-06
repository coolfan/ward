function get_reviews_card(reviews) {
	var card = $("<div>").addClass("card w-100 y-stalwart").attr("style", "max-height: 100%");
	var container_fluid = $("<div>").addClass("container-fluid");
	var card_body = $("<div>").addClass("card-body");

	if (reviews.length > 0) {
		var pic_urls = []
		$.each(reviews, function(i, val) {
			pic_urls = pic_urls.concat(val.pictures)
		})
		
		var pic_header = $("<div>").addClass("row")
			.append($("<div>").addClass("col col-sm-12")
					.append($("<h5>").text("Available Images:")))
		card_body.append(pic_header)
		
		var pic_row = $("<div>")
		pic_row.attr("style", "width: 100%; max-width: 100%; overflow-x: auto; white-space: nowrap")
		if (pic_urls.length > 0) {
			$.each(pic_urls, function(i, val) {
				var img = $("<img>").attr("src", val).attr("style", "max-height: 200px; display: inline-block")
				pic_row.append(img)
			})
		} else {
			var no_pic_msg = $("<p>").text("No images available.").addClass("text-center w-100")
			pic_row.append(no_pic_msg)
		}
		card_body.append(pic_row)

		card_body.append($("<hr>"))
		$.each(reviews, function(i, val) {
			var row = $("<div>").addClass("row");
			var col = $("<div>").addClass("col-sm-12");
			var rating = $("<h5>").text("Rating: " + val.rating + "/5")
			col.append(rating)
			row.append(col)
			card_body.append(row)
			
			row = $("<div>").addClass("row");
			col = $("<div>").addClass("col-sm-12");
			var comment = $("<p>").text(val.text)
			col.append(comment)
			row.append(col)
			card_body.append(row)
			card_body.append($("<hr>"))
			/*
			$.each(val.pictures, function(i, url) {
				row = $("<div>").addClass("row");
				col = $("<div>").addClass("col-sm-12");
				var img = $("<img>").attr("src", url).attr("style", "max-width: 100%; max-height: 100%")
				col.append(img)
				row.append(col)
				card_body.append(row)
			})*/
		})
	} else {
		var row = $("<div>").addClass("row");
		var col = $("<div>").addClass("col-sm-12").attr("align", "center");
		var rating = $("<h6>").text("No reviews yet.")
		col.append(rating)
		row.append(col)
		card_body.append(row)
			
	}
	
	container_fluid.append(card_body);
	card.append(container_fluid);

	return card
}
