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

    ans = []
    with conn.cursor() as cur:
        cur.execute("select category from prod_category")
        try:
            for m in cur:
                ans.append(m[0])
        except:
            print("exception")
        conn.commit()
    print(ans)

    return {
        'statusCode': 200,
        'body': json.dumps(ans)
    }
