import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import api from '../../api/client';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/summary')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;

  const subStatusMap = {
    active: 'success', cancelled: 'danger', lapsed: 'warning', none: 'neutral'
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Welcome back, {user?.full_name?.split(' ')[0]} 👋</h1>
      <p className={styles.pageSubtitle}>Here's your GolfGives overview</p>

      <div className={styles.statsGrid}>
        {/* Subscription */}
        <Card glow="purple" className={styles.statCard}>
          <div className={styles.statIcon}>💳</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Subscription</span>
            <Badge variant={subStatusMap[data?.subscription?.status] || 'neutral'}>
              {data?.subscription?.status || 'None'}
            </Badge>
          </div>
          {data?.subscription?.plan && (
            <div className={styles.statMeta}>{data.subscription.plan} plan</div>
          )}
          {data?.subscription?.end && (
            <div className={styles.statMeta}>Renews: {new Date(data.subscription.end).toLocaleDateString()}</div>
          )}
        </Card>

        {/* Scores */}
        <Card glow="teal" className={styles.statCard}>
          <div className={styles.statIcon}>⛳</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>My Scores</span>
            <span className={styles.statValue}>{data?.scores?.length || 0} / 5</span>
          </div>
          {data?.scores?.[0] && (
            <div className={styles.statMeta}>Latest: {data.scores[0].score} pts</div>
          )}
          <Link to="/dashboard/scores"><Button variant="ghost" size="small">Manage Scores →</Button></Link>
        </Card>

        {/* Winnings */}
        <Card glow="gold" className={styles.statCard}>
          <div className={styles.statIcon}>🏆</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Winnings</span>
            <span className={styles.statValue}>${data?.winnings?.totalWon?.toFixed(2) || '0.00'}</span>
          </div>
          <div className={styles.statMeta}>{data?.winnings?.records?.length || 0} wins</div>
        </Card>

        {/* Charity */}
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>💚</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>My Charity</span>
            <span className={styles.statValue} style={{ fontSize: 'var(--fs-sm)' }}>
              {data?.charity?.name || 'Not selected'}
            </span>
          </div>
          <div className={styles.statMeta}>{data?.charity?.percentage || 10}% contribution</div>
          <Link to="/dashboard/profile"><Button variant="ghost" size="small">Change →</Button></Link>
        </Card>
      </div>

      {/* Recent Scores */}
      <Card className={styles.sectionCard}>
        <CardHeader title="Recent Scores" action={
          <Link to="/dashboard/scores"><Button variant="ghost" size="small">View All</Button></Link>
        } />
        {data?.scores?.length > 0 ? (
          <div className={styles.scoresList}>
            {data.scores.map((s, i) => (
              <div key={s.id || i} className={styles.scoreItem}>
                <div className={styles.scoreValue}>{s.score}</div>
                <div className={styles.scoreDate}>{new Date(s.played_date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyText}>No scores yet. <Link to="/dashboard/scores">Enter your first score</Link></p>
        )}
      </Card>

      {/* Recent Draws */}
      <Card className={styles.sectionCard}>
        <CardHeader title="Recent Draws" action={
          <Link to="/dashboard/draws"><Button variant="ghost" size="small">View All</Button></Link>
        } />
        {data?.draws?.recent?.length > 0 ? (
          <div className={styles.drawsList}>
            {data.draws.recent.map((d, i) => (
              <div key={d.id || i} className={styles.drawItem}>
                <div className={styles.drawDate}>{new Date(d.draw_date).toLocaleDateString()}</div>
                <Badge variant={d.status === 'published' ? 'success' : 'neutral'}>{d.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyText}>No draws yet.</p>
        )}
      </Card>
    </div>
  );
}
