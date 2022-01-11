using Microsoft.AspNetCore.Mvc;
using Neo4j.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebShop.Models;

namespace WebShop.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly IDriver _driver;
        public CommentsController(IDriver driver)
        {
            _driver = driver;
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
