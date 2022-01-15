

let sidenav = document.querySelector(".sidenav");

let kategorije = ["Telefoni", "TV", "Monitori", "Računari", "Oprema za računare"];
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


