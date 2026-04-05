import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderCompilers(canvas) {
  const engine = new BaseRenderer(canvas);

  const COLORS = {
    bg:      '#050a15',
    amber:   '#f59e0b',
    amberD:  'rgba(245,158,11,0.15)',
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
      ctx.strokeStyle = color || COLORS.sub;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      const a = Math.atan2(y2-y1,x2-x1);
      ctx.beginPath();
      ctx.moveTo(x2,y2);
      ctx.lineTo(x2-10*Math.cos(a-0.4), y2-10*Math.sin(a-0.4));
      ctx.lineTo(x2-10*Math.cos(a+0.4), y2-10*Math.sin(a+0.4));
      ctx.closePath(); ctx.fillStyle = color || COLORS.sub; ctx.fill();
    };

    // ── Step 0: Lexer ──
    const drawLexer = () => {
      clear();
      boldLabel('Análise Léxica — Tokenization', W/2, 25, COLORS.amber, 16);

      // Source code
      const src = 'let x = 42 + y;';
      drawRoundedRect(50, 50, 350, 35, 6, COLORS.amberD, COLORS.amber);
      label('Código-fonte: "' + src + '"', 225, 67, COLORS.text, 12);

      arrow(225, 90, 225, 110, COLORS.amber);
      boldLabel('Lexer / Tokenizer', 225, 105, COLORS.amber, 12);

      // Tokens
      const tokens = [
        {type: 'KW', val: 'let', color: COLORS.purple},
        {type: 'ID', val: 'x', color: COLORS.cyan},
        {type: 'OP', val: '=', color: COLORS.amber},
        {type: 'NUM', val: '42', color: COLORS.green},
        {type: 'OP', val: '+', color: COLORS.amber},
        {type: 'ID', val: 'y', color: COLORS.cyan},
        {type: 'SYM', val: ';', color: COLORS.dim}
      ];

      const phase = Math.floor(t / 25) % (tokens.length + 1);
      tokens.forEach((tk, i) => {
        const x = 55 + i * 115;
        const y = 130;
        const active = phase === i;
        drawRoundedRect(x, y, 105, 45, 6,
          active ? tk.color : COLORS.panel, tk.color);
        boldLabel(tk.type, x + 52, y + 14, active ? COLORS.bg : tk.color, 10);
        label('"' + tk.val + '"', x + 52, y + 33, active ? COLORS.bg : COLORS.sub, 11);
      });

      // DFA diagram
      const dy = 200;
      boldLabel('DFA (Autômato Finito Determinístico)', W/2, dy, COLORS.amber, 13);

      const dfaStates = [
        {x: 100, y: dy + 40, name: 'S0', label: 'start', color: COLORS.dim},
        {x: 280, y: dy + 20, name: 'S1', label: 'NUMBER', color: COLORS.green},
        {x: 280, y: dy + 65, name: 'S2', label: 'IDENT', color: COLORS.cyan},
        {x: 460, y: dy + 40, name: 'S3', label: 'OP', color: COLORS.amber}
      ];

      dfaStates.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.panel;
        ctx.fill();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        boldLabel(s.name, s.x, s.y, s.color, 10);
        label(s.label, s.x, s.y + 30, COLORS.sub, 8);
      });

      // Transitions
      arrow(122, dy + 33, 255, dy + 22, COLORS.green);
      label('dígito', 185, dy + 18, COLORS.green, 9);
      arrow(122, dy + 48, 255, dy + 63, COLORS.cyan);
      label('letra', 185, dy + 62, COLORS.cyan, 9);
      arrow(122, dy + 40, 436, dy + 40, COLORS.amber);
      label('+ = < >', 280, dy + 50, COLORS.amber, 9);

      // Maximal Munch & rules
      const ry = dy + 105;
      drawRoundedRect(50, ry, 350, 60, 6, COLORS.panel, COLORS.amber);
      boldLabel('Regras do Lexer', 225, ry + 14, COLORS.amber, 11);
      label('Maximal Munch: sempre o token mais longo', 225, ry + 32, COLORS.sub, 10);
      label('"iffy" → IDENT, não "if" + "fy"', 225, ry + 48, COLORS.sub, 10);

      drawRoundedRect(430, ry, 350, 60, 6, COLORS.panel, COLORS.red);
      boldLabel('Erros Léxicos', 605, ry + 14, COLORS.red, 11);
      label('Caractere inválido: @ em C', 605, ry + 32, COLORS.sub, 10);
      label('String não fechada: "hello', 605, ry + 48, COLORS.sub, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawLexer);
    };

    // ── Step 1: Parser & AST ──
    const drawParser = () => {
      clear();
      boldLabel('Parser — AST (Abstract Syntax Tree)', W/2, 25, COLORS.amber, 16);

      label('Parsing: let x = 2 + 3 * 4;', W/2, 50, COLORS.text, 12);

      // AST tree
      const nodes = [
        {x: 400, y: 80, name: 'LetDecl', color: COLORS.amber},
        {x: 250, y: 130, name: '"x"', color: COLORS.cyan},
        {x: 500, y: 130, name: 'BinExpr (+)', color: COLORS.blue},
        {x: 400, y: 190, name: 'Num(2)', color: COLORS.green},
        {x: 600, y: 190, name: 'BinExpr (*)', color: COLORS.purple},
        {x: 530, y: 245, name: 'Num(3)', color: COLORS.green},
        {x: 670, y: 245, name: 'Num(4)', color: COLORS.green}
      ];

      // Edges
      const edges = [[0,1],[0,2],[2,3],[2,4],[4,5],[4,6]];
      edges.forEach(([from, to]) => {
        ctx.beginPath();
        ctx.moveTo(nodes[from].x, nodes[from].y + 14);
        ctx.lineTo(nodes[to].x, nodes[to].y - 14);
        ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1.5; ctx.stroke();
      });

      const highlightNode = Math.floor(t / 35) % nodes.length;
      nodes.forEach((n, i) => {
        const active = i === highlightNode;
        drawRoundedRect(n.x - 55, n.y - 14, 110, 28, 6,
          active ? n.color : COLORS.panel, n.color);
        boldLabel(n.name, n.x, n.y, active ? COLORS.bg : n.color, 10);
      });

      // Parsing approaches
      const py = 285;
      boldLabel('Abordagens de Parsing', W/2, py, COLORS.amber, 13);

      const approaches = [
        {name: 'Recursive Descent', desc: 'Top-down LL(1) — 1 fn por regra', ex: 'GCC, V8, rustc', color: COLORS.amber},
        {name: 'Pratt / TDOP', desc: 'Precedence climbing — elegante', ex: 'Clang, Lua', color: COLORS.cyan},
        {name: 'LR / LALR', desc: 'Bottom-up — shift/reduce tables', ex: 'yacc, bison, Ruby', color: COLORS.purple}
      ];

      approaches.forEach((a, i) => {
        const y = py + 22 + i * 34;
        drawRoundedRect(60, y, 180, 26, 4, COLORS.panel, a.color);
        boldLabel(a.name, 150, y + 13, a.color, 10);
        label(a.desc, 340, y + 13, COLORS.text, 10);
        label(a.ex, 530, y + 13, COLORS.sub, 10);
      });

      // AST vs CST
      const cy = py + 130;
      drawRoundedRect(100, cy, 250, 40, 6, COLORS.panel, COLORS.amber);
      boldLabel('AST', 150, cy + 13, COLORS.amber, 11);
      label('Abstrata — só semântica', 225, cy + 28, COLORS.sub, 9);

      drawRoundedRect(400, cy, 250, 40, 6, COLORS.panel, COLORS.blue);
      boldLabel('CST (Parse Tree)', 460, cy + 13, COLORS.blue, 11);
      label('Concreta — todos os tokens', 525, cy + 28, COLORS.sub, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawParser);
    };

    // ── Step 2: Semantic Analysis ──
    const drawSemantic = () => {
      clear();
      boldLabel('Análise Semântica — Types & Scoping', W/2, 25, COLORS.amber, 16);

      // Symbol Table
      boldLabel('Symbol Table (Scoping)', 200, 50, COLORS.amber, 13);
      drawRoundedRect(40, 65, 320, 150, 8, COLORS.panel, COLORS.amber);

      // Scope 0
      drawRoundedRect(55, 80, 140, 80, 4, null, COLORS.cyan);
      label('Scope 0 (global)', 125, 92, COLORS.cyan, 9);
      label('main: fn → void', 125, 110, COLORS.sub, 9);
      label('x: i32', 125, 126, COLORS.sub, 9);

      // Scope 1 (nested)
      drawRoundedRect(210, 80, 135, 80, 4, null, COLORS.purple);
      label('Scope 1 (block)', 278, 92, COLORS.purple, 9);
      label('y: f64', 278, 110, COLORS.sub, 9);
      label('x: str (shadow)', 278, 126, COLORS.orange, 9);

      label('Lookup: inner → outer', 200, 185, COLORS.sub, 9);

      const lookupPhase = Math.floor(t / 50) % 2;
      if(lookupPhase === 0) {
        label('→ "x" em Scope 1 = str', 200, 200, COLORS.orange, 10);
      } else {
        label('→ "x" em Scope 0 = i32', 200, 200, COLORS.cyan, 10);
      }

      // Type Checking rules
      const tx = 420, ty = 50;
      boldLabel('Type Checking Rules', 600, ty, COLORS.green, 13);
      drawRoundedRect(tx, ty + 15, 380, 150, 8, COLORS.panel, COLORS.green);

      const rules = [
        {rule: 'e₁: num, e₂: num → e₁+e₂: num', name: 'T-Add', ok: true},
        {rule: 'cond: bool → if cond {...}: T', name: 'T-If', ok: true},
        {rule: '"hello" + 5', name: 'ERR', ok: false},
        {rule: 'return "str" (fn → num)', name: 'ERR', ok: false}
      ];

      rules.forEach((r, i) => {
        const y = ty + 40 + i * 28;
        const c = r.ok ? COLORS.green : COLORS.red;
        label(r.ok ? '✓' : '✗', tx + 20, y, c, 12);
        label(r.rule, tx + 180, y, COLORS.sub, 10);
        label(r.name, tx + 350, y, c, 9);
      });

      // Type Inference
      const iy = 230;
      boldLabel('Type Inference (Hindley-Milner)', W/2, iy, COLORS.amber, 13);

      drawRoundedRect(50, iy + 20, 380, 55, 6, COLORS.panel, COLORS.cyan);
      label('let x = 42;      → x: i32 (inferido)', 240, iy + 37, COLORS.cyan, 10);
      label('fn id(v) = v;    → id<T>(T) → T (polimórfico)', 240, iy + 55, COLORS.cyan, 10);

      drawRoundedRect(460, iy + 20, 350, 55, 6, COLORS.panel, COLORS.orange);
      boldLabel('Unificação', 540, iy + 35, COLORS.orange, 10);
      label('f(x) onde f: int→int', 635, iy + 35, COLORS.sub, 10);
      label('→ x deve ser int', 635, iy + 55, COLORS.orange, 10);

      // Borrow Checker
      const by = iy + 95;
      drawRoundedRect(50, by, 350, 55, 6, COLORS.panel, COLORS.red);
      boldLabel('Borrow Checker (Rust)', 225, by + 14, COLORS.red, 11);
      label('No aliasing mutável — data race em compile time', 225, by + 32, COLORS.sub, 9);
      label('Lifetimes: \'a garante referências válidas', 225, by + 48, COLORS.sub, 9);

      drawRoundedRect(430, by, 350, 55, 6, COLORS.panel, COLORS.purple);
      boldLabel('Control Flow Analysis', 605, by + 14, COLORS.purple, 11);
      label('Todas branches retornam valor?', 605, by + 32, COLORS.sub, 9);
      label('Variável inicializada antes do uso?', 605, by + 48, COLORS.sub, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawSemantic);
    };

    // ── Step 3: IR & SSA ──
    const drawIR = () => {
      clear();
      boldLabel('Representação Intermediária — IR & SSA', W/2, 25, COLORS.amber, 16);

      // Three-Address Code
      boldLabel('Three-Address Code', 200, 50, COLORS.amber, 13);
      drawRoundedRect(40, 65, 320, 100, 8, COLORS.panel, COLORS.amber);

      label('Fonte: result = (a+b) * (c-2)', 200, 80, COLORS.text, 10);
      const tac = ['t1 = a + b', 't2 = c - 2', 't3 = t1 * t2', 'result = t3'];
      tac.forEach((line, i) => {
        const active = Math.floor(t / 30) % 4 === i;
        label(line, 200, 100 + i * 16, active ? COLORS.amber : COLORS.sub, 10);
      });

      // SSA
      const sx = 420;
      boldLabel('SSA — Static Single Assignment', 610, 50, COLORS.cyan, 13);
      drawRoundedRect(sx, 65, 380, 100, 8, COLORS.panel, COLORS.cyan);

      const ssaL = [
        {normal: 'x = 1', ssa: 'x₁ = 1'},
        {normal: 'y = x + 2', ssa: 'y₁ = x₁ + 2'},
        {normal: 'x = y * 3', ssa: 'x₂ = y₁ * 3'},
        {normal: 'z = x + y', ssa: 'z₁ = x₂ + y₁'}
      ];

      ssaL.forEach((l, i) => {
        const y = 80 + i * 18;
        const active = Math.floor(t / 30) % 4 === i;
        label(l.normal, sx + 80, y, COLORS.sub, 9);
        label('→', sx + 160, y, COLORS.dim, 9);
        label(l.ssa, sx + 280, y, active ? COLORS.cyan : COLORS.text, 10);
      });

      // Phi function
      const py = 185;
      boldLabel('φ-function (merge de branches)', W/2, py, COLORS.amber, 13);
      drawRoundedRect(150, py + 15, 500, 80, 8, COLORS.panel, COLORS.purple);

      // If/else branches
      drawRoundedRect(180, py + 25, 100, 22, 3, null, COLORS.green);
      label('if: x₁ = 1', 230, py + 36, COLORS.green, 10);

      drawRoundedRect(310, py + 25, 100, 22, 3, null, COLORS.blue);
      label('else: x₂ = 2', 360, py + 36, COLORS.blue, 10);

      // Phi merge
      drawRoundedRect(230, py + 60, 180, 25, 3, COLORS.amberD, COLORS.amber);
      boldLabel('x₃ = φ(x₁, x₂)', 320, py + 72, COLORS.amber, 10);

      ctx.beginPath();
      ctx.moveTo(230, py + 48); ctx.lineTo(280, py + 60);
      ctx.moveTo(360, py + 48); ctx.lineTo(340, py + 60);
      ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1; ctx.stroke();

      label('Seleciona valor baseado em qual branch executou', 400, py + 100, COLORS.sub, 9);

      // LLVM IR
      const ly = py + 120;
      boldLabel('LLVM IR', W/2, ly, COLORS.green, 14);
      drawRoundedRect(100, ly + 15, 600, 80, 8, COLORS.panel, COLORS.green);

      const llvmCode = [
        'define i32 @add(i32 %a, i32 %b) {',
        '  %sum = add i32 %a, %b',
        '  ret i32 %sum',
        '}'
      ];

      llvmCode.forEach((line, i) => {
        label(line, 400, ly + 30 + i * 16, i === 1 ? COLORS.green : COLORS.sub, 10);
      });

      label('Frontend (Clang/rustc) → LLVM IR → Optimizações → Backend (x86/ARM/WASM)', W/2, ly + 105, COLORS.sub, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawIR);
    };

    // ── Step 4: Optimization ──
    const drawOptimization = () => {
      clear();
      boldLabel('Otimizações de Compilador', W/2, 25, COLORS.amber, 16);

      // Constant Folding
      const fy = 50;
      boldLabel('Constant Folding & Propagation', 200, fy, COLORS.green, 12);
      drawRoundedRect(40, fy + 15, 310, 55, 6, COLORS.panel, COLORS.green);
      label('x = 3 + 4  →  x = 7', 195, fy + 30, COLORS.sub, 10);
      label('y = x * 2  →  y = 14', 195, fy + 48, COLORS.green, 10);

      // Dead Code Elimination
      boldLabel('Dead Code Elimination', 610, fy, COLORS.orange, 12);
      drawRoundedRect(450, fy + 15, 310, 55, 6, COLORS.panel, COLORS.orange);
      label('x = expensive()  →  (removido)', 605, fy + 30, COLORS.orange, 10);
      label('x nunca é usado depois', 605, fy + 48, COLORS.sub, 10);

      // Loop Optimizations
      const ly = fy + 85;
      boldLabel('Loop Optimizations', W/2, ly, COLORS.amber, 14);

      // LICM
      drawRoundedRect(40, ly + 20, 240, 70, 6, COLORS.panel, COLORS.cyan);
      boldLabel('LICM', 100, ly + 34, COLORS.cyan, 10);
      label('loop { t = len(a); ... }', 160, ly + 50, COLORS.sub, 9);
      label('→ t = len(a); loop { ... }', 160, ly + 66, COLORS.cyan, 9);

      // Unrolling
      drawRoundedRect(300, ly + 20, 210, 70, 6, COLORS.panel, COLORS.purple);
      boldLabel('Unrolling', 360, ly + 34, COLORS.purple, 10);
      label('for i in 0..4: a[i]++', 405, ly + 50, COLORS.sub, 9);
      label('→ a[0]++; a[1]++; ...', 405, ly + 66, COLORS.purple, 9);

      // Strength Reduction
      drawRoundedRect(530, ly + 20, 240, 70, 6, COLORS.panel, COLORS.yellow);
      boldLabel('Strength Reduction', 620, ly + 34, COLORS.yellow, 10);
      label('x * 2  →  x << 1', 650, ly + 50, COLORS.sub, 9);
      label('x * 15 → (x<<4) - x', 650, ly + 66, COLORS.yellow, 9);

      // Inlining visualization
      const iy = ly + 110;
      boldLabel('Inlining', W/2, iy, COLORS.amber, 13);

      // Before
      drawRoundedRect(60, iy + 20, 180, 80, 6, COLORS.panel, COLORS.dim);
      label('Antes:', 150, iy + 35, COLORS.dim, 10);
      label('fn square(x) { x*x }', 150, iy + 55, COLORS.sub, 9);
      label('result = square(5)', 150, iy + 73, COLORS.sub, 9);

      arrow(250, iy + 60, 320, iy + 60, COLORS.amber);

      // After
      drawRoundedRect(330, iy + 20, 180, 80, 6, COLORS.panel, COLORS.green);
      label('Depois:', 420, iy + 35, COLORS.green, 10);
      label('result = 5 * 5', 420, iy + 55, COLORS.green, 9);
      label('→ result = 25', 420, iy + 73, COLORS.green, 9);

      // PGO
      drawRoundedRect(550, iy + 20, 240, 80, 6, COLORS.panel, COLORS.purple);
      boldLabel('Profile-Guided (PGO)', 670, iy + 35, COLORS.purple, 10);
      label('1. Compile + Run', 670, iy + 53, COLORS.sub, 9);
      label('2. Collect profile (hot paths)', 670, iy + 68, COLORS.sub, 9);
      label('3. Recompile optimized', 670, iy + 83, COLORS.purple, 9);

      // Animated optimization pass indicator
      const passes = ['Constant Fold', 'DCE', 'LICM', 'Inline', 'CSE'];
      const passIdx = Math.floor(t / 40) % passes.length;
      drawRoundedRect(250, iy + 115, 300, 25, 12, COLORS.amberD, COLORS.amber);
      boldLabel('Pass: ' + passes[passIdx], 400, iy + 127, COLORS.amber, 11);

      t++;
      this.animFrame = requestAnimationFrame(drawOptimization);
    };

    // ── Step 5: CodeGen, JIT & GC ──
    const drawCodeGen = () => {
      clear();
      boldLabel('Code Generation, JIT & Garbage Collection', W/2, 25, COLORS.amber, 16);

      // Compilation pipeline
      const stages = [
        {name: 'IR Otimizada', color: COLORS.cyan},
        {name: 'Reg Alloc', color: COLORS.blue},
        {name: 'Inst Select', color: COLORS.purple},
        {name: 'Scheduling', color: COLORS.green},
        {name: 'Machine Code', color: COLORS.amber}
      ];

      const phase = Math.floor(t / 40) % 5;
      stages.forEach((s, i) => {
        const x = 30 + i * 168;
        const active = i === phase;
        drawRoundedRect(x, 48, 148, 35, 6, active ? s.color : COLORS.panel, s.color);
        boldLabel(s.name, x + 74, 65, active ? COLORS.bg : s.color, 10);
        if(i < 4) arrow(x + 153, 65, x + 163, 65, COLORS.sub);
      });

      // JIT compilation
      const jy = 105;
      boldLabel('JIT Compilation (V8 TurboFan / HotSpot C2)', W/2, jy, COLORS.amber, 13);

      const jitStages = [
        {name: 'Interpreter', desc: 'Execução imediata', detail: 'Coleta profiling', color: COLORS.blue, w: 160},
        {name: 'Baseline JIT', desc: 'Compilação rápida', detail: 'Sem otimizações', color: COLORS.orange, w: 160},
        {name: 'Opt JIT', desc: 'Compilação otimizada', detail: 'Inline + specialize', color: COLORS.green, w: 160}
      ];

      const jitPhase = Math.floor(t / 60) % 3;
      jitStages.forEach((s, i) => {
        const x = 100 + i * 230;
        const active = i === jitPhase;
        drawRoundedRect(x, jy + 18, s.w, 60, 8, active ? s.color : COLORS.panel, s.color);
        boldLabel(s.name, x + s.w/2, jy + 33, active ? COLORS.bg : s.color, 10);
        label(s.desc, x + s.w/2, jy + 50, active ? COLORS.bg : COLORS.sub, 9);
        label(s.detail, x + s.w/2, jy + 65, active ? COLORS.bg : COLORS.dim, 8);
        if(i < 2) {
          arrow(x + s.w + 5, jy + 48, x + s.w + 60, jy + 48, COLORS.sub);
          label('hot', x + s.w + 33, jy + 38, COLORS.red, 8);
        }
      });

      // Deopt arrow back
      ctx.beginPath();
      ctx.moveTo(560, jy + 82); ctx.lineTo(230, jy + 82);
      ctx.strokeStyle = COLORS.red; ctx.lineWidth = 1.5;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
      label('Deopt: tipo mudou → volta ao interpreter', 400, jy + 94, COLORS.red, 9);

      // GC
      const gy = jy + 115;
      boldLabel('Garbage Collection — Generacional', W/2, gy, COLORS.amber, 13);

      // Young gen
      drawRoundedRect(60, gy + 18, 300, 70, 8, COLORS.panel, COLORS.green);
      boldLabel('Young Generation (~10%)', 210, gy + 33, COLORS.green, 10);
      const edenSlots = 8;
      for(let i = 0; i < edenSlots; i++) {
        const ox = 75 + i * 34;
        const alive = (i + Math.floor(t/10)) % 3 !== 0;
        ctx.fillStyle = alive ? COLORS.green : 'rgba(239,68,68,0.3)';
        ctx.fillRect(ox, gy + 48, 28, 28);
      }
      label('Minor GC: frequente (~ms)', 210, gy + 90, COLORS.sub, 9);

      // Old gen
      drawRoundedRect(400, gy + 18, 400, 70, 8, COLORS.panel, COLORS.blue);
      boldLabel('Old Generation (~90%)', 600, gy + 33, COLORS.blue, 10);
      for(let i = 0; i < 10; i++) {
        const ox = 415 + i * 37;
        ctx.fillStyle = COLORS.blue;
        ctx.fillRect(ox, gy + 48, 30, 28);
      }
      label('Major GC: raro (~100ms)', 600, gy + 90, COLORS.sub, 9);

      arrow(365, gy + 55, 395, gy + 55, COLORS.sub);
      label('promote', 380, gy + 45, COLORS.sub, 8);

      // AOT vs JIT
      const ay = gy + 110;
      drawRoundedRect(80, ay, 300, 40, 6, COLORS.panel, COLORS.amber);
      boldLabel('AOT', 150, ay + 13, COLORS.amber, 11);
      label('Rust, C, Go, GraalVM Native', 230, ay + 28, COLORS.sub, 9);

      drawRoundedRect(420, ay, 300, 40, 6, COLORS.panel, COLORS.purple);
      boldLabel('JIT', 490, ay + 13, COLORS.purple, 11);
      label('V8, HotSpot, .NET RyuJIT', 570, ay + 28, COLORS.sub, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawCodeGen);
    };

    switch(stepIdx) {
      case 0: drawLexer(); break;
      case 1: drawParser(); break;
      case 2: drawSemantic(); break;
      case 3: drawIR(); break;
      case 4: drawOptimization(); break;
      case 5: drawCodeGen(); break;
      default: drawLexer();
    }
  };

  return engine;
}
