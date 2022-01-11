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


        [HttpGet]
        [Route("VratiKomentare/{productCode}")]
        public async Task<IActionResult> VratiKomentare(int productCode)
        {
            IResultCursor cursor;
            IAsyncSession session = _driver.AsyncSession();
            List<ProductComment> comments = new List<ProductComment>();
            try
            {
                Dictionary<string, object> queryParams = new Dictionary<string, object>()
                {
                    { "productcode", productCode },
                };

                cursor = await session.RunAsync("MATCH (p:Produkt { ProductCode: $productcode }) " +
                                                "MATCH (c:Comment)-[r:COMMENTED]->(p) " +
                                                "RETURN c AS comments", queryParams);

                await cursor.ForEachAsync((r) =>
                {
                    var comment = r["comments"].As<INode>();
                    Dictionary<string, object> dict = comment.Properties.ToDictionary(k => k.Key, v => v.Value);
                    comments.Add(new ProductComment()
                    {
                        ProductCode = productCode,
                        Name = dict["Name"].ToString(),
                        Email = dict["Email"].ToString(),
                        Text = dict["Text"].ToString(),
                        Date = Convert.ToDateTime(dict["Date"]),
                    });
                });
            }
            finally
            {
                await session.CloseAsync();
            }

            return Ok(comments);
        }


        [HttpPost]
        [Route("DodajKomentar")]
        public async Task<IActionResult> DodajProdukt([FromBody] ProductComment comment)
        {
            IResultCursor cursor;
            IAsyncSession session = _driver.AsyncSession();
            bool successful = false;
            try
            {
                Dictionary<string, object> queryParams = new Dictionary<string, object>()
                {
                    { "productcode", comment.ProductCode },
                    { "name", comment.Name },
                    { "email", comment.Email },
                    { "text", comment.Text },
                    { "date", DateTime.Now },
                };

                cursor = await session.RunAsync("MATCH (p:Produkt { ProductCode: $productcode }) " +
                                                "CREATE (c:Comment { Name: $name, Email: $email, Text: $text, Date: $date }) " +
                                                "CREATE (c)-[:COMMENTED]->(p) " +
                                                "RETURN c AS comment", queryParams);
                successful = (await cursor.SingleAsync()).Keys.Contains("comment");
            }
            finally
            {
                await session.CloseAsync();
            }

            if (!successful)
                return BadRequest(new { message = "Doslo je do greske prilikom postavljanja komentara!" });

            return Ok(comment);
        }

        [HttpDelete]
        [Route("ObrisiKomentar")]
        public async Task<IActionResult> ObrisiKomentar([FromBody] ProductComment comment)
        {
            IResultCursor cursor;
            IAsyncSession session = _driver.AsyncSession();
            bool successful = false;
            try
            {
                Dictionary<string, object> queryParams = new Dictionary<string, object>()
                {
                    { "productcode", comment.ProductCode },
                    { "name", comment.Name },
                    { "email", comment.Email },
                    { "text", comment.Text },
                    { "date", comment.Date },
                };

                cursor = await session.RunAsync("MATCH (c:Comment { Name: $name, Email: $email, Text: $text, Date: $date })-[r:COMMENTED]-(p:Produkt { ProductCode: $productcode }) " +
                                                "DELETE r " +
                                                "DETACH DELETE c " +
                                                "RETURN count(c) > 0 AS success", queryParams);

                IRecord record = await cursor.SingleAsync();
                successful = record["success"].As<bool>();
            }
            finally
            {
                await session.CloseAsync();
            }

            if (!successful)
                return BadRequest(new { message = "Doslo je do greske prilikom postavljanja komentara!" });

            return Ok(comment);
        }
    }
}
