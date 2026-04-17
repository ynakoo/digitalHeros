import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import api from '../../api/client';

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image_url: '', website_url: '', is_featured: false });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchCharities = () => {
    api.get('/api/charities').then(r => setCharities(r.data.charities || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCharities(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', image_url: '', website_url: '', is_featured: false }); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description, image_url: c.image_url, website_url: c.website_url || '', is_featured: c.is_featured }); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      if (editing) {
        await api.put(`/api/charities/${editing.id}`, form);
      } else {
        await api.post('/api/charities', { ...form, image_url: form.image_url || 'https://placehold.co/400x300?text=Charity' });
      }
      setShowForm(false);
      fetchCharities();
      setMsg('Charity saved!');
    } catch (err) { setMsg('Failed to save charity.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this charity?')) return;
    try { await api.delete(`/api/charities/${id}`); fetchCharities(); setMsg('Charity deleted.'); }
    catch (err) { setMsg('Failed to delete.'); }
  };

  if (loading) return <Loader fullPage />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 4 }}>Charity Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>Add, edit, and manage charities.</p>
        </div>
        <Button onClick={openAdd}>+ Add Charity</Button>
      </div>

      {msg && <div style={{ padding: '12px 16px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)', fontSize: 'var(--fs-sm)' }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
        {charities.map(c => (
          <Card key={c.id} className="hoverable">
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <img src={c.image_url} alt={c.name} style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: 'var(--fs-md)', marginBottom: 4 }}>{c.name}</h3>
                  {c.is_featured && <Badge variant="purple">Featured</Badge>}
                </div>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.6 }}>
                  {c.description?.substring(0, 100)}{c.description?.length > 100 ? '...' : ''}
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <Button variant="ghost" size="small" onClick={() => openEdit(c)}>Edit</Button>
                  <Button variant="ghost" size="small" onClick={() => handleDelete(c.id)} style={{ color: 'var(--danger)' }}>Delete</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {charities.length === 0 && (
          <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-3xl)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No charities yet. Add one above.</p>
          </Card>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Charity' : 'Add Charity'} footer={
        <>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'}</Button>
        </>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Input label="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="Description" type="textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          <Input label="Image URL" placeholder="https://placehold.co/400x300" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
          <Input label="Website URL" placeholder="https://example.com" value={form.website_url} onChange={e => setForm({...form, website_url: e.target.value})} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} />
            Featured charity
          </label>
        </div>
      </Modal>
    </div>
  );
}
