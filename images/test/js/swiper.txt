class Swiper {
    constructor(){
        this.$container = $(".list");
        this.$inner = $(".list_inner");
        this.click = false;
        this.left = 0;
        this.preX = null;
        this.preY = null;
        this.STEP = 0.8;
        this.setEvent();
    }

    setEvent(){
        $(window).on("mouseup",()=>{ this.click = false });

        this.$container.on("mousedown",(e)=>{
            this.click = true;
            this.preX = e.clientX;
            this.preY = e.clientY;
        });
        
        $(window).on("mousemove",(e)=>{
            if(!this.click) return;
            let { clientX : x } = e;
            if( x === this.preX ) return;
            let delta = x - this.preX;
            this.left += this.STEP * delta;
            this.$inner.css({ left : this.left + "px" });
            
            this.preX = x;
        });
    }
}