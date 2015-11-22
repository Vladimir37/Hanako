$(document).ready(function() {
    //captcha reload
    function captcha_reload() {
        $.ajax({
            url: '/testing/new',
            type: 'post',
            dataType: 'text',
            success: function (key) {
                $("img[alt='captcha']").attr({src: '/testing?key=' + key});
                $("input[name='c_key']").val(key);
            },
            error: function (err) {
                //console.log(err);
            }
        });
    };
    //first load
    if(Boolean($('img[alt="captcha"]').length)) {
        captcha_reload();
    };
    //reload
    $('img[alt="captcha"]').click(function() {
        captcha_reload();
    });
    //admin menu
    $('img#admin_list').click(function() {
        $(this).parent().prev('.admin_action').slideToggle();
    });
    //close/open posting form
    $('.posting_form_open').click(function() {
        $(this).text() == 'Open posting form' ? $(this).text('Close posting form') : $(this).text('Open posting form');
        $(this).next('.posting_form').slideToggle();
    });
});