/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This config file is for the demo only. It is in .gitignore and will not be pushed to git repo.
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const config = {
    apiKey: "AIzaSyB6nD2T59EJaO9OVSXb-_qwTwppZ0YQzuk",
    authDomain: "cybrilla-kyc.firebaseapp.com",
    databaseURL: "https://cybrilla-kyc.firebaseio.com",
    projectId: "cybrilla-kyc",
    storageBucket: "cybrilla-kyc.appspot.com",
    messagingSenderId: "844386329342",
    appId: "1:844386329342:web:d879bd83107f4c5a5efbaf",
    measurementId: "G-4XHDRFWB5F"
};
firebase.initializeApp(config);

// Google OAuth Client ID, needed to support One-tap sign-up.
// Set to null if One-tap sign-up is not supported.
var CLIENT_ID =
    '112932855859-78h8c48di80rj1ec2a091gbe5oa94dls.apps.googleusercontent.com';