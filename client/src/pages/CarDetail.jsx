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
      for (const part of res.data.parts) {
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

  if (!car) return <div className="page"><p style={{ color: 'var(--text-dim)' }}>Loading...</p></div>

  const totalPartsCost = parts.reduce((sum, p) => sum + parseFloat(p.cost), 0)
  const targetSellPrice = car.kbb_trade_in * 0.95
  const totalCost = parseFloat(car.iaa_cost || 0) + totalPartsCost + parseFloat(car.contingency || 0)
  const estimatedProfit = targetSellPrice - totalCost
  const donationAmount = estimatedProfit * 0.35

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          {car.year} {car.make} <span>{car.model}</span>
        </h1>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
        <span className={`badge badge-${car.status}`}>{car.status}</span>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          {car.vin} &nbsp;·&nbsp; {car.mileage?.toLocaleString()} mi &nbsp;·&nbsp; {car.drivetrain} &nbsp;·&nbsp; {car.title_status} &nbsp;·&nbsp; {car.damage_type}
        </span>
      </div>

      {/* Status */}
      <p className="section-title">Status</p>
      <select
        className="form-select"
        style={{ width: 'auto' }}
        value={car.status}
        onChange={e => handleStatusChange(e.target.value)}
      >
        <option value="evaluating">Evaluating</option>
        <option value="active">Active</option>
        <option value="sold">Sold</option>
        <option value="passed">Passed</option>
      </select>

      {/* Financials */}
      <p className="section-title">Financials</p>
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-label">KBB Trade-In</div>
          <div className="stat-value">${parseFloat(car.kbb_trade_in || 0).toLocaleString()}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Target Sell (95%)</div>
          <div className="stat-value accent">${targetSellPrice.toLocaleString()}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">IAA Cost</div>
          <div className="stat-value">${parseFloat(car.iaa_cost || 0).toLocaleString()}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Parts Cost</div>
          <div className="stat-value">${totalPartsCost.toLocaleString()}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Cost</div>
          <div className="stat-value">${totalCost.toLocaleString()}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Est. Profit</div>
          <div className={`stat-value ${estimatedProfit >= 0 ? 'green' : 'red'}`}>
            ${estimatedProfit.toLocaleString()}
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Church Donation (35%)</div>
          <div className="stat-value accent">${donationAmount.toLocaleString()}</div>
        </div>
      </div>

      {/* Photos */}
      <p className="section-title">Photos</p>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="file-upload-label">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          {uploading ? 'Uploading...' : '↑ Upload Photos'}
        </label>
        {images.length > 0 && (
          <button className="btn btn-ai" onClick={handleEstimate} disabled={estimating}>
            {estimating ? 'AI is estimating...' : '✨ AI Estimate Parts'}
          </button>
        )}
      </div>
      {images.length > 0 && (
        <div className="photos-grid">
          {images.map((url, i) => (
            <img key={i} src={url} alt={`car-${i}`} />
          ))}
        </div>
      )}

      {/* Parts */}
      <p className="section-title">Parts</p>
      {parts.length === 0 ? (
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No parts added yet.</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="parts-table">
            <thead>
              <tr>
                <th>Part</th>
                <th>Vendor</th>
                <th>Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {parts.map(part => (
                <tr key={part.id}>
                  <td>{part.part_name}</td>
                  <td style={{ color: 'var(--text-dim)' }}>{part.vendor}</td>
                  <td className="cost-cell">${parseFloat(part.cost).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDeletePart(part.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Part */}
      <p className="section-title">Add Part</p>
      <div className="card">
        <form onSubmit={handleAddPart}>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Part Name</label>
              <input
                className="form-input"
                placeholder="e.g. front bumper"
                value={newPart.part_name}
                onChange={e => setNewPart({ ...newPart, part_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor</label>
              <input
                className="form-input"
                placeholder="e.g. eBay"
                value={newPart.vendor}
                onChange={e => setNewPart({ ...newPart, vendor: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cost</label>
              <input
                className="form-input"
                placeholder="0.00"
                type="number"
                value={newPart.cost}
                onChange={e => setNewPart({ ...newPart, cost: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Add Part</button>
        </form>
      </div>
    </div>
  )
}

export default CarDetail