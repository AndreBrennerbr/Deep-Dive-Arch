export function BaseRenderer(canvas) {
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.animFrame = null;
    this.stop = () => { 
        if(this.animFrame) cancelAnimationFrame(this.animFrame); 
    };
}
