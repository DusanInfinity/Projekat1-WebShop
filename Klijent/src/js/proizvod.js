export class Proizvod{
    constructor(id, name, price, description, quantity, image){
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.quantity = quantity;
        this.image = '../assets/slika.jpg';
        this.container = null;
        this.comments = [];
    }

    addComment(comment){
        this.comments.push(comment);
    }

    drawSelf(host){
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
        cena.innerHTML = this.price;
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
    

    vratiUrlSaAtributima(){
        let url = new URL(document.location.href);
        url.pathname = "/proizvod.html";
        url.searchParams.set("id", this.id);
        return url.href;
    }


    drawSelfProfil(host){
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
        cena.innerHTML = this.price;
        cena.className = "cena-proizvod-profil";
        div.appendChild(cena);

        let deskripcija = document.createElement("p");
        deskripcija.innerHTML = this.description;
        deskripcija.className = "deskripcija-proizvod-profil";
        div.appendChild(deskripcija);

        let kolicina = document.createElement("label");
        kolicina.className = "kolicina-u-prodavnici";
        div.appendChild(kolicina);
        if(this.quantity > 0){
            kolicina.innerHTML = `Preostala kolicina u prodavnici: ${this.quantity}.`;
            let buttonDodajUKorpu = document.createElement("button");
            buttonDodajUKorpu.className = "button-dodaj-u-korpu";
            buttonDodajUKorpu.innerHTML = "DODAJ U KORPU";
            // <i class="fa fa-shopping-cart"></i>
            let i = document.createElement("i");
            i.className = "fa fa-shopping-cart";
            buttonDodajUKorpu.appendChild(i);
            div.appendChild(buttonDodajUKorpu);
            buttonDodajUKorpu.addEventListener("click", () => {
                let lista_proizvoda = localStorage.getItem("proizvodi_korpa");
                if(lista_proizvoda == null){
                    lista_proizvoda = [];
                }
                else{
                    lista_proizvoda = JSON.parse(lista_proizvoda);
                }

                let novi_proizvod = {
                    id: this.id,
                    kolicina: 1
                }

                let proizvod_postoji = lista_proizvoda.find(el => el.id == this.id);
                if (proizvod_postoji == undefined){
                    proizvod_postoji = novi_proizvod;
                    lista_proizvoda.push(novi_proizvod);
                }
                else if(proizvod_postoji.kolicina < this.quantity){
                    proizvod_postoji.kolicina++;
                }
                localStorage.setItem("proizvodi_korpa", JSON.stringify(lista_proizvoda));
                alert(`Uspešno dodat ${this.name} u korpu. Količina u korpi ${proizvod_postoji.kolicina}`);
            })
        }
        else{
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
            buttonEmail.addEventListener("click", () => {
                
                if(inputEmail.value.length < 1){
                    alert("Niste uneli Email!");
                }
                else{
                    if (this.validateEmail(inputEmail.value)){
                        alert("Primićete Email kada je proizvod na stanju. Hvala na ukazanom poverenju.");
                        // TO-DO
                        // api posalje value inputEmail-a (inputEmail.value);
                    }
                    else{
                        alert("Niste uneli validan Email.")
                    }
                }
            })

        }
    }


    validateEmail(email) 
    {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

}