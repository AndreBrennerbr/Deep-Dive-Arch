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
       ctx.shadowColor = stacks[layerIdx].color;
       ctx.fillRect(x - w/2, y-10, w, 20);
       ctx.shadowBlur = 0;
       ctx.fillStyle = "#000";
       ctx.font = "bold 10px sans";
       ctx.fillText(layerIdx === 0 ? "HTTP" : extraLabel || "PAYLOAD", x, y + 4);
    }

    let t = 0;
    
    const animateFrame = () => {
      this.ctx.clearRect(0,0,this.W,this.H);
      drawStaticEnv();
      
      let shouldContinue = true;

      if (stepIdx === 0) {
          shouldContinue = false;
      } 
      else if (stepIdx === 1) {
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
          } else if (norm > 0.4 && norm <= 0.6) {
             layerIdx = 3; 
             let prog = (norm - 0.4) / 0.2;
             y = getLayerY(3) + 20;
             x = CLI_X + (SVR_X - CLI_X) * prog;
             drawPacket(this.ctx, x, y, layerIdx);
          } else {
             x = SVR_X + 100;
             let prog = (norm - 0.6) / 0.4;
             layerIdx = 3 - Math.floor(prog * 3.99);
             y = getLayerY(3) - (getLayerY(3) - getLayerY(0)) * prog + 20;
             drawPacket(this.ctx, x, y, layerIdx);
          }
      } 
      else if (stepIdx === 2) {
          let duration = 200;
          let cycle = t % duration;
          let norm = cycle / duration;
          
          let y = getLayerY(1) + 20;
          let x, label;
          
          if (norm < 0.33) {
               let prog = norm / 0.33;
               x = CLI_X + (SVR_X - CLI_X) * prog;
               label = "SYN";
          } else if (norm >= 0.33 && norm < 0.66) {
               let prog = (norm - 0.33) / 0.33;
               x = SVR_X - (SVR_X - CLI_X) * prog;
               label = "SYN-ACK";
          } else {
               let prog = (norm - 0.66) / 0.33;
               x = CLI_X + (SVR_X - CLI_X) * prog;
               label = "ACK";
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
      } 
      else if (stepIdx === 3) {
          let y = getLayerY(1) + 20;
          
          let pktNorm = (t % 50) / 50; 
          let x1 = CLI_X + (SVR_X - CLI_X) * pktNorm;
          drawPacket(this.ctx, x1, y, 1, "UDP Data");
          
          let pktNorm2 = ((t+30) % 50) / 50; 
          let x2 = CLI_X + (SVR_X - CLI_X) * pktNorm2;
          drawPacket(this.ctx, x2, y, 1, "UDP Voice");
          
          if(t % 60 > 40) {
             this.ctx.fillStyle = "#ef4444";
             this.ctx.font = "bold 14px sans";
             this.ctx.fillText("x Losed", SVR_X - 100, y - 20);
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
