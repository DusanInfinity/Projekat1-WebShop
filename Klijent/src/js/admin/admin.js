import { Proizvod } from "../proizvod.js";
import ApiClient from "../global/apiClient.js";
const api = new ApiClient();

let proizvodi = await api.produkti.vratiSveProdukte();

let kontejner = document.querySelector(".proizvod-admin-container");

proizvodi.forEach(p => {
    let proizvod = new Proizvod(p.productCode, p.name, p.category, p.price, p.description, p.quantity, p.image);
    proizvod.drawSelfAdmin(kontejner);
});



let dugme_dodaj_proizvod = document.querySelector(".btn-dodaj-proizvod");
dugme_dodaj_proizvod.addEventListener("click", async () => {
    let id = document.querySelector(".product-id");
    let ime = document.querySelector(".product-ime");
    let kategorija = document.querySelector(".product-kategorija");
    let cena = document.querySelector(".product-cena");
    let kolicina = document.querySelector(".product-kolicina");
    let tags = document.querySelector(".product-tags");
    let opis = document.querySelector(".product-opis");

    if (id.value == ""){
        alert("Niste uneli id proizvoda.");
    }
    else if (ime.value == ""){
        alert("Niste uneli ime proizvoda.");
    }
    else if (kategorija.value == ""){
        alert("Niste uneli kategoriju proizvoda.");
    }
    else if (cena.value == ""){
        alert("Niste uneli cenu proizvoda.");
    }
    else if (kolicina.value == ""){
        alert("Niste uneli kolicinu proizvoda.");
    }
    else if (tags.value == ""){
        alert("Niste uneli tagove proizvoda.");
    }
    else if (opis.value == ""){
        alert("Niste uneli opis proizvoda.");
    }

    let novi_proizvod = {
        productCode: parseInt(id.value),
        name: ime.value,
        category: kategorija.value,
        price: parseInt(cena.value),
        description: opis.value,
        quantity: parseInt(kolicina.value),
        image: "default.jpg",
        tags: tags.value.split(" "),
        comments: null
    }

    try{
        api.setHeader('Content-Type', 'application/json');
        await api.produkti.dodajProdukt(novi_proizvod);
        alert(`Proizvod ${ime.value} je uspe??no dodat.`);
        window.location.reload();
    }
    catch(e){
        alert(`Do??lo je do gre??ke prlikom dodavanja proizvoda. ${e.message}\n Postavite drugi ID proizvoda, une??eni ID je mo??da zauzet`);
    }
})



let btn_izmeni_proizvod = document.querySelector(".btn-sacuvaj-izmene-proizvod");
btn_izmeni_proizvod.addEventListener("click", async () => {
    let id = sessionStorage.getItem("product_za_izmenu");
    let ime = document.querySelector(".product-izmeni-ime");
    let cena = document.querySelector(".product-izmeni-cena");
    let kolicina = document.querySelector(".product-izmeni-kolicina");
    let opis = document.querySelector(".product-izmeni-opis");

    if (ime.value == ""){
        alert("Niste uneli ime proizvoda.");
    }
    if (cena.value == ""){
        alert("Niste uneli cenu proizvoda.");
    }
    if (kolicina.value == ""){
        alert("Niste uneli kolicinu proizvoda.");
    }
    if (opis.value == ""){
        alert("Niste uneli opis proizvoda.");
    }

    let izmenjeni_proizvod = {
        productCode: parseInt(id),
        name: ime.value,
        price: parseInt(cena.value),
        description: opis.value,
        quantity: parseInt(kolicina.value),
        image: null,
        tags: null,
        comments: null
    }

    try{
        api.setHeader('Content-Type', 'application/json');
        await api.produkti.azurirajProdukt(izmenjeni_proizvod);
        alert(`Proizvod ${ime.value} je uspe??no izmenjen.`);
        window.location.reload();
    }
    catch(e){
        alert(`Do??lo je do gre??ke prlikom izmene proizvoda. ${e.message}`);
    }
})


let btn_potvrdi_brisanje = document.querySelector(".btn-potvrdi-brisanje-proizvoda");
btn_potvrdi_brisanje.addEventListener("click", async () => {
    let id = sessionStorage.getItem("product_za_brisanje");

    try{
        api.setHeader('Content-Type', 'application/json');
        await api.produkti.obrisiProdukt(parseInt(id));
        window.location.reload();
    }
    catch(e){
        alert("Do??lo je do gre??ke prilikom brisanja proizvoda.");
    }

})