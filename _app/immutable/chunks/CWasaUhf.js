var Ln=Array.isArray,zt=Array.prototype.indexOf,Mn=Array.from,qn=Object.defineProperty,vt=Object.getOwnPropertyDescriptor,Jt=Object.getOwnPropertyDescriptors,Yn=Object.prototype,Hn=Array.prototype,Wt=Object.getPrototypeOf;function jn(t){return typeof t=="function"}const Bn=()=>{};function Un(t){return t()}function Xt(t){for(var n=0;n<t.length;n++)t[n]()}const g=2,yt=4,X=8,ot=16,O=32,j=64,G=128,y=256,K=512,v=1024,N=2048,L=4096,b=8192,Q=16384,Qt=32768,Tt=65536,Vn=1<<17,tn=1<<19,gt=1<<20,pt=Symbol("$state"),Gn=Symbol("legacy props"),Kn=Symbol("");function mt(t){return t===this.v}function nn(t,n){return t!=t?n==n:t!==n||t!==null&&typeof t=="object"||typeof t=="function"}function At(t){return!nn(t,this.v)}function rn(t){throw new Error("https://svelte.dev/e/effect_in_teardown")}function en(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function an(t){throw new Error("https://svelte.dev/e/effect_orphan")}function sn(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function $n(){throw new Error("https://svelte.dev/e/hydration_failed")}function Zn(t){throw new Error("https://svelte.dev/e/props_invalid_value")}function zn(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function Jn(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function ln(){throw new Error("https://svelte.dev/e/state_unsafe_local_read")}function un(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}let tt=!1;function Wn(){tt=!0}const Xn=1,Qn=2,tr=4,nr=8,rr=16,er=1,ar=2,sr=4,lr=8,ur=16,or=1,fr=2,ir=4,_r=1,cr=2,on="[",fn="[!",_n="]",It={},vr=Symbol(),pr="http://www.w3.org/2000/svg";function St(t){console.warn("https://svelte.dev/e/hydration_mismatch")}let f=null;function ht(t){f=t}function hr(t,n=!1,r){f={p:f,c:null,e:null,m:!1,s:t,x:null,l:null},tt&&!n&&(f.l={s:null,u:null,r1:[],r2:ft(!1)})}function dr(t){const n=f;if(n!==null){const l=n.e;if(l!==null){var r=o,e=u;n.e=null;try{for(var a=0;a<l.length;a++){var s=l[a];z(s.effect),Z(s.reaction),Pt(s.fn)}}finally{z(r),Z(e)}}f=n.p,n.m=!0}return{}}function nt(){return!tt||f!==null&&f.l===null}function ft(t,n){var r={f:0,v:t,reactions:null,equals:mt,rv:0,wv:0};return r}function Er(t){return cn(ft(t))}function wr(t,n=!1){var e;const r=ft(t);return n||(r.equals=At),tt&&f!==null&&f.l!==null&&((e=f.l).s??(e.s=[])).push(r),r}function cn(t){return u!==null&&!T&&u.f&g&&(A===null?Rn([t]):A.push(t)),t}function vn(t,n){return u!==null&&!T&&nt()&&u.f&(g|ot)&&(A===null||!A.includes(t))&&un(),pn(t,n)}function pn(t,n){return t.equals(n)||(t.v,t.v=n,t.wv=Bt(),Ot(t,N),nt()&&o!==null&&o.f&v&&!(o.f&(O|j))&&(S===null?Nn([t]):S.push(t))),n}function yr(t,n=1){var r=Zt(t),e=n===1?r++:r--;return vn(t,r),e}function Ot(t,n){var r=t.reactions;if(r!==null)for(var e=nt(),a=r.length,s=0;s<a;s++){var l=r[s],i=l.f;i&N||!e&&l===o||(I(l,n),i&(v|y)&&(i&g?Ot(l,L):et(l)))}}let D=!1;function Tr(t){D=t}let m;function q(t){if(t===null)throw St(),It;return m=t}function gr(){return q(C(m))}function mr(t){if(D){if(C(m)!==null)throw St(),It;m=t}}function Ar(t=1){if(D){for(var n=t,r=m;n--;)r=C(r);m=r}}function Ir(){for(var t=0,n=m;;){if(n.nodeType===8){var r=n.data;if(r===_n){if(t===0)return n;t-=1}else(r===on||r===fn)&&(t+=1)}var e=C(n);n.remove(),n=e}}var dt,hn,dn,Rt,Nt;function Sr(){if(dt===void 0){dt=window,hn=document,dn=/Firefox/.test(navigator.userAgent);var t=Element.prototype,n=Node.prototype;Rt=vt(n,"firstChild").get,Nt=vt(n,"nextSibling").get,t.__click=void 0,t.__className="",t.__attributes=null,t.__styles=null,t.__e=void 0,Text.prototype.__t=void 0}}function at(t=""){return document.createTextNode(t)}function st(t){return Rt.call(t)}function C(t){return Nt.call(t)}function Or(t,n){if(!D)return st(t);var r=st(m);if(r===null)r=m.appendChild(at());else if(n&&r.nodeType!==3){var e=at();return r==null||r.before(e),q(e),e}return q(r),r}function Rr(t,n){if(!D){var r=st(t);return r instanceof Comment&&r.data===""?C(r):r}return m}function Nr(t,n=1,r=!1){let e=D?m:t;for(var a;n--;)a=e,e=C(e);if(!D)return e;var s=e==null?void 0:e.nodeType;if(r&&s!==3){var l=at();return e===null?a==null||a.after(l):e.before(l),q(l),l}return q(e),e}function xr(t){t.textContent=""}function xt(t){var n=g|N,r=u!==null&&u.f&g?u:null;return o===null||r!==null&&r.f&y?n|=y:o.f|=gt,{ctx:f,deps:null,effects:null,equals:mt,f:n,fn:t,reactions:null,rv:0,v:null,wv:0,parent:r??o}}function Dr(t){const n=xt(t);return n.equals=At,n}function Dt(t){var n=t.effects;if(n!==null){t.effects=null;for(var r=0;r<n.length;r+=1)k(n[r])}}function En(t){for(var n=t.parent;n!==null;){if(!(n.f&g))return n;n=n.parent}return null}function wn(t){var n,r=o;z(En(t));try{Dt(t),n=Vt(t)}finally{z(r)}return n}function kt(t){var n=wn(t),r=(R||t.f&y)&&t.deps!==null?L:v;I(t,r),t.equals(n)||(t.v=n,t.wv=Bt())}function Ct(t){o===null&&u===null&&an(),u!==null&&u.f&y&&o===null&&en(),it&&rn()}function yn(t,n){var r=n.last;r===null?n.last=n.first=t:(r.next=t,t.prev=r,n.last=t)}function M(t,n,r,e=!0){var a=(t&j)!==0,s=o,l={ctx:f,deps:null,nodes_start:null,nodes_end:null,f:t|N,first:null,fn:n,last:null,next:null,parent:a?null:s,prev:null,teardown:null,transitions:null,wv:0};if(r){var i=P;try{Et(!0),_t(l),l.f|=Qt}catch(p){throw k(l),p}finally{Et(i)}}else n!==null&&et(l);var w=r&&l.deps===null&&l.first===null&&l.nodes_start===null&&l.teardown===null&&(l.f&(gt|G))===0;if(!w&&!a&&e&&(s!==null&&yn(l,s),u!==null&&u.f&g)){var _=u;(_.effects??(_.effects=[])).push(l)}return l}function kr(){return u!==null&&!T}function Cr(t){const n=M(X,null,!1);return I(n,v),n.teardown=t,n}function Pr(t){Ct();var n=o!==null&&(o.f&O)!==0&&f!==null&&!f.m;if(n){var r=f;(r.e??(r.e=[])).push({fn:t,effect:o,reaction:u})}else{var e=Pt(t);return e}}function Fr(t){return Ct(),Tn(t)}function br(t){const n=M(j,t,!0);return(r={})=>new Promise(e=>{r.outro?An(n,()=>{k(n),e(void 0)}):(k(n),e(void 0))})}function Pt(t){return M(yt,t,!1)}function Tn(t){return M(X,t,!0)}function Lr(t,n=[],r=xt){const e=n.map(r);return gn(()=>t(...e.map(Zt)))}function gn(t,n=0){return M(X|ot|n,t,!0)}function Mr(t,n=!0){return M(X|O,t,!0,n)}function Ft(t){var n=t.teardown;if(n!==null){const r=it,e=u;wt(!0),Z(null);try{n.call(null)}finally{wt(r),Z(e)}}}function bt(t,n=!1){var r=t.first;for(t.first=t.last=null;r!==null;){var e=r.next;k(r,n),r=e}}function mn(t){for(var n=t.first;n!==null;){var r=n.next;n.f&O||k(n),n=r}}function k(t,n=!0){var r=!1;if((n||t.f&tn)&&t.nodes_start!==null){for(var e=t.nodes_start,a=t.nodes_end;e!==null;){var s=e===a?null:C(e);e.remove(),e=s}r=!0}bt(t,n&&!r),W(t,0),I(t,Q);var l=t.transitions;if(l!==null)for(const w of l)w.stop();Ft(t);var i=t.parent;i!==null&&i.first!==null&&Lt(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes_start=t.nodes_end=null}function Lt(t){var n=t.parent,r=t.prev,e=t.next;r!==null&&(r.next=e),e!==null&&(e.prev=r),n!==null&&(n.first===t&&(n.first=e),n.last===t&&(n.last=r))}function An(t,n){var r=[];Mt(t,r,!0),In(r,()=>{k(t),n&&n()})}function In(t,n){var r=t.length;if(r>0){var e=()=>--r||n();for(var a of t)a.out(e)}else n()}function Mt(t,n,r){if(!(t.f&b)){if(t.f^=b,t.transitions!==null)for(const l of t.transitions)(l.is_global||r)&&n.push(l);for(var e=t.first;e!==null;){var a=e.next,s=(e.f&Tt)!==0||(e.f&O)!==0;Mt(e,n,s?r:!1),e=a}}}function qr(t){qt(t,!0)}function qt(t,n){if(t.f&b){t.f^=b,t.f&v||(t.f^=v),B(t)&&(I(t,N),et(t));for(var r=t.first;r!==null;){var e=r.next,a=(r.f&Tt)!==0||(r.f&O)!==0;qt(r,a?n:!1),r=e}if(t.transitions!==null)for(const s of t.transitions)(s.is_global||n)&&s.in()}}let $=!1,lt=[];function Yt(){$=!1;const t=lt.slice();lt=[],Xt(t)}function Yr(t){$||($=!0,queueMicrotask(Yt)),lt.push(t)}function Sn(){$&&Yt()}const Ht=0,On=1;let U=!1,V=Ht,Y=!1,H=null,P=!1,it=!1;function Et(t){P=t}function wt(t){it=t}let x=[],F=0;let u=null,T=!1;function Z(t){u=t}let o=null;function z(t){o=t}let A=null;function Rn(t){A=t}let c=null,E=0,S=null;function Nn(t){S=t}let jt=1,J=0,R=!1;function Bt(){return++jt}function B(t){var h;var n=t.f;if(n&N)return!0;if(n&L){var r=t.deps,e=(n&y)!==0;if(r!==null){var a,s,l=(n&K)!==0,i=e&&o!==null&&!R,w=r.length;if(l||i){var _=t,p=_.parent;for(a=0;a<w;a++)s=r[a],(l||!((h=s==null?void 0:s.reactions)!=null&&h.includes(_)))&&(s.reactions??(s.reactions=[])).push(_);l&&(_.f^=K),i&&p!==null&&!(p.f&y)&&(_.f^=y)}for(a=0;a<w;a++)if(s=r[a],B(s)&&kt(s),s.wv>t.wv)return!0}(!e||o!==null&&!R)&&I(t,v)}return!1}function xn(t,n){for(var r=n;r!==null;){if(r.f&G)try{r.fn(t);return}catch{r.f^=G}r=r.parent}throw U=!1,t}function Dn(t){return(t.f&Q)===0&&(t.parent===null||(t.parent.f&G)===0)}function rt(t,n,r,e){if(U){if(r===null&&(U=!1),Dn(n))throw t;return}r!==null&&(U=!0);{xn(t,n);return}}function Ut(t,n,r=!0){var e=t.reactions;if(e!==null)for(var a=0;a<e.length;a++){var s=e[a];s.f&g?Ut(s,n,!1):n===s&&(r?I(s,N):s.f&v&&I(s,L),et(s))}}function Vt(t){var ct;var n=c,r=E,e=S,a=u,s=R,l=A,i=f,w=T,_=t.f;c=null,E=0,S=null,u=_&(O|j)?null:t,R=(_&y)!==0&&(!P||a===null||w),A=null,ht(t.ctx),T=!1,J++;try{var p=(0,t.fn)(),h=t.deps;if(c!==null){var d;if(W(t,E),h!==null&&E>0)for(h.length=E+c.length,d=0;d<c.length;d++)h[E+d]=c[d];else t.deps=h=c;if(!R)for(d=E;d<h.length;d++)((ct=h[d]).reactions??(ct.reactions=[])).push(t)}else h!==null&&E<h.length&&(W(t,E),h.length=E);if(nt()&&S!==null&&!T&&h!==null&&!(t.f&(g|L|N)))for(d=0;d<S.length;d++)Ut(S[d],t);return a!==null&&J++,p}finally{c=n,E=r,S=e,u=a,R=s,A=l,ht(i),T=w}}function kn(t,n){let r=n.reactions;if(r!==null){var e=zt.call(r,t);if(e!==-1){var a=r.length-1;a===0?r=n.reactions=null:(r[e]=r[a],r.pop())}}r===null&&n.f&g&&(c===null||!c.includes(n))&&(I(n,L),n.f&(y|K)||(n.f^=K),Dt(n),W(n,0))}function W(t,n){var r=t.deps;if(r!==null)for(var e=n;e<r.length;e++)kn(t,r[e])}function _t(t){var n=t.f;if(!(n&Q)){I(t,v);var r=o,e=f;o=t;try{n&ot?mn(t):bt(t),Ft(t);var a=Vt(t);t.teardown=typeof a=="function"?a:null,t.wv=jt;var s=t.deps,l}catch(i){rt(i,t,r,e||t.ctx)}finally{o=r}}}function Gt(){if(F>1e3){F=0;try{sn()}catch(t){if(H!==null)rt(t,H,null);else throw t}}F++}function Kt(t){var n=t.length;if(n!==0){Gt();var r=P;P=!0;try{for(var e=0;e<n;e++){var a=t[e];a.f&v||(a.f^=v);var s=Fn(a);Cn(s)}}finally{P=r}}}function Cn(t){var n=t.length;if(n!==0)for(var r=0;r<n;r++){var e=t[r];if(!(e.f&(Q|b)))try{B(e)&&(_t(e),e.deps===null&&e.first===null&&e.nodes_start===null&&(e.teardown===null?Lt(e):e.fn=null))}catch(a){rt(a,e,null,e.ctx)}}}function Pn(){if(Y=!1,F>1001)return;const t=x;x=[],Kt(t),Y||(F=0,H=null)}function et(t){V===Ht&&(Y||(Y=!0,queueMicrotask(Pn))),H=t;for(var n=t;n.parent!==null;){n=n.parent;var r=n.f;if(r&(j|O)){if(!(r&v))return;n.f^=v}}x.push(n)}function Fn(t){var n=[],r=t.first;t:for(;r!==null;){var e=r.f,a=(e&O)!==0,s=a&&(e&v)!==0,l=r.next;if(!s&&!(e&b)){if(e&yt)n.push(r);else if(a)r.f^=v;else{var i=u;try{u=r,B(r)&&_t(r)}catch(p){rt(p,r,null,r.ctx)}finally{u=i}}var w=r.first;if(w!==null){r=w;continue}}if(l===null){let p=r.parent;for(;p!==null;){if(t===p)break t;var _=p.next;if(_!==null){r=_;continue t}p=p.parent}}r=l}return n}function $t(t){var n=V,r=x;try{Gt();const a=[];V=On,x=a,Y=!1,Kt(r);var e=t==null?void 0:t();return Sn(),(x.length>0||a.length>0)&&$t(),F=0,H=null,e}finally{V=n,x=r}}async function Hr(){await Promise.resolve(),$t()}function Zt(t){var n=t.f,r=(n&g)!==0;if(u!==null&&!T){A!==null&&A.includes(t)&&ln();var e=u.deps;t.rv<J&&(t.rv=J,c===null&&e!==null&&e[E]===t?E++:c===null?c=[t]:(!R||!c.includes(t))&&c.push(t))}else if(r&&t.deps===null&&t.effects===null){var a=t,s=a.parent;s!==null&&!(s.f&y)&&(a.f^=y)}return r&&(a=t,B(a)&&kt(a)),t.v}function jr(t){var n=T;try{return T=!0,t()}finally{T=n}}const bn=-7169;function I(t,n){t.f=t.f&bn|n}function Br(t){if(!(typeof t!="object"||!t||t instanceof EventTarget)){if(pt in t)ut(t);else if(!Array.isArray(t))for(let n in t){const r=t[n];typeof r=="object"&&r&&pt in r&&ut(r)}}}function ut(t,n=new Set){if(typeof t=="object"&&t!==null&&!(t instanceof EventTarget)&&!n.has(t)){n.add(t),t instanceof Date&&t.getTime();for(let e in t)try{ut(t[e],n)}catch{}const r=Wt(t);if(r!==Object.prototype&&r!==Array.prototype&&r!==Map.prototype&&r!==Set.prototype&&r!==Date.prototype){const e=Jt(r);for(let a in e){const s=e[a].get;if(s)try{s.call(t)}catch{}}}}}export{hn as $,qr as A,xt as B,Ar as C,Pr as D,Tt as E,f as F,tt as G,vt as H,Zn as I,At as J,vn as K,Vn as L,ft as M,pr as N,lr as O,sr as P,Gn as Q,ar as R,pt as S,er as T,wr as U,yr as V,jn as W,ur as X,Fr as Y,Xt as Z,Un as _,Mr as a,Br as a0,Er as a1,$t as a2,qn as a3,Hr as a4,ot as a5,Qt as a6,ir as a7,or as a8,fr as a9,Jn as aA,vr as aB,zn as aC,Cr as aD,tn as aE,on as aF,dn as aG,_r as aH,cr as aI,Sr as aJ,It as aK,St as aL,$n as aM,br as aN,nn as aO,Z as aa,z as ab,u as ac,tr as ad,fn as ae,Ir as af,_n as ag,b as ah,Mn as ai,Xn as aj,pn as ak,Qn as al,Ln as am,nr as an,Mt as ao,xr as ap,In as aq,rr as ar,C as as,Wt as at,Kn as au,Jt as av,Wn as aw,kr as ax,Yn as ay,Hn as az,gn as b,m as c,k as d,Pt as e,Rr as f,dr as g,D as h,Or as i,mr as j,Zt as k,Dr as l,gr as m,Bn as n,st as o,hr as p,Yr as q,Tn as r,Nr as s,Lr as t,jr as u,at as v,Tr as w,q as x,o as y,An as z};
