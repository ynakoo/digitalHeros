import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import api from '../../api/client';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/api/admin/users/${id}`)
      .then(r => {
        setUserData(r.data);
        setForm({
          full_name: r.data.user.full_name,
          subscription_status: r.data.user.subscription_status,
          subscription_plan: r.data.user.subscription_plan || 'monthly',
          role: r.data.user.role,
          charity_percentage: r.data.user.charity_percentage
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      await api.put(`/api/admin/users/${id}`, form);
      setMsg('User updated successfully!');
    } catch (err) {
      setMsg('Failed to update user.');
    } finally { setSaving(false); }
  };

  const handleToggleSub = async (status, plan) => {
    try {
      await api.put('/api/subscriptions/admin-toggle', { user_id: id, subscription_status: status, subscription_plan: plan });
      setMsg(`Subscription ${status === 'active' ? 'activated' : 'updated'}!`);
      setForm({ ...form, subscription_status: status, subscription_plan: plan });
    } catch (err) { setMsg('Failed to update subscription.'); }
  };

  if (loading) return <Loader fullPage />;
  if (!userData) return <div>User not found.</div>;

  const { user, scores, winnings } = userData;
  const subColor = { active: 'success', cancelled: 'danger', lapsed: 'warning', none: 'neutral' };

  return (
    <div>
      <Link to="/admin/users" style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', display: 'inline-block', marginBottom: 'var(--space-lg)' }}>← Back to Users</Link>
      <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 4 }}>{user.full_name}</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-2xl)' }}>{user.email}</p>

      {msg && <div style={{ padding: '12px 16px', background: msg.includes('success') || msg.includes('activated') ? 'var(--success-bg)' : 'var(--danger-bg)', color: msg.includes('success') || msg.includes('activated') ? 'var(--success)' : 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)', fontSize: 'var(--fs-sm)' }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
        <Card>
          <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-lg)' }}>Edit Profile</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Input label="Full Name" value={form.full_name || ''} onChange={e => setForm({...form, full_name: e.target.value})} />
            <Input label="Role" type="select" value={form.role || 'user'} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </Input>
            <Input label="Charity %" type="number" min="10" max="50" value={form.charity_percentage || 10} onChange={e => setForm({...form, charity_percentage: parseInt(e.target.value)})} />
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-lg)' }}>Subscription Control</h3>
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>Current: </span>
            <Badge variant={subColor[form.subscription_status] || 'neutral'}>{form.subscription_status || 'none'}</Badge>
            {form.subscription_plan && <span style={{ marginLeft: 8, fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>({form.subscription_plan})</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <Button variant="secondary" size="small" onClick={() => handleToggleSub('active', 'monthly')}>Activate Monthly</Button>
            <Button variant="secondary" size="small" onClick={() => handleToggleSub('active', 'yearly')}>Activate Yearly</Button>
            <Button variant="outline" size="small" onClick={() => handleToggleSub('cancelled', form.subscription_plan)}>Cancel Subscription</Button>
            <Button variant="danger" size="small" onClick={() => handleToggleSub('none', null)}>Remove Subscription</Button>
          </div>
        </Card>
      </div>

      <Card style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-lg)' }}>Scores ({scores?.length || 0})</h3>
        {scores?.length > 0 ? (
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            {scores.map(s => (
              <div key={s.id} style={{ padding: 'var(--space-md) var(--space-lg)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--fs-xl)', fontWeight: 700 }}>{s.score}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{new Date(s.played_date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        ) : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>No scores.</p>}
      </Card>

      <Card>
        <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-lg)' }}>Winnings ({winnings?.length || 0})</h3>
        {winnings?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {winnings.map(w => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <Badge variant="purple">{w.match_type?.replace('_', ' ')}</Badge>
                  <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{new Date(w.draws?.draw_date).toLocaleDateString()}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--accent-warm)' }}>${parseFloat(w.prize_amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>No winnings.</p>}
      </Card>
    </div>
  );
}
