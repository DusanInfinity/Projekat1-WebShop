import { Proizvod } from "../proizvod.js";


import ApiClient from "../global/apiClient.js";
const api = new ApiClient();


let najnovijiProizvodi = await api.produkti.vratiNajnovijeProdukte();
console.log(najnovijiProizvodi);

let kontejner = document.querySelector(".najnoviji-proizvodi");


// Ovde ide pull najprodavanijih proizvoda
// moze tipa 10 najprodavanijih proizvoda da ispise


if (kontejner != null){
    najnovijiProizvodi.forEach(el => {
        let proizvod = new Proizvod(el.productCode, el.name, el.category, el.price, el.description, el.quantity, el.image);
        proizvod.drawSelf(kontejner);
    });
}




