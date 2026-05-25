import { useState, useEffect, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const CLIENT_LIST = [
  { id: "c1",  name: "Auspex Enterprises",    industry: "Agency",         posts: 5, reels: 2, stories: 20, color: "#C9A84C" },
  { id: "c2",  name: "Bombora",               industry: "Hospitality",    posts: 6, reels: 2, stories: 20, color: "#7EB8A4" },
  { id: "c3",  name: "The Blue Sky",          industry: "Hospitality",    posts: 6, reels: 2, stories: 20, color: "#5A9BC4" },
  { id: "c4",  name: "Coastal Heritage",      industry: "Hospitality",    posts: 7, reels: 3, stories: 20, color: "#C47B5A" },
  { id: "c5",  name: "Mhatre Builders",       industry: "Construction",   posts: 7, reels: 3, stories: 20, color: "#8B7EC8" },
  { id: "c6",  name: "Seascape",              industry: "Hospitality",    posts: 5, reels: 2, stories: 20, color: "#4BA8A0" },
  { id: "c7",  name: "Eltacos",               industry: "F&B",            posts: 3, reels: 5, stories: 30, color: "#D4694A" },
  { id: "c8",  name: "Acons Realtors",        industry: "Real Estate",    posts: 7, reels: 2, stories: 20, color: "#9B8B5A" },
  { id: "c9",  name: "Bougainvillea",         industry: "Hospitality",    posts: 8, reels: 3, stories: 20, color: "#C47098" },
  { id: "c10", name: "Oceanature",            industry: "Hospitality",    posts: 8, reels: 3, stories: 20, color: "#3D8B8B" },
  { id: "c11", name: "Aangan",               industry: "Hospitality",    posts: 5, reels: 3, stories: 20, color: "#A0784C" },
  { id: "c12", name: "Serenity Dental",       industry: "Healthcare",     posts: 5, reels: 3, stories: 20, color: "#5A8FBF" },
  { id: "c13", name: "JCD",                   industry: "Construction",   posts: 5, reels: 3, stories: 20, color: "#8A6FBF" },
  { id: "c14", name: "Kokam Stories",         industry: "F&B",            posts: 6, reels: 2, stories: 20, color: "#BF5A5A" },
  { id: "c15", name: "Rutuja Infra",          industry: "Construction",   posts: 7, reels: 3, stories: 20, color: "#6B9B5A" },
  { id: "c16", name: "MN Placements",         industry: "Recruitment",    posts: 8, reels: 3, stories: 20, color: "#BF8A5A" },
  { id: "c17", name: "Urban Plates",          industry: "F&B",            posts: 6, reels: 3, stories: 20, color: "#C4A03C" },
  { id: "c18", name: "Cabana Retreat",        industry: "Hospitality",    posts: 6, reels: 3, stories: 20, color: "#5A9B7A" },
  { id: "c19", name: "PCS",                   industry: "Services",       posts: 6, reels: 2, stories: 20, color: "#7A7ABF" },
  { id: "c20", name: "Rasik Hardware",        industry: "Retail",         posts: 5, reels: 2, stories: 20, color: "#BF7A3C" },
];

const CONTENT_STEPS = [
  { id: "brief",    label: "Brief",         icon: "📋" },
  { id: "script",   label: "Script/Copy",   icon: "✍️" },
  { id: "design",   label: "Design",        icon: "🎨" },
  { id: "approval", label: "Approval",      icon: "✅" },
  { id: "posted",   label: "Posted",        icon: "🚀" },
];

const OPS_TASK_CATS = ["Onboarding","Invoicing","Reporting","Strategy","Client Comm","Website","SEO","Ads","Other"];
const GFX_TASK_CATS = ["Post Design","Reel Edit","Story Template","Logo","Brand Kit","Thumbnail","Banner","Other"];
const PRIORITIES = { high:"#E05C5C", medium:"#C9A84C", low:"#7EB8A4" };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CUR_MONTH = new Date().getMonth();
const CUR_YEAR  = new Date().getFullYear();

// ─── STORAGE ─────────────────────────────────────────────────────────────────

function buildInitial() {
  const content = {};
  CLIENT_LIST.forEach(c => {
    content[c.id] = { posts: [], reels: [], stories: [] };
    for (let i = 1; i <= c.posts;    i++) content[c.id].posts.push(  makeContent("post",  i, c.id));
    for (let i = 1; i <= c.reels;    i++) content[c.id].reels.push(  makeContent("reel",  i, c.id));
    for (let i = 1; i <= c.stories;  i++) content[c.id].stories.push(makeContent("story", i, c.id));
  });
  return {
    clients: CLIENT_LIST,
    content,
    opsTasks: [],
    gfxTasks: [],
    notes: {},
  };
}

function makeContent(type, idx, clientId) {
  return {
    id: `${clientId}_${type}_${idx}`,
    type, idx, clientId,
    title: `${capitalize(type)} ${idx}`,
    steps: { brief:"pending", script:"pending", design:"pending", approval:"pending", posted:"pending" },
    notes: "",
    month: CUR_MONTH,
    year:  CUR_YEAR,
  };
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function load() {
  try { const d = localStorage.getItem("auspex_os_v3"); return d ? JSON.parse(d) : buildInitial(); }
  catch { return buildInitial(); }
}
function save(d) { try { localStorage.setItem("auspex_os_v3", JSON.stringify(d)); } catch {} }

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const STEP_STATUS = {
  pending:  { color:"#333",    bg:"#111",    label:"—" },
  wip:      { color:"#C9A84C", bg:"#1f1a0e", label:"WIP" },
  approval: { color:"#7EB8A4", bg:"#0d1f1a", label:"Review" },
  done:     { color:"#4CAF50", bg:"#0d1a0e", label:"Done" },
};

function stepsDone(steps) { return Object.values(steps).filter(v => v === "done").length; }
function contentProgress(items) {
  if (!items.length) return 0;
  const total = items.length * CONTENT_STEPS.length;
  const done  = items.reduce((a, it) => a + stepsDone(it.steps), 0);
  return Math.round((done / total) * 100);
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Tag({ color, bg, children, style }) {
  return <span style={{ fontSize:"10px", color, background: bg || color+"20", padding:"2px 8px", borderRadius:"4px", fontWeight:600, letterSpacing:"0.05em", ...style }}>{children}</span>;
}

function ProgressBar({ pct, color = "#C9A84C", height = 4 }) {
  return (
    <div style={{ height, background:"#1a1a1a", borderRadius:height, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:height, transition:"width .4s" }} />
    </div>
  );
}

function Modal({ title, onClose, width = 600, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.8)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }}
      onClick={onClose}>
      <div style={{ background:"#0d0d0d", border:"1px solid #222", borderRadius:"14px", padding:"28px", width:`min(${width}px,96vw)`, maxHeight:"92vh", overflowY:"auto" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"22px" }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"20px", color:"#f0e6d0", margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:"22px", lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Inp({ label, as, children, ...p }) {
  const base = { width:"100%", background:"#151515", border:"1px solid #252525", borderRadius:"6px", color:"#e0d4c0", padding:"8px 11px", fontSize:"13px", outline:"none", boxSizing:"border-box" };
  return (
    <div style={{ marginBottom:"13px" }}>
      {label && <label style={{ display:"block", color:"#666", fontSize:"10px", textTransform:"uppercase", letterSpacing:".08em", marginBottom:"4px" }}>{label}</label>}
      {as === "select" ? <select {...p} style={{ ...base, ...p.style }}>{children}</select>
       : as === "textarea" ? <textarea {...p} rows={3} style={{ ...base, resize:"vertical", ...p.style }} />
       : <input {...p} style={{ ...base, ...p.style }} />}
    </div>
  );
}

function Btn({ v = "gold", children, ...p }) {
  const s = {
    gold:  { background:"#C9A84C", color:"#0a0a0a", border:"none" },
    ghost: { background:"transparent", color:"#777", border:"1px solid #272727" },
    red:   { background:"transparent", color:"#E05C5C", border:"1px solid #E05C5C40" },
    green: { background:"#1a3d1a", color:"#4CAF50", border:"1px solid #4CAF5040" },
  };
  return <button {...p} style={{ ...s[v], padding:"7px 16px", borderRadius:"6px", cursor:"pointer", fontSize:"13px", fontWeight:600, ...p.style }}>{children}</button>;
}

// ─── STEP CYCLE ──────────────────────────────────────────────────────────────

const STEP_CYCLE = ["pending","wip","approval","done"];
function nextStep(cur) { const i = STEP_CYCLE.indexOf(cur); return STEP_CYCLE[(i+1) % STEP_CYCLE.length]; }

// ─── CONTENT ROW ─────────────────────────────────────────────────────────────

function ContentRow({ item, onUpdate, clientColor }) {
  const allDone   = Object.values(item.steps).every(v => v === "done");
  const postCount = stepsDone(item.steps);
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr repeat(5,80px) 32px", gap:"4px", alignItems:"center", padding:"7px 12px", borderRadius:"7px", background: allDone ? "#0d1a0d" : "#0e0e0e", border:`1px solid ${allDone ? "#1e3a1e" : "#161616"}`, marginBottom:"4px" }}>
      <div style={{ fontSize:"12px", color:"#ccc" }}>
        <span style={{ color: clientColor, marginRight:"6px", fontSize:"10px" }}>●</span>
        {item.title}
        {item.notes && <span style={{ fontSize:"10px", color:"#555", marginLeft:"8px" }}>📎</span>}
      </div>
      {CONTENT_STEPS.map(step => {
        const status = STEP_STATUS[item.steps[step.id]];
        return (
          <div key={step.id} onClick={() => onUpdate(item.id, step.id)}
            style={{ textAlign:"center", cursor:"pointer", background:status.bg, border:`1px solid ${status.color}40`, borderRadius:"5px", padding:"3px 0", transition:"all .15s" }}
            title={`Click to cycle: ${step.label}`}>
            <span style={{ fontSize:"10px", color:status.color, fontWeight:600 }}>{status.label}</span>
          </div>
        );
      })}
      <div style={{ textAlign:"center", fontSize:"10px", color: postCount === 5 ? "#4CAF50" : "#555" }}>{postCount}/5</div>
    </div>
  );
}

// ─── TASK CARD ────────────────────────────────────────────────────────────────

function TaskCard({ task, clients, onUpdate, onDelete }) {
  const client = clients.find(c => c.id === task.clientId);
  const steps  = task.steps || {};
  const done   = stepsDone(steps);
  const total  = CONTENT_STEPS.length;
  return (
    <div style={{ background:"#0e0e0e", border:`1px solid #1a1a1a`, borderLeft:`3px solid ${client?.color||"#333"}`, borderRadius:"8px", padding:"12px 14px", marginBottom:"8px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
        <div>
          <div style={{ fontSize:"10px", color:client?.color||"#666", marginBottom:"3px", fontWeight:600 }}>{client?.name || "—"}</div>
          <div style={{ fontSize:"13px", color:"#e0d4c0" }}>{task.title}</div>
        </div>
        <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
          <Tag color={PRIORITIES[task.priority]} >{task.priority}</Tag>
          <button onClick={() => onDelete(task.id)} style={{ background:"none", border:"none", color:"#333", cursor:"pointer", fontSize:"14px" }}>×</button>
        </div>
      </div>
      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"8px" }}>
        {CONTENT_STEPS.map(step => {
          const s = STEP_STATUS[steps[step.id] || "pending"];
          return (
            <span key={step.id} onClick={() => onUpdate(task.id, step.id)}
              style={{ fontSize:"10px", color:s.color, background:s.bg, border:`1px solid ${s.color}40`, padding:"2px 8px", borderRadius:"4px", cursor:"pointer" }}
              title={step.label}>
              {step.icon} {step.label}
            </span>
          );
        })}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <ProgressBar pct={(done/total)*100} color={client?.color||"#C9A84C"} />
        <span style={{ fontSize:"10px", color:"#555", marginLeft:"10px", whiteSpace:"nowrap" }}>{done}/{total}</span>
      </div>
      {task.deadline && <div style={{ fontSize:"10px", color:"#555", marginTop:"5px" }}>📅 {task.deadline} · {task.category}</div>}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function AuspexOS() {
  const [data, setData]     = useState(load);
  const [tab,  setTab]      = useState("clients");   // clients | social | ops | graphics
  const [selectedClient, setSelectedClient] = useState(null);
  const [contentType, setContentType] = useState("posts");
  const [modal, setModal]   = useState(null);
  const [searchClient, setSearchClient] = useState("");
  const [filterMonth, setFilterMonth]   = useState(CUR_MONTH);

  useEffect(() => { save(data); }, [data]);

  // ── Mutators ─────────────────────────────────────────────────────────────

  const cycleStep = useCallback((clientId, itemId, stepId) => {
    setData(d => {
      const content = { ...d.content };
      const clientContent = { ...content[clientId] };
      ["posts","reels","stories"].forEach(type => {
        clientContent[type] = clientContent[type].map(it =>
          it.id === itemId ? { ...it, steps: { ...it.steps, [stepId]: nextStep(it.steps[stepId]) } } : it
        );
      });
      content[clientId] = clientContent;
      return { ...d, content };
    });
  }, []);

  const addOpsTask = (task) => setData(d => ({ ...d, opsTasks: [{ ...task, id: "ops_"+Date.now(), steps: { brief:"pending",script:"pending",design:"pending",approval:"pending",posted:"pending" }, createdAt: new Date().toISOString().split("T")[0] }, ...d.opsTasks] }));
  const addGfxTask = (task) => setData(d => ({ ...d, gfxTasks: [{ ...task, id: "gfx_"+Date.now(), steps: { brief:"pending",script:"pending",design:"pending",approval:"pending",posted:"pending" }, createdAt: new Date().toISOString().split("T")[0] }, ...d.gfxTasks] }));

  const updateOpsStep = (taskId, stepId) => setData(d => ({ ...d, opsTasks: d.opsTasks.map(t => t.id === taskId ? { ...t, steps: { ...t.steps, [stepId]: nextStep(t.steps[stepId]) } } : t) }));
  const updateGfxStep = (taskId, stepId) => setData(d => ({ ...d, gfxTasks: d.gfxTasks.map(t => t.id === taskId ? { ...t, steps: { ...t.steps, [stepId]: nextStep(t.steps[stepId]) } } : t) }));
  const deleteOpsTask = (id) => setData(d => ({ ...d, opsTasks: d.opsTasks.filter(t => t.id !== id) }));
  const deleteGfxTask = (id) => setData(d => ({ ...d, gfxTasks: d.gfxTasks.filter(t => t.id !== id) }));

  const addClient = (c) => {
    const newC = { ...c, id: "c"+Date.now(), color: ["#C9A84C","#7EB8A4","#C47B5A","#8B7EC8","#5A9BC4"][data.clients.length % 5] };
    const initContent = { posts: [], reels: [], stories: [] };
    for (let i = 1; i <= +c.posts;   i++) initContent.posts.push(makeContent("post",  i, newC.id));
    for (let i = 1; i <= +c.reels;   i++) initContent.reels.push(makeContent("reel",  i, newC.id));
    for (let i = 1; i <= +c.stories; i++) initContent.stories.push(makeContent("story",i, newC.id));
    setData(d => ({ ...d, clients: [...d.clients, newC], content: { ...d.content, [newC.id]: initContent } }));
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalPosted = Object.values(data.content).reduce((acc, cc) => {
    ["posts","reels","stories"].forEach(t => { cc[t].forEach(it => { if (it.steps.posted === "done") acc++; }); });
    return acc;
  }, 0);

  const totalItems = Object.values(data.content).reduce((acc, cc) => {
    ["posts","reels","stories"].forEach(t => { acc += cc[t].length; });
    return acc;
  }, 0);

  const pendingApproval = Object.values(data.content).reduce((acc, cc) => {
    ["posts","reels","stories"].forEach(t => { cc[t].forEach(it => { if (Object.values(it.steps).some(v => v === "approval")) acc++; }); });
    return acc;
  }, 0);

  const filteredClients = data.clients.filter(c => c.name.toLowerCase().includes(searchClient.toLowerCase()));

  // ── Render ────────────────────────────────────────────────────────────────

  const NAV = [
    { id:"clients",  label:"Clients",           icon:"◈" },
    { id:"social",   label:"Social Manager",     icon:"◉" },
    { id:"ops",      label:"Operations",         icon:"⊕" },
    { id:"graphics", label:"Graphics Head",      icon:"◆" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#080808", color:"#e0d4c0", fontFamily:"'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <header style={{ borderBottom:"1px solid #161616", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"#080808", zIndex:500 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"34px", height:"34px", background:"linear-gradient(135deg,#C9A84C,#8B5A2B)", borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"16px", color:"#0a0a0a" }}>A</div>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"18px", color:"#f0e6d0", letterSpacing:".04em" }}>Auspex</div>
            <div style={{ fontSize:"9px", color:"#444", letterSpacing:".15em", textTransform:"uppercase" }}>Agency Operating System</div>
          </div>
        </div>

        <nav style={{ display:"flex", gap:"4px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ background: tab===n.id ? "#141414" : "none", border:`1px solid ${tab===n.id ? "#252525" : "transparent"}`, color: tab===n.id ? "#C9A84C" : "#555", padding:"6px 16px", borderRadius:"7px", cursor:"pointer", fontSize:"12px", letterSpacing:".04em" }}>
              {n.icon} {n.label}
            </button>
          ))}
        </nav>

        {/* Summary pills */}
        <div style={{ display:"flex", gap:"8px" }}>
          {[
            { label:"Posted", v: totalPosted, c:"#4CAF50" },
            { label:"Pending ✓", v: pendingApproval, c:"#C9A84C" },
            { label:"Clients", v: data.clients.length, c:"#7EB8A4" },
          ].map(s => (
            <div key={s.label} style={{ background:"#0e0e0e", border:"1px solid #1a1a1a", borderRadius:"7px", padding:"5px 12px", display:"flex", gap:"7px", alignItems:"center" }}>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"18px", color:s.c, fontWeight:600 }}>{s.v}</span>
              <span style={{ fontSize:"10px", color:"#444" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ── BODY ── */}
      <main style={{ padding:"22px 28px" }}>

        {/* ═══════════════ CLIENTS TAB ═══════════════ */}
        {tab === "clients" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"22px", color:"#f0e6d0", margin:0 }}>All Clients — Content Tracker</h2>
              <div style={{ display:"flex", gap:"10px" }}>
                <input value={searchClient} onChange={e => setSearchClient(e.target.value)} placeholder="Search client…"
                  style={{ background:"#111", border:"1px solid #222", borderRadius:"6px", color:"#e0d4c0", padding:"7px 13px", fontSize:"12px", outline:"none", width:"180px" }} />
                <Btn onClick={() => setModal("addClient")}>+ Add Client</Btn>
              </div>
            </div>

            {/* Month selector */}
            <div style={{ display:"flex", gap:"6px", marginBottom:"18px", flexWrap:"wrap" }}>
              {MONTHS.map((m,i) => (
                <button key={m} onClick={() => setFilterMonth(i)}
                  style={{ background: filterMonth===i ? "#C9A84C" : "#111", border:`1px solid ${filterMonth===i ? "#C9A84C" : "#222"}`, color: filterMonth===i ? "#0a0a0a" : "#555", padding:"4px 12px", borderRadius:"5px", cursor:"pointer", fontSize:"11px", fontWeight:600 }}>
                  {m}
                </button>
              ))}
            </div>

            {/* Column headers */}
            <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:"10px" }}>
              <div style={{ fontSize:"10px", color:"#333", textTransform:"uppercase", letterSpacing:".1em", padding:"0 0 8px 0" }}>Client</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px" }}>
                {["Posts","Reels","Stories"].map(t => (
                  <div key={t} style={{ fontSize:"10px", color:"#555", textTransform:"uppercase", letterSpacing:".1em", padding:"0 0 8px 8px" }}>{t}</div>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {filteredClients.map(client => {
                const cc = data.content[client.id] || { posts:[], reels:[], stories:[] };
                const pPct = contentProgress(cc.posts);
                const rPct = contentProgress(cc.reels);
                const sPct = contentProgress(cc.stories);
                const allPct = Math.round((pPct + rPct + sPct) / 3);
                return (
                  <div key={client.id} style={{ background:"#0a0a0a", border:"1px solid #161616", borderLeft:`4px solid ${client.color}`, borderRadius:"10px", overflow:"hidden" }}>
                    {/* Client row */}
                    <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:"10px", padding:"12px 16px", alignItems:"center", cursor:"pointer" }}
                      onClick={() => { setSelectedClient(selectedClient===client.id ? null : client.id); setContentType("posts"); }}>
                      <div>
                        <div style={{ fontSize:"13px", color:"#f0e6d0", fontWeight:500 }}>{client.name}</div>
                        <div style={{ fontSize:"10px", color:"#555", marginTop:"2px" }}>{client.industry}</div>
                        <div style={{ marginTop:"6px" }}><ProgressBar pct={allPct} color={client.color} /></div>
                        <div style={{ fontSize:"10px", color:client.color, marginTop:"2px" }}>{allPct}% complete</div>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px" }}>
                        {[
                          { label:"Posts",   items:cc.posts,   pct:pPct,  count:client.posts },
                          { label:"Reels",   items:cc.reels,   pct:rPct,  count:client.reels },
                          { label:"Stories", items:cc.stories, pct:sPct,  count:client.stories },
                        ].map(({ label, items, pct, count }) => {
                          const posted = items.filter(it => it.steps.posted==="done").length;
                          const inReview = items.filter(it => Object.values(it.steps).some(v => v==="approval")).length;
                          return (
                            <div key={label} style={{ background:"#111", borderRadius:"7px", padding:"10px 12px" }}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                                <span style={{ fontSize:"11px", color:"#666" }}>{label}</span>
                                <span style={{ fontSize:"11px", color:client.color }}>{posted}/{count}</span>
                              </div>
                              <ProgressBar pct={pct} color={client.color} />
                              {inReview > 0 && <div style={{ fontSize:"10px", color:"#C9A84C", marginTop:"4px" }}>⏳ {inReview} awaiting approval</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expanded content */}
                    {selectedClient === client.id && (
                      <div style={{ borderTop:"1px solid #161616", padding:"16px" }}>
                        <div style={{ display:"flex", gap:"8px", marginBottom:"14px" }}>
                          {["posts","reels","stories"].map(t => (
                            <button key={t} onClick={() => setContentType(t)}
                              style={{ background: contentType===t ? client.color+"20" : "transparent", border:`1px solid ${contentType===t ? client.color : "#222"}`, color: contentType===t ? client.color : "#555", padding:"5px 14px", borderRadius:"5px", cursor:"pointer", fontSize:"12px", textTransform:"capitalize" }}>
                              {t} ({cc[t].length})
                            </button>
                          ))}
                        </div>

                        {/* Step headers */}
                        <div style={{ display:"grid", gridTemplateColumns:"1fr repeat(5,80px) 32px", gap:"4px", padding:"4px 12px", marginBottom:"6px" }}>
                          <span style={{ fontSize:"10px", color:"#333" }}>ITEM</span>
                          {CONTENT_STEPS.map(s => <span key={s.id} style={{ fontSize:"10px", color:"#333", textAlign:"center" }}>{s.icon} {s.label}</span>)}
                          <span style={{ fontSize:"10px", color:"#333", textAlign:"center" }}>✓</span>
                        </div>

                        {cc[contentType].map(item => (
                          <ContentRow key={item.id} item={item} clientColor={client.color}
                            onUpdate={(itemId, stepId) => cycleStep(client.id, itemId, stepId)} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════ SOCIAL MEDIA MANAGER TAB ═══════════════ */}
        {tab === "social" && (
          <SocialTab data={data} clients={data.clients} cycleStep={cycleStep} />
        )}

        {/* ═══════════════ OPERATIONS TAB ═══════════════ */}
        {tab === "ops" && (
          <TeamTab
            title="Operations Manager"
            color="#C9A84C"
            icon="⊕"
            tasks={data.opsTasks}
            clients={data.clients}
            categories={OPS_TASK_CATS}
            onAdd={addOpsTask}
            onUpdateStep={updateOpsStep}
            onDelete={deleteOpsTask}
          />
        )}

        {/* ═══════════════ GRAPHICS TAB ═══════════════ */}
        {tab === "graphics" && (
          <TeamTab
            title="Graphics Head"
            color="#C47B5A"
            icon="◆"
            tasks={data.gfxTasks}
            clients={data.clients}
            categories={GFX_TASK_CATS}
            onAdd={addGfxTask}
            onUpdateStep={updateGfxStep}
            onDelete={deleteGfxTask}
          />
        )}
      </main>

      {/* ═══ MODALS ═══ */}
      {modal === "addClient" && <AddClientModal onClose={() => setModal(null)} onSave={c => { addClient(c); setModal(null); }} />}
    </div>
  );
}

// ─── SOCIAL TAB ───────────────────────────────────────────────────────────────

function SocialTab({ data, clients, cycleStep }) {
  const [view, setView] = useState("overview"); // overview | byClient
  const [selClient, setSelClient] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  // Aggregate: items pending approval across all clients
  const pendingItems = [];
  const postedItems  = [];
  const wipItems     = [];

  clients.forEach(client => {
    const cc = data.content[client.id] || { posts:[], reels:[], stories:[] };
    ["posts","reels","stories"].forEach(type => {
      cc[type].forEach(it => {
        const vals = Object.values(it.steps);
        if (it.steps.posted === "done") postedItems.push({ ...it, clientName:client.name, clientColor:client.color, typeName:type });
        else if (vals.some(v => v === "approval")) pendingItems.push({ ...it, clientName:client.name, clientColor:client.color, typeName:type });
        else if (vals.some(v => v === "wip")) wipItems.push({ ...it, clientName:client.name, clientColor:client.color, typeName:type });
      });
    });
  });

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"22px", color:"#f0e6d0", margin:0 }}>
          <span style={{ color:"#7EB8A4" }}>◉</span> Social Media Manager
        </h2>
        <div style={{ display:"flex", gap:"6px" }}>
          {["overview","byClient"].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ background:view===v?"#141414":"none", border:`1px solid ${view===v?"#252525":"transparent"}`, color:view===v?"#7EB8A4":"#555", padding:"5px 14px", borderRadius:"6px", cursor:"pointer", fontSize:"12px" }}>
              {v === "overview" ? "Overview" : "By Client"}
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", marginBottom:"22px" }}>
        {[
          { label:"Posted This Month", v: postedItems.length,  c:"#4CAF50" },
          { label:"Awaiting Approval", v: pendingItems.length, c:"#C9A84C" },
          { label:"In Progress (WIP)", v: wipItems.length,     c:"#7EB8A4" },
          { label:"Total Content",     v: postedItems.length + pendingItems.length + wipItems.length, c:"#e0d4c0" },
        ].map(s => (
          <div key={s.label} style={{ background:"#0e0e0e", border:"1px solid #1a1a1a", borderRadius:"10px", padding:"16px 18px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"28px", color:s.c, fontWeight:600 }}>{s.v}</div>
            <div style={{ fontSize:"11px", color:"#555", marginTop:"3px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {view === "overview" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" }}>
          {[
            { title:"🚀 Posted", items:postedItems, color:"#4CAF50" },
            { title:"⏳ Awaiting Approval", items:pendingItems, color:"#C9A84C" },
            { title:"✍️ In Progress", items:wipItems, color:"#7EB8A4" },
          ].map(col => (
            <div key={col.title} style={{ background:"#0a0a0a", border:"1px solid #161616", borderRadius:"10px", overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid #161616", display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:"13px", color:col.color }}>{col.title}</span>
                <span style={{ fontSize:"12px", color:"#444" }}>{col.items.length}</span>
              </div>
              <div style={{ padding:"10px", maxHeight:"420px", overflowY:"auto" }}>
                {col.items.length === 0 && <div style={{ padding:"20px", textAlign:"center", color:"#333", fontSize:"12px" }}>None</div>}
                {col.items.map(it => (
                  <div key={it.id} style={{ padding:"8px 10px", borderRadius:"6px", background:"#0e0e0e", border:`1px solid #161616`, borderLeft:`3px solid ${it.clientColor}`, marginBottom:"6px" }}>
                    <div style={{ fontSize:"10px", color:it.clientColor, marginBottom:"2px" }}>{it.clientName}</div>
                    <div style={{ fontSize:"12px", color:"#ccc" }}>{it.title} <span style={{ color:"#555", fontSize:"10px" }}>({it.typeName})</span></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "byClient" && (
        <div>
          <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" }}>
            {clients.map(c => (
              <button key={c.id} onClick={() => setSelClient(selClient === c.id ? null : c.id)}
                style={{ background: selClient===c.id ? c.color+"20" : "#0e0e0e", border:`1px solid ${selClient===c.id ? c.color : "#1a1a1a"}`, color: selClient===c.id ? c.color : "#777", padding:"5px 12px", borderRadius:"6px", cursor:"pointer", fontSize:"11px" }}>
                {c.name}
              </button>
            ))}
          </div>
          {selClient && (() => {
            const client = clients.find(c => c.id === selClient);
            const cc = data.content[selClient] || { posts:[], reels:[], stories:[] };
            return (
              <div style={{ background:"#0a0a0a", border:"1px solid #161616", borderRadius:"10px", padding:"16px" }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", color:client.color, fontSize:"18px", margin:"0 0 16px" }}>{client.name}</h3>
                {["posts","reels","stories"].map(type => (
                  <div key={type} style={{ marginBottom:"20px" }}>
                    <div style={{ fontSize:"11px", color:"#555", textTransform:"uppercase", letterSpacing:".1em", marginBottom:"8px" }}>{type}</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr repeat(5,80px) 32px", gap:"4px", padding:"4px 12px", marginBottom:"4px" }}>
                      <span style={{ fontSize:"10px", color:"#333" }}>ITEM</span>
                      {CONTENT_STEPS.map(s => <span key={s.id} style={{ fontSize:"10px", color:"#333", textAlign:"center" }}>{s.icon} {s.label}</span>)}
                      <span style={{ fontSize:"10px", color:"#333", textAlign:"center" }}>✓</span>
                    </div>
                    {cc[type].map(item => (
                      <ContentRow key={item.id} item={item} clientColor={client.color}
                        onUpdate={(itemId, stepId) => cycleStep(client.id, itemId, stepId)} />
                    ))}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─── TEAM TAB (Ops & Graphics) ────────────────────────────────────────────────

function TeamTab({ title, color, icon, tasks, clients, categories, onAdd, onUpdateStep, onDelete }) {
  const [modal, setModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClient, setFilterClient] = useState("all");

  const filtered = tasks.filter(t => {
    if (filterClient !== "all" && t.clientId !== filterClient) return false;
    if (filterStatus === "done"   && !Object.values(t.steps||{}).every(v => v==="done")) return false;
    if (filterStatus === "active" && Object.values(t.steps||{}).every(v => v==="done"))  return false;
    return true;
  });

  const done   = tasks.filter(t => Object.values(t.steps||{}).every(v => v==="done")).length;
  const active = tasks.length - done;
  const approval = tasks.filter(t => Object.values(t.steps||{}).some(v => v==="approval")).length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"22px", color:"#f0e6d0", margin:0 }}>
          <span style={{ color }}>{icon}</span> {title}
        </h2>
        <Btn onClick={() => setModal(true)}>+ Add Task</Btn>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Total Tasks",  v:tasks.length, c:color },
          { label:"Active",       v:active,        c:"#C9A84C" },
          { label:"In Review",    v:approval,      c:"#7EB8A4" },
          { label:"Completed",    v:done,          c:"#4CAF50" },
        ].map(s => (
          <div key={s.label} style={{ background:"#0e0e0e", border:"1px solid #1a1a1a", borderRadius:"10px", padding:"14px 18px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"26px", color:s.c, fontWeight:600 }}>{s.v}</div>
            <div style={{ fontSize:"11px", color:"#555", marginTop:"3px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
        {[["all","All"],["active","Active"],["done","Done"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilterStatus(v)}
            style={{ background:filterStatus===v?"#141414":"none", border:`1px solid ${filterStatus===v?"#252525":"transparent"}`, color:filterStatus===v?color:"#555", padding:"5px 13px", borderRadius:"6px", cursor:"pointer", fontSize:"12px" }}>
            {l}
          </button>
        ))}
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
          style={{ background:"#111", border:"1px solid #222", borderRadius:"6px", color:"#888", padding:"5px 10px", fontSize:"12px", marginLeft:"auto" }}>
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 && <div style={{ textAlign:"center", color:"#333", padding:"50px", fontSize:"14px" }}>No tasks yet. Add one to get started.</div>}

      {/* Group by status */}
      {["wip","approval","pending","done"].map(statusGroup => {
        const group = filtered.filter(t => {
          const vals = Object.values(t.steps||{});
          if (statusGroup === "done")     return vals.every(v => v==="done");
          if (statusGroup === "approval") return vals.some(v => v==="approval") && !vals.every(v => v==="done");
          if (statusGroup === "wip")      return vals.some(v => v==="wip") && !vals.some(v => v==="approval") && !vals.every(v => v==="done");
          return vals.every(v => v==="pending");
        });
        if (!group.length) return null;
        const groupMeta = {
          done:     { label:"✅ Completed",    c:"#4CAF50" },
          approval: { label:"⏳ In Review",     c:"#C9A84C" },
          wip:      { label:"🔄 In Progress",   c:"#7EB8A4" },
          pending:  { label:"📋 Not Started",   c:"#444" },
        };
        const gm = groupMeta[statusGroup];
        return (
          <div key={statusGroup} style={{ marginBottom:"22px" }}>
            <div style={{ fontSize:"11px", color:gm.c, textTransform:"uppercase", letterSpacing:".1em", marginBottom:"10px" }}>{gm.label} · {group.length}</div>
            {group.map(task => (
              <TaskCard key={task.id} task={task} clients={clients} onUpdate={(id,step) => onUpdateStep(id,step)} onDelete={onDelete} />
            ))}
          </div>
        );
      })}

      {modal && <AddTaskModal title={title} color={color} clients={clients} categories={categories} onClose={() => setModal(false)} onSave={t => { onAdd(t); setModal(false); }} />}
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────

function AddClientModal({ onClose, onSave }) {
  const [f, setF] = useState({ name:"", industry:"", posts:5, reels:2, stories:20 });
  const s = (k,v) => setF(p => ({ ...p, [k]:v }));
  return (
    <Modal title="Add New Client" onClose={onClose}>
      <Inp label="Client / Brand Name" value={f.name} onChange={e => s("name",e.target.value)} placeholder="e.g. Shoreline Villas" />
      <Inp label="Industry" value={f.industry} onChange={e => s("industry",e.target.value)} placeholder="e.g. Hospitality" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
        <Inp label="Posts / Month"   type="number" value={f.posts}   onChange={e => s("posts",  e.target.value)} />
        <Inp label="Reels / Month"   type="number" value={f.reels}   onChange={e => s("reels",  e.target.value)} />
        <Inp label="Stories / Month" type="number" value={f.stories} onChange={e => s("stories",e.target.value)} />
      </div>
      <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end", marginTop:"8px" }}>
        <Btn v="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => f.name && onSave(f)}>Add Client</Btn>
      </div>
    </Modal>
  );
}

function AddTaskModal({ title, color, clients, categories, onClose, onSave }) {
  const [f, setF] = useState({ title:"", clientId:"", category:categories[0], priority:"medium", deadline:"", notes:"" });
  const s = (k,v) => setF(p => ({ ...p, [k]:v }));
  return (
    <Modal title={`New Task — ${title}`} onClose={onClose}>
      <Inp label="Task Title" value={f.title} onChange={e => s("title",e.target.value)} placeholder="Describe the task…" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
        <Inp label="Client" as="select" value={f.clientId} onChange={e => s("clientId",e.target.value)}>
          <option value="">Select client…</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Inp>
        <Inp label="Category" as="select" value={f.category} onChange={e => s("category",e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </Inp>
        <Inp label="Priority" as="select" value={f.priority} onChange={e => s("priority",e.target.value)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Inp>
        <Inp label="Deadline" type="date" value={f.deadline} onChange={e => s("deadline",e.target.value)} />
      </div>
      <Inp label="Notes" as="textarea" value={f.notes} onChange={e => s("notes",e.target.value)} placeholder="Context, links, references…" />
      <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end", marginTop:"8px" }}>
        <Btn v="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => f.title && onSave(f)}>Create Task</Btn>
      </div>
    </Modal>
  );
}
