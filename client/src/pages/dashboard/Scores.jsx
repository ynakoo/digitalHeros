import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import styles from './Scores.module.css';

export default function Scores() {
  const { isSubscriber } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editScore, setEditScore] = useState(null);
  const [form, setForm] = useState({ score: '', played_date: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchScores = async () => {
    try {
      const { data } = await api.get('/api/scores');
      setScores(data.scores || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchScores(); }, []);

  const openAdd = () => { setEditScore(null); setForm({ score: '', played_date: '' }); setError(''); setShowForm(true); };
  const openEdit = (s) => { setEditScore(s); setForm({ score: s.score.toString(), played_date: s.played_date }); setError(''); setShowForm(true); };

  const handleSave = async () => {
    setError('');
    const scoreVal = parseInt(form.score);
    if (!scoreVal || scoreVal < 1 || scoreVal > 45) { setError('Score must be 1-45'); return; }
    if (!form.played_date) { setError('Date is required'); return; }

    setSaving(true);
    try {
      if (editScore) {
        await api.put(`/api/scores/${editScore.id}`, { score: scoreVal, played_date: form.played_date });
      } else {
        await api.post('/api/scores', { score: scoreVal, played_date: form.played_date });
      }
      setShowForm(false);
      fetchScores();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save score');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this score?')) return;
    try {
      await api.delete(`/api/scores/${id}`);
      fetchScores();
    } catch (err) { console.error(err); }
  };

  if (loading) return <Loader fullPage />;

  if (!isSubscriber) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Subscription Required</h2>
        <p style={{ margin: '16px 0', color: 'var(--text-muted)' }}>You must have an active subscription to submit scores and participate in monthly draws.</p>
        <Link to="/subscribe"><Button variant="primary">Upgrade Plan</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Scores</h1>
          <p className={styles.subtitle}>Enter your latest Stableford scores (1-45). Only your last 5 are kept.</p>
        </div>
        <Button onClick={openAdd} disabled={scores.length >= 5}>
          {scores.length >= 5 ? 'Max 5 — New replaces oldest' : '+ Add Score'}
        </Button>
        {scores.length >= 5 && <Button onClick={openAdd} variant="outline" size="small">Add New (replaces oldest)</Button>}
      </div>

      {scores.length === 0 ? (
        <Card className={styles.empty}>
          <div className={styles.emptyIcon}>⛳</div>
          <h3>No Scores Yet</h3>
          <p>Enter your first golf score to participate in monthly draws.</p>
          <Button onClick={openAdd}>Enter Score</Button>
        </Card>
      ) : (
        <div className={styles.scoreGrid}>
          {scores.map((s, i) => (
            <Card key={s.id} hoverable glow={i === 0 ? 'teal' : ''} className={styles.scoreCard}>
              {i === 0 && <span className={styles.latestBadge}>Latest</span>}
              <div className={styles.scoreValue}>{s.score}</div>
              <div className={styles.scoreLabel}>Stableford Points</div>
              <div className={styles.scoreDate}>{new Date(s.played_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div className={styles.scoreActions}>
                <Button variant="ghost" size="small" onClick={() => openEdit(s)}>Edit</Button>
                <Button variant="ghost" size="small" onClick={() => handleDelete(s.id)} style={{ color: 'var(--danger)' }}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className={styles.infoCard}>
        <h3>📋 Score Rules</h3>
        <ul className={styles.rulesList}>
          <li>Scores must be in Stableford format (1-45)</li>
          <li>Only one score per date is allowed</li>
          <li>Maximum 5 scores are retained at any time</li>
          <li>Adding a 6th score removes your oldest entry</li>
          <li>Your 5 scores serve as your draw numbers each month</li>
        </ul>
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editScore ? 'Edit Score' : 'Add Score'} footer={
        <>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editScore ? 'Update' : 'Save'}</Button>
        </>
      }>
        {error && <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', fontSize: 'var(--fs-sm)' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <Input label="Score (1-45)" type="number" min="1" max="45" placeholder="36" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} />
          <Input label="Date Played" type="date" value={form.played_date} onChange={e => setForm({ ...form, played_date: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
