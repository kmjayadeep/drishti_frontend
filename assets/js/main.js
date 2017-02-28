$(document).ready(function() {
    $('#preloader').addClass('hide')
        //TOOD remove after testing
    setTimeout(function() {
        $('#preloader').hide();
    }, 2000)
    initializeParticles()
    setupNavigation()
});

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
                "speed": 6,
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


// Initialize Firebase
var config = {
    apiKey: 'AIzaSyCvN9K2cdfUf4H8BIr8vqRhdtGV_ca2UIs',
    authDomain: 'drishti-bd782.firebaseapp.com',
    databaseURL: 'https://drishti-bd782.firebaseio.com',
    storageBucket: 'drishti-bd782.appspot.com',
    messagingSenderId: '37494669483',
};
firebase.initializeApp(config);

// FirebaseUI config.
var uiConfig = {
    // signInSuccessUrl: 'index.html',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        // firebase.auth.GithubAuthProvider.PROVIDER_ID,
        // firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    // tosUrl: '<your-tos-url>'
    callbacks: {
        signInSuccess: function(currentUser, credential, redirectUrl) {
            // Do something.
            console.log("sign in success");
            console.log(currentUser);
            document.getElementById("firebaseui-auth-container").style.visibility = "hidden";
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
        }
    },
    credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
    // Query parameter name for mode.
    queryParameterForWidgetMode: 'mode',
    // Query parameter name for sign in success url.
    queryParameterForSignInSuccessUrl: 'signInSuccessUrl',
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: 'index.html',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    ],
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);






mySignOut = function() {
        firebase.auth().signOut().then(function() {
            console.log('Signed Out');
        }, function(error) {
            console.error('Sign Out Error', error);
        });
    },
    initApp = function() {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in.
                var displayName = user.displayName;
                var email = user.email;
                var emailVerified = user.emailVerified;
                var photoURL = user.photoURL;
                var uid = user.uid;
                var providerData = user.providerData;
                user.getToken().then(function(accessToken) {

                    // document.getElementById('sign-in-status').textContent = 'Signed in';
                    document.getElementById("firebaseui-auth-container").style.visibility = "hidden";
                    document.getElementById('sign-in').style.visibility = "visible";
                    document.getElementById('sign-in').textContent = 'Sign out';

                    // document.getElementById("myModal").showModal();
                    $('#myModal').modal('show');
                    // document.getElementById('account-details').textContent = JSON.stringify({
                    //   displayName: displayName,
                    //   email: email,
                    //   emailVerified: emailVerified,
                    //   photoURL: photoURL,
                    //   uid: uid,
                    //   accessToken: accessToken,
                    //   providerData: providerData
                    // }, null, '  ');
                });
            } else {
                // User is signed out.
                // document.getElementById('sign-in-status').textContent = 'Signed out'; 

                document.getElementById("firebaseui-auth-container").style.visibility = "visible";

                document.getElementById('sign-in').style.visibility = "hidden";
                // document.getElementById('account-details').textContent = 'null';
            }
        }, function(error) {
            console.log(error);
        });
    };

window.addEventListener('load', function() {
    initApp()
});
