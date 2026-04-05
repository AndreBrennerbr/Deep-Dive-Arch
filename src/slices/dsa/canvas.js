import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderDSA(canvas) {
  const engine = new BaseRenderer(canvas);

  const COLORS = {
    bg:      '#050a15',
    pink:    '#ec4899',
    pinkD:   'rgba(236,72,153,0.15)',
    blue:    '#3b82f6',
    green:   '#4ade80',
    purple:  '#c084fc',
    red:     '#ef4444',
    yellow:  '#facc15',
    cyan:    '#22d3ee',
    orange:  '#f97316',
    dim:     '#334155',
    text:    '#e2e8f0',
    sub:     '#94a3b8',
    panel:   '#0f172a'
  };

  engine.drawStep = function(stepIdx) {
    this.stop();
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;
    let t = 0;

    const clear = () => { ctx.fillStyle = COLORS.bg; ctx.fillRect(0,0,W,H); };

    const drawRoundedRect = (x,y,w,h,r,fill,stroke) => {
      ctx.beginPath();
      ctx.roundRect(x,y,w,h,r);
      if(fill) { ctx.fillStyle = fill; ctx.fill(); }
      if(stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
    };

    const label = (text, x, y, color, size, align) => {
      ctx.fillStyle = color || COLORS.text;
      ctx.font = `${size || 13}px sans-serif`;
      ctx.textAlign = align || 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
    };

    const boldLabel = (text, x, y, color, size, align) => {
      ctx.fillStyle = color || COLORS.text;
      ctx.font = `bold ${size || 14}px sans-serif`;
      ctx.textAlign = align || 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
    };

    const arrow = (x1,y1,x2,y2,color) => {
      ctx.beginPath();
      ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
      ctx.strokeStyle = color || COLORS.sub;
      ctx.lineWidth = 1.5; ctx.stroke();
      const a = Math.atan2(y2-y1,x2-x1);
      ctx.beginPath();
      ctx.moveTo(x2,y2);
      ctx.lineTo(x2-8*Math.cos(a-0.4),y2-8*Math.sin(a-0.4));
      ctx.lineTo(x2-8*Math.cos(a+0.4),y2-8*Math.sin(a+0.4));
      ctx.closePath(); ctx.fillStyle = color || COLORS.sub; ctx.fill();
    };

    // ── STEP 0: Complexity ──
    const drawComplexity = () => {
      clear();
      boldLabel('Complexidade & Crescimento Assintótico', W/2, 25, COLORS.pink, 16);

      // Growth curves
      const graphX = 60, graphY = 50, graphW = 500, graphH = 280;
      drawRoundedRect(graphX, graphY, graphW, graphH, 10, COLORS.panel, COLORS.dim);

      // Axes
      ctx.beginPath();
      ctx.moveTo(graphX+40, graphY+graphH-30);
      ctx.lineTo(graphX+graphW-20, graphY+graphH-30);
      ctx.moveTo(graphX+40, graphY+graphH-30);
      ctx.lineTo(graphX+40, graphY+20);
      ctx.strokeStyle = COLORS.sub; ctx.lineWidth = 1; ctx.stroke();
      label('n', graphX+graphW-10, graphY+graphH-15, COLORS.sub, 11);
      label('T(n)', graphX+25, graphY+15, COLORS.sub, 11);

      const curves = [
        { name: 'O(1)', color: COLORS.green, fn: ()=>0.05 },
        { name: 'O(log n)', color: COLORS.cyan, fn: (x)=>Math.log(x+1)/6 },
        { name: 'O(n)', color: COLORS.blue, fn: (x)=>x },
        { name: 'O(n log n)', color: COLORS.yellow, fn: (x)=>x*Math.log(x+1)/4 },
        { name: 'O(n²)', color: COLORS.orange, fn: (x)=>x*x },
        { name: 'O(2ⁿ)', color: COLORS.red, fn: (x)=>Math.pow(2,x*5)/100 }
      ];

      const maxN = 1.0, steps = 60;
      const scaleX = (graphW-70)/maxN;
      const scaleY = (graphH-60);
      const baseX = graphX+40;
      const baseY = graphY+graphH-30;

      curves.forEach((c, ci) => {
        ctx.beginPath();
        for(let i=0;i<=steps;i++){
          const x = (i/steps)*maxN;
          let y = c.fn(x);
          if(y>1) y=1;
          const px = baseX + x*scaleX;
          const py = baseY - y*scaleY;
          if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
        }
        ctx.strokeStyle = c.color; ctx.lineWidth = 2; ctx.stroke();
      });

      // Legend
      const legX = 600, legY = 60;
      boldLabel('Complexidades', legX+100, legY, COLORS.pink, 13);
      curves.forEach((c, i) => {
        const y = legY + 25 + i*35;
        drawRoundedRect(legX+10, y-10, 180, 28, 6, COLORS.panel, c.color+'60');
        ctx.beginPath(); ctx.moveTo(legX+20,y+4); ctx.lineTo(legX+50,y+4);
        ctx.strokeStyle = c.color; ctx.lineWidth = 3; ctx.stroke();
        label(c.name, legX+120, y+4, c.color, 12);
      });

      // Animated n marker
      const animN = (t % 120) / 120;
      const markerX = baseX + animN*scaleX;
      ctx.beginPath();
      ctx.moveTo(markerX, baseY); ctx.lineTo(markerX, graphY+20);
      ctx.strokeStyle = COLORS.pink+'60'; ctx.lineWidth = 1;
      ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
      label('n='+Math.floor(animN*100), markerX, baseY+15, COLORS.pink, 10);

      // Master theorem box
      drawRoundedRect(600, 295, 230, 85, 8, COLORS.panel, COLORS.pink+'60');
      boldLabel('Master Theorem', 715, 310, COLORS.pink, 11);
      label('T(n) = aT(n/b) + O(nᵈ)', 715, 330, COLORS.text, 10);
      label('d < logb(a) → O(n^logb a)', 715, 348, COLORS.cyan, 9);
      label('d = logb(a) → O(nᵈ log n)', 715, 363, COLORS.green, 9);
      label('d > logb(a) → O(nᵈ)', 715, 378, COLORS.yellow, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawComplexity);
    };

    // ── STEP 1: Linear Structures ──
    const drawLinear = () => {
      clear();
      boldLabel('Estruturas Lineares', W/2, 25, COLORS.pink, 16);

      // Array
      const arrX = 50, arrY = 55;
      boldLabel('Array (contíguo)', 200, arrY, COLORS.cyan, 13);
      const arrVals = [10,20,30,40,50,60,70,80];
      const cw = 70, ch = 36;
      arrVals.forEach((v,i) => {
        const x = arrX + i*cw;
        const highlight = i === Math.floor(t/30)%8;
        drawRoundedRect(x, arrY+15, cw-4, ch, 4, highlight ? COLORS.pinkD : COLORS.panel, highlight ? COLORS.pink : COLORS.dim);
        boldLabel(String(v), x+cw/2-2, arrY+15+ch/2, highlight ? COLORS.pink : COLORS.text, 12);
        label('['+i+']', x+cw/2-2, arrY+15+ch+12, COLORS.sub, 9);
      });
      label('O(1) acesso | O(n) insert', arrX+arrVals.length*cw/2, arrY+75, COLORS.sub, 10);

      // Linked List
      const llY = 155;
      boldLabel('Linked List', 200, llY, COLORS.green, 13);
      const llVals = ['10','20','30','40','50'];
      const nw = 80, nh = 36;
      llVals.forEach((v,i) => {
        const x = 50 + i*(nw+30);
        drawRoundedRect(x, llY+15, nw, nh, 6, COLORS.panel, COLORS.green+'80');
        boldLabel(v, x+25, llY+15+nh/2, COLORS.green, 12);
        label('next', x+60, llY+15+nh/2, COLORS.sub, 9);
        if(i<llVals.length-1){
          arrow(x+nw, llY+15+nh/2, x+nw+30, llY+15+nh/2, COLORS.green);
        }
      });
      label('null', 50+llVals.length*(nw+30)-20, llY+15+nh/2, COLORS.red, 10);
      label('O(1) insert/delete (with ref) | O(n) acesso', 300, llY+65, COLORS.sub, 10);

      // Stack & Queue
      const stY = 245;
      boldLabel('Stack (LIFO)', 160, stY, COLORS.orange, 13);
      const stackVals = [3, 7, 1, 9];
      const sPhase = Math.floor(t/40) % 4;
      const visibleStack = stackVals.slice(0, sPhase+1);
      visibleStack.forEach((v,i) => {
        const y = stY + 100 - i*28;
        drawRoundedRect(100, y, 120, 24, 4, i===visibleStack.length-1 ? 'rgba(249,115,22,0.2)' : COLORS.panel, i===visibleStack.length-1 ? COLORS.orange : COLORS.dim);
        label(String(v), 160, y+12, i===visibleStack.length-1 ? COLORS.orange : COLORS.text, 12);
      });
      if(visibleStack.length>0){
        label('← top', 235, stY+100-(visibleStack.length-1)*28+12, COLORS.orange, 10);
      }
      label('push/pop O(1)', 160, stY+130, COLORS.sub, 10);

      // Queue
      boldLabel('Queue (FIFO)', 550, stY, COLORS.blue, 13);
      const qVals = ['A','B','C','D'];
      const qPhase = Math.floor(t/45) % 5;
      const visibleQ = qVals.slice(Math.min(qPhase,3), Math.min(qPhase+3, 4));
      drawRoundedRect(400, stY+40, 320, 50, 8, COLORS.panel, COLORS.blue+'60');
      visibleQ.forEach((v,i) => {
        const x = 420 + i*70;
        drawRoundedRect(x, stY+48, 55, 30, 4, 'rgba(59,130,246,0.15)', COLORS.blue);
        boldLabel(v, x+27, stY+63, COLORS.blue, 13);
      });
      if(visibleQ.length>0) {
        label('front →', 400, stY+110, COLORS.cyan, 10);
        label('← rear', 590, stY+110, COLORS.purple, 10);
      }
      label('enqueue/dequeue O(1)', 550, stY+130, COLORS.sub, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawLinear);
    };

    // ── STEP 2: Trees & Heaps ──
    const drawTrees = () => {
      clear();
      boldLabel('Árvores Binárias & Heaps', W/2, 22, COLORS.pink, 16);

      // BST
      const treeData = {v:42, l:{v:20, l:{v:10}, r:{v:30}}, r:{v:65, l:{v:50}, r:{v:80}}};
      const drawNode = (node, x, y, spread, depth) => {
        if(!node) return;
        const highlight = Math.floor(t/50) % 7 === node.v/10|0;
        if(node.l) {
          ctx.beginPath(); ctx.moveTo(x,y+12); ctx.lineTo(x-spread,y+55);
          ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1.5; ctx.stroke();
          drawNode(node.l, x-spread, y+55, spread*0.55, depth+1);
        }
        if(node.r) {
          ctx.beginPath(); ctx.moveTo(x,y+12); ctx.lineTo(x+spread,y+55);
          ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1.5; ctx.stroke();
          drawNode(node.r, x+spread, y+55, spread*0.55, depth+1);
        }
        ctx.beginPath(); ctx.arc(x,y,16,0,Math.PI*2);
        ctx.fillStyle = highlight ? COLORS.pink : COLORS.panel; ctx.fill();
        ctx.strokeStyle = highlight ? COLORS.pink : COLORS.cyan; ctx.lineWidth = 2; ctx.stroke();
        boldLabel(String(node.v), x, y, highlight ? '#fff' : COLORS.cyan, 12);
      };

      boldLabel('BST', 220, 45, COLORS.cyan, 14);
      drawNode(treeData, 220, 75, 100, 0);

      // BST properties
      label('left < node < right', 220, 230, COLORS.sub, 10);
      label('Balanceada: O(log n)', 220, 248, COLORS.green, 10);
      label('Desbalanceada: O(n)', 220, 266, COLORS.red, 10);

      // Balancing types
      const balX = 470;
      boldLabel('Auto-Balanceamento', 670, 45, COLORS.yellow, 13);
      drawRoundedRect(balX, 60, 180, 55, 8, COLORS.panel, COLORS.yellow+'60');
      boldLabel('AVL', balX+90, 75, COLORS.yellow, 12);
      label('|h(L)-h(R)| ≤ 1', balX+90, 95, COLORS.sub, 10);

      drawRoundedRect(balX+200, 60, 180, 55, 8, COLORS.panel, COLORS.red+'60');
      boldLabel('Red-Black', balX+290, 75, COLORS.red, 12);
      label('Linux CFS, std::map', balX+290, 95, COLORS.sub, 10);

      // Heap
      boldLabel('Min-Heap (array)', 670, 145, COLORS.green, 13);
      const heapArr = [2,5,3,8,7,6,4];
      // Draw as array
      heapArr.forEach((v,i) => {
        const x = balX + i*50;
        drawRoundedRect(x, 165, 44, 28, 4, COLORS.panel, COLORS.green+'60');
        label(String(v), x+22, 179, COLORS.green, 11);
        label(String(i), x+22, 199, COLORS.sub, 9);
      });

      // Draw as tree
      const heapNodes = [[2,670,240],[5,610,280],[3,730,280],[8,580,320],[7,640,320],[6,700,320],[4,760,320]];
      // Edges
      [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]].forEach(([p,c])=>{
        ctx.beginPath();
        ctx.moveTo(heapNodes[p][1],heapNodes[p][2]+10);
        ctx.lineTo(heapNodes[c][1],heapNodes[c][2]-10);
        ctx.strokeStyle=COLORS.dim; ctx.lineWidth=1; ctx.stroke();
      });
      heapNodes.forEach(([v,x,y],i) => {
        const isMin = i===0;
        ctx.beginPath(); ctx.arc(x,y,14,0,Math.PI*2);
        ctx.fillStyle = isMin ? COLORS.green : COLORS.panel; ctx.fill();
        ctx.strokeStyle = COLORS.green; ctx.lineWidth = 1.5; ctx.stroke();
        boldLabel(String(v), x, y, isMin ? '#000' : COLORS.green, 11);
      });
      label('parent ≤ children', 670, 355, COLORS.sub, 10);
      label('insert/extract: O(log n) | peek: O(1)', 670, 373, COLORS.sub, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawTrees);
    };

    // ── STEP 3: Hash Tables & Graphs ──
    const drawHashGraphs = () => {
      clear();
      boldLabel('Hash Tables & Grafos', W/2, 22, COLORS.pink, 16);

      // Hash table
      boldLabel('Hash Table (Chaining)', 190, 48, COLORS.cyan, 13);
      const buckets = [null,'alice→42',null,'bob→17, carol→99',null,null,'dave→5',null];
      buckets.forEach((b,i) => {
        const y = 65 + i*35;
        drawRoundedRect(50, y, 50, 28, 4, COLORS.panel, COLORS.dim);
        label(String(i), 75, y+14, COLORS.sub, 10);
        if(b) {
          const highlight = Math.floor(t/40)%8===i;
          drawRoundedRect(110, y, 220, 28, 4, highlight ? COLORS.pinkD : 'rgba(34,211,238,0.06)', highlight ? COLORS.pink : COLORS.cyan+'60');
          label(b, 220, y+14, highlight ? COLORS.pink : COLORS.cyan, 10);
          arrow(100, y+14, 110, y+14, COLORS.cyan);
        }
      });
      label('hash(key)→index | O(1) avg', 190, 360, COLORS.sub, 10);

      // Graph
      boldLabel('Grafo — BFS / DFS', 640, 48, COLORS.green, 13);
      const nodes = [[510,100,'0'],[600,80,'1'],[690,100,'2'],[550,170,'3'],[650,180,'4']];
      const edges = [[0,1],[0,2],[1,3],[2,3],[3,4]];
      const bfsOrder = [0,1,2,3,4];
      const bfsPhase = Math.floor(t/50) % 6;

      edges.forEach(([a,b]) => {
        ctx.beginPath();
        ctx.moveTo(nodes[a][0],nodes[a][1]);
        ctx.lineTo(nodes[b][0],nodes[b][1]);
        ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1.5; ctx.stroke();
      });

      nodes.forEach(([x,y,lbl],i) => {
        const visited = bfsOrder.indexOf(i) < bfsPhase;
        const current = bfsOrder.indexOf(i) === bfsPhase-1;
        ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2);
        ctx.fillStyle = current ? COLORS.green : (visited ? 'rgba(74,222,128,0.2)' : COLORS.panel);
        ctx.fill();
        ctx.strokeStyle = visited||current ? COLORS.green : COLORS.dim; ctx.lineWidth = 2; ctx.stroke();
        boldLabel(lbl, x, y, current ? '#000' : (visited ? COLORS.green : COLORS.sub), 13);
      });

      // BFS queue visualization
      drawRoundedRect(490, 220, 260, 35, 6, COLORS.panel, COLORS.blue+'60');
      boldLabel('BFS Queue:', 530, 238, COLORS.blue, 10);
      const queueItems = bfsOrder.slice(Math.max(0,bfsPhase-1), Math.min(bfsPhase+2, 5));
      queueItems.forEach((v,i) => {
        label(nodes[v][2], 590+i*30, 238, COLORS.green, 12);
      });

      // DFS
      drawRoundedRect(490, 270, 260, 35, 6, COLORS.panel, COLORS.orange+'60');
      boldLabel('DFS Stack:', 530, 288, COLORS.orange, 10);

      // Adjacency list
      boldLabel('Adj List:', 540, 325, COLORS.sub, 11);
      const adj = ['0→[1,2]','1→[0,3]','2→[0,3]','3→[1,2,4]','4→[3]'];
      adj.forEach((a,i) => {
        label(a, 540+((i%3)*90), 345+Math.floor(i/3)*18, COLORS.sub, 9);
      });
      label('O(V+E)', 640, 380, COLORS.sub, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawHashGraphs);
    };

    // ── STEP 4: Sorting ──
    const drawSorting = () => {
      clear();
      boldLabel('Algoritmos de Ordenação', W/2, 22, COLORS.pink, 16);

      // Merge sort visualization
      boldLabel('Merge Sort — O(n log n)', 230, 50, COLORS.cyan, 13);
      const levels = [
        [[38,27,43,3,9,82,10]],
        [[38,27,43],[3,9,82,10]],
        [[38],[27,43],[3,9],[82,10]],
        [[27,38,43],[3,9,10,82]],
        [[3,9,10,27,38,43,82]]
      ];
      const mergePhase = Math.floor(t/60) % levels.length;
      const currentLevel = levels[mergePhase];
      const totalWidth = 400;
      let offX = 30;
      currentLevel.forEach((arr, gi) => {
        const groupW = (totalWidth / currentLevel.length) - 10;
        const cellW = Math.min(35, groupW / arr.length);
        const startX = offX + gi*(groupW+20);
        drawRoundedRect(startX, 70, arr.length*cellW+8, 32, 4, COLORS.panel, COLORS.cyan+'60');
        arr.forEach((v,i) => {
          label(String(v), startX+6+i*cellW+cellW/2, 86, COLORS.cyan, 10);
        });
      });
      label('Nível '+(mergePhase+1)+'/5', 230, 115, COLORS.sub, 10);

      // Quick Sort partition
      boldLabel('Quick Sort — Partition', 650, 50, COLORS.orange, 13);
      const qArr = [38,27,43,3,9,82,10];
      const pivot = 43;
      const pivotIdx = 2;
      qArr.forEach((v,i) => {
        const x = 500+i*45;
        const isPivot = i===pivotIdx;
        const isLess = v < pivot && i!==pivotIdx;
        const clr = isPivot ? COLORS.orange : (isLess ? COLORS.green : COLORS.red);
        drawRoundedRect(x, 70, 40, 32, 4, COLORS.panel, clr+'80');
        boldLabel(String(v), x+20, 86, clr, 11);
      });
      label('pivot=43', 710, 115, COLORS.orange, 10);
      label('≤ pivot (green) | > pivot (red)', 650, 133, COLORS.sub, 9);

      // Comparison table
      const tblY = 160;
      boldLabel('Comparação de Sorts', W/2, tblY, COLORS.pink, 13);
      const sorts = [
        ['Algoritmo','Melhor','Médio','Pior','Espaço','Estável'],
        ['Merge Sort','n log n','n log n','n log n','O(n)','Sim'],
        ['Quick Sort','n log n','n log n','n²','O(log n)','Não'],
        ['Heap Sort','n log n','n log n','n log n','O(1)','Não'],
        ['Tim Sort','n','n log n','n log n','O(n)','Sim'],
        ['Counting','n+k','n+k','n+k','O(k)','Sim'],
        ['Insertion','n','n²','n²','O(1)','Sim']
      ];
      const colW = [120,75,75,75,65,55];
      sorts.forEach((row,ri) => {
        const y = tblY+20+ri*26;
        const isHeader = ri===0;
        let cx = 100;
        row.forEach((cell,ci) => {
          const clr = isHeader ? COLORS.pink : (ci===0 ? COLORS.text : COLORS.sub);
          const sz = isHeader ? 10 : 9;
          label(cell, cx+colW[ci]/2, y, clr, sz);
          cx += colW[ci];
        });
        if(!isHeader) {
          ctx.beginPath();
          ctx.moveTo(100, y+12); ctx.lineTo(100+colW.reduce((a,b)=>a+b,0), y+12);
          ctx.strokeStyle = COLORS.dim+'40'; ctx.lineWidth = 0.5; ctx.stroke();
        }
      });

      // Binary search
      boldLabel('Binary Search — O(log n)', 650, tblY+15, COLORS.green, 12);
      const bsArr = [3,9,10,27,38,43,82];
      const target = 38;
      const bsPhase = Math.floor(t/50) % 4;
      const ranges = [[0,6],[4,6],[4,4]];
      const range = ranges[Math.min(bsPhase, ranges.length-1)];
      bsArr.forEach((v,i) => {
        const x = 508+i*42;
        const inRange = i>=range[0] && i<=range[1];
        const isMid = i===Math.floor((range[0]+range[1])/2);
        const clr = isMid ? COLORS.green : (inRange ? COLORS.blue : COLORS.dim);
        drawRoundedRect(x, tblY+35, 38, 28, 4, COLORS.panel, clr);
        label(String(v), x+19, tblY+49, clr, 10);
      });
      label('target='+target, 650, tblY+75, COLORS.green, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawSorting);
    };

    // ── STEP 5: Advanced Algorithms ──
    const drawAdvanced = () => {
      clear();
      boldLabel('DP, Greedy & Shortest Path', W/2, 22, COLORS.pink, 16);

      // DP — Fibonacci tree
      boldLabel('Dynamic Programming — Fibonacci', 220, 48, COLORS.yellow, 13);
      const dpNodes = [
        [220,80,'f(5)',COLORS.yellow],
        [140,120,'f(4)',COLORS.yellow],
        [300,120,'f(3)',COLORS.green],
        [100,160,'f(3)',COLORS.green],
        [180,160,'f(2)',COLORS.cyan],
        [260,160,'f(2)',COLORS.cyan],
        [340,160,'f(1)',COLORS.sub]
      ];
      const dpEdges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];
      const dpPhase = Math.floor(t/40) % 7;

      dpEdges.forEach(([a,b]) => {
        ctx.beginPath();
        ctx.moveTo(dpNodes[a][0],dpNodes[a][1]+8);
        ctx.lineTo(dpNodes[b][0],dpNodes[b][1]-8);
        ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1; ctx.stroke();
      });

      dpNodes.forEach(([x,y,lbl,color],i) => {
        const active = i <= dpPhase;
        const isCached = (lbl==='f(3)' && i>2) || (lbl==='f(2)' && i>4);
        ctx.beginPath(); ctx.arc(x,y,16,0,Math.PI*2);
        ctx.fillStyle = isCached ? 'rgba(74,222,128,0.3)' : (active ? color+'30' : COLORS.panel);
        ctx.fill();
        ctx.strokeStyle = active ? color : COLORS.dim; ctx.lineWidth = 1.5; ctx.stroke();
        label(lbl, x, y, active ? color : COLORS.dim, 9);
        if(isCached) label('cache!', x+25, y-5, COLORS.green, 8);
      });

      label('Memoization: O(n) vs naive O(2ⁿ)', 220, 200, COLORS.sub, 10);

      // Dijkstra
      boldLabel('Dijkstra — Shortest Path', 650, 48, COLORS.blue, 13);
      const djNodes = [[530,90,'S',0],[620,70,'A',4],[710,90,'B',7],[570,160,'C',2],[660,165,'D',5],[740,160,'E',9]];
      const djEdges = [[0,1,4],[0,3,2],[1,2,3],[1,4,1],[3,4,3],[4,5,4],[2,5,2]];
      const djPhase = Math.floor(t/50) % 7;
      const visited = djNodes.filter((_,i) => i <= djPhase);

      djEdges.forEach(([a,b,w]) => {
        ctx.beginPath();
        ctx.moveTo(djNodes[a][0],djNodes[a][1]);
        ctx.lineTo(djNodes[b][0],djNodes[b][1]);
        ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1; ctx.stroke();
        const mx = (djNodes[a][0]+djNodes[b][0])/2;
        const my = (djNodes[a][0]+djNodes[b][1])/2 - 8;
        label(String(w), mx, my, COLORS.sub, 9);
      });

      djNodes.forEach(([x,y,lbl,dist],i) => {
        const isVisited = i <= djPhase;
        ctx.beginPath(); ctx.arc(x,y,16,0,Math.PI*2);
        ctx.fillStyle = isVisited ? COLORS.blue+'40' : COLORS.panel;
        ctx.fill();
        ctx.strokeStyle = isVisited ? COLORS.blue : COLORS.dim;
        ctx.lineWidth = 2; ctx.stroke();
        boldLabel(lbl, x, y, isVisited ? COLORS.blue : COLORS.sub, 11);
        label('d='+dist, x, y+24, isVisited ? COLORS.green : COLORS.dim, 9);
      });

      // Greedy vs DP
      const bottomY = 210;
      drawRoundedRect(50, bottomY, 380, 80, 10, COLORS.panel, COLORS.yellow+'40');
      boldLabel('Greedy', 240, bottomY+15, COLORS.yellow, 13);
      label('Escolha local ótima → global ótimo', 240, bottomY+35, COLORS.sub, 10);
      label('Interval Scheduling, Huffman, Kruskal, Dijkstra', 240, bottomY+55, COLORS.yellow, 9);

      drawRoundedRect(460, bottomY, 380, 80, 10, COLORS.panel, COLORS.purple+'40');
      boldLabel('Dynamic Programming', 650, bottomY+15, COLORS.purple, 13);
      label('Subestrutura ótima + subproblemas sobrepostos', 650, bottomY+35, COLORS.sub, 10);
      label('Knapsack, LCS, Edit Distance, Matrix Chain', 650, bottomY+55, COLORS.purple, 9);

      // NP box
      drawRoundedRect(200, bottomY+100, 500, 65, 10, COLORS.panel, COLORS.red+'40');
      boldLabel('NP-Complete', 450, bottomY+115, COLORS.red, 13);
      label('Verificar: O(poly) | Resolver: O(exp) — se P ≠ NP', 450, bottomY+135, COLORS.sub, 10);
      label('SAT, TSP, Graph Coloring, Knapsack (decision)', 450, bottomY+150, COLORS.red, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawAdvanced);
    };

    // Dispatch
    switch(stepIdx) {
      case 0: drawComplexity(); break;
      case 1: drawLinear(); break;
      case 2: drawTrees(); break;
      case 3: drawHashGraphs(); break;
      case 4: drawSorting(); break;
      case 5: drawAdvanced(); break;
      default: drawComplexity();
    }
  };

  return engine;
}
