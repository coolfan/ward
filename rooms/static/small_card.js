function get_small_card(room){
    var html_card = $(`
    <div class = "row">
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
                        <p class="card-text Numrooms">

                        </p>
                    </div>
                    <div class = "col-sm-3 padding-0">
                        <p class="card-text College">

                        </p>
                    </div>
                    <div align="center" class = "col-sm-2 padding-0 Stardiv">
                        <img id = "{{ room['id']}}star"
                             class="Star_img"
                             src = "/static/star.png"
                             style="height: 37px;width: 37px;padding-top: 2px">
                    </div>
                    <div align="center" class = "col-sm-4">
                        <a class = "Down_anchor" data-toggle="collapse" href="">
                             <img id = "{{ room['id']}}down"
                             class = "Down_img"
                             src = "/static/down.png"
                             style="height: 37px;width: 37px;padding-top: 2px">
                        </a>
                            
                        <!--<a class = "Double_down_anchor" data-toggle="collapse" href="">-->
                            <!--<img id = "{{ room['id']}}doubledown" -->
                                 <!--class = "Double_down_img"-->
                                 <!--src = "/static/doubledown.png"-->
                                 <!--style="height: 37px;width: 37px;padding-top: 2px">-->
                         <!--</a>-->
                    </div>
                </div>
            </div>
        </div>
    </div>
    `);

    let building_p = $(html_card).find(".Building");
    let floor_p = $(html_card).find(".Floor");
    let sqft_p = $(html_card).find(".Sqft");
    let numrooms_p = $(html_card).find(".Numrooms");
    let college_p = $(html_card).find(".College");
    let star_div = $(html_card).find(".Stardiv");
    let star_img  = $(html_card).find(".Star_img");
    let down_img  = $(html_card).find(".Down_img");
    let double_down_img  = $(html_card).find(".Double_down_img");
    let down_anchor  = $(html_card).find(".Down_anchor");
    // let double_down_anchor  = $(html_card).find(".Double_down_anchor");

    building_p.empty();
    building_p.text(room['building'] + " " + room['roomnum']);

    floor_p.empty();
    floor_p.text(room['floor'] + "th Floor");

    sqft_p.empty();
    sqft_p.append(room['sqft'] + `<sup>2</sup>`);

    numrooms_p.empty();
    numrooms_p.text(room['numrooms'] + " Rooms");

    college_p.empty();
    college_p.text(room['college']);

    star_div.click(function(){
        favorite((room['id']));
    });

    star_img.attr('id',room['id']+ 'star');
    down_img.attr('id',room['id']+ 'down');
    double_down_img.attr('id',room['id']+ 'doubledown');

    down_anchor.attr('href','#' + room['id'] + 'medium_card');
    // double_down_anchor.attr('href','#' + room['id'] + 'big_card');

    // sqft_p.attr('id','pizza');
    return html_card;
}

