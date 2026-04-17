import styles from './Input.module.css';

export default function Input({
  label,
  type = 'text',
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`${styles.formGroup} ${error ? styles.error : ''} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      {type === 'textarea' ? (
        <textarea className={`${styles.input} ${styles.textarea}`} {...props} />
      ) : type === 'select' ? (
        <select className={`${styles.input} ${styles.select}`} {...props} />
      ) : (
        <input type={type} className={styles.input} {...props} />
      )}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
