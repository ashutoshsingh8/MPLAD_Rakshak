import { useState } from 'react';
import { User, Users, Lock, ChevronDown, ArrowLeft, ShieldCheck, AlertCircle, Info, Check } from 'lucide-react';
import { login } from '../services/api';

export default function LoginPage({ onBackToPublic, onLoginSuccess }) {
  const [username, setUsername] = useState('ministry_admin');
  const [department, setDepartment] = useState('MINISTRY_ADMIN');
  const [password, setPassword] = useState('admin123');
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  // Admin-provisioned credentials mapped to each Department
  const departmentCredentials = {
    MINISTRY_ADMIN: {
      label: 'Ministry Admin',
      username: 'ministry_admin',
      password: 'admin123',
      designation: 'MoSPI National Oversight (Dr. Rajesh Kumar)',
      role: 'MINISTRY_ADMIN',
    },
    MP: {
      label: 'Member of Parliament',
      username: 'mp_pune',
      password: 'admin123',
      designation: 'MP Pune Constituency (Shri Vijay Patil)',
      role: 'MP',
    },
    DISTRICT_AUTHORITY: {
      label: 'District Authority',
      username: 'da_pune',
      password: 'admin123',
      designation: 'District Magistrate Pune (Smt. Priya Sharma)',
      role: 'DISTRICT_AUTHORITY',
    },
    CONTRACTOR: {
      label: 'Contractor',
      username: 'contractor_abc',
      password: 'admin123',
      designation: 'Empanelled Agency (M/s ABC Constructions)',
      role: 'CONTRACTOR',
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

    if (!username.trim()) {
      setError('Please enter your user name.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(username.trim(), password.trim());
      const selectedCred = departmentCredentials[department] || {};
      const enrichedData = {
        ...data,
        district: data.district || selectedCred.district || (username.includes('lucknow') ? 'Lucknow' : 'Pune'),
        state: data.state || selectedCred.state || (username.includes('lucknow') ? 'Uttar Pradesh' : 'Maharashtra'),
        constituency: data.constituency || selectedCred.constituency || `${data.district || selectedCred.district || (username.includes('lucknow') ? 'Lucknow' : 'Pune')} Lok Sabha`,
      };
      if (onLoginSuccess) {
        onLoginSuccess(enrichedData);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail ||
        'Invalid credentials. Please verify your admin-issued user name and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#288188] flex flex-col items-center justify-center relative px-4 py-12 select-none">
      {/* Top Left Navigation Link */}
      <button
        onClick={onBackToPublic}
        className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center gap-2 text-white/90 hover:text-white text-xs font-semibold bg-black/15 hover:bg-black/25 backdrop-blur-sm px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Public Portal</span>
      </button>

      {/* Main Login Card - Exactly matches user reference design */}
      <div className="w-full max-w-[390px] bg-white rounded-2xl shadow-2xl p-7 sm:p-9 relative z-10">
        {/* Top User Silhouette Avatar */}
        <div className="w-16 h-16 rounded-full bg-[#dbe5ea] flex items-center justify-center mx-auto mb-3.5">
          <div className="w-9 h-9 rounded-full bg-[#256c73] flex items-center justify-center text-white">
            <User className="w-6 h-6 fill-current text-[#256c73]" strokeWidth={2.5} color="#dbe5ea" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-slate-800 tracking-wider text-center mb-6 uppercase">
          LOGIN
        </h2>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Field 1: User name */}
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="login-username"
              placeholder="User name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-md outline-none focus:border-[#288188] focus:ring-1 focus:ring-[#288188] text-slate-800 placeholder-slate-400 bg-white transition"
            />
          </div>

          {/* Field 2: Department */}
          <div className="relative">
            <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="login-department"
              value={department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-sm border border-slate-300 rounded-md outline-none focus:border-[#288188] focus:ring-1 focus:ring-[#288188] text-slate-800 bg-white appearance-none cursor-pointer transition"
            >
              <option value="" disabled>Department</option>
              <option value="MINISTRY_ADMIN">Ministry Admin</option>
              <option value="MP">Member of Parliament</option>
              <option value="DISTRICT_AUTHORITY">District Authority</option>
              <option value="CONTRACTOR">Contractor</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Field 3: Password */}
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              id="login-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-md outline-none focus:border-[#288188] focus:ring-1 focus:ring-[#288188] text-slate-800 placeholder-slate-400 bg-white transition"
            />
          </div>

          {/* Checkbox: Keep me logged in */}
          <div className="flex items-center gap-2 pt-1 pb-1">
            <input
              type="checkbox"
              id="keep-logged-in"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-[#387a42] focus:ring-[#387a42] cursor-pointer"
            />
            <label htmlFor="keep-logged-in" className="text-xs text-slate-600 cursor-pointer select-none">
              Keep me logged in
            </label>
          </div>

          {/* Action Button: Log in (Solid Forest Green) */}
          <button
            type="submit"
            id="login-submit-button"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#387a42] hover:bg-[#2d6436] active:bg-[#26552e] text-white font-medium text-sm rounded-md transition duration-150 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          {/* Link: Forgot password? */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowForgotNotice(true)}
              className="text-xs text-[#227781] hover:underline font-normal cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>

      {/* Admin Issued Credentials Info Box */}
      <div className="w-full max-w-[390px] mt-4 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-white text-[11px] space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-white">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>Admin-Issued System Credentials</span>
        </div>
        <p className="text-white/80 leading-tight">
          Department user accounts and passwords are created and provisioned by the MoSPI System Administrator.
        </p>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {Object.entries(departmentCredentials).map(([key, cred]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleDepartmentChange(key)}
              className={`p-1.5 rounded text-left transition border cursor-pointer ${
                department === key
                  ? 'bg-white text-slate-900 border-white font-bold shadow-sm'
                  : 'bg-black/20 text-white/90 border-white/10 hover:bg-black/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{cred.label}</span>
                {department === key && <Check className="w-3 h-3 text-emerald-600" />}
              </div>
              <div className="text-[10px] opacity-75 font-mono truncate">{cred.username}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Forgot Password Guidance Modal */}
      {showForgotNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
              <Info className="w-5 h-5 text-teal-700" />
              <span>MoSPI Administrator Password Reset</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official credentials for <strong>Ministry Admin, Member of Parliament, District Authority, and Contractor</strong> roles are strictly issued and managed by the MoSPI System Administrator.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 font-mono">
              <p>Email: <strong>admin@mospi.gov.in</strong></p>
              <p>Helpline: <strong>1800-11-8080</strong></p>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotNotice(false)}
              className="w-full py-2 bg-[#288188] hover:bg-[#20696f] text-white text-xs font-bold rounded-md transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
