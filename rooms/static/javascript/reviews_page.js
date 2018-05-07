function get_search_overflow_card() {
	var card = $("<div>").addClass("w-100").attr("align", "center")
	var header = $("<p>").addClass("card-text")

	header.text("Multiple rooms found. Please try refining your search.")
	card.append(header)

	return card
}


$(document).ready(function() {
	navbar_set("#nav_reviews")
	$(":file").filestyle();

	$("#q").change(function() {
		$.get("/query", {q: $("#q").val()}, function(data) {
			$("#bigcard_body").empty()
			if (data.length == 1) {
				$("#roomid").val(data[0].id)
				$.get("/reviews", {roomid: data[0].id}, function(rev) {
					$("#bigcard_body").append(get_big_card(data[0], rev))
				})
			} else if (data.length > 1) {
				$("#bigcard_body").append(get_search_overflow_card())
			}
		})
	})
	
	$("#button").click(function() {
		$.get("/query", {q: $("#q").val()}, function(data) {
			if (data.length == 1) {
				$("#roomid").val(data[0].id)

				var rating = $("input[name=ratings-choice]:checked")
				if (rating.length > 0) {
					$("#rating").val(rating.attr("id").slice(3))
				} else {
					$("#notif").text("Please select a rating.")
				}
				
				$("#review").submit()
				$("#notif").text("Review for " + data[0].building + " " + data[0].roomnum + " has been submitted!")
				$("#review")[0].reset()
				$("input[name=ratings-choice]:checked").removeAttr("checked")
				$("label").removeClass("active")
				$("#bigcard_body").empty()
			} else {
				$("#notif").text("Please enter a valid room.")
			}
		})
	})
})
