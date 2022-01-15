import {Proizvod} from "../proizvod.js";


import ApiClient from "../global/apiClient.js";
const api = new ApiClient();

let url = new URL(document.location.href);
let kategorija = url.searchParams.get("kategorija");

let naslov = document.querySelector(".proizvodi-container-hearder-content");
naslov.innerHTML = kategorija;

let lista_proizvoda = await api.produkti.vratiProdukteIzKategorije(kategorija);



let kontejner = document.querySelector(".proizvodi-container-content");
lista_proizvoda.forEach(el => {
    let proizvod = new Proizvod(el.productCode, el.name, el.category, el.price, el.description, el.quantity, el.image);
    proizvod.drawSelf(kontejner);
});
