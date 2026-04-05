import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderDistributed(canvas) {
  const engine = new BaseRenderer(canvas);

  const COLORS = {
    bg:      '#050a15',
    violet:  '#8b5cf6',
    violetD: 'rgba(139,92,246,0.15)',
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

    const drawNode = (x, y, name, color, active) => {
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fillStyle = active ? color : COLORS.panel;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      boldLabel(name, x, y, active ? COLORS.bg : color, 10);
    };

    // ── Step 0: Fundamentals ──
    const drawFundamentals = () => {
      clear();
      boldLabel('Fundamentos — CAP Theorem', W/2, 25, COLORS.violet, 16);

      // CAP Triangle
      const cx = 250, cy = 80;
      const triR = 120;

      // Triangle vertices
      const vC = {x: cx, y: cy};
      const vA = {x: cx - triR, y: cy + triR * 1.5};
      const vP = {x: cx + triR, y: cy + triR * 1.5};

      // Draw triangle
      ctx.beginPath();
      ctx.moveTo(vC.x, vC.y); ctx.lineTo(vA.x, vA.y); ctx.lineTo(vP.x, vP.y);
      ctx.closePath();
      ctx.strokeStyle = COLORS.violet; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = COLORS.violetD; ctx.fill();

      // Labels
      boldLabel('Consistency', vC.x, vC.y - 15, COLORS.cyan, 13);
      boldLabel('Availability', vA.x - 20, vA.y + 15, COLORS.green, 13);
      boldLabel('Partition', vP.x + 20, vP.y + 15, COLORS.orange, 13);
      boldLabel('Tolerance', vP.x + 20, vP.y + 30, COLORS.orange, 11);

      const capPhase = Math.floor(t / 70) % 2;

      // CP side
      drawRoundedRect(vC.x - 30, (vC.y + vP.y) / 2 - 10, 60, 20, 4,
        capPhase === 0 ? COLORS.cyan : COLORS.panel, COLORS.cyan);
      label('CP', cx + 40, (vC.y + vP.y) / 2, COLORS.cyan, 11);

      // AP side
      drawRoundedRect(vA.x + 15, (vA.y + vC.y) / 2 - 10, 60, 20, 4,
        capPhase === 1 ? COLORS.green : COLORS.panel, COLORS.green);
      label('AP', cx - 55, (vC.y + vA.y) / 2, COLORS.green, 11);

      // CP examples
      const ex = 480;
      drawRoundedRect(ex, 70, 330, 50, 6, COLORS.panel, COLORS.cyan);
      boldLabel('CP Systems', ex + 165, 82, COLORS.cyan, 11);
      label('Spanner, etcd, ZooKeeper, MongoDB', ex + 165, 102, COLORS.sub, 10);

      drawRoundedRect(ex, 135, 330, 50, 6, COLORS.panel, COLORS.green);
      boldLabel('AP Systems', ex + 165, 147, COLORS.green, 11);
      label('Cassandra, DynamoDB, DNS, Couchbase', ex + 165, 167, COLORS.sub, 10);

      // Fallacies
      const fy = 270;
      boldLabel('8 Falácias da Computação Distribuída', W/2, fy, COLORS.violet, 13);

      const fallacies = [
        'A rede é confiável', 'Latência é zero', 'Bandwidth é infinita', 'A rede é segura',
        'Topologia não muda', 'Existe 1 admin', 'Transporte é grátis', 'Rede é homogênea'
      ];

      const fallacyIdx = Math.floor(t / 35) % 8;
      fallacies.forEach((f, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const x = 80 + col * 200;
        const y = fy + 22 + row * 35;
        const active = i === fallacyIdx;
        drawRoundedRect(x, y, 180, 26, 4, active ? COLORS.red : COLORS.panel, active ? COLORS.red : COLORS.dim);
        label((i+1) + '. ' + f, x + 90, y + 13, active ? COLORS.bg : COLORS.sub, 9);
      });

      // FLP
      const flp = fy + 105;
      drawRoundedRect(100, flp, 600, 35, 6, COLORS.panel, COLORS.violet);
      boldLabel('FLP (1985):', 180, flp + 17, COLORS.violet, 10);
      label('Consenso determinístico impossível com 1 falha em sistema assíncrono', 500, flp + 17, COLORS.sub, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawFundamentals);
    };

    // ── Step 1: Clocks & Ordering ──
    const drawClocks = () => {
      clear();
      boldLabel('Relógios Lógicos & Ordenação', W/2, 25, COLORS.violet, 16);

      // Lamport Clock
      boldLabel('Lamport Clock', 220, 50, COLORS.violet, 13);

      const lx = 60, ly = 70;
      // Node A timeline
      label('Nó A', lx, ly + 15, COLORS.cyan, 11);
      ctx.beginPath(); ctx.moveTo(lx + 30, ly + 15); ctx.lineTo(lx + 350, ly + 15);
      ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 2; ctx.stroke();

      // Node B timeline
      label('Nó B', lx, ly + 75, COLORS.orange, 11);
      ctx.beginPath(); ctx.moveTo(lx + 30, ly + 75); ctx.lineTo(lx + 350, ly + 75);
      ctx.strokeStyle = COLORS.orange; ctx.lineWidth = 2; ctx.stroke();

      // Events
      const events = [
        {x: lx + 80, ya: ly + 15, yb: null, la: 1, type: 'a'},
        {x: lx + 150, ya: null, yb: ly + 75, lb: null, type: 'send', from: 0},
        {x: lx + 200, ya: null, yb: ly + 75, lb: 2, type: 'b'},
        {x: lx + 280, ya: ly + 15, yb: null, la: 3, type: 'recv'}
      ];

      // Send message from A to B
      const msgProgress = (t % 80) / 80;
      const mx = lx + 80 + 120 * msgProgress;
      const my = ly + 15 + 60 * msgProgress;
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.yellow;
      ctx.fill();

      // Event dots
      ctx.beginPath(); ctx.arc(lx + 80, ly + 15, 6, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.cyan; ctx.fill();
      label('L=1', lx + 80, ly - 2, COLORS.cyan, 9);

      ctx.beginPath(); ctx.arc(lx + 200, ly + 75, 6, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.orange; ctx.fill();
      label('L=max(0,1)+1=2', lx + 200, ly + 92, COLORS.orange, 9);

      ctx.beginPath(); ctx.arc(lx + 280, ly + 75, 6, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.orange; ctx.fill();
      label('L=3', lx + 280, ly + 92, COLORS.orange, 9);

      // Arrow showing message
      ctx.beginPath();
      ctx.moveTo(lx + 83, ly + 18); ctx.lineTo(lx + 197, ly + 72);
      ctx.strokeStyle = COLORS.yellow; ctx.lineWidth = 1;
      ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);

      label('a→b ⟹ L(a) < L(b)   mas   L(a)<L(b) ⇏ a→b', 250, ly + 115, COLORS.sub, 10);

      // Vector Clock
      const vy = ly + 140;
      boldLabel('Vector Clock', 220, vy, COLORS.violet, 13);

      drawRoundedRect(50, vy + 18, 380, 80, 8, COLORS.panel, COLORS.violet);

      label('Nó A: V=[A:2, B:0]', 130, vy + 38, COLORS.cyan, 10);
      label('Nó B: V=[A:1, B:2]', 130, vy + 58, COLORS.orange, 10);

      // Comparison
      label('A:2>1 mas B:0<2 → CONCORRENTES!', 310, vy + 78, COLORS.red, 10);

      // Detect concurrency
      drawRoundedRect(50, vy + 105, 380, 35, 6, COLORS.violetD, COLORS.violet);
      label('V1 ≤ V2 ⟺ ∀i: V1[i] ≤ V2[i] → V1 causou V2', 240, vy + 115, COLORS.text, 10);
      label('Senão: concorrentes (V1 ∥ V2)', 240, vy + 130, COLORS.orange, 9);

      // HLC
      const hy = vy + 155;
      drawRoundedRect(50, hy, 200, 40, 6, COLORS.panel, COLORS.green);
      boldLabel('HLC', 100, hy + 13, COLORS.green, 11);
      label('Hybrid Logical Clock', 150, hy + 28, COLORS.sub, 9);

      drawRoundedRect(280, hy, 280, 40, 6, COLORS.panel, COLORS.blue);
      boldLabel('TrueTime', 340, hy + 13, COLORS.blue, 11);
      label('GPS + atomic clocks (Spanner)', 420, hy + 28, COLORS.sub, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawClocks);
    };

    // ── Step 2: Consensus (Raft) ──
    const drawConsensus = () => {
      clear();
      boldLabel('Consenso — Raft Protocol', W/2, 25, COLORS.violet, 16);

      // Raft nodes
      const nodes = [
        {x: 400, y: 80, name: 'S1', role: 'Leader'},
        {x: 200, y: 170, name: 'S2', role: 'Follower'},
        {x: 600, y: 170, name: 'S3', role: 'Follower'},
        {x: 250, y: 280, name: 'S4', role: 'Follower'},
        {x: 550, y: 280, name: 'S5', role: 'Follower'}
      ];

      const raftPhase = Math.floor(t / 40) % 4;
      const nodeColors = [COLORS.violet, COLORS.blue, COLORS.blue, COLORS.blue, COLORS.blue];

      nodes.forEach((n, i) => {
        const isLeader = i === 0;
        drawNode(n.x, n.y, n.name, nodeColors[i], isLeader);
        label(n.role, n.x, n.y + 32, isLeader ? COLORS.violet : COLORS.sub, 9);
      });

      // Heartbeats / AppendEntries from leader
      if(raftPhase < 3) {
        const progress = (t % 40) / 40;
        for(let i = 1; i < 5; i++) {
          const sx = nodes[0].x + (nodes[i].x - nodes[0].x) * progress;
          const sy = nodes[0].y + (nodes[i].y - nodes[0].y) * progress;
          ctx.beginPath();
          ctx.arc(sx, sy, 4, 0, Math.PI * 2);
          ctx.fillStyle = COLORS.violet;
          ctx.fill();

          // Dotted line
          ctx.beginPath();
          ctx.moveTo(nodes[0].x, nodes[0].y);
          ctx.lineTo(nodes[i].x, nodes[i].y);
          ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1;
          ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
        }
      }

      label('AppendEntries RPC (heartbeat / log replication)', 400, 320, COLORS.sub, 10);

      // Log replication
      const ly = 340;
      boldLabel('Log Replication (Quorum)', W/2, ly, COLORS.violet, 13);

      const logEntries = ['SET x=1', 'SET y=2', 'SET z=3', 'DEL x'];
      const committed = Math.floor(t / 50) % (logEntries.length + 1);

      for(let n = 0; n < 3; n++) {
        const ny = ly + 22 + n * 30;
        label(n === 0 ? 'Leader' : 'Follower ' + n, 60, ny + 10, n === 0 ? COLORS.violet : COLORS.sub, 9);
        logEntries.forEach((e, i) => {
          const ex = 140 + i * 120;
          const replicated = n === 0 || i < committed;
          const isCommitted = i < committed;
          drawRoundedRect(ex, ny, 108, 22, 3,
            isCommitted ? COLORS.violetD : COLORS.panel,
            replicated ? (isCommitted ? COLORS.green : COLORS.violet) : COLORS.dim);
          label(e, ex + 54, ny + 11, replicated ? COLORS.text : COLORS.dim, 9);
        });
      }

      label('Committed quando maioria (3/5) confirma', W/2, ly + 120, COLORS.green, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawConsensus);
    };

    // ── Step 3: Consistency & CRDTs ──
    const drawConsistency = () => {
      clear();
      boldLabel('Modelos de Consistência & CRDTs', W/2, 25, COLORS.violet, 16);

      // Consistency spectrum
      const levels = [
        {name: 'Linearizable', desc: 'Como 1 nó', color: COLORS.green, w: 100},
        {name: 'Sequential', desc: 'Ordem por cliente', color: COLORS.cyan, w: 180},
        {name: 'Causal', desc: 'Preserva causalidade', color: COLORS.blue, w: 280},
        {name: 'Eventual', desc: 'Converge... algum dia', color: COLORS.orange, w: 420}
      ];

      const baseY = 50;
      levels.forEach((l, i) => {
        const x = (W - l.w) / 2;
        const y = baseY + i * 35;
        drawRoundedRect(x, y, l.w, 28, 6, COLORS.panel, l.color);
        boldLabel(l.name, W/2 - 40, y + 14, l.color, 10);
        label(l.desc, W/2 + 60, y + 14, COLORS.sub, 9);
      });

      label('← Mais forte (lento)    Mais fraco (rápido) →', W/2, baseY + 150, COLORS.sub, 9);

      // CRDT: G-Counter
      const cy = baseY + 170;
      boldLabel('CRDT — G-Counter (Grow-only Counter)', W/2, cy, COLORS.violet, 13);

      drawRoundedRect(50, cy + 18, 700, 80, 8, COLORS.panel, COLORS.violet);

      const counters = [
        {name: 'Nó A', vals: '{A:3, B:0, C:0}', sum: '= 3', color: COLORS.cyan},
        {name: 'Nó B', vals: '{A:0, B:5, C:0}', sum: '= 5', color: COLORS.orange},
        {name: 'Nó C', vals: '{A:0, B:0, C:2}', sum: '= 2', color: COLORS.green}
      ];

      counters.forEach((c, i) => {
        const x = 80 + i * 230;
        boldLabel(c.name, x + 30, cy + 35, c.color, 10);
        label(c.vals, x + 120, cy + 35, COLORS.sub, 10);
        label(c.sum, x + 195, cy + 35, c.color, 10);
      });

      // Merge
      const mergeActive = Math.floor(t / 50) % 2 === 0;
      drawRoundedRect(200, cy + 60, 350, 28, 6, mergeActive ? COLORS.violetD : COLORS.panel, COLORS.violet);
      boldLabel('Merge: max() → {A:3, B:5, C:2} = 10', 375, cy + 74, COLORS.violet, 10);

      // Properties
      const py = cy + 110;
      const props = [
        {name: 'Comutativo', desc: 'merge(a,b) = merge(b,a)', color: COLORS.green},
        {name: 'Associativo', desc: 'merge(merge(a,b),c) = merge(a,merge(b,c))', color: COLORS.cyan},
        {name: 'Idempotente', desc: 'merge(a,a) = a', color: COLORS.purple}
      ];

      props.forEach((p, i) => {
        const x = 50 + i * 270;
        drawRoundedRect(x, py, 250, 28, 4, COLORS.panel, p.color);
        boldLabel(p.name, x + 60, py + 14, p.color, 10);
        label(p.desc, x + 170, py + 14, COLORS.sub, 8);
      });

      // LWW vs OR-Set
      const oy = py + 45;
      drawRoundedRect(50, oy, 330, 40, 6, COLORS.panel, COLORS.orange);
      boldLabel('LWW-Register', 130, oy + 13, COLORS.orange, 10);
      label('Last-Writer-Wins (pode perder dados)', 215, oy + 28, COLORS.sub, 9);

      drawRoundedRect(410, oy, 350, 40, 6, COLORS.panel, COLORS.green);
      boldLabel('OR-Set', 470, oy + 13, COLORS.green, 10);
      label('Observed-Remove — add vence em conflito', 585, oy + 28, COLORS.sub, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawConsistency);
    };

    // ── Step 4: Partitioning ──
    const drawPartitioning = () => {
      clear();
      boldLabel('Particionamento & Consistent Hashing', W/2, 25, COLORS.violet, 16);

      // Range partitioning
      const ry = 50;
      boldLabel('Range Partitioning', 200, ry, COLORS.violet, 12);
      const ranges = [
        {label: 'A — F', color: COLORS.cyan},
        {label: 'G — N', color: COLORS.blue},
        {label: 'O — Z', color: COLORS.purple}
      ];
      ranges.forEach((r, i) => {
        const x = 60 + i * 140;
        drawRoundedRect(x, ry + 15, 125, 35, 6, COLORS.panel, r.color);
        boldLabel(r.label, x + 62, ry + 25, r.color, 11);
        label('Nó ' + (i+1), x + 62, ry + 42, COLORS.sub, 9);
      });
      label('✓ Range scans   ✗ Hotspots', 240, ry + 62, COLORS.sub, 9);

      // Hash partitioning
      boldLabel('Hash Partitioning', 650, ry, COLORS.orange, 12);
      label('partition = hash(key) % N', 650, ry + 22, COLORS.sub, 10);
      label('✓ Uniforme   ✗ Sem range scan', 650, ry + 42, COLORS.sub, 9);

      // Consistent Hashing Ring
      const cx = 350, ringCy = 220, ringR = 90;
      boldLabel('Consistent Hashing Ring', cx, ry + 80, COLORS.violet, 14);

      // Draw ring
      ctx.beginPath();
      ctx.arc(cx, ringCy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 2; ctx.stroke();

      // Nodes on ring
      const ringNodes = [
        {angle: 0.3, name: 'A', color: COLORS.cyan},
        {angle: 1.5, name: 'B', color: COLORS.green},
        {angle: 3.0, name: 'C', color: COLORS.orange},
        {angle: 4.5, name: 'D', color: COLORS.purple}
      ];

      ringNodes.forEach(n => {
        const nx = cx + Math.cos(n.angle) * ringR;
        const ny = ringCy + Math.sin(n.angle) * ringR;
        drawNode(nx, ny, n.name, n.color, true);
      });

      // Keys on ring
      const keys = [
        {angle: 0.8, name: 'k1', target: 'B'},
        {angle: 2.2, name: 'k2', target: 'C'},
        {angle: 3.8, name: 'k3', target: 'D'}
      ];

      keys.forEach(k => {
        const kx = cx + Math.cos(k.angle) * (ringR + 25);
        const ky = ringCy + Math.sin(k.angle) * (ringR + 25);
        label(k.name + '→' + k.target, kx, ky, COLORS.yellow, 9);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(k.angle) * ringR, ringCy + Math.sin(k.angle) * ringR, 4, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.yellow;
        ctx.fill();
      });

      label('Adicionar nó: ~1/N dos dados migram', cx, ringCy + ringR + 30, COLORS.sub, 10);

      // Right side: vnodes & routing
      const vx = 600;
      drawRoundedRect(vx, ry + 80, 210, 55, 6, COLORS.panel, COLORS.violet);
      boldLabel('Virtual Nodes', vx + 105, ry + 95, COLORS.violet, 11);
      label('Cada nó físico = 100-200', vx + 105, ry + 110, COLORS.sub, 9);
      label('posições no anel', vx + 105, ry + 125, COLORS.sub, 9);

      drawRoundedRect(vx, ry + 150, 210, 55, 6, COLORS.panel, COLORS.blue);
      boldLabel('Request Routing', vx + 105, ry + 165, COLORS.blue, 11);
      label('1. Qualquer nó (gossip)', vx + 105, ry + 182, COLORS.sub, 9);
      label('2. Routing tier (ZooKeeper)', vx + 105, ry + 197, COLORS.sub, 9);

      // Hotspot handling
      const hy = ringCy + ringR + 55;
      drawRoundedRect(100, hy, 600, 35, 6, COLORS.panel, COLORS.red);
      boldLabel('Hotspot:', 170, hy + 17, COLORS.red, 10);
      label('Chave popular → salt: key_001, key_002... espalha em N nós', 500, hy + 17, COLORS.sub, 10);

      t++;
      this.animFrame = requestAnimationFrame(drawPartitioning);
    };

    // ── Step 5: Real Systems ──
    const drawRealSystems = () => {
      clear();
      boldLabel('Arquiteturas Reais', W/2, 25, COLORS.violet, 16);

      // Kafka
      const ky = 48;
      boldLabel('Apache Kafka — Distributed Log', 230, ky, COLORS.green, 13);
      drawRoundedRect(40, ky + 15, 380, 90, 8, COLORS.panel, COLORS.green);

      // Partitions
      for(let p = 0; p < 3; p++) {
        const px = 60 + p * 120;
        label('P' + p, px, ky + 30, COLORS.green, 9);
        for(let s = 0; s < 5; s++) {
          const sx = px + 15 + s * 18;
          const active = (s + Math.floor(t/8)) % 5 === 4;
          ctx.fillStyle = active ? COLORS.green : COLORS.dim;
          ctx.fillRect(sx, ky + 38, 14, 14);
          label(s.toString(), sx + 7, ky + 45, COLORS.bg, 7);
        }
      }

      label('Producer → hash(key) → partition', 230, ky + 72, COLORS.sub, 9);
      label('Append-only, sequential I/O, acks=all', 230, ky + 88, COLORS.sub, 9);

      // Spanner
      const sx = 480;
      boldLabel('Google Spanner — Global SQL', 650, ky, COLORS.blue, 13);
      drawRoundedRect(sx, ky + 15, 350, 90, 8, COLORS.panel, COLORS.blue);

      label('TrueTime: GPS + atomic clocks', 655, ky + 35, COLORS.cyan, 10);
      label('Commit Wait: espera ε (~7µs)', 655, ky + 55, COLORS.sub, 10);
      label('Paxos per partition + 2PC cross', 655, ky + 75, COLORS.sub, 10);
      label('CP: consistency > availability', 655, ky + 92, COLORS.blue, 9);

      // Dynamo
      const dy = ky + 120;
      boldLabel('Amazon Dynamo — Always-On KV Store', 230, dy, COLORS.orange, 13);
      drawRoundedRect(40, dy + 15, 380, 80, 8, COLORS.panel, COLORS.orange);

      const dynamoFeatures = [
        'Consistent Hashing + vnodes',
        'Quorum (N,R,W) configurável',
        'Vector Clocks → detect conflicts',
        'Gossip Protocol para membership'
      ];
      dynamoFeatures.forEach((f, i) => {
        label(f, 230, dy + 32 + i * 16, COLORS.sub, 9);
      });

      // Raft in etcd
      boldLabel('etcd (Kubernetes) — Raft Consensus', 650, dy, COLORS.violet, 13);
      drawRoundedRect(sx, dy + 15, 350, 80, 8, COLORS.panel, COLORS.violet);

      // 3 nodes forming cluster
      const etcdNodes = [
        {x: sx + 80, y: dy + 55, name: 'L', color: COLORS.violet},
        {x: sx + 200, y: dy + 40, name: 'F1', color: COLORS.dim},
        {x: sx + 200, y: dy + 70, name: 'F2', color: COLORS.dim}
      ];

      etcdNodes.forEach(n => {
        drawNode(n.x, n.y, n.name, n.color, n.name === 'L');
      });

      // Arrows leader to followers
      arrow(etcdNodes[0].x + 24, etcdNodes[0].y - 5, etcdNodes[1].x - 24, etcdNodes[1].y, COLORS.violet);
      arrow(etcdNodes[0].x + 24, etcdNodes[0].y + 5, etcdNodes[2].x - 24, etcdNodes[2].y, COLORS.violet);

      label('Watch API: notificações em tempo real', 655, dy + 88, COLORS.sub, 9);

      // MapReduce / Spark
      const my = dy + 110;
      boldLabel('Processamento Distribuído', W/2, my, COLORS.violet, 13);

      const stages = [
        {name: 'Map', desc: 'Processa em paralelo', color: COLORS.cyan},
        {name: 'Shuffle', desc: 'Redistribui por key', color: COLORS.yellow},
        {name: 'Reduce', desc: 'Agrega resultados', color: COLORS.green}
      ];

      const mapPhase = Math.floor(t / 45) % 3;
      stages.forEach((s, i) => {
        const x = 130 + i * 250;
        const active = i === mapPhase;
        drawRoundedRect(x, my + 18, 180, 40, 6, active ? s.color : COLORS.panel, s.color);
        boldLabel(s.name, x + 90, my + 30, active ? COLORS.bg : s.color, 11);
        label(s.desc, x + 90, my + 48, active ? COLORS.bg : COLORS.sub, 9);
        if(i < 2) arrow(x + 185, my + 38, x + 245, my + 38, COLORS.sub);
      });

      // Jepsen
      drawRoundedRect(100, my + 70, 600, 30, 6, COLORS.panel, COLORS.red);
      boldLabel('Jepsen:', 160, my + 85, COLORS.red, 10);
      label('Testa consistência injetando falhas de rede — encontrou bugs em Redis, MongoDB, Cassandra...', 480, my + 85, COLORS.sub, 9);

      t++;
      this.animFrame = requestAnimationFrame(drawRealSystems);
    };

    switch(stepIdx) {
      case 0: drawFundamentals(); break;
      case 1: drawClocks(); break;
      case 2: drawConsensus(); break;
      case 3: drawConsistency(); break;
      case 4: drawPartitioning(); break;
      case 5: drawRealSystems(); break;
      default: drawFundamentals();
    }
  };

  return engine;
}
