/*
 * make-samples.js — regenerate the test fixtures in samples/
 *
 *     node scripts/make-samples.js
 *
 * Produces three deliberately different report files to exercise "Merge report
 * files" / consolidator.html:
 *   - sample-mobile-app.html  : a full native export (baked into index.html)
 *   - sample-datacenter.html  : a minimal, different-layout page whose savedData
 *                               uses a loose schema (risk `severity`, missing ids)
 *   - sample-ai-platform.html : a program dashboard with a FOREIGN schema
 *                               (report/sprints/epics/raid/kpis/retro) that the
 *                               combine adapter maps into the report schema
 */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'samples');
fs.mkdirSync(OUT, { recursive: true });
const enc = o => JSON.stringify(o).replace(/</g, '\\u003c');
const S = '<' + '/script>'; // literal </script> without tripping any HTML parser

/* ============ A — Mobile Banking App v2 (native full export) ============ */
const A = {
  meta:{projectCode:'MB2',logo:'M',eyebrow:'Progress Report · Digital Banking',
    titleLead:'Mobile Banking',titleAccent:'App v2 Rollout',
    subtitle:'Rebuilding the retail mobile app on a new cross-platform stack with biometric login, instant transfers and in-app support across iOS and Android.',
    presenter:'L. Nguyen',department:'Digital Banking',period:'Week 24 · 2026',updatedDate:'Jul 16, 2026',
    startDate:'Feb 01, 2026',endDate:'Aug 31, 2026',statusLabel:'In Progress'},
  kpis:[{id:'k1',label:'Features Shipped',value:84,suffix:'/ 120',sub:'▲ +11 this week',tone:'up',icon:'check'},
    {id:'k2',label:'Crash-free Sessions',value:99.2,suffix:'%',sub:'Target 99.5%',tone:'',icon:'trending'},
    {id:'k3',label:'Beta Testers',value:540,suffix:'',sub:'Across 32 devices',tone:'',icon:'person'}],
  timeline:[
    {id:'a1',idx:'01',title:'Discovery',dateStart:'Feb 01',dateEnd:'Feb 21',pct:100,status:'done',icon:'search',note:'12 journeys mapped',side:{type:'stat',label:'Journeys',value:12,suffix:'',icon:'check'}},
    {id:'a2',idx:'02',title:'UX & Design',dateStart:'Feb 24',dateEnd:'Mar 28',pct:100,status:'done',icon:'layout',note:'Design system v2',side:{type:'highlight',label:'Highlight',title:'40% fewer taps to transfer',text:'The redesigned transfer flow cuts steps from 5 to 3.'}},
    {id:'a3',idx:'03',title:'Core Build',dateStart:'Mar 31',dateEnd:'Jun 27',pct:68,status:'active',icon:'code',note:'6 squads in parallel',side:{type:'strategy',label:'On plan',title:'',text:'Auth and transfers are feature-complete; payments in progress.'}},
    {id:'a4',idx:'04',title:'Security & UAT',dateStart:'Jun 30',dateEnd:'Aug 08',pct:15,status:'wait',icon:'flask',note:'Pen-test + UAT',side:{type:'progress',label:'Items to watch',bars:[{name:'In-app Support',pct:30,bad:true},{name:'Notifications',pct:12,bad:true}]}},
    {id:'a5',idx:'05',title:'Store Release',dateStart:'Aug 11',dateEnd:'Aug 31',pct:0,status:'wait',icon:'rocket',note:'iOS + Android',side:{type:'lesson',label:'Next milestone · Aug 31',title:'Public launch',text:'Phased rollout 10% → 100% over 2 weeks.'}}],
  workstreams:[{id:'w1',name:'Auth & Biometrics',sub:'18/20 features',pct:90,tone:'ok'},
    {id:'w2',name:'Transfers',sub:'23/31 features',pct:74,tone:'active'},
    {id:'w3',name:'Cards & Payments',sub:'16/29 features',pct:55,tone:'active'},
    {id:'w4',name:'In-app Support',sub:'6/20 features',pct:30,tone:'warn'},
    {id:'w5',name:'Push Notifications',sub:'2/17 features',pct:12,tone:'bad'}],
  risks:[{id:'r1',impact:'high',likelihood:'med',status:'Mitigating',title:'App Store review delay',desc:'First submission may bounce on privacy nutrition labels.',owner:'L. Nguyen',due:'Aug 10'},
    {id:'r2',impact:'med',likelihood:'high',status:'Open',title:'Biometric SDK fragmentation',desc:'Face/fingerprint APIs vary across older Android devices.',owner:'P. Vo',due:'Jul 28'},
    {id:'r3',impact:'low',likelihood:'low',status:'Monitoring',title:'Analytics opt-in rate',desc:'Opt-in consent may reduce funnel visibility.',owner:'K. Ha',due:'Aug 20'}],
  lessons:[{id:'l1',category:'well',title:'Design system reuse',text:'Shared components cut UI build time by ~35%.'},
    {id:'l2',category:'improve',title:'Earlier device-lab access',text:'Late access to physical devices delayed biometric testing.'}],
  charts:[{id:'c1',title:'Progress by Workstream',type:'hbar',source:'workstreams'},{id:'c2',title:'Risk Distribution',type:'donut',source:'risks'}],
  media:[],
  deck:[{id:'d-cover',type:'cover',on:true},{id:'d-agenda',type:'agenda',on:true},{id:'d-summary',type:'summary',on:true},{id:'d-timeline',type:'timeline',on:true},{id:'d-workstreams',type:'workstreams',on:true},{id:'d-risks',type:'risks',on:true},{id:'d-lessons',type:'lessons',on:true},{id:'d-closing',type:'closing',on:true}]
};
const app = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SLOT = '<script id="savedData" type="application/json">' + S;
if (app.indexOf(SLOT) < 0) { console.error('index.html has no empty savedData slot.'); process.exit(1); }
fs.writeFileSync(path.join(OUT, 'sample-mobile-app.html'),
  app.replace(SLOT, '<script id="savedData" type="application/json">' + enc({ schemaVersion:2, fileId:'sampleA', savedAt:'2026-07-16T02:00:00.000Z', data:A }) + S));

/* ============ B — Data Center Migration (minimal page, loose schema) ============ */
const B = {
  meta:{projectCode:'DCM',logo:'D',eyebrow:'Progress Report · Infrastructure',
    titleLead:'Data Center',titleAccent:'Migration',region:'APAC',
    subtitle:'Migrating 60 legacy workloads from the on-prem DC to the new colocation facility with zero-downtime cutover and DR validation.',
    presenter:'M. Tran',department:'Infrastructure',period:'Week 24 · 2026',updatedDate:'Jul 15, 2026',
    startDate:'Jan 15, 2026',endDate:'Jul 31, 2026',statusLabel:'At Risk'},
  kpis:[{label:'Workloads Migrated',value:22,suffix:'/ 60',sub:'Wave 1 of 2',tone:'up',icon:'check'},
    {label:'Unplanned Downtime',value:0,suffix:'min',sub:'Zero so far',tone:'',icon:'clock'},
    {label:'DR Tests Passed',value:4,suffix:'/ 10',sub:'2 failed, retrying',tone:'warn',icon:'alert'}],
  timeline:[ // NOTE: no `id` fields -> ensureIds() must fill them on merge
    {idx:'01',title:'Assessment',dateStart:'Jan 15',dateEnd:'Feb 14',pct:100,status:'done',icon:'search',note:'60 workloads profiled'},
    {idx:'02',title:'Network Buildout',dateStart:'Feb 17',dateEnd:'Mar 27',pct:100,status:'done',icon:'layout',note:'Dual 10G links live'},
    {idx:'03',title:'Wave 1 Migration',dateStart:'Mar 30',dateEnd:'Jun 05',pct:60,status:'active',icon:'rocket',note:'22/40 apps moved'},
    {idx:'04',title:'Wave 2 Migration',dateStart:'Jun 08',dateEnd:'Jul 17',pct:20,status:'active',icon:'rocket',note:'DB tier next'},
    {idx:'05',title:'Decommission',dateStart:'Jul 20',dateEnd:'Jul 31',pct:0,status:'wait',icon:'flag',note:'Power down old DC'}],
  workstreams:[{name:'Compute & Storage',sub:'32/40 nodes',pct:80,tone:'active'},
    {name:'Networking',sub:'complete',pct:100,tone:'ok'},
    {name:'Wave 1 Apps',sub:'22/40 apps',pct:60}, // tone omitted -> defaults
    {name:'Wave 2 Apps',sub:'4/20 apps',pct:20,tone:'warn'},
    {name:'DR Validation',sub:'4/10 tests',pct:10,tone:'bad'}],
  risks:[{title:'Cutover window overrun',severity:'high',likelihood:'high',status:'Open',desc:'Wave 2 DB cutover may exceed the 4-hour maintenance window.',owner:'M. Tran',due:'Jul 22'}, // `severity` not `impact`
    {title:'Legacy app compatibility',impact:'high',likelihood:'med',status:'Mitigating',desc:'Two apps need a re-platform before Wave 2.',owner:'T. Bui',due:'Jul 25'},
    {title:'Bandwidth to colo',impact:'med',likelihood:'low',status:'Resolved',desc:'Second circuit provisioned; contention resolved.',owner:'N. Do',due:'Jul 05'}],
  lessons:[{category:'well',title:'Automated inventory',text:'Agent-based discovery caught 9 undocumented services.'},
    {category:'improve',title:'Vendor lead times',text:'Cross-connect provisioning took 3 weeks longer than planned.'},
    {category:'know',title:'Runbook template',text:'The per-wave cutover runbook is reusable for future DC moves.'}]
};
const payloadB = enc({ schemaVersion:2, fileId:'sampleB', savedAt:'2026-07-15T09:00:00.000Z', data:B });
const bParts = [
'<!DOCTYPE html>',
'<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
'<title>Data Center Migration — Status</title>',
'<style>',
'  body{margin:0;background:#0b1220;color:#e6edf6;font-family:ui-sans-serif,system-ui,Segoe UI,Arial,sans-serif;line-height:1.5}',
'  .wrap{max-width:680px;margin:0 auto;padding:2.5rem 1.5rem}',
'  .tag{font:600 .7rem/1 ui-monospace,monospace;letter-spacing:.15em;text-transform:uppercase;color:#5eead4}',
'  h1{font-size:2rem;margin:.3rem 0 .1rem}.by{color:#93a4bd;margin:0 0 1.4rem}',
'  .big{font:800 3.2rem/1 ui-monospace,monospace;color:#a3e635}',
'  table{width:100%;border-collapse:collapse;margin:1.2rem 0}',
'  th,td{text-align:left;padding:.5rem .4rem;border-bottom:1px solid #1e293b;font-size:.9rem}',
'  th{color:#93a4bd;font-weight:600}.note{color:#64748b;font-size:.8rem;margin-top:1.5rem}',
'</style></head>',
'<body>',
'  <div class="wrap">',
'    <div class="tag" id="tag"></div>',
'    <h1 id="title"></h1>',
'    <p class="by" id="by"></p>',
'    <div class="big" id="pct"></div>',
'    <div class="tag">Overall progress</div>',
'    <table><thead><tr><th>#</th><th>Phase</th><th>Dates</th><th>%</th><th>Status</th></tr></thead><tbody id="rows"></tbody></table>',
'    <p class="note">This file uses a completely different layout, but it embeds the same <code>savedData</code> contract — so the Report Consolidator can still combine it. Open <code>consolidator.html</code> and drop this file in.</p>',
'  </div>',
'  <script id="savedData" type="application/json">' + payloadB + S,
'  <script>',
'    (function(){',
'      try{',
'        var raw=document.getElementById("savedData").textContent;',
'        var d=(JSON.parse(raw).data)||{};',
'        var m=d.meta||{}, tl=d.timeline||[];',
'        var pct=tl.length?Math.round(tl.reduce(function(s,t){return s+(Number(t.pct)||0)},0)/tl.length):0;',
'        document.getElementById("tag").textContent=m.eyebrow||"Progress report";',
'        document.getElementById("title").textContent=(m.titleLead||"")+" "+(m.titleAccent||"");',
'        document.getElementById("by").textContent="By "+(m.presenter||"—")+" · "+(m.period||"")+" · "+(m.statusLabel||"");',
'        document.getElementById("pct").textContent=pct+"%";',
'        document.getElementById("rows").innerHTML=tl.map(function(t){return "<tr><td>"+(t.idx||"")+"</td><td>"+(t.title||"")+"</td><td>"+(t.dateStart||"")+" – "+(t.dateEnd||"")+"</td><td>"+(Number(t.pct)||0)+"%</td><td>"+(t.status||"")+"</td></tr>";}).join("");',
'      }catch(e){ document.getElementById("title").textContent="Data Center Migration"; }',
'    })();',
'  ' + S,
'</body></html>'
];
fs.writeFileSync(path.join(OUT, 'sample-datacenter.html'), bParts.join('\n'));

/* ============ C — Enterprise AI Platform (FOREIGN schema program dashboard) ============ */
const C = {
  schema:"program-status/1.2",
  report:{programme:"Enterprise AI Platform",code:"EAIP",owner:"R. Kapoor",org:"Data & AI Platform",
    reportingPeriod:"2026 · Q3 (W29)",asOf:"Jul 16, 2026",health:"amber",
    window:{start:"Jan 05, 2026",end:"Dec 18, 2026"},
    summary:"Standing up a governed, multi-tenant AI platform: feature store, model registry, serving and guardrails across 4 business units."},
  sprints:[
    {code:"S0",name:"Foundations",window:"Jan 05 – Feb 13",completion:100,state:"complete"},
    {code:"S1",name:"Feature Store",window:"Feb 16 – Apr 02",completion:100,state:"complete"},
    {code:"S2",name:"Model Registry",window:"Apr 06 – May 22",completion:88,state:"in-progress"},
    {code:"S3",name:"Serving & Guardrails",window:"May 25 – Aug 07",completion:46,state:"in-progress"},
    {code:"S4",name:"BU Onboarding",window:"Aug 10 – Oct 16",completion:8,state:"planned"},
    {code:"S5",name:"GA & Handover",window:"Oct 19 – Dec 18",completion:0,state:"planned"}],
  epics:[
    {epic:"Feature Store",done:60,total:60,health:"green"},
    {epic:"Model Registry",done:44,total:50,health:"green"},
    {epic:"Serving Runtime",done:33,total:72,health:"amber"},
    {epic:"Guardrails & Eval",done:12,total:40,health:"red"},
    {epic:"Observability",done:18,total:30,health:"amber"},
    {epic:"Access & Governance",done:9,total:28,health:"red"}],
  raid:{
    risks:[
      {summary:"GPU capacity shortfall for serving",impact:"H",probability:"H",state:"Open",owner:"R. Kapoor",target:"Aug 05",mitigation:"Reserve A100 pool + spot fallback"},
      {summary:"Guardrail eval coverage below bar",impact:"H",probability:"M",state:"Mitigating",owner:"S. Okafor",target:"Jul 30"},
      {summary:"Multi-tenant isolation review pending",impact:"M",probability:"M",state:"Open",owner:"J. Lim",target:"Aug 12"}],
    issues:[
      {summary:"Feature backfill jobs OOM on large tenants",impact:"M",probability:"H",state:"Open",owner:"D. Park",target:"Jul 24"},
      {summary:"Registry API rate limits hit in CI",impact:"L",probability:"M",state:"Resolved",owner:"A. Silva",target:"Jul 10"}]},
  kpis:[
    {metric:"Models in Production",current:7,target:20,trend:"+2 this month"},
    {metric:"Platform Uptime",current:99.85,unit:"%",trend:"SLO 99.9%"},
    {metric:"Onboarded BUs",current:2,target:4},
    {metric:"Eval Pass Rate",current:63,unit:"%",trend:"needs 90%"}],
  retro:{
    good:[{title:"Feature store adoption",text:"3 teams migrated ahead of plan."}],
    improve:[{title:"Capacity forecasting",text:"GPU demand outran the quarterly plan by ~40%."}],
    keep:[{title:"Golden-path templates",text:"Cookiecutter model repo reused across 5 projects."}]},
  financials:{budgetUsd:4200000,spentUsd:2510000,forecastUsd:4350000},
  team:[{name:"R. Kapoor",role:"Program Lead"},{name:"S. Okafor",role:"ML Eng Lead"}]
};
const payloadC = enc(C);
const cParts = [
'<!DOCTYPE html>',
'<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
'<title>Enterprise AI Platform — Program Status</title>',
'<style>',
':root{--bg:#0a0f1a;--panel:#111a2b;--line:#1e2b45;--ink:#e8eefc;--dim:#94a6c9;--g:#34d399;--a:#fbbf24;--r:#f87171;--acc:#7dd3fc}',
'*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,"Segoe UI",Arial,sans-serif;line-height:1.5}',
'.wrap{max-width:1080px;margin:0 auto;padding:2.4rem 1.4rem}',
'.top{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:1.2rem}',
'.kick{font:600 .7rem/1 ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--acc)}',
'h1{margin:.35rem 0 .1rem;font-size:2.1rem}.sub{color:var(--dim);max-width:60ch;margin:.2rem 0 0}',
'.pill{font:600 .72rem/1 ui-monospace,monospace;padding:.4rem .7rem;border-radius:99px;text-transform:uppercase;letter-spacing:.08em}',
'.pill.amber{background:rgba(251,191,36,.16);color:var(--a);border:1px solid rgba(251,191,36,.4)}',
'.meta{display:flex;gap:1.6rem;flex-wrap:wrap;color:var(--dim);font-size:.85rem;margin-top:1rem}.meta b{color:var(--ink)}',
'.grid{display:grid;gap:1rem;margin-top:1.6rem}.kpis{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}',
'.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:1rem 1.1rem}',
'.kpi .n{font:800 2rem/1 ui-monospace,monospace;color:var(--acc)}.kpi .n small{font-size:.5em;color:var(--dim)}',
'.kpi .l{font:600 .68rem/1.3 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:.5rem}',
'.kpi .t{color:var(--dim);font-size:.78rem;margin-top:.3rem}h2{font-size:1.05rem;margin:2rem 0 .7rem}',
'.spr{display:flex;align-items:center;gap:.9rem;padding:.5rem 0;border-bottom:1px solid var(--line)}',
'.spr .c{font:700 .78rem/1 ui-monospace,monospace;color:var(--acc);width:2.2rem}',
'.spr .nm{flex:1;min-width:0}.spr .nm b{font-weight:600}.spr .nm span{color:var(--dim);font-size:.78rem;margin-left:.5rem}',
'.spr .bar{width:180px;height:8px;border-radius:99px;background:#0c1526;overflow:hidden}',
'.spr .bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--acc),var(--g))}',
'.spr .p{font:700 .85rem/1 ui-monospace,monospace;width:3rem;text-align:right}',
'.epics{grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}.epic b{font-weight:600}.epic .e{display:flex;justify-content:space-between;margin-bottom:.5rem}',
'.epic .dot{width:9px;height:9px;border-radius:50%;display:inline-block;margin-right:.4rem}',
'.epic .bar{height:7px;border-radius:99px;background:#0c1526;overflow:hidden}.epic .bar i{display:block;height:100%}',
'table{width:100%;border-collapse:collapse;font-size:.85rem}th,td{text-align:left;padding:.55rem .5rem;border-bottom:1px solid var(--line);vertical-align:top}',
'th{color:var(--dim);font-weight:600;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em}',
'.tag{font:600 .68rem/1 ui-monospace,monospace;padding:.2rem .5rem;border-radius:6px}',
'.H{background:rgba(248,113,113,.16);color:var(--r)}.M{background:rgba(251,191,36,.16);color:var(--a)}.L{background:rgba(52,211,153,.16);color:var(--g)}',
'.note{color:#5b6b8c;font-size:.78rem;margin-top:2rem;border-top:1px solid var(--line);padding-top:1rem}.note code{background:#0c1526;padding:.05rem .35rem;border-radius:5px}',
'</style></head>',
'<body><div class="wrap" id="app"></div>',
'<script type="application/json" id="programData">' + payloadC + S,
'<script>',
'(function(){',
' var col={green:"var(--g)",amber:"var(--a)",red:"var(--r)"};',
' function esc(s){return String(s==null?"":s).replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})}',
' var D; try{ D=JSON.parse(document.getElementById("programData").textContent); }catch(e){ document.getElementById("app").textContent="data error"; return; }',
' var r=D.report||{}, s=D.sprints||[], ep=D.epics||[], raid=D.raid||{}, k=D.kpis||[];',
' var overall=s.length?Math.round(s.reduce(function(a,x){return a+(+x.completion||0)},0)/s.length):0;',
' var kpis=k.map(function(x){var suf=x.target!=null?("/ "+x.target):(x.unit||"");return "<div class=\\"card kpi\\"><div class=\\"l\\">"+esc(x.metric)+"</div><div class=\\"n\\">"+esc(x.current)+"<small>"+esc(suf)+"</small></div><div class=\\"t\\">"+esc(x.trend||"")+"</div></div>"}).join("");',
' var sprints=s.map(function(x){return "<div class=\\"spr\\"><span class=\\"c\\">"+esc(x.code)+"</span><span class=\\"nm\\"><b>"+esc(x.name)+"</b><span>"+esc(x.window)+" · "+esc(x.state)+"</span></span><span class=\\"bar\\"><i style=\\"width:"+(+x.completion||0)+"%\\"></i></span><span class=\\"p\\">"+(+x.completion||0)+"%</span></div>"}).join("");',
' var epics=ep.map(function(x){var p=x.total?Math.round(x.done/x.total*100):0;return "<div class=\\"card epic\\"><div class=\\"e\\"><b><span class=\\"dot\\" style=\\"background:"+(col[x.health]||"var(--dim)")+"\\"></span>"+esc(x.epic)+"</b><span style=\\"color:var(--dim)\\">"+x.done+"/"+x.total+"</span></div><div class=\\"bar\\"><i style=\\"width:"+p+"%;background:"+(col[x.health]||"var(--acc)")+"\\"></i></div></div>"}).join("");',
' var allR=(raid.risks||[]).concat(raid.issues||[]);',
' var rows=allR.map(function(x){return "<tr><td>"+esc(x.summary)+"</td><td><span class=\\"tag "+esc(x.impact)+"\\">"+esc(x.impact)+"</span></td><td><span class=\\"tag "+esc(x.probability)+"\\">"+esc(x.probability)+"</span></td><td>"+esc(x.state)+"</td><td>"+esc(x.owner)+"</td><td>"+esc(x.target)+"</td></tr>"}).join("");',
' document.getElementById("app").innerHTML=',
'  "<div class=\\"top\\"><div><div class=\\"kick\\">"+esc(r.reportingPeriod||"")+" · "+esc(r.org||"")+"</div><h1>"+esc(r.programme||"")+"</h1><p class=\\"sub\\">"+esc(r.summary||"")+"</p></div><span class=\\"pill amber\\">"+esc(r.health||"")+"</span></div>"+',
'  "<div class=\\"meta\\"><span>Owner: <b>"+esc(r.owner||"")+"</b></span><span>As of: <b>"+esc(r.asOf||"")+"</b></span><span>Window: <b>"+esc((r.window||{}).start)+" → "+esc((r.window||{}).end)+"</b></span><span>Overall: <b>"+overall+"%</b></span></div>"+',
'  "<div class=\\"grid kpis\\">"+kpis+"</div>"+',
'  "<h2>Sprints</h2>"+sprints+',
'  "<h2>Epics</h2><div class=\\"grid epics\\">"+epics+"</div>"+',
'  "<h2>Risks &amp; Issues (RAID)</h2><table><thead><tr><th>Summary</th><th>Impact</th><th>Prob</th><th>State</th><th>Owner</th><th>Target</th></tr></thead><tbody>"+rows+"</tbody></table>"+',
'  "<p class=\\"note\\">Different tool, different data shape (<code>report / sprints / epics / raid / kpis / retro</code>) — no <code>timeline</code>, <code>workstreams</code> or <code>impact/likelihood</code> fields. The Report Consolidator maps it into the report schema automatically.</p>";',
'})();',
S,
'</body></html>'
];
fs.writeFileSync(path.join(OUT, 'sample-ai-platform.html'), cParts.join('\n'));

const kb = f => Math.round(fs.statSync(path.join(OUT, f)).size / 1024);
console.log('Wrote samples/:');
['sample-mobile-app.html','sample-datacenter.html','sample-ai-platform.html'].forEach(f => console.log('  ' + f + '  (' + kb(f) + ' KB)'));
