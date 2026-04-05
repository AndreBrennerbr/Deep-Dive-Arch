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
    
    if(stepIdx === 3 || stepIdx === 4 || stepIdx === 2) {
       return this.drawTransformerMatrix(stepIdx);
    }

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
      
      if (stepIdx === 0 || stepIdx === 1 || stepIdx === 5) {
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
            
            if(stepIdx === 5 && l.type === 'out') {
                this.ctx.fillStyle = '#c084fc';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#d8b4fe';
            }

            this.ctx.fill(); this.ctx.stroke();
            this.ctx.shadowBlur = 0;
         });
      });
      
      if(stepIdx === 5) {
          this.ctx.fillStyle = '#fff';
          this.ctx.font = "bold 16px monospace";
          this.ctx.fillText("Top-P Sample => 'inconstitucionalmente'", 520, 50);
      }

      animProgress += 0.01;
      if (animProgress >= 1) animProgress = 0;
      
      this.animFrame = requestAnimationFrame(drawFrame);
    };
    
    drawFrame();
  };
  
  engine.drawTransformerMatrix = function(stepIdx) {
      this.ctx.fillStyle = "#1e293b";
      this.ctx.fillRect(150, 100, 200, 200); 
      this.ctx.fillRect(400, 100, 200, 200); 
      this.ctx.fillRect(650, 100, 200, 200); 
      
      this.ctx.font = "20px monospace";
      this.ctx.fillStyle = "#c084fc";
      this.ctx.fillText("Q (Query)", 200, 90);
      this.ctx.fillText("K (Key)", 460, 90);
      this.ctx.fillText("V (Value)", 700, 90);
      
      this.ctx.strokeStyle = "rgba(255,255,255,0.05)";
      for(let i=150; i<850; i+=25) {
          this.ctx.beginPath(); this.ctx.moveTo(i, 100); this.ctx.lineTo(i, 300); this.ctx.stroke();
      }
      
      if (stepIdx === 4 || stepIdx === 2) {
          this.ctx.beginPath();
          this.ctx.moveTo(250, 310);
          this.ctx.lineTo(500, 350);
          this.ctx.lineTo(750, 310);
          this.ctx.strokeStyle = "#fb923c";
          this.ctx.lineWidth = 4;
          this.ctx.stroke();
          this.ctx.fillStyle = "#fb923c";
          this.ctx.fillText("Dot Product: Softmax(Q × K^T) * V", 330, 380);
      }
  };

  return engine;
}
