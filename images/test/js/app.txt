const { log , dir } = console;
const {PI , ceil} = Math;
const MP = - PI / 2;


class App {
    constructor(){

        this.num;
        this.conv_now = 0;
        this.datas;
        this.investorList = [];
        this.fxArr = [ this.drawMain , this.drawForm , this.drawFund , this.drawInvestor ];
        this.txtArr = [ '메인페이지' , '펀드등록' , '펀드보기' , '투자자목록' ];
        this.$links = $("nav > li");
        this.$pages = $("#pages > .page");
        this.$popup = $("#popup");
        this.PAGE_NOW = 1;
        this.PAGE_SHOW_CNT = 5;
        this.isMoving = false;
        
        this.signed = false;


        this.init();
    }

    readData(){
        return $.getJSON("./js/fund.json");
    }

    get investorTotalPage(){
        return ceil(this.investorList.length / this.PAGE_SHOW_CNT);
    }

    addEvent(){
        
        $("nav > li").on("click", this.navClickEventHandler );
        $(".auto_comma").on("input" , this.autoCommaInputEventHandler );
        $("#form_submit_btn").on("click", this.fundRegisterBtnClickEventHandler );
        $(".popup-close").on("click",()=> {this.$popup.fadeOut(); this.drawFund(); } );
        $(".iv_btn").on("click", this.ivBtnClickEventHandler );
        $(".pg_controller").on("click", this.pgControllerBtnClickEventHandler );
        $("#iv_money").on("input", this.ivInputEventHandler );

    }

    ivInputEventHandler = e => {
        let fund = this.datas.find(x=> x.number === $("#iv_number").val() );
        let value = e.currentTarget.value.split(",").join('')*1;
        if(fund.total < value) e.currentTarget.value = fund.total.toLocaleString();
        
    }

    pgControllerBtnClickEventHandler = e => {
        let num = e.currentTarget.dataset.num * 1;
        this.PAGE_NOW += num;
        if(this.PAGE_NOW > this.investorTotalPage ) this.PAGE_NOW = this.investorTotalPage;
        if(this.PAGE_NOW <= 0) this.PAGE_NOW = 1;
        this.renderPaging();
    }

    ivBtnClickEventHandler = e => {
        let num = $("#iv_number").val();
        let name = $("#iv_name").val();
        let money = $("#iv_money").val().split(",").join('') * 1;
        let cvs = document.querySelector("#iv_canvas");
        let sign = cvs.toDataURL();
        let fund = this.datas.find(x=> x.number === num);

        if(name.trim() === "" || money < 1 || !this.signed ){
            alert('누락된 항목이 있습니다.');
            return;
        }
        let find = this.investorList.findIndex(x=> x.name === name && x.num === num );
        if(find === -1) this.investorList.push( { num , name , money , cvs , sign } );
        else {
            this.investorList[find].sign = sign;
            this.investorList[find].money += money;
        }
        alert("투자에 성공하였습니다.");
        fund.current += money;
        $(".popup-close").click();
    }

    fundRegisterBtnClickEventHandler = e => {
        let name = form_name.value;
        let date = form_date.value;
        let total = form_total.value.split(",").join('')*1;
        
        if( name.trim() === "" || date.trim() === "" || total <= 0 ){
            alert("누락된 항목이 있습니다.");
            return;
        }
        let endDate = new Date( date ).toString();
        name = name.replaceAll("/[\\]/g","\\\\");
        let fund =  { number : this.num, name , endDate , total , current : 0 };
        this.datas.push( fund );
        alert("펀드 등록이 완료되었습니다.");
        this.drawForm();
    }

    autoCommaInputEventHandler = e => {

        let value = e.currentTarget.value;
        value = (value.replaceAll(/[^0-9]/g,"")*1).toLocaleString();
        e.currentTarget.value = value;
    }

    navClickEventHandler = e => {

        if(this.isMoving) return;
        let idx = e.currentTarget.dataset.idx * 1;
        if(idx === this.conv_now) return;
        this.$links.eq(this.conv_now).removeClass("nav_now");
        this.$links.eq(idx).addClass("nav_now");
        this.convertPageAndDraw( this.conv_now , idx );
    }

    convertPageAndDraw(preIdx , nextIdx){
        
        this.isMoving = true;
        let dir = preIdx > nextIdx;
        // dir 이 true 이면 올리는 애니메이션, false 면 내리는 애니메이션

        let preTarget = dir ? '100%' : '-100%';
        let nextTarget = dir ? '-100%' : '100%';
        this.$pages.eq(preIdx).animate({ top : preTarget } , 1000);
        $(".page_title").html(this.txtArr[nextIdx]);
        this.$pages.eq(nextIdx).css({ top : nextTarget }).animate({ top : 0 }, 1000 , ()=>{
            this.isMoving = false;
            this.conv_now = nextIdx;
        });
        this.fxArr[nextIdx].bind(this)();
    }

    drawMain(){
        // 메인페이지
        let fundTotal = sum( ...this.datas.map(x=> x.total) ).toLocaleString();
        let ivTotal = sum( ...this.datas.map(x=> x.current) ).toLocaleString();
        let recIv = this.investorList[this.investorList.length-1];
        let recWon = (recIv ? recIv.money : 0).toLocaleString();
        let recPercent = recIv ? recIv.percent : 0;

        $("#main_fund_total").html( fundTotal + "원" );
        $('#main_invest_total').html( ivTotal + "원" );
        $("#main_invest_recent").html(recWon + "원");
        $("#main_invest_recent_txt > span").html(recPercent * 100);
        // log(fundTotal);

        let $tbody = $(".main_table tbody");
        $tbody.empty();
        let list = this.datas
        .map(x=>{
            x.percent = x.current/x.total;
            return x;
        })
        .filter(x=>{
            return new Date(x.endDate) > new Date();
        })
        .sort((a,b)=> b.percent - a.percent)
        .slice(0,4)
        .forEach(fund => {
            let percent = olim( fund.current / fund.total * 100 );
            let tr = document.createElement("tr");
            tr.innerHTML =
            `
            <td title="${ xss(fund.number) }" class="fowe-2">${ xss(fund.number) }</td>
            <td title="${ xss(fund.name) }" class="fowe-2">${ xss(fund.name) }</td>
            <td title="${ fund.total.toLocaleString() }원" class="fowe-2">${ fund.total.toLocaleString() }원</td>
            <td title="${ new Date(fund.endDate).toMyString() }" class="fowe-2">${ new Date(fund.endDate).toMyString() }</td>
            <td class="fowe-2">
                <div class="main_progress">
                    <div class="main_progress_inner gd-r-b">${ percent }%</div>
                </div>
            </td>`;
            log(tr);
            $tbody.append(tr);
            $(tr).find(".main_progress_inner").animate({ width : percent + "%"},1500);
        });
        
        
    }

    drawForm(){
        // 펀드등록
        this.num = this.getFundNum();
        $("#form_number").html(this.num);
        $(".fund_form input").val("");
    }

    drawFund(){
        // 펀드 보기
        let $list = $(".list_inner");
        $list.html("");
        this.datas.reverse().forEach( fund =>{
            let div = document.createElement("div");
            div.classList.add("fund_item");
            let datePass = new Date() > new Date(fund.endDate);
            div.innerHTML = `
            <canvas class="fund_canvas" width="170" height="170"></canvas>
            <p class="fund_item_num fosi-6 fowe-5 color-333 mt-1">${ fund.number }</p>
            <p class="fund_item_name ell color-333" title="${ xss(fund.name) }">${ xss(fund.name) }</p>
            <p class="fosi-4 fund_item_total ell color-666" title="250,000원">모집 금액 : ${ fund.total.toLocaleString() }원</p>
            <p class="fosi-4 fund_item_current ell color-666" title="250,000원">현재 금액 : ${ fund.current.toLocaleString() }원</p>
            <p class="fund_item_date color-999 fosi-3">${ new Date( fund.endDate ).toMyString() } 마감</p>
            <button class="btn ${ datePass ? "btn-n" : "btn-b" } mt-1">${ datePass ? "모집완료" : '투자하기' }</button>
            `;
            //
            $list.append(div);
            this.drawGraph( fund , $(div).find("canvas")[0] );
            $(div).find('button').on('click',()=>{
                if(datePass) return;
                this.showPopup(fund);
            });
        });
        this.datas.reverse();
    }

    showPopup(fund){

        this.$popup.find("input").val("");
        let cvs = document.querySelector("#iv_canvas");
        cvs.getContext("2d").clearRect( 0 , 0 , cvs.width , cvs.height );
        $("#iv_number").val( xss(fund.number) );
        $("#iv_fund_name").val( fund.name ).attr ("title", fund.name );
        this.$popup.fadeIn();
        this.signed = false;

    }

    drawInvestor(){
        // 투자자 목록
        let $list = $(".iv_list");
        $list.html("");
        this.PAGE_NOW = 1;
        this.renderPaging();        
    }

    renderPaging(){

        let $list = $(".pg_btns");
        $list.empty();
        let html  = ``;
        for(let i = 1; i <= this.investorTotalPage; i++) html += `<button data-page="${i}" class="pg_btn pg_btn_normal ${ this.PAGE_NOW === i ? "pg_now" : "" }">${i}</button>`;
        $list.html(html);
        $list.find("button").on("click",(e)=>{
            this.PAGE_NOW = e.currentTarget.dataset.page * 1;
            this.renderPaging();
        });
        let slice_idx = (this.PAGE_NOW - 1)*5;
        let list = this.investorList.reverse().slice( slice_idx , slice_idx+5 );

        $list = $('.iv_list');
        $list.empty();
        $list.hide();
        list.forEach( iv =>{
            let fund = this.datas.find(x=> x.number === iv.num );
            let div = document.createElement("div");
            let percent = olimToPercent( iv.money / fund.total );
            div.classList.add("iv_item");
            div.innerHTML =
            `<div class="iv_item_top tealc">
                <h1 class="color-fff fosi-4 fowe-4 mt-1">${ fund.number }</h1>
                <i class="far fa-user"></i>
            </div>
            <div class="iv_item_body tealc">
                <p class="iv_name ell fosi-5 fowe-4 ell" title="${ xss( iv.name ) }">${ xss(iv.name) }</p>
                <p class="ell color-666 iv_fund_name fosi-3 fowe-3 mt-1" title="${ xss(fund.name) }">펀드명 : ${ xss(fund.name) }</p>
                <p class="ell color-666 iv_money fosi-3 fowe-3" title="${ iv.money.toLocaleString() }원">투자금액 : ${ iv.money.toLocaleString() }원</p>
                <p class="ell color-333 iv_percent fosi-4 fowe-4">지분 : ${percent}%</p>
                <button class="btn btn-b iv_sign_btn mt-1">투자펀드계약서</button>
            </div>
            <div class="iv_item_bottom">
                <div class="iv_item_graph"></div>
            </div>`;
            $list.append(div);
            $(div).find(".iv_item_graph").animate({ width : percent+"%" }, 2000);
            $(div).find(".iv_sign_btn").on('click',(e)=>{
                this.downloadSign( iv , fund );
            });
        }); 
        $list.fadeIn();
        this.investorList.reverse();
    }

    async downloadSign( iv , fund ){
        log('asdf');
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
        ctx.fillText( iv.name , 327 , 264 );
        ctx.fillText( iv.money.toLocaleString() , 327 , 310 );
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

    render(){
        // log(this.datas);
    }

    async init(){
        this.datas = await this.readData();
        this.addEvent();
        this.render();
        this.fxArr[this.conv_now].bind(this)();
    }

    getFundNum(){
        let f = ()=> String.fromCharCode( Math.floor(Math.random() * 26) + 65 );
        let n = (Math.floor(Math.random()*100)).toString().padStart(3,"0");
        return f() + f() + n;
    }

    drawGraph(fund , canvas){

        let ctx = canvas.getContext('2d');
        let term = fund.current / 90;
        let width = canvas.width;
        let height = canvas.height;
        let now = 0;
        let frame = setInterval(() => {

            now += term;
            if(now >= fund.current){
                now = fund.current;
                clearInterval(frame);
            }
            this.drawProcess( ctx , width , height , now , fund.total );
            
        }, 1000/60);
        
    }

    drawProcess( ctx , width , height , now , total ){

        let percent = now / total;
        // log(now/total , percent);
        let radius = width / 2 - 20;
        ctx.clearRect(0,0,width,height);

        ctx.beginPath();
        ctx.moveTo( width/2 , height/2 );
        ctx.arc( width/2 , height/2 , radius , MP , MP + percent * PI * 2 );
        ctx.closePath();
        ctx.fillStyle = "#5f5fff";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo( width/2 , height/2 );
        ctx.arc( width/2 , height/2 , radius - 10 , MP , PI*2 );
        ctx.closePath();
        ctx.fillStyle = "#000e6e";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo( width/2 , height/2 );
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.font = "500 17px noto";
        let txt = olim(percent*100) + "%";
        ctx.fillText( txt , width/2, height/2 );

    }
}

window.addEventListener("load",(e)=>{
    window.app = new App();
    window.swiper = new Swiper();
});


window.sum = function(){
    let sum = 0;
    Array.from(arguments).forEach(x=> sum += x*1);
    return sum;
}


Date.prototype.toMyString = function(){
    return `${this.getFullYear()}년 ${this.getMonth()+1}월 ${this.getDate()}일 ${this.getHours()}시 ${this.getMinutes()}분 ${this.getSeconds()}초`;
}

window.xss = function(str){
    const items = [
        ["&","&amp;"],
        ["<","&lt;"],
        [">","&gt;"],
        ["\n","<br>"],
        ['"','&quot;'],
        ["'","&#39;"]

    ];
    items.forEach(x=>{
        str = str.replaceAll(x[0],x[1]);
    });
    return str;
}

window.olim = function(num){
    return Math.ceil(num * 100) / 100;
}

window.olimToPercent = function(num){
    return Math.ceil(num * 10000) / 100;   
}

window.addEventListener("keydown",(e)=>{
    if(e.keyCode === 9) e.preventDefault();
});