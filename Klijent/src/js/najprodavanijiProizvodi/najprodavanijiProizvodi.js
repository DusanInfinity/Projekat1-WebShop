import { Proizvod } from "../proizvod.js";


import ApiClient from "../global/apiClient.js";
const api = new ApiClient();

let najprodavanijiProizvodi = await api.produkti.vratiNajprodavanijeProdukte();
console.log(najprodavanijiProizvodi);


let kontejner = document.querySelector(".najprodavaniji-proizvodi");


// Ovde ide pull najprodavanijih proizvoda
// moze tipa 10 najprodavanijih proizvoda da ispise


if (kontejner != null){
    najprodavanijiProizvodi.forEach(el => {
        let proizvod = new Proizvod(el.productCode, el.name, el.price, el.description, el.quantity, el.image);
        proizvod.drawSelf(kontejner);
    });
}




