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

  return (
    <div style={{ padding: '20px' }}>
      <h1>Car Flip Tracker</h1>
      <button onClick={() => navigate('/add')}>+ Add Car</button>
      <hr />
      {cars.length === 0 ? (
        <p>No cars yet. Add one to get started!</p>
      ) : (
        cars.map(car => (
          <div key={car.id} onClick={() => navigate(`/cars/${car.id}`)}
            style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', cursor: 'pointer' }}>
            <h3>{car.year} {car.make} {car.model}</h3>
            <p>Status: {car.status} | Mileage: {car.mileage} | Bid: ${car.actual_bid}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default CarList