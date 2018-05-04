function to_header(val) {
	return val.roomnum + " " + val.building
}

function build_bigcard_inner(val) {
	var header = $("<h3>").addClass("row")
	header.text(to_header(val))

	var drawtype = $("<h5>").addClass("row")
	drawtype.text(val.college)

	var likelihood = val.likelihood;
    
    if (likelihood <= 100 && likelihood >= 66) {
		likelihood = "Likely"
    } else if (likelihood < 66 && likelihood >= 33){
        likelihood = "Maybe";
    } else if (likelihood < 33 && likelihood >= 10){
        likelihood = "Unlikely";
    } else if (likelihood < 10 && likelihood >= 0){
        likelihood = "Doomed";
    }

	var likelihood2 = $("<p>").addClass("row")
	likelihood2.text("Likelihood Estimate: " + likelihood)

	var numrooms = $("<p>").addClass("row")
	numrooms.text("Number of Rooms: " + val.numrooms)

	var occupancy = $("<p>").addClass("row")
	occupancy.text("Occupancy: " + val.occupancy)

	var floor = $("<p>").addClass("row")
	floor.text("Floor: " + val.floor)

	var subfree = $("<p>").addClass("row")
	subfree.text("Sub-Free: " + (val.subfree ? "Yes" : "No"))

	return [header, drawtype, likelihood2, numrooms, occupancy, floor, subfree]
}

function get_big_card(room, reviews){
    var div = $("<div>").addClass("w-100")
	$.each(build_bigcard_inner(room), function(i, val) {
		div.append(val)
	})
	div.append(get_reviews_card(reviews))
	return div
}
