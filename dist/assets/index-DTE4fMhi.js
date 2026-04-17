(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{props;constructor(e){this.props=e}get id(){return this.props.id}get key(){return this.props.key}get productName(){return this.props.productName}get assignedTo(){return this.props.assignedTo}get status(){return this.props.status}get expiresAt(){return this.props.expiresAt}get createdAt(){return this.props.createdAt}isExpired(){return this.props.expiresAt?this.props.expiresAt<new Date:!1}toPlainObject(){return{...this.props}}};function t(e){if(!e.trim())throw Error(`LicenseId cannot be empty`);return e}var n=/^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/;function r(e){if(!n.test(e))throw Error(`Invalid license key format. Expected XXXX-XXXX-XXXX-XXXX, got: ${e}`);return e}var i=class{repository;constructor(e){this.repository=e}async createLicense(n){let i=new e({id:t(crypto.randomUUID()),key:r(this.generateKey()),productName:n.productName,assignedTo:n.assignedTo,status:`active`,expiresAt:n.expiresAt??null,createdAt:new Date});return await this.repository.save(i),i}async getLicense(e){return this.repository.findById(e)}async listLicenses(){return this.repository.findAll()}async revokeLicense(t){let n=await this.repository.findById(t);if(!n)throw Error(`License ${t} not found`);let r=new e({...n.toPlainObject(),status:`revoked`});await this.repository.save(r)}async updateLicense(t,n){let r=await this.repository.findById(t);if(!r)throw Error(`License ${t} not found`);await this.repository.save(new e({...r.toPlainObject(),...n}))}async deleteLicense(e){await this.repository.delete(e)}generateKey(){let e=()=>Math.random().toString(36).substring(2,6).toUpperCase().padEnd(4,`0`);return`${e()}-${e()}-${e()}-${e()}`}},a=class{repo;constructor(e){this.repo=e}findAll(){return this.repo.findAll()}findById(e){return this.repo.findById(e)}async create(e){let t={id:crypto.randomUUID(),name:e.name,email:e.email,role:e.role,status:`active`,createdAt:new Date().toISOString()};return await this.repo.save(t),t}async toggleStatus(e){let t=await this.repo.findById(e);if(!t)throw Error(`User ${e} not found`);await this.repo.save({...t,status:t.status===`active`?`inactive`:`active`})}async update(e,t){let n=await this.repo.findById(e);if(!n)throw Error(`User ${e} not found`);await this.repo.save({...n,...t})}delete(e){return this.repo.delete(e)}},o=class{repo;constructor(e){this.repo=e}findAll(){return this.repo.findAll()}findById(e){return this.repo.findById(e)}async create(e){let t={id:crypto.randomUUID(),name:e.name,version:e.version,description:e.description,status:`active`,createdAt:new Date().toISOString()};return await this.repo.save(t),t}async toggleStatus(e){let t=await this.repo.findById(e);if(!t)throw Error(`Product ${e} not found`);await this.repo.save({...t,status:t.status===`active`?`inactive`:`active`})}async update(e,t){let n=await this.repo.findById(e);if(!n)throw Error(`Product ${e} not found`);await this.repo.save({...n,...t})}delete(e){return this.repo.delete(e)}},s=class{repo;constructor(e){this.repo=e}findAll(){return this.repo.findAll()}findById(e){return this.repo.findById(e)}async create(e){let t={id:crypto.randomUUID(),name:e.name,description:e.description,productIds:e.productIds,status:`active`,createdAt:new Date().toISOString()};return await this.repo.save(t),t}async toggleStatus(e){let t=await this.repo.findById(e);if(!t)throw Error(`Bundle ${e} not found`);await this.repo.save({...t,status:t.status===`active`?`inactive`:`active`})}async update(e,t){let n=await this.repo.findById(e);if(!n)throw Error(`Bundle ${e} not found`);await this.repo.save({...n,...t})}delete(e){return this.repo.delete(e)}},c=class{repo;constructor(e){this.repo=e}findAll(){return this.repo.findAll()}findById(e){return this.repo.findById(e)}async create(e){let t={id:crypto.randomUUID(),name:e.name,contact:e.contact,company:e.company,status:`active`,createdAt:new Date().toISOString()};return await this.repo.save(t),t}async toggleStatus(e){let t=await this.repo.findById(e);if(!t)throw Error(`Client ${e} not found`);await this.repo.save({...t,status:t.status===`active`?`inactive`:`active`})}async update(e,t){let n=await this.repo.findById(e);if(!n)throw Error(`Client ${e} not found`);await this.repo.save({...n,...t})}delete(e){return this.repo.delete(e)}},l=`jz-license-manager`,u=1,d=[`licenses`,`users`,`products`,`bundles`,`clients`],f=null;function p(){return f?Promise.resolve(f):new Promise((e,t)=>{let n=indexedDB.open(l,u);n.onupgradeneeded=()=>{for(let e of d)n.result.objectStoreNames.contains(e)||n.result.createObjectStore(e,{keyPath:`id`})},n.onsuccess=()=>{f=n.result,e(f)},n.onerror=()=>t(n.error)})}function m(e){return new Promise((t,n)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>n(e.error)})}var h=class{storeName;constructor(e){this.storeName=e}async store(e){return(await p()).transaction(this.storeName,e).objectStore(this.storeName)}async findAll(){return m((await this.store(`readonly`)).getAll())}async findById(e){return await m((await this.store(`readonly`)).get(e))??null}async save(e){await m((await this.store(`readwrite`)).put(e))}async delete(e){await m((await this.store(`readwrite`)).delete(e))}};function g(e){return{id:e.id,key:e.key,productName:e.productName,assignedTo:e.assignedTo,status:e.status,expiresAt:e.expiresAt?.toISOString()??null,createdAt:e.createdAt.toISOString()}}function _(n){return new e({id:t(n.id),key:r(n.key),productName:n.productName,assignedTo:n.assignedTo,status:n.status,expiresAt:n.expiresAt?new Date(n.expiresAt):null,createdAt:new Date(n.createdAt)})}var v=class{repo=new h(`licenses`);async findAll(){return(await this.repo.findAll()).map(_)}async findById(e){let t=await this.repo.findById(e);return t?_(t):null}async save(e){await this.repo.save(g(e))}async delete(e){await this.repo.delete(e)}},y=class{repo=new h(`users`);findAll(){return this.repo.findAll()}findById(e){return this.repo.findById(e)}save(e){return this.repo.save(e)}delete(e){return this.repo.delete(e)}},b=class{repo=new h(`products`);findAll(){return this.repo.findAll()}findById(e){return this.repo.findById(e)}save(e){return this.repo.save(e)}delete(e){return this.repo.delete(e)}},x=class{repo=new h(`bundles`);findAll(){return this.repo.findAll()}findById(e){return this.repo.findById(e)}save(e){return this.repo.save(e)}delete(e){return this.repo.delete(e)}},S=class{repo=new h(`clients`);findAll(){return this.repo.findAll()}findById(e){return this.repo.findById(e)}save(e){return this.repo.save(e)}delete(e){return this.repo.delete(e)}},C={license:new i(new v),user:new a(new y),product:new o(new b),bundle:new s(new x),client:new c(new S)};window.services=C;var w=Object.defineProperty,T=Object.getOwnPropertySymbols,E=Object.prototype.hasOwnProperty,D=Object.prototype.propertyIsEnumerable,O=(e,t,n)=>t in e?w(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,ee=(e,t)=>{for(var n in t||={})E.call(t,n)&&O(e,n,t[n]);if(T)for(var n of T(t))D.call(t,n)&&O(e,n,t[n]);return e};function k(e,t={}){let{deep:n=!1}=t,r=new Map;function i(e){return r.has(e)||r.set(e,new Set),r.get(e)}function a(e,t,n){var i,a;(i=r.get(e))==null||i.forEach(r=>r(t,n,e)),(a=r.get(`*`))==null||a.forEach(r=>r(t,n,e))}function o(e,t){let n=[`push`,`pop`,`shift`,`unshift`,`splice`,`sort`,`reverse`,`copyWithin`];return new Proxy(e,{get(e,r){let i=Reflect.get(e,r);return typeof i==`function`&&n.includes(r)?function(...n){let r=i.apply(e,n);return a(t,e,e),r}:i},set(e,n,r){let i=Reflect.get(e,n);return Reflect.set(e,n,r),Object.is(i,r)||a(t,e,e),!0}})}function s(e,t=``){return new Proxy(e,{get(e,r){let i=e[r];return Array.isArray(i)?o(i,t?`${t}.${r}`:r):n&&typeof i==`object`&&i?s(i,t?`${t}.${r}`:r):i},set(e,n,r){let i=e[n];return Object.is(i,r)?!0:(e[n]=r,a(t?`${t}.${n}`:n,r,i),!0)},deleteProperty(e,n){let r=e[n],i=delete e[n];return i&&a(t?`${t}.${n}`:n,void 0,r),i}})}let c=s(ee({},e));function l(e,t){let n=i(e);return n.add(t),()=>{n.delete(t)}}function u(e){r.delete(e)}function d(){r.clear()}return{state:c,watch:l,unwatch:u,dispose:d}}var A=`jz_auth`,j=7;function M(e){let t=document.cookie.match(RegExp(`(^| )`+e+`=([^;]+)`));return t?t[2]:null}function N(e,t,n){let r=new Date;r.setTime(r.getTime()+n*24*60*60*1e3),document.cookie=`${e}=${t};expires=${r.toUTCString()};path=/;SameSite=Strict`}function P(e){document.cookie=`${e}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`}var F=M(A),I=k({isAuthenticated:!!F,token:F,user:F?{email:`admin@example.com`,role:`admin`}:null}),L={...I,get state(){return I.state},login(e,t=`admin`){let n=btoa(`${e}:${Date.now()}`);N(A,n,j),I.state.isAuthenticated=!0,I.state.token=n,I.state.user={email:e,role:t}},logout(){P(A),I.state.isAuthenticated=!1,I.state.token=null,I.state.user=null},validateCredentials(e,t){return e===`admin@example.com`&&t===`admin`}};function R(e){return`<span class="inline-flex px-2 py-0.5 rounded text-xs font-medium ${e===`active`?`bg-green-900/60 text-green-300`:`bg-gray-700 text-gray-400`}">${e}</span>`}function z(e,t){return`
    <button data-action="edit" data-id="${e}" class="text-indigo-400 hover:text-indigo-300 text-xs transition-colors mr-3">Edit</button>
    <button data-action="toggle" data-id="${e}" class="${t===`active`?`text-yellow-400 hover:text-yellow-300`:`text-green-400 hover:text-green-300`} text-xs transition-colors mr-3">${t===`active`?`Deactivate`:`Activate`}</button>
    <button data-action="delete" data-id="${e}" class="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button>
  `}function B(e,t={}){let{deep:n=!1}=t,r=new Map;function i(e){return r.has(e)||r.set(e,new Set),r.get(e)}function a(e,t,n){r.get(e)?.forEach(r=>r(t,n,e)),r.get(`*`)?.forEach(r=>r(t,n,e))}function o(e,t){let n=[`push`,`pop`,`shift`,`unshift`,`splice`,`sort`,`reverse`,`copyWithin`];return new Proxy(e,{get(e,r){let i=Reflect.get(e,r);return typeof i==`function`&&n.includes(r)?function(...n){let r=i.apply(e,n);return a(t,e,e),r}:i},set(e,n,r){let i=Reflect.get(e,n);return Reflect.set(e,n,r),Object.is(i,r)||a(t,e,e),!0}})}function s(e,t=``){return new Proxy(e,{get(e,r){let i=e[r];return Array.isArray(i)?o(i,t?`${t}.${r}`:r):n&&typeof i==`object`&&i?s(i,t?`${t}.${r}`:r):i},set(e,n,r){let i=e[n];return Object.is(i,r)?!0:(e[n]=r,a(t?`${t}.${n}`:n,r,i),!0)},deleteProperty(e,n){let r=e[n],i=delete e[n];return i&&a(t?`${t}.${n}`:n,void 0,r),i}})}let c=s({...e});function l(e,t){let n=i(e);return n.add(t),()=>{n.delete(t)}}function u(e){r.delete(e)}function d(){r.clear()}return{state:c,watch:l,unwatch:u,dispose:d}}var V={select(e){return e?typeof e==`object`&&`querySelector`in e?e:typeof e==`string`?e.startsWith(`#`)&&!e.includes(` `)?document.getElementById(e.slice(1)):document.querySelector(e):null:null},$:function(e){return V.select(e)},selectAll(e){return typeof e==`string`?Array.from(document.querySelectorAll(e)):[]},$$:function(e){return V.selectAll(e)},on(e,t,n,r){if(!e)return()=>{};let i=n;return e.addEventListener(t,i,r),()=>{e.removeEventListener(t,i,r)}},off(e,t,n){e&&e.removeEventListener(t,n)},once(e,t,n){if(!e)return;let r=i=>{n(i),e.removeEventListener(t,r)};e.addEventListener(t,r)},emit(e,t,n){e&&e.dispatchEvent(new CustomEvent(t,{detail:n,bubbles:!0}))},delegate(e,t,n,r){if(!e)return()=>{};let i=e=>{let t=e.target.closest(n);t&&r(e,t)};return e.addEventListener(t,i),()=>e.removeEventListener(t,i)},template(e,t={}){return e.replace(/\{\{\{(.+?)\}\}\}/g,(e,n)=>{let r=H(t,n.trim());return r==null?``:String(r)}).replace(/\{\{(.+?)\}\}/g,(e,n)=>{let r=H(t,n.trim());return r==null?``:U(String(r))})},compile(e,t={}){if(!e)return null;let n=e.innerHTML;return e.innerHTML=V.template(n,t),e},create(e){let t=document.createElement(`template`);return t.innerHTML=e.trim(),t.content.firstElementChild},toggleClass(e,t,n){e&&e.classList.toggle(t,n)},addClass(e,...t){e&&e.classList.add(...t)},removeClass(e,...t){e&&e.classList.remove(...t)},show(e,t=`block`){e&&(e.removeAttribute(`hidden`),e.style.display=t)},hide(e){e&&(e.setAttribute(`hidden`,``),e.style.display=`none`)},toggle(e){e&&(e.hasAttribute(`hidden`)||e.style.display===`none`?V.show(e):V.hide(e))},data(e,t,n){if(e){if(n===void 0)return e.dataset[t];e.dataset[t]=String(n)}},empty(e){e&&(e.innerHTML=``)},remove(e){e&&e.remove()},append(e,t){return e?(typeof t==`string`?e.insertAdjacentHTML(`beforeend`,t):e.appendChild(t),e.lastElementChild):null},prepend(e,t){return e?(typeof t==`string`?e.insertAdjacentHTML(`afterbegin`,t):e.insertBefore(t,e.firstChild),e.firstElementChild):null},html(e,t){return e?t===void 0?e.innerHTML:(e.innerHTML=t,t):``},text(e,t){return e?t===void 0?e.textContent??``:(e.textContent=t,t):``},attr(e,t,n){if(e){if(n===void 0)return e.getAttribute(t)??``;n===!1?e.removeAttribute(t):e.setAttribute(t,String(n))}},is(e,t){return e?e.matches(t):!1},closest(e,t){return e?e.closest(t):null},debounce(e,t){let n;return(...r)=>{clearTimeout(n),n=setTimeout(()=>e(...r),t)}},throttle(e,t){let n=!1;return(...r)=>{n||(e(...r),n=!0,setTimeout(()=>{n=!1},t))}},http:{baseUrl:``,async get(e,t){return W(e,{...t,method:`GET`})},async post(e,t,n){return W(e,{...n,method:`POST`,body:JSON.stringify(t),headers:{"Content-Type":`application/json`,...n?.headers}})},async put(e,t,n){return W(e,{...n,method:`PUT`,body:JSON.stringify(t),headers:{"Content-Type":`application/json`,...n?.headers}})},async patch(e,t,n){return W(e,{...n,method:`PATCH`,body:JSON.stringify(t),headers:{"Content-Type":`application/json`,...n?.headers}})},async delete(e,t){return W(e,{...t,method:`DELETE`})}}};function H(e,t){return t.split(`.`).reduce((e,t)=>{if(e&&typeof e==`object`)return e[t]},e)}function U(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}async function W(e,t){let n=V.http.baseUrl?V.http.baseUrl+e:e,r=await fetch(n,{...t,headers:{Accept:`application/json`,...t.headers}});if(!r.ok)throw new G(r.status,r.statusText,await r.text());let i=await r.text();if(!i)return{};try{return JSON.parse(i)}catch{return i}}var G=class extends Error{status;statusText;body;constructor(e,t,n){super(`HTTP ${e}: ${t}`),this.name=`HttpError`,this.status=e,this.statusText=t,this.body=n}};window.authState=L;function K(e,t=`polite`){let n=V.$(`#announcer`);n&&(n.setAttribute(`aria-live`,t),n.textContent=``,setTimeout(()=>{n.textContent=e},100))}var q={active:`bg-green-900/60 text-green-300`,inactive:`bg-gray-700 text-gray-300`,expired:`bg-yellow-900/60 text-yellow-300`,revoked:`bg-red-900/60 text-red-300`},J={navigate(e){window.location.hash=e,X()}};window.router=J;var Y=B({currentPath:window.location.hash.slice(1)||`/`});window.addEventListener(`hashchange`,()=>{Y.state.currentPath=window.location.hash.slice(1)||`/`,X()});function X(){let e=Y.state.currentPath;if(e!==`/login`&&!L.state.isAuthenticated){J.navigate(`/login`);return}e===`/login`?Z():Q(e)}function Z(){let{state:e,watch:t}=B({email:``,password:``,error:null});V.$(`#app`).innerHTML=`
    <main id="main-content" class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-sm" role="region" aria-labelledby="login-title">
        <div class="text-center mb-8">
          <h1 id="login-title" class="text-2xl font-bold text-white">JZ License Manager</h1>
          <p class="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>
        <form id="login-form" class="block bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-5" aria-describedby="login-hint" novalidate>
          <div id="login-hint" class="sr-only">Enter your email and password to sign in. Demo credentials: admin@example.com / admin</div>
          <div id="error-alert" class="hidden rounded-md bg-red-900/50 border border-red-700 px-3 py-2" role="alert" aria-live="assertive">
            <p class="text-sm text-red-300" id="error-msg"></p>
          </div>
          <div>
            <label for="input-email" class="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
            <input 
              id="input-email" 
              name="email" 
              type="email" 
              placeholder="admin@example.com"
              autocomplete="email"
              required
              aria-required="true"
              aria-describedby="email-hint"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span id="email-hint" class="sr-only">Enter your email address</span>
          </div>
          <div>
            <label for="input-password" class="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
            <input 
              id="input-password" 
              name="password" 
              type="password" 
              placeholder="••••••••"
              autocomplete="current-password"
              required
              aria-required="true"
              aria-describedby="password-hint"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span id="password-hint" class="sr-only">Enter your password</span>
          </div>
          <button 
            id="btn-login" 
            type="submit"
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  `;let n=V.$(`#login-form`),r=V.$(`#input-email`),i=V.$(`#input-password`),a=V.$(`#error-alert`),o=V.$(`#error-msg`);t(`error`,e=>{V.toggleClass(a,`hidden`,!e),e?(o.textContent=e,r.setAttribute(`aria-invalid`,`true`)):r.removeAttribute(`aria-invalid`)}),V.on(r,`input`,()=>{e.email=r.value}),V.on(i,`input`,()=>{e.password=i.value}),V.on(n,`submit`,t=>{t.preventDefault();let n=e.email.trim(),r=e.password.trim();if(!n||!r){e.error=`Email and password are required.`,K(`Error: Email and password are required.`,`assertive`);return}L.validateCredentials(n,r)?(K(`Signing in...`),L.login(n),J.navigate(`/licenses`)):(e.error=`Invalid credentials. Please try again.`,K(`Error: Invalid credentials.`,`assertive`),i.value=``,i.focus())}),r.focus()}function Q(e){let t=V.$(`#app`),n=t=>e.startsWith(t)?`bg-indigo-600/20 text-indigo-400 border border-indigo-600/30`:`text-gray-400 hover:bg-gray-700/60 hover:text-white`;t.innerHTML=`
    <div class="flex min-h-screen">
      <aside class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col" role="navigation" aria-label="Main navigation">
        <div class="p-4 border-b border-gray-700">
          <h1 class="text-lg font-bold text-white">JZ License Manager</h1>
        </div>
        <nav class="flex-1 p-4 space-y-1" aria-label="Primary navigation">
          <a href="#/licenses" aria-current="${e===`/licenses`?`page`:`false`}" class="flex items-center px-3 py-2 rounded-md text-sm font-medium ${n(`/licenses`)} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
            Licenses
          </a>
          <a href="#/users" aria-current="${e===`/users`?`page`:`false`}" class="flex items-center px-3 py-2 rounded-md text-sm font-medium ${n(`/users`)} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            Users
          </a>
          <a href="#/products" aria-current="${e===`/products`?`page`:`false`}" class="flex items-center px-3 py-2 rounded-md text-sm font-medium ${n(`/products`)} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            Products
          </a>
          <a href="#/bundles" aria-current="${e===`/bundles`?`page`:`false`}" class="flex items-center px-3 py-2 rounded-md text-sm font-medium ${n(`/bundles`)} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            Bundles
          </a>
          <a href="#/clients" aria-current="${e===`/clients`?`page`:`false`}" class="flex items-center px-3 py-2 rounded-md text-sm font-medium ${n(`/clients`)} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Clients
          </a>
        </nav>
        <div class="p-4 border-t border-gray-700">
          <button id="btn-logout" aria-label="Sign out of your account" class="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout
          </button>
        </div>
      </aside>
      <main id="main-content" class="flex-1 p-8" role="main">
        <div id="page-content"></div>
      </main>
    </div>
  `,V.on(V.$(`#btn-logout`),`click`,()=>{K(`Signing out...`),L.logout(),J.navigate(`/login`)}),ie(e)}function te(e,t){return`
    <button data-action="edit" data-id="${e}" class="text-indigo-400 hover:text-indigo-300 text-xs transition-colors mr-3">Edit</button>
    ${t===`active`?`<button data-action="revoke" data-id="${e}" class="text-yellow-400 hover:text-yellow-300 text-xs transition-colors mr-3">Revoke</button>`:``}
    <button data-action="delete" data-id="${e}" class="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button>
  `}function ne(e){return e.length?e.map(e=>`
    <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors" data-id="${e.id}">
      <td class="px-4 py-3 font-mono text-xs text-gray-300" scope="row">${e.key}</td>
      <td class="px-4 py-3 text-white">${e.productName}</td>
      <td class="px-4 py-3 text-gray-300">${e.assignedTo}</td>
      <td class="px-4 py-3">
        <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium ${q[e.status]??``}" role="status" aria-label="Status: ${e.status}">
          ${e.status}
        </span>
      </td>
      <td class="px-4 py-3 text-gray-400 text-xs">
        ${e.expiresAt?new Date(e.expiresAt).toLocaleDateString():`—`}
      </td>
      <td class="px-4 py-3">
        <div class="flex gap-3" role="group" aria-label="Actions for ${e.productName}">
          ${te(e.id,e.status)}
        </div>
      </td>
    </tr>
  `).join(``):`<tr>
      <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-500">
        No licenses yet. Create one using the form below.
      </td>
    </tr>`}async function re(){let e=V.$(`#page-content`),{state:n,watch:r}=B({items:[],editId:``});async function i(){n.items=await window.services.license.listLicenses(),K(`${n.items.length} licenses loaded`)}e.innerHTML=`
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">Licenses</h2>
          <p class="text-sm text-gray-400 mt-0.5" id="count-label" aria-live="polite"></p>
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-5" role="region" aria-labelledby="create-license-heading">
        <h3 id="create-license-heading" class="text-sm font-semibold text-white mb-4">Create New License</h3>
        <form id="create-form" class="grid grid-cols-2 gap-4" aria-label="Create license form">
          <div>
            <label for="f-product" class="block text-xs text-gray-400 mb-1.5">Product Name</label>
            <input id="f-product" name="productName" type="text" placeholder="My App Pro" required aria-required="true"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="f-assigned" class="block text-xs text-gray-400 mb-1.5">Assigned To</label>
            <input id="f-assigned" name="assignedTo" type="email" placeholder="user@example.com" required aria-required="true"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="f-expires" class="block text-xs text-gray-400 mb-1.5">Expires At <span class="text-gray-500">(optional)</span></label>
            <input id="f-expires" name="expiresAt" type="date"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </form>
        <div class="flex gap-3 mt-4">
          <button form="create-form" type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800">
            Create License
          </button>
        </div>
      </div>

      <div id="edit-form" class="hidden bg-gray-800 border border-gray-700 rounded-lg p-5" role="region" aria-labelledby="edit-license-heading">
        <h3 id="edit-license-heading" class="text-sm font-semibold text-white mb-4">Edit License</h3>
        <form id="edit-form-inner" class="grid grid-cols-2 gap-4" aria-label="Edit license form">
          <div>
            <label for="ef-product" class="block text-xs text-gray-400 mb-1.5">Product Name</label>
            <input id="ef-product" name="productName" type="text" required aria-required="true"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="ef-assigned" class="block text-xs text-gray-400 mb-1.5">Assigned To</label>
            <input id="ef-assigned" name="assignedTo" type="email" required aria-required="true"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="ef-expires" class="block text-xs text-gray-400 mb-1.5">Expires At</label>
            <input id="ef-expires" name="expiresAt" type="date"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </form>
        <div class="flex gap-3 mt-4">
          <button form="edit-form-inner" type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800">
            Update License
          </button>
          <button id="btn-cancel-edit" type="button" class="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800">
            Cancel
          </button>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table class="w-full text-left text-sm" role="table" aria-label="Licenses list">
          <caption class="sr-only">Licenses list. Use the create form above to add new licenses.</caption>
          <thead>
            <tr class="border-b border-gray-700" role="row">
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" role="columnheader" scope="col">Key</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" role="columnheader" scope="col">Product</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" role="columnheader" scope="col">Assigned To</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" role="columnheader" scope="col">Status</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" role="columnheader" scope="col">Expires</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" role="columnheader" scope="col"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody id="licenses-tbody" role="rowgroup"></tbody>
        </table>
      </div>
    </div>
  `,r(`items`,e=>{V.$(`#licenses-tbody`).innerHTML=ne(e),V.$(`#count-label`).textContent=`${e.length} license${e.length===1?``:`s`}`}),r(`editId`,e=>{V.toggleClass(V.$(`#edit-form`),`hidden`,!e),e&&V.$(`#ef-product`)?.focus()});let a=V.$(`#licenses-tbody`);V.delegate(a,`click`,`button`,(e,r)=>{let a=r.dataset.id,o=r.dataset.action;if(o===`edit`){K(`Loading license data for editing`),window.services.license.getLicense(t(a)).then(e=>{e&&(V.$(`#ef-product`).value=e.productName,V.$(`#ef-assigned`).value=e.assignedTo,V.$(`#ef-expires`).value=e.expiresAt?new Date(e.expiresAt).toISOString().split(`T`)[0]:``,n.editId=a,K(`Edit form opened. Product name field is now focused.`))});return}if(o===`revoke`){K(`Revoking license ${a}`),window.services.license.revokeLicense(t(a)).then(()=>{K(`License revoked successfully`),i()});return}if(o===`delete`){K(`Deleting license ${a}`),window.services.license.deleteLicense(t(a)).then(()=>{K(`License deleted successfully`),i()});return}});let o=V.$(`#create-form`);V.on(o,`submit`,async e=>{e.preventDefault();let t=V.$(`#f-product`)?.value?.trim(),n=V.$(`#f-assigned`)?.value?.trim(),r=V.$(`#f-expires`)?.value;if(!t||!n){K(`Error: Product name and assigned email are required`,`assertive`);return}K(`Creating license...`),await window.services.license.createLicense({productName:t,assignedTo:n,expiresAt:r?new Date(r):void 0}),V.$(`#f-product`).value=``,V.$(`#f-assigned`).value=``,V.$(`#f-expires`).value=``,V.$(`#f-product`)?.focus(),K(`License created successfully`),await i()}),V.on(V.$(`#btn-cancel-edit`),`click`,()=>{n.editId=``,K(`Edit cancelled`)});let s=V.$(`#edit-form-inner`);V.on(s,`submit`,async e=>{if(e.preventDefault(),!n.editId)return;let r=V.$(`#ef-product`)?.value?.trim()||``,a=V.$(`#ef-assigned`)?.value?.trim()||``,o=V.$(`#ef-expires`)?.value;K(`Updating license...`),await window.services.license.updateLicense(t(n.editId),{productName:r,assignedTo:a,expiresAt:o?new Date(o):void 0}),n.editId=``,K(`License updated successfully`),await i()}),await i()}async function $(e,t,n,r,i){let a=V.$(`#page-content`),{state:o,watch:s}=B({items:[],editId:``});async function c(){o.items=await window.services[t].findAll()}let l=i();a.innerHTML=`
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">${e}</h2>
          <p class="text-sm text-gray-400 mt-0.5" id="count-label"></p>
        </div>
        <button id="btn-new" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
          + New ${e}
        </button>
      </div>

      <div id="form-panel" class="hidden bg-gray-800 border border-gray-700 rounded-lg p-5">
        <h3 class="text-sm font-semibold text-white mb-4" id="form-title">New ${e}</h3>
        <div class="grid grid-cols-2 gap-4">
          ${l.map(e=>`
    <div>
      <label class="block text-xs text-gray-400 mb-1.5">${e.label}</label>
      <input id="f-${e.id}" type="text" placeholder="${e.placeholder||``}"
        class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  `).join(``)}
        </div>
        <div class="flex gap-3 mt-4">
          <button id="btn-submit" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">Save</button>
          <button id="btn-cancel" class="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium px-4 py-2 rounded-md transition-colors">Cancel</button>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-700">
              ${n.map(e=>`
                <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider ${e.class||``}">${e.label}</th>
              `).join(``)}
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody id="items-tbody"></tbody>
        </table>
      </div>
    </div>
  `,s(`items`,t=>{V.$(`#items-tbody`).innerHTML=t.length?t.map(r).join(``):`<tr><td colspan="${n.length+1}" class="px-4 py-10 text-center text-sm text-gray-500">No ${e.toLowerCase()}s yet.</td></tr>`,V.$(`#count-label`).textContent=`${t.length} ${e.toLowerCase()}${t.length===1?``:`s`}`}),s(`editId`,t=>{V.toggleClass(V.$(`#form-panel`),`hidden`,!t),V.$(`#form-title`).textContent=t?`Edit ${e}`:`New ${e}`});let u=V.$(`#items-tbody`);V.delegate(u,`click`,`button`,(e,n)=>{let r=n.dataset.id,i=n.dataset.action;if(i===`edit`){window.services[t].findById(r).then(e=>{e&&(l.forEach(t=>{V.$(`#ef-${t.id}`).value=e[t.id]||``}),o.editId=r)});return}i===`toggle`&&window.services[t].toggleStatus(r),i===`delete`&&window.services[t].delete(r),c()}),V.on(V.$(`#btn-new`),`click`,()=>{o.editId=``,l.forEach(e=>V.$(`#f-${e.id}`).value=``),V.$(`#form-title`).textContent=`New ${e}`,V.show(V.$(`#form-panel`))}),V.on(V.$(`#btn-cancel`),`click`,()=>{o.editId=``}),V.on(V.$(`#btn-submit`),`click`,async()=>{let e={};l.forEach(t=>{e[t.id]=V.$(`#f-${t.id}`)?.value.trim()||``});let n=window.services[t];o.editId?await n.update(o.editId,e):await n.create(e),o.editId=``,await c()}),await c()}function ie(e){switch(e){case`/licenses`:re();break;case`/users`:$(`Users`,`user`,[{key:`name`,label:`Name`},{key:`email`,label:`Email`,class:`text-gray-300`},{key:`role`,label:`Role`,class:`capitalize`},{key:`status`,label:`Status`}],e=>`
        <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
          <td class="px-4 py-3 text-white">${e.name}</td>
          <td class="px-4 py-3 text-gray-300">${e.email}</td>
          <td class="px-4 py-3 text-gray-300 capitalize">${e.role}</td>
          <td class="px-4 py-3">${R(e.status)}</td>
          <td class="px-4 py-3">${z(e.id,e.status)}</td>
        </tr>
      `,()=>[{id:`name`,label:`Name`,placeholder:`John Doe`},{id:`email`,label:`Email`,placeholder:`john@example.com`},{id:`role`,label:`Role`,placeholder:`viewer`}]);break;case`/products`:$(`Products`,`product`,[{key:`name`,label:`Name`},{key:`version`,label:`Version`,class:`font-mono text-xs text-gray-300`},{key:`description`,label:`Description`,class:`max-w-xs truncate text-gray-400`},{key:`status`,label:`Status`}],e=>`
        <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
          <td class="px-4 py-3 text-white">${e.name}</td>
          <td class="px-4 py-3 font-mono text-xs text-gray-300">${e.version}</td>
          <td class="px-4 py-3 text-gray-400 max-w-xs truncate">${e.description||`—`}</td>
          <td class="px-4 py-3">${R(e.status)}</td>
          <td class="px-4 py-3">${z(e.id,e.status)}</td>
        </tr>
      `,()=>[{id:`name`,label:`Name`,placeholder:`My Product`},{id:`version`,label:`Version`,placeholder:`1.0.0`},{id:`description`,label:`Description`,placeholder:`Product description`}]);break;case`/bundles`:$(`Bundles`,`bundle`,[{key:`name`,label:`Name`},{key:`products`,label:`Products`,class:`text-xs text-gray-400`},{key:`description`,label:`Description`,class:`max-w-xs truncate text-gray-400`},{key:`status`,label:`Status`}],e=>`
        <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
          <td class="px-4 py-3 text-white">${e.name}</td>
          <td class="px-4 py-3 text-gray-400 text-xs">${(e.productIds||[]).length} product${(e.productIds||[]).length===1?``:`s`}</td>
          <td class="px-4 py-3 text-gray-400 max-w-xs truncate">${e.description||`—`}</td>
          <td class="px-4 py-3">${R(e.status)}</td>
          <td class="px-4 py-3">${z(e.id,e.status)}</td>
        </tr>
      `,()=>[{id:`name`,label:`Name`,placeholder:`Bundle Name`},{id:`description`,label:`Description`,placeholder:`Bundle description`}]);break;case`/clients`:$(`Clients`,`client`,[{key:`name`,label:`Name`},{key:`contact`,label:`Contact`,class:`text-gray-300`},{key:`company`,label:`Company`,class:`text-gray-400`},{key:`status`,label:`Status`}],e=>`
        <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
          <td class="px-4 py-3 text-white">${e.name}</td>
          <td class="px-4 py-3 text-gray-300">${e.contact}</td>
          <td class="px-4 py-3 text-gray-400">${e.company||`—`}</td>
          <td class="px-4 py-3">${R(e.status)}</td>
          <td class="px-4 py-3">${z(e.id,e.status)}</td>
        </tr>
      `,()=>[{id:`name`,label:`Name`,placeholder:`Client Name`},{id:`contact`,label:`Contact`,placeholder:`contact@company.com`},{id:`company`,label:`Company`,placeholder:`Company Inc.`}]);break;default:V.$(`#page-content`).innerHTML=`<div class="text-gray-400">Page not found</div>`}}X();