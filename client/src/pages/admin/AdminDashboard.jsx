import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import api from '../../api/client';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/reports').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;

  const stats = [
    { label: 'Total Users', value: data?.totalUsers || 0, icon: '👥', color: 'purple' },
    { label: 'Active Subscribers', value: data?.activeSubscribers || 0, icon: '💳', color: 'teal' },
    { label: 'Total Prize Pool', value: `$${(data?.totalPrizePool || 0).toFixed(2)}`, icon: '💰', color: 'gold' },
    { label: 'Total Winnings', value: `$${(data?.totalWinnings || 0).toFixed(2)}`, icon: '🏆', color: 'gold' },
    { label: 'Total Paid Out', value: `$${(data?.totalPaid || 0).toFixed(2)}`, icon: '✅', color: 'teal' },
    { label: 'Charity Donations', value: `$${(data?.totalDonations || 0).toFixed(2)}`, icon: '💚', color: 'teal' },
    { label: 'Total Draws', value: data?.totalDraws || 0, icon: '🎱', color: 'purple' },
    { label: 'Published Draws', value: data?.publishedDraws || 0, icon: '📢', color: 'purple' },
  ];

  return (
    <div>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <p className={styles.subtitle}>Platform overview and key metrics.</p>

      <div className={styles.grid}>
        {stats.map((stat, i) => (
          <Card key={i} hoverable glow={stat.color} className={styles.statCard}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
