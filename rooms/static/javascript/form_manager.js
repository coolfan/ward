let buildings = {}; //A mapping between colleges and buildings
let colleges = {};


function setup_form() {
    let search_form = $("#search_form");

    let draw_type_select = $("#draw_type_select");
    let check_subfree = $("#check_subfree");
    let building_select = $("#building_select");
    let occupancy_input = $("#occupancy_input");
    let num_rooms_input = $("#num_rooms_input");
    let floor_input = $("#floor_input");
    let room_name_input = $("#room_name_input");

    //Fill in data
    $.get({
        url: "/colleges",
        success: function (ans) {
            colleges = ans;
            $.each(colleges, function (i, college) {
                let option = $(`<option>` + String(college) + `</option>`);
                option.attr("value", college);

                draw_type_select.append(option);
            });

            fill_buildings();
        }
    });

    $(".form-control").change(function () {
        let college = draw_type_select.val();
        let subfree = check_subfree.val() === "off";
        let building = building_select.val();
        let occupancy = occupancy_input.val();
        let num_rooms = num_rooms_input.val();
        let floor = floor_input.val();
        let name = room_name_input.val();

        // let sort_criteria = $("#sorting_select").val();

        let room_query = {};

        if (college !== "") {
            room_query["college"] = college
        }

        if (subfree) {
            room_query["subfree"] = subfree
        }

        if (building !== "") {
            room_query["building"] = building
        }

        if (occupancy !== "") {
            room_query["occupancy"] = occupancy
        }

        if (num_rooms !== "") {
            room_query["numrooms"] = num_rooms
        }

        if (floor !== "") {
            room_query["floor"] = floor
        }

        if(name !== ""){
            room_query["q"] = name; //q is for query
        }

        search_rooms(room_query);
    });

    draw_type_select.change(function () {
        fill_buildings();
    });


    search_form.submit(function (e) {
        e.preventDefault();
    })
}


function fill_buildings() {
    let draw_type_select = $("#draw_type_select");
    let building_select = $("#building_select");

    let college = draw_type_select.val();
    console.log(college);

    let data = {};
    data['college'] = college;
    $.get({
        url: "/buildings",
        data: data,
        traditional: true,
        success: function (ans) {
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
}

