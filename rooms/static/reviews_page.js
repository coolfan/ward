$(document).ready(function() {
	navbar_set("#nav_reviews")
	
	$("#button").click(function() {
		$.get("/query", {building: $("#building").val(), roomnum: $("#roomnum").val()}, function(data) {
			if (data.length > 0) {
				$("#roomid").val(data[0].id)

				var rating = $("input[name=ratings-choice]:checked")
				if (rating.length > 0) {
					$("#rating").val(rating.attr("id").slice(3))
				} else {
					alert("Please select a rating.")
				}
				
				$("#review").submit()
				$("#review")[0].reset()
				$("input[name=ratings-choice]:checked").removeAttr("checked")
				$("label").removeClass("active")
			} else {
				alert("Please enter a valid room.")
			}
		})
	})
})
