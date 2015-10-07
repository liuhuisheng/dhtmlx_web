var http    = require('http'),
    url     = require('url'),
    path    = require('path'),
    fs      = require('fs');

var passedArgs  = process.argv.splice(2),
    argCount    = passedArgs.length,
    args        = {},
    defaults    = {
        port    : 8080,
        root    : process.cwd(),
        domain  : '0.0.0.0',
        index   : 'index.html',
        log     : false
    };

for(var i=0; i<argCount; i++){
    var data=passedArgs[i].split('=');
    args[data[0]]=data[1];
}

if(args.launch=='now')
    deploy();

/**************************************\
 * 
 *    These are the valid configs 
 *    that can be passed when deploying
 *    a server, content types are dynamic
 *    you can pass whatever you like
 * 
 * ************************************/
 
function config(userConfig){
    var config={
        verbose     : (args.verbose=='true')||false,
        port        : args.port||defaults.port,
        root        : args.root||defaults.root,
        domain      : args.domain||defaults.domain,
        log         : false,
        //pass this as config for custom logging
        logFunction : serverLogging,
        domains   : {
            /*******************\
             * domain  : /that/domains/root/dir
             * 
             * for sub domains, specify the whole host i.e. "my.sub.domain"
             * you may need to edit your hosts file, cnames or iptable 
             * domain or my.domain etc. goes to 127.0.0.1 for local development
             * *****************/
        },
        server      : {
            index   : args.index||defaults.index,
            noCache : (args.noCache=='false')||true
        },
        contentType : {
            html    : 'text/html',
            css     : 'text/css',
            js      : 'text/javascript',
            json    : 'application/json',
            txt     : 'text/plain',
            jpeg    : 'image/jpeg',
            jpg     : 'image/jpeg',
            png     : 'image/png',
            gif     : 'image/gif',
            ico     : 'image/x-icon',
            appcache: 'text/cache-manifest'
        },
        restrictedType: {
            
        },
        errors:{
            headers : {
                'Content-Type' : 'text/plain'
            },
            404: '404 MIA',
            415: '415 File type not supported',
            403: '403 Access Denied',
            500: '500 {{err}}'
        }
    }
    
    if(userConfig){
        for(var k in userConfig){
            config[k]=userConfig[k];
        }
    }
    
    function serverLogging(data){
        fs.exists(
            config.log,
            function(exists){
                data.timestamp=new Date().getTime();
                
                var JSONData=JSON.stringify(data);
                var method='appendFile';
                if(!exists)
                    method='writeFile'
                    
                fs[method](
                    config.log, 
                    JSONData, 
                    function (err) {
                        if(err) 
                            console.log(err);
                    }
                );    
            }
        );
    }
    
    return config;
};

function deploy(userConfig){
    var server=http.createServer(
        requestRecieved
    );
    server.config=config(userConfig);
    server.config.logID='### '+server.config.domain+' server';
    
    if(server.config.verbose)
        console.log(server.config.logID+' configured with ###\n\n',server.config);
        
    server.listen(server.config.port);
    
    if(server.config.verbose)
        console.log(server.config.logID+' listening on port '+server.config.port+' ###\n\n');
    
    function serveFile(filename,exists,response) {
        if(!exists) {
            if(server.config.verbose)
                console.log(server.config.logID+' 404 ###\n\n');
            serve(
                response,
                server.config.errors['404'],
                404,
                server.config.errors.headers
            );
            return;
        }
        
        var contentType = path.extname(filename).slice(1);
        
        //Only serve specified file types 
        if(!server.config.contentType){
            if(server.config.verbose)
                console.log(server.config.logID+' 415 ###\n\n');
            serve(
                response,
                server.config.errors['415'],
                415,
                server.config.errors.headers
            );
            return;
        }
        
        //default
        if (
            fs.statSync(filename).isDirectory()
        ){
            filename+='/'+server.config.server.index;
        }
        
        //Do not allow access to restricted file types
        if (
            server.config.restrictedType[contentType]
        ){
            if(server.config.verbose)
                console.log(server.config.logID+' 403 ###\n\n');
            serve(
                response,
                server.config.errors['403'],
                403,
                server.config.errors.headers
            );
            return;
        }
        
        fs.readFile(
            filename, 
            'binary', 
            function(err, file) {
                if(err) {
                    if(server.config.verbose)
                        console.log(server.config.logID+' 500 ###\n\n',err,'\n\n');
                    serve(
                        response,
                        server.config.errors['500'].replace(/\{\{err\}\}/g,err),
                        500,
                        server.config.errors.headers
                    );
                    return;
                }
        
                var headers = {
                    'Content-Type' : server.config.contentType[contentType]
                }
                
                if(server.config.server.noCache)
                    headers['Cache-Control']='no-cache, no-store, must-revalidate';
                
                serve(
                    response,
                    file,
                    200,
                    headers,
                    'binary'
                );
                
                if(server.config.verbose)
                    console.log(server.config.logID+' 200 ###\n\n',headers,'\n\n');
                
                return;
            }
        );
    }
    
    function serve(response,body,status,headers,encoding){
        //defaults to 200
        if(!status)
            status=200;
        
        //defaults to text/plain
        if(!headers){
            headers={
                'Content-type':'text/plain'
            }
            
            if(server.config.verbose)
                console.log(server.config.logID+' headers not specified ###\n\nheaders set to:\n',headers,'\n\n');
        }
        
       //defaults to utf8
        if(!encoding)
            encoding='utf8';
        
        response.writeHead(
            status, 
            headers
        );
        response.write(body,encoding);
        response.end();
        return;
    }
    
    function requestRecieved(request,response){
        if(server.config.log){
            var logData={
                method  : request.method,
                url     : request.url,
                headers : request.headers
            }
            
            server.config.logFunction(
                logData
            );
    
            if(server.config.verbose)
                console.log(logData);
        }
        var uri = url.parse(request.url);
        uri=uri.pathname;
        if (uri=='/')
            uri='/'+server.config.server.index;
        
        var hostname= request.headers.host.split(':'),
            root    = server.config.root;
        
        if(hostname[0]!=server.config.domain && server.config.domain!='0.0.0.0'){
            if(!server.config.domains[hostname[0]]){
                serveFile(hostname[0],false,response);
                return;
            }
            root=server.config.domains[hostname[0]];
        }
        
        if(server.config.verbose){
                console.log(server.config.logID+' REQUEST ###\n\n',
                    request.headers,'\n',
                    uri,'\n\n',
                    hostname,'\n\n'
                );
        }
        
        if(uri.slice(-1)=='/')
            uri+=server.config.server.index;
            
        var filename = path.join(
            root, 
            uri
        );
        
        fs.exists(
            filename,
            function(exists){
                serveFile(filename,exists,response)
            }
        );
    }
    
    
    return server;
}

module.exports={
    deploy          : deploy,
    configTemplate  : config
}

console.log('start http server');
console.log('path ' + process.cwd());
console.log('port 8080');

deploy(
    {
        port:8080,
        root: process.cwd()
    }
); 