function get_small_card(room){
    let html_card = $(`
    <div class = "row" style="font-size: 16pt">
        <div class = "col-sm-6 padding-0">
            <div class = "container-fluid padding-0">
                <div class = "row">
                    <div align="center" class = "col-sm-6 padding-0">
                        <p class="card-text Building">

                        </p>
                    </div>
                    <div class = "col-sm-3 padding-0">
                        <p class="card-text Floor">

                        </p>
                    </div>
                    <div class = "col-sm-3 padding-0">
                        <p class="card-text Sqft">
                            
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div class = "col-sm-6 padding-0">
            <div class = "container-fluid padding-0">
                <div class = "row">
                    <div class = "col-sm-3 padding-0">
                        <p class="card-text Occupancy">

                        </p>
                    </div>
                    <div class = "col-sm-3 padding-0">
                        <p class="card-text College">

                        </p>
                    </div>
                    
                    <div class = "col-sm-2 padding-0" style="padding-top: 0; padding-bottom: 0">
                        <button type="button" class="btn Likelihood" data-toggle="tooltip"></button>
                    </div>
                    
                    <!--<div align="center" class = "col-sm-2 padding-0 Stardiv">-->

                    <!--</div>-->
                    <div align="center" class = "col-sm-4">
                        <span class = "Stardiv padding-0">
                            <span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span>
                            <img id = "{{ room['id']}}star"
                                 class="Star_img"
                                 src = "/static/star.png"
                                 style="height: 37px;width: 37px;padding-top: 2px">
                        </span>
                             
                        <a class = "Down_anchor" data-toggle="collapse" href="">
                             <img id = "{{ room['id']}}down"
                             class = "Down_img"
                             src = "/static/down.png"
                             style="height: 37px;width: 37px;padding-top: 2px">
                        </a>
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
    `);

    let building_p = $(html_card).find(".Building");
    let floor_p = $(html_card).find(".Floor");
    let sqft_p = $(html_card).find(".Sqft");
    let occupancy_p = $(html_card).find(".Occupancy");
    let college_p = $(html_card).find(".College");
    let star_div = $(html_card).find(".Stardiv");
    let star_img  = $(html_card).find(".Star_img");
    let down_img  = $(html_card).find(".Down_img");
    let down_anchor  = $(html_card).find(".Down_anchor");
    let likelihood_span = $(html_card).find(".Likelihood");


    building_p.empty();
    building_p.text(room['building'] + " " + room['roomnum']);

    floor_p.empty();

    let suffix = "";

    switch(room['floor']){
        case "1":
            suffix = "st";
            break;
        case "2":
            suffix = "nd";
            break;
        case "3":
            suffix = "rd";
            break;
        default:
            suffix = "th";
    }

    // console.log(suffix);

    floor_p.text(room['floor'] + suffix + " Floor");

    sqft_p.empty();
    sqft_p.append(room['sqft'] + ` ft<sup>2</sup>`);

    occupancy_p.empty();
    let room_type = "";
    // console.log(typeof room['occupancy']);
    switch(room['occupancy']){
        case 1:
            room_type ="Single";
            break;
        case 2:
            room_type = "Double";
            break;
        case 3:
            room_type = "Triple";
            break;
        case 4:
            room_type = "Quad";
            break;
        case 5:
            room_type = "Quint";
            break;
        default:
            room_type = room['occupancy'] + " People";
    }

    //Display the apropriate amount of stick figures
    let stick_figure = (`<i class="fas fa-male fa-lg"></i>`);
    if (room['occupancy'] > 5){
        occupancy_p.append(stick_figure);
        occupancy_p.append(' x ' + room['occupancy'] +  '');
    }
    else {
        for (let i = 0; i < room['occupancy']; i++) {
            occupancy_p.append(stick_figure);
        }
    }

    //Display the colleges
    college_p.empty();
    college_p.text(room['college']);


    star_div.attr("is_favorited", room['favorited']);

    //Allow for favoriting by clicking on star
    star_div.click(function(){
        let favorited = 'true' === star_div.attr("is_favorited");
        console.log(typeof favorited);
        console.log(!favorited);

        if (favorited){
            un_favorite((room['id']));
        }
        else{
            favorite((room['id']));
        }

        star_div.attr("is_favorited",!favorited);
    });

    //Color in star if already favorited
    let favorited = 'true' === star_div.attr("is_favorited");

    if(favorited)
        star_img.attr("src", "/static/starfill.png");


    star_img.attr('id',room['id']+ 'star');
    down_img.attr('id',room['id']+ 'down');


    down_anchor.attr('href','#' + room['id'] + 'medium_card');
    down_anchor.click(function(){
        load_reviews(room['id']); //Currently not implemented
    });


    let likelihood = room['likelihood'];
    likelihood = 66;

    if (likelihood <= 100 && likelihood >= 66){
        likelihood_span.addClass("btn-success");
        likelihood_span.text("Likely");
    }

    if (likelihood < 66 && likelihood >= 33){
        likelihood_span.addClass("btn-primary");
        likelihood_span.text("Maybe");
    }

    if (likelihood < 33 && likelihood >= 10){
        likelihood_span.addClass("btn-warning");
        likelihood_span.text("Unlikely");
    }

    if (likelihood < 10 && likelihood >= 0){
        likelihood_span.addClass("btn-danger");
        likelihood_span.text("Doomed");
    }

    likelihood_span.attr("title","We think you will get this room around " + likelihood + "% of the time. ");


    return html_card;
}

function favorite_star(){
    let favorited = 'true' === star_div.attr("is_favorited");
    console.log(typeof favorited);
    console.log(!favorited);

    if (favorited){
        un_favorite((room['id']));
    }
    else{
        favorite((room['id']));
    }

    star_div.attr("is_favorited",!favorited);
}
