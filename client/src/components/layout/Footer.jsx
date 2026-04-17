import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>⛳ GolfGives</div>
            <p className={styles.tagline}>
              Play golf. Win prizes. Change lives. A platform where your passion
              for golf directly supports charities that matter.
            </p>
          </div>

          <div>
            <h4 className={styles.colTitle}>Platform</h4>
            <div className={styles.links}>
              <Link to="/subscribe" className={styles.link}>Subscribe</Link>
              <Link to="/charities" className={styles.link}>Charities</Link>
              <Link to="/dashboard" className={styles.link}>Dashboard</Link>
            </div>
          </div>

          <div>
            <h4 className={styles.colTitle}>How It Works</h4>
            <div className={styles.links}>
              <span className={styles.link}>Score Entry</span>
              <span className={styles.link}>Monthly Draws</span>
              <span className={styles.link}>Prize Pool</span>
            </div>
          </div>

          <div>
            <h4 className={styles.colTitle}>Legal</h4>
            <div className={styles.links}>
              <span className={styles.link}>Privacy Policy</span>
              <span className={styles.link}>Terms of Service</span>
              <span className={styles.link}>Contact</span>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} GolfGives. All rights reserved.</span>
          <span>Made with ❤️ for charity</span>
        </div>
      </div>
    </footer>
  );
}
