window.xss = function(str){

    let items = [
        ["&","&amp;"],
        [">","&gt;"],
        ["<","&lt;"]
    ];
    items.forEach(x=>{
        str = str.replaceAll( x[0] , x[1] );
    });
    return str;
}

// let str = `<script>alert('&nbsp;');</script>`;
// document.body.innerHTML = str;

window.onload = () => {
    let str = xss(`<script>alert('&nbsp;');</script>`);
    document.body.innerHTML = str;   
    // script 막기
}