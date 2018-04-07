function get_medium_card(room){
    var small_card = get_small_card(room);

    var html_card = $(`
    <div class = "">
        <div class = "collapse row Medium_collapse">
            <div class = "col-sm-12 padding-0">
                <div class = "container-fluid padding-0">
                    <div class = "row">
                        <div align="center" class = "col-sm-6 padding-0 Subfree">
                            <p class="card-text">
                            
                            </p>
                        </div>
                        <div class = "col-sm-6 padding-0">
                            <p class="card-text Occupancy">
                            
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`);

    let subfree_p = $(html_card).find(".Subfree");
    let occupancy_p = $(html_card).find(".Occupancy");
    let medium_collapse_div = $(html_card).find(".Medium_collapse");

    subfree_p.empty();
    subfree_p.text(room['subfree'] ? "Subfree" : "");

    occupancy_p.empty();
    occupancy_p.text([room['occupancy'] + " people"]);

    // medium_collapse_div.text('CHICKEN');
    // medium_collapse_div.
    // medium_collapse_div
    // console.log(medium_collapse_div);
    console.log(room['id'] + 'medium_card');
    let ans = medium_collapse_div.attr('id', room['id'] + 'medium_card');
    let div_again = $('#' + room['id'] + 'medium_card');
    // console.log(ans);
    // console.log(div_again);
    // console.log(medium_collapse_div);

    // subfree_p.attr('pizza','hi');

    return [small_card,html_card];
}   
