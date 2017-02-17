$(document).ready(function() {
    $('#particle').particleground({
        maxSpeedX:0.1,
        maxSpeedY:0.1
    });
    $('#preloader').addClass('hide')
    //TOOD remove after testing
    setTimeout(function() {
        $('#preloader').hide();
    },2000)
});
