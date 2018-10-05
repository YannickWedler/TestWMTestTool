/**
 * Created by wedler on 25.09.2018.
 */
//serv vars
var requestString = "";
var receivedString = "";
var requestErrString = "";

//Server
const express = require('express');
const app = express();
//MiddleWare (function have access to req and res bodies)
const bodyParser = require('body-parser');
//create Request
const request = require('request');
//
var pageObject = "//";
/* express won't use us css file by default, we must expose it
 we expose public folder -> everything in there can be used now */
app.use(express.static('public'));
//MiddleWare -> make use of the req.body Object
app.use(bodyParser.urlencoded({ extended: true}));
//app.use(bodyParser.json());

//set up ejs Template Engine
app.set('view engine', 'ejs');

//render index.ejs
app.get('/', function(req, res) {
    res.render('index');
});

//post request from FORM Sub (index.ejs)
app.post('/', function(req, res) {
    console.log(req.body.url);
    var urlForm = req.body.url;

    request(urlForm, function(err, response, body) {
        if (err) {
            res.render('index', {urlForm: null, error: 'Error, please try again!'});
        } else {
            phantomStart(urlForm);
            console.log("pageObject in Show: ");
            res.render('show', {urlForm: urlForm, error: null, pageObject: pageObject, requestString: requestString});
            //console.log('logBody: ', (body));
        }
    });
});

//listen on Port 3000
app.listen(3000, function() {
   console.log('Example app listening on port 3000!');
});


function phantomStart(urlForm) {
    var phantom = require('phantom');
    var fs = require('fs');
    var _ph, _page, _outObj;

    phantom
        .create()
        .then(function(ph) {
        _ph = ph;
    return _ph.createPage();
})//open URL
.then(function(page){
        _page = page;
    //get Requests/Received
    GetRequests(_page);
    GetReceived(_page);
    console.log("pageObject in phatomJS: ");
    return _page.open(urlForm);
})//
.then(function(status) {
    console.log("get Status: ", status);
    return _page.property('content');
})
.then(function(content){
    console.log("close page");
    _page.close().then(function() {
        _ph.exit();
        console.log("exit instance");
    });
})
.catch(function(e) {
    console.log(e)
});

    //Functions
    function GetRequests(page) {
        //get Reuqests
        page.on('onResourceRequested', function(requestData) {
            requestString += JSON.stringify(requestData, null, 4);
            fs.writeFileSync('requestJson.txt', requestString, function (err) {
                if (err) throw err;
                console.log('Saved Request!');
            });
        });
        //get RequestErros
        //get Errors
        page.on('onResourceError', function(resourceError) {
            requestErrString += JSON.stringify(resourceError, null, 4);
            fs.writeFileSync('requestErrorJson.txt', requestErrString, function(err) {
                if (err) throw err;
                console.log("Saved Request Error!");
            });
        });
    }

    function GetReceived(page) {
        //get Received
        page.on('onResourceReceived', function(responseData) {
            receivedString += JSON.stringify(responseData, null, 4);
            fs.writeFileSync('receivedJson.txt', receivedString, function(err) {
                if (err) throw err;
                console.log("Saved Received!");
            });
        });
    }

    //evaluate data

}





