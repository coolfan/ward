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
    let room_num_input = $("#room_num_input");

    //Fill in data
    $.get({
        url: "/colleges",
        success: function (ans) {
            colleges = ans;
            $.each(colleges, function (i, college) {
                let option = $(`<option></option>`);
                option.attr("value", college);
                option.text(college);
                console.log(option);
                draw_type_select.append(option);
                // draw_type_select.selectpicker("refresh");
            });

            // console.log(buildings);
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
        let room_num = room_num_input.val();

        let sort_criteria = $("#sorting_select").val();

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

        if(room_num !== ""){
            room_query["roomnum"] = room_num;
        }

        if(sort_criteria)

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
    // console.log("d");
    // console.log(data);

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
}

