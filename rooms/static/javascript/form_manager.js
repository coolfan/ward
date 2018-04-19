let buildings = {}; //A mapping between colleges and buildings

function setup_form() {
    let search_form = $("#search_form");

    let draw_type_select = $("#draw_type_select");
    let check_subfree = $("#check_subfree");
    let building_select = $("#building_select");
    let occupancy_input = $("#occupancy_input");
    let num_rooms_input = $("#num_rooms_input");
    let floor_input = $("#floor_input");

    //Fill in data
    for (let college in buildings) {
        let option = $(`<option></option>`);
        option.attr("value", college);
        option.text(college);

        draw_type_select.appendChild(option);
    }

    //Change elements behavior
    draw_type_select.click(function () {
        if (draw_type_select.val() !== "") {
            $("#draw_type_fake_option").remove();
        }
    });

    draw_type_select.change(function () {
        college = draw_type_select.val();
        for (let building in buildings[college]) {
            let option = $(`<option></option>`);
            option.attr("value",building);
            option.text(building);
        }
    });

    search_form.submit(function (e) {
        e.preventDefault();

        let college = draw_type_select.val();
        let subfree = check_subfree.val() === "off";
        let building = building_select.val();
        let occupancy = occupancy_input.val();
        let num_rooms = num_rooms_input.val();
        let floor = floor_input.val();

        let room_query = {};

        if (college !== ""){
            room_query["college"] = college
        }

        if (subfree){
            room_query["subfree"] = subfree
        }

        if (building !== ""){
            room_query["building"] = building
        }

        if (occupancy !== ""){
            room_query["occupancy"] = occupancy
        }

        if (num_rooms !== ""){
            room_query["numrooms"] = num_rooms
        }

        if (floor !== ""){
            room_query["floor"] = floor
        }

        search_rooms(room_query);
    })
}