using Microsoft.AspNetCore.Mvc;
using Neo4j.Driver;
using ServiceStack.Redis;
using System.Net;

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
    }
}
