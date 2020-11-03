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
        'tosUrl': 'https://ckyc.drumstic.com/terms.html',
        // Privacy policy url.
        'privacyPolicyUrl': 'https://ckyc.drumstic.com/terms.html',
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
        $.getJSON("/isadmin", {
                idToken: idToken_,
            },
            function(data, status) {
                if (data.isadmin == "true") {
                    $('#welcomeText').replaceWith('<h2 class="display-12 font-weight-normal">Welcome Admin, here is the list of submitted KYCs.</h2>');
                    $.getJSON("/getkycs", {
                            idToken: idToken_,
                        },
                        function(data1, status1) {
                            $('#kyclist').bootstrapTable({
                                data: data1
                            });
                        });
                } else {
                    $('#welcomeText').replaceWith('<h2 class="display-12 font-weight-normal">You are not an admin.</h2>');
                }
            });
    }).catch(function(error) {
        // Handle error
        console.log(error);
    });
};


/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
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
    document.getElementById('sign-out').addEventListener('click', function() {
        firebase.auth().signOut();
    });
};

window.addEventListener('load', initApp);