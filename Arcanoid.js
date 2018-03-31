function PlayingArea() {

    this.element = $("#playing-area");
    this.element.width(countBricksLine*widthBricks);
    this.element.height(countBricksLines*heightBricks +200);
    this.offset = this.element.offset();
    this.width = this.element.width();
    this.height = this.element.height();
    
    this.score=0;
    
    this.platform = new Platform(this);
    this.ball = new Ball(this);
    
    this.score = 0;
    
    this.initBricks = function() { // функция заполнения площадки блоками
        for (var i = 0; i < countBricksLines; i++) {
            for (var j = 0; j < countBricksLine; j++) {
                this.element.prepend("<div id='brick_"+i+"_"+j+"' class='brick' style='left:"+(j * widthBricks + 1)+"px; top:"
                    +(i * heightBricks + 1)+"; width:"+(widthBricks - 2)+"px; height: "+(heightBricks - 2)+"px'><p>"
                        + (Math.round(Math.random() * (countBricksLines - i)) + (countBricksLines - i)) + "</p></div>");
            }
        }
    }
    
    this.showInfo = function() {
        $('#info').html("Очки: " + this.score);
    }
    
    this.refreshArea = function() {
        $('.brick').remove();
        this.initBricks();
        this.score=0;
        this.showInfo();
    } 
}


function Platform(pa) {
    this.pa = pa;
    this.element = $("#platform"); 
    this.width = this.element.width();
    this.height = this.element.height();
    this.interval = 0;
    this.top=this.element.offset().top;
    this.left=this.element.offset().left;
    
    this.dx = 0;
    this.lastX = this.element.offset().left;
    
    // функция перемещения платформы
    this.move = function(x) { 
        var mleft = x - this.width / 2; 
        var leftMin = this.pa.offset.left;   
        var leftMax = this.pa.offset.left + this.pa.width - this.width;   

        if (mleft < leftMin){
            mleft = leftMin;
        }

        if (mleft > leftMax){
            mleft = leftMax;
        }
        this.element.offset({left:mleft});
        if (this.pa.ball.dy==0){
            this.pa.ball.element.offset({left:mleft+this.width/2 - this.pa.ball.width/2});
        }
    }
    
    this.evaluateDx = function(){
        if (this.lastX > 0){
            this.dx =this.element.offset().left - this.lastX;
        }
        this.lastX =this.element.offset().left;

    }
    
}

function Ball(pa) {
    this.pa = pa;
    this.element = $("#ball");
    this.width = this.element.width();
    this.height = this.element.height();
    this.dx = 0;
    this.dy = 0;
    this.interval = 0;
    
    this.setDef = function(){
        this.element.offset({top:this.pa.platform.element.offset().top - this.height, 
        left:this.pa.platform.element.offset().left + this.pa.platform.width / 2 - this.width / 2});
    }
    
     
        
    this.start = function() {
        this.dx = 1 - Math.round(Math.random() * 3);
        this.dy = -3;
        
    }
    
    this.move = function() {
        var ballOffset= this.element.offset();
        // отбивание шарика от боковых стенок площадки        
        if(this.element.offset().left+this.dx < this.pa.element.offset().left || 
            this.element.offset().left+this.dx > this.pa.element.offset().left + this.pa.width - 20) {
            this.dx = -this.dx;
        }
        // отбивание шарика от верхней стени площадки
        if(this.element.offset().top + this.dy < this.pa.element.offset().top){
            this.dy = -this.dy;
        }
        // отбивание шарика от платформы
        if(this.element.offset().top + this.dy > this.pa.platform.element.offset().top - 20 &&
            this.element.offset().left+this.dx > this.pa.platform.element.offset().left && 
                this.element.offset().left+this.dx < this.pa.platform.element.offset().left + this.pa.platform.width){
            this.dy = -this.dy;
            this.dx = this.dx + Math.round(this.pa.platform.dx / 3);
            if (Math.abs(this.dx) > maxBallDx) {
                console.log(this.dx);
                if(this.dx < 0) {
                    this.dx = -maxBallDx;
                }
                else {
                    this.dx = maxBallDx;
                }
                console.log(this.dx);
            }                
        }
        
        // падение шарика
        if(this.element.offset().top + this.dy > this.pa.platform.element.offset().top - 20 &&
            (this.element.offset().left+this.dx < this.pa.platform.element.offset().left || 
            this.element.offset().left+this.dx > this.pa.platform.element.offset().left + this.pa.platform.width)){
                this.reset();
                return;
        }      

        
        var ballNextX = this.element.offset().left + this.dx;
        var ballNextY = this.element.offset().top +this.dy;
        
        var brickIndexX = Math.floor((ballNextX - this.pa.offset.left)/widthBricks);
        var brickIndexY = Math.floor((ballNextY - this.pa.offset.top)/heightBricks);
        
        var brick = document.getElementById("brick_" + brickIndexY + "_" + brickIndexX);
        if (brick != null) {
            var rect = brick.getBoundingClientRect();
            if (this.element.offset().left > rect.left - this.width &&
                this.element.offset().left < rect.left + rect.width) {
                    this.dy = -this.dy;
            }
            else {
                this.dx = -this.dx;
            }
            $("#"+brick.id).hide(100, function(){$("#"+this.id).remove()});
            var brickText;
            if ( brick.innerText) {
                brickText = brick.innerText;
            }
            else {
                brickText = brick.textContent;
            }
            var brickScore = parseInt(brickText);
            this.pa.score = this.pa.score + brickScore;
            this.pa.showInfo();
        }
        
        this.element.offset({top:ballOffset.top+this.dy,left:ballOffset.left+this.dx});
    }
    
    this.reset = function()
    {
        this.dx = 0;
        this.dy = 0;
        this.setDef();
        if (this.interval){
            clearInterval(this.interval);
        }
        alert("Игра окончена. Ваши очки: " + this.pa.score);
        this.pa.refreshArea();
    }
}

//Параметры кирпичей
const countBricksLine=10;
const countBricksLines=10;
const widthBricks=100;
const heightBricks=30;

const maxBallDx = 3;

var pa; // игровая площадка

$(document).ready(function() {
    pa = new PlayingArea();
    pa.refreshArea();
    pa.ball.setDef();
    pa.showInfo();
    pa.platform.interval = window.setInterval(function() {pa.platform.evaluateDx()}, 5);

    $(document).mousemove(function(event) {      
        event = event || window.event;
        pa.platform.move(event.pageX || event.x);
    })
    
    $(document).mousedown(function(event){
        
        if (pa.ball.dy!=0)
            return;
        pa.ball.start();
        pa.ball.interval = window.setInterval(function() {pa.ball.move()}, 5); 
    })
    
})
