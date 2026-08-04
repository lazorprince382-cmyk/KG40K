const fs=require("fs");
const assert=require("assert");
const password=process.env.LEGAL_TEST_PASSWORD;
let socket,nextId=1;
const pending=new Map(),exceptions=[];
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const result=await send("Runtime.evaluate",{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result.value;}
async function waitFor(expression,timeout=20000){const start=Date.now();while(Date.now()-start<timeout){if(await evaluate(`Boolean(${expression})`))return;await new Promise(r=>setTimeout(r,250));}throw new Error(`Timed out: ${expression}`);}

async function main(){
  assert(password,"LEGAL_TEST_PASSWORD is required");
  const pages=await fetch("http://127.0.0.1:9233/json/list").then(r=>r.json()),page=pages.find(x=>x.type==="page");
  assert(page,"Legal browser page not found");
  socket=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener("open",resolve,{once:true});socket.addEventListener("error",reject,{once:true});});
  socket.addEventListener("message",event=>{const message=JSON.parse(event.data);if(message.id&&pending.has(message.id)){const item=pending.get(message.id);pending.delete(message.id);message.error?item.reject(new Error(message.error.message)):item.resolve(message.result);}else if(message.method==="Runtime.exceptionThrown")exceptions.push(message.params.exceptionDetails.text);});
  await send("Runtime.enable");await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride",{width:1536,height:960,deviceScaleFactor:1,mobile:false});
  await waitFor(`document.querySelector('#login-form') || document.querySelector('.legal-command')`);
  if(await evaluate(`Boolean(document.querySelector('#login-form'))`))await evaluate(`(()=>{document.querySelector('input[name=email]').value='legal@kasangatig40.test';document.querySelector('input[name=password]').value=${JSON.stringify(password)};document.querySelector('#login-form').requestSubmit();return true;})()`);
  await waitFor(`document.querySelector('.legal-command')`,25000);
  const navigation=await evaluate(`Array.from(document.querySelectorAll('.legal-sidebar .nav-item')).map(x=>x.textContent.trim())`);
  assert.equal(navigation[0],"Dashboard");assert.equal(navigation[1],"Bio Data");
  await evaluate(`document.querySelector('[data-page="legal-bio-data"]').click()`);
  await waitFor(`document.querySelector('.bio-page')`);
  const desktop=await evaluate(`({heading:document.querySelector('.page-head h1')?.textContent,cards:document.querySelectorAll('.bio-card').length,stats:document.querySelectorAll('.bio-stats article').length,search:Boolean(document.querySelector('[data-bio-search]')),protected:document.body.innerText.includes('SACCO balances and loans are not shown here'),viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth})`);
  assert.equal(desktop.heading,"Member Bio Data");assert.equal(desktop.cards,6);assert.equal(desktop.stats,4);assert.equal(desktop.search,true);assert.equal(desktop.protected,true);assert.equal(desktop.scrollWidth<=desktop.viewport+1,true);
  await evaluate(`document.querySelector('[data-bio-view]').click()`);await waitFor(`document.querySelector('.bio-detail')`);
  const detail=await evaluate(`({sections:document.querySelectorAll('.bio-detail section').length,hasNationalId:document.querySelector('.bio-detail').innerText.includes('National ID'),hasEmergency:document.querySelector('.bio-detail').innerText.includes('Emergency contact')})`);
  assert.equal(detail.sections,4);assert.equal(detail.hasNationalId,true);assert.equal(detail.hasEmergency,true);
  await evaluate(`document.querySelector('.modal [data-bio-edit]').click()`);await waitFor(`document.querySelector('.bio-edit-form')`);
  const edit=await evaluate(`({fields:document.querySelectorAll('.bio-edit-form input,.bio-edit-form select,.bio-edit-form textarea').length,locked:document.querySelector('.bio-readonly-registration').innerText.includes('Verified registration identity')})`);
  assert.equal(edit.fields>=15,true);assert.equal(edit.locked,true);
  await evaluate(`closeModal();document.querySelector('[data-bio-search] input[name=q]').value='TJS-000184';document.querySelector('[data-bio-search]').requestSubmit()`);await waitFor(`document.querySelectorAll('.bio-card').length===1`);
  const searched=await evaluate(`document.querySelector('.bio-card h3').textContent`);assert.equal(searched,"Amina Nansubuga");
  await evaluate(`document.querySelector('[data-bio-clear]').click()`);await waitFor(`document.querySelectorAll('.bio-card').length>=6`);
  const screenshot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true});fs.writeFileSync("legal-biodata-preview.png",Buffer.from(screenshot.data,"base64"));
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});await new Promise(r=>setTimeout(r,500));
  const mobile=await evaluate(`({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,cards:document.querySelectorAll('.bio-card').length,stats:document.querySelectorAll('.bio-stats article').length})`);
  assert.equal(mobile.scrollWidth<=mobile.viewport+1,true);assert.equal(mobile.cards,6);assert.equal(mobile.stats,4);assert.deepEqual(exceptions,[]);
  console.log(JSON.stringify({navigation:navigation.slice(0,4),desktop,detail,edit,searched,mobile,exceptions,screenshot:"legal-biodata-preview.png"},null,2));socket.close();
}
main().catch(error=>{console.error(error);process.exitCode=1;if(socket)socket.close();});
