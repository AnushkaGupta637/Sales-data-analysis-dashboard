import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const C = {
  bg:       "#0A0D14",
  surface:  "#111520",
  card:     "#161B2E",
  border:   "#1E2540",
  primary:  "#6C63FF",
  secondary:"#00D4AA",
  accent:   "#FF6B6B",
  gold:     "#FFB347",
  text:     "#E8ECF4",
  muted:    "#6B7491",
  dim:      "#3A4060",
};

const PIE_COLORS = ["#6C63FF","#00D4AA","#FF6B6B","#FFB347","#45B7D1"];

const monthlyData = [
  {m:"Jan",revenue:142000,profit:34000,orders:312,target:130000},
  {m:"Feb",revenue:128000,profit:28000,orders:287,target:135000},
  {m:"Mar",revenue:165000,profit:41000,orders:358,target:140000},
  {m:"Apr",revenue:179000,profit:47000,orders:401,target:150000},
  {m:"May",revenue:193000,profit:52000,orders:435,target:160000},
  {m:"Jun",revenue:210000,profit:58000,orders:462,target:170000},
  {m:"Jul",revenue:198000,profit:49000,orders:443,target:180000},
  {m:"Aug",revenue:224000,profit:63000,orders:491,target:185000},
  {m:"Sep",revenue:241000,profit:69000,orders:522,target:195000},
  {m:"Oct",revenue:258000,profit:74000,orders:548,target:200000},
  {m:"Nov",revenue:287000,profit:82000,orders:601,target:210000},
  {m:"Dec",revenue:312000,profit:91000,orders:643,target:220000},
];

const regionData = [
  {region:"North",revenue:671000,profit:178000,customers:423,margin:26.5},
  {region:"East", revenue:612000,profit:159000,customers:389,margin:26.0},
  {region:"West", revenue:558000,profit:144000,customers:356,margin:25.8},
  {region:"South",revenue:496000,profit:121000,customers:312,margin:24.4},
];

const categoryData = [
  {name:"Electronics",value:38,revenue:876000,margin:22.4},
  {name:"Furniture",  value:24,revenue:553000,margin:28.1},
  {name:"Clothing",   value:19,revenue:438000,margin:31.2},
  {name:"Sports",     value:12,revenue:277000,margin:25.6},
  {name:"Food",       value:7, revenue:162000,margin:18.9},
];

const segmentData = [
  {segment:"Consumer",   revenue:1148000,orders:1241,clv:924},
  {segment:"Corporate",  revenue:688000, orders:743, clv:926},
  {segment:"Home Office",revenue:461000, orders:497, clv:927},
];

const rfmData = [
  {segment:"Champions",          count:87, revenue:412000, color:"#00D4AA"},
  {segment:"Loyal Customers",    count:124,revenue:298000, color:"#6C63FF"},
  {segment:"Potential Loyalists",count:156,revenue:187000, color:"#FFB347"},
  {segment:"At Risk",            count:98, revenue:112000, color:"#FF6B6B"},
  {segment:"Lost",               count:35, revenue:34000,  color:"#6B7491"},
];

const discountData = [
  {discount:"0%", orders:1241,margin:29.4,revenue:892000},
  {discount:"5%", orders:743, margin:25.1,revenue:498000},
  {discount:"10%",orders:489, margin:21.3,revenue:301000},
  {discount:"15%",orders:278, margin:16.8,revenue:171000},
  {discount:"20%",orders:112, margin:11.2,revenue:75000},
];

const radarData = [
  {metric:"Revenue",  North:88,South:65,East:80,West:73},
  {metric:"Profit",   North:82,South:60,East:75,West:70},
  {metric:"Orders",   North:85,South:62,East:78,West:72},
  {metric:"CLV",      North:79,South:68,East:74,West:76},
  {metric:"Growth",   North:72,South:58,East:83,West:69},
  {metric:"Retention",North:86,South:55,East:71,West:68},
];

const fmt  = n => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n}`;
const fmtN = n => n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : n;

const KpiCard = ({ label, value, sub, delta, color }) => (
  <div style={{
    background:C.card, border:`1px solid ${C.border}`,
    borderRadius:12, padding:"20px 22px",
    borderTop:`3px solid ${color || C.primary}`,
    display:"flex", flexDirection:"column", gap:6,
  }}>
    <span style={{fontSize:11,letterSpacing:1.5,color:C.muted,textTransform:"uppercase",fontWeight:600}}>{label}</span>
    <span style={{fontSize:26,fontWeight:700,color:C.text,fontFamily:"monospace",letterSpacing:-0.5}}>{value}</span>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      {delta !== undefined && (
        <span style={{
          fontSize:12,fontWeight:600,
          color:delta>=0?C.secondary:C.accent,
          background:delta>=0?"#00D4AA18":"#FF6B6B18",
          padding:"2px 8px",borderRadius:20,
        }}>
          {delta>=0?"▲":"▼"} {Math.abs(delta)}%
        </span>
      )}
      {sub && <span style={{fontSize:12,color:C.muted}}>{sub}</span>}
    </div>
  </div>
);

const SectionHead = ({ title, subtitle }) => (
  <div style={{marginBottom:16}}>
    <h3 style={{margin:0,fontSize:16,fontWeight:700,color:C.text}}>{title}</h3>
    {subtitle && <p style={{margin:"4px 0 0",fontSize:12,color:C.muted}}>{subtitle}</p>}
  </div>
);

const Card = ({ children, style={} }) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:22,...style}}>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#1A2035",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.text}}>
      <div style={{fontWeight:700,marginBottom:6,color:C.muted}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:p.color,display:"inline-block"}}/>
          <span style={{color:C.muted}}>{p.name}:</span>
          <span style={{fontWeight:600}}>{typeof p.value==="number"&&p.value>1000?fmt(p.value):p.value}</span>
        </div>
      ))}
    </div>
  );
};

const TABS = ["Overview","Sales Trends","Regional","Customers","Products","SQL & Code"];

export default function App() {
  const [tab, setTab] = useState("Overview");

  const totalRevenue = monthlyData.reduce((a,b)=>a+b.revenue,0);
  const totalProfit  = monthlyData.reduce((a,b)=>a+b.profit,0);
  const totalOrders  = monthlyData.reduce((a,b)=>a+b.orders,0);
  const margin       = ((totalProfit/totalRevenue)*100).toFixed(1);

  return (
    <div style={{minHeight:"100vh",width:"100%",background:C.bg,color:C.text,fontFamily:"system-ui,sans-serif",fontSize:14}}>

      {/* HEADER */}
      <div style={{borderBottom:`1px solid ${C.border}`,background:C.surface,padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60,position:"sticky",top:0,zIndex:100,width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.primary},${C.secondary})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>📊</div>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>SalesIQ</div>
            <div style={{fontSize:10,color:C.muted,letterSpacing:1}}>ANALYTICS PLATFORM</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["2022","2023","All Time"].map(y=>(
            <button key={y} style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${C.border}`,background:y==="All Time"?C.primary:"transparent",color:y==="All Time"?"#fff":C.muted,cursor:"pointer",fontSize:12,fontWeight:600}}>{y}</button>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",padding:"0 28px",borderBottom:`1px solid ${C.border}`,background:C.surface,overflowX:"auto",width:"100%"}}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"14px 18px",border:"none",background:"transparent",color:tab===t?C.primary:C.muted,borderBottom:tab===t?`2px solid ${C.primary}`:"2px solid transparent",cursor:"pointer",fontWeight:tab===t?700:400,fontSize:13,whiteSpace:"nowrap"}}>
            {t}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{padding:"24px 28px",maxWidth:1400,margin:"0 auto",width:"100%"}}>

        {/* OVERVIEW */}
        {tab==="Overview" && (
          <div style={{display:"flex",flexDirection:"column",gap:22}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
              <KpiCard label="Total Revenue"    value={fmt(totalRevenue)}  delta={18.4} sub="vs last year"    color={C.primary}/>
              <KpiCard label="Net Profit"       value={fmt(totalProfit)}   delta={22.1} sub="vs last year"    color={C.secondary}/>
              <KpiCard label="Profit Margin"    value={`${margin}%`}       delta={2.3}  sub="YoY improvement" color={C.gold}/>
              <KpiCard label="Total Orders"     value={fmtN(totalOrders)}  delta={15.7} sub="vs last year"    color={C.accent}/>
              <KpiCard label="Avg Order Value"  value={fmt(Math.round(totalRevenue/totalOrders))} delta={2.3} sub="per transaction" color="#45B7D1"/>
              <KpiCard label="Unique Customers" value="500"                delta={12.0} sub="active buyers"   color="#FF9ECD"/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
              <Card>
                <SectionHead title="Revenue vs Profit — Monthly" subtitle="Full year 2023 performance"/>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={monthlyData} margin={{top:8,right:8,left:0,bottom:0}}>
                    <defs>
                      <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.primary} stopOpacity={0.3}/>
                        <stop offset="100%" stopColor={C.primary} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.secondary} stopOpacity={0.3}/>
                        <stop offset="100%" stopColor={C.secondary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
                    <XAxis dataKey="m" tick={{fill:C.muted,fontSize:11}}/>
                    <YAxis tickFormatter={v=>`$${v/1000}K`} tick={{fill:C.muted,fontSize:11}}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend wrapperStyle={{fontSize:12,color:C.muted}}/>
                    <Area dataKey="revenue" name="Revenue" stroke={C.primary}   fill="url(#gRev)" strokeWidth={2}/>
                    <Area dataKey="profit"  name="Profit"  stroke={C.secondary} fill="url(#gPro)" strokeWidth={2}/>
                    <Line dataKey="target"  name="Target"  stroke={C.gold} strokeDasharray="5 3" strokeWidth={1.5} dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <SectionHead title="Revenue by Category"/>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {categoryData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
                    </Pie>
                    <Tooltip formatter={(v,n)=>[`${v}%`,n]}/>
                    <Legend wrapperStyle={{fontSize:11,color:C.muted}}/>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <Card>
                <SectionHead title="Regional Revenue"/>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={regionData} layout="vertical" margin={{left:8}}>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3" horizontal={false}/>
                    <XAxis type="number" tickFormatter={v=>`$${v/1000}K`} tick={{fill:C.muted,fontSize:11}}/>
                    <YAxis type="category" dataKey="region" tick={{fill:C.muted,fontSize:12}} width={50}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="revenue" name="Revenue" radius={[0,6,6,0]}>
                      {regionData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <SectionHead title="Customer Segments"/>
                <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
                  {segmentData.map((s,i)=>(
                    <div key={i}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontWeight:600}}>{s.segment}</span>
                        <span style={{color:C.muted,fontSize:12}}>{fmt(s.revenue)} · {s.orders} orders</span>
                      </div>
                      <div style={{height:8,borderRadius:4,background:C.border,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${(s.revenue/1148000*100).toFixed(1)}%`,background:PIE_COLORS[i],borderRadius:4}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* SALES TRENDS */}
        {tab==="Sales Trends" && (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <Card>
              <SectionHead title="Monthly Revenue vs Target" subtitle="Tracking performance against set targets"/>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
                  <XAxis dataKey="m" tick={{fill:C.muted,fontSize:11}}/>
                  <YAxis tickFormatter={v=>`$${v/1000}K`} tick={{fill:C.muted,fontSize:11}}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{fontSize:12,color:C.muted}}/>
                  <Bar dataKey="revenue" name="Revenue" fill={C.primary} radius={[4,4,0,0]}/>
                  <Bar dataKey="target"  name="Target"  fill={C.dim}    radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <Card>
                <SectionHead title="Order Volume Trend"/>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
                    <XAxis dataKey="m" tick={{fill:C.muted,fontSize:11}}/>
                    <YAxis tick={{fill:C.muted,fontSize:11}}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Line dataKey="orders" name="Orders" stroke={C.gold} strokeWidth={2.5} dot={{fill:C.gold,r:3}}/>
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <SectionHead title="Discount Impact on Margin"/>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={discountData}>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
                    <XAxis dataKey="discount" tick={{fill:C.muted,fontSize:11}}/>
                    <YAxis tick={{fill:C.muted,fontSize:11}}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="margin" name="Margin %" radius={[4,4,0,0]}>
                      {discountData.map((_,i)=><Cell key={i} fill={i<2?C.secondary:i<4?C.gold:C.accent}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {/* REGIONAL */}
        {tab==="Regional" && (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
              {regionData.map((r,i)=>(
                <KpiCard key={i} label={r.region} value={fmt(r.revenue)} sub={`${r.margin}% margin`} delta={[18,12,21,9][i]} color={PIE_COLORS[i]}/>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <Card>
                <SectionHead title="Region Performance Radar" subtitle="Multi-metric comparison across regions"/>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={C.border}/>
                    <PolarAngleAxis dataKey="metric" tick={{fill:C.muted,fontSize:11}}/>
                    <Radar name="North" dataKey="North" stroke={C.primary}   fill={C.primary}   fillOpacity={0.15}/>
                    <Radar name="East"  dataKey="East"  stroke={C.secondary} fill={C.secondary} fillOpacity={0.15}/>
                    <Radar name="West"  dataKey="West"  stroke={C.gold}      fill={C.gold}      fillOpacity={0.1}/>
                    <Radar name="South" dataKey="South" stroke={C.accent}    fill={C.accent}    fillOpacity={0.1}/>
                    <Legend wrapperStyle={{fontSize:11,color:C.muted}}/>
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <SectionHead title="Revenue & Customers by Region"/>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={regionData}>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
                    <XAxis dataKey="region" tick={{fill:C.muted,fontSize:11}}/>
                    <YAxis yAxisId="left"  tickFormatter={v=>`$${v/1000}K`} tick={{fill:C.muted,fontSize:11}}/>
                    <YAxis yAxisId="right" orientation="right" tick={{fill:C.muted,fontSize:11}}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend wrapperStyle={{fontSize:12,color:C.muted}}/>
                    <Bar yAxisId="left"  dataKey="revenue"   name="Revenue"   fill={C.primary}   radius={[4,4,0,0]}/>
                    <Bar yAxisId="right" dataKey="customers" name="Customers" fill={C.secondary} radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
            <Card>
              <SectionHead title="Regional Performance Matrix"/>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${C.border}`}}>
                    {["Region","Revenue","Profit","Margin","Customers","Avg CLV"].map(h=>(
                      <th key={h} style={{textAlign:"left",padding:"10px 12px",color:C.muted,fontWeight:600,fontSize:11,letterSpacing:0.8}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {regionData.map((r,i)=>(
                    <tr key={i} style={{borderBottom:`1px solid ${C.border}20`}}>
                      <td style={{padding:"12px",fontWeight:700}}>
                        <span style={{width:8,height:8,borderRadius:"50%",background:PIE_COLORS[i],display:"inline-block",marginRight:8}}/>
                        {r.region}
                      </td>
                      <td style={{padding:"12px",fontFamily:"monospace"}}>{fmt(r.revenue)}</td>
                      <td style={{padding:"12px",fontFamily:"monospace",color:C.secondary}}>{fmt(r.profit)}</td>
                      <td style={{padding:"12px"}}>
                        <span style={{background:r.margin>26?"#00D4AA18":"#FFB34718",color:r.margin>26?C.secondary:C.gold,padding:"2px 8px",borderRadius:20,fontSize:12}}>{r.margin}%</span>
                      </td>
                      <td style={{padding:"12px"}}>{r.customers}</td>
                      <td style={{padding:"12px",fontFamily:"monospace"}}>${Math.round(r.revenue/r.customers)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* CUSTOMERS */}
        {tab==="Customers" && (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <Card>
              <SectionHead title="RFM Customer Segmentation" subtitle="Recency · Frequency · Monetary analysis"/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginTop:4}}>
                {rfmData.map((s,i)=>(
                  <div key={i} style={{background:C.surface,borderRadius:10,padding:16,border:`1px solid ${s.color}30`,textAlign:"center"}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:`${s.color}22`,border:`2px solid ${s.color}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",fontSize:18}}>
                      {["🏆","💎","⭐","⚠️","😴"][i]}
                    </div>
                    <div style={{fontWeight:700,fontSize:12,marginBottom:4,color:C.text}}>{s.segment}</div>
                    <div style={{color:s.color,fontFamily:"monospace",fontSize:18,fontWeight:700}}>{s.count}</div>
                    <div style={{color:C.muted,fontSize:11,marginTop:2}}>{fmt(s.revenue)}</div>
                  </div>
                ))}
              </div>
            </Card>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <Card>
                <SectionHead title="Segment Revenue Distribution"/>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={rfmData}>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
                    <XAxis dataKey="segment" tick={{fill:C.muted,fontSize:9}} angle={-20} textAnchor="end" height={50}/>
                    <YAxis tickFormatter={v=>`$${v/1000}K`} tick={{fill:C.muted,fontSize:11}}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="revenue" name="Revenue" radius={[6,6,0,0]}>
                      {rfmData.map((s,i)=><Cell key={i} fill={s.color}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <SectionHead title="Purchase Segment Split"/>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={segmentData} dataKey="revenue" nameKey="segment" cx="50%" cy="50%" outerRadius={90} paddingAngle={4}>
                      {segmentData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
                    </Pie>
                    <Tooltip formatter={(v)=>[fmt(v),"Revenue"]}/>
                    <Legend wrapperStyle={{fontSize:11,color:C.muted}}/>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab==="Products" && (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14}}>
              {categoryData.map((c,i)=>(
                <KpiCard key={i} label={c.name} value={fmt(c.revenue)} sub={`${c.margin}% margin`} delta={[12,8,21,5,15][i]} color={PIE_COLORS[i]}/>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:16}}>
              <Card>
                <SectionHead title="Category Revenue & Margin" subtitle="Revenue bars · Margin line overlay"/>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryData}>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
                    <XAxis dataKey="name" tick={{fill:C.muted,fontSize:11}}/>
                    <YAxis yAxisId="left"  tickFormatter={v=>`$${v/1000}K`} tick={{fill:C.muted,fontSize:11}}/>
                    <YAxis yAxisId="right" orientation="right" unit="%" tick={{fill:C.muted,fontSize:11}}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend wrapperStyle={{fontSize:12,color:C.muted}}/>
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue" radius={[6,6,0,0]}>
                      {categoryData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="margin" name="Margin %" stroke={C.gold} strokeWidth={2} dot={{r:4,fill:C.gold}}/>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <SectionHead title="Market Share"/>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={95} paddingAngle={3} label={({name,value})=>`${name} ${value}%`} labelLine={{stroke:C.muted}}>
                      {categoryData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
                    </Pie>
                    <Tooltip formatter={(v)=>[`${v}%`,"Share"]}/>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {/* SQL & CODE */}
        {tab==="SQL & Code" && (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {[
              {title:"Python — Data Cleaning & RFM Segmentation",lang:"python",code:`import pandas as pd\nimport numpy as np\nfrom datetime import timedelta\n\ndf = pd.read_csv('sales_data.csv', parse_dates=['order_date'])\ndf.dropna(subset=['sales','customer_id'], inplace=True)\ndf = df[df['sales'] > 0]\n\nsnapshot = df['order_date'].max() + timedelta(days=1)\nrfm = df.groupby('customer_id').agg(\n    recency=('order_date', lambda x: (snapshot - x.max()).days),\n    frequency=('order_id', 'count'),\n    monetary=('sales', 'sum')\n)\nrfm['R'] = pd.qcut(rfm['recency'], q=4, labels=[4,3,2,1])\nrfm['F'] = pd.qcut(rfm['frequency'].rank(method='first'), q=4, labels=[1,2,3,4])\nrfm['M'] = pd.qcut(rfm['monetary'], q=4, labels=[1,2,3,4])\n\ndef label(row):\n    s = int(row['R']) + int(row['F']) + int(row['M'])\n    if s >= 10: return 'Champions'\n    if s >= 8:  return 'Loyal'\n    if s >= 6:  return 'Potential'\n    if s >= 4:  return 'At Risk'\n    return 'Lost'\n\nrfm['segment'] = rfm.apply(label, axis=1)\nprint(rfm.groupby('segment').agg(count=('monetary','count'), avg_value=('monetary','mean')).round(2))`},
              {title:"SQL — RFM Segmentation with Window Functions",lang:"sql",code:`WITH rfm_base AS (\n    SELECT customer_id,\n        DATEDIFF(CURRENT_DATE, MAX(order_date)) AS recency_days,\n        COUNT(DISTINCT order_id) AS frequency,\n        ROUND(SUM(sales), 2) AS monetary\n    FROM sales GROUP BY customer_id\n),\nrfm_scored AS (\n    SELECT *,\n        NTILE(4) OVER (ORDER BY recency_days DESC) AS r_score,\n        NTILE(4) OVER (ORDER BY frequency) AS f_score,\n        NTILE(4) OVER (ORDER BY monetary) AS m_score\n    FROM rfm_base\n)\nSELECT *,\n    CASE\n        WHEN r_score+f_score+m_score >= 10 THEN 'Champions'\n        WHEN r_score+f_score+m_score >= 8  THEN 'Loyal Customers'\n        WHEN r_score+f_score+m_score >= 6  THEN 'Potential Loyalists'\n        WHEN r_score+f_score+m_score >= 4  THEN 'At Risk'\n        ELSE 'Lost'\n    END AS customer_segment\nFROM rfm_scored ORDER BY monetary DESC;`},
              {title:"SQL — Monthly Revenue & Rolling Average",lang:"sql",code:`SELECT\n    DATE_FORMAT(order_date, '%Y-%m') AS month,\n    ROUND(SUM(sales), 2) AS monthly_revenue,\n    COUNT(DISTINCT order_id) AS orders,\n    ROUND(AVG(SUM(sales)) OVER (\n        ORDER BY DATE_FORMAT(order_date, '%Y-%m')\n        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n    ), 2) AS rolling_3m_avg\nFROM sales\nGROUP BY DATE_FORMAT(order_date, '%Y-%m')\nORDER BY month;`},
              {title:"SQL — Regional Market Share",lang:"sql",code:`SELECT\n    region,\n    ROUND(SUM(sales), 2) AS revenue,\n    ROUND(SUM(sales) / SUM(SUM(sales)) OVER () * 100, 2) AS market_share_pct,\n    ROUND(SUM(profit) / NULLIF(SUM(sales), 0) * 100, 2) AS margin_pct,\n    COUNT(DISTINCT customer_id) AS unique_customers\nFROM sales\nGROUP BY region\nORDER BY market_share_pct DESC;`},
            ].map((block,i)=>(
              <Card key={i}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <span style={{background:block.lang==="python"?"#3776AB22":"#00758F22",color:block.lang==="python"?"#4B9ADB":"#00D4AA",padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>{block.lang}</span>
                  <span style={{fontWeight:700,color:C.text}}>{block.title}</span>
                </div>
                <pre style={{background:C.bg,borderRadius:8,padding:18,margin:0,overflow:"auto",fontSize:12,fontFamily:"monospace",color:"#A9B7D0",lineHeight:1.7,border:`1px solid ${C.border}`}}>
                  <code>{block.code}</code>
                </pre>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div style={{textAlign:"center",padding:"20px",color:C.muted,fontSize:11,borderTop:`1px solid ${C.border}`,marginTop:40}}>
        SalesIQ Dashboard · Python · Pandas · SQL · Built for Portfolio
      </div>
    </div>
  );
}