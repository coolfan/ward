function favorite(id) {
    $.get({
        url: "/favorite", data: {roomid: id}, success: function () {
        }
    });
}

function un_favorite(id){
    $.get({
        url: "/unfavorite", data: {roomid: id}, success: function () {
        }
    });
}

let rooms = {undefined}; //All the rooms currently being displayed
let prev_query = {};
let amount_displayed = 0;
let LOADED_PER_QUERY = 50000; //Arbitrarily chosen number that's more than all the rooms on campus
let first_search = true;

function search_rooms(room_query) {
    room_query["limit"] = LOADED_PER_QUERY;

    $.get({
        url: "/query",
        data: room_query,
        traditional:true,
        success: function (new_rooms) {

            rooms = new_rooms;

            for (let i = 0; i < rooms.length; i++){

                // let college = rooms[i].college;
                // let words = college.split(" ");
                // if(words[words.length - 1] === "College"){
                //     words.pop();
                //     college = words.join(" ");
                // }
                //
                // rooms[i].college = college;
            }

            if(first_search){
                display_table("/static/ball_search_miss.gif");
            }

            first_search = false;
            redraw_table();

            prev_query = room_query;
            amount_displayed = 0;

            amount_displayed = new_rooms.length;
        }
    });
}

$(document).ready(function () {
    // search_rooms({}); //Load initial rooms

    setup_form();

    navbar_set("#nav_table");

    $(".number_only").on("keypress keyup blur", function (event) {
        $(this).val($(this).val().replace(/[^\d].+/, ""));

        //Only allow numbers, enter (13) and backspace (8)
        if ((event.which < 48 || event.which > 57 && event.which !==10) && event.which !==13 && event.which !== 8) {
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
    $('#draw_type_select').select2({
        placeholder: "  e.g. Independent"
    });
    $('#building_select').select2({
        placeholder: "  e.g. Spelman Hall"
    });
});


$(document).ready(function(){
    let modal_popup = $(`
<div class="modal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Welcome to WARD!</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>It looks like this is your first time visiting. Want to take the tour?</p>
      </div>
       <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" id="start_guide_btn">Sure!</button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">I'm good</button>
      </div>
    </div>
   
    
  </div>
</div>`);

    // console.log(Cookies.get('first_time'));

    if(Cookies.get('first_time') !== 'false'){

        Cookies.set('first_time', 'false',{ expires:300 });


        let btn = $(modal_popup).find("#start_guide_btn");
        btn.click(function(){
            start_guide();
        })

        modal_popup.modal({
            keyboard: true,
            focus: true,
            show: true,
        })
    }

});


$(document).ready(function(){
    $("#guide_btn").removeClass("nav-hidden");
    $("#guide_btn").click(function(){
       start_guide();
    })
});

function start_guide(){
     var intro = introJs();
        intro.oncomplete(function(){
           global_in_intro = false;
        });
        intro.onexit(function(){
            // alert("hi");
            global_in_intro = false;
        });

        global_in_intro = true;


        intro.setOptions({doneLabel: 'Next Page', prevLabel: " < ", nextLabel: " > ", skipLabel: " X "}).start().oncomplete(function() {
          window.location.href = 'favorites_page?multipage=true';
        });
}
