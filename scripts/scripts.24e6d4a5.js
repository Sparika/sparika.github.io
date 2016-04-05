'use strict';

/**
 * @ngdoc overview
 * @name trustModelFormApp
 * @description
 * # trustModelFormApp
 *
 * Main module of the application.
 */
angular
  .module('trustModelFormApp', ['ngRoute','schemaForm'])

  // configure our routes
  .config(function($routeProvider, $locationProvider) {
        $routeProvider
            // route for the about page
            .when('/about', {
                templateUrl : 'views/about.html',
                controller  : 'MainCtrl',
                activeTab: 'about'
            })

            // route for the contact page
            .when('/contact', {
                templateUrl : 'views/about.html',
                controller  : 'MainCtrl',
                activeTab: 'contact'
            })
            // route for the survey page
            .when('/:page', {
                templateUrl : 'views/main.html',
                controller  : 'MainCtrl',
                activeTab: 'survey'
            })
            .otherwise({ redirectTo: function() {window.location = '#0'} });


        //$locationProvider.html5Mode(true)
  })

'use strict';

/**
 * @ngdoc function
 * @name trustModelFormApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the trustModelFormApp
 */
angular.module('trustModelFormApp')
  .factory('data', function (){
    // Test if cookie exists and load it
    // else create empty object
    return {}
  })
  .controller('MainCtrl', ['$scope','$route', '$routeParams', function ($scope, $route, $routeParams) {
    $scope.page = $routeParams.page
    $scope.$route = $route;

    $scope.loadModel = false
    var trustModel = {}
    trustModel.widht = 0
    trustModel.height = 0

    function createLoadFunction(urlJson, width, height){
      function loadModel(){
        if(self.fetch) {
            // run my fetch request here
            fetch('../models/'+urlJson)
            .then(response => response.json())
            .then(json => reloadTrustModel(json, width, height))
        } else {
            // do something with XMLHttpRequest?
            console.log('fetch not supported')
        }
      }
      return loadModel
    }

    var modelList = [,,,,,,
    createLoadFunction('tlsViz.json', 760, 800),
    createLoadFunction('webRTCfpViz.json', 760, 800)]

    $scope.$on('$routeChangeSuccess', function () {
      if(modelList[$scope.page]){
        $scope.loadModel = true
        modelList[$scope.page]()
      } else {
        $scope.loadModel = false
      }
    });
  }])
  .controller('ModelFormController', ['$scope', 'data', function($scope, data) {
      var modelTips = {
        tlsModel: {
          'rsa2048aes256sha256': "",
          'rsa2048aes256sha1': "In this configuration, SHA-1 is weak. With an estimated entropy of 53bits for a "+
                               "recommended value of 200bits, the trust of the SHA component is set a 't=0'. This "+
                                "make the whole TLS component at trust 0 through the MIN operator on AES.",
          'rsa1024aes256sha256': "In this configuration, RSA is weak as it is using a 1024bits key. The recommended size"+
                                 " for factoring modulus algorithm is 2000bits, the trust of the RSA component is set a 't=0'. "+
                                  " This make the whole TLS component at trust 0 through the MIN operator on AES."},
        trustModel: {
          'all': "This is a standard WebRTC configuration. In this scenario, the IdP and CSP are the same actors and thus"+
                 " share the same trust level. Trust on the overall system is entirely dependent on trust given to the CSP/IdP.",
          'noidp': "In this configuration, the IdP is untrusted. Although the CSP may be trusted, the authentication by the IdP"+
                   "may be compromised.",
          'nocsp': "In this configuration, the CSP is untrusted. However, a trusted IdP provides an identity assertion"+
                   " authenticating the other user. This assertion ensures that no man-in-the-middle attack is taking "+
                   "place, as long as the IdP is trusted."}
      }
      $scope.modelTip = ""
      $scope.displayModelTip = function(){return $scope.modelTip!=""}
      $scope.tlschoice = {
        name: 'rsa2048aes256sha256'
      }
      $scope.trustChoice = {
        name: 'all'
      }
      $scope.rsa2048aes256sha256 = data.rsa2048aes256sha256
      $scope.rsa2048aes256sha1 = data.rsa2048aes256sha1
      $scope.rsa1024aes256sha256 = data.rsa1024aes256sha256
      $scope.webRTC = data.webRTC
      $scope.webRTCwtID = data.webRTCwtID
      $scope.webRTCwutID = data.webRTCwutID

      $scope.onTrustModelChange = function(){
        $scope.modelTip = modelTips.trustModel[$scope.trustChoice.name]
        switch ($scope.trustChoice.name) {
          case 'all':
            setActorTrust({CSP: $scope.webRTC/10||1, IdP: $scope.webRTC/10||1}, true)
            break;
          case 'noidp':
            setActorTrust({CSP: '1', IdP: '0'}, true)
            break;
          case 'nocsp':
            setActorTrust({CSP: '0', IdP: '1'}, true)
            break;
          }
      }

      $scope.onTLSModelChange = function(){
        $scope.modelTip = modelTips.tlsModel[$scope.tlschoice.name]
        switch ($scope.tlschoice.name) {
          case 'rsa2048aes256sha256':
              setEntropy({sha_key: '256', rsa_key: '2048'})
          break;
          case 'rsa2048aes256sha1':
              setEntropy({sha_key: '53', rsa_key: '2048'})
          break;
          case 'rsa1024aes256sha256':
              setEntropy({sha_key: '256', rsa_key: '1024'})
          break;
        }
      }
  }])
  .controller('FormController', ['$scope', '$routeParams', 'data', '$location', function($scope, $routeParams, data, $location) {
  $scope.variable = data
  $scope.schema = {
    type: 'object',
    properties: {
      lockColor: {type: 'string', enum:['green (valid)', 'yellow (warning)', 'red (error)'],
                  title: 'In this situation, which type of warning would you expect your browser to display?',
                  description: '<img src="https://lh5.googleusercontent.com/fb2iovaPq1TailtGP5kv3v-aguTzKHazIo33j-N-_'+
                                'oiCsPiivQCFM6PxxsmFzI2cu4zB0Q" width="127px">'},
      sha1: {type:'string', enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'Sha-1 Security level',
                  description:'SHA-1 hashing algorithm producing a 160bits hash, used for hashing (collision resistance).'},
      sha256: {type:'string', enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'Sha-256 Security level',
                  description:'SHA-256 hashing algorithm producing a 256bits hash, used for hashing (collision resistance).'},
      sha512: {type:'string', enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'Sha-512 Security level',
                  description:'SHA-512 hashing algorithm producing a 512bits hash, used for hashing (collision resistance).'},
      aes128: {type:'string', enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'AES 128 Security level',
                  description:'AES encryption algorithm with a 128bits key, used for encryption (confidentiality resistance).'},
      aes256: {type:'string', enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'AES 256 Security level',
                  description:'AES encryption algorithm with a 256bits key, used for encryption (confidentiality resistance).'},
      rsa1024: {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'RSA 1024 Security level',
                  description:'RSA with a 1024bits key, used for signature (authentication strength).'},
      rsa2048: {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'RSA 2048 Security level',
                  description:'RSA with a 2048bits key, used for signature (authentication strength).'},
      rsa2048aes128sha1: {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'TLS with RSA(2048)_AES_128_SHA',
                  description:'TLS configured with RSA 2048, AES 128 and SHA-1'},
      rsa2048aes256sha1: {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'TLS with RSA(2048)_AES_256_SHA',
                  description:'TLS configured with RSA 2048, AES 256 and SHA-1'},
      rsa2048aes128sha256: {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'TLS with RSA(2048)_AES_128_SHA256',
                  description:'TLS configured with RSA 2048, AES 128 and SHA-256'},
      rsa2048aes256sha256: {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'TLS with RSA(2048)_AES_256_SHA256',
                  description:'TLS configured with RSA 2048, AES 256 and SHA-256'},
      rsa1024aes128sha256: {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'TLS with RSA(1024)_AES_128_SHA256',
                  description:'TLS configured with RSA 1024, AES 128 and SHA-256'},
      rsa1024aes256sha256: {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'], title: 'TLS with RSA(1024)_AES_256_SHA256',
                  description:'TLS configured with RSA 1024, AES 256 and SHA-256'},
      mobile:  {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'],
                      title: 'You use your personal mobile phone for a national call.',
                      description:'Each operators handling the call would thus be operating in your country.'},
      internationalmobile:  {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'],
                      title: 'You use your personal mobile phone for an international call. ',
                      description:'Operators handling the call would thus be unknown to you.'},
      ott:  {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'],
             title: 'You use a well known OTT service for a communication.',
             description:'For instance on services such as Hangouts, Messenger, or Whatsapp.'},
      webRTC:  {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'],
                title: 'You use a WebRTC service integrated into a web-page.',
                description:'For instance a gaming web-page, with integrated WebRTC service and authentication through the gaming page only, '+
                'i.e. the website is responsible for authenticating users.'},
      webRTCwtID:  {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'],
                   title: 'You use a WebRTC service integrated into a web-page, but delegating authentication to a trusted third party.',
                   description:'Similar to the previous use-case, however you get an identity assertion, asserting that '+
                   'the other participant was authenticated through an Identity Provider you trust.'},
      webRTCwutID:  {type:'string',enum:['0','1','2','3','4','5','6','7','8','9','10'],
                   title: 'You use a WebRTC service integrated into a web-page, but delegating authentication to an untrusted third party.',
                   description:'Similar to the previous use-case, however the Identity Provider asserting the identity is '+
                   'unknown to you.'},

      webExpertise: {type:'string', //description:'How would you qualify your expertise with Web technologies?',
                                      enum:['End-User','Intermediate','Expert'],
                                      title: 'Qualify your degree of expertise with Web technologies'},
      securityExpertise: {type:'string', //description:'How would you qualify your expertise with computer security?',
                                      enum:['End-User','Intermediate','Expert'],
                                      title: 'Qualify your degree of expertise with Computer security'},
      field: {type:'string', enum:['Academic', 'Industrial'], title: 'Field of work'},
      company: {type:'string', title: 'Company (optional)'},

      tlsHelpClarify: {type:'string', enum:['Interesting point of view', 'Slightly interesting', 'No'],
                       title: 'Evaluate the model\'s interest',
                       description: 'Does this representation of a WebRTC identity model help you understand the situation?'},
      tlsHelpTrust: {type:'string', enum:['Interesting point of view', 'Slightly interesting', 'No'],
                     title: 'Evaluate the trust layer\'s interest',
                     description: 'Does the trust layer bring a new point of view to your understanding of security issues?'},
      tlsAgree: {type:'string', enum:['Yes', 'Some errors', 'No'],
                 title: 'Overall, do you agree with this model?'},
      tlsComment: {type:'string', title: 'Any comments?'},

      webrtcHelpClarify: {type:'string', enum:['Interesting point of view', 'Slightly interesting', 'No'],
                       title: 'Evaluate the model\'s interest',
                       description: 'Does this representation of a WebRTC identity model help you understand the situation?'},
      webrtcHelpTrust: {type:'string', enum:['Interesting point of view', 'Slightly interesting', 'No'],
                     title: 'Evaluate the trust layer\'s interest',
                     description: 'Does the trust layer bring a new point of view to your understanding of security issues?'},
      webrtcAgree: {type:'string', enum:['Yes', 'Some errors', 'No'],
                 title: 'Overall, do you agree with this model?'},
      webrtcComment: {type:'string', title: 'Any comments?'}
    },

    'required': [
        'field',//'company',
        'webExpertise','securityExpertise',
        'lockColor',
        'sha1',
        'sha256',
        'sha512',
        'aes128',
        'aes256',
        'rsa1024',
        'rsa2048',
        'rsa2048aes128sha1',
        'rsa2048aes256sha1',
        'rsa2048aes128sha256',
        'rsa2048aes256sha256',
        'rsa1024aes128sha256',
        'rsa1024aes256sha256',
        'mobile',
        'internationalmobile',
        'ott',
        'webRTC',
        'webRTCwtID',
        'webRTCwutID'
      ]

  };

  $scope.formContent = [
  [], // Introduction
  [{type: 'fieldset', // Personal Informations
         title: 'Personal level of expertise',
         items: [{type: 'help',
                          helpvalue: '<p>In order to qualify your answers to this survey, we would like to know '+
                          'your field of work as well as your degree of knowledge and experience in the fields '+
                          'of web technologies and computer security.'}]
    },
    {"type": "section",
        "htmlClass": "row",
        "items": [
          {
            "type": "section",
            "htmlClass": "col-xs-6",
            "items": [
              {"key": "webExpertise",
                  "type": "radios",
                  "titleMap": [
                    {
                      value: 'End-User',
                      name: 'End-User <br> I only use the Web.'
                    },
                    {
                      value: 'Intermediate',
                      name: 'Intermediate <br> I have some knowledge with web technologies.'
                    },
                    {
                      value: 'Expert',
                      name: 'Expert <br> Working on Web technologies is my daily job.',
                    }
                  ]
              },
              {key: 'field',
                "style": {
                  "selected": "btn-success",
                  "unselected": "btn-default"
                },
                "type": "radiobuttons"
              }
            ]
          },
          {
            "type": "section",
            "htmlClass": "col-xs-6",
            "items": [
              {"key": "securityExpertise",
                "type": "radios",
                "titleMap": [
                {
                  value: "End-User",
                  name: "End-User <br> I may use security algorithms but don't know the details."
                },
                {
                  value: "Intermediate",
                  name: "Intermediate <br> I have some knowledge on computer security."
                },
                {
                  value: 'Expert',
                  name: 'Expert <br> Computer security is my field of expertise.',
                }]
              },
              "company"
            ]
          }
        ]
    }
  ],
  [
    {key: 'lockColor',
     type: 'radios-inline'},
    {type: 'fieldset', // Personal Informations
      items: [{type: 'help',
              helpvalue: '<br><b>Regarding SHA algorithms, how would you evaluate their respective security on a scale of 0-10?</b>'+
                          '<div class="help-block">'+
                            'In the following questions and the rest of the survey, we ask you to evaluate security configurations on a scale of '+
                            '0-10. It has been demonstrated that perfect security is an impracticable goal, so that only imperfect security can be '+
                            'achieved. On our scale, 10 represents a "good-enough" security level deterring most attacks. i.e. a higher security level '+
                            'would not make a noticeable difference or would be impracticable. Similarly, 0 represents a weak security level, '+
                            'vulnerable to plausible attack. i.e. a weaker security configuration would not make any difference on the effective '+
                            'security provided.'+
                          '</div>'}]
    },
     {"type": "section",
             "htmlClass": "row",
             "items": [
             {
               "type": "section",
               "htmlClass": "col-xs-6",
               "items": [
                {key: 'sha1',
                type: 'radios-inline'},
                {key: 'sha512',
                type: 'radios-inline'}
               ]
             },
             {
               "type": "section",
               "htmlClass": "col-xs-6",
               "items": [
                  {key: 'sha256',
                  type: 'radios-inline'}
               ]
             }
             ]
     }
  ],
  [{type: 'fieldset', // Personal Informations
         items: [{type: 'help',
                 helpvalue: '<br><b>How would you evaluate the security of the following algorithms on a scale of 0-10?</b>'+
                            '<div class="help-block">On this scale 0 represents a weak or compromised security level, '+
                            'while 10 stands for an optimal security level.</div>'}]
       },
     {"type": "section",
             "htmlClass": "row",
             "items": [
             {
               "type": "section",
               "htmlClass": "col-xs-6",
               "items": [
                 {key: 'aes128',
                 type: 'radios-inline'},
                 {key: 'rsa1024',
                 type: 'radios-inline'}
               ]
             },
             {
               "type": "section",
               "htmlClass": "col-xs-6",
               "items": [
                 {key: 'aes256',
                 type: 'radios-inline'},
                 {key: 'rsa2048',
                 type: 'radios-inline'}
               ]
             }
             ]
     },
     {type: 'fieldset', // Personal Informations
              items: [{type: 'help',
                      helpvalue: '<br><br><b>How would you evaluate the security of the following TLS configurations, on a scale of 0-10?</b>'+
                                  '<div class="help-block">On this scale 0 represents a weak or compromised security level, '+
                                  'while 10 stands for an optimal security level.</div>'}]
            },

     {"type": "section",
        "htmlClass": "row",
        "items": [
        {
          "type": "section",
          "htmlClass": "col-xs-6",
          "items": [
            {key: 'rsa2048aes128sha1',
            type: 'radios-inline'},
            {key: 'rsa2048aes128sha256',
            type: 'radios-inline'},
            {key: 'rsa1024aes128sha256',
            type: 'radios-inline'}
          ]
        },
        {
          "type": "section",
          "htmlClass": "col-xs-6",
          "items": [
            {key: 'rsa2048aes256sha1',
            type: 'radios-inline'},
            {key: 'rsa2048aes256sha256',
            type: 'radios-inline'},
            {key: 'rsa1024aes256sha256',
            type: 'radios-inline'}
          ]
        }
        ]
     },
  ],
  [{type: 'fieldset', // Personal Informations
                 items: [{type: 'help',
                         helpvalue: '<br><br><b>How would you evaluate the trust you would have in the following communication scenarios, '+
                                     'on a scale of 0-10?</b>'+
                                     '<div class="help-block">'+
                                      '<p>On this scale, 10 represents an absolute trust that actors in the communications setup are not breaching, '+
                                       'or are not able to breach, you communication privacy. While 0 stands for a total '+
                                       'distrust. i.e. an attack could be mounted as with a weak security level.</p></div>'}]
      },

           {"type": "section",
              "htmlClass": "row",
              "items": [
              {
                "type": "section",
                "htmlClass": "col-xs-6",
                "items": [
      {key: 'mobile',
       type: 'radios-inline'},
      {key: 'ott',
       type: 'radios-inline'}
                ]
              },
              {
                "type": "section",
                "htmlClass": "col-xs-6",
                "items": [
      {key: 'internationalmobile',
       type: 'radios-inline'},
                ]
              }
              ]
           },
{type: 'fieldset', // Personal Informations
                 items: [{type: 'help',
                         helpvalue: '<br><br>'}]
      },

           {"type": "section",
              "htmlClass": "row",
              "items": [
              {
                "type": "section",
                "htmlClass": "col-xs-6",
                "items": [
      {key: 'webRTC',
       type: 'radios-inline'},
      {key: 'webRTCwutID',
       type: 'radios-inline'}
                ]
              },
              {
                "type": "section",
                "htmlClass": "col-xs-6",
                "items": [
      {key: 'webRTCwtID',
       type: 'radios-inline'},
                ]
              }
              ]
           },

  ],
  [],// Model description
  // Model Example 1 -- TLS
  [{type: 'fieldset', // Personal Informations
            title: 'Model evaluation'},
       {"type": "section",
           "htmlClass": "row",
           "items": [
             {
               "type": "section",
               "htmlClass": "col-xs-6",
               "items": [
                 {"key": "tlsHelpClarify",
                   "style": {
                     "selected": "btn-success",
                     "unselected": "btn-default"
                   },
                     "type": "radiobuttons"
                 },
                 {key: 'tlsAgree',
                   "style": {
                     "selected": "btn-success",
                     "unselected": "btn-default"
                   },
                   "type": "radiobuttons"
                 }
               ]
             },
             {
               "type": "section",
               "htmlClass": "col-xs-6",
               "items": [
                 {"key": "tlsHelpTrust",
                   "style": {
                     "selected": "btn-success",
                     "unselected": "btn-default"
                   },
                   "type": "radiobuttons"
                 },
                 {
                   "key": "tlsComment",
                   "type": "textarea",
                   "placeholder": "Comment"
                 },
               ]
             }
           ]
       }
  ],
  // Model Example 2 -- WebRTC
  [{type: 'fieldset', // Personal Informations
            title: 'Model evaluation'},
       {"type": "section",
           "htmlClass": "row",
           "items": [
             {
               "type": "section",
               "htmlClass": "col-xs-6",
               "items": [
                 {"key": "webrtcHelpClarify",
                   "style": {
                     "selected": "btn-success",
                     "unselected": "btn-default"
                   },
                     "type": "radiobuttons"
                 },
                 {key: 'webrtcAgree',
                   "style": {
                     "selected": "btn-success",
                     "unselected": "btn-default"
                   },
                   "type": "radiobuttons"
                 }
               ]
             },
             {
               "type": "section",
               "htmlClass": "col-xs-6",
               "items": [
                 {"key": "webrtcHelpTrust",
                   "style": {
                     "selected": "btn-success",
                     "unselected": "btn-default"
                   },
                   "type": "radiobuttons"
                 },
                 {
                   "key": "webrtcComment",
                   "type": "textarea",
                   "placeholder": "Comment"
                 },
               ]
             }
           ]
       }
  ],
  ]

  $scope.nextAction = {type: 'button', style: 'btn-info', title: 'Next', onClick: 'next()'}
  $scope.backAction = {type: 'button', style: 'btn-info', title: 'Back', onClick: 'back()'}
  $scope.validateAction = {type: 'submit', style: 'btn-save', title: 'Save'}

  $scope.max = $scope.formContent.length - 1

  function addControl(fc, i){
    var actions;
    if(i === 0) {
      actions = [$scope.nextAction]
    } else if(i < $scope.max) {
      actions = [$scope.backAction, $scope.nextAction]
    } else {
      actions = [$scope.backAction, $scope.validateAction]
    }

    fc.push(
      {type: 'actions',
      htmlClass: 'pull-right',
      items: actions})
  }
  $scope.formContent.forEach(addControl)

  $scope.next = function(){
      // Store Cookie
      // First we broadcast an event so all fields validate themselves
      //$scope.$broadcast('schemaFormValidate');

      // Then we check if the form is valid
      //if ($scope.form.$valid) {
        //$scope.count ++
        var pgNb = parseInt($routeParams.page)+1
        $location.path(pgNb)
      //}

  }
  $scope.back = function(){
      // Store Cookie
      // First we broadcast an event so all fields validate themselves
      //$scope.$broadcast('schemaFormValidate');

      // Then we check if the form is valid
      //if ($scope.form.$valid) {
        var pgNb = parseInt($routeParams.page)-1
        $location.path(pgNb)
      //}
  }

  $scope.form = $scope.formContent[$routeParams.page]

  $scope.model = data;

  $scope.onSubmit = function() {
      // First we broadcast an event so all fields validate themselves
      //$scope.$broadcast('schemaFormValidate');

      // Then we check if the form is valid
      //if ($scope.form.$valid) {
        // ... do whatever you need to do with your data.
      $scope.model.timestamp = Date.now()
      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", "http://trustsurvey.rethink2.orange-labs.fr/survey", true);
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.setRequestHeader( 'Access-Control-Allow-Origin', '*');
      xhttp.send(JSON.stringify($scope.model));
      //}
      $location.path('thanks')
    };
}])


// ************** Generate the tree diagram	 *****************


var i = 0;
var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.x, d.y]; });


var rOperator = 6,
	vMax = 2048,
	vPMax = 1,
	rBase = 10,
	depth = 90

var minEntropy = {
    'symmetric' : 100,
    'modulus' : 2048,
    'logarithmKey' : 200,
    'logarithmGrp' : 2048,
    'ec' : 200,
    'hash' : 200,
    'pwd' : 20
}
// Reference to model
var root, model, trust

//Update if blue and set to red
var blue = 1

/****************************************************************
 *                  TOOLTIP SETTER
 ***************************************************************/
 var div, divData, divTrust;
function initTooltip(){
  div = d3.select('#viz-div').append('div')
      .attr('class', 'tooltip')
      .attr('id', 'tooltip-div')
      .style('opacity', 0);
  // DATA SETUP TOOLTIP
  divData = d3.select('#viz-div').append('div')
      .attr('class', 'setData')
      .attr('id', 'setEntropy-div')
      .style('opacity', 0)
  // TRUST SETUP TOOLTIP
  divTrust = d3.select('#viz-div').append('div')
      .attr('class', 'setTrust')
      .attr('id', 'setTrust-div')
      .style('top', '25px')
      .style('left', '25px')
      .style('opacity', 0);


  var divText = divData.append('div')
  var divInput = divData.append('div')

  divText.append('label')
      .attr('id', 'setEntropy-name')
      .style('display', 'block')
      .style('text-align', 'left')
      .style('position', 'relative')
      .style('bottom', '0px')
      .style('left', '5px')
      .style('width', '130px')
      .text('...')
  divText.append('label')
      .attr('id', 'setEntropy-min')
      .style('display', 'block')
      .style('text-align', 'left')
      .style('position', 'relative')
      .style('bottom', '-2px')
      .style('left', '5px')
      .style('width', '130px')
      .text('...')

  divInput.append('label')
      .attr('id', 'setEntropy-value')
      .style('display', 'inline-block')
      .style('text-align', 'left')
      .style('position', 'relative')
      .style('bottom', '0px')
      .style('margin-bottom', '0px')
      .style('left', '5px')
      .style('width', '80px')
      .append('span')
      .text('...')
      .attr('for', 'setEntropy')

  divInput.append('input')
      .attr('id', 'setEntropy')
      .style('display', 'inline-block')
      .attr('type', 'range')
      .attr('min', '0')
      .attr('max', '4096')
      .attr('value', '0')
      .style('width', '80px')
      .style('text-align', 'right')
      .style('position', 'relative')
      .style('bottom', '-5px')

  d3.select('body:not(#setEntropy-div)')
    .on('click',function(d){
      divData.transition()
          .duration(500)
          .style('opacity', 0)
    })

  d3.select('#setEntropy').on('input', function(){
    var name = this.nodename,
        value = parseInt(this.value),
        update = {}
        update[name] =  value
    setEntropy(update)
  })
}

/****************************************************************
 *                  TRUST SETTER
 ***************************************************************/
function initTrustPanel(){
    // CLEAR TRUST DIV
    divTrust.selectAll('*').remove()
    divTrust.append('label')
        .style('display', 'inline-block')
        .style('text-align', 'left')
        .style('position', 'relative')
        .style('bottom', '0px')
        .style('left', '5px')
        .style('width', '100px')
        .text('Trust in actors:')
    var size = 1

    // ADD TRUST INPUT
    for (var trustee in trust) {
        addTrustInput(trustee, trust[trustee])
        size ++
    }
    // SET SIZE
    divTrust.style('height', 25*size+'px')
    // SET POSITION
    divTrust.style('opacity', 1)
}

function addTrustInput(trustee, value) {
    var divTrustLine = divTrust.append('div')
    divTrustLine.append('label')
        .style('display', 'inline-block')
        .style('text-align', 'left')
        .style('position', 'relative')
        .style('bottom', '0px')
        .style('margin-bottom', '0px')
        .style('left', '5px')
        .style('width', '25px')
        .text(trustee+': ')
    var trustValue = divTrustLine.append('label')
        .attr('id', 'setTrust-value-'+trustee)
        .style('display', 'inline-block')
        .style('text-align', 'center')
        .style('position', 'relative')
        .style('bottom', '0px')
        .style('margin-bottom', '0px')
        .style('left', '5px')
        .style('width', '25px')
        .append('span')
        .text(value)
        .attr('for', 'setTrust-'+trustee)
    var trustInput = divTrustLine.append('input')
        .attr('id', trustee)
        .attr('type', 'range')
        .attr('min', '0')
        .attr('max', '10')
        .attr('value', value*10)
        .style('display', 'inline-block')
        .style('width', '80px')
        .style('text-align', 'right')
        .style('position', 'relative')
        .style('bottom', '-5px')

    trustInput.on('input', function(){
      var update = {}
      update[trustee] = this.value/10
      setActorTrust(update, false)
    })
}

/****************************************************************
 *                  MODEL INIT
 ***************************************************************/
 var svg, tree;
 var margin, width, height;
function initModel(newWidth, newHeight){
  // SVG and TREE and SIZE
  margin = {top: 60, right: 60, bottom: 60, left: 60},
  	width = newWidth - margin.right - margin.left,
  	height = newHeight - margin.top - margin.bottom;

  // Make it responsive
  var svgFixed = d3.select('#viz-div')
      .classed('svg-container', true)
      .append('svg')
      //responsive SVG needs these 2 attributes and no width and height attr
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 "+newWidth+" "+newHeight)
      //class to make it responsive
      .classed("svg-content-responsive", true);

  tree = d3.layout.tree()
  svg = svgFixed.append('g')
      .style('z-index', 0)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  if (height > 0) {
  tree =tree.size([width, height]);
  svgFixed.style('width', '100%')// width + margin.right + margin.left)
      .style('height', height + margin.top + margin.bottom + 'px')
  } else {
    // Else skip showing SVG
    svgFixed.style('height', '0px')
    // Hide trust toolip
    divTrust.style('opacity', 0)
  }
  initTooltip()
  initTrustPanel()
}


/****************************************************************
 *                  MODEL UPDATE
 ***************************************************************/


function resize(newWidth, newHeight) {
}

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * depth; });
  // Declare the nodes�
  var node = svg.selectAll('g.node')
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // ENTER NODES
  var nodeEnter = node.enter().append('g')
	  .attr('class', 'node')
	  .attr('transform', function(d) {
	  	return 'translate(' + d.x + ',' + d.y + ')'; })
  // ENTROPY CIRCLE
  // ENTER
  nodeEnter.append('circle')
	  .attr('id', 'entropyCircle')
      .attr('r',function(d){
        if(d.op !== undefined)
          d.rNorm = rBase*2
        else
          d.rNorm = rBase

        return d.rNorm
      })
//	  .on('mouseover', function(d) {
//            div.transition()
//                .duration(200)
//                .style('opacity', .9)
//            div.html(d.value + ' bits')
//            	.style('left', d.x + Math.sqrt((d.rNorm*d.rNorm)/2)+ 2* rOperator + margin.left + 2 +'px')
//            	.style('top', d.y + Math.sqrt((d.rNorm*d.rNorm)/2) + margin.top + 10 +'px')
//      })
      .on('mouseout', function(d) {
            div.transition()
                .duration(500)
                .style('opacity', 0);
      })
	  .on('dblclick',function(d){
	      //LEAF ELSE DO NOTHING
		  if(d.children == undefined && d.aux_children == undefined){
		  	div.transition()
          		.duration(500)
          		.style('opacity', 0);
          	divData.transition()
            	.duration(200)
            	.style('opacity', 1)
          	divData.style('left', d.x + Math.sqrt((d.rNorm*d.rNorm)/2)+ 2* rOperator + margin.left + 2 +'px')
            	.style('top', d.y + Math.sqrt((d.rNorm*d.rNorm)/2) + margin.top + 10 +'px')

			d3.select('#setEntropy-name')
				.text('Category: '+d.type)
			d3.select('#setEntropy-min')
				.text('MinRec: '+minEntropy[d.type]+' bits')
			d3.select('#setEntropy')
				.property('value', d.bits)
				.property('max', minEntropy[d.type]*2 > d.bits ? minEntropy[d.type]*2 : d.bits)
				.property('nodename', d.name)
			console.log(d)
			d3.select('#setEntropy-value')
				.text(d.bits+' bits')
		}
	  })
  // UPDATE
  node.selectAll('#entropyCircle')
	  .style('fill', function(d){
          return setNodeColor(d)
	  })
	  .style('stroke', function(d){
          return setNodeColor(d)
	  })

  // OPERATOR CIRCLE
  // ENTER
  var trans = Math.sqrt((rOperator*rOperator)/6)
  nodeEnter.filter(function(d){ return (d.op !== 'null' && d.op !== undefined)})
      .append('circle')
	  .attr('id', 'op-symbol')
	  .attr('r', rOperator)
	  .style('fill', '#FFFFFF')
	  .style('stroke', '#000000')
	  .style('stroke-width', '2px')

  //AVERAGE
  nodeEnter.append('line')
	  .attr('id', 'op-symbol')
	      .filter(function(d){ return d.op === 'AVG' })
	      .attr('x1', -trans)
	      .attr('y1', trans)
	      .attr('x2', trans)
	      .attr('y2', -trans)
	  .style('fill', function(d){
		  if(d.children == undefined) return '#FFFFFF'
		  else return '#FFFFFF'
	  })
	  .style('stroke-width', '2px')
	  .style('stroke', function(d){
		  if(d.children == undefined) return '#000000'
		  else return '#000000'
	  })

  //MIN
  nodeEnter.append('line')
	  .attr('id', 'op-symbol')
	      .filter(function(d){ return d.op === 'MIN' })
	      .attr('x1', - rOperator/2)
	      .attr('y1', 0)
	      .attr('x2', + rOperator/2)
	      .attr('y2', 0)
	  .style('fill', function(d){
		  if(d.children == undefined) return '#FFFFFF'
		  else return '#FFFFFF'
	  })
	  .style('stroke-width', '2px')
	  .style('stroke', function(d){
		  if(d.children == undefined) return '#000000'
		  else return '#000000'
	  })
  //SUM 1/2
  nodeEnter.append('line')
	  .attr('id', 'op-symbol')
	      .filter(function(d){ return d.op === 'SUM' })
	      .attr('x1', - rOperator/2)
	      .attr('y1', 0)
	      .attr('x2', + rOperator/2)
	      .attr('y2', 0)
	  .style('fill', function(d){
		  if(d.children == undefined) return '#FFFFFF'
		  else return '#FFFFFF'
	  })
	  .style('stroke-width', '2px')
	  .style('stroke', function(d){
		  if(d.children == undefined) return '#000000'
		  else return '#000000'
	  })
  //SUM 2/2
  nodeEnter.append('line')
	  .attr('id', 'op-symbol')
	      .filter(function(d){ return d.op === 'SUM' })
	      .attr('x1', 0)
	      .attr('y1', - rOperator/2)
	      .attr('x2', 0)
	      .attr('y2', + rOperator/2)
	  .style('fill', function(d){
		  if(d.children == undefined) return '#FFFFFF'
		  else return '#FFFFFF'
	  })
	  .style('stroke-width', '2px')
	  .style('stroke', function(d){
		  if(d.children == undefined) return '#000000'
		  else return '#000000'
	  })
  // UPDATE
  node.selectAll('#op-symbol')
	  .attr('transform', translateOpNode);


// COMPONENT NODE TITLE
  nodeEnter
    .filter(function(d){ return (d.op !== undefined)})
    // NAME LABEL
    .append('text')
	  .attr('id', 'node-name')
	  .attr('x', 0)
	  .attr('dy', 5)
	  .attr('text-anchor', 'middle')
	  .text(function(d) {
        var text = d.altname || d.name
        if(d.op !== undefined)
          return text
        if (d.X !== undefined) {
          text += '('+d.X+','+d.Y+')'
        }
        return text
      })
	  .style('fill-opacity', 1)

// REQUIREMENT NODE TITLE
  nodeEnter
    .filter(function(d){ return (d.op == undefined)})
    // NAME LABEL
    .append('text')
	  .attr('id', 'node-name')
	  .attr('x', 15 )
	  .attr('dy', 0 )
	  .attr('text-anchor', 'left')
	  .text(function(d) {
        var text = d.altname || d.name
        if(d.op !== undefined)
          return text
        if (d.X !== undefined) {
          text += '('+d.X+','+d.Y+')'
        }
        return text
      })
	  .style('fill-opacity', 1)
  nodeEnter
    .filter(function(d){ return (d.op == undefined)})
    // NAME LABEL
    .append('text')
	  .attr('id', 'value-label')
	  .attr('x', 25 )
	  .attr('dy', 15 )
	  .attr('text-anchor', 'left')
	  .text(function(d) {
        return 't= '+d.value.toFixed(2)
      })
	  .style('fill-opacity', 1)
  nodeEnter
    .filter(function(d){ return (d.op == undefined)})
    // NAME LABEL
    .append('text')
	  .attr('id', 'wvalue-label')
	  .attr('x', 25 )
	  .attr('dy', 30 )
	  .attr('text-anchor', 'left')
	  .text(function(d) {
        return 'wt= '+ (d.w_value != undefined ? d.w_value : d.value).toFixed(2)
      })
	  .style('fill-opacity', 1)


  // UPDATE
  node.selectAll('#value-label')
	  .text(function(d) {
        return 't= '+d.value.toFixed(2)
      })
  node.selectAll('#wvalue-label')
	  .text(function(d) {
        return 'wt= '+ (d.w_value != undefined ? d.w_value : d.value).toFixed(2)
      })

  // Declare the links�
  var link = svg.selectAll('path.link')
	  .data(links, function(d) { return d.target.id; });
  // Enter the links.
  link.enter().insert('path', 'g')
	  .attr('class', 'link')
	  .attr('d', diagonal)
}

// RESTART EXPLORATION FROM EACH NODE IN TREE WITH TRUSTED WEIGHT
function computeAllWeightedTrust(node) {
    // Do nothing for leaf
    if (node.children == undefined && node.aux_children == undefined) return;
    // Explore children but not aux
    if (node.children) node.children.forEach(computeAllWeightedTrust)
    // Compute for this if it's a requirement
    if (!node.op) node.w_value = computeWeightedTrust(node, new Set())
}

function computeWeightedTrust(node, actorSet) {
    var nodeTrust = 0
    // IF NODE IS LEAF RETURN VALUE WITH WEIGHT
	if(node.children == undefined && node.aux_children == undefined){
        nodeTrust = node.value
        actorSet.forEach(function(actor, index, array){
            nodeTrust = nodeTrust * trust[actor]
        })
	} else {
        switch (node.op) {
            case 'MIN':
                nodeTrust = MINTrust(node, actorSet)
            break;
            case 'SUM':
            case 'AVG':
                var num = 0
                if (node.children) {
                    nodeTrust = SUMTrust(node, node.children, actorSet)
                    num += node.children.length
                } if(node.aux_children){
                    nodeTrust = SUMTrust(node, node.aux_children, actorSet)
                    num += node.children.length
                }
                if (node.op == 'AVG') nodeTrust = nodeTrust/num
                if(nodeTrust > 1) nodeTrust = 1
            break;
            default:
                nodeTrust = defaultTrust(node, actorSet)
            break;
        }
    }
    return nodeTrust
}root

function MINTrust(parent, actorSet) {
    var nodeTrust = 1
    if (parent.children) {
        parent.children.forEach(function(child, index, array){
            var t = computeWeightedTrust(child, actorSet)
            if (t<nodeTrust) nodeTrust = t
        })
    } if(parent.aux_children){
        parent.aux_children.forEach(function(child, index, array){
            var t = computeWeightedTrust(child, actorSet)
            if (t<nodeTrust) nodeTrust = t
        })
	}
    return nodeTrust
}
function SUMTrust(parent, children, actorSet) {
    var nodeTrust = 0
    children.forEach(function(child, index, array){
            nodeTrust += computeWeightedTrust(child, actorSet)})
    return nodeTrust
}
function defaultTrust(parent, actorSet) {
	// TEST IF ONLY ONE CHILD
    var child
	if(parent.aux_children == undefined && parent.children.length == 1)
        child = parent.children[0]
	else if(parent.children == undefined && parent.aux_children.length == 1)
        child = parent.aux_children[0]
	else {
		alert('Error: no operator set for node '+parent.name+'\n '+ parent)
        return -1
	}
    // TEST IF OP=NULL (COMPONENT WITH ONE CHILD)
    if (parent.op == 'null')  return computeWeightedTrust(child, actorSet)
    // CREATE NEW ACTOR SET WITH X AND Y ADDED
    var localActorSet = new Set(actorSet)
    if (parent.X != undefined)
        localActorSet.add(parent.X)
    if (parent.Y != undefined)
        localActorSet.add(parent.Y)
    // TODO Don't add actor if actor is passive
    // EXPLORE NEXT NODE
    return computeWeightedTrust(child, localActorSet)
}


//updates : [{name: value}*]
function updateTrust(node, updates){
    // ALREADY UPDATED (we don't really work with a tree)
    if (node.blue == blue) return ;
    // Else (red) count as updated
    node.blue = blue
	// UPDATE LEAF VALUE (PRIMITIVE)
	if(node.children == undefined && node.aux_children == undefined){
        if(updates[node.name] != undefined) normNodeValue(node, updates[node.name])
        else if(Object.keys(updates).length == 0) normNodeValue(node)
	} else {
        // UPDATE REQUIREMENT VALUE
        // APPLY OPERATOR
		switch(node.op){
		case 'MIN':
			node.value = 1
			node.children.forEach(MIN, {'parent': node, 'updates': updates})
			if(node.aux_children)
				node.aux_children.forEach(MIN, {'parent': node, 'updates': updates})
		break;
		case 'SUM':
        case 'AVG':
			node.value = 0
            var num = 0
            if (node.children) {
                node.children.forEach(SUM, {'parent': node, 'updates': updates})
                num += node.children.length
            } if(node.aux_children){
				node.aux_children.forEach(SUM, {'parent': node, 'updates': updates})
				num += node.aux_children.length
			}
            //Normalization max at 1
            if (node.op == 'AVG') node.value = node.value/num
            if(node.value > 1) node.value = 1
		break;
		default:
			DEFAULTOP(node, updates)
		break;
		}
	}
}

function SUM(child, index, array){
	updateTrust(child, this.updates)
	this.parent.value += child.value
}
function MIN(child, index, array){
	updateTrust(child, this.updates)
	if (this.parent.value > child.value)
		this.parent.value = child.value
}
function DEFAULTOP(parent, updates){
	// TEST IF ONLY ONE CHILD
	if(parent.aux_children == undefined && parent.children.length == 1){
        updateTrust(parent.children[0], updates)
		parent.value = parent.children[0].value
	} else if(parent.children == undefined && parent.aux_children.length == 1){
        updateTrust(parent.aux_children[0], updates)
		parent.value = parent.aux_children[0].value
	} else {
		alert('Error: no operator set for node '+parent.name+'\n '+ parent)
        parent.value = -1
	}
}

function auxLink(){
	var couplingParent1 = tree.nodes(root).filter(function(d) {
            return d['name'] === 'DTLS-SRTPAB';
        })[0];
	var couplingChild1 = tree.nodes(root).filter(function(d) {
            return d['name'] === 'authAB';
        })[0];

	multiParents = [{
                    parent: couplingParent1,
                    child: couplingChild1
                }];

	multiParents.forEach(function(multiPair) {
            svg.append('path', 'g')
            .attr('class', 'additionalParentLink')
                .attr('d', function() {
                    var oTarget = {
                        x: multiPair.parent.x,
                        y: multiPair.parent.y
                    };
                    var oSource = {
                        x: multiPair.child.x,
                        y: multiPair.child.y
                    };
					//TRANSFORM

					oSource.y -= oSource.x

                    /*if (multiPair.child.depth === multiPair.couplingParent1.depth) {
                        return 'M' + oSource.y + ' ' + oSource.x + ' L' + (oTarget.y + ((Math.abs((oTarget.x - oSource.x))) * 0.25)) + ' ' + oTarget.x + ' ' + oTarget.y + ' ' + oTarget.x;
                    }*/
                    return diagonal({
                        source: oSource,
                        target: oTarget
                    });
                });
        });
}

function translateNode(d){
	return 'translate('+ d.rNorm + ',' + d.rNorm + ')'}
function translateOpNode(d){
	return 'translate('+ (Math.sqrt((d.rNorm*d.rNorm)/2)) + ',' + (Math.sqrt((d.rNorm*d.rNorm)/2)) + ')'}
function translateValue(d){
	return 'translate('+ (Math.sqrt((d.rNorm*d.rNorm)/2) + rOperator*2) + ',' + (Math.sqrt((d.rNorm*d.rNorm)/2)) + ')'}

function applyTrust(value, trustW){
  //Value is in power base 2
  //Trust is in base 10
  //Switch trust in base 2 and add it to value
  var v = value + Math.log2(trustW)
  return (v >= 0 ? v : 0)
}

function normNodeValue(node, update) {
    node.bits = (update == undefined) ? node.value : update
    var min = minEntropy[node.type]
    node.value = (node.bits >= min) ? 1 : Math.pow(2,node.bits-min)
}

function setNodeColor(d) {
  if (d.children == undefined)
    return d3.rgb(50,50,50)
  else if(d.op !== undefined)
    return d3.rgb(175,175,175)
  else{
    var xr = d.w_value < 0.5 ? 1 : 2-d.w_value/0.5
    var xg = d.w_value < 0.5 ? (d.w_value-0.5)/0.5 : 1
    return d3.rgb(35+202*xr, 35+202*xg, 35)
  }
}

function reloadTrustModel(jsonModel, newWidth, newHeight){
    model = jsonModel
    root = model.model
    trust = model.trust
    clearModel()
    initModel(newWidth,newHeight)
    svg.selectAll('g > *').remove()
    setEntropy({})
}

function clearModel() {
  d3.selectAll('#viz-div > *').remove()
}

/****************************************************************
 *                  EDIT AND UPDATE MODEL
 ***************************************************************/
function setEntropy(entropyUpdates){
    var updates = Object.keys(entropyUpdates)
    if(updates.length == 1){
      d3.select('#setEntropy-value').text(entropyUpdates[updates[0]]+' bits');
      d3.select('#setEntropy').property('value', entropyUpdates[updates[0]]);
    }
    updateTrust(root, entropyUpdates)
    computeAllWeightedTrust(root)
    update(root)
    //Reverse blue (nodes are not on updtated status anymore)
    blue = blue==0? 1:0
}
function setActorTrust(trustUpdates, externalInput){
    for(var actor in trustUpdates){
      trust[actor] = trustUpdates[actor]
      divTrust.select('#setTrust-value-'+actor).text(trustUpdates[actor])
      if(externalInput)
        divTrust.select('#'+actor).property('value', trustUpdates[actor]*10)
    }
    computeAllWeightedTrust(root)
    update(root)
}
