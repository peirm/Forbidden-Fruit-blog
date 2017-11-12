$(window).scroll(function(){
    var scrollTop = $(this).scrollTop();
    var scrollHeight = $(document).height();
    var windowHeight = $(this).height() + 459;
    // console.log(scrollTop)
    // console.log(scrollHeight)
    // console.log(windowHeight)
    var index = 0
    if(scrollTop + windowHeight >= scrollHeight){
        //当滚动到底部时,执行此代码框中的代码
        // alert("you are in the bottom");
        /*var page = $(this).html();
        console.log(page);*/
    }
});