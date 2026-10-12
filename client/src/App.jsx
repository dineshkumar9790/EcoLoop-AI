import React, { useEffect, useMemo, useState } from "react";
import {
  Leaf, LayoutDashboard, Recycle, Truck, Users, Award, Settings, Bell, Search,
  Plus, ArrowUpRight, ArrowDownRight, Clock3, CheckCircle2, Package, MapPin,
  ChevronRight, Sparkles, Menu, X, LogOut, Camera, Upload, LoaderCircle,
  CircleHelp, ShieldCheck, Zap, Sprout, Globe2, Filter, CalendarDays, Wallet,
  CircleCheck, AlertCircle, Eye, EyeOff, BadgeCheck, TrendingUp, Boxes
} from "lucide-react";
import { api, imageUrl } from "./api";

const categories = [
  { name: "Plastic", icon: "♻️", color: "mint", guidance: "Rinse containers; keep accepted plastics separate." },
  { name: "Paper", icon: "📦", color: "sand", guidance: "Keep paper dry and clean." },
  { name: "Glass", icon: "🫙", color: "blue", guidance: "Wrap broken glass safely." },
  { name: "Metal", icon: "🥫", color: "gold", guidance: "Empty and rinse cans." },
  { name: "E-waste", icon: "🔌", color: "violet", guidance: "Use authorized e-waste collection points." },
  { name: "Organic", icon: "🍃", color: "green", guidance: "Keep food scraps separate for composting." },
  { name: "Textile", icon: "👕", color: "rose", guidance: "Donate reusable clothes or find a textile recycler." },
  { name: "Mixed", icon: "🧺", color: "slate", guidance: "Separate materials when safe." },
  { name: "Other", icon: "🧩", color: "slate", guidance: "Check local municipal disposal guidance." }
];
const demoRequests = [
  { _id:"demo1", category:"Plastic", description:"Clean PET bottles and food containers", quantityKg:12, address:"Anna Nagar, Chennai", status:"Open", owner:{name:"Priya S."}, createdAt:new Date().toISOString() },
  { _id:"demo2", category:"E-waste", description:"Old keyboard, cables and small electronics", quantityKg:4, address:"T. Nagar, Chennai", status:"Open", owner:{name:"Arun K."}, createdAt:new Date(Date.now()-3600000).toISOString() },
  { _id:"demo3", category:"Paper", description:"Cardboard packaging from a small store", quantityKg:18, address:"Velachery, Chennai", status:"Open", owner:{name:"Maya R."}, createdAt:new Date(Date.now()-7200000).toISOString() },
  { _id:"demo4", category:"Organic", description:"Segregated vegetable and fruit scraps", quantityKg:8, address:"Adyar, Chennai", status:"Open", owner:{name:"Karthik V."}, createdAt:new Date(Date.now()-10800000).toISOString() }
];
const initialMetrics = { total: 24, completed: 18, open: 3, kgCollected: 146.5, ecoPoints: 420 };
const money = n => new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(n || 0);
const dateText = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "Flexible";
const initials = name => (name || "Eco User").split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase();
const categoryFor = name => categories.find(c=>c.name===name) || categories[7];

function App() {
  const [user,setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("ecoloop_user") || "null"); } catch { return null; } });
  const [page,setPage] = useState("Overview");
  const [mobileNav,setMobileNav] = useState(false);
  const [notice,setNotice] = useState("");
  const [authOpen,setAuthOpen] = useState(!localStorage.getItem("ecoloop_token"));
  const [showCreate,setShowCreate] = useState(false);
  const [metrics,setMetrics] = useState(initialMetrics);
  const [collections,setCollections] = useState([]);
  const [market,setMarket] = useState([]);
  const [suppliers,setSuppliers] = useState([]);
  const [loading,setLoading] = useState(false);
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("All");
  const [authMode,setAuthMode] = useState("login");

  const isSupplier = user?.role === "supplier";
  const nav = [
    { label:"Overview", icon:LayoutDashboard, group:"WORKSPACE" },
    { label:"Waste scanner", icon:Recycle, group:"WORKSPACE" },
    { label:"Collections", icon:Package, group:"WORKSPACE" },
    { label:"Supplier marketplace", icon:Truck, group:"WORKSPACE" },
    { label:"Impact & rewards", icon:Award, group:"INSIGHTS" },
    { label:"Suppliers", icon:Users, group:"INSIGHTS" },
  ];

  async function loadData() {
    if (!localStorage.getItem("ecoloop_token")) return;
    setLoading(true);
    try {
      const [dash, mine, marketplace, supplierData] = await Promise.all([
        api("/dashboard"), api("/collections"), api("/collections/marketplace"), api("/suppliers")
      ]);
      setMetrics(dash.metrics || initialMetrics);
      setCollections(mine.collections || []);
      setMarket(marketplace.collections || []);
      setSuppliers(supplierData.suppliers || []);
    } catch (e) { setNotice(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadData(); }, [user?.id]);
  useEffect(() => { if (!notice) return; const t=setTimeout(()=>setNotice(""),4200); return ()=>clearTimeout(t); }, [notice]);

  async function signIn(form) {
    try {
      const data = await api(`/auth/${authMode==="register"?"register":"login"}`, { method:"POST", body:JSON.stringify(form) });
      localStorage.setItem("ecoloop_token",data.token);
      localStorage.setItem("ecoloop_user",JSON.stringify(data.user));
      setUser(data.user); setAuthOpen(false); setNotice(`Welcome${data.user.name ? ", "+data.user.name.split(" ")[0] : ""}!`);
    } catch(e) { setNotice(e.message); }
  }
  function signOut() {
    localStorage.removeItem("ecoloop_token"); localStorage.removeItem("ecoloop_user");
    setUser(null); setAuthOpen(true); setAuthMode("login"); setPage("Overview");
    setCollections([]); setMarket([]); setNotice("You have signed out.");
  }
  async function refresh() { await loadData(); }
  const activeNav = label => { setPage(label); setMobileNav(false); };
  const allCollections = useMemo(() => isSupplier ? market : collections, [isSupplier,market,collections]);

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?"sidebar-open":""}`}>
      <div className="brand"><div className="brand-mark"><Leaf size={22}/></div><div><strong>ecoloop<span>ai</span></strong><small>CIRCULAR FUTURE</small></div><button className="icon-button close-nav" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-chip"><div className="workspace-icon"><Sprout size={16}/></div><div><strong>Green workspace</strong><small>Community network</small></div><ChevronRight size={15}/></div>
      {["WORKSPACE","INSIGHTS"].map(group=><div className="nav-group" key={group}><div className="nav-caption">{group}</div>{nav.filter(n=>n.group===group).map(item=><button key={item.label} onClick={()=>activeNav(item.label)} className={`nav-item ${page===item.label?"active":""}`}><item.icon size={18}/><span>{item.label}</span>{item.label==="Supplier marketplace"&&<span className="nav-count">{market.filter(x=>x.status==="Open").length||"4"}</span>}</button>)}</div>)}
      <div className="sidebar-bottom"><div className="eco-tip"><div className="tip-icon"><Sparkles size={17}/></div><strong>Small actions, big impact.</strong><p>Every kilogram you divert helps build a circular future.</p><div className="tip-progress"><span style={{width:"68%"}}/></div><small>68% of monthly goal</small></div><button className="nav-item" onClick={()=>setNotice("Settings are coming soon.")}><Settings size={18}/><span>Settings</span></button><div className="profile-mini"><div className="avatar">{initials(user?.name || "Eco Member")}</div><div className="profile-info"><strong>{user?.name || "Eco Member"}</strong><small>{user?.role==="supplier"?"Recycler / supplier":"Community member"}</small></div><button className="icon-button" title="Sign out" onClick={signOut}><LogOut size={16}/></button></div></div>
    </aside>
    {mobileNav&&<button className="scrim" onClick={()=>setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="icon-button menu-toggle" onClick={()=>setMobileNav(true)}><Menu size={20}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/><strong>{page}</strong></div></div><div className="topbar-right"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search anything..."/><kbd>⌘ K</kbd></div><button className="icon-button notification" onClick={()=>setNotice("You're all caught up!")}><Bell size={18}/><i/></button><div className="top-avatar">{initials(user?.name||"Eco Member")}</div></div></header>
      <div className="page-content">
        {page==="Overview"&&<Overview user={user} metrics={metrics} collections={collections.length ? collections : (!user ? demoRequests : [])} market={market.length ? market : (!user ? demoRequests : [])} onNavigate={activeNav} onCreate={()=>setShowCreate(true)} loading={loading}/>}
        {page==="Waste scanner"&&<Scanner onCreated={()=>{refresh();setPage("Collections");}} notify={setNotice}/>}
        {page==="Collections"&&<CollectionsPage items={collections.length ? collections : (!user ? demoRequests : [])} user={user} onRefresh={refresh} onCreate={()=>setShowCreate(true)} search={search} notify={setNotice}/>}
        {page==="Supplier marketplace"&&<Marketplace items={market.length ? market : (!user ? demoRequests : [])} user={user} onRefresh={refresh} search={search} notify={setNotice}/>}
        {page==="Impact & rewards"&&<Impact metrics={metrics} collections={collections} user={user}/>}
        {page==="Suppliers"&&<Suppliers items={suppliers} search={search}/>}
      </div>
      <footer className="footer"><span>© 2026 EcoLoop AI</span><span><span className="status-dot"/> All systems operational</span><span>Made for a greener tomorrow <Leaf size={13}/></span></footer>
    </main>
    {showCreate&&<CreateModal onClose={()=>setShowCreate(false)} onCreated={()=>{setShowCreate(false);refresh();setPage("Collections");setNotice("Collection request created successfully.");}} notify={setNotice}/>}
    {authOpen&&<AuthModal mode={authMode} setMode={setAuthMode} onSubmit={signIn} onClose={()=>{setAuthOpen(false);setNotice("Demo preview mode. Sign in with a configured API to save your work.");}}/>}
    {notice&&<div className="toast"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={()=>setNotice("")}><X size={15}/></button></div>}
  </div>;
}

function PageHeading({eyebrow,title,description,action,actionLabel="Create request"}) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action&&<button className="primary-button" onClick={action}><Plus size={17}/>{actionLabel}</button>}</div>;
}
function Overview({user,metrics,collections,market,onNavigate,onCreate,loading}) {
  const items = (user?.role==="supplier"?market:collections).slice(0,4);
  return <><div className="welcome-banner"><div className="welcome-copy"><div className="welcome-pill"><span/> YOUR CIRCULAR JOURNEY</div><h1>Good things happen<br/>when waste <em>loops back.</em></h1><p>Turn everyday waste into tomorrow's resources. Track collections, connect with local recyclers, and make every kilogram count.</p><div className="welcome-actions"><button className="light-button" onClick={onCreate}><Plus size={17}/> Schedule a pickup</button><button className="text-button-light" onClick={()=>onNavigate("Waste scanner")}>Explore waste scanner <ArrowUpRight size={16}/></button></div></div><div className="banner-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="planet"><Leaf size={60}/></div><div className="floating-leaf leaf-a">🍃</div><div className="floating-leaf leaf-b">♻️</div><div className="floating-leaf leaf-c">🌱</div><div className="art-label"><span className="pulse"/> CIRCULAR ECONOMY <strong>IN MOTION</strong></div></div><div className="banner-bottom"><span><Globe2 size={15}/> One community. Less waste.</span><span><ShieldCheck size={15}/> Responsible recycling</span><span><Zap size={15}/> Real-world impact</span></div></div>
  <div className="section-title-row"><div><h2>Your impact at a glance</h2><p>Small actions add up to meaningful change.</p></div><button className="subtle-link" onClick={()=>onNavigate("Impact & rewards")}>View impact report <ArrowUpRight size={15}/></button></div>
  <div className="stats-grid"><StatCard icon={Recycle} tint="mint" label="Waste diverted" value={`${metrics.kgCollected||0} kg`} trend="+12.8%" note="vs. last month"/><StatCard icon={Package} tint="blue" label="Total requests" value={metrics.total||0} trend="+8.4%" note="this month"/><StatCard icon={CheckCircle2} tint="green" label="Completed pickups" value={metrics.completed||0} trend="+18.2%" note="completion rate improving"/><StatCard icon={Award} tint="gold" label="Eco-points earned" value={(metrics.ecoPoints||0).toLocaleString()} trend="Level 03" note="Circular champion"/></div>
  <div className="content-grid"><section className="panel recent-panel"><div className="panel-heading"><div><h3>{user?.role==="supplier"?"Open collection requests":"Recent collections"}</h3><p>{user?.role==="supplier"?"Find materials ready for pickup":"Keep an eye on your collection journey"}</p></div><button className="icon-button" onClick={()=>onNavigate(user?.role==="supplier"?"Supplier marketplace":"Collections")}><ArrowUpRight size={17}/></button></div>{items.length?items.map(item=><CollectionRow key={item._id} item={item}/>):<EmptyState title="Your next green action starts here" text="Create a collection request or explore the supplier marketplace."/>}<button className="panel-footer-link" onClick={()=>onNavigate(user?.role==="supplier"?"Supplier marketplace":"Collections")}>View all collections <ChevronRight size={16}/></button></section>
  <section className="panel quick-panel"><div className="panel-heading"><div><h3>Quick actions</h3><p>Make your next move count</p></div><div className="sparkle-icon"><Sparkles size={17}/></div></div><QuickAction icon={Camera} tint="mint" title="Scan your waste" text="Identify material and disposal tips" onClick={()=>onNavigate("Waste scanner")}/><QuickAction icon={Truck} tint="blue" title="Book a collection" text="Find a recycler for your waste" onClick={onCreate}/><QuickAction icon={Award} tint="gold" title="Explore rewards" text="See your eco-points and milestones" onClick={()=>onNavigate("Impact & rewards")}/><div className="mini-impact"><div className="mini-impact-icon"><Leaf size={19}/></div><div><strong>You're making a difference</strong><p>Your activity helps keep valuable materials in circulation.</p></div></div></section></div>
  <div className="bottom-grid"><section className="panel journey-panel"><div className="panel-heading"><div><h3>Your circular journey</h3><p>From waste to resource, one step at a time.</p></div><span className="journey-badge">IN PROGRESS</span></div><div className="journey-steps"><JourneyStep icon={Camera} title="Identify" text="Scan and sort waste" done/><JourneyStep icon={CalendarDays} title="Schedule" text="Request a pickup" done={metrics.total>0}/><JourneyStep icon={Truck} title="Collect" text="Recycler picks it up" done={metrics.completed>0}/><JourneyStep icon={Sprout} title="Regenerate" text="Earn points and impact" done={metrics.ecoPoints>0}/></div></section><section className="impact-quote"><div className="quote-mark">“</div><p>The most sustainable product is the one that never becomes waste.</p><span>THINK CIRCULAR</span><div className="quote-decoration">♻</div></section></div></>;
}
function StatCard({icon:Icon,tint,label,value,trend,note}) { return <div className="stat-card"><div className="stat-top"><div className={`stat-icon ${tint}`}><Icon size={19}/></div><span className={`trend ${trend.startsWith("+")?"positive":""}`}>{trend.startsWith("+")?<ArrowUpRight size={13}/>:null}{trend}</span></div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-note">{note}</div></div>; }
function CollectionRow({item}) { const c=categoryFor(item.category); return <div className="collection-row"><div className={`material-icon ${c.color}`}>{c.icon}</div><div className="collection-main"><strong>{item.category} waste</strong><small>{item.description||`${item.quantityKg} kg ready for collection`}</small></div><div className="collection-meta"><strong>{item.quantityKg} kg</strong><small>{dateText(item.createdAt)}</small></div><StatusBadge status={item.status}/></div>; }
function StatusBadge({status}) { const cl=(status||"open").toLowerCase().replace(" ","-"); return <span className={`status-badge ${cl}`}><i/>{status}</span>; }
function QuickAction({icon:Icon,tint,title,text,onClick}) { return <button className="quick-action" onClick={onClick}><div className={`quick-icon ${tint}`}><Icon size={18}/></div><div><strong>{title}</strong><small>{text}</small></div><ChevronRight size={16}/></button>; }
function JourneyStep({icon:Icon,title,text,done}) { return <div className={`journey-step ${done?"done":""}`}><div className="journey-step-icon"><Icon size={18}/>{done&&<span><CheckCircle2 size={12}/></span>}</div><strong>{title}</strong><small>{text}</small></div>; }
function EmptyState({title,text}) { return <div className="empty-state"><div><Leaf size={23}/></div><strong>{title}</strong><p>{text}</p></div>; }

function Scanner({onCreated,notify}) {
  const [file,setFile]=useState(null),[preview,setPreview]=useState(""),[result,setResult]=useState(null),[busy,setBusy]=useState(false),[category,setCategory]=useState("Mixed");
  function choose(f) { if(!f)return; if(!f.type.startsWith("image/"))return notify("Please choose an image file."); setFile(f);setPreview(URL.createObjectURL(f));setResult(null); }
  async function scan() {
    if(!file)return notify("Choose a waste image first.");
    setBusy(true);
    try { const form=new FormData();form.append("image",file);const data=await api("/waste/classify",{method:"POST",body:form});setResult(data);setCategory(data.category); }
    catch(e) { setResult({category:"Mixed",confidence:.42,mode:"demo-preview",needsConfirmation:true,note:"API unavailable. Demo preview only — no image AI has run."});setCategory("Mixed");notify(e.message); }
    finally {setBusy(false);}
  }
  return <><PageHeading eyebrow="AI-POWERED SORTING" title="Waste scanner" description="Turn a quick photo into a smarter disposal decision."/><div className="scanner-layout"><section className="panel scanner-panel"><div className="panel-heading"><div><h3>Upload waste image</h3><p>For best results, photograph one item against a clear background.</p></div><div className="ai-chip"><Sparkles size={14}/> SMART SCAN</div></div><label className={`upload-zone ${preview?"has-preview":""}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();choose(e.dataTransfer.files?.[0]);}}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>choose(e.target.files?.[0])}/>{preview?<><img src={preview} alt="Waste selected for scanning"/><div className="preview-overlay"><span><Upload size={15}/> Change image</span></div></>:<><div className="upload-symbol"><Camera size={27}/></div><strong>Drop your waste image here</strong><span>or <b>browse files</b> from your device</span><small>JPG, PNG or WEBP · Max 5 MB</small></>}</label><div className="scanner-controls"><button className="primary-button" disabled={!file||busy} onClick={scan}>{busy?<LoaderCircle className="spin" size={17}/>:<Sparkles size={17}/>} {busy?"Analyzing image...":"Analyze waste"}</button><span><ShieldCheck size={15}/> Image upload is limited to 5 MB</span></div>{result&&<div className="scan-result"><div className="result-heading"><div className={`material-icon ${categoryFor(result.category).color}`}>{categoryFor(result.category).icon}</div><div><small> SUGGESTED CATEGORY</small><h3>{result.category}</h3></div><span className="confidence">{Math.round((result.confidence||0)*100)}% confidence</span></div><p>{categoryFor(result.category).guidance}</p><div className="demo-warning"><AlertCircle size={16}/><span>{result.note||"AI output is a suggestion. Confirm material and local rules before disposal."}</span></div><label className="field-label">Confirm or change category<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></label><button className="primary-button full-width" onClick={()=>window.dispatchEvent(new CustomEvent("ecoloop:create-from-scan"))}>Create collection request <ArrowUpRight size={16}/></button></div>}</section><aside className="scanner-aside"><div className="panel how-panel"><div className="eyebrow">HOW IT WORKS</div><h3>Better sorting.<br/><em>Less waste.</em></h3><div className="how-step"><span>01</span><div><strong>Capture</strong><p>Take a clear photo of the item.</p></div></div><div className="how-step"><span>02</span><div><strong>Identify</strong><p>Review the suggested material category.</p></div></div><div className="how-step"><span>03</span><div><strong>Connect</strong><p>Send a request to a suitable recycler.</p></div></div></div><div className="safety-card"><ShieldCheck size={20}/><strong>Safety first</strong><p>Never handle unknown chemicals, medical waste, sharp objects, or damaged batteries for a photo. Follow local disposal guidance.</p></div><div className="scanner-tip"><Sparkles size={17}/><p><strong>Good to know</strong><br/>This starter uses a demo classifier. Connect a trained vision API to enable genuine image recognition.</p></div></aside></div><CreateModalLauncher onCreated={onCreated} notify={notify} category={category} /></>;
}
function CreateModalLauncher({onCreated,notify,category}) {
  const [open,setOpen]=useState(false);
  useEffect(()=>{ const handler=()=>setOpen(true);window.addEventListener("ecoloop:create-from-scan",handler);return()=>window.removeEventListener("ecoloop:create-from-scan",handler);},[]);
  return open?<CreateModal defaultCategory={category} onClose={()=>setOpen(false)} onCreated={()=>{setOpen(false);onCreated();}} notify={notify}/>:null;
}
function CreateModal({onClose,onCreated,notify,defaultCategory="Plastic"}) {
  const [form,setForm]=useState({category:defaultCategory,description:"",quantityKg:"5",address:"",preferredDate:""});
  const [busy,setBusy]=useState(false);
  const update=(k,v)=>setForm(p=>({...p,[k]:v}));
  async function submit(e) {
    e.preventDefault();setBusy(true);
    try { await api("/collections",{method:"POST",body:JSON.stringify({...form,quantityKg:Number(form.quantityKg)})});onCreated(); }
    catch(err){notify(err.message);}
    finally{setBusy(false);}
  }
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><form className="modal-card" onSubmit={submit}><div className="modal-head"><div><div className="eyebrow">CIRCULAR COLLECTION</div><h2>Schedule a pickup</h2><p>Tell nearby recyclers what you have to offer.</p></div><button type="button" className="icon-button" onClick={onClose}><X size={19}/></button></div><label className="field-label">Waste category<select value={form.category} onChange={e=>update("category",e.target.value)}>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></label><label className="field-label">Description<input value={form.description} onChange={e=>update("description",e.target.value)} placeholder="e.g. Clean bottles, sorted by type"/></label><div className="form-two"><label className="field-label">Quantity (kg)<input type="number" min="0.1" max="10000" step="0.1" required value={form.quantityKg} onChange={e=>update("quantityKg",e.target.value)}/></label><label className="field-label">Preferred date<input type="date" min={new Date().toISOString().slice(0,10)} value={form.preferredDate} onChange={e=>update("preferredDate",e.target.value)}/></label></div><label className="field-label">Pickup address<textarea required rows="2" value={form.address} onChange={e=>update("address",e.target.value)} placeholder="Street, area, city"/></label><div className="modal-note"><MapPin size={16}/> Your address is shared with the supplier assigned to this collection.</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={busy}>{busy?<LoaderCircle className="spin" size={16}/>:<CalendarDays size={16}/>} Create request</button></div></form></div>;
}
function CollectionsPage({items,user,onRefresh,onCreate,search,notify}) {
  const [status,setStatus]=useState("All");
  const filtered=items.filter(i=>(status==="All"||i.status===status)&&`${i.category} ${i.description} ${i.address} ${i.status}`.toLowerCase().includes(search.toLowerCase()));
  async function updateStatus(item,next) { try { await api(`/collections/${item._id}/status`,{method:"PATCH",body:JSON.stringify({status:next})});notify(`Collection marked ${next.toLowerCase()}.`);onRefresh(); } catch(e){notify(e.message);} }
  return <><PageHeading eyebrow="COLLECTION MANAGEMENT" title="Your collections" description="Every pickup is one more step toward a circular community." action={user?.role==="supplier"?null:onCreate}/><div className="filter-row"><div className="filter-tabs">{["All","Open","Accepted","Picked up","Completed","Cancelled"].map(s=><button className={status===s?"selected":""} key={s} onClick={()=>setStatus(s)}>{s}</button>)}</div><div className="filter-indicator"><Filter size={15}/> {filtered.length} requests</div></div><div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Material</th><th>Quantity</th><th>Pickup location</th><th>Created</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map(item=><tr key={item._id}><td><div className="table-material"><span className={`material-icon ${categoryFor(item.category).color}`}>{categoryFor(item.category).icon}</span><span><strong>{item.category}</strong><small>{item.description||"No description"}</small></span></div></td><td><strong>{item.quantityKg} kg</strong></td><td><span className="location-cell"><MapPin size={14}/>{item.address}</span></td><td>{dateText(item.createdAt)}</td><td><StatusBadge status={item.status}/></td><td><div className="action-stack">{item.status==="Picked up"&&user?.role!=="supplier"&&<button className="tiny-action" onClick={()=>updateStatus(item,"Completed")}>Confirm</button>}{item.status==="Open"&&<span className="muted">Awaiting recycler</span>}{item.status==="Accepted"&&<span className="muted">Pickup scheduled</span>}{item.status==="Completed"&&<span className="complete-text"><CheckCircle2 size={14}/> Done</span>}</div></td></tr>)}</tbody></table>{!filtered.length&&<EmptyState title="No matching collections" text="Try a different filter or create a new pickup request."/>}</div></div></>;
}
function Marketplace({items,user,onRefresh,search,notify}) {
  const [category,setCategory]=useState("All materials");
  const [busyId,setBusyId]=useState("");
  const list=items.filter(i=>(category==="All materials"||i.category===category)&&`${i.category} ${i.description} ${i.address}`.toLowerCase().includes(search.toLowerCase()));
  async function accept(item) {setBusyId(item._id);try{await api(`/collections/${item._id}/accept`,{method:"PATCH",body:JSON.stringify({})});notify("Collection accepted. Coordinate pickup with the owner.");onRefresh();}catch(e){notify(e.message);}finally{setBusyId("");}}
  async function offer(item) { const amount=window.prompt("Optional offer amount in INR (enter 0 if no payment):","0");if(amount===null)return;const message=window.prompt("Short note for the owner:","I can collect this material.");if(message===null)return;try{await api(`/collections/${item._id}/offers`,{method:"POST",body:JSON.stringify({amount:Number(amount),message})});notify("Your offer was submitted.");onRefresh();}catch(e){notify(e.message);} }
  async function markPickedUp(item) { try { await api(`/collections/${item._id}/status`, {method:"PATCH", body:JSON.stringify({status:"Picked up"})}); notify("Pickup marked. The owner can confirm completion."); onRefresh(); } catch(e) { notify(e.message); } }
  return <><PageHeading eyebrow="RECYCLING NETWORK" title="Supplier marketplace" description="Discover recoverable materials and turn them back into useful resources."/><div className="market-hero"><div className="market-hero-icon"><Truck size={27}/></div><div><strong>Good materials are waiting for a second life.</strong><p>Browse local collection requests, accept a pickup, or make an offer.</p></div><div className="market-stat"><strong>{items.filter(i=>i.status==="Open").length}</strong><small>OPEN REQUESTS</small></div></div><div className="filter-row"><div className="select-filter"><Filter size={15}/><select value={category} onChange={e=>setCategory(e.target.value)}><option>All materials</option>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></div><span className="filter-indicator">{list.length} opportunities</span></div><div className="market-grid">{list.map(item=>{const c=categoryFor(item.category);return <article className="market-card" key={item._id}><div className={`market-card-art ${c.color}`}><span className="market-material-emoji">{c.icon}</span><span className="status-badge open"><i/> {item.status}</span><span className="market-art-ring"/></div><div className="market-card-content"><div className="market-card-top"><span className="eyebrow">{item.category.toUpperCase()} MATERIAL</span><span className="quantity-pill"><Boxes size={13}/>{item.quantityKg} kg</span></div><h3>{item.description||`${item.category} ready for collection`}</h3><div className="market-owner"><div className="avatar small">{initials(item.owner?.name||"Community")}</div><span>Posted by <strong>{item.owner?.name||"Community member"}</strong></span></div><div className="market-details"><span><MapPin size={15}/>{item.address}</span><span><Clock3 size={15}/>{dateText(item.preferredDate||item.createdAt)}</span></div><div className="market-card-footer">{user?.role==="supplier"?(item.status==="Accepted"&&String(item.supplier?._id||item.supplier)===String(user.id)?<button className="primary-button full-width" onClick={()=>markPickedUp(item)}><CheckCircle2 size={15}/> Mark picked up</button>:<><button className="secondary-button" onClick={()=>offer(item)} disabled={item.status!=="Open"}>Make offer</button><button className="primary-button" disabled={item.status!=="Open"||busyId===item._id} onClick={()=>accept(item)}>{busyId===item._id?<LoaderCircle className="spin" size={15}/>:<Truck size={15}/>} Accept pickup</button></>):<button className="secondary-button full-width" onClick={()=>notify("Sign in as a recycler / supplier to accept a pickup.")}>View collection details <ArrowUpRight size={15}/></button>}</div></div></article>})}{!list.length&&<div className="panel empty-market"><EmptyState title="No requests found" text="Try another material filter or check back soon."/></div>}</div></>;
}
function Impact({metrics,collections,user}) {
  const kg=metrics.kgCollected||0, points=metrics.ecoPoints||0;
  return <><PageHeading eyebrow="MEASURE WHAT MATTERS" title="Impact & rewards" description="Your everyday choices are adding up to a more circular future."/><div className="impact-banner"><div><div className="welcome-pill"><span/> YOUR IMPACT SUMMARY</div><h2>Progress looks good<br/>on <em>you.</em></h2><p>Every correctly sorted item gives valuable resources another chance.</p></div><div className="impact-score"><div className="score-ring"><div><strong>{points}</strong><small>ECO POINTS</small></div></div><span><Award size={16}/> Circular champion</span></div></div><div className="stats-grid impact-stats"><StatCard icon={Recycle} tint="mint" label="Waste diverted" value={`${kg} kg`} trend="Tracked" note="Based on your collection activity"/><StatCard icon={Award} tint="gold" label="Eco-points" value={points.toLocaleString()} trend="Earned" note="Awarded after confirmed completion"/><StatCard icon={CheckCircle2} tint="green" label="Completed actions" value={metrics.completed||0} trend="Verified" note="Completed collections"/><StatCard icon={TrendingUp} tint="blue" label="Participation" value={metrics.total?Math.round((metrics.completed/metrics.total)*100)+"%":"0%"} trend="Progress" note="Completed requests / all requests"/></div><div className="content-grid"><section className="panel"><div className="panel-heading"><div><h3>How eco-points work</h3><p>Rewarding real actions, not just good intentions.</p></div><div className="sparkle-icon"><Award size={17}/></div></div><div className="reward-rule"><span className="reward-emoji">♻️</span><div><strong>Confirmed recycling</strong><p>Earn 10 points per kg, with a minimum of 5 points per completed collection.</p></div></div><div className="reward-rule"><span className="reward-emoji">🌱</span><div><strong>Keep your materials sorted</strong><p>Check local guidelines and keep recyclables clean and separated.</p></div></div><div className="reward-rule"><span className="reward-emoji">🤝</span><div><strong>Support your community</strong><p>Use verified suppliers and confirm the pickup after it happens.</p></div></div></section><section className="panel milestones-panel"><div className="panel-heading"><div><h3>Your milestones</h3><p>Every loop starts with one small action.</p></div></div>{[{name:"First loop",desc:"Complete your first collection",target:1,progress:metrics.completed||0,icon:"🌱"},{name:"Waste warrior",desc:"Divert 50 kg of waste",target:50,progress:kg,icon:"♻️"},{name:"Circular champion",desc:"Earn 500 eco-points",target:500,progress:points,icon:"🏆"}].map(m=><div className="milestone" key={m.name}><span className="milestone-emoji">{m.icon}</span><div className="milestone-info"><div><strong>{m.name}</strong><small>{m.desc}</small></div><b>{Math.min(100,Math.round(m.progress/m.target*100))}%</b><div className="milestone-bar"><span style={{width:`${Math.min(100,m.progress/m.target*100)}%`}}/></div></div></div>)}</section></div></>;
}
function Suppliers({items,search}) {
  const filtered=items.filter(s=>`${s.name} ${s.address}`.toLowerCase().includes(search.toLowerCase()));
  return <><PageHeading eyebrow="TRUSTED CIRCULAR NETWORK" title="Suppliers & recyclers" description="Explore the people helping keep valuable materials in circulation."/><div className="supplier-intro"><div className="supplier-intro-icon"><Users size={24}/></div><div><strong>Local expertise makes circularity possible.</strong><p>Supplier verification is managed by the platform administrator. Always confirm the collection details before handover.</p></div></div><div className="supplier-grid">{filtered.map((s,i)=><div className="supplier-card" key={s._id}><div className="supplier-card-top"><div className={`supplier-avatar av-${i%4}`}>{initials(s.name)}</div>{s.verifiedSupplier?<span className="verified"><BadgeCheck size={14}/> Verified</span>:<span className="unverified">Listed supplier</span>}</div><h3>{s.name}</h3><p><MapPin size={14}/>{s.address||"Service area not provided"}</p><div className="supplier-card-foot"><span><Recycle size={15}/> Recycling partner</span><span>Joined {dateText(s.createdAt)}</span></div></div>)}{!filtered.length&&<div className="panel empty-market"><EmptyState title="No suppliers listed yet" text="Supplier accounts will appear here after registration."/></div>}</div></>;
}
function AuthModal({mode,setMode,onSubmit,onClose}) {
  const [form,setForm]=useState({name:"",email:"",password:"",role:"resident"}),[busy,setBusy]=useState(false),[show,setShow]=useState(false);
  const update=(k,v)=>setForm(p=>({...p,[k]:v}));
  async function submit(e){e.preventDefault();setBusy(true);try{await onSubmit(form);}finally{setBusy(false);}}
  return <div className="auth-backdrop"><div className="auth-card"><button className="auth-close icon-button" onClick={onClose} title="Preview without signing in"><X size={18}/></button><div className="auth-brand"><div className="brand-mark"><Leaf size={22}/></div><strong>ecoloop<span>ai</span></strong></div><div className="auth-illustration"><div className="auth-plant">🌿</div><div className="auth-orbit"/></div><div className="eyebrow">A MORE CIRCULAR TOMORROW</div><h2>{mode==="register"?"Join the green movement.":"Waste less. Do more."}</h2><p className="auth-description">{mode==="register"?"Create your EcoLoop account and connect with your local circular community.":"Sign in to manage collections, discover recyclers, and track your impact."}</p><form onSubmit={submit} className="auth-form">{mode==="register"&&<label className="field-label">Full name<input required value={form.name} onChange={e=>update("name",e.target.value)} placeholder="Your name"/></label>}<label className="field-label">Email address<input required type="email" value={form.email} onChange={e=>update("email",e.target.value)} placeholder="you@example.com"/></label><label className="field-label">Password<div className="password-input"><input required minLength={mode==="register"?8:1} type={show?"text":"password"} value={form.password} onChange={e=>update("password",e.target.value)} placeholder={mode==="register"?"At least 8 characters":"Enter your password"}/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>{mode==="register"&&<label className="field-label">I am joining as<select value={form.role} onChange={e=>update("role",e.target.value)}><option value="resident">Community member</option><option value="supplier">Recycler / supplier</option></select></label>}<button className="primary-button auth-submit" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<Leaf size={17}/>} {mode==="register"?"Create account":"Sign in to EcoLoop"}</button></form><div className="auth-switch">{mode==="register"?"Already part of the loop?":"New to EcoLoop?"} <button onClick={()=>setMode(mode==="register"?"login":"register")}>{mode==="register"?"Sign in":"Create an account"}</button></div><button className="preview-link" onClick={onClose}>Explore the preview first <ArrowUpRight size={14}/></button><div className="auth-trust"><ShieldCheck size={14}/> Your community. Your impact. A greener tomorrow.</div></div></div>;
}

export default App;
