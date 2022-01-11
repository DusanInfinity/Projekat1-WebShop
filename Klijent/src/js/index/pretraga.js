
let dugme = document.querySelector(".button-search");
dugme.addEventListener("click", () => {
    let input = document.querySelector("#pretragaInput");
    if (input.value !== ""){
        let myUrl = new URL(document.location.href);
        myUrl.pathname = "/search.html";
        myUrl.searchParams.set("value", input.value);
        document.location.href = myUrl.href;
    }
    else{
        alert("Niste uneli parametre za pretragu!");
    }
})


