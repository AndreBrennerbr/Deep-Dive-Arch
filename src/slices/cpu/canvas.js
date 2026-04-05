import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderCPU(canvas) {
  const engine = new BaseRenderer(canvas);

  const COLORS = {
    bg:      '#050a15',
    orange:  '#f97316',
    orangeD: 'rgba(249,115,22,0.15)',
    blue:    '#3b82f6',
    green:   '#4ade80',
    purple:  '#c084fc',
    red:     '#ef4444',
    yellow:  '#facc15',
    cyan:    '#22d3ee',
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

    // ── STEP 0: Von Neumann ──
    const drawVonNeumann = () => {
      clear();
      const phase = Math.floor(t / 60) % 4;

      // CPU box
      drawRoundedRect(200, 30, 500, 170, 12, COLORS.panel, COLORS.orange);
      boldLabel('CPU', 450, 50, COLORS.orange, 16);

      // CU
      const cuColor = (phase === 0 || phase === 1) ? COLORS.orange : COLORS.dim;
      drawRoundedRect(220, 70, 150, 110, 8, 'rgba(249,115,22,0.08)', cuColor);
      boldLabel('Control Unit', 295, 90, cuColor, 12);
      label('PC: 0x' + (0x1000 + phase * 4).toString(16).toUpperCase(), 295, 115, cuColor, 11);
      label('IR: ' + ['MOV','ADD','CMP','JMP'][phase], 295, 135, cuColor, 11);
      label('Decoder', 295, 158, COLORS.sub, 10);

      // ALU
      const aluColor = phase === 2 ? COLORS.green : COLORS.dim;
      drawRoundedRect(400, 70, 140, 110, 8, 'rgba(74,222,128,0.08)', aluColor);
      boldLabel('ALU', 470, 90, aluColor, 12);
      label('ADD SUB', 470, 115, aluColor, 10);
      label('AND OR XOR', 470, 135, aluColor, 10);
      label('Flags: ZF CF', 470, 158, COLORS.sub, 10);

      // Registers
      const regColor = phase === 3 ? COLORS.cyan : COLORS.dim;
      drawRoundedRect(560, 70, 120, 110, 8, 'rgba(34,211,238,0.08)', regColor);
      boldLabel('Registradores', 620, 90, regColor, 11);
      ['RAX', 'RBX', 'RCX', 'RSP'].forEach((r, i) => {
        label(r, 620, 112 + i * 16, regColor, 10);
      });

      // Bus
      const busY = 230;
      ctx.beginPath();
      ctx.moveTo(250, 200); ctx.lineTo(250, busY);
      ctx.lineTo(650, busY); ctx.lineTo(650, 200);
      ctx.strokeStyle = COLORS.sub; ctx.lineWidth = 3; ctx.setLineDash([6,4]); ctx.stroke(); ctx.setLineDash([]);
      boldLabel('Barramento (Bus)', 450, busY + 14, COLORS.sub, 11);

      // Memory, Disk, I/O
      const boxes = [
        { x: 160, label: 'RAM', sub: 'Dados + Código', color: COLORS.blue },
        { x: 390, label: 'Disco', sub: 'SSD / HDD', color: COLORS.purple },
        { x: 590, label: 'I/O', sub: 'Rede, Teclado', color: COLORS.yellow }
      ];
      boxes.forEach(b => {
        ctx.beginPath();
        ctx.moveTo(b.x + 70, busY + 5); ctx.lineTo(b.x + 70, 280);
        ctx.strokeStyle = b.color; ctx.lineWidth = 1.5; ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
        drawRoundedRect(b.x, 280, 140, 60, 8, COLORS.panel, b.color);
        boldLabel(b.label, b.x + 70, 300, b.color, 13);
        label(b.sub, b.x + 70, 320, COLORS.sub, 10);
      });

      // Cycle indicator
      const phases = ['FETCH', 'DECODE', 'EXECUTE', 'WRITE-BACK'];
      const phaseColors = [COLORS.orange, COLORS.orange, COLORS.green, COLORS.cyan];
      phases.forEach((p, i) => {
        const px = 135 + i * 175;
        const py = 370;
        const active = i === phase;
        drawRoundedRect(px, py - 14, 130, 28, 14, active ? phaseColors[i] : 'transparent', active ? phaseColors[i] : COLORS.dim);
        label(p, px + 65, py, active ? COLORS.bg : COLORS.dim, 11);
      });

      // Arrow between phases
      for(let i = 0; i < 3; i++) {
        const ax = 135 + (i+1) * 175 - 12;
        label('→', ax, 370, COLORS.sub, 14);
      }

      t++;
      this.animFrame = requestAnimationFrame(drawVonNeumann);
    };

    // ── STEP 1: Registradores & ISA ──
    const drawRegisters = () => {
      clear();

      // x86-64 registers
      boldLabel('Registradores x86-64', 230, 30, COLORS.orange, 16);
      const regs = ['RAX','RBX','RCX','RDX','RSI','RDI','RBP','RSP'];
      const regs2 = ['R8','R9','R10','R11','R12','R13','R14','R15'];
      const rw = 80, rh = 34, gap = 6, startX = 50, startY = 55;

      regs.forEach((r, i) => {
        const x = startX + i * (rw + gap);
        const highlight = i === (Math.floor(t / 40) % 8);
        drawRoundedRect(x, startY, rw, rh, 6, highlight ? COLORS.orangeD : COLORS.panel, highlight ? COLORS.orange : COLORS.dim);
        boldLabel(r, x + rw/2, startY + rh/2, highlight ? COLORS.orange : COLORS.sub, 11);
      });
      regs2.forEach((r, i) => {
        const x = startX + i * (rw + gap);
        drawRoundedRect(x, startY + rh + gap, rw, rh, 6, COLORS.panel, COLORS.dim);
        label(r, x + rw/2, startY + rh + gap + rh/2, COLORS.sub, 11);
      });

      // Special regs
      const specY = startY + (rh + gap) * 2 + 15;
      const specials = [
        { name: 'RIP', desc: 'Instruction Pointer', color: COLORS.orange },
        { name: 'RFLAGS', desc: 'ZF CF OF SF', color: COLORS.green },
        { name: 'RSP', desc: 'Stack Pointer', color: COLORS.cyan },
        { name: 'RBP', desc: 'Base Pointer', color: COLORS.purple }
      ];
      specials.forEach((s, i) => {
        const x = 80 + i * 190;
        drawRoundedRect(x, specY, 160, 40, 6, COLORS.panel, s.color);
        boldLabel(s.name, x + 45, specY + 20, s.color, 12);
        label(s.desc, x + 115, specY + 20, COLORS.sub, 10);
      });

      // CISC vs RISC comparison
      const cmpY = specY + 65;
      boldLabel('CISC (x86)', 230, cmpY, COLORS.blue, 14);
      boldLabel('vs', 450, cmpY, COLORS.sub, 14);
      boldLabel('RISC (ARM)', 670, cmpY, COLORS.green, 14);

      const ciscItems = ['Instruções variáveis (1-15B)', 'ADD pode acessar memória', '~1500+ instruções', 'Traduz para µops'];
      const riscItems = ['Instruções fixas (4 bytes)', 'Load/Store separados', '~200 instruções', 'Execução direta'];

      ciscItems.forEach((item, i) => {
        label(item, 230, cmpY + 25 + i * 20, COLORS.sub, 10);
      });
      riscItems.forEach((item, i) => {
        label(item, 670, cmpY + 25 + i * 20, COLORS.sub, 10);
      });

      // Divider line
      ctx.beginPath();
      ctx.moveTo(450, cmpY + 15); ctx.lineTo(450, cmpY + 100);
      ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);

      t++;
      this.animFrame = requestAnimationFrame(drawRegisters);
    };

    // ── STEP 2: Cache Hierarchy ──
    const drawCache = () => {
      clear();
      boldLabel('Hierarquia de Cache', W/2, 25, COLORS.orange, 16);

      const levels = [
        { name: 'Registradores', latency: '~0.25ns', size: '~1 KB', color: COLORS.orange, w: 120 },
        { name: 'Cache L1', latency: '~1 ns', size: '64 KB', color: COLORS.yellow, w: 200 },
        { name: 'Cache L2', latency: '~4 ns', size: '512 KB', color: COLORS.green, w: 300 },
        { name: 'Cache L3', latency: '~12 ns', size: '32 MB', color: COLORS.cyan, w: 420 },
        { name: 'RAM (DDR5)', latency: '~80 ns', size: '32 GB', color: COLORS.blue, w: 560 },
        { name: 'SSD (NVMe)', latency: '~20 µs', size: '1 TB', color: COLORS.purple, w: 700 }
      ];

      const baseY = 50;
      const levelH = 42;
      const gapY = 8;

      levels.forEach((lvl, i) => {
        const y = baseY + i * (levelH + gapY);
        const x = (W - lvl.w) / 2;

        drawRoundedRect(x, y, lvl.w, levelH, 8, COLORS.panel, lvl.color);
        boldLabel(lvl.name, W/2 - 60, y + levelH/2, lvl.color, 12);
        label(lvl.latency, W/2 + 50, y + levelH/2, COLORS.sub, 11);
        label(lvl.size, W/2 + 130, y + levelH/2, COLORS.sub, 11);
      });

      // Animated data fetch ball
      const fetchLevel = Math.floor(t / 50) % 6;
      const progress = (t % 50) / 50;
      const ballY = baseY + fetchLevel * (levelH + gapY) + levelH / 2;
      const ballX = (W - levels[fetchLevel].w) / 2 - 20;

      ctx.beginPath();
      ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
      ctx.fillStyle = levels[fetchLevel].color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
      ctx.strokeStyle = levels[fetchLevel].color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Miss/Hit indicator
      const hitY = baseY + fetchLevel * (levelH + gapY) + levelH / 2;
      const isHit = fetchLevel <= 2;
      const tagX = (W + levels[fetchLevel].w) / 2 + 30;
      if(progress > 0.5) {
        label(isHit ? '✓ HIT' : '✗ MISS', tagX, hitY, isHit ? COLORS.green : COLORS.red, 12);
      }

      // Speed comparison arrows
      const arrowY = baseY + 6 * (levelH + gapY) + 10;
      label('← Mais rápido', 150, arrowY, COLORS.orange, 11);
      label('Mais capacidade →', W - 150, arrowY, COLORS.purple, 11);

      t++;
      this.animFrame = requestAnimationFrame(drawCache);
    };

    // ── STEP 3: Pipeline ──
    const drawPipeline = () => {
      clear();
      boldLabel('Pipeline de 5 Estágios', W/2, 25, COLORS.orange, 16);

      const stages = ['IF','ID','EX','MEM','WB'];
      const stageNames = ['Fetch','Decode','Execute','Memory','Write-Back'];
      const stageColors = [COLORS.orange, COLORS.yellow, COLORS.green, COLORS.cyan, COLORS.blue];
      const sw = 130, sh = 36, gx = 12, gy = 8;
      const baseX = 80, baseY = 55;
      const numInst = 5;

      // Draw pipeline grid
      for(let inst = 0; inst < numInst; inst++) {
        for(let stage = 0; stage < 5; stage++) {
          const cycle = inst + stage;
          const x = baseX + cycle * (sw + gx);
          const y = baseY + inst * (sh + gy);

          if(x + sw > W - 20) continue;

          const isActive = Math.floor(t / 30) % (numInst + 4) === cycle;
          drawRoundedRect(x, y, sw, sh, 6,
            isActive ? stageColors[stage] : COLORS.panel,
            isActive ? stageColors[stage] : stageColors[stage] + '40');
          boldLabel(stages[stage], x + sw/2, y + sh/2,
            isActive ? COLORS.bg : stageColors[stage], 12);
        }
        label('Inst ' + (inst + 1), baseX - 45, baseY + inst * (sh + gy) + sh/2, COLORS.sub, 11);
      }

      // Stage labels at top
      for(let s = 0; s < 5; s++) {
        label(stageNames[s], baseX + s * (sw + gx) + sw/2, baseY - 15, stageColors[s], 10);
      }

      // Branch prediction section
      const bpY = 300;
      boldLabel('Branch Prediction', W/2, bpY, COLORS.orange, 14);

      const accuracy = 97 + Math.sin(t / 40) * 1.5;
      const barW = 300, barH = 20;
      const barX = (W - barW) / 2;
      drawRoundedRect(barX, bpY + 20, barW, barH, 10, COLORS.panel, COLORS.dim);
      drawRoundedRect(barX, bpY + 20, barW * (accuracy / 100), barH, 10, COLORS.green, null);
      boldLabel(accuracy.toFixed(1) + '% acurácia', W/2, bpY + 30, COLORS.bg, 11);

      label('Taken ✓', barX + barW * 0.75, bpY + 55, COLORS.green, 11);
      label('Misprediction ✗ → Pipeline Flush (~15 ciclos)', W/2, bpY + 75, COLORS.red, 11);

      t++;
      this.animFrame = requestAnimationFrame(drawPipeline);
    };

    // ── STEP 4: GPU vs CPU ──
    const drawGPU = () => {
      clear();

      // CPU side
      const cpuX = 50, cpuY = 40, cpuW = 350, cpuH = 200;
      drawRoundedRect(cpuX, cpuY, cpuW, cpuH, 12, COLORS.panel, COLORS.blue);
      boldLabel('CPU — Latência', cpuX + cpuW/2, cpuY + 20, COLORS.blue, 14);

      // CPU cores (few, big)
      for(let i = 0; i < 4; i++) {
        const cx = cpuX + 30 + i * 80;
        const cy = cpuY + 50;
        drawRoundedRect(cx, cy, 65, 80, 6, 'rgba(59,130,246,0.1)', COLORS.blue);
        boldLabel('Core ' + i, cx + 32, cy + 15, COLORS.blue, 10);
        label('ALU', cx + 32, cy + 35, COLORS.sub, 9);
        label('Branch', cx + 32, cy + 50, COLORS.sub, 9);
        label('L1$', cx + 32, cy + 65, COLORS.sub, 9);
      }
      drawRoundedRect(cpuX + 30, cpuY + 145, 300, 25, 6, 'rgba(59,130,246,0.05)', COLORS.dim);
      label('L3 Cache — 32 MB', cpuX + 180, cpuY + 157, COLORS.sub, 10);
      label('~1 TFLOPS', cpuX + cpuW/2, cpuY + cpuH + 15, COLORS.blue, 11);

      // GPU side
      const gpuX = 500, gpuY = 40, gpuW = 350, gpuH = 200;
      drawRoundedRect(gpuX, gpuY, gpuW, gpuH, 12, COLORS.panel, COLORS.green);
      boldLabel('GPU — Throughput', gpuX + gpuW/2, gpuY + 20, COLORS.green, 14);

      // GPU cores (many, small)
      const smCols = 16, smRows = 6;
      for(let r = 0; r < smRows; r++) {
        for(let c = 0; c < smCols; c++) {
          const sx = gpuX + 15 + c * 21;
          const sy = gpuY + 45 + r * 21;
          const active = ((c + r + Math.floor(t/5)) % 4) === 0;
          ctx.fillStyle = active ? COLORS.green : 'rgba(74,222,128,0.15)';
          ctx.fillRect(sx, sy, 17, 17);
        }
      }
      label('~16.384 CUDA cores', gpuX + gpuW/2, gpuY + 180, COLORS.sub, 10);
      label('~83 TFLOPS', gpuX + gpuW/2, gpuY + gpuH + 15, COLORS.green, 11);

      // SIMD illustration
      const simdY = 280;
      boldLabel('SIMD: Uma instrução, múltiplos dados', W/2, simdY, COLORS.orange, 14);

      // Scalar
      const scY = simdY + 30;
      label('Escalar:', 100, scY + 15, COLORS.sub, 11);
      for(let i = 0; i < 4; i++) {
        const active = Math.floor(t/25) % 4 === i;
        drawRoundedRect(170 + i * 70, scY, 60, 30, 4,
          active ? 'rgba(249,115,22,0.2)' : COLORS.panel, active ? COLORS.orange : COLORS.dim);
        label('A[' + i + ']+B[' + i + ']', 200 + i * 70, scY + 15, active ? COLORS.orange : COLORS.sub, 10);
      }
      label('4 ciclos', 480, scY + 15, COLORS.red, 11);

      // SIMD
      const svY = scY + 50;
      label('AVX:', 100, svY + 15, COLORS.sub, 11);
      const allActive = true;
      for(let i = 0; i < 4; i++) {
        drawRoundedRect(170 + i * 70, svY, 60, 30, 4, 'rgba(74,222,128,0.2)', COLORS.green);
        label('A[' + i + ']+B[' + i + ']', 200 + i * 70, svY + 15, COLORS.green, 10);
      }
      label('1 ciclo', 480, svY + 15, COLORS.green, 11);

      // Brace around SIMD
      drawRoundedRect(165, svY - 3, 285, 36, 4, null, COLORS.green);

      t++;
      this.animFrame = requestAnimationFrame(drawGPU);
    };

    // ── STEP 5: Virtual Memory ──
    const drawVirtualMemory = () => {
      clear();
      boldLabel('Memória Virtual', W/2, 20, COLORS.orange, 16);

      // Process A virtual space
      const vaX = 60, vaY = 50, vaW = 160, vaH = 200;
      drawRoundedRect(vaX, vaY, vaW, vaH, 10, COLORS.panel, COLORS.blue);
      boldLabel('Processo A', vaX + vaW/2, vaY + 18, COLORS.blue, 12);
      const pagesA = ['0x7FFF 1000', '0x7FFF 2000', '0x7FFF 3000', '0x7FFF 4000'];
      pagesA.forEach((p, i) => {
        const py = vaY + 40 + i * 38;
        const highlight = Math.floor(t/50) % 4 === i;
        drawRoundedRect(vaX + 10, py, vaW - 20, 30, 4,
          highlight ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.05)', highlight ? COLORS.blue : COLORS.dim);
        label(p, vaX + vaW/2, py + 15, highlight ? COLORS.blue : COLORS.sub, 10);
      });

      // Process B virtual space
      const vbX = vaX, vbY = vaY + vaH + 30;
      drawRoundedRect(vbX, vbY, vaW, 120, 10, COLORS.panel, COLORS.purple);
      boldLabel('Processo B', vbX + vaW/2, vbY + 18, COLORS.purple, 12);
      const pagesB = ['0x7FFF 1000', '0x7FFF 2000'];
      pagesB.forEach((p, i) => {
        const py = vbY + 40 + i * 38;
        drawRoundedRect(vbX + 10, py, vaW - 20, 30, 4, 'rgba(192,132,252,0.05)', COLORS.dim);
        label(p, vbX + vaW/2, py + 15, COLORS.sub, 10);
      });

      // MMU / Page Table
      const mmuX = 320, mmuY = 130;
      drawRoundedRect(mmuX, mmuY, 160, 80, 10, COLORS.panel, COLORS.orange);
      boldLabel('MMU', mmuX + 80, mmuY + 20, COLORS.orange, 14);
      label('Page Table Walk', mmuX + 80, mmuY + 45, COLORS.sub, 10);
      label('4 níveis (x86-64)', mmuX + 80, mmuY + 62, COLORS.sub, 10);

      // TLB
      drawRoundedRect(mmuX + 10, mmuY + 90, 140, 35, 6, 'rgba(250,204,21,0.1)', COLORS.yellow);
      boldLabel('TLB Cache', mmuX + 80, mmuY + 107, COLORS.yellow, 11);

      // Physical Memory
      const pmX = 580, pmY = 50, pmW = 250, pmH = 300;
      drawRoundedRect(pmX, pmY, pmW, pmH, 10, COLORS.panel, COLORS.green);
      boldLabel('RAM Física', pmX + pmW/2, pmY + 18, COLORS.green, 13);

      const physPages = [
        { addr: '0x0003A', procLabel: 'A pg1', color: COLORS.blue },
        { addr: '0x0012F', procLabel: 'A pg2', color: COLORS.blue },
        { addr: '0x00891', procLabel: 'B pg1', color: COLORS.purple },
        { addr: '0x009C2', procLabel: 'A pg3', color: COLORS.blue },
        { addr: '0x00A10', procLabel: 'B pg2', color: COLORS.purple },
        { addr: '0x00F33', procLabel: 'A pg4', color: COLORS.blue },
        { addr: '0x01200', procLabel: '(livre)', color: COLORS.dim }
      ];
      physPages.forEach((p, i) => {
        const py = pmY + 38 + i * 36;
        drawRoundedRect(pmX + 10, py, pmW - 20, 28, 4, 'rgba(74,222,128,0.05)', p.color === COLORS.dim ? COLORS.dim : p.color + '60');
        label(p.addr, pmX + 65, py + 14, p.color, 10);
        label(p.procLabel, pmX + 170, py + 14, p.color, 10);
      });

      // Arrows from Process A to MMU
      ctx.beginPath();
      ctx.moveTo(vaX + vaW, vaY + vaH/2);
      ctx.lineTo(mmuX, mmuY + 40);
      ctx.strokeStyle = COLORS.blue; ctx.lineWidth = 1.5;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);

      // Arrow from Process B to MMU
      ctx.beginPath();
      ctx.moveTo(vbX + vaW, vbY + 60);
      ctx.lineTo(mmuX, mmuY + 60);
      ctx.strokeStyle = COLORS.purple; ctx.lineWidth = 1.5;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);

      // Arrow from MMU to Physical
      ctx.beginPath();
      ctx.moveTo(mmuX + 160, mmuY + 40);
      ctx.lineTo(pmX, pmY + pmH/2);
      ctx.strokeStyle = COLORS.orange; ctx.lineWidth = 2;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);

      // Animated translation dot
      const dotProgress = (t % 80) / 80;
      let dotX, dotY;
      if(dotProgress < 0.5) {
        const p = dotProgress * 2;
        dotX = vaX + vaW + (mmuX - vaX - vaW) * p;
        dotY = vaY + vaH/2 + (mmuY + 40 - vaY - vaH/2) * p;
      } else {
        const p = (dotProgress - 0.5) * 2;
        dotX = mmuX + 160 + (pmX - mmuX - 160) * p;
        dotY = mmuY + 40 + (pmY + pmH/2 - mmuY - 40) * p;
      }
      ctx.beginPath();
      ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.orange; ctx.fill();

      t++;
      this.animFrame = requestAnimationFrame(drawVirtualMemory);
    };

    // Dispatch
    switch(stepIdx) {
      case 0: drawVonNeumann(); break;
      case 1: drawRegisters(); break;
      case 2: drawCache(); break;
      case 3: drawPipeline(); break;
      case 4: drawGPU(); break;
      case 5: drawVirtualMemory(); break;
      default: drawVonNeumann();
    }
  };

  return engine;
}
