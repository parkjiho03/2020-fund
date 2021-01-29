const log = console.log;


window.addEventListener("load", () => {
    let app = new App();
});


class App {
    constructor() {
        this.json;
        this.datas = localStorage.datas === undefined ? [] : JSON.parse(localStorage.datas);
        this.users;
        this.user = localStorage.user === undefined ? null : localStorage.user == 'null' ? null : JSON.parse(localStorage.user);
        this.$now_page = $('.main_container .main');
        if (this.user != null) {
            $('.nav > div').eq(4).html("로그아웃");
        }

        // this.$now_page = $('.main_container .login');
        // this.$now_page = $('.main_container .fund_register');
        // this.$now_page = $('.main_container .fund_view');
        // this.$now_page = $('.main_container .investor_list');
        this.$now_page.show();
        this.$now_page.data('idx', 0);
        this.is_moveing = false;
        this.visual_show = true;

        this.$list_box = $('.fund_view .item_list');
        this.$list_box.data("page", 1);

        this.$popup = $('.popup');
        this.canvas = this.$popup.find('canvas')[0];
        this.canvas.width = 590;
        this.canvas.height = 200;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.is_drawing = false;
        this.drawing_ok = false;
        this.preX = -1;
        this.preY = -1;

        this.investor_list = localStorage.investor_list === undefined ? [] : JSON.parse(localStorage.investor_list);;

        this.$tbody = $('tbody');
        this.$tbody.data("page", 1);
        log(this.datas, "여기야야야야야야");
        log(this.user, "여기야야야야야야");
        log(this.investor_list, "여기야야야야야야");
        this.init();

    }


    async init() {
        this.json = await this.getJSON();
        this.users = await this.getUSER();
        if (this.datas.length == 0) {
            this.datas = this.getDatas();
        }

        this.loadMain();
        this.setEvent();
        this.visualAnimation();
    }
    visualAnimation() {
        setInterval(() => {
            if (this.visual_show) {
                $('.main .visual > img').eq(1).fadeOut(1000);
            } else {
                $('.main .visual > img').eq(1).fadeIn(1000);
            }
            this.visual_show = !this.visual_show;
        }, 5000);
    }

    setEvent() {
        //헤더이벤트
        $(document).on("click", ".nav > div", (e) => {
            let idx = e.currentTarget.dataset.idx;
            if ($(e.currentTarget).html() == '로그아웃') {
                alert("성공적으로 로그아웃 됐습니다.");
                this.user = null;
                this.saveLocalData();
                $('.nav > div').eq(4).html("로그인");
                return;
            }
            if (this.is_moveing) return;
            this.is_moveing = true;
            $(".nav > div").removeClass('on');
            $('.nav > div').eq(idx).addClass("on");
            this.movePage(idx);
        });



        //로그인 이벤트 ----------------------------
        $(document).on("click", ".login_btn", () => {
            let id = $('.login_id').val();
            let pass = $('.login_pass').val();
            if (id == "" || pass == "") {
                alert("필수값이 비어있습니다");
                return;
            }
            this.user = this.users.find(x => x.id == id && x.password == pass);
            if (this.user !== undefined) {
                alert("성공적으로 로그인 되었습니다");
                $('.nav > div').eq(4).html("로그아웃");
                $('.nav > div').eq(0).click();
                this.saveLocalData();
            } else {
                alert("아이디 또는 비밀번호가 잘못되었습니다.");
            }
        });




        //로그인 이벤트 ---------------------------- 끝



        //펀드등록 이벤드 ---------------------------
        $(document).on("input", ".reg_money", (e) => {
            let value = e.currentTarget.value;
            value = this.removeComma(value);
            value = (value.replaceAll(/[^0-9]/g, "") * 1).toLocaleString();
            e.currentTarget.value = value;
        });

        $(document).on("click", ".reg_btn", () => {
            let num = $('.reg_num').html();
            let name = $('.reg_name').val();
            let end = $('.reg_end').val();
            let money = $('.reg_money').val();

            if (num == "" || name == "" || end == "" || money == "" || money <= 0) {
                alert("값이 잘못됐거나 값이 비어있습니다");
                return;
            }

            if (this.user == null) {
                alert("로그인한 유저만 이용할 수 있습니다.");
                return;
            }

            end = end.replaceAll("T", " ");
            money = this.removeComma(money) * 1;
            let obj = {
                number: num,
                name: name,
                endDate: end,
                total: money,
                current: 0,
                str_total: money.toLocaleString(),
                str_current: 0,
                percent: this.getPercent(money, 0)
            }
            this.datas.push(obj);
            this.saveLocalData();
            this.loadFundRegister();
            alert("성공적으로 등록되었습니다.");
        });





        //펀드등록 이벤드 -------------------------- 끝



        //펀드보기 이벤트 ----------------------------
        $(document).on('click', ".view_pagination_group > .num", (e) => {
            let page = e.currentTarget.dataset.page;
            if (page == 'no') return;
            this.$list_box.data("page", page);
            this.loadFundView();
        });

        $(document).on("click", ".fund_view .item .view_btn.on", (e) => {
            if (this.user == null) {
                alert("로그인한 유저만 투자할 수 있습니다");
                return;
            }
            let num = e.currentTarget.dataset.num;
            let max = e.currentTarget.dataset.max;
            let fund = this.datas.find(x => x.number == num);
            this.drawing_ok = false;
            this.$popup.find("input").val("");
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.$popup.find('.popup_num').html(fund.number);
            this.$popup.find('.popup_name').val(fund.name);
            this.$popup.find('.popup_user').val(this.user.name);
            this.$popup.find('.popup_user_id').val(this.user.id);
            this.$popup.find(".popup_money").data("max", max);

            this.$popup.fadeIn();
        });


        //펀드보기 이벤트 ---------------------------- 끝

        //팝업 이벤트 ---------------------------------------------
        $(this.canvas).on("mousedown", (e) => {
            let x = e.offsetX;
            let y = e.offsetY;
            this.is_drawing = true;
            this.preX = x;
            this.preY = y;
        });

        $(this.canvas).on("mousemove", (e) => {
            if (!this.is_drawing) return;
            this.drawing_ok = true;
            let x = e.offsetX;
            let y = e.offsetY;
            this.ctx.beginPath();
            this.ctx.moveTo(this.preX, this.preY);
            this.ctx.lineTo(x, y);
            this.ctx.closePath();
            this.ctx.stroke();

            this.preX = x;
            this.preY = y;
        });

        $(this.canvas).on("mouseup", (e) => {
            this.is_drawing = false;
        });

        $(this.canvas).on('mouseover', (e) => {
            let x = e.offsetX;
            let y = e.offsetY;
            this.preX = x;
            this.preY = y;
            this.is_drawing = false;
        });

        this.$popup.on("click", ".close", () => {
            this.$popup.fadeOut();
        });

        this.$popup.on('click', ".popup_btn", (e) => {
            let num = $('.popup_num').html();
            let name = $('.popup_name').val();
            let user = $('.popup_user').val();
            let money = $('.popup_money').val();
            let id = $(".popup_user_id").val();
            if (num == "" || name == "" || user == "" || money == "" || !this.drawing_ok || money <= 0) {
                alert("잘못된 값 또는 값이 비어있습니다.");
                return;
            }

            money = this.removeComma(money) * 1;

            let fund = this.datas.find(x => x.number == num)
            fund.current = (fund.current * 1) + (money * 1);
            fund.str_current = fund.current.toLocaleString();
            fund.percent = this.getPercent(fund.total, fund.current);

            let find_user = this.investor_list.find(x => x.number == num && x.user == user);
            let url = this.canvas.toDataURL();

            if (find_user == undefined) {
                let obj = {
                    number: num,
                    name: name,
                    user: user,
                    id: id,
                    url: url,
                    percent: this.getPercent(fund.total, money),
                    money: money,
                    str_money: money.toLocaleString(),
                    date: new Date()
                }
                this.investor_list.unshift(obj);
            } else {
                find_user.money = (find_user.money * 1) + (money * 1);
                find_user.str_money = find_user.money.toLocaleString();
                find_user.percent = this.getPercent(fund.total, find_user.money);
                find_user.date = new Date();
                find_user.url = url;
            }
            this.$popup.fadeOut();
            this.loadFundView();
            log(this.investor_list);
            this.saveLocalData();

        });

        this.$popup.on('input', ".popup_money", (e) => {
            let value = e.currentTarget.value;
            let max = $(e.currentTarget).data("max") * 1;
            value = this.removeComma(value);
            value = (value.replaceAll(/[^0-9]/g, "") * 1).toLocaleString();
            if (this.removeComma(value) * 1 >= max) {
                value = max;
                value = (value.toString().replaceAll(/[^0-9]/g, "") * 1).toLocaleString();
            }
            e.currentTarget.value = value;
        });



        //팝업 이벤트 --------------------------------------------- 끝


        //목록 이벤트 ------------------------------------
        $(document).on('click', ".in_pagination_group > .num", (e) => {
            let page = e.currentTarget.dataset.page;
            log(page);
            if (page == 'no') return;
            this.$tbody.data("page", page);
            this.loadInvestor();
        });

        $(document).on('click', '.in_btn', (e) => {
            let num = e.currentTarget.dataset.num;
            let user = e.currentTarget.dataset.user;

            let find_user = this.investor_list.find(x => x.number == num && x.user == user);
            let sign = new Image();
            sign.src = find_user.url;
            sign.addEventListener("load", () => {
                let funding_img = new Image();
                funding_img.src = "/images/funding.png";
                funding_img.addEventListener("load", () => {
                    let ca = document.createElement("canvas");
                    ca.width = 793;
                    ca.height = 495;
                    let ct = ca.getContext('2d');
                    ct.drawImage(funding_img, 0, 0);
                    ct.drawImage(sign, 460, 350, 200, 120);
                    ct.fillStyle = "15px noto";
                    ct.fillText(find_user.number, 350, 170);
                    ct.fillText(find_user.name, 350, 220);
                    ct.fillText(find_user.user, 350, 270);
                    ct.fillText(find_user.str_money + "원", 350, 320);
                    let a = document.createElement('a');
                    a.href = ca.toDataURL();
                    a.download = "";
                    a.click();
                });
            });
        });


        //목록 이벤트 ------------------------------------ 끝
    }

    loadMain() {
        //메인로드
        this.sort();
        let view_list = this.datas.filter(x => new Date() < new Date(x.endDate));
        view_list = view_list.slice(0, 4);
        view_list.forEach((item, idx) => {
            $('.main .main_fund_list_box .item').eq(idx).find('.main_percent').html(item.percent + "%");
            $('.main .main_fund_list_box .item').eq(idx).find('.main_name').html(item.name);
            $('.main .main_fund_list_box .item').eq(idx).find('.main_name').attr("title", item.name);
            $('.main .main_fund_list_box .item').eq(idx).find('.main_end').html("모집마감일 - " + item.endDate);
            $('.main .main_fund_list_box .item').eq(idx).find('.main_total').html("현재 모집금액 - " + item.str_current + "원");
        });
        $('.main .text').hide();
        $('.main .item0').css("left", "-300px");
        $('.main .item1').css("left", "-600px");
        $('.main .item3').css("top", "-300px");
        $('.main .item4').css("left", "-600px");
        setTimeout(() => {
            $('.main .text').fadeIn(900);
            $('.main .item0').animate({ "left": "0" }, 900);
            $('.main .item1').animate({ "left": "0" }, 1800);
            $('.main .item3').animate({ "top": "0" }, 900);
            $('.main .item4').animate({ "left": "0" }, 900);
            view_list.forEach((item, idx) => {
                setTimeout(() => {
                    $('.main .main_fund_list_box .item').eq(idx).find('.bar').animate({ "width": item.percent + '%' }, 2000);
                }, 300);
            });

        }, 600);

    }

    loadFundRegister() {
        //등록로드
        let text = this.randomText();
        $('.reg_num').html(text);
        $('.reg_box input').val('');
    }
    loadFundView() {
        //보기로드
        this.sort();
        let page = this.$list_box.data("page");
        this.$list_box.fadeOut(700);
        setTimeout(() => {
            const ITEM_COUNT = 6;
            const BTN_COUNT = 5;

            let total_page = Math.ceil(this.datas.length / ITEM_COUNT);
            total_page = total_page <= 0 ? 1 : total_page;
            let current_block = Math.ceil(page / BTN_COUNT);

            let start = current_block * BTN_COUNT - BTN_COUNT + 1;
            let end = start + BTN_COUNT - 1;
            end = end >= total_page ? total_page : end;

            let prev = start > 1;
            let next = end < total_page;

            let start_idx = (page - 1) * ITEM_COUNT;
            let end_idx = start_idx + ITEM_COUNT;

            log(start_idx, end_idx);
            let view_list = this.datas.slice(start_idx, end_idx);
            let htmlBtns = `<div class="num ${prev ? '' : 'disable'}" data-page="${prev ? start-1 : 'no'}">&lt;</div>`;
            for (let i = start; i <= end; i++) {
                htmlBtns += `<div class="num ${page == i ? 'on' : ''}" data-page="${i}">${i}</div>`;
            }
            htmlBtns += `<div class="num ${next ? '' : 'disable'}" data-page="${next ? end+ 1 : 'no'}">&gt;</div>`;
            $('.view_pagination_group').html(htmlBtns);
            log(view_list);
            this.$list_box.empty();
            view_list.forEach(x => {
                this.$list_box.append(this.makeFundDom(x));
            });
            view_list.forEach((item, idx) => {
                setTimeout(() => {
                    $('.fund_view .item').eq(idx).find('.bar').animate({ "width": item.percent + "%" }, 2000);
                }, 300);
            });
            this.$list_box.fadeIn(300);
        }, 700);
    }
    loadInvestor() {
        //목록로드
        this.investor_sort();
        let page = this.$tbody.data("page");
        this.$tbody.fadeOut(700);
        setTimeout(() => {
            const ITEM_COUNT = 5;
            const BTN_COUNT = 5;

            let total_page = Math.ceil(this.investor_list.length / ITEM_COUNT);
            total_page = total_page <= 0 ? 1 : total_page;
            let current_block = Math.ceil(page / BTN_COUNT);

            let start = current_block * BTN_COUNT - BTN_COUNT + 1;
            let end = start + BTN_COUNT - 1;
            end = end >= total_page ? total_page : end;

            let prev = start > 1;
            let next = end < total_page;

            let start_idx = (page - 1) * ITEM_COUNT;
            let end_idx = start_idx + ITEM_COUNT;

            log(start_idx, end_idx);
            let view_list = this.investor_list.slice(start_idx, end_idx);
            let htmlBtns = `<div class="num ${prev ? '' : 'disable'}" data-page="${prev ? start-1 : 'no'}">&lt;</div>`;
            for (let i = start; i <= end; i++) {
                htmlBtns += `<div class="num ${page == i ? 'on' : ''}" data-page="${i}">${i}</div>`;
            }
            htmlBtns += `<div class="num ${next ? '' : 'disable'}" data-page="${next ? end+ 1 : 'no'}">&gt;</div>`;
            $('.in_pagination_group').html(htmlBtns);
            log(view_list);
            this.$tbody.empty();
            view_list.forEach(x => {
                this.$tbody.append(this.makeInvestorDom(x));
            });
            view_list.forEach((item, idx) => {
                setTimeout(() => {
                    $('tbody tr').eq(idx).find('.bar').animate({ "width": item.percent + "%" }, 2000);
                }, 300);
            });
            this.$tbody.fadeIn(300);
        }, 700);
    }
    loadLogin() {
        //
        $('.login input').val('');
    }

    saveLocalData() {
        log("dasasd");
        localStorage.datas = JSON.stringify(this.datas, null, 0);
        localStorage.investor_list = JSON.stringify(this.investor_list, null, 0);
        localStorage.user = JSON.stringify(this.user, null, 0);
    }

    investor_sort() {
        this.investor_list.sort((a, b) => {
            log(new Date(a.date), new Date(b.date));
            return new Date(a.date) < new Date(b.date) ? 1 : new Date(a.date) > new Date(b.date) ? -1 : 0;
        });
    }

    makeInvestorDom(x) {
        return `
                        <tr>
                            <td class="color_000 fw_500 font_16 text_over" title="${x.number}">${x.number}</td>
                            <td class="color_000 fw_500 font_16 text_over" title="${x.name}">${x.name}</td>
                            <td class="color_000 fw_500 font_16 text_over" title="${x.user}">${x.user}</td>
                            <td class="color_000 fw_500 font_16 text_over" title="${x.id}">${x.id}</td>
                            <td class="color_000 fw_500 font_16 text_over" title="${x.str_money}원">${x.str_money}원</td>
                            <td class="color_000 fw_500 font_16 text_over">
                                ${x.percent}%
                                <div class="bar"></div>
                            </td>
                            <td class="color_000 fw_400 font_14 text_over">
                                <div class="in_btn" data-num="${x.number}" data-user="${x.user}">
                                    투자펀드계약서
                                </div>
                            </td>
                        </tr>
        `
    }

    makeFundDom(x) {
        return `
                    <div class="item">
                        <img src="안진우_제출본/optimize.jpg" alt="">
                        <span class="view_num">${x.number}</span>
                        <div class="color_000 text_over fw_500 font_18 m_t_10" title="${x.name}">${x.name}</div>
                        <div class="text_over view_percent color_blue fw_600 flex flex_a_c font_22" title="${x.percent}&">
                            ${x.percent}%
                            <div class="text_over color_999 fw_400 m_l_10 font_13" title="${x.str_current}원 / ${x.str_total}원">${x.str_current}원 / ${x.str_total}원</div>
                        </div>
                        <div class="text_over color_999 fw_400 font_13 text_over" title="${x.endDate}">
                            <span class="fw_600 color_777">마감일 - </span> ${x.endDate}
                        </div>
                        <div class="flex flex_e">
                            <div class="view_btn ${new Date() < new Date(x.endDate) ? 'on' : ''}" data-max="${x.total - x.current}" data-num="${x.number}">${new Date() < new Date(x.endDate) ? '투자하기' : '모집완료'}</div>
                        </div>
                        <div class="bar"></div>
                    </div>
        `
    }

    randomText() {
        let r = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
        let n = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        return r + n;
    }

    removeComma(str) {
        return str.split(',').join('');
    }

    movePage(next_idx) {
        let next_page = $('.main_container .section').eq(next_idx);
        let now_idx = this.$now_page.data('idx');
        if (next_page != now_idx) {
            let top = this.$now_page.height();
            next_page.show().css("top", top + "px").animate({ "top": 0 }, 800);
            this.$now_page.animate({ "top": -top + "px" }, 800).fadeOut(1);
            setTimeout(() => {
                this.is_moveing = false;
                this.$now_page = next_page;
                this.$now_page.data('idx', next_idx);
            }, 1000);
            if (next_idx == 0) this.loadMain();
            else if (next_idx == 1) this.loadFundRegister();
            else if (next_idx == 2) this.loadFundView();
            else if (next_idx == 3) this.loadInvestor();
            else if (next_idx == 4) this.loadLogin();
        } else {
            this.is_moveing = false;
        }
    }

    sort() {
        this.datas.sort((a, b) => {
            return a.percent < b.percent ? 1 : a.percent > b.percent ? -1 : 0;
        });
    }


    getJSON() {
        return $.ajax('/js/fund.json');
    }

    getUSER() {
        return $.ajax('/js/users.json');
    }

    getDatas() {
        return this.json.map(x => {
            return {
                number: x.number,
                name: x.name,
                endDate: x.endDate,
                total: x.total,
                current: x.current,
                str_total: x.total.toLocaleString(),
                str_current: x.current.toLocaleString(),
                percent: this.getPercent(x.total, x.current)
            }
        });
    }

    getPercent(total, current) {
        return Math.ceil((current / total * 100) * 100) / 100;
    }
}