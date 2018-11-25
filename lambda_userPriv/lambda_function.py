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
    print(event)
    qps = event['body']
    uid = eval(qps)['queryParams']['uid'];

    ans = 0
    with conn.cursor() as cur:
        cur.execute("select privilege from user_privilege where user = '" + uid + "'")
        try:
            for m in cur:
                ans = m
        except:
            ans = 0
        conn.commit()


    return {
        'statusCode': 200,
        'body': json.dumps({'admin' : ans})
    }
