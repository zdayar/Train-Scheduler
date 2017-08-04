// Initialize Firebase
var config = {
    apiKey: "AIzaSyAEaod5iXp1_p4EluGEAjlbORVhjDNohIY",
    authDomain: "train-schedules-1fc80.firebaseapp.com",
    databaseURL: "https://train-schedules-1fc80.firebaseio.com",
    projectId: "train-schedules-1fc80",
    storageBucket: "",
    messagingSenderId: "14136948255"
};
firebase.initializeApp(config);

var database = firebase.database();

$(document).ready(function () {
    // When user clicks "submit" button, add a new entry to firebase
    $("#add-train").on("click", function () {
        event.preventDefault();

        var name = $("#name-input").val().trim();
        var dest = $("#destination-input").val().trim();
        var firstTime = $("#first-time-input").val().trim();
        var freq = $("#frequency-input").val().trim();

        database.ref().push({
            name: name,
            destination: dest,
            firstTime: firstTime,
            freq: freq
        });

        // clear the on-screen fields
        $("#name-input").val('');
        $("#destination-input").val('');
        $("#first-time-input").val('');
        $("#frequency-input").val('');

    });


    // function to calculate when the next train is and how many minutes till next train, given the first time for
    // said train and the frequency
    function calculateNextTrainTime(firstTime, freq) {
        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");

        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

        // Time apart (remainder)
        var tRemainder = diffTime % freq;

        // Minutes Until Train
        var tMinutesTillTrain = freq - tRemainder;

        // Next Train
        var nextTrainTime = moment().add(tMinutesTillTrain, "minutes");

        var nextTrain = {
            time:  moment(nextTrainTime).format("LT"),
            minutes: tMinutesTillTrain
        }

        return nextTrain;
    }

    // function to update on-screen table display
    function updateTrainsTable(trainInfo) {
        

    }

    // On changes to DB, update table on the screen
    database.ref().on("child_added", function (childSnapshot) {

        var nextTrain = calculateNextTrainTime(childSnapshot.val().firstTime, childSnapshot.val().freq);

        // add new row to on-screen table
        $("#trains-table").append("<tr><td>" + childSnapshot.val().name + "</td>" +
            "<td>" + childSnapshot.val().destination + "</td>" +
            "<td>" + childSnapshot.val().freq + "</td>" +
            "<td>" + nextTrain.time + "</td>" +
            "<td>" + nextTrain.minutes + "</td></tr>");

        // Handle the errors
    }, function (errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });


});