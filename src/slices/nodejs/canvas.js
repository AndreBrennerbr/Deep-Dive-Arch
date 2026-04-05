import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderNode(canvas) {
  const engine = new BaseRenderer(canvas);
  
  const boxes = [
    { id: 0, text: "socket()/bind()", x: 150, y: 200 },
    { id: 1, text: "libuv/epoll", x: 450, y: 120 },
    { id: 2, text: "accept4() V8", x: 450, y: 280 },
    { id: 3, text: "read() Buffer", x: 750, y: 150 },
    { id: 4, text: "llhttp Parser", x: 750, y: 250 },
  ];

  engine.drawStep = function(stepIdx) {
    this.stop();
    this.ctx.clearRect(0,0,this.W,this.H);
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 1.5;
    
    this.ctx.moveTo(boxes[0].x, boxes[0].y); this.ctx.lineTo(boxes[1].x, boxes[1].y);
    this.ctx.moveTo(boxes[0].x, boxes[0].y); this.ctx.lineTo(boxes[2].x, boxes[2].y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(boxes[2].x, boxes[2].y); this.ctx.lineTo(boxes[3].x, boxes[3].y);
    this.ctx.moveTo(boxes[2].x, boxes[2].y); this.ctx.lineTo(boxes[4].x, boxes[4].y);
    this.ctx.stroke();

    boxes.forEach((b, i) => {
      const isActive = stepIdx === i;
      this.ctx.fillStyle = isActive ? '#065f46' : '#0f172a';
      this.ctx.strokeStyle = isActive ? '#4ade80' : '#475569';
      this.ctx.lineWidth = isActive ? 3 : 1;
      this.ctx.shadowBlur = isActive ? 15 : 0;
      this.ctx.shadowColor = '#4ade80';
      
      this.ctx.beginPath();
      this.ctx.roundRect(b.x-75, b.y-25, 150, 50, 8);
      this.ctx.fill(); this.ctx.stroke();
      
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = isActive ? '#ffffff' : '#94a3b8';
      this.ctx.font = "12px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText(b.text, b.x, b.y+4);
    });
  };

  return engine;
}
