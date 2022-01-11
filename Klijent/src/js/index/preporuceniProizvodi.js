import { Proizvod } from "../proizvod.js";

let kontejner = document.querySelector(".preporuceni-proizvodi");

let preporuceniProizvodi = [
    {
        id: 1,
        name: "Laptop",
        price: "112000 RSD",
        description: "deskripcija",
        image: null
    },
    {
        id: 2,
        name: "TopLap",
        price: "22000 RSD",
        description: "deskripcija",
        image: null
    },
    {
        id: 1,
        name: "Samsung galaxy S10 Ultra",
        price: "132000 RSD",
        description: "deskripcija",
        image: null
    },
    {
        id: 1,
        name: "laptop",
        price: "1000 RSD",
        description: "deskripcija",
        image: null
    },
    {
        id: 1,
        name: "laptop",
        price: "1000 RSD",
        description: "deskripcija",
        image: null
    }
]

if (kontejner != null){
    preporuceniProizvodi.forEach((el, index) => {
        if(index < 5){
            let proizvod = new Proizvod(el.id, el.name, el.price, el.description, el.image);
            proizvod.drawSelf(kontejner);
        }
    });
}




