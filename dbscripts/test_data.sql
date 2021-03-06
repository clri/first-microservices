use social_customers;

-- some example data for customers: we can update passwords to something usable when we decide how to salt/hash them, likewise
-- we can update the bigints to usable dates when we figure out what format we will convert them to
-- also, the custid field will be set to the generated UNI with the UDF
insert into customers values('cust1', 'Smith', 'Matt', 'msmith@example.com', 'DELETED', '123456', 20180904100334, 20180904100334, 20180904100334, 'E6156');
insert into customers values('cust2', 'Brown', 'Sterling', 'sk_brown@example.net', 'ACTIVE', '123456', 20180909100334, 20180904100334, 20180904100334, 'E6156');
insert into customers values('cust3', 'McKinnon', 'Kate', 'ilovecats@example.edu', 'ACTIVE', '124456', 20180910100334, 20180909100334, 20180904100334, 'E6156');
insert into customers values('cust4', 'Jamil', 'Jameela', 'jj1986@example.co.uk', 'ACTIVE', '124456', 20180904100334, 20180904100334, 20180904100334, 'E6156');
insert into customers values('elvis', 'Presley', 'Elvis', 'clr2176@columbia.edu', 'PENDING', '124456', 20180904100334, 20180904100334, 20180904100334, 'E6156');

-- social information for some customers
insert into social_information values('masm1', 'facebook', '1234', 'aslkdure2oi348239432', 'E6156');
insert into social_information values('masm1', 'twitter', '1235', 'aslkdure2oi348239sdfseresr432', 'E6156');
insert into social_information values('stbr1', 'facebook', '12345', 'aslkdure2oi348234o98usoer8us8e9432', 'E6156');

-- category
insert into prod_category values('food');
insert into prod_category values('cafe');
insert into prod_category values('books');

-- products
insert into product values(1, 'pancakes', 'one stack of pancakes', 'food', 8.95, 'https://static01.nyt.com/images/2017/03/24/dining/24COOKING-CLASSICPANCAKES/24COOKING-CLASSICPANCAKES-articleLarge.jpg', 20180904100334, 'E6156');
insert into product values(2, 'coffee', 'one pound of arabica beans, dark roast', 'cafe', 12, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/1024px-A_small_cup_of_coffee.JPG', 20180904100334, 'E6156');
insert into product values(3, 'earl grey tea', 'made from fresh tea leaves, 5 boxes at 20 bags per box', 'cafe', 10.95, 'https://cbtl-images.s3.us-west-1.amazonaws.com/Production/Drupal/s3fs-public/styles/cafe_menu_item_teaser/public/cafe-menu/Hot-Black-Tea.jpg?itok=dYziJ_Tq', 20180904100334, 'E6156');
insert into product values(4, 'premium earl grey tea', 'made from expensive tea leaves, 5 boxes at 20 bags per box', 'cafe', 50.95, 'https://cbtl-images.s3.us-west-1.amazonaws.com/Production/Drupal/s3fs-public/styles/cafe_menu_item_teaser/public/cafe-menu/Hot-Black-Tea.jpg?itok=dYziJ_Tq', 20180904100334, 'E6156');
insert into product values(5, 'waffles', 'one stack of waffles', 'food', 8.95, 'https://bakingamoment.com/wp-content/uploads/2018/07/IMG_9113-best-waffle-recipe-square.jpg', 20180904100334, 'E6156');
insert into product values(6, 'better waffles', 'one stack of waffles', 'food', 9.95, 'https://bakingamoment.com/wp-content/uploads/2018/07/IMG_9113-best-waffle-recipe-square.jpg', 20180904100334, 'E6156');
insert into product values(7, 'cheap waffles', 'one stack of suspect waffles', 'food', 3.95, 'https://bakingamoment.com/wp-content/uploads/2018/07/IMG_9113-best-waffle-recipe-square.jpg', 20180904100334, 'E6156');
insert into product values(8, 'waffles', 'one stack of waffles', 'food', 8.99, 'https://bakingamoment.com/wp-content/uploads/2018/07/IMG_9113-best-waffle-recipe-square.jpg', 20180904100334, 'E6156');
insert into product values(9, 'waffles (gluten free)', 'one stack of waffles', 'food', 8.95, 'https://bakingamoment.com/wp-content/uploads/2018/07/IMG_9113-best-waffle-recipe-square.jpg', 20180904100334, 'E6156');


-- user_privilege
insert into user_privilege values('jaja1',1);
