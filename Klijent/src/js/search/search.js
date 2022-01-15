import { Proizvod } from "../proizvod.js";

import ApiClient from "../global/apiClient.js";
const api = new ApiClient();

let url = new URL(document.location.href);
let value = url.searchParams.get("value");

let puna_lista_proizvoda = [];

if(value.split(" ").length > 1){
    puna_lista_proizvoda = await api.produkti.pretraziProdukteSaViseTagova(value);
}
else{
    puna_lista_proizvoda = await api.produkti.pretraziProdukte(value);
}

let naslov = document.querySelector(".proizvodi-container-hearder-content");
naslov.innerHTML = "Rezultat pretrage";


let lista_proizvoda = puna_lista_proizvoda.sort(function(a, b){
    var nameA = a.name.toUpperCase();
    var nameB = b.name.toUpperCase();
    if (nameA < nameB)
        return -1;
    if (nameA > nameB)
        return 1;
    return 0;
});


function prikaziProizvode() {

    if (lista_proizvoda.length > 0) {
        
        let kontejner = document.querySelector(".proizvodi-container-content");
        lista_proizvoda.forEach(el => {
            let proizvod = new Proizvod(el.productCode, el.name, el.category, el.price, el.description, el.quantity, el.image);
            proizvod.drawSelf(kontejner);
        });
    }


    else {
        let kontejner = document.querySelector(".proizvodi-container-content");
        let div = document.createElement("div");
        div.innerHTML = `Žao nam je. Nema proizvoda u ponudi za datu pretragu "${value.bold()}". Pretražite ponovo!`;
        div.style.fontSize = "30px";
        div.style.margin = "30px 0";
        kontejner.appendChild(div);


        let div_content_container = document.querySelector(".content-container");

        let div_proizvodi_container = document.createElement("div");
        div_proizvodi_container.className = "proizvodi-container preporuceni-proizvodi";
        div_content_container.appendChild(div_proizvodi_container);

        let div_proizvodi_container_header = document.createElement("div");
        div_proizvodi_container_header.className = "proizvodi-container-hearder";
        div_proizvodi_container.appendChild(div_proizvodi_container_header);


        let div_proizvodi_container_hearder_item = document.createElement("div");
        div_proizvodi_container_hearder_item.className = "proizvodi-container-hearder-item";
        div_proizvodi_container_header.appendChild(div_proizvodi_container_hearder_item);

        let div_proizvodi_container_hearder_content = document.createElement("div");
        div_proizvodi_container_hearder_content.className = "proizvodi-container-hearder-content";
        div_proizvodi_container_hearder_content.innerHTML = "Preporučeni proizvodi za vas";
        div_proizvodi_container_header.appendChild(div_proizvodi_container_hearder_content);


        let div_proizvodi_container_content = document.createElement("div");
        div_proizvodi_container_content.className = "proizvodi-container-content";
        div_proizvodi_container.appendChild(div_proizvodi_container_content);


        // TO-DO 
        // fetch preporuceniProizvodi
        let preporuceniProizvodi = [
            {
                id: 1,
                name: "Laptop",
                price: "112000 RSD",
                quantity: 4,
                description: "deskripcija",
                image: null
            },
            {
                id: 2,
                name: "TopLap",
                price: "22000 RSD",
                quantity: 4,
                description: "deskripcija",
                image: null
            },
            {
                id: 1,
                name: "Samsung galaxy S10 Ultra",
                price: "132000 RSD",
                quantity: 4,
                description: "deskripcija",
                image: null
            },
            {
                id: 1,
                name: "laptop",
                price: "1000 RSD",
                quantity: 4,
                description: "deskripcija",
                image: null
            },
            {
                id: 1,
                name: "laptop",
                price: "1000 RSD",
                quantity: 4,
                description: "deskripcija",
                image: null
            }
        ]

        if (kontejner != null) {
            preporuceniProizvodi.forEach((el, index) => {
                if (index < 5) {
                    let proizvod = new Proizvod(el.id, el.name, el.category, el.price, el.description, el.quantity, el.image);
                    proizvod.drawSelf(div_proizvodi_container_content);
                }
            });
        }

    }
}


function obrisiProizvode() {
    let kontejner = document.querySelector(".proizvodi-container-content");
    while (kontejner.firstChild) {
        kontejner.removeChild(kontejner.lastChild);
    }

    let prepProizvodi = document.querySelector(".preporuceni-proizvodi");
    if (prepProizvodi != null){
        prepProizvodi.parentNode.removeChild(prepProizvodi);
    }
}



prikaziProizvode()

let select = document.querySelector(".sortiranje-select");
select.addEventListener("change", () => {
    obrisiProizvode();
    sortiraj(select.value);
    prikaziProizvode();
})



function sortiraj(value){
    if (value == 1){
        lista_proizvoda = lista_proizvoda.sort(function(a, b){
            var nameA = a.name.toUpperCase();
            var nameB = b.name.toUpperCase();
            if (nameA < nameB)
                return -1;
            if (nameA > nameB)
                return 1;
            return 0;
        });
    }
    else if (value == 2){
        lista_proizvoda = lista_proizvoda.sort(function(a, b){
            return a.price - b.price;
        })
    }
    else if (value == 3){
        lista_proizvoda = lista_proizvoda.sort(function(a, b){
            return b.price - a.price;
        })
    }
}



let odCena = document.querySelector(".odCene-filtriranje");
let doCena = document.querySelector(".doCene-filtriranje");

odCena.addEventListener("change", () => {
    filtriraj(odCena.value, doCena.value);
})

doCena.addEventListener("change", () => {
    filtriraj(odCena.value, doCena.value);
})

function filtriraj(odCena, doCena){
    if(odCena == ""){
        odCena = -1;
    }
    if(doCena == ""){
        doCena = Number.MAX_SAFE_INTEGER;
    }
    lista_proizvoda = [];
    puna_lista_proizvoda.forEach(el => {
        if(parseInt(el.price) >= odCena && parseInt(el.price) <= doCena){
            lista_proizvoda.push(el);
        }
    })
    obrisiProizvode();
    prikaziProizvode();
}


