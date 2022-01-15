import { Proizvod } from "../proizvod.js";

import ApiClient from "../global/apiClient.js";
const api = new ApiClient();

let dodati_proizvodi = JSON.parse(localStorage.getItem("proizvodi_korpa"));

let kontejner = document.querySelector("tbody");

dodati_proizvodi.forEach(async p => {
    let proizvod = await api.produkti.vratiPodatkeProdukta(p.id);
    let proizvod_object = new Proizvod(proizvod.productCode, proizvod.name, proizvod.category, proizvod.price, proizvod.description, proizvod.quantity, proizvod.image);
    proizvod_object.drawSelfKorpa(kontejner, p.kolicina);
});


let btn_prikaz_forme = document.querySelector(".btn-prikazi-formu-porudzbina");
btn_prikaz_forme.addEventListener("click", () => {
    let customer_data = document.querySelector("#customer-data");
    customer_data.style.display = "block";
    btn_prikaz_forme.style.display = "none";
})


let btn_posalji_porudzbinu = document.querySelector(".btn-posalji-porudzbinu");
btn_posalji_porudzbinu.addEventListener("click", async () => {
    let ime = document.querySelector("#customer-ime");
    let prezime = document.querySelector("#customer-prezime");
    let telefon = document.querySelector("#customer-telefon");
    let adresa = document.querySelector("#customer-adresa");

    if(ime.value == ""){
        alert("Niste popunili polje za ime.");
    }

    else if(prezime.value == ""){
        alert("Niste popunili polje za prezime.");
    }

    else if(telefon.value == ""){
        alert("Niste popunili polje za telefon.");
    }

    else if(adresa.value == ""){
        alert("Niste popunili polje za adresu.");
    }

    let naruceni_proizvodi = JSON.parse(localStorage.getItem("proizvodi_korpa"));

    let ordered_products = [];
    naruceni_proizvodi.forEach(p => {
        let obj = {
            productCode: p.id,
            quantity: p.kolicina
        }
        ordered_products.push(obj);
    });


    let customer_order = {
        customerData: {
            firstname: ime.value,
            lastname: prezime.value,
            address: adresa.value,
            phoneNumber: telefon.value,
        },
        orderedProducts: ordered_products
    }

    try{
        api.setHeader('Content-Type', 'application/json');
        await api.shop.kupiProizvode(customer_order);
        alert("Kupovina je uspešno odrađena.");
        localStorage.setItem("proizvodi_korpa", "[]");
        window.location.reload();
    }
    catch(e){
        alert(`Došlo je do greške prilikom izvršenja kupovine. ${e.message}`);
    }
})