$(document).ready(function() {
	navbar_set("#nav_reviews")
	$(":file").filestyle();
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

                    group.append(option);
                })
            }

        }
    });


	$("#roomnum").change(function() {
		var building = $("#building").val()
		var roomnum = $("#roomnum").val()

		$.get("/query", {building: building, roomnum: roomnum}, function(data) {
			if (data.length > 0) {
				$("#roomid").val(data[0].id)
				$.get("/reviews", {roomid: data[0].id}, function(rev) {
					$("#bigcard_body").append(get_big_card(data[0], rev))
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
