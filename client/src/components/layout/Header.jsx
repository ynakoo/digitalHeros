import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⛳</span>
          GolfGives
        </Link>

        <nav className={styles.nav}>
          <Link
            to="/charities"
            className={`${styles.navLink} ${isActive('/charities') ? styles.navLinkActive : ''}`}
          >
            Charities
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`${styles.navLink} ${location.pathname.startsWith('/dashboard') ? styles.navLinkActive : ''}`}
            >
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={`${styles.navLink} ${location.pathname.startsWith('/admin') ? styles.navLinkActive : ''}`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <div className={styles.avatarWrap}>
              <div
                className={styles.avatar}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {showDropdown && (
                <div className={styles.dropdown}>
                  <div style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{user?.full_name}</div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{user?.email}</div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                    Dashboard
                  </Link>
                  <Link to="/dashboard/profile" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <div className={styles.dropdownDivider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="small">Sign In</Button>
              </Link>
              <Link to="/subscribe">
                <Button variant="primary" size="small">Subscribe</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
