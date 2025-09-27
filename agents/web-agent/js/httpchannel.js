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
		encryptWithMd5Auth : function ($message,$key){	
			if(typeof $message == 'object'){
				$message = JSON.stringify($message);
			}
			var $myObj = {};
			$myObj.cipher = this.encrypt($message, $key);
			$myObj.md5 = md5($message);
			return $myObj;
		},
		
		decryptWithMd5Auth : function ($cipherMsg,$key){
		
			try{
				if(typeof $cipherMsg == 'string'){
					$cipherMsg = JSON.parse($cipherMsg);
				}
				
				var $message = this.decrypt($cipherMsg.cipher, $key);
				
				if(md5($message) !== $cipherMsg.md5){
					return false;
				}else{
					return $message;
				}
			}catch(err){
				console.log(err);
				return;
			}

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

		xhr.open('get', getBaseUrl(obj.base)+'public_key.php', true);
	
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
	
	function preparePayload(payload,encryptor){
		if(payload && payload!=null){
				
			if(typeof payload == 'object'){	
				payload = JSON.stringify(payload);	
			}else{
				payload = payload.toString();					
			}
			
			var cipher = '';

			for(var i=0;i<payload.length;i+=200){
				cipher += encryptor.encrypt(payload.substring(i,i+200));
			}

			payload = cipher;
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
	
	function request(obj,binData){
		
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

		payload = preparePayload(payload,obj.encryptor);
		
		var url;
		
		if(method == 'get' || binData){
			url =  getBaseUrl(obj.base)+'?action='+action+(payload?('&data='+encodeURIComponent(payload)):""), !obj.useSyncMode;
			payload = method == 'get'?binData:undefined;			
		}else{			
			url = getBaseUrl(obj.base)+'?action='+action, !obj.useSyncMode;
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
			ecrypted : false,
			content : '',
			session : session
		};
		
		console.log('Sending payload : ');
		console.log(payload);
		
		request({
			useSyncMode : _self.useSyncMode,
			base : _self._api,
			encryptor:_self._encryptor,
			method : 'post',
			action : 'event',
			payload : payload,
			//timeout : 10 * 60 * 1000,
			id : _self._channel_id,
			callback : function(e){
				if(e.status == 'success'){					
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
		},_self._encryptor);

		return getBaseUrl(_self._api)+'/?action=event&data='+encodeURIComponent(payload);

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
			ecrypted : false,//users encryption is disabled
			content : '',
			session : session
		};
		
		request({
			useSyncMode : _self.useSyncMode,
			base : _self._api,
			encryptor:_self._encryptor,
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
			ecrypted : false,//users encryption is disabled
			content : '',
			session : session
		};
		
		console.log('Sending payload : ');
		console.log(payload);
		
		request({
			useSyncMode : _self.useSyncMode,
			base : _self._api,
			encryptor:_self._encryptor,
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
								ecrypted : false,//users encryption is disabled
								content : 'binary',//MySecurity.encryptWithMd5Auth(res.data,_self._channel_key),
								session : session
							};
							_self._put_xhr = request({
								useSyncMode : _self.useSyncMode,
								base : _self._api,
								encryptor:_self._encryptor,
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

	var Channel = function(config){

		this._agentName = null;
		this._connectedUsersMap = {};
		this.connectedUsers = [];

		this.fileSystem = new FileSystem(this);

		this.onreset = null;
		this.onconnect = null;
		this.ondisconnect = null;
		this.onmessage = null;
		
	}
	
	Channel.prototype.getUserInfo = function(agentName,callback){
		
		var _self = this;	
			
		if(!_self.readyState){
			throw new Error('Channel is not ready.');
		}
		
		var session = _self._session_id;
		
		request({
			useSyncMode : _self.useSyncMode,
			base : _self._api,
			encryptor:_self._encryptor,
			method : 'post',
			action : 'user-info',
			payload : {
				session : session,
				agentName : agentName
			},
			//timeout : 10 * 60 * 1000,
			id : _self._channel_id,
			callback : function(response){
				
				if(response.status == 'success'){	

					var data =  MySecurity.decryptWithMd5Auth(response.data,md5(_self._channel_key));
					
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
	
	Channel.prototype.getActiveUsers = function(callback){
		
		var _self = this;	
			
		if(!_self.readyState){
			throw new Error('Channel is not ready.');
		}
		
		var session = _self._session_id;
		
		request({
			useSyncMode : _self.useSyncMode,
			base : _self._api,
			encryptor:_self._encryptor,
			method : 'post',
			action : 'active-users',
			payload : {
				session : session
			},
			//timeout : 10 * 60 * 1000,
			id : _self._channel_id,
			callback : function(response){
				
				if(response.status == 'success'){	

					var data =  MySecurity.decryptWithMd5Auth(response.data,md5(_self._channel_key));
					
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
			
		if(_self.readyState){
			return _self.dispatchEvent('connect',{response : {status : 'error',data : 'Channel is in ready/connecting state.'}});
		}
	
		_self.readyState = 'connecting';
		console.log(config)
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
		
		if(!_self._encryptor || _self._encryptor == null){
		
			getPublicKey({
				base : _self._api,
				callback : function(response){
					_self.readyState = false;
					if(response.status == 'error'){						
						_self.dispatchEvent('connect',{response : {status : 'error',data : 'Unable to get the public key'}});
					}else{
						_self._encryptor = new JSEncrypt();
						_self._encryptor.setPublicKey(response.data);
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
			encryptor:_self._encryptor,
			base : _self._api,
			method : 'post',
			action : 'connect',
			payload : {channelName:_self._channel_name,channelPassword:md5(_self._channel_key), agentName : _self._agentName},
			
			callback : function(response){

				if(response.status == 'success'){	

					var data =  MySecurity.decryptWithMd5Auth(response.data,md5(_self._channel_key));
					
					if(!data){
						_self.dispatchEvent('connect',{response : {status : 'error',data : 'Corrupted data!'}});
						return;
					}

					if(typeof data != 'object'){
						data = JSON.parse(data);
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
					
					_self.getActiveUsers(function(usersRes){
						var users = usersRes.data;						
						
						_self._connectedUsersMap = {}
						for(var i=0;i<users.length;i++){
							var s = users[i];
							if(typeof s == 'object'){
								s = s.name || s.agentName || s.agentName;
							}
							_self._connectedUsersMap[s] = true;
						}	
						
						_self._updateUsers();						
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
			encryptor:_self._encryptor,
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
			
			var subtoken = tokens[1];
			var index = (subtoken && ('user'+subtoken)) || 'unknown';
			
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
			encryptor:_self._encryptor,
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
					var data =  MySecurity.decryptWithMd5Auth(response.data,md5(_self._channel_key));
					if(!data || data == null){
						_self.dispatchEvent('message',{response : {status : 'error',data : 'Corrupted Data!'}});
					}else{

						data = JSON.parse(data);
						var cipherArray = data.events;
		
						var dataArray = [];
						for(var i=0;i<cipherArray.length;i++){
							var item = cipherArray[i];
							
							if(item.ecrypted){
								var plain = MySecurity.decryptWithMd5Auth(item.content,_self._channel_key);
								
								if(!plain || plain == null){
									console.log('Some corrupted data item and will be ignored');
									item = {};
								}else{
									item.content = plain;
									delete item.ecrypted;
								}
							}
							
							dataArray.push(item);
							
						}

						rangeUpdate += data.updateLength;
						response.data = dataArray;
						//Connected user messages are returned only in case there is no new event
						//these data sent in case of request timeout
						//this code will map these event to disconnect event
						//in case some user is disconnected without notifying the others.
						if(response.data.length >0 && response.data[0].type == 'connected-user'){
							var newUsers = {};
							
							for(var i=0;i<response.data.length;i++){
								newUsers[response.data[i].user] = true;
							}
							
							response.data = [];
							
							for(var activeUser in _self._connectedUsersMap){
								if(!newUsers[activeUser]){
									response.data.push({type : "disconnect", from : activeUser});
								}
							}				
						}						
						
						//check connection event messages to update
						//connected users.
						for(var i=0;i<response.data.length;i++){
							var item = response.data[i];
							if (item.type == 'connect'){	
								_self._connectedUsersMap[item.from] = true;
								_self._updateUsers();
								
							}else if (item.type == 'disconnect'){
								delete _self._connectedUsersMap[item.from];
								_self._updateUsers();
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
			ecrypted : true,
			content : MySecurity.encryptWithMd5Auth(msg,_self._channel_key),
			session : session
		};
		
		console.log('Sending payload : ');
		console.log(payload);
		
		request({
			useSyncMode : _self.useSyncMode,
			base : _self._api,
			encryptor:_self._encryptor,
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
			encryptor:_self._encryptor,
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
	Channel.prototype._updateUsers = function(){
		this.connectedUsers = Object.keys(this._connectedUsersMap);
	}
	
	window.onunload = function(){
		
		Channel.activeSessions = Channel.activeSessions || {};
		var activeChannels = [];
		for(var sessionId in Channel.activeSessions){
			activeChannels.push(Channel.activeSessions[sessionId]);
		}

		for(var i=0;i<activeChannels.length;i++){
			activeChannels[i].useSyncMode = true;
			try{
				console.log('Disconnecting from '+activeChannels[i]._session_id);
				activeChannels[i].disconnect();
			}catch(err){
				console.log(err);
			}
			
		}
		
	};
	
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