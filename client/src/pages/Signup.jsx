import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../api/client';
import styles from './Login.module.css';

export default function Signup() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirmPassword: '',
    charity_id: '', charity_percentage: 10
  });
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/charities').then(r => setCharities(r.data.charities || [])).catch(() => {});
  }, []);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await signup({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        charity_id: form.charity_id || undefined,
        charity_percentage: parseInt(form.charity_percentage)
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card} style={{ maxWidth: 520 }}>
        <div className={styles.header}>
          <div className={styles.logo}>⛳ GolfGives</div>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join the community of golfers making a difference</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input label="Full Name" placeholder="John Doe" value={form.full_name} onChange={handleChange('full_name')} required />
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange('email')} required />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange('password')} required />
          <Input label="Confirm Password" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange('confirmPassword')} required />

          {charities.length > 0 && (
            <div>
              <label className={styles.sliderLabel} style={{ marginBottom: 8 }}>
                <span>Select a Charity (optional)</span>
              </label>
              <div className={styles.charitySelect}>
                {charities.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.charityOption} ${form.charity_id === c.id ? styles.charityOptionSelected : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, charity_id: c.id }))}
                  >
                    <img src={c.image_url} alt={c.name} className={styles.charityImg} />
                    <span className={styles.charityName}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.sliderWrap}>
            <div className={styles.sliderLabel}>
              <span>Charity Contribution</span>
              <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{form.charity_percentage}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={form.charity_percentage}
              onChange={e => setForm(prev => ({ ...prev, charity_percentage: e.target.value }))}
              className={styles.slider}
            />
            <div className={styles.sliderLabel}>
              <span style={{ fontSize: 'var(--fs-xs)' }}>Min 10%</span>
              <span style={{ fontSize: 'var(--fs-xs)' }}>Max 50%</span>
            </div>
          </div>

          <Button type="submit" fullWidth loading={loading}>Create Account</Button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </Card>
    </div>
  );
}
