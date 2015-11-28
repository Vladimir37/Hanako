$(document).ready(function() {
    //variables
    var quote_posts = {};
    var post_submit_reaction = [
        'Message sent successfully',
        'Captcha incorrect',
        'The message contains a word from the spam list',
        'You are banned',
        'Thread is closed',
        'The thread does not exist',
        'Server error',
        'Image too large',
        'Incorrect file type',
        'Need a image',
        'You write too fast'
    ];
    //toaster options
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "300",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };
    //captcha reload
    function captcha_reload() {
        $.ajax({
            url: '/testing/new',
            type: 'post',
            dataType: 'text',
            success: function (key) {
                $("img[alt='captcha']").attr({src: '/testing?key=' + key});
                $("input[name='c_key']").val(key);
                $("input[name='c_value']").val('');
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
    $('section.content').on('click', 'a.id', function() {
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
    $('section.content').on('click', '.picture_open', function() {
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
    //delete style obj
    var delete_style = {
        left: 'inherit',
        right: 'inherit',
        top: 'inherit',
        bottom: 'inherit'
    };
    //creating float quote post
    $('section.content').on('mouseover', 'a.post_link', function(event) {
        var post_num = $(this).data('link');
        if(!$('article[data-link="' + post_num + '"]').length) {
            var params = position_detect_obj(event);
            $('<article class="post_quote" data-link="' + post_num + '">Loading post...</article>')
                .appendTo('section.content')
                .css(params.param_1, params.val_1)
                .css(params.param_2, params.val_2);
            quote_post_login(post_num);
        }
        else {
            var params = position_detect_obj(event);
            $('article[data-link="' + post_num + '"]')
                .css(delete_style)
                .css(params.param_1, params.val_1)
                .css(params.param_2, params.val_2)
                .show();
        }
    });
    //position detect
    function position_detect_obj(event) {
        var pos = position_detect(event);
        var param_1, val_1, param_2, val_2;
        if (pos.p_win.x < pos.size_win.width - pos.p_win.x) {
            param_1 = 'left';
            val_1 = pos.p_win.x;
        }
        else {
            param_1 = 'right';
            val_1 = pos.size_win.width - pos.p_win.x;
        }
        if (pos.p_win.y < pos.size_win.height - pos.p_win.y) {
            param_2 = 'top';
            val_2 = pos.p_doc.y;
        }
        else {
            param_2 = 'bottom';
            val_2 = pos.size_doc.height - pos.p_doc.y;
        }
        return {
            param_1: param_1,
            val_1: val_1,
            param_2: param_2,
            val_2: val_2
        };
    };
    $('section.content').on('mouseout', 'a.post_link', function() {
        var post_num = $(this).data('link');
        quote_posts[post_num] = setTimeout(hidden_quote(post_num), 2000);
    });
    //hidding quote post
    function hidden_quote(post_num) {
        return function() {
            $('article[data-link="' + post_num + '"]').hide();
        }
    };
    //do not hide hover post
    $('section.content').on('mouseover', 'article.post_quote', function() {
        var post_num = $(this).data('link');
        clearTimeout(quote_posts[post_num]);
    });
    $('section.content').on('mouseout', 'article.post_quote',function() {
        var post_num = $(this).data('link');
        quote_posts[post_num] = setTimeout(hidden_quote(post_num), 2000);
    });
    //loading quote post
    function quote_post_login(num) {
        if($('article.post, article.op_post').is('[data-num="' + num + '"]')) {
            //in page
            function need_post(text) {
                return $('article[data-num="' + num + '"] ' + text).html();
            };
            function need_post_attr(text, atr) {
                return $('article[data-num="' + num + '"] ' + text).attr(atr);
            };
            var quote_pict = '';
            if($('article[data-num="' + num + '"] figure.post_image').length) {
                quote_pict = '<figure class="post_image">' +
                    '<a href="' + need_post_attr('figure.post_image a[target="_blank"]', 'href') + '" target="_blank">Open full image</a>' +
                    '<a class="picture_open" href="#picture" data-addr="' + need_post_attr('figure.post_image a[href="#picture"]', 'data-addr') + '">' +
                    '<br>' +
                    '<img alt="small-image" src="' + need_post_attr('figure.post_image img', 'src') + '">' +
                    '</a>' +
                    '</figure>';
            }
            $('article.post_quote[data-link="' + num + '"]').html(
                '<article class="post_data">' +
                '<span class="title">' + need_post('article.post_data span.title') + '</span>' +
                '<span class="name">' + need_post('article.post_data span.name') + '</span>' +
                '<span class="trip">' + need_post('article.post_data span.trip') + '</span>' +
                '<span class="date">' + need_post('article.post_data span.date') + '</span>' +
                '<a class="id" data-board="' + need_post_attr('a.id', 'data-board') + '" data-thread="' + need_post_attr('a.id', 'data-thread') + '">' +
                need_post('a.id') +
                '</a>' +
                '</article>' +
                quote_pict +
                '<article class="post_text">' + need_post('article.post_text') + '</article>' +
                '<article class="clearfix"></article>'
            );
        }
        else {
            //ajax query
            var board = document.location.pathname.split('/')[1];
            var data = {
                board: board,
                num: num
            };
            $.get('/api/post', data, function(result) {
                var post = JSON.parse(result);
                if(post.status == 0) {
                    var quote_pict = '';
                    if(post.body.image) {
                        var thread = post.body.thread || post.body.id;
                        quote_pict = '<figure class="post_image">' +
                            '<a href="/src/img/trd/' + board + '/' + thread + '/' + post.body.id + '.' + post.body.image + '" target="_blank">Open full image</a>' +
                            '<a class="picture_open" href="#picture" data-addr="' + board + '/' + thread + '/' + post.body.id + '.' + post.body.image + '">' +
                            '<br>' +
                            '<img alt="small-image" src="/small/' + board + '/' + thread + '/' + post.body.id + '.' + post.body.image + '?tn=200">' +
                            '</a>' +
                            '</figure>';
                    }
                    $('article.post_quote[data-link="' + num + '"]').html(
                        '<article class="post_data">' +
                        '<span class="title">' + post.body.title + '</span>' +
                        '<span class="name">' + post.body.name + '</span>' +
                        '<span class="trip">' + post.body.trip + '</span>' +
                        '<span class="date">' + post.body.createdAt.toLocaleString() + '</span>' +
                        '<a class="id" data-board="' + board + '" data-thread="' + thread + '">#' +
                        post.body.id +
                        '</a>' +
                        '</article>' +
                        quote_pict +
                        '<article class="post_text">' + post.body.text + '</article>' +
                        '<article class="clearfix"></article>'
                    );
                }
                else {
                    $('article.post_quote[data-link="' + num + '"]').html('Post not found');
                }
            });
        }
    };
    //submit any form
    $('.submit_but').click(function() {
        var need_form = $(this).parent('form');
        var addr = need_form.attr('action') || document.location.pathname;
        var formData = new FormData(need_form.get(0));
        if(!need_form.find('[name="c_value"]').val()){
            toastr["success"]("Enter the number from the image!");
        }
        else {
            $.ajax({
                url: addr,
                processData: false,
                contentType: false,
                type: 'POST',
                data: formData,
                success: function(status){
                    toastr["success"](post_submit_reaction[status]);
                    if(status == 0 && document.location.pathname.indexOf('trd') == -1) {
                        document.location.pathname = addr;
                    }
                    captcha_reload();
                },
                error: function() {
                    toastr["success"](post_submit_reaction[6]);
                    captcha_reload();
                }
            });
        }
    });
    //submiting form
    $('[name="c_value"]').keypress(function(event) {
        var keyCode = event.keyCode || event.charCode;
        if(keyCode == 13) {
            var form = $(this).parents('form');
            form.find('input[type="button"]').click();
        }
    });
});