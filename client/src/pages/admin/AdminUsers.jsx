import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import api from '../../api/client';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async (s = '') => {
    setLoading(true);
    try {
      const params = s ? `?search=${s}` : '';
      const { data } = await api.get(`/api/admin/users${params}`);
      setUsers(data.users || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    clearTimeout(window._userSearchTimeout);
    window._userSearchTimeout = setTimeout(() => fetchUsers(e.target.value), 300);
  };

  const subColor = { active: 'success', cancelled: 'danger', lapsed: 'warning', none: 'neutral' };

  const columns = [
    { header: 'Name', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', render: (r) => <Badge variant={r.role === 'admin' ? 'purple' : 'neutral'}>{r.role}</Badge> },
    { header: 'Subscription', render: (r) => <Badge variant={subColor[r.subscription_status] || 'neutral'}>{r.subscription_status || 'none'}</Badge> },
    { header: 'Plan', render: (r) => r.subscription_plan || '—' },
    { header: 'Charity', render: (r) => r.charities?.name || '—' },
    { header: 'Joined', render: (r) => new Date(r.created_at).toLocaleDateString() },
    { header: '', render: (r) => <Button variant="ghost" size="small" onClick={(e) => { e.stopPropagation(); navigate(`/admin/users/${r.id}`); }}>View →</Button> }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 4 }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>View and manage all users.</p>
        </div>
        <div style={{ width: 280 }}>
          <Input placeholder="Search users..." value={search} onChange={handleSearch} />
        </div>
      </div>

      {loading ? <Loader /> : <Table columns={columns} data={users} onRowClick={(r) => navigate(`/admin/users/${r.id}`)} />}
    </div>
  );
}
