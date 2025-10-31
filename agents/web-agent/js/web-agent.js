(function(){

    let oldDate = new Date();
    let requests = 0;
    const requests_limit = 50;
    const requests_time_period = 1500;
    const defaultReceiveRange = {globalOffset : 0, localOffset : 0 , limit: 20};
    let xhr_enabled = true;
    const channelPasswordRegex = /[*,\/\\\s]+/;

    "use strict";

    const MySecurity =  {

        encrypt : function($plain,$key){
            if(typeof $plain === 'object'){
                $plain = JSON.stringify($plain);
            }
            return AesCtr.encrypt($plain, $key, 128).replace(/[\0]+/g,'');
        },

        decrypt : function ($cipher,$key){
            try{
                return AesCtr.decrypt($cipher, $key, 128).replace(/[\0]+/g,'');
            }catch(err){
                console.log(err);
                return;
            }
        },
        encryptAndSign : function ($message, $key){
            if(typeof $message === 'object'){
                $message = JSON.stringify($message);
            }
            const $myObj = {};
            $myObj.cipher = this.encrypt($message, $key);
            $myObj.hash = this.hash($message, $key);
            return JSON.stringify($myObj);
        },

        hash: (value, key) =>  {
            return CryptoJS.HmacSHA256(value, key).toString(CryptoJS.enc.Hex);
            //return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex)
        },

        decryptAndVerify : function ($cipherMsg, $key){

            try{
                if(typeof $cipherMsg === 'string'){
                    $cipherMsg = JSON.parse($cipherMsg);
                }

                const $message = this.decrypt($cipherMsg.cipher, $key);

                if(this.hash($message, $key) !== $cipherMsg.hash){
                    return null;
                } else{
                    return $message;
                }
            }catch(err){
                console.log(err);
            }
        },

        deriveChannelSecret: async function (channelName, password) {

            const combined = channelName + password;
            const enc = new TextEncoder();

            // Import raw input
            const keyMaterial = await crypto.subtle.importKey(
                "raw",
                enc.encode(combined),
                { name: "PBKDF2" },
                false,
                ["deriveBits"]
            );

            // Derive 256-bit key
            const derivedBits = await crypto.subtle.deriveBits(
                {
                    name: "PBKDF2",
                    salt: enc.encode("messaging-platform"),
                    iterations: 100000,
                    hash: "SHA-256"
                },
                keyMaterial,
                256
            );

            // Convert to Base64
            const bytes = new Uint8Array(derivedBits);
            let binary = "";
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            let base64 = btoa(binary);

            return 'channel_' + base64.replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        }

    }

    function parsefileName(fileNameUrl){
        if(fileNameUrl){
            fileNameUrl = fileNameUrl.replace(/\\/g,'/').replace(/\/$/,'')
            let index = fileNameUrl.length-1
            while(index >=0 && fileNameUrl.charAt(index) !== '/'){
                index --;
            }

            return fileNameUrl.substring(index+1);
        }
    }

    function rangeNumber(num) {
        num = parseInt(num);
        return (isNaN(num) || !isFinite(num)) ? Infinity : num;
    }

    function parseRange(range){

        if (typeof range === 'object')
        {
            return range;
        }

        let seperator = range.indexOf(':') !== -1 ? ':' : '-'
        let start,change,end;
        const parts = range.split(seperator);
        if(parts.length >= 3){
            start = rangeNumber(parts[0]);
            change = rangeNumber(parts[1]);
            end = rangeNumber(parts[2]);
        }else{
            start = rangeNumber(parts[0]);
            end = rangeNumber(parts[1]);
        }

        if(start > end){
            const temp = start;
            start = end;
            end = temp;
        }

        return {start, change, end};
    }

    function guid8() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        let str = '';

        for(let i=0;i<4;i++){
            str = str + '' + s4();
        }

        return str;
    }

    function guid16() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        let str = '';

        for(let i=0;i<8;i++){
            str = str + '' + s4();
        }

        return str;
    }

    function guid32() {
        return guid16()+''+guid16();
    }

    function getPublicKey(obj){

        if(!xhr_enabled){
            return;
        }

        const xhrHandler = function(){
            let response;

            if(xhr.status === 200){
                response = {status : 'success',data : this.response};
            }else{
                response = {status : 'error',data : this.response};
            }

            typeof obj.callback === 'function' && obj.callback(response);
        }

        const xhr = new XMLHttpRequest();

        xhr.addEventListener('load', xhrHandler);
        xhr.addEventListener('error', function(err){
            const response = {status : 'error', data : this.response};
            typeof obj.callback === 'function' && obj.callback(response);
        });


        xhr.open('get',  getActionUrl(obj.base, false, 'public_key.php'), true);

        // Set API key header if provided (supports custom header name)
        if(obj.apiKey){
            const headerName = obj.apiKeyHeaderName || 'X-Api-Key';
            try{
                xhr.setRequestHeader(headerName, obj.apiKey);
            }catch(err){
                console.log('Unable to set API key header for public key request', err);
            }
        }

        xhr.send();

    }

    // Utility: generate RSA-OAEP keypair and return { publicKeyPem, privateKey }
    async function generateRsaKeyPair() {
        const keyPair = await window.crypto.subtle.generateKey(
            { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1,0,1]), hash: "SHA-256" },
            true,
            ["encrypt", "decrypt"]
        );

        const spki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
        const b64 = window.btoa(String.fromCharCode.apply(null, new Uint8Array(spki)));
        const pem = '-----BEGIN PUBLIC KEY-----\n' + b64.replace(/(.{64})/g,'$1\n') + '\n-----END PUBLIC KEY-----\n';

        return { publicKeyPem: pem, privateKey: keyPair.privateKey };
    }

    function reset(obj){
        requests = 0;
        xhr_enabled = false;
        setTimeout(function(){
            xhr_enabled = true;
        },5000);
        console.log('Something went wrong, you can try to connect after 5 seconds or you can use channel.onreset function');
    }

    function getActionUrl(url, pubkeyMode, action){
        let baseUrl = url;
        if(!baseUrl){
            baseUrl = '';
        }
        else if(baseUrl.endsWith('/'))
        {
            baseUrl = baseUrl.substring(0, baseUrl.length - 1);
        }
        return `${baseUrl}/${action}?use-pubkey=${pubkeyMode}`;
    }

    function preparePayload(payload, pubKeyEncryptor){
        if(payload){

            if(typeof payload === 'object'){
                payload = JSON.stringify(payload);
            }else{
                payload = payload.toString();
            }

            if (pubKeyEncryptor)
            {
                let cipher = '';

                for(let i=0;i<payload.length;i+=200){
                    cipher += pubKeyEncryptor.encrypt(payload.substring(i,i+200));
                }
                payload = cipher;
            }

        }else{
            payload = undefined;
        }

        return payload;
    }

    function abortRequest(xhr){
        if(xhr){
            xhr._dont_use_callback = true;
            try{
                xhr.abort();
            }catch(err){
                console.log(err);
            }
        }
    }

    function request(obj , binData){

        if(!xhr_enabled){
            return;
        }

        if(typeof obj.retryChances !== 'number'){
            obj.retryChances = 1;
        }

        obj.retryChances--;

        const newDate = new Date();

        if((newDate - oldDate) < requests_time_period){
            requests++;
        }else{
            requests = 0;
            oldDate = new Date();
        }

        if(requests > requests_limit){
            return reset(obj,binData);
        }

        let method = obj.method || 'get';
        method = method.toLowerCase();

        const action = obj.action;

        if(!action){
            throw new Error("action parameter is required");
        }

        let payload = (obj.payload != null && obj.payload) || undefined;

        const callback = obj.callback;

        const xhr = new XMLHttpRequest();

        const timeout = parseInt(obj.timeout);

        if(!obj.useSyncMode && !isNaN(timeout) && timeout > 0){
            xhr.timeout = timeout;//10 * 60 * 1000
        }

        let handled = false;
        const xhrHandler = function(){
            console.log('xhrHandler()');
            if(handled){
                return;
            }else{
                handled = true;
            }

            if(xhr._dont_use_callback){
                return;
            }

            let response;

            if(xhr.status === 200){
                response = {status : 'success',data : this.response};
                typeof callback === 'function' && callback(response);
            }else{

                if(obj.retryChances <=0){
                    response = {status : 'error',data : this.response};
                    typeof callback === 'function' && callback(response);
                }else{
                    request(obj,binData);
                }
            }

        }

        //xhr.onabort = xhrHandler;
        xhr.onloadend = xhrHandler;
        //xhr.ontimeout = xhrHandler;
        //xhr.onerror = xhrHandler;
        //xhr.onreadystatechange = function () {
        //	this.readyState > 3 && xhrHandler.apply(this,arguments);
        //};

        payload = preparePayload(payload, obj.pubKeyEncryptor);

        let url;

        if(method === 'get' || binData){
            url = getActionUrl(obj.base, !!obj.pubKeyEncryptor, action) + (payload ? `&data=${encodeURIComponent(payload)}` : "") //, !obj.useSyncMode;
            console.log('url is ', url)
            payload = method === 'get'? binData : undefined;
        }else{
            url = getActionUrl(obj.base, !!obj.pubKeyEncryptor, action) //, !obj.useSyncMode;
        }

        xhr.open(method, url);
        xhr.setRequestHeader("Content-Type", "application/json");

        // Set API key header if provided (supports custom header name)
        if(obj.apiKey){
            const headerName = obj.apiKeyHeaderName || 'X-Api-Key';
            try{
                xhr.setRequestHeader(headerName, obj.apiKey);
            }catch(err){
                console.log('Unable to set API key header', err);
            }
        }

        if(binData){
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.send(new Uint8Array(binData));
        }else{
            xhr.send(payload);
        }


        return xhr;
    }

    const FileSystem = function FileSystem(channel){
        this.channel = channel;
        this.fileChunkSize  = 200 * 1024; // 200Kbyte chunks
    }

    FileSystem.prototype.list = function(rootDir,callback){

        const _self = this.channel;
        if(!rootDir){
            throw new Error('rootDir object is required');
        }

        if(!_self.readyState || !_self._session_id){
            return typeof callback === 'function' && callback({status : 'error', data : 'The channel is not ready.'});
        }

        const session = _self._session_id;

        const payload = {
            root : rootDir,
            type: 'file-list',
            to : _self._agentName,
            encrypted : false,
            content : '',
            sessionId : session
        };

        console.log('Sending payload : ');
        console.log(payload);

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            apiKey: _self._apiKey,
            apiKeyHeaderName: _self._apiKeyHeaderName,
            method : 'post',
            action : 'event',
            payload : payload,
            //timeout : 10 * 60 * 1000,
            id : _self._channel_id,
            callback : function(e){
                if(e.status === 'success'){
                    e.data = JSON.parse(e.data);
                }

                typeof callback === 'function' && callback(e);

            },
            retryChances : 1
        });
    }

    FileSystem.prototype.getDownloadLink = function(filename){

        const _self = this.channel;

        const payload = preparePayload({
            filename : filename,
            type: 'file-get',
            sessionId : _self._session_id
        },_self._pubKeyEncryptor);

        return `${getActionUrl(_self._api, false, 'event')}&data=${encodeURIComponent(payload)}`;
    }

    FileSystem.prototype.download = function(filename){

        const _self = this.channel;

        if(!filename){
            throw new Error('filename object is required');
        }

        if(!_self.readyState || !_self._session_id){
            throw new Error('The channel is not ready.');
        }

        const a = document.createElement('a');
        a.href = this.getDownloadLink(filename);
        a.download = parsefileName(filename);
        console.log('download from : '+a.href)
        const el = document.body.appendChild(a);
        a.click();
        document.body.removeChild(el);
    }

    FileSystem.prototype.mkdir = function(filename,callback){

        const _self = this.channel;

        if(!filename){
            throw new Error('folder name/path is required');
        }

        if(!_self.readyState || !_self._session_id){
            return typeof callback === 'function' && callback({status : 'error', data : 'The channel is not ready.'});
        }

        const session = _self._session_id;

        const payload = {
            filename : filename,
            type: 'file-mkdir',
            to : _self._agentName,
            encrypted : false,//agents encryption is disabled
            content : '',
            sessionId : session
        };

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor: _self._pubKeyEncryptor,
            apiKey: _self._apiKey,
            apiKeyHeaderName: _self._apiKeyHeaderName,
            method : 'post',
            action : 'event',
            payload : payload,
            //timeout : 10 * 60 * 1000,
            id : _self._channel_id,
            callback : callback,
            retryChances : 1
        });

    }

    FileSystem.prototype.delete = function(filename,callback){

        const _self = this.channel;

        if(!filename){
            throw new Error('file object is required');
        }

        if(!_self.readyState || !_self._session_id){
            return typeof callback === 'function' && callback({status : 'error', data : 'The channel is not ready.'});
        }

        const session = _self._session_id;

        const payload = {
            filename : filename,
            type: 'file-delete',
            to : _self._agentName,
            encrypted : false,//agents encryption is disabled
            content : '',
            sessionId : session
        };

        console.log('Sending payload : ');
        console.log(payload);

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor: _self._pubKeyEncryptor,
            apiKey: _self._apiKey,
            apiKeyHeaderName: _self._apiKeyHeaderName,
            method : 'post',
            action : 'event',
            payload : payload,
            //timeout : 10 * 60 * 1000,
            id : _self._channel_id,
            callback : callback,
            retryChances : 1
        });

    }

    FileSystem.prototype.put = function(file,putFileName,callback){

        const _self = this.channel;

        if(_self._put_xhr){
            const fileSystem = this;
            _self._put_xhr.abort();
            _self._put_xhr_cancel = true;
            const args = arguments;
            return setTimeout(function(){
                _self._put_xhr = null;
                _self._put_xhr_cancel = false;
                fileSystem.put.apply(fileSystem,args);
            },1500);
        }

        if(!file || !file.name || !putFileName){
            throw new Error('file object and putFileName are required');
        }

        if(!_self.readyState || !_self._session_id){
            return typeof callback === 'function' && callback({status : 'error', data : 'The channel is not ready.'});
        }

        const session = _self._session_id;

        const fd = new FileReader();
        const fileSize   = file.size;
        const chunkSize  = this.fileChunkSize;
        let offset = 0;
        let append = false;

        return new Promise(function(resolve,reject){
            read();
            function read(xhrResponse){
                if(_self._put_xhr_cancel){
                    return;
                }
                if(fd.readyState === 1){
                    console.log('File reader is busy, waiting ...');
                    return setTimeout(read,500);
                }
                xhrResponse = xhrResponse || {status : 'success'};
                const res = {done : false,file : file, path : putFileName};

                if (offset >= fileSize) {
                    res.done = true;
                    res.progress = 100;
                    resolve(res)
                    typeof callback === 'function' && callback(res);
                }else{

                    if(xhrResponse.status === 'error'){
                        reject(xhrResponse);
                        return typeof callback === 'function' && callback(xhrResponse);
                    }

                    const subFile = file.slice(offset, offset + chunkSize);

                    fd.onloadend = fd.onloadend || function(evt){

                        const append = offset !== 0;
                        let readData,dataLength;
                        if (evt.target.error === null) {
                            readData  = evt.target.result;
                            dataLength = readData.length || readData.byteLength;

                            res.data = {length : dataLength};
                            res.progress = 100 * (offset/fileSize);
                            res.status = 'success';
                            res.progress > 0 && typeof callback === 'function' && callback(res);

                            //update next offset
                            offset += dataLength;

                            const payload = {
                                append : append,
                                filename : putFileName,
                                type: 'file-put',
                                to : _self._agentName,
                                encrypted : false,//agents encryption is disabled
                                content : 'binary',//MySecurity.encryptAndSign(res.data,_self._channel_password),
                                sessionId : session
                            };
                            _self._put_xhr = request({
                                useSyncMode : _self.useSyncMode,
                                base : _self._api,
                                pubKeyEncryptor: _self._pubKeyEncryptor,
                                apiKey: _self._apiKey,
                                apiKeyHeaderName: _self._apiKeyHeaderName,
                                method : 'post',
                                action : 'event',
                                payload : payload,
                                //timeout : 10 * 60 * 1000,
                                id : _self._channel_id,
                                callback : function(e){
                                    if(_self._put_xhr_cancel || !e || e.status !== 'success'){
                                        throw new Error(JSON.stringify(e));
                                    }
                                    requestAnimationFrame(read);
                                    //setTimeout(read,100);
                                    //read();
                                },
                                retryChances : 3
                            },readData);

                        } else {
                            res.status = 'error';
                            res.progress = 0;
                            res.data = evt.target.error;
                            reject(res);
                            return typeof callback === 'function' && callback(res);
                        }
                    }
                    fd.readAsArrayBuffer(subFile);

                }
            }
        });
    }

    const extractApiResponseData  = function(response)
    {
        let responseData = response.data;

        if(typeof responseData !== 'object'){
            responseData = JSON.parse(responseData);
        }
        // todo: fix this in a generic way.
        return  responseData.data ? responseData.data : responseData;
    }

    const Channel = function({usePubKey}){

        this._agentName = null;
        this._connectedAgentsMap = {};
        this.connectedAgents = [];

        this.fileSystem = new FileSystem(this);

        this.onreset = null;
        this.onconnect = null;
        this.ondisconnect = null;
        this.onmessage = null;
        this.usePubKey = usePubKey;

    }

    Channel.prototype.getAgentInfo = function(agentName,callback){

        const _self = this;

        if(!_self.readyState){
            throw new Error('Channel is not ready.');
        }

        const session = _self._session_id;

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor: _self._pubKeyEncryptor,
            apiKey: _self._apiKey,
            apiKeyHeaderName: _self._apiKeyHeaderName,
            method : 'post',
            action : 'agent-info',
            payload : {
                sessionId : session,
                agentName : agentName
            },
            //timeout : 10 * 60 * 1000,
            id : _self._channel_id,
            callback : function(response){

                if(response.status === 'success'){

                    let data = extractApiResponseData(response);

                    if(!data){
                        typeof callback === 'function' &&  callback({status : 'error',data : 'Corrupted data!'});
                        return;
                    }

                    if(typeof data !== 'object'){
                        data = JSON.parse(data);
                    }

                    typeof callback === 'function' && callback({status : 'success', data: data});
                }else{
                    typeof callback === 'function' && callback(response);
                }
            }
        });

    }

    Channel.prototype.getActiveAgents = function(callback){

        const _self = this;

        if(!_self.readyState){
            throw new Error('Channel is not ready.');
        }

        const session = _self._session_id;

        request({
            useSyncMode : _self.useSyncMode,
            pubKeyEncryptor : _self._pubKeyEncryptor,
            base : _self._api,
            apiKey: _self._apiKey,
            apiKeyHeaderName: _self._apiKeyHeaderName,
            method : 'post',
            action : 'list-agents',
            payload : {
                sessionId : session
            },
            //timeout : 10 * 60 * 1000,
            id : _self._channel_id,
            callback : function(response){

                if(response.status === 'success'){

                    let data = extractApiResponseData(response);

                    if(!data){
                        typeof callback === 'function' &&  callback({status : 'error',data : 'Corrupted data!'});
                        return;
                    }

                    if(typeof data !== 'object'){
                        data = JSON.parse(data);
                    }

                    typeof callback === 'function' && callback({status : 'success', data: data});
                }else{
                    typeof callback === 'function' && callback(response);
                }
            }
        });

    }

    Channel.prototype.connect = function(config){

        const _self = this;
        console.log('_self.readyState = ', _self.readyState)
        if(_self.readyState){
            return _self.dispatchEvent('connect',{response : {status : 'error',data : 'Channel is in ready/connecting state.'}});
        }

        _self.readyState = 'connecting';

        _self._api = config.api || '../';

        // store API key and header name for subsequent requests
        if(config.apiKey){
            _self._apiKey = config.apiKey;
        }
        if(config.apiKeyHeaderName){
            _self._apiKeyHeaderName = config.apiKeyHeaderName;
        }

        if(!_self._last_receive_range || _self._channel_name !== config.channelName || _self._channel_password !== config.channelPassword){
            _self._last_receive_range = defaultReceiveRange;
        }

        // Accept either channelName or channelId
        _self._channel_name = config.channelName || null;
        _self._channel_id = config.channelId || _self._channel_id;

        // validate password only if provided
        if(typeof config.channelPassword === 'string' && config.channelPassword.search(channelPasswordRegex) !== -1){
            _self.readyState = false;
            return _self.dispatchEvent('connect',{response : {status : 'error',data : "Channel key shouldn't have any character in (*\\/,) and no space"}});
        }

        _self._channel_password = config.channelPassword || null;

        _self._agentName = config.user || config.agentName

        // If we're connecting using channelId or using apiKey without password, skip deriving channel secret
        const connectingByChannelId = !!config.channelId;
        const connectingByApiKeyOnly = !!(_self._apiKey && _self._channel_name && !_self._channel_password);

        // Gets agent key only when channelName AND channelPassword are provided and no secret yet
        if (!_self._channel_secret && !connectingByChannelId && !connectingByApiKeyOnly)
        {
            if(_self._channel_name && _self._channel_password){
                MySecurity.deriveChannelSecret(_self._channel_name, _self._channel_password).then(channelSecret => {
                    _self.readyState = false;
                    _self._channel_secret = channelSecret;
                    _self.connect(config);
                });
                return;
            }
        }

        // Gets server's public key if needed
        if(!_self._pubKeyEncryptor && this.usePubKey){
            // public key mode is on
            getPublicKey({
                base : _self._api,
                apiKey: _self._apiKey,
                apiKeyHeaderName: _self._apiKeyHeaderName,
                callback : function(response){
                    _self.readyState = false;
                    if(response.status === 'error'){
                        _self.dispatchEvent('connect',{response : {status : 'error',data : 'Unable to get the public key'}});
                    }else{
                        _self._pubKeyEncryptor = new JSEncrypt();
                        _self._pubKeyEncryptor.setPublicKey(response.data);
                        _self.connect(config);
                    }
                }

            });

            return;
        }

        const autoReceive = config.autoReceive;

        // prepare payload: either channelId-based or channelName-based
        let payload;
        if(connectingByChannelId){
            payload = {
                sessionId : config.sessionId ? config.sessionId : '',
                channelId: config.channelId,
                agentName: _self._agentName,
                agentContext: {agentType: 'WEB-AGENT', descriptor: navigator.userAgent}
            };
        } else {
            let channelPasswordHash = '';
            if(_self._channel_password && _self._channel_secret){
                try{
                    channelPasswordHash = MySecurity.hash(_self._channel_password, _self._channel_secret);
                }catch(e){
                    channelPasswordHash = '';
                }
            }

            payload = {
                sessionId : config.sessionId ? config.sessionId : '',
                channelName: _self._channel_name,
                channelPassword: channelPasswordHash,
                agentName: _self._agentName,
                agentContext: {agentType: 'WEB-AGENT', descriptor: navigator.userAgent}
            };
        }

        request({
            useSyncMode : _self.useSyncMode,
            onreset : _self.onreset,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            base : _self._api,
            apiKey: _self._apiKey,
            apiKeyHeaderName: _self._apiKeyHeaderName,
            method : 'post',
            action : 'connect',
            payload : payload,

            callback : function(response){

                const event = {config}

                if(response.status === 'success'){

                    let apiResponse = extractApiResponseData(response);
                    _self.connectTime = apiResponse.date;
                    if(!apiResponse){
                        event.response = {status : 'error', data : 'Corrupted data!'};
                        _self.dispatchEvent('connect', event);
                        _self.readyState = false;
                        return;
                    }
                    if(apiResponse.status === 'error'){
                        event.response = {status : 'error', data : apiResponse.statusMessage};
                        _self.dispatchEvent('connect', event);
                        _self.readyState = false;
                        return;
                    }

                    if(_self._session_id !== apiResponse.sessionId){
                        _self._last_receive_range = defaultReceiveRange;
                    }

                    _self._session_id = apiResponse.sessionId;
                    // if server returned channelId, use it (can be used when connecting by channelName or channelId)
                    _self._channel_id = apiResponse.channelId || _self._channel_id;

                    _self._session_role = apiResponse.role;
                    _self.readyState = true;

                    // If connected by channelId and no channel secret, request password from agents
                    if (connectingByChannelId && !_self._channel_secret) {
                        // Use WebCrypto utility to generate RSA-OAEP keypair and export public key PEM
                        (async function(){
                            try {
                                const { publicKeyPem, privateKey } = await generateRsaKeyPair();

                                // store private key on channel instance for later decryption
                                _self._pending_password_key = privateKey;

                                // send REQUEST_PASSWORD event with public key PEM using channel.send helper
                                _self.send({
                                    type: 'password-request',
                                    to: '*',
                                    encrypted: false,
                                    content: publicKeyPem,
                                    sessionId: _self._session_id
                                }, function(resp){
                                    // ignore response; we'll wait for PASSWORD_REPLY via receive
                                });
                            } catch (err) {
                                console.error('Failed to initiate REQUEST_PASSWORD flow', err);
                            }
                        })();
                    }

                     Channel.activeSessions = Channel.activeSessions || {};
                     Channel.activeSessions[_self._session_id] = _self;

                     _self.getActiveAgents(function(agentsRes){
                        const agents = agentsRes.status === 'success' ? agentsRes.data : [];

                        _self._connectedAgentsMap = {}
                        for (let i = 0; i < agents.length; i++) {
                            let s = agents[i];
                            if (typeof s === 'object') {
                                s = s.name || s.agentName || s.agentName;
                            }
                            _self._connectedAgentsMap[s] = true;
                        }

                        _self._updateAgents();
                        event.response = { status : 'success', data: apiResponse };
                        _self.dispatchEvent('connect', event);

                        if(autoReceive){
                            _self.autoReceive = autoReceive;
                            _self.receive(_self._last_receive_range || defaultReceiveRange);
                        }
                    });

                } else
                {
                    _self.readyState = false;
                    event.response = response;
                    _self.dispatchEvent('connect', event);
                }
            }
        });
    }

    Channel.prototype.disconnect = function(){

        const _self = this;

        if(!_self.readyState){
            return;
        }

        _self.readyState = false;

        if(_self._receive_xhr){
            abortRequest(_self._receive_xhr);
            _self._receive_xhr = null;
        }

        const session = _self._session_id;

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            apiKey: _self._apiKey,
            apiKeyHeaderName: _self._apiKeyHeaderName,
            method : 'post',
            action : 'disconnect',
            payload : {sessionId : session},
            callback : function(response){
                Channel.activeSessions = Channel.activeSessions || {};
                delete  Channel.activeSessions[_self._session_id];
                _self.dispatchEvent('disconnect',{response : response});
            }

        });
    }

    Channel.prototype.getChannelInfo = function(){
        if(this._channel_name && this._channel_password)
        {
            return {name : this._channel_name, id : this._channel_id};
        }
        else
        {
            return null;
        }
    }

    Channel.prototype.getSessionInfo = function(){
        if(this._channel_name && this._channel_password){
            return {id : this._session_id  || '' };
        }else{
            return null;
        }

    }

    Channel.prototype.receive = function (range, autoReceive){

        const _self = this;

        _self._rcv_failed_count = _self._rcv_failed_count || 0;
        _self._rcv_empty_count = _self._rcv_empty_count || 0;

        _self.autoReceive = autoReceive || _self.autoReceive;

        if(!_self.readyState){
            return;
        }
        if(_self._receive_xhr){
            abortRequest(_self._receive_xhr);
            _self._receive_xhr = null;
        }

        const session = _self._session_id;

        _self._receive_xhr = request({
            useSyncMode : _self.useSyncMode,
            onreset : _self.onreset,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            base : _self._api,
            apiKey: _self._apiKey,
            apiKeyHeaderName: _self._apiKeyHeaderName,
            method : 'post',
            action : 'receive',
            payload : {sessionId : session, offsetRange: range },
            //timeout : 5 * 60 * 1000,
            callback : function(response){

                delete _self._receive_xhr;

                if(response.status === 'error'){
                    _self.dispatchEvent('message', {response : response});
                } else {
                    let data = extractApiResponseData(response);
                    if(!data){
                        _self.dispatchEvent('message',{response : {status : 'error',data : 'Corrupted Data!'}});
                    }else{

                        if(typeof data !== 'object'){
                            data = JSON.parse(data);
                        }

                        const itemsArray = data.events || [];

                        const dataArray = [];
                        for (let i = 0; i < itemsArray.length; i++) {

                            let item = itemsArray[i];
                            console.debug('item=', item)

                            // Handle agent-to-agent encrypted messages
                            if(item.encrypted && _self._channel_secret){
                                const plain = MySecurity.decryptAndVerify(item.content, _self._channel_secret);

                                if(!plain){
                                    console.log('Some corrupted data item and will be ignored');
                                    item = {};
                                } else
                                {
                                    item.content = plain;
                                    delete item.encrypted;
                                }
                            }

                            // Auto-handle PASSWORD_REPLY encrypted to this agent using the pending private key
                            // Only handle PASSWORD_REPLY events that are newer than the connect time
                            if (item.date > _self.connectTime && item.type === 'password-reply' &&
                                item.to === _self._agentName && !_self._channel_secret) {
                                   (async function() {
                                    try {
                                        // ciphertext expected base64
                                        const b64 = item.content;
                                        const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
                                        const plainBuf = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, _self._pending_password_key, raw);
                                        const dec = new TextDecoder().decode(plainBuf);
                                        // payload may be JSON with { channelName, channelPassword } or a plain password string
                                        let channelNameFromReply = null;
                                        let channelPasswordFromReply = dec;
                                        try{
                                            const parsed = JSON.parse(dec);
                                            if(parsed && typeof parsed === 'object'){
                                                if(parsed.channelPassword) channelPasswordFromReply = parsed.channelPassword;
                                                if(parsed.channelName) channelNameFromReply = parsed.channelName;
                                            }
                                        }catch(ignore){
                                            // not JSON; treat dec as plain password
                                        }

                                        // If server provided channelName in the reply and we don't have one yet, use it
                                        if(channelNameFromReply && !_self._channel_name){
                                            _self._channel_name = channelNameFromReply;
                                        }

                                        // Set channel password from reply
                                        _self._channel_password = channelPasswordFromReply;

                                        // Derive and set channel secret using known channel name and password
                                        if(_self._channel_name && _self._channel_password){
                                            MySecurity.deriveChannelSecret(_self._channel_name, _self._channel_password).then(cs => {
                                                _self._channel_secret = cs;
                                            }).catch(err => {
                                                console.error('Failed to derive channel secret from PASSWORD_REPLY', err);
                                            });
                                        }
                                    } catch (err) {
                                        console.error('Failed to decrypt PASSWORD_REPLY', err);
                                    }
                                })();
                            }

                            if (item.date > _self.connectTime)
                            {
                                if (item.type === 'connect'){
                                    _self._connectedAgentsMap[item.from] = true;
                                    _self._updateAgents();
                                }
                                else if (item.type === 'disconnect')
                                {
                                    delete _self._connectedAgentsMap[item.from];
                                    _self._updateAgents();
                                }
                            }

                            dataArray.push(item);
                        }


                        range.globalOffset = data.nextGlobalOffset || range.globalOffset;
                        range.localOffset = data.nextLocalOffset || range.localOffset;
                        response.data = dataArray;

                        _self.dispatchEvent('message', {response: response});
                    }

                    _self._last_receive_range = range;
                }

                if(_self.autoReceive){

                    const fail_count_limit = 10;
                    const fail_cost_change = 5 * 1000 ;

                    let empty_data_count_limit = 30;
                    let emptyDataTimeoutChange = 500;

                    let additionalTimeout = 0;
                    let emptyCheckFactor = 1;

                    if(_self.autoReceive === true || typeof _self.autoReceive === 'number'){
                        emptyCheckFactor = 0;
                        additionalTimeout = _self.autoReceive === 'number'?_self.autoReceive:1000;
                    }else{
                        _self.autoReceive = _self.autoReceive + '';
                        const rangeObj = parseRange(_self.autoReceive);

                        if(rangeObj.start === Infinity || rangeObj.end === Infinity || rangeObj.start  === rangeObj.end){

                            if(rangeObj.start !== Infinity){
                                _self.autoReceive = rangeObj.start;
                            }else if (rangeObj.end !== Infinity){
                                _self.autoReceive = rangeObj.end;
                            }else{
                                _self.autoReceive = 5000;
                                console.error('Your auto receive config "' + _self.autoReceive + '" is not valid, default value will be used : ' + _self.autoReceive);
                            }
                            emptyCheckFactor = 0;
                            additionalTimeout = _self.autoReceive;
                        }else{
                            emptyDataTimeoutChange = rangeObj.change || emptyDataTimeoutChange;
                            empty_data_count_limit = 1 + (rangeObj.end  - rangeObj.start ) / emptyDataTimeoutChange;
                            additionalTimeout = rangeObj.start;
                        }
                    }

                    if(response.status === 'success'){
                        _self._rcv_failed_count = 0;
                        if(!response.data || response.data.length === 0){
                            if(_self._rcv_empty_count < empty_data_count_limit){
                                _self._rcv_empty_count++
                            }
                        }else{
                            _self._rcv_empty_count = 0;
                        }
                    }else{
                        if(_self._rcv_failed_count < fail_count_limit){
                            _self._rcv_failed_count ++;
                        }
                    }



                    let timeout = _self._rcv_failed_count * fail_cost_change
                        + (_self._rcv_empty_count - 1) * emptyCheckFactor * emptyDataTimeoutChange
                        + additionalTimeout;
                    timeout = parseInt(timeout);
                    if (timeout < 100)
                    {
                        timeout = 100;
                    }

                    //console.log('New timeout : '+timeout);
                    setTimeout(function(){
                        _self.receive(_self._last_receive_range);
                    }, timeout);

                }
            }

        });

    }

    Channel.prototype.sendMessage = function(config,callback){

        let msg,to,filter,type;

        if(typeof config === 'object'){
            msg = config.msg;
            to = config.to;
            filter = config.filter;
            type = config.type;
        }else{
            msg = config;
        }

        if(to && filter){
            throw new Error('Config should have either "to" or "filter" fields');
        }
        if(!msg){
            throw new Error("Invalid arguments format : first argument should be as an object or string and second one should be as callback function."
                +"The msg should be defined either in the obj or as string parameter in the first argument");
        }

        const _self = this;

        if(!_self.readyState || !_self._session_id){
            typeof callback === 'function' && callback({status : 'error', data : 'The channel is not ready.'});
            return;
        }

        const session = _self._session_id;

        const payload = {
            type: type || 'chat-text',
            to : (to && RegExp.quote(to)) || filter || '*',
            encrypted : !!_self._channel_secret,
            content : _self._channel_secret ? MySecurity.encryptAndSign(msg,_self._channel_secret) : msg,
            sessionId : session
        };

        console.log('Sending payload : ');
        console.log(payload);

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            apiKey: _self._apiKey,
            apiKeyHeaderName: _self._apiKeyHeaderName,
            method : 'post',
            action : 'event',
            payload : payload,
            //timeout : 10 * 60 * 1000,
            id : _self._channel_id,
            callback : callback,
            retryChances : 3
        });

    }

    // Lightweight helper to send an event payload via the channel (uses existing request wrapper)
    Channel.prototype.send = function(payload, callback){
        const _self = this;
        if(!_self.readyState || !_self._session_id){
            typeof callback === 'function' && callback({status : 'error', data : 'The channel is not ready.'});
            return;
        }
        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            apiKey: _self._apiKey,
            apiKeyHeaderName: _self._apiKeyHeaderName,
            method : 'post',
            action : 'event',
            payload : payload,
            id : _self._channel_id,
            callback : callback,
            retryChances : 1
        });
    }

    Channel.prototype.status = function(callback){
        const _self = this;

        if(!_self.readyState || !_self._session_id){
            typeof callback === 'function' && callback({status : 'error',data : 'The channel is not ready.'});
            return
        }

        //var session = _self._session_id.endsWith("-0")?(_self._session_id.split('-')[0]+"-1"):(_self._session_id.split('-')[0]+"-0");
        const session = _self._session_id;

        request({
            useSyncMode : _self.useSyncMode,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            base : _self._api,
            apiKey: _self._apiKey,
            apiKeyHeaderName: _self._apiKeyHeaderName,
            method : 'post',
            action : 'status',
            payload : {sessionId : session},
            //timeout : 10 * 60 * 1000,
            id : _self._channel_id,
            callback : callback
        });

    }

    Channel.prototype.encodeKeyLength = 8;
    Channel.prototype.encodeAuth = function(){
        if(!this.readyState || !this._session_id){
            throw new Error('The channel is not ready.');
        }

        const key = guid32().substring(0,this.encodeKeyLength || 10);
        const auth = [this._channel_name,this._channel_password];

        const cipher1 = MySecurity.encrypt(auth,md5(key).substring(0,this.encodeKeyLength || 10));
        const cipher2 = MySecurity.encrypt(cipher1,key);

        let str = /*btoa*/(key + cipher2);

        //eliminating unfriendly character '='
        let c = 0;
        while(str.charAt(str.length-1) === '='){
            c++;
            str = str.substring(0,str.length-1);
        }

        return str+c;

    }

    Channel.prototype.decodeAuth = function(encodedAuth){

        let c = parseInt(encodedAuth.charAt(encodedAuth.length-1));
        let str = encodedAuth.substring(0,encodedAuth.length-1);
        while(c > 0){
            str += '=';
            c--;
        }

        const authInfo = /*atob*/(str);
        const key = authInfo.substring(0,this.encodeKeyLength || 10);
        const cipher2 = authInfo.substring(this.encodeKeyLength || 10);
        const cipher1 = MySecurity.decrypt(cipher2,key);

        const auth = MySecurity.decrypt(cipher1,md5(key).substring(0,this.encodeKeyLength || 10));

        const tokens = JSON.parse(auth);

        return {channelName : tokens[0],channelPassword : tokens[1]};

    }
    Channel.prototype._updateAgents = function(){
        this.connectedAgents = Object.keys(this._connectedAgentsMap);
    }

    window.addEventListener("pagehide", function () {
        Channel.activeSessions = Channel.activeSessions || {};
        const activeChannels = [];

        for (const sessionId in Channel.activeSessions) {
            activeChannels.push(Channel.activeSessions[sessionId]);
        }

        for (let i = 0; i < activeChannels.length; i++) {
            activeChannels[i].useSyncMode = true;
            try {
                console.log("Disconnecting from " + activeChannels[i]._session_id);
                activeChannels[i].disconnect();
            } catch (err) {
                console.log(err);
            }
        }
    });

    window.HTTPChannel = Channel;
    window.MySecurity = MySecurity;

    RegExp.quote = RegExp.quote || function(str) {
        return (str+'').replace(/[.?*+^$[\\]\\(){}|-]/g, "\\$&");
    };
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(searchString, position) {
            const subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            const lastIndex = subjectString.lastIndexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position){
            return this.substr(position || 0, searchString.length) === searchString;
        };
    }

    const Eventable = function(obj){
        if(typeof obj !== 'object' && typeof obj !== 'function' ){
            throw new Error('Object parameter is required');
        }

        const eventable = typeof obj.addEventListener === 'function' && typeof obj.removeEventListener === 'function' && typeof obj.dispatchEvent === 'function';

        if(typeof obj === 'function'){
            obj = obj.prototype;
        }

        if(!eventable){

            obj.addEventListener = function(event,listeners){

                let callbacks = [];
                const eventsMap = (this._eventsMap = (this._eventsMap || {}));

                if(Array.isArray(listeners)){
                    callbacks = listeners;
                }else{
                    callbacks = [listeners];
                }

                for(let i=0;i<callbacks.length;i++){
                    if(typeof callbacks[i] === 'function'){
                        eventsMap[event] = eventsMap[event] || [];
                        eventsMap[event].push(callbacks[i]);
                    }
                }
            }

            obj.removeEventListener = function(event,listeners){

                let callbacks = [];
                const eventsMap = (this._eventsMap = (this._eventsMap || {}));

                if(Array.isArray(listeners)){
                    callbacks = listeners;
                }else{
                    callbacks = [listeners];
                }

                for(let i=0;i<callbacks.length;i++){
                    if(typeof callbacks[i] === 'function'){
                        eventsMap[event] = eventsMap[event] || [];
                        eventsMap[event].splice(eventsMap[event].indexOf(callbacks[i]),1);
                    }
                }
            }

            obj.dispatchEvent = function(event,properties){

                const eventsMap = (this._eventsMap = (this._eventsMap || {}));


                let cancelled = false;
                const e = {
                    type : event,
                    src : this,
                    preventDefault : function(){
                        cancelled = true;
                    }
                }

                if(typeof properties === 'object' && properties != null ){
                    for(const key in properties){
                        if(!e.hasOwnProperty(key)){
                            e[key] = properties[key];
                        }else{
                            throw new Error('Unable to dispatch event '+event+' with property '+key+
                                '. Either the property is duplicate it matches once field of the default event object parameters');
                        }


                    }
                }


                eventsMap[event] = eventsMap[event] || [];
                const callbacks = eventsMap[event];

                let res = false;

                if(typeof this['on'+event] === 'function'){
                    this['on'+event].apply(this,[e]);
                }

                for(let i=0;i<callbacks.length && !cancelled;i++){
                    if(typeof callbacks[i] === 'function'){
                        callbacks[i].apply(this,[e]);
                        res = true;
                    }
                }

                return res && !cancelled;
            }

        }
    }

    Eventable(window.HTTPChannel);
})();
