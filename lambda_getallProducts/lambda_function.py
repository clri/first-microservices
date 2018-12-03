import json
import pymysql

rds_host  = "e6156.cck9ji2rhmk4.us-east-1.rds.amazonaws.com"
name = "microservice"
password = "thePassword"
db_name = "social_customers"

try:
    conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
except:
    print("ERROR: Unexpected error: Could not connect to MySql instance.")
    sys.exit()

def lambda_handler(event, context):
    ans = []
    with conn.cursor() as cur:
        cur.execute("select * from product")
        try:
            for m in cur:
                #will be a tuple; transform it to a dictionary
                tmp = {
                    'id' : m[0],
                    'name' : m[1],
                    'description' : m[2],
                    'category' : m[3],
                    'price' : m[4],
                    'img_url' : m[5],
                    'modified' : m[6],
                    'tenant_id' : m[7]
                }
                ans.append(tmp)

        except:
            ans = []
        conn.commit()
        print(ans)


    return {
        'statusCode': 200,
        'body': json.dumps(ans)
    }
