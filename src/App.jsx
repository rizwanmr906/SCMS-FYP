import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BellRing,
  Briefcase,
  ClipboardList,
  Clock3,
  Cpu,
  Droplets,
  Flame,
  LineChart,
  MapPin,
  Radio,
  Search,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Waves,
  Zap,
} from 'lucide-react';

const departmentStyles = {
  Electricity: {
    accent: 'from-cyan-400 to-blue-500',
    accentStrong: 'text-cyan-300',
    glow: 'shadow-[0_0_35px_rgba(59,130,246,0.45)]',
    chip: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
    panel: 'border-cyan-400/35 bg-cyan-500/10',
    ring: 'ring-cyan-300/40',
    icon: Zap,
    title: 'Electricity Department',
    shortTitle: 'Power Grid',
    label: 'Energy Demand Team',
    metricTitle: 'Grid Stability',
    serviceLine: 'Distribution Network',
    summary: 'Monitoring city-wide voltage, outage incidents, substations, and public lighting interruptions.',
  },
  Gas: {
    accent: 'from-amber-400 to-orange-500',
    accentStrong: 'text-amber-300',
    glow: 'shadow-[0_0_35px_rgba(249,115,22,0.4)]',
    chip: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
    panel: 'border-amber-400/35 bg-amber-500/10',
    ring: 'ring-amber-300/40',
    icon: Flame,
    title: 'Gas Department',
    shortTitle: 'Gas Safety Unit',
    label: 'Leak & Safety Response Unit',
    metricTitle: 'Leak Risk Index',
    serviceLine: 'Gas Safety Response',
    summary: 'Coordinating leak inspection, cylinder compliance, hazard checks, and emergency dispatch visibility.',
  },
  Water: {
    accent: 'from-teal-300 to-cyan-500',
    accentStrong: 'text-teal-300',
    glow: 'shadow-[0_0_35px_rgba(45,212,191,0.4)]',
    chip: 'bg-teal-500/20 text-teal-200 border-teal-400/30',
    panel: 'border-teal-400/35 bg-teal-500/10',
    ring: 'ring-teal-300/40',
    icon: Droplets,
    title: 'Water Department',
    shortTitle: 'Water Services',
    label: 'Supply & Drainage Team',
    metricTitle: 'Water Supply Health',
    serviceLine: 'Supply & Drainage Network',
    summary: 'Prioritizing water pressure issues, supply shortages, pipeline pressure safety, and drainage recovery.',
  },
};


const statusColumns = [
  { key: 'New', title: 'New', status: 'AI Routed' },
  { key: 'In Progress', title: 'In Progress', status: 'In Progress' },
  { key: 'Resolved', title: 'Resolved', status: 'Resolved' },
];

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString; 
  
  const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSecs < 60) return 'just now';
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
};

const DepartmentView = ({ complaints, updateComplaintStatus, setSelectedComplaint }) => {
  const { departmentName } = useParams();

  const matchedDepartment = Object.keys(departmentStyles).find(
    (d) => d.toLowerCase() === departmentName?.toLowerCase()
  );

  if (!matchedDepartment) {
    return <Navigate to="/user" replace />;
  }

  const departmentInformation = departmentStyles[matchedDepartment];
  const Icon = departmentInformation.icon;
  const departmentComplaints = complaints.filter((item) => item.department === matchedDepartment);
  const activeCount = departmentComplaints.length;
  const resolvedCount = departmentComplaints.filter((c) => c.status === 'Resolved').length;
  const progressCount = departmentComplaints.filter((c) => c.status === 'In Progress').length;
  const aiRoutedCount = departmentComplaints.filter((c) => c.status === 'AI Routed').length;

  const departmentMenus = [
    {
      key: 'New',
      title: 'New',
      status: 'AI Routed',
      description: matchedDepartment === 'Electricity'
        ? 'Fresh power intake complaints'
        : matchedDepartment === 'Water'
          ? 'Fresh water supply complaints'
          : 'Fresh gas safety intake',
    },
    {
      key: 'In Progress',
      title: 'In Progress',
      status: 'In Progress',
      description: matchedDepartment === 'Electricity'
        ? 'Active power response cases'
        : matchedDepartment === 'Water'
          ? 'Active water response cases'
          : 'Active gas response cases',
    },
    {
      key: 'Resolved',
      title: 'Resolved',
      status: 'Resolved',
      description: matchedDepartment === 'Electricity'
        ? 'Completed power network tasks'
        : matchedDepartment === 'Water'
          ? 'Completed water service tasks'
          : 'Completed gas safety checks',
    },
  ];

  const IconForDepartment = departmentStyles[matchedDepartment].icon;
  const serviceLabel = departmentStyles[matchedDepartment].title;
  const serviceAccent = departmentStyles[matchedDepartment].accent;
  const serviceChip = departmentStyles[matchedDepartment].chip;
  const servicePanel = departmentStyles[matchedDepartment].panel;

  return (
    <motion.section key={`dept-${matchedDepartment}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 shadow-glow backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${departmentInformation.accent} shadow-[0_0_35px_rgba(45,212,191,0.15)]`}>
              <IconForDepartment className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{departmentInformation.label}</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">{serviceLabel}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">Live Operations</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">{activeCount} active</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Active Cases', value: activeCount, icon: ClipboardList, meta: 'Live queue' },
          { label: 'In Progress', value: progressCount, icon: Activity, meta: 'Assigned staff' },
          { label: 'Resolved', value: resolvedCount, icon: ShieldCheck, meta: 'Closed today' },
          { label: 'AI Routed', value: aiRoutedCount, icon: Cpu, meta: 'Auto intake' },
        ].map((item) => (
          <div key={item.label} className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4 shadow-glow backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${departmentInformation.accent} p-2`}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">{item.meta}</span>
            </div>
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        {departmentMenus.map((menu) => {
          const menuComplaints = departmentComplaints.filter((item) => item.status === menu.status);
          return (
            <details key={menu.key} className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70 shadow-glow">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full ${servicePanel} text-white`}>
                    <IconForDepartment className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-lg font-semibold">{menu.title}</div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{menu.description}</div>
                  </div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${serviceChip}`}>{menuComplaints.length}</span>
              </summary>

              <div className="grid gap-4 border-t border-white/8 p-4 md:grid-cols-2 xl:grid-cols-3">
                {menuComplaints.length === 0 && (
                  <div className="col-span-full rounded-[20px] border border-dashed border-white/20 bg-slate-900/50 p-4 text-sm text-slate-500">
                    No complaints in this queue.
                  </div>
                )}

                {menuComplaints.map((item) => (
                  <article key={item.id} className="rounded-[22px] border border-white/10 bg-slate-900/90 p-4 shadow-soft transition hover:border-cyan-300/30 hover:bg-slate-900">
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.citizen}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.language || 'Citizen case'}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">{formatTime(item.updatedAt)}</p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${departmentStyles[item.department].chip}`}>{item.status}</span>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-slate-800/50 px-3 py-3">
                      <p className="text-sm leading-6 text-slate-300">{item.text}</p>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Update status</label>
                      <select value={item.status} onChange={(event) => updateComplaintStatus(item.id, event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-700/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/40">
                        <option value="AI Routed">AI Routed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <button onClick={() => setSelectedComplaint(item)} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20">View Profile</button>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock3 className="h-3.5 w-3.5" />
                        {item.updatedAt}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          );
        })}
      </section>
    </motion.section>
  );
};

function App() {
  const location = useLocation();
  const [language, setLanguage] = useState('English');
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintText, setComplaintText] = useState('');
  const [predictedDepartment, setPredictedDepartment] = useState('Pending AI routing');
  const [latestSubmission, setLatestSubmission] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const response = await fetch('/api/complaints');
        const data = await response.json();
        setComplaints(data);
      } catch (error) {
        setComplaints([]);
      }
    };

    loadComplaints();
  }, []);

  const stats = useMemo(() => {
    const resolved = complaints.filter((item) => item.status === 'Resolved').length;
    const aiRouted = complaints.filter((item) => item.status === 'AI Routed').length;
    const completionRate = complaints.length ? Math.round((resolved / complaints.length) * 100) : 0;

    return {
      total: complaints.length,
      resolved,
      aiRouted,
      accuracy: `${completionRate}%`,
    };
  }, [complaints]);

  const updateComplaintStatus = async (id, next) => {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const updated = await response.json();
      setComplaints((prev) => prev.map((item) => item.id === id ? updated : item));
    } catch (error) {
      setComplaints((prev) => prev.map((item) => item.id === id ? { ...item, status: next, updatedAt: new Date().toISOString() } : item));
    }
  };

  const handleSubmitComplaint = async () => {
    if (!complaintText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: complaintText }),
      });
      const data = await response.json();
      const department = data.department || 'Electricity';
      const confidenceText = `${department} • ${(data.confidence * 100).toFixed(1)}% confidence`;
      setPredictedDepartment(confidenceText);

      const responseBody = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizen: 'Anonymous Citizen',
          citizenEmail: 'citizen@example.com',
          language,
          text: complaintText,
          department,
          status: 'AI Routed',
        }),
      });
      const newComplaint = await responseBody.json();

      setLatestSubmission({ ...newComplaint, predictedDepartment: department, confidence: data.confidence });
      setComplaints((prev) => [newComplaint, ...prev]);
      setComplaintText('');
    } catch (error) {
      setPredictedDepartment('Routing unavailable, fallback used');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_0_120px_rgba(15,23,42,0.9)] backdrop-blur-2xl sm:p-6 lg:p-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[24px] border border-white/10 bg-slate-950/70 p-4 shadow-glow backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:p-6">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 p-3 shadow-[0_0_25px_rgba(59,130,246,0.45)]">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Smart Complaint Management System</p>
                <h1 className="text-2xl font-semibold text-white sm:text-3xl">AI-Driven Civic Issue Routing</h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">A futuristic complaint portal blending citizen support, admin oversight, and department automation into one elegant experience.</p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/user" replace />} />
            
            <Route path="/user" element={
              <motion.section key="citizen" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-glow backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Citizen Dashboard</p>
                    <h2 className="text-xl font-semibold">Submit a new complaint</h2>
                  </div>
                  <div className="flex rounded-full border border-white/10 bg-white/10 p-1">
                    {['Urdu', 'English', 'Roman English'].map((item) => (
                      <button key={item} onClick={() => setLanguage(item)} className={`rounded-full px-3 py-1.5 text-sm transition ${language === item ? 'bg-white/20 text-white' : 'text-slate-400'}`}>{item}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-4 rounded-[22px] border border-cyan-400/20 bg-cyan-500/10 p-4">
                  <label className="mb-2 block text-sm font-medium text-cyan-100">Describe your issue</label>
                  <textarea
                    rows="8"
                    value={complaintText}
                    onChange={(event) => setComplaintText(event.target.value)}
                    className="w-full rounded-[20px] border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200 outline-none focus:border-cyan-400/40"
                    placeholder="Write your complaint in Urdu, English, or Roman English..."
                  />
                </div>
                <div className="mb-6 flex flex-wrap gap-3">
                  {Object.entries(departmentStyles).map(([dept, style]) => (
                    <button key={dept} className={`rounded-full border px-4 py-2 text-sm shadow-soft ${style.chip}`}>
                      {dept}
                    </button>
                  ))}
                </div>
                <div className="mb-4 rounded-[20px] border border-cyan-400/20 bg-slate-900/60 px-4 py-3 text-sm text-cyan-100">
                  <div className="mb-2 flex items-center justify-between">
                    <span>Predicted route</span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${departmentStyles[latestSubmission?.department || predictedDepartment.split(' •')[0]]?.chip || 'bg-cyan-500/10 text-cyan-100 border-cyan-400/20'}`}>
                      {latestSubmission?.department || predictedDepartment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">The complaint will be routed to this department as soon as it is submitted.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitComplaint}
                  disabled={isSubmitting}
                  className="rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(59,130,246,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Routing complaint...' : 'Submit Complaint'}
                </motion.button>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-glow backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Tracking Flow</p>
                    <h2 className="text-xl font-semibold">Live status tracker</h2>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">AI Routed</div>
                </div>
                <div className="flex flex-col gap-4">
                  {['Submitted', 'AI Routed', 'In Progress', 'Resolved'].map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 p-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${index <= 1 ? 'bg-cyan-500/20 text-cyan-200' : 'bg-slate-800 text-slate-300'}`}>
                        {index === 0 ? <ClipboardList className="h-5 w-5" /> : index === 1 ? <Cpu className="h-5 w-5" /> : index === 2 ? <Briefcase className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{step}</p>
                        <p className="text-sm text-slate-400">{index === 0 ? 'Complaint received' : index === 1 ? 'Department assigned by AI' : index === 2 ? 'Official is handling it' : 'Issue resolved successfully'}</p>
                      </div>
                      {index < 3 && <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
            } />

            <Route path="/admin" element={
              <motion.section key="admin" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: 'Total Complaints', value: stats.total, icon: ClipboardList, glow: 'from-cyan-400 to-blue-500' },
                  { label: 'AI Routed', value: stats.aiRouted, icon: Cpu, glow: 'from-amber-400 to-orange-500' },
                  { label: 'Resolved', value: stats.resolved, icon: ShieldCheck, glow: 'from-teal-400 to-cyan-500' },
                ].map((card) => (
                  <div key={card.label} className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4 shadow-glow backdrop-blur-xl">
                    <div className={`mb-3 inline-flex rounded-2xl bg-gradient-to-br ${card.glow} p-3 shadow-[0_0_25px_rgba(59,130,246,0.25)]`}>
                      <card.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm text-slate-400">{card.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-glow backdrop-blur-xl">
                {latestSubmission && (
                  <div className="mb-4 rounded-[20px] border border-cyan-400/20 bg-cyan-500/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Latest Routed Complaint</p>
                        <p className="mt-1 text-sm text-white">{latestSubmission.text}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${departmentStyles[latestSubmission.department]?.chip || 'bg-cyan-500/10 text-cyan-100 border-cyan-400/20'}`}>
                        {latestSubmission.department}
                      </span>
                    </div>
                  </div>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Operations Console</p>
                    <h2 className="text-xl font-semibold">All department complaints</h2>
                  </div>
                  <button className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-200">Export</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="px-3 py-3">Citizen</th>
                        <th className="px-3 py-3">Department</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((item) => (
                        <tr key={item.id} className="border-b border-white/5 text-slate-200 hover:bg-white/5">
                          <td className="px-3 py-3"><button onClick={() => setSelectedComplaint(item)} className="font-medium text-cyan-200 hover:text-cyan-100">{item.citizen}</button></td>
                          <td className="px-3 py-3">{item.department}</td>
                          <td className="px-3 py-3"><span className={`rounded-full border px-2.5 py-1 text-xs ${departmentStyles[item.department].chip}`}>{item.status}</span></td>
                          <td className="px-3 py-3">{formatTime(item.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.section>
            } />

            <Route path="/:departmentName" element={
              <DepartmentView complaints={complaints} updateComplaintStatus={updateComplaintStatus} setSelectedComplaint={setSelectedComplaint} />
            } />
          </Routes>
        </AnimatePresence>

        <AnimatePresence>
          {selectedComplaint && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xl">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-slate-900/95 p-6 shadow-[0_0_80px_rgba(15,23,42,0.9)]">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Complaint Profile</p>
                    <h3 className="text-2xl font-semibold text-white">{selectedComplaint.citizen}</h3>
                  </div>
                  <button onClick={() => setSelectedComplaint(null)} className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-200">Close</button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="mt-1 font-medium text-white">{selectedComplaint.citizenEmail}</p>
                    <p className="mt-4 text-sm text-slate-400">Complaint</p>
                    <p className="mt-1 text-sm text-slate-200">{selectedComplaint.text}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Department</p>
                    <p className="mt-1 font-medium text-white">{selectedComplaint.department}</p>
                    <p className="mt-4 text-sm text-slate-400">History</p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-200">
                      {selectedComplaint.history.map((entry, index) => (
                        <li key={index} className="rounded-lg border border-white/5 bg-slate-800/60 px-3 py-2">{entry.note} • {entry.actor} • {formatTime(entry.time)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
