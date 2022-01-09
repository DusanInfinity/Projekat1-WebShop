using System;

namespace WebShop.Models
{
    public class Customer
    {
        public int ID { get; set; }
        public string Username { get; set; }
        public string Firstname { get; set; }
        public string Lastname { get; set; }
        public DateTime Registered { get; set; }
    }
}
