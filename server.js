/**
 * Created by abhilashak.
 */
// set up ========================
var express = require('express');

var app = express();                               //create our app w/ express
var http = require('http');
var https = require('https');
// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var Receiver = require('sqs-buffer')
var typaheadWords;
var serverip = '0.0.0.0'; //hiding the organization IP address
var pythonserverport = '8080';




AWS.config.update({region: 'us-east-2'});

app.post('/api/sendDataToS3/',function(req,res){

    console.log('/api/sendDataToS3/ called . . . ')

    var s3 = new AWS.S3({
        accessKeyId: '<Insert Access Key Here>',
        secretAccessKey: '<Insert Secret Key Here>'
    });

    timestmp = new Date().getTime();
    fname = 'LabeledData_'+timestmp+'.json';
    console.log(fname);

    data = '[{"ticketdescription":"outage hello please out outage communication users per cr possible please out outage today by tomorrow morning well notify sd prior suspending affected polls thanks kind regards officer","class_predicted":0,"conf":0.36551299278111077,"class_predicted_name":"Application","index":0,"$$hashKey":"object:4","true_prediction":"1","true_prediction_name":"Database"},{"ticketdescription":"create repository hello guys ask create repository under name also administrator repository thanks great","class_predicted":4,"conf":0.2142545373183808,"class_predicted_name":"User Maintenance","index":1,"$$hashKey":"object:5","true_prediction":"0","true_prediction_name":"Application"},{"ticketdescription":"network security seems like an issue please access","class_predicted":2,"conf":0.2712993085458078,"class_predicted_name":"Network","index":2,"$$hashKey":"object:6","true_prediction":"2","true_prediction_name":"Network"}]';

    var params = {
        Bucket: 'ticket-classification-labeled-data', // pass your bucket name
        Key: fname, // file will be saved as testBucket/contacts.csv
        Body: data
    };

    s3.upload(params, function(s3Err, data) {
        if (s3Err) throw s3Err;
        console.log('File uploaded successfully at ');

        res.json(true)
    });





});


app.get('/api/getIncomingTickets',function(req,res){

    console.log("server.js : Inside getIncomingTickets()")

    var sqs = new AWS.SQS({
                            accessKeyId: '<Insert Access Key Here>',
                            secretAccessKey: '<Insert Secret Key Here>'
                          });

    var queueURL = "https://sqs.us-east-2.amazonaws.com/365239323431/classified_support_tickets";

    var params = {
        AttributeNames: [
            "SentTimestamp"
        ],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: [
            "All"
        ],
        QueueUrl: queueURL,
        VisibilityTimeout: 5,
        WaitTimeSeconds: 10
    };

    //x = true;



        sqs.receiveMessage(params, function(err, data) {

            console.log("inside sqs.receiveMessage")
            if (err) {
                console.log("Receive Error", err);
            } else if (data.Messages) {


                //console.log((data.Messages));
                console.log('No. os msgs received :'+(data.Messages).length);

                mydata = data.Messages;
                data.Messages.forEach(function (msg) {
                    console.log('*************');
                    //console.log(msg.Body);
                    //console.log(msg.ReceiptHandle);

                    var deleteParams = {
                        QueueUrl: queueURL,
                        ReceiptHandle: msg.ReceiptHandle
                    };
                    // sqs.deleteMessage(deleteParams, function(err, data) {
                    //     if (err) {
                    //         console.log("Delete Error", err);
                    //     } else {
                    //         console.log("Message Deleted", data);
                    //     }
                    // });
                });
              res.json(mydata);

            }
        });



});






var distDir = '/Users/abhilashakanitkar/WebstormProjects' + "/CustomServiceAgents";

app.use(express.static(distDir));


// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");


