import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Dashboard() {
  const [cars, setCars] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('http://localhost:5000/api/cars')
      .then(res => setCars(res.data))
      .catch(err => console.error(err))
  }, [])

  const soldCars = cars.filter(c => c.status === 'sold')
  const activeCars = cars.filter(c => c.status === 'active')
  const evaluatingCars = cars.filter(c => c.status === 'evaluating')

  const totalRevenue = soldCars.reduce((sum, c) => sum + parseFloat(c.sold_price || 0), 0)
  const totalIaaCost = soldCars.reduce((sum, c) => sum + parseFloat(c.iaa_cost || 0), 0)
  const totalProfit = soldCars.reduce((sum, c) => {
    const sellPrice = parseFloat(c.sold_price || 0)
    const cost = parseFloat(c.iaa_cost || 0)
    return sum + (sellPrice - cost)
  }, 0)
  const totalDonation = totalProfit * 0.35

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Flip <span>Dashboard</span></h1>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back</button>
      </div>

      {/* Summary stats */}
      <p className="section-title">All Time</p>
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-label">Cars Flipped</div>
          <div className="stat-value accent">{soldCars.length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Profit</div>
          <div className={`stat-value ${totalProfit >= 0 ? 'green' : 'red'}`}>
            ${totalProfit.toLocaleString()}
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Church Donations (35%)</div>
          <div className="stat-value accent">${totalDonation.toLocaleString()}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Active Repairs</div>
          <div className="stat-value">{activeCars.length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Evaluating</div>
          <div className="stat-value">{evaluatingCars.length}</div>
        </div>
      </div>

      {/* Sold cars history */}
      <p className="section-title">Completed Flips</p>
      {soldCars.length === 0 ? (
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No completed flips yet. Mark a car as sold to see it here.</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="parts-table">
            <thead>
              <tr>
                <th>Car</th>
                <th>IAA Cost</th>
                <th>Sold For</th>
                <th>Profit</th>
                <th>Donation</th>
                <th>Platform</th>
              </tr>
            </thead>
            <tbody>
              {soldCars.map(car => {
                const profit = parseFloat(car.sold_price || 0) - parseFloat(car.iaa_cost || 0)
                const donation = profit * 0.35
                return (
                  <tr key={car.id} onClick={() => navigate(`/cars/${car.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <strong>{car.year} {car.make} {car.model}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{car.sold_date}</div>
                    </td>
                    <td className="cost-cell">${parseFloat(car.iaa_cost || 0).toLocaleString()}</td>
                    <td className="cost-cell">${parseFloat(car.sold_price || 0).toLocaleString()}</td>
                    <td>
                      <span style={{ color: profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        ${profit.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ color: 'var(--accent)' }}>${donation.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-dim)' }}>{car.sold_platform || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Dashboard