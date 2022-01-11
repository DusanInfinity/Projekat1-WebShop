import {Proizvod} from "../proizvod.js";

let url = new URL(document.location.href);
let kategorija = url.searchParams.get("kategorija");

let naslov = document.querySelector(".proizvodi-container-hearder-content");
naslov.innerHTML = kategorija;


// fetch svih proizvoda
let lista_proizvoda = [
    {
        id: 1,
        name: "Poco x3 pro",
        price: "112000 RSD",
        description: "deskripcija",
        image: null
    },
    {
        id: 2,
        name: "Nokia",
        price: "22000 RSD",
        description: "deskripcija",
        image: null
    },
    {
        id: 3,
        name: "Samsung galaxy S10 Ultra",
        price: "132000 RSD",
        description: "deskripcija",
        image: null
    },
    {
        id: 4,
        name: "Huawei",
        price: "12312 RSD",
        description: "deskripcija",
        image: null
    }
]



let kontejner = document.querySelector(".proizvodi-container-content");
lista_proizvoda.forEach(el => {
    let proizvod = new Proizvod(el.id, el.name, el.price, el.description, el.image);
    proizvod.drawSelf(kontejner);
});
