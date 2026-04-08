import { useEffect, useState } from 'react'
import { api, GS1Link, CreateLinkInput } from '../api/client'

const emptyForm: CreateLinkInput = {
  gs1Key: '',
  gs1KeyType: 'gtin',
  targetUrl: '',
  linkType: 'gs1:pip',
  title: '',
  active: true,
}

export default function Links() {
  const [links, setLinks] = useState<GS1Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateLinkInput>(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadLinks = () => {
    setLoading(true)
    api.listLinks()
      .then(setLinks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadLinks, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createLink(form)
      setForm(emptyForm)
      setShowForm(false)
      loadLinks()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link?')) return
    try {
      await api.deleteLink(id)
      loadLinks()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const handleToggleActive = async (link: GS1Link) => {
    try {
      await api.updateLink(link.id, { active: !link.active })
      loadLinks()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>GS1 Links</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            padding: '10px 20px',
            background: '#e94560',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
          }}
        >
          {showForm ? 'Cancel' : '+ New Link'}
        </button>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '16px' }}>Error: {error}</p>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}
        >
          <Field label="GS1 Key" required>
            <input
              value={form.gs1Key}
              onChange={(e) => setForm({ ...form, gs1Key: e.target.value })}
              placeholder="e.g. 09506000164076"
              required
              style={inputStyle}
            />
          </Field>
          <Field label="Key Type" required>
            <select
              value={form.gs1KeyType}
              onChange={(e) => setForm({ ...form, gs1KeyType: e.target.value })}
              style={inputStyle}
            >
              <option value="gtin">GTIN</option>
              <option value="sscc">SSCC</option>
              <option value="gln">GLN</option>
              <option value="grai">GRAI</option>
              <option value="giai">GIAI</option>
            </select>
          </Field>
          <Field label="Target URL" required>
            <input
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
              placeholder="https://example.com/product"
              type="url"
              required
              style={inputStyle}
            />
          </Field>
          <Field label="Link Type" required>
            <select
              value={form.linkType}
              onChange={(e) => setForm({ ...form, linkType: e.target.value })}
              style={inputStyle}
            >
              <option value="gs1:pip">Product Information Page</option>
              <option value="gs1:certificationInfo">Certification Info</option>
              <option value="gs1:safetyInfo">Safety Info</option>
              <option value="gs1:epil">ePIL</option>
              <option value="gs1:recall">Recall</option>
            </select>
          </Field>
          <Field label="Title" required>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Human-readable title"
              required
              style={inputStyle}
            />
          </Field>
          <Field label="Active">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px' }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Enable this link
            </label>
          </Field>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600 }}
            >
              {saving ? 'Saving...' : 'Create Link'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : links.length === 0 ? (
        <p style={{ color: '#888' }}>No links yet. Create your first GS1 link above.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f8f8', textAlign: 'left' }}>
                {['GS1 Key', 'Key Type', 'Link Type', 'Target URL', 'Title', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '13px', color: '#666', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px' }}>{link.gs1Key}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{link.gs1KeyType.toUpperCase()}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{link.linkType}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={link.targetUrl} target="_blank" rel="noreferrer" style={{ color: '#e94560' }}>{link.targetUrl}</a>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{link.title}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleToggleActive(link)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        background: link.active ? '#e6f4ea' : '#fce8e6',
                        color: link.active ? '#1e8e3e' : '#c5221f',
                      }}
                    >
                      {link.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleDelete(link.id)}
                      style={{ padding: '4px 10px', border: '1px solid #e94560', borderRadius: '4px', color: '#e94560', background: '#fff', fontSize: '12px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
        {label}{required && <span style={{ color: '#e94560' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  outline: 'none',
}
