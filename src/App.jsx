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
  MonitorCog,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  UserRound,
  Waves,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
    profileUpdated: 'Profile updated successfully',
    complaintSubmitted: 'Complaint submitted successfully',
    loginSuccess: 'Login successful',
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
  },
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
};

const classNames = (...values) => values.filter(Boolean).join(' ');

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
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['user'] },
      { to: '/admin', label: 'Admin', icon: MonitorCog, roles: ['admin'] },
      { to: `/department/${user?.departmentId || 1}`, label: 'Department', icon: Building2, roles: ['department'] },
      { to: '/profile', label: 'Profile', icon: UserCircle2, roles: ['user', 'admin', 'department'] },
    ];
    return items.filter((item) => item.roles.includes(user?.role));
  }, [user]);

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
            <div className="flex min-h-screen flex-col lg:flex-row">
              <aside className={classNames('border-b border-emerald-100 bg-white/90 p-4 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r', mobileMenuOpen ? 'block' : 'hidden lg:block')}>
                <div className="flex items-center justify-between gap-3 border-b border-emerald-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-200">
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
              </aside>

              <div className="flex-1">
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
                        <h2 className="text-lg font-bold text-slate-800">{user.role === 'admin' ? ui.adminDashboard : user.role === 'department' ? 'Department Operations' : ui.dashboard}</h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                        {isRtl ? ui.urdu : ui.english}
                      </div>
                      <select
                        value={lang}
                        onChange={(event) => setLang(event.target.value)}
                        className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none"
                      >
                        <option value="en">English</option>
                        <option value="ur">اردو</option>
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
              </div>
            </div>
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
              <h1 className="text-3xl font-bold">{ui.appName}</h1>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-2">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-100">Smart Service</p>
                <p className="text-xl font-semibold">Civic complaint tracking</p>
              </div>
            </div>
            <ul className="space-y-3 text-emerald-50/90">
              <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4" /> Secure multi-role access</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4" /> Personalized complaint ownership</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4" /> Department-aware escalation</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4" /> Urdu and English interface</li>
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
        body: JSON.stringify({ title, description, language: 'English' }),
      }, token);
      setTitle('');
      setDescription('');
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
                        {complaint.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{complaint.description}</p>
                  </div>
                  <div className="text-xs text-slate-500">
                    <p>{departmentMeta[complaint.departmentId]?.name || 'Department'}</p>
                    <p>{formatDate(complaint.createdAt)}</p>
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
      pushToast('Complaint status updated', 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="grid gap-4 md:grid-cols-5">
        {[
          { label: 'Total', value: summary.totalComplaints },
          { label: 'Pending', value: summary.pending },
          { label: 'In Progress', value: summary.inProgress },
          { label: 'Resolved', value: summary.resolved },
          { label: 'Users', value: summary.users },
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
            <p className="text-sm text-slate-500">{name}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{count}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Operations</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">All complaints</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-emerald-100">
              <tr className="text-slate-500">
                <th className="px-3 py-3 font-medium">User</th>
                <th className="px-3 py-3 font-medium">Department</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="border-b border-emerald-50 text-slate-700">
                  <td className="px-3 py-3 font-medium">{complaint.userName}</td>
                  <td className="px-3 py-3">{departmentMeta[complaint.departmentId]?.name || complaint.department}</td>
                  <td className="px-3 py-3">
                    <select value={complaint.status} onChange={(event) => updateStatus(complaint.id, event.target.value)} className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-medium outline-none">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
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
      pushToast('Department status updated', 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total', value: summary.totalComplaints },
          { label: 'Pending', value: summary.pending },
          { label: 'In Progress', value: summary.inProgress },
          { label: 'Resolved', value: summary.resolved },
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
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Complainant profile</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">{selectedUser.name}</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100">Close</button>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3"><span className="block font-semibold text-slate-700">Email</span> {selectedUser.email}</div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3"><span className="block font-semibold text-slate-700">City</span> {selectedUser.city}</div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3"><span className="block font-semibold text-slate-700">Phone</span> {selectedUser.phone}</div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 md:col-span-2"><span className="block font-semibold text-slate-700">Address</span> {selectedUser.streetAddress}</div>
            </div>
          </motion.div>
        </div>
      )}

      <section className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Department</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{departmentMeta[user.departmentId]?.name || 'Department'} queue</h3>
          </div>
        </div>

        {complaints.length === 0 ? (
          <EmptyState message="No department complaints currently assigned." />
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/25 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{complaint.title || 'Complaint'}</p>
                      <span className={classNames('rounded-full border px-2.5 py-1 text-[10px] font-semibold', statusColorMap[complaint.status] || 'bg-slate-100 text-slate-700 border-slate-200')}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{complaint.description}</p>
                    <p className="mt-2 text-xs text-slate-500">Submitted by {complaint.userName} • {formatDate(complaint.createdAt)}</p>
                  </div>
                  <div className="flex min-w-[220px] flex-col gap-2 md:items-end">
                    <button
                      type="button"
                      onClick={() => loadUserProfile(complaint)}
                      className="rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                    >
                      View complainant profile
                    </button>
                    <select value={complaint.status} onChange={(event) => updateStatus(complaint.id, event.target.value)} className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
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
