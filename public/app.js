/**
 * FirebaseUI initialization to be used in a Single Page application context.
 */

/**
 * @return {!Object} The FirebaseUI config.
 */

var user_email = 'user@email';
// Created a Storage Reference with root dir
// var storageRef = firebase.storage().ref();
var userUid = '';

function getUiConfig() {
    return {
        'callbacks': {
            // Called when the user has been successfully signed in.
            'signInSuccessWithAuthResult': function(authResult, redirectUrl) {
                if (authResult.user) {
                    handleSignedInUser(authResult.user);
                }
                if (authResult.additionalUserInfo) {
                    document.getElementById('is-new-user').textContent =
                        authResult.additionalUserInfo.isNewUser ?
                        'New User' : 'Existing User';
                }
                // Do not redirect.
                return false;
            }
        },
        // Opens IDP Providers sign-in flow in a popup.
        'signInFlow': 'popup',
        'signInOptions': [
            // TODO(developer): Remove the providers you don't need for your app.
            {
                provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                // Required to enable this provider in One-Tap Sign-up.
                authMethod: 'https://accounts.google.com',
                // Required to enable ID token credentials for this provider.
                clientId: CLIENT_ID
            },
            {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                // Whether the display name should be displayed in Sign Up page.
                requireDisplayName: true
            }
        ],
        // Terms of service url.
        'tosUrl': 'https://tamil.drumstic.com/terms.html',
        // Privacy policy url.
        'privacyPolicyUrl': 'https://tamil.drumstic.com/terms.html',
        'credentialHelper': CLIENT_ID && CLIENT_ID != 'YOUR_OAUTH_CLIENT_ID' ?
            firebaseui.auth.CredentialHelper.GOOGLE_YOLO : firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
    };
}

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Disable auto-sign in.
ui.disableAutoSignIn();
var idToken_;

function addAlert(message) {
    $('#alerts').html(
        '<div class="alert alert-info alert-dismissable">' +
        '<button type="button" class="close" data-dismiss="alert">' +
        '&times;</button>' + message + '</div>');
    $('#alerts').show();
    $("#alerts").fadeTo(2000, 500).slideUp(500, function() {
        $("#alerts").slideUp(500);
    });

}

function addNegativeAlert(message) {
    $('#alerts').html(
        '<div class="alert alert-danger alert-dismissable">' +
        '<button type="button" class="close" data-dismiss="alert">' +
        '&times;</button>' + message + '</div>');
    $('#alerts').show();
    $("#alerts").fadeTo(2000, 500).slideUp(500, function() {
        $("#alerts").slideUp(500);
    });

}

/**
 * @return {string} The URL of the FirebaseUI standalone widget.
 */
function getWidgetUrl() {
    return '/widget#recaptcha=' + getRecaptchaMode();
}


/**
 * Redirects to the FirebaseUI widget.
 */
var signInWithRedirect = function() {
    window.location.assign(getWidgetUrl());
};


/**
 * Open a popup with the FirebaseUI widget.
 */
var signInWithPopup = function() {
    window.open(getWidgetUrl(), 'Sign In', 'width=985,height=735');
};


/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = function(user) {
    document.getElementById('user-signed-in').style.display = 'block';
    document.getElementById('user-signed-out').style.display = 'none';
    user_email = user.email;
    userUid = user.uid;

    try {
        $(".user-only").removeClass('d-none');
        $(".non-user-only").addClass('d-none');
        var before_upi_text = $("#upibuttonmonthly").attr("href");
        var after_upi_text = before_upi_text.replace('email@address', user.email);
        $("#upibuttonmonthly").attr("href", after_upi_text);
        $("#upibuttonannual").attr("href", after_upi_text);
    } catch (err) {
        // Do nothing
    }
    // document.getElementsByClassName('user-only').style.display = 'block';
    document.getElementById('dropdown09').textContent = user.displayName;
    // document.getElementById('user').value = user.email;
    // document.getElementById('heading1').innerText = 'Today';
    firebase.auth().currentUser.getIdToken( /* forceRefresh */ true).then(function(idToken) {
        // Send token to your backend via HTTPS
        // ...
        idToken_ = idToken
        $.getJSON("/kycsubmitted", {
                idToken: idToken_,
            },
            function(data, status) {
                if (data.kycsubmitted == "true") {
                    $('#welcomeText').replaceWith('<h2 class="display-12 font-weight-normal">You have submitted the form already. Thank you for your submission.</h2>');
                    $('#kyc-not-submitted').addClass('d-none');
                } else {
                    //whatever
                }
            });


    }).catch(function(error) {
        // Handle error
        console.log(error);
    });

    // document.getElementById('phone').textContent = user.phoneNumber;
    // if (user.photoURL){
    //   var photoURL = user.photoURL;
    //   // Append size to the photo URL for Google hosted images to avoid requesting
    //   // the image with its original resolution (using more bandwidth than needed)
    //   // when it is going to be presented in smaller size.
    //   if ((photoURL.indexOf('googleusercontent.com') != -1) ||
    //       (photoURL.indexOf('ggpht.com') != -1)) {
    //     photoURL = photoURL + '?sz=' +
    //         document.getElementById('photo').clientHeight;
    //   }
    //   document.getElementById('photo').src = photoURL;
    //   document.getElementById('photo').style.display = 'block';
    // } else {
    //   document.getElementById('photo').style.display = 'none';
    // }
};


/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
    $("#deckofcards").empty();
    lastLoadedLesson = 0;
    document.getElementById('user-signed-in').style.display = 'none';
    document.getElementById('user-signed-out').style.display = 'block';
    $(".user-only").addClass('d-none');
    $(".non-user-only").removeClass('d-none');
    // document.getElementsByClassName('user-only').style.display = 'none';
    ui.start('#firebaseui-container', getUiConfig());
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('loaded').style.display = 'block';
    user ? handleSignedInUser(user) : handleSignedOutUser();
});

$(window).scroll(function() {
    if ($(window).scrollTop() == $(document).height() - $(window).height()) {
        loadLessons();
    }
});

var lastLoadedLesson = 0;

function loadLessons() {
    var isSubscriber = "no";
    $.getJSON("json/subscribers.json", function(data) {
        var all_string = JSON.stringify(data);
        var btoa_email = btoa(user_email);
        if (all_string.includes(btoa_email)) {
            isSubscriber = "yes";
        } else {
            isSubscriber = "no";
        }
        if (isSubscriber == "no") {
            $.getJSON("json/free.json", function(data) {
                var items = [];
                var no_of_lessons = data.lessons.length;
                var this_page_load = lastLoadedLesson + 6;
                if (this_page_load > no_of_lessons) {
                    this_page_load = no_of_lessons;
                }
                for (i = lastLoadedLesson; i < this_page_load; i++) {
                    lastLoadedLesson = i + 1;
                    if (data.lessons[i].locked) {
                        $("#deckofcards").append(`<div class="card mt-5 mb-5"> <img class="card-img-top" src="img/${data.lessons[i].thumb}" alt="Card image cap" data-toggle="modal"> <div class="card-body"> <div class="row"> <div class="col-8"> <h5 class="card-title">${data.lessons[i].title}</h5> </div><div class="col-4 text-right"> <svg class="bi bi-lock-fill" width="2em" height="2em" viewBox="0 0 16 16" fill="#28a745ff" xmlns="http://www.w3.org/2000/svg"> <rect width="11" height="9" x="2.5" y="7" rx="2"/> <path fill-rule="evenodd" d="M4.5 4a3.5 3.5 0 117 0v3h-1V4a2.5 2.5 0 00-5 0v3h-1V4z" clip-rule="evenodd"/> </svg> </div></div><p class="card-text">${data.lessons[i].desc}</p><div class="text-center"> <a href="/subscription" class="btn btn-success stretched-link">Upgrade to View</a> </div></div><div class="card-footer"> <small class="text-muted">Last updated 3 mins ago</small> </div></div>`);
                    } else {
                        $("#deckofcards").append(`<div class="card mt-5 mb-5"> <img class="card-img-top" src="img/${data.lessons[i].thumb}" alt="Card image cap" data-toggle="modal"> <div class="card-body"> <div class="row"> <div class="col-8"> <h5 class="card-title">${data.lessons[i].title}</h5> </div></div><p class="card-text">${data.lessons[i].desc}</p><div class="text-center"> <a href="#" data-toggle="modal" data-target="#modal1" onclick="changeVideo('${data.lessons[i].link}')" class="btn btn-primary stretched-link">View</a> </div></div><div class="card-footer"> <small class="text-muted">Last updated 3 mins ago</small> </div></div>`);
                    }
                }
            });
        } else {
            $.getJSON("json/premium.json", function(data) {
                var no_of_lessons = data.lessons.length;
                var this_page_load = lastLoadedLesson + 6;
                if (this_page_load > no_of_lessons) {
                    this_page_load = no_of_lessons;
                }
                for (i = lastLoadedLesson; i < this_page_load; i++) {
                    lastLoadedLesson = i + 1;
                    if (data.lessons[i].locked) {
                        $("#deckofcards").append(`<div class="card mt-5 mb-5"> <img class="card-img-top" src="img/${data.lessons[i].thumb}" alt="Card image cap" data-toggle="modal"> <div class="card-body"> <div class="row"> <div class="col-8"> <h5 class="card-title">${data.lessons[i].title}</h5> </div><div class="col-4 text-right"> <svg class="bi bi-lock-fill" width="2em" height="2em" viewBox="0 0 16 16" fill="#28a745ff" xmlns="http://www.w3.org/2000/svg"> <rect width="11" height="9" x="2.5" y="7" rx="2"/> <path fill-rule="evenodd" d="M4.5 4a3.5 3.5 0 117 0v3h-1V4a2.5 2.5 0 00-5 0v3h-1V4z" clip-rule="evenodd"/> </svg> </div></div><p class="card-text">${data.lessons[i].desc}</p><div class="text-center"> <a href="/subscription" class="btn btn-success stretched-link">Upgrade to View</a> </div></div><div class="card-footer"> <small class="text-muted">Last updated 3 mins ago</small> </div></div>`);
                    } else {
                        $("#deckofcards").append(`<div class="card mt-5 mb-5"> <img class="card-img-top" src="img/${data.lessons[i].thumb}" alt="Card image cap" data-toggle="modal"> <div class="card-body"> <div class="row"> <div class="col-8"> <h5 class="card-title">${data.lessons[i].title}</h5> </div></div><p class="card-text">${data.lessons[i].desc}</p><div class="text-center"> <a href="#" data-toggle="modal" data-target="#modal1" onclick="changeVideo('${data.lessons[i].link}')" class="btn btn-primary stretched-link">View</a> </div></div><div class="card-footer"> <small class="text-muted">Last updated 3 mins ago</small> </div></div>`);
                    }
                }
            });
        }
    });

}

/**
 * Deletes the user's account.
 */
// var deleteAccount = function() {
//   firebase.auth().currentUser.delete().catch(function(error) {
//     if (error.code == 'auth/requires-recent-login') {
//       // The user's credential is too old. She needs to sign in again.
//       firebase.auth().signOut().then(function() {
//         // The timeout allows the message to be displayed after the UI has
//         // changed to the signed out state.
//         setTimeout(function() {
//           alert('Please sign in again to delete your account.');
//         }, 1);
//       });
//     }
//   });
// };


/**
 * Handles when the user changes the reCAPTCHA config.
 */
function handleRecaptchaConfigChange() {
    var newRecaptchaValue = document.querySelector(
        'input[name="recaptcha"]:checked').value;
    location.replace(location.pathname + '#recaptcha=' + newRecaptchaValue);

    // Reset the inline widget so the config changes are reflected.
    ui.reset();
    ui.start('#firebaseui-container', getUiConfig());
}


/**
 * Initializes the app.
 */
var initApp = function() {
    // document.getElementById('sign-in-with-redirect').addEventListener(
    //     'click', signInWithRedirect);
    // document.getElementById('sign-in-with-popup').addEventListener(
    //     'click', signInWithPopup);
    document.getElementById('sign-out').addEventListener('click', function() {
        firebase.auth().signOut();
    });
    // document.getElementById('delete-account').addEventListener(
    //     'click', function() {
    //       deleteAccount();
    //     });

    // document.getElementById('recaptcha-normal').addEventListener(
    //     'change', handleRecaptchaConfigChange);
    // document.getElementById('recaptcha-invisible').addEventListener(
    //     'change', handleRecaptchaConfigChange);
    // // Check the selected reCAPTCHA mode.
    // document.querySelector(
    //     'input[name="recaptcha"][value="' + getRecaptchaMode() + '"]')
    //     .checked = true;
};

window.addEventListener('load', initApp);