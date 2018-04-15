let rooms; //All the rooms currently being displayed

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

function search_rooms(room_query){
    $.get({url:"/query",
        data:{room_query},
        success: function(new_rooms){
            rooms = new_rooms;
            display_rooms();
    }});
}

function display_rooms(){
    $(".Table_card").empty();

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


$(function () {
    $('.Table_card').endlessScroll({
        // pagesToKeep: 10,
        fireOnce: true,
        insertBefore: ".Table_card div:first",
        insertAfter: ".Table_card div:last",
        callback: function(firesequence,pageSequence,scrollDirection){
            if (scrollDirection === 'next'){

            }
        },
        // content: function (i, p) {
        //     // console.log(i, p)
        //     return '<li>' + p + '</li>'
        // },
        ceaseFire: function (i) {
            if (i >= 10) {
                return true;
            }
        },
        intervalFrequency: 5
    });

    $('#images').scrollTop(101);
    var images = $("ul#images").clone().find("li");
    $('#images').endlessScroll({
        pagesToKeep: 5,
        inflowPixels: 100,
        fireDelay: 10,
        content: function (i, p, d) {
            console.log(i, p, d)
            return images.eq(Math.floor(Math.random() * 8))[0].outerHTML;
        }
    });
});