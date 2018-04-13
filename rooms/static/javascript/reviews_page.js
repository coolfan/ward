$(document).ready(function() {
	navbar_set("#nav_reviews")
	
	$("#button").click(function() {
		$.get("/query", {building: $("#building").val(), roomnum: $("#roomnum").val()}, function(data) {
			if (data.length > 0) {
				$("#roomid").val(data[0].id)
				$("#review").submit()
				$("#review")[0].reset()
			} else {
				alert("Room does not exist!")
			}
		})
	})
})
