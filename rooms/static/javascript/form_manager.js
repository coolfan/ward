function setup_form(){
    $("#search_form").submit(function(e){
        e.preventDefault();

        let draw = $("#draw_type_select").val();
        let subfree = $("#check_subfree").val();

        let object = {
            college:draw
        };
        $.get("/query",object,function(data){
            rooms = data;
            display_rooms();
        })
    };

    $("#draw_type_select").click(function() {
        if ($("#draw_type_select").val() !== "") {
            $("#draw_type_fake_option").remove();
        }
    });

}