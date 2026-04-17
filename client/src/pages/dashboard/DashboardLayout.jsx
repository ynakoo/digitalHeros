import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import styles from './DashboardLayout.module.css';

const dashboardNav = [
  { label: 'Overview', path: '/dashboard', icon: '📊', exact: true },
  { label: 'My Scores', path: '/dashboard/scores', icon: '⛳' },
  { label: 'Draws', path: '/dashboard/draws', icon: '🎱' },
  { label: 'Winnings', path: '/dashboard/winnings', icon: '🏆' },
  { label: 'Profile', path: '/dashboard/profile', icon: '👤' },
];

export default function DashboardLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar items={dashboardNav} title="Dashboard" />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
