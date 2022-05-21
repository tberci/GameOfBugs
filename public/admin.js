var socket = io();

function restartGame() {
    socket.emit('restart');
}

socket.on("table", function (data) {
    //document.getElementById('scoreboard').deleteRow(0);
    var newRow = document.getElementById('scoreboard').insertRow();
    var newCell = newRow.insertCell();
    var newText = document.createTextNode(data.name + "" + data.score);
    newRow.appendChild(newText);
});