import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import api from '../../api/client';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/reports').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;

  // Simple CSS bar chart helper
  const BarChart = ({ items, maxValue, color = 'var(--accent-primary)' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {items.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: 4 }}>
            <span>{item.label}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.display || item.value}</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-glass)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((item.value / maxValue) * 100, 100)}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );

  const userItems = [
    { label: 'Total Users', value: data?.totalUsers || 0 },
    { label: 'Active Subscribers', value: data?.activeSubscribers || 0 },
  ];

  const financeItems = [
    { label: 'Total Prize Pool', value: data?.totalPrizePool || 0, display: `$${(data?.totalPrizePool || 0).toFixed(2)}` },
    { label: 'Total Winnings', value: data?.totalWinnings || 0, display: `$${(data?.totalWinnings || 0).toFixed(2)}` },
    { label: 'Paid Out', value: data?.totalPaid || 0, display: `$${(data?.totalPaid || 0).toFixed(2)}` },
  ];

  const charityItems = [
    { label: 'Direct Donations', value: data?.totalDonations || 0, display: `$${(data?.totalDonations || 0).toFixed(2)}` },
    { label: 'Est. Sub Contributions', value: data?.estimatedCharityContributions || 0, display: `$${(data?.estimatedCharityContributions || 0).toFixed(2)}` },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 4 }}>Reports & Analytics</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-2xl)' }}>Platform metrics and financial overview.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-xl)' }}>
        <Card>
          <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-xl)' }}>👥 Users</h3>
          <BarChart items={userItems} maxValue={Math.max(data?.totalUsers || 1, 1)} color="var(--accent-primary)" />
          <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Subscription Rate: </span>
            <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
              {data?.totalUsers ? ((data.activeSubscribers / data.totalUsers) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-xl)' }}>💰 Prize Pool</h3>
          <BarChart items={financeItems} maxValue={Math.max(data?.totalPrizePool || 1, 1)} color="var(--accent-warm)" />
        </Card>

        <Card>
          <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-xl)' }}>💚 Charity Contributions</h3>
          <BarChart items={charityItems} maxValue={Math.max(data?.estimatedCharityContributions || 1, 1)} color="var(--accent-secondary)" />
        </Card>

        <Card>
          <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-xl)' }}>🎱 Draws</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>Total Draws</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--fs-2xl)', fontWeight: 700 }}>{data?.totalDraws || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>Published</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--success)' }}>{data?.publishedDraws || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>Pending</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--accent-warm)' }}>{(data?.totalDraws || 0) - (data?.publishedDraws || 0)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
