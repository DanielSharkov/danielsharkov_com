var app=function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function o(e){e.forEach(t)}function l(e){return"function"==typeof e}function r(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function a(e,t){e.appendChild(t)}function c(e,t,n){e.insertBefore(t,n||null)}function s(e){e.parentNode.removeChild(e)}function i(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function u(e){return document.createElement(e)}function p(e){return document.createTextNode(e)}function d(){return p(" ")}function f(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}let h;function m(e){h=e}const g=[],v=[],b=[],y=[],x=Promise.resolve();let k=!1;function $(e){b.push(e)}let _=!1;const q=new Set;function w(){if(!_){_=!0;do{for(let e=0;e<g.length;e+=1){const t=g[e];m(t),S(t.$$)}for(m(null),g.length=0;v.length;)v.pop()();for(let e=0;e<b.length;e+=1){const t=b[e];q.has(t)||(q.add(t),t())}b.length=0}while(g.length);for(;y.length;)y.pop()();k=!1,_=!1,q.clear()}}function S(e){if(null!==e.fragment){e.update(),o(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach($)}}const D=new Set;function j(e,t){-1===e.$$.dirty[0]&&(g.push(e),k||(k=!0,x.then(w)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function O(r,a,c,i,u,p,d=[-1]){const f=h;m(r);const g=r.$$={fragment:null,ctx:null,props:p,update:e,not_equal:u,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(f?f.$$.context:a.context||[]),callbacks:n(),dirty:d,skip_bound:!1};let v=!1;if(g.ctx=c?c(r,a.props||{},((e,t,...n)=>{const o=n.length?n[0]:t;return g.ctx&&u(g.ctx[e],g.ctx[e]=o)&&(!g.skip_bound&&g.bound[e]&&g.bound[e](o),v&&j(r,e)),t})):[],g.update(),v=!0,o(g.before_update),g.fragment=!!i&&i(g.ctx),a.target){if(a.hydrate){const e=function(e){return Array.from(e.childNodes)}(a.target);g.fragment&&g.fragment.l(e),e.forEach(s)}else g.fragment&&g.fragment.c();a.intro&&((b=r.$$.fragment)&&b.i&&(D.delete(b),b.i(y))),function(e,n,r,a){const{fragment:c,on_mount:s,on_destroy:i,after_update:u}=e.$$;c&&c.m(n,r),a||$((()=>{const n=s.map(t).filter(l);i?i.push(...n):o(n),e.$$.on_mount=[]})),u.forEach($)}(r,a.target,a.anchor,a.customElement),w()}var b,y;m(f)}function C(e,t,n){const o=e.slice();return o[2]=t[n].url,o[3]=t[n].icon,o[4]=t[n].alt,o}function E(e,t,n){const o=e.slice();return o[7]=t[n],o}function A(t){let n,o,l=t[7]+"";return{c(){n=u("span"),o=p(l),f(n,"class","profession flex flex-center-y svelte-1s84q4p")},m(e,t){c(e,n,t),a(n,o)},p:e,d(e){e&&s(n)}}}function I(t){let n,o,l;return{c(){n=u("a"),o=u("i"),l=d(),f(o,"class","icon fab fa-"+t[3]+" svelte-1s84q4p"),f(o,"alt",t[4]),f(n,"href",t[2]),f(n,"target","_blank"),f(n,"class","svelte-1s84q4p")},m(e,t){c(e,n,t),a(n,o),a(n,l)},p:e,d(e){e&&s(n)}}}function N(t){let n,o,l,r,p,h,m,g,v,b,y,x,k,$,_,q,w,S,D,j,O,N,U,z,T,H,P,W,B,K,L,R,V,X,F=t[0],G=[];for(let e=0;e<F.length;e+=1)G[e]=A(E(t,F,e));let J=t[1],Q=[];for(let e=0;e<J.length;e+=1)Q[e]=I(C(t,J,e));return{c(){n=u("link"),o=u("link"),l=u("meta"),r=u("meta"),p=u("meta"),h=u("meta"),m=u("meta"),g=u("meta"),v=u("meta"),b=u("link"),y=u("link"),x=u("link"),k=u("link"),$=u("link"),_=u("link"),q=u("link"),w=u("link"),S=d(),D=u("main"),j=u("div"),O=d(),N=u("div"),U=u("img"),T=d(),H=u("h1"),H.textContent="Daniel Sharkov",P=d(),W=u("div");for(let e=0;e<G.length;e+=1)G[e].c();B=d(),K=u("p"),K.textContent="Hi there! I'm an software engineer based on web apps as fullstack developer,\n\t\t\tbut more active in frontend than in the backend.\n\t\t\tSvelte, Stylus, Vue.js, PWA & SPA are my tools to go.\n\t\t\tAs well I have already experienced about 5 years in UX & UI design.\n\t\t\tNext stop: DevOps.",L=d(),R=u("div");for(let e=0;e<Q.length;e+=1)Q[e].c();V=d(),X=u("a"),X.textContent="New beta version",document.title="Daniel Sharkov",f(n,"rel","stylesheet"),f(n,"href","https://use.fontawesome.com/releases/v5.7.2/css/all.css"),f(n,"integrity","sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr"),f(n,"crossorigin","anonymous"),f(o,"rel","mask-icon"),f(o,"href","logo/vector.svg"),f(o,"color","#000000"),f(l,"name","theme-color"),f(l,"content","#000000"),f(r,"name","apple-mobile-web-app-status-bar-style"),f(r,"content","#000000"),f(p,"name","apple-touch-fullscreen"),f(p,"content","yes"),f(h,"name","apple-mobile-web-app-capable"),f(h,"content","yes"),f(m,"name","application-name"),f(m,"content","EOD Infocenter"),f(g,"name","msapplication-TileColor"),f(g,"content","#000000"),f(v,"name","msapplication-navbutton-color"),f(v,"content","#000000"),f(b,"rel","apple-touch-icon"),f(b,"type","image/png"),f(b,"href","logo/64x64.png"),f(y,"rel","apple-touch-icon"),f(y,"type","image/png"),f(y,"sizes","128x128"),f(y,"href","logo/128x128.png"),f(x,"rel","apple-touch-icon"),f(x,"type","image/png"),f(x,"sizes","192x192"),f(x,"href","logo/192x192.png"),f(k,"rel","apple-touch-icon"),f(k,"type","image/png"),f(k,"sizes","256x256"),f(k,"href","logo/256x256.png"),f($,"rel","apple-touch-icon"),f($,"type","image/png"),f($,"sizes","512x512"),f($,"href","logo/512x512.png"),f(_,"rel","bookmark"),f(_,"title","DaSh"),f(_,"href","https://danielsharkov.com"),f(q,"rel","fluid-icon"),f(q,"type","image/png"),f(q,"href","logo/512x512.png"),f(w,"rel","manifest"),f(w,"href","manifest.json"),f(j,"id","app-bg"),f(j,"class","svelte-1s84q4p"),f(U,"class","picture svelte-1s84q4p"),U.src!==(z=M)&&f(U,"src",z),f(U,"alt","Me, Myself and I"),f(H,"class","name svelte-1s84q4p"),f(W,"class","professions flex flex-center svelte-1s84q4p"),f(K,"class","biography svelte-1s84q4p"),f(R,"class","social-media flex flex-center svelte-1s84q4p"),f(X,"href","https://danielsharkov.github.io/beta_danielsharkov_com"),f(X,"id","BetaVersion"),f(X,"class","svelte-1s84q4p"),f(N,"class","intro flex flex-center svelte-1s84q4p"),f(D,"id","app"),f(D,"class","svelte-1s84q4p")},m(e,t){a(document.head,n),a(document.head,o),a(document.head,l),a(document.head,r),a(document.head,p),a(document.head,h),a(document.head,m),a(document.head,g),a(document.head,v),a(document.head,b),a(document.head,y),a(document.head,x),a(document.head,k),a(document.head,$),a(document.head,_),a(document.head,q),a(document.head,w),c(e,S,t),c(e,D,t),a(D,j),a(D,O),a(D,N),a(N,U),a(N,T),a(N,H),a(N,P),a(N,W);for(let e=0;e<G.length;e+=1)G[e].m(W,null);a(N,B),a(N,K),a(N,L),a(N,R);for(let e=0;e<Q.length;e+=1)Q[e].m(R,null);a(N,V),a(N,X)},p(e,[t]){if(1&t){let n;for(F=e[0],n=0;n<F.length;n+=1){const o=E(e,F,n);G[n]?G[n].p(o,t):(G[n]=A(o),G[n].c(),G[n].m(W,null))}for(;n<G.length;n+=1)G[n].d(1);G.length=F.length}if(2&t){let n;for(J=e[1],n=0;n<J.length;n+=1){const o=C(e,J,n);Q[n]?Q[n].p(o,t):(Q[n]=I(o),Q[n].c(),Q[n].m(R,null))}for(;n<Q.length;n+=1)Q[n].d(1);Q.length=J.length}},i:e,o:e,d(e){s(n),s(o),s(l),s(r),s(p),s(h),s(m),s(g),s(v),s(b),s(y),s(x),s(k),s($),s(_),s(q),s(w),e&&s(S),e&&s(D),i(G,e),i(Q,e)}}}const M="/me-myself-and-i.jpg";function U(e){return[["Software Engineer","FullStack WebDev","UX & UI Designer","Junior DevOp"],[{alt:"github",icon:"github",url:"https://github.com/DanielSharkov"},{alt:"codepen",icon:"codepen",url:"https://codepen.io/DanielSharkov"},{alt:"discord",icon:"discord",url:"https://discordapp.com/invite/DMBS9xd"},{alt:"telegram",icon:"telegram-plane",url:"https://t.me/danielsharkov"},{alt:"twitter",icon:"twitter",url:"https://twitter.com/Daniel_Sharkov"},{alt:"medium",icon:"medium-m",url:"https://medium.com/@danielsharkov"},{alt:"quora",icon:"quora",url:"https://quora.com/profile/Daniel-Sharkov-1"}]]}return new class extends class{$destroy(){!function(e,t){const n=e.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}{constructor(e){super(),O(this,e,U,N,r,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
