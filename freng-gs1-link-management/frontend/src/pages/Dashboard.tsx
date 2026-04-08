import { useEffect, useState } from 'react'
import { api, GS1Link } from '../api/client'

interface Stat {
  label: string
  value: number | string
}

export default function Dashboard() {
  const [links, setLinks] = useState<GS1Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listLinks()
      .then(setLinks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const stats: Stat[] = [
    { label: 'Total Links', value: links.length },
    { label: 'Active Links', value: links.filter((l) => l.active).length },
    { label: 'Inactive Links', value: links.filter((l) => !l.active).length },
    {
      label: 'Link Types',
      value: new Set(links.map((l) => l.linkType)).size,
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>
        Dashboard
      </h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {stats.map(({ label, value }) => (
          <StatCard key={label} label={label} value={value} />
        ))}
      </div>

      <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
        Recent Links
      </h2>
      <LinksTable links={links.slice(0, 5)} />
    </div>
  )
}

function StatCard({ label, value }: Stat) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ fontSize: '32px', fontWeight: 700, color: '#e94560' }}>{value}</div>
      <div style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>{label}</div>
    </div>
  )
}

function LinksTable({ links }: { links: GS1Link[] }) {
  if (links.length === 0) return <p style={{ color: '#888' }}>No links yet.</p>
  return (
    <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f8f8', textAlign: 'left' }}>
            {['GS1 Key', 'Type', 'Target URL', 'Status'].map((h) => (
              <th key={h} style={{ padding: '12px 16px', fontSize: '13px', color: '#666', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id} style={{ borderTop: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px' }}>{link.gs1Key}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px' }}>{link.linkType}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <a href={link.targetUrl} target="_blank" rel="noreferrer" style={{ color: '#e94560' }}>{link.targetUrl}</a>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  background: link.active ? '#e6f4ea' : '#fce8e6',
                  color: link.active ? '#1e8e3e' : '#c5221f',
                }}>
                  {link.active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
