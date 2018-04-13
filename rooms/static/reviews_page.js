$(document).ready(function() {
	navbar_set("#nav_reviews")
	/*$("#review").submit(function(e) {
		e.preventDefault()
		var roomid = $("#roomid").val()
		var rating = $("#rating").val()
		var text = $("#text").val()
		var file = $("#pictures").val()
		var filename = $("#pictures")[0].value
		console.log(filename)
		$.post("/review", {roomid: roomid, rating: rating, text: text, pictures: file}, function() {
			$("#review")[0].reset()
		})
	})*/
})
