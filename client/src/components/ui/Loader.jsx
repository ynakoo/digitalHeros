import styles from './Loader.module.css';

export default function Loader({ size = 'medium', fullPage = false }) {
  const classes = [
    styles.loaderWrap,
    size === 'small' && styles.small,
    size === 'large' && styles.large,
    fullPage && styles.fullPage
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className={styles.spinner} />
    </div>
  );
}
