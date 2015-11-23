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
    //posting - answer
    $('a.id').click(function() {
        $('textarea#post_area').val($('textarea#post_area').val() + '>>' + $(this).text().slice(1));
        var quote_text;
        //select quote text
        if (window.getSelection) {
            quote_text = window.getSelection().toString();
        }
        else if (document.selection && document.selection.type != "Control") {
            quote_text = document.selection.createRange().text;
        }
        if(quote_text) {
            quote_text = quote_text.replace(/\n/g, '\n>');
            $('textarea#post_area').val($('textarea#post_area').val() + '\n>' + quote_text);
        }
        return false;
    });
    //sinchroniztion
    $('textarea#post_area').change(function() {
        $('textarea#post_area').val($(this).val());
    });
    $('input[name="title"]').change(function() {
        $('input[name="title"]').val($(this).val());
    });
    $('input[name="name"]').change(function() {
        $('input[name="name"]').val($(this).val());
    });
    $('input[name="sage"]').change(function() {
        $('input[name="sage"]').prop('checked', $(this).prop('checked'));
    });
    //modal window with picture
    $('[data-remodal-id="picture"]').remodal();
    $('.picture_open').click(function() {
        $('img#full_picture').attr('src', '/src/img/trd/' + $(this).data('addr'));
        return true;
    });
});