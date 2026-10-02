import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmbnRgBsU0n2szKEwNzCFT1O_VT9JGI1A",
  authDomain: "static-page-mark-1.firebaseapp.com",
  databaseURL: "https://static-page-mark-1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "static-page-mark-1",
  storageBucket: "static-page-mark-1.appspot.com",
  messagingSenderId: "341741725438",
  appId: "1:341741725438:web:4e66837d61606f133f67af",
  measurementId: "G-79V24673H8"
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const provider = new GoogleAuthProvider();

const K="gate-cse-2027";
const P=[["Engineering Mathematics","Weeks 1–2"],["Digital Logic","Week 3"],["COA","Week 4"],["Programming & Data Structures","Weeks 5–6"],["Algorithms","Week 7"],["Theory of Computation","Week 8"],["Compiler Design","Week 9"],["Operating Systems","Weeks 10–11"],["DBMS","Weeks 12–13"],["Computer Networks","Week 14"],["Revision I","Week 15"],["PYQ Mastery","Week 16"],["Full Mocks","Weeks 17–18"],["Final Taper","Week 19"]];
const S=P.slice(0,10).map(x=>x[0]);
const emptyState=()=>({page:"dash",logs:[],errors:[],mocks:[],tasks:{}});
let d=JSON.parse(localStorage.getItem(K)||"null")||emptyState(),user=null,syncBusy=false;
const today=()=>new Date().toISOString().slice(0,10),pct=(a,b)=>b?Math.round(a/b*100):0;
const W=()=>Math.max(1,Math.min(19,Math.floor((Date.now()-new Date("2026-10-01T00:00:00+05:30"))/604800000)+1));
const clone=x=>JSON.parse(JSON.stringify(x)),localSave=()=>localStorage.setItem(K,JSON.stringify(d));
const newId=()=>crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2);

function setSyncStatus(msg){const el=document.getElementById("syncStatus");if(el)el.textContent=msg}
async function cloudSave(){
  localSave(); if(!user||syncBusy)return;
  try{syncBusy=true;await setDoc(doc(db,"users",user.uid,"state","main"),{...clone(d),updatedAt:new Date().toISOString()});setSyncStatus("Synced to Firebase")}
  catch(e){console.error(e);setSyncStatus("Cloud sync failed — local copy kept")}
  finally{syncBusy=false}
}
function dedupe(){
  const uniq=(arr,key)=>{const m=new Map();for(const x of arr)m.set(x[key]||JSON.stringify(x),x);return [...m.values()]};
  d.logs=uniq(d.logs,"id");d.errors=uniq(d.errors,"id");d.mocks=uniq(d.mocks,"id");
}
async function loadCloud(){
  if(!user)return;
  try{
    const ref=doc(db,"users",user.uid,"state","main"),snap=await getDoc(ref),local=clone(d);
    if(snap.exists()){
      const remote=snap.data();d={...emptyState(),...remote};d.page=local.page||d.page;
      d.logs=[...(d.logs||[]),...(local.logs||[])];d.errors=[...(d.errors||[]),...(local.errors||[])];d.mocks=[...(d.mocks||[]),...(local.mocks||[])];
      for(const [date,tasks] of Object.entries(local.tasks||{}))if(!d.tasks[date])d.tasks[date]=tasks;
      dedupe();await setDoc(ref,{...clone(d),updatedAt:new Date().toISOString()});setSyncStatus("Cloud data loaded + local data merged");
    }else{await setDoc(ref,{...clone(local),updatedAt:new Date().toISOString()});setSyncStatus("Local progress migrated to Firebase")}
    localSave();render();
  }catch(e){console.error(e);setSyncStatus("Firebase unavailable — using local copy");render()}
}
function tasks(){
  const k=today();
  if(!d.tasks[k])d.tasks[k]=[["Learn + solve "+P[W()-1][0],120],["PYQs / timed problems",120],["Active recall + error log",60],["GA / Math maintenance",60]].map((x,i)=>({id:k+i,t:x[0],m:x[1],done:false}));
  localSave();return d.tasks[k]
}
function mentor(){
  const a=d.logs.reduce((s,x)=>s+x.a,0),c=d.logs.reduce((s,x)=>s+x.c,0);
  if(!a&&!d.errors.length)return"Start today’s four blocks. Log practice and errors so the mentor can adapt your priorities.";
  const r=pct(c,a);if(d.errors.length>=5)return"Correct your latest three errors before adding more volume.";
  if(r<65)return"Recent accuracy is "+r+"%. Strengthen concepts before increasing speed.";
  if(r>=85)return"Recent accuracy is "+r+"%. Preserve accuracy while adding timed sets.";
  return"Keep the learning → PYQ → recall → error-log loop consistent."
}
function nav(x){d.page=x;cloudSave();render()}
function dash(){
  const t=tasks(),z=t.filter(x=>x.done).length,m=t.filter(x=>x.done).reduce((a,x)=>a+x.m,0),l=d.logs.slice(-7),ac=l.length?pct(l.reduce((a,x)=>a+x.c,0),l.reduce((a,x)=>a+x.a,0)):0;
  return '<div class="grid stats"><div class="card"><div class="muted">Today</div><div class="value">'+pct(z,t.length)+'%</div><div class="small">'+z+'/'+t.length+' blocks</div></div><div class="card"><div class="muted">Focused minutes</div><div class="value">'+m+'</div></div><div class="card"><div class="muted">7-day accuracy</div><div class="value">'+(ac||"—")+'%</div></div><div class="card"><div class="muted">Week</div><div class="value">'+W()+'/19</div><div class="small">'+P[W()-1][0]+'</div></div></div>'+
  '<div class="grid two" style="margin-top:15px"><div class="card"><div class="row"><h2>Today’s plan</h2><span class="pill">'+P[W()-1][0]+'</span></div><div class="bar"><i style="width:'+pct(z,t.length)+'%"></i></div>'+t.map(x=>'<label class="task '+(x.done?"done":"")+'"><input type="checkbox" '+(x.done?"checked":"")+' onchange="toggle(\''+x.id+'\')"> <b>'+x.t+'</b><div class="small">'+x.m+' min</div></label>').join("")+'</div>'+
  '<div class="card"><h2>✦ AI Mentor</h2><p>'+mentor()+'</p><div class="actions"><button class="btn primary" onclick="nav(\'analytics\')">Performance</button><button class="btn" onclick="err()">Log error</button></div></div></div>'+
  '<div class="grid two" style="margin-top:15px"><div class="card"><h2>19-week roadmap</h2>'+P.map((x,i)=>'<div class="task"><div class="row"><b>W'+(i+1)+' · '+x[0]+'</b><span class="small">'+x[1]+'</span></div></div>').join("")+'</div><div class="card"><h2>Mentor rules</h2>'+["Retrieval before rereading","PYQs are training data","D+1 / D+3 / D+7 / D+14 / D+30 review","Analyze mocks after every test","Accuracy before speed","Protect 7–8h sleep"].map(x=>'<div class="task">'+x+'</div>').join("")+'</div></div>'
}
function analytics(){
  let A=d.logs.reduce((s,x)=>s+x.a,0),C=d.logs.reduce((s,x)=>s+x.c,0),by={};d.logs.forEach(x=>{by[x.s]??={a:0,c:0};by[x.s].a+=x.a;by[x.s].c+=x.c});
  return '<div class="grid stats"><div class="card"><div class="muted">Attempts</div><div class="value">'+A+'</div></div><div class="card"><div class="muted">Accuracy</div><div class="value">'+(A?pct(C,A):"—")+'%</div></div><div class="card"><div class="muted">Errors</div><div class="value">'+d.errors.length+'</div></div><div class="card"><div class="muted">Mocks</div><div class="value">'+d.mocks.length+'</div></div></div>'+
  '<div class="card" style="margin-top:15px"><h2>Subject performance</h2><table class="table"><tr><th>Subject</th><th>Attempts</th><th>Accuracy</th></tr>'+S.map(s=>{let v=by[s]||{a:0,c:0};return '<tr><td>'+s+'</td><td>'+v.a+'</td><td>'+(v.a?pct(v.c,v.a)+"%":"—")+'</td></tr>'}).join("")+'</table></div>'+
  '<div class="card" style="margin-top:15px"><div class="row"><h2>Practice log</h2><button class="btn primary" onclick="log()">+ Add</button></div>'+(d.logs.length?'<table class="table"><tr><th>Date</th><th>Subject</th><th>Attempts</th><th>Correct</th></tr>'+d.logs.slice().reverse().map(x=>'<tr><td>'+x.date+'</td><td>'+x.s+'</td><td>'+x.a+'</td><td>'+x.c+'</td></tr>').join("")+'</table>':'<p class="muted">No practice logged yet.</p>')+'</div>'
}
function errors(){return '<div class="card"><div class="row"><h2>Error log</h2><button class="btn primary" onclick="err()">+ Add</button></div>'+(d.errors.length?d.errors.slice().reverse().map(x=>'<div class="task"><b>'+x.s+'</b> <span class="pill">'+x.type+'</span><p class="small">'+x.n+'</p><span class="small">'+x.date+'</span></div>').join(""):'<p class="muted">No errors logged yet.</p>')+'</div>'}
function mocks(){return '<div class="card"><div class="row"><h2>Mock tracker</h2><button class="btn primary" onclick="mock()">+ Add</button></div>'+(d.mocks.length?'<table class="table"><tr><th>Date</th><th>Type</th><th>Marks</th><th>Accuracy</th></tr>'+d.mocks.slice().reverse().map(x=>'<tr><td>'+x.date+'</td><td>'+x.type+'</td><td>'+x.marks+'</td><td>'+x.acc+'%</td></tr>').join("")+'</table>':'<p class="muted">No mocks recorded yet.</p>')+'</div>'}
function roadmap(){return '<div class="grid three">'+P.map((x,i)=>'<div class="card"><div class="eyebrow">Week '+(i+1)+'</div><h2>'+x[0]+'</h2><div class="small">'+x[1]+'</div></div>').join("")+'</div>'}
function modal(h){document.getElementById("modal").innerHTML='<div class="modalbox">'+h+'</div>';document.getElementById("modal").classList.add("show")}
function closeM(){document.getElementById("modal").classList.remove("show")}
function toggle(i){const x=tasks().find(x=>x.id==i);if(!x)return;x.done=!x.done;cloudSave();render()}
function log(){modal('<h2>Log practice</h2><label>Subject</label><select id="s">'+S.map(x=>'<option>'+x+'</option>').join("")+'</select><label>Attempts</label><input id="a" type="number" value="20"><label>Correct</label><input id="c" type="number" value="15"><div class="actions"><button class="btn primary" onclick="saveLog()">Save</button><button class="btn" onclick="closeM()">Cancel</button></div>')}
function saveLog(){let a=+document.getElementById("a").value,c=+document.getElementById("c").value;if(!a||c<0||c>a)return;d.logs.push({id:newId(),date:today(),s:document.getElementById("s").value,a,c});cloudSave();closeM();render()}
function err(){modal('<h2>Log error</h2><label>Subject</label><select id="es">'+S.map(x=>'<option>'+x+'</option>').join("")+'</select><label>Type</label><select id="et">'+["Concept","Knowledge","Reading","Calculation","Silly/Careless","Time"].map(x=>'<option>'+x+'</option>').join("")+'</select><label>Correction</label><textarea id="en" rows="4"></textarea><div class="actions"><button class="btn primary" onclick="saveErr()">Save</button><button class="btn" onclick="closeM()">Cancel</button></div>')}
function saveErr(){let n=document.getElementById("en").value.trim();if(!n)return;d.errors.push({id:newId(),date:today(),s:document.getElementById("es").value,type:document.getElementById("et").value,n});cloudSave();closeM();render()}
function mock(){modal('<h2>Record mock</h2><label>Type</label><select id="mt"><option>Full Mock</option><option>Sectional Mock</option><option>PYQ Test</option></select><label>Marks / 100</label><input id="mm" type="number" value="60"><label>Accuracy %</label><input id="ma" type="number" value="75"><div class="actions"><button class="btn primary" onclick="saveMock()">Save</button><button class="btn" onclick="closeM()">Cancel</button></div>')}
function saveMock(){d.mocks.push({id:newId(),date:today(),type:document.getElementById("mt").value,marks:+document.getElementById("mm").value,acc:+document.getElementById("ma").value});cloudSave();closeM();render()}
async function login(){try{await signInWithPopup(auth,provider)}catch(e){console.error(e);alert("Firebase sign-in failed: "+e.message)}}
async function logout(){await signOut(auth)}
function render(){
  if(!user){document.getElementById("app").innerHTML='<div class="authscreen"><div class="authcard"><div class="brand">GATE <b>AI Mentor</b></div><div class="eyebrow">CSE 2027 · Firebase enabled</div><h1>Your study progress, synced.</h1><p class="muted">Sign in with Google to sync daily tasks, practice logs, errors and mock scores across devices.</p><button class="btn primary wide" onclick="login()">Continue with Google</button><div class="small authnote">Your Firebase account controls access to your private study data.</div></div></div>';return}
  const c=d.page==="dash"?dash():d.page==="analytics"?analytics():d.page==="roadmap"?roadmap():d.page==="errors"?errors():mocks();
  document.getElementById("app").innerHTML='<div class="shell"><aside class="side"><div class="brand">GATE <b>AI Mentor</b></div><div class="muted">CSE 2027 · study OS</div><div class="userbox"><div class="avatar">'+((user.displayName||user.email||"U")[0].toUpperCase())+'</div><div><b>'+((user.displayName||"Student"))+'</b><div class="small">'+(user.email||"")+'</div></div></div><div class="sync" id="syncStatus">Firebase connected</div><div class="nav">'+[["dash","⌂ Dashboard"],["analytics","◈ Performance"],["roadmap","▦ Roadmap"],["errors","⚠ Error Log"],["mocks","◫ Mock Tracker"]].map(x=>'<button class="'+(d.page===x[0]?"active":"")+'" onclick="nav(\''+x[0]+'\')">'+x[1]+'</button>').join("")+'</div><button class="btn logout" onclick="logout()">Sign out</button></aside><main class="main"><div class="top"><div><div class="eyebrow">GATE CSE 2027</div><div class="title">AI Study & Performance Tracker</div><div class="muted">Week '+W()+' · '+P[W()-1][0]+' · '+new Date().toLocaleDateString("en-IN")+'</div></div><button class="btn primary" onclick="log()">Log practice</button></div>'+c+'</main></div><div id="modal" class="modal"></div>'
}
Object.assign(window,{nav,toggle,log,saveLog,err,saveErr,mock,saveMock,closeM,login,logout});
onAuthStateChanged(auth,async u=>{user=u;if(u)await loadCloud();else render()});
render();