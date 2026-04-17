import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import api from '../api/client';
import styles from './Subscribe.module.css';

export default function Subscribe() {
  const { user, isAuthenticated, isSubscriber } = useAuth();
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api.get('/api/subscriptions/plans').then(r => setPlans(r.data.plans || [])).catch(() => {});
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Choose Your <span className={styles.gradientText}>Plan</span></h1>
          <p className={styles.subtitle}>
            Subscribe to enter monthly draws, track your scores, and support charities you love.
          </p>
          {isSubscriber && (
            <Badge variant="success">You have an active subscription</Badge>
          )}
        </div>

        <div className={styles.grid}>
          {(plans.length > 0 ? plans : [
            { id: 'monthly', name: 'Monthly', price: 9.99, interval: 'month', features: ['Enter golf scores', 'Monthly draw participation', 'Charity contribution (10%+)', 'Full dashboard access', 'Winner payouts'] },
            { id: 'yearly', name: 'Yearly', price: 99.99, interval: 'year', savings: '17%', features: ['All Monthly features', '2 months free', 'Priority support', 'Early draw results access'] }
          ]).map((plan) => (
            <Card
              key={plan.id}
              hoverable
              glow={plan.id === 'yearly' ? 'gold' : 'purple'}
              className={`${styles.planCard} ${plan.id === 'yearly' ? styles.featured : ''}`}
            >
              {plan.id === 'yearly' && <div className={styles.badge}>Best Value</div>}
              <div className={styles.planName}>{plan.name}</div>
              <div className={styles.price}>
                ${plan.price}
                <span className={styles.period}>/{plan.interval}</span>
              </div>
              {plan.savings && <div className={styles.saving}>Save {plan.savings} — 2 months free!</div>}
              <ul className={styles.features}>
                {plan.features.map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
              </ul>
              {isAuthenticated ? (
                <Button
                  variant={plan.id === 'yearly' ? 'secondary' : 'primary'}
                  fullWidth
                  disabled={isSubscriber}
                >
                  {isSubscriber ? 'Current Plan' : `Subscribe ${plan.name}`}
                </Button>
              ) : (
                <Link to="/signup" style={{ width: '100%' }}>
                  <Button variant={plan.id === 'yearly' ? 'secondary' : 'primary'} fullWidth>
                    Get Started
                  </Button>
                </Link>
              )}
            </Card>
          ))}
        </div>

        <p className={styles.note}>
          Subscription activation is managed by administrators. After signing up, your subscription
          will be activated by the admin team.
        </p>
      </div>
    </div>
  );
}
