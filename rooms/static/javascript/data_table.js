$(document).ready(function () {
    $('#rooms_table').DataTable({
        "stripeClasses": [],
        headerCallback: headerCallback,
        createdRow: call_back_handler,
        data: rooms,
        order: [[2, 'dec']], //Order based on sqft, the 3rd collumn
        language: {
            emptyTable: "No rooms matched those search criteria"
        },
        columns: [
            {
                data: 'roomnum',
                render: render_room_name,
                width: "20%"
            },
            {
                data: 'floor',
                render: render_floor,
                width: "15%"
            },
            {
                data: 'sqft',
                render: render_sqft,
                width: "15%"
            },
            {
                data: 'occupancy',
                render: render_occupancy,
                width: "15%"
            },
            {
                data: 'college',
                render: render_college,
                width: "15%"
            },
            {
                data: 'likelihood',
                render: render_likelihood,
                width: "8%"
            },
            {
                data: 'favorited',
                render: render_favorite, orderable: false,
                className: "dt-head-right"
            },
        ],
        searching: false,
        // colReorder: true,
        lengthChange: true,
        pageResize: true,
        scrollY:  '70vh',
        deferRender:    true,
        scroller:       true
    });
});

function render_room_name(data, type, room) {
    if (room === undefined) {
        console.log('null');
        return null;
    }
    return room.building + " " + room.roomnum;
}

function render_favorite(data, type, room) {
    if (room === undefined) {
        console.log('null');
        return null;
    }
    // console.log(room.favorited);
    if (type === "display") {
        let star_div = $(`
                      <span class = "Stardiv padding-0">
                            <span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span>
                            <img id = "{{ room['id']}}star"
                                 class="Star_img"
                                 src = "/static/star.png"
                                 style="height: 37px;width: 37px;padding-top: 2px">
                      </span>`);
        console.log(room.favorited);
        if (room.favorited) {
            star_div.find('.Star_img').attr("src", "/static/starfill.png");
        }
        star_div.find(".Star_img").attr("id", room.id + "star");

        return star_div.prop('outerHTML');
    }

    return room.favorited;
}

function render_floor(data, type, room) {
    if (room === undefined) {
        console.log('null');
        return null;
    }

    if (type === "display") {
        // let suffix = "";

        switch (room.floor) {
            case "0":
                return "Basement";
            case "1":
                return "1st";
            // break;
            case "2":
                // return "Second";
                return "2nd";
            // break;
            case "3":
                // return "Third";
                return "3rd";
            case "4":
                // return "Fourth";
                return "4th";
            case "5":
                // return "Fifth";
                return "5th";
            case "6":
                // return "Sixth";
                return "6th";
            case "7":
                // return "Seventh";
                return "7th";
        }

        return "Lots";
    }

    return room.floor;
}

function render_sqft(data, type, room) {
    if (room === undefined) {
        console.log('null');
        return null;
    }

    if (type === "display") {
        return room.sqft + ` ft<sup>2</sup>`;
    }

    return room.sqft;
}

function render_occupancy(data, type, room) {
    if (room === undefined) {
        console.log('null');
        return null;
    }

    if (type === "display") {
        let stick_figure = `<i class="fas fa-male fa-lg"></i>`;
        let ans = "";
        if (room['occupancy'] > 5) {
            ans += stick_figure;
            ans += ' x ' + room['occupancy'];
        }
        else {
            for (let i = 0; i < room['occupancy']; i++) {
                ans += stick_figure;
            }
        }

        return ans;
    }

    return room.occupancy;
}

function render_college(data, type, room) {
    if (room === undefined) {
        console.log('null');
        return null;
    }
    let college = room.college;

    return college;
}

function render_likelihood(data, type, room) {
    if (room === undefined) {
        console.log('null');
        return null;
    }
    if(type !== "display"){
        return room.likelihood;
    }
    let likelihood_btn = $(`<button type="button" class="btn Likelihood btn-block" data-toggle="tooltip"></button>`);
    let likelihood = room.likelihood;

    if (likelihood <= 100 && likelihood >= 66){
        likelihood_btn.addClass("btn-success");
        likelihood_btn.text("Likely");
    }

    if (likelihood < 66 && likelihood >= 33){
        likelihood_btn.addClass("btn-primary");
        likelihood_btn.text("Maybe");
    }

    if (likelihood < 33 && likelihood >= 10){
        likelihood_btn.addClass("btn-warning");
        likelihood_btn.text("Unlikely");
    }

    if (likelihood < 10 && likelihood >= 0){
        likelihood_btn.addClass("btn-danger");
        likelihood_btn.text("Doomed");
    }

    likelihood_btn.attr("title","We think you will be able to select this room around " + likelihood + "% of the time. See FAQ page for more detail.");

    if(likelihood === -1){
        likelihood_btn.addClass("btn-secondary");
        likelihood_btn.text("N/A");
        likelihood_btn.attr("title","You are not in the same draw as this room. If you think this is in error, please contact ezlatin@princeton.edu");
    }


    return likelihood_btn.prop('outerHTML');
}

function redraw_table() {
    let table = $("#rooms_table").DataTable();
    table.clear();
    table.rows.add(rooms);
    table.draw();
}

function call_back_handler(row,room,index){
    add_favorite_event(row,room,index);
    add_modal(row,room,index);
    add_highlighting(row,room,index);
}

function add_favorite_event(row, room, index) {
    row = $(row);
    star_div = $(row).find('.Star_img');

    star_div.click(function () {
        // console.log('pizza');
        let star_div = $("#" + room.id + "star");

        console.log(star_div);
        if (room.favorited) {
            // console.log('love');
            room.favorited = false;

            un_favorite(room.id);
            star_div.attr("src", "/static/star.png");
        }
        else {
            room.favorited = true;
            favorite((room.id));
            star_div.attr("src", "/static/starfill.png");
        }
    });
}

let loading_modal = false;

function add_modal(row,room,index){
    row = $(row);
    let cells = row.find('td');
    let n = cells.length;
    cells.each(function(i,td) {
        td = $(td);
        if(i !== n - 1){ //6 is the final collumn
            td.click(function(){

                if(!global_in_intro && !loading_modal){
                    loading_modal = true;
                    $.get("/reviews", {roomid: room.id}, function (data) {
                        let modal = $(`
                        <div class="modal fade" tabindex="-1" role="dialog">
                            <div class="modal-dialog modal-lg" role="document">
                                <div class="modal-content">
                                    <div class="modal-body">
                                    
                                    </div>
                                </div>
                            </div>
                        </div>`);

                        let body = modal.find(".modal-body");

                        let card = get_big_card(room, data);
                        body.append(card);


                        modal.modal({
                            keyboard: true,
                            focus: true,
                            show: true,
                        });

                        loading_modal = false;
                    });
                }
            });
        }
    });
}

function add_highlighting(row,room,index){
    row = $(row);
    row.hover(
        function(){
            // console.log('hi');
            row.addClass("highlight");
        },
        function(){
            row.removeClass("highlight");
        }
    );
}

function headerCallback(thead,data,start,end,display){
    let tr = $(thead).find("th");
}
