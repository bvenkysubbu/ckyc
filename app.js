var express = require("express");
var app = express();
var router = express.Router();
var mysql = require("mysql");
var fs = require("fs-extra");
var admin = require("firebase-admin");
var path = __dirname + "/public/";
var instance_env = "tymly";
var exec = require("ssh-exec");
var port_no = 443;
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
                        pan: req.query.pan,
                        panLocation: req.query.panLocation,
                        yourPhotoLocation: req.query.yourPhotoLocation,
                        yourProofOfIDLocation: req.query.yourProofOfIDLocation,
                        yourProofOfAddressLocation: req.query.yourProofOfAddressLocation,
                        relatedProofOfIDLocation: req.query.relatedProofOfIDLocation
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

router.get("/apply", function(req, res) {
    var idToken = req.query.idToken;
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            var errors = false;

            admin.auth().getUser(uid)
                .then(function(userRecord) {
                    // See the UserRecord reference doc for the contents of userRecord.
                    console.log("Successfully fetched user data:", userRecord.toJSON());
                    console.log("user email is " + userRecord.email);

                    var con = mysql.createConnection({
                        host: "tymlydb",
                        user: "root",
                        password: "@cceln0micS",
                        database: instance_env
                    });

                    con.connect(function(err) {
                        if (err) {
                            console.log("Error connecting to Db");
                            return;
                        }
                        console.log("Connection established");
                    });

                    con.query("SELECT host,port FROM noticespots s,noticeusers u,noticespotsusers su where u.name = ? and u.id = su.noticeuserid and su.noticespotid = s.id", userRecord.email, function(err, rows) {
                        if (err) {
                            res.writeHead(200, { "Content-Type": "application/json" });
                            return res.end('{"success":"false"}');
                        }

                        for (var i = 0; i < rows.length; i++) {

                            var command_to_execute = "sudo systemctl restart tymlyapp.service";
                            exec(
                                command_to_execute, {
                                    user: "pi",
                                    host: rows[i].host,
                                    port: rows[i].port,
                                    key: "/root/.ssh/id_rsa"
                                },
                                function(err, stdout, stderr) {
                                    if (err) {
                                        console.log(err, stdout, stderr);
                                        errors = true;
                                    } else {
                                        console.log(err, stdout, stderr);
                                    }
                                }
                            );
                        }

                        if (errors) {
                            res.end('{"status": "apply", "success":"false"}');

                        } else {
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end('{"status": "apply", "success":"true"}');
                        }


                        // console.log("Data received from Db:\n");
                        // console.log(rows);
                        // res.writeHead(200, { "Content-Type": "application/json" });
                        // res.end(JSON.stringify(rows));
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

// app.listen(port_no, function() {
//   console.log("Live at Port" + port_no);
// });
httpServer.listen(8080);
// httpsServer.listen(8444);