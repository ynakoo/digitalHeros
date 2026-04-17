import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import styles from '../dashboard/DashboardLayout.module.css';

const adminNav = [
  { label: 'Overview', path: '/admin', icon: '📊', exact: true },
  { divider: true, label: 'Management' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Draws', path: '/admin/draws', icon: '🎱' },
  { label: 'Charities', path: '/admin/charities', icon: '💚' },
  { label: 'Winners', path: '/admin/winners', icon: '🏆' },
  { divider: true, label: 'Analytics' },
  { label: 'Reports', path: '/admin/reports', icon: '📈' },
];

export default function AdminLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar items={adminNav} title="Admin Panel" />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
