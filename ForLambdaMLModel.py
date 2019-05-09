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
   
    loadedmodel = joblib.load('/tmp/text_classifier.pkl')
 
    
    print("Model is available:")
    #print(model)
    #Predict
    class_predicted = (loadedmodel.predict(X_test).tolist())[0]

    print("class_prediced : ", class_predicted)

    pred_probabs = (loadedmodel.predict_proba(X_test).tolist())[0]
    print(pred_probabs)

    pred_json = json.dumps({'class_predicted': class_predicted, 'predict_proba':pred_probabs})
    print(pred_json)

    sqs = boto3.resource('sqs')
    queue = sqs.get_queue_by_name(QueueName='classified_support_tickets')
    response = queue.send_message(MessageBody=json.dumps({'ticketdescription': ticketdescription,'class_predicted': class_predicted , 'conf': pred_probabs[0]}))


    # s3 = boto3.resource('s3')
    # fname = '{}_{}'.format('classifiedresult',uuid.uuid4())
    # data = '"'+ticketdescription+'"'+','+str(class_predicted)

    # obj = s3.Object('ticket-classification-results', fname)
    # obj.put(Body=data)
    
    
    return pred_json
