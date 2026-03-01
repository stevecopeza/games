;(function(){
  var TILE=16, COLS=28, ROWS=31, W=COLS*TILE, H=ROWS*TILE, FRAME=1000/60;
  var MAZE=[
    "############################",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#o####.#####.##.#####.####o#",
    "#.####.#####.##.#####.####.#",
    "#..........................#",
    "#.####.##.########.##.####.#",
    "#.####.##.########.##.####.#",
    "#......##....##....##......#",
    "######.##### ## #####.######",
    "######.##### ## #####.######",
    "######.##          ##.######",
    "######.## ###--### ##.######",
    "      .   #      #   .      ",
    "######.## # #### # ##.######",
    "######.## # #### # ##.######",
    "######.## ######## ##.######",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#o..##.......  .......##..o#",
    "###.##.##.########.##.##.###",
    "#......##....##....##......#",
    "#.##########.##.##########.#",
    "#..........................#",
    "############################"
  ];
  function buildWalls(){
    var c=document.createElement('canvas'); c.width=W; c.height=H;
    var g=c.getContext('2d'); g.imageSmoothingEnabled=false;
    for(var r=0;r<MAZE.length;r++){
      for(var cX=0;cX<MAZE[r].length;cX++){
        var ch=MAZE[r][cX];
        if(ch==="#"){ g.fillStyle="#2e5cff"; g.fillRect(cX*TILE,r*TILE,TILE,TILE); }
        else{ g.fillStyle="#111"; g.fillRect(cX*TILE,r*TILE,TILE,TILE); }
      }
    }
    return c;
  }
  function drawPellets(ctx){
    ctx.fillStyle="#ffde8a";
    for(var r=0;r<MAZE.length;r++){
      for(var cX=0;cX<MAZE[r].length;cX++){
        var ch=MAZE[r][cX];
        if(ch==="."||ch==="o"){
          ctx.beginPath();
          ctx.arc(cX*TILE+TILE/2, r*TILE+TILE/2, ch==="."?2:4, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }
  }
  function at(cell){ return MAZE[cell.y] && MAZE[cell.y][cell.x]; }
  function isWall(cell){ return at(cell)==="#"; }
  function toCell(pos){ return {x:(pos.x/TILE)|0,y:(pos.y/TILE)|0}; }
  function center(cell){ return {x:cell.x*TILE+TILE/2,y:cell.y*TILE+TILE/2}; }
  var DIRV={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}};
  function canMove(cell,dir){
    var v=DIRV[dir], n={x:cell.x+v.x,y:cell.y+v.y};
    if(n.x<0) n.x=COLS-1; if(n.x>=COLS) n.x=0;
    return !isWall(n);
  }
  function eat(cell){
    var row=MAZE[cell.y]; if(!row) return 0;
    var arr=row.split(''); var ch=arr[cell.x]; if(ch==="."||ch==="o"){ arr[cell.x]=" "; MAZE[cell.y]=arr.join(''); return ch==="."?10:50; }
    return 0;
  }
  function Game(canvas){
    var walls=buildWalls(), ctx=canvas.getContext('2d');
    var pac={pos:center({x:13,y:17}),dir:DIRV.left,next:null,speed:1.3,score:0};
    var ghost={pos:center({x:13,y:11}),dir:{x:0,y:0},speed:1};
    function step(){
      var c=toCell(pac.pos);
      if(pac.next && canMove(c,pac.next)){ pac.dir=DIRV[pac.next]; pac.next=null; }
      var ahead={x:c.x+pac.dir.x,y:c.y+pac.dir.y}; if(ahead.x<0) ahead.x=COLS-1; if(ahead.x>=COLS) ahead.x=0;
      if(!isWall(ahead)){ pac.pos.x+=pac.dir.x*pac.speed; pac.pos.y+=pac.dir.y*pac.speed; } else { pac.pos=center(c); }
      var c2=toCell(pac.pos); pac.score+=eat(c2);
      var gc=toCell(ghost.pos);
      var choices=['left','right','up','down'].filter(function(d){ return canMove(gc,d); });
      if(choices.length){ var d=choices[(Math.random()*choices.length)|0]; ghost.dir=DIRV[d]; }
      var ga={x:gc.x+ghost.dir.x,y:gc.y+ghost.dir.y}; if(ga.x<0)ga.x=COLS-1; if(ga.x>=COLS)ga.x=0;
      if(!isWall(ga)){ ghost.pos.x+=ghost.dir.x*ghost.speed; ghost.pos.y+=ghost.dir.y*ghost.speed; } else { ghost.pos=center(gc); }
    }
    function draw(){
      ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H); ctx.drawImage(walls,0,0);
      drawPellets(ctx);
      ctx.fillStyle="#ffe400"; ctx.beginPath(); ctx.arc(pac.pos.x,pac.pos.y,TILE/2-1,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#00ffff"; ctx.beginPath(); ctx.arc(ghost.pos.x,ghost.pos.y,TILE/2-1,0,Math.PI*2); ctx.fill();
    }
    return {
      frame:function(){ step(); draw(); return pac.score; },
      setNext:function(dir){ pac.next=dir in DIRV ? dir : null; }
    };
  }
  var setDir=null;
  if(!window.__gamesPacmanKeys){
    window.__gamesPacmanKeys=true;
    window.addEventListener('keydown',function(e){
      if(!setDir) return;
      var k=e.key.toLowerCase();
      if(k==='arrowleft'||k==='a') setDir('left');
      else if(k==='arrowright'||k==='d') setDir('right');
      else if(k==='arrowup'||k==='w') setDir('up');
      else if(k==='arrowdown'||k==='s') setDir('down');
    });
  }
  window.GamesPacman={
    start:function(canvasSel,scoreSel){
      var node=document.querySelector(canvasSel), scoreNode=document.querySelector(scoreSel);
      if(!node) return;
      var cv=node.getContext ? node : document.createElement('canvas');
      if(!node.getContext){ cv.width=W; cv.height=H; node.appendChild(cv); }
      // Fit canvas to window while preserving aspect ratio
      function fit(){
        var vw=window.innerWidth, vh=window.innerHeight;
        var scale=Math.min(vw/W, vh/H)*0.95;
        cv.style.width=(W*scale|0)+'px';
        cv.style.height=(H*scale|0)+'px';
      }
      window.addEventListener('resize', fit); fit();
      var g=Game(cv); setDir=function(dir){ g.setNext(dir); };
      function loop(){ var s=g.frame(); if(scoreNode) scoreNode.textContent=String(s); requestAnimationFrame(loop); }
      requestAnimationFrame(loop);
    }
  };
})(); 
