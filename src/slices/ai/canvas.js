import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderAI(canvas) {
  const engine = new BaseRenderer(canvas);
  
  const layers = [
    { x: 150, nodes: [100, 180, 260, 340], type: 'in' },
    { x: 350, nodes: [60, 140, 220, 300, 380], type: 'hidden' },
    { x: 550, nodes: [100, 180, 260, 340], type: 'hidden' },
    { x: 750, nodes: [220], type: 'out' }
  ];

  engine.drawStep = function(stepIdx) {
    this.stop();
    this.ctx.clearRect(0,0,this.W,this.H);
    
    if(stepIdx === 3) return this.drawPositionalEncoding();
    if(stepIdx === 4) return this.drawTransformerBlock();
    if(stepIdx === 5) return this.drawTransformerMatrix(stepIdx);
    if(stepIdx === 6) return this.drawTrainingPipeline();

    let animProgress = 0;
    
    const drawFrame = () => {
      this.ctx.clearRect(0,0,this.W,this.H);
      this.ctx.lineWidth = 1;
      
      for(let i=0; i<layers.length-1; i++) {
        let l1 = layers[i];
        let l2 = layers[i+1];
        
        l1.nodes.forEach(y1 => {
          l2.nodes.forEach(y2 => {
             this.ctx.beginPath();
             this.ctx.moveTo(l1.x, y1);
             this.ctx.lineTo(l2.x, y2);
             this.ctx.strokeStyle = 'rgba(192, 132, 252, 0.15)'; 
             this.ctx.stroke();
          });
        });
      }
      
      if (stepIdx === 0 || stepIdx === 1 || stepIdx === 7) {
         this.ctx.fillStyle = "#c084fc";
         this.ctx.shadowBlur = 10;
         this.ctx.shadowColor = "#e879f9";
         
         let lidx = Math.floor(animProgress * (layers.length - 1));
         if(lidx < layers.length - 1) {
             let l1 = layers[lidx];
             let l2 = layers[lidx+1];
             let subT = (animProgress * (layers.length - 1)) - lidx;
             
             l1.nodes.forEach((y1, idx1) => {
                 if(idx1 % 2 === 0) {
                     let y2 = l2.nodes[0];
                     let curX = l1.x + (l2.x - l1.x) * subT;
                     let curY = y1 + (y2 - y1) * subT;
                     this.ctx.beginPath();
                     this.ctx.arc(curX, curY, 3, 0, Math.PI*2);
                     this.ctx.fill();
                 }
             });
         }
         this.ctx.shadowBlur = 0;
      }

      layers.forEach(l => {
         l.nodes.forEach(y => {
            this.ctx.beginPath();
            this.ctx.arc(l.x, y, 6, 0, Math.PI*2);
            this.ctx.fillStyle = '#1e293b';
            this.ctx.strokeStyle = '#c084fc';
            this.ctx.lineWidth = 2;
            
            if(stepIdx === 7 && l.type === 'out') {
                this.ctx.fillStyle = '#c084fc';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#d8b4fe';
            }

            this.ctx.fill(); this.ctx.stroke();
            this.ctx.shadowBlur = 0;
         });
      });
      
      // Step 1: Tokenization labels
      if(stepIdx === 1) {
          this.ctx.textAlign = 'center';
          this.ctx.fillStyle = '#c084fc';
          this.ctx.font = "bold 13px monospace";
          this.ctx.fillText('"Olá mundo"', 150, 50);
          
          const tokens = ['"Ol"', '"á"', '" mundo"'];
          const tokenIds = ['4928', '225', '14713'];
          layers[0].nodes.forEach((y, i) => {
              if(i < tokens.length) {
                  this.ctx.fillStyle = '#e879f9';
                  this.ctx.font = "10px monospace";
                  this.ctx.fillText(tokens[i], 60, y + 4);
                  this.ctx.fillStyle = '#94a3b8';
                  this.ctx.fillText('→ ' + tokenIds[i], 60, y + 18);
              }
          });
      }

      // Step 2: Embedding labels
      if(stepIdx === 2) {
          this.ctx.textAlign = 'center';
          this.ctx.fillStyle = '#c084fc';
          this.ctx.font = "bold 12px monospace";
          this.ctx.fillText('Espaço Vetorial (N-Dim)', this.W/2, 30);

          // Draw vector arrows
          const words = [{t:'Rei', x:300, y:150, c:'#e879f9'}, {t:'Rainha', x:320, y:170, c:'#e879f9'}, 
                         {t:'Carro', x:600, y:300, c:'#fb923c'}, {t:'Gato', x:500, y:100, c:'#4ade80'}];
          words.forEach(w => {
              this.ctx.beginPath();
              this.ctx.moveTo(this.W/2, this.H/2);
              this.ctx.lineTo(w.x, w.y);
              this.ctx.strokeStyle = w.c;
              this.ctx.lineWidth = 2;
              this.ctx.stroke();
              this.ctx.fillStyle = w.c;
              this.ctx.font = "bold 13px sans-serif";
              this.ctx.fillText(w.t, w.x, w.y - 10);
              this.ctx.beginPath();
              this.ctx.arc(w.x, w.y, 4, 0, Math.PI*2);
              this.ctx.fill();
          });
          // Cosine arc
          this.ctx.beginPath();
          this.ctx.arc(this.W/2, this.H/2, 50, Math.atan2(150-this.H/2, 300-this.W/2), Math.atan2(170-this.H/2, 320-this.W/2));
          this.ctx.strokeStyle = 'rgba(232, 121, 249, 0.6)';
          this.ctx.lineWidth = 2;
          this.ctx.stroke();
          this.ctx.fillStyle = '#94a3b8';
          this.ctx.font = "11px monospace";
          this.ctx.fillText('cos(θ) ≈ 0.97', 360, this.H/2 - 30);
      }

      if(stepIdx === 7) {
          this.ctx.textAlign = 'center';
          this.ctx.fillStyle = '#fff';
          this.ctx.font = "bold 14px monospace";
          this.ctx.fillText("Softmax → Top-P Sampling", this.W/2, 40);
          // Draw probability bars
          const probs = [{t:'mundo', p:0.42}, {t:'terra', p:0.28}, {t:'planeta', p:0.15}, {t:'lugar', p:0.08}, {t:'...', p:0.07}];
          probs.forEach((pr, i) => {
              let bx = 620, by = 100 + i * 35;
              let bw = pr.p * 200;
              this.ctx.fillStyle = 'rgba(192, 132, 252, ' + (0.3 + pr.p) + ')';
              this.ctx.fillRect(bx, by, bw, 20);
              this.ctx.fillStyle = '#e2e8f0';
              this.ctx.font = "11px monospace";
              this.ctx.textAlign = 'right';
              this.ctx.fillText(pr.t, bx - 8, by + 14);
              this.ctx.textAlign = 'left';
              this.ctx.fillText((pr.p*100).toFixed(0) + '%', bx + bw + 5, by + 14);
          });
          this.ctx.textAlign = 'center';
      }

      animProgress += 0.01;
      if (animProgress >= 1) animProgress = 0;
      
      this.animFrame = requestAnimationFrame(drawFrame);
    };
    
    drawFrame();
  };
  
  engine.drawTransformerMatrix = function(stepIdx) {
      this.ctx.fillStyle = "#050a15";
      this.ctx.fillRect(0,0,this.W,this.H);

      // Matrix backgrounds
      const mats = [
        {x:80, w:200, label:'Q (Query)', color:'#c084fc', desc:'O que busco?'},
        {x:340, w:200, label:'K (Key)', color:'#e879f9', desc:'O que ofereço?'},
        {x:600, w:200, label:'V (Value)', color:'#fb923c', desc:'Meu conteúdo'}
      ];
      
      mats.forEach(m => {
          this.ctx.fillStyle = "#0f172a";
          this.ctx.strokeStyle = m.color;
          this.ctx.lineWidth = 2;
          this.ctx.fillRect(m.x, 80, m.w, 160);
          this.ctx.strokeRect(m.x, 80, m.w, 160);
          
          // Grid lines
          this.ctx.strokeStyle = "rgba(255,255,255,0.04)";
          this.ctx.lineWidth = 1;
          for(let i=m.x; i<=m.x+m.w; i+=25) {
              this.ctx.beginPath(); this.ctx.moveTo(i, 80); this.ctx.lineTo(i, 240); this.ctx.stroke();
          }
          for(let j=80; j<=240; j+=20) {
              this.ctx.beginPath(); this.ctx.moveTo(m.x, j); this.ctx.lineTo(m.x+m.w, j); this.ctx.stroke();
          }
          
          // Labels
          this.ctx.font = "bold 16px monospace";
          this.ctx.fillStyle = m.color;
          this.ctx.textAlign = "center";
          this.ctx.fillText(m.label, m.x + m.w/2, 70);
          this.ctx.font = "11px sans-serif";
          this.ctx.fillStyle = "#94a3b8";
          this.ctx.fillText(m.desc, m.x + m.w/2, 265);
      });
      
      // Attention flow arrows
      this.ctx.beginPath();
      this.ctx.moveTo(180, 250);
      this.ctx.quadraticCurveTo(350, 310, 440, 250);
      this.ctx.strokeStyle = "#c084fc";
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([5, 5]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
      
      this.ctx.beginPath();
      this.ctx.moveTo(440, 250);
      this.ctx.lineTo(440, 290);
      this.ctx.lineTo(700, 250);
      this.ctx.strokeStyle = "#fb923c";
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([5, 5]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
      
      // Formula
      this.ctx.font = "bold 13px monospace";
      this.ctx.fillStyle = "#e2e8f0";
      this.ctx.textAlign = "center";
      this.ctx.fillText("Attention(Q,K,V) = softmax(Q·Kᵀ / √d_k) · V", this.W/2, 330);
      
      // Explanation
      this.ctx.font = "12px sans-serif";
      this.ctx.fillStyle = "#94a3b8";
      this.ctx.fillText("Q·Kᵀ → score de relevância │ /√d_k → estabiliza gradientes │ softmax → pesos │ ·V → extrai conteúdo", this.W/2, 360);
      
      // Multi-head indicator
      this.ctx.font = "11px monospace";
      this.ctx.fillStyle = "#c084fc";
      this.ctx.fillText("× 32-128 cabeças paralelas (cada uma aprende padrões diferentes)", this.W/2, 390);
  };

  engine.drawPositionalEncoding = function() {
      this.ctx.fillStyle = "#050a15";
      this.ctx.fillRect(0,0,this.W,this.H);
      
      let t = 0;
      const animate = () => {
          this.ctx.fillStyle = "#050a15";
          this.ctx.fillRect(0,0,this.W,this.H);
          
          this.ctx.textAlign = "center";
          this.ctx.font = "bold 14px monospace";
          this.ctx.fillStyle = "#c084fc";
          this.ctx.fillText("Positional Encoding: Ondas Sinusoidais por Dimensão", this.W/2, 30);
          
          // Draw tokens at top
          const tokens = ['O', 'gato', 'sentou', 'no', 'tapete'];
          const tokenX = tokens.map((_, i) => 120 + i * 160);
          
          tokens.forEach((tk, i) => {
              this.ctx.fillStyle = i === Math.floor(t/60) % tokens.length ? '#e879f9' : '#94a3b8';
              this.ctx.font = "bold 13px sans-serif";
              this.ctx.fillText(tk, tokenX[i], 60);
              this.ctx.fillStyle = '#475569';
              this.ctx.font = "10px monospace";
              this.ctx.fillText('pos=' + i, tokenX[i], 75);
          });
          
          // Draw sine waves for different dimensions
          const waves = [
              {freq: 1, color: '#c084fc', label: 'dim 0 (alta freq)'},
              {freq: 0.5, color: '#e879f9', label: 'dim 128'},
              {freq: 0.15, color: '#fb923c', label: 'dim 256 (baixa freq)'},
          ];
          
          const baseY = 160;
          const waveH = 70;
          
          waves.forEach((w, wi) => {
              let yCenter = baseY + wi * (waveH + 30);
              
              // Label
              this.ctx.font = "11px monospace";
              this.ctx.fillStyle = w.color;
              this.ctx.textAlign = "left";
              this.ctx.fillText(w.label, 10, yCenter - waveH/2 - 5);
              
              // Wave
              this.ctx.beginPath();
              for(let x = 80; x < this.W - 40; x++) {
                  let val = Math.sin((x - 80) * w.freq * 0.02 + t * 0.01);
                  let y = yCenter + val * (waveH/2 - 5);
                  if(x === 80) this.ctx.moveTo(x, y);
                  else this.ctx.lineTo(x, y);
              }
              this.ctx.strokeStyle = w.color;
              this.ctx.lineWidth = 2;
              this.ctx.stroke();
              
              // Position markers on wave
              tokens.forEach((_, i) => {
                  let px = tokenX[i];
                  let val = Math.sin((px - 80) * w.freq * 0.02 + t * 0.01);
                  let py = yCenter + val * (waveH/2 - 5);
                  this.ctx.beginPath();
                  this.ctx.arc(px, py, 5, 0, Math.PI * 2);
                  this.ctx.fillStyle = w.color;
                  this.ctx.fill();
                  this.ctx.strokeStyle = '#fff';
                  this.ctx.lineWidth = 1;
                  this.ctx.stroke();
              });
          });
          
          this.ctx.textAlign = "center";
          this.ctx.font = "11px sans-serif";
          this.ctx.fillStyle = "#94a3b8";
          this.ctx.fillText("Cada dimensão oscila em frequência diferente → posições codificadas como padrões únicos", this.W/2, this.H - 15);
          
          t++;
          this.animFrame = requestAnimationFrame(animate);
      };
      animate();
  };

  engine.drawTransformerBlock = function() {
      this.ctx.fillStyle = "#050a15";
      this.ctx.fillRect(0,0,this.W,this.H);
      
      const cx = this.W / 2;
      const blocks = [
          {y: 30,  h: 40, label: 'Input Embeddings + Pos Encoding', color: '#94a3b8', w: 320},
          {y: 90,  h: 50, label: 'Multi-Head Attention', color: '#c084fc', w: 280},
          {y: 155, h: 30, label: 'Add & LayerNorm', color: '#64748b', w: 240},
          {y: 200, h: 50, label: 'Feed-Forward Network (SiLU)', color: '#e879f9', w: 280},
          {y: 265, h: 30, label: 'Add & LayerNorm', color: '#64748b', w: 240},
          {y: 320, h: 40, label: 'Linear + Softmax → Logits', color: '#fb923c', w: 320},
      ];
      
      blocks.forEach((b, i) => {
          // Block
          this.ctx.fillStyle = "#0f172a";
          this.ctx.strokeStyle = b.color;
          this.ctx.lineWidth = 2;
          let bx = cx - b.w/2;
          this.ctx.beginPath();
          this.ctx.roundRect(bx, b.y, b.w, b.h, 8);
          this.ctx.fill();
          this.ctx.stroke();
          
          // Label
          this.ctx.fillStyle = b.color;
          this.ctx.font = "bold 13px monospace";
          this.ctx.textAlign = "center";
          this.ctx.fillText(b.label, cx, b.y + b.h/2 + 5);
          
          // Arrow down
          if(i < blocks.length - 1) {
              let nextY = blocks[i+1].y;
              this.ctx.beginPath();
              this.ctx.moveTo(cx, b.y + b.h);
              this.ctx.lineTo(cx, nextY);
              this.ctx.strokeStyle = "#334155";
              this.ctx.lineWidth = 2;
              this.ctx.stroke();
              // Arrow head
              this.ctx.beginPath();
              this.ctx.moveTo(cx - 5, nextY - 6);
              this.ctx.lineTo(cx, nextY);
              this.ctx.lineTo(cx + 5, nextY - 6);
              this.ctx.strokeStyle = "#334155";
              this.ctx.stroke();
          }
      });
      
      // Residual connections
      const drawResidual = (fromY, toY, label) => {
          let rx = cx + 170;
          this.ctx.beginPath();
          this.ctx.moveTo(cx + 140, fromY);
          this.ctx.lineTo(rx, fromY);
          this.ctx.lineTo(rx, toY);
          this.ctx.lineTo(cx + 120, toY);
          this.ctx.strokeStyle = "rgba(251, 146, 60, 0.5)";
          this.ctx.lineWidth = 2;
          this.ctx.setLineDash([4, 4]);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
          this.ctx.fillStyle = "#fb923c";
          this.ctx.font = "10px monospace";
          this.ctx.textAlign = "left";
          this.ctx.fillText(label, rx + 5, (fromY + toY) / 2 + 4);
      };
      
      drawResidual(blocks[0].y + blocks[0].h/2, blocks[2].y + blocks[2].h/2, 'Residual +x');
      drawResidual(blocks[2].y + blocks[2].h/2, blocks[4].y + blocks[4].h/2, 'Residual +x');
      
      // Layer repeat indicator
      this.ctx.strokeStyle = "rgba(192, 132, 252, 0.3)";
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([3, 3]);
      let rx2 = cx - 185;
      this.ctx.beginPath();
      this.ctx.moveTo(rx2, blocks[1].y);
      this.ctx.lineTo(rx2 - 25, blocks[1].y);
      this.ctx.lineTo(rx2 - 25, blocks[4].y + blocks[4].h);
      this.ctx.lineTo(rx2, blocks[4].y + blocks[4].h);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
      this.ctx.fillStyle = "#c084fc";
      this.ctx.font = "bold 11px monospace";
      this.ctx.textAlign = "right";
      this.ctx.fillText("×N layers", rx2 - 30, (blocks[1].y + blocks[4].y + blocks[4].h) / 2 + 4);
      this.ctx.font = "10px monospace";
      this.ctx.fillStyle = "#94a3b8";
      this.ctx.fillText("(32-96)", rx2 - 30, (blocks[1].y + blocks[4].y + blocks[4].h) / 2 + 18);
      
      this.ctx.textAlign = "center";
      this.ctx.font = "11px sans-serif";
      this.ctx.fillStyle = "#94a3b8";
      this.ctx.fillText("Arquitetura Decoder-Only (GPT, LLaMA, Claude)", cx, this.H - 15);
  };

  engine.drawTrainingPipeline = function() {
      this.ctx.fillStyle = "#050a15";
      this.ctx.fillRect(0,0,this.W,this.H);
      
      let t = 0;
      const animate = () => {
          this.ctx.fillStyle = "#050a15";
          this.ctx.fillRect(0,0,this.W,this.H);
          
          this.ctx.textAlign = "center";
          this.ctx.font = "bold 14px monospace";
          this.ctx.fillStyle = "#c084fc";
          this.ctx.fillText("Pipeline de Treinamento de um LLM", this.W/2, 25);
          
          // Three phases
          const phases = [
              {x: 150, label: 'Pré-Treinamento', sub: 'Next-Token Prediction', sub2: 'Trilhões de tokens', color: '#3b82f6', icon: '📚'},
              {x: 450, label: 'Fine-Tuning (SFT)', sub: 'Instrução → Resposta', sub2: '~100K exemplos', color: '#4ade80', icon: '🎯'},
              {x: 750, label: 'RLHF / DPO', sub: 'Preferência Humana', sub2: 'Rankings A>B', color: '#e879f9', icon: '👥'},
          ];
          
          phases.forEach((p, i) => {
              // Box
              let isActive = Math.floor(t / 120) % 3 === i;
              this.ctx.fillStyle = isActive ? "rgba(15, 23, 42, 1)" : "#0f172a";
              this.ctx.strokeStyle = isActive ? p.color : "rgba(71, 85, 105, 0.5)";
              this.ctx.lineWidth = isActive ? 3 : 1;
              this.ctx.shadowBlur = isActive ? 15 : 0;
              this.ctx.shadowColor = p.color;
              this.ctx.beginPath();
              this.ctx.roundRect(p.x - 100, 60, 200, 120, 12);
              this.ctx.fill();
              this.ctx.stroke();
              this.ctx.shadowBlur = 0;
              
              this.ctx.font = "22px serif";
              this.ctx.fillStyle = '#fff';
              this.ctx.fillText(p.icon, p.x, 95);
              
              this.ctx.font = "bold 13px sans-serif";
              this.ctx.fillStyle = p.color;
              this.ctx.fillText(p.label, p.x, 120);
              
              this.ctx.font = "11px monospace";
              this.ctx.fillStyle = "#94a3b8";
              this.ctx.fillText(p.sub, p.x, 140);
              this.ctx.fillText(p.sub2, p.x, 155);
              
              // Arrow
              if(i < phases.length - 1) {
                  this.ctx.beginPath();
                  this.ctx.moveTo(p.x + 105, 120);
                  this.ctx.lineTo(phases[i+1].x - 105, 120);
                  this.ctx.strokeStyle = "#475569";
                  this.ctx.lineWidth = 2;
                  this.ctx.stroke();
                  this.ctx.beginPath();
                  this.ctx.moveTo(phases[i+1].x - 108, 115);
                  this.ctx.lineTo(phases[i+1].x - 100, 120);
                  this.ctx.lineTo(phases[i+1].x - 108, 125);
                  this.ctx.fillStyle = "#475569";
                  this.ctx.fill();
              }
          });
          
          // Loss curve
          this.ctx.font = "bold 12px monospace";
          this.ctx.fillStyle = "#94a3b8";
          this.ctx.textAlign = "left";
          this.ctx.fillText("Loss", 80, 215);
          
          // Axes
          let graphX = 100, graphY = 220, graphW = 700, graphH = 140;
          this.ctx.beginPath();
          this.ctx.moveTo(graphX, graphY);
          this.ctx.lineTo(graphX, graphY + graphH);
          this.ctx.lineTo(graphX + graphW, graphY + graphH);
          this.ctx.strokeStyle = "#334155";
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
          
          this.ctx.fillStyle = "#94a3b8";
          this.ctx.font = "10px monospace";
          this.ctx.textAlign = "center";
          this.ctx.fillText("Steps de Treinamento →", graphX + graphW/2, graphY + graphH + 18);
          
          // Animated loss curve
          this.ctx.beginPath();
          let maxPt = Math.min(t * 2, graphW);
          for(let x = 0; x < maxPt; x++) {
              let progress = x / graphW;
              let loss = Math.exp(-progress * 3) * 0.8 + 0.15 + Math.sin(x * 0.1) * 0.02 * Math.exp(-progress * 2);
              let py = graphY + (1 - loss) * graphH;
              let px = graphX + x;
              if(x === 0) this.ctx.moveTo(px, py);
              else this.ctx.lineTo(px, py);
          }
          this.ctx.strokeStyle = "#c084fc";
          this.ctx.lineWidth = 2.5;
          this.ctx.stroke();
          
          // Loss labels
          this.ctx.font = "9px monospace";
          this.ctx.fillStyle = "#475569";
          this.ctx.textAlign = "right";
          this.ctx.fillText("alta", graphX - 5, graphY + 10);
          this.ctx.fillText("baixa", graphX - 5, graphY + graphH - 5);
          
          t += 1.5;
          this.animFrame = requestAnimationFrame(animate);
      };
      animate();
  };

  return engine;
}
