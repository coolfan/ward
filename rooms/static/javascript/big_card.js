function to_header(val) {
	return val.building + " " + val.roomnum
}

function get_icons(base_icon_str, count) {
	var ans = "";
    if (count > 5) {
        ans += base_icon_str;
        ans += ' x ' + count;
    }
    else {
        for (let i = 0; i < count; i++) {
            ans += base_icon_str;
        }
    }

	return ans
}

function build_bigcard_inner(val) {

	var rows = []
	var rc = 0

	rows[rc] = $("<div>").addClass("row w-100").css("margin-bottom", "10px")
	var header = $("<h1>").addClass("col-sm-11 big-card")
	header.text(to_header(val))
	rows[rc].append(header);
	
	if (val.subfree) {
		var subfree_icon = $("<span data-toggle=\"tooltip\" data-placement=\"top\" title=\"Sub-free room\">").addClass("fa-stack w-100 col-sm-1")
		subfree_icon.append($("<i>").addClass("fa fa-ban fa-stack-2x"))
		subfree_icon.append($("<i>").addClass("fas fa-glass-martini fa-stack-1x"))
		subfree_icon.attr("data-toggle","tooltip");
		// subfree_icon.
		//
		rows[rc].append(subfree_icon)
	}
	rc++

	rows[rc] = $("<div>").addClass("row w-100").css("margin-bottom", "10px")
	var drawtype = $("<h3>").addClass("col-md-6 col-lg-8 big-card")
	drawtype.text(val.college)
	rows[rc].append(drawtype)
	var likelihood_col = $("<div>").addClass("col-md-6 col-lg-4").css("padding-right", "10px")
	let likelihood_btn = $(`<button type="button" class="btn w-100" data-toggle="tooltip" ></button>`);

    let likelihood = val.likelihood;

    if (likelihood <= 100 && likelihood >= 66){
        likelihood_btn.addClass("btn-success");
        likelihood_btn.text("Likely");
    }

    if (likelihood < 66 && likelihood >= 33){
        likelihood_btn.addClass("btn-primary");
        likelihood_btn.text("Maybe");
    }

    if (likelihood < 33 && likelihood >= 10){
        likelihood_btn.addClass("btn-warning");
        likelihood_btn.text("Unlikely");
    }

    if (likelihood < 10 && likelihood >= 0){
        likelihood_btn.addClass("btn-danger");
        likelihood_btn.text("Rarely");
    }

    likelihood_btn.attr("title","We think you will be able to select this room around " + likelihood + "% of the time. See FAQ page for more detail.");

    if(likelihood === -1){
        likelihood_btn.addClass("btn-secondary");
        likelihood_btn.text("N/A");
        likelihood_btn.attr("title","You are not in the same draw as this room. If you think this is in error, please contact ezlatin@princeton.edu");
    }


	likelihood_col.append(likelihood_btn)
	rows[rc].append(likelihood_col)
	rc++

	rows[rc] = $("<div>").addClass("row w-100").css("margin-bottom", "10px")
	var floor = $("<h5>").addClass("col-xs-12 col-sm-6 big-card")
	floor.text("Floor: " + val.floor)
	rows[rc].append(floor)

	var occupancy = $("<h5>").addClass("col-xs-12 col-sm-6 big-card")
	occupancy.text("Occupancy: ").append(get_icons("<i class=\"fas fa-male fa-lg\"></i>", val.occupancy))
	rows[rc].append(occupancy)
	rc++

	rows[rc] = $("<div>").addClass("row w-100").css("margin-bottom", "10px")
	var sqft = $("<h5>").addClass("col-xs-12 col-sm-6 sqft big-card")
	sqft.text("Area: " + val.sqft + " ft").append($("<sup>").text("2"))
	rows[rc].append(sqft)

	var numrooms = $("<h5>").addClass("col-xs-12 col-sm-6 numrooms big-card")
	numrooms.text("Rooms: ").append(get_icons("<i class=\"fa fa-building fa-lg\"></i>", val.numrooms))
	rows[rc].append(numrooms)
	rc++

	return rows
}

function get_big_card(room, reviews){
    var div = $("<div>").addClass("w-100 h-100 y-stalwart")
	$.each(build_bigcard_inner(room), function(i, val) {
		div.append(val)
	})
	div.append(get_reviews_card(reviews))
	if (typeof(room.creator) !== "undefined") {
		var blame = $("<p>").text("Favorited by " + room.creator).css("padding-top", "10px")
		div.append(blame)
	}
	return div
}
