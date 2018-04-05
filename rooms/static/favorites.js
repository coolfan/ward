function favorite(id) {
    var elem = $("#" + id + "star");
    // console.log(elem.attr("src"));
    var empty = elem.attr("src") === "/static/star.png";
    if (empty) {
        elem.attr("src", "/static/starfill.png");
    }
    else {
        elem.attr("src", "/static/star.png");
    }
    $.ajax({url:"favorites/"})
}

$(document).ready(function () {
            $('#roomsTable').DataTable({
                pageResize: true,
                searching: false,
                lengthChange: true,
                responsive: true,
                "columns": [ //Don't allow them to order based on the favorite star
                    { "className": "dt-center", "orderable": false },
                    { "className": "dt-center"},
                    { "className": "dt-center"},
                    { "className": "dt-center"},
                    { "className": "dt-center"},
                    { "className": "dt-center"},
                    { "className": "dt-center", "width": "12%"},
                    { "className": "dt-center", "width": "12%"},
                    // { "className": "dt-center", "width": "10%"}
                ],
                colReorder: true,
                order: [[ 1, 'asc' ]]  //Starting order is collumn 1, which is college, in ascending order
            });
});
