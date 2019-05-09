import boto3
import os
import ctypes
import uuid
import pickle
from sklearn.externals import joblib
import sklearn
import json


for d, _, files in os.walk('lib'):
    for f in files:
        if f.endswith('.a'):
            continue
        ctypes.cdll.LoadLibrary(os.path.join(d, f))

bucket = 'service-now-bucket'
key = 'text_classifier'

s3_client = boto3.client('s3')
#s3.Bucket(bucket).download_file(key,'/tmp/model.pkl')

def handler(event, context):
    
    print("Inside handler function")
    print((event.get('Records')[0]).get('body'))

    #Info
    #ticketdescription = str(event.get('ticketdescription'))
    ticketdescription = str((event.get('Records')[0]).get('body'))
    
    print("Requested ticket description is : ",ticketdescription)


    X_test=[]
    X_test.append(ticketdescription)
    #load model
    bucket = 'service-now-bucket'
    key = 'text_classifier.pkl'
    download_path = '/tmp/text_classifier.pkl'
    s3_client.download_file(bucket, key, download_path)
   
    print("GETTING ALL LABELED DATA") 

    bucket2 = 'ticket-classification-labeled-data'
    keys = []
    resp = s3_client.list_objects_v2(Bucket=bucket2)
    for obj in resp['Contents']:
        keys.append(obj['Key'])

    print(keys)

    for k in keys:
        print('Downloading file : '+ k)
        download_path1 = '/tmp/'+k
        s3_client.download_file(bucket2, k, download_path1)
    print("Files downloaded")


 
    
    
    # s3 = boto3.resource('s3')
    # fname = '{}_{}'.format('classifiedresult',uuid.uuid4())
    # data = '"'+ticketdescription+'"'+','+str(class_predicted)

    # obj = s3.Object('ticket-classification-results', fname)
    # obj.put(Body=data)
    pred_json = json.dumps({'class_predicted': "HELLO"})
    
    
    return pred_json
