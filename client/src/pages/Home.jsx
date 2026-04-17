import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import api from '../api/client';
import styles from './Home.module.css';

function AnimatedCounter({ target, duration = 2000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const [charities, setCharities] = useState([]);

  useEffect(() => {
    api.get('/api/charities?featured=true').then(r => setCharities(r.data.charities || [])).catch(() => {});
  }, []);

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>🏆 Play. Win. Give Back.</span>
          <h1 className={styles.heroTitle}>
            Your Golf Scores<br />
            <span className={styles.gradientText}>Change Lives</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Subscribe, enter your Stableford scores, and participate in monthly prize draws —
            while a portion of every subscription supports the charity you choose.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/subscribe">
              <Button variant="primary" size="large">Get Started — $9.99/mo</Button>
            </Link>
            <Link to="/charities">
              <Button variant="outline" size="large">Explore Charities</Button>
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.statValue}><AnimatedCounter target={1250} prefix="" /></div>
              <div className={styles.statLabel}>Active Players</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statValue}><AnimatedCounter target={48500} prefix="$" /></div>
              <div className={styles.statLabel}>Donated to Charity</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statValue}><AnimatedCounter target={32000} prefix="$" /></div>
              <div className={styles.statLabel}>Prize Pool</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How It <span className={styles.gradientText}>Works</span></h2>
          <p className={styles.sectionSubtitle}>Three simple steps to play, win, and make a difference</p>
          <div className={styles.stepsGrid}>
            {[
              { icon: '📝', title: 'Subscribe', desc: 'Choose a monthly or yearly plan. Pick a charity to support with your subscription.' },
              { icon: '⛳', title: 'Enter Scores', desc: 'Submit your latest 5 Stableford scores. They become your draw numbers for the month.' },
              { icon: '🏆', title: 'Win & Give', desc: 'Monthly draws match your scores against winning numbers. Win prizes while your charity benefits.' }
            ].map((step, i) => (
              <Card key={i} hoverable glow="purple" className={styles.stepCard}>
                <div className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Pool */}
      <section className={styles.section} style={{ background: 'var(--bg-secondary)' }}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Current <span className={styles.gradientTextGold}>Prize Pool</span></h2>
          <div className={styles.poolGrid}>
            {[
              { match: '5-Number Match', share: '40%', amount: '$12,800', rollover: true, color: 'gold' },
              { match: '4-Number Match', share: '35%', amount: '$11,200', rollover: false, color: 'purple' },
              { match: '3-Number Match', share: '25%', amount: '$8,000', rollover: false, color: 'teal' }
            ].map((tier, i) => (
              <Card key={i} hoverable glow={tier.color} className={styles.poolCard}>
                <div className={styles.poolMatch}>{tier.match}</div>
                <div className={styles.poolAmount}>{tier.amount}</div>
                <div className={styles.poolShare}>{tier.share} of pool</div>
                {tier.rollover && <span className={styles.jackpotBadge}>🎰 Jackpot — Rolls Over!</span>}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Charities */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Featured <span className={styles.gradientTextTeal}>Charities</span></h2>
          <p className={styles.sectionSubtitle}>Your subscription directly supports these incredible causes</p>
          <div className={styles.charitiesGrid}>
            {(charities.length > 0 ? charities : [
              { id: 1, name: 'Golf for Good Foundation', description: 'Introducing underserved youth to golf and life skills.', image_url: 'https://placehold.co/400x250/1a1a27/6c5ce7?text=Golf+for+Good' },
              { id: 2, name: 'Green Fairways Trust', description: 'Environmental conservation through sustainable golf courses.', image_url: 'https://placehold.co/400x250/1a1a27/00cec9?text=Green+Fairways' },
              { id: 3, name: 'Swing for Hope', description: 'Mental health support programs for athletes and communities.', image_url: 'https://placehold.co/400x250/1a1a27/fdcb6e?text=Swing+for+Hope' }
            ]).slice(0, 3).map((charity) => (
              <Card key={charity.id} hoverable glow="teal" className={styles.charityCard}>
                <img
                  src={charity.image_url}
                  alt={charity.name}
                  className={styles.charityImage}
                />
                <div className={styles.charityContent}>
                  <h3 className={styles.charityName}>{charity.name}</h3>
                  <p className={styles.charityDesc}>{charity.description}</p>
                </div>
              </Card>
            ))}
          </div>
          <div className={styles.centerCta}>
            <Link to="/charities">
              <Button variant="outline">View All Charities →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.section} style={{ background: 'var(--bg-secondary)' }}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Simple, Transparent <span className={styles.gradientText}>Pricing</span></h2>
          <p className={styles.sectionSubtitle}>Choose the plan that works for you</p>
          <div className={styles.pricingGrid}>
            <Card hoverable glow="purple" className={styles.pricingCard}>
              <div className={styles.planName}>Monthly</div>
              <div className={styles.planPrice}>$9.99<span className={styles.planPeriod}>/month</span></div>
              <ul className={styles.planFeatures}>
                <li>✓ Enter golf scores</li>
                <li>✓ Monthly draw participation</li>
                <li>✓ Charity contribution (10%+)</li>
                <li>✓ Full dashboard access</li>
                <li>✓ Winner payouts</li>
              </ul>
              <Link to="/subscribe"><Button variant="primary" fullWidth>Subscribe Monthly</Button></Link>
            </Card>
            <Card hoverable glow="gold" className={`${styles.pricingCard} ${styles.pricingFeatured}`}>
              <div className={styles.popularBadge}>Best Value</div>
              <div className={styles.planName}>Yearly</div>
              <div className={styles.planPrice}>$99.99<span className={styles.planPeriod}>/year</span></div>
              <div className={styles.planSaving}>Save 17% — 2 months free!</div>
              <ul className={styles.planFeatures}>
                <li>✓ Everything in Monthly</li>
                <li>✓ 2 months free</li>
                <li>✓ Priority support</li>
                <li>✓ Early draw results</li>
              </ul>
              <Link to="/subscribe"><Button variant="secondary" fullWidth>Subscribe Yearly</Button></Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to Make a <span className={styles.gradientTextTeal}>Difference</span>?</h2>
          <p className={styles.ctaSubtitle}>Join thousands of golfers who play with purpose.</p>
          <Link to="/signup">
            <Button variant="primary" size="large">Create Your Account</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
