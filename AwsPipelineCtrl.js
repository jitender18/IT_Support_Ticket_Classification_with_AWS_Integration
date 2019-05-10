/**
 * Created by abhilashakanitkar on 01/May/19.
 */
/*global angular */

/**
 * The main controller for the app. The controller:

 * - exposes the model to the template and provides event handlers
 */


angular.module('awspipeline')
    .controller('AwsPipelineCtrl', function CustomAgentsCtrl($scope, $routeParams,$http, $filter,$q,$sce,$timeout) {
        // 'use strict';

        $scope.searchKeyword = '';
        $scope.firstTimeFlag = true;
        $scope.showMoreWords = false;
        $scope.finalResultsFlag = false;
        $scope.initialResultforSendingSEL =[];
        $scope.initialResultforSendingDSEL =[];
        $scope.moreWordsLoadingFlag = false;
        $scope.interResultsLoadingFlag = false;
        $scope.tickets = [];


        $scope.categoryList = [
            {id:'0',tag:'Application'},
            {id:'1',tag:'Database'},
            {id:'2',tag:'Network'},
            {id:'3',tag:'Security'},
            {id:'4',tag:'User Maintenance'}
        ];
        //$scope.categorySelected = $scope.categoryList[0].tag;

        $scope.categoryList2 =
            {'0':'Application',
                '1':'Database',
                '2':'Network',
                '3':'Security',
                '4':'User Maintenance'
            };


        $scope.onchange = function(id,cat){

            console.log("on change called : ", id);
            console.log("on change called : ", cat);
            $scope.tickets[id].true_prediction = cat;
            $scope.tickets[id].true_prediction_name = $scope.categoryList2[cat];


            console.log($scope.tickets)

        };


        $scope.init = function(){
            console.log("inside Custom Agents INIT");
            console.log($scope.categoryList2['3']);

            $http.get('/data/tickets.json')
                .then(function(res){

                    $scope.tickets = res.data['Record']
                    $scope.tickets[0]

                    console.log($scope.tickets[0]['ticketdescription'] );
                    console.log($scope.tickets[0]['class_predicted']  );
                    console.log($scope.tickets[0]['conf'] );

                    for(var i=0;i<$scope.tickets.length;i++){

                        $scope.tickets[i].class_predicted_name = $scope.categoryList2[$scope.tickets[i]['class_predicted']]

                    };

                    angular.forEach($scope.tickets, function(member, index){
                        //Just add the index to your item
                        member.index = index;
                    });



                })
                .then(function (r) {

                    $http.get('/api/getIncomingTickets')
                        .then(function (res) {
                            console.log("Response received!! ");
                            sqsmsgs = res.data;
                            for (var k=0;k<sqsmsgs.length;k++){
                                var msg = JSON.parse(res.data[k]['Body']);
                                var tmp = new Object();
                                tmp.ticketdescription = msg.ticketdescription;
                                tmp.class_predicted = msg.class_predicted;
                                tmp.conf = msg.conf;
                                tmp.class_predicted_name = $scope.categoryList2[msg.class_predicted];
                                $scope.tickets.push(tmp);

                            }
                            //console.log($scope.tickets);
                        });
                })
            ;



        };

      $scope.savedata = function(){

          console.log("SAVE button clicked");

          console.log(JSON.stringify($scope.tickets));

          $http.post('/api/sendDataToS3/')
              .then(function (res) {
                  console.log("received response from savedata");
                  console.log(res)
                  alert("File saved succesfully!");
              })


      }

    })


;



