using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Neo4j.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebShop.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;
        private readonly IDriver _driver;

        public WeatherForecastController(ILogger<WeatherForecastController> logger, IDriver driver)
        {
            _logger = logger;
            _driver = driver;
        }

        [HttpGet]
        public IEnumerable<WeatherForecast> Get()
        {
            var rng = new Random();
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateTime.Now.AddDays(index),
                TemperatureC = rng.Next(-20, 55),
                Summary = Summaries[rng.Next(Summaries.Length)]
            })
            .ToArray();
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
