import { Proizvod } from "../proizvod.js";


import ApiClient from "../global/apiClient.js";
const api = new ApiClient();

let kontejner = document.querySelector(".najprodavaniji-proizvodi");

let najprodavanijiProizvodi = await api.produkti.vratiNajprodavanijeProdukte();
console.log(najprodavanijiProizvodi);


if (kontejner != null){
    najprodavanijiProizvodi.forEach((el, index) => {
        if(index < 4){
            let proizvod = new Proizvod(el.productCode, el.name, el.price, el.description, el.quantity, el.image);
            proizvod.drawSelf(kontejner);
        }
    });
}




