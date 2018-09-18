/*creates customers*/
drop database if exists social_customers;
drop user if exists 'microservice'@'localhost';

create database social_customers;
create user 'microservice'@'localhost' identified by 'thePassword';
use social_customers;

/*below definition taken from lecture 1 slide*/
create table `customers` (
  `customers_id` varchar(12) NOT NULL,
  `customers_lastname` varchar(64) NOT NULL,
  `customers_firstname` varchar(64) NOT NULL,
  `customers_email` varchar(128) NOT NULL,
  `customers_status` enum('ACTIVE','PENDING','DELETED','SUSPENDED','LOCKED') NOT NULL,
  `customers_password` varchar(512) NOT NULL,
  `customers_last_login` bigint(20) NOT NULL,
  `customers_created` bigint(20) NOT NULL,
  `customers_modified` bigint(20) NOT NULL,
  `tenant_id` varchar(16) NOT NULL,
  PRIMARY KEY (`customers_id`)
) ;

/*created with respect to previous table, assuming all columns not null*/
create table `social_information` (
  `customer_id` varchar(12) NOT NULL,
  `social_provider` varchar(8) NOT NULL,
  `social_id` varchar(64) UNIQUE NOT NULL,
  `social_token` varchar(2048) NOT NULL,
  `tenant_id` varchar(12) NOT NULL,
  PRIMARY KEY (`customer_id`, `social_provider`),
  CONSTRAINT FOREIGN KEY `customer_id`(`customer_id`) REFERENCES `customers`(`customers_id`)
);


grant all privileges on social_customers.* to 'microservice'@'localhost';
/**/
