import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderMath(canvas) {
  const engine = new BaseRenderer(canvas);

  const COLORS = {
    bg:      '#050a15',
    lime:    '#a3e635',
    limeD:   'rgba(163,230,53,0.15)',
    blue:    '#3b82f6',
    green:   '#4ade80',
    purple:  '#c084fc',
    red:     '#ef4444',
    yellow:  '#facc15',
    cyan:    '#22d3ee',
    orange:  '#f97316',
    pink:    '#ec4899',
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

    // ── STEP 0: Logic & Proofs ──
    const drawLogic = () => {
      clear();
      boldLabel('Lógica Proposicional & Provas', W/2, 25, COLORS.lime, 16);

      // Truth table
      boldLabel('Tabela Verdade', 180, 52, COLORS.cyan, 13);
      const headers = ['P','Q','P∧Q','P∨Q','P→Q','¬P'];
      const rows = [
        ['V','V','V','V','V','F'],
        ['V','F','F','V','F','F'],
        ['F','V','F','V','V','V'],
        ['F','F','F','F','V','V']
      ];
      const tw = 55;
      headers.forEach((h,i) => {
        const x = 50 + i*tw;
        drawRoundedRect(x, 65, tw-4, 24, 3, COLORS.limeD, COLORS.lime+'60');
        boldLabel(h, x+tw/2-2, 77, COLORS.lime, 10);
      });
      const highlightRow = Math.floor(t/50)%4;
      rows.forEach((row,ri) => {
        const y = 95 + ri*26;
        const isHL = ri===highlightRow;
        row.forEach((cell,ci) => {
          const x = 50 + ci*tw;
          drawRoundedRect(x, y, tw-4, 22, 3, isHL ? COLORS.limeD : COLORS.panel, COLORS.dim+'60');
          const clr = cell==='V' ? COLORS.green : COLORS.red;
          label(cell, x+tw/2-2, y+11, isHL ? clr : COLORS.sub, 10);
        });
      });

      // Logic gates
      boldLabel('De Morgan', 180, 215, COLORS.yellow, 12);
      drawRoundedRect(50, 228, 260, 30, 6, COLORS.panel, COLORS.yellow+'40');
      label('¬(P∧Q) ≡ ¬P ∨ ¬Q', 180, 243, COLORS.yellow, 11);
      drawRoundedRect(50, 262, 260, 30, 6, COLORS.panel, COLORS.yellow+'40');
      label('¬(P∨Q) ≡ ¬P ∧ ¬Q', 180, 277, COLORS.yellow, 11);

      // Quantifiers
      boldLabel('Quantificadores', 600, 52, COLORS.purple, 13);
      drawRoundedRect(460, 70, 310, 50, 8, COLORS.panel, COLORS.purple+'40');
      label('∀x ∈ ℕ: x ≥ 0', 615, 85, COLORS.purple, 11);
      label('Universal — "para todo"', 615, 103, COLORS.sub, 9);

      drawRoundedRect(460, 128, 310, 50, 8, COLORS.panel, COLORS.cyan+'40');
      label('∃x ∈ ℤ: x² = 4', 615, 143, COLORS.cyan, 11);
      label('Existencial — "existe"', 615, 161, COLORS.sub, 9);

      // Proof techniques
      boldLabel('Técnicas de Prova', 600, 205, COLORS.lime, 13);
      const proofs = [
        ['Direta','P → Q: assume P, deduza Q', COLORS.green],
        ['Contradição','Assume ¬P, chegue a ⊥', COLORS.red],
        ['Indução','P(0) ∧ [P(k)→P(k+1)] → ∀n.P(n)', COLORS.yellow],
        ['Contrapositiva','P→Q ≡ ¬Q→¬P', COLORS.blue]
      ];
      proofs.forEach(([name,desc,clr],i) => {
        const y = 225 + i*38;
        drawRoundedRect(460, y, 310, 32, 6, COLORS.panel, clr+'50');
        boldLabel(name, 520, y+16, clr, 10, 'left');
        label(desc, 630, y+16, COLORS.sub, 8, 'left');
      });

      // Induction example
      boldLabel('Indução Matemática', 180, 310, COLORS.green, 11);
      const indStep = Math.floor(t/60) % 4;
      const indSteps = ['Base: P(0)','Hipótese: P(k)','Passo: P(k)→P(k+1)','∴ ∀n P(n) ✓'];
      indSteps.forEach((s,i) => {
        const y = 330 + i*24;
        const active = i <= indStep;
        label(s, 180, y, active ? COLORS.green : COLORS.dim, 10);
        if(active && i===indStep) {
          label('◀', 280, y, COLORS.lime, 10);
        }
      });

      t++;
      this.animFrame = requestAnimationFrame(drawLogic);
    };

    // ── STEP 1: Sets & Relations ──
    const drawSets = () => {
      clear();
      boldLabel('Conjuntos, Relações & Funções', W/2, 25, COLORS.lime, 16);

      // Venn diagram
      boldLabel('Operações com Conjuntos', 230, 52, COLORS.cyan, 13);
      const cxA = 190, cxB = 270, cy = 140, cr = 70;
      const ops = ['A ∪ B','A ∩ B','A \\ B','A △ B'];
      const opIdx = Math.floor(t/60) % 4;

      ctx.save();
      ctx.globalAlpha = 0.15;
      // A circle
      ctx.beginPath(); ctx.arc(cxA, cy, cr, 0, Math.PI*2);
      ctx.fillStyle = (opIdx===0||opIdx===2||opIdx===3) ? COLORS.blue : COLORS.panel;
      ctx.fill();
      // B circle
      ctx.beginPath(); ctx.arc(cxB, cy, cr, 0, Math.PI*2);
      ctx.fillStyle = (opIdx===0||opIdx===3) ? COLORS.cyan : COLORS.panel;
      ctx.fill();
      ctx.restore();

      // Intersection highlight
      if(opIdx===1) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath(); ctx.arc(cxA, cy, cr, 0, Math.PI*2);
        ctx.clip();
        ctx.beginPath(); ctx.arc(cxB, cy, cr, 0, Math.PI*2);
        ctx.fillStyle = COLORS.green; ctx.fill();
        ctx.restore();
      }

      ctx.beginPath(); ctx.arc(cxA, cy, cr, 0, Math.PI*2);
      ctx.strokeStyle = COLORS.blue; ctx.lineWidth = 2; ctx.stroke();
      boldLabel('A', cxA-30, cy, COLORS.blue, 14);

      ctx.beginPath(); ctx.arc(cxB, cy, cr, 0, Math.PI*2);
      ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 2; ctx.stroke();
      boldLabel('B', cxB+30, cy, COLORS.cyan, 14);

      boldLabel(ops[opIdx], 230, 225, COLORS.lime, 14);

      // Relations
      boldLabel('Relações', 620, 52, COLORS.yellow, 13);
      const relTypes = [
        ['Reflexiva','∀a: aRa', COLORS.green],
        ['Simétrica','aRb → bRa', COLORS.blue],
        ['Transitiva','aRb ∧ bRc → aRc', COLORS.purple],
        ['Equivalência','Ref + Sim + Trans', COLORS.yellow],
        ['Ordem Parcial','Ref + Anti + Trans', COLORS.orange]
      ];
      relTypes.forEach(([name,desc,clr],i) => {
        const y = 72 + i*35;
        drawRoundedRect(480, y, 280, 28, 6, COLORS.panel, clr+'50');
        boldLabel(name, 540, y+14, clr, 10, 'left');
        label(desc, 700, y+14, COLORS.sub, 9);
      });

      // Functions
      boldLabel('Funções', W/2, 260, COLORS.lime, 13);
      const funcs = [
        { name:'Injetora', desc:'f(a)=f(b) → a=b', color:COLORS.green, map:[[0,0],[1,1],[2,3]] },
        { name:'Sobrejetora', desc:'∀b, ∃a: f(a)=b', color:COLORS.blue, map:[[0,0],[1,1],[2,1],[3,2]] },
        { name:'Bijetora', desc:'Inj + Sobre', color:COLORS.purple, map:[[0,0],[1,1],[2,2]] }
      ];
      funcs.forEach((fn, fi) => {
        const bx = 80 + fi*260;
        drawRoundedRect(bx, 280, 240, 100, 8, COLORS.panel, fn.color+'40');
        boldLabel(fn.name, bx+120, 295, fn.color, 12);
        label(fn.desc, bx+120, 313, COLORS.sub, 9);
        // Draw mapping arrows
        const domX = bx+40, codX = bx+180;
        fn.map.forEach(([a,b]) => {
          const ay = 335 + a*16;
          const by = 335 + b*16;
          ctx.beginPath();
          ctx.arc(domX, ay, 3, 0, Math.PI*2);
          ctx.fillStyle = fn.color; ctx.fill();
          ctx.beginPath();
          ctx.arc(codX, by, 3, 0, Math.PI*2);
          ctx.fillStyle = fn.color; ctx.fill();
          arrow(domX+4, ay, codX-4, by, fn.color+'80');
        });
      });

      t++;
      this.animFrame = requestAnimationFrame(drawSets);
    };

    // ── STEP 2: Combinatorics & Probability ──
    const drawCombinatorics = () => {
      clear();
      boldLabel('Combinatória & Probabilidade', W/2, 25, COLORS.lime, 16);

      // Permutations/Combinations
      boldLabel('Contagem', 200, 52, COLORS.cyan, 13);
      drawRoundedRect(40, 65, 320, 40, 8, COLORS.panel, COLORS.cyan+'40');
      label('Permutação: P(n,k) = n! / (n-k)!', 200, 77, COLORS.cyan, 11);
      label('Ordem importa', 200, 95, COLORS.sub, 9);

      drawRoundedRect(40, 112, 320, 40, 8, COLORS.panel, COLORS.green+'40');
      label('Combinação: C(n,k) = n! / k!(n-k)!', 200, 124, COLORS.green, 11);
      label('Ordem NÃO importa', 200, 142, COLORS.sub, 9);

      // Pascal triangle
      boldLabel("Triângulo de Pascal", 200, 170, COLORS.yellow, 11);
      const pascal = [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1],[1,5,10,10,5,1]];
      const highlightPascalRow = Math.floor(t/50) % pascal.length;
      pascal.forEach((row, ri) => {
        row.forEach((v, ci) => {
          const x = 200 - (row.length-1)*20 + ci*40;
          const y = 190 + ri*25;
          const isHL = ri === highlightPascalRow;
          ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI*2);
          ctx.fillStyle = isHL ? COLORS.limeD : COLORS.panel; ctx.fill();
          ctx.strokeStyle = isHL ? COLORS.lime : COLORS.dim; ctx.lineWidth = 1; ctx.stroke();
          label(String(v), x, y, isHL ? COLORS.lime : COLORS.sub, 9);
        });
      });

      // Probability
      boldLabel('Probabilidade', 620, 52, COLORS.purple, 13);

      // Bayes' theorem
      drawRoundedRect(450, 68, 340, 45, 8, COLORS.panel, COLORS.purple+'40');
      boldLabel('Bayes', 530, 82, COLORS.purple, 11);
      label('P(A|B) = P(B|A)·P(A) / P(B)', 620, 100, COLORS.purple, 10);

      // Distributions
      boldLabel('Distribuições', 620, 130, COLORS.orange, 11);
      // Bell curve
      const bellX = 470, bellY = 155, bellW = 280, bellH = 80;
      drawRoundedRect(bellX, bellY, bellW, bellH, 8, COLORS.panel, COLORS.dim);
      ctx.beginPath();
      for(let i=0; i<=bellW-20; i++){
        const x = bellX+10+i;
        const norm = (i-(bellW-20)/2) / ((bellW-20)/4);
        const y = bellY+bellH-15 - (bellH-25)*Math.exp(-norm*norm/2);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = COLORS.orange; ctx.lineWidth = 2; ctx.stroke();
      label('Normal (Gaussiana)', 620, bellY+bellH-8, COLORS.orange, 9);

      // μ, σ markers
      const mu = bellX + bellW/2;
      ctx.beginPath(); ctx.moveTo(mu, bellY+15); ctx.lineTo(mu, bellY+bellH-18);
      ctx.strokeStyle = COLORS.lime+'60'; ctx.lineWidth = 1;
      ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
      label('μ', mu, bellY+10, COLORS.lime, 10);

      // Expected value
      drawRoundedRect(450, 248, 340, 38, 6, COLORS.panel, COLORS.yellow+'40');
      label('E[X] = Σ xᵢ·P(xᵢ)    Var[X] = E[(X-μ)²]', 620, 267, COLORS.yellow, 10);

      // Inclusion-exclusion
      boldLabel('Inclusão-Exclusão', W/2, 310, COLORS.lime, 12);
      drawRoundedRect(150, 325, 550, 35, 8, COLORS.panel, COLORS.lime+'30');
      label('|A∪B| = |A|+|B|-|A∩B|    |A∪B∪C| = |A|+|B|+|C|-|A∩B|-|A∩C|-|B∩C|+|A∩B∩C|', W/2, 342, COLORS.lime, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawCombinatorics);
    };

    // ── STEP 3: Graph Theory ──
    const drawGraphTheory = () => {
      clear();
      boldLabel('Teoria dos Grafos Formal', W/2, 25, COLORS.lime, 16);

      // Euler path demo
      boldLabel('Caminho Euleriano', 200, 52, COLORS.cyan, 13);
      const eulerNodes = [[120,100],[220,80],[280,140],[220,180],[120,160]];
      const eulerEdges = [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[0,3]];
      const eulerPhase = Math.floor(t/40) % (eulerEdges.length+1);

      eulerEdges.forEach(([a,b],ei) => {
        ctx.beginPath();
        ctx.moveTo(eulerNodes[a][0],eulerNodes[a][1]);
        ctx.lineTo(eulerNodes[b][0],eulerNodes[b][1]);
        ctx.strokeStyle = ei < eulerPhase ? COLORS.cyan : COLORS.dim;
        ctx.lineWidth = ei < eulerPhase ? 3 : 1.5; ctx.stroke();
      });
      eulerNodes.forEach(([x,y],i) => {
        const degree = eulerEdges.filter(([a,b])=>a===i||b===i).length;
        ctx.beginPath(); ctx.arc(x,y,14,0,Math.PI*2);
        ctx.fillStyle = COLORS.panel; ctx.fill();
        ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 2; ctx.stroke();
        boldLabel(String(i), x, y, COLORS.cyan, 11);
        label('d='+degree, x+20, y-15, COLORS.sub, 8);
      });
      label('Euler: todos vértices grau par', 200, 210, COLORS.sub, 10);

      // Graph coloring
      boldLabel('Coloração de Grafos', 620, 52, COLORS.yellow, 13);
      const colorNodes = [[520,100],[600,80],[680,100],[550,160],[650,160]];
      const colorEdges = [[0,1],[1,2],[0,3],[1,3],[1,4],[2,4],[3,4]];
      const nodeColors = [COLORS.red, COLORS.blue, COLORS.green, COLORS.green, COLORS.red];

      colorEdges.forEach(([a,b]) => {
        ctx.beginPath();
        ctx.moveTo(colorNodes[a][0],colorNodes[a][1]);
        ctx.lineTo(colorNodes[b][0],colorNodes[b][1]);
        ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1.5; ctx.stroke();
      });
      colorNodes.forEach(([x,y],i) => {
        ctx.beginPath(); ctx.arc(x,y,15,0,Math.PI*2);
        ctx.fillStyle = nodeColors[i]+'40'; ctx.fill();
        ctx.strokeStyle = nodeColors[i]; ctx.lineWidth = 2; ctx.stroke();
        boldLabel(String(i), x, y, nodeColors[i], 11);
      });
      label('χ(G) = 3 (cromático)', 620, 190, COLORS.yellow, 10);

      // Max-flow min-cut
      boldLabel('Max-Flow / Min-Cut', W/2, 235, COLORS.lime, 13);
      const flowNodes = [[100,290,'s'],[250,265,'a'],[250,320,'b'],[420,265,'c'],[420,320,'d'],[570,290,'t']];
      const flowEdges = [
        [0,1,'10/10'],[0,2,'8/10'],[1,3,'7/9'],[1,2,'0/4'],[2,4,'8/8'],
        [3,5,'7/10'],[4,5,'8/8'],[3,4,'0/2']
      ];

      flowEdges.forEach(([a,b,cap]) => {
        const [x1,y1] = [flowNodes[a][0],flowNodes[a][1]];
        const [x2,y2] = [flowNodes[b][0],flowNodes[b][1]];
        arrow(x1+16, y1, x2-16, y2, COLORS.dim);
        const mx = (x1+x2)/2, my = (y1+y2)/2 - 10;
        label(cap, mx, my, COLORS.green, 9);
      });

      flowNodes.forEach(([x,y,lbl]) => {
        const isST = lbl==='s' || lbl==='t';
        ctx.beginPath(); ctx.arc(x,y,16,0,Math.PI*2);
        ctx.fillStyle = isST ? COLORS.lime+'30' : COLORS.panel; ctx.fill();
        ctx.strokeStyle = isST ? COLORS.lime : COLORS.dim; ctx.lineWidth = 2; ctx.stroke();
        boldLabel(lbl, x, y, isST ? COLORS.lime : COLORS.sub, 13);
      });

      // Planar formula
      drawRoundedRect(620, 260, 200, 65, 8, COLORS.panel, COLORS.purple+'40');
      boldLabel('Euler (planar)', 720, 275, COLORS.purple, 11);
      label('V - E + F = 2', 720, 295, COLORS.purple, 12);
      label('K₅, K₃₃ → não planar', 720, 313, COLORS.sub, 9);

      label('Max-Flow = 15 = Min-Cut', W/2-50, 355, COLORS.lime, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawGraphTheory);
    };

    // ── STEP 4: Linear Algebra ──
    const drawLinearAlgebra = () => {
      clear();
      boldLabel('Álgebra Linear para CS', W/2, 25, COLORS.lime, 16);

      // Matrix multiplication
      boldLabel('Multiplicação de Matrizes', 220, 52, COLORS.blue, 13);
      const matA = [[1,2],[3,4]], matB = [[5,6],[7,8]], matC = [[19,22],[43,50]];

      const drawMatrix = (mat, x, y, clr, name) => {
        const cw = 36, ch = 28;
        const h = mat.length*ch, w = mat[0].length*cw;
        drawRoundedRect(x, y, w+8, h+8, 4, COLORS.panel, clr+'60');
        mat.forEach((row,ri) => {
          row.forEach((v,ci) => {
            label(String(v), x+6+ci*cw+cw/2, y+6+ri*ch+ch/2, clr, 11);
          });
        });
        if(name) boldLabel(name, x+w/2+4, y-12, clr, 10);
      };

      const animCell = [Math.floor(t/50)%2, Math.floor(t/30)%2];
      drawMatrix(matA, 60, 80, COLORS.blue, 'A');
      label('×', 155, 106, COLORS.sub, 16);
      drawMatrix(matB, 170, 80, COLORS.cyan, 'B');
      label('=', 265, 106, COLORS.sub, 16);
      drawMatrix(matC, 280, 80, COLORS.green, 'C');

      // Highlight computation
      const r = animCell[0], c = animCell[1];
      label(`C[${r},${c}] = ${matA[r][0]}×${matB[0][c]} + ${matA[r][1]}×${matB[1][c]} = ${matC[r][c]}`,
        220, 160, COLORS.yellow, 10);

      // Vectors & Transformations
      boldLabel('Transformação Linear', 620, 52, COLORS.purple, 13);
      const axX = 500, axY = 170;
      // Axes
      ctx.beginPath(); ctx.moveTo(axX-80, axY); ctx.lineTo(axX+120, axY);
      ctx.moveTo(axX, axY+80); ctx.lineTo(axX, axY-100);
      ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1; ctx.stroke();

      // Original vector
      const angle = (t%200)/200 * Math.PI * 2;
      const vx = 60*Math.cos(angle);
      const vy = -40*Math.sin(angle);
      arrow(axX, axY, axX+vx, axY+vy, COLORS.blue);
      label('v', axX+vx+10, axY+vy-10, COLORS.blue, 10);

      // Transformed vector (rotation + scale)
      const tvx = vx*1.3 - vy*0.3;
      const tvy = vx*0.3 + vy*1.3;
      arrow(axX, axY, axX+tvx*0.6, axY+tvy*0.6, COLORS.purple);
      label('Av', axX+tvx*0.6+10, axY+tvy*0.6-10, COLORS.purple, 10);

      // Eigenvalues/SVD
      boldLabel('Conceitos Chave', W/2, 210, COLORS.lime, 13);
      const concepts = [
        ['Autovalores / Autovetores','Av = λv → direções invariantes', COLORS.blue],
        ['SVD','A = UΣVᵀ → decomposição universal', COLORS.purple],
        ['PCA','Projeção nas dirs de maior variância', COLORS.orange],
        ['Rank & Nullspace','dim(im) + dim(ker) = n', COLORS.cyan],
        ['Determinante','det(A) = volume da transformação', COLORS.green]
      ];
      concepts.forEach(([name,desc,clr],i) => {
        const y = 230 + i*34;
        const x = i%2===0 ? 60 : 440;
        const w = 360;
        drawRoundedRect(x, y, w, 28, 6, COLORS.panel, clr+'40');
        boldLabel(name, x+10, y+14, clr, 10, 'left');
        label(desc, x+w-10, y+14, COLORS.sub, 8, 'right');
      });

      t++;
      this.animFrame = requestAnimationFrame(drawLinearAlgebra);
    };

    // ── STEP 5: Number Theory & Cryptography ──
    const drawNumberTheory = () => {
      clear();
      boldLabel('Teoria dos Números & Criptografia', W/2, 25, COLORS.lime, 16);

      // Modular arithmetic clock
      boldLabel('Aritmética Modular', 180, 52, COLORS.cyan, 13);
      const cx = 180, cy = 155, cr = 70;
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI*2);
      ctx.strokeStyle = COLORS.cyan+'60'; ctx.lineWidth = 2; ctx.stroke();

      const mod = 12;
      for(let i=0; i<mod; i++) {
        const ang = (i/mod)*Math.PI*2 - Math.PI/2;
        const nx = cx + (cr-12)*Math.cos(ang);
        const ny = cy + (cr-12)*Math.sin(ang);
        const isHL = i === Math.floor(t/30) % mod;
        if(isHL) {
          ctx.beginPath(); ctx.arc(nx, ny, 12, 0, Math.PI*2);
          ctx.fillStyle = COLORS.limeD; ctx.fill();
        }
        boldLabel(String(i), nx, ny, isHL ? COLORS.lime : COLORS.sub, 10);
      }
      label('mod 12', cx, cy, COLORS.cyan, 10);
      label('7 + 8 ≡ 3 (mod 12)', 180, 240, COLORS.cyan, 10);

      // GCD / Euclid
      boldLabel('Algoritmo de Euclides', 180, 270, COLORS.green, 11);
      drawRoundedRect(60, 283, 240, 85, 8, COLORS.panel, COLORS.green+'40');
      const gcdSteps = [
        'gcd(252, 105)',
        '252 = 2·105 + 42',
        '105 = 2·42 + 21',
        '42 = 2·21 + 0',
        'gcd = 21'
      ];
      const gcdPhase = Math.floor(t/50) % gcdSteps.length;
      gcdSteps.forEach((s,i) => {
        const active = i <= gcdPhase;
        label(s, 180, 298+i*14, active ? COLORS.green : COLORS.dim, 9);
      });

      // Primes
      boldLabel('Primalidade & Fatoração', 620, 52, COLORS.yellow, 13);
      drawRoundedRect(450, 65, 370, 45, 8, COLORS.panel, COLORS.yellow+'40');
      label('Teorema Fund. Aritmética: n = p₁^a₁ · p₂^a₂ · ...', 635, 80, COLORS.yellow, 10);
      label('Crivo de Eratóstenes | Miller-Rabin', 635, 98, COLORS.sub, 9);

      // Euler / Fermat
      drawRoundedRect(450, 120, 370, 55, 8, COLORS.panel, COLORS.purple+'40');
      boldLabel('Euler & Fermat', 635, 133, COLORS.purple, 11);
      label('Fermat: aᵖ⁻¹ ≡ 1 (mod p)', 635, 150, COLORS.purple, 10);
      label('Euler: a^φ(n) ≡ 1 (mod n), gcd(a,n)=1', 635, 166, COLORS.sub, 9);

      // RSA flow
      boldLabel('RSA — Fluxo', W/2, 205, COLORS.lime, 14);
      const rsaSteps = [
        { x:80,  y:225, w:120, label:'p, q primos', clr:COLORS.cyan },
        { x:220, y:225, w:100, label:'n = p·q', clr:COLORS.blue },
        { x:340, y:225, w:110, label:'φ(n)=(p-1)(q-1)', clr:COLORS.purple },
        { x:470, y:225, w:100, label:'e: gcd(e,φ)=1', clr:COLORS.yellow },
        { x:590, y:225, w:110, label:'d = e⁻¹ mod φ', clr:COLORS.orange },
        { x:280, y:280, w:120, label:'Encrypt: c=mᵉ mod n', clr:COLORS.green },
        { x:450, y:280, w:130, label:'Decrypt: m=cᵈ mod n', clr:COLORS.red }
      ];
      const rsaPhase = Math.floor(t/40) % (rsaSteps.length+1);
      rsaSteps.forEach((s,i) => {
        const active = i < rsaPhase;
        drawRoundedRect(s.x, s.y, s.w, 30, 6, active ? s.clr+'15' : COLORS.panel, active ? s.clr : COLORS.dim);
        label(s.label, s.x+s.w/2, s.y+15, active ? s.clr : COLORS.dim, 9);
        if(i < rsaSteps.length-1 && i < 4) {
          arrow(s.x+s.w+2, s.y+15, rsaSteps[i+1].x-2, rsaSteps[i+1].y+15, active ? s.clr+'60' : COLORS.dim+'40');
        }
      });

      // Public/Private key labels
      drawRoundedRect(150, 325, 200, 30, 6, COLORS.panel, COLORS.green+'60');
      boldLabel('🔑 Pública: (e, n)', 250, 340, COLORS.green, 11);
      drawRoundedRect(500, 325, 200, 30, 6, COLORS.panel, COLORS.red+'60');
      boldLabel('🔒 Privada: (d, n)', 600, 340, COLORS.red, 11);

      label('Segurança: fatorar n é intratável para n grande', W/2, 375, COLORS.sub, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawNumberTheory);
    };

    // Dispatch
    switch(stepIdx) {
      case 0: drawLogic(); break;
      case 1: drawSets(); break;
      case 2: drawCombinatorics(); break;
      case 3: drawGraphTheory(); break;
      case 4: drawLinearAlgebra(); break;
      case 5: drawNumberTheory(); break;
      default: drawLogic();
    }
  };

  return engine;
}
