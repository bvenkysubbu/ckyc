var express = require("express");
var app = express();
var router = express.Router();
var admin = require("firebase-admin");
var path = __dirname + "/public/";
var serviceAccount = require("./cybrilla-kyc-firebase-adminsdk-rgcg6-c348d38a87.json");

var http = require('http');
var httpServer = http.createServer(app);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cybrilla-kyc.firebaseio.com"
});

const db = admin.firestore();
// Get a reference to the storage service, which is used to create references in your storage bucket
// var storage = firebase.storage();

router.use(function(req, res, next) {
    console.log("/" + req.method);
    next();
});

router.get("/", function(req, res) {
    res.sendFile(path + "index.html");
});

router.get("/subscription", function(req, res) {
    res.sendFile(path + "subscription.html");
});

router.get("/ask", function(req, res) {
    res.sendFile(path + "ask.html");
});

router.get("/isadmin", function(req, res) {
    console.log("/isadmin");
    var idToken = req.query.idToken;
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            var errors = false;

            admin.auth().getUser(uid)
                .then(async function(userRecord) {
                    var docRef = db.collection('ckycadmins').doc(userRecord.uid);
                    var doc = await docRef.get();
                    if (!doc.exists) {
                        console.log('No such document!');
                        return res.end('{"isadmin":"false"}');
                    } else {
                        return res.end('{"isadmin":"true"}');
                    }
                })
                .catch(function(error) {
                    return res.end('{"uid":"invalid"}');
                    console.log("Error fetching user data:", error);
                });
            // ...
        }).catch(function(error) {
            // Handle error
            return res.end('{"uid":"invalid"}');
        });

});

router.get("/getkycs", function(req, res) {
    console.log("/getkycs");
    var idToken = req.query.idToken;
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            var errors = false;

            admin.auth().getUser(uid)
                .then(async function(userRecord) {
                    var docRef = db.collection('ckycadmins').doc(userRecord.uid);
                    var doc = await docRef.get();
                    if (!doc.exists) {
                        console.log('No such document!');
                        return res.end('{"isadmin":"false"}');
                    } else {
                        const docs = [];
                        const ckycRef = db.collection('ckyc');
                        const snapshot = await ckycRef.get();
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            docs.push({
                                id: doc.id,
                                email: doc.get('inputContactEmail'),
                                mobile: doc.get('inputContactMobile')
                            });
                        });
                        return res.end(JSON.stringify(docs));
                    }
                })
                .catch(function(error) {
                    return res.end('{"uid":"invalid"}');
                    console.log("Error fetching user data:", error);
                });
            // ...
        }).catch(function(error) {
            // Handle error
            return res.end('{"uid":"invalid"}');
        });

});

router.get("/kycsubmitted", function(req, res) {
    console.log("/kycsubmitted");
    var idToken = req.query.idToken;
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            var errors = false;

            admin.auth().getUser(uid)
                .then(async function(userRecord) {
                    console.log(userRecord.uid);
                    var docRef = db.collection('ckyc').doc(userRecord.uid);
                    var doc = await docRef.get();
                    if (!doc.exists) {
                        console.log('No such document!');
                        return res.end('{"kycsubmitted":"false"}');
                    } else {
                        // console.log('Document data:', doc.data());
                        return res.end('{"kycsubmitted":"true"}');
                    }
                })
                .catch(function(error) {
                    return res.end('{"uid":"invalid"}');
                    console.log("Error fetching user data:", error);
                });
            // ...
        }).catch(function(error) {
            // Handle error
            return res.end('{"uid":"invalid"}');
        });

});

router.get("/proceed", function(req, res) {
    console.log("/proceed");
    var idToken = req.query.idToken;
    console.log("idToken is " + idToken);
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            var errors = false;

            admin.auth().getUser(uid)
                .then(function(userRecord) {
                    // See the UserRecord reference doc for the contents of userRecord.
                    console.log("Successfully fetched user data:", userRecord.toJSON());
                    console.log("user email is " + userRecord.email);
                    console.log("req.query.pan is " + req.query.pan);
                    console.log("req.query.panLocation is " + req.query.panLocation);
                    var docRef = db.collection('ckyc').doc(userRecord.uid);
                    docRef.set({
                        kycSubmitted: req.query.kycSubmitted,
                        pan: req.query.pan,
                        panLocation: req.query.panLocation,
                        yourPhotoLocation: req.query.yourPhotoLocation,
                        yourProofOfIDLocation: req.query.yourProofOfIDLocation,
                        yourProofOfAddressLocation: req.query.yourProofOfAddressLocation,
                        relatedProofOfIDLocation: req.query.relatedProofOfIDLocation,
                        prefixYourName: req.query.prefixYourName,
                        yourFirstName: req.query.yourFirstName,
                        yourMiddleName: req.query.yourMiddleName,
                        yourLastName: req.query.yourLastName,
                        prefixMaidenName: req.query.prefixMaidenName,
                        maidenFirstName: req.query.maidenFirstName,
                        maidenMiddleName: req.query.maidenMiddleName,
                        maidenLastName: req.query.maidenLastName,
                        prefixFatherOrSpouseName: req.query.prefixFatherOrSpouseName,
                        fatherOrSpouseFirstName: req.query.fatherOrSpouseFirstName,
                        fatherOrSpouseMiddleName: req.query.fatherOrSpouseMiddleName,
                        fatherOrSpouseLastName: req.query.fatherOrSpouseLastName,
                        prefixMotherName: req.query.prefixMotherName,
                        maidenFirstName: req.query.maidenFirstName,
                        maidenMiddleName: req.query.maidenMiddleName,
                        maidenLastName: req.query.maidenLastName,
                        yourBirthday: req.query.yourBirthday,
                        genderSelect: req.query.genderSelect,
                        maritalStatusSelect: req.query.maritalStatusSelect,
                        citizenshipSelect: req.query.citizenshipSelect,
                        residentialStatusSelect: req.query.residentialStatusSelect,
                        occupationSelect: req.query.occupationSelect,
                        poiDocumentSelect: req.query.poiDocumentSelect,
                        inputIdentityNo: req.query.inputIdentityNo,
                        poiExpiryDate: req.query.poiExpiryDate,
                        addressProofSelect: req.query.addressProofSelect,
                        inputAddressID: req.query.inputAddressID,
                        poaExpiryDate: req.query.poaExpiryDate,
                        addressTypeSelect: req.query.addressTypeSelect,
                        inputAddressLine1: req.query.inputAddressLine1,
                        inputAddressLine2: req.query.inputAddressLine2,
                        inputAddressLine3: req.query.inputAddressLine3,
                        inputAddressCity: req.query.inputAddressCity,
                        inputAddressDistrict: req.query.inputAddressDistrict,
                        addressStateSelect: req.query.addressStateSelect,
                        currentAddressCountrySelect: req.query.currentAddressCountrySelect,
                        currentIsCorrespondenceCheck: req.query.currentIsCorrespondenceCheck,
                        inputLocalAddressLine1: req.query.inputLocalAddressLine1,
                        inputLocalAddressLine2: req.query.inputLocalAddressLine2,
                        inputLocalAddressLine3: req.query.inputLocalAddressLine3,
                        inputLocalAddressCity: req.query.inputLocalAddressCity,
                        inputLocalAddressDistrict: req.query.inputLocalAddressDistrict,
                        localAddressStateSelect: req.query.localAddressStateSelect,
                        localAddressCountrySelect: req.query.localAddressCountrySelect,
                        inputContactEmail: req.query.inputContactEmail,
                        inputContactMobile: req.query.inputContactMobile,
                        inputContactTelephoneOffice: req.query.inputContactTelephoneOffice,
                        inputContactTelephoneResidence: req.query.inputContactTelephoneResidence,
                        fatcaCheck: req.query.fatcaCheck,
                        fatcaCountrySelect: req.query.fatcaCountrySelect,
                        inputTaxIdNo: req.query.inputTaxIdNo,
                        inputFatcaBirthCity: req.query.inputFatcaBirthCity,
                        inputFatcaBirthCountry: req.query.inputFatcaBirthCountry,
                        inputFatcaAddressLine1: req.query.inputFatcaAddressLine1,
                        inputFatcaAddressLine2: req.query.inputFatcaAddressLine2,
                        inputFatcaAddressLine3: req.query.inputFatcaAddressLine3,
                        inputFatcaAddressCity: req.query.inputFatcaAddressCity,
                        inputFatcaAddressDistrict: req.query.inputFatcaAddressDistrict,
                        addressStateSelect: req.query.addressStateSelect,
                        fatcaAddressCountrySelect: req.query.fatcaAddressCountrySelect,
                        relatedPersonTypeSelect: req.query.relatedPersonTypeSelect,
                        prefixRelatedPersonName: req.query.prefixRelatedPersonName,
                        relatedPersonFirstName: req.query.relatedPersonFirstName,
                        relatedPersonMiddleName: req.query.relatedPersonMiddleName,
                        relatedPersonLastName: req.query.relatedPersonLastName,
                        relatedPersonPOISelect: req.query.relatedPersonPOISelect,
                        inputRelatedIdentityNo: req.query.inputRelatedIdentityNo,
                        relatedPOIExpiryDate: req.query.relatedPOIExpiryDate,
                        remarksTextarea1: req.query.remarksTextarea1,
                        declarationCheck: req.query.declarationCheck,
                        consentCheck: req.query.consentCheck,
                        applicationDate: req.query.applicationDate,
                        applicationPlace: req.query.applicationPlace
                    });
                })
                .catch(function(error) {
                    return res.end('{"uid":"invalid"}');
                    console.log("Error fetching user data:", error);
                });
            // ...
        }).catch(function(error) {
            // Handle error
            return res.end('{"uid":"invalid"}');
        });

});

app.use("/", router);
app.use(express.static(path));

app.use("*", function(req, res) {
    res.sendFile(path + "404.html");
});

httpServer.listen(8080);