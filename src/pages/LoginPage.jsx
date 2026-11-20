import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../api';
import { setCredentials } from '../features/authSlice';
import { Notice } from '../components/Notice';

const demos = [
  { role: 'buyer', email: 'buyer@example.com' },
  { role: 'seller', email: 'seller@example.com' },
  { role: 'admin', email: 'admin@example.com' }
];

export default function LoginPage({ reset = false }) {
  const [params] = useSearchParams();
  const [register, setRegister] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (reset) {
        const { data } = await api.post('/auth/reset-password', { token: params.get('token'), password: form.password });
        setNotice(data.message);
      } else if (forgot) {
        const { data } = await api.post('/auth/forgot-password', { email: form.email });
        setNotice(data.demoResetLink ? `${data.message} Demo link: ${data.demoResetLink}` : data.message);
      } else {
        const path = register ? '/auth/register' : '/auth/login';
        const { data } = await api.post(path, form);
        dispatch(setCredentials(data));
        navigate(location.state?.from || '/', { replace: true });
      }
    } catch (reason) {
      setError(reason.response?.data?.message || 'Could not connect to the marketplace API.');
    } finally {
      setBusy(false);
    }
  }

  function chooseDemo(account) {
    setRegister(false);
    setForgot(false);
    setForm({ ...form, email: account.email, password: 'Demo123!' });
    setError('');
  }

  const title = reset ? 'Choose a new password' : forgot ? 'Reset your password' : register ? 'Create your account' : 'Welcome back';
  return (
    <div className="auth-page">
      <div className="auth-story">
        <p className="eyebrow"><span className="eyebrow-dot" /> THE MARKETPLACE LAB</p>
        <h1>Understand it<br />by <em>experiencing it.</em></h1>
        <p>Every role tells a different part of the story. Sign in and follow an order all the way through.</p>
        <div className="auth-story-note"><span>↗</span><div><b>Built for learning, not live commerce</b><small>Test payments or a clearly marked simulation.</small></div></div>
      </div>
      <div className="auth-card">
        <p className="eyebrow">{reset ? 'ACCOUNT RECOVERY' : 'YOUR WORKSPACE'}</p>
        <h2>{title}</h2>
        <p className="auth-subtitle">{reset ? 'The reset link is valid for 30 minutes.' : forgot ? 'Enter the email address for your account.' : register ? 'Join the demo and explore the buyer or seller flow.' : 'Pick a seeded role or use your own demo account.'}</p>
        <Notice tone="error">{error}</Notice>
        <Notice>{notice}</Notice>
        {!reset && !register && !forgot && <div className="demo-picks">
          {demos.map((account) => <button key={account.role} type="button" className="demo-pick" onClick={() => chooseDemo(account)}>
            <span>{account.role[0].toUpperCase()}</span><b>{account.role}</b><small>Use demo</small>
          </button>)}
        </div>}
        <form className="form-stack" onSubmit={submit}>
          {register && <label>Your name<input name="name" value={form.name} onChange={update} required placeholder="e.g. Alex Morgan" autoComplete="name" /></label>}
          {!reset && <label>Email address<input name="email" type="email" value={form.email} onChange={update} required placeholder="you@example.com" autoComplete="email" /></label>}
          {!forgot && <label>{reset ? 'New password' : 'Password'}<input name="password" type="password" value={form.password} onChange={update} required minLength={8} placeholder={reset || register ? 'At least 8 characters' : 'Demo123!'} autoComplete={reset ? 'new-password' : 'current-password'} /></label>}
          {register && <label>Account type<select name="role" value={form.role} onChange={update}><option value="buyer">Buyer</option><option value="seller">Seller (requires approval)</option></select></label>}
          <button className="button button-dark button-wide" disabled={busy}>{busy ? 'Please wait…' : reset ? 'Update password' : forgot ? 'Send reset link' : register ? 'Create account' : 'Sign in'} <span>→</span></button>
        </form>
        {!reset && !register && !forgot && <button className="text-button forgot-link" onClick={() => { setForgot(true); setError(''); }}>Forgot password?</button>}
        {!reset && <p className="auth-switch">
          {forgot ? <>Remembered it? <button onClick={() => setForgot(false)}>Sign in</button></> :
            register ? <>Already have an account? <button onClick={() => setRegister(false)}>Sign in</button></> :
              <>New to the lab? <button onClick={() => setRegister(true)}>Create an account</button></>}
        </p>}
        <p className="auth-footnote">Passwords are hashed with bcrypt in the demo database. Never reuse a real password here.</p>
      </div>
    </div>
  );
}
