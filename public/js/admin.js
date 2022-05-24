var socket = io();
var input = document.getElementById('input');


function restartGame() {
    socket.emit('restart');
}

socket.on("table", function (data) {
    var table = document.getElementById( 'score_board' );
  
    row = table.insertRow(1);
    cell1 = row.insertCell(0);
    cell2 = row.insertCell(1);
  
    cell1.innerHTML = data.name;
    cell2.innerHTML =  data.score;
    
    row.style.textAlign = 'center';
   
    cell1.parentNode.replaceChild(data.name, cell1);
    cell2.parentNode.replaceChild(data.score, cell2);
   
});


form.addEventListener('submit', function (e) {
    e.preventDefault();
  
    if (input.value) {
      socket.emit('admin', input.value);
  
      input.value = '';
    }
  });