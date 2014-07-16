function origin(){
    var a = window.location.href.match(/([^#?]*)/);
    return a ? a[1] : window.location.origin;
}

var oauth2 = (function(){
    var auth_server = 'auth.medusa.stuff.co.nz',
        auth_port = '443',
        auth_use_ssl = true,
        auth_uri = (auth_use_ssl ? 'https' : 'http') + '://' + auth_server + ':' + auth_port;

    var links = {
        'token-login': auth_uri +  '/authorize' +
                                    '?response_type=token' +
                                    '&client_id=sp-demo' +
                                    '&redirect_uri=' + origin(window.location.href),
        'code-login': auth_uri +  '/authorize' +
                                    '?response_type=code' +
                                    '&client_id=sp-demo' +
                                    '&redirect_uri=' + origin(window.location.href),
        'code-used': window.location.origin + '/token',
        'refresh-token': window.location.origin + '/refresh',
        'token-used': auth_uri +'/api/profile',
        'review': auth_uri +    '/review' +
                                    '?client_id=sp-demo' +
                                    '&redirect_uri=' + origin(window.location.href)
    };

    return {
        links: links,
        auth_uri: auth_uri,
        do_logout: function(){
            window.location.href =  auth_uri + '/logout' +
                                    '?redirect_uri=' + origin(window.location.href);
        },
        do_login: function(what){
            window.location.href = links[what + '-login'];
        },
        trigger_code_exchange_api: function(good, access_denied, bad){
            var post_data = {
                'code': oauth2.code_grant.get(),
                'server': auth_server,
                'port': auth_port,
                'uri': origin(window.location.href)
            };
            if (auth_use_ssl){
                post_data.ssl = true;
            }
            $.ajax({
                cache: false,
                data: post_data,
                statusCode: {
                    401: access_denied
                },
                success: function(data){
                    localStorage.setItem('access_token_response', JSON.stringify(data, null, 3));
                    console.log('setItem(access_token_response)');
                    good && good(data);
                },
                error: function(){
                    bad && bad();
                },
                type: 'GET',
                url: links['code-used']
            });
        },
        trigger_refresh_api: function(good, access_denied, bad){
            var post_data = {
                'token': oauth2.token_grant.refresh_token(),
                'server': auth_server,
                'port': auth_port,
                'uri': origin(window.location.href)
            };
            if (auth_use_ssl){
                post_data.ssl = true;
            }
            $.ajax({
                cache: false,
                data: post_data,
                statusCode: {
                    401: access_denied
                },
                success: function(data){
                    localStorage.setItem('access_token_response', JSON.stringify(data, null, 3));
                    good && good(data);
                },
                error: function(){
                    bad && bad();
                },
                type: 'GET',
                url: links['refresh-token']
            });
        },
        do_profile_api: function(good, bad){
            $.ajax({
                cache: false,
                crossDomain: true,
                beforeSend: function(xhr){
                    xhr.setRequestHeader('Authorization', 'Bearer ' + oauth2.token_grant.access_token());
                },
                success: good,
                error: bad,
                type: 'GET',
                url: links['token-used']
            });
        },
        do_review: function(){
            window.location.href =  links['review'];
        },
        code_grant: {
            get: function(){
                var code = localStorage.getItem('code_grant');
                var ur = window.location.search.match(/code=([^&]+)/);
                if (ur){
                    code = ur[1];
                    localStorage.setItem('code_grant', code);
                }
                return code;
            }
        },
        token_grant: {
            toString: function(){
                return localStorage.getItem('access_token_response');
            },
            get: function(){
                var t = localStorage.getItem('access_token_response');
                var ur = window.location.hash.match(/access_token=([^&]+)/);
                var obj = undefined;
                if (ur){
                    obj = {access_token: ur[1]};
                    localStorage.setItem('access_token_response', JSON.stringify(obj, null, 3));
                }else{
                    if (t){
                        try{ obj = JSON.parse(t); }
                        catch(ex){}
                    }
                }
                return obj;
            },
            access_token: function(){
                var t = oauth2.token_grant.get();
                return t ? t.access_token : undefined;
            },
            refresh_token: function(){
                var t = oauth2.token_grant.get();
                return t ? t.refresh_token : undefined;
            }
        }
    };
})();

var ui = (function(){
    return {
        set_status: function(which, what){
            try{
                $('#' + which).removeClass('completed');
                var icon = $('#' + which + ' > h2 > span').removeClass('glyphicon-ok glyphicon-remove');
                if (what){
                    $('#reset_btn').removeClass('btn-default').addClass('btn-danger');
                    localStorage.setItem(which, what);
                    switch(what){
                        case 'good':
                            icon.addClass('glyphicon-ok');
                            $('#' + which).addClass('completed');
                            break;
                        case  'bad':
                            icon.addClass('glyphicon-remove');
                            break;
                    }
                }else{
                    localStorage.removeItem(which);
                }
            }catch(ex){
                alert(ex);
            }
        },
        token_exchange_example: function(code){
            var data = {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: origin(window.location.href),
                client_id: 'sp-demo',
                client_secret: 'hunter2'
            };
            return  'echo \'' + JSON.stringify(data, null, 3) +
                    '\' | curl -k -i -d @- -H "Content-Type:application/json" ' + oauth2.auth_uri + '/token';
        },
        token_refresh_example: function(token){
            if (!token){
                return 'No Data';
            }
            var data = {
                grant_type: 'refresh_token',
                refresh_token: token,
                redirect_uri: origin(window.location.href),
                client_id: 'sp-demo',
                client_secret: 'hunter2'
            };
            return  'echo \'' + JSON.stringify(data, null, 3) +
                    '\' | curl -k -i -d @- -H "Content-Type:application/json" ' + oauth2.auth_uri + '/token';
        },
        profile_api_example: function(token){
            if (!token){
                return 'No Data';
            }
            return 'curl -k -i -H "Authorization:Bearer ' + token + '" ' + oauth2.auth_uri + '/api/profile';
        }
    };
})();
