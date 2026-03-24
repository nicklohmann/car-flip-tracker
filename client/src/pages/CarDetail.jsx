import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../AuthContext'

function CarDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [editConditions, setEditConditions] = useState({
    notRunning: false, needsTires: false, airbagDeployed: false, numAirbags: 1, needsOilChange: false, needsPaint: false
  })
  const [car, setCar] = useState(null)
  const [parts, setParts] = useState([])
  const [newPart, setNewPart] = useState({ part_name: '', vendor: '', cost: '' })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [estimating, setEstimating] = useState(false)

  useEffect(() => {
    api.get(`/api/cars/${id}`)
      .then(res => { setCar(res.data); setImages(res.data.images || []) })
      .catch(err => console.error(err))
    api.get(`/api/cars/${id}/parts`)
      .then(res => setParts(res.data))
      .catch(err => console.error(err))
  }, [id])

  const handleAddPart = e => {
    e.preventDefault()
    api.post(`/api/cars/${id}/parts`, newPart)
      .then(res => { setParts([...parts, res.data]); setNewPart({ part_name: '', vendor: '', cost: '' }) })
      .catch(err => console.error(err))
  }

  const handleDeletePart = (part_id) => {
    api.delete(`/api/cars/${id}/parts/${part_id}`)
      .then(() => setParts(parts.filter(p => p.id !== part_id)))
      .catch(err => console.error(err))
  }

  const handleStatusChange = (status) => {
    api.patch(`/api/cars/${id}/status`, { status })
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
        const res = await api.post('/api/images/upload', formData)
        uploadedUrls.push(res.data.url)
      }
      const updatedImages = [...images, ...uploadedUrls]
      setImages(updatedImages)
      await api.patch(`/api/cars/${id}/images`, { images: updatedImages })
    } catch (err) {
      console.error(err)
      alert('Image upload failed')
    }
    setUploading(false)
  }

  const handleEstimate = async () => {
    if (images.length === 0) { alert('Please upload at least one photo first'); return }
    setEstimating(true)
    try {
      const res = await api.post('/api/ai/estimate', { imageUrls: images })
      for (const part of res.data.parts) {
        const saved = await api.post(`/api/cars/${id}/parts`, {
          part_name: part.part_name, vendor: part.vendor, cost: part.estimated_cost
        })
        setParts(prev => [...prev, saved.data])
      }
    } catch (err) { console.error(err); alert('AI estimation failed') }
    setEstimating(false)
  }

  const handleCarPartSearch = () => {
    const query = `${car.year} ${car.make} ${car.model}`
    window.open(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=6030`, '_blank')
  }

  const handleEditStart = () => {
    setEditForm({
      make: car.make ?? '', model: car.model ?? '', year: car.year ?? '',
      vin: car.vin ?? '', mileage: car.mileage ?? '', drivetrain: car.drivetrain ?? 'AWD',
      title_status: car.title_status ?? 'salvage', damage_type: car.damage_type ?? '',
      kbb_trade_in: car.kbb_trade_in ?? '', kbb_private: car.kbb_private ?? '',
      iaa_acv: car.iaa_acv ?? '', repair_estimate: car.repair_estimate ?? '',
      contingency: car.contingency ?? '', labor_hours: car.labor_hours ?? '',
      labor_rate: car.labor_rate ?? '50', iaa_fees: car.iaa_fees ?? '',
      tax_reg_insurance: car.tax_reg_insurance ?? '', actual_bid: car.actual_bid ?? '',
      iaa_cost: car.iaa_cost ?? '', notes: car.notes ?? ''
    })
    setEditConditions({ notRunning: false, needsTires: false, airbagDeployed: false, numAirbags: 1, needsOilChange: false, needsPaint: false })
    setEditing(true)
  }

  const conditionAddonCost = (
    (editConditions.notRunning ? 125 : 0) +
    (editConditions.needsTires ? 500 : 0) +
    (editConditions.airbagDeployed ? 250 + (editConditions.numAirbags * 100) : 0) +
    (editConditions.needsOilChange ? 50 : 0) +
    (editConditions.needsPaint ? 30 : 0)
  )

  const handleEditSave = async () => {
    try {
      const baseRepair = parseFloat(editForm.repair_estimate) || 0
      const totalRepair = baseRepair + conditionAddonCost
      const res = await api.put(`/api/cars/${id}`, { ...editForm, repair_estimate: totalRepair })
      setCar(res.data); setEditing(false)
    } catch (err) { console.error(err); alert('Failed to save changes') }
  }

  if (!car) return <div className="page"><p style={{ color: 'var(--text-dim)' }}>Loading...</p></div>

  const totalPartsCost = parts.reduce((sum, p) => sum + parseFloat(p.cost || 0), 0)
  const targetSellPrice = car.kbb_trade_in * 0.95
  const totalCost = parseFloat(car.iaa_cost || 0) + totalPartsCost + parseFloat(car.contingency || 0)
  const estimatedProfit = targetSellPrice - totalCost
  const donationAmount = estimatedProfit * 0.35

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{car.year} {car.make} <span>{car.model}</span></h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {editing ? (
            <>
              <button className="btn btn-primary" onClick={handleEditSave}>Save Changes</button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              {isLoggedIn && <button className="btn btn-ghost" onClick={handleEditStart}>Edit</button>}
              <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back</button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
        <span className={`badge badge-${car.status}`}>{car.status}</span>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          {car.vin} &nbsp;·&nbsp; {car.mileage?.toLocaleString()} mi &nbsp;·&nbsp; {car.drivetrain} &nbsp;·&nbsp; {car.title_status} &nbsp;·&nbsp; {car.damage_type}
        </span>
      </div>

      {car.notes && (
        <div style={{ marginTop: '8px', padding: '10px 14px', background: 'var(--surface2)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
          📝 {car.notes}
        </div>
      )}

      <p className="section-title">Status</p>
      <select className="form-select" style={{ width: 'auto' }} value={car.status} onChange={e => handleStatusChange(e.target.value)}>
        <option value="evaluating">Evaluating</option>
        <option value="active">Active</option>
        <option value="sold">Sold</option>
        <option value="passed">Passed</option>
      </select>

      <p className="section-title">Financials</p>
      <div className="stats-grid">
        <div className="stat-box"><div className="stat-label">KBB Trade-In</div><div className="stat-value">${parseFloat(car.kbb_trade_in || 0).toLocaleString()}</div></div>
        <div className="stat-box"><div className="stat-label">Target Sell (95%)</div><div className="stat-value accent">${targetSellPrice.toLocaleString()}</div></div>
        <div className="stat-box"><div className="stat-label">IAA Cost</div><div className="stat-value">${parseFloat(car.iaa_cost || 0).toLocaleString()}</div></div>
        <div className="stat-box"><div className="stat-label">Parts Cost</div><div className="stat-value">${totalPartsCost.toLocaleString()}</div></div>
        <div className="stat-box"><div className="stat-label">Total Cost</div><div className="stat-value">${totalCost.toLocaleString()}</div></div>
        <div className="stat-box"><div className="stat-label">Est. Profit</div><div className={`stat-value ${estimatedProfit >= 0 ? 'green' : 'red'}`}>${estimatedProfit.toLocaleString()}</div></div>
        <div className="stat-box"><div className="stat-label">Church Donation (35%)</div><div className="stat-value accent">${donationAmount.toLocaleString()}</div></div>
      </div>

      {editing && (
        <>
          <p className="section-title">Edit Car Info</p>
          <div className="card">
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Make</label><input className="form-input" value={editForm.make} onChange={e => setEditForm({ ...editForm, make: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Model</label><input className="form-input" value={editForm.model} onChange={e => setEditForm({ ...editForm, model: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Year</label><input className="form-input" type="number" value={editForm.year} onChange={e => setEditForm({ ...editForm, year: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Mileage</label><input className="form-input" type="number" value={editForm.mileage} onChange={e => setEditForm({ ...editForm, mileage: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">KBB Trade-In</label><input className="form-input" type="number" value={editForm.kbb_trade_in} onChange={e => setEditForm({ ...editForm, kbb_trade_in: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">KBB Private</label><input className="form-input" type="number" value={editForm.kbb_private} onChange={e => setEditForm({ ...editForm, kbb_private: e.target.value })} /></div>
              <div className="form-group">
                <label className="form-label">Repair Estimate</label>
                <input className="form-input" type="number" value={editForm.repair_estimate} onChange={e => setEditForm({ ...editForm, repair_estimate: e.target.value })} />
                {conditionAddonCost > 0 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    + ${conditionAddonCost} condition add-ons = <span style={{ color: 'var(--accent)' }}>${(parseFloat(editForm.repair_estimate) || 0) + conditionAddonCost} total</span>
                  </div>
                )}
              </div>
              <div className="form-group"><label className="form-label">Contingency</label><input className="form-input" type="number" value={editForm.contingency} onChange={e => setEditForm({ ...editForm, contingency: e.target.value })} /></div>
              <div className="form-group">
                <label className="form-label">Actual Bid</label>
                <input className="form-input" type="number" value={editForm.actual_bid}
                  onChange={e => {
                    const bid = parseFloat(e.target.value) || 0
                    const fees = bid > 0 ? Math.round(bid * (75.022 * Math.pow(bid, -0.703)) + 20 + 10) : 0
                    setEditForm({ ...editForm, actual_bid: e.target.value, iaa_fees: fees, iaa_cost: bid + fees })
                  }} />
              </div>
              <div className="form-group"><label className="form-label">IAA Fees (auto-calculated)</label><input className="form-input" type="number" value={editForm.iaa_fees} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} /></div>
              <div className="form-group"><label className="form-label">Total IAA Cost (auto-calculated)</label><input className="form-input" type="number" value={editForm.iaa_cost} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} /></div>
              <div className="form-group">
                <label className="form-label">Drivetrain</label>
                <select className="form-select" value={editForm.drivetrain} onChange={e => setEditForm({ ...editForm, drivetrain: e.target.value })}>
                  <option value="AWD">AWD</option>
                  <option value="FWD">FWD</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={3} value={editForm.notes}
                onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="e.g. ask for hinges, insurance quality..." style={{ resize: 'vertical' }} />
            </div>
          </div>

          <p className="section-title">Condition Add-ons</p>
          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={editConditions.notRunning}
                  onChange={e => setEditConditions({ ...editConditions, notRunning: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
                <span>
                  <span style={{ fontWeight: 600 }}>Not Running</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '8px' }}>+$125 (battery)</span>
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={editConditions.needsTires}
                  onChange={e => setEditConditions({ ...editConditions, needsTires: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
                <span>
                  <span style={{ fontWeight: 600 }}>Needs New Tires</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '8px' }}>+$500</span>
                </span>
              </label>


              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editConditions.needsPaint}
                  onChange={e => setEditConditions({ ...editConditions, needsPaint: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                />
                <span>
                  <span style={{ fontWeight: 600 }}>Needs Paint</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '8px' }}>+$30 (spray can)</span>
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={editConditions.needsOilChange}
                  onChange={e => setEditConditions({ ...editConditions, needsOilChange: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
                <span>
                  <span style={{ fontWeight: 600 }}>Needs Oil/Fluids</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '8px' }}>+$50</span>
                </span>
              </label>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editConditions.airbagDeployed}
                    onChange={e => setEditConditions({ ...editConditions, airbagDeployed: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
                  <span>
                    <span style={{ fontWeight: 600 }}>Airbags Deployed</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '8px' }}>+$250 reset, +$100/airbag</span>
                  </span>
                </label>
                {editConditions.airbagDeployed && (
                  <div style={{ marginTop: '10px', marginLeft: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>How many airbags?</label>
                    <input className="form-input" type="number" min="1" max="10"
                      value={editConditions.numAirbags}
                      onChange={e => setEditConditions({ ...editConditions, numAirbags: parseInt(e.target.value) || 1 })}
                      style={{ width: '80px' }} />
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      = ${250 + (editConditions.numAirbags * 100)} total
                    </span>
                  </div>
                )}
              </div>
            </div>

            {conditionAddonCost > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Condition Add-ons</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', color: 'var(--accent)', fontSize: '1.1rem' }}>+${conditionAddonCost}</span>
              </div>
            )}
          </div>
        </>
      )}

      <p className="section-title">Photos</p>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="file-upload-label">
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} style={{ display: 'none' }} />
          {uploading ? 'Uploading...' : '↑ Upload Photos'}
        </label>
        {images.length > 0 && (
          <button className="btn btn-ai" onClick={handleEstimate} disabled={estimating}>
            {estimating ? 'AI is estimating...' : '✨ AI Estimate Parts'}
          </button>
        )}
      </div>
      {images.length > 0 && (
        <div className="photos-grid">{images.map((url, i) => <img key={i} src={url} alt={`car-${i}`} />)}</div>
      )}

      <p className="section-title">Parts</p>
      {parts.length === 0 ? (
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No parts added yet.</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="parts-table">
            <thead><tr><th>Part</th><th>Vendor</th><th>Cost</th><th></th></tr></thead>
            <tbody>
              {parts.map(part => (
                <tr key={part.id}>
                  <td>{part.part_name}</td>
                  <td style={{ color: 'var(--text-dim)' }}>{part.vendor}</td>
                  <td className="cost-cell">${parseFloat(part.cost || 0).toFixed(2)}</td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                      onClick={() => window.open(
                        `https://www.google.com/search?q=${encodeURIComponent(`${car.year} ${car.make} ${car.model} ${part.part_name}`)}+site:car-part.com`,
                        '_blank'
                      )}
                    >🔍</button>
                    <button className="btn btn-danger" onClick={() => handleDeletePart(part.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="section-title">Add Part</p>
      <div style={{ marginBottom: '12px' }}>
        <button className="btn btn-ghost" onClick={handleCarPartSearch}>🔍 Search eBay Motors</button>
      </div>

      <div className="card">
        <form onSubmit={handleAddPart}>
          <div className="form-grid-3">
            <div className="form-group"><label className="form-label">Part Name</label><input className="form-input" placeholder="e.g. front bumper" value={newPart.part_name} onChange={e => setNewPart({ ...newPart, part_name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Vendor</label><input className="form-input" placeholder="e.g. eBay" value={newPart.vendor} onChange={e => setNewPart({ ...newPart, vendor: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Cost</label><input className="form-input" placeholder="0.00" type="number" value={newPart.cost} onChange={e => setNewPart({ ...newPart, cost: e.target.value })} /></div>
          </div>
          <button type="submit" className="btn btn-primary">Add Part</button>
        </form>
      </div>
    </div>
  )
}

export default CarDetail