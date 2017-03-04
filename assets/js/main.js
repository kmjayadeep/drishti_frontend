$(document).ready(function() {
    window.isDebug = true;
    window.serverUrl = 'http://server.drishticet.org/'
    hideLoading()
    initializeParticles()
    initializeFunction()
    setupNavigation()

    if (!window.isDebug && $(window).width() >= 640) {
        $('#dexter').show()
        $('#old-drishti-container').show()
        setTimeout(function() {
            window.scrollTo(0, 0)
            $("body").css("overflow-y", "hidden");
        }, 100)
        setTimeout(function() {
            $('#old-drishti-container').slideUp()
            $("body").css("overflow-y", "scroll");
            $('#onepage').onepage_scroll({
                sectionContainer: ".section",
                loop: false
            })
            setTimeout(function() {
                $('#dexter').fadeOut()
            }, 1000)
        }, 9000)
    } else {
        $('#onepage').onepage_scroll({
            sectionContainer: ".section",
            loop: false
        })
    }
});

function showLoading() {
    $('#preloader').removeClass('hide')
    $('#preloader').show()
}

function showError(message) {
    $('.alert-modal .alert').html(message)
    $('.alert-modal').show()
    setTimeout(function() {
        $('.alert-modal').fadeOut()
    }, 2000)
}

function hideLoading() {
    $('#preloader').addClass('hide')
    setTimeout(function() {
        if (isDebug)
            $('#preloader').hide();
    }, 2000)
}

function initializeFunction() {
    initFirebase()
    getColleges()
    getEvents()
    setupEvents();
    setupWorkshops();
}

function getColleges(cb) {
    if (typeof window.colleges == 'object' && typeof cb == 'function')
        return cb(null, window.colleges)
    $.get(window.serverUrl + 'public/college', function(data, status) {
        if (status == 'success') {
            window.colleges = data;
            if (typeof cb == 'function')
                cb(null, data)
        } else if (typeof cb == 'function')
            cb('Network error')
    })
}

function getEvents(cb) {
    if (typeof window.allEvents == 'object' && typeof cb == 'function')
        return cb(null, window.allEvents)
    $.get(window.serverUrl + 'public/event', function(data, status) {
        if (status == 'success') {
            window.allEvents = data;
            if (typeof cb == 'function')
                cb(null, data)
        } else if (typeof cb == 'function')
            cb('Network error')
    })
}

function getEventsByCategory(cat, cb) {
    getEvents(function(err, events) {
        if (err)
            return cb(err)
        var catEvents = events.filter(function(event) {
            return event.category == cat && !event.isWorkshop
        })
        cb(null, catEvents)
    })
}

function getWorkshops(cb) {
    getEvents(function(err, events) {
        if (err)
            return cb(err)
        var workshops = events.filter(function(event) {
            if (window.isDebug)
                return event.category == 'ME'
            return event.isWorkshop
        })
        cb(null, workshops)
    })
}

function setupEvents() {
    $('.slide').click(loadEvents);

    function loadEvents(event) {
        event.preventDefault();
        $('.events-bg').hide()
        var category = $(this).children().data('category')
        console.log(category)
        showLoading()
        getEventsByCategory(category, function(err, events) {
            hideLoading()
            if (err) {
                showError('Unable to load events')
                return;
            }
            console.log(events)
            var tmpl = $.templates("#eventsTemplate");
            var grid = tmpl.render({
                events: events
            })
            $('.events-grid').html(grid)
            new grid3D(document.getElementById('grid3d'));
        })
    }
}

function setupWorkshops() {
    getWorkshops(function(err, workshops) {
        if (err)
            return setupWorkshops()
        console.log(workshops)
        var tmpl = $.templates("#workshopTemplate");
        var grid = tmpl.render(workshops)
        $('.workshop-grid').html(grid)
    })
}

function initializeParticles() {
    particlesJS('new-drishti-container', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ffffff"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 3,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": false
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 400,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true,
        "config_demo": {
            "hide_card": false,
            "background_color": "#b61924",
            "background_image": "",
            "background_position": "50% 50%",
            "background_repeat": "no-repeat",
            "background_size": "cover"
        }
    });
}

function setupNavigation() {
    var button = $('#cn-button'),
        wrapper = $('#cn-wrapper'),
        overlay = $('#cn-overlay');

    //open and close menu when the button is clicked
    var open = false;
    button.click(handler);
    wrapper.click(cnhandle);

    function cnhandle(e) {
        e.stopPropagation();
    }

    function handler(e) {
        if (!e) var e = window.event;
        e.stopPropagation(); //so that it doesn't trigger click event on document
        if (!open) {
            openNav();
        } else {
            closeNav();
        }
    }

    function openNav() {
        open = true;
        button.html('-')
        overlay.addClass('on-overlay')
        wrapper.addClass('opened-nav')
    }

    function closeNav() {
        open = false;
        button.html('+');
        overlay.removeClass('on-overlay')
        wrapper.removeClass('opened-nav')
    }
    document.addEventListener('click', closeNav);
}


function initFirebase() {
    var config = {
        apiKey: 'AIzaSyCvN9K2cdfUf4H8BIr8vqRhdtGV_ca2UIs',
        authDomain: 'drishti-bd782.firebaseapp.com',
        databaseURL: 'https://drishti-bd782.firebaseio.com',
        storageBucket: 'drishti-bd782.appspot.com',
        messagingSenderId: '37494669483',
    };
    firebase.initializeApp(config);

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            user.getToken().then(function(accessToken) {
                console.log('got token')
                localStorage.accessToken = accessToken
                showLoading()
                $.post(window.serverUrl + 'student/login', {
                    idToken: accessToken
                }, function(data, status) {
                    if (status != 'success') {
                        hideLoading()
                        showError("Unable to login")
                        return;
                    }
                    console.log(data)
                    localStorage.user = JSON.stringify(data)
                    if (data.registered) {
                        hideLoading()
                        $('#login').hide()
                        $('#loggedIn').show()
                        $('.account-name').html(data.name)
                    } else {
                        getColleges(function(err, colleges) {
                            hideLoading()
                            if (err) {
                                return showError("Unable to get College list")
                            }
                            colleges.push({
                                id: 0,
                                name: 'Select College'
                            })
                            var tmpl = $.templates('<option value="{{:id}}">{{:name}}</option>');
                            var col = tmpl.render(colleges)
                            $('#inputcollege').html(col)
                            $('#inputcollege').val(0)
                            $('#registerModal').modal('show');
                        })
                    }
                })
            });
        } else {
            console.log('no user')
            $('#login').show()
            $('#loggedIn').hide()
        }
    }, function(error) {
        console.log(error);
        $('#login').show()
        $('#loggedIn').hide()
    });

    $('.login-button').click(function() {
        var provider = $(this).data('provider')
        if (provider == 'google')
            var provider = new firebase.auth.GoogleAuthProvider();
        else
            var provider = new firebase.auth.FacebookAuthProvider();

        firebase.auth().signInWithPopup(provider)
    })
    $('.logout-button').click(function() {
        firebase.auth().signOut().then(function() {
            console.log('Signed Out');
        }, function(error) {
            console.error('Sign Out Error', error);
        });
    })

    $('.register-button').click(function() {
        var college = $('#inputcollege').val()
        var phone = $('#inputphone').val()
        var sexInput = $('.inputsex')
        var sex = sexInput[0].checked ? 'male' : 'female'
        var acco = $('#inputacco').is(':checked')
        if (acco)
            acco = sex
        else
            acco = 'none'
        var data = {
            phone: phone,
            collegeId: college,
            accomodation: acco
        }
        if (data.collegeId == '0')
            return showError("Please select college or choose <b>others</b> from the list")
        if (data.phone == "")
            return showError("Please enter Phone")
        console.log(data)
        showLoading()
        $.ajax({
            url: window.serverUrl + 'student/register',
            type: 'post',
            data: data,
            headers: {
                'x-auth-token': localStorage.accessToken
            },
            dataType: 'json',
            success: function(data) {
                console.log(data)
                hideLoading()
                var user = JSON.parse(localStorage.user)
                $('#login').hide()
                $('#loggedIn').show()
                $('.account-name').html(user.name)
                $('#registerModal').modal('hide')
            },
            error: function(data) {
                hideLoading()
                console.log(data)
                showError("Unable to register")
            }
        });
    })
}