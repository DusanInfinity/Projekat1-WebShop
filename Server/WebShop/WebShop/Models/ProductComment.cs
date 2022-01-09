using System;

namespace WebShop.Models
{
    public class ProductComment
    {
        public Product Product { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Text { get; set; }
        public DateTime Date { get; set; }
    }
}
