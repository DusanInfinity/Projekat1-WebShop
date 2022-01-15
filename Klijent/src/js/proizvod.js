import ApiClient from "./global/apiClient.js";
const api = new ApiClient();

export class Proizvod {
    constructor(id, name, price, description, quantity, image) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.quantity = quantity;
        this.image = '../assets/slika.jpg';
        this.container = null;
        this.comments = [];
    }

    addComment(comment) {
        this.comments.push(comment);
    }

    drawSelf(host) {
        if (!host)
            throw new Error("Host nije pronadjen");
        this.container = document.createElement("div");
        host.appendChild(this.container);
        this.container.className = "proizvod";

        let img = document.createElement("img");
        img.src = this.image;
        img.addEventListener("click", () => {
            window.location.href = this.vratiUrlSaAtributima();
        })
        this.container.appendChild(img);

        let ime = document.createElement("label");
        ime.innerHTML = this.name;
        ime.className = "ime-proizvod";
        this.container.appendChild(ime);

        let cena = document.createElement("label");
        cena.innerHTML = `${this.price} RSD`;
        cena.className = "cena-proizvod";
        this.container.appendChild(cena);

        let a = document.createElement("a");
        let i = document.createElement("i");
        i.className = "fa fa-bars";
        a.href = this.vratiUrlSaAtributima();
        a.appendChild(i);
        let span = document.createElement("span");
        span.innerHTML = "Detaljnije";
        a.appendChild(span);
        this.container.appendChild(a);

    }

    vratiUrlSaAtributima() {
        let url = new URL(document.location.href);
        url.pathname = "/proizvod.html";
        url.searchParams.set("id", this.id);
        return url.href;
    }

    drawSelfProfil(host) {
        if (!host)
            throw new Error("Host nije pronadjen");
        this.container = document.createElement("div");
        host.appendChild(this.container);
        this.container.className = "proizvod-profil";

        let img = document.createElement("img");
        img.src = this.image;
        this.container.appendChild(img);

        let div = document.createElement("div");
        div.className = "podaci-proizvod-profil"
        this.container.appendChild(div);

        let ime = document.createElement("label");
        ime.innerHTML = this.name;
        ime.className = "ime-proizvod-profil";
        div.appendChild(ime);

        let cena = document.createElement("label");
        cena.innerHTML = `${this.price} RSD`;
        cena.className = "cena-proizvod-profil";
        div.appendChild(cena);

        let deskripcija = document.createElement("p");
        deskripcija.innerHTML = this.description;
        deskripcija.className = "deskripcija-proizvod-profil";
        div.appendChild(deskripcija);

        let kolicina = document.createElement("label");
        kolicina.className = "kolicina-u-prodavnici";
        div.appendChild(kolicina);
        if (this.quantity > 0) {
            kolicina.innerHTML = `Preostala kolicina u prodavnici: ${this.quantity}.`;
            let buttonDodajUKorpu = document.createElement("button");
            buttonDodajUKorpu.className = "button-dodaj-u-korpu";
            buttonDodajUKorpu.innerHTML = "DODAJ U KORPU";
            let i = document.createElement("i");
            i.className = "fa fa-shopping-cart";
            buttonDodajUKorpu.appendChild(i);
            div.appendChild(buttonDodajUKorpu);
            buttonDodajUKorpu.addEventListener("click", () => {
                let lista_proizvoda = localStorage.getItem("proizvodi_korpa");
                if (lista_proizvoda == null) {
                    lista_proizvoda = [];
                }
                else {
                    lista_proizvoda = JSON.parse(lista_proizvoda);
                }

                let novi_proizvod = {
                    id: this.id,
                    kolicina: 1,
                    cena: this.price
                }

                let proizvod_postoji = lista_proizvoda.find(el => el.id == this.id);
                if (proizvod_postoji == undefined) {
                    proizvod_postoji = novi_proizvod;
                    lista_proizvoda.push(novi_proizvod);
                }
                else if (proizvod_postoji.kolicina < this.quantity) {
                    proizvod_postoji.kolicina++;
                }
                localStorage.setItem("proizvodi_korpa", JSON.stringify(lista_proizvoda));
                alert(`Uspešno dodat ${this.name} u korpu. Količina u korpi ${proizvod_postoji.kolicina}`);
            })
        }
        else {
            kolicina.innerHTML = "Nema na stanju.";
            let emailDiv = document.createElement("div");
            div.appendChild(emailDiv);
            emailDiv.className = "email-div-proizvod";
            let label = document.createElement("label");
            label.innerHTML = "Želite da Vas obavestimo kada je proizvod na stanju? Upišite Vaš email.";
            label.className = "email-labela-proizvod";
            emailDiv.appendChild(label);

            let div_email_content = document.createElement("div");
            emailDiv.appendChild(div_email_content);
            div_email_content.className = "email-content-proizvod";
            let inputEmail = document.createElement("input");
            inputEmail.type = "text";
            inputEmail.className = "input-email-prozivod";
            inputEmail.placeholder = "Vaš email...";
            div_email_content.appendChild(inputEmail);
            let buttonEmail = document.createElement("button");
            buttonEmail.innerHTML = "Pošalji";
            buttonEmail.className = "button-email-proizvod";
            div_email_content.appendChild(buttonEmail);
            buttonEmail.addEventListener("click", async () => {

                if (inputEmail.value.length < 1) {
                    alert("Niste uneli Email!");
                }
                else {
                    if (this.validateEmail(inputEmail.value)) {
                        try{
                            await api.shop.pratiStanjeProizvoda(this.id, inputEmail.value);
                        }
                        catch(e){
                            alert("Došlo je do greške. Pokušajte ponovo");
                        }
                        alert("Primićete Email kada je proizvod na stanju. Hvala na ukazanom poverenju.");
                    }
                    else {
                        alert("Niste uneli validan Email.")
                    }
                }
            })

        }
        this.drawComments(host);
    }

    drawComments(host) {
        if (!host)
            throw new Error("Host ne postoji");
        let div = document.createElement("div");
        host.appendChild(div);
        div.className = "comments-kontejner";

        let naslov_novi_kom_div = document.createElement("div");
        naslov_novi_kom_div.className = "naslov-novi-kom-div";
        div.appendChild(naslov_novi_kom_div);

        let naslov = document.createElement("p");
        naslov.className = "comments-naslov";
        naslov.innerHTML = this.name + " komentari";
        naslov_novi_kom_div.appendChild(naslov);

        let btnDodajKomentar = document.createElement("button");
        naslov_novi_kom_div.appendChild(btnDodajKomentar);
        btnDodajKomentar.className = "btn-dodaj-komentar";
        btnDodajKomentar.innerHTML = "Želite da ostavite komentar?";
        btnDodajKomentar.addEventListener("click", () => {
            let novi_komentar_div = document.createElement("div");
            novi_komentar_div.className = "novi-komentar-div";
            naslov_novi_kom_div.appendChild(novi_komentar_div);

            let ime_email_div = document.createElement("div");
            ime_email_div.className = "ime-email-div";
            novi_komentar_div.appendChild(ime_email_div);

            let div_ime = document.createElement("div");
            ime_email_div.appendChild(div_ime);
            div_ime.className = "novi-komentar-div-ime";
            let label = document.createElement("label");
            label.innerHTML = "Ime";
            div_ime.appendChild(label);
            let input_ime = document.createElement("input");
            input_ime.className = "novi-komentar-ime";
            input_ime.type = "text";
            div_ime.appendChild(input_ime);

            let div_email = document.createElement("div");
            ime_email_div.appendChild(div_email);
            div_email.className = "novi-komentar-div-email";
            label = document.createElement("label");
            label.innerHTML = "Email";
            div_email.appendChild(label);
            let input_email = document.createElement("input");
            input_email.className = "novi-komentar-email";
            input_email.type = "text";
            div_email.appendChild(input_email);


            let div_text = document.createElement("div");
            novi_komentar_div.appendChild(div_text);
            div_text.className = "novi-komentar-div-text";
            label = document.createElement("label");
            label.innerHTML = "Komentar";
            div_text.appendChild(label);
            let input_text = document.createElement("textarea");
            input_text.className = "novi-komentar-text";
            div_text.appendChild(input_text);


            let div_buttons = document.createElement("div");
            novi_komentar_div.appendChild(div_buttons);
            div_buttons.className = "novi-komentar-buttons-div";
            let posaljiKomentarBtn = document.createElement("button");
            posaljiKomentarBtn.className = "posalji-komentar-button";
            posaljiKomentarBtn.innerHTML = "Pošalji komentar";
            div_buttons.appendChild(posaljiKomentarBtn);
            posaljiKomentarBtn.addEventListener("click", async () => {
                let novi_komentar = {
                    productCode: this.id,
                    name: input_ime.value,
                    email: input_email.value,
                    text: input_text.value,
                    date: new Date().toJSON()
                }
            
                try{
                    api.setHeader('Content-Type', 'application/json');
                    await api.komentari.dodajKomentar(novi_komentar);
                    alert(`Komentar je uspesno dodat`);
                    window.location.reload();
                }
                catch(e){
                    alert(`Doslo je do greske prilikom postavljanja komentara. ${e.message}.`);
                }
            })

            let zatvoriBtn = document.createElement("button");
            zatvoriBtn.className = "zatvori-komentar-button";
            zatvoriBtn.innerHTML = "Zatvori";
            zatvoriBtn.addEventListener("click", () => {
                novi_komentar_div.innerHTML = "";
                naslov_novi_kom_div.removeChild(novi_komentar_div);
                btnDodajKomentar.style.display = "block";
            })
            div_buttons.appendChild(zatvoriBtn);

            btnDodajKomentar.style.display = "none";
        });


        let komentari_div = document.createElement("div");
        komentari_div.className = "komentari_div";
        div.appendChild(komentari_div);


        this.comments.forEach(el => {
            this.drawComment(komentari_div, el.name, el.text, el.date);
        });

        if (this.comments.length == 0) {
            let lab = document.createElement("p");
            lab.innerHTML = "Nema komentara za ovaj proizvod";
            komentari_div.appendChild(lab);
            lab.style.textAlign = "center";
            lab.style.borderTop = "1px solid gray";
            lab.style.width = "100%";
            lab.style.margin = "10px 10px";
            komentari_div.style.display = "flex";
            komentari_div.style.justifyContent = "center";
        }
    }

    drawComment(host, name, text, date) {
        if (!host) {
            throw new Error("Host ne postoji");
        }
        let div = document.createElement("div");
        div.className = "comment-div col-md-10";
        host.appendChild(div);

        let sadrzaj = document.createElement("p");
        div.appendChild(sadrzaj);
        sadrzaj.innerHTML = text;
        sadrzaj.className = "comment-text";


        let ime = document.createElement("p");
        div.appendChild(ime);
        ime.innerHTML = `${name} ${this.prebaciVreme(date)}`;
        ime.className = "comment-name";
    }

    prebaciVreme(vreme){
        //2021-06-02T16:44:08
        let vremeLista = vreme.toString().split("T");
        vremeLista[0] = vremeLista[0].split("-").reverse().join(".");
        return vremeLista[0]
    }

    validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    updateUkupnuCenu(){

        let ukupno_cena = document.querySelector(".ukupna-cena-korpe");
        let ukupno_cena_za_uplatu = document.querySelector(".ukupna-cena-za-uplatu-korpe");
        let lista_proizvoda = JSON.parse(localStorage.getItem("proizvodi_korpa"));
        let cena = 0;
        lista_proizvoda.forEach(el => {
            cena += parseInt(el.cena) * el.kolicina;
        });

        ukupno_cena.innerHTML = `${cena} RSD`;
        ukupno_cena_za_uplatu.innerHTML = `${cena} RSD`;
    }

    drawSelfKorpa(host, porucenaKolicina) {
        if(!host)
            throw new Error("Host nije pronadjen");

        let tr = document.createElement("tr");
        host.appendChild(tr);
        this.container = tr;

        let td = document.createElement("td");
        tr.appendChild(td);
        td.className = "a-center";
        let a = document.createElement("a");
        a.href = "#";
        a.style.color = "#333";
        a.style.textDecoration = "none";
        td.appendChild(a);
        let i = document.createElement("i");
        i.className = "fa fa-trash";
        a.appendChild(i);
        a.addEventListener("click", () => {
            let lista_proizvoda = JSON.parse(localStorage.getItem("proizvodi_korpa"));
            let p = lista_proizvoda.find(el => el.id == this.id);
            let index = lista_proizvoda.indexOf(p);
            lista_proizvoda.splice(index, 1);
            localStorage.setItem("proizvodi_korpa", JSON.stringify(lista_proizvoda));
            this.container.parentNode.removeChild(this.container);
            this.updateUkupnuCenu();
        })

        td = document.createElement("td");
        tr.appendChild(td);
        td.className = "a-center";
        let img = document.createElement("img");
        img.src = "../assets/slika.jpg";
        img.width = "90";
        td.appendChild(img);

        td = document.createElement("td");
        tr.appendChild(td);
        let span = document.createElement("span");
        span.innerHTML = this.name;
        td.appendChild(span);

        td = document.createElement("td");
        tr.appendChild(td);
        td.className = "a-center";
        span = document.createElement("span");
        td.appendChild(span);
        span.className = "price";
        span.innerHTML = `${this.price}`;

        td = document.createElement("td");
        tr.appendChild(td);
        td.className = "a-center";
        let div = document.createElement("div");
        td.appendChild(div);
        div.className = "kolicina-input-div";
        let input = document.createElement("input");
        div.appendChild(input);
        input.value = porucenaKolicina;
        input.disabled = true;
        input.className = "kolicina-input";
        input.size = "4";

        span = document.createElement("span");
        div.appendChild(span);
        span.className = "buttons-span";
        let button_plus = document.createElement("button");
        span.appendChild(button_plus);
        button_plus.className = "button-plus";
        button_plus.innerHTML = "+";
        button_plus.addEventListener("click", () => {
            let dodati_proizvodi = JSON.parse(localStorage.getItem("proizvodi_korpa"));
            let proizvod_pronadjen = dodati_proizvodi.find(el => el.id == this.id);
            if(proizvod_pronadjen.kolicina < this.quantity){
                proizvod_pronadjen.kolicina++;
                input.value = proizvod_pronadjen.kolicina;
                localStorage.setItem("proizvodi_korpa", JSON.stringify(dodati_proizvodi));
                this.updateUkupnuCenu();
                
                ukupna_cena_proizvoda.innerHTML = `${parseInt(this.price) * input.value} RSD`;
            }
            else{
                alert("Nema dovoljne količine proizvoda za poručivanje plus");
            }
        })

        let button_minus = document.createElement("button");
        span.appendChild(button_minus);
        button_minus.className = "button-minus";
        button_minus.innerHTML = "-";
        button_minus.addEventListener("click", () => {
            let dodati_proizvodi = JSON.parse(localStorage.getItem("proizvodi_korpa"));
            let proizvod_pronadjen = dodati_proizvodi.find(el => el.id == this.id);
            if(proizvod_pronadjen.kolicina > 0){
                proizvod_pronadjen.kolicina--;
                input.value = proizvod_pronadjen.kolicina;
                localStorage.setItem("proizvodi_korpa", JSON.stringify(dodati_proizvodi));
                this.updateUkupnuCenu();
                
                ukupna_cena_proizvoda.innerHTML = `${parseInt(this.price) * input.value} RSD`;
            }
            else{
                alert("Ne možete smanjiti količinu proizvoda ispod 0");
            }
        })

        td = document.createElement("td");
        tr.appendChild(td);
        td.className = "a-center";
        var ukupna_cena_proizvoda = document.createElement("span");
        td.appendChild(ukupna_cena_proizvoda);
        ukupna_cena_proizvoda.className = "price ukupna-cena-za-jedan-proizvod";
        ukupna_cena_proizvoda.innerHTML = `${parseInt(this.price) * porucenaKolicina} RSD`;
        this.updateUkupnuCenu();
    }

    drawSelfAdmin(host){
        if(!host)
            throw new Error("Host nije pronadjen");
        this.container = document.createElement("div");
        this.container.className = "proizvod-admin-div";
        host.appendChild(this.container);

        let img = document.createElement("img");
        img.src = "../assets/slika.jpg";
        img.width = "100";
        this.container.appendChild(img);

        let span = document.createElement("span");
        span.className = "proizvod-admin-ime";
        span.innerHTML = this.name;
        this.container.appendChild(span);

        let div = document.createElement("div");
        div.className = "proizvod-admin-buttons-div";
        this.container.appendChild(div);

        let btn_izmeni = document.createElement("button");
        btn_izmeni.className = "btn-izmeni-proizvod";
        btn_izmeni.innerHTML = "Izmeni proizvod";
        btn_izmeni.setAttribute("data-bs-toggle", "modal");
        btn_izmeni.setAttribute("data-bs-target", "#exampleModalIzmena");
        btn_izmeni.addEventListener("click", async () => {
            let ime = document.querySelector(".product-izmeni-ime");
            let cena = document.querySelector(".product-izmeni-cena");
            let kolicina = document.querySelector(".product-izmeni-kolicina");
            let opis = document.querySelector(".product-izmeni-opis");

            ime.value = this.name;
            cena.value = this.price;
            kolicina.value = this.quantity;
            opis.value = this.description;
            sessionStorage.setItem("product_za_izmenu", this.id);


            let komentari_div = document.querySelector(".komentari-div");
            komentari_div.innerHTML = "";

            let comments = await api.komentari.vratiKomentare(this.id);
            comments.forEach(kom => {
                
                let komentar_div = document.createElement("div");
                komentar_div.className = "komentar_div d-flex flex-row justify-content-between";
                komentari_div.appendChild(komentar_div);

                let button_div = document.createElement("div");
                button_div.className = "col-md-2 d-flex  align-items-center justify-content-center";
                komentar_div.appendChild(button_div);

                let a = document.createElement("a");
                a.href = "#";
                a.style.color = "#333";
                a.style.textDecoration = "none";
                button_div.appendChild(a);
                let i = document.createElement("i");
                i.className = "fa fa-trash";
                a.appendChild(i);
                a.addEventListener("click", async () => {
                    try{

                        await api.komentari.obrisiKomentar(this.id, kom.name, kom.date);
                        komentari_div.removeChild(komentar_div);
                        alert("Komentar uspešno obrisan.")
                    }
                    catch(e){
                        alert(`Došlo je do greške prilikom brisanja komentara. ${e.message}`);
                    }
                })

                this.drawComment(komentar_div, kom.name, kom.text, kom.date);
            });
        })
        div.appendChild(btn_izmeni);


        let btn_obrisi = document.createElement("button");
        btn_obrisi.className = "btn-obrisi-proizvod";
        btn_obrisi.innerHTML = "Obriši proizvod";
        btn_obrisi.setAttribute("data-bs-toggle", "modal");
        btn_obrisi.setAttribute("data-bs-target", "#exampleModalBrisanje");
        btn_obrisi.addEventListener("click", () => {
            sessionStorage.setItem("product_za_brisanje", this.id);
        })
        div.appendChild(btn_obrisi);

    }
}