/* FitNotes — account sync. On a Claude artifact link the viewer's own Claude
   account stores the data; on other hosts a Firebase project with "Fortsæt med
   Google" (see FIREBASE-SETUP.md). Without either, data stays on the device. */
(() => {
  const LINK_KEY='fitnotes.sync.linked',OFF_KEY='fitnotes.sync.loggedOut';
  const FIREBASE='https://www.gstatic.com/firebasejs/10.12.2/';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const time=value=>Date.parse(value)||0;
  const plain=value=>JSON.parse(JSON.stringify(value));
  const sortLogs=logs=>logs.sort((a,b)=>time(b.finishedAt)-time(a.finishedAt));
  const readLink=()=>{try{return localStorage.getItem(LINK_KEY);}catch(e){return null;}};
  const writeLink=key=>{try{localStorage.setItem(LINK_KEY,key);}catch(e){}};
  // "Log ud på denne enhed" for the Claude account, which the page cannot sign out of.
  const readOff=()=>{try{return localStorage.getItem(OFF_KEY);}catch(e){return null;}};
  const writeOff=value=>{try{value?localStorage.setItem(OFF_KEY,value):localStorage.removeItem(OFF_KEY);}catch(e){}};
  const GOOGLE='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>';
  const PERSON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
  let backend=null,user=null,known=null,confirming=false,status='idle',lastSynced=null,pushTimer=null,pending=false,chain=Promise.resolve();
  function setStatus(next){status=next;window.FitApp?.refreshAccount();}

  // Both stores keep one private collection per person: a "state" document
  // plus one document per month of workouts, since a single document has a
  // size cap (256 KiB on Claude, 1 MiB on Firebase).
  function monthlyStore(collection){
    let months=new Set(),written=new Map();
    const monthKey=log=>'logs-'+(String(log.finishedAt||'').slice(0,7).replace(/[^0-9-]/g,'')||'undated');
    return {
      async fetch(){
        const snap=await collection().get();
        const docs=new Map(snap.docs.map(doc=>[doc.id,doc.data()]));
        months=new Set([...docs.keys()].filter(key=>key.startsWith('logs-')));
        written=new Map([...months].map(key=>[key,JSON.stringify(docs.get(key).logs||[])]));
        const head=docs.get('state');
        if(!head)return null;
        const logs=[...months].flatMap(key=>docs.get(key).logs||[]);
        return {data:{...head.data,logs:sortLogs(logs)},updatedAt:head.updatedAt};
      },
      async push(state){
        const grouped=new Map();
        for(const log of state.logs||[]){const key=monthKey(log);if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(log);}
        // Months first and the state document last, so a half-finished push
        // never looks newer than what is actually stored.
        for(const [key,logs] of grouped){
          const json=JSON.stringify(logs);
          if(written.get(key)===json)continue;
          await collection().doc(key).set({logs:JSON.parse(json)});
          written.set(key,json);
        }
        for(const key of months)if(!grouped.has(key)){await collection().doc(key).delete();written.delete(key);}
        months=new Set(grouped.keys());
        const {logs,...rest}=state;
        await collection().doc('state').set({data:plain(rest),updatedAt:state.updatedAt||new Date().toISOString()});
      }
    };
  }

  function claudeBackend(){
    let db=null;
    return {
      kind:'claude',
      ...monthlyStore(()=>db.collection('data/users/'+user.id)),
      async start(){
        const [account,store]=await Promise.all([window.claude.use('user'),window.claude.use('db')]);
        if(!account||!store){setStatus('unavailable');return;}
        db=store;
        const me=await account.me();
        if(!me.id){setStatus('signed-out');return;}
        known={id:me.id,name:me.name,avatar:me.avatarUrl};
        if(readOff()==='claude:'+me.id){setStatus('logged-out');return;}
        await onUser(known);
      },
      async login(){writeOff(null);await onUser(known);},
      async logout(){writeOff('claude:'+known.id);}
    };
  }

  function firebaseBackend(settings){
    let auth=null,db=null;
    const load=src=>new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=FIREBASE+src;script.onload=resolve;script.onerror=()=>reject(Error('Firebase unavailable'));
      document.head.append(script);
    });
    return {
      kind:'firebase',
      canLogin:true,
      ...monthlyStore(()=>db.collection('users/'+user.id+'/fitnotes')),
      async start(){
        if(!window.firebase?.initializeApp){
          await load('firebase-app-compat.js');
          await Promise.all([load('firebase-auth-compat.js'),load('firebase-firestore-compat.js')]);
        }
        const app=window.firebase.apps?.length?window.firebase.app():window.firebase.initializeApp(settings);
        auth=app.auth();db=app.firestore();
        // Finishes a login that had to fall back to a full-page redirect.
        try{await auth.getRedirectResult();}catch(e){}
        auth.onAuthStateChanged(account=>setTimeout(()=>onUser(account?{id:account.uid,email:account.email||'',name:account.displayName||'',avatar:account.photoURL||''}:null)));
      },
      async google(){
        const provider=new window.firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({prompt:'select_account'});
        try{await auth.signInWithPopup(provider);}
        catch(e){
          if(e?.code==='auth/popup-blocked')return auth.signInWithRedirect(provider);
          if(e?.code==='auth/popup-closed-by-user'||e?.code==='auth/cancelled-popup-request')return;
          throw e;
        }
      },
      async logout(){await auth.signOut();}
    };
  }

  // Pushes run one after another so two never write the same document at once.
  function push(){
    clearTimeout(pushTimer);pushTimer=null;
    chain=chain.then(async()=>{
      if(!user)return;
      setStatus('syncing');
      try{await backend.push(window.FitApp.getState());pending=false;lastSynced=new Date();setStatus('synced');}
      catch(e){pending=true;setStatus('error');}
    });
    return chain;
  }
  // First login on a device: keep the account's data and add any workouts
  // that only exist locally, so nothing logged before signing in is lost.
  function mergeFirstLink(local,remote){
    const merged=structuredClone(remote);
    merged.logs=Array.isArray(merged.logs)?merged.logs:[];
    const known=new Set(merged.logs.map(log=>log.id));
    for(const log of local.logs||[])if(!known.has(log.id))merged.logs.push(structuredClone(log));
    sortLogs(merged.logs);
    merged.baselines={...(local.baselines||{}),...(merged.baselines||{})};
    merged.updatedAt=new Date().toISOString();
    return merged;
  }
  // After that the newest copy wins, so deleted workouts stay deleted.
  async function pull(firstLink=false){
    setStatus('syncing');
    try{
      const remote=await backend.fetch(),local=window.FitApp.getState();
      if(!remote)await push();
      else if(firstLink){window.FitApp.replaceState(mergeFirstLink(local,remote.data));await push();}
      else if(time(remote.updatedAt)>time(local.updatedAt)){window.FitApp.replaceState(remote.data);lastSynced=new Date();setStatus('synced');}
      else if(time(remote.updatedAt)<time(local.updatedAt))await push();
      else{lastSynced=new Date();setStatus('synced');}
      if(status!=='error')writeLink(backend.kind+':'+user.id);
    }catch(e){pending=true;setStatus('error');}
  }
  async function onUser(next){
    if((next?.id||null)===(user?.id||null))return;
    user=next;
    if(!user){setStatus('idle');return;}
    await pull(readLink()!==backend.kind+':'+user.id);
  }
  function queue(){
    if(!user)return;
    pending=true;clearTimeout(pushTimer);pushTimer=setTimeout(push,1500);
  }
  async function logout(keepLocal){
    if(pending)await push();
    await chain;
    await backend.logout();
    user=null;confirming=false;
    setStatus(backend.kind==='claude'?'logged-out':'idle');
    if(keepLocal)window.FitApp.toast('Logget ud. Dine træninger ligger stadig på denne enhed.');
    else{window.FitApp.resetLocal();window.FitApp.toast('Logget ud, og træningerne er fjernet fra denne enhed.');}
  }

  // What the account button in the top bar shows.
  function badge(){
    if(!backend)return {label:'Konto',state:'off'};
    if(!user)return {label:backend.canLogin?'Log ind':'Konto',state:'off'};
    return {label:'Din konto',avatar:user.avatar||'',state:status==='error'?'warn':status==='syncing'?'busy':'ok'};
  }
  function statusLine(){
    return {syncing:'Gemmer på din konto…',synced:`Gemt på din konto${lastSynced?' kl. '+lastSynced.toLocaleTimeString('da-DK',{hour:'2-digit',minute:'2-digit'}):''}`,
      error:'Ikke gemt på kontoen endnu. Prøver igen, når der er forbindelse.'}[status]||'Logget ind';
  }
  function hero(name,sub){
    const avatar=user?.avatar;
    return `<div class="account-hero"><div class="account-avatar">${avatar?`<img src="${esc(avatar)}" alt="" referrerpolicy="no-referrer">`:PERSON}</div><div class="account-hero-text"><strong>${esc(name)}</strong><small>${esc(sub)}</small></div></div>`;
  }
  function action(title,text,button){
    return `<div class="account-action"><div><strong>${title}</strong><p>${text}</p></div>${button}</div>`;
  }
  function logoutBlock(){
    if(!confirming)return action('Log ud på denne enhed','FitNotes holder op med at gemme på kontoen her.','<button class="btn btn-secondary btn-tiny" data-action="sync-logout">Log ud</button>');
    return `<div class="account-confirm"><strong>Log ud på denne enhed?</strong><p>Dine træninger ligger sikkert på kontoen. Vil du også fjerne dem fra denne enhed?</p>
      <div class="settings-buttons"><button class="btn btn-secondary btn-tiny" data-action="sync-logout-keep">Log ud, behold på enheden</button><button class="btn btn-danger btn-tiny" data-action="sync-logout-clear">Log ud og fjern fra enheden</button><button class="btn btn-ghost btn-tiny" data-action="sync-cancel">Annuller</button></div></div>`;
  }
  function accountPageHTML(){
    if(!backend)return '';
    const statusRow=user?`<p class="account-status account-${esc(status)}">${esc(statusLine())}</p>${status==='error'?'<div class="settings-buttons"><button class="btn btn-secondary btn-tiny" data-action="sync-now">Prøv igen</button></div>':''}`:'';
    const local='Indtil da gemmes dine træninger kun på denne enhed.';
    if(status==='unavailable')return `<div class="manage-row account-row">${hero('Konto ikke tilgængelig','Prøv igen senere')}<p>Kontoen kan ikke nås lige nu. Dine træninger gemmes stadig på denne enhed.</p></div>`;
    if(backend.kind==='claude'){
      const swap=action('Skift eller tilføj konto','FitNotes bruger den Claude-konto, du er logget ind med. Log ud af Claude og ind med en anden konto for at bruge FitNotes med den.','<a class="btn btn-secondary btn-tiny" href="https://claude.ai/settings" target="_blank" rel="noopener noreferrer">Åbn claude.ai</a>');
      if(!known)return `<div class="manage-row account-row">${hero('Ikke logget ind','Claude-konto')}<p>Log ind på claude.ai for at gemme dine træninger på din konto. ${local}</p></div>`;
      if(!user)return `<div class="manage-row account-row">${hero(known.name||'Din Claude-konto','Logget ud på denne enhed')}<p>Dine træninger gemmes kun på denne enhed, indtil du logger ind igen.</p></div>
        <div class="manage-row account-row"><strong>Konto</strong><div class="account-actions">${action('Log ind igen','Hent dine træninger fra kontoen og gem dem der igen.','<button class="btn btn-primary btn-tiny" data-action="sync-login">Log ind</button>')}${swap}</div></div>`;
      return `<div class="manage-row account-row">${hero(user.name||'Din Claude-konto','Logget ind med Claude')}${statusRow}</div>
        <div class="manage-row account-row"><strong>Konto</strong><p>Dine træninger gemmes automatisk på kontoen, så de er de samme på alle dine enheder.</p><div class="account-actions">${logoutBlock()}${swap}</div></div>`;
    }
    if(!user)return `<div class="manage-row account-row">${hero('Ikke logget ind','Log ind for at gemme dine træninger')}
      <p>Log ind med Google for at gemme dine træninger på din konto, så de er de samme på telefon og computer. ${local}</p>
      <div class="oauth-buttons"><button class="btn btn-secondary oauth-btn oauth-google" data-action="sync-google">${GOOGLE}Fortsæt med Google</button></div></div>`;
    return `<div class="manage-row account-row">${hero(user.name||user.email,user.name&&user.email?`Logget ind med Google · ${user.email}`:'Logget ind med Google')}${statusRow}</div>
      <div class="manage-row account-row"><strong>Konto</strong><p>Dine træninger gemmes automatisk på kontoen, så de er de samme på alle dine enheder.</p><div class="account-actions">${logoutBlock()}${action('Skift eller tilføj konto','Log ud, og log derefter ind med en anden Google-konto.','')}</div></div>`;
  }
  function handleAction(action){
    if(!backend)return;
    if(action==='sync-google'&&backend.google)backend.google().catch(()=>window.FitApp.toast('Login med Google kunne ikke startes. Prøv igen om lidt.'));
    else if(action==='sync-login'&&backend.login)backend.login();
    else if(action==='sync-logout'&&user){confirming=true;setStatus(status);}
    else if(action==='sync-cancel'){confirming=false;setStatus(status);}
    else if(action==='sync-logout-keep'&&user)logout(true);
    else if(action==='sync-logout-clear'&&user)logout(false);
    else if(action==='sync-now')push();
  }

  const config=window.FITNOTES_CONFIG||{};
  // A demo copy (FITNOTES_CONFIG.demo) never touches an account.
  if(config.demo)backend=null;
  else if(typeof window.claude?.use==='function')backend=claudeBackend();
  else if(config.firebase?.apiKey&&config.firebase?.projectId)backend=firebaseBackend(config.firebase);
  window.FitSync={queue,badge,accountPageHTML,handleAction,isActive:()=>Boolean(user)};
  if(backend){
    window.addEventListener('online',()=>{if(user&&pending)push();});
    // Send unsaved changes when the app is hidden; check for newer data when it returns.
    document.addEventListener('visibilitychange',()=>{
      if(!user)return;
      if(document.hidden){if(pending)push();return;}
      pending?push():pull();
    });
    backend.start().catch(()=>setStatus('unavailable'));
  }
})();
