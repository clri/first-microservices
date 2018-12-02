import json
import pymysql

rds_host  = "e6156.cck9ji2rhmk4.us-east-1.rds.amazonaws.com"
name = "microservice"
password = "thePassword"
db_name = "social_customers"

#print("LAMBDAAAAA")

try:
    conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
    #print("connected")
except:
    print("ERROR: Unexpected error: Could not connect to MySql instance.")
    sys.exit()

def lambda_handler(event, context):
    #print("AAAAAAAAAAAAA")
    print(event)
    qps = event['body']
    itms = eval(qps)['queryParams']['items'];

    itemstr = "'" + str(itms[0])
    for itm in itms[1:]:
        itemstr += "', '" + str(itm)
    itemstr += "'"
    print(itemstr)

    ans = 0
    val = 1
    founds = []
    with conn.cursor() as cur:
        cur.execute("select product_id, product_price from product where product_id in (" + itemstr +  ")")
        try:
            for m in cur:
                print(m)
                ans += m[1] * itms.count(m[0])
                founds.append(m[0])
            for itm in itms:
                if itm not in founds:
                    val = 0
                    break
        except:
            ans = 0
            val = 0
        conn.commit()


    return {
        'statusCode': 200,
        'body': json.dumps({'valid' : val, 'totalPrice' : ans})
    }
