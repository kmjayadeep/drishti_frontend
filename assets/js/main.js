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
            // $('#onepage').onepage_scroll({
            //     sectionContainer: ".section",
            //     loop: false
            // })
            setTimeout(function() {
                $('#dexter').fadeOut()
            }, 1000)
        }, 9000)
    } else {
        // $('#onepage').onepage_scroll({
        //     sectionContainer: ".section",
        //     loop: false
        // })
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
    // setupEvents();
    // setupWorkshops();
    // eventSetup()
    initScroll()
}

function eventSetup() {
    getEvents(function(err, events) {
        console.log('unable to load events')
        if (err)
            return eventSetup()
        setupEvents();
        setupWorkshops();
    })
}

function initScroll() {
    return; //not working properly
    var lastScroll = 0
    var scrollEnabled = true
    var disableOnce = false
    var lastSection = 0
    $(window).scroll(scrollFunction)

    function scrollFunction() {
        if (!scrollEnabled) {
            return
        }
        var st = $(this).scrollTop();
        if (st > lastScroll)
            var scroll = 'down'
        else
            var scroll = 'up'
        console.log(scroll)
        console.log(lastScroll + ' ' + st)
        var sections = $('.section')
        lastScroll = st
        if (scroll == 'down') {
            lastSection++
        } else {
            lastSection--
        }
        if (lastSection < 0)
        // lastSection = sections.length-1
            lastSection = 0
        if (lastSection >= sections.length)
        // lastSection = 0
            lastSection = sections.length - 1
        gotoSection = lastSection
        console.log(gotoSection)
        var goto = $(sections[gotoSection]).offset().top
        var body = $("html, body");
        scrollEnabled = false
        lastScroll = goto
        $(window).off('scroll', scrollFunction)
        console.log('disabled')
        $("body").css("overflow-y", "hidden");
        body.stop().animate({ scrollTop: goto }, '1000', 'swing', function() {
            console.log("Finished animating");
            setTimeout(function() {
                    scrollEnabled = true
                    console.log('enabled')
                    $(window).scroll(scrollFunction)
                    $("body").css("overflow-y", "scroll");
                }, 100)
                // disableOnce = true
        });
        // $(window).scrollTop($($('.section')[3]).offset().top)
    }
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
    if (typeof window.allEvents == 'object') {
        if (typeof localStorage.accessToken == 'string')
            return getRegisteredEvents(cb)
        if (typeof cb == 'function')
            return cb(null, window.allEvents)
        else return
    }
    $.get(window.serverUrl + 'public/event', function(data, status) {
        if (status == 'success') {
            window.allEvents = data;
            console.log(allEvents)
            if (typeof localStorage.accessToken == 'undefined')
                if (typeof cb == 'function')
                    return cb(null, data)
                else return
            if (typeof localStorage.accessToken == 'string')
                getRegisteredEvents(cb)
        } else if (typeof cb == 'function')
            cb('Network error')
    })
}

function getRegisteredEvents(cb) {
    if (typeof window.registeredEvents == 'object')
        if (typeof cb == 'function')
            return cb(null, window.allEvents)
        else return
    $.ajax({
        url: window.serverUrl + 'student/event/',
        type: 'get',
        headers: {
            'x-auth-token': localStorage.accessToken
        },
        dataType: 'json',
        success: function(regEvents) {
            console.log('registered events')
            console.log(regEvents)
            window.registeredEvents = regEvents
            var ids = regEvents.map(function(reg) {
                return reg.id
            })
            window.allEvents = window.allEvents.map(function(event) {
                if (ids.indexOf(event.id) != -1)
                    event.registered = true
                else
                    event.registered = false
                return event
            })
            if (typeof cb == 'function')
                cb(null, window.allEvents)
        },
        error: function(error) {
            console.log(error)
            cb(error)
        }
    });
}

function getEventsByCategory(cat, cb) {
    getEvents(function(err, events) {
        if (err)
            return cb(err)
        var catEvents = events.filter(function(event) {
            return event.category == cat && !event.isWorkshop
        }).map(function(event) {
            event.totalPrize = event.prize1 + event.prize2 + event.prize3
            event.schedule = ''
            if (event.day >= 17)
                event.day -= 17
            if (event.day) {
                event.schedule += 'Day ' + event.day
                if (event.time)
                    event.schedule += ' ' + event.time
            }
            return event
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
    console.log('setting up events')
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

function registerEvent(eventId) {
    if (!localStorage.accessToken)
        return showError("Please login with facebook or google to register for event")

    getEvents(function(err, events) {
        var event = events.find(function(event) {
            return event.id == eventId
        })
        console.log(event)
        if (!event.group) {
            var data = {}
        } else {
            if(!$('#register-' + eventId + ' .event-group').is(':visible')){
                $('#register-' + eventId + ' .event-group').slideDown()
                return;
            }
            var data = {
                //fill here
            }
        }
        showLoading()
        $.ajax({
            url: window.serverUrl + 'student/event/' + eventId,
            type: 'put',
            data: data,
            headers: {
                'x-auth-token': localStorage.accessToken
            },
            dataType: 'json',
            success: function(data) {
                console.log(data)
                hideLoading()
                $('.event-group').hide()
                $('#register-' + eventId + ' button.btn-register').hide()
                $('#register-' + eventId + ' .registered').removeClass('hide')
                window.allEvents = window.allEvents.map(function(event) {
                    if (event.id == eventId)
                        event.registered = true
                })
            },
            error: function(data) {
                console.log(data)
                hideLoading()
                $('.event-group').hide()
                if (data.status == 401)
                    return showError("Please login with faceebook or google to register for event")
                showError("Unable to register for event")
            }
        });
    })
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
                        eventSetup()
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
            delete localStorage.accessToken
            $('#login').show()
            $('#loggedIn').hide()
            eventSetup()
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





/*about style*/
/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
;
(function(window) {

    'use strict';

    // Helper vars and functions.
    function extend(a, b) {
        for (var key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
        return a;
    }

    function createDOMEl(type, className, content) {
        var el = document.createElement(type);
        el.className = className || '';
        el.innerHTML = content || '';
        return el;
    }

    /**
     * RevealFx obj.
     */
    function RevealFx(el, options) {
        this.el = el;
        this.options = extend({}, this.options);
        extend(this.options, options);
        this._init();
    }

    /**
     * RevealFx options.
     */
    RevealFx.prototype.options = {
        // If true, then the content will be hidden until it´s "revealed".
        isContentHidden: true,
        // The animation/reveal settings. This can be set initially or passed when calling the reveal method.
        revealSettings: {
            // Animation direction: left right (lr) || right left (rl) || top bottom (tb) || bottom top (bt).
            direction: 'lr',
            // Revealer´s background color.
            bgcolor: '#f0f0f0',
            // Animation speed. This is the speed to "cover" and also "uncover" the element (seperately, not the total time).
            duration: 500,
            // Animation easing. This is the easing to "cover" and also "uncover" the element.
            easing: 'easeInOutQuint',
            // percentage-based value representing how much of the area should be left covered.
            coverArea: 0,
            // Callback for when the revealer is covering the element (halfway through of the whole animation).
            onCover: function(contentEl, revealerEl) { return false; },
            // Callback for when the animation starts (animation start).
            onStart: function(contentEl, revealerEl) { return false; },
            // Callback for when the revealer has completed uncovering (animation end).
            onComplete: function(contentEl, revealerEl) { return false; }
        }
    };

    /**
     * Init.
     */
    RevealFx.prototype._init = function() {
        this._layout();
    };

    /**
     * Build the necessary structure.
     */
    RevealFx.prototype._layout = function() {
        var position = getComputedStyle(this.el).position;
        if (position !== 'fixed' && position !== 'absolute' && position !== 'relative') {
            this.el.style.position = 'relative';
        }
        // Content element.
        this.content = createDOMEl('div', 'block-revealer__content', this.el.innerHTML);
        if (this.options.isContentHidden) {
            this.content.style.opacity = 0;
        }
        // Revealer element (the one that animates)
        this.revealer = createDOMEl('div', 'block-revealer__element');
        this.el.classList.add('block-revealer');
        this.el.innerHTML = '';
        this.el.appendChild(this.content);
        this.el.appendChild(this.revealer);
    };

    /**
     * Gets the revealer element´s transform and transform origin.
     */
    RevealFx.prototype._getTransformSettings = function(direction) {
        var val, origin, origin_2;

        switch (direction) {
            case 'lr':
                val = 'scale3d(0,1,1)';
                origin = '0 50%';
                origin_2 = '100% 50%';
                break;
            case 'rl':
                val = 'scale3d(0,1,1)';
                origin = '100% 50%';
                origin_2 = '0 50%';
                break;
            case 'tb':
                val = 'scale3d(1,0,1)';
                origin = '50% 0';
                origin_2 = '50% 100%';
                break;
            case 'bt':
                val = 'scale3d(1,0,1)';
                origin = '50% 100%';
                origin_2 = '50% 0';
                break;
            default:
                val = 'scale3d(0,1,1)';
                origin = '0 50%';
                origin_2 = '100% 50%';
                break;
        };

        return {
            // transform value.
            val: val,
            // initial and halfway/final transform origin.
            origin: { initial: origin, halfway: origin_2 },
        };
    };

    /**
     * Reveal animation. If revealSettings is passed, then it will overwrite the options.revealSettings.
     */
    RevealFx.prototype.reveal = function(revealSettings) {
        // Do nothing if currently animating.
        if (this.isAnimating) {
            return false;
        }
        this.isAnimating = true;

        // Set the revealer element´s transform and transform origin.
        var defaults = { // In case revealSettings is incomplete, its properties deafault to:
                duration: 500,
                easing: 'easeInOutQuint',
                delay: 0,
                bgcolor: '#f0f0f0',
                direction: 'lr',
                coverArea: 0
            },
            revealSettings = revealSettings || this.options.revealSettings,
            direction = revealSettings.direction || defaults.direction,
            transformSettings = this._getTransformSettings(direction);

        this.revealer.style.WebkitTransform = this.revealer.style.transform = transformSettings.val;
        this.revealer.style.WebkitTransformOrigin = this.revealer.style.transformOrigin = transformSettings.origin.initial;

        // Set the Revealer´s background color.
        this.revealer.style.backgroundColor = revealSettings.bgcolor || defaults.bgcolor;

        // Show it. By default the revealer element has opacity = 0 (CSS).
        this.revealer.style.opacity = 1;

        // Animate it.
        var self = this,
            // Second animation step.
            animationSettings_2 = {
                complete: function() {
                    self.isAnimating = false;
                    if (typeof revealSettings.onComplete === 'function') {
                        revealSettings.onComplete(self.content, self.revealer);
                    }
                }
            },
            // First animation step.
            animationSettings = {
                delay: revealSettings.delay || defaults.delay,
                complete: function() {
                    self.revealer.style.WebkitTransformOrigin = self.revealer.style.transformOrigin = transformSettings.origin.halfway;
                    if (typeof revealSettings.onCover === 'function') {
                        revealSettings.onCover(self.content, self.revealer);
                    }
                    anime(animationSettings_2);
                }
            };

        animationSettings.targets = animationSettings_2.targets = this.revealer;
        animationSettings.duration = animationSettings_2.duration = revealSettings.duration || defaults.duration;
        animationSettings.easing = animationSettings_2.easing = revealSettings.easing || defaults.easing;

        var coverArea = revealSettings.coverArea || defaults.coverArea;
        if (direction === 'lr' || direction === 'rl') {
            animationSettings.scaleX = [0, 1];
            animationSettings_2.scaleX = [1, coverArea / 100];
        } else {
            animationSettings.scaleY = [0, 1];
            animationSettings_2.scaleY = [1, coverArea / 100];
        }

        if (typeof revealSettings.onStart === 'function') {
            revealSettings.onStart(self.content, self.revealer);
        }
        anime(animationSettings);
    };

    window.RevealFx = RevealFx;

})(window);