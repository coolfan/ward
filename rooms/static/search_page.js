let rooms;

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

function search_rooms(limit,continueFrom,college,building,roomnum,sqft,occupancy,numrooms,subfree){
    $.get({url:"/query",
        data:{
            limit:limit,
            continueFrom:continueFrom,
            college:college,
            building:building,
            roomnum:roomnum,
            sqft:sqft,
            occupancy:occupancy,
            numrooms:numrooms,
            subfree:subfree},
        success: function(new_rooms){
            rooms = new_rooms;
            display_rooms();
    }});
}

function display_rooms(){
    $.each(rooms,function(i,room){
       card = get_medium_card(room);
       wrapped = wrap_cards(card);
       $(".Table_card").append(wrapped);
    });

    // cards = get_medium_card(rooms[0]);
    // wrapped = wrap_cards(cards);
    // console.log(wrapped);

    // $(".Table_card").append(wrapped);
}

$(document).ready(function (){
    $.getJSON({url:"/query", data:{}, success: function(data){
        rooms = data;
        display_rooms();
    }})
});


$(document).ready(function () {
    $('#roomsTable').DataTable({
        pageResize: true,
        searching: false,
        lengthChange: true,
        responsive: true,
        "columns": [ //Don't allow them to order based on the favorite star
            { "className": "dt-center", "orderable": false },
            { "className": "dt-center"},
            { "className": "dt-center"},
            { "className": "dt-center"},
            { "className": "dt-center"},
            { "className": "dt-center"},
            { "className": "dt-center", "width": "12%"},
            { "className": "dt-center", "width": "12%"},
            // { "className": "dt-center", "width": "10%"}
        ],
        colReorder: true,
        order: [[ 1, 'asc' ]]  //Starting order is collumn 1, which is college, in ascending order
    });

	navbar_set("#nav_table")
});
