

let sidenav = document.querySelector(".sidenav");
let kategorije = ["Telefoni", "Monitori", "Komponente", "Bela tehnika", "Proba"];
kategorije.forEach(el => {
    dodajNavLink(sidenav, el);
});



function dodajNavLink(host, kategorija){
    if(!host)
        throw new Error("Ne postoji host");
    let a = document.createElement("a");
    a.className = "nav-link";
    a.setAttribute('value', `${kategorija.toLowerCase()}`);
    let myUrl = new URL(document.location.href);
    myUrl.pathname = "/kategorija.html";
    myUrl.searchParams.set("kategorija", kategorija);
    a.setAttribute('href', myUrl.href);
    a.innerHTML = kategorija;
    host.appendChild(a);
}



// const myUrl = new URL(document.location.href);
// myUrl.searchParams.set("name", "Stefan");
// console.log(myUrl)
// console.log(myUrl.href)
// console.log(myUrl.searchParams.get("name"))