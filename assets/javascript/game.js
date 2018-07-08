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
var playerName;
var opponentName;
var playerNumber;
var opponentNumber;
var playerOption;
var opponentOption;
var playerWins = 0;
var playerLosses = 0;
var opponentWins = 0;
var opponentLosses = 0;
var RPSresult;
var message;
var doubleEscape;

var RPS = ["rock", "paper", "scissors"];

var gameState;  //0: waiting for players, 1: listening for RPS input, 2: RPSlogic/score update



// Declare Functions
function firstInit() {
    gameState = 1;
    $("#chat_container").css("display", "initial");
    $("#player_" + playerNumber + "_options").empty()
    .append("<div class=\"options\" id=\"rock\">Rock</div>")
    .append("<div class=\"options\" id=\"paper\">Paper</div>")
    .append("<div class=\"options\" id=\"scissors\">Scissors</div>");
    console.log("2: " + opponentWins + ", " + opponentLosses);
    $("#player_" + playerNumber + "_score").html("<p>Wins: " + playerWins + " | Losses: " + playerLosses + "</p>");
    $("#player_" + opponentNumber + "_score").html("<p>Wins: " + opponentWins + " | Losses: " + opponentLosses + "</p>");
    firebase.database().ref("players").child(playerNumber).update({
        wins: playerWins,
        losses: playerLosses
    });
}

function greeting() {
    $("#name_container").empty().append("<h2>Hi " + playerName + ", you are Player " + playerNumber);
}

function reInit() {
    if (gameState != 0 && doubleEscape == 0) {
        doubleEscape = 1;
        $("#player_" + playerNumber + "_options").empty()
            .append("<div class=\"options\" id=\"rock\">Rock</div>")
            .append("<div class=\"options\" id=\"paper\">Paper</div>")
            .append("<div class=\"options\" id=\"scissors\">Scissors</div>");
        $("#game_state_box").append("<p>Play again?</p>");
        gameState = 1;
    }
}

function RPSwrite() {
    $("#game_state_box")
        .empty()
        .append("<p><span class=\"game_name\">" + playerName + "</span> selected " + playerOption + "!</p>")
        .append("<p><span class=\"game_name\">" + opponentName + "</span> selected " + opponentOption + "!</p>");
    RPSlogic();
}

function RPSlogic() {
    RPSresult = RPS.indexOf(playerOption) - RPS.indexOf(opponentOption);
    firebase.database().ref("players/1").child("option").remove();
    firebase.database().ref("players/2").child("option").remove();
    if (RPSresult == 0) {
        $("#game_state_box").append("<p class=\"tie_result\">Tie game!</p>");
        gameState = 1;
        setTimeout(reInit, 3000);
    } else if (RPSresult == 1 || RPSresult == -2) {
        $("#game_state_box").append("<p class=\"win_result\">" + playerName + " has won!</p>");
        playerWins++;
        opponentLosses++;
        firebase.database().ref("players").child(playerNumber).update({
            wins: playerWins
        });
        firebase.database().ref("players").child(opponentNumber).update({
            losses: opponentLosses
        });
    } else if (RPSresult == -1 || RPSresult == 2) {
        $("#game_state_box").append("<p class=\"loss_result\">" + opponentName + " has won!</p>");
        opponentWins++;
        playerLosses++;
    }
}


// Listeners

// Name Entry Listener
$(document).on("click", "#name_button", function(event) {
    event.preventDefault();
    playerName = $("#name_input").val().trim();
    firebase.database().ref("players").once("value").then(function(snapshot) {
        if (snapshot.hasChild("2") && snapshot.hasChild("1")) {
            $("#name_container").empty().append("<h2>Hi " + playerName + ", the game is currently full. Please try again later.");
        } else if (snapshot.hasChild("1")) {
            firebase.database().ref("players").child("2").set({
                name: playerName
            });
            firebase.database().ref("players").child("2").onDisconnect().remove();
            playerNumber = 2;
            opponentNumber = 1;
            greeting();
        } else {
            firebase.database().ref("players").child("1").set({
                name: playerName
            });
            firebase.database().ref("players").child("1").onDisconnect().remove();
            playerNumber = 1;
            opponentNumber = 2;
            greeting();
            $("#player_" + playerNumber + "_options").append("<p>Waiting for Player 2 to join...</p>");            
        }
    });
});

// New Player Added Listener
firebase.database().ref("players").on("child_added", function(childSnapshot) {
    $("#player_" + childSnapshot.key + "_name").html("<h2>" + childSnapshot.val().name + "</h2>")
    if (childSnapshot.val().name != playerName) {
        opponentName = childSnapshot.val().name;
    }
    firebase.database().ref("players").once("value").then(function(snapshot) {
        if (snapshot.val()["1"] && snapshot.val()["2"]) {
            if (snapshot.val()[opponentNumber].wins || snapshot.val()[opponentNumber].losses) {
                opponentWins = snapshot.val()[opponentNumber].wins;
                opponentLosses = snapshot.val()[opponentNumber].losses;
            }
            setTimeout(firstInit, 100);
        }
    });   
});

// Message Send Listener
$(document).on("click", "#chat_button", function(event) {
    event.preventDefault();
    message = $("#chat_input").val().trim();
    if (message != "") {
        if (playerNumber != 1 && playerNumber != 2) {
            playerName = "Spectator";
        }
        firebase.database().ref("chat").push({
            name: playerName,
            message: message
        });
    }
    $("#chat_input").val("");
});

// Message Receive Listener
firebase.database().ref("chat").on("child_added", function(childSnapshot) {
    if (childSnapshot.val().name) {
        $("#chat_window").append("<p><span class=\"chat_name\">" + childSnapshot.val().name + ":</span> " + childSnapshot.val().message + "</p>");
    } else if (childSnapshot.val().disconnect) {
        $("#chat_window").append("<p class=\"disconnect_message\">" + childSnapshot.val().disconnect + " has disconnected!</p>");
    }    
    $("#chat_window").scrollTop($("#chat_window")[0].scrollHeight);
});

// RPS Selection Listener
$(document).on("click", ".options", function() {
    doubleEscape = 0;
    playerOption = $(this).attr("id");
    firebase.database().ref("players").child(playerNumber).update({
        option: playerOption
    });
    $(this).removeClass("options").addClass("selected");
    $("#player_" + playerNumber + "_options").find("*").not($(this)).remove();
    $("#game_state_box").empty().append("<p>Waiting for opponent...</p>");
});

// RPS Receipt Listener
firebase.database().ref("players").on("value", function(snapshot) {
    if (snapshot.hasChild("1") && snapshot.hasChild("2") && gameState == 1) {
        if (snapshot.val()["1"].option && snapshot.val()["2"].option) {
            gameState = 2;
            opponentOption = snapshot.val()[opponentNumber].option;
            setTimeout(RPSwrite, 100);
        }
    } else if (gameState == 2) {
        $("#player_" + playerNumber + "_score").html("<p>Wins: " + snapshot.val()[playerNumber].wins + " | Losses: " + snapshot.val()[playerNumber].losses + "</p>");
        $("#player_" + opponentNumber + "_score").html("<p>Wins: " + snapshot.val()[opponentNumber].wins + " | Losses: " + snapshot.val()[opponentNumber].losses + "</p>");
        setTimeout(reInit, 3000);
    }
});

// On Disconnect Listener
firebase.database().ref("players").on("child_removed", function(childSnapshot) {
    gameState = 0;
    firebase.database().ref("chat").push({
        disconnect: opponentName,
    });
    firebase.database().ref("chat").remove();
    $("#player_" + childSnapshot.key + "_name").empty();
    $("#player_" + childSnapshot.key + "_score").empty();
    $("#player_" + playerNumber + "_options").empty().append("<p>Waiting for Player " + childSnapshot.key + " to join...</p>");
    $("#game_state_box").empty();
    opponentWins = 0;
    opponentLosses = 0;
});