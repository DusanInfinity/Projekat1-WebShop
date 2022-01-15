import { Proizvod } from "../proizvod.js";

import ApiClient from "../global/apiClient.js";
const api = new ApiClient();

let najnovijiProizvodi = await api.produkti.vratiNajnovijeProdukte();
console.log(najnovijiProizvodi);

let kontejner = document.querySelector(".najnoviji-proizvodi");

if (kontejner != null){
    najnovijiProizvodi.forEach((el, index) => {
        if(index < 4){
            let proizvod = new Proizvod(el.productCode, el.name, el.category, el.price, el.description, el.quantity, el.image);
            proizvod.drawSelf(kontejner);
        }
    });
}




