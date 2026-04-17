import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
import api from '../../api/client';
import styles from './Winnings.module.css';

export default function Winnings() {
  const [winnings, setWinnings] = useState([]);
  const [totalWon, setTotalWon] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showProof, setShowProof] = useState(null);
  const [proofUrl, setProofUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/winners/me').then(r => {
      setWinnings(r.data.winnings || []);
      setTotalWon(r.data.totalWon || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUploadProof = async () => {
    if (!proofUrl) return;
    setSaving(true);
    try {
      await api.post(`/api/winners/${showProof}/upload-proof`, { proof_image_url: proofUrl });
      setShowProof(null);
      setProofUrl('');
      const { data } = await api.get('/api/winners/me');
      setWinnings(data.winnings || []);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) return <Loader fullPage />;

  const verificationColor = { pending: 'warning', approved: 'success', rejected: 'danger' };
  const paymentColor = { pending: 'warning', paid: 'success' };

  const columns = [
    { header: 'Draw Date', render: (row) => new Date(row.draws?.draw_date).toLocaleDateString() },
    { header: 'Match', render: (row) => <Badge variant={row.match_type === 'match_5' ? 'warning' : 'purple'}>{row.match_type.replace('_', ' ')}</Badge> },
    { header: 'Numbers', render: (row) => (
      <div style={{ display: 'flex', gap: 4 }}>
        {row.matched_numbers?.map((n, i) => (
          <span key={i} style={{ padding: '2px 8px', background: 'var(--bg-glass-strong)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-xs)', fontWeight: 600 }}>{n}</span>
        ))}
      </div>
    )},
    { header: 'Prize', render: (row) => <span style={{ fontWeight: 700, color: 'var(--accent-warm)' }}>${parseFloat(row.prize_amount).toFixed(2)}</span> },
    { header: 'Verification', render: (row) => <Badge variant={verificationColor[row.verification_status]}>{row.verification_status}</Badge> },
    { header: 'Payment', render: (row) => <Badge variant={paymentColor[row.payment_status]}>{row.payment_status}</Badge> },
    { header: 'Action', render: (row) => (
      row.verification_status === 'pending' && !row.proof_image_url ? (
        <Button variant="outline" size="small" onClick={() => { setShowProof(row.id); setProofUrl(''); }}>Upload Proof</Button>
      ) : row.proof_image_url ? (
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Proof submitted</span>
      ) : null
    )}
  ];

  return (
    <div>
      <h1 className={styles.title}>My Winnings</h1>
      <p className={styles.subtitle}>Track your prizes and verification status.</p>

      <Card glow="gold" className={styles.totalCard}>
        <div className={styles.totalLabel}>Total Winnings</div>
        <div className={styles.totalAmount}>${totalWon.toFixed(2)}</div>
        <div className={styles.totalMeta}>{winnings.length} win{winnings.length !== 1 ? 's' : ''} total</div>
      </Card>

      {winnings.length === 0 ? (
        <Card className={styles.empty}>
          <div style={{ fontSize: 48 }}>🏆</div>
          <h3>No Winnings Yet</h3>
          <p>Keep entering your scores and participating in draws!</p>
        </Card>
      ) : (
        <Table columns={columns} data={winnings} />
      )}

      <Modal isOpen={!!showProof} onClose={() => setShowProof(null)} title="Upload Verification Proof" footer={
        <>
          <Button variant="ghost" onClick={() => setShowProof(null)}>Cancel</Button>
          <Button onClick={handleUploadProof} loading={saving}>Submit Proof</Button>
        </>
      }>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', fontSize: 'var(--fs-sm)' }}>
          Upload a screenshot of your scores from the golf platform for verification.
        </p>
        <Input label="Proof Image URL" placeholder="https://example.com/proof.png" value={proofUrl} onChange={e => setProofUrl(e.target.value)} />
      </Modal>
    </div>
  );
}
