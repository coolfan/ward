
function favorite(id) {
    $.get({url:"/favorite", data:{roomid:id}, success: function(){
        change_star_color(id)
    }} );
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

function reviews(roomid){
    let card = $('#' + roomid + 'card');
    let table = card.find('.Reviews_table');

    $.get({
        url:"/reviews",
        data:{
            roomid: roomid
        },
        success : function(reviews){

        }
    });
}

let rooms; //All the rooms currently being displayed
let prev_query = {};
let amount_displayed = 0;
let LOADED_PER_QUERY = 50;
let done_loading = false;

function search_rooms(room_query){
    room_query["limit"] = LOADED_PER_QUERY;

    $.get({url:"/query",
        data:room_query,
        success: function(new_rooms){
            clear_rooms();
            add_rooms(new_rooms);

            prev_query = room_query;
            amount_displayed = 0;
            done_loading = false;

            amount_displayed = new_rooms.length;
    }});
}

function load_more_rooms(){
    let room_query = prev_query;

    room_query["continueFrom"] = amount_displayed;
    room_query["limit"] = LOADED_PER_QUERY;

     $.get({url:"/query",
        data: room_query,
        success: function(new_rooms){
            add_rooms(new_rooms);

            amount_displayed += new_rooms.length;
            if(new_rooms.length === 0){
                done_loading = true;
            }
    }});
}

function clear_rooms(){
    $(".Table_card").empty();
}

function add_rooms(rooms){
     $.each(rooms,function(i,room){
       card = get_medium_card(room);
       wrapped = wrap_cards(card,room['id']);
       $(".Table_card").append(wrapped);
    });
}


$(document).ready(function () {
    search_rooms({});
    setup_form();

	navbar_set("#nav_table")
});

//http://fredwu.github.io/jquery-endless-scroll/js/jquery.endless-scroll.js (This is where the endless scroll stuff came from)
$(function () {
    $('.Table_card').endlessScroll({
        // pagesToKeep: 2,
        pagesToKeep:null,
        inflowPixels: 100,
        fireDelay: 1000,
        content: true,
        // fireOnce: true,
        loader: "<p>...</p>",
        insertBefore: ".Table_card div:first",
        insertAfter: ".Table_card div:last",
        callback: function(firesequence,pageSequence,scrollDirection){
            if (scrollDirection === 'next'){
                console.log('Trying to load more rooms');
                load_more_rooms();
            }
        },
        ceaseFire : function(firesequence,pageSequence,scrollDirection){
            if (scrollDirection === 'next'){
                return done_loading;
            }
        },
        intervalFrequency: 5
    });
    //
    // $('#images').scrollTop(101);
    // var images = $("ul#images").clone().find("li");
    // $('#images').endlessScroll({
    //     pagesToKeep: 5,
    //     inflowPixels: 100,
    //     fireDelay: 10,
    //     content: function (i, p, d) {
    //         console.log(i, p, d)
    //         return images.eq(Math.floor(Math.random() * 8))[0].outerHTML;
    //     }
    // });
});