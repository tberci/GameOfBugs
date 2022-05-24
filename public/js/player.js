var socket = io();


export class Player {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.width = 30;
      this.height = 30;
      this.speed = 4;
      this.color = color;
      this.playerRounds = [];
      this.shootPressed = false;
      this.isDead = false;
      
      this.fire = false;
      this.bullets = 6;
      this.reload = 0;
  
      this.movement = {
        up: false,
        down: false,
        left: false,
        right: false,
  
      };
      document.addEventListener("keydown", this.keydown);
      document.addEventListener("keyup", this.keyup);
      
    }
  
    draw(ctx) {
     
      this.move();
      ctx.fillRect(this.x, this.y, this.width, this.height);
  
    }
  
    shoot() {
      this.playerRounds.forEach(bullet => {
  
        bullet.draw(ctx);
  
      });
  
  
      /*rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.h + rect1.y > rect2.y*/
    }

    move() {
      if (this.downPressed) {
        this.y += this.speed;
      }
      if (this.upPressed) {
        this.y -= this.speed;
      }
      if (this.leftPressed) {
        this.x -= this.speed;
      }
  
      if (this.rightPressed) {
        this.x += this.speed;
      }
  
    };
  
    keydown = (e) => {
      if (e.keyCode == 38) {
        this.movement.up = true;
      }
      if (e.keyCode == 40) {
        this.movement.down = true;
      }
      if (e.keyCode == 37) {
        this.movement.left = true;
      }
      if (e.keyCode == 39) {
        this.movement.right = true;
  
      }
  
      if (e.keyCode == 82) {
        this.reload ++;
        console.log(this.reload);
  
        if (this.reload == 4){
          this.fire = true;
          this.bullets = 6;
          this.reload = 0;
        }
      
      }
  
      if (e.keyCode == 32) {
  
        console.log("fireeeee");
        //socket.emit('addBullet', 1);
        this.fire = true;
        if(this.fire == true){
          this.bullets--;
          console.log(this.bullets);
          if(this.bullets < 0){
            this.fire = false;
            this.bullets = 0;
          }else{
            socket.emit('addBullet', { x: this.x, y: this.y, w: 3, h: 20, dir: 'up'});
          }
          
         
        }
  
        
      }
    };
    
  
    keyup = (e) => {
      if (e.keyCode == 38) {
        this.movement.up = false;
      }
      if (e.keyCode == 40) {
        this.movement.down = false;
      }
      if (e.keyCode == 37) {
        this.movement.left = false;
      }
      if (e.keyCode == 39) {
        this.movement.right = false;
      }
      if (e.keyCode == 32) {
        this.shootPressed = false;
        console.log("fire stopped");
        //  socket.emit('addBullet', 0);
        this.fire = false;
      }
    };
  }