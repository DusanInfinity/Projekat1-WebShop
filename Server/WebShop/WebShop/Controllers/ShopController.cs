using Microsoft.AspNetCore.Mvc;
using Neo4j.Driver;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using WebShop.Models;

namespace WebShop.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ShopController : ControllerBase
    {
        private readonly IDriver _driver;
        private readonly RedisClient _redis;
        public ShopController(IDriver driver, RedisClient redisClient)
        {
            _driver = driver;
            _redis = redisClient;
        }

        private IPAddress GetUserIP()
        {
            return HttpContext != null ? HttpContext.Connection.RemoteIpAddress : null;
        }

        [HttpPut]
        [Route("PratiStanjeProizvoda/{productCode}/{email}")]
        public IActionResult PratiStanjeProizvoda(int productCode, string email)
        {
            _redis.AddItemToSet($"Followers_{productCode}", email);
            _redis.Expire($"Followers_{productCode}", 86400 * 10); // 10 dana

            return Ok(productCode);
        }

        [HttpPost]
        [Route("KupiProizvode")]
        public async Task<IActionResult> KupiProizvode([FromBody] Order order)
        {
            IResultCursor cursor;
            IAsyncSession session = _driver.AsyncSession();
            bool successfulOrder = false;
            try
            {
                Dictionary<string, object> queryParams = new Dictionary<string, object>()
                {
                    { "cname", order.CustomerData.Firstname + " " + order.CustomerData.Lastname},
                    { "address", order.CustomerData.Address },
                    { "phoneNum", order.CustomerData.PhoneNumber },
                    { "date", DateTime.Now },
                };

                foreach (var p in order.OrderedProducts)
                {
                    Dictionary<string, object> additionalParams = new Dictionary<string, object>()
                    {
                         { "productCode", p.ProductCode },
                         { "quantity", p.Quantity },
                    };
                    additionalParams = additionalParams.Concat(queryParams).ToDictionary(x => x.Key, x => x.Value);

                    cursor = await session.RunAsync("MATCH (prod:Produkt { ProductCode: $productCode }) " +
                                                    "MERGE (o:Order { CustomerName: $cname, Address: $address, PhoneNum: $phoneNum, " +
                                                    "Date: $date }) " +
                                                    "CREATE (op:OrderedProduct { Quantity: $quantity } " +
                                                    "CREATE (op)-[:IS]->(prod) " +
                                                    "MERGE (o)-[:INCLUDE]->(op) " +
                                                    "RETURN o as CreatedOrder", additionalParams);
                    successfulOrder = (await cursor.SingleAsync()).Keys.Contains("CreatedOrder");


                    // Brisanje porudzbine datog korisnika:
                    /*
                    MATCH (o:Order { CustomerName: "Dusan Anticc"})-[r:INCLUDE]-(op)-[rr:IS]-(p)
                    DELETE r
                    DETACH DELETE o
                    DELETE rr
                    DETACH DELETE op
                    */
                }
            }
            finally
            {
                await session.CloseAsync();
            }

            if (!successfulOrder)
                return BadRequest(new { message = "Doslo je do greske prilikom narucivanja proizvoda!" });

            return Ok(order);
        }
    }
}
