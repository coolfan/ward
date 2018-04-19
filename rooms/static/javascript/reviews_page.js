$(document).ready(function() {
	navbar_set("#nav_reviews")

	$.get("/buildings", function(data) {
		$.each(data, function(i, val) {
			var option = $("<option>").text(val)
			$("#building").append(option)
		})
	})
	
	$("#button").click(function() {
		$.get("/query", {building: $("#building").val(), roomnum: $("#roomnum").val()}, function(data) {
			if (data.length > 0) {
				$("#roomid").val(data[0].id)

				var rating = $("input[name=ratings-choice]:checked")
				if (rating.length > 0) {
					$("#rating").val(rating.attr("id").slice(3))
				} else {
					$("#notif").text("Please select a rating.")
				}
				
				$("#review").submit()
				$("#notif").text("Review for " + $("#building").val() + " " + $("#roomnum").val() + " has been submitted!")
				$("#review")[0].reset()
				$("input[name=ratings-choice]:checked").removeAttr("checked")
				$("label").removeClass("active")
				
			} else {
				$("#notif").text("Please enter a valid room.")
			}
		})
	})
})
