
const express = require('express');
const app = express();
const http = require('http');

const { join } = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mock.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message);

  console.log('db connection sucessful');
});
db.run('DELETE FROM players');

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/html/index.html');
});

app.get('/admin', function (req, res) {
  res.sendFile(__dirname + '/public/html/admin.html');
});

var playersTop = [];
var playersBottom = [];
var currentClients;
var players = {};
var bullet_array = [];
var num = 0;
var score = 0;
var shoot_speed = 0;
var bullet_count = 6;


const fs = require('fs');

fs.readFile('config.cfg', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  shoot_speed = data[14];
});


io.on('connection', (socket) => {
  socket.on('chatter', (msg) => {
    io.emit('chatter', { msg: msg, name: players[socket.id].name });
  });


  socket.on('startGame', function () {
    if (currentClients < 2) {
      io.emit('admin', "@Server : waiting for other players");
    } else {
      io.emit('startGame');
      io.emit('admin', "@Server : The game has started");

    
    }
  });

  const colorString = "#" + Math.floor(Math.random() * 16777215).toString(16);

  socket.on('new player', function (data) {
    num++;
    console.log("játékosok száma : " + num);
    console.log(socket.id);
    io.emit('admin', "@Server : " + data.name + " has joined!");

    console.log(data.name);

    currentClients = io.engine.clientsCount;
    console.log("number of clients : ", currentClients);



    players[socket.id] = {
      x: 300,
      y: 400,
      h: 30,
      w: 30,
      shoot: 'up',
      id: socket.id,
      name: "playerX", //unidentified lenne data.name-el
      bullets: [],
      number: num,
      //id : socket.id,
      color: colorString,
      kills: score,
      hp: 3

    }
    id = socket.id;

    players[socket.id].name = data.name;


    console.log(" player " + data.name + "created in : ", players[socket.id].x, players[socket.id].y)

    let sql = 'INSERT INTO players (id, name, score) VALUES(?,?,?)';
    db.run(sql, [socket.id, data.name, players[socket.id].kills], (err) => {
      if (err) return console.error(err.message);

      console.log("A new row has been created");
    });

    for (i in players) {

      if (players[socket.id].number % 2 == 0) {

        players[socket.id].x = 1;
        players[socket.id].y = 10;
        playersBottom.push(players[socket.id]);


      } else {
        players[socket.id].x = 600;
        players[socket.id].y = 400;

        playersTop.push(players[socket.id]);

      }
    }

    socket.emit('new player', players);
    console.log("lent " + playersBottom.length);
    console.log("fent" + playersTop.length);
  });



  socket.on('movement', function (data) {
    //ha players[socket.id] = undefined akkor üres dictet hoz létre.
    var player = players[socket.id] || {};
    if (currentClients < 2) {

      player.x -= 0;
      player.y -= 0;
    } else {
      if (data.left) {
        player.x -= 2;
      }
      if (data.up) {
        player.y -= 2;
      }
      if (data.right) {
        player.x += 2;
      }
      if (data.down) {
        player.y += 2;
      }
      if (player.x < 0) {
        player.x = 0;
      } else if (player.x + player.w > 600) {
        player.x = 600 - player.w;
      }
      if (player.y < 0) {
        player.y = 0;
      } else if (player.y + player.h > 400) {
        player.y = 400 - player.h;
      }

    }

    // Közép vonal akadály detektálós feltétel vizsgálat.
    if (player.x < 0 + 600 &&
      player.x + player.w > 0 &&
      player.y < 200 + 10 &&
      player.y + player.h > 200) {
      if (player.y < 200) {
        player.y = 200 - player.h;
      } if (player.y > 200) {
        player.y = 190 + player.h;
      }
    }

  });

  socket.on('addBullet', function (data) {
    if (players[socket.id] == undefined || currentClients < 2) return;    //ha nincs meg a min2 kliens akkor addig ne lőjön.
    data.y = players[socket.id].y;
    data.x = players[socket.id].x;
    data.owner_id = socket.id;
    data.owner_name = players[socket.id].name;

    if (players[socket.id].number % 2 == 0) {
      players[socket.id].shoot = "up";

      data.y = players[socket.id].y + 30;

    } else {

      players[socket.id].shoot = "down";
      data.y = players[socket.id].y - 30;

    }
    data.dir = players[socket.id].shoot
    shootDir = players[socket.id].shoot;
    bullet_array.push(data);
    //players[socket.id].bullets.push(data);
    //bullets = players[socket.id].bullets;


  });

  socket.on('disconnect',function () {
    // if(players[socket.id].name == undefined) return;
    io.emit('admin', "@Server :", "A user has disconnected!");

    delete players[socket.id];


  });

  socket.on('restart', function ()  {

    io.emit('admin', "The admin has restarted the game");
    for (var i in players)

      delete players[i];


    var destination = "/";
    io.emit('redirect', destination);

  });

  

});


function updateBullet() {

  for (i in bullet_array) {

    bullet = bullet_array[i];

    if (bullet.dir == "up") {
      bullet.y += parseInt(shoot_speed);
    } else if (bullet.dir == "down") {
      bullet.y -= parseInt(shoot_speed);;
    }
    //kimegy akkor törlődik. (bugos)
    /*if ( bullet.y > 400 || bullet.y < 0 ) {
      bullet_array.splice(i, 1);
      i--;
    }*/

    for (id in players) {
      var player = players[id] || {};

      // console.log(Object.keys(players).length);   
      if (bullet.owner_id != id) {

        if (bullet.x < player.x + player.w &&
          bullet.x + bullet.w > player.x &&
          bullet.y < player.y + player.h &&
          bullet.y + bullet.h > player.y) {

          player.hit = true;

          var destination = '/';
          io.to(player.id).emit('killed', destination);

          console.log("" + player.name + " was hit by " + bullet.owner_name);
          player.kills++;
          console.log(player.kills + "" +player.name)
          io.emit('admin', "@Server " + player.name + "was hit");
          delete players[id];
          let sql = 'UPDATE players SET score=? WHERE name=?';
          db.run(sql, [player.kills, bullet.owner_name], (err) => {
            if (err) return console.error(err.message);

            console.log("Score is updated");
          });

          sql = 'SELECT * FROM players ORDER BY score';

          db.all(sql, [], (err, rows) => {
            if (err) return console.error(err.message);

            rows.forEach((row) => {
              console.log(row);
              io.emit('table', { name: row.name, score: row.score });
            })
          });

          //score++;
          //player.hp--;
        }


        if (bullet.x < 570 + 30 && 
          bullet.x + bullet.w > 570  &&
          bullet.y < 360 + 10 && 
          bullet.y + bullet.h > 360) {

            bullet_array.splice(i, 1);
             i--;
          }

          if (bullet.x < 1 + 30 && 
            bullet.x + bullet.w > 1  &&
            bullet.y < 40 + 10 && 
            bullet.y + bullet.h > 40) {
  
              bullet_array.splice(i, 1);
               i--;
            }
      }


    }
  }
  io.emit('bupdate', bullet_array);

}
setInterval(updateBullet, 1000 / 60);

setInterval(function () {
  io.sockets.emit('state', players);

}, 1000 / 60);

server.listen(3000, () => {
  console.log('listening on *:3000');
});