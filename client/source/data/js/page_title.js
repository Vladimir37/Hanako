$(document).ready(function() {
    var path = document.location.pathname;
    var is_thread = path.indexOf('trd') != -1;
    var board = $('.board_name').text().slice(0, 3);
    var full_title = $('.board_name').text();
    if(is_thread) {
        var main_title = $('.op_post .post_data .title').text();
        if(main_title) {
            full_title = board + ' — ' + main_title;
        }
    }
    $('head title').text(full_title);
});