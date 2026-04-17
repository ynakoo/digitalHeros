import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import api from '../../api/client';

export default function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [drawType, setDrawType] = useState('random');
  const [simResult, setSimResult] = useState(null);
  const [showSim, setShowSim] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchDraws = () => {
    api.get('/api/admin/draws').then(r => setDraws(r.data.draws || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDraws(); }, []);

  const createDraw = async () => {
    setCreating(true); setMsg('');
    try {
      await api.post('/api/draws', { draw_type: drawType });
      setMsg('Draw created successfully!');
      fetchDraws();
    } catch (err) { setMsg(err.response?.data?.error || 'Failed to create draw.'); }
    finally { setCreating(false); }
  };

  const simulateDraw = async (id) => {
    try {
      const { data } = await api.post(`/api/draws/${id}/simulate`);
      setSimResult(data);
      setShowSim(true);
    } catch (err) { setMsg('Simulation failed.'); }
  };

  const publishDraw = async (id) => {
    if (!confirm('Publish this draw? This will finalize results and assign prizes.')) return;
    try {
      await api.post(`/api/draws/${id}/publish`);
      setMsg('Draw published successfully!');
      fetchDraws();
      setShowSim(false);
    } catch (err) { setMsg(err.response?.data?.error || 'Publish failed.'); }
  };

  if (loading) return <Loader fullPage />;

  const statusColor = { pending: 'warning', simulated: 'info', published: 'success' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2xl)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 4 }}>Draw Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>Create, simulate, and publish monthly draws.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          <Input type="select" value={drawType} onChange={e => setDrawType(e.target.value)} style={{ width: 160 }}>
            <option value="random">Random</option>
            <option value="algorithmic">Algorithmic</option>
          </Input>
          <Button onClick={createDraw} loading={creating}>+ New Draw</Button>
        </div>
      </div>

      {msg && <div style={{ padding: '12px 16px', background: msg.includes('success') ? 'var(--success-bg)' : 'var(--danger-bg)', color: msg.includes('success') ? 'var(--success)' : 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)', fontSize: 'var(--fs-sm)' }}>{msg}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {draws.map(draw => (
          <Card key={draw.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{new Date(draw.draw_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <Badge variant={statusColor[draw.status]}>{draw.status}</Badge>
                  <Badge variant="neutral">{draw.draw_type}</Badge>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {draw.winning_numbers?.map((n, i) => (
                    <span key={i} style={{ padding: '4px 10px', background: 'var(--bg-glass-strong)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{n}</span>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                  Pool: ${parseFloat(draw.total_pool_amount || 0).toFixed(2)} · {draw.active_subscribers} subscribers
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                {draw.status !== 'published' && (
                  <>
                    <Button variant="outline" size="small" onClick={() => simulateDraw(draw.id)}>Simulate</Button>
                    <Button variant="primary" size="small" onClick={() => publishDraw(draw.id)}>Publish</Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
        {draws.length === 0 && (
          <Card style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No draws yet. Create one above.</p>
          </Card>
        )}
      </div>

      <Modal isOpen={showSim} onClose={() => setShowSim(false)} title="Simulation Results" footer={
        <Button onClick={() => simResult && publishDraw(simResult.draw?.id)}>Publish This Draw</Button>
      }>
        {simResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 8 }}>Winning Numbers</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {simResult.winningNumbers?.map((n, i) => (
                  <span key={i} style={{ padding: '6px 12px', background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', fontWeight: 700 }}>{n}</span>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
              Total Participants: {simResult.totalParticipants}
            </div>
            <div>
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: 8 }}>Winners Preview</div>
              {simResult.prizeBreakdown?.length > 0 ? simResult.prizeBreakdown.map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', marginBottom: 4, fontSize: 'var(--fs-sm)' }}>
                  <Badge variant="purple">{w.match_type?.replace('_', ' ')}</Badge>
                  <span style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>${w.prize_amount?.toFixed(2)}</span>
                </div>
              )) : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>No winners in this simulation.</p>}
            </div>
            {simResult.newJackpotRollover > 0 && (
              <div style={{ padding: '10px 14px', background: 'var(--warning-bg)', borderRadius: 'var(--radius-md)', fontSize: 'var(--fs-sm)', color: 'var(--accent-warm)' }}>
                🎰 Jackpot rollover: ${simResult.newJackpotRollover.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
