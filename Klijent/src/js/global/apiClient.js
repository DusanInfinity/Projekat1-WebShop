import { authHeader } from "./functions.js";
import { HttpClient } from "./httpClient.js";

class ApiClient extends HttpClient {
  constructor(hdrs = authHeader()) {
    super({
      baseURL: 'https://localhost:44329/',
      headers: hdrs
    });
  }

  get produkti() {
      return {
          vratiSveProdukte: () => this.get(`Product/VratiSveProdukte`),
          vratiNajprodavanijeProdukte: () => this.get(`Product/VratiNajprodavanijeProdukte`),
          vratiNajnovijeProdukte: () => this.get(`Product/VratiNajnovijeProdukte`),
          vratiPodatkeProdukta: (productCode) => this.get(`Product/VratiPodatkeProdukta/${productCode}`),
          pretraziProdukte: (tag) => this.get(`Product/PretraziProdukte/${tag}`),
          pretraziProdukteSaViseTagova: (tags) => this.get(`Product/PretraziProdukteSaViseTagova/${tags}`), // Salje se string tags gde su tagovi razdvojeni blanko znakom

          azurirajProdukt: (product) => this.put(`Product/AzurirajProdukt`, product),
          dodajProdukt: (product) => this.post(`Product/DodajProdukt`, product),
          obrisiProdukt: (productCode) => this.delete(`Product/ObrisiProdukt/${productCode}`),
      };
  }

  get komentari() {
      return {
          vratiKomentare: (productCode) => this.get(`Comments/VratiKomentare/${productCode}`),

          dodajKomentar: (comment) => this.post(`Comments/DodajKomentar`, comment),
          obrisiKomentar: (productCode, name, date) => this.delete(`Comments/ObrisiKomentar/${productCode}/${name}/${date}`),
      };
  }

  get shop() {
      return {
          pratiStanjeProizvoda: (productCode, email) => this.put(`Shop/PratiStanjeProizvoda/${productCode}/${email}`),
          kupiProizvode: (order) => this.post(`Shop/KupiProizvode`, order),
      };
  }
}

export default ApiClient;