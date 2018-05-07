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
        placeholder: "  e.g Spelman Hall"
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

    console.log(Cookies.get('first_time'));

    if(Cookies.get('first_time') !== 'false'){

        Cookies.set('first_time', 'false');


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
    $("#guide_btn").show();
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


        intro.setOption('doneLabel', 'Next page').start().oncomplete(function() {
          window.location.href = 'favorites_page?multipage=true';
        });
}