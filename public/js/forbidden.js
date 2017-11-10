$(function(){
    // 导航栏的Forbidden Fruit设置效果
    $('.navbar-brand').mousemove(function(){
        $(this).css({
            color:'lightblue',
            fontSize:'35px',
            transition:'all 1s ease'
        })
    }).mouseout(function(){
        $(this).css({
            color:'',
            fontSize:'',
            transition:'all 1s ease'
        })
    })
    // 导航栏的标头特效
    $('#navbar-biaotou a').mousemove(function(){
        $(this).css({
            color:'red',
            marginTop:'-5px',
            transition:'all 0.5s ease',
        })
    }).mouseout(function(){
        $(this).css({
            color:'',
            marginTop:'',
            transition:'all 0.5s ease'
        })
    })

    $('#navbar-daohang #blank_aone').mousemove(function(){
        $('#blanks').css({marginRight:'240px',transition:'all 0.8s ease'})
    }).mouseout(function(){
        $('#blanks').css({marginRight:'',transition:'all 0.8s ease'})
    })
    $('#navbar-daohang #blank_atwo').mousemove(function(){
        $('#blanks').css({marginRight:'120px',transition:'all 0.8s ease'})
    }).mouseout(function(){
        $('#blanks').css({marginRight:'',transition:'all 0.8s ease'})
    })

    $('#login').mousemove(function(){
        $('#blank_login').show()
    }).mouseout(function(){
        $('#blank_login').hide()
    })
    $('#reg').mousemove(function(){
        $('#blank_reg').show()
    }).mouseout(function(){
        $('#blank_reg').hide()
    })
    // 返回顶部
    $("#Backtop").css({position:'fixed',bottom:'120px',right:'40px'}).hide();
    $(window).scroll(function(){
        if($(window).scrollTop() > 80) {
            $('#Backtop').fadeIn()
        }else{
            $('#Backtop').fadeOut()
        }
    });
    $('#Backtop').click(function(){
        $("html,body").animate({scrollTop:0},500);
        $('#Backtop').css({position:'fixed',bottom:'900px',transition:'all 0.5s ease'})
        setTimeout(function(){
            $("#Backtop").css({position:'fixed',bottom:'120px',right:'40px'}).hide();
        },900)
    })
})