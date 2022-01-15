import { Proizvod } from "../proizvod.js";

import ApiClient from "../global/apiClient.js";
const api = new ApiClient();


let kontejner = document.querySelector(".content-container-proizvod-div");

const url = new URL(document.location.href);
let id = url.searchParams.get("id");
let el = await api.produkti.vratiPodatkeProdukta(id);
let proizvod = new Proizvod(el.productCode, el.name, el.category, el.price, el.description, el.quantity, null);

let comments = await api.komentari.vratiKomentare(id);
comments.forEach(el => {
    proizvod.addComment(el);
});


proizvod.drawSelfProfil(kontejner);


let slicni_proizvodi = await api.produkti.vratiProdukteIzKategorije(proizvod.category);
let ovaj_proizvod = slicni_proizvodi.find(p => p.productCode == proizvod.id);

var index = slicni_proizvodi.indexOf(ovaj_proizvod);
if(index !== -1){
    slicni_proizvodi.splice(index, 1);
}

let slicni_proizvodi_kontejner = document.querySelector(".slicni-proizvodi");
if (slicni_proizvodi_kontejner != null){
    slicni_proizvodi.forEach((el, index) => {
        if(index < 5){
            let proizvod = new Proizvod(el.productCode, el.name, el.category, el.price, el.description, el.quantity, el.image);
            proizvod.drawSelf(slicni_proizvodi_kontejner);
        }
    });
}






