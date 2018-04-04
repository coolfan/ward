function favorite(id) {
    var elem = $("#" + id);
    var filled = elem.attr("data-prefix") === "fas";
    if (filled) elem.attr("data-prefix", "far");
    else elem.attr("data-prefix", "fas");
}

$(document).ready(function () {
            $('#roomsTable').DataTable({
                pageResize: true,
                searching: false,
                colReorder: true,
				lengthChange: true
            });
});
