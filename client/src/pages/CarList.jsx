import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../AuthContext'

function CarList() {
  const [cars, setCars] = useState([])
  const [showLogin, setShowLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { isLoggedIn, login, logout } = useAuth()

  useEffect(() => {
    api.get('/api/cars')
      .then(res => setCars(res.data))
      .catch(err => console.error(err))
  }, [])

  const handleLogin = () => {
    const success = login(password)
    if (success) {
      setShowLogin(false)
      setPassword('')
      setError('')
    } else {
      setError('Incorrect password')
    }
  }

  const statusBadge = (status) => (
    <span className={`badge badge-${status}`}>{status}</span>
  )

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Craig's <span>Garage</span></h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>📊 Dashboard</button>
          {isLoggedIn ? (
            <>
              <button className="btn btn-primary" onClick={() => navigate('/add')}>+ Add Car</button>
              <button className="btn btn-ghost" onClick={logout}>Logout</button>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={() => setShowLogin(true)}>Login</button>
          )}
        </div>
      </div>

      {showLogin && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '320px', padding: '24px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Login</h2>
            <input
              className="form-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoFocus
            />
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '8px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={handleLogin}>Login</button>
              <button className="btn btn-ghost" onClick={() => { setShowLogin(false); setError(''); setPassword('') }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {cars.length === 0 ? (
        <div className="empty-state">
          <p>No cars yet. Add one to get started!</p>
        </div>
      ) : (
        cars.map(car => (
          <div key={car.id} className="car-card" onClick={() => navigate(`/cars/${car.id}`)}>
            <div>
              <div className="car-card-title">{car.year} {car.make} {car.model}</div>
              <div className="car-card-meta">
                {car.vin} &nbsp;·&nbsp; {car.mileage?.toLocaleString()} mi &nbsp;·&nbsp; {car.drivetrain} &nbsp;·&nbsp; {car.title_status}
              </div>
              <div style={{ marginTop: '8px' }}>{statusBadge(car.status)}</div>
            </div>
            <div className="car-card-right">
              <div className="car-card-bid">${parseFloat(car.actual_bid || 0).toLocaleString()}</div>
              <div className="car-card-meta">bid</div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default CarList