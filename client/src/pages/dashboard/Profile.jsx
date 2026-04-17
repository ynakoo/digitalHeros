import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import api from '../../api/client';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ full_name: '', charity_id: '', charity_percentage: 10 });
  const [charities, setCharities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || '', charity_id: user.charity_id || '', charity_percentage: user.charity_percentage || 10 });
    }
    api.get('/api/charities').then(r => setCharities(r.data.charities || [])).catch(() => {});
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await updateProfile({
        full_name: form.full_name,
        charity_id: form.charity_id || null,
        charity_percentage: parseInt(form.charity_percentage)
      });
      setMsg('Profile updated successfully!');
    } catch (err) {
      setMsg('Failed to update profile.');
    } finally { setSaving(false); }
  };

  const subStatusMap = { active: 'success', cancelled: 'danger', lapsed: 'warning', none: 'neutral' };

  return (
    <div>
      <h1 className={styles.title}>Profile Settings</h1>
      <p className={styles.subtitle}>Manage your account and preferences.</p>

      {msg && (
        <div style={{
          padding: '12px 16px',
          background: msg.includes('success') ? 'var(--success-bg)' : 'var(--danger-bg)',
          color: msg.includes('success') ? 'var(--success)' : 'var(--danger)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-lg)',
          fontSize: 'var(--fs-sm)',
          border: `1px solid ${msg.includes('success') ? 'rgba(0,184,148,0.3)' : 'rgba(225,112,85,0.3)'}`
        }}>{msg}</div>
      )}

      <div className={styles.grid}>
        <Card>
          <h2 className={styles.sectionTitle}>Account Information</h2>
          <div className={styles.form}>
            <Input label="Full Name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
            <Input label="Email" value={user?.email || ''} disabled />
            <Input label="Role" value={user?.role || 'user'} disabled />
          </div>
        </Card>

        <Card>
          <h2 className={styles.sectionTitle}>Subscription</h2>
          <div className={styles.subInfo}>
            <div className={styles.subRow}>
              <span>Status</span>
              <Badge variant={subStatusMap[user?.subscription_status] || 'neutral'}>
                {user?.subscription_status || 'None'}
              </Badge>
            </div>
            {user?.subscription_plan && (
              <div className={styles.subRow}><span>Plan</span><span>{user.subscription_plan}</span></div>
            )}
            {user?.subscription_end && (
              <div className={styles.subRow}><span>Renewal</span><span>{new Date(user.subscription_end).toLocaleDateString()}</span></div>
            )}
          </div>
        </Card>

        <Card className={styles.fullWidth}>
          <h2 className={styles.sectionTitle}>Charity Settings</h2>
          <div className={styles.form}>
            <div>
              <label style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Selected Charity</label>
              <div className={styles.charityGrid}>
                {charities.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.charityOption} ${form.charity_id === c.id ? styles.charityOptionActive : ''}`}
                    onClick={() => setForm({...form, charity_id: c.id})}
                  >
                    <img src={c.image_url} alt={c.name} className={styles.charityImg} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginBottom: 8 }}>
                <span>Charity Contribution</span>
                <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{form.charity_percentage}%</span>
              </div>
              <input type="range" min="10" max="50" value={form.charity_percentage} onChange={e => setForm({...form, charity_percentage: e.target.value})}
                style={{ width: '100%', accentColor: 'var(--accent-secondary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                <span>Min 10%</span><span>Max 50%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 'var(--space-xl)' }}>
        <Button onClick={handleSave} loading={saving}>Save Changes</Button>
      </div>
    </div>
  );
}
