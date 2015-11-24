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
        $('.floating_form').show();
        var board = $(this).data('board');
        var thread = $(this).data('thread');
        $('.floating_form_main form').attr('action', '/' + board + '/' + 'trd' + '/' + thread);
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
    //floating posting window
    $('.floating_form').draggable({containment: 'window', handle: '.floating_form_panel'});
    $('img#close_floating_form').click(function() {
        $('.floating_form').hide();
    });
    //modal ban window
    $('[data-remodal-id="ban"]').remodal();
    $('a.ban_button').click(function() {
        $('#thread_ban').val($(this).data('post'));
        return true;
    });
    //cursor position
    function position_detect(event) {
        var result = {};
        result.size_win = {
            width: $(window).width(),
            height: $(window).height()
        };
        result.size_doc = {
            width: $(document).width(),
            height: $(document).height()
        };
        result.p_doc = {
            x: event.pageX,
            y: event.pageY
        };
        result.p_win = {
            x: event.clientX,
            y: event.clientY
        };
        return result;
    };
    //creating float quote post
    $('a.post_link').hover(function(event) {
        var pos = position_detect(event);
        var param_1, val_1, param_2, val_2;
        if(pos.p_win.x < pos.size_win.width - pos.p_win.x) {
            param_1 = 'left';
            val_1 = pos.p_win.x;
        }
        else {
            param_1 = 'right';
            val_1 = pos.size_win.width - pos.p_win.x;
        }
        if(pos.p_win.y < pos.size_win.height - pos.p_win.y) {
            param_2 = 'top';
            val_2 = pos.p_doc.y;
        }
        else {
            param_2 = 'bottom';
            val_2 = pos.size_doc.height - pos.p_doc.y;
        }
        $('<article class="post_quote">TEST</article>')
            .appendTo('section.content')
            .css(param_1, val_1)
            .css(param_2, val_2);
    }, function() {
        //
    });
});