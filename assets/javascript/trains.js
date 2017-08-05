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
    // When user clicks "submit" button, add a new train entry to firebase
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
    // said train in military time (HH:mm) and its frequency in minutes
    function calculateNextTrainTime(firstTime, freq) {
        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");

        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

        // Time apart (remainder)
        var tRemainder = diffTime % freq;

        // Minutes Until Train
        var tMinutesTillTrain = freq - tRemainder;

        // Next Train time calculation
        var nextTrainTime = moment().add(tMinutesTillTrain, "minutes");

        // Create an object to return to caller
        var nextTrain = {
            time:  moment(nextTrainTime).format("LT"),
            minutes: tMinutesTillTrain
        };

        return nextTrain;
    }

    // On changes to DB, update table on the screen -- this will be called once on first page load
    // and then every time a new train entry is added to the DB
    database.ref().on("child_added", function (childSnapshot) {
        var nextTrain = calculateNextTrainTime(childSnapshot.val().firstTime, childSnapshot.val().freq);

        // add new row to on-screen table
        $("#trains-table").append("<tr><td><b>" + childSnapshot.val().name + "</b></td>" +
            "<td>" + childSnapshot.val().destination + "</td>" +
            "<td>" + childSnapshot.val().freq + "</td>" +
            "<td id=next-time-"+ childSnapshot.val().name.replace(/ /g,"-") +">" + nextTrain.time + "</td>" +
            "<td id=next-mins-"+ childSnapshot.val().name.replace(/ /g,"-") +">" + nextTrain.minutes + "</td></tr>");

        // update current time display in heading
        $("#current-time").html("(" + moment().format('LT') + ")");

    }, function (errorObject) {
        // Handle the errors
        console.log("Errors handled: " + errorObject.code);
    });


    // ------------ BONUS ----------------//

    // Update the trains table's last 2 dynamic columns once a minute to give accurate time for the next train
    setInterval(updateTrainsTable, 60000);

    // function to update all the next train time AND minutes to next train column values on-screen
    function updateTrainsTable() {
        var nextTrain;
        var name;
        var trains;

        database.ref().once("value", function(data) {
            trains = data.val();
            for (var trainObj in trains) {
                if (trains.hasOwnProperty(trainObj)) {
                    nextTrain = calculateNextTrainTime(trains[trainObj].firstTime, trains[trainObj].freq);
                    name = trains[trainObj].name.replace(/ /g,"-");

                    $("#next-time-" + name).html(nextTrain.time);
                    $("#next-mins-" + name).html(nextTrain.minutes);
                }
            }

            // update current time display in heading
            $("#current-time").html("(" + moment().format('LT') + ")");
        });
    }
});