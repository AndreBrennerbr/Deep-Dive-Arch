import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderOS(canvas) {
  const engine = new BaseRenderer(canvas);

  const C = {
    bg:     '#050a15',
    yellow: '#facc15',
    yellowD:'rgba(250,204,21,0.12)',
    blue:   '#3b82f6',
    green:  '#4ade80',
    red:    '#ef4444',
    purple: '#c084fc',
    orange: '#f97316',
    cyan:   '#22d3ee',
    dim:    '#334155',
    text:   '#e2e8f0',
    sub:    '#94a3b8',
    panel:  '#0f172a'
  };

  engine.drawStep = function(stepIdx) {
    this.stop();
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;
    let t = 0;

    const clear = () => { ctx.fillStyle = C.bg; ctx.fillRect(0,0,W,H); };
    const rr = (x,y,w,h,r,fill,stroke) => {
      ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
      if(fill){ ctx.fillStyle=fill; ctx.fill(); }
      if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=2; ctx.stroke(); }
    };
    const txt = (s,x,y,color,size,align) => {
      ctx.fillStyle=color||C.text; ctx.font=`${size||13}px sans-serif`;
      ctx.textAlign=align||'center'; ctx.textBaseline='middle'; ctx.fillText(s,x,y);
    };
    const bold = (s,x,y,color,size,align) => {
      ctx.fillStyle=color||C.text; ctx.font=`bold ${size||14}px sans-serif`;
      ctx.textAlign=align||'center'; ctx.textBaseline='middle'; ctx.fillText(s,x,y);
    };

    // ── STEP 0: Process States ──
    const drawProcessStates = () => {
      clear();
      bold('Estados de um Processo', W/2, 25, C.yellow, 16);

      const states = [
        { name: 'CREATED', x: 140, y: 70, color: C.sub },
        { name: 'READY', x: 350, y: 70, color: C.blue },
        { name: 'RUNNING', x: 560, y: 70, color: C.green },
        { name: 'BLOCKED', x: 350, y: 210, color: C.orange },
        { name: 'ZOMBIE', x: 700, y: 210, color: C.red },
        { name: 'TERMINATED', x: 700, y: 330, color: C.dim }
      ];

      const activeIdx = Math.floor(t / 60) % states.length;

      states.forEach((s, i) => {
        const isActive = i === activeIdx;
        rr(s.x - 60, s.y - 18, 120, 36, 18,
          isActive ? s.color : C.panel,
          isActive ? s.color : s.color + '60');
        bold(s.name, s.x, s.y, isActive ? C.bg : s.color, 11);
      });

      // Arrows
      const arrow = (from, to, label, color) => {
        ctx.beginPath();
        ctx.moveTo(from.x + 60, from.y);
        ctx.lineTo(to.x - 60, to.y);
        ctx.strokeStyle = color || C.dim;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2 - 12;
        txt(label, mx, my, C.sub, 9);
      };

      arrow(states[0], states[1], 'admitted', C.blue);
      arrow(states[1], states[2], 'dispatch', C.green);

      // Running → Ready (preempt)
      ctx.beginPath();
      ctx.moveTo(states[2].x - 30, states[2].y + 18);
      ctx.quadraticCurveTo(450, 140, states[1].x + 30, states[1].y + 18);
      ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
      txt('preempt', 460, 140, C.sub, 9);

      // Running → Blocked
      ctx.beginPath();
      ctx.moveTo(states[2].x - 20, states[2].y + 18);
      ctx.lineTo(states[3].x + 60, states[3].y - 18);
      ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
      txt('I/O wait', 500, 155, C.sub, 9);

      // Blocked → Ready
      ctx.beginPath();
      ctx.moveTo(states[3].x - 60, states[3].y - 10);
      ctx.lineTo(states[1].x - 40, states[1].y + 18);
      ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
      txt('I/O done', 260, 150, C.sub, 9);

      // Running → Zombie
      ctx.beginPath();
      ctx.moveTo(states[2].x + 40, states[2].y + 18);
      ctx.lineTo(states[4].x - 40, states[4].y - 18);
      ctx.strokeStyle = C.red; ctx.lineWidth = 1.5;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
      txt('exit()', 660, 130, C.sub, 9);

      // Zombie → Terminated
      arrow(states[4], states[5], 'wait()', C.dim);

      // PCB box
      const pcbX = 50, pcbY = 270;
      rr(pcbX, pcbY, 550, 110, 10, C.panel, C.yellow);
      bold('PCB (task_struct)', pcbX + 275, pcbY + 18, C.yellow, 13);
      const fields = [
        'pid: 1234', 'state: RUNNING', 'mm → page tables',
        'files → fd table', 'parent → pid 1100', 'vruntime: 42ms'
      ];
      fields.forEach((f, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        txt(f, pcbX + 30 + col * 185, pcbY + 48 + row * 28, C.sub, 11, 'left');
      });

      t++;
      this.animFrame = requestAnimationFrame(drawProcessStates);
    };

    // ── STEP 1: CFS Scheduler ──
    const drawScheduler = () => {
      clear();
      bold('CFS — Completely Fair Scheduler', W/2, 25, C.yellow, 16);

      // Ready queue processes
      const processes = [
        { name: 'P1', vruntime: 20, color: C.blue },
        { name: 'P2', vruntime: 35, color: C.green },
        { name: 'P3', vruntime: 50, color: C.purple },
        { name: 'P4', vruntime: 70, color: C.orange },
        { name: 'P5', vruntime: 90, color: C.red }
      ];

      // Animate: running process accumulates vruntime
      const runIdx = Math.floor(t / 80) % processes.length;
      const animOffset = (t % 80) * 0.5;
      const procs = processes.map((p, i) => ({
        ...p,
        vruntime: p.vruntime + (i === runIdx ? animOffset : 0)
      }));
      const sorted = [...procs].sort((a, b) => a.vruntime - b.vruntime);

      // Red-Black Tree visualization
      bold('Red-Black Tree (por vruntime)', 250, 55, C.yellow, 13);

      // Simple binary tree layout
      const treeNodes = sorted.map((p, i) => {
        let x, y;
        if(i === 2) { x = 250; y = 90; }         // root
        else if(i === 1) { x = 150; y = 145; }    // left
        else if(i === 3) { x = 350; y = 145; }    // right
        else if(i === 0) { x = 100; y = 200; }    // left-left (NEXT!)
        else { x = 400; y = 200; }                 // right-right
        return { ...p, x, y };
      });

      // Tree edges
      if(treeNodes.length >= 5) {
        [[2,1],[2,3],[1,0],[3,4]].forEach(([from, to]) => {
          ctx.beginPath();
          ctx.moveTo(treeNodes[from].x, treeNodes[from].y + 14);
          ctx.lineTo(treeNodes[to].x, treeNodes[to].y - 14);
          ctx.strokeStyle = C.dim; ctx.lineWidth = 1; ctx.stroke();
        });
      }

      treeNodes.forEach((n, i) => {
        const isNext = i === 0;
        rr(n.x - 35, n.y - 14, 70, 28, 14,
          isNext ? C.yellow : C.panel,
          isNext ? C.yellow : n.color);
        bold(n.name, n.x - 10, n.y, isNext ? C.bg : n.color, 11);
        txt(Math.round(n.vruntime) + 'ms', n.x + 18, n.y, isNext ? C.bg : C.sub, 9);
      });

      // "Next" indicator
      if(treeNodes[0]) {
        txt('↑ NEXT', treeNodes[0].x, treeNodes[0].y + 25, C.yellow, 10);
      }

      // CPU running
      const cpuX = 600, cpuY = 65;
      rr(cpuX, cpuY, 200, 80, 10, C.panel, C.green);
      bold('CPU — Running', cpuX + 100, cpuY + 20, C.green, 13);
      const running = procs[runIdx];
      rr(cpuX + 20, cpuY + 40, 160, 28, 6, running.color + '20', running.color);
      bold(running.name + ' (vrt: ' + Math.round(running.vruntime) + 'ms)', cpuX + 100, cpuY + 54, running.color, 11);

      // Time slice bar
      const tsX = 600, tsY = 170;
      bold('Time Slice', tsX + 100, tsY, C.sub, 11);
      const tsProgress = (t % 80) / 80;
      rr(tsX, tsY + 15, 200, 14, 7, C.panel, C.dim);
      rr(tsX, tsY + 15, 200 * tsProgress, 14, 7, C.yellow, null);
      txt(Math.round(tsProgress * 6) + 'ms / 6ms', tsX + 100, tsY + 22, C.bg, 9);

      // Round-Robin comparison
      const rrY = 250;
      bold('Round-Robin (comparação)', W/2, rrY, C.sub, 12);
      const rrSlots = 12;
      for(let i = 0; i < rrSlots; i++) {
        const proc = processes[i % processes.length];
        const x = 115 + i * 58;
        const active = i === Math.floor(t / 20) % rrSlots;
        rr(x, rrY + 20, 50, 28, 4,
          active ? proc.color : C.panel, active ? proc.color : proc.color + '40');
        bold(proc.name, x + 25, rrY + 34, active ? C.bg : proc.color, 10);
      }

      // Nice values illustration
      const niceY = 320;
      bold('Efeito do nice no vruntime', W/2, niceY, C.yellow, 12);
      const nices = [
        { nice: '-20', speed: '0.1x', w: 30, color: C.green },
        { nice: '0', speed: '1x', w: 100, color: C.blue },
        { nice: '+19', speed: '88x', w: 280, color: C.red }
      ];
      nices.forEach((n, i) => {
        const y = niceY + 20 + i * 25;
        txt('nice ' + n.nice, 130, y + 8, C.sub, 10);
        rr(200, y, n.w * (1 + Math.sin(t/30)*0.05), 16, 4, n.color + '40', n.color);
        txt('vruntime cresce ' + n.speed, 200 + n.w + 15, y + 8, n.color, 10, 'left');
      });

      t++;
      this.animFrame = requestAnimationFrame(drawScheduler);
    };

    // ── STEP 2: Threads ──
    const drawThreads = () => {
      clear();
      bold('Threads & Sincronização', W/2, 25, C.yellow, 16);

      // Process container
      rr(50, 50, 400, 180, 10, C.panel, C.blue);
      bold('Processo (Espaço Virtual)', 250, 70, C.blue, 13);

      // Shared memory
      rr(70, 90, 160, 50, 6, 'rgba(59,130,246,0.08)', C.blue);
      txt('Heap (compartilhado)', 150, 105, C.blue, 10);
      txt('Code (compartilhado)', 150, 125, C.sub, 10);

      // Thread stacks
      const threads = [
        { name: 'T0', x: 270, color: C.green },
        { name: 'T1', x: 330, color: C.purple },
        { name: 'T2', x: 390, color: C.orange }
      ];
      threads.forEach(th => {
        rr(th.x - 25, 90, 50, 55, 4, C.panel, th.color);
        bold(th.name, th.x, 100, th.color, 10);
        txt('Stack', th.x, 120, C.sub, 9);
        txt('Regs', th.x, 133, C.sub, 9);
      });

      // Race condition animation
      const raceY = 260;
      bold('Race Condition: counter++', W/2, raceY - 10, C.red, 13);

      const phase = Math.floor(t / 40) % 6;
      const steps = [
        { a: 'LOAD R1 ← 0', b: '', counter: 0 },
        { a: '', b: 'LOAD R2 ← 0', counter: 0 },
        { a: 'R1 = 0 + 1 = 1', b: '', counter: 0 },
        { a: '', b: 'R2 = 0 + 1 = 1', counter: 0 },
        { a: 'STORE R1 → cnt', b: '', counter: 1 },
        { a: '', b: 'STORE R2 → cnt', counter: 1 }
      ];
      const step = steps[phase];

      // Thread A column
      rr(80, raceY, 200, 30, 6, step.a ? C.green + '20' : C.panel, step.a ? C.green : C.dim);
      bold('Thread A', 180, raceY + 15, step.a ? C.green : C.dim, 11);
      if(step.a) txt(step.a, 180, raceY + 45, C.green, 11);

      // Thread B column
      rr(340, raceY, 200, 30, 6, step.b ? C.purple + '20' : C.panel, step.b ? C.purple : C.dim);
      bold('Thread B', 440, raceY + 15, step.b ? C.purple : C.dim, 11);
      if(step.b) txt(step.b, 440, raceY + 45, C.purple, 11);

      // Counter
      rr(620, raceY, 130, 30, 6, C.panel, C.yellow);
      bold('counter = ' + step.counter, 685, raceY + 15, C.yellow, 12);
      if(phase === 5) {
        txt('❌ Deveria ser 2!', 685, raceY + 50, C.red, 11);
      }

      // Mutex solution
      const mY = raceY + 90;
      bold('Solução: Mutex', W/2, mY, C.yellow, 12);
      rr(200, mY + 15, 500, 30, 6, C.panel, C.yellow);
      const lockHeld = Math.floor(t/60) % 2 === 0;
      txt(lockHeld ? '🔒 T0 segura o lock — T1 bloqueado' : '🔓 Lock livre — T1 adquire', 450, mY + 30, lockHeld ? C.green : C.purple, 11);

      t++;
      this.animFrame = requestAnimationFrame(drawThreads);
    };

    // ── STEP 3: Memory Layout ──
    const drawMemoryLayout = () => {
      clear();
      bold('Layout de Memória de um Processo', W/2, 20, C.yellow, 16);

      const segments = [
        { name: 'Kernel Space', addr: '0xFFFF...', h: 40, color: C.red, desc: 'Inacessível em user mode' },
        { name: 'Stack ↓', addr: '0x7FFF...', h: 55, color: C.green, desc: 'Variáveis locais, frames' },
        { name: 'mmap / Libs', addr: '', h: 45, color: C.cyan, desc: '.so, alocações grandes' },
        { name: 'Heap ↑', addr: '', h: 55, color: C.purple, desc: 'malloc() / free()' },
        { name: 'BSS', addr: '', h: 30, color: C.orange, desc: 'Globals não inicializados' },
        { name: 'Data', addr: '', h: 30, color: C.blue, desc: 'Globals inicializados' },
        { name: 'Text (Code)', addr: '0x0040...', h: 35, color: C.yellow, desc: 'Read-only + Execute' }
      ];

      let y = 45;
      const x = 280, w = 300;
      segments.forEach((seg, i) => {
        rr(x, y, w, seg.h, 4, C.panel, seg.color);
        bold(seg.name, x + w/2, y + seg.h/2 - 7, seg.color, 12);
        txt(seg.desc, x + w/2, y + seg.h/2 + 10, C.sub, 10);
        if(seg.addr) {
          txt(seg.addr, x - 10, y + seg.h/2, C.dim, 9, 'right');
        }
        y += seg.h + 4;
      });

      // Animated malloc
      const mallocY = 255;
      const allocPhase = Math.floor(t / 60) % 3;
      const mallocLabels = [
        'malloc(1GB) → kernel: mmap()',
        'Page Fault! → aloca 1 página (4KB)',
        'Lazy: só páginas acessadas usam RAM'
      ];

      rr(40, mallocY + 30, 220, 60, 8, C.panel, C.yellow);
      bold('Demand Paging', 150, mallocY + 45, C.yellow, 11);
      txt(mallocLabels[allocPhase], 150, mallocY + 68, C.sub, 9);

      // Pulsing dot on active segment
      const pulseR = 4 + Math.sin(t / 10) * 2;
      ctx.beginPath();
      ctx.arc(x + w + 15, 165 + allocPhase * 40, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = C.yellow;
      ctx.fill();

      t++;
      this.animFrame = requestAnimationFrame(drawMemoryLayout);
    };

    // ── STEP 4: Syscalls ──
    const drawSyscalls = () => {
      clear();
      bold('System Call: write(fd, buf, n)', W/2, 20, C.yellow, 16);

      // User Space
      rr(50, 50, 350, 140, 10, C.panel, C.blue);
      bold('User Space', 225, 70, C.blue, 14);

      // Kernel Space
      rr(50, 230, 350, 140, 10, C.panel, C.red);
      bold('Kernel Space', 225, 250, C.red, 14);

      // Ring transition
      const phase = Math.floor(t / 50) % 5;
      const ringY = 195;
      rr(100, ringY, 250, 25, 12,
        phase === 2 ? C.yellow + '20' : C.panel,
        phase === 2 ? C.yellow : C.dim);
      bold(phase === 2 ? '⚡ SYSCALL (Ring 3→0)' : 'Ring Transition', 225, ringY + 12,
        phase === 2 ? C.yellow : C.dim, 11);

      // Steps in user space
      const userSteps = [
        { text: 'MOV RAX, 1 (sys_write)', active: phase === 0 },
        { text: 'MOV RDI/RSI/RDX (args)', active: phase === 1 },
        { text: 'SYSCALL instruction', active: phase === 2 }
      ];
      userSteps.forEach((s, i) => {
        const sy = 95 + i * 28;
        rr(80, sy, 290, 22, 4, s.active ? C.blue + '20' : 'transparent', s.active ? C.blue : C.dim);
        txt(s.text, 225, sy + 11, s.active ? C.blue : C.sub, 10);
      });

      // Steps in kernel space
      const kernSteps = [
        { text: 'sys_call_table[1] → ksys_write()', active: phase === 3 },
        { text: 'vfs_write → driver → hardware', active: phase === 3 },
        { text: 'SYSRET (return RAX)', active: phase === 4 }
      ];
      kernSteps.forEach((s, i) => {
        const sy = 270 + i * 28;
        rr(80, sy, 290, 22, 4, s.active ? C.red + '20' : 'transparent', s.active ? C.red : C.dim);
        txt(s.text, 225, sy + 11, s.active ? C.red : C.sub, 10);
      });

      // Animated arrow
      const arrowPhase = (t % 50) / 50;
      let arrowY;
      if(phase <= 2) arrowY = 100 + phase * 28 + 11;
      else if(phase === 3) arrowY = 280;
      else arrowY = 326;

      ctx.beginPath();
      ctx.arc(72, arrowY, 4, 0, Math.PI * 2);
      ctx.fillStyle = phase <= 2 ? C.blue : C.red;
      ctx.fill();

      // I/O Models on the right
      const ioX = 480, ioY = 50;
      bold('Modelos de I/O', ioX + 170, ioY, C.yellow, 13);
      const models = [
        { name: 'Blocking', desc: 'read() → dorme', color: C.dim },
        { name: 'Non-Blocking', desc: 'read() → EAGAIN', color: C.orange },
        { name: 'epoll', desc: '1 thread, N fds', color: C.green },
        { name: 'io_uring', desc: 'zero-copy, async', color: C.cyan }
      ];
      models.forEach((m, i) => {
        const my = ioY + 25 + i * 50;
        rr(ioX, my, 340, 38, 8, C.panel, m.color);
        bold(m.name, ioX + 70, my + 12, m.color, 11);
        txt(m.desc, ioX + 70, my + 28, C.sub, 9);

        // Performance bar
        const perf = [1, 2, 4, 6][i];
        rr(ioX + 150, my + 10, perf * 28, 10, 5, m.color + '40', m.color);
      });
      txt('← Mais escalável', ioX + 280, ioY + 235, C.cyan, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawSyscalls);
    };

    // ── STEP 5: File System ──
    const drawFileSystem = () => {
      clear();
      bold('ext4: Inodes & Journaling', W/2, 20, C.yellow, 16);

      // Disk blocks
      const diskX = 50, diskY = 45;
      rr(diskX, diskY, 800, 55, 10, C.panel, C.yellow);
      bold('Disco (blocos de 4KB)', diskX + 400, diskY + 14, C.yellow, 12);
      const blockNames = ['Super\nblock', 'Group\nDesc', 'Inode\nBitmap', 'Block\nBitmap', 'Inode\nTable', 'Data Blocks...'];
      const blockColors = [C.orange, C.purple, C.cyan, C.cyan, C.green, C.blue];
      blockNames.forEach((name, i) => {
        const bx = diskX + 10 + i * 130;
        rr(bx, diskY + 28, 120, 22, 4, blockColors[i] + '15', blockColors[i]);
        txt(name.split('\n')[0], bx + 60, diskY + 39, blockColors[i], 9);
      });

      // Inode detail
      const inX = 50, inY = 120;
      rr(inX, inY, 380, 160, 10, C.panel, C.green);
      bold('Inode #2359301', inX + 190, inY + 18, C.green, 13);

      const inodeFields = [
        'mode: -rwxr-xr-x',
        'uid: 1000  gid: 1000',
        'size: 48.291 bytes',
        'mtime: 2026-04-04 18:22',
        'links: 1',
        'extents: [blk 1000, len 8]'
      ];
      inodeFields.forEach((f, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        txt(f, inX + 20 + col * 195, inY + 45 + row * 25, C.sub, 10, 'left');
      });

      // Arrow from inode to data blocks
      ctx.beginPath();
      ctx.moveTo(inX + 380, inY + 120);
      ctx.lineTo(500, inY + 120);
      ctx.strokeStyle = C.green; ctx.lineWidth = 1.5;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);

      // Data blocks
      const dbX = 500, dbY = inY + 20;
      rr(dbX, dbY, 340, 130, 10, C.panel, C.blue);
      bold('Data Blocks', dbX + 170, dbY + 18, C.blue, 12);

      for(let i = 0; i < 8; i++) {
        const bx = dbX + 15 + (i % 4) * 80;
        const by = dbY + 40 + Math.floor(i / 4) * 40;
        const active = Math.floor(t / 20) % 8 === i;
        rr(bx, by, 65, 30, 4, active ? C.blue + '20' : C.panel, active ? C.blue : C.dim);
        txt('Blk ' + (1000 + i), bx + 32, by + 15, active ? C.blue : C.sub, 9);
      }

      // Journaling
      const jY = 300;
      bold('Journaling (Write-Ahead Log)', W/2, jY, C.yellow, 13);

      const journalPhases = ['1. Write to Journal', '2. Update Metadata', '3. Mark Complete'];
      const currentJ = Math.floor(t / 50) % 3;

      journalPhases.forEach((jp, i) => {
        const jx = 130 + i * 250;
        const isActive = i === currentJ;
        rr(jx, jY + 20, 200, 35, 8,
          isActive ? C.yellow + '20' : C.panel,
          isActive ? C.yellow : C.dim);
        bold(jp, jx + 100, jY + 37, isActive ? C.yellow : C.sub, 10);
      });

      // Arrows between journal phases
      for(let i = 0; i < 2; i++) {
        txt('→', 330 + i * 250, jY + 37, C.sub, 16);
      }

      // Crash protection note
      const crashActive = currentJ === 1;
      if(crashActive) {
        rr(300, jY + 65, 300, 25, 6, C.red + '15', C.red);
        txt('💥 CRASH AQUI → replay journal = consistente', 450, jY + 77, C.red, 10);
      }

      t++;
      this.animFrame = requestAnimationFrame(drawFileSystem);
    };

    switch(stepIdx) {
      case 0: drawProcessStates(); break;
      case 1: drawScheduler(); break;
      case 2: drawThreads(); break;
      case 3: drawMemoryLayout(); break;
      case 4: drawSyscalls(); break;
      case 5: drawFileSystem(); break;
      default: drawProcessStates();
    }
  };

  return engine;
}
