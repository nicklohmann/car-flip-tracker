import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function CarDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [parts, setParts] = useState([])
  const [newPart, setNewPart] = useState({ part_name: '', vendor: '', cost: '' })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [estimating, setEstimating] = useState(false)

  useEffect(() => {
    axios.get(`http://localhost:5000/api/cars/${id}`)
      .then(res => {
        setCar(res.data)
        setImages(res.data.images || [])
      })
      .catch(err => console.error(err))

    axios.get(`http://localhost:5000/api/cars/${id}/parts`)
      .then(res => setParts(res.data))
      .catch(err => console.error(err))
  }, [id])

  const handleAddPart = e => {
    e.preventDefault()
    axios.post(`http://localhost:5000/api/cars/${id}/parts`, newPart)
      .then(res => {
        setParts([...parts, res.data])
        setNewPart({ part_name: '', vendor: '', cost: '' })
      })
      .catch(err => console.error(err))
  }

  const handleDeletePart = (part_id) => {
    axios.delete(`http://localhost:5000/api/cars/${id}/parts/${part_id}`)
      .then(() => setParts(parts.filter(p => p.id !== part_id)))
      .catch(err => console.error(err))
  }

  const handleStatusChange = (status) => {
    axios.patch(`http://localhost:5000/api/cars/${id}/status`, { status })
      .then(res => setCar(res.data))
      .catch(err => console.error(err))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    setUploading(true)
    try {
      const uploadedUrls = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('image', file)
        const res = await axios.post('http://localhost:5000/api/images/upload', formData)
        uploadedUrls.push(res.data.url)
      }
      const updatedImages = [...images, ...uploadedUrls]
      setImages(updatedImages)
      // Save image URLs to the car
      await axios.patch(`http://localhost:5000/api/cars/${id}/images`, { images: updatedImages })
    } catch (err) {
      console.error(err)
      alert('Image upload failed')
    }
    setUploading(false)
  }

  const handleEstimate = async () => {
    if (images.length === 0) {
      alert('Please upload at least one photo first')
      return
    }
    setEstimating(true)
    try {
      const res = await axios.post('http://localhost:5000/api/ai/estimate', { imageUrls: images })
      const estimatedParts = res.data.parts
      // Add each estimated part to the database
      for (const part of estimatedParts) {
        const saved = await axios.post(`http://localhost:5000/api/cars/${id}/parts`, {
          part_name: part.part_name,
          vendor: part.vendor,
          cost: part.estimated_cost
        })
        setParts(prev => [...prev, saved.data])
      }
    } catch (err) {
      console.error(err)
      alert('AI estimation failed')
    }
    setEstimating(false)
  }

  if (!car) return <p>Loading...</p>

  const totalPartsCost = parts.reduce((sum, p) => sum + parseFloat(p.cost), 0).toFixed(2)
  const targetSellPrice = (car.kbb_trade_in * 0.95).toFixed(2)
  const totalCost = (parseFloat(car.iaa_cost) + parseFloat(totalPartsCost) + parseFloat(car.contingency)).toFixed(2)
  const estimatedProfit = (targetSellPrice - totalCost).toFixed(2)
  const donationAmount = (estimatedProfit * 0.35).toFixed(2)

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <button onClick={() => navigate('/')}>← Back</button>
      <h1>{car.year} {car.make} {car.model}</h1>
      <p>VIN: {car.vin} | Miles: {car.mileage} | {car.drivetrain} | {car.title_status}</p>
      <p>Damage: {car.damage_type}</p>

      <h3>Status</h3>
      <select value={car.status} onChange={e => handleStatusChange(e.target.value)}>
        <option value="evaluating">Evaluating</option>
        <option value="active">Active</option>
        <option value="sold">Sold</option>
        <option value="passed">Passed</option>
      </select>

      <h3>Financials</h3>
      <p>KBB Trade-In: <strong>${car.kbb_trade_in}</strong></p>
      <p>Target Sell Price (95%): <strong>${targetSellPrice}</strong></p>
      <p>IAA Cost: <strong>${car.iaa_cost}</strong></p>
      <p>Contingency: <strong>${car.contingency}</strong></p>
      <p>Total Parts Cost: <strong>${totalPartsCost}</strong></p>
      <p>Estimated Total Cost: <strong>${totalCost}</strong></p>
      <p>Estimated Profit: <strong>${estimatedProfit}</strong></p>
      <p>Church Donation (35%): <strong>${donationAmount}</strong></p>

      <h3>Photos</h3>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
        {images.map((url, i) => (
          <img key={i} src={url} alt={`car-${i}`} style={{ width: '150px', height: '100px', objectFit: 'cover' }} />
        ))}
      </div>

      {images.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleEstimate} disabled={estimating}>
            {estimating ? 'AI is estimating...' : '✨ AI Estimate Parts from Photos'}
          </button>
        </div>
      )}

      <h3>Parts</h3>
      {parts.length === 0 ? <p>No parts added yet.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Part</th>
              <th style={{ textAlign: 'left' }}>Vendor</th>
              <th style={{ textAlign: 'left' }}>Cost</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {parts.map(part => (
              <tr key={part.id}>
                <td>{part.part_name}</td>
                <td>{part.vendor}</td>
                <td>${parseFloat(part.cost).toFixed(2)}</td>
                <td>
                  <button onClick={() => handleDeletePart(part.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Add Part</h3>
      <form onSubmit={handleAddPart}>
        <input
          placeholder="Part name"
          value={newPart.part_name}
          onChange={e => setNewPart({ ...newPart, part_name: e.target.value })}
        /><br />
        <input
          placeholder="Vendor"
          value={newPart.vendor}
          onChange={e => setNewPart({ ...newPart, vendor: e.target.value })}
        /><br />
        <input
          placeholder="Cost"
          type="number"
          value={newPart.cost}
          onChange={e => setNewPart({ ...newPart, cost: e.target.value })}
        /><br />
        <button type="submit">Add Part</button>
      </form>
    </div>
  )
}

export default CarDetail