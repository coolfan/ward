function get_big_card(room){
    let medium_card = get_medium_card(room);
    let small_card = medium_card[0];
    medium_card = medium_card[1];

    let html_card = $(`
    <div>
        <div class = "collapse row Big_collapse">
            <div class = "col-sm-12 padding-0">
                <div class = "container-fluid padding-0">
                    <p>hi</p>
                <\div>
            <\div>
        <\div>
    </div>
    `);

    let big_collapse_div = $(html_card).find(".Big_collapse");

    big_collapse_div.attr('id', room['id'] + 'big_card');
    return [small_card,medium_card,html_card];
}
