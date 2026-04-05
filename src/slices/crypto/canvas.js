import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderCrypto(canvas) {
  const engine = new BaseRenderer(canvas);

  const COLORS = {
    bg:      '#050a15',
    pink:    '#f43f5e',
    pinkD:   'rgba(244,63,94,0.15)',
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

    // ── Step 0: Hashing (SHA-256) ──
    const drawHashing = () => {
      const frame = () => {
        clear(); t++;
        boldLabel('SHA-256 — Avalanche Effect', W/2, 30, COLORS.pink, 16);

        // Input boxes
        const inp1 = 'Hello';
        const inp2 = 'Hello.';
        const y1 = 90, y2 = 210;

        // Input 1
        drawRoundedRect(30, y1-22, 120, 44, 8, COLORS.pinkD, COLORS.pink);
        label('"'+inp1+'"', 90, y1, COLORS.text, 14);

        // Arrow
        arrow(155, y1, 210, y1, COLORS.pink);

        // Hash output 1 (animated reveal)
        const hash1 = '185f8db3...6381969';
        const reveal = Math.min(hash1.length, Math.floor(t/3));
        drawRoundedRect(215, y1-22, W-245, 44, 8, COLORS.panel, COLORS.dim);
        label(hash1.substring(0, reveal), 215 + (W-245)/2, y1, COLORS.green, 13);

        // Input 2
        drawRoundedRect(30, y2-22, 120, 44, 8, COLORS.pinkD, COLORS.pink);
        label('"'+inp2+'"', 90, y2, COLORS.text, 14);
        arrow(155, y2, 210, y2, COLORS.pink);

        // Hash output 2
        const hash2 = '2d8bd7d9...b87f7';
        const reveal2 = Math.min(hash2.length, Math.floor((t > 40 ? t-40 : 0)/3));
        drawRoundedRect(215, y2-22, W-245, 44, 8, COLORS.panel, COLORS.dim);
        label(hash2.substring(0, reveal2), 215 + (W-245)/2, y2, COLORS.cyan, 13);

        // Difference highlight
        if(t > 80) {
          label('1 caractere diferente →  hash completamente diferente!', W/2, y2+60, COLORS.yellow, 13);
        }

        // Merkle Tree at bottom
        const treeY = 320;
        boldLabel('Merkle Tree', W/2, treeY, COLORS.pink, 14);

        const rootX = W/2, rootY = treeY + 35;
        const spread = 120, levelH = 50;

        // Root
        const pulse = 0.5 + 0.5*Math.sin(t*0.05);
        drawRoundedRect(rootX-40, rootY-14, 80, 28, 6, `rgba(244,63,94,${0.2+0.3*pulse})`, COLORS.pink);
        label('Root', rootX, rootY, COLORS.text, 11);

        // Level 1
        drawRoundedRect(rootX-spread-30, rootY+levelH-14, 60, 28, 6, COLORS.panel, COLORS.purple);
        label('H(0-1)', rootX-spread, rootY+levelH, COLORS.purple, 11);
        drawRoundedRect(rootX+spread-30, rootY+levelH-14, 60, 28, 6, COLORS.panel, COLORS.cyan);
        label('H(2-3)', rootX+spread, rootY+levelH, COLORS.cyan, 11);

        // Lines
        ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rootX, rootY+14); ctx.lineTo(rootX-spread, rootY+levelH-14);
        ctx.moveTo(rootX, rootY+14); ctx.lineTo(rootX+spread, rootY+levelH-14);
        ctx.stroke();

        // Leaves
        const leaves = ['Tx0','Tx1','Tx2','Tx3'];
        const leafSpread = 60;
        for(let i = 0; i < 4; i++) {
          const lx = rootX + (i < 2 ? -spread : spread) + (i%2 === 0 ? -leafSpread/2 : leafSpread/2);
          const ly = rootY + levelH*2;
          drawRoundedRect(lx-24, ly-12, 48, 24, 5, COLORS.panel, COLORS.dim);
          label(leaves[i], lx, ly, COLORS.sub, 10);

          const parentX = i < 2 ? rootX-spread : rootX+spread;
          ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(parentX, rootY+levelH+14); ctx.lineTo(lx, ly-12);
          ctx.stroke();
        }

        engine.animFrame = requestAnimationFrame(frame);
      };
      frame();
    };

    // ── Step 1: Criptografia Simétrica (AES) ──
    const drawSymmetric = () => {
      const frame = () => {
        clear(); t++;
        boldLabel('AES-256 — State Matrix & Rounds', W/2, 30, COLORS.pink, 16);

        // State matrix 4x4
        const matX = 60, matY = 70, cellSize = 40;
        boldLabel('State Matrix (4×4 bytes)', matX + cellSize*2, matY - 12, COLORS.sub, 12);
        for(let r = 0; r < 4; r++) {
          for(let c = 0; c < 4; c++) {
            const val = ((t*3 + r*37 + c*53) % 256).toString(16).padStart(2,'0').toUpperCase();
            const x = matX + c*cellSize;
            const y = matY + r*cellSize;
            const phase = Math.floor(t/30) % 4;
            let cellColor = COLORS.panel;
            if(phase === 0 && true) cellColor = `rgba(244,63,94,${0.15 + 0.1*Math.sin(t*0.08 + r+c)})`;
            if(phase === 1 && true) cellColor = `rgba(59,130,246,${0.15 + 0.1*Math.sin(t*0.08 + r)})`;
            if(phase === 2 && true) cellColor = `rgba(168,85,247,${0.15 + 0.1*Math.sin(t*0.08 + c)})`;
            if(phase === 3 && true) cellColor = `rgba(74,222,128,${0.15 + 0.1*Math.sin(t*0.08)})`;
            drawRoundedRect(x, y, cellSize-3, cellSize-3, 4, cellColor, COLORS.dim);
            label(val, x + (cellSize-3)/2, y + (cellSize-3)/2, COLORS.text, 12);
          }
        }

        // Round operations
        const opsX = matX + cellSize*4 + 40;
        const ops = ['SubBytes','ShiftRows','MixColumns','AddRoundKey'];
        const opColors = [COLORS.pink, COLORS.blue, COLORS.purple, COLORS.green];
        const activeOp = Math.floor(t/30) % 4;
        for(let i = 0; i < 4; i++) {
          const y = matY + i * 42;
          const isActive = i === activeOp;
          drawRoundedRect(opsX, y, 130, 34, 6,
            isActive ? opColors[i] + '33' : COLORS.panel,
            isActive ? opColors[i] : COLORS.dim);
          label(ops[i], opsX + 65, y + 17, isActive ? opColors[i] : COLORS.sub, 12);
          if(isActive) {
            const glow = 0.3 + 0.3*Math.sin(t*0.1);
            ctx.shadowColor = opColors[i]; ctx.shadowBlur = 10*glow;
            drawRoundedRect(opsX-2, y-2, 134, 38, 8, 'transparent', opColors[i]);
            ctx.shadowBlur = 0;
          }
        }

        // Round counter
        const round = Math.floor(t/120) % 14 + 1;
        boldLabel(`Round ${round}/14`, opsX + 65, matY + 190, COLORS.yellow, 13);

        // Modes of operation at bottom
        const modesY = 290;
        boldLabel('Modos de Operação', W/2, modesY, COLORS.pink, 14);

        const modes = [
          { name:'ECB', color:COLORS.red, status:'✗ Inseguro' },
          { name:'CBC', color:COLORS.yellow, status:'Sequencial' },
          { name:'CTR', color:COLORS.blue, status:'Paralelo' },
          { name:'GCM', color:COLORS.green, status:'✓ Padrão' }
        ];
        const modeW = (W - 60) / 4;
        for(let i = 0; i < modes.length; i++) {
          const mx = 20 + i * modeW;
          const isGCM = i === 3;
          const glow = isGCM ? 0.3 + 0.3*Math.sin(t*0.06) : 0;
          drawRoundedRect(mx, modesY + 20, modeW - 10, 60, 8,
            isGCM ? `rgba(74,222,128,${0.1+glow})` : COLORS.panel,
            modes[i].color);
          boldLabel(modes[i].name, mx + (modeW-10)/2, modesY + 40, modes[i].color, 13);
          label(modes[i].status, mx + (modeW-10)/2, modesY + 60, COLORS.sub, 10);
        }

        // Encryption flow
        const flowY = modesY + 100;
        drawRoundedRect(20, flowY, 100, 34, 6, COLORS.pinkD, COLORS.pink);
        label('Plaintext', 70, flowY+17, COLORS.text, 11);

        // Animated data dot
        const progress = (t % 80) / 80;
        const dotX = 130 + progress * (W - 280);
        ctx.beginPath();
        ctx.arc(dotX, flowY + 17, 6, 0, Math.PI*2);
        ctx.fillStyle = COLORS.pink;
        ctx.fill();
        ctx.shadowColor = COLORS.pink; ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        drawRoundedRect(W - 140, flowY, 120, 34, 6, COLORS.panel, COLORS.green);
        label('Ciphertext', W - 80, flowY+17, COLORS.green, 11);

        // Key + Tag labels
        label('Key 🔑', W/2, flowY - 15, COLORS.yellow, 11);
        label('+ Auth Tag ✓', W - 80, flowY + 45, COLORS.cyan, 10);

        engine.animFrame = requestAnimationFrame(frame);
      };
      frame();
    };

    // ── Step 2: Criptografia Assimétrica (RSA/ECC) ──
    const drawAsymmetric = () => {
      const frame = () => {
        clear(); t++;
        boldLabel('Criptografia Assimétrica: RSA vs ECC', W/2, 30, COLORS.pink, 16);

        // Key pair visualization
        const kpY = 70;
        // Public key
        drawRoundedRect(30, kpY, 140, 50, 8, COLORS.pinkD, COLORS.pink);
        boldLabel('🔓 Pub Key', 100, kpY+16, COLORS.pink, 13);
        label('Qualquer um', 100, kpY+36, COLORS.sub, 10);

        // Private key
        drawRoundedRect(W-170, kpY, 140, 50, 8, 'rgba(74,222,128,0.15)', COLORS.green);
        boldLabel('🔑 Priv Key', W-100, kpY+16, COLORS.green, 13);
        label('Só o dono', W-100, kpY+36, COLORS.sub, 10);

        // Math link
        const linkProgress = (Math.sin(t*0.03) + 1)/2;
        ctx.setLineDash([8,4]);
        ctx.strokeStyle = `rgba(244,63,94,${0.3+0.4*linkProgress})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(175, kpY+25); ctx.lineTo(W-175, kpY+25);
        ctx.stroke();
        ctx.setLineDash([]);
        label('Matematicamente relacionadas', W/2, kpY+12, COLORS.sub, 10);

        // Encrypt flow
        const flowY = 150;
        boldLabel('Cifrar', 60, flowY, COLORS.blue, 12);

        // Message -> encrypt with pub -> ciphertext -> decrypt with priv -> message
        const boxes = [
          { x: 20, w: 80, text: 'MSG', color: COLORS.text },
          { x: 130, w: 90, text: 'Encrypt 🔓', color: COLORS.pink },
          { x: 260, w: 90, text: '🔒 Cifrado', color: COLORS.yellow },
          { x: 390, w: 90, text: 'Decrypt 🔑', color: COLORS.green },
          { x: 515, w: 80, text: 'MSG', color: COLORS.text }
        ];
        for(let i = 0; i < boxes.length; i++) {
          const b = boxes[i];
          drawRoundedRect(b.x, flowY+15, b.w, 30, 6, COLORS.panel, b.color);
          label(b.text, b.x + b.w/2, flowY+30, b.color, 10);
          if(i < boxes.length - 1) {
            arrow(b.x + b.w + 2, flowY+30, boxes[i+1].x - 2, flowY+30, COLORS.dim);
          }
        }

        // Animated packet
        const pkt = (t % 120) / 120;
        const totalW = boxes[4].x + boxes[4].w - boxes[0].x;
        const pktX = boxes[0].x + pkt * totalW;
        ctx.beginPath(); ctx.arc(pktX, flowY + 55, 4, 0, Math.PI*2);
        ctx.fillStyle = COLORS.pink; ctx.fill();

        // RSA vs ECC comparison table
        const tableY = 230;
        boldLabel('Comparação de Segurança', W/2, tableY, COLORS.pink, 14);

        const headers = ['Segurança', 'RSA', 'ECC'];
        const rows = [
          ['128 bits', '3072 bits', '256 bits'],
          ['192 bits', '7680 bits', '384 bits'],
          ['256 bits', '15360 bits', '512 bits']
        ];
        const colW = [120, 120, 120];
        const startX = W/2 - (colW[0]+colW[1]+colW[2])/2;

        // Headers
        for(let c = 0; c < 3; c++) {
          const hx = startX + colW.slice(0,c).reduce((a,b)=>a+b,0) + colW[c]/2;
          boldLabel(headers[c], hx, tableY + 25, c === 2 ? COLORS.green : COLORS.sub, 12);
        }

        // Rows
        for(let r = 0; r < rows.length; r++) {
          const ry = tableY + 48 + r*28;
          for(let c = 0; c < 3; c++) {
            const rx = startX + colW.slice(0,c).reduce((a,b)=>a+b,0) + colW[c]/2;
            const isECC = c === 2;
            label(rows[r][c], rx, ry, isECC ? COLORS.green : COLORS.text, 12);
          }
          // Highlight ECC column
          const eccX = startX + colW[0] + colW[1];
          drawRoundedRect(eccX, ry - 12, colW[2], 24, 4, 'rgba(74,222,128,0.05)', 'transparent');
        }

        // ECC advantage note
        const noteY = tableY + 140;
        label('ECC: mesma segurança, chaves ~10x menores', W/2, noteY, COLORS.green, 12);
        label('Ambos vulneráveis a computadores quânticos (Shor)', W/2, noteY + 20, COLORS.red, 11);

        engine.animFrame = requestAnimationFrame(frame);
      };
      frame();
    };

    // ── Step 3: Diffie-Hellman / ECDHE ──
    const drawDiffieHellman = () => {
      const frame = () => {
        clear(); t++;
        boldLabel('ECDHE — Key Exchange', W/2, 25, COLORS.pink, 16);

        // Alice and Bob
        const aliceX = 80, bobX = W - 80;
        const topY = 60;

        // Alice
        drawRoundedRect(aliceX-50, topY, 100, 40, 8, 'rgba(59,130,246,0.15)', COLORS.blue);
        boldLabel('Alice', aliceX, topY+20, COLORS.blue, 14);

        // Bob
        drawRoundedRect(bobX-50, topY, 100, 40, 8, 'rgba(74,222,128,0.15)', COLORS.green);
        boldLabel('Bob', bobX, topY+20, COLORS.green, 14);

        // Public channel
        ctx.setLineDash([6,4]);
        ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(aliceX, topY+50); ctx.lineTo(bobX, topY+50); ctx.stroke();
        ctx.setLineDash([]);
        label('Canal Público (qualquer um vê)', W/2, topY+47, COLORS.sub, 10);

        // Color mixing analogy
        const stageY = 120;
        const stages = [
          { y: stageY, text: 'Cor base pública', aColor: '#EAB308', bColor: '#EAB308', label: '🟡' },
          { y: stageY+55, text: 'Cor secreta', aColor: '#EF4444', bColor: '#3B82F6', label: '' },
          { y: stageY+110, text: 'Mistura (publica)', aColor: '#F97316', bColor: '#22C55E', label: 'Troca ↔' },
          { y: stageY+165, text: 'Resultado final', aColor: '#92400E', bColor: '#92400E', label: '= Igual!' }
        ];

        for(let i = 0; i < stages.length; i++) {
          const s = stages[i];
          const animDelay = i * 40;
          const visible = t > animDelay;
          if(!visible) continue;

          const alpha = Math.min(1, (t - animDelay) / 20);

          // Alice's color circle
          ctx.globalAlpha = alpha;
          ctx.beginPath(); ctx.arc(aliceX, s.y+20, 18, 0, Math.PI*2);
          ctx.fillStyle = s.aColor; ctx.fill();
          ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1; ctx.stroke();

          // Bob's color circle
          ctx.beginPath(); ctx.arc(bobX, s.y+20, 18, 0, Math.PI*2);
          ctx.fillStyle = s.bColor; ctx.fill();
          ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1; ctx.stroke();

          // Label
          label(s.text, W/2, s.y+10, COLORS.sub, 11);

          if(i === 2 && t > animDelay + 20) {
            // Exchange arrows
            const progress = Math.min(1, (t - animDelay - 20) / 30);
            const midY = s.y + 20;
            const ax = aliceX + 20 + progress * (bobX - aliceX - 40);
            const bx = bobX - 20 - progress * (bobX - aliceX - 40);
            ctx.beginPath(); ctx.arc(ax, midY - 8, 5, 0, Math.PI*2);
            ctx.fillStyle = s.aColor; ctx.fill();
            ctx.beginPath(); ctx.arc(bx, midY + 8, 5, 0, Math.PI*2);
            ctx.fillStyle = s.bColor; ctx.fill();
          }

          if(i === 3) {
            // Glow on match
            const glow = 0.3 + 0.3*Math.sin(t*0.08);
            ctx.shadowColor = '#92400E'; ctx.shadowBlur = 15*glow;
            ctx.beginPath(); ctx.arc(aliceX, s.y+20, 20, 0, Math.PI*2);
            ctx.strokeStyle = COLORS.yellow; ctx.lineWidth = 2; ctx.stroke();
            ctx.beginPath(); ctx.arc(bobX, s.y+20, 20, 0, Math.PI*2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            boldLabel('Shared Secret! 🔑', W/2, s.y+20, COLORS.yellow, 13);
          }

          ctx.globalAlpha = 1;
        }

        // Forward secrecy note
        if(t > 200) {
          const fsY = stageY + 235;
          drawRoundedRect(W/2 - 160, fsY, 320, 30, 6, 'rgba(74,222,128,0.1)', COLORS.green);
          label('Perfect Forward Secrecy: chaves efêmeras descartadas a cada sessão', W/2, fsY+15, COLORS.green, 10);
        }

        engine.animFrame = requestAnimationFrame(frame);
      };
      frame();
    };

    // ── Step 4: Certificados X.509 ──
    const drawCertificates = () => {
      const frame = () => {
        clear(); t++;
        boldLabel('PKI — Cadeia de Confiança X.509', W/2, 25, COLORS.pink, 16);

        // Chain of 3 certificates
        const chainX = W/2;
        const levels = [
          { y: 60, name: 'Root CA', detail: 'GlobalSign R2', color: COLORS.pink, w: 200 },
          { y: 170, name: 'Intermediate CA', detail: 'GTS CA 1C3', color: COLORS.purple, w: 180 },
          { y: 280, name: 'Leaf Certificate', detail: '*.google.com', color: COLORS.green, w: 160 }
        ];

        for(let i = 0; i < levels.length; i++) {
          const l = levels[i];
          const animDelay = i * 30;
          const alpha = Math.min(1, Math.max(0, (t - animDelay) / 20));
          ctx.globalAlpha = alpha;

          // Certificate card
          const cx = chainX - l.w/2;
          drawRoundedRect(cx, l.y, l.w, 80, 10, COLORS.panel, l.color);

          // Certificate icon
          boldLabel('📜', cx + 20, l.y + 20, COLORS.text, 16);
          boldLabel(l.name, cx + l.w/2 + 10, l.y + 18, l.color, 13);
          label(l.detail, cx + l.w/2 + 10, l.y + 38, COLORS.sub, 11);

          // Signature badge
          if(i === 0) {
            label('Auto-assinada', cx + l.w/2 + 10, l.y + 58, COLORS.yellow, 10);
          } else {
            label(`Assinada por ${levels[i-1].detail}`, cx + l.w/2 + 10, l.y + 58, COLORS.sub, 10);
          }

          // Chain arrow
          if(i < levels.length - 1) {
            const arrowAlpha = Math.min(1, Math.max(0, (t - animDelay - 15) / 15));
            ctx.globalAlpha = arrowAlpha;
            arrow(chainX, l.y + 82, chainX, levels[i+1].y - 2, l.color);
            label('assina ↓', chainX + 40, l.y + 95, l.color, 10);
          }

          ctx.globalAlpha = 1;
        }

        // Trust store indicator
        if(t > 100) {
          drawRoundedRect(W - 150, 60, 130, 40, 6, 'rgba(244,63,94,0.1)', COLORS.pink);
          label('🖥️ Trust Store', W - 85, 72, COLORS.pink, 11);
          label('Pré-instalada no SO', W - 85, 90, COLORS.sub, 9);
        }

        // Verification flow at bottom
        if(t > 120) {
          const vfY = 380;
          const checks = ['Assinatura ✓','Expiração ✓','Domínio ✓','Revogação ✓'];
          const checkW = (W - 40) / checks.length;
          for(let i = 0; i < checks.length; i++) {
            const delay = 120 + i * 15;
            if(t < delay) continue;
            const a = Math.min(1, (t - delay) / 15);
            ctx.globalAlpha = a;
            const cx = 15 + i * checkW;
            drawRoundedRect(cx, vfY, checkW - 8, 32, 6, 'rgba(74,222,128,0.1)', COLORS.green);
            label(checks[i], cx + (checkW-8)/2, vfY+16, COLORS.green, 11);
            ctx.globalAlpha = 1;
          }

          if(t > 190) {
            const allDone = 0.5 + 0.5*Math.sin(t*0.06);
            boldLabel('🔒 Conexão Confiável', W/2, vfY + 50, COLORS.green, 14);
            ctx.shadowColor = COLORS.green; ctx.shadowBlur = 10*allDone;
            boldLabel('🔒 Conexão Confiável', W/2, vfY + 50, COLORS.green, 14);
            ctx.shadowBlur = 0;
          }
        }

        engine.animFrame = requestAnimationFrame(frame);
      };
      frame();
    };

    // ── Step 5: TLS 1.3 Handshake ──
    const drawTLS = () => {
      const frame = () => {
        clear(); t++;
        boldLabel('TLS 1.3 — Full Handshake (1-RTT)', W/2, 25, COLORS.pink, 16);

        const clientX = 80, serverX = W - 80;
        const topY = 55;

        // Client & Server boxes
        drawRoundedRect(clientX - 45, topY, 90, 35, 8, 'rgba(59,130,246,0.15)', COLORS.blue);
        boldLabel('Client', clientX, topY+17, COLORS.blue, 13);

        drawRoundedRect(serverX - 45, topY, 90, 35, 8, 'rgba(74,222,128,0.15)', COLORS.green);
        boldLabel('Server', serverX, topY+17, COLORS.green, 13);

        // Vertical timeline lines
        ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1;
        ctx.setLineDash([4,3]);
        ctx.beginPath();
        ctx.moveTo(clientX, topY+37); ctx.lineTo(clientX, H-20);
        ctx.moveTo(serverX, topY+37); ctx.lineTo(serverX, H-20);
        ctx.stroke();
        ctx.setLineDash([]);

        // Handshake messages
        const messages = [
          { y: 115, from: 'client', text: 'ClientHello', detail: 'ciphers + ECDHE key + SNI', color: COLORS.blue },
          { y: 165, from: 'server', text: 'ServerHello', detail: 'selected cipher + ECDHE key', color: COLORS.green },
          { y: 205, from: 'server', text: '{Certificate}', detail: 'leaf + intermediate cert', color: COLORS.purple },
          { y: 240, from: 'server', text: '{CertVerify}', detail: 'ECDSA signature', color: COLORS.purple },
          { y: 275, from: 'server', text: '{Finished}', detail: 'HMAC transcript', color: COLORS.purple },
          { y: 315, from: 'client', text: '{Finished}', detail: 'HMAC transcript', color: COLORS.cyan },
          { y: 360, from: 'both', text: 'Application Data', detail: 'AES-256-GCM encrypted', color: COLORS.yellow }
        ];

        for(let i = 0; i < messages.length; i++) {
          const m = messages[i];
          const animDelay = i * 25;
          if(t < animDelay) continue;

          const progress = Math.min(1, (t - animDelay) / 20);
          ctx.globalAlpha = progress;

          const fromX = m.from === 'client' ? clientX : serverX;
          const toX = m.from === 'client' ? serverX : clientX;

          if(m.from === 'both') {
            // Bidirectional
            const midBothY = m.y;
            arrow(clientX + 10, midBothY, serverX - 10, midBothY, COLORS.yellow);
            arrow(serverX - 10, midBothY + 10, clientX + 10, midBothY + 10, COLORS.yellow);
            boldLabel(m.text, W/2, midBothY - 10, m.color, 11);
            label(m.detail, W/2, midBothY + 22, COLORS.sub, 9);
          } else {
            // Unidirectional arrow
            const arrowEndX = fromX < toX ? toX - 10 : toX + 10;
            arrow(fromX + (fromX < toX ? 10 : -10), m.y, arrowEndX, m.y, m.color);

            // Label above arrow
            boldLabel(m.text, W/2, m.y - 10, m.color, 11);
            label(m.detail, W/2, m.y + 10, COLORS.sub, 9);
          }

          // Animated packet along arrow
          if(progress < 1 && m.from !== 'both') {
            const pktProgress = progress;
            const px = fromX + (toX - fromX) * pktProgress;
            ctx.beginPath(); ctx.arc(px, m.y, 4, 0, Math.PI*2);
            ctx.fillStyle = m.color; ctx.fill();
            ctx.shadowColor = m.color; ctx.shadowBlur = 8;
            ctx.fill(); ctx.shadowBlur = 0;
          }

          ctx.globalAlpha = 1;

          // Encryption boundary
          if(i === 1 && progress >= 1) {
            const ky = m.y + 17;
            ctx.strokeStyle = COLORS.pink; ctx.lineWidth = 1;
            ctx.setLineDash([3,3]);
            ctx.beginPath();
            ctx.moveTo(clientX - 30, ky); ctx.lineTo(serverX + 30, ky);
            ctx.stroke();
            ctx.setLineDash([]);
            label('═══ Handshake keys ═══', W/2, ky, COLORS.pink, 9);
          }
        }

        // 1-RTT badge
        if(t > 180) {
          const badgeY = H - 50;
          const pulse = 0.5 + 0.5*Math.sin(t*0.06);
          drawRoundedRect(W/2-80, badgeY, 160, 32, 8,
            `rgba(244,63,94,${0.1+0.1*pulse})`, COLORS.pink);
          boldLabel('⚡ 1-RTT Handshake', W/2, badgeY+16, COLORS.pink, 12);
        }

        engine.animFrame = requestAnimationFrame(frame);
      };
      frame();
    };

    // ── Dispatch ──
    const steps = [drawHashing, drawSymmetric, drawAsymmetric, drawDiffieHellman, drawCertificates, drawTLS];
    if(steps[stepIdx]) steps[stepIdx]();
  };

  return engine;
}
