function favorite(id) {
    $.get({
        url: "/favorite", data: {roomid: id}, success: function () {
            // change_star_color(id);
        }
    });
}

function un_favorite(id){
    $.get({
        url: "/unfavorite", data: {roomid: id}, success: function () {
            // change_star_color(id);
        }
    });
}

function change_star_color(id) {
    let elem = $("#" + id + "star");
    let empty = elem.attr("src") === "/static/star.png";
    if (empty) {
        elem.attr("src", "/static/starfill.png");
    }
    else {
        elem.attr("src", "/static/star.png");
    }
}

let rooms = {undefined}; //All the rooms currently being displayed
let prev_query = {};
let amount_displayed = 0;
let LOADED_PER_QUERY = 50000;
let done_loading = false;

function search_rooms(room_query) {
    room_query["limit"] = LOADED_PER_QUERY;

    $.get({
        url: "/query",
        data: room_query,
        traditional:true,
        success: function (new_rooms) {
            // clear_rooms();
            // add_rooms(new_rooms);

            rooms = new_rooms;
            // Temporary, until real likelihoods come in
            for(let i = 0; i < rooms.length; i++){
                rooms[i]["likelihood"] = 50;
            }

            redraw_table();

            prev_query = room_query;
            amount_displayed = 0;
            done_loading = false;

            amount_displayed = new_rooms.length;

        }
    });
}

$(document).ready(function () {
    search_rooms({});
    setup_form();

    navbar_set("#nav_table");

    $(".number_only").on("keypress keyup blur", function (event) {
        $(this).val($(this).val().replace(/[^\d].+/, ""));

        if ((event.which < 48 || event.which > 57 && event.which !==10) && event.which !==13) {
            event.preventDefault();
        }
    });

    $('[data-toggle="tooltip"]').tooltip(); //Enable tooltips

});


$(document).ready(function() {
    let win = $("#scroller");
    let container = $(".Table_card");
    let last_loaded = $.now();

    // Each time the user scrolls
    win.scroll(function() {

        let scrollBottom = win.scrollTop() + win.height();

        if (scrollBottom > container.height() - 50 && $.now() > last_loaded + 1000) {
            $('#loading').show();
            last_loaded = $.now();
            load_more_rooms();
        }
    });
});

$(document).ready(function() {
    // $.fn.select2.defaults.set( "theme", "bootstrap4" );

    $('#draw_type_select').select2({
        placeholder: "  e.g Independent"
    });
    $('#building_select').select2({
        placeholder: "  e.g Spellman Hall"
    });
});

