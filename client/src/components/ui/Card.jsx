import styles from './Card.module.css';

export default function Card({
  children,
  hoverable = false,
  glow = '',
  noPadding = false,
  className = '',
  onClick,
  ...props
}) {
  const classes = [
    styles.card,
    hoverable && styles.hoverable,
    glow === 'purple' && styles.glowPurple,
    glow === 'teal' && styles.glowTeal,
    glow === 'gold' && styles.glowGold,
    noPadding && styles.noPadding,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, title, action }) {
  return (
    <div className={styles.cardHeader}>
      {title ? <h3 className={styles.cardTitle}>{title}</h3> : children}
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`${styles.cardBody} ${className}`}>{children}</div>;
}
