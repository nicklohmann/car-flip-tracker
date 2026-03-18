import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function CarList() {
  const [cars, setCars] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('http://localhost:5000/api/cars')
      .then(res => setCars(res.data))
      .catch(err => console.error(err))
  }, [])

  const statusBadge = (status) => (
    <span className={`badge badge-${status}`}>{status}</span>
  )

  return (
    <div className="page">
      <div className="page-header">
      <h1 className="page-title">Car Flip <span>Tracker</span></h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>📊 Dashboard</button>
        <button className="btn btn-primary" onClick={() => navigate('/add')}>+ Add Car</button>
      </div>
    </div>

      {cars.length === 0 ? (
        <div className="empty-state">
          <p>No cars yet. Add one to get started!</p>
        </div>
      ) : (
        cars.map(car => (
          <div key={car.id} className="car-card" onClick={() => navigate(`/cars/${car.id}`)}>
            <div>
              <div className="car-card-title">
                {car.year} {car.make} {car.model}
              </div>
              <div className="car-card-meta">
                {car.vin} &nbsp;·&nbsp; {car.mileage?.toLocaleString()} mi &nbsp;·&nbsp; {car.drivetrain} &nbsp;·&nbsp; {car.title_status}
              </div>
              <div style={{ marginTop: '8px' }}>
                {statusBadge(car.status)}
              </div>
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