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


        [HttpGet]
        [Route("VratiProdukte/{tag}")]
        public async Task<IActionResult> VratiProdukte(string tag)
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
                                                $"WHERE n.Name =~ $tag OR any(tg in n.Tags WHERE tg =~ $tag) " +
                                                $"RETURN n AS produkti LIMIT 50", new { tag });


                products = await cursor.ToListAsync(record => JsonConvert.DeserializeObject<Product>(JsonConvert.SerializeObject(record["produkti"].As<INode>().Properties)));
            }
            finally
            {
                await session.CloseAsync();
            }

            return Ok(products);
        }

        [HttpGet]
        [Route("VratiProdukteSaViseTagova/{tagsList}")]
        public async Task<IActionResult> VratiProdukteSaViseTagova(string tagsList)
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
                                                $"WHERE any(tg in tagsList WHERE n.Name =~ tg) OR any(tg in n.Tags WHERE any(oneTag in tagsList WHERE tg =~ oneTag)) " +
                                                $"RETURN n AS produkti LIMIT 50", new { tags });


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
            // TO-DO provera da li postoji produkt sa unetom sifrom
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

                cursor = await session.RunAsync("CREATE (n:Produkt {" +
                                                $" ProductCode: $productcode," +
                                                $" Name: $name," +
                                                $" Price: $price," +
                                                $" Quantity: $quantity," +
                                                $" Description: $description," +
                                                $" Image: $image," +
                                                $" Tags: $tags," +
                                                $" Comments: $comments" +
                                                "}) RETURN n AS produkt", queryParams);
                product = await cursor.SingleAsync(record => JsonConvert.DeserializeObject<Product>(JsonConvert.SerializeObject(record["produkt"].As<INode>().Properties)));
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




                cursor = await session.RunAsync("MATCH (n:Produkt { ProductCode: $ProductCode }) SET" +
                                                $" n.Name = $Name," +
                                                $" n.Price = $Price," +
                                                $" n.Quantity = $Quantity," +
                                                $" n.Description = $Description," +
                                                $" n.Image = $Image," +
                                                $" n.Tags = $Tags RETURN n AS produkt", new { newProduct.ProductCode, newProduct.Name, newProduct.Price, newProduct.Quantity, newProduct.Description, newProduct.Image, newProduct.Tags });
                product = await cursor.SingleAsync(record => JsonConvert.DeserializeObject<Product>(JsonConvert.SerializeObject(record["produkt"].As<INode>().Properties)));
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
                cursor = await session.RunAsync("MATCH (n:Produkt { ProductCode: $productCode }) DELETE n RETURN n AS produkt", new { productCode });
            }
            finally
            {
                await session.CloseAsync();
            }

            return Ok(productCode);
        }

    }
}
