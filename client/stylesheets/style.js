window.smoothScroll = function(target) {

    var scrollContainer = target;
    do { //find scroll container
        scrollContainer = scrollContainer.parentNode;
        if (!scrollContainer) return;
        scrollContainer.scrollTop += 1;
    } while (scrollContainer.scrollTop == 0);

    var targetY = 0;
    do { //find the top of target relatively to the container
        if (target == scrollContainer) break;
        targetY += target.offsetTop;
    } while (target = target.offsetParent);

    scroll = function(c, a, b, i,N) {
        i++; 
        if (i > N) return;
        c.scrollTop = a + (b - a) / N * i;
        if (i < 3) setTimeout(function(){ scroll(c, a, b, i,N); }, 60);
        else setTimeout(function(){ scroll(c, a, b, i,N); }, 15);
    }
    // start scrolling
    scroll(scrollContainer, scrollContainer.scrollTop, targetY, 0,20);
}

$(window).bind('scroll', function() {
            if(($(window).scrollTop() >= $('#home').offset().top + $('#home').outerHeight() - (window.innerHeight+100))) {
                document.getElementById('btn3').disabled = true;
                document.getElementById('btn1').disabled = false;
                document.getElementById('btn2').disabled = false;
            }
            if(($(window).scrollTop() >= $('#analyzer').offset().top + $('#analyzer').outerHeight() - (window.innerHeight+100))) {
                document.getElementById('btn2').disabled = true;
                document.getElementById('btn1').disabled = false;
                document.getElementById('btn3').disabled = false;
            }
             if(($(window).scrollTop() >= $('#input').offset().top + $('#input').outerHeight() - (window.innerHeight+100))) {
                document.getElementById('btn1').disabled = true;
                document.getElementById('btn2').disabled = false;
                document.getElementById('btn3').disabled = false;
            }
});
