let currentPlayer = "";
let startX = 0,
    startY = 0;

function setTurn(player) {
    currentPlayer = player;
    $("#playerSelection").hide();
    $(".striker").css("pointer-events", "none");
    $("#" + player).css("pointer-events", "auto");
}
$(document).ready(function() {
    $("#playerSelection").show();
});
$(".striker").on("mousedown touchstart", function(event) {
    if ($(this).attr("id") !== currentPlayer) return;
    let e = event.touches ? event.touches[0] : event;
    startX = e.clientX;
    startY = e.clientY;
});
$(document).on("mouseup touchend", function(event) {
    let e = event.changedTouches ? event.changedTouches[0] : event;
    let endX = e.clientX;
    let endY = e.clientY;
    let deltaX = startX - endX;
    let deltaY = startY - endY;
    let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    // Force is now set based on a fixed value, making the striker move at a constant speed.
    let force = 15;
    moveStriker($("#" + currentPlayer), deltaX, deltaY, force);
});

function moveStriker(striker, dx, dy, force) {
    let angle = Math.atan2(dy, dx);
    let speedX = Math.cos(angle) * force;
    let speedY = Math.sin(angle) * force;
    let posX = striker.position().left;
    let posY = striker.position().top;
    let interval = setInterval(() => {
        posX += speedX;
        posY += speedY;
        // Calculate rotation angle for the pen based on movement direction
        let rotationAngle = Math.atan2(speedY, speedX) * (180 / Math.PI);
        striker.css({
            left: posX + "px",
            top: posY + "px",
            transform: `rotate(${rotationAngle}deg)` // Rotate the pen icon as it moves
        });
        let containerWidth = $(".game-container").width();
        let containerHeight = $(".game-container").height();
        let strikerWidth = striker.width();
        let strikerHeight = striker.height();
        // Reflect from side walls
        if (posX < 0 || posX > containerWidth - strikerWidth) {
            speedX = -speedX;
        }
        // Check if striker goes out
        if (posY < 0) {
            gameOver("Player 2");
            clearInterval(interval);
        } else if (posY > containerHeight - strikerHeight) {
            gameOver("Player 1");
            clearInterval(interval);
        }
        let opponent = $("#" + (currentPlayer === "player1" ? "player2" : "player1"));
        // Check for collision with opponent
        if (checkCollision(striker, opponent)) {
            clearInterval(interval);
            moveOpponent(opponent, speedX, speedY, force);
            stopStrikerAtCollision(striker, posX, posY);
        }
    }, 10);
}

function checkCollision(el1, el2) {
    let rect1 = el1[0].getBoundingClientRect();
    let rect2 = el2[0].getBoundingClientRect();
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

function moveOpponent(opponent, speedX, speedY, force) {
    let posX = opponent.position().left;
    let posY = opponent.position().top;
    let angle = Math.atan2(speedY, speedX);
    let speedOppX = Math.cos(angle) * force;
    let speedOppY = Math.sin(angle) * force;
    let interval = setInterval(() => {
        posX += speedOppX;
        posY += speedOppY;
        opponent.css({
            left: posX + "px",
            top: posY + "px"
        });
        let containerWidth = $(".game-container").width();
        let containerHeight = $(".game-container").height();
        let strikerWidth = opponent.width();
        let strikerHeight = opponent.height();
        // If opponent goes out, the current player wins
        if (posY < 0 || posY > containerHeight - strikerHeight) {
            gameOver(currentPlayer === "player1" ? "Player 1" : "Player 2");
            clearInterval(interval);
        }
    }, 10);
}

function stopStrikerAtCollision(striker, posX, posY) {
    striker.css({
        left: posX + "px",
        top: posY + "px"
    });
}

function gameOver(winner) {
    $("#winnerText").text(winner + " Wins!");
    $("#gameOverPopup").show();
}