import { Proizvod } from "../proizvod.js";

import ApiClient from "../global/apiClient.js";
const api = new ApiClient();


let kontejner = document.querySelector(".content-container-proizvod-div");

const url = new URL(document.location.href);
let id = url.searchParams.get("id");
let el = await api.produkti.vratiPodatkeProdukta(id);
let proizvod = new Proizvod(el.productCode, el.name, el.price, el.description, el.quantity, null);

let comments = await api.komentari.vratiKomentare(id);
comments.forEach(el => {
    proizvod.addComment(el);
});


proizvod.drawSelfProfil(kontejner);


let slicni_proizvodi = [
    {
        productCode: 1,
        name: "Laptop",
        price: "112000 RSD",
        quantity: 4,
        description: "deskripcija",
        image: null
    },
    {
        productCode: 2,
        name: "TopLap",
        price: "22000 RSD",
        quantity: 4,
        description: "deskripcija",
        image: null
    },
    {
        productCode: 1,
        name: "Samsung galaxy S10 Ultra",
        price: "132000 RSD",
        quantity: 4,
        description: "deskripcija",
        image: null
    },
    {
        productCode: 1,
        name: "laptop",
        price: "1000 RSD",
        quantity: 4,
        description: "deskripcija",
        image: null
    },
    {
        productCode: 1,
        name: "laptop",
        price: "1000 RSD",
        quantity: 4,
        description: "deskripcija",
        image: null
    }
]

let slicni_proizvodi_kontejner = document.querySelector(".slicni-proizvodi");
if (slicni_proizvodi_kontejner != null){
    slicni_proizvodi.forEach((el, index) => {
        if(index < 5){
            let proizvod = new Proizvod(el.productCode, el.name, el.price, el.description, el.quantity, el.image);
            proizvod.drawSelf(slicni_proizvodi_kontejner);
        }
    });
}






