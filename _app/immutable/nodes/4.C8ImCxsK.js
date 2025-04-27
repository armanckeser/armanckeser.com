const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["../chunks/JxUc2qUZ.js","../chunks/B6UTdczH.js","../chunks/6nkcBzSx.js","../chunks/CehCDBBK.js","../chunks/C4LoPZD0.js"])))=>i.map(i=>d[i]);
var ie=t=>{throw TypeError(t)};var se=(t,e,r)=>e.has(t)||ie("Cannot "+r);var Q=(t,e,r)=>(se(t,e,"read from private field"),r?r.call(t):e.get(t)),X=(t,e,r)=>e.has(t)?ie("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,r),$=(t,e,r,a)=>(se(t,e,"write to private field"),a?a.call(t,r):e.set(t,r),r);import{_ as ee}from"../chunks/C1FmrZbK.js";import{H as ye}from"../chunks/CGOn7jmr.js";import{c as ke,i as F,a as x,t as E,x as we,h as Ee,s as q,p as Ie}from"../chunks/B6UTdczH.js";import{l as C,ax as Ae,m as _,O as De,r as Se,u as Me,a1 as Pe,g as te,k as re,s as de,j as N,ay as Te,w as s,i as Oe,o as d,t as i,F as qe,$ as Ce,v as o,D as He}from"../chunks/6nkcBzSx.js";import{d as m,s as w,e as Re,a as Le,f as je,i as ze}from"../chunks/CehCDBBK.js";import{c as Ge}from"../chunks/s0bi8P0R.js";import{s as ce}from"../chunks/PwPRnE0L.js";import{p as Ke}from"../chunks/ylYeeVno.js";import{P as Ve}from"../chunks/DPqGcv7X.js";import{o as le,a as Be}from"../chunks/CSgOOxNZ.js";import{i as Fe,C as Ne,c as Ue}from"../chunks/DxM8daKW.js";import{p}from"../chunks/DGYGYEz2.js";function Ye(t){C(t,t.v+1)}function We(t){let e=0,r=De(0),a;return()=>{Ae()&&(_(r),Se(()=>(e===0&&(a=Me(()=>t(()=>Ye(r)))),e+=1,()=>{Pe().then(()=>{e-=1,e===0&&(a==null||a(),a=void 0)})})))}}const Ze=(t,e,r)=>{const a=t[e];return a?typeof a=="function"?a():Promise.resolve(a):new Promise((I,g)=>{(typeof queueMicrotask=="function"?queueMicrotask:setTimeout)(g.bind(null,new Error("Unknown variable dynamic import: "+e+(e.split("/").length!==r?". Note that variables only represent file names one level deep.":""))))})};function Je(t,e){throw new ye(t,e)}new TextEncoder;const Qe=async({params:t})=>{try{const e=await Ze(Object.assign({"../../../content/writing/better-engineer.svx":()=>ee(()=>import("../chunks/JxUc2qUZ.js").then(r=>r._),__vite__mapDeps([0,1,2,3,4]),import.meta.url),"../../../content/writing/sixth-year.svx":()=>ee(()=>import("../chunks/JxUc2qUZ.js").then(r=>r.a),__vite__mapDeps([0,1,2,3,4]),import.meta.url)}),`../../../content/writing/${t.slug}.svx`,6);return{content:e.default,meta:e.metadata}}catch{throw Je(404,`Writing post "${t.slug}" not found`)}},kt=Object.freeze(Object.defineProperty({__proto__:null,load:Qe},Symbol.toStringTag,{value:"Module"}));function Xe(t,e){te(e,!0);let r=de(!1),a;function I(g){if(_(r))return;const h=g.filter(f=>f.isIntersecting);if(h.length>0){const v=[...h].sort((l,D)=>l.boundingClientRect.y-D.boundingClientRect.y)[0].target.id;v&&window.location.hash!==`#${v}`&&history.replaceState(null,"",`#${v}`)}}le(()=>{const g=new IntersectionObserver(I,{rootMargin:"-100px 0px -66%",threshold:0}),h=document.querySelectorAll("h1, h2, h3, h4, h5, h6");h.forEach(l=>g.observe(l));const f=()=>{C(r,!0),clearTimeout(a),a=setTimeout(()=>{C(r,!1)},500)},v=document.querySelectorAll('a[href^="#"]');v.forEach(l=>{l.addEventListener("click",f)}),Be(()=>{h.forEach(l=>g.unobserve(l)),v.forEach(l=>{l.removeEventListener("click",f)}),clearTimeout(a)})}),re()}var $e=E("<giscus-widget></giscus-widget>",2);function et(t,e){te(e,!1);let r=p(e,"id",8),a=p(e,"host",8,"https://giscus.app"),I=p(e,"repo",8),g=p(e,"repoId",8),h=p(e,"category",8),f=p(e,"categoryId",8),v=p(e,"mapping",8,"pathname"),l=p(e,"term",8),D=p(e,"strict",8,"0"),L=p(e,"reactionsEnabled",8,"1"),j=p(e,"emitMetadata",8,"0"),z=p(e,"inputPosition",8,"bottom"),G=p(e,"theme",8,"light"),U=p(e,"lang",8,"en"),K=p(e,"loading",8,"eager"),S=Te(!1);le(()=>{ee(()=>import("../chunks/1zs_z9NH.js"),[],import.meta.url).then(()=>C(S,!0))}),Fe();var A=ke(),M=N(A);{var P=y=>{var c=$e();s(()=>m(c,"id",r())),s(()=>m(c,"host",a())),s(()=>m(c,"repo",I())),s(()=>m(c,"repoid",g())),s(()=>m(c,"category",h())),s(()=>m(c,"categoryid",f())),s(()=>m(c,"mapping",v())),s(()=>m(c,"term",l())),s(()=>m(c,"strict",D())),s(()=>m(c,"reactionsenabled",L())),s(()=>m(c,"emitmetadata",j())),s(()=>m(c,"inputposition",z())),s(()=>m(c,"theme",G())),s(()=>m(c,"lang",U())),s(()=>m(c,"loading",K())),x(y,c)};F(M,y=>{_(S)&&y(P)})}x(t,A),re()}var H,R;class tt{constructor(e,r){X(this,H);X(this,R);$(this,H,e),$(this,R,We(r))}get current(){return Q(this,R).call(this),Q(this,H).call(this)}}H=new WeakMap,R=new WeakMap;const rt=new tt(()=>window.scrollY,t=>we(window,"scroll",t));var at=E('<meta name="description">'),ot=E(`<!> <link rel="canonical"> <meta property="og:type" content="article"> <meta property="og:title"> <meta property="og:description"> <meta property="og:url"> <meta property="og:site_name" content="Armanc Keser"> <meta property="article:published_time"> <meta property="article:author" content="Armanc Keser"> <style>/* Anchor link styles */
        .anchor-link {
            opacity: 0;
            color: var(--color-accent);
            margin-left: 0.25rem;
            font-size: 0.75em;
            text-decoration: none;
            transition: opacity 0.2s ease;
            cursor: pointer;
        }
        
        h1:hover .anchor-link,
        h2:hover .anchor-link,
        h3:hover .anchor-link,
        h4:hover .anchor-link,
        h5:hover .anchor-link,
        h6:hover .anchor-link {
            opacity: 1;
        }</style>`,1),nt=E('<div class="w-fit"><p class="text-muted-foreground mt-2 text-sm"> </p></div>'),it=E("<span> </span>"),st=E('<span class="text-muted-foreground">TAGS:</span> <div class="flex flex-wrap gap-2"></div>',1),ct=E(`<!> <div class="sticky top-14 z-10 bg-background/80 backdrop-blur border-b border-accent/10"><div class="h-1 bg-accent/5"><div class="h-full bg-gradient-to-r from-transparent to-accent transition-all duration-1" aria-hidden="true"></div></div> <div class="container mx-auto px-4 sm:px-8"><div class="font-mono text-xs text-muted-foreground py-1.5 flex items-center gap-2"><!> <span> </span></div></div></div> <article class="container mx-auto px-4 py-8 md:px-8 md:py-16"><div class="max-w-[85rem] mx-auto flex flex-col lg:flex-row gap-8"><div class="flex-1 max-w-[65ch] lg:max-w-[75ch] xl:max-w-[85ch]"><div class="border-b border-accent/20 pb-4 mb-8"><div class="text-sm text-muted-foreground flex items-center gap-4"><div class="w-fit"><h3 class="text-2xl font-mono font-bold text-primary"> </h3></div></div> <!></div> <div class="prose dark:prose-invert max-w-none prose-lg
                // Base typography
                prose-headings:font-heading prose-headings:tracking-tight
                prose-headings:scroll-mt-24
                prose-strong:text-primary prose-strong:font-semibold
                prose-lead:text-muted-foreground/80
                prose-p:leading-relaxed 
                prose-p:text-muted-foreground

                // Links
                hover:prose-a:text-accent prose-a:transition-colors prose-a:duration-300
                [&amp;_a]:border-b-2 [&amp;_a]:border-accent/30 [&amp;_a:hover]:border-accent
                
                // Exception for anchor links
                [&amp;_.anchor-link]:border-b-0

                // Headings
                [&amp;_h1]:text-3xl [&amp;_h1]:relative [&amp;_h1]:pb-2 [&amp;_h1]:border-b-0
                [&amp;_h1]:scroll-mt-24
                [&amp;_h1]:before:content-[''] [&amp;_h1]:before:absolute [&amp;_h1]:before:-bottom-0.5 
                [&amp;_h1]:before:left-0 [&amp;_h1]:before:w-12 [&amp;_h1]:before:h-px 
                [&amp;_h1]:before:bg-gradient-to-r [&amp;_h1]:before:from-accent [&amp;_h1]:before:to-transparent
                prose-h2:text-2xl prose-h2:border-b prose-h2:border-accent/10 prose-h2:pb-2 prose-h2:mt-10 prose-h2:opacity-90
                prose-h2:scroll-mt-24
                prose-h3:text-xl prose-h3:font-semibold prose-h3:opacity-80
                prose-h3:scroll-mt-24

                // Code blocks
                prose-code:px-1.5 prose-code:py-1 prose-code:rounded prose-code:font-mono 
                prose-code:text-sm prose-code:border prose-code:border-accent/20
                [&amp;_pre]:p-6 [&amp;_pre]:border-2 [&amp;_pre>code]:bg-transparent [&amp;_pre>code]:border-none [&amp;_pre>code]:p-0
                prose-pre:rounded-xl prose-pre:border prose-pre:border-accent/20 
                prose-pre:shadow-sm prose-pre:text-primary prose-pre:bg-background

                // Blockquotes
                prose-blockquote:border-l-4 prose-blockquote:border-accent/40 
                prose-blockquote:pl-4 prose-blockquote:bg-gradient-to-b 
                prose-blockquote:from-background/5

                // Images
                prose-img:rounded-xl prose-img:border prose-img:border-accent/20"><!></div> <div class="font-mono text-sm border-t border-accent/20 pt-4 mt-8"><div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2"><span class="text-muted-foreground">LAST_MODIFIED:</span> <span> </span> <!></div></div> <!></div> <div class="lg:w-64 sticky top-[7.5rem] h-fit"><!></div></div></article>`,1);function wt(t,e){te(e,!0);let r=de(0);Oe(()=>{const n=document.documentElement.scrollHeight-window.innerHeight;n>0&&C(r,Ie(Math.round((rt.current||0)/n*100)))});const a=n=>new Date(n).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}),I=n=>Ue("font-mono text-xs px-1.5 py-0.5 rounded","bg-accent/10 text-accent"),g=He(()=>`-writing-${Ke.params.slug}`);var h=ct();Ee(n=>{var u=ot(),b=N(u);{var T=J=>{var ne=at();s(()=>w(ne,"content",e.data.meta.description)),x(J,ne)};F(b,J=>{e.data.meta.description&&J(T)})}var O=d(b,2),k=d(O,4),V=d(k,2),B=d(V,2),xe=d(B,4);qe(4),s(()=>{Ce.title=e.data.meta.title?`${e.data.meta.title} - Armanc Keser`:"Blog - Armanc Keser",w(O,"href",e.data.meta.slug),w(k,"content",e.data.meta.title),w(V,"content",e.data.meta.description),w(B,"content",e.data.meta.slug),w(xe,"content",e.data.meta.date)}),x(n,u)});var f=N(h);Xe(f,{});var v=d(f,2),l=i(v),D=i(l);o(l);var L=d(l,2),j=i(L),z=i(j);Ne(z,{class:"h-3 w-3"});var G=d(z,2),U=i(G);o(G),o(j),o(L),o(v);var K=d(v,2),S=i(K),A=i(S),M=i(A),P=i(M),y=i(P),c=i(y),me=i(c,!0);o(c),o(y),o(P);var pe=d(P,2);{var ve=n=>{var u=nt(),b=i(u),T=i(b,!0);o(b),o(u),s(()=>{ce(u,"view-transition-name",`desc-${_(g)??""}`),q(T,e.data.meta.description)}),x(n,u)};F(pe,n=>{e.data.meta.description&&n(ve)})}o(M);var Y=d(M,2),ue=i(Y);Ge(ue,()=>e.data.content,(n,u)=>{u(n,{})}),o(Y);var W=d(Y,2),ae=i(W),Z=d(i(ae),2),ge=i(Z,!0);o(Z);var he=d(Z,2);{var fe=n=>{var u=st(),b=d(N(u),2);Re(b,21,()=>e.data.meta.tags,ze,(T,O)=>{var k=it(),V=i(k);o(k),s(B=>{Le(k,je(B)),q(V,`#${_(O)??""}`)},[()=>I(_(O))]),x(T,k)}),o(b),x(n,u)};F(he,n=>{e.data.meta.tags&&n(fe)})}o(ae),o(W);var _e=d(W,2);et(_e,{repo:"armanckeser/armanckeser.com",repoId:"R_kgDOMS8yoA",category:"General",categoryId:"DIC_kwDOMS8yoM4CpgZA",mapping:"pathname",strict:"0",reactionsEnabled:"1",emitMetadata:"0",inputPosition:"bottom",theme:"noborder_dark",lang:"en",loading:"lazy"}),o(A);var oe=d(A,2),be=i(oe);Ve(be,{}),o(oe),o(S),o(K),s(n=>{w(D,"style",`width: ${_(r)??""}%`),q(U,`READING [${_(r)??""}%]`),ce(y,"view-transition-name",`title-${_(g)??""}`),q(me,e.data.meta.title),q(ge,n)},[()=>a(e.data.meta.date)]),x(t,h),re()}export{wt as component,kt as universal};
