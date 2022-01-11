using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebShop.Models
{
    public class Order
    {
        public Customer CustomerData { get; set; }
        public List<OrderedProduct> OrderedProducts { get; set; }
    }
}
