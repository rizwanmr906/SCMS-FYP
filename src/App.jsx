import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  CloudLightning,
  Eye,
  EyeOff,
  Flame,
  Gauge,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic,
  MonitorCog,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  UserCircle2,
  UserRound,
  Waves,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

const apiBase = '/api';
const statusColorMap = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};
const departmentMeta = {
  1: { name: 'Electricity', accent: 'emerald', icon: CloudLightning },
  2: { name: 'Gas', accent: 'yellow', icon: Flame },
  3: { name: 'Water', accent: 'cyan', icon: Waves },
};

const t = {
  en: {
    appName: 'Civic Response Hub',
    user: 'User',
    admin: 'Admin',
    department: 'Department',
    login: 'Login',
    signup: 'Sign Up',
    welcomeBack: 'Welcome back',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    city: 'City',
    phone: 'Phone Number',
    streetAddress: 'Street Address',
    submitComplaint: 'Submit Complaint',
    myProfile: 'My Profile',
    dashboard: 'Dashboard',
    adminDashboard: 'Admin Dashboard',
    complaintHistory: 'Complaint History',
    logout: 'Logout',
    noComplaints: 'No complaints yet',
    language: 'Language',
    urdu: 'اردو',
    english: 'English',
    romanUrdu: 'Roman Urdu',
    profileUpdated: 'Profile updated successfully',
    complaintSubmitted: 'Complaint submitted successfully',
    loginSuccess: 'Login successful',
    smartService: 'Smart Service',
    complaintTracking: 'Civic complaint tracking',
    serviceName: 'SMART COMPLAINT SERVICE',
    serviceTagline: 'AI-Powered Utility Complaint Management',
    languageSupport: 'English, Urdu & Roman Urdu Support',
    textVoiceSubmission: 'Text & Voice Complaint Submission',
    aiClassification: 'AI-Based Complaint Classification',
    automaticRouting: 'Automatic Department Routing',
    statusTracking: 'Complaint Status Tracking',
    utilityServices: 'Water, Gas & Electricity Services',
    secureAccess: 'Secure multi-role access',
    personalizedOwnership: 'Personalized complaint ownership',
    departmentEscalation: 'Department-aware escalation',
    bilingualInterface: 'Urdu and English interface',
    total: 'Total',
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    users: 'Users',
    operations: 'Operations',
    allComplaints: 'All complaints',
    status: 'Status',
    updated: 'Updated',
    userLabel: 'User',
    profile: 'Profile',
    complaintStatusUpdated: 'Complaint status updated',
    electricity: 'Electricity',
    gas: 'Gas',
    water: 'Water',
    queue: 'Queue',
    complainantProfile: 'Complainant profile',
    close: 'Close',
    address: 'Address',
    viewComplainantProfile: 'View complainant profile',
    noDepartmentComplaints: 'No department complaints currently assigned.',
    submittedBy: 'Submitted by',
    departmentStatusUpdated: 'Department status updated',
    voiceNote: 'Voice note',
    startRecording: 'Record voice note',
    stopRecording: 'Stop recording',
    recording: 'Recording...',
    removeVoiceNote: 'Remove voice note',
    deleteComplaint: 'Delete complaint',
    confirmDeleteComplaint: 'Delete this complaint permanently?',
    complaintDeleted: 'Complaint deleted successfully',
  },
  ur: {
    appName: 'سویل رسپانس ہب',
    user: 'صارف',
    admin: 'ایڈمن',
    department: 'محکمہ',
    login: 'لاگ ان',
    signup: 'سائن اپ',
    welcomeBack: 'خوش آمدید',
    email: 'ای میل',
    password: 'پاس ورڈ',
    confirmPassword: 'پاس ورڈ دوبارہ',
    name: 'پورا نام',
    city: 'شہر',
    phone: 'فون نمبر',
    streetAddress: 'گلی/پتہ',
    submitComplaint: 'شکایت جمع کروائیں',
    myProfile: 'میرا پروفائل',
    dashboard: 'ڈیش بورڈ',
    adminDashboard: 'ایڈمن ڈیش بورڈ',
    complaintHistory: 'شکایت کی تاریخ',
    logout: 'لاگ آؤٹ',
    noComplaints: 'ابھی تک کوئی شکایت نہیں',
    language: 'زبان',
    urdu: 'اردو',
    english: 'English',
    profileUpdated: 'پروفائل کامیابی سے اپ ڈیٹ ہوا',
    complaintSubmitted: 'شکایت کامیابی سے جمع ہوئی',
    loginSuccess: 'لاگ ان کامیاب رہا',
    smartService: 'سمارٹ سروس',
    complaintTracking: 'شہری شکایات کی نگرانی',
    serviceName: 'سمارٹ شکایات سروس',
    serviceTagline: 'مصنوعی ذہانت پر مبنی یوٹیلیٹی شکایات کا انتظام',
    languageSupport: 'انگریزی، اردو اور رومن اردو کی سہولت',
    textVoiceSubmission: 'تحریری اور صوتی شکایت جمع کرانے کی سہولت',
    aiClassification: 'مصنوعی ذہانت سے شکایات کی درجہ بندی',
    automaticRouting: 'محکمے کو خودکار شکایت بھیجنا',
    statusTracking: 'شکایت کی حیثیت کا سراغ',
    utilityServices: 'پانی، گیس اور بجلی کی خدمات',
    secureAccess: 'محفوظ کثیر سطحی رسائی',
    personalizedOwnership: 'شکایت کی ذاتی ملکیت',
    departmentEscalation: 'محکمے کے مطابق کارروائی',
    bilingualInterface: 'اردو اور انگریزی انٹرفیس',
    total: 'کل',
    pending: 'زیر التوا',
    inProgress: 'جاری ہے',
    resolved: 'حل شدہ',
    users: 'صارفین',
    operations: 'کارروائیاں',
    allComplaints: 'تمام شکایات',
    status: 'حیثیت',
    updated: 'اپ ڈیٹ شدہ',
    userLabel: 'صارف',
    profile: 'پروفائل',
    complaintStatusUpdated: 'شکایت کی حیثیت اپ ڈیٹ ہو گئی',
    electricity: 'بجلی',
    gas: 'گیس',
    water: 'پانی',
    queue: 'قطار',
    complainantProfile: 'شکایت کنندہ کا پروفائل',
    close: 'بند کریں',
    address: 'پتہ',
    viewComplainantProfile: 'شکایت کنندہ کا پروفائل دیکھیں',
    noDepartmentComplaints: 'اس وقت محکمہ کو کوئی شکایت تفویض نہیں ہے۔',
    submittedBy: 'جمع کرانے والا',
    departmentStatusUpdated: 'محکمے کی حیثیت اپ ڈیٹ ہو گئی',
    voiceNote: 'صوتی نوٹ',
    startRecording: 'صوتی نوٹ ریکارڈ کریں',
    stopRecording: 'ریکارڈنگ روکیں',
    recording: 'ریکارڈنگ جاری ہے...',
    removeVoiceNote: 'صوتی نوٹ ہٹائیں',
    deleteComplaint: 'شکایت حذف کریں',
    confirmDeleteComplaint: 'کیا یہ شکایت مستقل طور پر حذف کرنی ہے؟',
    complaintDeleted: 'شکایت کامیابی سے حذف ہو گئی',
  },
  ru: {
    appName: 'Civic Response Hub',
    user: 'User',
    admin: 'Admin',
    department: 'Mehkama',
    login: 'Login',
    signup: 'Sign Up',
    welcomeBack: 'Khush aamdeed',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Password dobara likhein',
    name: 'Poora naam',
    city: 'Shehar',
    phone: 'Phone number',
    streetAddress: 'Gali ka pata',
    submitComplaint: 'Shikayat jama karein',
    myProfile: 'Mera profile',
    dashboard: 'Dashboard',
    adminDashboard: 'Admin dashboard',
    complaintHistory: 'Shikayat ki tareekh',
    logout: 'Logout',
    noComplaints: 'Abhi koi shikayat nahi',
    language: 'Zaban',
    urdu: 'Urdu',
    english: 'English',
    romanUrdu: 'Roman Urdu',
    profileUpdated: 'Profile kamyabi se update ho gaya',
    complaintSubmitted: 'Shikayat kamyabi se jama ho gayi',
    loginSuccess: 'Login kamyab raha',
    smartService: 'Smart Service',
    complaintTracking: 'Shehri shikayaton ki nigrani',
    serviceName: 'SMART COMPLAINT SERVICE',
    serviceTagline: 'AI par mabni utility shikayaton ka intizam',
    languageSupport: 'English, Urdu aur Roman Urdu support',
    textVoiceSubmission: 'Text aur voice shikayat jama karna',
    aiClassification: 'AI se shikayat ki darja bandi',
    automaticRouting: 'Mehkame ko khudkar shikayat bhejna',
    statusTracking: 'Shikayat ki haisiyat ka track',
    utilityServices: 'Pani, gas aur bijli ki khidmaat',
    secureAccess: 'Mehfooz multi-role rasai',
    personalizedOwnership: 'Shikayat ki zaati milkiyat',
    departmentEscalation: 'Mehkame ke mutabiq karwai',
    bilingualInterface: 'Urdu aur English interface',
    total: 'Kul',
    pending: 'Zer-e-iltaawa',
    inProgress: 'Jari hai',
    resolved: 'Hal shuda',
    users: 'Users',
    operations: 'Karkardagiyan',
    allComplaints: 'Tamam shikayatein',
    status: 'Haisiyat',
    updated: 'Update shuda',
    userLabel: 'User',
    profile: 'Profile',
    complaintStatusUpdated: 'Shikayat ki haisiyat update ho gayi',
    electricity: 'Bijli',
    gas: 'Gas',
    water: 'Pani',
    queue: 'Qatar',
    complainantProfile: 'Shikayat kuninda ka profile',
    close: 'Band karein',
    address: 'Pata',
    viewComplainantProfile: 'Shikayat kuninda ka profile dekhein',
    noDepartmentComplaints: 'Is waqt mehkame ko koi shikayat tafweez nahi hai.',
    submittedBy: 'Jama karne wala',
    departmentStatusUpdated: 'Mehkame ki haisiyat update ho gayi',
    voiceNote: 'Voice note',
    startRecording: 'Voice note record karein',
    stopRecording: 'Recording rokein',
    recording: 'Recording ho rahi hai...',
    removeVoiceNote: 'Voice note hatayein',
    deleteComplaint: 'Shikayat delete karein',
    confirmDeleteComplaint: 'Kya yeh shikayat hamesha ke liye delete karni hai?',
    complaintDeleted: 'Shikayat kamyabi se delete ho gayi',
  },
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
};

const classNames = (...values) => values.filter(Boolean).join(' ');

const localizedDepartmentName = (name, ui) => ({
  Electricity: ui.electricity,
  Gas: ui.gas,
  Water: ui.water,
}[name] || name);

const localizedStatus = (status, ui) => ({
  Pending: ui.pending,
  'In Progress': ui.inProgress,
  Resolved: ui.resolved,
}[status] || status);

function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset, value) => value.split('').forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + index * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  });
  return new Blob([view], { type: 'audio/wav' });
}

function ComplaintDeleteButton({ complaintId, token, ui, onDeleted }) {
  const handleDelete = async () => {
    if (!window.confirm(ui.confirmDeleteComplaint)) return;
    try {
      await apiFetch(`/complaints/${complaintId}`, { method: 'DELETE' }, token);
      onDeleted();
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <button type="button" onClick={handleDelete} className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
      <Trash2 className="h-3.5 w-3.5" />
      {ui.deleteComplaint}
    </button>
  );
}

function apiFetch(path, options = {}, token) {
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(`${apiBase}${path}`, {
    ...options,
    headers,
  }).then(async (response) => {
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) {
      throw new Error(payload?.detail || payload?.message || 'Request failed');
    }
    return payload;
  });
}

function getRoleRoute(user) {
  if (!user) return '/login';
  if (user.role === 'admin') return '/admin';
  if (user.role === 'department') return `/department/${user.departmentId || 1}`;
  return '/dashboard';
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('scms-token') || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('scms-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [lang, setLang] = useState(localStorage.getItem('scms-lang') || 'en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ui = t[lang] || t.en;
  const isRtl = lang === 'ur';

  const pushToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  };

  useEffect(() => {
    localStorage.setItem('scms-lang', lang);
  }, [lang]);

  useEffect(() => {
    if (!token) {
      setLoadingAuth(false);
      return;
    }
    apiFetch('/auth/me', {}, token)
      .then((me) => {
        setUser(me);
        localStorage.setItem('scms-user', JSON.stringify(me));
      })
      .catch(() => {
        setToken('');
        setUser(null);
        localStorage.removeItem('scms-token');
        localStorage.removeItem('scms-user');
      })
      .finally(() => setLoadingAuth(false));
  }, [token]);

  useEffect(() => {
    if (!token && location.pathname !== '/login' && location.pathname !== '/signup') {
      navigate('/login', { replace: true });
    }
  }, [token, location.pathname, navigate]);

  const handleLogin = async ({ email, password }) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, token);
      const nextUser = data.user;
      setToken(data.token);
      setUser(nextUser);
      localStorage.setItem('scms-token', data.token);
      localStorage.setItem('scms-user', JSON.stringify(nextUser));
      pushToast(ui.loginSuccess, 'success');
      navigate(getRoleRoute(nextUser), { replace: true });
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  const handleSignup = async (payload) => {
    try {
      await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token);
      pushToast('Account created successfully. Please log in.', 'success');
      navigate('/login', { replace: true });
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' }, token);
    } catch (error) {
      console.warn(error);
    } finally {
      setToken('');
      setUser(null);
      localStorage.removeItem('scms-token');
      localStorage.removeItem('scms-user');
      navigate('/login', { replace: true });
      pushToast('Logged out successfully', 'success');
    }
  };

  const navItems = useMemo(() => {
    const items = [
      { to: '/dashboard', label: ui.dashboard, icon: LayoutDashboard, roles: ['user'] },
      { to: '/admin', label: ui.admin, icon: MonitorCog, roles: ['admin'] },
      { to: `/department/${user?.departmentId || 1}`, label: ui.department, icon: Building2, roles: ['department'] },
      { to: '/profile', label: ui.profile, icon: UserCircle2, roles: ['user', 'admin', 'department'] },
    ];
    return items.filter((item) => item.roles.includes(user?.role));
  }, [user, ui]);

  if (loadingAuth) {
    return <LoadingScreen />;
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={classNames('min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 text-slate-800', isRtl && 'font-[')}>
      <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:p-7">
        <div className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white/80 shadow-[0_28px_80px_rgba(16,185,129,0.12)] backdrop-blur-xl">
          <ToastStack toasts={toasts} />
          {!user ? (
            <Routes>
              <Route path="/login" element={<AuthPage mode="login" onLogin={handleLogin} ui={ui} toggleLang={setLang} lang={lang} />} />
              <Route path="/signup" element={<AuthPage mode="signup" onSignup={handleSignup} ui={ui} toggleLang={setLang} lang={lang} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
              className="flex min-h-screen flex-col lg:flex-row"
            >
              <motion.aside
                variants={{ hidden: { opacity: 0, x: -18 }, visible: { opacity: 1, x: 0, transition: { duration: 0.45 } } }}
                className={classNames('border-b border-emerald-100 bg-white/90 p-4 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r', mobileMenuOpen ? 'block' : 'hidden lg:block')}
              >
                <div className="flex items-center justify-between gap-3 border-b border-emerald-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="app-logo flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-200">
                      <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">SCMS</p>
                      <h1 className="text-lg font-bold text-slate-800">{ui.appName}</h1>
                    </div>
                  </div>
                  <button className="rounded-xl border border-emerald-100 p-2 text-slate-600 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="mt-6 space-y-2">
                  {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => classNames(
                        'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all',
                        isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </NavLink>
                  ))}

                  <button onClick={handleLogout} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100">
                    <LogOut className="h-4 w-4" />
                    {ui.logout}
                  </button>
                </nav>

                <div className="mt-8 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">{user.role}</p>
                      <p className="font-semibold text-slate-800">{user.name}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>{ui.email}</span>
                      <span className="font-medium text-slate-700">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{ui.city}</span>
                      <span className="font-medium text-slate-700">{user.city}</span>
                    </div>
                  </div>
                </div>
              </motion.aside>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }} className="flex-1">
                <header className="border-b border-emerald-100 bg-white/80 px-4 py-3 shadow-sm sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <button className="rounded-xl border border-emerald-200 p-2 text-emerald-700 lg:hidden" onClick={() => setMobileMenuOpen((prev) => !prev)}>
                      <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-[0_16px_28px_rgba(16,185,129,0.25)]">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-600">{ui.appName}</p>
                        <h2 className="text-lg font-bold text-slate-800">{user.role === 'admin' ? ui.adminDashboard : user.role === 'department' ? `${ui.department} ${ui.operations}` : ui.dashboard}</h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                        {lang === 'ur' ? ui.urdu : lang === 'ru' ? ui.romanUrdu : ui.english}
                      </div>
                      <select
                        value={lang}
                        onChange={(event) => setLang(event.target.value)}
                        className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none"
                      >
                        <option value="en">English</option>
                        <option value="ur">اردو</option>
                        <option value="ru">Roman Urdu</option>
                      </select>
                    </div>
                  </div>
                </header>

                <main className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-emerald-50/40 via-white to-green-50/40 p-4 sm:p-6">
                  <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                      <Route path="/dashboard" element={<UserDashboard token={token} user={user} ui={ui} pushToast={pushToast} />} />
                      <Route path="/admin" element={<AdminDashboard token={token} ui={ui} pushToast={pushToast} />} />
                      <Route path="/department/:departmentId" element={<DepartmentDashboard token={token} user={user} ui={ui} pushToast={pushToast} />} />
                      <Route path="/profile" element={<ProfilePage token={token} user={user} ui={ui} pushToast={pushToast} />} />
                      <Route path="*" element={<Navigate to={getRoleRoute(user)} replace />} />
                    </Routes>
                  </AnimatePresence>
                </main>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthPage({ mode, onLogin, onSignup, ui, toggleLang, lang }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    phone: '',
    streetAddress: '',
  });

  const isLogin = mode === 'login';

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      email: form.email.trim(),
    };
    if (isLogin) {
      onLogin({ email: payload.email, password: payload.password });
    } else {
      onSignup(payload);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-500 p-8 text-white">
        <div className="max-w-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-100">SCMS</p>
              <h1 className="text-3xl font-bold">{ui.serviceName}</h1>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-2">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-100">SCMS</p>
                <p className="text-xl font-semibold">{ui.serviceTagline}</p>
              </div>
            </div>
            <ul className="space-y-3 text-emerald-50/90">
              {[ui.languageSupport, ui.textVoiceSubmission, ui.aiClassification, ui.automaticRouting, ui.statusTracking, ui.utilityServices].map((feature) => (
                <li key={feature} className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 shrink-0" /> {feature}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-lg rounded-[32px] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 p-6 shadow-[0_30px_80px_rgba(16,185,129,0.08)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">{isLogin ? ui.login : ui.signup}</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">{isLogin ? ui.welcomeBack : 'Create an account'}</h2>
            </div>
            <select value={lang} onChange={(event) => toggleLang(event.target.value)} className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none">
              <option value="en">English</option>
              <option value="ur">اردو</option>
              <option value="ru">Roman Urdu</option>
            </select>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <InputField label={ui.name} value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
            )}
            <InputField label={ui.email} type="email" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} />
            <InputField label={ui.password} type="password" value={form.password} onChange={(value) => setForm((prev) => ({ ...prev, password: value }))} />
            {!isLogin && (
              <>
                <InputField label={ui.confirmPassword} type="password" value={form.confirmPassword} onChange={(value) => setForm((prev) => ({ ...prev, confirmPassword: value }))} />
                <InputField label={ui.city} value={form.city} onChange={(value) => setForm((prev) => ({ ...prev, city: value }))} />
                <InputField label={ui.phone} value={form.phone} onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))} />
                <InputField label={ui.streetAddress} value={form.streetAddress} onChange={(value) => setForm((prev) => ({ ...prev, streetAddress: value }))} />
              </>
            )}

            <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(16,185,129,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(16,185,129,0.32)]">
              {isLogin ? ui.login : ui.signup}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {isLogin ? 'New to the platform?' : 'Already have an account?'}{' '}
            <button onClick={() => navigate(isLogin ? '/signup' : '/login')} className="font-semibold text-emerald-600 hover:text-emerald-700">
              {isLogin ? ui.signup : ui.login}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, disabled = false }) {
  const isPasswordField = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-2 block">{label}</span>
      <div className="relative">
        <input
          type={isPasswordField && showPassword ? 'text' : type}
          value={value}
          disabled={disabled}
          placeholder={label}
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 pr-11 text-slate-800 outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-emerald-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </label>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="flex items-center gap-3 rounded-full border border-emerald-100 bg-white px-5 py-3 shadow-sm">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        <span className="text-sm font-medium text-slate-700">Loading dashboard...</span>
      </div>
    </div>
  );
}

function UserDashboard({ token, user, ui, pushToast }) {
  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState({ totalComplaints: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceNote, setVoiceNote] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const audioProcessorRef = useRef(null);
  const audioGainRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const loadDashboard = () => {
    Promise.all([
      apiFetch('/dashboard/summary', {}, token),
      apiFetch('/complaints', {}, token),
    ])
      .then(([summaryData, list]) => {
        setSummary(summaryData);
        setComplaints(list);
      })
      .catch((error) => pushToast(error.message, 'error'));
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !(window.AudioContext || window.webkitAudioContext)) {
      const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      pushToast(
        isLocalhost
          ? 'Live recording is unavailable in this browser. Try Chrome or Edge and allow microphone access.'
          : 'Live recording requires a secure connection. Open the app at http://localhost:3000.',
        'error'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      await audioContext.resume();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const gain = audioContext.createGain();
      gain.gain.value = 0;
      audioChunksRef.current = [];
      processor.onaudioprocess = (event) => {
        audioChunksRef.current.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      };
      source.connect(processor);
      processor.connect(gain);
      gain.connect(audioContext.destination);
      audioContextRef.current = audioContext;
      audioSourceRef.current = source;
      audioProcessorRef.current = processor;
      audioGainRef.current = gain;
      audioStreamRef.current = stream;
      setIsRecording(true);
    } catch (error) {
      pushToast(error.name === 'NotAllowedError' ? 'Microphone access was denied' : 'The microphone could not be started', 'error');
    }
  };

  const stopRecording = () => {
    if (!audioContextRef.current) return;
    audioProcessorRef.current?.disconnect();
    audioSourceRef.current?.disconnect();
    audioGainRef.current?.disconnect();
    audioStreamRef.current?.getTracks().forEach((track) => track.stop());
    const samples = audioChunksRef.current.length
      ? Float32Array.from(audioChunksRef.current.flatMap((chunk) => Array.from(chunk)))
      : new Float32Array();
    const audioContext = audioContextRef.current;
    const sampleRate = audioContext.sampleRate;
    audioContext.close();
    audioContextRef.current = null;
    audioSourceRef.current = null;
    audioProcessorRef.current = null;
    audioGainRef.current = null;
    audioStreamRef.current = null;
    setIsRecording(false);
    if (!samples.length) {
      pushToast('No audio was captured. Check that your microphone is enabled.', 'error');
      return;
    }
    const blob = encodeWav(samples, sampleRate);
    const reader = new FileReader();
    reader.onloadend = () => setVoiceNote({ data: reader.result.split(',')[1], mimeType: blob.type });
    reader.readAsDataURL(blob);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!description.trim()) {
      pushToast('Complaint description is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiFetch('/complaints', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          language: 'English',
          voiceNoteData: voiceNote?.data || null,
          voiceNoteMimeType: voiceNote?.mimeType || null,
        }),
      }, token);
      setTitle('');
      setDescription('');
      setVoiceNote(null);
      loadDashboard();
      pushToast(ui.complaintSubmitted, 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total', value: summary.totalComplaints, icon: ClipboardList },
          { label: 'Pending', value: summary.pending, icon: AlertCircle },
          { label: 'In Progress', value: summary.inProgress, icon: Gauge },
          { label: 'Resolved', value: summary.resolved, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-[26px] border border-emerald-100 bg-white p-4 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-[0_16px_32px_rgba(16,185,129,0.22)]">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">{ui.submitComplaint}</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">Submit a complaint</h3>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">Authenticated</div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Complaint title"
              className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="6"
              placeholder="Describe the issue in detail..."
              className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400"
            />
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-700">{ui.voiceNote}</span>
                {!isRecording ? (
                  <button type="button" onClick={startRecording} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700">
                    <Mic className="h-4 w-4" /> {ui.startRecording}
                  </button>
                ) : (
                  <button type="button" onClick={stopRecording} className="flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700">
                    <Square className="h-3.5 w-3.5" /> {ui.stopRecording}
                  </button>
                )}
                {isRecording && <span className="text-xs text-rose-600">{ui.recording}</span>}
              </div>
              {voiceNote && !isRecording && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <AudioPreview src={`data:${voiceNote.mimeType};base64,${voiceNote.data}`} />
                  <button type="button" onClick={() => setVoiceNote(null)} className="text-xs font-medium text-rose-600 hover:text-rose-700">{ui.removeVoiceNote}</button>
                </div>
              )}
            </div>
            <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(16,185,129,0.24)] transition hover:-translate-y-0.5 disabled:opacity-70">
              {isSubmitting ? 'Submitting...' : ui.submitComplaint}
            </button>
          </form>
        </div>

        <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Profile</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">{user.name}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><UserCircle2 className="h-5 w-5" /></div>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <InfoRow label={ui.email} value={user.email} />
            <InfoRow label={ui.city} value={user.city} />
            <InfoRow label={ui.phone} value={user.phone} />
            <InfoRow label={ui.streetAddress} value={user.streetAddress} />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">{ui.complaintHistory}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Recent complaints</h3>
          </div>
        </div>
        {complaints.length === 0 ? (
          <EmptyState message={ui.noComplaints} />
        ) : (
          <div className="space-y-3">
            {complaints.slice(0, 6).map((complaint) => (
              <div key={complaint.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/25 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{complaint.title || 'Complaint'}</p>
                      <span className={classNames('rounded-full border px-2.5 py-1 text-[10px] font-semibold', statusColorMap[complaint.status] || 'bg-slate-100 text-slate-700 border-slate-200')}>
                        {localizedStatus(complaint.status, ui)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{complaint.description}</p>
                    {complaint.voiceNoteUrl && <VoiceNotePlayer url={complaint.voiceNoteUrl} token={token} label={ui.voiceNote} />}
                  </div>
                  <div className="text-xs text-slate-500">
                    <p>{departmentMeta[complaint.departmentId]?.name || 'Department'}</p>
                    <p>{formatDate(complaint.createdAt)}</p>
                    <div className="mt-3">
                      <ComplaintDeleteButton complaintId={complaint.id} token={token} ui={ui} onDeleted={() => { loadDashboard(); pushToast(ui.complaintDeleted, 'success'); }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}

function AudioPreview({ src, className = 'h-9 max-w-full' }) {
  const audioRef = useRef(null);

  const loadDuration = () => {
    const audio = audioRef.current;
    if (audio && (audio.duration === Infinity || audio.duration === 0)) {
      audio.currentTime = 1e101;
      audio.ontimeupdate = () => {
        audio.ontimeupdate = null;
        audio.currentTime = 0;
      };
    }
  };

  return <audio ref={audioRef} controls preload="metadata" src={src} onLoadedMetadata={loadDuration} onDurationChange={loadDuration} className={className} />;
}

function VoiceNotePlayer({ url, token, label }) {
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(() => {
    let objectUrl = '';
    fetch(`${apiBase}${url}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (!response.ok) throw new Error('Voice note unavailable');
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setAudioUrl(objectUrl);
      })
      .catch(() => setAudioUrl(''));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, token]);

  if (!audioUrl) return null;
  return (
    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
      <span>{label}</span>
      <AudioPreview src={audioUrl} className="h-8 max-w-full" />
    </div>
  );
}

function AdminDashboard({ token, ui, pushToast }) {
  const [summary, setSummary] = useState({ totalComplaints: 0, pending: 0, inProgress: 0, resolved: 0, users: 0, departmentBreakdown: {} });
  const [complaints, setComplaints] = useState([]);

  const loadData = () => {
    Promise.all([
      apiFetch('/dashboard/summary', {}, token),
      apiFetch('/complaints', {}, token),
    ])
      .then(([summaryData, list]) => {
        setSummary(summaryData);
        setComplaints(list);
      })
      .catch((error) => pushToast(error.message, 'error'));
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/complaints/${id}`, { method: 'PUT', body: JSON.stringify({ status, note: `Status updated to ${status}` }) }, token);
      loadData();
      pushToast(ui.complaintStatusUpdated, 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="grid gap-4 md:grid-cols-5">
        {[
          { label: ui.total, value: summary.totalComplaints },
          { label: ui.pending, value: summary.pending },
          { label: ui.inProgress, value: summary.inProgress },
          { label: ui.resolved, value: summary.resolved },
          { label: ui.users, value: summary.users },
        ].map((item) => (
          <div key={item.label} className="rounded-[24px] border border-emerald-100 bg-white p-4 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {Object.entries(summary.departmentBreakdown || {}).map(([name, count]) => (
          <div key={name} className="rounded-[24px] border border-emerald-100 bg-white p-4 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
            <p className="text-sm text-slate-500">{localizedDepartmentName(name, ui)}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{count}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">{ui.operations}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{ui.allComplaints}</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-emerald-100">
              <tr className="text-slate-500">
                <th className="px-3 py-3 font-medium">{ui.userLabel}</th>
                <th className="px-3 py-3 font-medium">{ui.department}</th>
                <th className="px-3 py-3 font-medium">{ui.status}</th>
                <th className="px-3 py-3 font-medium">{ui.updated}</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="border-b border-emerald-50 text-slate-700">
                  <td className="px-3 py-3 font-medium">{complaint.userName}</td>
                  <td className="px-3 py-3">{localizedDepartmentName(departmentMeta[complaint.departmentId]?.name || complaint.department, ui)}</td>
                  <td className="px-3 py-3">
                    <select value={complaint.status} onChange={(event) => updateStatus(complaint.id, event.target.value)} className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-medium outline-none">
                      <option value="Pending">{ui.pending}</option>
                      <option value="In Progress">{ui.inProgress}</option>
                      <option value="Resolved">{ui.resolved}</option>
                    </select>
                  </td>
                  <td className="px-3 py-3">{formatDate(complaint.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}

function DepartmentDashboard({ token, user, ui, pushToast }) {
  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState({ totalComplaints: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [selectedUser, setSelectedUser] = useState(null);

  const loadData = () => {
    apiFetch(`/departments/${user.departmentId}/complaints`, {}, token)
      .then((list) => {
        setComplaints(list);
        setSummary({
          totalComplaints: list.length,
          pending: list.filter((c) => c.status === 'Pending').length,
          inProgress: list.filter((c) => c.status === 'In Progress').length,
          resolved: list.filter((c) => c.status === 'Resolved').length,
        });
      })
      .catch((error) => pushToast(error.message, 'error'));
  };

  const loadUserProfile = async (complaint) => {
    try {
      const profileFromComplaint = complaint && {
        name: complaint.userName || 'Unknown user',
        email: complaint.userEmail || 'N/A',
        city: complaint.userCity || 'N/A',
        phone: complaint.userPhone || 'N/A',
        streetAddress: complaint.userStreetAddress || 'N/A',
      };

      if (profileFromComplaint && profileFromComplaint.name) {
        setSelectedUser(profileFromComplaint);
        return;
      }

      if (!complaint?.userId) {
        pushToast('No complainant profile is available for this complaint', 'error');
        return;
      }

      const profile = await apiFetch(`/users/${complaint.userId}`, {}, token);
      setSelectedUser(profile);
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, [token, user.departmentId]);

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/complaints/${id}`, { method: 'PUT', body: JSON.stringify({ status, note: `Updated to ${status}` }) }, token);
      loadData();
      pushToast(ui.departmentStatusUpdated, 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: ui.total, value: summary.totalComplaints },
          { label: ui.pending, value: summary.pending },
          { label: ui.inProgress, value: summary.inProgress },
          { label: ui.resolved, value: summary.resolved },
        ].map((item) => (
          <div key={item.label} className="rounded-[24px] border border-emerald-100 bg-white p-4 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="w-full max-w-lg rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">{ui.complainantProfile}</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">{selectedUser.name}</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100">{ui.close}</button>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3"><span className="block font-semibold text-slate-700">{ui.email}</span> {selectedUser.email}</div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3"><span className="block font-semibold text-slate-700">{ui.city}</span> {selectedUser.city}</div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3"><span className="block font-semibold text-slate-700">{ui.phone}</span> {selectedUser.phone}</div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 md:col-span-2"><span className="block font-semibold text-slate-700">{ui.address}</span> {selectedUser.streetAddress}</div>
            </div>
          </motion.div>
        </div>
      )}

      <section className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">{ui.department}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{localizedDepartmentName(departmentMeta[user.departmentId]?.name || 'Department', ui)} {ui.queue}</h3>
          </div>
        </div>

        {complaints.length === 0 ? (
          <EmptyState message={ui.noDepartmentComplaints} />
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/25 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{complaint.title || 'Complaint'}</p>
                      <span className={classNames('rounded-full border px-2.5 py-1 text-[10px] font-semibold', statusColorMap[complaint.status] || 'bg-slate-100 text-slate-700 border-slate-200')}>
                        {localizedStatus(complaint.status, ui)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{complaint.description}</p>
                    <p className="mt-2 text-xs text-slate-500">{ui.submittedBy} {complaint.userName} • {formatDate(complaint.createdAt)}</p>
                  </div>
                  <div className="flex min-w-[220px] flex-col gap-2 md:items-end">
                    <button
                      type="button"
                      onClick={() => loadUserProfile(complaint)}
                      className="rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                    >
                      {ui.viewComplainantProfile}
                    </button>
                    <select value={complaint.status} onChange={(event) => updateStatus(complaint.id, event.target.value)} className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none">
                      <option value="Pending">{ui.pending}</option>
                      <option value="In Progress">{ui.inProgress}</option>
                      <option value="Resolved">{ui.resolved}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}

function ProfilePage({ token, user, ui, pushToast }) {
  const [form, setForm] = useState({
    name: user.name,
    city: user.city,
    phone: user.phone,
    streetAddress: user.streetAddress,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          city: form.city,
          phone: form.phone,
          streetAddress: form.streetAddress,
        }),
      }, token);
      pushToast(ui.profileUpdated, 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Profile</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{ui.myProfile}</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <UserCircle2 className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <InputField label={ui.name} value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <InputField label={ui.email} value={user.email} onChange={() => {}} disabled />
        <InputField label={ui.city} value={form.city} onChange={(value) => setForm({ ...form, city: value })} />
        <InputField label={ui.phone} value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
        <div className="md:col-span-2">
          <InputField label={ui.streetAddress} value={form.streetAddress} onChange={(value) => setForm({ ...form, streetAddress: value })} />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(16,185,129,0.24)]">
            Save profile
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function ToastStack({ toasts }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={classNames('rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur-sm', toast.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700')}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value || '—'}</span>
    </div>
  );
}

export default App;
