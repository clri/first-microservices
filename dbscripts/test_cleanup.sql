use social_customers;
delete from customers where customers_firstname in ("Angus", "Suarez", "Lionel");
update customers set customers_status = "DELETED" where customers_firstname = "Matt";
update customers set customers_status = "ACTIVE" where customers_firstname = "Kate";
