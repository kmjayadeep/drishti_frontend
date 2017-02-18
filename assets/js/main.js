$(document).ready(function() {
    $('#preloader').addClass('hide')
    //TOOD remove after testing
    setTimeout(function() {
        $('#preloader').hide();
    }, 2000)
    $('#new-drishti-container').particleground({
        lineColor: '#3b3e42',
        // lineColor: '#40423f',
        particleRadius: 3
    })
});
