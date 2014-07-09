var http = require('http'),
    https = require('https');

var express = require('express'),
    app = express.createServer();

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.use(express.static(__dirname + '/static'));

app.get('/token', function(req, res){
    var data = {
        grant_type: 'authorization_code',
        code: req.param('code'),
        redirect_uri: req.param('uri'),
        client_id: 'sp-demo',
        client_secret: 'hunter2'
    };
    var opt = {
        hostname: req.param('server'),
        port: req.param('port'),
        path: '/token',
        method: 'POST',
        headers: {
            'User-Agent': 'Stuff Nation OAuth2 Demo',
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
    };
    var proto = req.param('ssl') ? https : http;
    var auth_req = proto.request(opt, function(auth_res){
        var auth_data = '';
        auth_res.on('data', function(d){ auth_data += d; });
        auth_res.on('end', function(){
            var j = {error: 'Unknown error'};
            try{
                j = JSON.parse(auth_data);
            }catch(ex){
                console.log(ex);
            }
            if (j.error){
                res.statusCode = 401;
            }
            res.json(j);
        });
    });
    auth_req.write(JSON.stringify(data));
    auth_req.end();
    auth_req.on('error', function(err){
        var es = JSON.stringify(err);
        console.log(opt.hostname + ':' + opt.port + opt.path + ' - ' + es);
        res.send(503);
    });
});

app.get('/refresh', function(req, res){
    var data = {
        grant_type: 'refresh_token',
        refresh_token: req.param('token'),
        redirect_uri: req.param('uri'),
        client_id: 'sp-demo',
        client_secret: 'hunter2'
    };
    var opt = {
        hostname: req.param('server'),
        port: req.param('port'),
        path: '/token',
        method: 'POST',
        headers: {
            'User-Agent': 'Stuff Nation OAuth2 Demo',
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
    };
    var proto = req.param('ssl') ? https : http;
    var auth_req = proto.request(opt, function(auth_res){
        var auth_data = '';
        auth_res.on('data', function(d){ auth_data += d; });
        auth_res.on('end', function(){
            var j = {error: 'Unknown error'};
            try{
                j = JSON.parse(auth_data);
            }catch(ex){
                console.log(ex);
            }
            if (j.error){
                res.statusCode = 401;
            }
            res.json(j);
        });
    });
    auth_req.write(JSON.stringify(data));
    auth_req.end();
    auth_req.on('error', function(err){
        var es = JSON.stringify(err);
        console.log(opt.hostname + ':' + opt.port + opt.path + ' - ' + es);
        res.send(503);
    });
});


var port = 9000;

console.log('Starting dummy-client-site on port ' + port);
app.listen(port);
