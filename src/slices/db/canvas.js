import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderDB(canvas) {
  const engine = new BaseRenderer(canvas);

  const COLORS = {
    bg:      '#050a15',
    cyan:    '#06b6d4',
    cyanD:   'rgba(6,182,212,0.15)',
    blue:    '#3b82f6',
    green:   '#4ade80',
    purple:  '#c084fc',
    red:     '#ef4444',
    yellow:  '#facc15',
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

    // ── Step 0: Storage Engine (B-Tree vs LSM) ──
    const drawStorage = () => {
      clear();
      boldLabel('B-Tree vs LSM-Tree', W/2, 25, COLORS.cyan, 16);

      // B-Tree side
      const bx = 50;
      boldLabel('B-Tree (PostgreSQL, MySQL/InnoDB)', 230, 50, COLORS.cyan, 13);

      // Root
      drawRoundedRect(170, 70, 120, 30, 6, COLORS.cyanD, COLORS.cyan);
      boldLabel('[30 | 70]', 230, 85, COLORS.cyan, 11);

      // Level 1
      const l1 = [{x: 60, keys: '[10|20]'}, {x: 220, keys: '[40|55]'}, {x: 380, keys: '[80|90]'}];
      l1.forEach((n, i) => {
        drawRoundedRect(n.x, 120, 100, 26, 4, COLORS.panel, COLORS.dim);
        label(n.keys, n.x + 50, 133, COLORS.sub, 10);
        ctx.beginPath();
        ctx.moveTo(170 + i * 50 + 20, 100);
        ctx.lineTo(n.x + 50, 120);
        ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1; ctx.stroke();
      });

      // Animated search
      const searchKey = 55;
      const phase = Math.floor(t / 50) % 3;
      const searchColor = COLORS.green;
      if(phase >= 0) {
        drawRoundedRect(170, 70, 120, 30, 6, null, searchColor);
        label('→ 55 > 30, < 70', 340, 85, searchColor, 10);
      }
      if(phase >= 1) {
        drawRoundedRect(220, 120, 100, 26, 4, null, searchColor);
        label('→ 55 ≥ 40, = 55 ✓', 380, 133, searchColor, 10);
      }

      // LSM-Tree side
      const ly = 185;
      boldLabel('LSM-Tree (RocksDB, Cassandra, LevelDB)', 230, ly, COLORS.orange, 13);

      // Memtable
      drawRoundedRect(60, ly + 25, 130, 40, 6, 'rgba(249,115,22,0.1)', COLORS.orange);
      boldLabel('MemTable', 125, ly + 35, COLORS.orange, 11);
      label('(sorted, in-memory)', 125, ly + 52, COLORS.sub, 9);

      // Arrow down
      arrow(125, ly + 70, 125, ly + 85, COLORS.orange);
      label('flush', 155, ly + 78, COLORS.sub, 9);

      // SSTable levels
      const levels = [
        {name: 'L0 (SSTables)', w: 200, files: 4},
        {name: 'L1', w: 300, files: 6},
        {name: 'L2', w: 400, files: 10}
      ];
      levels.forEach((lvl, i) => {
        const y = ly + 90 + i * 45;
        const x = (460 - lvl.w) / 2;
        drawRoundedRect(x, y, lvl.w, 32, 4, COLORS.panel, COLORS.dim);
        label(lvl.name, x + 50, y + 16, COLORS.sub, 10);
        for(let f = 0; f < lvl.files; f++) {
          const fx = x + 100 + f * 28;
          if(fx + 20 < x + lvl.w) {
            const compacting = (Math.floor(t/30) % 3 === i) && (f % 2 === 0);
            ctx.fillStyle = compacting ? COLORS.orange : COLORS.dim;
            ctx.fillRect(fx, y + 5, 20, 22);
          }
        }
        if(i < 2) {
          arrow(230, y + 35, 230, y + 43, COLORS.sub);
          label('compaction', 275, y + 39, COLORS.sub, 8);
        }
      });

      // Comparison
      const cy = 370;
      drawRoundedRect(50, cy, 190, 55, 6, COLORS.panel, COLORS.cyan);
      boldLabel('B-Tree', 145, cy + 14, COLORS.cyan, 11);
      label('Read: O(log n) — direto', 145, cy + 30, COLORS.sub, 9);
      label('Write: O(log n) — in-place', 145, cy + 43, COLORS.sub, 9);

      drawRoundedRect(260, cy, 210, 55, 6, COLORS.panel, COLORS.orange);
      boldLabel('LSM-Tree', 365, cy + 14, COLORS.orange, 11);
      label('Read: O(L·log n) — multi-level', 365, cy + 30, COLORS.sub, 9);
      label('Write: O(1) amortizado — append', 365, cy + 43, COLORS.sub, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawStorage);
    };

    // ── Step 1: Indexação ──
    const drawIndexing = () => {
      clear();
      boldLabel('Estruturas de Índice', W/2, 25, COLORS.cyan, 16);

      // B+Tree
      boldLabel('B+Tree Index', 230, 50, COLORS.cyan, 13);

      // Internal nodes
      drawRoundedRect(170, 70, 120, 28, 4, COLORS.cyanD, COLORS.cyan);
      label('[30 | 60]', 230, 84, COLORS.cyan, 10);

      const nodes = [
        {x: 50, keys: '10 20', leaf: true},
        {x: 190, keys: '30 40 50', leaf: true},
        {x: 350, keys: '60 70 80', leaf: true}
      ];
      nodes.forEach((n, i) => {
        drawRoundedRect(n.x, 115, 120, 28, 4, COLORS.panel, COLORS.green);
        label(n.keys, n.x + 60, 129, COLORS.green, 10);
        ctx.beginPath();
        ctx.moveTo(195 + i * 45, 98);
        ctx.lineTo(n.x + 60, 115);
        ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1; ctx.stroke();
      });

      // Linked list arrows between leaves
      for(let i = 0; i < 2; i++) {
        const x1 = nodes[i].x + 120;
        const x2 = nodes[i+1].x;
        arrow(x1, 129, x2, 129, COLORS.green);
      }
      label('← Folhas encadeadas (range scan eficiente) →', 230, 158, COLORS.sub, 10);

      // Hash Index
      const hy = 180;
      boldLabel('Hash Index', 650, 50, COLORS.purple, 13);
      const buckets = ['⟶ Alice', '⟶ (vazio)', '⟶ Bob', '⟶ Eve ⟶ Charlie'];
      buckets.forEach((b, i) => {
        const by = 75 + i * 30;
        drawRoundedRect(560, by, 40, 24, 3, COLORS.panel, COLORS.purple);
        label(i.toString(), 580, by + 12, COLORS.purple, 10);
        label(b, 660, by + 12, COLORS.sub, 10, 'left');
      });
      label('hash(key) % 4', 650, hy + 20, COLORS.sub, 9);

      // Index types comparison
      const ty = 215;
      boldLabel('Tipos de Índice', W/2, ty, COLORS.cyan, 14);

      const types = [
        {name: 'B+Tree', desc: 'Range + equality', use: 'WHERE age > 25', color: COLORS.cyan},
        {name: 'Hash', desc: 'Equality only', use: 'WHERE id = 42', color: COLORS.purple},
        {name: 'GIN', desc: 'Inverted index', use: 'Full-text search', color: COLORS.green},
        {name: 'BRIN', desc: 'Block ranges', use: 'Dados ordenados (timestamps)', color: COLORS.orange},
        {name: 'Bitmap', desc: 'Low cardinality', use: 'WHERE status IN (...)', color: COLORS.yellow}
      ];

      types.forEach((tp, i) => {
        const y = ty + 25 + i * 34;
        drawRoundedRect(50, y, 120, 26, 4, COLORS.panel, tp.color);
        boldLabel(tp.name, 110, y + 13, tp.color, 11);
        label(tp.desc, 250, y + 13, COLORS.text, 10);
        label(tp.use, 450, y + 13, COLORS.sub, 10);
      });

      // Covering index
      const ci = ty + 205;
      drawRoundedRect(50, ci, 420, 50, 6, COLORS.panel, COLORS.cyan);
      boldLabel('Covering Index', 120, ci + 14, COLORS.cyan, 11);
      label('CREATE INDEX idx ON users(email) INCLUDE (name, age)', 260, ci + 33, COLORS.sub, 10);
      label('→ Index-only scan: dados no índice, sem ir à tabela', 260, ci + 48, COLORS.green, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawIndexing);
    };

    // ── Step 2: Query Processing ──
    const drawQuery = () => {
      clear();
      boldLabel('Query Processing Pipeline', W/2, 20, COLORS.cyan, 16);

      const stages = [
        {name: 'Parser', desc: 'SQL → AST', color: COLORS.cyan},
        {name: 'Analyzer', desc: 'Resolve nomes', color: COLORS.blue},
        {name: 'Rewriter', desc: 'View expansion', color: COLORS.purple},
        {name: 'Optimizer', desc: 'CBO — Plano', color: COLORS.green},
        {name: 'Executor', desc: 'Volcano model', color: COLORS.orange}
      ];

      const phase = Math.floor(t / 60) % 5;
      stages.forEach((s, i) => {
        const x = 30 + i * 170;
        const active = i === phase;
        drawRoundedRect(x, 45, 150, 50, 8, active ? s.color : COLORS.panel, s.color);
        boldLabel(s.name, x + 75, 60, active ? COLORS.bg : s.color, 12);
        label(s.desc, x + 75, 80, active ? COLORS.bg : COLORS.sub, 10);
        if(i < 4) {
          arrow(x + 155, 70, x + 165, 70, COLORS.sub);
        }
      });

      // Query example
      const qy = 115;
      drawRoundedRect(30, qy, 350, 35, 6, COLORS.cyanD, COLORS.cyan);
      label('SELECT name FROM users WHERE age > 25 ORDER BY name', 205, qy + 17, COLORS.text, 10);

      // Query plan tree
      const py = 170;
      boldLabel('Query Plan (EXPLAIN ANALYZE)', W/2, py, COLORS.green, 13);

      const planNodes = [
        {x: 350, y: py+25, name: 'Sort', detail: 'cost=12.8', color: COLORS.green},
        {x: 350, y: py+65, name: 'Filter (age>25)', detail: 'rows=340', color: COLORS.blue},
        {x: 350, y: py+105, name: 'Seq Scan: users', detail: 'rows=1000', color: COLORS.orange}
      ];

      planNodes.forEach((n, i) => {
        drawRoundedRect(n.x - 90, n.y, 180, 30, 4, COLORS.panel, n.color);
        boldLabel(n.name, n.x, n.y + 10, n.color, 10);
        label(n.detail, n.x, n.y + 23, COLORS.sub, 9);
        if(i < planNodes.length - 1) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y + 32);
          ctx.lineTo(planNodes[i+1].x, planNodes[i+1].y);
          ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1; ctx.stroke();
        }
      });

      // Optimized plan
      const ox = 650;
      boldLabel('Otimizado ✓', ox, py, COLORS.green, 13);
      const optNodes = [
        {name: 'Index Scan', detail: 'idx_age_name', color: COLORS.green}
      ];
      drawRoundedRect(ox - 90, py + 25, 180, 30, 4, COLORS.panel, COLORS.green);
      boldLabel('Index Only Scan', ox, py + 35, COLORS.green, 10);
      label('idx_users_age_name', ox, py + 48, COLORS.sub, 9);
      label('cost=4.2 (3x mais rápido)', ox, py + 70, COLORS.green, 10);

      // Join algorithms
      const jy = py + 115;
      boldLabel('Algoritmos de JOIN', W/2, jy, COLORS.cyan, 13);

      const joins = [
        {name: 'Nested Loop', complex: 'O(n·m)', best: 'Tabela pequena + índice', color: COLORS.orange},
        {name: 'Hash Join', complex: 'O(n+m)', best: 'Equality join, sem índice', color: COLORS.green},
        {name: 'Merge Join', complex: 'O(n log n)', best: 'Dados já ordenados', color: COLORS.blue}
      ];

      joins.forEach((j, i) => {
        const y = jy + 22 + i * 34;
        drawRoundedRect(80, y, 130, 26, 4, COLORS.panel, j.color);
        boldLabel(j.name, 145, y + 13, j.color, 10);
        label(j.complex, 260, y + 13, COLORS.text, 10);
        label(j.best, 430, y + 13, COLORS.sub, 10);
      });

      t++;
      this.animFrame = requestAnimationFrame(drawQuery);
    };

    // ── Step 3: Transações & ACID ──
    const drawTransactions = () => {
      clear();
      boldLabel('Transações, WAL & MVCC', W/2, 20, COLORS.cyan, 16);

      // WAL
      const wy = 45;
      boldLabel('WAL (Write-Ahead Log)', 200, wy, COLORS.orange, 13);
      drawRoundedRect(40, wy + 15, 320, 70, 8, COLORS.panel, COLORS.orange);

      const walEntries = ['LSN:001 INSERT', 'LSN:002 UPDATE', 'LSN:003 DELETE', 'LSN:004 COMMIT'];
      walEntries.forEach((e, i) => {
        const x = 55 + i * 78;
        const active = Math.floor(t/25) % 4 === i;
        drawRoundedRect(x, wy + 25, 70, 20, 3, active ? 'rgba(249,115,22,0.2)' : COLORS.panel, active ? COLORS.orange : COLORS.dim);
        label(e, x + 35, wy + 35, active ? COLORS.orange : COLORS.sub, 8);
      });
      label('Sequential append (rápido) → Recovery: replay WAL', 200, wy + 70, COLORS.sub, 9);

      // MVCC
      const my = 145;
      boldLabel('MVCC — Multi-Version Concurrency Control', W/2, my, COLORS.cyan, 13);

      drawRoundedRect(50, my + 20, 410, 90, 8, COLORS.panel, COLORS.cyan);
      label('Row versions (PostgreSQL):', 130, my + 35, COLORS.sub, 10);

      const versions = [
        {xmin: '100', xmax: '102', val: 'Alice', age: '25', active: false},
        {xmin: '102', xmax: '105', val: 'Alice', age: '26', active: false},
        {xmin: '105', xmax: '∞', val: 'Alice', age: '27', active: true}
      ];

      versions.forEach((v, i) => {
        const y = my + 50 + i * 22;
        const c = v.active ? COLORS.green : COLORS.dim;
        label(`xmin=${v.xmin}  xmax=${v.xmax}  name=${v.val}  age=${v.age}`, 260, y, c, 10);
      });

      // Transactions reading different versions
      const tx = 500;
      drawRoundedRect(tx, my + 20, 310, 90, 8, COLORS.panel, COLORS.blue);
      boldLabel('Snapshot Isolation', tx + 155, my + 35, COLORS.blue, 11);
      label('TX 103 vê: age=25 (xmin≤103, xmax>103)', tx + 155, my + 60, COLORS.green, 10);
      label('TX 106 vê: age=27 (xmin≤106, xmax>106)', tx + 155, my + 80, COLORS.purple, 10);

      // Isolation Levels
      const iy = my + 125;
      boldLabel('Isolation Levels', W/2, iy, COLORS.cyan, 13);

      const levels = [
        {name: 'READ UNCOMMITTED', issue: 'Dirty reads', color: COLORS.red},
        {name: 'READ COMMITTED', issue: 'Non-repeatable reads', color: COLORS.orange},
        {name: 'REPEATABLE READ', issue: 'Phantom reads', color: COLORS.yellow},
        {name: 'SERIALIZABLE', issue: 'Nenhum (mais lento)', color: COLORS.green}
      ];

      levels.forEach((l, i) => {
        const y = iy + 20 + i * 30;
        const active = Math.floor(t/50) % 4 === i;
        drawRoundedRect(100, y, 200, 24, 4, active ? l.color : COLORS.panel, l.color);
        boldLabel(l.name, 200, y + 12, active ? COLORS.bg : l.color, 9);
        label(l.issue, 400, y + 12, COLORS.sub, 10);
      });

      label('← Mais rápido        Mais seguro →', W/2, iy + 145, COLORS.sub, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawTransactions);
    };

    // ── Step 4: Buffer Pool ──
    const drawBufferPool = () => {
      clear();
      boldLabel('Buffer Pool & Caching', W/2, 20, COLORS.cyan, 16);

      // Buffer Pool visualization
      const bx = 50, by = 50;
      drawRoundedRect(bx, by, 400, 200, 10, COLORS.panel, COLORS.cyan);
      boldLabel('Buffer Pool (Shared Memory)', bx + 200, by + 18, COLORS.cyan, 12);

      // Pages in buffer
      const pages = [
        {id: 'P1', table: 'users', dirty: false, pin: 1},
        {id: 'P2', table: 'orders', dirty: true, pin: 0},
        {id: 'P3', table: 'users', dirty: false, pin: 2},
        {id: 'P4', table: 'idx_pk', dirty: true, pin: 0},
        {id: 'P5', table: 'orders', dirty: false, pin: 0},
        {id: 'P6', table: '(free)', dirty: false, pin: 0}
      ];

      pages.forEach((p, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const px = bx + 15 + col * 127;
        const py = by + 40 + row * 80;
        const accessed = Math.floor(t/30) % 6 === i;
        const c = p.dirty ? COLORS.orange : (accessed ? COLORS.green : COLORS.dim);
        drawRoundedRect(px, py, 115, 65, 4, COLORS.panel, c);
        boldLabel(p.id, px + 25, py + 12, c, 10);
        label(p.table, px + 75, py + 12, COLORS.sub, 9);
        label(p.dirty ? '⬤ dirty' : '○ clean', px + 40, py + 32, p.dirty ? COLORS.orange : COLORS.sub, 9);
        label('pin: ' + p.pin, px + 90, py + 32, COLORS.sub, 9);
        // Reference bit for clock algorithm
        const refBit = (i + Math.floor(t/40)) % 3 === 0 ? 1 : 0;
        label('ref: ' + refBit, px + 57, py + 50, COLORS.sub, 8);
      });

      // Disk
      const dx = 520, dy = 50;
      drawRoundedRect(dx, dy, 300, 200, 10, COLORS.panel, COLORS.purple);
      boldLabel('Disco (8KB pages)', dx + 150, dy + 18, COLORS.purple, 12);

      for(let i = 0; i < 12; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const px = dx + 15 + col * 70;
        const py = dy + 40 + row * 48;
        ctx.fillStyle = COLORS.dim;
        ctx.fillRect(px, py, 60, 38);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, 60, 38);
        label('pg ' + i, px + 30, py + 19, COLORS.sub, 9);
      }

      // Arrow buffer ↔ disk
      arrow(455, 150, 515, 150, COLORS.sub);
      label('I/O', 485, 140, COLORS.sub, 9);

      // Eviction policies
      const ey = 275;
      boldLabel('Eviction Policies', W/2, ey, COLORS.cyan, 13);

      const policies = [
        {name: 'LRU', desc: 'Least Recently Used — simples mas vulnerável a scan pollution', color: COLORS.orange},
        {name: 'Clock', desc: 'Aproximação de LRU — ponteiro circular com ref bits', color: COLORS.cyan},
        {name: 'LRU-K', desc: 'K-ésimo acesso mais recente — PostgreSQL usa LRU-2', color: COLORS.green}
      ];

      policies.forEach((p, i) => {
        const y = ey + 25 + i * 32;
        const active = Math.floor(t/60) % 3 === i;
        drawRoundedRect(60, y, 100, 24, 4, active ? p.color : COLORS.panel, p.color);
        boldLabel(p.name, 110, y + 12, active ? COLORS.bg : p.color, 11);
        label(p.desc, 440, y + 12, COLORS.sub, 10);
      });

      // Checkpoint
      label('Checkpoint: flush dirty pages → disco periodicamente (recovery point)', W/2, ey + 125, COLORS.sub, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawBufferPool);
    };

    // ── Step 5: Replicação ──
    const drawReplication = () => {
      clear();
      boldLabel('Replicação & Recovery', W/2, 20, COLORS.cyan, 16);

      // Primary
      const px = 100, py = 60;
      drawRoundedRect(px, py, 160, 100, 10, COLORS.panel, COLORS.cyan);
      boldLabel('Primary', px + 80, py + 18, COLORS.cyan, 13);
      label('WAL Writer', px + 80, py + 42, COLORS.text, 10);
      label('Read + Write', px + 80, py + 60, COLORS.green, 10);
      label('WAL Sender', px + 80, py + 80, COLORS.sub, 10);

      // Replicas
      const replicas = [
        {x: 450, y: 50, name: 'Replica 1 (sync)', type: 'sync', color: COLORS.green},
        {x: 450, y: 170, name: 'Replica 2 (async)', type: 'async', color: COLORS.orange}
      ];

      replicas.forEach((r) => {
        drawRoundedRect(r.x, r.y, 160, 80, 10, COLORS.panel, r.color);
        boldLabel(r.name, r.x + 80, r.y + 18, r.color, 11);
        label('WAL Receiver', r.x + 80, r.y + 40, COLORS.sub, 10);
        label('Read Only', r.x + 80, r.y + 58, COLORS.blue, 10);

        // WAL streaming animation
        const streamProgress = (t % 60) / 60;
        const sx = px + 160 + (r.x - px - 160) * streamProgress;
        const sy = py + 50 + (r.y + 30 - py - 50) * streamProgress;
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();

        // Arrow
        ctx.beginPath();
        ctx.moveTo(px + 160, py + 50 + (r.y + 30 - py - 50) * 0.2);
        ctx.lineTo(r.x, r.y + 30);
        ctx.strokeStyle = r.color; ctx.lineWidth = 1.5;
        ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
      });

      label('sync: commit espera ACK da replica', 680, 90, COLORS.green, 9);
      label('async: commit não espera (pode perder)', 680, 210, COLORS.orange, 9);

      // Recovery process
      const ry = 280;
      boldLabel('Crash Recovery', W/2, ry, COLORS.cyan, 13);

      const recoverySteps = [
        {name: '1. Crash', icon: '💥', color: COLORS.red},
        {name: '2. Restart', icon: '🔄', color: COLORS.orange},
        {name: '3. WAL Replay', icon: '⏩', color: COLORS.yellow},
        {name: '4. Redo committed', icon: '✓', color: COLORS.green},
        {name: '5. Undo uncommitted', icon: '✗', color: COLORS.blue}
      ];

      const rPhase = Math.floor(t / 50) % 5;
      recoverySteps.forEach((s, i) => {
        const x = 50 + i * 170;
        const active = i === rPhase;
        drawRoundedRect(x, ry + 20, 150, 40, 6, active ? s.color : COLORS.panel, s.color);
        label(s.icon + ' ' + s.name, x + 75, ry + 40, active ? COLORS.bg : s.color, 10);
        if(i < 4) arrow(x + 155, ry + 40, x + 165, ry + 40, COLORS.sub);
      });

      // PITR & Failover
      const fy = ry + 80;
      drawRoundedRect(50, fy, 250, 45, 6, COLORS.panel, COLORS.purple);
      boldLabel('PITR (Point-in-Time Recovery)', 175, fy + 14, COLORS.purple, 10);
      label('Base backup + WAL replay até timestamp', 175, fy + 32, COLORS.sub, 9);

      drawRoundedRect(330, fy, 250, 45, 6, COLORS.panel, COLORS.green);
      boldLabel('Failover (Patroni)', 455, fy + 14, COLORS.green, 10);
      label('Primary down → replica promoted', 455, fy + 32, COLORS.sub, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawReplication);
    };

    switch(stepIdx) {
      case 0: drawStorage(); break;
      case 1: drawIndexing(); break;
      case 2: drawQuery(); break;
      case 3: drawTransactions(); break;
      case 4: drawBufferPool(); break;
      case 5: drawReplication(); break;
      default: drawStorage();
    }
  };

  return engine;
}
