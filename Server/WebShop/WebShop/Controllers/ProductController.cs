﻿using Microsoft.AspNetCore.Mvc;
using Neo4j.Driver;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebShop.Models;

namespace WebShop.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IDriver _driver;
        public ProductController(IDriver driver)
        {
            _driver = driver;
        }

        [HttpGet]
        [Route("VratiProdukte/{tag}")]
        public async Task<IActionResult> VratiProdukte(string tag)
        {
            IResultCursor cursor;
            var products = new List<Product>() { };
            IAsyncSession session = _driver.AsyncSession();

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