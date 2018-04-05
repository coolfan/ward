function favorite(id) {
    console.log('hi');
    var elem = $("#" + id + "star");
    var filled = elem.attr("data-prefix") === "fas";
    if (filled) {
        elem.attr("data-prefix", "far");
    }
    else {
        elem.attr("data-prefix", "fas");
    }

}

$(document).ready(function () {
            $('#roomsTable').DataTable({
                pageResize: true,
                searching: false,
                lengthChange: true,
                "columns": [ //Don't allow them to order based on the favorite star
                    { "className": "dt-center", "orderable": false },
                    { "className": "dt-center"},
                    { "className": "dt-center"},
                    { "className": "dt-center"},
                    { "className": "dt-center"},
                    { "className": "dt-center"},
                    { "className": "dt-center", "width": "12%"},
                    { "className": "dt-center", "width": "12%"},
                    { "className": "dt-center", "width": "10%"
                ],
                colReorder: true,
                order: [[ 1, 'asc' ]]  //Starting order is collumn 1, which is college, in ascending order
            });
});
