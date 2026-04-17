import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const classes = [
    styles.btn,
    styles[variant],
    size === 'small' && styles.small,
    size === 'large' && styles.large,
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}
