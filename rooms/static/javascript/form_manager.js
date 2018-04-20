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

    //Fill in data
    $.get({
        url: "/colleges",
        success: function (ans) {
            colleges = ans;
            $.each(colleges, function (i, college) {
                let option = $(`<option></option>`);
                option.attr("value", college);
                option.text(college);
                draw_type_select.append(option);
            });
        }
    });

    $(".form-control").change(function () {
        let college = draw_type_select.val();
        let subfree = check_subfree.val() === "off";
        let building = building_select.val();
        let occupancy = occupancy_input.val();
        let num_rooms = num_rooms_input.val();
        let floor = floor_input.val();

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

        search_rooms(room_query);
    });

    draw_type_select.change(function () {
        fill_buildings();
    });

    fill_buildings();

    search_form.submit(function (e) {
        e.preventDefault();
    })
}


function fill_buildings() {
    let draw_type_select = $("#draw_type_select");
    let building_select = $("#building_select");

    let college = draw_type_select.val();

    if (college === ""){
        college = null;
    }

    $.get({
        url: "/buildings",
        data: {
            college : college
        },
        success: function (ans) {
            buildings = ans;
            console.log('hi');
            building_select.empty();
            building_select.append('<option></option>');

            $.each(buildings, function (i, building) {
                let option = $(`<option></option>`);
                option.attr("value", building);
                option.text(building);

                console.log(building);
                // console.log(college);
                building_select.append(option);
            })
        }
    });
}