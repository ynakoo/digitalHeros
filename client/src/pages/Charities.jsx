import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import api from '../api/client';
import styles from './Charities.module.css';

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = searchTerm ? `?search=${searchTerm}` : '';
      const { data } = await api.get(`/api/charities${params}`);
      setCharities(data.charities || []);
    } catch (err) {
      console.error('Failed to fetch charities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    clearTimeout(window._charitySearchTimeout);
    window._charitySearchTimeout = setTimeout(() => {
      fetchCharities(e.target.value);
    }, 300);
  };

  const featured = charities.filter(c => c.is_featured);
  const regular = charities.filter(c => !c.is_featured);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Our <span className={styles.gradientText}>Charities</span></h1>
          <p className={styles.subtitle}>
            Every subscription directly supports these incredible organizations.
            Choose one that resonates with you.
          </p>
          <div className={styles.searchWrap}>
            <Input
              placeholder="Search charities..."
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>

        {loading ? <Loader fullPage /> : (
          <>
            {featured.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>✨ Featured Charities</h2>
                <div className={styles.featuredGrid}>
                  {featured.map(charity => (
                    <Link to={`/charities/${charity.id}`} key={charity.id} className={styles.cardLink}>
                      <Card hoverable glow="teal" className={styles.featuredCard}>
                        <img src={charity.image_url} alt={charity.name} className={styles.featuredImage} />
                        <div className={styles.featuredContent}>
                          <h3 className={styles.charityName}>{charity.name}</h3>
                          <p className={styles.charityDesc}>{charity.description}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>All Charities</h2>
              {regular.length === 0 && featured.length === 0 ? (
                <div className={styles.empty}>
                  <p>No charities found{search ? ` for "${search}"` : ''}.</p>
                </div>
              ) : (
                <div className={styles.grid}>
                  {(regular.length > 0 ? regular : charities).map(charity => (
                    <Link to={`/charities/${charity.id}`} key={charity.id} className={styles.cardLink}>
                      <Card hoverable className={styles.charityCard}>
                        <img src={charity.image_url} alt={charity.name} className={styles.charityImage} />
                        <div className={styles.charityContent}>
                          <h3 className={styles.charityName}>{charity.name}</h3>
                          <p className={styles.charityDesc}>
                            {charity.description?.substring(0, 120)}{charity.description?.length > 120 ? '...' : ''}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
