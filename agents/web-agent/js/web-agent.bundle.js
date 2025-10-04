
/* https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js */
!function(t,e){"object"==typeof exports?module.exports=exports=e():"function"==typeof define&&define.amd?define([],e):t.CryptoJS=e()}(this,function(){var W,O,I,U,K,X,L,l,j,T,t,N,q,e,Z,V,G,J,Q,Y,$,t1,e1,r1,i1,o1,n1,s,s1,c1,a1,h1,l1,o,f1,r,d1,u1,n,c,a,h,f,d,i=function(h){var i;if("undefined"!=typeof window&&window.crypto&&(i=window.crypto),"undefined"!=typeof self&&self.crypto&&(i=self.crypto),!(i=!(i=!(i="undefined"!=typeof globalThis&&globalThis.crypto?globalThis.crypto:i)&&"undefined"!=typeof window&&window.msCrypto?window.msCrypto:i)&&"undefined"!=typeof global&&global.crypto?global.crypto:i)&&"function"==typeof require)try{i=require("crypto")}catch(t){}var r=Object.create||function(t){return e.prototype=t,t=new e,e.prototype=null,t};function e(){}var t={},o=t.lib={},n=o.Base={extend:function(t){var e=r(this);return t&&e.mixIn(t),e.hasOwnProperty("init")&&this.init!==e.init||(e.init=function(){e.$super.init.apply(this,arguments)}),(e.init.prototype=e).$super=this,e},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var e in t)t.hasOwnProperty(e)&&(this[e]=t[e]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}},l=o.WordArray=n.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=null!=e?e:4*t.length},toString:function(t){return(t||c).stringify(this)},concat:function(t){var e=this.words,r=t.words,i=this.sigBytes,o=t.sigBytes;if(this.clamp(),i%4)for(var n=0;n<o;n++){var s=r[n>>>2]>>>24-n%4*8&255;e[i+n>>>2]|=s<<24-(i+n)%4*8}else for(var c=0;c<o;c+=4)e[i+c>>>2]=r[c>>>2];return this.sigBytes+=o,this},clamp:function(){var t=this.words,e=this.sigBytes;t[e>>>2]&=4294967295<<32-e%4*8,t.length=h.ceil(e/4)},clone:function(){var t=n.clone.call(this);return t.words=this.words.slice(0),t},random:function(t){for(var e=[],r=0;r<t;r+=4)e.push(function(){if(i){if("function"==typeof i.getRandomValues)try{return i.getRandomValues(new Uint32Array(1))[0]}catch(t){}if("function"==typeof i.randomBytes)try{return i.randomBytes(4).readInt32LE()}catch(t){}}throw new Error("Native crypto module could not be used to get secure random number.")}());return new l.init(e,t)}}),s=t.enc={},c=s.Hex={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],o=0;o<r;o++){var n=e[o>>>2]>>>24-o%4*8&255;i.push((n>>>4).toString(16)),i.push((15&n).toString(16))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i+=2)r[i>>>3]|=parseInt(t.substr(i,2),16)<<24-i%8*4;return new l.init(r,e/2)}},a=s.Latin1={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],o=0;o<r;o++){var n=e[o>>>2]>>>24-o%4*8&255;i.push(String.fromCharCode(n))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i++)r[i>>>2]|=(255&t.charCodeAt(i))<<24-i%4*8;return new l.init(r,e)}},f=s.Utf8={stringify:function(t){try{return decodeURIComponent(escape(a.stringify(t)))}catch(t){throw new Error("Malformed UTF-8 data")}},parse:function(t){return a.parse(unescape(encodeURIComponent(t)))}},d=o.BufferedBlockAlgorithm=n.extend({reset:function(){this._data=new l.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=f.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(t){var e,r=this._data,i=r.words,o=r.sigBytes,n=this.blockSize,s=o/(4*n),c=(s=t?h.ceil(s):h.max((0|s)-this._minBufferSize,0))*n,t=h.min(4*c,o);if(c){for(var a=0;a<c;a+=n)this._doProcessBlock(i,a);e=i.splice(0,c),r.sigBytes-=t}return new l.init(e,t)},clone:function(){var t=n.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0}),u=(o.Hasher=d.extend({cfg:n.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){d.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(r){return function(t,e){return new r.init(e).finalize(t)}},_createHmacHelper:function(r){return function(t,e){return new u.HMAC.init(r,e).finalize(t)}}}),t.algo={});return t}(Math),u=(u=(p=i).lib,W=u.Base,O=u.WordArray,(u=p.x64={}).Word=W.extend({init:function(t,e){this.high=t,this.low=e}}),u.WordArray=W.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=null!=e?e:8*t.length},toX32:function(){for(var t=this.words,e=t.length,r=[],i=0;i<e;i++){var o=t[i];r.push(o.high),r.push(o.low)}return O.create(r,this.sigBytes)},clone:function(){for(var t=W.clone.call(this),e=t.words=this.words.slice(0),r=e.length,i=0;i<r;i++)e[i]=e[i].clone();return t}}),"function"==typeof ArrayBuffer&&(p=i.lib.WordArray,I=p.init,(p.init=function(t){if((t=(t=t instanceof ArrayBuffer?new Uint8Array(t):t)instanceof Int8Array||"undefined"!=typeof Uint8ClampedArray&&t instanceof Uint8ClampedArray||t instanceof Int16Array||t instanceof Uint16Array||t instanceof Int32Array||t instanceof Uint32Array||t instanceof Float32Array||t instanceof Float64Array?new Uint8Array(t.buffer,t.byteOffset,t.byteLength):t)instanceof Uint8Array){for(var e=t.byteLength,r=[],i=0;i<e;i++)r[i>>>2]|=t[i]<<24-i%4*8;I.call(this,r,e)}else I.apply(this,arguments)}).prototype=p),i),p1=u.lib.WordArray;function _1(t){return t<<8&4278255360|t>>>8&16711935}(u=u.enc).Utf16=u.Utf16BE={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],o=0;o<r;o+=2){var n=e[o>>>2]>>>16-o%4*8&65535;i.push(String.fromCharCode(n))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i++)r[i>>>1]|=t.charCodeAt(i)<<16-i%2*16;return p1.create(r,2*e)}},u.Utf16LE={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],o=0;o<r;o+=2){var n=_1(e[o>>>2]>>>16-o%4*8&65535);i.push(String.fromCharCode(n))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i++)r[i>>>1]|=_1(t.charCodeAt(i)<<16-i%2*16);return p1.create(r,2*e)}},U=(p=i).lib.WordArray,p.enc.Base64={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=this._map,o=(t.clamp(),[]),n=0;n<r;n+=3)for(var s=(e[n>>>2]>>>24-n%4*8&255)<<16|(e[n+1>>>2]>>>24-(n+1)%4*8&255)<<8|e[n+2>>>2]>>>24-(n+2)%4*8&255,c=0;c<4&&n+.75*c<r;c++)o.push(i.charAt(s>>>6*(3-c)&63));var a=i.charAt(64);if(a)for(;o.length%4;)o.push(a);return o.join("")},parse:function(t){var e=t.length,r=this._map;if(!(i=this._reverseMap))for(var i=this._reverseMap=[],o=0;o<r.length;o++)i[r.charCodeAt(o)]=o;for(var n,s,c=r.charAt(64),a=(!c||-1!==(c=t.indexOf(c))&&(e=c),t),h=e,l=i,f=[],d=0,u=0;u<h;u++)u%4&&(s=l[a.charCodeAt(u-1)]<<u%4*2,n=l[a.charCodeAt(u)]>>>6-u%4*2,s=s|n,f[d>>>2]|=s<<24-d%4*8,d++);return U.create(f,d)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="},K=(u=i).lib.WordArray,u.enc.Base64url={stringify:function(t,e){for(var r=t.words,i=t.sigBytes,o=(e=void 0===e?!0:e)?this._safe_map:this._map,n=(t.clamp(),[]),s=0;s<i;s+=3)for(var c=(r[s>>>2]>>>24-s%4*8&255)<<16|(r[s+1>>>2]>>>24-(s+1)%4*8&255)<<8|r[s+2>>>2]>>>24-(s+2)%4*8&255,a=0;a<4&&s+.75*a<i;a++)n.push(o.charAt(c>>>6*(3-a)&63));var h=o.charAt(64);if(h)for(;n.length%4;)n.push(h);return n.join("")},parse:function(t,e){var r=t.length,i=(e=void 0===e?!0:e)?this._safe_map:this._map;if(!(o=this._reverseMap))for(var o=this._reverseMap=[],n=0;n<i.length;n++)o[i.charCodeAt(n)]=n;for(var s,c,e=i.charAt(64),a=(!e||-1!==(e=t.indexOf(e))&&(r=e),t),h=r,l=o,f=[],d=0,u=0;u<h;u++)u%4&&(c=l[a.charCodeAt(u-1)]<<u%4*2,s=l[a.charCodeAt(u)]>>>6-u%4*2,c=c|s,f[d>>>2]|=c<<24-d%4*8,d++);return K.create(f,d)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",_safe_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"};for(var y1=Math,p=i,g1=(u=p.lib).WordArray,v1=u.Hasher,u=p.algo,A=[],B1=0;B1<64;B1++)A[B1]=4294967296*y1.abs(y1.sin(B1+1))|0;function z(t,e,r,i,o,n,s){t=t+(e&r|~e&i)+o+s;return(t<<n|t>>>32-n)+e}function H(t,e,r,i,o,n,s){t=t+(e&i|r&~i)+o+s;return(t<<n|t>>>32-n)+e}function C(t,e,r,i,o,n,s){t=t+(e^r^i)+o+s;return(t<<n|t>>>32-n)+e}function R(t,e,r,i,o,n,s){t=t+(r^(e|~i))+o+s;return(t<<n|t>>>32-n)+e}u=u.MD5=v1.extend({_doReset:function(){this._hash=new g1.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(t,e){for(var r=0;r<16;r++){var i=e+r,o=t[i];t[i]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8)}var n=this._hash.words,s=t[e+0],c=t[e+1],a=t[e+2],h=t[e+3],l=t[e+4],f=t[e+5],d=t[e+6],u=t[e+7],p=t[e+8],_=t[e+9],y=t[e+10],g=t[e+11],v=t[e+12],B=t[e+13],w=t[e+14],k=t[e+15],x=z(n[0],S=n[1],m=n[2],b=n[3],s,7,A[0]),b=z(b,x,S,m,c,12,A[1]),m=z(m,b,x,S,a,17,A[2]),S=z(S,m,b,x,h,22,A[3]);x=z(x,S,m,b,l,7,A[4]),b=z(b,x,S,m,f,12,A[5]),m=z(m,b,x,S,d,17,A[6]),S=z(S,m,b,x,u,22,A[7]),x=z(x,S,m,b,p,7,A[8]),b=z(b,x,S,m,_,12,A[9]),m=z(m,b,x,S,y,17,A[10]),S=z(S,m,b,x,g,22,A[11]),x=z(x,S,m,b,v,7,A[12]),b=z(b,x,S,m,B,12,A[13]),m=z(m,b,x,S,w,17,A[14]),x=H(x,S=z(S,m,b,x,k,22,A[15]),m,b,c,5,A[16]),b=H(b,x,S,m,d,9,A[17]),m=H(m,b,x,S,g,14,A[18]),S=H(S,m,b,x,s,20,A[19]),x=H(x,S,m,b,f,5,A[20]),b=H(b,x,S,m,y,9,A[21]),m=H(m,b,x,S,k,14,A[22]),S=H(S,m,b,x,l,20,A[23]),x=H(x,S,m,b,_,5,A[24]),b=H(b,x,S,m,w,9,A[25]),m=H(m,b,x,S,h,14,A[26]),S=H(S,m,b,x,p,20,A[27]),x=H(x,S,m,b,B,5,A[28]),b=H(b,x,S,m,a,9,A[29]),m=H(m,b,x,S,u,14,A[30]),x=C(x,S=H(S,m,b,x,v,20,A[31]),m,b,f,4,A[32]),b=C(b,x,S,m,p,11,A[33]),m=C(m,b,x,S,g,16,A[34]),S=C(S,m,b,x,w,23,A[35]),x=C(x,S,m,b,c,4,A[36]),b=C(b,x,S,m,l,11,A[37]),m=C(m,b,x,S,u,16,A[38]),S=C(S,m,b,x,y,23,A[39]),x=C(x,S,m,b,B,4,A[40]),b=C(b,x,S,m,s,11,A[41]),m=C(m,b,x,S,h,16,A[42]),S=C(S,m,b,x,d,23,A[43]),x=C(x,S,m,b,_,4,A[44]),b=C(b,x,S,m,v,11,A[45]),m=C(m,b,x,S,k,16,A[46]),x=R(x,S=C(S,m,b,x,a,23,A[47]),m,b,s,6,A[48]),b=R(b,x,S,m,u,10,A[49]),m=R(m,b,x,S,w,15,A[50]),S=R(S,m,b,x,f,21,A[51]),x=R(x,S,m,b,v,6,A[52]),b=R(b,x,S,m,h,10,A[53]),m=R(m,b,x,S,y,15,A[54]),S=R(S,m,b,x,c,21,A[55]),x=R(x,S,m,b,p,6,A[56]),b=R(b,x,S,m,k,10,A[57]),m=R(m,b,x,S,d,15,A[58]),S=R(S,m,b,x,B,21,A[59]),x=R(x,S,m,b,l,6,A[60]),b=R(b,x,S,m,g,10,A[61]),m=R(m,b,x,S,a,15,A[62]),S=R(S,m,b,x,_,21,A[63]),n[0]=n[0]+x|0,n[1]=n[1]+S|0,n[2]=n[2]+m|0,n[3]=n[3]+b|0},_doFinalize:function(){for(var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes,o=(e[i>>>5]|=128<<24-i%32,y1.floor(r/4294967296)),o=(e[15+(64+i>>>9<<4)]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),e[14+(64+i>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t.sigBytes=4*(e.length+1),this._process(),this._hash),n=o.words,s=0;s<4;s++){var c=n[s];n[s]=16711935&(c<<8|c>>>24)|4278255360&(c<<24|c>>>8)}return o},clone:function(){var t=v1.clone.call(this);return t._hash=this._hash.clone(),t}}),p.MD5=v1._createHelper(u),p.HmacMD5=v1._createHmacHelper(u),u=(p=i).lib,X=u.WordArray,L=u.Hasher,u=p.algo,l=[],u=u.SHA1=L.extend({_doReset:function(){this._hash=new X.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,e){for(var r=this._hash.words,i=r[0],o=r[1],n=r[2],s=r[3],c=r[4],a=0;a<80;a++){a<16?l[a]=0|t[e+a]:(h=l[a-3]^l[a-8]^l[a-14]^l[a-16],l[a]=h<<1|h>>>31);var h=(i<<5|i>>>27)+c+l[a];h+=a<20?1518500249+(o&n|~o&s):a<40?1859775393+(o^n^s):a<60?(o&n|o&s|n&s)-1894007588:(o^n^s)-899497514,c=s,s=n,n=o<<30|o>>>2,o=i,i=h}r[0]=r[0]+i|0,r[1]=r[1]+o|0,r[2]=r[2]+n|0,r[3]=r[3]+s|0,r[4]=r[4]+c|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return e[i>>>5]|=128<<24-i%32,e[14+(64+i>>>9<<4)]=Math.floor(r/4294967296),e[15+(64+i>>>9<<4)]=r,t.sigBytes=4*e.length,this._process(),this._hash},clone:function(){var t=L.clone.call(this);return t._hash=this._hash.clone(),t}}),p.SHA1=L._createHelper(u),p.HmacSHA1=L._createHmacHelper(u);var w1=Math,p=i,k1=(u=p.lib).WordArray,x1=u.Hasher,u=p.algo,b1=[],m1=[];function S1(t){return 4294967296*(t-(0|t))|0}for(var A1=2,z1=0;z1<64;)!function(t){for(var e=w1.sqrt(t),r=2;r<=e;r++)if(!(t%r))return;return 1}(A1)||(z1<8&&(b1[z1]=S1(w1.pow(A1,.5))),m1[z1]=S1(w1.pow(A1,1/3)),z1++),A1++;var _=[],u=u.SHA256=x1.extend({_doReset:function(){this._hash=new k1.init(b1.slice(0))},_doProcessBlock:function(t,e){for(var r=this._hash.words,i=r[0],o=r[1],n=r[2],s=r[3],c=r[4],a=r[5],h=r[6],l=r[7],f=0;f<64;f++){f<16?_[f]=0|t[e+f]:(d=_[f-15],u=_[f-2],_[f]=((d<<25|d>>>7)^(d<<14|d>>>18)^d>>>3)+_[f-7]+((u<<15|u>>>17)^(u<<13|u>>>19)^u>>>10)+_[f-16]);var d=i&o^i&n^o&n,u=l+((c<<26|c>>>6)^(c<<21|c>>>11)^(c<<7|c>>>25))+(c&a^~c&h)+m1[f]+_[f],l=h,h=a,a=c,c=s+u|0,s=n,n=o,o=i,i=u+(((i<<30|i>>>2)^(i<<19|i>>>13)^(i<<10|i>>>22))+d)|0}r[0]=r[0]+i|0,r[1]=r[1]+o|0,r[2]=r[2]+n|0,r[3]=r[3]+s|0,r[4]=r[4]+c|0,r[5]=r[5]+a|0,r[6]=r[6]+h|0,r[7]=r[7]+l|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return e[i>>>5]|=128<<24-i%32,e[14+(64+i>>>9<<4)]=w1.floor(r/4294967296),e[15+(64+i>>>9<<4)]=r,t.sigBytes=4*e.length,this._process(),this._hash},clone:function(){var t=x1.clone.call(this);return t._hash=this._hash.clone(),t}}),p=(p.SHA256=x1._createHelper(u),p.HmacSHA256=x1._createHmacHelper(u),j=(p=i).lib.WordArray,u=p.algo,T=u.SHA256,u=u.SHA224=T.extend({_doReset:function(){this._hash=new j.init([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428])},_doFinalize:function(){var t=T._doFinalize.call(this);return t.sigBytes-=4,t}}),p.SHA224=T._createHelper(u),p.HmacSHA224=T._createHmacHelper(u),i),H1=p.lib.Hasher,y=(u=p.x64).Word,C1=u.WordArray,u=p.algo;function g(){return y.create.apply(y,arguments)}for(var R1=[g(1116352408,3609767458),g(1899447441,602891725),g(3049323471,3964484399),g(3921009573,2173295548),g(961987163,4081628472),g(1508970993,3053834265),g(2453635748,2937671579),g(2870763221,3664609560),g(3624381080,2734883394),g(310598401,1164996542),g(607225278,1323610764),g(1426881987,3590304994),g(1925078388,4068182383),g(2162078206,991336113),g(2614888103,633803317),g(3248222580,3479774868),g(3835390401,2666613458),g(4022224774,944711139),g(264347078,2341262773),g(604807628,2007800933),g(770255983,1495990901),g(1249150122,1856431235),g(1555081692,3175218132),g(1996064986,2198950837),g(2554220882,3999719339),g(2821834349,766784016),g(2952996808,2566594879),g(3210313671,3203337956),g(3336571891,1034457026),g(3584528711,2466948901),g(113926993,3758326383),g(338241895,168717936),g(666307205,1188179964),g(773529912,1546045734),g(1294757372,1522805485),g(1396182291,2643833823),g(1695183700,2343527390),g(1986661051,1014477480),g(2177026350,1206759142),g(2456956037,344077627),g(2730485921,1290863460),g(2820302411,3158454273),g(3259730800,3505952657),g(3345764771,106217008),g(3516065817,3606008344),g(3600352804,1432725776),g(4094571909,1467031594),g(275423344,851169720),g(430227734,3100823752),g(506948616,1363258195),g(659060556,3750685593),g(883997877,3785050280),g(958139571,3318307427),g(1322822218,3812723403),g(1537002063,2003034995),g(1747873779,3602036899),g(1955562222,1575990012),g(2024104815,1125592928),g(2227730452,2716904306),g(2361852424,442776044),g(2428436474,593698344),g(2756734187,3733110249),g(3204031479,2999351573),g(3329325298,3815920427),g(3391569614,3928383900),g(3515267271,566280711),g(3940187606,3454069534),g(4118630271,4000239992),g(116418474,1914138554),g(174292421,2731055270),g(289380356,3203993006),g(460393269,320620315),g(685471733,587496836),g(852142971,1086792851),g(1017036298,365543100),g(1126000580,2618297676),g(1288033470,3409855158),g(1501505948,4234509866),g(1607167915,987167468),g(1816402316,1246189591)],D1=[],E1=0;E1<80;E1++)D1[E1]=g();u=u.SHA512=H1.extend({_doReset:function(){this._hash=new C1.init([new y.init(1779033703,4089235720),new y.init(3144134277,2227873595),new y.init(1013904242,4271175723),new y.init(2773480762,1595750129),new y.init(1359893119,2917565137),new y.init(2600822924,725511199),new y.init(528734635,4215389547),new y.init(1541459225,327033209)])},_doProcessBlock:function(W,O){for(var t=this._hash.words,e=t[0],r=t[1],i=t[2],o=t[3],n=t[4],s=t[5],c=t[6],t=t[7],I=e.high,a=e.low,U=r.high,h=r.low,K=i.high,l=i.low,X=o.high,f=o.low,L=n.high,d=n.low,j=s.high,u=s.low,T=c.high,p=c.low,N=t.high,_=t.low,y=I,g=a,v=U,B=h,w=K,k=l,q=X,x=f,b=L,m=d,Z=j,S=u,V=T,G=p,J=N,Q=_,A=0;A<80;A++)var z,H,C=D1[A],R=(A<16?(H=C.high=0|W[O+2*A],z=C.low=0|W[O+2*A+1]):(F=(P=D1[A-15]).high,P=P.low,M=(E=D1[A-2]).high,E=E.low,D=(R=D1[A-7]).high,R=R.low,$=(Y=D1[A-16]).high,H=(H=((F>>>1|P<<31)^(F>>>8|P<<24)^F>>>7)+D+((z=(D=(P>>>1|F<<31)^(P>>>8|F<<24)^(P>>>7|F<<25))+R)>>>0<D>>>0?1:0))+((M>>>19|E<<13)^(M<<3|E>>>29)^M>>>6)+((z+=P=(E>>>19|M<<13)^(E<<3|M>>>29)^(E>>>6|M<<26))>>>0<P>>>0?1:0),z+=F=Y.low,C.high=H=H+$+(z>>>0<F>>>0?1:0),C.low=z),b&Z^~b&V),D=m&S^~m&G,E=y&v^y&w^v&w,M=(g>>>28|y<<4)^(g<<30|y>>>2)^(g<<25|y>>>7),P=R1[A],Y=P.high,$=P.low,F=Q+((m>>>14|b<<18)^(m>>>18|b<<14)^(m<<23|b>>>9)),C=J+((b>>>14|m<<18)^(b>>>18|m<<14)^(b<<23|m>>>9))+(F>>>0<Q>>>0?1:0),t1=M+(g&B^g&k^B&k),J=V,Q=G,V=Z,G=S,Z=b,S=m,b=q+(C=C+R+((F=F+D)>>>0<D>>>0?1:0)+Y+((F=F+$)>>>0<$>>>0?1:0)+H+((F=F+z)>>>0<z>>>0?1:0))+((m=x+F|0)>>>0<x>>>0?1:0)|0,q=w,x=k,w=v,k=B,v=y,B=g,y=C+(((y>>>28|g<<4)^(y<<30|g>>>2)^(y<<25|g>>>7))+E+(t1>>>0<M>>>0?1:0))+((g=F+t1|0)>>>0<F>>>0?1:0)|0;a=e.low=a+g,e.high=I+y+(a>>>0<g>>>0?1:0),h=r.low=h+B,r.high=U+v+(h>>>0<B>>>0?1:0),l=i.low=l+k,i.high=K+w+(l>>>0<k>>>0?1:0),f=o.low=f+x,o.high=X+q+(f>>>0<x>>>0?1:0),d=n.low=d+m,n.high=L+b+(d>>>0<m>>>0?1:0),u=s.low=u+S,s.high=j+Z+(u>>>0<S>>>0?1:0),p=c.low=p+G,c.high=T+V+(p>>>0<G>>>0?1:0),_=t.low=_+Q,t.high=N+J+(_>>>0<Q>>>0?1:0)},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return e[i>>>5]|=128<<24-i%32,e[30+(128+i>>>10<<5)]=Math.floor(r/4294967296),e[31+(128+i>>>10<<5)]=r,t.sigBytes=4*e.length,this._process(),this._hash.toX32()},clone:function(){var t=H1.clone.call(this);return t._hash=this._hash.clone(),t},blockSize:32}),p.SHA512=H1._createHelper(u),p.HmacSHA512=H1._createHmacHelper(u),u=(p=i).x64,t=u.Word,N=u.WordArray,u=p.algo,q=u.SHA512,u=u.SHA384=q.extend({_doReset:function(){this._hash=new N.init([new t.init(3418070365,3238371032),new t.init(1654270250,914150663),new t.init(2438529370,812702999),new t.init(355462360,4144912697),new t.init(1731405415,4290775857),new t.init(2394180231,1750603025),new t.init(3675008525,1694076839),new t.init(1203062813,3204075428)])},_doFinalize:function(){var t=q._doFinalize.call(this);return t.sigBytes-=16,t}}),p.SHA384=q._createHelper(u),p.HmacSHA384=q._createHmacHelper(u);for(var M1=Math,p=i,P1=(u=p.lib).WordArray,F1=u.Hasher,W1=p.x64.Word,u=p.algo,O1=[],I1=[],U1=[],v=1,B=0,K1=0;K1<24;K1++){O1[v+5*B]=(K1+1)*(K1+2)/2%64;var X1=(2*v+3*B)%5;v=B%5,B=X1}for(v=0;v<5;v++)for(B=0;B<5;B++)I1[v+5*B]=B+(2*v+3*B)%5*5;for(var L1=1,j1=0;j1<24;j1++){for(var T1,N1=0,q1=0,Z1=0;Z1<7;Z1++)1&L1&&((T1=(1<<Z1)-1)<32?q1^=1<<T1:N1^=1<<T1-32),128&L1?L1=L1<<1^113:L1<<=1;U1[j1]=W1.create(N1,q1)}for(var D=[],V1=0;V1<25;V1++)D[V1]=W1.create();function G1(t,e,r){return t&e|~t&r}function J1(t,e,r){return t&r|e&~r}function Q1(t,e){return t<<e|t>>>32-e}function Y1(t){return"string"==typeof t?f1:o}function $1(t,e,r){var i,o=this._iv;o?(i=o,this._iv=void 0):i=this._prevBlock;for(var n=0;n<r;n++)t[e+n]^=i[n]}function t2(t,e,r,i){var o,n=this._iv;n?(o=n.slice(0),this._iv=void 0):o=this._prevBlock,i.encryptBlock(o,0);for(var s=0;s<r;s++)t[e+s]^=o[s]}function e2(t){var e,r,i;return 255==(t>>24&255)?(r=t>>8&255,i=255&t,255===(e=t>>16&255)?(e=0,255===r?(r=0,255===i?i=0:++i):++r):++e,t=0,t=(t+=e<<16)+(r<<8)+i):t+=1<<24,t}u=u.SHA3=F1.extend({cfg:F1.cfg.extend({outputLength:512}),_doReset:function(){for(var t=this._state=[],e=0;e<25;e++)t[e]=new W1.init;this.blockSize=(1600-2*this.cfg.outputLength)/32},_doProcessBlock:function(t,e){for(var r=this._state,i=this.blockSize/2,o=0;o<i;o++){var n=t[e+2*o],s=t[e+2*o+1],n=16711935&(n<<8|n>>>24)|4278255360&(n<<24|n>>>8);(x=r[o]).high^=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),x.low^=n}for(var c=0;c<24;c++){for(var a=0;a<5;a++){for(var h=0,l=0,f=0;f<5;f++)h^=(x=r[a+5*f]).high,l^=x.low;var d=D[a];d.high=h,d.low=l}for(a=0;a<5;a++)for(var u=D[(a+4)%5],p=D[(a+1)%5],_=p.high,p=p.low,h=u.high^(_<<1|p>>>31),l=u.low^(p<<1|_>>>31),f=0;f<5;f++)(x=r[a+5*f]).high^=h,x.low^=l;for(var y=1;y<25;y++){var g=(x=r[y]).high,v=x.low,B=O1[y],g=(l=B<32?(h=g<<B|v>>>32-B,v<<B|g>>>32-B):(h=v<<B-32|g>>>64-B,g<<B-32|v>>>64-B),D[I1[y]]);g.high=h,g.low=l}var w=D[0],k=r[0];w.high=k.high,w.low=k.low;for(a=0;a<5;a++)for(f=0;f<5;f++){var x=r[y=a+5*f],b=D[y],m=D[(a+1)%5+5*f],S=D[(a+2)%5+5*f];x.high=b.high^~m.high&S.high,x.low=b.low^~m.low&S.low}x=r[0],w=U1[c];x.high^=w.high,x.low^=w.low}},_doFinalize:function(){for(var t=this._data,e=t.words,r=(this._nDataBytes,8*t.sigBytes),i=32*this.blockSize,o=(e[r>>>5]|=1<<24-r%32,e[(M1.ceil((1+r)/i)*i>>>5)-1]|=128,t.sigBytes=4*e.length,this._process(),this._state),r=this.cfg.outputLength/8,n=r/8,s=[],c=0;c<n;c++){var a=o[c],h=a.high,a=a.low,h=16711935&(h<<8|h>>>24)|4278255360&(h<<24|h>>>8);s.push(16711935&(a<<8|a>>>24)|4278255360&(a<<24|a>>>8)),s.push(h)}return new P1.init(s,r)},clone:function(){for(var t=F1.clone.call(this),e=t._state=this._state.slice(0),r=0;r<25;r++)e[r]=e[r].clone();return t}}),p.SHA3=F1._createHelper(u),p.HmacSHA3=F1._createHmacHelper(u),Math,u=(p=i).lib,e=u.WordArray,Z=u.Hasher,u=p.algo,V=e.create([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]),G=e.create([5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]),J=e.create([11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]),Q=e.create([8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]),Y=e.create([0,1518500249,1859775393,2400959708,2840853838]),$=e.create([1352829926,1548603684,1836072691,2053994217,0]),u=u.RIPEMD160=Z.extend({_doReset:function(){this._hash=e.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,e){for(var r=0;r<16;r++){var i=e+r,o=t[i];t[i]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8)}for(var n,s,c,a,h,l,f=this._hash.words,d=Y.words,u=$.words,p=V.words,_=G.words,y=J.words,g=Q.words,v=n=f[0],B=s=f[1],w=c=f[2],k=a=f[3],x=h=f[4],r=0;r<80;r+=1)l=(l=Q1(l=(l=n+t[e+p[r]]|0)+(r<16?(s^c^a)+d[0]:r<32?G1(s,c,a)+d[1]:r<48?((s|~c)^a)+d[2]:r<64?J1(s,c,a)+d[3]:(s^(c|~a))+d[4])|0,y[r]))+h|0,n=h,h=a,a=Q1(c,10),c=s,s=l,l=(l=Q1(l=(l=v+t[e+_[r]]|0)+(r<16?(B^(w|~k))+u[0]:r<32?J1(B,w,k)+u[1]:r<48?((B|~w)^k)+u[2]:r<64?G1(B,w,k)+u[3]:(B^w^k)+u[4])|0,g[r]))+x|0,v=x,x=k,k=Q1(w,10),w=B,B=l;l=f[1]+c+k|0,f[1]=f[2]+a+x|0,f[2]=f[3]+h+v|0,f[3]=f[4]+n+B|0,f[4]=f[0]+s+w|0,f[0]=l},_doFinalize:function(){for(var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes,i=(e[i>>>5]|=128<<24-i%32,e[14+(64+i>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t.sigBytes=4*(e.length+1),this._process(),this._hash),o=i.words,n=0;n<5;n++){var s=o[n];o[n]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8)}return i},clone:function(){var t=Z.clone.call(this);return t._hash=this._hash.clone(),t}}),p.RIPEMD160=Z._createHelper(u),p.HmacRIPEMD160=Z._createHmacHelper(u),u=(p=i).lib.Base,t1=p.enc.Utf8,p.algo.HMAC=u.extend({init:function(t,e){t=this._hasher=new t.init,"string"==typeof e&&(e=t1.parse(e));for(var r=t.blockSize,i=4*r,t=((e=e.sigBytes>i?t.finalize(e):e).clamp(),this._oKey=e.clone()),e=this._iKey=e.clone(),o=t.words,n=e.words,s=0;s<r;s++)o[s]^=1549556828,n[s]^=909522486;t.sigBytes=e.sigBytes=i,this.reset()},reset:function(){var t=this._hasher;t.reset(),t.update(this._iKey)},update:function(t){return this._hasher.update(t),this},finalize:function(t){var e=this._hasher,t=e.finalize(t);return e.reset(),e.finalize(this._oKey.clone().concat(t))}}),u=(p=i).lib,w=u.Base,e1=u.WordArray,u=p.algo,P=u.SHA256,r1=u.HMAC,i1=u.PBKDF2=w.extend({cfg:w.extend({keySize:4,hasher:P,iterations:25e4}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r=this.cfg,i=r1.create(r.hasher,t),o=e1.create(),n=e1.create([1]),s=o.words,c=n.words,a=r.keySize,h=r.iterations;s.length<a;){for(var l=i.update(e).finalize(n),f=(i.reset(),l.words),d=f.length,u=l,p=1;p<h;p++){u=i.finalize(u),i.reset();for(var _=u.words,y=0;y<d;y++)f[y]^=_[y]}o.concat(l),c[0]++}return o.sigBytes=4*a,o}}),p.PBKDF2=function(t,e,r){return i1.create(r).compute(t,e)},w=(u=i).lib,P=w.Base,o1=w.WordArray,w=u.algo,p=w.MD5,n1=w.EvpKDF=P.extend({cfg:P.extend({keySize:4,hasher:p,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r,i=this.cfg,o=i.hasher.create(),n=o1.create(),s=n.words,c=i.keySize,a=i.iterations;s.length<c;){r&&o.update(r),r=o.update(t).finalize(e),o.reset();for(var h=1;h<a;h++)r=o.finalize(r),o.reset();n.concat(r)}return n.sigBytes=4*c,n}}),u.EvpKDF=function(t,e,r){return n1.create(r).compute(t,e)},i.lib.Cipher||(P=(w=i).lib,p=P.Base,s=P.WordArray,s1=P.BufferedBlockAlgorithm,(u=w.enc).Utf8,c1=u.Base64,a1=w.algo.EvpKDF,h1=P.Cipher=s1.extend({cfg:p.extend(),createEncryptor:function(t,e){return this.create(this._ENC_XFORM_MODE,t,e)},createDecryptor:function(t,e){return this.create(this._DEC_XFORM_MODE,t,e)},init:function(t,e,r){this.cfg=this.cfg.extend(r),this._xformMode=t,this._key=e,this.reset()},reset:function(){s1.reset.call(this),this._doReset()},process:function(t){return this._append(t),this._process()},finalize:function(t){return t&&this._append(t),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(i){return{encrypt:function(t,e,r){return Y1(e).encrypt(i,t,e,r)},decrypt:function(t,e,r){return Y1(e).decrypt(i,t,e,r)}}}}),P.StreamCipher=h1.extend({_doFinalize:function(){return this._process(!0)},blockSize:1}),u=w.mode={},r=P.BlockCipherMode=p.extend({createEncryptor:function(t,e){return this.Encryptor.create(t,e)},createDecryptor:function(t,e){return this.Decryptor.create(t,e)},init:function(t,e){this._cipher=t,this._iv=e}}),r=u.CBC=((u=r.extend()).Encryptor=u.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize;$1.call(this,t,e,i),r.encryptBlock(t,e),this._prevBlock=t.slice(e,e+i)}}),u.Decryptor=u.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,o=t.slice(e,e+i);r.decryptBlock(t,e),$1.call(this,t,e,i),this._prevBlock=o}}),u),u=(w.pad={}).Pkcs7={pad:function(t,e){for(var e=4*e,r=e-t.sigBytes%e,i=r<<24|r<<16|r<<8|r,o=[],n=0;n<r;n+=4)o.push(i);e=s.create(o,r);t.concat(e)},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},P.BlockCipher=h1.extend({cfg:h1.cfg.extend({mode:r,padding:u}),reset:function(){h1.reset.call(this);var t,e=this.cfg,r=e.iv,e=e.mode;this._xformMode==this._ENC_XFORM_MODE?t=e.createEncryptor:(t=e.createDecryptor,this._minBufferSize=1),this._mode&&this._mode.__creator==t?this._mode.init(this,r&&r.words):(this._mode=t.call(e,this,r&&r.words),this._mode.__creator=t)},_doProcessBlock:function(t,e){this._mode.processBlock(t,e)},_doFinalize:function(){var t,e=this.cfg.padding;return this._xformMode==this._ENC_XFORM_MODE?(e.pad(this._data,this.blockSize),t=this._process(!0)):(t=this._process(!0),e.unpad(t)),t},blockSize:4}),l1=P.CipherParams=p.extend({init:function(t){this.mixIn(t)},toString:function(t){return(t||this.formatter).stringify(this)}}),r=(w.format={}).OpenSSL={stringify:function(t){var e=t.ciphertext,t=t.salt,t=t?s.create([1398893684,1701076831]).concat(t).concat(e):e;return t.toString(c1)},parse:function(t){var e,t=c1.parse(t),r=t.words;return 1398893684==r[0]&&1701076831==r[1]&&(e=s.create(r.slice(2,4)),r.splice(0,4),t.sigBytes-=16),l1.create({ciphertext:t,salt:e})}},o=P.SerializableCipher=p.extend({cfg:p.extend({format:r}),encrypt:function(t,e,r,i){i=this.cfg.extend(i);var o=t.createEncryptor(r,i),e=o.finalize(e),o=o.cfg;return l1.create({ciphertext:e,key:r,iv:o.iv,algorithm:t,mode:o.mode,padding:o.padding,blockSize:t.blockSize,formatter:i.format})},decrypt:function(t,e,r,i){return i=this.cfg.extend(i),e=this._parse(e,i.format),t.createDecryptor(r,i).finalize(e.ciphertext)},_parse:function(t,e){return"string"==typeof t?e.parse(t,this):t}}),u=(w.kdf={}).OpenSSL={execute:function(t,e,r,i,o){i=i||s.random(8),o=(o?a1.create({keySize:e+r,hasher:o}):a1.create({keySize:e+r})).compute(t,i);t=s.create(o.words.slice(e),4*r);return o.sigBytes=4*e,l1.create({key:o,iv:t,salt:i})}},f1=P.PasswordBasedCipher=o.extend({cfg:o.cfg.extend({kdf:u}),encrypt:function(t,e,r,i){r=(i=this.cfg.extend(i)).kdf.execute(r,t.keySize,t.ivSize,i.salt,i.hasher),i.iv=r.iv,t=o.encrypt.call(this,t,e,r.key,i);return t.mixIn(r),t},decrypt:function(t,e,r,i){i=this.cfg.extend(i),e=this._parse(e,i.format);r=i.kdf.execute(r,t.keySize,t.ivSize,e.salt,i.hasher);return i.iv=r.iv,o.decrypt.call(this,t,e,r.key,i)}})),i.mode.CFB=((p=i.lib.BlockCipherMode.extend()).Encryptor=p.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize;t2.call(this,t,e,i,r),this._prevBlock=t.slice(e,e+i)}}),p.Decryptor=p.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,o=t.slice(e,e+i);t2.call(this,t,e,i,r),this._prevBlock=o}}),p),i.mode.CTR=(r=i.lib.BlockCipherMode.extend(),w=r.Encryptor=r.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,o=this._iv,n=this._counter,s=(o&&(n=this._counter=o.slice(0),this._iv=void 0),n.slice(0));r.encryptBlock(s,0),n[i-1]=n[i-1]+1|0;for(var c=0;c<i;c++)t[e+c]^=s[c]}}),r.Decryptor=w,r),i.mode.CTRGladman=(P=i.lib.BlockCipherMode.extend(),u=P.Encryptor=P.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,o=this._iv,n=this._counter,s=(o&&(n=this._counter=o.slice(0),this._iv=void 0),0===((o=n)[0]=e2(o[0]))&&(o[1]=e2(o[1])),n.slice(0));r.encryptBlock(s,0);for(var c=0;c<i;c++)t[e+c]^=s[c]}}),P.Decryptor=u,P),i.mode.OFB=(p=i.lib.BlockCipherMode.extend(),w=p.Encryptor=p.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,o=this._iv,n=this._keystream;o&&(n=this._keystream=o.slice(0),this._iv=void 0),r.encryptBlock(n,0);for(var s=0;s<i;s++)t[e+s]^=n[s]}}),p.Decryptor=w,p),i.mode.ECB=((u=i.lib.BlockCipherMode.extend()).Encryptor=u.extend({processBlock:function(t,e){this._cipher.encryptBlock(t,e)}}),u.Decryptor=u.extend({processBlock:function(t,e){this._cipher.decryptBlock(t,e)}}),u),i.pad.AnsiX923={pad:function(t,e){var r=t.sigBytes,e=4*e,e=e-r%e,r=r+e-1;t.clamp(),t.words[r>>>2]|=e<<24-r%4*8,t.sigBytes+=e},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},i.pad.Iso10126={pad:function(t,e){e*=4,e-=t.sigBytes%e;t.concat(i.lib.WordArray.random(e-1)).concat(i.lib.WordArray.create([e<<24],1))},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},i.pad.Iso97971={pad:function(t,e){t.concat(i.lib.WordArray.create([2147483648],1)),i.pad.ZeroPadding.pad(t,e)},unpad:function(t){i.pad.ZeroPadding.unpad(t),t.sigBytes--}},i.pad.ZeroPadding={pad:function(t,e){e*=4;t.clamp(),t.sigBytes+=e-(t.sigBytes%e||e)},unpad:function(t){for(var e=t.words,r=t.sigBytes-1,r=t.sigBytes-1;0<=r;r--)if(e[r>>>2]>>>24-r%4*8&255){t.sigBytes=r+1;break}}},i.pad.NoPadding={pad:function(){},unpad:function(){}},d1=(P=i).lib.CipherParams,u1=P.enc.Hex,P.format.Hex={stringify:function(t){return t.ciphertext.toString(u1)},parse:function(t){t=u1.parse(t);return d1.create({ciphertext:t})}};for(var w=i,p=w.lib.BlockCipher,u=w.algo,k=[],r2=[],i2=[],o2=[],n2=[],s2=[],c2=[],a2=[],h2=[],l2=[],x=[],b=0;b<256;b++)x[b]=b<128?b<<1:b<<1^283;for(var m=0,S=0,b=0;b<256;b++){var E=S^S<<1^S<<2^S<<3^S<<4,f2=(k[m]=E=E>>>8^255&E^99,x[r2[E]=m]),d2=x[f2],u2=x[d2],M=257*x[E]^16843008*E;i2[m]=M<<24|M>>>8,o2[m]=M<<16|M>>>16,n2[m]=M<<8|M>>>24,s2[m]=M,c2[E]=(M=16843009*u2^65537*d2^257*f2^16843008*m)<<24|M>>>8,a2[E]=M<<16|M>>>16,h2[E]=M<<8|M>>>24,l2[E]=M,m?(m=f2^x[x[x[u2^f2]]],S^=x[x[S]]):m=S=1}var p2=[0,1,2,4,8,16,32,64,128,27,54],u=u.AES=p.extend({_doReset:function(){if(!this._nRounds||this._keyPriorReset!==this._key){for(var t=this._keyPriorReset=this._key,e=t.words,r=t.sigBytes/4,i=4*(1+(this._nRounds=6+r)),o=this._keySchedule=[],n=0;n<i;n++)n<r?o[n]=e[n]:(a=o[n-1],n%r?6<r&&n%r==4&&(a=k[a>>>24]<<24|k[a>>>16&255]<<16|k[a>>>8&255]<<8|k[255&a]):(a=k[(a=a<<8|a>>>24)>>>24]<<24|k[a>>>16&255]<<16|k[a>>>8&255]<<8|k[255&a],a^=p2[n/r|0]<<24),o[n]=o[n-r]^a);for(var s=this._invKeySchedule=[],c=0;c<i;c++){var a,n=i-c;a=c%4?o[n]:o[n-4],s[c]=c<4||n<=4?a:c2[k[a>>>24]]^a2[k[a>>>16&255]]^h2[k[a>>>8&255]]^l2[k[255&a]]}}},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._keySchedule,i2,o2,n2,s2,k)},decryptBlock:function(t,e){var r=t[e+1],r=(t[e+1]=t[e+3],t[e+3]=r,this._doCryptBlock(t,e,this._invKeySchedule,c2,a2,h2,l2,r2),t[e+1]);t[e+1]=t[e+3],t[e+3]=r},_doCryptBlock:function(t,e,r,i,o,n,s,c){for(var a=this._nRounds,h=t[e]^r[0],l=t[e+1]^r[1],f=t[e+2]^r[2],d=t[e+3]^r[3],u=4,p=1;p<a;p++)var _=i[h>>>24]^o[l>>>16&255]^n[f>>>8&255]^s[255&d]^r[u++],y=i[l>>>24]^o[f>>>16&255]^n[d>>>8&255]^s[255&h]^r[u++],g=i[f>>>24]^o[d>>>16&255]^n[h>>>8&255]^s[255&l]^r[u++],v=i[d>>>24]^o[h>>>16&255]^n[l>>>8&255]^s[255&f]^r[u++],h=_,l=y,f=g,d=v;_=(c[h>>>24]<<24|c[l>>>16&255]<<16|c[f>>>8&255]<<8|c[255&d])^r[u++],y=(c[l>>>24]<<24|c[f>>>16&255]<<16|c[d>>>8&255]<<8|c[255&h])^r[u++],g=(c[f>>>24]<<24|c[d>>>16&255]<<16|c[h>>>8&255]<<8|c[255&l])^r[u++],v=(c[d>>>24]<<24|c[h>>>16&255]<<16|c[l>>>8&255]<<8|c[255&f])^r[u++];t[e]=_,t[e+1]=y,t[e+2]=g,t[e+3]=v},keySize:8}),P=(w.AES=p._createHelper(u),i),_2=(w=P.lib).WordArray,w=w.BlockCipher,p=P.algo,y2=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],g2=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],v2=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],B2=[{0:8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{0:1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{0:260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{0:2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{0:128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{0:268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{0:1048576,16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{0:134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],w2=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],k2=p.DES=w.extend({_doReset:function(){for(var t=this._key.words,e=[],r=0;r<56;r++){var i=y2[r]-1;e[r]=t[i>>>5]>>>31-i%32&1}for(var o=this._subKeys=[],n=0;n<16;n++){for(var s=o[n]=[],c=v2[n],r=0;r<24;r++)s[r/6|0]|=e[(g2[r]-1+c)%28]<<31-r%6,s[4+(r/6|0)]|=e[28+(g2[r+24]-1+c)%28]<<31-r%6;s[0]=s[0]<<1|s[0]>>>31;for(r=1;r<7;r++)s[r]=s[r]>>>4*(r-1)+3;s[7]=s[7]<<5|s[7]>>>27}for(var a=this._invSubKeys=[],r=0;r<16;r++)a[r]=o[15-r]},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._subKeys)},decryptBlock:function(t,e){this._doCryptBlock(t,e,this._invSubKeys)},_doCryptBlock:function(t,e,r){this._lBlock=t[e],this._rBlock=t[e+1],x2.call(this,4,252645135),x2.call(this,16,65535),b2.call(this,2,858993459),b2.call(this,8,16711935),x2.call(this,1,1431655765);for(var i=0;i<16;i++){for(var o=r[i],n=this._lBlock,s=this._rBlock,c=0,a=0;a<8;a++)c|=B2[a][((s^o[a])&w2[a])>>>0];this._lBlock=s,this._rBlock=n^c}var h=this._lBlock;this._lBlock=this._rBlock,this._rBlock=h,x2.call(this,1,1431655765),b2.call(this,8,16711935),b2.call(this,2,858993459),x2.call(this,16,65535),x2.call(this,4,252645135),t[e]=this._lBlock,t[e+1]=this._rBlock},keySize:2,ivSize:2,blockSize:2});function x2(t,e){e=(this._lBlock>>>t^this._rBlock)&e;this._rBlock^=e,this._lBlock^=e<<t}function b2(t,e){e=(this._rBlock>>>t^this._lBlock)&e;this._lBlock^=e,this._rBlock^=e<<t}P.DES=w._createHelper(k2),p=p.TripleDES=w.extend({_doReset:function(){var t=this._key.words;if(2!==t.length&&4!==t.length&&t.length<6)throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");var e=t.slice(0,2),r=t.length<4?t.slice(0,2):t.slice(2,4),t=t.length<6?t.slice(0,2):t.slice(4,6);this._des1=k2.createEncryptor(_2.create(e)),this._des2=k2.createEncryptor(_2.create(r)),this._des3=k2.createEncryptor(_2.create(t))},encryptBlock:function(t,e){this._des1.encryptBlock(t,e),this._des2.decryptBlock(t,e),this._des3.encryptBlock(t,e)},decryptBlock:function(t,e){this._des3.decryptBlock(t,e),this._des2.encryptBlock(t,e),this._des1.decryptBlock(t,e)},keySize:6,ivSize:2,blockSize:2}),P.TripleDES=w._createHelper(p);var u=i,P=u.lib.StreamCipher,w=u.algo,m2=w.RC4=P.extend({_doReset:function(){for(var t=this._key,e=t.words,r=t.sigBytes,i=this._S=[],o=0;o<256;o++)i[o]=o;for(var o=0,n=0;o<256;o++){var s=o%r,s=e[s>>>2]>>>24-s%4*8&255,n=(n+i[o]+s)%256,s=i[o];i[o]=i[n],i[n]=s}this._i=this._j=0},_doProcessBlock:function(t,e){t[e]^=S2.call(this)},keySize:8,ivSize:0});function S2(){for(var t=this._S,e=this._i,r=this._j,i=0,o=0;o<4;o++){var r=(r+t[e=(e+1)%256])%256,n=t[e];t[e]=t[r],t[r]=n,i|=t[(t[e]+t[r])%256]<<24-8*o}return this._i=e,this._j=r,i}function A2(){for(var t=this._X,e=this._C,r=0;r<8;r++)c[r]=e[r];e[0]=e[0]+1295307597+this._b|0,e[1]=e[1]+3545052371+(e[0]>>>0<c[0]>>>0?1:0)|0,e[2]=e[2]+886263092+(e[1]>>>0<c[1]>>>0?1:0)|0,e[3]=e[3]+1295307597+(e[2]>>>0<c[2]>>>0?1:0)|0,e[4]=e[4]+3545052371+(e[3]>>>0<c[3]>>>0?1:0)|0,e[5]=e[5]+886263092+(e[4]>>>0<c[4]>>>0?1:0)|0,e[6]=e[6]+1295307597+(e[5]>>>0<c[5]>>>0?1:0)|0,e[7]=e[7]+3545052371+(e[6]>>>0<c[6]>>>0?1:0)|0,this._b=e[7]>>>0<c[7]>>>0?1:0;for(r=0;r<8;r++){var i=t[r]+e[r],o=65535&i,n=i>>>16;a[r]=((o*o>>>17)+o*n>>>15)+n*n^((4294901760&i)*i|0)+((65535&i)*i|0)}t[0]=a[0]+(a[7]<<16|a[7]>>>16)+(a[6]<<16|a[6]>>>16)|0,t[1]=a[1]+(a[0]<<8|a[0]>>>24)+a[7]|0,t[2]=a[2]+(a[1]<<16|a[1]>>>16)+(a[0]<<16|a[0]>>>16)|0,t[3]=a[3]+(a[2]<<8|a[2]>>>24)+a[1]|0,t[4]=a[4]+(a[3]<<16|a[3]>>>16)+(a[2]<<16|a[2]>>>16)|0,t[5]=a[5]+(a[4]<<8|a[4]>>>24)+a[3]|0,t[6]=a[6]+(a[5]<<16|a[5]>>>16)+(a[4]<<16|a[4]>>>16)|0,t[7]=a[7]+(a[6]<<8|a[6]>>>24)+a[5]|0}function z2(){for(var t=this._X,e=this._C,r=0;r<8;r++)f[r]=e[r];e[0]=e[0]+1295307597+this._b|0,e[1]=e[1]+3545052371+(e[0]>>>0<f[0]>>>0?1:0)|0,e[2]=e[2]+886263092+(e[1]>>>0<f[1]>>>0?1:0)|0,e[3]=e[3]+1295307597+(e[2]>>>0<f[2]>>>0?1:0)|0,e[4]=e[4]+3545052371+(e[3]>>>0<f[3]>>>0?1:0)|0,e[5]=e[5]+886263092+(e[4]>>>0<f[4]>>>0?1:0)|0,e[6]=e[6]+1295307597+(e[5]>>>0<f[5]>>>0?1:0)|0,e[7]=e[7]+3545052371+(e[6]>>>0<f[6]>>>0?1:0)|0,this._b=e[7]>>>0<f[7]>>>0?1:0;for(r=0;r<8;r++){var i=t[r]+e[r],o=65535&i,n=i>>>16;d[r]=((o*o>>>17)+o*n>>>15)+n*n^((4294901760&i)*i|0)+((65535&i)*i|0)}t[0]=d[0]+(d[7]<<16|d[7]>>>16)+(d[6]<<16|d[6]>>>16)|0,t[1]=d[1]+(d[0]<<8|d[0]>>>24)+d[7]|0,t[2]=d[2]+(d[1]<<16|d[1]>>>16)+(d[0]<<16|d[0]>>>16)|0,t[3]=d[3]+(d[2]<<8|d[2]>>>24)+d[1]|0,t[4]=d[4]+(d[3]<<16|d[3]>>>16)+(d[2]<<16|d[2]>>>16)|0,t[5]=d[5]+(d[4]<<8|d[4]>>>24)+d[3]|0,t[6]=d[6]+(d[5]<<16|d[5]>>>16)+(d[4]<<16|d[4]>>>16)|0,t[7]=d[7]+(d[6]<<8|d[6]>>>24)+d[5]|0}u.RC4=P._createHelper(m2),w=w.RC4Drop=m2.extend({cfg:m2.cfg.extend({drop:192}),_doReset:function(){m2._doReset.call(this);for(var t=this.cfg.drop;0<t;t--)S2.call(this)}}),u.RC4Drop=P._createHelper(w),u=(p=i).lib.StreamCipher,P=p.algo,n=[],c=[],a=[],P=P.Rabbit=u.extend({_doReset:function(){for(var t=this._key.words,e=this.cfg.iv,r=0;r<4;r++)t[r]=16711935&(t[r]<<8|t[r]>>>24)|4278255360&(t[r]<<24|t[r]>>>8);for(var i=this._X=[t[0],t[3]<<16|t[2]>>>16,t[1],t[0]<<16|t[3]>>>16,t[2],t[1]<<16|t[0]>>>16,t[3],t[2]<<16|t[1]>>>16],o=this._C=[t[2]<<16|t[2]>>>16,4294901760&t[0]|65535&t[1],t[3]<<16|t[3]>>>16,4294901760&t[1]|65535&t[2],t[0]<<16|t[0]>>>16,4294901760&t[2]|65535&t[3],t[1]<<16|t[1]>>>16,4294901760&t[3]|65535&t[0]],r=this._b=0;r<4;r++)A2.call(this);for(r=0;r<8;r++)o[r]^=i[r+4&7];if(e){var e=e.words,n=e[0],e=e[1],n=16711935&(n<<8|n>>>24)|4278255360&(n<<24|n>>>8),e=16711935&(e<<8|e>>>24)|4278255360&(e<<24|e>>>8),s=n>>>16|4294901760&e,c=e<<16|65535&n;o[0]^=n,o[1]^=s,o[2]^=e,o[3]^=c,o[4]^=n,o[5]^=s,o[6]^=e,o[7]^=c;for(r=0;r<4;r++)A2.call(this)}},_doProcessBlock:function(t,e){var r=this._X;A2.call(this),n[0]=r[0]^r[5]>>>16^r[3]<<16,n[1]=r[2]^r[7]>>>16^r[5]<<16,n[2]=r[4]^r[1]>>>16^r[7]<<16,n[3]=r[6]^r[3]>>>16^r[1]<<16;for(var i=0;i<4;i++)n[i]=16711935&(n[i]<<8|n[i]>>>24)|4278255360&(n[i]<<24|n[i]>>>8),t[e+i]^=n[i]},blockSize:4,ivSize:2}),p.Rabbit=u._createHelper(P),p=(w=i).lib.StreamCipher,u=w.algo,h=[],f=[],d=[],u=u.RabbitLegacy=p.extend({_doReset:function(){for(var t=this._key.words,e=this.cfg.iv,r=this._X=[t[0],t[3]<<16|t[2]>>>16,t[1],t[0]<<16|t[3]>>>16,t[2],t[1]<<16|t[0]>>>16,t[3],t[2]<<16|t[1]>>>16],i=this._C=[t[2]<<16|t[2]>>>16,4294901760&t[0]|65535&t[1],t[3]<<16|t[3]>>>16,4294901760&t[1]|65535&t[2],t[0]<<16|t[0]>>>16,4294901760&t[2]|65535&t[3],t[1]<<16|t[1]>>>16,4294901760&t[3]|65535&t[0]],o=this._b=0;o<4;o++)z2.call(this);for(o=0;o<8;o++)i[o]^=r[o+4&7];if(e){var t=e.words,e=t[0],t=t[1],e=16711935&(e<<8|e>>>24)|4278255360&(e<<24|e>>>8),t=16711935&(t<<8|t>>>24)|4278255360&(t<<24|t>>>8),n=e>>>16|4294901760&t,s=t<<16|65535&e;i[0]^=e,i[1]^=n,i[2]^=t,i[3]^=s,i[4]^=e,i[5]^=n,i[6]^=t,i[7]^=s;for(o=0;o<4;o++)z2.call(this)}},_doProcessBlock:function(t,e){var r=this._X;z2.call(this),h[0]=r[0]^r[5]>>>16^r[3]<<16,h[1]=r[2]^r[7]>>>16^r[5]<<16,h[2]=r[4]^r[1]>>>16^r[7]<<16,h[3]=r[6]^r[3]>>>16^r[1]<<16;for(var i=0;i<4;i++)h[i]=16711935&(h[i]<<8|h[i]>>>24)|4278255360&(h[i]<<24|h[i]>>>8),t[e+i]^=h[i]},blockSize:4,ivSize:2}),w.RabbitLegacy=p._createHelper(u);{w=(P=i).lib.BlockCipher,p=P.algo;const F=16,D2=[608135816,2242054355,320440878,57701188,2752067618,698298832,137296536,3964562569,1160258022,953160567,3193202383,887688300,3232508343,3380367581,1065670069,3041331479,2450970073,2306472731],E2=[[3509652390,2564797868,805139163,3491422135,3101798381,1780907670,3128725573,4046225305,614570311,3012652279,134345442,2240740374,1667834072,1901547113,2757295779,4103290238,227898511,1921955416,1904987480,2182433518,2069144605,3260701109,2620446009,720527379,3318853667,677414384,3393288472,3101374703,2390351024,1614419982,1822297739,2954791486,3608508353,3174124327,2024746970,1432378464,3864339955,2857741204,1464375394,1676153920,1439316330,715854006,3033291828,289532110,2706671279,2087905683,3018724369,1668267050,732546397,1947742710,3462151702,2609353502,2950085171,1814351708,2050118529,680887927,999245976,1800124847,3300911131,1713906067,1641548236,4213287313,1216130144,1575780402,4018429277,3917837745,3693486850,3949271944,596196993,3549867205,258830323,2213823033,772490370,2760122372,1774776394,2652871518,566650946,4142492826,1728879713,2882767088,1783734482,3629395816,2517608232,2874225571,1861159788,326777828,3124490320,2130389656,2716951837,967770486,1724537150,2185432712,2364442137,1164943284,2105845187,998989502,3765401048,2244026483,1075463327,1455516326,1322494562,910128902,469688178,1117454909,936433444,3490320968,3675253459,1240580251,122909385,2157517691,634681816,4142456567,3825094682,3061402683,2540495037,79693498,3249098678,1084186820,1583128258,426386531,1761308591,1047286709,322548459,995290223,1845252383,2603652396,3431023940,2942221577,3202600964,3727903485,1712269319,422464435,3234572375,1170764815,3523960633,3117677531,1434042557,442511882,3600875718,1076654713,1738483198,4213154764,2393238008,3677496056,1014306527,4251020053,793779912,2902807211,842905082,4246964064,1395751752,1040244610,2656851899,3396308128,445077038,3742853595,3577915638,679411651,2892444358,2354009459,1767581616,3150600392,3791627101,3102740896,284835224,4246832056,1258075500,768725851,2589189241,3069724005,3532540348,1274779536,3789419226,2764799539,1660621633,3471099624,4011903706,913787905,3497959166,737222580,2514213453,2928710040,3937242737,1804850592,3499020752,2949064160,2386320175,2390070455,2415321851,4061277028,2290661394,2416832540,1336762016,1754252060,3520065937,3014181293,791618072,3188594551,3933548030,2332172193,3852520463,3043980520,413987798,3465142937,3030929376,4245938359,2093235073,3534596313,375366246,2157278981,2479649556,555357303,3870105701,2008414854,3344188149,4221384143,3956125452,2067696032,3594591187,2921233993,2428461,544322398,577241275,1471733935,610547355,4027169054,1432588573,1507829418,2025931657,3646575487,545086370,48609733,2200306550,1653985193,298326376,1316178497,3007786442,2064951626,458293330,2589141269,3591329599,3164325604,727753846,2179363840,146436021,1461446943,4069977195,705550613,3059967265,3887724982,4281599278,3313849956,1404054877,2845806497,146425753,1854211946],[1266315497,3048417604,3681880366,3289982499,290971e4,1235738493,2632868024,2414719590,3970600049,1771706367,1449415276,3266420449,422970021,1963543593,2690192192,3826793022,1062508698,1531092325,1804592342,2583117782,2714934279,4024971509,1294809318,4028980673,1289560198,2221992742,1669523910,35572830,157838143,1052438473,1016535060,1802137761,1753167236,1386275462,3080475397,2857371447,1040679964,2145300060,2390574316,1461121720,2956646967,4031777805,4028374788,33600511,2920084762,1018524850,629373528,3691585981,3515945977,2091462646,2486323059,586499841,988145025,935516892,3367335476,2599673255,2839830854,265290510,3972581182,2759138881,3795373465,1005194799,847297441,406762289,1314163512,1332590856,1866599683,4127851711,750260880,613907577,1450815602,3165620655,3734664991,3650291728,3012275730,3704569646,1427272223,778793252,1343938022,2676280711,2052605720,1946737175,3164576444,3914038668,3967478842,3682934266,1661551462,3294938066,4011595847,840292616,3712170807,616741398,312560963,711312465,1351876610,322626781,1910503582,271666773,2175563734,1594956187,70604529,3617834859,1007753275,1495573769,4069517037,2549218298,2663038764,504708206,2263041392,3941167025,2249088522,1514023603,1998579484,1312622330,694541497,2582060303,2151582166,1382467621,776784248,2618340202,3323268794,2497899128,2784771155,503983604,4076293799,907881277,423175695,432175456,1378068232,4145222326,3954048622,3938656102,3820766613,2793130115,2977904593,26017576,3274890735,3194772133,1700274565,1756076034,4006520079,3677328699,720338349,1533947780,354530856,688349552,3973924725,1637815568,332179504,3949051286,53804574,2852348879,3044236432,1282449977,3583942155,3416972820,4006381244,1617046695,2628476075,3002303598,1686838959,431878346,2686675385,1700445008,1080580658,1009431731,832498133,3223435511,2605976345,2271191193,2516031870,1648197032,4164389018,2548247927,300782431,375919233,238389289,3353747414,2531188641,2019080857,1475708069,455242339,2609103871,448939670,3451063019,1395535956,2413381860,1841049896,1491858159,885456874,4264095073,4001119347,1565136089,3898914787,1108368660,540939232,1173283510,2745871338,3681308437,4207628240,3343053890,4016749493,1699691293,1103962373,3625875870,2256883143,3830138730,1031889488,3479347698,1535977030,4236805024,3251091107,2132092099,1774941330,1199868427,1452454533,157007616,2904115357,342012276,595725824,1480756522,206960106,497939518,591360097,863170706,2375253569,3596610801,1814182875,2094937945,3421402208,1082520231,3463918190,2785509508,435703966,3908032597,1641649973,2842273706,3305899714,1510255612,2148256476,2655287854,3276092548,4258621189,236887753,3681803219,274041037,1734335097,3815195456,3317970021,1899903192,1026095262,4050517792,356393447,2410691914,3873677099,3682840055],[3913112168,2491498743,4132185628,2489919796,1091903735,1979897079,3170134830,3567386728,3557303409,857797738,1136121015,1342202287,507115054,2535736646,337727348,3213592640,1301675037,2528481711,1895095763,1721773893,3216771564,62756741,2142006736,835421444,2531993523,1442658625,3659876326,2882144922,676362277,1392781812,170690266,3921047035,1759253602,3611846912,1745797284,664899054,1329594018,3901205900,3045908486,2062866102,2865634940,3543621612,3464012697,1080764994,553557557,3656615353,3996768171,991055499,499776247,1265440854,648242737,3940784050,980351604,3713745714,1749149687,3396870395,4211799374,3640570775,1161844396,3125318951,1431517754,545492359,4268468663,3499529547,1437099964,2702547544,3433638243,2581715763,2787789398,1060185593,1593081372,2418618748,4260947970,69676912,2159744348,86519011,2512459080,3838209314,1220612927,3339683548,133810670,1090789135,1078426020,1569222167,845107691,3583754449,4072456591,1091646820,628848692,1613405280,3757631651,526609435,236106946,48312990,2942717905,3402727701,1797494240,859738849,992217954,4005476642,2243076622,3870952857,3732016268,765654824,3490871365,2511836413,1685915746,3888969200,1414112111,2273134842,3281911079,4080962846,172450625,2569994100,980381355,4109958455,2819808352,2716589560,2568741196,3681446669,3329971472,1835478071,660984891,3704678404,4045999559,3422617507,3040415634,1762651403,1719377915,3470491036,2693910283,3642056355,3138596744,1364962596,2073328063,1983633131,926494387,3423689081,2150032023,4096667949,1749200295,3328846651,309677260,2016342300,1779581495,3079819751,111262694,1274766160,443224088,298511866,1025883608,3806446537,1145181785,168956806,3641502830,3584813610,1689216846,3666258015,3200248200,1692713982,2646376535,4042768518,1618508792,1610833997,3523052358,4130873264,2001055236,3610705100,2202168115,4028541809,2961195399,1006657119,2006996926,3186142756,1430667929,3210227297,1314452623,4074634658,4101304120,2273951170,1399257539,3367210612,3027628629,1190975929,2062231137,2333990788,2221543033,2438960610,1181637006,548689776,2362791313,3372408396,3104550113,3145860560,296247880,1970579870,3078560182,3769228297,1714227617,3291629107,3898220290,166772364,1251581989,493813264,448347421,195405023,2709975567,677966185,3703036547,1463355134,2715995803,1338867538,1343315457,2802222074,2684532164,233230375,2599980071,2000651841,3277868038,1638401717,4028070440,3237316320,6314154,819756386,300326615,590932579,1405279636,3267499572,3150704214,2428286686,3959192993,3461946742,1862657033,1266418056,963775037,2089974820,2263052895,1917689273,448879540,3550394620,3981727096,150775221,3627908307,1303187396,508620638,2975983352,2726630617,1817252668,1876281319,1457606340,908771278,3720792119,3617206836,2455994898,1729034894,1080033504],[976866871,3556439503,2881648439,1522871579,1555064734,1336096578,3548522304,2579274686,3574697629,3205460757,3593280638,3338716283,3079412587,564236357,2993598910,1781952180,1464380207,3163844217,3332601554,1699332808,1393555694,1183702653,3581086237,1288719814,691649499,2847557200,2895455976,3193889540,2717570544,1781354906,1676643554,2592534050,3230253752,1126444790,2770207658,2633158820,2210423226,2615765581,2414155088,3127139286,673620729,2805611233,1269405062,4015350505,3341807571,4149409754,1057255273,2012875353,2162469141,2276492801,2601117357,993977747,3918593370,2654263191,753973209,36408145,2530585658,25011837,3520020182,2088578344,530523599,2918365339,1524020338,1518925132,3760827505,3759777254,1202760957,3985898139,3906192525,674977740,4174734889,2031300136,2019492241,3983892565,4153806404,3822280332,352677332,2297720250,60907813,90501309,3286998549,1016092578,2535922412,2839152426,457141659,509813237,4120667899,652014361,1966332200,2975202805,55981186,2327461051,676427537,3255491064,2882294119,3433927263,1307055953,942726286,933058658,2468411793,3933900994,4215176142,1361170020,2001714738,2830558078,3274259782,1222529897,1679025792,2729314320,3714953764,1770335741,151462246,3013232138,1682292957,1483529935,471910574,1539241949,458788160,3436315007,1807016891,3718408830,978976581,1043663428,3165965781,1927990952,4200891579,2372276910,3208408903,3533431907,1412390302,2931980059,4132332400,1947078029,3881505623,4168226417,2941484381,1077988104,1320477388,886195818,18198404,3786409e3,2509781533,112762804,3463356488,1866414978,891333506,18488651,661792760,1628790961,3885187036,3141171499,876946877,2693282273,1372485963,791857591,2686433993,3759982718,3167212022,3472953795,2716379847,445679433,3561995674,3504004811,3574258232,54117162,3331405415,2381918588,3769707343,4154350007,1140177722,4074052095,668550556,3214352940,367459370,261225585,2610173221,4209349473,3468074219,3265815641,314222801,3066103646,3808782860,282218597,3406013506,3773591054,379116347,1285071038,846784868,2669647154,3771962079,3550491691,2305946142,453669953,1268987020,3317592352,3279303384,3744833421,2610507566,3859509063,266596637,3847019092,517658769,3462560207,3443424879,370717030,4247526661,2224018117,4143653529,4112773975,2788324899,2477274417,1456262402,2901442914,1517677493,1846949527,2295493580,3734397586,2176403920,1280348187,1908823572,3871786941,846861322,1172426758,3287448474,3383383037,1655181056,3139813346,901632758,1897031941,2986607138,3066810236,3447102507,1393639104,373351379,950779232,625454576,3124240540,4148612726,2007998917,544563296,2244738638,2330496472,2058025392,1291430526,424198748,50039436,29584100,3605783033,2429876329,2791104160,1057563949,3255363231,3075367218,3463963227,1469046755,985887462]];var H2={pbox:[],sbox:[]};function C2(t,e){var r=t.sbox[0][e>>24&255]+t.sbox[1][e>>16&255];return r=(r^=t.sbox[2][e>>8&255])+t.sbox[3][255&e]}function R2(e,t,r){let i=t,o=r,n;for(let t=0;t<F;++t)i^=e.pbox[t],o=C2(e,i)^o,n=i,i=o,o=n;return n=i,i=o,o=n,o^=e.pbox[F],{left:i^=e.pbox[F+1],right:o}}p=p.Blowfish=w.extend({_doReset:function(){if(this._keyPriorReset!==this._key){var t=this._keyPriorReset=this._key,n=t.words,t=t.sigBytes/4;{var s=H2,c=n,a=t;for(let e=0;e<4;e++){s.sbox[e]=[];for(let t=0;t<256;t++)s.sbox[e][t]=E2[e][t]}let e=0;for(let t=0;t<F+2;t++)s.pbox[t]=D2[t]^c[e],++e>=a&&(e=0);let r=0,i=0,o=0;for(let t=0;t<F+2;t+=2)o=R2(s,r,i),r=o.left,i=o.right,s.pbox[t]=r,s.pbox[t+1]=i;for(let e=0;e<4;e++)for(let t=0;t<256;t+=2)o=R2(s,r,i),r=o.left,i=o.right,s.sbox[e][t]=r,s.sbox[e][t+1]=i}}},encryptBlock:function(t,e){var r=R2(H2,t[e],t[e+1]);t[e]=r.left,t[e+1]=r.right},decryptBlock:function(t,e){var r=function(e,t,r){let i=t,o=r,n;for(let t=F+1;1<t;--t)i^=e.pbox[t],o=C2(e,i)^o,n=i,i=o,o=n;return n=i,i=o,o=n,o^=e.pbox[1],{left:i^=e.pbox[0],right:o}}(H2,t[e],t[e+1]);t[e]=r.left,t[e+1]=r.right},blockSize:2,keySize:4,ivSize:2}),P.Blowfish=w._createHelper(p)}return i});

/*! JSEncrypt v2.3.1 | https://npmcdn.com/jsencrypt@2.3.1/LICENSE.txt */
!function(t,e){"function"==typeof define&&define.amd?define(["exports"],e):e("object"==typeof exports&&"string"!=typeof exports.nodeName?module.exports:t)}(this,function(t){function e(t,e,i){null!=t&&("number"==typeof t?this.fromNumber(t,e,i):null==e&&"string"!=typeof t?this.fromString(t,256):this.fromString(t,e))}function i(){return new e(null)}function r(t,e,i,r,s,n){for(;--n>=0;){var o=e*this[t++]+i[r]+s;s=Math.floor(o/67108864),i[r++]=67108863&o}return s}function s(t,e,i,r,s,n){for(var o=32767&e,h=e>>15;--n>=0;){var a=32767&this[t],u=this[t++]>>15,c=h*a+u*o;a=o*a+((32767&c)<<15)+i[r]+(1073741823&s),s=(a>>>30)+(c>>>15)+h*u+(s>>>30),i[r++]=1073741823&a}return s}function n(t,e,i,r,s,n){for(var o=16383&e,h=e>>14;--n>=0;){var a=16383&this[t],u=this[t++]>>14,c=h*a+u*o;a=o*a+((16383&c)<<14)+i[r]+s,s=(a>>28)+(c>>14)+h*u,i[r++]=268435455&a}return s}function o(t){return Be.charAt(t)}function h(t,e){var i=Ke[t.charCodeAt(e)];return null==i?-1:i}function a(t){for(var e=this.t-1;e>=0;--e)t[e]=this[e];t.t=this.t,t.s=this.s}function u(t){this.t=1,this.s=0>t?-1:0,t>0?this[0]=t:-1>t?this[0]=t+this.DV:this.t=0}function c(t){var e=i();return e.fromInt(t),e}function f(t,i){var r;if(16==i)r=4;else if(8==i)r=3;else if(256==i)r=8;else if(2==i)r=1;else if(32==i)r=5;else{if(4!=i)return void this.fromRadix(t,i);r=2}this.t=0,this.s=0;for(var s=t.length,n=!1,o=0;--s>=0;){var a=8==r?255&t[s]:h(t,s);0>a?"-"==t.charAt(s)&&(n=!0):(n=!1,0==o?this[this.t++]=a:o+r>this.DB?(this[this.t-1]|=(a&(1<<this.DB-o)-1)<<o,this[this.t++]=a>>this.DB-o):this[this.t-1]|=a<<o,o+=r,o>=this.DB&&(o-=this.DB))}8==r&&0!=(128&t[0])&&(this.s=-1,o>0&&(this[this.t-1]|=(1<<this.DB-o)-1<<o)),this.clamp(),n&&e.ZERO.subTo(this,this)}function p(){for(var t=this.s&this.DM;this.t>0&&this[this.t-1]==t;)--this.t}function l(t){if(this.s<0)return"-"+this.negate().toString(t);var e;if(16==t)e=4;else if(8==t)e=3;else if(2==t)e=1;else if(32==t)e=5;else{if(4!=t)return this.toRadix(t);e=2}var i,r=(1<<e)-1,s=!1,n="",h=this.t,a=this.DB-h*this.DB%e;if(h-- >0)for(a<this.DB&&(i=this[h]>>a)>0&&(s=!0,n=o(i));h>=0;)e>a?(i=(this[h]&(1<<a)-1)<<e-a,i|=this[--h]>>(a+=this.DB-e)):(i=this[h]>>(a-=e)&r,0>=a&&(a+=this.DB,--h)),i>0&&(s=!0),s&&(n+=o(i));return s?n:"0"}function d(){var t=i();return e.ZERO.subTo(this,t),t}function g(){return this.s<0?this.negate():this}function m(t){var e=this.s-t.s;if(0!=e)return e;var i=this.t;if(e=i-t.t,0!=e)return this.s<0?-e:e;for(;--i>=0;)if(0!=(e=this[i]-t[i]))return e;return 0}function y(t){var e,i=1;return 0!=(e=t>>>16)&&(t=e,i+=16),0!=(e=t>>8)&&(t=e,i+=8),0!=(e=t>>4)&&(t=e,i+=4),0!=(e=t>>2)&&(t=e,i+=2),0!=(e=t>>1)&&(t=e,i+=1),i}function b(){return this.t<=0?0:this.DB*(this.t-1)+y(this[this.t-1]^this.s&this.DM)}function T(t,e){var i;for(i=this.t-1;i>=0;--i)e[i+t]=this[i];for(i=t-1;i>=0;--i)e[i]=0;e.t=this.t+t,e.s=this.s}function S(t,e){for(var i=t;i<this.t;++i)e[i-t]=this[i];e.t=Math.max(this.t-t,0),e.s=this.s}function R(t,e){var i,r=t%this.DB,s=this.DB-r,n=(1<<s)-1,o=Math.floor(t/this.DB),h=this.s<<r&this.DM;for(i=this.t-1;i>=0;--i)e[i+o+1]=this[i]>>s|h,h=(this[i]&n)<<r;for(i=o-1;i>=0;--i)e[i]=0;e[o]=h,e.t=this.t+o+1,e.s=this.s,e.clamp()}function E(t,e){e.s=this.s;var i=Math.floor(t/this.DB);if(i>=this.t)return void(e.t=0);var r=t%this.DB,s=this.DB-r,n=(1<<r)-1;e[0]=this[i]>>r;for(var o=i+1;o<this.t;++o)e[o-i-1]|=(this[o]&n)<<s,e[o-i]=this[o]>>r;r>0&&(e[this.t-i-1]|=(this.s&n)<<s),e.t=this.t-i,e.clamp()}function D(t,e){for(var i=0,r=0,s=Math.min(t.t,this.t);s>i;)r+=this[i]-t[i],e[i++]=r&this.DM,r>>=this.DB;if(t.t<this.t){for(r-=t.s;i<this.t;)r+=this[i],e[i++]=r&this.DM,r>>=this.DB;r+=this.s}else{for(r+=this.s;i<t.t;)r-=t[i],e[i++]=r&this.DM,r>>=this.DB;r-=t.s}e.s=0>r?-1:0,-1>r?e[i++]=this.DV+r:r>0&&(e[i++]=r),e.t=i,e.clamp()}function w(t,i){var r=this.abs(),s=t.abs(),n=r.t;for(i.t=n+s.t;--n>=0;)i[n]=0;for(n=0;n<s.t;++n)i[n+r.t]=r.am(0,s[n],i,n,0,r.t);i.s=0,i.clamp(),this.s!=t.s&&e.ZERO.subTo(i,i)}function x(t){for(var e=this.abs(),i=t.t=2*e.t;--i>=0;)t[i]=0;for(i=0;i<e.t-1;++i){var r=e.am(i,e[i],t,2*i,0,1);(t[i+e.t]+=e.am(i+1,2*e[i],t,2*i+1,r,e.t-i-1))>=e.DV&&(t[i+e.t]-=e.DV,t[i+e.t+1]=1)}t.t>0&&(t[t.t-1]+=e.am(i,e[i],t,2*i,0,1)),t.s=0,t.clamp()}function B(t,r,s){var n=t.abs();if(!(n.t<=0)){var o=this.abs();if(o.t<n.t)return null!=r&&r.fromInt(0),void(null!=s&&this.copyTo(s));null==s&&(s=i());var h=i(),a=this.s,u=t.s,c=this.DB-y(n[n.t-1]);c>0?(n.lShiftTo(c,h),o.lShiftTo(c,s)):(n.copyTo(h),o.copyTo(s));var f=h.t,p=h[f-1];if(0!=p){var l=p*(1<<this.F1)+(f>1?h[f-2]>>this.F2:0),d=this.FV/l,g=(1<<this.F1)/l,m=1<<this.F2,v=s.t,b=v-f,T=null==r?i():r;for(h.dlShiftTo(b,T),s.compareTo(T)>=0&&(s[s.t++]=1,s.subTo(T,s)),e.ONE.dlShiftTo(f,T),T.subTo(h,h);h.t<f;)h[h.t++]=0;for(;--b>=0;){var S=s[--v]==p?this.DM:Math.floor(s[v]*d+(s[v-1]+m)*g);if((s[v]+=h.am(0,S,s,b,0,f))<S)for(h.dlShiftTo(b,T),s.subTo(T,s);s[v]<--S;)s.subTo(T,s)}null!=r&&(s.drShiftTo(f,r),a!=u&&e.ZERO.subTo(r,r)),s.t=f,s.clamp(),c>0&&s.rShiftTo(c,s),0>a&&e.ZERO.subTo(s,s)}}}function K(t){var r=i();return this.abs().divRemTo(t,null,r),this.s<0&&r.compareTo(e.ZERO)>0&&t.subTo(r,r),r}function A(t){this.m=t}function U(t){return t.s<0||t.compareTo(this.m)>=0?t.mod(this.m):t}function O(t){return t}function V(t){t.divRemTo(this.m,null,t)}function N(t,e,i){t.multiplyTo(e,i),this.reduce(i)}function J(t,e){t.squareTo(e),this.reduce(e)}function I(){if(this.t<1)return 0;var t=this[0];if(0==(1&t))return 0;var e=3&t;return e=e*(2-(15&t)*e)&15,e=e*(2-(255&t)*e)&255,e=e*(2-((65535&t)*e&65535))&65535,e=e*(2-t*e%this.DV)%this.DV,e>0?this.DV-e:-e}function P(t){this.m=t,this.mp=t.invDigit(),this.mpl=32767&this.mp,this.mph=this.mp>>15,this.um=(1<<t.DB-15)-1,this.mt2=2*t.t}function M(t){var r=i();return t.abs().dlShiftTo(this.m.t,r),r.divRemTo(this.m,null,r),t.s<0&&r.compareTo(e.ZERO)>0&&this.m.subTo(r,r),r}function L(t){var e=i();return t.copyTo(e),this.reduce(e),e}function q(t){for(;t.t<=this.mt2;)t[t.t++]=0;for(var e=0;e<this.m.t;++e){var i=32767&t[e],r=i*this.mpl+((i*this.mph+(t[e]>>15)*this.mpl&this.um)<<15)&t.DM;for(i=e+this.m.t,t[i]+=this.m.am(0,r,t,e,0,this.m.t);t[i]>=t.DV;)t[i]-=t.DV,t[++i]++}t.clamp(),t.drShiftTo(this.m.t,t),t.compareTo(this.m)>=0&&t.subTo(this.m,t)}function C(t,e){t.squareTo(e),this.reduce(e)}function H(t,e,i){t.multiplyTo(e,i),this.reduce(i)}function j(){return 0==(this.t>0?1&this[0]:this.s)}function k(t,r){if(t>4294967295||1>t)return e.ONE;var s=i(),n=i(),o=r.convert(this),h=y(t)-1;for(o.copyTo(s);--h>=0;)if(r.sqrTo(s,n),(t&1<<h)>0)r.mulTo(n,o,s);else{var a=s;s=n,n=a}return r.revert(s)}function F(t,e){var i;return i=256>t||e.isEven()?new A(e):new P(e),this.exp(t,i)}
// Copyright (c) 2005-2009  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.
    function _(){var t=i();return this.copyTo(t),t}function z(){if(this.s<0){if(1==this.t)return this[0]-this.DV;if(0==this.t)return-1}else{if(1==this.t)return this[0];if(0==this.t)return 0}return(this[1]&(1<<32-this.DB)-1)<<this.DB|this[0]}function Z(){return 0==this.t?this.s:this[0]<<24>>24}function G(){return 0==this.t?this.s:this[0]<<16>>16}function $(t){return Math.floor(Math.LN2*this.DB/Math.log(t))}function Y(){return this.s<0?-1:this.t<=0||1==this.t&&this[0]<=0?0:1}function W(t){if(null==t&&(t=10),0==this.signum()||2>t||t>36)return"0";var e=this.chunkSize(t),r=Math.pow(t,e),s=c(r),n=i(),o=i(),h="";for(this.divRemTo(s,n,o);n.signum()>0;)h=(r+o.intValue()).toString(t).substr(1)+h,n.divRemTo(s,n,o);return o.intValue().toString(t)+h}function Q(t,i){this.fromInt(0),null==i&&(i=10);for(var r=this.chunkSize(i),s=Math.pow(i,r),n=!1,o=0,a=0,u=0;u<t.length;++u){var c=h(t,u);0>c?"-"==t.charAt(u)&&0==this.signum()&&(n=!0):(a=i*a+c,++o>=r&&(this.dMultiply(s),this.dAddOffset(a,0),o=0,a=0))}o>0&&(this.dMultiply(Math.pow(i,o)),this.dAddOffset(a,0)),n&&e.ZERO.subTo(this,this)}function X(t,i,r){if("number"==typeof i)if(2>t)this.fromInt(1);else for(this.fromNumber(t,r),this.testBit(t-1)||this.bitwiseTo(e.ONE.shiftLeft(t-1),ht,this),this.isEven()&&this.dAddOffset(1,0);!this.isProbablePrime(i);)this.dAddOffset(2,0),this.bitLength()>t&&this.subTo(e.ONE.shiftLeft(t-1),this);else{var s=new Array,n=7&t;s.length=(t>>3)+1,i.nextBytes(s),n>0?s[0]&=(1<<n)-1:s[0]=0,this.fromString(s,256)}}function tt(){var t=this.t,e=new Array;e[0]=this.s;var i,r=this.DB-t*this.DB%8,s=0;if(t-- >0)for(r<this.DB&&(i=this[t]>>r)!=(this.s&this.DM)>>r&&(e[s++]=i|this.s<<this.DB-r);t>=0;)8>r?(i=(this[t]&(1<<r)-1)<<8-r,i|=this[--t]>>(r+=this.DB-8)):(i=this[t]>>(r-=8)&255,0>=r&&(r+=this.DB,--t)),0!=(128&i)&&(i|=-256),0==s&&(128&this.s)!=(128&i)&&++s,(s>0||i!=this.s)&&(e[s++]=i);return e}function et(t){return 0==this.compareTo(t)}function it(t){return this.compareTo(t)<0?this:t}function rt(t){return this.compareTo(t)>0?this:t}function st(t,e,i){var r,s,n=Math.min(t.t,this.t);for(r=0;n>r;++r)i[r]=e(this[r],t[r]);if(t.t<this.t){for(s=t.s&this.DM,r=n;r<this.t;++r)i[r]=e(this[r],s);i.t=this.t}else{for(s=this.s&this.DM,r=n;r<t.t;++r)i[r]=e(s,t[r]);i.t=t.t}i.s=e(this.s,t.s),i.clamp()}function nt(t,e){return t&e}function ot(t){var e=i();return this.bitwiseTo(t,nt,e),e}function ht(t,e){return t|e}function at(t){var e=i();return this.bitwiseTo(t,ht,e),e}function ut(t,e){return t^e}function ct(t){var e=i();return this.bitwiseTo(t,ut,e),e}function ft(t,e){return t&~e}function pt(t){var e=i();return this.bitwiseTo(t,ft,e),e}function lt(){for(var t=i(),e=0;e<this.t;++e)t[e]=this.DM&~this[e];return t.t=this.t,t.s=~this.s,t}function dt(t){var e=i();return 0>t?this.rShiftTo(-t,e):this.lShiftTo(t,e),e}function gt(t){var e=i();return 0>t?this.lShiftTo(-t,e):this.rShiftTo(t,e),e}function mt(t){if(0==t)return-1;var e=0;return 0==(65535&t)&&(t>>=16,e+=16),0==(255&t)&&(t>>=8,e+=8),0==(15&t)&&(t>>=4,e+=4),0==(3&t)&&(t>>=2,e+=2),0==(1&t)&&++e,e}function yt(){for(var t=0;t<this.t;++t)if(0!=this[t])return t*this.DB+mt(this[t]);return this.s<0?this.t*this.DB:-1}function vt(t){for(var e=0;0!=t;)t&=t-1,++e;return e}function bt(){for(var t=0,e=this.s&this.DM,i=0;i<this.t;++i)t+=vt(this[i]^e);return t}function Tt(t){var e=Math.floor(t/this.DB);return e>=this.t?0!=this.s:0!=(this[e]&1<<t%this.DB)}function St(t,i){var r=e.ONE.shiftLeft(t);return this.bitwiseTo(r,i,r),r}function Rt(t){return this.changeBit(t,ht)}function Et(t){return this.changeBit(t,ft)}function Dt(t){return this.changeBit(t,ut)}function wt(t,e){for(var i=0,r=0,s=Math.min(t.t,this.t);s>i;)r+=this[i]+t[i],e[i++]=r&this.DM,r>>=this.DB;if(t.t<this.t){for(r+=t.s;i<this.t;)r+=this[i],e[i++]=r&this.DM,r>>=this.DB;r+=this.s}else{for(r+=this.s;i<t.t;)r+=t[i],e[i++]=r&this.DM,r>>=this.DB;r+=t.s}e.s=0>r?-1:0,r>0?e[i++]=r:-1>r&&(e[i++]=this.DV+r),e.t=i,e.clamp()}function xt(t){var e=i();return this.addTo(t,e),e}function Bt(t){var e=i();return this.subTo(t,e),e}function Kt(t){var e=i();return this.multiplyTo(t,e),e}function At(){var t=i();return this.squareTo(t),t}function Ut(t){var e=i();return this.divRemTo(t,e,null),e}function Ot(t){var e=i();return this.divRemTo(t,null,e),e}function Vt(t){var e=i(),r=i();return this.divRemTo(t,e,r),new Array(e,r)}function Nt(t){this[this.t]=this.am(0,t-1,this,0,0,this.t),++this.t,this.clamp()}function Jt(t,e){if(0!=t){for(;this.t<=e;)this[this.t++]=0;for(this[e]+=t;this[e]>=this.DV;)this[e]-=this.DV,++e>=this.t&&(this[this.t++]=0),++this[e]}}function It(){}function Pt(t){return t}function Mt(t,e,i){t.multiplyTo(e,i)}function Lt(t,e){t.squareTo(e)}function qt(t){return this.exp(t,new It)}function Ct(t,e,i){var r=Math.min(this.t+t.t,e);for(i.s=0,i.t=r;r>0;)i[--r]=0;var s;for(s=i.t-this.t;s>r;++r)i[r+this.t]=this.am(0,t[r],i,r,0,this.t);for(s=Math.min(t.t,e);s>r;++r)this.am(0,t[r],i,r,0,e-r);i.clamp()}function Ht(t,e,i){--e;var r=i.t=this.t+t.t-e;for(i.s=0;--r>=0;)i[r]=0;for(r=Math.max(e-this.t,0);r<t.t;++r)i[this.t+r-e]=this.am(e-r,t[r],i,0,0,this.t+r-e);i.clamp(),i.drShiftTo(1,i)}function jt(t){this.r2=i(),this.q3=i(),e.ONE.dlShiftTo(2*t.t,this.r2),this.mu=this.r2.divide(t),this.m=t}function kt(t){if(t.s<0||t.t>2*this.m.t)return t.mod(this.m);if(t.compareTo(this.m)<0)return t;var e=i();return t.copyTo(e),this.reduce(e),e}function Ft(t){return t}function _t(t){for(t.drShiftTo(this.m.t-1,this.r2),t.t>this.m.t+1&&(t.t=this.m.t+1,t.clamp()),this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3),this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);t.compareTo(this.r2)<0;)t.dAddOffset(1,this.m.t+1);for(t.subTo(this.r2,t);t.compareTo(this.m)>=0;)t.subTo(this.m,t)}function zt(t,e){t.squareTo(e),this.reduce(e)}function Zt(t,e,i){t.multiplyTo(e,i),this.reduce(i)}function Gt(t,e){var r,s,n=t.bitLength(),o=c(1);if(0>=n)return o;r=18>n?1:48>n?3:144>n?4:768>n?5:6,s=8>n?new A(e):e.isEven()?new jt(e):new P(e);var h=new Array,a=3,u=r-1,f=(1<<r)-1;if(h[1]=s.convert(this),r>1){var p=i();for(s.sqrTo(h[1],p);f>=a;)h[a]=i(),s.mulTo(p,h[a-2],h[a]),a+=2}var l,d,g=t.t-1,m=!0,v=i();for(n=y(t[g])-1;g>=0;){for(n>=u?l=t[g]>>n-u&f:(l=(t[g]&(1<<n+1)-1)<<u-n,g>0&&(l|=t[g-1]>>this.DB+n-u)),a=r;0==(1&l);)l>>=1,--a;if((n-=a)<0&&(n+=this.DB,--g),m)h[l].copyTo(o),m=!1;else{for(;a>1;)s.sqrTo(o,v),s.sqrTo(v,o),a-=2;a>0?s.sqrTo(o,v):(d=o,o=v,v=d),s.mulTo(v,h[l],o)}for(;g>=0&&0==(t[g]&1<<n);)s.sqrTo(o,v),d=o,o=v,v=d,--n<0&&(n=this.DB-1,--g)}return s.revert(o)}function $t(t){var e=this.s<0?this.negate():this.clone(),i=t.s<0?t.negate():t.clone();if(e.compareTo(i)<0){var r=e;e=i,i=r}var s=e.getLowestSetBit(),n=i.getLowestSetBit();if(0>n)return e;for(n>s&&(n=s),n>0&&(e.rShiftTo(n,e),i.rShiftTo(n,i));e.signum()>0;)(s=e.getLowestSetBit())>0&&e.rShiftTo(s,e),(s=i.getLowestSetBit())>0&&i.rShiftTo(s,i),e.compareTo(i)>=0?(e.subTo(i,e),e.rShiftTo(1,e)):(i.subTo(e,i),i.rShiftTo(1,i));return n>0&&i.lShiftTo(n,i),i}function Yt(t){if(0>=t)return 0;var e=this.DV%t,i=this.s<0?t-1:0;if(this.t>0)if(0==e)i=this[0]%t;else for(var r=this.t-1;r>=0;--r)i=(e*i+this[r])%t;return i}function Wt(t){var i=t.isEven();if(this.isEven()&&i||0==t.signum())return e.ZERO;for(var r=t.clone(),s=this.clone(),n=c(1),o=c(0),h=c(0),a=c(1);0!=r.signum();){for(;r.isEven();)r.rShiftTo(1,r),i?(n.isEven()&&o.isEven()||(n.addTo(this,n),o.subTo(t,o)),n.rShiftTo(1,n)):o.isEven()||o.subTo(t,o),o.rShiftTo(1,o);for(;s.isEven();)s.rShiftTo(1,s),i?(h.isEven()&&a.isEven()||(h.addTo(this,h),a.subTo(t,a)),h.rShiftTo(1,h)):a.isEven()||a.subTo(t,a),a.rShiftTo(1,a);r.compareTo(s)>=0?(r.subTo(s,r),i&&n.subTo(h,n),o.subTo(a,o)):(s.subTo(r,s),i&&h.subTo(n,h),a.subTo(o,a))}return 0!=s.compareTo(e.ONE)?e.ZERO:a.compareTo(t)>=0?a.subtract(t):a.signum()<0?(a.addTo(t,a),a.signum()<0?a.add(t):a):a}function Qt(t){var e,i=this.abs();if(1==i.t&&i[0]<=Ae[Ae.length-1]){for(e=0;e<Ae.length;++e)if(i[0]==Ae[e])return!0;return!1}if(i.isEven())return!1;for(e=1;e<Ae.length;){for(var r=Ae[e],s=e+1;s<Ae.length&&Ue>r;)r*=Ae[s++];for(r=i.modInt(r);s>e;)if(r%Ae[e++]==0)return!1}return i.millerRabin(t)}function Xt(t){var r=this.subtract(e.ONE),s=r.getLowestSetBit();if(0>=s)return!1;var n=r.shiftRight(s);t=t+1>>1,t>Ae.length&&(t=Ae.length);for(var o=i(),h=0;t>h;++h){o.fromInt(Ae[Math.floor(Math.random()*Ae.length)]);var a=o.modPow(n,this);if(0!=a.compareTo(e.ONE)&&0!=a.compareTo(r)){for(var u=1;u++<s&&0!=a.compareTo(r);)if(a=a.modPowInt(2,this),0==a.compareTo(e.ONE))return!1;if(0!=a.compareTo(r))return!1}}return!0}function te(){this.i=0,this.j=0,this.S=new Array}function ee(t){var e,i,r;for(e=0;256>e;++e)this.S[e]=e;for(i=0,e=0;256>e;++e)i=i+this.S[e]+t[e%t.length]&255,r=this.S[e],this.S[e]=this.S[i],this.S[i]=r;this.i=0,this.j=0}function ie(){var t;return this.i=this.i+1&255,this.j=this.j+this.S[this.i]&255,t=this.S[this.i],this.S[this.i]=this.S[this.j],this.S[this.j]=t,this.S[t+this.S[this.i]&255]}function re(){return new te}function se(){if(null==Oe){for(Oe=re();Je>Ne;){var t=Math.floor(65536*Math.random());Ve[Ne++]=255&t}for(Oe.init(Ve),Ne=0;Ne<Ve.length;++Ne)Ve[Ne]=0;Ne=0}return Oe.next()}function ne(t){var e;for(e=0;e<t.length;++e)t[e]=se()}function oe(){}function he(t,i){return new e(t,i)}function ae(t,i){if(i<t.length+11)return console.error("Message too long for RSA"),null;for(var r=new Array,s=t.length-1;s>=0&&i>0;){var n=t.charCodeAt(s--);128>n?r[--i]=n:n>127&&2048>n?(r[--i]=63&n|128,r[--i]=n>>6|192):(r[--i]=63&n|128,r[--i]=n>>6&63|128,r[--i]=n>>12|224)}r[--i]=0;for(var o=new oe,h=new Array;i>2;){for(h[0]=0;0==h[0];)o.nextBytes(h);r[--i]=h[0]}return r[--i]=2,r[--i]=0,new e(r)}function ue(){this.n=null,this.e=0,this.d=null,this.p=null,this.q=null,this.dmp1=null,this.dmq1=null,this.coeff=null}function ce(t,e){null!=t&&null!=e&&t.length>0&&e.length>0?(this.n=he(t,16),this.e=parseInt(e,16)):console.error("Invalid RSA public key")}function fe(t){return t.modPowInt(this.e,this.n)}function pe(t){var e=ae(t,this.n.bitLength()+7>>3);if(null==e)return null;var i=this.doPublic(e);if(null==i)return null;var r=i.toString(16);return 0==(1&r.length)?r:"0"+r}function le(t,e){for(var i=t.toByteArray(),r=0;r<i.length&&0==i[r];)++r;if(i.length-r!=e-1||2!=i[r])return null;for(++r;0!=i[r];)if(++r>=i.length)return null;for(var s="";++r<i.length;){var n=255&i[r];128>n?s+=String.fromCharCode(n):n>191&&224>n?(s+=String.fromCharCode((31&n)<<6|63&i[r+1]),++r):(s+=String.fromCharCode((15&n)<<12|(63&i[r+1])<<6|63&i[r+2]),r+=2)}return s}function de(t,e,i){null!=t&&null!=e&&t.length>0&&e.length>0?(this.n=he(t,16),this.e=parseInt(e,16),this.d=he(i,16)):console.error("Invalid RSA private key")}function ge(t,e,i,r,s,n,o,h){null!=t&&null!=e&&t.length>0&&e.length>0?(this.n=he(t,16),this.e=parseInt(e,16),this.d=he(i,16),this.p=he(r,16),this.q=he(s,16),this.dmp1=he(n,16),this.dmq1=he(o,16),this.coeff=he(h,16)):console.error("Invalid RSA private key")}function me(t,i){var r=new oe,s=t>>1;this.e=parseInt(i,16);for(var n=new e(i,16);;){for(;this.p=new e(t-s,1,r),0!=this.p.subtract(e.ONE).gcd(n).compareTo(e.ONE)||!this.p.isProbablePrime(10););for(;this.q=new e(s,1,r),0!=this.q.subtract(e.ONE).gcd(n).compareTo(e.ONE)||!this.q.isProbablePrime(10););if(this.p.compareTo(this.q)<=0){var o=this.p;this.p=this.q,this.q=o}var h=this.p.subtract(e.ONE),a=this.q.subtract(e.ONE),u=h.multiply(a);if(0==u.gcd(n).compareTo(e.ONE)){this.n=this.p.multiply(this.q),this.d=n.modInverse(u),this.dmp1=this.d.mod(h),this.dmq1=this.d.mod(a),this.coeff=this.q.modInverse(this.p);break}}}function ye(t){if(null==this.p||null==this.q)return t.modPow(this.d,this.n);for(var e=t.mod(this.p).modPow(this.dmp1,this.p),i=t.mod(this.q).modPow(this.dmq1,this.q);e.compareTo(i)<0;)e=e.add(this.p);return e.subtract(i).multiply(this.coeff).mod(this.p).multiply(this.q).add(i)}function ve(t){var e=he(t,16),i=this.doPrivate(e);return null==i?null:le(i,this.n.bitLength()+7>>3)}function be(t){var e,i,r="";for(e=0;e+3<=t.length;e+=3)i=parseInt(t.substring(e,e+3),16),r+=Le.charAt(i>>6)+Le.charAt(63&i);for(e+1==t.length?(i=parseInt(t.substring(e,e+1),16),r+=Le.charAt(i<<2)):e+2==t.length&&(i=parseInt(t.substring(e,e+2),16),r+=Le.charAt(i>>2)+Le.charAt((3&i)<<4));(3&r.length)>0;)r+=qe;return r}function Te(t){var e,i,r="",s=0;for(e=0;e<t.length&&t.charAt(e)!=qe;++e)v=Le.indexOf(t.charAt(e)),v<0||(0==s?(r+=o(v>>2),i=3&v,s=1):1==s?(r+=o(i<<2|v>>4),i=15&v,s=2):2==s?(r+=o(i),r+=o(v>>2),i=3&v,s=3):(r+=o(i<<2|v>>4),r+=o(15&v),s=0));return 1==s&&(r+=o(i<<2)),r}
// Copyright (c) 2005  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.
    var Se,Re=0xdeadbeefcafe,Ee=15715070==(16777215&Re);Ee&&"Microsoft Internet Explorer"==navigator.appName?(e.prototype.am=s,Se=30):Ee&&"Netscape"!=navigator.appName?(e.prototype.am=r,Se=26):(e.prototype.am=n,Se=28),e.prototype.DB=Se,e.prototype.DM=(1<<Se)-1,e.prototype.DV=1<<Se;var De=52;e.prototype.FV=Math.pow(2,De),e.prototype.F1=De-Se,e.prototype.F2=2*Se-De;var we,xe,Be="0123456789abcdefghijklmnopqrstuvwxyz",Ke=new Array;for(we="0".charCodeAt(0),xe=0;9>=xe;++xe)Ke[we++]=xe;for(we="a".charCodeAt(0),xe=10;36>xe;++xe)Ke[we++]=xe;for(we="A".charCodeAt(0),xe=10;36>xe;++xe)Ke[we++]=xe;A.prototype.convert=U,A.prototype.revert=O,A.prototype.reduce=V,A.prototype.mulTo=N,A.prototype.sqrTo=J,P.prototype.convert=M,P.prototype.revert=L,P.prototype.reduce=q,P.prototype.mulTo=H,P.prototype.sqrTo=C,e.prototype.copyTo=a,e.prototype.fromInt=u,e.prototype.fromString=f,e.prototype.clamp=p,e.prototype.dlShiftTo=T,e.prototype.drShiftTo=S,e.prototype.lShiftTo=R,e.prototype.rShiftTo=E,e.prototype.subTo=D,e.prototype.multiplyTo=w,e.prototype.squareTo=x,e.prototype.divRemTo=B,e.prototype.invDigit=I,e.prototype.isEven=j,e.prototype.exp=k,e.prototype.toString=l,e.prototype.negate=d,e.prototype.abs=g,e.prototype.compareTo=m,e.prototype.bitLength=b,e.prototype.mod=K,e.prototype.modPowInt=F,e.ZERO=c(0),e.ONE=c(1),It.prototype.convert=Pt,It.prototype.revert=Pt,It.prototype.mulTo=Mt,It.prototype.sqrTo=Lt,jt.prototype.convert=kt,jt.prototype.revert=Ft,jt.prototype.reduce=_t,jt.prototype.mulTo=Zt,jt.prototype.sqrTo=zt;var Ae=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997],Ue=(1<<26)/Ae[Ae.length-1];e.prototype.chunkSize=$,e.prototype.toRadix=W,e.prototype.fromRadix=Q,e.prototype.fromNumber=X,e.prototype.bitwiseTo=st,e.prototype.changeBit=St,e.prototype.addTo=wt,e.prototype.dMultiply=Nt,e.prototype.dAddOffset=Jt,e.prototype.multiplyLowerTo=Ct,e.prototype.multiplyUpperTo=Ht,e.prototype.modInt=Yt,e.prototype.millerRabin=Xt,e.prototype.clone=_,e.prototype.intValue=z,e.prototype.byteValue=Z,e.prototype.shortValue=G,e.prototype.signum=Y,e.prototype.toByteArray=tt,e.prototype.equals=et,e.prototype.min=it,e.prototype.max=rt,e.prototype.and=ot,e.prototype.or=at,e.prototype.xor=ct,e.prototype.andNot=pt,e.prototype.not=lt,e.prototype.shiftLeft=dt,e.prototype.shiftRight=gt,e.prototype.getLowestSetBit=yt,e.prototype.bitCount=bt,e.prototype.testBit=Tt,e.prototype.setBit=Rt,e.prototype.clearBit=Et,e.prototype.flipBit=Dt,e.prototype.add=xt,e.prototype.subtract=Bt,e.prototype.multiply=Kt,e.prototype.divide=Ut,e.prototype.remainder=Ot,e.prototype.divideAndRemainder=Vt,e.prototype.modPow=Gt,e.prototype.modInverse=Wt,e.prototype.pow=qt,e.prototype.gcd=$t,e.prototype.isProbablePrime=Qt,e.prototype.square=At,te.prototype.init=ee,te.prototype.next=ie;var Oe,Ve,Ne,Je=256;if(null==Ve){Ve=new Array,Ne=0;var Ie;if(window.crypto&&window.crypto.getRandomValues){var Pe=new Uint32Array(256);for(window.crypto.getRandomValues(Pe),Ie=0;Ie<Pe.length;++Ie)Ve[Ne++]=255&Pe[Ie]}var Me=function(t){if(this.count=this.count||0,this.count>=256||Ne>=Je)return void(window.removeEventListener?window.removeEventListener("mousemove",Me,!1):window.detachEvent&&window.detachEvent("onmousemove",Me));try{var e=t.x+t.y;Ve[Ne++]=255&e,this.count+=1}catch(i){}};window.addEventListener?window.addEventListener("mousemove",Me,!1):window.attachEvent&&window.attachEvent("onmousemove",Me)}oe.prototype.nextBytes=ne,ue.prototype.doPublic=fe,ue.prototype.setPublic=ce,ue.prototype.encrypt=pe,ue.prototype.doPrivate=ye,ue.prototype.setPrivate=de,ue.prototype.setPrivateEx=ge,ue.prototype.generate=me,ue.prototype.decrypt=ve,
// Copyright (c) 2011  Kevin M Burns Jr.
// All Rights Reserved.
// See "LICENSE" for details.
//
// Extension to jsbn which adds facilities for asynchronous RSA key generation
// Primarily created to avoid execution timeout on mobile devices
//
// http://www-cs-students.stanford.edu/~tjw/jsbn/
//
// ---
        function(){var t=function(t,r,s){var n=new oe,o=t>>1;this.e=parseInt(r,16);var h=new e(r,16),a=this,u=function(){var r=function(){if(a.p.compareTo(a.q)<=0){var t=a.p;a.p=a.q,a.q=t}var i=a.p.subtract(e.ONE),r=a.q.subtract(e.ONE),n=i.multiply(r);0==n.gcd(h).compareTo(e.ONE)?(a.n=a.p.multiply(a.q),a.d=h.modInverse(n),a.dmp1=a.d.mod(i),a.dmq1=a.d.mod(r),a.coeff=a.q.modInverse(a.p),setTimeout(function(){s()},0)):setTimeout(u,0)},c=function(){a.q=i(),a.q.fromNumberAsync(o,1,n,function(){a.q.subtract(e.ONE).gcda(h,function(t){0==t.compareTo(e.ONE)&&a.q.isProbablePrime(10)?setTimeout(r,0):setTimeout(c,0)})})},f=function(){a.p=i(),a.p.fromNumberAsync(t-o,1,n,function(){a.p.subtract(e.ONE).gcda(h,function(t){0==t.compareTo(e.ONE)&&a.p.isProbablePrime(10)?setTimeout(c,0):setTimeout(f,0)})})};setTimeout(f,0)};setTimeout(u,0)};ue.prototype.generateAsync=t;var r=function(t,e){var i=this.s<0?this.negate():this.clone(),r=t.s<0?t.negate():t.clone();if(i.compareTo(r)<0){var s=i;i=r,r=s}var n=i.getLowestSetBit(),o=r.getLowestSetBit();if(0>o)return void e(i);o>n&&(o=n),o>0&&(i.rShiftTo(o,i),r.rShiftTo(o,r));var h=function(){(n=i.getLowestSetBit())>0&&i.rShiftTo(n,i),(n=r.getLowestSetBit())>0&&r.rShiftTo(n,r),i.compareTo(r)>=0?(i.subTo(r,i),i.rShiftTo(1,i)):(r.subTo(i,r),r.rShiftTo(1,r)),i.signum()>0?setTimeout(h,0):(o>0&&r.lShiftTo(o,r),setTimeout(function(){e(r)},0))};setTimeout(h,10)};e.prototype.gcda=r;var s=function(t,i,r,s){if("number"==typeof i)if(2>t)this.fromInt(1);else{this.fromNumber(t,r),this.testBit(t-1)||this.bitwiseTo(e.ONE.shiftLeft(t-1),ht,this),this.isEven()&&this.dAddOffset(1,0);var n=this,o=function(){n.dAddOffset(2,0),n.bitLength()>t&&n.subTo(e.ONE.shiftLeft(t-1),n),n.isProbablePrime(i)?setTimeout(function(){s()},0):setTimeout(o,0)};setTimeout(o,0)}else{var h=new Array,a=7&t;h.length=(t>>3)+1,i.nextBytes(h),a>0?h[0]&=(1<<a)-1:h[0]=0,this.fromString(h,256)}};e.prototype.fromNumberAsync=s}();var Le="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",qe="=",Ce=Ce||{};Ce.env=Ce.env||{};var He=Ce,je=Object.prototype,ke="[object Function]",Fe=["toString","valueOf"];Ce.env.parseUA=function(t){var e,i=function(t){var e=0;return parseFloat(t.replace(/\./g,function(){return 1==e++?"":"."}))},r=navigator,s={ie:0,opera:0,gecko:0,webkit:0,chrome:0,mobile:null,air:0,ipad:0,iphone:0,ipod:0,ios:null,android:0,webos:0,caja:r&&r.cajaVersion,secure:!1,os:null},n=t||navigator&&navigator.userAgent,o=window&&window.location,h=o&&o.href;return s.secure=h&&0===h.toLowerCase().indexOf("https"),n&&(/windows|win32/i.test(n)?s.os="windows":/macintosh/i.test(n)?s.os="macintosh":/rhino/i.test(n)&&(s.os="rhino"),/KHTML/.test(n)&&(s.webkit=1),e=n.match(/AppleWebKit\/([^\s]*)/),e&&e[1]&&(s.webkit=i(e[1]),/ Mobile\//.test(n)?(s.mobile="Apple",e=n.match(/OS ([^\s]*)/),e&&e[1]&&(e=i(e[1].replace("_","."))),s.ios=e,s.ipad=s.ipod=s.iphone=0,e=n.match(/iPad|iPod|iPhone/),e&&e[0]&&(s[e[0].toLowerCase()]=s.ios)):(e=n.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/),e&&(s.mobile=e[0]),/webOS/.test(n)&&(s.mobile="WebOS",e=n.match(/webOS\/([^\s]*);/),e&&e[1]&&(s.webos=i(e[1]))),/ Android/.test(n)&&(s.mobile="Android",e=n.match(/Android ([^\s]*);/),e&&e[1]&&(s.android=i(e[1])))),e=n.match(/Chrome\/([^\s]*)/),e&&e[1]?s.chrome=i(e[1]):(e=n.match(/AdobeAIR\/([^\s]*)/),e&&(s.air=e[0]))),s.webkit||(e=n.match(/Opera[\s\/]([^\s]*)/),e&&e[1]?(s.opera=i(e[1]),e=n.match(/Version\/([^\s]*)/),e&&e[1]&&(s.opera=i(e[1])),e=n.match(/Opera Mini[^;]*/),e&&(s.mobile=e[0])):(e=n.match(/MSIE\s([^;]*)/),e&&e[1]?s.ie=i(e[1]):(e=n.match(/Gecko\/([^\s]*)/),e&&(s.gecko=1,e=n.match(/rv:([^\s\)]*)/),e&&e[1]&&(s.gecko=i(e[1]))))))),s},Ce.env.ua=Ce.env.parseUA(),Ce.isFunction=function(t){return"function"==typeof t||je.toString.apply(t)===ke},Ce._IEEnumFix=Ce.env.ua.ie?function(t,e){var i,r,s;for(i=0;i<Fe.length;i+=1)r=Fe[i],s=e[r],He.isFunction(s)&&s!=je[r]&&(t[r]=s)}:function(){},Ce.extend=function(t,e,i){if(!e||!t)throw new Error("extend failed, please check that all dependencies are included.");var r,s=function(){};if(s.prototype=e.prototype,t.prototype=new s,t.prototype.constructor=t,t.superclass=e.prototype,e.prototype.constructor==je.constructor&&(e.prototype.constructor=e),i){for(r in i)He.hasOwnProperty(i,r)&&(t.prototype[r]=i[r]);He._IEEnumFix(t.prototype,i)}},/*
 * asn1.js - ASN.1 DER encoder classes
 *
 * Copyright (c) 2013 Kenji Urushima (kenji.urushima@gmail.com)
 *
 * This software is licensed under the terms of the MIT License.
 * http://kjur.github.com/jsrsasign/license
 *
 * The above copyright and license notice shall be 
 * included in all copies or substantial portions of the Software.
 */
        /**
         * @fileOverview
         * @name asn1-1.0.js
         * @author Kenji Urushima kenji.urushima@gmail.com
         * @version 1.0.2 (2013-May-30)
         * @since 2.1
         * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
         */
    "undefined"!=typeof KJUR&&KJUR||(KJUR={}),"undefined"!=typeof KJUR.asn1&&KJUR.asn1||(KJUR.asn1={}),KJUR.asn1.ASN1Util=new function(){this.integerToByteHex=function(t){var e=t.toString(16);return e.length%2==1&&(e="0"+e),e},this.bigIntToMinTwosComplementsHex=function(t){var i=t.toString(16);if("-"!=i.substr(0,1))i.length%2==1?i="0"+i:i.match(/^[0-7]/)||(i="00"+i);else{var r=i.substr(1),s=r.length;s%2==1?s+=1:i.match(/^[0-7]/)||(s+=2);for(var n="",o=0;s>o;o++)n+="f";var h=new e(n,16),a=h.xor(t).add(e.ONE);i=a.toString(16).replace(/^-/,"")}return i},this.getPEMStringFromHex=function(t,e){var i=CryptoJS.enc.Hex.parse(t),r=CryptoJS.enc.Base64.stringify(i),s=r.replace(/(.{64})/g,"$1\r\n");return s=s.replace(/\r\n$/,""),"-----BEGIN "+e+"-----\r\n"+s+"\r\n-----END "+e+"-----\r\n"}},KJUR.asn1.ASN1Object=function(){var t="";this.getLengthHexFromValue=function(){if("undefined"==typeof this.hV||null==this.hV)throw"this.hV is null or undefined.";if(this.hV.length%2==1)throw"value hex must be even length: n="+t.length+",v="+this.hV;var e=this.hV.length/2,i=e.toString(16);if(i.length%2==1&&(i="0"+i),128>e)return i;var r=i.length/2;if(r>15)throw"ASN.1 length too long to represent by 8x: n = "+e.toString(16);var s=128+r;return s.toString(16)+i},this.getEncodedHex=function(){return(null==this.hTLV||this.isModified)&&(this.hV=this.getFreshValueHex(),this.hL=this.getLengthHexFromValue(),this.hTLV=this.hT+this.hL+this.hV,this.isModified=!1),this.hTLV},this.getValueHex=function(){return this.getEncodedHex(),this.hV},this.getFreshValueHex=function(){return""}},KJUR.asn1.DERAbstractString=function(t){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);this.getString=function(){return this.s},this.setString=function(t){this.hTLV=null,this.isModified=!0,this.s=t,this.hV=stohex(this.s)},this.setStringHex=function(t){this.hTLV=null,this.isModified=!0,this.s=null,this.hV=t},this.getFreshValueHex=function(){return this.hV},"undefined"!=typeof t&&("undefined"!=typeof t.str?this.setString(t.str):"undefined"!=typeof t.hex&&this.setStringHex(t.hex))},Ce.extend(KJUR.asn1.DERAbstractString,KJUR.asn1.ASN1Object),KJUR.asn1.DERAbstractTime=function(t){KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);this.localDateToUTC=function(t){utc=t.getTime()+6e4*t.getTimezoneOffset();var e=new Date(utc);return e},this.formatDate=function(t,e){var i=this.zeroPadding,r=this.localDateToUTC(t),s=String(r.getFullYear());"utc"==e&&(s=s.substr(2,2));var n=i(String(r.getMonth()+1),2),o=i(String(r.getDate()),2),h=i(String(r.getHours()),2),a=i(String(r.getMinutes()),2),u=i(String(r.getSeconds()),2);return s+n+o+h+a+u+"Z"},this.zeroPadding=function(t,e){return t.length>=e?t:new Array(e-t.length+1).join("0")+t},this.getString=function(){return this.s},this.setString=function(t){this.hTLV=null,this.isModified=!0,this.s=t,this.hV=stohex(this.s)},this.setByDateValue=function(t,e,i,r,s,n){var o=new Date(Date.UTC(t,e-1,i,r,s,n,0));this.setByDate(o)},this.getFreshValueHex=function(){return this.hV}},Ce.extend(KJUR.asn1.DERAbstractTime,KJUR.asn1.ASN1Object),KJUR.asn1.DERAbstractStructured=function(t){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);this.setByASN1ObjectArray=function(t){this.hTLV=null,this.isModified=!0,this.asn1Array=t},this.appendASN1Object=function(t){this.hTLV=null,this.isModified=!0,this.asn1Array.push(t)},this.asn1Array=new Array,"undefined"!=typeof t&&"undefined"!=typeof t.array&&(this.asn1Array=t.array)},Ce.extend(KJUR.asn1.DERAbstractStructured,KJUR.asn1.ASN1Object),KJUR.asn1.DERBoolean=function(){KJUR.asn1.DERBoolean.superclass.constructor.call(this),this.hT="01",this.hTLV="0101ff"},Ce.extend(KJUR.asn1.DERBoolean,KJUR.asn1.ASN1Object),KJUR.asn1.DERInteger=function(t){KJUR.asn1.DERInteger.superclass.constructor.call(this),this.hT="02",this.setByBigInteger=function(t){this.hTLV=null,this.isModified=!0,this.hV=KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(t)},this.setByInteger=function(t){var i=new e(String(t),10);this.setByBigInteger(i)},this.setValueHex=function(t){this.hV=t},this.getFreshValueHex=function(){return this.hV},"undefined"!=typeof t&&("undefined"!=typeof t.bigint?this.setByBigInteger(t.bigint):"undefined"!=typeof t["int"]?this.setByInteger(t["int"]):"undefined"!=typeof t.hex&&this.setValueHex(t.hex))},Ce.extend(KJUR.asn1.DERInteger,KJUR.asn1.ASN1Object),KJUR.asn1.DERBitString=function(t){KJUR.asn1.DERBitString.superclass.constructor.call(this),this.hT="03",this.setHexValueIncludingUnusedBits=function(t){this.hTLV=null,this.isModified=!0,this.hV=t},this.setUnusedBitsAndHexValue=function(t,e){if(0>t||t>7)throw"unused bits shall be from 0 to 7: u = "+t;var i="0"+t;this.hTLV=null,this.isModified=!0,this.hV=i+e},this.setByBinaryString=function(t){t=t.replace(/0+$/,"");var e=8-t.length%8;8==e&&(e=0);for(var i=0;e>=i;i++)t+="0";for(var r="",i=0;i<t.length-1;i+=8){var s=t.substr(i,8),n=parseInt(s,2).toString(16);1==n.length&&(n="0"+n),r+=n}this.hTLV=null,this.isModified=!0,this.hV="0"+e+r},this.setByBooleanArray=function(t){for(var e="",i=0;i<t.length;i++)e+=1==t[i]?"1":"0";this.setByBinaryString(e)},this.newFalseArray=function(t){for(var e=new Array(t),i=0;t>i;i++)e[i]=!1;return e},this.getFreshValueHex=function(){return this.hV},"undefined"!=typeof t&&("undefined"!=typeof t.hex?this.setHexValueIncludingUnusedBits(t.hex):"undefined"!=typeof t.bin?this.setByBinaryString(t.bin):"undefined"!=typeof t.array&&this.setByBooleanArray(t.array))},Ce.extend(KJUR.asn1.DERBitString,KJUR.asn1.ASN1Object),KJUR.asn1.DEROctetString=function(t){KJUR.asn1.DEROctetString.superclass.constructor.call(this,t),this.hT="04"},Ce.extend(KJUR.asn1.DEROctetString,KJUR.asn1.DERAbstractString),KJUR.asn1.DERNull=function(){KJUR.asn1.DERNull.superclass.constructor.call(this),this.hT="05",this.hTLV="0500"},Ce.extend(KJUR.asn1.DERNull,KJUR.asn1.ASN1Object),KJUR.asn1.DERObjectIdentifier=function(t){var i=function(t){var e=t.toString(16);return 1==e.length&&(e="0"+e),e},r=function(t){var r="",s=new e(t,10),n=s.toString(2),o=7-n.length%7;7==o&&(o=0);for(var h="",a=0;o>a;a++)h+="0";n=h+n;for(var a=0;a<n.length-1;a+=7){var u=n.substr(a,7);a!=n.length-7&&(u="1"+u),r+=i(parseInt(u,2))}return r};KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this),this.hT="06",this.setValueHex=function(t){this.hTLV=null,this.isModified=!0,this.s=null,this.hV=t},this.setValueOidString=function(t){if(!t.match(/^[0-9.]+$/))throw"malformed oid string: "+t;var e="",s=t.split("."),n=40*parseInt(s[0])+parseInt(s[1]);e+=i(n),s.splice(0,2);for(var o=0;o<s.length;o++)e+=r(s[o]);this.hTLV=null,this.isModified=!0,this.s=null,this.hV=e},this.setValueName=function(t){if("undefined"==typeof KJUR.asn1.x509.OID.name2oidList[t])throw"DERObjectIdentifier oidName undefined: "+t;var e=KJUR.asn1.x509.OID.name2oidList[t];this.setValueOidString(e)},this.getFreshValueHex=function(){return this.hV},"undefined"!=typeof t&&("undefined"!=typeof t.oid?this.setValueOidString(t.oid):"undefined"!=typeof t.hex?this.setValueHex(t.hex):"undefined"!=typeof t.name&&this.setValueName(t.name))},Ce.extend(KJUR.asn1.DERObjectIdentifier,KJUR.asn1.ASN1Object),KJUR.asn1.DERUTF8String=function(t){KJUR.asn1.DERUTF8String.superclass.constructor.call(this,t),this.hT="0c"},Ce.extend(KJUR.asn1.DERUTF8String,KJUR.asn1.DERAbstractString),KJUR.asn1.DERNumericString=function(t){KJUR.asn1.DERNumericString.superclass.constructor.call(this,t),this.hT="12"},Ce.extend(KJUR.asn1.DERNumericString,KJUR.asn1.DERAbstractString),KJUR.asn1.DERPrintableString=function(t){KJUR.asn1.DERPrintableString.superclass.constructor.call(this,t),this.hT="13"},Ce.extend(KJUR.asn1.DERPrintableString,KJUR.asn1.DERAbstractString),KJUR.asn1.DERTeletexString=function(t){KJUR.asn1.DERTeletexString.superclass.constructor.call(this,t),this.hT="14"},Ce.extend(KJUR.asn1.DERTeletexString,KJUR.asn1.DERAbstractString),KJUR.asn1.DERIA5String=function(t){KJUR.asn1.DERIA5String.superclass.constructor.call(this,t),this.hT="16"},Ce.extend(KJUR.asn1.DERIA5String,KJUR.asn1.DERAbstractString),KJUR.asn1.DERUTCTime=function(t){KJUR.asn1.DERUTCTime.superclass.constructor.call(this,t),this.hT="17",this.setByDate=function(t){this.hTLV=null,this.isModified=!0,this.date=t,this.s=this.formatDate(this.date,"utc"),this.hV=stohex(this.s)},"undefined"!=typeof t&&("undefined"!=typeof t.str?this.setString(t.str):"undefined"!=typeof t.hex?this.setStringHex(t.hex):"undefined"!=typeof t.date&&this.setByDate(t.date))},Ce.extend(KJUR.asn1.DERUTCTime,KJUR.asn1.DERAbstractTime),KJUR.asn1.DERGeneralizedTime=function(t){KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this,t),this.hT="18",this.setByDate=function(t){this.hTLV=null,this.isModified=!0,this.date=t,this.s=this.formatDate(this.date,"gen"),this.hV=stohex(this.s)},"undefined"!=typeof t&&("undefined"!=typeof t.str?this.setString(t.str):"undefined"!=typeof t.hex?this.setStringHex(t.hex):"undefined"!=typeof t.date&&this.setByDate(t.date))},Ce.extend(KJUR.asn1.DERGeneralizedTime,KJUR.asn1.DERAbstractTime),KJUR.asn1.DERSequence=function(t){KJUR.asn1.DERSequence.superclass.constructor.call(this,t),this.hT="30",this.getFreshValueHex=function(){for(var t="",e=0;e<this.asn1Array.length;e++){var i=this.asn1Array[e];t+=i.getEncodedHex()}return this.hV=t,this.hV}},Ce.extend(KJUR.asn1.DERSequence,KJUR.asn1.DERAbstractStructured),KJUR.asn1.DERSet=function(t){KJUR.asn1.DERSet.superclass.constructor.call(this,t),this.hT="31",this.getFreshValueHex=function(){for(var t=new Array,e=0;e<this.asn1Array.length;e++){var i=this.asn1Array[e];t.push(i.getEncodedHex())}return t.sort(),this.hV=t.join(""),this.hV}},Ce.extend(KJUR.asn1.DERSet,KJUR.asn1.DERAbstractStructured),KJUR.asn1.DERTaggedObject=function(t){KJUR.asn1.DERTaggedObject.superclass.constructor.call(this),this.hT="a0",this.hV="",this.isExplicit=!0,this.asn1Object=null,this.setASN1Object=function(t,e,i){this.hT=e,this.isExplicit=t,this.asn1Object=i,this.isExplicit?(this.hV=this.asn1Object.getEncodedHex(),this.hTLV=null,this.isModified=!0):(this.hV=null,this.hTLV=i.getEncodedHex(),this.hTLV=this.hTLV.replace(/^../,e),this.isModified=!1)},this.getFreshValueHex=function(){return this.hV},"undefined"!=typeof t&&("undefined"!=typeof t.tag&&(this.hT=t.tag),"undefined"!=typeof t.explicit&&(this.isExplicit=t.explicit),"undefined"!=typeof t.obj&&(this.asn1Object=t.obj,this.setASN1Object(this.isExplicit,this.hT,this.asn1Object)))},Ce.extend(KJUR.asn1.DERTaggedObject,KJUR.asn1.ASN1Object),
// Copyright (c) 2008-2013 Lapo Luchini <lapo@lapo.it>
// copyright notice and this permission notice appear in all copies.
// 
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
        function(t){"use strict";var e,i={};i.decode=function(i){var r;if(e===t){var s="0123456789ABCDEF",n=" \f\n\r	?\u2028\u2029";for(e=[],r=0;16>r;++r)e[s.charAt(r)]=r;for(s=s.toLowerCase(),r=10;16>r;++r)e[s.charAt(r)]=r;for(r=0;r<n.length;++r)e[n.charAt(r)]=-1}var o=[],h=0,a=0;for(r=0;r<i.length;++r){var u=i.charAt(r);if("="==u)break;if(u=e[u],-1!=u){if(u===t)throw"Illegal character at offset "+r;h|=u,++a>=2?(o[o.length]=h,h=0,a=0):h<<=4}}if(a)throw"Hex encoding incomplete: 4 bits missing";return o},window.Hex=i}(),
// Copyright (c) 2008-2013 Lapo Luchini <lapo@lapo.it>
// copyright notice and this permission notice appear in all copies.
// 
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
        function(t){"use strict";var e,i={};i.decode=function(i){var r;if(e===t){var s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",n="= \f\n\r	?\u2028\u2029";for(e=[],r=0;64>r;++r)e[s.charAt(r)]=r;for(r=0;r<n.length;++r)e[n.charAt(r)]=-1}var o=[],h=0,a=0;for(r=0;r<i.length;++r){var u=i.charAt(r);if("="==u)break;if(u=e[u],-1!=u){if(u===t)throw"Illegal character at offset "+r;h|=u,++a>=4?(o[o.length]=h>>16,o[o.length]=h>>8&255,o[o.length]=255&h,h=0,a=0):h<<=6}}switch(a){case 1:throw"Base64 encoding incomplete: at least 2 bits missing";case 2:o[o.length]=h>>10;break;case 3:o[o.length]=h>>16,o[o.length]=h>>8&255}return o},i.re=/-----BEGIN [^-]+-----([A-Za-z0-9+\/=\s]+)-----END [^-]+-----|begin-base64[^\n]+\n([A-Za-z0-9+\/=\s]+)====/,i.unarmor=function(t){var e=i.re.exec(t);if(e)if(e[1])t=e[1];else{if(!e[2])throw"RegExp out of sync";t=e[2]}return i.decode(t)},window.Base64=i}(),
// Copyright (c) 2008-2013 Lapo Luchini <lapo@lapo.it>
// copyright notice and this permission notice appear in all copies.
// 
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
        function(t){"use strict";function e(t,i){t instanceof e?(this.enc=t.enc,this.pos=t.pos):(this.enc=t,this.pos=i)}function i(t,e,i,r,s){this.stream=t,this.header=e,this.length=i,this.tag=r,this.sub=s}var r=100,s="?",n={tag:function(t,e){var i=document.createElement(t);return i.className=e,i},text:function(t){return document.createTextNode(t)}};e.prototype.get=function(e){if(e===t&&(e=this.pos++),e>=this.enc.length)throw"Requesting byte offset "+e+" on a stream of length "+this.enc.length;return this.enc[e]},e.prototype.hexDigits="0123456789ABCDEF",e.prototype.hexByte=function(t){return this.hexDigits.charAt(t>>4&15)+this.hexDigits.charAt(15&t)},e.prototype.hexDump=function(t,e,i){for(var r="",s=t;e>s;++s)if(r+=this.hexByte(this.get(s)),i!==!0)switch(15&s){case 7:r+="  ";break;case 15:r+="\n";break;default:r+=" "}return r},e.prototype.parseStringISO=function(t,e){for(var i="",r=t;e>r;++r)i+=String.fromCharCode(this.get(r));return i},e.prototype.parseStringUTF=function(t,e){for(var i="",r=t;e>r;){var s=this.get(r++);i+=128>s?String.fromCharCode(s):s>191&&224>s?String.fromCharCode((31&s)<<6|63&this.get(r++)):String.fromCharCode((15&s)<<12|(63&this.get(r++))<<6|63&this.get(r++))}return i},e.prototype.parseStringBMP=function(t,e){for(var i="",r=t;e>r;r+=2){var s=this.get(r),n=this.get(r+1);i+=String.fromCharCode((s<<8)+n)}return i},e.prototype.reTime=/^((?:1[89]|2\d)?\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/,e.prototype.parseTime=function(t,e){var i=this.parseStringISO(t,e),r=this.reTime.exec(i);return r?(i=r[1]+"-"+r[2]+"-"+r[3]+" "+r[4],r[5]&&(i+=":"+r[5],r[6]&&(i+=":"+r[6],r[7]&&(i+="."+r[7]))),r[8]&&(i+=" UTC","Z"!=r[8]&&(i+=r[8],r[9]&&(i+=":"+r[9]))),i):"Unrecognized time: "+i},e.prototype.parseInteger=function(t,e){var i=e-t;if(i>4){i<<=3;var r=this.get(t);if(0===r)i-=8;else for(;128>r;)r<<=1,--i;return"("+i+" bit)"}for(var s=0,n=t;e>n;++n)s=s<<8|this.get(n);return s},e.prototype.parseBitString=function(t,e){var i=this.get(t),r=(e-t-1<<3)-i,s="("+r+" bit)";if(20>=r){var n=i;s+=" ";for(var o=e-1;o>t;--o){for(var h=this.get(o),a=n;8>a;++a)s+=h>>a&1?"1":"0";n=0}}return s},e.prototype.parseOctetString=function(t,e){var i=e-t,n="("+i+" byte) ";i>r&&(e=t+r);for(var o=t;e>o;++o)n+=this.hexByte(this.get(o));return i>r&&(n+=s),n},e.prototype.parseOID=function(t,e){for(var i="",r=0,s=0,n=t;e>n;++n){var o=this.get(n);if(r=r<<7|127&o,s+=7,!(128&o)){if(""===i){var h=80>r?40>r?0:1:2;i=h+"."+(r-40*h)}else i+="."+(s>=31?"bigint":r);r=s=0}}return i},i.prototype.typeName=function(){if(this.tag===t)return"unknown";var e=this.tag>>6,i=(this.tag>>5&1,31&this.tag);switch(e){case 0:switch(i){case 0:return"EOC";case 1:return"BOOLEAN";case 2:return"INTEGER";case 3:return"BIT_STRING";case 4:return"OCTET_STRING";case 5:return"NULL";case 6:return"OBJECT_IDENTIFIER";case 7:return"ObjectDescriptor";case 8:return"EXTERNAL";case 9:return"REAL";case 10:return"ENUMERATED";case 11:return"EMBEDDED_PDV";case 12:return"UTF8String";case 16:return"SEQUENCE";case 17:return"SET";case 18:return"NumericString";case 19:return"PrintableString";case 20:return"TeletexString";case 21:return"VideotexString";case 22:return"IA5String";case 23:return"UTCTime";case 24:return"GeneralizedTime";case 25:return"GraphicString";case 26:return"VisibleString";case 27:return"GeneralString";case 28:return"UniversalString";case 30:return"BMPString";default:return"Universal_"+i.toString(16)}case 1:return"Application_"+i.toString(16);case 2:return"["+i+"]";case 3:return"Private_"+i.toString(16)}},i.prototype.reSeemsASCII=/^[ -~]+$/,i.prototype.content=function(){if(this.tag===t)return null;var e=this.tag>>6,i=31&this.tag,n=this.posContent(),o=Math.abs(this.length);if(0!==e){if(null!==this.sub)return"("+this.sub.length+" elem)";var h=this.stream.parseStringISO(n,n+Math.min(o,r));return this.reSeemsASCII.test(h)?h.substring(0,2*r)+(h.length>2*r?s:""):this.stream.parseOctetString(n,n+o)}switch(i){case 1:return 0===this.stream.get(n)?"false":"true";case 2:return this.stream.parseInteger(n,n+o);case 3:return this.sub?"("+this.sub.length+" elem)":this.stream.parseBitString(n,n+o);case 4:return this.sub?"("+this.sub.length+" elem)":this.stream.parseOctetString(n,n+o);case 6:return this.stream.parseOID(n,n+o);case 16:case 17:return"("+this.sub.length+" elem)";case 12:return this.stream.parseStringUTF(n,n+o);case 18:case 19:case 20:case 21:case 22:case 26:return this.stream.parseStringISO(n,n+o);case 30:return this.stream.parseStringBMP(n,n+o);case 23:case 24:return this.stream.parseTime(n,n+o)}return null},i.prototype.toString=function(){return this.typeName()+"@"+this.stream.pos+"[header:"+this.header+",length:"+this.length+",sub:"+(null===this.sub?"null":this.sub.length)+"]"},i.prototype.print=function(e){if(e===t&&(e=""),document.writeln(e+this),null!==this.sub){e+="  ";for(var i=0,r=this.sub.length;r>i;++i)this.sub[i].print(e)}},i.prototype.toPrettyString=function(e){e===t&&(e="");var i=e+this.typeName()+" @"+this.stream.pos;if(this.length>=0&&(i+="+"),i+=this.length,32&this.tag?i+=" (constructed)":3!=this.tag&&4!=this.tag||null===this.sub||(i+=" (encapsulates)"),i+="\n",null!==this.sub){e+="  ";for(var r=0,s=this.sub.length;s>r;++r)i+=this.sub[r].toPrettyString(e)}return i},i.prototype.toDOM=function(){var t=n.tag("div","node");t.asn1=this;var e=n.tag("div","head"),i=this.typeName().replace(/_/g," ");e.innerHTML=i;var r=this.content();if(null!==r){r=String(r).replace(/</g,"&lt;");var s=n.tag("span","preview");s.appendChild(n.text(r)),e.appendChild(s)}t.appendChild(e),this.node=t,this.head=e;var o=n.tag("div","value");if(i="Offset: "+this.stream.pos+"<br/>",i+="Length: "+this.header+"+",i+=this.length>=0?this.length:-this.length+" (undefined)",32&this.tag?i+="<br/>(constructed)":3!=this.tag&&4!=this.tag||null===this.sub||(i+="<br/>(encapsulates)"),null!==r&&(i+="<br/>Value:<br/><b>"+r+"</b>","object"==typeof oids&&6==this.tag)){var h=oids[r];h&&(h.d&&(i+="<br/>"+h.d),h.c&&(i+="<br/>"+h.c),h.w&&(i+="<br/>(warning!)"))}o.innerHTML=i,t.appendChild(o);var a=n.tag("div","sub");if(null!==this.sub)for(var u=0,c=this.sub.length;c>u;++u)a.appendChild(this.sub[u].toDOM());return t.appendChild(a),e.onclick=function(){t.className="node collapsed"==t.className?"node":"node collapsed"},t},i.prototype.posStart=function(){return this.stream.pos},i.prototype.posContent=function(){return this.stream.pos+this.header},i.prototype.posEnd=function(){return this.stream.pos+this.header+Math.abs(this.length)},i.prototype.fakeHover=function(t){this.node.className+=" hover",t&&(this.head.className+=" hover")},i.prototype.fakeOut=function(t){var e=/ ?hover/;this.node.className=this.node.className.replace(e,""),t&&(this.head.className=this.head.className.replace(e,""))},i.prototype.toHexDOM_sub=function(t,e,i,r,s){if(!(r>=s)){var o=n.tag("span",e);o.appendChild(n.text(i.hexDump(r,s))),t.appendChild(o)}},i.prototype.toHexDOM=function(e){var i=n.tag("span","hex");if(e===t&&(e=i),this.head.hexNode=i,this.head.onmouseover=function(){this.hexNode.className="hexCurrent"},this.head.onmouseout=function(){this.hexNode.className="hex"},i.asn1=this,i.onmouseover=function(){var t=!e.selected;t&&(e.selected=this.asn1,this.className="hexCurrent"),this.asn1.fakeHover(t)},i.onmouseout=function(){var t=e.selected==this.asn1;this.asn1.fakeOut(t),t&&(e.selected=null,this.className="hex")},this.toHexDOM_sub(i,"tag",this.stream,this.posStart(),this.posStart()+1),this.toHexDOM_sub(i,this.length>=0?"dlen":"ulen",this.stream,this.posStart()+1,this.posContent()),null===this.sub)i.appendChild(n.text(this.stream.hexDump(this.posContent(),this.posEnd())));else if(this.sub.length>0){var r=this.sub[0],s=this.sub[this.sub.length-1];this.toHexDOM_sub(i,"intro",this.stream,this.posContent(),r.posStart());for(var o=0,h=this.sub.length;h>o;++o)i.appendChild(this.sub[o].toHexDOM(e));this.toHexDOM_sub(i,"outro",this.stream,s.posEnd(),this.posEnd())}return i},i.prototype.toHexString=function(t){return this.stream.hexDump(this.posStart(),this.posEnd(),!0)},i.decodeLength=function(t){var e=t.get(),i=127&e;if(i==e)return i;if(i>3)throw"Length over 24 bits not supported at position "+(t.pos-1);if(0===i)return-1;e=0;for(var r=0;i>r;++r)e=e<<8|t.get();return e},i.hasContent=function(t,r,s){if(32&t)return!0;if(3>t||t>4)return!1;var n=new e(s);3==t&&n.get();var o=n.get();if(o>>6&1)return!1;try{var h=i.decodeLength(n);return n.pos-s.pos+h==r}catch(a){return!1}},i.decode=function(t){t instanceof e||(t=new e(t,0));var r=new e(t),s=t.get(),n=i.decodeLength(t),o=t.pos-r.pos,h=null;if(i.hasContent(s,n,t)){var a=t.pos;if(3==s&&t.get(),h=[],n>=0){for(var u=a+n;t.pos<u;)h[h.length]=i.decode(t);if(t.pos!=u)throw"Content size is not correct for container starting at offset "+a}else try{for(;;){var c=i.decode(t);if(0===c.tag)break;h[h.length]=c}n=a-t.pos}catch(f){throw"Exception while decoding undefined length content: "+f}}else t.pos+=n;return new i(r,o,n,s,h)},i.test=function(){for(var t=[{value:[39],expected:39},{value:[129,201],expected:201},{value:[131,254,220,186],expected:16702650}],r=0,s=t.length;s>r;++r){var n=new e(t[r].value,0),o=i.decodeLength(n);o!=t[r].expected&&document.write("In test["+r+"] expected "+t[r].expected+" got "+o+"\n")}},window.ASN1=i}(),ASN1.prototype.getHexStringValue=function(){var t=this.toHexString(),e=2*this.header,i=2*this.length;return t.substr(e,i)},ue.prototype.parseKey=function(t){try{var e=0,i=0,r=/^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/,s=r.test(t)?Hex.decode(t):Base64.unarmor(t),n=ASN1.decode(s);if(3===n.sub.length&&(n=n.sub[2].sub[0]),9===n.sub.length){e=n.sub[1].getHexStringValue(),this.n=he(e,16),i=n.sub[2].getHexStringValue(),this.e=parseInt(i,16);var o=n.sub[3].getHexStringValue();this.d=he(o,16);var h=n.sub[4].getHexStringValue();this.p=he(h,16);var a=n.sub[5].getHexStringValue();this.q=he(a,16);var u=n.sub[6].getHexStringValue();this.dmp1=he(u,16);var c=n.sub[7].getHexStringValue();this.dmq1=he(c,16);var f=n.sub[8].getHexStringValue();this.coeff=he(f,16)}else{if(2!==n.sub.length)return!1;var p=n.sub[1],l=p.sub[0];e=l.sub[0].getHexStringValue(),this.n=he(e,16),i=l.sub[1].getHexStringValue(),this.e=parseInt(i,16)}return!0}catch(d){return!1}},ue.prototype.getPrivateBaseKey=function(){var t={array:[new KJUR.asn1.DERInteger({"int":0}),new KJUR.asn1.DERInteger({bigint:this.n}),new KJUR.asn1.DERInteger({"int":this.e}),new KJUR.asn1.DERInteger({bigint:this.d}),new KJUR.asn1.DERInteger({bigint:this.p}),new KJUR.asn1.DERInteger({bigint:this.q}),new KJUR.asn1.DERInteger({bigint:this.dmp1}),new KJUR.asn1.DERInteger({bigint:this.dmq1}),new KJUR.asn1.DERInteger({bigint:this.coeff})]},e=new KJUR.asn1.DERSequence(t);return e.getEncodedHex()},ue.prototype.getPrivateBaseKeyB64=function(){return be(this.getPrivateBaseKey())},ue.prototype.getPublicBaseKey=function(){var t={array:[new KJUR.asn1.DERObjectIdentifier({oid:"1.2.840.113549.1.1.1"}),new KJUR.asn1.DERNull]},e=new KJUR.asn1.DERSequence(t);t={array:[new KJUR.asn1.DERInteger({bigint:this.n}),new KJUR.asn1.DERInteger({"int":this.e})]};var i=new KJUR.asn1.DERSequence(t);t={hex:"00"+i.getEncodedHex()};var r=new KJUR.asn1.DERBitString(t);t={array:[e,r]};var s=new KJUR.asn1.DERSequence(t);return s.getEncodedHex()},ue.prototype.getPublicBaseKeyB64=function(){return be(this.getPublicBaseKey())},ue.prototype.wordwrap=function(t,e){if(e=e||64,!t)return t;var i="(.{1,"+e+"})( +|$\n?)|(.{1,"+e+"})";return t.match(RegExp(i,"g")).join("\n")},ue.prototype.getPrivateKey=function(){var t="-----BEGIN RSA PRIVATE KEY-----\n";return t+=this.wordwrap(this.getPrivateBaseKeyB64())+"\n",t+="-----END RSA PRIVATE KEY-----"},ue.prototype.getPublicKey=function(){var t="-----BEGIN PUBLIC KEY-----\n";return t+=this.wordwrap(this.getPublicBaseKeyB64())+"\n",t+="-----END PUBLIC KEY-----"},ue.prototype.hasPublicKeyProperty=function(t){return t=t||{},t.hasOwnProperty("n")&&t.hasOwnProperty("e")},ue.prototype.hasPrivateKeyProperty=function(t){return t=t||{},t.hasOwnProperty("n")&&t.hasOwnProperty("e")&&t.hasOwnProperty("d")&&t.hasOwnProperty("p")&&t.hasOwnProperty("q")&&t.hasOwnProperty("dmp1")&&t.hasOwnProperty("dmq1")&&t.hasOwnProperty("coeff")},ue.prototype.parsePropertiesFrom=function(t){this.n=t.n,this.e=t.e,t.hasOwnProperty("d")&&(this.d=t.d,this.p=t.p,this.q=t.q,this.dmp1=t.dmp1,this.dmq1=t.dmq1,this.coeff=t.coeff)};var _e=function(t){ue.call(this),t&&("string"==typeof t?this.parseKey(t):(this.hasPrivateKeyProperty(t)||this.hasPublicKeyProperty(t))&&this.parsePropertiesFrom(t))};_e.prototype=new ue,_e.prototype.constructor=_e;var ze=function(t){t=t||{},this.default_key_size=parseInt(t.default_key_size)||1024,this.default_public_exponent=t.default_public_exponent||"010001",this.log=t.log||!1,this.key=null};ze.prototype.setKey=function(t){this.log&&this.key&&console.warn("A key was already set, overriding existing."),this.key=new _e(t)},ze.prototype.setPrivateKey=function(t){this.setKey(t)},ze.prototype.setPublicKey=function(t){this.setKey(t)},ze.prototype.decrypt=function(t){try{return this.getKey().decrypt(Te(t))}catch(e){return!1}},ze.prototype.encrypt=function(t){try{return be(this.getKey().encrypt(t))}catch(e){return!1}},ze.prototype.getKey=function(t){if(!this.key){if(this.key=new _e,t&&"[object Function]"==={}.toString.call(t))return void this.key.generateAsync(this.default_key_size,this.default_public_exponent,t);this.key.generate(this.default_key_size,this.default_public_exponent)}return this.key},ze.prototype.getPrivateKey=function(){return this.getKey().getPrivateKey()},ze.prototype.getPrivateKeyB64=function(){return this.getKey().getPrivateBaseKeyB64()},ze.prototype.getPublicKey=function(){return this.getKey().getPublicKey()},ze.prototype.getPublicKeyB64=function(){return this.getKey().getPublicBaseKeyB64()},ze.version="2.3.1",t.JSEncrypt=ze});

/**
 * [js-md5]{@link https://github.com/emn178/js-md5}
 *
 * @namespace md5
 * @version 0.4.2
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
!function(){"use strict";function t(t){if(t)c[0]=c[16]=c[1]=c[2]=c[3]=c[4]=c[5]=c[6]=c[7]=c[8]=c[9]=c[10]=c[11]=c[12]=c[13]=c[14]=c[15]=0,this.blocks=c,this.buffer8=i;else if(n){var r=new ArrayBuffer(68);this.buffer8=new Uint8Array(r),this.blocks=new Uint32Array(r)}else this.blocks=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];this.h0=this.h1=this.h2=this.h3=this.start=this.bytes=0,this.finalized=this.hashed=!1,this.first=!0}var r="object"==typeof window?window:{},e=!r.JS_MD5_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node;e&&(r=global);var i,h=!r.JS_MD5_NO_COMMON_JS&&"object"==typeof module&&module.exports,s="function"==typeof define&&define.amd,n=!r.JS_MD5_NO_ARRAY_BUFFER&&"undefined"!=typeof ArrayBuffer,f="0123456789abcdef".split(""),o=[128,32768,8388608,-2147483648],a=[0,8,16,24],u=["hex","array","digest","buffer","arrayBuffer"],c=[];if(n){var p=new ArrayBuffer(68);i=new Uint8Array(p),c=new Uint32Array(p)}var d=function(r){return function(e){return new t(!0).update(e)[r]()}},y=function(){var r=d("hex");e&&(r=l(r)),r.create=function(){return new t},r.update=function(t){return r.create().update(t)};for(var i=0;i<u.length;++i){var h=u[i];r[h]=d(h)}return r},l=function(t){var r=require("crypto"),e=require("buffer").Buffer,i=function(i){if("string"==typeof i)return r.createHash("md5").update(i,"utf8").digest("hex");if(i.constructor===ArrayBuffer)i=new Uint8Array(i);else if(void 0===i.length)return t(i);return r.createHash("md5").update(new e(i)).digest("hex")};return i};t.prototype.update=function(t){if(!this.finalized){var e="string"!=typeof t;e&&t.constructor==r.ArrayBuffer&&(t=new Uint8Array(t));for(var i,h,s=0,f=t.length||0,o=this.blocks,u=this.buffer8;f>s;){if(this.hashed&&(this.hashed=!1,o[0]=o[16],o[16]=o[1]=o[2]=o[3]=o[4]=o[5]=o[6]=o[7]=o[8]=o[9]=o[10]=o[11]=o[12]=o[13]=o[14]=o[15]=0),e)if(n)for(h=this.start;f>s&&64>h;++s)u[h++]=t[s];else for(h=this.start;f>s&&64>h;++s)o[h>>2]|=t[s]<<a[3&h++];else if(n)for(h=this.start;f>s&&64>h;++s)i=t.charCodeAt(s),128>i?u[h++]=i:2048>i?(u[h++]=192|i>>6,u[h++]=128|63&i):55296>i||i>=57344?(u[h++]=224|i>>12,u[h++]=128|i>>6&63,u[h++]=128|63&i):(i=65536+((1023&i)<<10|1023&t.charCodeAt(++s)),u[h++]=240|i>>18,u[h++]=128|i>>12&63,u[h++]=128|i>>6&63,u[h++]=128|63&i);else for(h=this.start;f>s&&64>h;++s)i=t.charCodeAt(s),128>i?o[h>>2]|=i<<a[3&h++]:2048>i?(o[h>>2]|=(192|i>>6)<<a[3&h++],o[h>>2]|=(128|63&i)<<a[3&h++]):55296>i||i>=57344?(o[h>>2]|=(224|i>>12)<<a[3&h++],o[h>>2]|=(128|i>>6&63)<<a[3&h++],o[h>>2]|=(128|63&i)<<a[3&h++]):(i=65536+((1023&i)<<10|1023&t.charCodeAt(++s)),o[h>>2]|=(240|i>>18)<<a[3&h++],o[h>>2]|=(128|i>>12&63)<<a[3&h++],o[h>>2]|=(128|i>>6&63)<<a[3&h++],o[h>>2]|=(128|63&i)<<a[3&h++]);this.lastByteIndex=h,this.bytes+=h-this.start,h>=64?(this.start=h-64,this.hash(),this.hashed=!0):this.start=h}return this}},t.prototype.finalize=function(){if(!this.finalized){this.finalized=!0;var t=this.blocks,r=this.lastByteIndex;t[r>>2]|=o[3&r],r>=56&&(this.hashed||this.hash(),t[0]=t[16],t[16]=t[1]=t[2]=t[3]=t[4]=t[5]=t[6]=t[7]=t[8]=t[9]=t[10]=t[11]=t[12]=t[13]=t[14]=t[15]=0),t[14]=this.bytes<<3,this.hash()}},t.prototype.hash=function(){var t,r,e,i,h,s,n=this.blocks;this.first?(t=n[0]-680876937,t=(t<<7|t>>>25)-271733879<<0,i=(-1732584194^2004318071&t)+n[1]-117830708,i=(i<<12|i>>>20)+t<<0,e=(-271733879^i&(-271733879^t))+n[2]-1126478375,e=(e<<17|e>>>15)+i<<0,r=(t^e&(i^t))+n[3]-1316259209,r=(r<<22|r>>>10)+e<<0):(t=this.h0,r=this.h1,e=this.h2,i=this.h3,t+=(i^r&(e^i))+n[0]-680876936,t=(t<<7|t>>>25)+r<<0,i+=(e^t&(r^e))+n[1]-389564586,i=(i<<12|i>>>20)+t<<0,e+=(r^i&(t^r))+n[2]+606105819,e=(e<<17|e>>>15)+i<<0,r+=(t^e&(i^t))+n[3]-1044525330,r=(r<<22|r>>>10)+e<<0),t+=(i^r&(e^i))+n[4]-176418897,t=(t<<7|t>>>25)+r<<0,i+=(e^t&(r^e))+n[5]+1200080426,i=(i<<12|i>>>20)+t<<0,e+=(r^i&(t^r))+n[6]-1473231341,e=(e<<17|e>>>15)+i<<0,r+=(t^e&(i^t))+n[7]-45705983,r=(r<<22|r>>>10)+e<<0,t+=(i^r&(e^i))+n[8]+1770035416,t=(t<<7|t>>>25)+r<<0,i+=(e^t&(r^e))+n[9]-1958414417,i=(i<<12|i>>>20)+t<<0,e+=(r^i&(t^r))+n[10]-42063,e=(e<<17|e>>>15)+i<<0,r+=(t^e&(i^t))+n[11]-1990404162,r=(r<<22|r>>>10)+e<<0,t+=(i^r&(e^i))+n[12]+1804603682,t=(t<<7|t>>>25)+r<<0,i+=(e^t&(r^e))+n[13]-40341101,i=(i<<12|i>>>20)+t<<0,e+=(r^i&(t^r))+n[14]-1502002290,e=(e<<17|e>>>15)+i<<0,r+=(t^e&(i^t))+n[15]+1236535329,r=(r<<22|r>>>10)+e<<0,t+=(e^i&(r^e))+n[1]-165796510,t=(t<<5|t>>>27)+r<<0,i+=(r^e&(t^r))+n[6]-1069501632,i=(i<<9|i>>>23)+t<<0,e+=(t^r&(i^t))+n[11]+643717713,e=(e<<14|e>>>18)+i<<0,r+=(i^t&(e^i))+n[0]-373897302,r=(r<<20|r>>>12)+e<<0,t+=(e^i&(r^e))+n[5]-701558691,t=(t<<5|t>>>27)+r<<0,i+=(r^e&(t^r))+n[10]+38016083,i=(i<<9|i>>>23)+t<<0,e+=(t^r&(i^t))+n[15]-660478335,e=(e<<14|e>>>18)+i<<0,r+=(i^t&(e^i))+n[4]-405537848,r=(r<<20|r>>>12)+e<<0,t+=(e^i&(r^e))+n[9]+568446438,t=(t<<5|t>>>27)+r<<0,i+=(r^e&(t^r))+n[14]-1019803690,i=(i<<9|i>>>23)+t<<0,e+=(t^r&(i^t))+n[3]-187363961,e=(e<<14|e>>>18)+i<<0,r+=(i^t&(e^i))+n[8]+1163531501,r=(r<<20|r>>>12)+e<<0,t+=(e^i&(r^e))+n[13]-1444681467,t=(t<<5|t>>>27)+r<<0,i+=(r^e&(t^r))+n[2]-51403784,i=(i<<9|i>>>23)+t<<0,e+=(t^r&(i^t))+n[7]+1735328473,e=(e<<14|e>>>18)+i<<0,r+=(i^t&(e^i))+n[12]-1926607734,r=(r<<20|r>>>12)+e<<0,h=r^e,t+=(h^i)+n[5]-378558,t=(t<<4|t>>>28)+r<<0,i+=(h^t)+n[8]-2022574463,i=(i<<11|i>>>21)+t<<0,s=i^t,e+=(s^r)+n[11]+1839030562,e=(e<<16|e>>>16)+i<<0,r+=(s^e)+n[14]-35309556,r=(r<<23|r>>>9)+e<<0,h=r^e,t+=(h^i)+n[1]-1530992060,t=(t<<4|t>>>28)+r<<0,i+=(h^t)+n[4]+1272893353,i=(i<<11|i>>>21)+t<<0,s=i^t,e+=(s^r)+n[7]-155497632,e=(e<<16|e>>>16)+i<<0,r+=(s^e)+n[10]-1094730640,r=(r<<23|r>>>9)+e<<0,h=r^e,t+=(h^i)+n[13]+681279174,t=(t<<4|t>>>28)+r<<0,i+=(h^t)+n[0]-358537222,i=(i<<11|i>>>21)+t<<0,s=i^t,e+=(s^r)+n[3]-722521979,e=(e<<16|e>>>16)+i<<0,r+=(s^e)+n[6]+76029189,r=(r<<23|r>>>9)+e<<0,h=r^e,t+=(h^i)+n[9]-640364487,t=(t<<4|t>>>28)+r<<0,i+=(h^t)+n[12]-421815835,i=(i<<11|i>>>21)+t<<0,s=i^t,e+=(s^r)+n[15]+530742520,e=(e<<16|e>>>16)+i<<0,r+=(s^e)+n[2]-995338651,r=(r<<23|r>>>9)+e<<0,t+=(e^(r|~i))+n[0]-198630844,t=(t<<6|t>>>26)+r<<0,i+=(r^(t|~e))+n[7]+1126891415,i=(i<<10|i>>>22)+t<<0,e+=(t^(i|~r))+n[14]-1416354905,e=(e<<15|e>>>17)+i<<0,r+=(i^(e|~t))+n[5]-57434055,r=(r<<21|r>>>11)+e<<0,t+=(e^(r|~i))+n[12]+1700485571,t=(t<<6|t>>>26)+r<<0,i+=(r^(t|~e))+n[3]-1894986606,i=(i<<10|i>>>22)+t<<0,e+=(t^(i|~r))+n[10]-1051523,e=(e<<15|e>>>17)+i<<0,r+=(i^(e|~t))+n[1]-2054922799,r=(r<<21|r>>>11)+e<<0,t+=(e^(r|~i))+n[8]+1873313359,t=(t<<6|t>>>26)+r<<0,i+=(r^(t|~e))+n[15]-30611744,i=(i<<10|i>>>22)+t<<0,e+=(t^(i|~r))+n[6]-1560198380,e=(e<<15|e>>>17)+i<<0,r+=(i^(e|~t))+n[13]+1309151649,r=(r<<21|r>>>11)+e<<0,t+=(e^(r|~i))+n[4]-145523070,t=(t<<6|t>>>26)+r<<0,i+=(r^(t|~e))+n[11]-1120210379,i=(i<<10|i>>>22)+t<<0,e+=(t^(i|~r))+n[2]+718787259,e=(e<<15|e>>>17)+i<<0,r+=(i^(e|~t))+n[9]-343485551,r=(r<<21|r>>>11)+e<<0,this.first?(this.h0=t+1732584193<<0,this.h1=r-271733879<<0,this.h2=e-1732584194<<0,this.h3=i+271733878<<0,this.first=!1):(this.h0=this.h0+t<<0,this.h1=this.h1+r<<0,this.h2=this.h2+e<<0,this.h3=this.h3+i<<0)},t.prototype.hex=function(){this.finalize();var t=this.h0,r=this.h1,e=this.h2,i=this.h3;return f[t>>4&15]+f[15&t]+f[t>>12&15]+f[t>>8&15]+f[t>>20&15]+f[t>>16&15]+f[t>>28&15]+f[t>>24&15]+f[r>>4&15]+f[15&r]+f[r>>12&15]+f[r>>8&15]+f[r>>20&15]+f[r>>16&15]+f[r>>28&15]+f[r>>24&15]+f[e>>4&15]+f[15&e]+f[e>>12&15]+f[e>>8&15]+f[e>>20&15]+f[e>>16&15]+f[e>>28&15]+f[e>>24&15]+f[i>>4&15]+f[15&i]+f[i>>12&15]+f[i>>8&15]+f[i>>20&15]+f[i>>16&15]+f[i>>28&15]+f[i>>24&15]},t.prototype.toString=t.prototype.hex,t.prototype.digest=function(){this.finalize();var t=this.h0,r=this.h1,e=this.h2,i=this.h3;return[255&t,t>>8&255,t>>16&255,t>>24&255,255&r,r>>8&255,r>>16&255,r>>24&255,255&e,e>>8&255,e>>16&255,e>>24&255,255&i,i>>8&255,i>>16&255,i>>24&255]},t.prototype.array=t.prototype.digest,t.prototype.arrayBuffer=function(){this.finalize();var t=new ArrayBuffer(16),r=new Uint32Array(t);return r[0]=this.h0,r[1]=this.h1,r[2]=this.h2,r[3]=this.h3,t},t.prototype.buffer=t.prototype.arrayBuffer;var b=y();h?module.exports=b:(r.md5=b,s&&define(function(){return b}))}();





/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* AES implementation in JavaScript                                   (c) Chris Veness 2005-2017  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/aes.html                                                        */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
'use strict';
/**
 * AES (Rijndael cipher) encryption routines reference implementation,
 *
 * This is an annotated direct implementation of FIPS 197, without any optimisations. It is
 * intended to aid understanding of the algorithm rather than for production use.
 *
 * While it could be used where performance is not critical, I would recommend using the ?Web
 * Cryptography API? (developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt) for the browser,
 * or the ?crypto? library (nodejs.org/api/crypto.html#crypto_class_cipher) in Node.js.
 *
 * See csrc.nist.gov/publications/fips/fips197/fips-197.pdf
 */
Aes = {
    /**
     * AES Cipher function: encrypt 'input' state with Rijndael algorithm [?5.1];
     *   applies Nr rounds (10/12/14) using key schedule w for 'add round key' stage.
     *
     * @param   {number[]}   input - 16-byte (128-bit) input state array.
     * @param   {number[][]} w - Key schedule as 2D byte-array (Nr+1 ? Nb bytes).
     * @returns {number[]}   Encrypted output state array.
     */
    cipher : function(input, w) {
        const Nb = 4;               // block size (in words): no of columns in state (fixed at 4 for AES)
        const Nr = w.length/Nb - 1; // no of rounds: 10/12/14 for 128/192/256-bit keys
        var state = [ [], [], [], [] ];  // initialise 4?Nb byte-array 'state' with input [?3.4]
        for (var i=0; i<4*Nb; i++) state[i%4][Math.floor(i/4)] = input[i];
        state = Aes.addRoundKey(state, w, 0, Nb);
        for (var round=1; round<Nr; round++) {
            state = Aes.subBytes(state, Nb);
            state = Aes.shiftRows(state, Nb);
            state = Aes.mixColumns(state, Nb);
            state = Aes.addRoundKey(state, w, round, Nb);
        }
        state = Aes.subBytes(state, Nb);
        state = Aes.shiftRows(state, Nb);
        state = Aes.addRoundKey(state, w, Nr, Nb);
        const output = new Array(4*Nb);  // convert state to 1-d array before returning [?3.4]
        for (var i=0; i<4*Nb; i++) output[i] = state[i%4][Math.floor(i/4)];
        return output;
    },
    /**
     * Perform key expansion to generate a key schedule from a cipher key [?5.2].
     *
     * @param   {number[]}   key - Cipher key as 16/24/32-byte array.
     * @returns {number[][]} Expanded key schedule as 2D byte-array (Nr+1 ? Nb bytes).
     */
    keyExpansion: function (key) {
        const Nb = 4;            // block size (in words): no of columns in state (fixed at 4 for AES)
        const Nk = key.length/4; // key length (in words): 4/6/8 for 128/192/256-bit keys
        const Nr = Nk + 6;       // no of rounds: 10/12/14 for 128/192/256-bit keys
        const w = new Array(Nb*(Nr+1));
        var temp = new Array(4);
        // initialise first Nk words of expanded key with cipher key
        for (var i=0; i<Nk; i++) {
            var r = [ key[4*i], key[4*i+1], key[4*i+2], key[4*i+3] ];
            w[i] = r;
        }
        // expand the key into the remainder of the schedule
        for (var i=Nk; i<(Nb*(Nr+1)); i++) {
            w[i] = new Array(4);
            for (var t=0; t<4; t++) temp[t] = w[i-1][t];
            // each Nk'th word has extra transformation
            if (i % Nk == 0) {
                temp = Aes.subWord(Aes.rotWord(temp));
                for (var t=0; t<4; t++) temp[t] ^= Aes.rCon[i/Nk][t];
            }
            // 256-bit key has subWord applied every 4th word
            else if (Nk > 6 && i%Nk == 4) {
                temp = Aes.subWord(temp);
            }
            // xor w[i] with w[i-1] and w[i-Nk]
            for (var t=0; t<4; t++) w[i][t] = w[i-Nk][t] ^ temp[t];
        }
        return w;
    },
    /**
     * Apply SBox to state S [?5.1.1].
     *
     * @private
     */
    subBytes : function (s, Nb) {
        for (var r=0; r<4; r++) {
            for (var c=0; c<Nb; c++) s[r][c] = Aes.sBox[s[r][c]];
        }
        return s;
    },
    /**
     * Shift row r of state S left by r bytes [?5.1.2].
     *
     * @private
     */
    shiftRows : function (s, Nb) {
        const t = new Array(4);
        for (var r=1; r<4; r++) {
            for (var c=0; c<4; c++) t[c] = s[r][(c+r)%Nb];  // shift into temp copy
            for (var c=0; c<4; c++) s[r][c] = t[c];         // and copy back
        }          // note that this will work for Nb=4,5,6, but not 7,8 (always 4 for AES):
        return s;  // see asmaes.sourceforge.net/rijndael/rijndaelImplementation.pdf
    },
    /**
     * Combine bytes of each col of state S [?5.1.3].
     *
     * @private
     */
    mixColumns : function (s, Nb) {
        for (var c=0; c<Nb; c++) {
            var a = new Array(Nb);  // 'a' is a copy of the current column from 's'
            var b = new Array(Nb);  // 'b' is a?{02} in GF(2^8)
            for (var r=0; r<4; r++) {
                a[r] = s[r][c];
                b[r] = s[r][c]&0x80 ? s[r][c]<<1 ^ 0x011b : s[r][c]<<1;
            }
            // a[n] ^ b[n] is a?{03} in GF(2^8)
            s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3]; // {02}?a0 + {03}?a1 + a2 + a3
            s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3]; // a0 ? {02}?a1 + {03}?a2 + a3
            s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3]; // a0 + a1 + {02}?a2 + {03}?a3
            s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3]; // {03}?a0 + a1 + a2 + {02}?a3
        }
        return s;
    },
    /**
     * Xor Round Key into state S [?5.1.4].
     *
     * @private
     */
    addRoundKey : function (state, w, rnd, Nb) {
        for (var r=0; r<4; r++) {
            for (var c=0; c<Nb; c++) state[r][c] ^= w[rnd*4+c][r];
        }
        return state;
    },
    /**
     * Apply SBox to 4-byte word w.
     *
     * @private
     */
    subWord : function (w) {
        for (var i=0; i<4; i++) w[i] = Aes.sBox[w[i]];
        return w;
    },
    /**
     * Rotate 4-byte word w left by one byte.
     *
     * @private
     */
    rotWord : function (w) {
        const tmp = w[0];
        for (var i=0; i<3; i++) w[i] = w[i+1];
        w[3] = tmp;
        return w;
    }
}
// sBox is pre-computed multiplicative inverse in GF(2^8) used in subBytes and keyExpansion [?5.1.1]
Aes.sBox = [ 0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16 ];
// rCon is Round Constant used for the Key Expansion [1st col is 2^(r-1) in GF(2^8)] [?5.2]
Aes.rCon = [ [ 0x00, 0x00, 0x00, 0x00 ],
    [ 0x01, 0x00, 0x00, 0x00 ],
    [ 0x02, 0x00, 0x00, 0x00 ],
    [ 0x04, 0x00, 0x00, 0x00 ],
    [ 0x08, 0x00, 0x00, 0x00 ],
    [ 0x10, 0x00, 0x00, 0x00 ],
    [ 0x20, 0x00, 0x00, 0x00 ],
    [ 0x40, 0x00, 0x00, 0x00 ],
    [ 0x80, 0x00, 0x00, 0x00 ],
    [ 0x1b, 0x00, 0x00, 0x00 ],
    [ 0x36, 0x00, 0x00, 0x00 ] ];
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Aes; // ? export default Aes


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* AES counter-mode (CTR) implementation in JavaScript                (c) Chris Veness 2005-2017  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/aes.html                                                        */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* eslint no-var:warn *//* global WorkerGlobalScope */

/**
 * AesCtr: Counter-mode (CTR) wrapper for AES.
 *
 * This encrypts a Unicode string to produces a base64 ciphertext using 128/192/256-bit AES,
 * and the converse to decrypt an encrypted ciphertext.
 *
 * See csrc.nist.gov/publications/nistpubs/800-38a/sp800-38a.pdf
 */
AesCtr =  {
    /**
     * Encrypt a text using AES encryption in Counter mode of operation.
     *
     * Unicode multi-byte character safe
     *
     * @param   {string} plaintext - Source text to be encrypted.
     * @param   {string} password - The password to use to generate a key for encryption.
     * @param   {number} nBits - Number of bits to be used in the key; 128 / 192 / 256.
     * @returns {string} Encrypted text.
     *
     * @example
     *   const encr = AesCtr.encrypt('big secret', 'p???????', 256); // 'lwGl66VVwVObKIr6of8HVqJr'
     */
    encrypt : function (plaintext, password, nBits) {
        const blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
        if (!(nBits==128 || nBits==192 || nBits==256)) throw new Error('Key size is not 128 / 192 / 256');
        plaintext = AesCtr.utf8Encode(String(plaintext));
        password = AesCtr.utf8Encode(String(password));
        // use AES itself to encrypt password to get cipher key (using plain password as source for key
        // expansion) to give us well encrypted key (in real use hashed password could be used for key)
        const nBytes = nBits/8;  // no bytes in key (16/24/32)
        const pwBytes = new Array(nBytes);
        for (var i=0; i<nBytes; i++) {  // use 1st 16/24/32 chars of password for key
            pwBytes[i] = i<password.length ?  password.charCodeAt(i) : 0;
        }
        var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes)); // gives us 16-byte key
        key = key.concat(key.slice(0, nBytes-16));  // expand key to 16/24/32 bytes long
        // initialise 1st 8 bytes of counter block with nonce (NIST SP800-38A ?B.2): [0-1] = millisec,
        // [2-3] = random, [4-7] = seconds, together giving full sub-millisec uniqueness up to Feb 2106
        const counterBlock = new Array(blockSize);
        const nonce = (new Date()).getTime();  // timestamp: milliseconds since 1-Jan-1970
        const nonceMs = nonce%1000;
        const nonceSec = Math.floor(nonce/1000);
        const nonceRnd = Math.floor(Math.random()*0xffff);
        // for debugging: nonce = nonceMs = nonceSec = nonceRnd = 0;
        for (var i=0; i<2; i++) counterBlock[i]   = (nonceMs  >>> i*8) & 0xff;
        for (var i=0; i<2; i++) counterBlock[i+2] = (nonceRnd >>> i*8) & 0xff;
        for (var i=0; i<4; i++) counterBlock[i+4] = (nonceSec >>> i*8) & 0xff;
        // and convert it to a string to go on the front of the ciphertext
        var ctrTxt = '';
        for (var i=0; i<8; i++) ctrTxt += String.fromCharCode(counterBlock[i]);
        // generate key schedule - an expansion of the key into distinct Key Rounds for each round
        const keySchedule = Aes.keyExpansion(key);
        const blockCount = Math.ceil(plaintext.length/blockSize);
        var ciphertext = '';
        for (var b=0; b<blockCount; b++) {
            // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
            // done in two stages for 32-bit ops: using two words allows us to go past 2^32 blocks (68GB)
            for (var c=0; c<4; c++) counterBlock[15-c] = (b >>> c*8) & 0xff;
            for (var c=0; c<4; c++) counterBlock[15-c-4] = (b/0x100000000 >>> c*8);
            var cipherCntr = Aes.cipher(counterBlock, keySchedule);  // -- encrypt counter block --
            // block size is reduced on final block
            const blockLength = b<blockCount-1 ? blockSize : (plaintext.length-1)%blockSize+1;
            const cipherChar = new Array(blockLength);
            for (var i=0; i<blockLength; i++) {
                // -- xor plaintext with ciphered counter char-by-char --
                cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b*blockSize+i);
                cipherChar[i] = String.fromCharCode(cipherChar[i]);
            }
            ciphertext += cipherChar.join('');
            // if within web worker, announce progress every 1000 blocks (roughly every 50ms)
            if (typeof WorkerGlobalScope != 'undefined' && self instanceof WorkerGlobalScope) {
                if (b%1000 == 0) self.postMessage({ progress: b/blockCount });
            }
        }
        ciphertext =  AesCtr.base64Encode(ctrTxt+ciphertext);
        return ciphertext;
    },
    /**
     * Decrypt a text encrypted by AES in counter mode of operation
     *
     * @param   {string} ciphertext - Cipher text to be decrypted.
     * @param   {string} password - Password to use to generate a key for decryption.
     * @param   {number} nBits - Number of bits to be used in the key; 128 / 192 / 256.
     * @returns {string} Decrypted text
     *
     * @example
     *   const decr = AesCtr.decrypt('lwGl66VVwVObKIr6of8HVqJr', 'p???????', 256); // 'big secret'
     */
    decrypt : function (ciphertext, password, nBits) {
        const blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
        if (!(nBits==128 || nBits==192 || nBits==256)) throw new Error('Key size is not 128 / 192 / 256');
        ciphertext = AesCtr.base64Decode(String(ciphertext));
        password = AesCtr.utf8Encode(String(password));
        // use AES to encrypt password (mirroring encrypt routine)
        const nBytes = nBits/8;  // no bytes in key
        const pwBytes = new Array(nBytes);
        for (var i=0; i<nBytes; i++) {  // use 1st nBytes chars of password for key
            pwBytes[i] = i<password.length ?  password.charCodeAt(i) : 0;
        }
        var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
        key = key.concat(key.slice(0, nBytes-16));  // expand key to 16/24/32 bytes long
        // recover nonce from 1st 8 bytes of ciphertext
        const counterBlock = new Array(8);
        const ctrTxt = ciphertext.slice(0, 8);
        for (var i=0; i<8; i++) counterBlock[i] = ctrTxt.charCodeAt(i);
        // generate key schedule
        const keySchedule = Aes.keyExpansion(key);
        // separate ciphertext into blocks (skipping past initial 8 bytes)
        const nBlocks = Math.ceil((ciphertext.length-8) / blockSize);
        const ct = new Array(nBlocks);
        for (var b=0; b<nBlocks; b++) ct[b] = ciphertext.slice(8+b*blockSize, 8+b*blockSize+blockSize);
        ciphertext = ct;  // ciphertext is now array of block-length strings
        // plaintext will get generated block-by-block into array of block-length strings
        var plaintext = '';
        for (var b=0; b<nBlocks; b++) {
            // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
            for (var c=0; c<4; c++) counterBlock[15-c] = ((b) >>> c*8) & 0xff;
            for (var c=0; c<4; c++) counterBlock[15-c-4] = (((b+1)/0x100000000-1) >>> c*8) & 0xff;
            var cipherCntr = Aes.cipher(counterBlock, keySchedule);  // encrypt counter block
            var plaintxtByte = new Array(ciphertext[b].length);
            for (var i=0; i<ciphertext[b].length; i++) {
                // -- xor plaintext with ciphered counter byte-by-byte --
                plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
                plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
            }
            plaintext += plaintxtByte.join('');
            // if within web worker, announce progress every 1000 blocks (roughly every 50ms)
            if (typeof WorkerGlobalScope != 'undefined' && self instanceof WorkerGlobalScope) {
                if (b%1000 == 0) self.postMessage({ progress: b/nBlocks });
            }
        }
        plaintext = AesCtr.utf8Decode(plaintext);  // decode from UTF8 back to Unicode multi-byte chars
        return plaintext;
    },
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
    /**
     * Encodes multi-byte string to utf8.
     *
     * Note utf8Encode is an identity function with 7-bit ascii strings, but not with 8-bit strings;
     * utf8Encode('x') = 'x', but utf8Encode('?a') = '??a', and utf8Encode('??a') = '??A?a'.
     */
    utf8Encode : function (str) {

        try {
            return new TextEncoder().encode(str, 'utf-8').reduce(function(prev,curr){ return prev + String.fromCharCode(curr)}, '');
        } catch (e) { // no TextEncoder available?
            return unescape(encodeURIComponent(str)); // monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
        }
    },
    /**
     * Decodes utf8 string to multi-byte.
     */
    utf8Decode : function (str) {

        try {
            return new TextEncoder().decode(str, 'utf-8').reduce(function(prev,curr){return prev + String.fromCharCode(curr)}, '');
        } catch (e) { // no TextEncoder available?
            return decodeURIComponent(escape(str)); // monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
        }
    },
    /*
     * Encodes string as base-64.
     *
     * - developer.mozilla.org/en-US/docs/Web/API/window.btoa, nodejs.org/api/buffer.html
     * - note: btoa & Buffer/binary work on single-byte Unicode (C0/C1), so ok for utf8 strings, not for general Unicode...
     * - note: if btoa()/atob() are not available (eg IE9-), try github.com/davidchambers/Base64.js
     */
    base64Encode : function (str) {
        if (typeof btoa != 'undefined') return btoa(str); // browser
        if (typeof Buffer != 'undefined') return new Buffer(str, 'binary').toString('base64'); // Node.js
        throw new Error('No Base64 Encode');
    },
    /*
     * Decodes base-64 encoded string.
     */
    base64Decode : function (str) {
        if (typeof atob != 'undefined') return atob(str); // browser
        if (typeof Buffer != 'undefined') return new Buffer(str, 'base64').toString('binary'); // Node.js
        throw new Error('No Base64 Decode');
    }
}
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = AesCtr; // ? export default AesCtr


(function(r){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=r()}else if(typeof define==="function"&&define.amd){define([],r)}else{var e;if(typeof window!=="undefined"){e=window}else if(typeof global!=="undefined"){e=global}else if(typeof self!=="undefined"){e=self}else{e=this}e.base64js=r()}})(function(){var r,e,t;return function r(e,t,n){function o(i,a){if(!t[i]){if(!e[i]){var u=typeof require=="function"&&require;if(!a&&u)return u(i,!0);if(f)return f(i,!0);var d=new Error("Cannot find module '"+i+"'");throw d.code="MODULE_NOT_FOUND",d}var c=t[i]={exports:{}};e[i][0].call(c.exports,function(r){var t=e[i][1][r];return o(t?t:r)},c,c.exports,r,e,t,n)}return t[i].exports}var f=typeof require=="function"&&require;for(var i=0;i<n.length;i++)o(n[i]);return o}({"/":[function(r,e,t){"use strict";t.byteLength=c;t.toByteArray=v;t.fromByteArray=s;var n=[];var o=[];var f=typeof Uint8Array!=="undefined"?Uint8Array:Array;var i="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(var a=0,u=i.length;a<u;++a){n[a]=i[a];o[i.charCodeAt(a)]=a}o["-".charCodeAt(0)]=62;o["_".charCodeAt(0)]=63;function d(r){var e=r.length;if(e%4>0){throw new Error("Invalid string. Length must be a multiple of 4")}return r[e-2]==="="?2:r[e-1]==="="?1:0}function c(r){return r.length*3/4-d(r)}function v(r){var e,t,n,i,a,u;var c=r.length;a=d(r);u=new f(c*3/4-a);n=a>0?c-4:c;var v=0;for(e=0,t=0;e<n;e+=4,t+=3){i=o[r.charCodeAt(e)]<<18|o[r.charCodeAt(e+1)]<<12|o[r.charCodeAt(e+2)]<<6|o[r.charCodeAt(e+3)];u[v++]=i>>16&255;u[v++]=i>>8&255;u[v++]=i&255}if(a===2){i=o[r.charCodeAt(e)]<<2|o[r.charCodeAt(e+1)]>>4;u[v++]=i&255}else if(a===1){i=o[r.charCodeAt(e)]<<10|o[r.charCodeAt(e+1)]<<4|o[r.charCodeAt(e+2)]>>2;u[v++]=i>>8&255;u[v++]=i&255}return u}function l(r){return n[r>>18&63]+n[r>>12&63]+n[r>>6&63]+n[r&63]}function h(r,e,t){var n;var o=[];for(var f=e;f<t;f+=3){n=(r[f]<<16)+(r[f+1]<<8)+r[f+2];o.push(l(n))}return o.join("")}function s(r){var e;var t=r.length;var o=t%3;var f="";var i=[];var a=16383;for(var u=0,d=t-o;u<d;u+=a){i.push(h(r,u,u+a>d?d:u+a))}if(o===1){e=r[t-1];f+=n[e>>2];f+=n[e<<4&63];f+="=="}else if(o===2){e=(r[t-2]<<8)+r[t-1];f+=n[e>>10];f+=n[e>>4&63];f+=n[e<<2&63];f+="="}i.push(f);return i.join("")}},{}]},{},[])("/")});

(function(){
    ;((name, definition) => {
        'undefined' != typeof module ? module.exports = definition() :
            'function' == typeof define && 'object' == typeof define.amd ? define(definition) :
                this[name] = definition()
    })('streamSaver', () => {
        'use strict'
        let
            iframe, loaded,
            secure = location.protocol == 'https:' || location.hostname == 'localhost',
            streamSaver = {
                createWriteStream,
                supported: false,
                version: {
                    full: '1.0.0',
                    major: 1, minor: 0, dot: 0
                }
            }

        streamSaver.mitm = 'https://jimmywarting.github.io/StreamSaver.js/mitm.html?version=' +
            streamSaver.version.full

        try {
            // Some browser has it but ain't allowed to construct a stream yet
            streamSaver.supported = 'serviceWorker' in navigator && !!new ReadableStream() && !!new WritableStream()
        } catch(err) {
            // if you are running chrome < 52 then you can enable it
            // `chrome://flags/#enable-experimental-web-platform-features`
        }

        function createWriteStream(filename, queuingStrategy, size) {

            // normalize arguments
            if (Number.isFinite(queuingStrategy))
                [size, queuingStrategy] = [queuingStrategy, size]

            let channel = new MessageChannel,
                popup,
                setupChannel = () => new Promise((resolve, reject) => {
                    channel.port1.onmessage = evt => {
                        if(evt.data.download) {
                            resolve()
                            if(!secure) popup.close() // don't need the popup any longer
                            let link = document.createElement('a')
                            let click = new MouseEvent('click')

                            link.href = evt.data.download
                            link.dispatchEvent(click)
                        }
                    }

                    if(secure && !iframe) {
                        iframe = document.createElement('iframe')
                        iframe.src = streamSaver.mitm
                        iframe.hidden = true
                        document.body.appendChild(iframe)
                    }

                    if(secure && !loaded) {
                        let fn;
                        iframe.addEventListener('load', fn = evt => {
                            loaded = true
                            iframe.removeEventListener('load', fn)
                            iframe.contentWindow.postMessage(
                                {filename, size}, '*', [channel.port2])
                        })
                    }

                    if(secure && loaded) {
                        iframe.contentWindow.postMessage({filename, size}, '*', [channel.port2])
                    }

                    if(!secure) {
                        popup = window.open(streamSaver.mitm, Math.random())
                        let onready = evt => {
                            if(evt.source === popup){
                                popup.postMessage({filename, size}, '*', [channel.port2])
                                removeEventListener('message', onready)
                            }
                        }

                        // Another problem that cross origin don't allow is scripting
                        // so popup.onload() don't work but postMessage still dose
                        // work cross origin
                        addEventListener('message', onready)
                    }
                })

            return new WritableStream({
                start(error) {
                    // is called immediately, and should perform any actions
                    // necessary to acquire access to the underlying sink.
                    // If this process is asynchronous, it can return a promise
                    // to signal success or failure.
                    return setupChannel()
                },
                write(chunk) {
                    // is called when a new chunk of data is ready to be written
                    // to the underlying sink. It can return a promise to signal
                    // success or failure of the write operation. The stream
                    // implementation guarantees that this method will be called
                    // only after previous writes have succeeded, and never after
                    // close or abort is called.

                    // TODO: Kind of important that service worker respond back when
                    // it has been written. Otherwise we can't handle backpressure
                    channel.port1.postMessage(chunk)
                },
                close() {
                    channel.port1.postMessage('end')
                    console.log('All data successfully read!')
                },
                abort(e) {
                    channel.port1.postMessage('abort')
                }
            }, queuingStrategy)
        }

        return streamSaver
    });

})();

(function(){

    var oldDate = new Date();
    var requests = 0;
    var requests_limit = 50;
    var requests_time_period = 1500;
    var defaultReceiveRange = "0-19";
    var xhr_enabled = true;
    var channelKeyRegex = /[\*\/,\\\\\s]+/;

    "use strict";

    var MySecurity =  {

        encrypt : function($plain,$key){
            if(typeof $plain == 'object'){
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
            if(typeof $message == 'object'){
                $message = JSON.stringify($message);
            }
            var $myObj = {};
            $myObj.cipher = this.encrypt($message, $key);
            $myObj.hash = this.hash($message, $key);
            return $myObj;
        },

        hash: (value, key) =>  {
            return CryptoJS.HmacSHA256(value, key).toString(CryptoJS.enc.Hex);
            //return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex)
        },

        decryptAndVerify : function ($cipherMsg, $key){

            try{
                if(typeof $cipherMsg == 'string'){
                    $cipherMsg = JSON.parse($cipherMsg);
                }

                var $message = this.decrypt($cipherMsg.cipher, $key);

                if(this.hash($message, $key) !== $cipherMsg.hash){
                    return false;
                }else{
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
                    salt: enc.encode("messaging-api"),
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
            return btoa(binary);
        }

    }

    function parsefileName(fileNameUrl){
        if(fileNameUrl){
            fileNameUrl = fileNameUrl.replace(/\\/g,'/').replace(/\/$/,'')
            var index = fileNameUrl.length-1
            while(index >=0 && fileNameUrl.charAt(index) != '/'){
                index --;
            }

            return fileNameUrl.substring(index+1);
        }
    }

    function ragneSeperator(range){
        var seperator = '-';
        if(range.indexOf('-') == -1 && range.indexOf(':') != -1){
            seperator = ':';
            range = range.replace(/[^1-9\.:]+/,'');
        }else{
            range = range.replace(/[^1-9\.-]+/,'');
        }

        return seperator;
    }

    function rangeNumber(num){
        num = parseInt(num);
        return(isNaN(num) || !isFinite(num))?Infinity:num;
    }
    function parseRange(range){

        var seperator = ragneSeperator(range);
        var start,change,end;
        if(range.split(seperator).length >= 3){
            start = rangeNumber(range.split(seperator)[0]);
            change = rangeNumber(range.split(seperator)[1]);
            end = rangeNumber(range.split(seperator)[2]);
        }else{
            start = rangeNumber(range.split(seperator)[0]);
            end = rangeNumber(range.split(seperator)[1]);
        }


        if(start > end){
            var temp = start;
            start = end;
            end = temp;
        }

        return {min : start, change : change,max : end};
    }

    function updateRange(range,rangeUpdate){
        var rangeObj = parseRange(range);

        rangeObj.min += rangeUpdate;
        rangeObj.max += rangeUpdate;


        return (isFinite(rangeObj.min)?rangeObj.min:'')+"-"+(isFinite(rangeObj.max)?rangeObj.max:'');
    }

    function guid8() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        var str = '';

        for(var i=0;i<4;i++){
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

        var str = '';

        for(var i=0;i<8;i++){
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

        var xhrHandler = function(){
            var response;

            if(xhr.status == 200){
                response = {status : 'success',data : this.response};
            }else{
                response = {status : 'error',data : this.response};
            }

            typeof obj.callback == 'function' && obj.callback(response);
        }

        var xhr = new XMLHttpRequest();

        xhr.addEventListener('load', xhrHandler);
        xhr.addEventListener('error', function(err){
            var response = {status : 'error', data : this.response};
            typeof obj.callback == 'function' && obj.callback(response);
        });

        xhr.open('get', `${getBaseUrl(obj.base)}public_key.php`, true);

        xhr.send();

    }

    function reset(obj){
        requests = 0;
        xhr_enabled = false;
        setTimeout(function(){
            xhr_enabled = true;
        },5000);
        console.log('Something went wrong, you can try to connect after 5 seconds or you can use channel.onreset function');
    }

    function getBaseUrl(url){
        if(!url || url == null){
            return '';
        }else if(url.endsWith('/')){
            return url;
        }else{
            return url+'/';
        }

    }

    function preparePayload(payload, pubKeyEncryptor){
        if(payload){

            if(typeof payload == 'object'){
                payload = JSON.stringify(payload);
            }else{
                payload = payload.toString();
            }

            if (pubKeyEncryptor)
            {
                var cipher = '';

                for(var i=0;i<payload.length;i+=200){
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

        if(typeof obj.retryChances != 'number'){
            obj.retryChances = 1;
        }

        obj.retryChances--;

        var newDate = new Date();

        if((newDate - oldDate) < requests_time_period){
            requests++;
        }else{
            requests = 0;
            oldDate = new Date();
        }

        if(requests > requests_limit){
            return reset(obj,binData);
        }

        var method = obj.method || 'get';
        method = method.toLowerCase();

        var action = obj.action;

        if(!action || action == null){
            throw new Error("action parameter is required");
        }

        var payload = (obj.payload != null && obj.payload) || undefined;

        var callback = obj.callback;

        var xhr = new XMLHttpRequest();

        var timeout = parseInt(obj.timeout);

        if(!obj.useSyncMode && !isNaN(timeout) && timeout > 0){
            xhr.timeout = timeout;//10 * 60 * 1000
        }

        var handled = false;
        var xhrHandler = function(){
            console.log('xhrHandler()');
            if(handled){
                return;
            }else{
                handled = true;
            }

            if(xhr._dont_use_callback){
                return;
            }

            var response;

            if(xhr.status == 200){
                response = {status : 'success',data : this.response};
                typeof callback == 'function' && callback(response);
            }else{

                if(obj.retryChances <=0){
                    response = {status : 'error',data : this.response};
                    typeof callback == 'function' && callback(response);
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

        var url;

        if(method === 'get' || binData){
            url = `${getBaseUrl(obj.base)}?use-pubkey=${!!obj.pubKeyEncryptor}&action=${action}` + (payload ? `&data=${encodeURIComponent(payload)}` : "") //, !obj.useSyncMode;
            console.log('url is ', url)
            payload = method === 'get'? binData : undefined;
        }else{
            url = `${getBaseUrl(obj.base)}?use-pubkey=${!!obj.pubKeyEncryptor}&action=${action}` //, !obj.useSyncMode;
        }

        xhr.open(method, url);

        if(binData){
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.send(new Uint8Array(binData));
        }else{
            xhr.send(payload);
        }

        return xhr;
    }

    var FileSystem = function FileSystem(channel){
        this.channel = channel;
        this.fileChunkSize  = 200 * 1024; // 200Kbyte chunks
    }

    FileSystem.prototype.list = function(rootDir,callback){

        var _self = this.channel;
        if(!rootDir){
            throw new Error('rootDir object is required');
        }

        if(!_self.readyState || !_self._session_id){
            return typeof callback == 'function' && callback({status : 'error', data : 'The channel is not ready.'});
        }

        var session = _self._session_id;

        var payload = {
            root : rootDir,
            type: 'file-list',
            to : _self._agentName,
            encrypted : false,
            content : '',
            session : session
        };

        console.log('Sending payload : ');
        console.log(payload);

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            method : 'post',
            action : 'event',
            payload : payload,
            //timeout : 10 * 60 * 1000,
            id : _self._channel_id,
            callback : function(e){
                if(e.status === 'success'){
                    e.data = JSON.parse(e.data);
                }

                typeof callback == 'function' && callback(e);

            },
            retryChances : 1
        });
    }

    FileSystem.prototype.getDownloadLink = function(filename){

        var _self = this.channel;

        var payload = preparePayload({
            filename : filename,
            type: 'file-get',
            session : _self._session_id
        },_self._pubKeyEncryptor);

        return `${getBaseUrl(_self._api)}/?use-pubkey=false&action=event&data=${encodeURIComponent(payload)}`;

    }

    FileSystem.prototype.download = function(filename){

        var _self = this.channel;

        if(!filename){
            throw new Error('filename object is required');
        }

        if(!_self.readyState || !_self._session_id){
            throw new Error('The channel is not ready.');
        }

        var a = document.createElement('a');
        a.href = this.getDownloadLink(filename);
        a.download = parsefileName(filename);
        console.log('download from : '+a.href)
        var el = document.body.appendChild(a);
        a.click();
        document.body.removeChild(el);
    }

    FileSystem.prototype.mkdir = function(filename,callback){

        var _self = this.channel;

        if(!filename){
            throw new Error('folder name/path is required');
        }

        if(!_self.readyState || !_self._session_id){
            return typeof callback == 'function' && callback({status : 'error', data : 'The channel is not ready.'});
        }

        var session = _self._session_id;

        var payload = {
            filename : filename,
            type: 'file-mkdir',
            to : _self._agentName,
            encrypted : false,//agents encryption is disabled
            content : '',
            session : session
        };

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor: _self._pubKeyEncryptor,
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

        var _self = this.channel;

        if(!filename){
            throw new Error('file object is required');
        }

        if(!_self.readyState || !_self._session_id){
            return typeof callback == 'function' && callback({status : 'error', data : 'The channel is not ready.'});
        }

        var session = _self._session_id;

        var payload = {
            filename : filename,
            type: 'file-delete',
            to : _self._agentName,
            encrypted : false,//agents encryption is disabled
            content : '',
            session : session
        };

        console.log('Sending payload : ');
        console.log(payload);

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor: _self._pubKeyEncryptor,
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

        var _self = this.channel;

        if(_self._put_xhr){
            var fileSystem = this;
            _self._put_xhr.abort();
            _self._put_xhr_cancel = true;
            var args = arguments;
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
            return typeof callback == 'function' && callback({status : 'error', data : 'The channel is not ready.'});
        }

        var session = _self._session_id;

        var fd = new FileReader();
        var fileSize   = file.size;
        var chunkSize  = this.fileChunkSize;
        var offset = 0;
        var append = false;

        return new Promise(function(resolve,reject){
            read();
            function read(xhrResponse){
                if(_self._put_xhr_cancel){
                    return;
                }
                if(fd.readyState == 1){
                    console.log('File reader is busy, waiting ...');
                    return setTimeout(read,500);
                }
                xhrResponse = xhrResponse || {status : 'success'};
                var res = {done : false,file : file, path : putFileName};

                if (offset >= fileSize) {
                    res.done = true;
                    res.progress = 100;
                    resolve(res)
                    typeof callback == 'function' && callback(res);
                }else{

                    if(xhrResponse.status == 'error'){
                        reject(xhrResponse);
                        return typeof callback == 'function' && callback(xhrResponse);
                    }

                    var subFile = file.slice(offset, offset + chunkSize);

                    fd.onloadend = fd.onloadend || function(evt){

                        var append = offset != 0;
                        var readData,dataLength;
                        if (evt.target.error == null) {
                            readData  = evt.target.result;
                            dataLength = readData.length || readData.byteLength;

                            res.data = {length : dataLength};
                            res.progress = 100 * (offset/fileSize);
                            res.status = 'success';
                            res.progress > 0 && typeof callback == 'function' && callback(res);

                            //update next offset
                            offset += dataLength;

                            var payload = {
                                append : append,
                                filename : putFileName,
                                type: 'file-put',
                                to : _self._agentName,
                                encrypted : false,//agents encryption is disabled
                                content : 'binary',//MySecurity.encryptAndSign(res.data,_self._channel_key),
                                session : session
                            };
                            _self._put_xhr = request({
                                useSyncMode : _self.useSyncMode,
                                base : _self._api,
                                pubKeyEncryptor: _self._pubKeyEncryptor,
                                method : 'post',
                                action : 'event',
                                payload : payload,
                                //timeout : 10 * 60 * 1000,
                                id : _self._channel_id,
                                callback : function(e){
                                    if(_self._put_xhr_cancel || !e || e.status != 'success'){
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
                            return typeof callback == 'function' && callback(res);
                        }
                    }
                    fd.readAsArrayBuffer(subFile);

                }
            }
        });
    }

    var extractApiResponseData  = function(response)
    {
        let responseData = response.data;

        if(typeof responseData != 'object'){
            responseData = JSON.parse(responseData);
        }
        return  responseData.data
    }

    var Channel = function({usePubKey}){

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

        var _self = this;

        if(!_self.readyState){
            throw new Error('Channel is not ready.');
        }

        var session = _self._session_id;

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor: _self._pubKeyEncryptor,
            method : 'post',
            action : 'agent-info',
            payload : {
                session : session,
                agentName : agentName
            },
            //timeout : 10 * 60 * 1000,
            id : _self._channel_id,
            callback : function(response){

                if(response.status === 'success'){

                    var data = extractApiResponseData(response);

                    if(!data){
                        typeof callback == 'function' &&  callback({status : 'error',data : 'Corrupted data!'});
                        return;
                    }

                    if(typeof data != 'object'){
                        data = JSON.parse(data);
                    }

                    typeof callback == 'function' && callback({status : 'success', data: data});
                }else{
                    typeof callback == 'function' && callback(response);
                }
            }
        });

    }

    Channel.prototype.getActiveAgents = function(callback){

        var _self = this;

        if(!_self.readyState){
            throw new Error('Channel is not ready.');
        }

        var session = _self._session_id;

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor : _self._pubKeyEncryptor,
            method : 'post',
            action : 'active-agents',
            payload : {
                session : session
            },
            //timeout : 10 * 60 * 1000,
            id : _self._channel_id,
            callback : function(response){

                if(response.status == 'success'){

                    var data = extractApiResponseData(response);

                    if(!data){
                        typeof callback == 'function' &&  callback({status : 'error',data : 'Corrupted data!'});
                        return;
                    }

                    if(typeof data != 'object'){
                        data = JSON.parse(data);
                    }

                    typeof callback == 'function' && callback({status : 'success', data: data});
                }else{
                    typeof callback == 'function' && callback(response);
                }
            }
        });

    }

    Channel.prototype.connect = function(config){

        var _self = this;
        console.log('_self.readyState = ', _self.readyState)
        if(_self.readyState){
            return _self.dispatchEvent('connect',{response : {status : 'error',data : 'Channel is in ready/connecting state.'}});
        }

        _self.readyState = 'connecting';

        _self._api = config.api || '../';

        if(!_self._last_receive_range || _self._channel_name != config.channelName || _self._channel_key != config.channelKey){
            _self._last_receive_range = defaultReceiveRange;
        }

        _self._channel_name = config.channelName;
        _self._channel_key = config.channelKey;

        if(config.channelKey.search(channelKeyRegex) != -1){
            _self.readyState = false;
            return _self.dispatchEvent('connect',{response : {status : 'error',data : "Channel key shouldn't have any character in (*\\/,) and no space"}});
        }

        _self._agentName = config.user || config.agentName || config.nickName;

        // Gets agent key
        if (!_self._channel_secret)
        {
            MySecurity.deriveChannelSecret(_self._channel_name, _self._channel_key).then(channelSecret => {
                _self.readyState = false;
                _self._channel_secret = channelSecret;
                _self.connect(config);
            });
            return;
        }

        // Gets server's public key if needed
        if(!_self._pubKeyEncryptor && this.usePubKey){
            // public key mode is on
            getPublicKey({
                base : _self._api,
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

        var autoReceive = config.autoReceive;

        request({
            useSyncMode : _self.useSyncMode,
            onreset : _self.onreset,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            base : _self._api,
            method : 'post',
            action : 'connect',
            payload: {
                session: config.sessionId ? config.sessionId : '',
                channelName: _self._channel_name,
                channelPassword: MySecurity.hash(_self._channel_key, _self._channel_secret),
                agentName: _self._agentName,
                agentContext: {agentType: 'WEB-AGENT', descriptor: navigator.userAgent}
            },

            callback : function(response){

                if(response.status == 'success'){

                    var data = extractApiResponseData(response);

                    if(!data){
                        _self.dispatchEvent('connect',{response : {status : 'error',data : 'Corrupted data!'}});
                        return;
                    }

                    if(_self._session_id != data.sessionId){
                        _self._last_receive_range = defaultReceiveRange;
                    }

                    _self._session_id = data.sessionId;
                    _self._channel_id = data.channelId;

                    _self._session_role = data.role;
                    _self.readyState = true;

                    Channel.activeSessions = Channel.activeSessions || {};
                    Channel.activeSessions[_self._session_id] = _self;

                    _self.getActiveAgents(function(agentsRes){
                        var agents = agentsRes.data;

                        _self._connectedAgentsMap = {}
                        for(var i=0; i<agents.length; i++){
                            var s = agents[i];
                            if(typeof s == 'object'){
                                s = s.name || s.agentName || s.agentName;
                            }
                            _self._connectedAgentsMap[s] = true;
                        }

                        _self._updateAgents();
                        _self.dispatchEvent('connect',{response : {status : 'success', data: data}});

                        if(autoReceive){
                            _self.autoReceive = autoReceive;
                            _self.receive(_self._last_receive_range || defaultReceiveRange);
                        }
                    });

                }else{
                    _self.readyState = false;
                    _self.dispatchEvent('connect',{response : response});
                }
            }

        });
    }

    Channel.prototype.disconnect = function(){

        var _self = this;

        if(!_self.readyState){
            return;
        }

        _self.readyState = false;

        if(_self._receive_xhr){
            abortRequest(_self._receive_xhr);
            _self._receive_xhr = null;
        }

        var session = _self._session_id;

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            method : 'post',
            action : 'disconnect',
            payload : {session : session},
            callback : function(response){
                Channel.activeSessions = Channel.activeSessions || {};
                delete  Channel.activeSessions[_self._session_id];
                _self.dispatchEvent('disconnect',{response : response});
            }

        });
    }

    Channel.prototype.getChannelInfo = function(){
        if(this._channel_name && this._channel_name != null && this._channel_key && this._channel_key != null){

            var id = this._channel_id;

            return {name : this._channel_name, id : id};

        }else{
            return null;
        }

    }

    Channel.prototype.getSessionInfo = function(){
        if(this._channel_name && this._channel_name != null && this._channel_key && this._channel_key != null){
            var session = this._session_id || '';

            var tokens = session.split('-');

            //var subtoken = tokens[1];
            //var index = (subtoken && ('agent'+subtoken)) || 'unknown';

            return {id : tokens[0], index : tokens[1] };
        }else{
            return null;
        }

    }

    Channel.prototype.receive =	function (range,autoReceive){

        var _self = this;

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

        var session = _self._session_id;

        //console.log('Receive Request: ');
        //console.log({session : session, range : range });

        _self._receive_xhr = request({
            useSyncMode : _self.useSyncMode,
            onreset : _self.onreset,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            base : _self._api,
            method : 'post',
            action : 'receive',
            payload : {session : session, range : range },
            //timeout : 5 * 60 * 1000,
            callback : function(response){

                delete _self._receive_xhr;

                var rangeUpdate = 0;

                if(response.status == 'error'){
                    _self.dispatchEvent('message', {response : response});
                }else{
                    var data = extractApiResponseData(response);
                    if(!data || data == null){
                        _self.dispatchEvent('message',{response : {status : 'error',data : 'Corrupted Data!'}});
                    }else{

                        if(typeof data != 'object'){
                            data = JSON.parse(data);
                        }

                        var cipherArray = data.events;

                        var dataArray = [];
                        for(var i=0;i<cipherArray.length;i++){
                            var item = cipherArray[i];

                            console.log('item=', item)
                            if(item.encrypted){
                                var plain = MySecurity.decryptAndVerify(item.content, _self._channel_secret);

                                if(!plain || plain == null){
                                    console.log('Some corrupted data item and will be ignored');
                                    item = {};
                                }else{
                                    item.content = plain;
                                    delete item.encrypted;
                                }
                            }

                            dataArray.push(item);

                        }

                        rangeUpdate += data.updateLength;
                        response.data = dataArray;
                        //Connected agent messages are returned only in case there is no new event
                        //these data sent in case of request timeout
                        //this code will map these event to disconnect event
                        //in case some agent is disconnected without notifying the others.
                        if(response.data.length >0 && response.data[0].type == 'connected-agent'){
                            var newAgents = {};

                            for(var i=0;i<response.data.length;i++){
                                newAgents[response.data[i].agent] = true;
                            }

                            response.data = [];

                            for(var activeAgent in _self._connectedAgentsMap){
                                if(!newAgents[activeAgent]){
                                    response.data.push({type : "disconnect", from : activeAgent});
                                }
                            }
                        }

                        //check connection event messages to update
                        //connected agents.
                        for(var i=0;i<response.data.length;i++){
                            var item = response.data[i];
                            if (item.type == 'connect'){
                                _self._connectedAgentsMap[item.from] = true;
                                _self._updateAgents();

                            }else if (item.type == 'disconnect'){
                                delete _self._connectedAgentsMap[item.from];
                                _self._updateAgents();
                            }
                        }

                        _self.dispatchEvent('message',{response : response});
                    }

                    _self._last_receive_range = updateRange(range,rangeUpdate);

                }

                if(_self.autoReceive){

                    var fail_count_limit = 10;
                    var fail_cost_change = 5 * 1000 ;

                    var empty_data_count_limit = 30;
                    var emptyDataTimeoutChange = 500;

                    var additionalTimeout = 0;
                    var emptyCheckFactor = 1;

                    if(_self.autoReceive == true || typeof _self.autoReceive == 'number'){
                        emptyCheckFactor = 0;
                        additionalTimeout = _self.autoReceive == 'number'?_self.autoReceive:1000;
                    }else{
                        _self.autoReceive = _self.autoReceive + '';
                        var rangeObj = parseRange(_self.autoReceive);

                        if(rangeObj.min == Infinity || rangeObj.max == Infinity || rangeObj.min  == rangeObj.max){

                            if(rangeObj.min != Infinity){
                                _self.autoReceive = rangeObj.min;
                            }else if (rangeObj.max != Infinity){
                                _self.autoReceive = rangeObj.max;
                            }else{
                                _self.autoReceive = 5000;
                                console.error('Your auto receive config \''+ _self.autoReceive +
                                    '\' is not valid, default value will be used : '+_self.autoReceive);
                            }
                            emptyCheckFactor = 0;
                            additionalTimeout = _self.autoReceive;
                        }else{
                            emptyDataTimeoutChange = rangeObj.change || emptyDataTimeoutChange;
                            empty_data_count_limit = 1 + (rangeObj.max  - rangeObj.min ) / emptyDataTimeoutChange;
                            additionalTimeout = rangeObj.min;
                        }
                    }

                    if(response.status == 'success'){
                        _self._rcv_failed_count = 0;
                        if(!response.data || response.data.length == 0){
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



                    var timeout = _self._rcv_failed_count * fail_cost_change
                        + (_self._rcv_empty_count - 1) * emptyCheckFactor * emptyDataTimeoutChange
                        + additionalTimeout;

                    //console.log('New timeout : '+timeout);
                    setTimeout(function(){
                        _self.receive(_self._last_receive_range);
                    },parseInt(timeout));

                }
            }

        });

    }

    Channel.prototype.sendMessage = function(config,callback){

        var msg,to,filter,type;

        if(typeof config == 'object'){
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

        var _self = this;

        if(!_self.readyState || !_self._session_id){
            typeof callback == 'function' && callback({status : 'error', data : 'The channel is not ready.'});
            return;
        }

        var session = _self._session_id;

        var payload = {
            type: type || 'chat-text',
            to : (to && RegExp.quote(to)) || filter || '.*',
            encrypted : true,
            content : MySecurity.encryptAndSign(msg,_self._channel_secret),
            session : session
        };

        console.log('Sending payload : ');
        console.log(payload);

        request({
            useSyncMode : _self.useSyncMode,
            base : _self._api,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            method : 'post',
            action : 'event',
            payload : payload,
            //timeout : 10 * 60 * 1000,
            id : _self._channel_id,
            callback : callback,
            retryChances : 3
        });

    }

    Channel.prototype.status = function(callback){
        var _self = this;

        if(!_self.readyState || !_self._session_id){
            typeof callback == 'function' && callback({status : 'error',data : 'The channel is not ready.'});
            return
        }

        //var session = _self._session_id.endsWith("-0")?(_self._session_id.split('-')[0]+"-1"):(_self._session_id.split('-')[0]+"-0");
        var session = _self._session_id;

        request({
            useSyncMode : _self.useSyncMode,
            pubKeyEncryptor:_self._pubKeyEncryptor,
            base : _self._api,
            method : 'post',
            action : 'status',
            payload : {session : session},
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

        var key = guid32().substring(0,this.encodeKeyLength || 10);
        var auth = [this._channel_name,this._channel_key];

        var cipher1 = MySecurity.encrypt(auth,md5(key).substring(0,this.encodeKeyLength || 10));
        var cipher2 = MySecurity.encrypt(cipher1,key);

        var str = /*btoa*/(key + cipher2);

        //eliminating unfriendly character '='
        var c = 0;
        while(str.charAt(str.length-1) == '='){
            c++;
            str = str.substring(0,str.length-1);
        }

        return str+c;

    }

    Channel.prototype.decodeAuth = function(encodedAuth){

        var c = parseInt(encodedAuth.charAt(encodedAuth.length-1));
        var str = encodedAuth.substring(0,encodedAuth.length-1);
        while(c > 0){
            str += '=';
            c--;
        }

        var authInfo = /*atob*/(str);
        var key = authInfo.substring(0,this.encodeKeyLength || 10);
        var cipher2 = authInfo.substring(this.encodeKeyLength || 10);
        var cipher1 = MySecurity.decrypt(cipher2,key);

        var auth = MySecurity.decrypt(cipher1,md5(key).substring(0,this.encodeKeyLength || 10));

        var tokens = JSON.parse(auth);

        return {channelName : tokens[0],channelKey : tokens[1]};

    }
    Channel.prototype._updateAgents = function(){
        this.connectedAgents = Object.keys(this._connectedAgentsMap);
    }

    window.addEventListener("pagehide", function () {
        Channel.activeSessions = Channel.activeSessions || {};
        var activeChannels = [];

        for (var sessionId in Channel.activeSessions) {
            activeChannels.push(Channel.activeSessions[sessionId]);
        }

        for (var i = 0; i < activeChannels.length; i++) {
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
        return (str+'').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
    };
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.lastIndexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position){
            return this.substr(position || 0, searchString.length) === searchString;
        };
    }

    var Eventable = function(obj){
        if(typeof obj != 'object' && typeof obj != 'function' ){
            throw new Error('Object parameter is required');
        }

        var eventable = typeof obj.addEventListener == 'function' && typeof obj.removeEventListener == 'function' && typeof obj.dispatchEvent == 'function';

        if(typeof obj == 'function'){
            obj = obj.prototype;
        }

        if(!eventable){

            obj.addEventListener = function(event,listeners){

                var callbacks = [];
                var eventsMap = (this._eventsMap = (this._eventsMap || {}));

                if(Array.isArray(listeners)){
                    callbacks = listeners;
                }else{
                    callbacks = [listeners];
                }

                for(var i=0;i<callbacks.length;i++){
                    if(typeof callbacks[i] == 'function'){
                        eventsMap[event] = eventsMap[event] || [];
                        eventsMap[event].push(callbacks[i]);
                    }
                }
            }

            obj.removeEventListener = function(event,listeners){

                var callbacks = [];
                var eventsMap = (this._eventsMap = (this._eventsMap || {}));

                if(Array.isArray(listeners)){
                    callbacks = listeners;
                }else{
                    callbacks = [listeners];
                }

                for(var i=0;i<callbacks.length;i++){
                    if(typeof callbacks[i] == 'function'){
                        eventsMap[event] = eventsMap[event] || [];
                        eventsMap[event].splice(eventsMap[event].indexOf(callbacks[i]),1);
                    }
                }
            }

            obj.dispatchEvent = function(event,properties){

                var eventsMap = (this._eventsMap = (this._eventsMap || {}));


                var cancelled = false;
                var e = {
                    type : event,
                    src : this,
                    preventDefault : function(){
                        cancelled = true;
                    }
                }

                if(typeof properties == 'object' && properties != null ){
                    for(var key in properties){
                        if(!e.hasOwnProperty(key)){
                            e[key] = properties[key];
                        }else{
                            throw new Error('Unable to dispatch event '+event+' with property '+key+
                                '. Either the property is duplicate it matches once field of the default event object parameters');
                        }


                    }
                }


                eventsMap[event] = eventsMap[event] || [];
                var callbacks = eventsMap[event];

                var res = false;

                if(typeof this['on'+event] == 'function'){
                    this['on'+event].apply(this,[e]);
                }

                for(var i=0;i<callbacks.length && !cancelled;i++){
                    if(typeof callbacks[i] == 'function'){
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