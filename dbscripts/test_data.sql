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
