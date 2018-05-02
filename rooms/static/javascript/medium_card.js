function get_medium_card(room){
    let small_card = get_small_card(room);

    let html_card = $(`
    <div class = "">
        <div class = "collapse row Medium_collapse">
            <div class = "col-sm-12">
                <div class = "container-fluid">
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
                    
                    <div class = "row Reviews_table">
                        <table class="table table-dark">
                      
                        <tbody>
                            <tr>
                                <th scope="row">1</th>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                        </tbody>
                        </table>
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

    let ans = medium_collapse_div.attr('id', room['id'] + 'medium_card');
    let div_again = $('#' + room['id'] + 'medium_card');

    return [small_card,html_card];
}   

function load_reviews(roomid) {
	let reviews_table = $("#" + roomid + "card").find(".Reviews_table");
	$.get("/reviews", {roomid: roomid}, function(data) {
		reviews_table.empty()
		reviews_table.append(get_reviews_card(data))
	})
}
