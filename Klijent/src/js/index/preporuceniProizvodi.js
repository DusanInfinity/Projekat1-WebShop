import { Proizvod } from "../proizvod.js";


import ApiClient from "../global/apiClient.js";
const api = new ApiClient();

let kontejner = document.querySelector(".preporuceni-proizvodi");

let preporuceniProizvodi = await api.produkti.vratiSveProdukte();
console.log(preporuceniProizvodi);


if (kontejner != null){
    preporuceniProizvodi.forEach((el, index) => {
        if(index < 4){
            let proizvod = new Proizvod(el.productCode, el.name, el.price, el.description, el.quantity, el.image);
            proizvod.drawSelf(kontejner);
        }
    });
}




