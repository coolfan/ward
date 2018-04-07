function wrap_cards(cards){
    let html_wrapper = $(`
    <div class="card" style="width: 100%; margin-bottom: 5px">
        <div class="container-fluid" style="background-color: #f2f5ff">
            <div class="card-body fonted Cards_parent" style="padding: 10px;">
            </div>
        </div>
    </div>
`);

    let parent_div = $(html_wrapper).find(".Cards_parent");
    parent_div.empty();

    $.each(cards,function(i,card){
        parent_div.append(card);
    });

    return html_wrapper;
}