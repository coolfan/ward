function to_header(val) {
	return val.roomnum + " " + val.building
}

function build_bigcard_inner(val) {
	var header = $("<p>").addClass("col").addClass("col-sm-3")
	header.text(to_header(val))

	var occupancy = $("<p>").addClass("col").addClass("col-sm-3")
	occupancy.text("Occupancy: " + val.occupancy)

	var floor = $("<p>").addClass("col").addClass("col-sm-3")
	floor.text("Floor: " + val.floor)

	var subfree = $("<p>").addClass("col").addClass("col-sm-3")
	subfree.text("Sub-Free: " + (val.subfree ? "Yes" : "No"))

	return [header, occupancy, floor, subfree]
}

$(document).ready(function() {
	navbar_set("#nav_reviews")

	// $.get("/buildings", function(data) {
	// 	$.each(data, function(i, val) {
	// 		var option = $("<option>").text(val)
	// 		$("#building").append(option)
	// 	})
	// })


	let building_select = $("#building");
	let data = {};

    $.get({
        url: "/buildings",
        data: data,
        traditional: true,
        success: function (ans) {
            // buildings = ans;
            building_select.empty();

            for (college in ans) {
                let group = $('<optgroup></optgroup>');
                group.attr("label",college);
                building_select.append(group);

                $.each(ans[college], function (i, building) {
                    let option = $(`<option></option>`);
                    option.attr("value", building);
                    option.text(building);

                    // console.log(building);
                    // console.log(college);
                    group.append(option);
                })
            }

            // console.log('hi');
            // building_select.empty();
            // // building_select.append('<option></option>');
            //
            // $.each(buildings, function (i, building) {
            //     let option = $(`<option></option>`);
            //     option.attr("value", building);
            //     option.text(building);
            //
            //     // console.log(building);
            //     // console.log(college);
            //     building_select.append(option);
            // })
        }
    });



















	$("#roomnum").change(function() {
		var building = $("#building").val()
		var roomnum = $("#roomnum").val()

		$.get("/query", {building: building, roomnum: roomnum}, function(data) {
			if (data.length > 0) {
				var info = build_bigcard_inner(data[0])
				$("#bigcard_body").empty()
				$.each(info, function(i, val) {
					$("#bigcard_body").append(val)
				})
				
				$.get("/reviews", {roomid: data[0].id}, function(data) {
					$("#bigcard_body").append(get_reviews_card(data))
				})
			}
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
				$("#bigcard_body").empty()
			} else {
				$("#notif").text("Please enter a valid room.")
			}
		})
	})
})
