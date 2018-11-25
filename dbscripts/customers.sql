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
  `customers_email` varchar(128) UNIQUE NOT NULL,
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

create table `product` (
  `product_id` int(10) NOT NULL AUTO_INCREMENT,
  `product_name` varchar(128) NOT NULL,
  `product_description` varchar(1024) NOT NULL,
  `product_category` varchar(128) NOT NULL,
  `product_price` float NOT NULL,
  `product_image_url` varchar(1024) NOT NULL,
  `product_modified` bigint(20) NOT NULL,
  `tenant_id` varchar(12) NOT NULL,
  PRIMARY KEY (`product_id`)
);

create table user_privilege(
        user varchar(12) not null,
        privilege int,
        primary key(user),
        constraint foreign key `user`(`user`) references `customers`(`customers_id`)
);


/*Triggers for Waterline adapted from lecture 3 */

DELIMITER $$

CREATE DEFINER=`root`@`localhost` FUNCTION `generate_uni`(last_name VARCHAR(32),
    first_name VARCHAR(32)) RETURNS varchar(8) CHARSET utf8
BEGIN

    -- You have to/should declare variables before using
    DECLARE        c1                CHAR(2);
    DECLARE        c2                CHAR(2);
    DECLARE        prefix            CHAR(6);
    DECLARE        uniCount        INT;
    DECLARE        newUni        VARCHAR(8);

    SET c1         =        UPPER(SUBSTR(first_name, 1, 2));
    SET c2        =        UPPER(SUBSTR(last_name, 1, 2));
    SET prefix    =        CONCAT(c1, c2, "%");

    SET uniCount = 0;
    SELECT COUNT(customers_id) INTO uniCount FROM customers WHERE customers_id LIKE prefix;
    SET newUni = CONCAT(c1, c2,uniCount+1);

RETURN  newUni;
END $$

CREATE DEFINER=`root`@`localhost` TRIGGER `customers_BEFORE_INSERT`
    BEFORE INSERT ON `customers` FOR EACH ROW
BEGIN
    SET New.customers_id = LOWER(generate_uni(New.customers_lastname, New.customers_firstname));
END $$

CREATE DEFINER=`root`@`localhost` TRIGGER `customers_BEFORE_UPDATE`
    BEFORE UPDATE ON `customers` FOR EACH ROW
BEGIN
    SET New.customers_id = Old.customers_id;
END $$

DELIMITER ;


grant all privileges on social_customers.* to 'microservice'@'localhost';

/**/
