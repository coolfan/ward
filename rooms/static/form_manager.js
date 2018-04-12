function setup_form(){
    $("#search_form").submit(function(e){
        e.preventDefault()
        let draw = $("#search_box").val();
        let object = {
            college:draw
        }
        $.get("/query",object,function(data){
            rooms = data;
            display_rooms();
        })
    })
}