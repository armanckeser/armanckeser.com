import{g as _t}from"../chunks/Dj14CVIh.js";import{c as ht,t as v,i as z,s as m,a as d,h as bt}from"../chunks/BtDHiD8b.js";import{g as rt,i as Y,t as k,N as yt,m as s,B as K,k as a,l as e,s as i,j as it,C as st,$ as wt}from"../chunks/D-GudfH0.js";import{b as kt,a as Z,s as E,e as $,i as tt}from"../chunks/CdeBztw9.js";import{e as Pt}from"../chunks/BV69YLx6.js";import{s as D}from"../chunks/PwPRnE0L.js";import{p as St}from"../chunks/Cn3rMp7d.js";import{g as jt}from"../chunks/CBIqleEN.js";import{s as Ct}from"../chunks/Bvun-cop.js";const Dt=async({fetch:P})=>{const[t,o]=await Promise.all([_t(),P("/api/projects").then(c=>c.json())]);return{posts:t.sort((c,x)=>new Date(x.date).getTime()-new Date(c.date).getTime()),projects:o}},te=Object.freeze(Object.defineProperty({__proto__:null,load:Dt},Symbol.toStringTag,{value:"Module"}));var At=v('<time class="font-mono text-[0.65rem] text-muted-foreground relative z-10"> </time>'),zt=v('<div class="flex items-center gap-1 text-xs text-muted-foreground"><span class="text-accent">★</span> <span> </span></div>'),Et=v('<time class="font-mono text-xs text-muted-foreground"> </time>'),It=v('<div class="flex items-center gap-1 font-mono text-xs text-muted-foreground"><span class="text-accent">★</span> <span> </span></div>'),Lt=v('<div class="absolute bottom-2 right-4 font-mono text-xs text-accent opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">→</div>'),Tt=v('<div class="flex md:hidden h-full flex-col"><div class="flex-1 space-y-1.5"><div class="flex items-center justify-between gap-1.5 -mt-2 -ml-1.5"><div> </div> <div class="flex items-center gap-1"><!> <!></div></div> <div><h3 class="line-clamp-1 font-mono text-sm font-medium text-primary"> </h3></div> <div><p class="line-clamp-2 text-xs leading-snug text-muted-foreground"> </p></div></div></div> <div class="hidden md:flex p-3"><div><div class="mb-3 flex items-center gap-3"><div> </div> <!> <!></div> <div><h3 class="mb-2 font-mono text-base font-medium text-primary md:text-lg"> </h3></div> <div><p class="text-xs leading-relaxed text-muted-foreground md:text-sm"> </p></div></div> <!></div>',1);function et(P,t){rt(t,!0);const o=St(t,"tag",3,"blog"),u=jt(o()),c=K(()=>t.href?"a":"div"),x=K(()=>t.href?{href:t.href,class:"block"}:{}),l=K(()=>t.href?`-writing-${t.href.split("/").pop()}`:t.title.toLowerCase().replace(/[^a-z0-9]+/g,"-"));var _=ht(),y=Y(_);Pt(y,()=>s(c),!1,(g,I)=>{let w;k(()=>w=kt(g,w,{...s(x),class:"glass-card hover:sharp-shadow-md group relative flex md:h-[180px] w-full flex-col justify-between overflow-hidden rounded-lg border border-border/40 bg-white/5 dark:bg-black/5 p-3 transition-all duration-300 hover:border-accent/20"},void 0,g.namespaceURI===yt,g.nodeName.includes("-")));var C=Tt(),h=Y(C),L=a(h),b=a(L),S=a(b);Z(S,`rounded px-1.5 py-0.5 font-mono text-[0.65rem] ${u} relative z-10`);var f=a(S,!0);e(S);var T=i(S,2),p=a(T);{var N=n=>{var r=At(),j=a(r,!0);e(r),k(A=>{E(r,"datetime",t.date),D(r,"view-transition-name",`date-${s(l)??""}`),m(j,A)},[()=>new Date(t.date).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})]),d(n,r)};z(p,n=>{t.date&&n(N)})}var nt=i(p,2);{var ot=n=>{var r=zt(),j=i(a(r),2),A=a(j,!0);e(j),e(r),k(()=>m(A,t.stars)),d(n,r)};z(nt,n=>{t.stars&&t.stars>0&&n(ot)})}e(T),e(b);var M=i(b,2),F=a(M),dt=a(F,!0);e(F),e(M);var B=i(M,2),H=a(B),lt=a(H,!0);e(H),e(B),e(L),e(h);var J=i(h,2),G=a(J),R=a(G),U=a(R);Z(U,`rounded px-2 py-0.5 font-mono text-xs ${u}`);var vt=a(U,!0);e(U);var Q=i(U,2);{var ct=n=>{var r=Et(),j=a(r,!0);e(r),k(A=>{E(r,"datetime",t.date),D(r,"view-transition-name",`date-${s(l)??""}`),m(j,A)},[()=>new Date(t.date).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})]),d(n,r)};z(Q,n=>{t.date&&n(ct)})}var mt=i(Q,2);{var xt=n=>{var r=It(),j=i(a(r),2),A=a(j,!0);e(j),e(r),k(()=>m(A,t.stars)),d(n,r)};z(mt,n=>{t.stars&&t.stars>0&&n(xt)})}e(R);var O=i(R,2),W=a(O),ut=a(W,!0);e(W),e(O);var V=i(O,2),X=a(V),gt=a(X,!0);e(X),e(V),e(G);var ft=i(G,2);{var pt=n=>{var r=Lt();d(n,r)};z(ft,n=>{t.href&&n(pt)})}e(J),k(()=>{D(S,"view-transition-name",`tag-${s(l)??""}`),m(f,o()),D(M,"view-transition-name",`title-${s(l)??""}`),m(dt,t.title),D(B,"view-transition-name",`desc-${s(l)??""}`),m(lt,t.description),D(U,"view-transition-name",`tag-${s(l)??""}`),m(vt,o()),D(O,"view-transition-name",`title-${s(l)??""}`),m(ut,t.title),D(V,"view-transition-name",`desc-${s(l)??""}`),m(gt,t.description)}),d(I,C)}),d(P,_),it()}var Nt=v('<p class="font-mono text-sm text-muted-foreground dark:text-muted-foreground md:text-base"> </p>'),Ut=v('<section class="relative w-full space-y-6"><div class="space-y-3"><div class="flex items-center gap-3"><div class="h-px w-12 bg-accent/20 dark:bg-accent/10 md:w-16"></div> <h2 class="font-mono text-xl font-medium tracking-tight text-primary dark:text-primary md:text-2xl"> </h2></div> <!></div> <div class="w-full"><!></div></section>');function at(P,t){var o=Ut(),u=a(o),c=a(u),x=i(a(c),2),l=a(x,!0);e(x),e(c);var _=i(c,2);{var y=w=>{var C=Nt(),h=a(C,!0);e(C),k(()=>m(h,t.subtitle)),d(w,C)};z(_,w=>{t.subtitle&&w(y)})}e(u);var g=i(u,2),I=a(g);Ct(I,()=>t.children),e(g),e(o),k(()=>{E(o,"aria-labelledby",t.id),E(x,"id",t.id),m(l,t.title)}),d(P,o)}var Kt=v('<span class="font-mono text-sm text-primary"> </span>'),Mt=v('<a class="glass hover:sharp-shadow-md group flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:border-accent/20" target="_blank" rel="noopener"><!> <span class="font-mono text-sm text-primary"> </span> <span class="font-mono text-xs text-muted-foreground transition-colors group-hover:text-accent">↗</span></a>');function q(P,t){var o=Mt(),u=a(o);{var c=_=>{var y=Kt(),g=a(y,!0);e(y),k(()=>m(g,t.icon)),d(_,y)};z(u,_=>{t.icon&&_(c)})}var x=i(u,2),l=a(x,!0);e(x),st(2),e(o),k(()=>{E(o,"href",t.href),m(l,t.label)}),d(P,o)}var Ot=v('<link rel="dns-prefetch" href="https://github.com"> <meta name="description" content="Engineer learning the skills for the next steps">',1),Bt=v('<div class="animate-slide-in"><!></div>'),Gt=v('<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"></div>'),Rt=v('<div class="animate-slide-in"><!></div>'),Vt=v('<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"></div>'),qt=v(`<main class="container mx-auto px-4 py-8 md:px-8 md:py-16"><div class="max-w-[85rem] mx-auto space-y-16"><section aria-label="Personal introduction" class="animate-fade-in space-y-8"><div class="space-y-4"><h1 class="animate-slide-in font-mono text-4xl font-bold tracking-tight text-primary md:text-6xl lg:text-7xl">Armanc Keser<span class="animate-pulse text-accent">_</span></h1> <p class="max-w-2xl font-mono text-base text-muted-foreground md:text-lg"><code class="text-primary"><span class="text-accent">const</span> state = <span class="text-highlight">'learning'</span></code></p></div> <div class="flex flex-wrap gap-4"><!> <!> <!></div></section> <!> <!></div></main>`);function ee(P,t){rt(t,!0);const o=K(()=>t.data.posts),u=K(()=>t.data.projects);var c=qt();bt(h=>{var L=Ot();wt.title="Armanc Keser",st(2),d(h,L)});var x=a(c),l=a(x),_=i(a(l),2),y=a(_);q(y,{href:"https://github.com/armanckeser",label:"github"});var g=i(y,2);q(g,{href:"https://www.linkedin.com/in/armanckeser/",label:"linkedin"});var I=i(g,2);q(I,{href:"https://bsky.app/profile/armanckeser.com",label:"bluesky"}),e(_),e(l);var w=i(l,2);at(w,{title:"~/writing",subtitle:"Insights, learnings, thoughts",id:"writing",children:(h,L)=>{var b=Gt();$(b,21,()=>s(o),tt,(S,f,T)=>{var p=Bt();E(p,"style",`animation-delay: ${T*100}ms`);var N=a(p);et(N,{get title(){return s(f).title},get description(){return s(f).description},get date(){return s(f).date},get href(){return s(f).slug}}),e(p),d(S,p)}),e(b),d(h,b)}});var C=i(w,2);at(C,{title:"~/projects",subtitle:"Apps and tools I've built",id:"projects",children:(h,L)=>{var b=Vt();$(b,21,()=>s(u),tt,(S,f,T)=>{var p=Rt();E(p,"style",`animation-delay: ${T*100}ms`);var N=a(p);et(N,{get title(){return s(f).title},get description(){return s(f).description},tag:"app",get stars(){return s(f).stars},get href(){return s(f).url},get date(){return s(f).updated}}),e(p),d(S,p)}),e(b),d(h,b)}}),e(x),e(c),d(P,c),it()}export{ee as component,te as universal};
