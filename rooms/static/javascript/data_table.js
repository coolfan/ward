$(document).ready(function () {
    $('#rooms_table').DataTable({
        createdRow: add_favorite_event,
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
                render: render_favorite, orderable: false
            },
        ],
        searching: false,
        // colReorder: true,
        lengthChange: true,
        pageResize: true
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

    if (type === "display") {
        let star_div = $(`
                      <span class = "Stardiv padding-0">
                            <span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span>
                            <img id = "{{ room['id']}}star"
                                 class="Star_img"
                                 src = "/static/star.png"
                                 style="height: 37px;width: 37px;padding-top: 2px">
                      </span>`);

        if (room.favorited) {
            star_div.attr("src", "/static/star_fill.png");
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
                return "First";
            // break;
            case "2":
                return "Second";
            // break;
            case "3":
                return "Third";
            case "4":
                return "Fourth";
            case "5":
                return "Fifth";
            case "6":
                return "Sixth";
            case "7":
                return "Seventh";
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

    return room.college;
}

function render_likelihood(data, type, room) {
    if (room === undefined) {
        console.log('null');
        return null;
    }
    let likelihood_btn = $(`<button type="button" class="btn Likelihood" data-toggle="tooltip"></button>`);
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

    likelihood_btn.attr("title","We think you will get this room around " + likelihood + "% of the time. ");
    return likelihood_btn.prop('outerHTML');
}

function redraw_table() {
    let table = $("#rooms_table").DataTable();
    table.clear();
    table.rows.add(rooms);
    table.draw();
}

function add_favorite_event(row, room, index) {
    // console.log(row);
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