using Microsoft.AspNetCore.Mvc;
using Neo4j.Driver;
using Newtonsoft.Json;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using WebShop.Data;
using WebShop.Models;

namespace WebShop.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IDriver _driver;
        private readonly RedisClient _redis;
        private static readonly Logging Log = new Logging("ProductController");
        public ProductController(IDriver driver, RedisClient redisClient)
        {
            _driver = driver;
            _redis = redisClient;
        }

        private IPAddress GetUserIP()
        {
            return HttpContext != null ? HttpContext.Connection.RemoteIpAddress : null;
        }

        /* Pretraga svih produkata i eventualno vracanje i svih njihovih veza
         MATCH (p:Produkt) 
         OPTIONAL MATCH (p)-[:TAG]->(t:Tag)
         RETURN p as produkti, collect(t.Name) as Tagovi
         */
        [HttpGet]
        [Route("VratiPodatkeProdukta/{productCode}")]
        public async Task<IActionResult> VratiPodatkeProdukta(int productCode)
        {
            IResultCursor cursor;
            IAsyncSession session = _driver.AsyncSession();
            Product product;
            try
            {
                cursor = await session.RunAsync("MATCH (p:Produkt { ProductCode: $productCode }) " +
                                                "OPTIONAL MATCH (p)-[:TAG]->(t:Tag) " +
                                                "RETURN p as produkti, collect(t.Name) as tagovi ", new { productCode });


                IRecord record = await cursor.SingleAsync();
                product = JsonConvert.DeserializeObject<Product>(JsonConvert.SerializeObject(record["produkti"].As<INode>().Properties));
                List<string> tags = record["tagovi"].As<List<string>>();


            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, $"ProductCode_{productCode}");
                return BadRequest(new { message = "Doslo je do greske prilikom pribavljanja podataka o produktu!" });
            }
            finally
            {
                await session.CloseAsync();
            }

            return Ok(product);
        }


        [HttpGet]
        [Route("PretraziProdukte/{tag}")]
        public async Task<IActionResult> PretraziProdukte(string tag)
        {
            IResultCursor cursor;
            var products = new List<Product>() { };
            IAsyncSession session = _driver.AsyncSession();

            string userIP = GetUserIP().ToString();
            _redis.AddItemToSet("site_visitors", userIP);
            _redis.AddItemToSet($"visitor_{userIP}", tag);
            _redis.Expire($"visitor_{userIP}", 86400 * 3); // 3 dana

            tag = $"(?i).*{tag}.*"; // case-insensitive regex https://community.neo4j.com/t/case-insensitive-query-for-a-user-filter/8793/2
            try
            {
                cursor = await session.RunAsync("MATCH (n:Produkt) " +
                                                $"WHERE n.Name =~ $tag " +
                                                $"RETURN n AS produkti LIMIT 20 " +
                                                $"UNION " +
                                                "MATCH (p:Produkt)-[:TAG]->(t:Tag) WHERE t.Name =~ $tag " +
                                                $"RETURN p AS produkti LIMIT 20 ", new { tag });


                products = await cursor.ToListAsync(record => JsonConvert.DeserializeObject<Product>(JsonConvert.SerializeObject(record["produkti"].As<INode>().Properties)));
            }
            finally
            {
                await session.CloseAsync();
            }

            return Ok(products);
        }

        [HttpGet]
        [Route("PretraziProdukteSaViseTagova/{tagsList}")]
        public async Task<IActionResult> PretraziProdukteSaViseTagova(string tagsList)
        {
            IResultCursor cursor;
            var products = new List<Product>() { };
            IAsyncSession session = _driver.AsyncSession();

            string userIP = GetUserIP().ToString();
            _redis.AddItemToSet("site_visitors", userIP);

            string[] tags = tagsList.Split(" ");
            for (int i = 0; i < tags.Length; i++)
            {
                string tag = tags[i];
                if (i > 0 && !tag.Any(char.IsLetter)) // Ako nema bar jednog slova onda su u pitanju nevalidni znaci ili blanko znaci koji uticu na pretragu
                    continue;
                _redis.AddItemToSet($"visitor_{userIP}", tag);

                tags[i] = $"(?i).*{tag}.*"; // case-insensitive regex https://community.neo4j.com/t/case-insensitive-query-for-a-user-filter/8793/2
            }
            _redis.Expire($"visitor_{userIP}", 86400 * 3); // 3 dana

            try
            {
                cursor = await session.RunAsync("WITH $tags AS tagsList " +
                                                "MATCH (n:Produkt) " +
                                                $"WHERE any(tg in tagsList WHERE n.Name =~ tg) " +
                                                $"RETURN n AS produkti LIMIT 20 " +
                                                $"UNION " +
                                                "MATCH (p:Produkt)-[:TAG]->(t:Tag) WHERE any(tg in $tags WHERE t.Name =~ tg) " +
                                                $"RETURN p AS produkti LIMIT 20 ", new { tags });


                products = await cursor.ToListAsync(record => JsonConvert.DeserializeObject<Product>(JsonConvert.SerializeObject(record["produkti"].As<INode>().Properties)));
            }
            finally
            {
                await session.CloseAsync();
            }

            return Ok(products);
        }

        [HttpPost]
        [Route("DodajProdukt")]
        public async Task<IActionResult> DodajProdukt([FromBody] Product newProduct)
        {
            IResultCursor cursor;
            Product product;
            IAsyncSession session = _driver.AsyncSession();
            try
            {
                Dictionary<string, object> queryParams = new Dictionary<string, object>()
                {
                    { "productcode", newProduct.ProductCode },
                    { "name", newProduct.Name },
                    { "price", newProduct.Price },
                    { "quantity", newProduct.Quantity },
                    { "description", newProduct.Description },
                    { "image", newProduct.Image },
                    { "tags", newProduct.Tags },
                    { "comments", null },
                };

                cursor = await session.RunAsync("MATCH (p:Produkt { ProductCode: $productcode}) " +
                                               "RETURN count(p) > 0 AS alreadyExist", queryParams);

                IRecord record = await cursor.SingleAsync();
                bool alreadyExist = record["alreadyExist"].As<bool>();
                if (alreadyExist)
                    return BadRequest(new { message = "Produkt sa unetim serijskim brojem vec postoji!" });



                cursor = await session.RunAsync("WITH $tags AS tagList " +
                                                "CREATE (n:Produkt {" +
                                                $" ProductCode: $productcode," +
                                                $" Name: $name," +
                                                $" Price: $price," +
                                                $" Quantity: $quantity," +
                                                $" Description: $description," +
                                                $" Image: $image," +
                                                $" Comments: $comments " +
                                                "}) " +
                                                "FOREACH (tg in tagList | " +
                                                "MERGE (t:Tag { Name: tg }) " +
                                                "MERGE (n)-[:TAG]->(t) " +
                                                ")" +
                                                "RETURN n AS produkt", queryParams);
                product = await cursor.SingleAsync(record => JsonConvert.DeserializeObject<Product>(JsonConvert.SerializeObject(record["produkt"].As<INode>().Properties)));
                product.Tags = newProduct.Tags;
            }
            finally
            {
                await session.CloseAsync();
            }

            return Ok(product);
        }

        [HttpPut]
        [Route("AzurirajProdukt")]
        public async Task<IActionResult> AzurirajProdukt([FromBody] Product newProduct)
        {
            IResultCursor cursor;
            Product product;
            IAsyncSession session = _driver.AsyncSession();
            try
            {
                cursor = await session.RunAsync("MATCH (n:Produkt { ProductCode: $ProductCode }) RETURN n AS produkt", new { newProduct.ProductCode });
                product = await cursor.SingleAsync(record => JsonConvert.DeserializeObject<Product>(JsonConvert.SerializeObject(record["produkt"].As<INode>().Properties)));

                if (product.Quantity == 0 && newProduct.Quantity > 0)
                {
                    List<string> emails = _redis.GetAllItemsFromSet($"Followers_{newProduct.ProductCode}").ToList();
                    if (emails.Count > 0)
                    {
                        product.InformFollowersAboutQuantity(newProduct.Quantity, emails);

                        Log.WriteLine($"Emailovi za produkt {newProduct.ProductCode}: {String.Join(", ", emails)}");
                    }
                }



                cursor = await session.RunAsync("WITH $Tags AS tagsList " +
                                                "OPTIONAL MATCH (prod:Produkt { ProductCode: $ProductCode })-[tgdel:TAG]->(tg:Tag) WHERE NOT tg.Name IN tagsList " +
                                                "MATCH (n:Produkt { ProductCode: $ProductCode }) SET" +
                                                $" n.Name = $Name," +
                                                $" n.Price = $Price," +
                                                $" n.Quantity = $Quantity," +
                                                $" n.Description = $Description," +
                                                $" n.Image = $Image " +
                                                "DELETE tgdel " +
                                                "FOREACH (tt in tagsList | " +
                                                "MERGE (t:Tag { Name: tt }) " +
                                                "MERGE (n)-[:TAG]->(t) " +
                                                ")" +
                                                $"RETURN n AS produkt", new { newProduct.ProductCode, newProduct.Name, newProduct.Price, newProduct.Quantity, newProduct.Description, newProduct.Image, newProduct.Tags });
                product = await cursor.SingleAsync(record => JsonConvert.DeserializeObject<Product>(JsonConvert.SerializeObject(record["produkt"].As<INode>().Properties)));
                product.Tags = newProduct.Tags;
            }
            finally
            {
                await session.CloseAsync();
            }

            return Ok(product);
        }

        [HttpDelete]
        [Route("ObrisiProdukt/{productCode}")]
        public async Task<IActionResult> ObrisiProdukt(int productCode)
        {
            IResultCursor cursor;
            IAsyncSession session = _driver.AsyncSession();
            try
            {
                cursor = await session.RunAsync("OPTIONAL MATCH (:Produkt { ProductCode: $productCode })-[tgrel:TAG]->(:Tag) " +
                                                "MATCH (n:Produkt { ProductCode: $productCode }) " +
                                                "DELETE tgrel " +
                                                "DETACH DELETE n " +
                                                "RETURN count(n) > 0 AS success", new { productCode });

                IRecord record = await cursor.SingleAsync();
                bool successful = record["success"].As<bool>();
                if (!successful)
                    return BadRequest(new { message = "Doslo je do greske prilikom brisanja produkta!" });
            }
            finally
            {
                await session.CloseAsync();
            }

            return Ok(productCode);
        }

    }
}
