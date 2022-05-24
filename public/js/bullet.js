class Bullet{
    constructor(x,y,h,w, speed){
        this.x = x;
        this.y = y;
        this.height = h;
        this.weight = w;
        this.speed = speed;
    }

    move(){
        this.x += this.height.speed;
    }
}