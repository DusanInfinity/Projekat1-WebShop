using Microsoft.AspNetCore.Mvc;
using Neo4j.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebShop.Data;
using WebShop.Models;

namespace WebShop.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CommentsController : ControllerBase
    {
        private static readonly Logging Log = new Logging("CommentsController");
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
        public async Task<IActionResult> DodajKomentar([FromBody] ProductComment comment)
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
                    { "date", comment.Date.ToString() },
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
        [Route("ObrisiKomentar/{productCode}/{name}/{date}")]
        public async Task<IActionResult> ObrisiKomentar(int productCode, string name, DateTime date)
        {
            IResultCursor cursor;
            IAsyncSession session = _driver.AsyncSession();
            bool successful = false;
            try
            {
                Dictionary<string, object> queryParams = new Dictionary<string, object>()
                {
                    { "productcode", productCode },
                    { "name", name },
                    { "date", date.ToString() },
                };

                cursor = await session.RunAsync("MATCH (c:Comment { Name: $name, Date: $date })-[r:COMMENTED]-(p:Produkt { ProductCode: $productcode }) " +
                                                "DELETE r " +
                                                "DETACH DELETE c " +
                                                "RETURN count(c) > 0 AS success", queryParams);

                IRecord record = await cursor.SingleAsync();
                successful = record["success"].As<bool>();
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
            finally
            {
                await session.CloseAsync();
            }

            Log.WriteLine($"[Brisanje komentara] {productCode} {name} {date}");

            if (!successful)
                return BadRequest(new { message = "Doslo je do greske prilikom brisanja komentara!" });

            return Ok(productCode);
        }
    }
}
