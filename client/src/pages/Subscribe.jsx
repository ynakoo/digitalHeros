import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import api from '../api/client';
import styles from './Subscribe.module.css';

// Utility to load script
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Subscribe() {
  const { user, isAuthenticated, isSubscriber, refreshUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => {
    api.get('/api/subscriptions/plans').then(r => setPlans(r.data.plans || [])).catch(() => {});
  }, []);

  const handleSubscription = async (planId) => {
    setLoadingPlan(planId);
    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert('Razorpay SDK failed to load. Are you offline?');
        setLoadingPlan(null);
        return;
      }

      // Create subscription order via backend
      const { data } = await api.post('/api/subscriptions/razorpay/create-order', { planId });

      if (!data || !data.order_id) {
        alert('Failed to initialize subscription');
        setLoadingPlan(null);
        return;
      }

      // Fetch generic publishable key from backend
      const { data: keyData } = await api.get('/api/subscriptions/razorpay/key');

      const options = {
        key: keyData.key,
        order_id: data.order_id,
        name: 'Digital Heroes',
        description: `Subscription for ${planId} plan`,
        handler: async function (response) {
          try {
            await api.post('/api/subscriptions/razorpay/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planId
            });
            await refreshUser();
            alert('Subscription successful! Welcome to the premium club.');
          } catch (err) {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.full_name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#6c5ce7'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function (response) {
        alert('Payment failed. ' + response.error.description);
      });
    } catch (err) {
      console.error(err);
      alert('An error occurred during checkout setup.');
    } finally {
      setLoadingPlan(null);
    }
  };

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
            { id: 'monthly', name: 'Monthly', price: 999, interval: 'month', features: ['Enter golf scores', 'Monthly draw participation', 'Charity contribution (10%+)', 'Full dashboard access', 'Winner payouts'] },
            { id: 'yearly', name: 'Yearly', price: 9999, interval: 'year', savings: '17%', features: ['All Monthly features', '2 months free', 'Priority support', 'Early draw results access'] }
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
                ₹{plan.price}
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
                  disabled={isSubscriber || loadingPlan === plan.id}
                  onClick={() => handleSubscription(plan.id)}
                >
                  {isSubscriber ? 'Current Plan' : (loadingPlan === plan.id ? 'Loading...' : `Subscribe ${plan.name}`)}
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
      </div>
    </div>
  );
}
