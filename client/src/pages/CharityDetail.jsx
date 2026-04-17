import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import api from '../api/client';
import styles from './CharityDetail.module.css';

export default function CharityDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDonate, setShowDonate] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [donating, setDonating] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/api/charities/${id}`).then(r => setCharity(r.data.charity)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleDonate = async () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0) return;
    setDonating(true);
    try {
      await api.post('/api/donations', { charity_id: id, amount: parseFloat(donateAmount) });
      setMsg('Donation recorded successfully!');
      setShowDonate(false);
      setDonateAmount('');
    } catch (err) {
      setMsg('Failed to record donation.');
    } finally {
      setDonating(false);
    }
  };

  if (loading) return <div className={styles.page}><Loader fullPage /></div>;
  if (!charity) return <div className={styles.page}><div className={styles.container}><p>Charity not found.</p></div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/charities" className={styles.back}>← Back to Charities</Link>

        <div className={styles.heroSection}>
          <img src={charity.image_url} alt={charity.name} className={styles.heroImage} />
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              {charity.is_featured && <Badge variant="purple">Featured</Badge>}
              <h1 className={styles.heroTitle}>{charity.name}</h1>
            </div>
          </div>
        </div>

        {msg && <div style={{ padding: '12px 16px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)', border: '1px solid rgba(0,184,148,0.3)' }}>{msg}</div>}

        <div className={styles.grid}>
          <Card className={styles.mainCard}>
            <h2 className={styles.sectionTitle}>About</h2>
            <p className={styles.description}>{charity.description}</p>

            {charity.events && charity.events.length > 0 && (
              <>
                <h3 className={styles.sectionTitle} style={{ marginTop: 'var(--space-xl)' }}>Upcoming Events</h3>
                <div className={styles.events}>
                  {charity.events.map((ev, i) => (
                    <Card key={i} className={styles.eventCard}>
                      <h4>{ev.title}</h4>
                      <p className={styles.eventDate}>{ev.date}</p>
                      <p className={styles.eventDesc}>{ev.description}</p>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </Card>

          <div className={styles.sidebar}>
            <Card glow="teal">
              <h3 className={styles.sidebarTitle}>Support This Charity</h3>
              <p className={styles.sidebarText}>
                Make an independent donation or select this charity in your profile settings.
              </p>
              {isAuthenticated ? (
                <Button variant="secondary" fullWidth onClick={() => setShowDonate(true)}>
                  Donate Now
                </Button>
              ) : (
                <Link to="/signup"><Button variant="secondary" fullWidth>Sign Up to Donate</Button></Link>
              )}
            </Card>

            {charity.website_url && (
              <Card style={{ marginTop: 'var(--space-lg)' }}>
                <h3 className={styles.sidebarTitle}>Website</h3>
                <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                  {charity.website_url} →
                </a>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showDonate} onClose={() => setShowDonate(false)} title="Make a Donation" footer={
        <>
          <Button variant="ghost" onClick={() => setShowDonate(false)}>Cancel</Button>
          <Button variant="secondary" onClick={handleDonate} loading={donating}>Donate</Button>
        </>
      }>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
          Enter the amount you'd like to donate to <strong>{charity.name}</strong>.
        </p>
        <Input label="Amount ($)" type="number" min="1" step="0.01" placeholder="25.00" value={donateAmount} onChange={e => setDonateAmount(e.target.value)} />
      </Modal>
    </div>
  );
}
