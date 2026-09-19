import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Lock, User as UserIcon, Users, ChevronDown, AlertCircle, ShieldCheck, Check } from 'lucide-react';
import { login } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('ministry_admin');
  const [department, setDepartment] = useState('MINISTRY_ADMIN');
  const [password, setPassword] = useState('admin123');
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  if (!isOpen) return null;

  // Admin-provisioned credentials mapped to each Department
  const departmentCredentials = {
    MINISTRY_ADMIN: {
      label: t('login_page.role_ministry', 'Ministry Admin'),
      username: 'ministry_admin',
      password: 'admin123',
    },
    MP: {
      label: t('login_page.role_mp', 'Member of Parliament'),
      username: 'mp_pune',
      password: 'admin123',
    },
    DISTRICT_AUTHORITY: {
      label: t('login_page.role_da', 'District Authority'),
      username: 'da_pune',
      password: 'admin123',
    },
    CONTRACTOR: {
      label: t('login_page.role_contractor', 'Contractor'),
      username: 'contractor_abc',
      password: 'admin123',
    },
  };

  const handleDepartmentChange = (deptKey) => {
    setDepartment(deptKey);
    setError('');
    const creds = departmentCredentials[deptKey];
    if (creds) {
      setUsername(creds.username);
      setPassword(creds.password);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide user name and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(username.trim(), password.trim());
      if (data && data.access_token) {
        const enrichedData = {
          ...data,
          district: data.district || (username.includes('lucknow') ? 'Lucknow' : 'Pune'),
          state: data.state || (username.includes('lucknow') ? 'Uttar Pradesh' : 'Maharashtra'),
          constituency: data.constituency || `${data.district || (username.includes('lucknow') ? 'Lucknow' : 'Pune')} Lok Sabha`,
        };
        onLoginSuccess && onLoginSuccess(enrichedData);
        onClose();
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.detail || 'Invalid username or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Login Card - Styled exactly like the provided design */}
      <div className="relative w-full max-w-[390px] bg-white rounded-2xl shadow-2xl p-7 sm:p-8 z-10 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top User Silhouette Avatar */}
        <div className="w-16 h-16 rounded-full bg-[#dbe5ea] flex items-center justify-center mx-auto mb-3.5">
          <div className="w-9 h-9 rounded-full bg-[#256c73] flex items-center justify-center text-white">
            <UserIcon className="w-6 h-6 fill-current text-[#256c73]" strokeWidth={2.5} color="#dbe5ea" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-slate-800 tracking-wider text-center mb-5 uppercase">
          {t('login_page.login_title', 'LOGIN')}
        </h2>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Field 1: User name */}
          <div className="relative">
            <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="modal-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('login_page.username_placeholder', 'User name')}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-md outline-none focus:border-[#288188] focus:ring-1 focus:ring-[#288188] text-slate-800 placeholder-slate-400 bg-white transition"
              required
            />
          </div>

          {/* Field 2: Department */}
          <div className="relative">
            <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="modal-department"
              value={department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-sm border border-slate-300 rounded-md outline-none focus:border-[#288188] focus:ring-1 focus:ring-[#288188] text-slate-800 bg-white appearance-none cursor-pointer transition"
            >
              <option value="" disabled>{t('login_page.department_placeholder', 'Department')}</option>
              <option value="MINISTRY_ADMIN">{t('login_page.role_ministry', 'Ministry Admin')}</option>
              <option value="MP">{t('login_page.role_mp', 'Member of Parliament')}</option>
              <option value="DISTRICT_AUTHORITY">{t('login_page.role_da', 'District Authority')}</option>
              <option value="CONTRACTOR">{t('login_page.role_contractor', 'Contractor')}</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Field 3: Password */}
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              id="modal-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login_page.password_placeholder', 'Password')}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-md outline-none focus:border-[#288188] focus:ring-1 focus:ring-[#288188] text-slate-800 placeholder-slate-400 bg-white transition"
              required
            />
          </div>

          {/* Keep me logged in */}
          <div className="flex items-center gap-2 pt-1 pb-1">
            <input
              type="checkbox"
              id="modal-keep-logged-in"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-[#387a42] focus:ring-[#387a42] cursor-pointer"
            />
            <label htmlFor="modal-keep-logged-in" className="text-xs text-slate-600 cursor-pointer select-none">
              {t('login_page.keep_logged_in', 'Keep me logged in')}
            </label>
          </div>

          {/* Log in Button (Solid Forest Green) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#387a42] hover:bg-[#2d6436] active:bg-[#26552e] text-white font-medium text-sm rounded-md transition duration-150 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? t('login_page.logging_in', 'Logging in...') : t('login_page.login_button', 'Log in')}
          </button>

          {/* Forgot Password */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowForgotNotice(!showForgotNotice)}
              className="text-xs text-[#227781] hover:underline font-normal cursor-pointer"
            >
              {t('login_page.forgot_password', 'Forgot password?')}
            </button>
          </div>
        </form>

        {/* Forgot password notification */}
        {showForgotNotice && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">{t('modals.official_pw_assistance', 'Official Password Assistance')}</p>
            <p>{t('modals.official_pw_text', 'User credentials for official departments are issued by the MoSPI System Administrator. Please contact admin@mospi.gov.in for account resets.')}</p>
          </div>
        )}

        {/* Quick Admin Credentials Info */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>{t('modals.admin_credentials_title', 'Admin-Issued Department Credentials')}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(departmentCredentials).map(([key, cred]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleDepartmentChange(key)}
                className={`p-1.5 rounded text-left transition border text-[10px] cursor-pointer ${
                  department === key
                    ? 'bg-teal-50 text-teal-900 border-teal-500 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{cred.label}</span>
                  {department === key && <Check className="w-3 h-3 text-teal-700" />}
                </div>
                <div className="text-[9px] text-slate-500 font-mono truncate">{cred.username}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
