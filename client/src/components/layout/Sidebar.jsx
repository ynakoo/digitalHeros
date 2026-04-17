import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

export default function Sidebar({ items, title }) {
  return (
    <aside className={styles.sidebar}>
      {title && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{title}</div>
        </div>
      )}
      <nav className={styles.navList}>
        {items.map((item, i) => (
          item.divider ? (
            <div key={i} className={styles.section}>
              <div className={styles.sectionTitle}>{item.label}</div>
            </div>
          ) : (
            <NavLink
              key={i}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          )
        ))}
      </nav>
    </aside>
  );
}
