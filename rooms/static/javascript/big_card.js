function to_header(val) {
	return val.roomnum + " " + val.building
}

function build_bigcard_inner(val) {
	var header = $("<h3>").addClass("row")
	header.text(to_header(val))

	var drawtype = $("<h5>").addClass("row")
	drawtype.text(val.college)

	var numrooms = $("<p>").addClass("row")
	numrooms.text("Number of Rooms: " + val.numrooms)

	var occupancy = $("<p>").addClass("row")
	occupancy.text("Occupancy: " + val.occupancy)

	var floor = $("<p>").addClass("row")
	floor.text("Floor: " + val.floor)

	var subfree = $("<p>").addClass("row")
	subfree.text("Sub-Free: " + (val.subfree ? "Yes" : "No"))

	return [header, drawtype, numrooms, occupancy, floor, subfree]
}

function get_big_card(room, reviews){
    var div = $("<div>")
	$.each(build_bigcard_inner(room), function(i, val) {
		div.append(val)
	})
	div.append(get_reviews_card(reviews))
	return div
}
