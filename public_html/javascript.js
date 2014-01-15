var fingerImage = new Image();
var lightBulb = new Image();
var normal = new Image();
var lightSource = new Image();
var smoke = new Image();
var dustImg = new Image();
var dustImg2 = new Image();

$(document).ready(function(){ 
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var canvas2 = document.getElementById('canvas2');
    var context2 = canvas2.getContext('2d');
    var canvas3 = document.getElementById('canvas3');
    var context3 = canvas3.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    var canvasOffset = $('#canvas').offset();
    var bCanvas = document.getElementById('bCanvas');
    var bContext = bCanvas.getContext('2d');
    var bCanvas2 = document.getElementById('bCanvas2');
    var bContext2 = bCanvas2.getContext('2d');
    var bCanvas3 = document.getElementById('bCanvas3');
    var bContext3 = bCanvas3.getContext('2d');
    var tCanvas = document.getElementById('tCanvas');
    var tContext = tCanvas.getContext('2d');
    var fCanvas = document.getElementById('fCanvas');
    var fContext = fCanvas.getContext('2d');
    var tCanvas2 = document.getElementById('tCanvas2');
    var tContext2 = tCanvas2.getContext('2d');
    var fCanvas2 = document.getElementById('fCanvas2');
    var fContext2 = fCanvas2.getContext('2d');
    var tCanvasWidth = tCanvas.width;
    var video = document.getElementById('video');
    var dropList = [];
    var oldX = null;
    var oldY = null;
    var mousedown;
    var touched;
    var dustControl = true;
    var control = true;
    var dropControl = true;
    var tControl = true;
    var vControl = true;
    var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
    //Cross browser adjustments
    window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
    })();
    navigator.getUserMedia  = navigator.getUserMedia ||
                      navigator.webkitGetUserMedia ||
                      navigator.mozGetUserMedia ||
                      navigator.msGetUserMedia;
    
    
    //write the header:
    function writeTitle(text) {
        $('#title').remove();
        $('#container').prepend('<h1 id="title">' + text + '</h1>');
    };
   
    //clear given canvases;    
    function clear(c,c2,c3,w,h) {
        c.clearRect(0, 0, w, h);
        c2.clearRect(0, 0, w, h);
        c3.clearRect(0, 0, w, h);
    }
    
    // draw video images to canvas context:
    function videoToCanvas(c,c2,c3,src,w,h,offset) {
        c.drawImage(src, 0, 0, 3 * w, h);
        c2.drawImage(src, 0 - offset, 0, 3 * w, h);
        c3.drawImage(src,0 - 2 * offset, 0, 3 * w, h);
    }
    //Clear and prepare canvas context for new animation:
    function canvasPrep(c,c2,c3,title) {
        writeTitle(title);
        c.restore();
        c2.restore();
        c3.restore();
        c.save();
        c2.save();
        c3.save();
        c.clearRect(0,0,canvasWidth,canvasHeight);
        c2.clearRect(0,0,2*canvasWidth,canvasHeight);
        c3.clearRect(0,0,3*canvasWidth,canvasHeight);
        bContext.clearRect(0,0,canvasWidth,canvasHeight);
        bContext2.clearRect(0,0,2*canvasWidth,canvasHeight);
        bContext3.clearRect(0,0,3*canvasWidth,canvasHeight);
        fContext.clearRect(0,0,tCanvasWidth,canvasHeight);
        tContext.clearRect(0,0,tCanvasWidth,canvasHeight);
        c2.translate(-canvasWidth,0);
        c3.translate(-2 * canvasWidth,0);
        write(c,"Kaplamasız",canvasWidth/2,20);
        write(c2,"AR Kaplamalı",3*canvasWidth/2,20);
        write(c3,"Hidrofobik Kaplamalı",5*canvasWidth/2,20);
    }
    //write text to a specific location:
    function write(context,text,x,y) {
        context.font = 'italic bold 15pt Calibri';
        context.textAlign = 'center';
        context.baseline = 'middle';
        context.fillStyle = '#243';
        context.fillText(text,x,y);
    };
    //unbinding events to prevent collision with the ones in effect:
    function unbind() {
        $('canvas').unbind("mousedown");
        $('canvas').unbind("mouseup");
        $('canvas').unbind("mousemove");
        $('canvas2').unbind("mousedown");
        $('canvas2').unbind("mouseup");
        $('canvas2').unbind("mousemove");
        $('canvas3').unbind("mousedown");
        $('canvas3').unbind("mouseup");
        $('canvas3').unbind("mousemove");
        $('#canvas').unbind('click');
        $('#canvas2').unbind('click');
        $('#canvas3').unbind('click');
    }
    
    //Make all buttons invisible:
    function removeVisibleClass(){
        $('.brightness').removeClass('visible');
        $('.dust').removeClass('visible');
        $('.transition').removeClass('visible');
        $('.vapor').removeClass('visible');
        $('.otherCanvas').removeClass('visible');
    }
    
    //fingerprint draw function:
    function fingerPrintAnim(context,x,y,offset){
        var posX = x - offset.left;
        var posY = y - offset.top;
        if (posY > 20) {
            context.drawImage(fingerImage,posX,posY);
        }
    }
    
    function dropAnim(counter,v,c,c2,c3,blurValue,blurValue2){
        
        //bigger drops Class:
        function  BigDrop() {
            //Every frame get a new position for big drop:
            this.scale = 1;
            var scale = this.scale;
            this.x = Math.floor(Math.random()* canvasWidth);
            this.y = Math.floor(Math.random()* canvasHeight + 30);
            var dX = Math.floor(Math.random()* 2) - 0.5; // a random value to make the drop widths different from each other.
            this.leftMax = this.x - 6 * scale + dX; 
            this.rightMax = this.x + 6 * scale - dX;
            this.bottomMax = this.y + 13;
            this.speedSlow = Math.floor(Math.random() * 2) + 2;
            this.speedNormal = Math.floor(Math.random() * 4) + 5;
            this.speedFast = Math.floor(Math.random() * 7) + 8;
            //function to draw and clip rainDrops:
            this.clip = function(c,offset) {
                c.beginPath();
                c.moveTo((this.x + offset - 1) * scale, this.y * scale);
                c.quadraticCurveTo((this.leftMax + offset) * scale, (this.y + 8) * scale, (this.x - 2 + offset) * scale, (this.bottomMax - 1) * scale);
                c.quadraticCurveTo((this.x + offset) * scale, this.bottomMax * scale, (this.x + 2 + offset) * scale, (this.bottomMax - 1) * scale);
                c.quadraticCurveTo((this.rightMax + offset) * scale, (this.y + 8) * scale , (this.x + 2 + offset) * scale, this.y * scale);
                c.lineTo((this.x - 1 + offset)* scale, this.y * scale);
                c.clip();
            };
            //Add inner shadow to the drops:
            this.innerShadow = function(c,offset) {
                c.beginPath();
                c.arc(this.x + offset, this.y, 20, 0, 2 * Math.PI);
                c.closePath();
                c.shadowColor   = '#000';  
                c.shadowBlur    = 10;
                c.shadowOffsetX = 0; 
                c.shadowOffsetY = 18;
                c.lineWidth = 3;
                c.stroke();
            };
            //add a light reflection inside the drop:
            this.dropLight = function(c, offset) {
                c.beginPath();
                c.arc(this.x + offset, this.y, 20, 0, 2 * Math.PI);
                c.closePath();
                c.shadowColor   = '#fff';  
                c.shadowBlur    = 7;
                c.shadowOffsetX = 0;
                c.shadowOffsetY = -7;
                c.lineWidth = 3;
                c.stroke();
            };
            //drawing function for bigger drops:
            this.draw = function(c, offset) {
                this.clip(c,offset);
                this.innerShadow(c,offset);
                this.dropLight(c,offset);
            };
            
        };
        
        function render(counter) {
            //draw big drops for 50 frames
            //if clauses are used to slow down big drop creation:
            //1 drop created in 2 frames:
            if(counter <= 100){
                c.save();
                dropList[counter].draw(c, 0);   
                c.restore();
            }
            //1 drop created in 5 frames:
            if (counter % 3 === 0 && counter <= 100) {
                c2.save();
                dropList[counter].draw(c2, canvasWidth);
                c2.restore();
            }
            //1 drop created in 9 frames:
            if (counter % 5 === 0 && counter <= 100) {
                c3.save();
                dropList[counter].draw(c3, 2 * canvasWidth);
                c3.restore();
            }
        }
           
//        //return true if there is collision between drops :(Çalışmıyor ve çok kasıyor........)
//        function collisionTest(obj) {
//            var bottom1,bottom2,left1,left2,right1,right2,top1,top2;
//            var buffer = 1;
//            var startIndex = dropList.indexOf(obj) + 1;
//            left1 = obj.leftMax - buffer;
//            right1 = obj.rightMax + buffer;
//            top1 = obj.y - buffer;
//            bottom1 = obj.bottomMax + buffer;
//            for (var i = startIndex; i < dropList.length; i++) {
//                left2 = dropList[i].leftMax - buffer;
//                right2 = dropList[i].rightMax + buffer;
//                top2 = dropList[i].y - buffer;
//                bottom2 = dropList[i].bottomMax + buffer;
//                if (   ( 
//                       ((right1 < left2 < right1) && (bottom2 < top1 && top2 > bottom1) ) ||
//                       ((left2 < left1 < right2) && (bottom1 < top2 && bottom2 > top1)) 
//                       )
//                   ){   
//                        dropList[i].scale = 0;
//                        dropList[i].speed = 0;
//                        obj.scale = 1.2;
//                        alert(obj.scale);
//                        render();
//                    }
//                else{
//                }    
//            }
//        };
        
        function update(counter) {            
            //clear canvas to draw updated drops:
            c.clearRect(0, 0, 3 * canvasWidth,canvasHeight);
            c2.clearRect(0, 0, 3 * canvasWidth,canvasHeight);
            c3.clearRect(0, 0, 3 * canvasWidth,canvasHeight);
            for(var i = 0; i < Math.min(counter, 100); i++){
                var y = dropList[i].y;
                if(dropList[i].speedSlow > 0){
                    dropList[i].speedSlow -= 0.1;
                } else{
                    
                }
                if(dropList[i].speedNormal > 0){
                    dropList[i].speedNormal -= 0.25;
                } else{
                    
                }
                
                if(i % 2 === 0) {
                    y += dropList[i].speedSlow;
                } else if( i % 3 === 0) {
                    y += dropList[i].speedNormal;
                } else if(i % 5 === 0){
                    y += dropList[i].speedFast;
                }
                //update vertical position of drops :
                dropList[i].y = y;
                dropList[i].bottomMax = y + 13;
                //draw updated drops :
                render(i);
                //if drops go out of canvas,they reappear at the top :
                if(dropList[i].y > canvasHeight){
                    dropList[i].y = -10;
                }
                
//                for (var j = 0; j < dropList.length; j++) {
//                    collisionTest(dropList[j]); 
//                }
                
            }
        }
        
        //draw the video source to canvas and apply blur filter on it:
        function blurredGlass() {
            videoToCanvas(bContext,bContext2,bContext3,v,canvasWidth,canvasHeight,canvasWidth);
            boxBlurCanvasRGB( 'bCanvas', 0, 0, canvasWidth, canvasHeight, blurValue, 1 );
            boxBlurCanvasRGB( 'bCanvas2', 0, 0, canvasWidth, canvasHeight, blurValue2, 1 );
        }
        
        //push instances of BigDrop class into an array to update them later:
        if(counter <= 100) {
            dropList.push(new BigDrop);
        }
        if(dropControl){
            //if dropControl is true request a  new frame:
            requestAnimFrame(function (){
                clear(bContext, bContext2, bContext3, canvasWidth * 3, canvasHeight);    
                blurredGlass();
                if(blurValue <= 8){
                    blurValue += 0.2;
                    blurValue2 += 0.1;
                }
                render(counter);
                update(counter);
                write(context,"Kaplamasız", canvasWidth / 2, 20);
                write(context2,"AR Kaplamalı", 3 * canvasWidth / 2, 20);
                write(context3,"Hidrofobik Kaplamalı", 5 * canvasWidth / 2, 20);
                counter++; // increase counter every frame
                dropAnim(counter, v, c, c2, c3, blurValue, blurValue2);
            });
        }else {
            //if dropControl is not true clear canvas and return
            clear(bContext, bContext2, bContext3, 3 * canvasWidth, canvasHeight);
            clear(context, context2, context3, 3 * canvasWidth, canvasHeight);
            return;
        }
            
    }
    
    function dustAnim(){
        
        if(dustControl) {
            //draw video source to canvas:
            videoToCanvas(bContext,bContext2,bContext3,video,canvasWidth,canvasHeight,canvasWidth); // source image
            
            //Display the sum of the source image and destination image, with color values approaching 255 (100%) as a limit.
            bContext.globalCompositeOperation = 'lighter';
            bContext2.globalCompositeOperation = 'lighter';
            //draw dust images:
            bContext.drawImage(dustImg, 0, 0); // destination image
            bContext2.drawImage(dustImg2, 0, 0); // destination image
            
            write(context,"Kaplamasız", canvasWidth / 2, 20);
            write(context2,"AR Kaplamalı", 3 * canvasWidth / 2, 20);
            write(context3,"Hidrofobik Kaplamalı", 5 * canvasWidth / 2, 20);
            //clear canvas and request a new frame:
            requestAnimFrame(function() {
                clear(bContext, bContext2, bContext3, canvasWidth, canvasHeight);
                clear(context, context2, context3, 3 * canvasWidth, canvasHeight);
                dustAnim();
            });
        }
        //if dustControl is false clear Canvas and return:
        else{
            clear(bContext, bContext2, bContext3, 3 * canvasWidth, canvasHeight);
            clear(context, context2, context3,3 * canvasWidth, canvasHeight);
            write(context, "Kaplamasız", canvasWidth / 2, 20);
            write(context2, "AR Kaplamalı", 3 * canvasWidth / 2, 20);
            write(context3, "Hidrofobik Kaplamalı", 5 * canvasWidth / 2, 20);
            return;
        }
    }
    
    //drawing the scratch function:
    function scratchAnim(context,gA,lw,x,y){
        context.globalAlpha = gA;
        context.lineWidth = lw;
        var posX = x - canvasOffset.left;
        var posY = y - canvasOffset.top;
        context.beginPath();
            if(oldX > 0 && oldY > 0) {
                context.moveTo(oldX,oldY);
            }
        context.lineTo(posX,posY);
        context.closePath();
        context.strokeStyle = '#eee';
        context.lineCap = 'round';
        context.stroke();
        oldX = posX;
        oldY = posY;
    }
    
    //brightness animation function:
    function brightnessAnim(v,c,c2,c3) {
        clear(c, c2, c3, canvasWidth * 3, canvasHeight);
        videoToCanvas(c, c2, c3, v, canvasWidth, canvasHeight,0);
        //draw the lightbulbs:
        c.drawImage(lightBulb, canvasWidth / 2, 0, 30,150);
        c2.drawImage(lightBulb, 3 * canvasWidth / 2, 0, 30,150);
        c3.drawImage(lightBulb, 5 * canvasWidth / 2, 0, 30,150);
        //write canvas headers:
        write(c, "Kaplamasız", canvasWidth / 2, 20);
        write(c2, "AR Kaplamalı", 3 * canvasWidth / 2, 20);
        write(c3,"Hidrofobik Kaplamalı", 5 * canvasWidth / 2, 20);
        //draw the light sources:
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.drawImage(lightSource,73,65,150,150);         
        c.restore();
        c2.save();
        c2.globalCompositeOperation = 'lighter';
        c2.drawImage(lightSource, canvasWidth + 103, 95, 90, 90);         
        c2.restore();
        c3.save();
        c3.globalCompositeOperation = 'lighter';
        c3.drawImage(lightSource,2 * canvasWidth + 125, 118, 45, 45);         
        c3.drawImage(lightSource,2 * canvasWidth + 125, 118, 45, 45);         
        c3.restore();
        // draw a white rectangle in front of drawn image for increased brightness effect:
        c.rect(0,0,canvasWidth,canvasHeight);
        c.fillStyle = 'rgba(255,255,255,0.05)';
        c.fill();
        c2.rect(canvasWidth,0,canvasWidth,canvasHeight);
        c2.fillStyle = 'rgba(255,255,255,0.05)';
        c2.fill();
        c3.rect(2*canvasWidth,0,canvasWidth,canvasHeight);
        c3.fillStyle = 'rgba(255,255,255,0.05)';
        c3.fill();
        //if control is true end loop:
        if(control) {
            return;
        }else{
            requestAnimFrame(function() {
                brightnessAnim(v, c, c2, c3);
            });
        }
    }
    
    //vapor animation function:
    function vaporAnim(img,c,c2,c3,width,height) {
        var w = width;
        var h = height;
        var now, delta;
        var then = new Date().getTime();
        var particlesNum = 25; //number of particles to be used
        var x = [];
        var y = [];
        var size = 40;
        var a = 1.0; //starting alpha(opacity) value of particles
        var alpha = 0; //starting alpha(opacity) value of vaporized screen
        
        //draw particles:
        for(var i = 0; i < particlesNum; i++){
            estimatePos(); 
            c.drawImage(img, x[i], y[i], size, size);
            c2.drawImage(img, x[i] + w, y[i], size, size);
            c3.drawImage(img, x[i] + 2 * w, y[i], size, size);
        }
        
        update(); //Update function handles the opacity, size and movement of the particles.
        
        //function to calculate a new speed based on time elapsed time between frames:
        function calcSpeed(delta, speed) {
            return (delta * speed) * (60 / 1000);
        }
        
        //select random position for vapor particles:
        function estimatePos() {
            for (var i = 0; i < particlesNum; i++){
                x[i] = Math.round(Math.random() * w);
                y[i] = Math.round(Math.random() * 20) + h;
            }
        }
        
        //update position, size, alpha of the particles:
        function update() {
            // get time for a time based animation:
            now = new Date().getTime();
            delta = now - then;
            
            //update particle position:
            for(var i = 0; i < particlesNum; i++){
                x[i] += Math.floor(Math.random() * 0.5 - 0.3);
                y[i] -= Math.floor(Math.random() + calcSpeed(delta, 3));
                c.drawImage(img, x[i], y[i], size, size);
                c2.drawImage(img, x[i] + w, y[i], size, size);
                c3.drawImage(img, x[i] + 2 * w, y[i], size, size);
            }
            
            //update alpha(opacity) for vaporized screen: 
            //we use gradient fill for the heterogeneous look of the vaporized screen.
            var grd = bContext.createRadialGradient((w / 3), (2 * h /3), 100, (w / 2), (2 * h / 3), w);
            grd.addColorStop(0.0,'rgba(255,255,255,'+Math.min(alpha,0.95)+')');
            grd.addColorStop(0.5,'rgba(255,255,255,'+Math.min(alpha,0.75)+')');
            grd.addColorStop(1.0,'rgba(255,255,255,'+Math.min(alpha,0.35)+')');
            var grd2 = bContext2.createRadialGradient((w / 2), (h / 2), 100, (w / 2), (h / 2), w);
            grd2.addColorStop(0.0,'rgba(255,255,255,'+Math.min(alpha,0.60)+')');
            grd2.addColorStop(0.5,'rgba(255,255,255,'+Math.min(alpha,0.40)+')');
            grd2.addColorStop(1.0,'rgba(255,255,255,'+Math.min(alpha,0.20)+')');
            clear(bContext,bContext2,bContext3, w, h);
            bContext.rect(0, 0, w, h);
            bContext.fillStyle = grd;
            bContext.fill();
            
            bContext2.rect(0, 0, w, h);
            bContext2.fillStyle = grd2;
            bContext2.fill();
            
            write(bContext, "Kaplamasız", w / 2, 20);
            write(bContext2, "AR Kaplamalı", w / 2, 20);
            write(bContext3,"Hidrofobik Kaplamalı", w / 2, 20);
            
            //decrease global alpha(opacity) of canvas that has particles:
            c.globalAlpha = a;
            c2.globalAlpha = a;
            c3.globalAlpha = a;
            a -= calcSpeed(delta,0.003);
            
            //Particle size change speed:
            size += calcSpeed(delta, 3);
            
            //bCanvas-2-3 globalAlpha's change speed:    
            alpha += calcSpeed(delta, 0.003);
            
            //if vControl is true, clear canvas and return from function:
            if(vControl){
                c.clearRect(0, 0, w, h);
                c2.clearRect(0, 0, 2 * w, h);
                c3.clearRect(0, 0, 3 * w, h);
                a = 0;
                alpha = 1;
                cancelAnimationFrame(req);
                return;
            //if vapor opacity is below 0.01 clear canvas and return from function
            } else if(a <= 0.01){
                c.clearRect(0, 0, w, h);
                c2.clearRect(0, 0, 2 * w, h);
                c3.clearRect(0, 0,  3 * w, h);
                a = 0;
                alpha = 1;
                cancelAnimationFrame(req);
                return;
            } else{
            //request a new frame for animation(60FPS)
            var req = requestAnimFrame(function() {
                clear(bContext,bContext2,bContext3,w,h);
                c.clearRect(0, 0, w, h);
                c2.clearRect(0, 0, 2 * w, h);
                c3.clearRect(0, 0, 3 * w, h);
                then = now;    
                update();
            });
            }
        };
    };

    function TransitionAnim(){
        
        this.sunny = function (a,a2){
            //get time for time based animation:
            var then = new Date().getTime();
            var now, delta;
            darken(a,a2,then,now,delta);
        };
        this.cloudy = function (a,a2) {
            //get time for time based animation:
            var then = new Date().getTime();
            var now, delta;
            brighten(a,a2,then,now,delta);
        };
        //optimize speed by looking at the elapsed time between frames:
        function calcSpeed(delta, speed) {
            return (delta * speed) * (60 / 1000); 
        }
        
        function darken(a,a2,then,now,delta) {
            now = new Date().getTime();
            delta = now - then; //delta is the time between two frames
            //draw a rect and fill it black.
            //opacity(alpha) of the filled color changes per frame
            tContext.rect(0,0,tCanvasWidth,canvasHeight); 
            tContext.fillStyle = "rgba(0,0,0," + Math.min(a,0.9) + ")"; //transition glass will be filled less transparent.
            tContext.fill();
            fContext.rect(0,0,tCanvasWidth,canvasHeight);
            fContext.fillStyle = "rgba(0,0,0," + Math.min(a2,0.65) + ")"; //photochromic glass
            fContext.fill();
            //if tControl is true request a new frame:
            if(tControl){
                requestAnimFrame(function(){
                    //clear canvas
                    tContext.clearRect(0,0,tCanvasWidth,canvasHeight);
                    fContext.clearRect(0,0,tCanvasWidth,canvasHeight);
                    //increase alpha(opacity) values of the rectangles:
                    a += calcSpeed(delta,0.05); // transition's change ratio is faster
                    a2 += calcSpeed(delta,0.008); // photochromic is slower
                    write(tContext2,"Transition Cam",tCanvasWidth / 2, 20);
                    write(fContext2,"Fotokromik Cam",tCanvasWidth / 2, 20);
                    
                    then = now; 
                    darken(a,a2,then,now,delta);
                });    
            }
        };
        //brighten function works similar to the darken function, but on the reverse:
        function brighten(a,a2,then,now,delta) {
            now = new Date().getTime();
            delta = now - then;
            tContext.rect(0,0,tCanvasWidth,canvasHeight);
            tContext.fillStyle = "rgba(0,0,0," + Math.max(a,0) + ")";
            tContext.fill();
            fContext.rect(0,0,tCanvasWidth,canvasHeight);
            fContext.fillStyle = "rgba(0,0,0," + Math.max(a2,0.25) + ")";
            fContext.fill();
            if(tControl){
                requestAnimFrame(function(){
                    tContext.clearRect(0, 0, tCanvasWidth, canvasHeight);
                    fContext.clearRect(0, 0, tCanvasWidth, canvasHeight);
                    tContext2.clearRect(0, 0, tCanvasWidth, canvasHeight);
                    fContext2.clearRect(0, 0, tCanvasWidth, canvasHeight);
                    a -= calcSpeed(delta, 0.05);
                    a2 -= calcSpeed(delta, 0.008);
                    write(tContext2,"Transition Cam", tCanvasWidth / 2, 20);
                    write(fContext2,"Fotokromik Cam", tCanvasWidth / 2, 20);
                    then = now;
                    brighten(a, a2, then, now, delta);
                });    
            }
        }
    }
        
    //choose and play the webcam: (logitech kamerayı chrome'da kullanabilmek için) 
    /////////////(Firefoxta bu kısım desteklenmiyor.)//////////////////////  
    MediaStreamTrack.getSources(function(sourceInfos) {
      var videoSource = null;
      for (var i = 0; i !== sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'video') {
          videoSource = sourceInfo.id;
        } else {
          console.log('Some other kind of source: ', sourceInfo);
        }
      }
      sourceSelected(videoSource);
    });

    function sourceSelected(videoSource) {
      var constraints = {
        video: {
          optional: [{sourceId: videoSource}]
        }
        };
//////////////////////////////////////////////////////////////////////////////////
        if (navigator.getUserMedia) {
            navigator.getUserMedia(constraints, function(stream) {   //Media stream track kısmı çıkartılırsa constraints , {video: true} ile değiştirilmelidir.
                var localMediaStream = stream;
                video.src = window.URL.createObjectURL(localMediaStream);
            }, function(error) {
                console.error("Video capture error: ", error.code);
            });
        }
    }

    $('#fingerprint').on("click tap",function(){
        tControl = false;
        dustControl = false;
        dropControl = false;
        control = true;
        vControl = true;
        setTimeout(function() {
            removeVisibleClass();
            $('.otherCanvas').addClass('visible');
            unbind();
            canvasPrep(context,context2,context3,"Parmak İzi Testi");
            //draw fingerprint on wherever clicked:
            $('#canvas').on("click tap",function(event){
                event.preventDefault();
                var pageX = event.pageX;
                var pageY = event.pageY;
                fingerPrintAnim(context, pageX, pageY, canvasOffset);
            });
            $('#canvas2').on("click tap",function(event){
                event.preventDefault();
                var pageX = event.pageX;
                var pageY = event.pageY;
                context2.globalAlpha = 0.4;
                fingerPrintAnim(context2, pageX, pageY, canvasOffset);
            });
            $('#canvas3').on("click tap",function(event){
                event.preventDefault();
                var pageX = event.pageX;
                var pageY = event.pageY;
                context3.globalAlpha = 0.1;
                fingerPrintAnim(context3, pageX, pageY, canvasOffset);
            });
        }, 1000/60);
    });
     
    $('#rainDrop').on("click tap",function(){
        tControl = false;
        dustControl = false;
        dropControl = true;
        control = true;
        vControl = true;
        setTimeout(function(){
            removeVisibleClass();
            $('.otherCanvas').addClass('visible');
            unbind();
            var blurValue = 0;
            var blurValue2 = 0;
            canvasPrep(context, context2, context3, "Su Testi");
            dropAnim(0, video, context, context2, context3, blurValue, blurValue2);
        },1000/60);
    });
    
    $('#dust').on("click tap",function(){
        tControl = false;
        dustControl = false;
        dropControl = false;
        control = true;
        vControl = true;
        setTimeout(function(){
            removeVisibleClass();
            $('.dust').addClass('visible');
            $('.otherCanvas').addClass('visible');
            unbind();
            canvasPrep(context,context2,context3,"Toz Testi");
            $('#dust-on').on("click tap",function(){
                dustControl = true;
                dustAnim();
            });
            $('#dust-off').on("click tap",function(){
                dustControl = false;
            });
        },1000/60);
    });
    
    $('#scratch').on("click tap",function() {
        tControl = false;
        dustControl = false;
        dropControl = false;
        control = true;
        vControl = true;
        removeVisibleClass();
        $('.otherCanvas').addClass('visible');
        unbind();
        setTimeout(function(){
            canvasPrep(context,context2,context3,"Çizilme Testi");
            //when the mouse pressed down on canvas, canvas2 or canvas3 set mousedown true:
            $('.otherCanvas').on('mousedown',function(event) {
                event.preventDefault();
                mousedown = true;
            });
            //on "mouse up" stop drawing:
            $(document).on('mouseup',function(event) {
                event.preventDefault();
                mousedown = false;
                oldX = 0;
                oldY = 0;
            });
            //draw line on "mouse move"://////////////
            $('#canvas').on('mousemove',function(event) {
                if(mousedown) {
                    scratchAnim(context,0.6,1, event.pageX, event.pageY);
                }
            });
            $('#canvas2').on('mousemove',function(event) {
                if(mousedown){
                    scratchAnim(context2,0.3,0.5, event.pageX, event.pageY);
                }
            });
            $('#canvas3').on('mousemove',function(event) {
                if(mousedown) {
                    scratchAnim(context3,0.05,0.2, event.pageX, event.pageY);
                }
            });
            
            ////////////////////////////////////////////////////////////////////////////////////
            $('.otherCanvas').on('touchstart',function(event) {
                event.preventDefault();
                touched = true;
            });
            //on "touch end" stop drawing:
            $(document).on('touchend',function(event) {
                event.preventDefault();
                touched = false;
                oldX = 0;
                oldY = 0;
            });
            //draw line on touch move:
            $('#canvas').on('touchmove',function(event) {
                if(touched){
                    scratchAnim(context,0.6,1, event.changedTouches[0].pageX, event.changedTouches[0].pageY);
                }
            });

            $('#canvas2').on('touchmove',function(event) {
                if(touched) {
                    scratchAnim(context2,0.3,0.5, event.changedTouches[0].pageX, event.changedTouches[0].pageY);
                }
            });

            $('#canvas3').on('touchmove',function(event) {
                if(touched) {
                    scratchAnim(context3,0.05,0.2, event.changedTouches[0].pageX, event.changedTouches[0].pageY);
                }
            });
        },1000/60);
    });

    $('#brightness').on("click tap",function() {
        tControl = false;
        dustControl = false;
        dropControl = false;
        control = true;
        vControl = true;
        setTimeout(function(){
            //make the "ışığı aç" and "ışığı kapat" buttons visible, and other buttons invisible:
            removeVisibleClass();
            $('.brightness').addClass('visible');
            $('.otherCanvas').addClass('visible');
            unbind();
            canvasPrep(context,context2,context3,"Parlaklık Testi");
            //draw the lightbulbs:
            context.drawImage(lightBulb, canvasWidth / 2,0,30,150);
            context2.drawImage(lightBulb,3 * canvasWidth / 2,0,30,150);
            context3.drawImage(lightBulb,5 * canvasWidth / 2,0,30,150);
            //turn on the lights:
            $('#on').on("click tap",function() {
                control = false;
                brightnessAnim(video,context,context2,context3);
            });
            //turn off the lights:
            $('#off').on("click tap",function() {
                control = true;
                setTimeout(function(){
                    context.clearRect(0, 0, canvasWidth, canvasHeight);
                    context2.clearRect(0, 0, 2*canvasWidth, canvasHeight);
                    context3.clearRect(0, 0, 3*canvasWidth, canvasHeight);
                    context.drawImage(lightBulb, canvasWidth / 2,0,30,150);
                    context2.drawImage(lightBulb,3 * canvasWidth / 2,0,30,150);
                    context3.drawImage(lightBulb,5 * canvasWidth / 2,0,30,150);
                    write(context,"Kaplamasız",canvasWidth/2,20);
                    write(context2,"AR Kaplamalı",3*canvasWidth/2,20);
                    write(context3,"Hidrofobik Kaplamalı",5*canvasWidth/2,20);
                },1000/60);
            });
        },1000/60);
    });
    
    $('#vapor').on("click tap",function() {
        tControl = false;
        dustControl = false;
        dropControl = false;
        vControl = true;
        control = true;
        setTimeout(function(){
            removeVisibleClass();
            $('.otherCanvas').addClass('visible');
            $('.vapor').addClass('visible');
            unbind();
            canvasPrep(context,context2,context3,"Buğulanma Testi");
        $('#vaporStart').on("click tap",function(){
            vControl = false;
            vaporAnim(smoke,context,context2,context3,canvasWidth,canvasHeight);   
        });
        },1000/60);
    });
    
    $('#transition').on("click tap",function(){
        tControl = true;
        dustControl = false;
        dropControl = false;
        control = true;
        vControl = true;
        setTimeout(function(){
            $('#title').remove();
            $('#container').prepend('<h1 id="title" style="left: 400px;">Transition Fotokromik Karşılaştırma</h1>');
            
            removeVisibleClass();
            $('.transition').addClass('visible');
            unbind();
            write(tContext, "Transition Cam", 200 , 20);
            write(fContext, "Fotokromik Cam", 200 , 20);
            fContext.rect(0,0,tCanvasWidth,canvasHeight);
            fContext.fillStyle = "rgba(0,0,0,0.25)";
            fContext.fill();
            var transitionAnim = new TransitionAnim();
            $('#sunny').on("click tap", function(){
                setTimeout(function(){
                    transitionAnim.sunny(0,0.25);      
                },1000/60);
            });
            $('#cloudy').on("click tap", function(){
                setTimeout(function(){
                    transitionAnim.cloudy(0.8,0.65);      
                },1000/60);
            });
        },1000/60);
    });
});
fingerImage.src = "Images/finger.png";
lightBulb.src = "Images/lightBulb.png";
normal.src = "Images/bulb1.png";
lightSource.src = "Images/flare.jpg";
smoke.src = "Images/puffWhite.png";
dustImg.src = "Images/dustImage.png";
dustImg2.src = "Images/dustImage2.png";