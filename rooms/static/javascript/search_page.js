function favorite(id) {
    $.get({
        url: "/favorite", data: {roomid: id}, success: function () {
            change_star_color(id);
        }
    });
}

function un_favorite(id){
    $.get({
        url: "/unfavorite", data: {roomid: id}, success: function () {
            change_star_color(id);
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

let rooms; //All the rooms currently being displayed
let prev_query = {};
let amount_displayed = 0;
let LOADED_PER_QUERY = 50;
let done_loading = false;

function search_rooms(room_query) {
    room_query["limit"] = LOADED_PER_QUERY;

    $.get({
        url: "/query",
        data: room_query,
        success: function (new_rooms) {
            clear_rooms();
            add_rooms(new_rooms);

            prev_query = room_query;
            amount_displayed = 0;
            done_loading = false;

            amount_displayed = new_rooms.length;

            if (amount_displayed === 0) {
                let no_rooms_card = $(`
                   <div class="card" style="width: 100%; margin-bottom: 5px">
                        <div class="container-fluid">
                            <div class="card-body fonted Cards_parent" style="padding: 10px;">
                                <h4 align = "center" class ="text-danger padding-0 margin-0">No rooms match those search criteria.</h4>
                            </div>
                        </div>
                    </div>
                `);


                $(".Table_card").append(no_rooms_card);
            }
        }
    });
}

function load_more_rooms() {
    let room_query = prev_query;

    room_query["continueFrom"] = amount_displayed;
    room_query["limit"] = LOADED_PER_QUERY;

    $.get({
        url: "/query",
        data: room_query,
        success: function (new_rooms) {

            //Temporary, until real likelihoods come in
            for(let i = 0; i < new_rooms.length; i++){
                new_rooms[i]["likelihood"] = 50;
            }

            add_rooms(new_rooms);

            amount_displayed += new_rooms.length;
            if (new_rooms.length === 0) {
                done_loading = true;
            }
        }
    });
}

function clear_rooms() {
    $(".Table_card").empty();
}

function add_rooms(rooms) {
    $.each(rooms, function (i, room) {
        card = get_medium_card(room);
        wrapped = wrap_cards(card, room['id']);
        $(".Table_card").append(wrapped);
    });
}


$(document).ready(function () {
    search_rooms({});
    setup_form();

    navbar_set("#nav_table")

    $(".number_only").on("keypress keyup blur", function (event) {
        $(this).val($(this).val().replace(/[^\d].+/, ""));

        if ((event.which < 48 || event.which > 57 && event.which !==10) && event.which !==13) {
            event.preventDefault();
        }
    });

    $('[data-toggle="tooltip"]').tooltip(); //Enable tooltips


    // $('.Table_card').infiniteScroll({
    //     // options
    //     path: '.pagination__next',
    //     append: '.post',
    //     history: false,
    // });
    // $(".Table_card").append(create_sorting_controller());
});


$(document).ready(function() {
	let win = $("#scroller");
    let container = $(".Table_card");
    let last_loaded = $.now();

	// Each time the user scrolls
	win.scroll(function() {

	    // console.log("hi");
		// End of the document reached?
        // console.log($(document).height() - win.height());
        // console.log(win.scrollTop());
        // console.log(container.height());

        // console.log(scrollBottom);
        // console.log("h" + win.height());
        // console.log($.now());
        // console.log(last_loaded);
        let scrollBottom = win.scrollTop() + win.height();

		if (scrollBottom > container.height() && $.now() > last_loaded + 1000) {
			$('#loading').show();
            last_loaded = $.now();
			load_more_rooms();
		}
	});
});




// //http://fredwu.github.io/jquery-endless-scroll/js/jquery.endless-scroll.js (This is where the endless scroll stuff came from)
// $(function () {
//     $('.Table_card').endlessScroll({
//         // pagesToKeep: 2,
//         pagesToKeep: null,
//         inflowPixels: 100,
//         fireDelay: 1000,
//         content: true,
//         // fireOnce: true,
//         loader: "<p>...</p>",
//         insertBefore: ".Table_card div:first",
//         insertAfter: ".Table_card div:last",
//         callback: function (firesequence, pageSequence, scrollDirection) {
//             if (scrollDirection === 'next') {
//                 console.log('Trying to load more rooms');
//                 load_more_rooms();
//             }
//         },
//         ceaseFire: function (firesequence, pageSequence, scrollDirection) {
//             if (scrollDirection === 'next') {
//                 return done_loading;
//             }
//         },
//         intervalFrequency: 5
//     });
//     //
//     // $('#images').scrollTop(101);
//     // var images = $("ul#images").clone().find("li");
//     // $('#images').endlessScroll({
//     //     pagesToKeep: 5,
//     //     inflowPixels: 100,
//     //     fireDelay: 10,
//     //     content: function (i, p, d) {
//     //         console.log(i, p, d)
//     //         return images.eq(Math.floor(Math.random() * 8))[0].outerHTML;
//     //     }
//     // });
// });