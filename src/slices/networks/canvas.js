import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderNetwork(canvas) {
  const engine = new BaseRenderer(canvas);
  
  const stacks = [
    { name: "App (L7)", color: "#c084fc", height: 40 },
    { name: "Transp. (L4)", color: "#10b981", height: 40 },
    { name: "Net IP (L3)", color: "#3b82f6", height: 40 },
    { name: "Fisico (L1-2)", color: "#fb923c", height: 40 }
  ];
  
  const CLI_X = 150;
  const SVR_X = 750;
  const STACK_Y = 80;
  const GAP = 15;
  
  const getLayerY = (idx) => STACK_Y + (idx * (40 + GAP));

  engine.drawStep = function(stepIdx) {
    this.stop();
    this.ctx.clearRect(0,0,this.W,this.H);
    
    const drawStaticEnv = () => {
      this.ctx.fillStyle = '#050a15';
      this.ctx.fillRect(0,0,this.W,this.H);
      
      drawOSITower(this.ctx, CLI_X, "Client Web");
      drawOSITower(this.ctx, SVR_X, "Server NodeJS");
      
      this.ctx.beginPath();
      let l1_y = getLayerY(3) + 20;
      this.ctx.moveTo(CLI_X + 60, l1_y);
      this.ctx.lineTo(SVR_X - 60, l1_y);
      this.ctx.strokeStyle = "#475569";
      this.ctx.lineWidth = 10;
      this.ctx.stroke();
    };

    const drawOSITower = (ctx, startX, label) => {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, startX, STACK_Y - 25);
        
        stacks.forEach((layer, idx) => {
           let y = getLayerY(idx);
           ctx.fillStyle = "#0f172a";
           ctx.strokeStyle = layer.color;
           ctx.lineWidth = 2;
           ctx.fillRect(startX-60, y, 120, layer.height);
           ctx.strokeRect(startX-60, y, 120, layer.height);
           
           ctx.fillStyle = "#e2e8f0";
           ctx.font = "12px monospace";
           ctx.fillText(layer.name, startX, y + 25);
           
           if(idx < stacks.length - 1) {
               ctx.beginPath();
               ctx.moveTo(startX, y + layer.height);
               ctx.lineTo(startX, getLayerY(idx+1));
               ctx.strokeStyle = "#334155";
               ctx.stroke();
           }
        });
    };
    
    const drawPacket = (ctx, x, y, layerIdx, extraLabel="") => {
       let w = 40 + (layerIdx*15);
       ctx.fillStyle = "#fff";
       ctx.shadowBlur = 15;
       ctx.shadowColor = stacks[Math.min(layerIdx, stacks.length-1)].color;
       ctx.fillRect(x - w/2, y-10, w, 20);
       ctx.shadowBlur = 0;
       ctx.fillStyle = "#000";
       ctx.font = "bold 10px sans";
       ctx.textAlign = "center";
       ctx.fillText(layerIdx === 0 ? "HTTP" : extraLabel || "PAYLOAD", x, y + 4);
    };

    let t = 0;
    
    const animateFrame = () => {
      this.ctx.clearRect(0,0,this.W,this.H);
      drawStaticEnv();
      
      let shouldContinue = true;

      if (stepIdx === 0) {
          // OSI layers - static with highlighting
          shouldContinue = false;
          
          // Draw layer descriptions
          const cx = this.W / 2;
          const descs = [
              {label: 'HTTP / DNS / TLS', color: '#c084fc'},
              {label: 'TCP / UDP (Portas)', color: '#10b981'},
              {label: 'IP Routing (Roteadores)', color: '#3b82f6'},
              {label: 'Ethernet / Fibra / Wi-Fi', color: '#fb923c'},
          ];
          descs.forEach((d, i) => {
              let y = getLayerY(i) + 20;
              this.ctx.font = "11px monospace";
              this.ctx.fillStyle = d.color;
              this.ctx.textAlign = "center";
              this.ctx.fillText(d.label, cx, y + 4);
          });
      } 
      else if (stepIdx === 1) {
          // Encapsulation animation with header size labels
          let duration = 300; 
          let cycle = t % duration;
          let norm = cycle / duration;
          
          let x, y, layerIdx;
          
          if (norm <= 0.4) {
             x = CLI_X - 100;
             let prog = norm / 0.4;
             layerIdx = Math.floor(prog * 3.99);
             y = getLayerY(0) + (getLayerY(3) - getLayerY(0)) * prog + 20;
             drawPacket(this.ctx, x, y, layerIdx);
             
             // Show header being added
             const headers = ['HTTP Payload', '+TCP (20B)', '+IP (20B)', '+Eth (14B)'];
             if(layerIdx < headers.length) {
                 this.ctx.font = "bold 11px monospace";
                 this.ctx.fillStyle = stacks[layerIdx].color;
                 this.ctx.textAlign = "left";
                 this.ctx.fillText(headers[layerIdx], x + 45, y + 4);
             }
          } else if (norm > 0.4 && norm <= 0.6) {
             layerIdx = 3; 
             let prog = (norm - 0.4) / 0.2;
             y = getLayerY(3) + 20;
             x = CLI_X + (SVR_X - CLI_X) * prog;
             drawPacket(this.ctx, x, y, layerIdx);
             
             this.ctx.font = "10px monospace";
             this.ctx.fillStyle = "#fb923c";
             this.ctx.textAlign = "center";
             this.ctx.fillText("Fibra / Ethernet", (CLI_X + SVR_X) / 2, y - 20);
          } else {
             x = SVR_X + 100;
             let prog = (norm - 0.6) / 0.4;
             layerIdx = 3 - Math.floor(prog * 3.99);
             y = getLayerY(3) - (getLayerY(3) - getLayerY(0)) * prog + 20;
             drawPacket(this.ctx, x, y, layerIdx);
             
             const headers = ['→ HTTP Data', '→ Remove TCP', '→ Remove IP', '→ Remove Eth'];
             if(layerIdx >= 0 && layerIdx < headers.length) {
                 this.ctx.font = "bold 11px monospace";
                 this.ctx.fillStyle = stacks[layerIdx].color;
                 this.ctx.textAlign = "left";
                 this.ctx.fillText(headers[3 - layerIdx], x + 45, y + 4);
             }
          }
      } 
      else if (stepIdx === 2) {
          // DNS Resolution animation
          let duration = 400;
          let cycle = t % duration;
          let norm = cycle / duration;
          
          // Draw DNS Server in the middle
          let dnsX = this.W / 2, dnsY = 60;
          this.ctx.fillStyle = "#0f172a";
          this.ctx.strokeStyle = "#3b82f6";
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.roundRect(dnsX - 55, dnsY - 18, 110, 36, 8);
          this.ctx.fill();
          this.ctx.stroke();
          this.ctx.fillStyle = "#3b82f6";
          this.ctx.font = "bold 12px monospace";
          this.ctx.textAlign = "center";
          this.ctx.fillText("DNS Server", dnsX, dnsY + 5);
          
          let queryY = getLayerY(0) + 20;
          
          if(norm < 0.3) {
              // Client sends DNS query
              let prog = norm / 0.3;
              let px = CLI_X + (dnsX - CLI_X) * prog;
              let py = queryY + (dnsY - queryY) * prog;
              drawPacket(this.ctx, px, py, 0, "DNS Q");
              
              this.ctx.font = "11px monospace";
              this.ctx.fillStyle = "#3b82f6";
              this.ctx.fillText('"google.com = ??"', CLI_X, queryY - 15);
          } else if(norm >= 0.3 && norm < 0.6) {
              // DNS resolving (blinking)
              if(Math.floor(t / 10) % 2 === 0) {
                  this.ctx.shadowBlur = 15;
                  this.ctx.shadowColor = "#3b82f6";
                  this.ctx.fillStyle = "#3b82f6";
                  this.ctx.beginPath();
                  this.ctx.roundRect(dnsX - 55, dnsY - 18, 110, 36, 8);
                  this.ctx.fill();
                  this.ctx.fillStyle = "#fff";
                  this.ctx.font = "bold 12px monospace";
                  this.ctx.fillText("Resolvendo...", dnsX, dnsY + 5);
                  this.ctx.shadowBlur = 0;
              }
              
              // Show hierarchy
              this.ctx.font = "10px monospace";
              this.ctx.fillStyle = "#94a3b8";
              let labels = ['Root (.)  →  TLD (.com)  →  Auth (google.com)'];
              labels.forEach((l, i) => {
                  this.ctx.fillText(l, dnsX, dnsY + 30 + i * 15);
              });
          } else {
              // DNS response
              let prog = (norm - 0.6) / 0.4;
              let px = dnsX + (CLI_X - dnsX) * prog;
              let py = dnsY + (queryY - dnsY) * prog;
              drawPacket(this.ctx, px, py, 0, "DNS R");
              
              this.ctx.font = "bold 11px monospace";
              this.ctx.fillStyle = "#4ade80";
              this.ctx.fillText('A: 142.250.79.4', CLI_X, queryY + 25);
              this.ctx.font = "10px monospace";
              this.ctx.fillStyle = "#94a3b8";
              this.ctx.fillText('TTL: 300s', CLI_X, queryY + 40);
          }
      }
      else if (stepIdx === 3) {
          // TCP Handshake with state labels
          let duration = 250;
          let cycle = t % duration;
          let norm = cycle / duration;
          
          let y = getLayerY(1) + 20;
          let x, label;
          
          if (norm < 0.33) {
               let prog = norm / 0.33;
               x = CLI_X + (SVR_X - CLI_X) * prog;
               label = "SYN";
               
               // State labels
               this.ctx.font = "10px monospace";
               this.ctx.fillStyle = "#10b981";
               this.ctx.textAlign = "center";
               this.ctx.fillText("SYN_SENT", CLI_X, y - 25);
               this.ctx.fillStyle = "#94a3b8";
               this.ctx.fillText("LISTEN", SVR_X, y - 25);
          } else if (norm >= 0.33 && norm < 0.66) {
               let prog = (norm - 0.33) / 0.33;
               x = SVR_X - (SVR_X - CLI_X) * prog;
               label = "SYN-ACK";
               
               this.ctx.font = "10px monospace";
               this.ctx.fillStyle = "#10b981";
               this.ctx.textAlign = "center";
               this.ctx.fillText("SYN_SENT", CLI_X, y - 25);
               this.ctx.fillText("SYN_RCVD", SVR_X, y - 25);
          } else {
               let prog = (norm - 0.66) / 0.33;
               x = CLI_X + (SVR_X - CLI_X) * prog;
               label = "ACK";
               
               this.ctx.font = "10px monospace";
               this.ctx.fillStyle = "#4ade80";
               this.ctx.textAlign = "center";
               this.ctx.fillText("ESTABLISHED", CLI_X, y - 25);
               this.ctx.fillText("ESTABLISHED", SVR_X, y - 25);
          }
          drawPacket(this.ctx, x, y, 1, label);
          
          this.ctx.beginPath();
          this.ctx.moveTo(CLI_X + 60, y);
          this.ctx.lineTo(SVR_X - 60, y);
          this.ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
          this.ctx.lineWidth = 2;
          this.ctx.setLineDash([5, 10]);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
          
          // Sequence number info
          this.ctx.font = "10px monospace";
          this.ctx.fillStyle = "#475569";
          this.ctx.textAlign = "center";
          this.ctx.fillText("Seq/Ack numbers garantem ordenação e integridade", this.W/2, y + 35);
      } 
      else if (stepIdx === 4) {
          // UDP rapid fire
          let y = getLayerY(1) + 20;
          
          // Multiple UDP packets flying
          for(let i = 0; i < 4; i++) {
              let pktNorm = ((t + i * 20) % 50) / 50; 
              let x1 = CLI_X + (SVR_X - CLI_X) * pktNorm;
              let labels = ["UDP DNS", "UDP Game", "UDP Voice", "UDP Video"];
              drawPacket(this.ctx, x1, y - 15 + i * 15, 1, labels[i]);
          }
          
          // Packet loss indicator
          if(t % 80 > 55) {
             this.ctx.fillStyle = "#ef4444";
             this.ctx.font = "bold 13px sans";
             this.ctx.textAlign = "center";
             this.ctx.fillText("✕ Pacote perdido!", SVR_X - 50, y - 40);
             this.ctx.font = "10px monospace";
             this.ctx.fillStyle = "#94a3b8";
             this.ctx.fillText("(sem retransmissão)", SVR_X - 50, y - 25);
          }
          
          // QUIC label
          this.ctx.font = "11px monospace";
          this.ctx.fillStyle = "#fb923c";
          this.ctx.textAlign = "center";
          this.ctx.fillText("QUIC (HTTP/3): confiabilidade reimplementada sobre UDP", this.W/2, y + 55);
      }
      else if (stepIdx === 5) {
          // TLS Handshake animation
          let duration = 350;
          let cycle = t % duration;
          let norm = cycle / duration;
          
          let y = getLayerY(0) + 20;
          
          // Draw lock icon when established
          if(norm > 0.8) {
              this.ctx.font = "24px serif";
              this.ctx.textAlign = "center";
              this.ctx.fillText("🔒", this.W/2, y - 30);
          }
          
          this.ctx.beginPath();
          this.ctx.moveTo(CLI_X + 60, y);
          this.ctx.lineTo(SVR_X - 60, y);
          this.ctx.strokeStyle = norm > 0.8 ? "rgba(74, 222, 128, 0.4)" : "rgba(251, 146, 60, 0.3)";
          this.ctx.lineWidth = 2;
          this.ctx.setLineDash([4, 6]);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
          
          if(norm < 0.25) {
              let prog = norm / 0.25;
              let px = CLI_X + (SVR_X - CLI_X) * prog;
              drawPacket(this.ctx, px, y, 0, "ClientHello");
              
              this.ctx.font = "9px monospace";
              this.ctx.fillStyle = "#94a3b8";
              this.ctx.textAlign = "center";
              this.ctx.fillText("Cipher Suites + Key Share", this.W/2, y + 25);
          } else if(norm >= 0.25 && norm < 0.55) {
              let prog = (norm - 0.25) / 0.3;
              let px = SVR_X - (SVR_X - CLI_X) * prog;
              drawPacket(this.ctx, px, y, 0, "ServerHello");
              
              this.ctx.font = "9px monospace";
              this.ctx.fillStyle = "#94a3b8";
              this.ctx.textAlign = "center";
              this.ctx.fillText("Certificado X.509 + Key Share", this.W/2, y + 25);
              
              // Certificate chain
              let chainY = y + 40;
              const certs = ['Root CA', 'Intermediate', 'Leaf (site)'];
              certs.forEach((c, i) => {
                  let cx = this.W/2 - 80 + i * 80;
                  this.ctx.fillStyle = "#0f172a";
                  this.ctx.strokeStyle = i === 2 ? "#4ade80" : "#475569";
                  this.ctx.lineWidth = 1;
                  this.ctx.fillRect(cx - 30, chainY, 60, 20);
                  this.ctx.strokeRect(cx - 30, chainY, 60, 20);
                  this.ctx.fillStyle = "#94a3b8";
                  this.ctx.font = "8px monospace";
                  this.ctx.fillText(c, cx, chainY + 13);
                  if(i < certs.length - 1) {
                      this.ctx.beginPath();
                      this.ctx.moveTo(cx + 30, chainY + 10);
                      this.ctx.lineTo(cx + 50, chainY + 10);
                      this.ctx.strokeStyle = "#475569";
                      this.ctx.stroke();
                  }
              });
          } else if(norm >= 0.55 && norm < 0.8) {
              let prog = (norm - 0.55) / 0.25;
              let px = CLI_X + (SVR_X - CLI_X) * prog;
              drawPacket(this.ctx, px, y, 0, "Finished");
              
              this.ctx.font = "10px monospace";
              this.ctx.fillStyle = "#4ade80";
              this.ctx.textAlign = "center";
              this.ctx.fillText("Chave simétrica derivada (ECDHE)", this.W/2, y + 25);
          } else {
              // Encrypted data flowing
              let prog = ((norm - 0.8) / 0.2);
              let px = CLI_X + (SVR_X - CLI_X) * prog;
              
              this.ctx.fillStyle = "#4ade80";
              this.ctx.shadowBlur = 10;
              this.ctx.shadowColor = "#4ade80";
              this.ctx.fillRect(px - 25, y - 8, 50, 16);
              this.ctx.shadowBlur = 0;
              this.ctx.fillStyle = "#000";
              this.ctx.font = "bold 9px monospace";
              this.ctx.textAlign = "center";
              this.ctx.fillText("AES-256", px, y + 4);
              
              this.ctx.font = "bold 11px monospace";
              this.ctx.fillStyle = "#4ade80";
              this.ctx.fillText("🔒 Canal cifrado TLS 1.3 (1-RTT)", this.W/2, y + 30);
          }
      }

      t += 1.5;
      if (shouldContinue) {
          this.animFrame = requestAnimationFrame(animateFrame);
      }
    };
    
    animateFrame();
  };

  return engine;
}
