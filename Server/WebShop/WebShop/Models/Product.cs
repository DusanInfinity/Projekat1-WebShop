﻿using System.Collections.Generic;

namespace WebShop.Models
{
    public class Product
    {
        public string Name { get; set; }
        public int Price { get; set; }
        public string Description { get; set; }
        public List<string> Tags { get; set; }
        public List<ProductComment> Comments { get; set; }
    }
}