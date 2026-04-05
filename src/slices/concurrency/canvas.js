import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderConcurrency(canvas) {
  const engine = new BaseRenderer(canvas);

  const COLORS = {
    bg:      '#050a15',
    emerald: '#10b981',
    emerD:   'rgba(16,185,129,0.15)',
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

    // ── Step 0: Fundamentos ──
    const drawFundamentals = () => {
      clear();
      boldLabel('Concorrência vs Paralelismo', W/2, 25, COLORS.emerald, 16);

      // Concurrency — single core, interleaving
      const cy = 55;
      boldLabel('Concorrência (1 core — interleaving)', 250, cy, COLORS.emerald, 13);
      const tasks = [
        {name: 'T1', color: COLORS.emerald},
        {name: 'T2', color: COLORS.blue},
        {name: 'T3', color: COLORS.orange}
      ];
      const slotW = 45, slotH = 26;
      const pattern = [0,0,1,0,2,1,2,2,1,0,2,1];
      pattern.forEach((ti, i) => {
        const x = 50 + i * (slotW + 3);
        drawRoundedRect(x, cy + 15, slotW, slotH, 3,
          tasks[ti].color, null);
        label(tasks[ti].name, x + slotW/2, cy + 28, COLORS.bg, 9);
      });
      label('tempo →', 50 + pattern.length * (slotW+3) + 20, cy + 28, COLORS.sub, 10);

      // Parallelism — multi core
      const py = cy + 70;
      boldLabel('Paralelismo (4 cores — simultâneo)', 250, py, COLORS.blue, 13);
      for(let core = 0; core < 4; core++) {
        label('Core ' + core, 50, py + 22 + core * 28, COLORS.sub, 10, 'left');
        for(let s = 0; s < 8; s++) {
          const x = 110 + s * (slotW + 3);
          const c = [COLORS.emerald, COLORS.blue, COLORS.orange, COLORS.purple][core];
          drawRoundedRect(x, py + 10 + core * 28, slotW, slotH - 4, 3, c, null);
          label('T' + (core+1), x + slotW/2, py + 21 + core * 28, COLORS.bg, 8);
        }
      }

      // Amdahl's Law
      const ay = py + 140;
      boldLabel("Lei de Amdahl", W/2, ay, COLORS.emerald, 14);
      label('Speedup = 1 / ( (1-P) + P/N )', W/2, ay + 22, COLORS.text, 12);
      label('P = fração paralelizável   N = número de cores', W/2, ay + 42, COLORS.sub, 10);

      // Bar chart
      const bars = [
        {n: 1, speedup: 1.0}, {n: 2, speedup: 1.6}, {n: 4, speedup: 2.3},
        {n: 8, speedup: 2.9}, {n: 16, speedup: 3.4}, {n: '∞', speedup: 4.0}
      ];
      const barW = 50, maxH = 80, barX = 180;
      bars.forEach((b, i) => {
        const x = barX + i * 85;
        const h = (b.speedup / 4) * maxH;
        const y = ay + 120 - h;
        drawRoundedRect(x, y, barW, h, 4, COLORS.emerald, null);
        label(b.speedup + 'x', x + barW/2, y - 10, COLORS.emerald, 10);
        label(b.n + ' cores', x + barW/2, ay + 125, COLORS.sub, 9);
      });
      label('P = 75% → máximo teórico: 4x', W/2, ay + 145, COLORS.sub, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawFundamentals);
    };

    // ── Step 1: Memory Models ──
    const drawMemoryModels = () => {
      clear();
      boldLabel('Memory Models & Ordering', W/2, 25, COLORS.emerald, 16);

      // Reordering problem
      boldLabel('Problema: Reordenação de instruções', W/2, 50, COLORS.red, 13);
      const cx = 100, rx = 500;
      drawRoundedRect(cx, 70, 200, 80, 8, COLORS.panel, COLORS.emerald);
      boldLabel('Thread 1', cx + 100, 85, COLORS.emerald, 11);
      label('x = 1;    // store x', cx + 100, 105, COLORS.text, 10);
      label('r1 = y;   // load y', cx + 100, 125, COLORS.text, 10);

      drawRoundedRect(rx, 70, 200, 80, 8, COLORS.panel, COLORS.blue);
      boldLabel('Thread 2', rx + 100, 85, COLORS.blue, 11);
      label('y = 1;    // store y', rx + 100, 105, COLORS.text, 10);
      label('r2 = x;   // load x', rx + 100, 125, COLORS.text, 10);

      const blink = Math.floor(t/30) % 2 === 0;
      label(blink ? 'r1 = 0, r2 = 0 é possível! (reordering)' : 'CPU/compilador reordena loads antes de stores',
        W/2, 170, COLORS.red, 11);

      // Memory ordering levels
      const my = 200;
      boldLabel('Níveis de Ordenação (C++/Rust)', W/2, my, COLORS.emerald, 13);

      const orderings = [
        {name: 'seq_cst', desc: 'Ordem total — mais seguro, mais lento', color: COLORS.green, w: 600},
        {name: 'acq/rel', desc: 'Acquire: loads não passam | Release: stores não passam', color: COLORS.cyan, w: 500},
        {name: 'relaxed', desc: 'Sem garantia de ordem — apenas atomicidade', color: COLORS.orange, w: 400}
      ];

      orderings.forEach((o, i) => {
        const y = my + 25 + i * 38;
        const x = (W - o.w) / 2;
        drawRoundedRect(x, y, o.w, 30, 6, COLORS.panel, o.color);
        boldLabel(o.name, x + 60, y + 15, o.color, 11);
        label(o.desc, x + o.w/2 + 30, y + 15, COLORS.sub, 10);
      });

      // x86 TSO vs ARM
      const ty = my + 150;
      boldLabel('Hardware Memory Models', W/2, ty, COLORS.emerald, 13);

      drawRoundedRect(100, ty + 20, 250, 60, 6, COLORS.panel, COLORS.blue);
      boldLabel('x86/x64 (TSO)', 225, ty + 35, COLORS.blue, 11);
      label('Total Store Order — forte', 225, ty + 52, COLORS.sub, 10);
      label('Store→Load pode reordenar', 225, ty + 67, COLORS.orange, 9);

      drawRoundedRect(420, ty + 20, 250, 60, 6, COLORS.panel, COLORS.orange);
      boldLabel('ARM / RISC-V (Weak)', 545, ty + 35, COLORS.orange, 11);
      label('Quase tudo pode reordenar', 545, ty + 52, COLORS.sub, 10);
      label('Precisa de fences explícitos', 545, ty + 67, COLORS.red, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawMemoryModels);
    };

    // ── Step 2: Lock-Free ──
    const drawLockFree = () => {
      clear();
      boldLabel('Primitivas Lock-Free', W/2, 25, COLORS.emerald, 16);

      // CAS loop
      boldLabel('CAS — Compare-And-Swap', 250, 50, COLORS.emerald, 13);
      drawRoundedRect(50, 65, 400, 100, 8, COLORS.panel, COLORS.emerald);

      const casPhase = Math.floor(t / 50) % 3;
      const casSteps = [
        {code: '1. old = atom.load()', desc: 'Lê valor atual', color: COLORS.cyan},
        {code: '2. new = old + 1', desc: 'Calcula novo valor', color: COLORS.yellow},
        {code: '3. CAS(old, new)', desc: casPhase === 2 ? (Math.floor(t/25)%2===0 ? '✓ Sucesso!' : '✗ Retry (outro thread mudou)') : 'Troca se não mudou', color: casPhase === 2 ? COLORS.green : COLORS.orange}
      ];
      casSteps.forEach((s, i) => {
        const y = 80 + i * 25;
        const active = casPhase === i;
        label(s.code, 180, y, active ? s.color : COLORS.sub, 11);
        label(s.desc, 370, y, active ? s.color : COLORS.dim, 10);
      });

      // Treiber Stack
      const sy = 185;
      boldLabel('Treiber Stack (Lock-Free Stack)', 250, sy, COLORS.blue, 13);
      drawRoundedRect(50, sy + 15, 400, 80, 8, COLORS.panel, COLORS.blue);

      // Stack nodes
      const pushed = Math.floor(t / 60) % 4;
      const stackItems = ['C', 'B', 'A'].slice(0, Math.max(1, 3 - pushed % 3));
      let headX = 80;
      label('HEAD →', headX, sy + 45, COLORS.blue, 10);
      headX = 140;
      stackItems.forEach((item, i) => {
        const nx = headX + i * 80;
        drawRoundedRect(nx, sy + 32, 55, 28, 4, COLORS.emerD, COLORS.emerald);
        boldLabel(item, nx + 28, sy + 46, COLORS.emerald, 12);
        if(i < stackItems.length - 1) {
          arrow(nx + 58, sy + 46, nx + 75, sy + 46, COLORS.sub);
        }
      });
      label('push: CAS(head, newNode)', 250, sy + 78, COLORS.sub, 9);

      // ABA Problem
      const ay = sy + 110;
      boldLabel('ABA Problem', 250, ay, COLORS.red, 13);
      drawRoundedRect(50, ay + 15, 400, 80, 8, COLORS.panel, COLORS.red);
      const abaPhase = Math.floor(t / 60) % 3;
      const abaSteps = [
        'T1: lê HEAD = A',
        'T2: pop A, pop B, push A (mesmo ptr!)',
        'T1: CAS(A, new) ✓ — MAS stack mudou!'
      ];
      abaSteps.forEach((s, i) => {
        const active = abaPhase === i;
        label(s, 250, ay + 32 + i * 22, active ? COLORS.red : COLORS.sub, 10);
      });
      label('Solução: tagged pointers (counter + ptr) ou hazard pointers', 250, ay + 100, COLORS.sub, 9);

      // Lock-free vs Wait-free
      const wy = ay + 120;
      drawRoundedRect(50, wy, 210, 50, 6, COLORS.panel, COLORS.emerald);
      boldLabel('Lock-Free', 155, wy + 14, COLORS.emerald, 11);
      label('Alguma thread progride', 155, wy + 32, COLORS.sub, 9);
      label('(pode ter starvation)', 155, wy + 44, COLORS.dim, 8);

      drawRoundedRect(290, wy, 210, 50, 6, COLORS.panel, COLORS.green);
      boldLabel('Wait-Free', 395, wy + 14, COLORS.green, 11);
      label('TODA thread progride', 395, wy + 32, COLORS.sub, 9);
      label('(bound em # steps)', 395, wy + 44, COLORS.dim, 8);

      t++;
      this.animFrame = requestAnimationFrame(drawLockFree);
    };

    // ── Step 3: Concurrency Patterns ──
    const drawPatterns = () => {
      clear();
      boldLabel('Padrões de Concorrência', W/2, 25, COLORS.emerald, 16);

      // Producer-Consumer
      const py = 50;
      boldLabel('Producer-Consumer (Bounded Buffer)', 300, py, COLORS.emerald, 12);
      drawRoundedRect(50, py + 15, 110, 50, 6, COLORS.panel, COLORS.orange);
      boldLabel('Producer', 105, py + 30, COLORS.orange, 10);
      label('gera items', 105, py + 48, COLORS.sub, 9);

      // Queue
      const qx = 190, qw = 220;
      drawRoundedRect(qx, py + 15, qw, 50, 6, COLORS.panel, COLORS.emerald);
      const queueSlots = 6;
      const filled = (Math.floor(t/15) % (queueSlots + 1));
      for(let i = 0; i < queueSlots; i++) {
        const sx = qx + 10 + i * 35;
        ctx.fillStyle = i < filled ? COLORS.emerald : COLORS.dim;
        ctx.fillRect(sx, py + 28, 28, 24);
      }
      label('buffer (ring)', qx + qw/2, py + 72, COLORS.sub, 8);

      drawRoundedRect(440, py + 15, 110, 50, 6, COLORS.panel, COLORS.blue);
      boldLabel('Consumer', 495, py + 30, COLORS.blue, 10);
      label('consome items', 495, py + 48, COLORS.sub, 9);

      arrow(163, py + 40, 188, py + 40, COLORS.orange);
      arrow(413, py + 40, 438, py + 40, COLORS.blue);

      // Actor Model
      const ay = py + 95;
      boldLabel('Actor Model (Erlang / Akka)', 300, ay, COLORS.purple, 12);

      const actors = [
        {x: 80, y: ay + 20, name: 'Actor A', color: COLORS.purple},
        {x: 280, y: ay + 20, name: 'Actor B', color: COLORS.cyan},
        {x: 480, y: ay + 20, name: 'Actor C', color: COLORS.orange}
      ];

      actors.forEach(a => {
        drawRoundedRect(a.x, a.y, 100, 50, 8, COLORS.panel, a.color);
        boldLabel(a.name, a.x + 50, a.y + 15, a.color, 10);
        label('mailbox', a.x + 50, a.y + 35, COLORS.sub, 9);
      });

      // Messages flying between actors
      const msgPhase = (t % 60) / 60;
      const mx = actors[0].x + 100 + (actors[1].x - actors[0].x - 100) * msgPhase;
      ctx.beginPath();
      ctx.arc(mx, ay + 45, 5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.yellow;
      ctx.fill();
      label('msg', mx, ay + 35, COLORS.yellow, 8);

      label('No shared state — comunicação apenas por mensagens', 300, ay + 80, COLORS.sub, 10);

      // CSP / Go Channels
      const gy = ay + 100;
      boldLabel('CSP / Go Channels', 300, gy, COLORS.cyan, 12);

      drawRoundedRect(80, gy + 18, 110, 36, 6, COLORS.panel, COLORS.emerald);
      label('goroutine 1', 135, gy + 36, COLORS.emerald, 10);

      drawRoundedRect(240, gy + 18, 120, 36, 6, COLORS.emerD, COLORS.emerald);
      boldLabel('ch <- val', 300, gy + 36, COLORS.emerald, 10);

      drawRoundedRect(410, gy + 18, 110, 36, 6, COLORS.panel, COLORS.blue);
      label('goroutine 2', 465, gy + 36, COLORS.blue, 10);

      arrow(192, gy + 36, 238, gy + 36, COLORS.emerald);
      arrow(362, gy + 36, 408, gy + 36, COLORS.blue);

      // Work Stealing
      const ws = gy + 75;
      boldLabel('Work Stealing (Tokio, ForkJoinPool)', 300, ws, COLORS.orange, 12);

      for(let i = 0; i < 4; i++) {
        const wx = 80 + i * 150;
        drawRoundedRect(wx, ws + 18, 120, 40, 4, COLORS.panel, COLORS.dim);
        label('Worker ' + i, wx + 60, ws + 28, COLORS.sub, 9);
        const tasks = Math.max(0, 3 - i + (Math.floor(t/30) % 3));
        for(let j = 0; j < Math.min(tasks, 4); j++) {
          const tx = wx + 5 + j * 28;
          ctx.fillStyle = i === 3 ? COLORS.orange : COLORS.emerald;
          ctx.fillRect(tx, ws + 38, 24, 14);
        }
      }
      label('Worker ocioso ← steals tasks de workers ocupados', 300, ws + 72, COLORS.sub, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawPatterns);
    };

    // ── Step 4: Hardware Parallelism ──
    const drawHardware = () => {
      clear();
      boldLabel('Paralelismo de Hardware', W/2, 25, COLORS.emerald, 16);

      // Flynn's Taxonomy
      boldLabel("Taxonomia de Flynn", W/2, 50, COLORS.emerald, 13);
      const flynn = [
        {name: 'SISD', desc: 'Single Inst / Single Data', ex: 'Scalar CPU', color: COLORS.dim},
        {name: 'SIMD', desc: 'Single Inst / Multiple Data', ex: 'AVX, GPU', color: COLORS.green},
        {name: 'MISD', desc: 'Multiple Inst / Single Data', ex: 'Raro', color: COLORS.dim},
        {name: 'MIMD', desc: 'Multiple Inst / Multiple Data', ex: 'Multi-core', color: COLORS.cyan}
      ];

      flynn.forEach((f, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = 80 + col * 380;
        const y = 70 + row * 40;
        drawRoundedRect(x, y, 340, 30, 4, COLORS.panel, f.color);
        boldLabel(f.name, x + 40, y + 15, f.color, 11);
        label(f.desc, x + 170, y + 15, COLORS.sub, 10);
        label(f.ex, x + 300, y + 15, f.color, 9);
      });

      // MESI Cache Coherence
      const my = 160;
      boldLabel('MESI Cache Coherence Protocol', W/2, my, COLORS.emerald, 13);

      const states = [
        {name: 'M', full: 'Modified', desc: 'Dirty, exclusive', color: COLORS.red},
        {name: 'E', full: 'Exclusive', desc: 'Clean, exclusive', color: COLORS.blue},
        {name: 'S', full: 'Shared', desc: 'Clean, shared', color: COLORS.green},
        {name: 'I', full: 'Invalid', desc: 'Not in cache', color: COLORS.dim}
      ];

      states.forEach((s, i) => {
        const x = 80 + i * 195;
        const active = Math.floor(t/40) % 4 === i;
        drawRoundedRect(x, my + 20, 170, 50, 8, active ? s.color : COLORS.panel, s.color);
        boldLabel(s.name + ' — ' + s.full, x + 85, my + 35, active ? COLORS.bg : s.color, 10);
        label(s.desc, x + 85, my + 55, active ? COLORS.bg : COLORS.sub, 9);
      });

      // Cores with cache lines
      const cy = my + 85;
      for(let i = 0; i < 4; i++) {
        const cx = 60 + i * 200;
        drawRoundedRect(cx, cy, 170, 50, 6, COLORS.panel, COLORS.dim);
        label('Core ' + i + ' L1$', cx + 85, cy + 14, COLORS.sub, 10);
        const cacheState = states[(i + Math.floor(t/40)) % 4];
        drawRoundedRect(cx + 10, cy + 25, 60, 18, 3, null, cacheState.color);
        label('x: ' + cacheState.name, cx + 40, cy + 34, cacheState.color, 9);
        drawRoundedRect(cx + 80, cy + 25, 60, 18, 3, null, COLORS.dim);
        label('y: S', cx + 110, cy + 34, COLORS.dim, 9);
      }

      // Bus
      const busY = cy + 60;
      ctx.beginPath();
      ctx.moveTo(60, busY); ctx.lineTo(830, busY);
      ctx.strokeStyle = COLORS.emerald; ctx.lineWidth = 3; ctx.setLineDash([6,4]); ctx.stroke(); ctx.setLineDash([]);
      boldLabel('Bus / Interconnect (snoop protocol)', W/2, busY + 14, COLORS.emerald, 10);

      // False sharing note
      const fy = busY + 35;
      drawRoundedRect(100, fy, 600, 40, 6, COLORS.panel, COLORS.red);
      boldLabel('False Sharing', 180, fy + 13, COLORS.red, 10);
      label('Threads diferentes escrevem em variáveis diferentes que estão na mesma cache line (64B)', 400, fy + 28, COLORS.sub, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawHardware);
    };

    // ── Step 5: Async & Coroutines ──
    const drawAsync = () => {
      clear();
      boldLabel('Async/Await & Coroutines', W/2, 25, COLORS.emerald, 16);

      // Event Loop
      const ey = 50;
      boldLabel('Event Loop', 200, ey, COLORS.emerald, 13);
      drawRoundedRect(50, ey + 15, 300, 130, 8, COLORS.panel, COLORS.emerald);

      // Loop circle
      const loopCx = 200, loopCy = ey + 80, loopR = 35;
      ctx.beginPath();
      ctx.arc(loopCx, loopCy, loopR, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.emerald; ctx.lineWidth = 2; ctx.stroke();

      // Rotating indicator
      const angle = (t / 30) * Math.PI * 2;
      const dotX = loopCx + Math.cos(angle) * loopR;
      const dotY = loopCy + Math.sin(angle) * loopR;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.emerald;
      ctx.fill();

      // Queue of events
      label('poll', 200, ey + 50, COLORS.sub, 9);
      label('execute', 200, ey + 110, COLORS.sub, 9);

      const events = ['I/O ready', 'timer', 'callback'];
      events.forEach((ev, i) => {
        const ex = 70 + i * 90;
        drawRoundedRect(ex, ey + 125, 80, 18, 3,
          Math.floor(t/25) % 3 === i ? COLORS.emerD : COLORS.panel, COLORS.dim);
        label(ev, ex + 40, ey + 134, COLORS.sub, 8);
      });

      // State Machine (async/await)
      const sx = 430, sy = ey;
      boldLabel('async fn → State Machine', 620, sy, COLORS.cyan, 13);
      drawRoundedRect(sx, sy + 15, 400, 130, 8, COLORS.panel, COLORS.cyan);

      const smStates = [
        {name: 'Start', y: sy + 35, color: COLORS.dim},
        {name: 'Await 1', y: sy + 65, color: COLORS.orange},
        {name: 'Await 2', y: sy + 95, color: COLORS.orange},
        {name: 'Complete', y: sy + 125, color: COLORS.green}
      ];

      const smPhase = Math.floor(t / 45) % 4;
      smStates.forEach((s, i) => {
        const active = smPhase === i;
        drawRoundedRect(sx + 20, s.y, 100, 22, 4, active ? s.color : COLORS.panel, s.color);
        label(s.name, sx + 70, s.y + 11, active ? COLORS.bg : s.color, 10);
        if(i < 3) {
          arrow(sx + 125, s.y + 15, sx + 125, smStates[i+1].y, COLORS.dim);
        }
      });

      label('enum State { Start, Await1(F1), Await2(F2), Done(T) }', sx + 280, sy + 65, COLORS.sub, 9);
      label('cada .await = yield point', sx + 280, sy + 85, COLORS.sub, 9);
      label('executor faz poll()', sx + 280, sy + 105, COLORS.sub, 9);

      // Threading models comparison
      const ty = 205;
      boldLabel('Threading Models', W/2, ty, COLORS.emerald, 14);

      const models = [
        {name: '1:1 (OS threads)', desc: 'Rust, Java (classic), C', cost: '~8MB stack/thread', color: COLORS.blue},
        {name: 'M:N (Green threads)', desc: 'Go goroutines, Erlang', cost: '~2KB stack', color: COLORS.green},
        {name: 'Async (coroutines)', desc: 'Rust Tokio, JS, Python', cost: '~0.5KB per future', color: COLORS.orange},
        {name: 'Virtual Threads', desc: 'Java 21 (Project Loom)', cost: 'M:N c/ API blocking', color: COLORS.purple}
      ];

      models.forEach((m, i) => {
        const y = ty + 25 + i * 34;
        drawRoundedRect(50, y, 180, 26, 4, COLORS.panel, m.color);
        boldLabel(m.name, 140, y + 13, m.color, 10);
        label(m.desc, 340, y + 13, COLORS.text, 10);
        label(m.cost, 550, y + 13, COLORS.sub, 10);
      });

      // Structured Concurrency
      const sc = ty + 170;
      drawRoundedRect(100, sc, 600, 40, 6, COLORS.panel, COLORS.emerald);
      boldLabel('Structured Concurrency', 230, sc + 13, COLORS.emerald, 11);
      label('Tasks filhas não sobrevivem ao escopo pai — cancellation propagada, sem leaks', 400, sc + 28, COLORS.sub, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawAsync);
    };

    switch(stepIdx) {
      case 0: drawFundamentals(); break;
      case 1: drawMemoryModels(); break;
      case 2: drawLockFree(); break;
      case 3: drawPatterns(); break;
      case 4: drawHardware(); break;
      case 5: drawAsync(); break;
      default: drawFundamentals();
    }
  };

  return engine;
}
