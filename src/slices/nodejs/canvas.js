import { BaseRenderer } from '../../shared/lib/engine.js';

export function renderNode(canvas) {
  const engine = new BaseRenderer(canvas);
  
  const boxes = [
    { id: 0, text: "socket()/bind()", x: 100, y: 200, w: 130 },
    { id: 1, text: "epoll / Event Loop", x: 300, y: 100, w: 145 },
    { id: 2, text: "accept4() → V8", x: 300, y: 300, w: 130 },
    { id: 3, text: "Thread Pool (4)", x: 500, y: 100, w: 130 },
    { id: 4, text: "read() → Buffer", x: 500, y: 220, w: 130 },
    { id: 5, text: "llhttp Parser", x: 700, y: 160, w: 130 },
    { id: 6, text: "res.write() →", x: 700, y: 300, w: 130 },
  ];

  const connections = [
    [0, 1], [0, 2], [1, 3], [2, 4], [4, 5], [5, 6], [2, 6]
  ];

  engine.drawStep = function(stepIdx) {
    this.stop();
    this.ctx.clearRect(0,0,this.W,this.H);
    
    let t = 0;
    
    const drawFrame = () => {
      this.ctx.fillStyle = '#050a15';
      this.ctx.fillRect(0,0,this.W,this.H);
      
      // Title
      this.ctx.textAlign = "center";
      this.ctx.font = "bold 12px monospace";
      this.ctx.fillStyle = "#4ade80";
      this.ctx.fillText("Node.js HTTP Request Pipeline", this.W/2, 25);

      // Draw connections
      connections.forEach(([from, to]) => {
        let b1 = boxes[from], b2 = boxes[to];
        let isOnPath = (stepIdx >= from && stepIdx <= to) || stepIdx === from || stepIdx === to;
        
        this.ctx.beginPath();
        this.ctx.moveTo(b1.x, b1.y);
        this.ctx.lineTo(b2.x, b2.y);
        this.ctx.strokeStyle = isOnPath ? 'rgba(74, 222, 128, 0.3)' : '#1e293b';
        this.ctx.lineWidth = isOnPath ? 2 : 1;
        this.ctx.stroke();
      });
      
      // Animated signal flowing through active path
      if(stepIdx > 0 && stepIdx < boxes.length) {
          let prevBox = boxes[Math.max(0, stepIdx - 1)];
          let currBox = boxes[stepIdx];
          let prog = (t % 80) / 80;
          let sigX = prevBox.x + (currBox.x - prevBox.x) * prog;
          let sigY = prevBox.y + (currBox.y - prevBox.y) * prog;
          
          this.ctx.beginPath();
          this.ctx.arc(sigX, sigY, 4, 0, Math.PI * 2);
          this.ctx.fillStyle = '#4ade80';
          this.ctx.shadowBlur = 12;
          this.ctx.shadowColor = '#4ade80';
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
      }

      // Draw boxes
      boxes.forEach((b, i) => {
        const isActive = stepIdx === i;
        const isPast = stepIdx > i;
        let hw = b.w / 2;
        
        this.ctx.fillStyle = isActive ? '#065f46' : isPast ? '#0c1a2e' : '#0f172a';
        this.ctx.strokeStyle = isActive ? '#4ade80' : isPast ? '#22c55e44' : '#475569';
        this.ctx.lineWidth = isActive ? 3 : 1;
        this.ctx.shadowBlur = isActive ? 18 : 0;
        this.ctx.shadowColor = '#4ade80';
        
        this.ctx.beginPath();
        this.ctx.roundRect(b.x - hw, b.y - 22, b.w, 44, 8);
        this.ctx.fill(); this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = isActive ? '#ffffff' : isPast ? '#64748b' : '#94a3b8';
        this.ctx.font = isActive ? "bold 12px monospace" : "11px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(b.text, b.x, b.y + 4);
        
        // Sub-labels for active
        if(isActive) {
            const subLabels = [
                'fd=3  │  AF_INET  │  SOCK_STREAM',
                'epoll_wait()  │  Poll Phase  │  1 Thread',
                'client_fd=16  │  SOCK_NONBLOCK  │  V8 Isolate',
                'UV_THREADPOOL_SIZE=4  │  fs/dns/crypto',
                'Kernel→User  │  Slab 8KB  │  Off-Heap malloc()',
                'FSM C  │  on_url  │  on_headers_complete',
                'Writable Stream  │  Backpressure  │  Chunked',
            ];
            this.ctx.font = "9px monospace";
            this.ctx.fillStyle = "#4ade80";
            this.ctx.fillText(subLabels[i], b.x, b.y + 35);
        }
      });
      
      // Layer labels
      this.ctx.font = "9px monospace";
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "#334155";
      this.ctx.fillText("Kernel / Syscalls", 15, 385);
      this.ctx.fillText("libuv (C)", 200, 385);
      this.ctx.fillText("V8 / C++ Bindings", 400, 385);
      this.ctx.fillText("JavaScript", 650, 385);
      
      // Layer separator lines
      [185, 390, 620].forEach(lx => {
          this.ctx.beginPath();
          this.ctx.moveTo(lx, 40);
          this.ctx.lineTo(lx, 370);
          this.ctx.strokeStyle = "#1e293b";
          this.ctx.lineWidth = 1;
          this.ctx.setLineDash([3, 5]);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
      });
      
      t += 1.5;
      this.animFrame = requestAnimationFrame(drawFrame);
    };
    
    drawFrame();
  };

  return engine;
}
