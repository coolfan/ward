//This code is to prevent the popup from reapearing if you navigate back. Hmm... prob won't work
let global_dismissed_search_popup = false;
let global_dismissed_about_popup = false;

$(document).ready(function(){
    let search_popup_dismiss = $("#search_popup_dismiss");
    let about_popup_dismiss = $("#about_popup_dismiss")
    let search_popup = $("#search_popup");
    let about_popup = $("#about_popup");

    search_popup_dismiss.click(function(){
        Cookies.set('dismissed_search_popup', 'true', { expires: 7 }); //Expires in 7 days
    });

    about_popup_dismiss.click(function(){
        Cookies.set('dismissed_about_popup', 'true', { expires: 7 }); //Expires in 7 days
    });

    if(Cookies.get('dismissed_search_popup') !== 'true'){
        search_popup.show();
    }

    if(Cookies.get('dismissed_about_popup') !== 'true'){
        about_popup.show();
    }

});

let global_in_intro = false;

$(document).ready(function(){
    $("#guide_btn").click(function(){
        var intro = introJs();
        intro.oncomplete(function(){
           global_in_intro = false;
        });
        intro.onexit(function(){
            // alert("hi");
            global_in_intro = false;
        });

        global_in_intro = true;

        intro.setOption('doneLabel', 'Next page').start().oncomplete(function() {
          window.location.href = 'favorites_page?multipage=true';
        });
    })
});