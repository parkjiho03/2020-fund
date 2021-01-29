const {random, floor, ceil, PI} = Math;

class App {
    constructor() {
        this.data;
        this.now = 0;
        this.menu = $(".menu_con > ul > li > p");
        this.page = $("#container > .page");
        this.popup = $("#fund_popup_bg");
        this.list = [];
        this.arr = [this.mainFund, this.removeFund, this.viewFund, this.listFund];
        this.move = false;
        this.signed = false;
        this.page_num = 5;
        this.page_now = 1;
        this.init();
    }

    addEvent() {
        this.menu.on("click", this.pageDraw);
        document.querySelector(".add_fund_btn").addEventListener("click", this.addFund);
        document.querySelector(".fund_popup_close").addEventListener("click", () => {
            this.popup.fadeOut();
            this.viewFund();
        });
        document.querySelector("#fund_total").addEventListener("input", this.comma);
        document.querySelector(".popup_btn > button").addEventListener("click", this.layerPopupOk);
    }

    comma = e => {
        
    }

    pageDraw = e => {
        if(this.move) return;
        let id = e.currentTarget.dataset.title * 1;
        if(id === this.now) return;
        if(id != 0) $("#container").css({height:"900px"});
        else $("#container").css({height:"2019px"});
        this.menu.eq(this.now).removeClass("active");
        this.menu.eq(id).addClass("active");
        this.convertPageAndDraw(this.now, id);
    }

    convertPageAndDraw(preIdx , nextIdx){
        this.move = true;
        let dir = preIdx > nextIdx;
        // dir 이 true 이면 왼쪽으로 애니메이션, 오른쪽으로 애니메이션
        let preTarget = dir ? '100%' : '-100%';
        let nextTarget = dir ? '-100%' : '100%';
        this.page.eq(preIdx).animate({ left : preTarget } , 1300);
        this.page.eq(nextIdx).css({ left : nextTarget }).animate({ left : 0 }, 1300 , ()=>{
            this.move = false;
            this.now = nextIdx;
        });
        this.arr[nextIdx].bind(this)();
    }

    mainFund() {
        let four = this.data.sort((a,b) => (a.current / a.total > b.current / b.total) ? -1 : (a.current / a.total < b.current / b.total) ? 1 : 0);
        let nowDate = new Date().toISOString().slice(0, -1);
        let num = 0;
        let main_fund = document.querySelector(".main_fund_con");
        main_fund.innerHTML = "";
        four.forEach((x) => {
            if(x.endDate > nowDate) {
                num++;
                if(num <= 4) {
                    let div = document.createElement("div");
                    div.classList.add("fund");
                    div.innerHTML = `
                    <div class="fund_canvas">
                    <canvas style="width:200px;height:200px;></canvas>
                    </div>
                    <div class="fund_num">${x.number}</div>
                    <div class="fund_num">${x.number}</div>
                    <div class="fund_name">${x.name}</div>
                    <div class="fund_date">${x.endDate}</div>
                    <div class="fund_total">${x.total.toLocaleString()}원</div>
                    <div class="fund_cur">${x.current.toLocaleString()}원</div>
                    `;
                    document.querySelector(".main_fund_con").appendChild(div);
                    let canvas = div.querySelector("canvas");
                    let g = new Fund(canvas, "#ddd", "rgba(0,123,255,0.8)");
                    g.animationDraw(x.current / x.total * 100, 80, 2000);
                }
            }
        });
    }

    addFund = e => {
        let fundNumber = document.querySelector("#fund_number");
        let fundName = document.querySelector("#fund_name");
        let fundDate = document.querySelector("#fund_date");
        let fundTotal = document.querySelector("#fund_total");
        let nowDate = new Date().toISOString().slice(0, -1);
        let date;
        // if(fundName.value.length > 100) {
        //     alert("100자 까지만 입력가능합니다.");
        //     console.log(fundName.value.length);
        //     return;
        // }
        if(fundName.value.trim() === "" || fundDate.value.trim() === "" || fundTotal.value.trim() == "") {
            alert("필수 입력값이 비어있습니다.");
            return;
        }
        if(nowDate > fundDate.value) {
            alert("이미 지난 날짜는 등록불가능합니다.");
            return;
        }
        date = fundDate.value.replace("T"," ");
        alert("펀드가 등록 되었습니다.");
        let datas = {"number":fundNumber.value, "name":fundName.value, "endDate":date, "total":fundTotal.value, "current":0};
        this.data.push(datas);
        this.removeFund();
    }

    removeFund() {
        let fundNumber = document.querySelector("#fund_number");
        let fundName = document.querySelector("#fund_name");
        let fundDate = document.querySelector("#fund_date");
        let fundTotal = document.querySelector("#fund_total");
        fundNumber.value = this.fundNumber();
        fundName.value = "";
        fundDate.value = "";
        fundTotal.value = "";
    }

    fundNumber() {
        let text = "";
        let cap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for(let i = 0; i < 5; i++) text += cap.charAt(Math.floor(Math.random() * cap.length));
        return text;
    }

    viewFund() {
        let four = this.data.sort((a,b) => (a.current / a.total > b.current / b.total) ? -1 : (a.current / a.total < b.current / b.total) ? 1 : 0);
        let view = document.querySelector(".view_fund_menu");
        view.innerHTML = "";
        let date = new Date().toISOString().slice(0, -1);
        four.forEach((x) => {
            let dates = x.endDate > date;
            let div = document.createElement("div");
            let percent = x.current / x.total * 100;
            div.classList.add("view_fund_menu_con");
            div.innerHTML = `
                <p class="menu_num">${x.number}</p>
                <p class="menu_name">${x.name}</p>
                <p class="menu_date">${x.endDate}</p>
                <p class="menu_total">${x.total.toLocaleString()}원</p>
                <p class="menu_cur">${x.current.toLocaleString()}원</p>
                <div class="menu_graph">
                    <div class="menu_graph_bar_con">
                        <div class="menu_graph_bar"></div>
                    </div>
                    <div class="menu_graph_text">${floor(percent)}%</div>
                </div>
                <div class="menu_btn">
                    <button class="${dates ? "menu_btn_yes" : "menu_btn_no"}">${dates ? "투자하기" : "모집완료"}</button>
                </div>
            `;
            if(x.total == x.current) {
                let btn = $(div).find(".menu_btn > button");
                btn[0].innerHTML = '모집완료';
                btn[0].classList.remove("menu_btn_yes");
                btn[0].classList.add("menu_btn_no");
            }
            $(div).find(".menu_graph_bar").animate({ width : percent + "%"},1500);
            $(".view_fund_menu").append(div);
            $(div).find('button').on("click", () => {
                if(!dates) return;
                if(x.total == x.current) return;
                this.layerPopup(x);
            });
        });
    }

    layerPopup(x) {
        this.popup.find('input').val("");
        let canvas = document.querySelector("#popup_canvas");
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        $(".popup_number").val(x.number);
        $(".popup_name").val(x.name);
        this.signed = false;
        this.popup.fadeIn();
    }

    layerPopupOk = e => {
        let number = document.querySelector(".popup_number").value;
        let name = document.querySelector(".popup_name").value;
        let user = document.querySelector(".popup_user").value;
        let money = document.querySelector(".popup_money").value * 1;
        let fund = this.data.find(x=> x.number === number);
        let canvas = document.querySelector("#popup_canvas");
        let sign = canvas.toDataURL();
        console.log(this.signed);
        if(user.trim() === "" || money === "" || this.signed == false) {
            alert('필수 입력값이 비어있습니다.');
            return;
        }
        let total_money = fund.total - fund.current;
        if(total_money < money) {
            alert("투자 금액은 모집금액을 넘을 수 없습니다.");
            return;
        }
        let find = this.list.findIndex(x=> x.name === name && x.number === number);
        if(find === -1) this.list.push({number, user, money, canvas, sign});
        else {
            this.list[find].sign = sign;
            this.list[find].money += money;
        }
        alert("투자가 완료 되었습니다.");
        fund.current += money;
    }

    drawSign(e) {
		if(this.startDraw){
			this.strokeStyle = "#000";
			this.signed = true;
			this.signCtx.beginPath();
			this.signCtx.moveTo(this.signPoint.x, this.signPoint.y);
			this.signCtx.lineTo(e.offsetX, e.offsetY);
			this.signCtx.stroke();
			this.signPoint.x = e.offsetX;
			this.signPoint.y = e.offsetY;
		}
    }
    
    listFund = e => {
        let list = document.querySelector(".list_fund_menu");
        list.innerHTML = "";
        this.page_now = 1;
        this.renderPaging();
    }

    renderPaging() {
        let $list = $(".list_fund_btns");
        $list.empty();
        let html  = ``;
        for(let i = 1; i <= this.investorTotalPage; i++) html += `<button data-page="${i}" class="pg_btn pg_btn_normal ${ this.page_now === i ? "pg_now" : "" }">${i}</button>`;
        $list.html(html);
        $list.find("button").on("click",(e)=>{
            this.page_now = e.currentTarget.dataset.page * 1;
            this.renderPaging();
        });
        let slice_idx = (this.page_now - 1)*5;
        let list = this.list.reverse().slice( slice_idx , slice_idx+5 );

        $list = $('.list_fund_menu_con');
        $list.empty();
        $list.hide();
        list.forEach( iv =>{
            let fund = this.data.find(x=> x.number === iv.number );
            let div = document.createElement("div");
            let percent = olimToPercent( iv.money / fund.total );
            div.classList.add("list_fund_menu_con");
            div.innerHTML = `
                <p class="list_num">${fund.number}</p>
                <p class="menu_name">${fund.name}</p>
                <p class="menu_date" title="${iv.user}">${iv.user}</p>
                <p class="menu_total">${iv.money.toLocaleString()}원</p>
                <div class="menu_graph">
                    <div class="menu_graph_bar_con">
                        <div class="menu_graph_bar"></div>
                    </div>
                    <div class="menu_graph_text">${percent}%</div>
                </div>
                <div class="menu_btn">
                <button class="btn btn-b iv_sign_btn mt-1">투자펀드계약서</button>
                </div>
            `;
            document.querySelector(".list_fund_menu").append(div);
            $(div).find(".menu_graph_bar").animate({ width : percent+"%" }, 2000);
            $(div).find(".iv_sign_btn").on('click',(e)=>{
                this.downloadSign( iv , fund );
            });
        }); 
        $list.fadeIn();
        this.list.reverse();
    }

    get investorTotalPage(){
        return ceil(this.list.length / this.page_num);
    }

    async downloadSign( iv , fund ){
        console.log(iv);
        let canvas = document.createElement("canvas");
        canvas.width = 793;
        canvas.height = 495;
        let ctx = canvas.getContext('2d');
        let img = await this.loadImage('./images/funding.png');
        ctx.drawImage( img , 0 , 0 );

        ctx.fillStyle = "#000";
        ctx.textAlign = "left";
        ctx.font = "300 16px noto";
        ctx.textBaseline = "middle";
        ctx.fillText( fund.number , 327 , 177 );
        ctx.fillText( fund.name  , 327 , 218 );
        ctx.fillText( iv.user , 327 , 264 );
        ctx.fillText( iv.money.toLocaleString() + "원" , 327 , 310 );
        let sign = await this.loadImage( iv.sign );
        ctx.drawImage( sign , 485 , 389 , 240 , 75 );
        
        let base64 = canvas.toDataURL();
        let a = document.createElement("a");
        a.href = base64;
        a.download = "download";
        a.click();
    }

    loadImage(src){
        return new Promise( (res,rej)=>{
            let img = new Image();
            img.addEventListener("load",()=>{
                res(img);
            });
            img.src = src;
        } );
    }

    readData() {
        return $.getJSON("./js/fund.json");
    }

    async init() {
        this.data = await this.readData();
        this.addEvent();
        this.arr[this.now].bind(this)();
    }
}

class Fund {
    constructor(el, fillColor, graphColor) {
        this.canvas = $(el).get(0);
        this.ctx = this.canvas.getContext('2d');
        this.fillColor = fillColor;
        this.gColor = graphColor;
        this.timer;
        this.canvas.width = 200;
        this.canvas.height = 200;
    }

    animationDraw(value, r, time = 1500) {
        clearInterval(this.timer);
        let c = 0;
        this.timer = setInterval(() => {
            c += value / (time / 60);
            if(c >= value) {
                c = value;
                clearInterval(this.timer);
            }
            this.ctx.clearRect(0, 0, this.canvas.with, this.canvas.height);
            this.circleDraw(c, r);
        }, time / 30);
    }

    circle(fillColor, x, y, r, PI1, PI2){
		this.ctx.fillStyle = fillColor;
		this.ctx.beginPath();
		this.ctx.moveTo(x,y);
		this.ctx.arc(x, y, r,  PI1, PI2);
		this.ctx.closePath();
		this.ctx.fill();
	}

	circleDraw(value, r){
		let x = this.canvas.width / 2;
		let y = this.canvas.height / 2;
		let rad = value * 2 * PI / 100;

		this.circle(this.fillColor, x, y, r, - PI / 2, 3/2 * PI);
		this.circle(this.gColor, x , y, r, - PI  / 2, - PI / 2 + rad);
		this.circle("#fff", x, y,  r * 0.75, - PI / 2, 3/2 * PI);
		this.text("#000", r/3, "center", "middle", value, x, y);
	}
	
	text(color, fontsize, align, baseline, value, x, y){
		this.ctx.fillStyle = color;
		this.ctx.font = `${fontsize}px Arial`;
		this.ctx.textAlign = align;
		this.ctx.textBaseline = baseline;
		this.ctx.fillText(`${floor(value)}%`, x, y);
	}
}

class Draw {
    constructor(){
        this.canvas = document.querySelector("#popup_canvas");
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        

        this.click = false;
        this.preX = null;
        this.preY = null;
        this.init();
    }

    init(){

        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";

        this.addEvent();
    }

    addEvent(){
        this.canvas.addEventListener("mousedown",(e)=>{
            // mousedown
            this.preX = e.offsetX;
            this.preY = e.offsetY;
            this.click = true;
        });

        window.addEventListener("mouseup",()=>{ this.click = false; });

        this.canvas.addEventListener("mousemove",(e)=>{
            if(!this.click) return;

            let x = e.offsetX;
            let y = e.offsetY;

            this.ctx.beginPath();
            this.ctx.moveTo( this.preX , this.preY );
            this.ctx.lineTo( x , y );
            this.ctx.closePath();
            this.ctx.stroke();

            this.preX = x;
            this.preY = y;
            window.app.signed = true;
        });

        this.canvas.addEventListener("mouseover",(e)=>{
            this.preX = e.offsetX;
            this.preY = e.offsetY;
        });
    }
}

window.addEventListener("load", function() {
    window.app = new App();
    window.draw = new Draw();
});

window.olimToPercent = function(num){
    return Math.ceil(num * 10000) / 100;   
}