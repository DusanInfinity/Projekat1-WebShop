

export class Proizvod{
    constructor(id, name, price, description, image){
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
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

}