import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import styles from './Draws.module.css';

export default function Draws() {
  const { isSubscriber } = useAuth();
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [drawDetail, setDrawDetail] = useState(null);

  useEffect(() => {
    api.get('/api/draws').then(r => setDraws(r.data.draws || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const viewDraw = async (draw) => {
    setSelected(draw.id);
    try {
      const { data } = await api.get(`/api/draws/${draw.id}`);
      setDrawDetail(data);
    } catch (err) { console.error(err); }
  };

  if (loading) return <Loader fullPage />;

  if (!isSubscriber) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Subscription Required</h2>
        <p style={{ margin: '16px 0', color: 'var(--text-muted)' }}>You must have an active subscription to view draw results and check if you've won.</p>
        <Link to="/subscribe"><Button variant="primary">Upgrade Plan</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Draw Results</h1>
      <p className={styles.subtitle}>View published monthly draw results and your match history.</p>

      {draws.length === 0 ? (
        <Card className={styles.empty}>
          <div style={{ fontSize: 48 }}>🎱</div>
          <h3>No Draws Yet</h3>
          <p>Monthly draws will appear here once published by the admin.</p>
        </Card>
      ) : (
        <div className={styles.grid}>
          <div className={styles.drawList}>
            {draws.map(draw => (
              <Card
                key={draw.id}
                hoverable
                className={`${styles.drawItem} ${selected === draw.id ? styles.drawItemActive : ''}`}
                onClick={() => viewDraw(draw)}
              >
                <div className={styles.drawHeader}>
                  <span className={styles.drawDate}>
                    {new Date(draw.draw_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Badge variant="success">Published</Badge>
                </div>
                <div className={styles.numbers}>
                  {draw.winning_numbers?.map((n, i) => (
                    <span key={i} className={styles.number}>{n}</span>
                  ))}
                </div>
                <div className={styles.drawMeta}>
                  <span>Pool: ${parseFloat(draw.total_pool_amount || 0).toFixed(2)}</span>
                  <span>{draw.active_subscribers} participants</span>
                </div>
              </Card>
            ))}
          </div>

          <div className={styles.detailPanel}>
            {drawDetail ? (
              <Card>
                <h2 className={styles.detailTitle}>
                  Draw — {new Date(drawDetail.draw.draw_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>

                <div className={styles.winningNumbers}>
                  <span className={styles.wnLabel}>Winning Numbers</span>
                  <div className={styles.numbers} style={{ justifyContent: 'center' }}>
                    {drawDetail.draw.winning_numbers?.map((n, i) => (
                      <span key={i} className={`${styles.number} ${styles.numberLarge}`}>{n}</span>
                    ))}
                  </div>
                </div>

                {drawDetail.prizePool && (
                  <div className={styles.poolBreakdown}>
                    <h3>Prize Pool Breakdown</h3>
                    <div className={styles.poolTiers}>
                      <div className={styles.tier}><span>5-Match</span><span className={styles.tierAmount}>${parseFloat(drawDetail.prizePool.match_5_pool || 0).toFixed(2)}</span></div>
                      <div className={styles.tier}><span>4-Match</span><span className={styles.tierAmount}>${parseFloat(drawDetail.prizePool.match_4_pool || 0).toFixed(2)}</span></div>
                      <div className={styles.tier}><span>3-Match</span><span className={styles.tierAmount}>${parseFloat(drawDetail.prizePool.match_3_pool || 0).toFixed(2)}</span></div>
                    </div>
                  </div>
                )}

                <div className={styles.winnersList}>
                  <h3>Winners ({drawDetail.winners?.length || 0})</h3>
                  {drawDetail.winners?.length > 0 ? drawDetail.winners.map((w, i) => (
                    <div key={i} className={styles.winnerItem}>
                      <div>
                        <span className={styles.winnerName}>{w.profiles?.full_name || 'User'}</span>
                        <Badge variant={w.match_type === 'match_5' ? 'warning' : w.match_type === 'match_4' ? 'purple' : 'info'} style={{ marginLeft: 8 }}>
                          {w.match_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className={styles.winnerPrize}>${parseFloat(w.prize_amount).toFixed(2)}</span>
                    </div>
                  )) : (
                    <p className={styles.noWinners}>No winners for this draw.</p>
                  )}
                </div>
              </Card>
            ) : (
              <Card className={styles.selectPrompt}>
                <p>← Select a draw to view details</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
