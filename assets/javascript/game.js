// Initialize Firebase
var config = {
    apiKey: "AIzaSyBO_Cds5R035iJkeym4BGQnhFI4ZUPLXAc",
    authDomain: "utor-coding-bootcamp-rpsgame.firebaseapp.com",
    databaseURL: "https://utor-coding-bootcamp-rpsgame.firebaseio.com",
    projectId: "utor-coding-bootcamp-rpsgame",
    storageBucket: "",
    messagingSenderId: "690188252275"
};
firebase.initializeApp(config);


// Declare Variables
var ourName;
var opponentName;
var playerNumber;
var opponentNumber;
var message;
var option;



// Declare Functions

function greeting() {
    $("#name_container").empty().append("<h2>Hi " + ourName + ", you are Player " + playerNumber);
}

function init() {
    $("#player_" + playerNumber + "_options").empty()
        .append("<div class=\"options\" id=\"rock\">Rock</div>")
        .append("<div class=\"options\" id=\"paper\">Paper</div>")
        .append("<div class=\"options\" id=\"scissors\">Scissors</div>");
    $("#chat_container").css("display", "initial");
}




// Listeners

// Name Entry Listener
$(document).on("click", "#name_button", function(event) {
    event.preventDefault();
    ourName = $("#name_input").val().trim();
    firebase.database().ref("players").once("value").then(function(snapshot) {
        if (snapshot.hasChild("2")) {
            $("#name_container").empty().append("<h2>Hi " + ourName + ", the game is currently full. Please try again later.");
        } else if (snapshot.hasChild("1")) {
            firebase.database().ref("players").child("2").set({
                name: ourName
            });
            playerNumber = 2;
            opponentNumber = 1;
            greeting();
        } else {
            firebase.database().ref("players").child("1").set({
                name: ourName
            });
            playerNumber = 1;
            opponentNumber = 2;
            greeting();
            $("#player_" + playerNumber + "_options").append("<p>Waiting for Player 2 to join...");            
        }
    });

});

// New Player Added Listener
firebase.database().ref("players").on("child_added", function(childSnapshot) {
    $("#player_" + childSnapshot.key + "_name").html("<h2>" + childSnapshot.val().name + "</h2>")
    if (childSnapshot.val().name != ourName) {
        opponentName = childSnapshot.val().name;
        console.log(opponentName);
    }
    if (childSnapshot.key == 2) {
        setTimeout(init, 100);
    }
});

// Message Send Listener
$(document).on("click", "#chat_button", function(event) {
    event.preventDefault();
    message = $("#chat_input").val().trim();
    if (message != "") {
        if (playerNumber != 1 && playerNumber != 2) {
            ourName = "Spectator";
        }
        firebase.database().ref("chat").push({
            name: ourName,
            message: message
        });
    }
    $("#chat_input").val("");
});

// Message Receive Listener
firebase.database().ref("chat").on("child_added", function(childSnapshot) {
    $("#chat_window").append("<p><span class=\"chat_name\">" + childSnapshot.val().name + ":</span> " + childSnapshot.val().message + "</p>");
    $("#chat_window").scrollTop($("#chat_window")[0].scrollHeight);
});

// RPS Selection Listener
$(document).on("click", ".options", function() {
    option = $(this).attr("id");
    firebase.database().ref("players").child(playerNumber).update({
        option: option
    });
    $(this).removeClass("options").addClass("selected");
    $("#player_" + playerNumber + "_options").find("*").not($(this)).remove();
    $("#game_state_box").append("<p>Waiting for opponent...")

});

// RPS Receipt Listener

firebase.database().ref("players").on("value", function(snapshot) {
    if (snapshot.hasChild("2")) {
        if (snapshot.val()["1"].option && snapshot.val()["2"].option) {
            $("#game_state_box")
                .append("<p><span class=\"game_name\">" + ourName + "</span> selected " + option + "!</p>")
                .append("<p><span class=\"game_name\">" + opponentName + "</span> selected " + snapshot.val()[opponentNumber].option + "!</p>")
        }
    }

});


/* firebase.database().ref("players/1").child("option").on("value", function(optionSnapshot) {
    firebase.database().ref("players/2").
    if (optionSnapshot.val() != ("rock" || "paper" || "scissors")) {

        $("#game_state_box").append("<p><span class=\"game_name\">" + )
    }
    
});
 */


// QOL Temp Listeners

$("#clear_players").on("click", function() {
    firebase.database().ref("players").remove();
});

$("#clear_chat").on("click", function() {
    firebase.database().ref("chat").remove();
});




/*     opponentPlayerNumber = myPlayerNumber === 1 ? 2 : 1; */



