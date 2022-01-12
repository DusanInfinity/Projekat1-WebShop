import { Proizvod } from "../proizvod.js";

let kontejner = document.querySelector(".najnoviji-proizvodi");

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

if (kontejner != null){
    preporuceniProizvodi.forEach((el, index) => {
        if(index < 5){
            let proizvod = new Proizvod(el.id, el.name, el.price, el.description, el.quantity, el.image);
            proizvod.drawSelf(kontejner);
        }
    });
}




