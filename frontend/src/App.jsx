import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, Briefcase, ClipboardList, Cpu, Droplets, Flame, ShieldCheck, Sparkles, SunMoon, UserRound, Waves } from 'lucide-react';

const departmentStyles = {
  Electricity: {
    accent: 'from-cyan-400 to-blue-500',
    glow: 'shadow-[0_0_35px_rgba(59,130,246,0.45)]',
    chip: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
  },
  Gas: {
    accent: 'from-amber-400 to-orange-500',
    glow: 'shadow-[0_0_35px_rgba(249,115,22,0.4)]',
    chip: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
  },
  Water: {
    accent: 'from-teal-300 to-cyan-500',
    glow: 'shadow-[0_0_35px_rgba(45,212,191,0.4)]',
    chip: 'bg-teal-500/20 text-teal-200 border-teal-400/30',
  },
};

const initialComplaints = [
  {
    id: 1,
    citizen: 'Ayesha Khan',
    language: 'Urdu',
    text: 'بجلی کا کرنٹ بہت کم ہے اور لائٹس بار بار بجتی رہتی ہیں۔',
    department: 'Electricity',
    status: 'AI Routed',
    updatedAt: '2h ago',
    history: [{ note: 'Submitted', actor: 'Citizen', time: 'Today 09:10' }],
  },
  {
    id: 2,
    citizen: 'Bilal Ahmed',
    language: 'English',
    text: 'Gas smell near the kitchen pipeline. Please inspect immediately.',
    department: 'Gas',
    status: 'In Progress',
    updatedAt: '1h ago',
    history: [{ note: 'Assigned to Gas Team', actor: 'Admin', time: 'Today 10:00' }],
  },
  {
    id: 3,
    citizen: 'Sara Imran',
    language: 'Roman English',
    text: 'Water pressure is very low in my area, please fix it soon.',
    department: 'Water',
    status: 'Resolved',
    updatedAt: '30m ago',
    history: [{ note: 'Resolved', actor: 'Water Dept', time: 'Today 11:20' }],
  },
];

function App() {
  const [activePanel, setActivePanel] = useState('citizen');
  const [language, setLanguage] = useState('English');
  const [complaints, setComplaints] = useState(initialComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const stats = useMemo(() => ({
    total: complaints.length,
    accuracy: '94.8%',
  }), [complaints.length]);

  const updateComplaintStatus = (id, next) => {
    setComplaints((prev) => prev.map((item) => item.id === id ? { ...item, status: next, updatedAt: 'just now' } : item));
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
          <div className="flex flex-wrap gap-3">
            {['citizen', 'admin'].map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${activePanel === panel ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25)]' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                {panel === 'citizen' ? 'Citizen Portal' : 'Admin Panel'}
              </button>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activePanel === 'citizen' && (
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
                  <textarea rows="8" className="w-full rounded-[20px] border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200 outline-none ring-0 focus:border-cyan-400/40" placeholder="Write your complaint in Urdu, English, or Roman English..." />
                </div>
                <div className="mb-6 flex flex-wrap gap-3">
                  {Object.entries(departmentStyles).map(([dept, style]) => (
                    <button key={dept} className={`rounded-full border px-4 py-2 text-sm shadow-soft ${style.chip}`}>
                      {dept}
                    </button>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(59,130,246,0.45)]">
                  Submit Complaint
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
          )}

          {activePanel === 'admin' && (
            <motion.section key="admin" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: 'Total Complaints', value: stats.total, icon: ClipboardList, glow: 'from-cyan-400 to-blue-500' },
                  { label: 'AI Accuracy', value: stats.accuracy, icon: Cpu, glow: 'from-amber-400 to-orange-500' },
                  { label: 'Resolved Today', value: '18', icon: ShieldCheck, glow: 'from-teal-400 to-cyan-500' },
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
                          <td className="px-3 py-3">
                            <button onClick={() => setSelectedComplaint(item)} className="font-medium text-cyan-200 hover:text-cyan-100">{item.citizen}</button>
                          </td>
                          <td className="px-3 py-3">{item.department}</td>
                          <td className="px-3 py-3"><span className={`rounded-full border px-2.5 py-1 text-xs ${departmentStyles[item.department].chip}`}>{item.status}</span></td>
                          <td className="px-3 py-3">{item.updatedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

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
                          <p className="mt-1 font-medium text-white">citizen@example.com</p>
                          <p className="mt-4 text-sm text-slate-400">Complaint</p>
                          <p className="mt-1 text-sm text-slate-200">{selectedComplaint.text}</p>
                        </div>
                        <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-slate-400">Department</p>
                          <p className="mt-1 font-medium text-white">{selectedComplaint.department}</p>
                          <p className="mt-4 text-sm text-slate-400">History</p>
                          <ul className="mt-2 space-y-2 text-sm text-slate-200">
                            {selectedComplaint.history.map((entry, index) => (
                              <li key={index} className="rounded-lg border border-white/5 bg-slate-800/60 px-3 py-2">{entry.note} • {entry.actor} • {entry.time}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
