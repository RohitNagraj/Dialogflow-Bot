'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const firebase = require("firebase");

require('dotenv').config();

// Firebase config
let config = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: "https://lauren-ai-e7777.firebaseio.com/",
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId
};

firebase.initializeApp(config);

// Initialize database
let database = firebase.database();
let value;

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });

    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function commands(agent) {
        let command = agent.parameters.command;
        let shortcut = agent.parameters.shortcut;

        // If the query is for a command
        if (command) {
            database.ref().child("linux").child("command").child(command).on("value", function (snapshot) {
                value = snapshot.val();
            });
        }
        // if the query is for a shortcut
        else if (shortcut) {
            database.ref().child("linux").child("shortcut").child(shortcut).on("value", function (snapshot) {
                value = snapshot.val();
            });
        }
        else {
            value = "command not found";
        }
        agent.add(`${value}`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Commands', commands);
    intentMap.set('Default Fallback Intent', fallback);
    agent.handleRequest(intentMap);
});