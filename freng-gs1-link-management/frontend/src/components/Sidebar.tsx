import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/links', label: 'GS1 Links' },
]

export default function Sidebar() {
  return (
    <nav
      style={{
        width: '220px',
        background: '#1a1a2e',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
      }}
    >
      <div style={{ padding: '0 24px 32px', fontSize: '18px', fontWeight: 700 }}>
        GS1 Link Mgmt
      </div>
      {navItems.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            padding: '12px 24px',
            color: isActive ? '#e94560' : '#ccc',
            background: isActive ? 'rgba(233,69,96,0.1)' : 'transparent',
            fontWeight: isActive ? 600 : 400,
            borderLeft: isActive ? '3px solid #e94560' : '3px solid transparent',
            transition: 'all 0.15s',
          })}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
