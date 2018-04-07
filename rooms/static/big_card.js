function get_big_card(){
    let medium_card = get_medium_card();
    let small_card = medium_card[0];
    medium_card = medium_card[1];

    let html_card = $(`
        <div class = "collapse row Big_collapse">
            <div class = "col-sm-12 padding-0">
                <div class = "container-fluid padding-0">
                <\div>
            <\div>
        <\div>
    `);


    return [small_card,medium_card,html_card];
}
