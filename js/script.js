var canvas, ctx;

var iStart = 0;
var bRightBut = false;
var bLeftBut = false;
var oBall, oPadd, oBricks;
var aSounds = [];
var iPoints = 0;
var iGameTimer;
var iElapsed = iMin = iSec = 0;
var sLastTime, sLastPoints;
var ballColor = 0;

//об"єкти
function Ball(x, y, dx, dy, r) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.r = r;
}
function Padd(x, w, h, img) {
    this.x = x;
    this.w = w;
    this.h = h;
    this.img = img;
}
function Bricks(w, h, r, c, p) {
    this.w = w;
    this.h = h;
    this.r = r; // рядкиs
    this.c = c; // колонки
    this.p = p; // палка
    this.objs;
    this.prot;
    this.colors = ['#f80207', '#fcba03', '#feff01', '#03fe03', '#00ffe1', '#0072ff', '#fc01fc']; // кольори для кубиків
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

function clear() { // очищення функції канвас
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // задній фон
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
function HueToRGB(v, v1, v2)
{
    var $n1  = v;
    var $n2  = v1;
    var $hue = v2;

    if( $hue < 0 )      { $hue += 255; }
    if( $hue > 255 )    { $hue -= 255; }

    if ( $hue < 43 )    { return ( $n1 + ( ( ( $n2 - $n1 ) * $hue + 21 ) / 43 ) ); }
    if ( $hue < 128 )   { return ( $n2 ); }
    if ( $hue < 170 )   { return ( $n1 + ( ( ( $n2 - $n1 ) * ( 170 - $hue) + 21 ) / 43 ) ); }
    return ( $n1 );
}

function HLStoRGB(v, v1, v2)
{
    var $hue = v;
    var $lum = v1;
    var $sat = v2;
    var $R;   
    var $G;
    var $B;
    var $M1;    
    var $M2;
    if( $hue > 255 ) { $hue = 255; }
    if( $hue < 0 )   { $hue = 0; }
    if( $sat == 0 )
    { 
        $R = $G = $B = $lum;
    }
    else
    {
        if( $lum <= 128) { $M2 = ( $lum * (255 + $sat) + 128) / 255; }
        else             { $M2 = $lum + $sat - ( ( $lum * $sat ) + 128 ) / 255; }

        $M1 = 2 * $lum - $M2;

        $R = ( HueToRGB( $M1, $M2, $hue + 85 ) * 255 + 128 ) / 255;
        $G = ( HueToRGB( $M1, $M2, $hue ) * 255 + 128 ) / 255;
        $B = ( HueToRGB( $M1, $M2, $hue - 85 ) * 255 + 128 ) / 255;
    }
    console.log("#"+(($R & 255) << 16 | ($G & 255) << 8 | $B & 255).toString(16));
    return "#"+(($R & 255) << 16 | ($G & 255) << 8 | $B & 255).toString(16);
}

function drawScene() { // головна функція
    clear(); // очищення канвас

    // кулька
    ballColor += 1;
    ctx.fillStyle = HLStoRGB(ballColor, 128, 200)
    if(ballColor== 255)
    {
        ballColor = 0;
    }
    ctx.beginPath();
    ctx.arc(oBall.x, oBall.y, oBall.r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    if (bRightBut)
        oPadd.x += 5;
    else if (bLeftBut)
        oPadd.x -= 5;

    // палка
    ctx.drawImage(oPadd.img, oPadd.x, ctx.canvas.height - oPadd.h);

    // кубики
    for (i=0; i < oBricks.r; i++) {
        for (j=0; j < oBricks.c; j++) {
            if (oBricks.objs[i][j] == 1) {
                if(oBricks.prot[i][j] == "unbreaking")
                {
                    ctx.fillStyle = '#9d9d9d';
                }
                else
                {
                    ctx.fillStyle = oBricks.colors[oBricks.prot[i][j]];
                }
                ctx.beginPath();
                ctx.rect((j * (oBricks.w + oBricks.p)) + oBricks.p, (i * (oBricks.h + oBricks.p)) + oBricks.p, oBricks.w, oBricks.h);
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    
    iRowH = oBricks.h + oBricks.p;
    iRow = Math.floor(oBall.y / iRowH);
    iCol = Math.floor(oBall.x / (oBricks.w + oBricks.p));

    // збиття кубиків
    if (oBall.y < oBricks.r * iRowH && iRow >= 0 && iCol >= 0 && oBricks.objs[iRow][iCol] == 1) {
        
        if(oBricks.prot[iRow][iCol] != "unbreaking")
        {
            if(oBricks.prot[iRow][iCol] > 0)
            {
                oBricks.prot[iRow][iCol] = oBricks.prot[iRow][iCol] - 1;
                aSounds[3].play();
            }
            else
            {
                oBricks.objs[iRow][iCol] = 0;
                iPoints++;
                aSounds[0].play(); 
            }
        }
        else{
            aSounds[1].play();
        }
        oBall.dy = -oBall.dy;
    }
 
    // позиція кульки по Х
    if (oBall.x + oBall.dx + oBall.r > ctx.canvas.width || oBall.x + oBall.dx - oBall.r < 0) {
        oBall.dx = -oBall.dx;
    }

    if (oBall.y + oBall.dy - oBall.r < 0) {
        oBall.dy = -oBall.dy;
    } else if (oBall.y + oBall.dy + oBall.r > ctx.canvas.height - oPadd.h) {
        if (oBall.x > oPadd.x && oBall.x < oPadd.x + oPadd.w) {
            oBall.dx = 10 * ((oBall.x-(oPadd.x+oPadd.w/2))/oPadd.w);
            oBall.dy = -oBall.dy;

            aSounds[2].play();
        }
        else if (oBall.y + oBall.dy + oBall.r > ctx.canvas.height) {
            clearInterval(iStart);
            clearInterval(iGameTimer);

            localStorage.setItem('last-time', iMin + ':' + iSec);
            localStorage.setItem('last-points', iPoints);

            aSounds[1].play(); 
        }
    }

    oBall.x += oBall.dx;
    oBall.y += oBall.dy;

    ctx.font = '16px Verdana';
    ctx.fillStyle = '#fff';
    iMin = Math.floor(iElapsed / 60);
    iSec = iElapsed % 60;
    if (iMin < 10) iMin = "0" + iMin;
    if (iSec < 10) iSec = "0" + iSec;
    ctx.fillText('Time: ' + iMin + ':' + iSec, 600, 520);
    ctx.fillText('Points: ' + iPoints, 600, 550);

    if (sLastTime != null && sLastPoints != null) {
        ctx.fillText('Last Time: ' + sLastTime, 600, 460);
        ctx.fillText('Last Points: ' + sLastPoints, 600, 490);
    }
}


function init(){
    canvas = document.getElementById('scene');
    ctx = canvas.getContext('2d');

    var width = canvas.width;
    var height = canvas.height;

    var padImg = new Image();
    padImg.src = 'images/padd.png';
    padImg.onload = function() {};

    oBall = new Ball(width / 2, 550, 0.5, -5, 20); // початкова позиція кульки
    oPadd = new Padd(width / 2, 120, 20, padImg); // початкова позиція палки
    oBricks = new Bricks((width / 8) - 1, 20, 8, 6, 2); // початкова позиція кубиків

    oBricks.prot = new Array(oBricks.r); // fill-in protection
    oBricks.objs = new Array(oBricks.r); // fill-in bricks

    for (i=0; i < oBricks.r; i++) {
        oBricks.objs[i] = new Array(oBricks.c);
        oBricks.prot[i] = new Array(oBricks.c);
        for (j=0; j < oBricks.c; j++) {
            if(getRandomInt(7)== 3)
            {
                oBricks.prot[i][j] = "unbreaking";
            }
            else
            {
                oBricks.prot[i][j] = i;
            }
            if(getRandomInt(2) == 1)
            {
                oBricks.objs[i][j] = 1;
            }
            else
            {
                if(i === oBricks.r - 1)
                {
                    oBricks.objs[i][j] = 1;
                }
                else
                {
                    oBricks.objs[i][j] = 0;
                }
            }
        }
    }

    aSounds[0] = new Audio('media/snd1.wav');
    aSounds[0].volume = 0.9;
    aSounds[1] = new Audio('media/snd2.wav');
    aSounds[1].volume = 0.9;
    aSounds[2] = new Audio('media/snd3.wav');
    aSounds[2].volume = 0.9;
    aSounds[3] = new Audio('media/snd4.wav');
    aSounds[3].volume = 0.9;

    iStart = setInterval(drawScene, 10); // loop drawScene
    iGameTimer = setInterval(countTimer, 1000); // час

    // HTML5 Local storage - get values
    sLastTime = localStorage.getItem('last-time');
    sLastPoints = localStorage.getItem('last-points');

    $(window).keydown(function(event){ //керування клавішами
        switch (event.keyCode) { 
            case 37:
                bLeftBut = true;
                break;
            case 39: 
                bRightBut = true;
                break;
        }
    });
    $(window).keyup(function(event){ //
        switch (event.keyCode) {
            case 37: 
                bLeftBut = false;
                break;
            case 39:
                bRightBut = false;
                break;
        }
    });

    var iCanvX1 = $(canvas).offset().left;
    var iCanvX2 = iCanvX1 + width;
    $('#scene').mousemove(function(e) { // керування мишею
        if (e.pageX > iCanvX1 && e.pageX < iCanvX2) {
            oPadd.x = Math.max(e.pageX - iCanvX1 - (oPadd.w/2), 0);
            oPadd.x = Math.min(ctx.canvas.width - oPadd.w, oPadd.x);
        }
    });
};

function countTimer() {
    iElapsed++;
}