// Initialize Firebase
var config = {
  apiKey: "AIzaSyAxh--NUkOT8xq1F50vYemj3AXw_w6ihBE",
  authDomain: "train-scheduler-a4ffa.firebaseapp.com",
  databaseURL: "https://train-scheduler-a4ffa.firebaseio.com",
  projectId: "train-scheduler-a4ffa",
  storageBucket: "train-scheduler-a4ffa.appspot.com",
  messagingSenderId: "168117928020"
};
firebase.initializeApp(config);

var database = firebase.database();
// Initial Variables
var trainName;
var destination;
var frequency;
var arrival;
var away;

// OBJECT
var scheduler = {

  addTrain: function(){
    $("#addTrain").on("click", function(){
      event.preventDefault();

      trainName = $("#inputName").val().trim();
      destination = $("#inputDestination").val().trim();
      frequency = $("#inputFrequency").val().trim();
      arrival = $("#inputTime").val().trim();
      console.log(trainName);

      database.ref().push({
        name: trainName,
        destination: destination,
        frequency: frequency,
        arrival: arrival,
        dateAdded: firebase.database.ServerValue.TIMESTAMP,
      })
    })
  },
  addInfo: function(){
    database.ref().on("child_added", function(childSnapshot) {
      var childTime;
      var parseTime;
      var childFrequency;
      var parseFrequency;
      var now;
      var firstTimeConverted;
      var diffTime;;
      var timeRemainder;
      var minutesAway;

      function countTime(){
      childTime = childSnapshot.val().arrival; //first arrival time
      parseTime = moment(childTime, "HH:mm"); // time in miliseconds
      childFrequency = childSnapshot.val().frequency;
      parseFrequency = moment(childFrequency, "m");

      now = moment();
      firstTimeConverted = moment(childTime, "HH:mm").subtract(1, "years"); // First Time (pushed back 1 year to make sure it comes before current time)
      diffTime = moment().diff(moment(firstTimeConverted), "minutes"); // Difference between the times

      timeRemainder = diffTime % childFrequency;// Time apart (remainder)
      minutesAway = childFrequency - timeRemainder; // Minutes Until Next Train

      childTime = moment().add(minutesAway, "minutes").format("LT"); // Next Arrival Time
      console.log("ARRIVAL TIME: " + moment(childTime, "LT").format("LT"));
      }
      countTime();

      $("#trainInfo").append(`
          <tr>
          <td>${childSnapshot.val().name}</td>
          <td>${childSnapshot.val().destination}</td>
          <td>${childSnapshot.val().frequency}</td>
          <td id="${childSnapshot.val().dateAdded}arrival">${childTime}</td>
          <td id="${childSnapshot.val().dateAdded}">${minutesAway}</td>
          </tr>
      `)
      function updateTime() { //now we are updating minutesAway and childTime variables on screen every minute
        countTime();
        var grabId = childSnapshot.val().dateAdded;
        document.getElementById(grabId).innerHTML=minutesAway;

        var grabArrivalId = childSnapshot.val().dateAdded;
        document.getElementById(grabId + "arrival").innerHTML=childTime;

        setTimeout(updateTime, 60000);
      }
      updateTime();

      // If any errors are experienced then log them to console.
      }, function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
  },
}

scheduler.addTrain();
scheduler.addInfo();