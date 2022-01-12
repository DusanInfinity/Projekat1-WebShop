import { Proizvod } from "../proizvod.js";

let kontejner = document.querySelector(".content-container-proizvod-div");

const url = new URL(document.location.href);
let id = url.searchParams.get("id");
// fetch proizvoda sa ID koji mu prenesem u API funkciju

let el = {
    id: 2,
    name: "Samsung Galaxy S21 Ultra",
    price: "122000 RSD",
    quantity: 2,
    description: "Najbolji telefon na trzistu danas.",
    image: null,
    comments: [
        {
            name: "Stefan",
            text: "text",
            date: "11.01.2021"
        }
    ]
};


let proizvod = new Proizvod(el.id, el.name, el.price, el.description, el.quantity, null);
el.comments.forEach(el => {
    proizvod.addComment(el);
});

proizvod.drawSelfProfil(kontejner);




let slicni_proizvodi = [
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

let slicni_proizvodi_kontejner = document.querySelector(".slicni-proizvodi");
if (slicni_proizvodi_kontejner != null){
    slicni_proizvodi.forEach((el, index) => {
        if(index < 5){
            let proizvod = new Proizvod(el.id, el.name, el.price, el.description, el.quantity, el.image);
            proizvod.drawSelf(slicni_proizvodi_kontejner);
        }
    });
}




