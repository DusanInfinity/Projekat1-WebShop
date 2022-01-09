using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebShop.Models
{
    public class OrderedProduct
    {
        public Product Product { get; set; }
        public int Quantity { get; set; }
        public Customer OrderedBy { get; set; }
    }
}
