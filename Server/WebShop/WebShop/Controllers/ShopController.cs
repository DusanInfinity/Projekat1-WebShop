using Microsoft.AspNetCore.Mvc;
using Neo4j.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebShop.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ShopController : ControllerBase
    {
        private readonly IDriver _driver;

        public ShopController(IDriver driver)
        {
            _driver = driver;
        }

        [HttpGet]
        [Route("VratiGodineOsoba")]
        public async Task<IActionResult> GetPersonsAges()
        {
            IResultCursor cursor;
            var ages = new List<int>() { 1 };
            IAsyncSession session = _driver.AsyncSession();
            try
            {
                cursor = await session.RunAsync(@"MATCH (n:Osoba) RETURN n.godine as godine LIMIT 10");
                ages = await cursor.ToListAsync(record => record["godine"].As<int>());
            }
            finally
            {
                await session.CloseAsync();
            }

            return Ok(ages);
        }
    }
}
