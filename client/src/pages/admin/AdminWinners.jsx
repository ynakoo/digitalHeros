import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import api from '../../api/client';

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchWinners = () => {
    api.get('/api/admin/winners').then(r => setWinners(r.data.winners || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWinners(); }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/api/winners/${id}/verify`, { verification_status: status });
      setMsg(`Winner ${status}!`);
      fetchWinners();
    } catch (err) { setMsg('Failed to verify.'); }
  };

  const handlePayout = async (id) => {
    try {
      await api.put(`/api/winners/${id}/payout`);
      setMsg('Marked as paid!');
      fetchWinners();
    } catch (err) { setMsg('Failed to update payout.'); }
  };

  if (loading) return <Loader fullPage />;

  const verColor = { pending: 'warning', approved: 'success', rejected: 'danger' };
  const payColor = { pending: 'warning', paid: 'success' };

  const columns = [
    { header: 'Winner', render: (r) => r.profiles?.full_name || 'Unknown' },
    { header: 'Email', render: (r) => r.profiles?.email || '' },
    { header: 'Draw Date', render: (r) => new Date(r.draws?.draw_date).toLocaleDateString() },
    { header: 'Match', render: (r) => <Badge variant="purple">{r.match_type?.replace('_', ' ')}</Badge> },
    { header: 'Prize', render: (r) => <span style={{ fontWeight: 700, color: 'var(--accent-warm)' }}>${parseFloat(r.prize_amount).toFixed(2)}</span> },
    { header: 'Proof', render: (r) => r.proof_image_url ? <a href={r.proof_image_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--fs-xs)' }}>View →</a> : <span style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>None</span> },
    { header: 'Verification', render: (r) => <Badge variant={verColor[r.verification_status]}>{r.verification_status}</Badge> },
    { header: 'Payment', render: (r) => <Badge variant={payColor[r.payment_status]}>{r.payment_status}</Badge> },
    { header: 'Actions', render: (r) => (
      <div style={{ display: 'flex', gap: 4 }}>
        {r.verification_status === 'pending' && (
          <>
            <Button variant="ghost" size="small" onClick={() => handleVerify(r.id, 'approved')} style={{ color: 'var(--success)' }}>✓</Button>
            <Button variant="ghost" size="small" onClick={() => handleVerify(r.id, 'rejected')} style={{ color: 'var(--danger)' }}>✕</Button>
          </>
        )}
        {r.verification_status === 'approved' && r.payment_status === 'pending' && (
          <Button variant="ghost" size="small" onClick={() => handlePayout(r.id)} style={{ color: 'var(--accent-warm)' }}>Mark Paid</Button>
        )}
      </div>
    )}
  ];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 4 }}>Winner Management</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-2xl)' }}>Verify submissions and manage payouts.</p>

      {msg && <div style={{ padding: '12px 16px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)', fontSize: 'var(--fs-sm)' }}>{msg}</div>}

      <Table columns={columns} data={winners} emptyMessage="No winners yet." />
    </div>
  );
}
