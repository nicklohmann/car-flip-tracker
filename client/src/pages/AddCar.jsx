import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function AddCar() {
  const navigate = useNavigate()
  const [vinInput, setVinInput] = useState('')
  const [decoding, setDecoding] = useState(false)
  const [form, setForm] = useState({
    make: '', model: '', year: '', vin: '', mileage: '',
    drivetrain: 'AWD', title_status: 'salvage', damage_type: '',
    kbb_trade_in: '', kbb_private: '', iaa_acv: '',
    repair_estimate: '', contingency: '', labor_hours: '',
    labor_rate: '50', iaa_fees: '', tax_reg_insurance: '',
    actual_bid: '', iaa_cost: ''
  })

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDecodeVin = async () => {
    if (!vinInput) return
    setDecoding(true)
    try {
      const res = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vinInput}?format=json`
      )
      const data = res.data.Results[0]
      setForm(prev => ({
        ...prev,
        vin: vinInput,
        make: data.Make || '',
        model: data.Model || '',
        year: data.ModelYear || '',
        drivetrain: data.DriveType && data.DriveType.includes('4') ? 'AWD' : 'FWD',
      }))
    } catch (err) {
      alert('Could not decode VIN. Please check it and try again.')
    }
    setDecoding(false)
  }

  const handleSubmit = e => {
    e.preventDefault()
    axios.post('http://localhost:5000/api/cars', form)
      .then(() => navigate('/'))
      .catch(err => console.error(err))
  }

  const targetSellPrice = form.kbb_trade_in ? (form.kbb_trade_in * 0.95).toFixed(2) : null
  const totalCost = form.iaa_cost && form.repair_estimate && form.contingency
    ? (parseFloat(form.iaa_cost) + parseFloat(form.repair_estimate) + parseFloat(form.contingency)).toFixed(2)
    : null
  const maxBid = form.kbb_trade_in && form.repair_estimate && form.contingency && form.iaa_fees && form.tax_reg_insurance
    ? (form.kbb_trade_in * 0.95 - parseFloat(form.repair_estimate) - parseFloat(form.contingency) - parseFloat(form.iaa_fees) - parseFloat(form.tax_reg_insurance)).toFixed(2)
    : null

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Add <span>New Car</span></h1>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back</button>
      </div>

      {/* VIN Decoder */}
      <p className="section-title">VIN Decoder</p>
      <div className="vin-decoder">
        <div className="form-group">
          <label className="form-label">Paste VIN</label>
          <input
            className="form-input"
            placeholder="17-character VIN"
            value={vinInput}
            onChange={e => setVinInput(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleDecodeVin}
          disabled={decoding}
        >
          {decoding ? 'Decoding...' : 'Decode VIN'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Car Info */}
        <p className="section-title">Car Info</p>
        <div className="card">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Make</label>
              <input className="form-input" name="make" placeholder="e.g. Chevy" value={form.make} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input className="form-input" name="model" placeholder="e.g. Equinox" value={form.model} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input className="form-input" name="year" placeholder="e.g. 2021" type="number" value={form.year} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">VIN</label>
              <input className="form-input" name="vin" placeholder="VIN" value={form.vin} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Mileage</label>
              <input className="form-input" name="mileage" placeholder="e.g. 47200" type="number" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Damage Type</label>
              <input className="form-input" name="damage_type" placeholder="e.g. front" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Drivetrain</label>
              <select className="form-select" name="drivetrain" value={form.drivetrain} onChange={handleChange}>
                <option value="AWD">AWD</option>
                <option value="FWD">FWD</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Title Status</label>
              <select className="form-select" name="title_status" onChange={handleChange}>
                <option value="salvage">Salvage</option>
                <option value="rebuilt">Rebuilt</option>
                <option value="clear">Clear</option>
              </select>
            </div>
          </div>
        </div>

        {/* Valuation */}
        <p className="section-title">Valuation</p>
        <div className="card">
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">KBB Good Trade-In</label>
              <input className="form-input" name="kbb_trade_in" placeholder="0.00" type="number" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">KBB Private Party</label>
              <input className="form-input" name="kbb_private" placeholder="0.00" type="number" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">IAA ACV</label>
              <input className="form-input" name="iaa_acv" placeholder="0.00" type="number" onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Costs */}
        <p className="section-title">Costs</p>
        <div className="card">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Repair Estimate</label>
              <input className="form-input" name="repair_estimate" placeholder="0.00" type="number" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Contingency Buffer</label>
              <input className="form-input" name="contingency" placeholder="0.00" type="number" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Labor Hours</label>
              <input className="form-input" name="labor_hours" placeholder="0" type="number" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Labor Rate ($/hr)</label>
              <input className="form-input" name="labor_rate" placeholder="50" type="number" onChange={handleChange} defaultValue="50" />
            </div>
            <div className="form-group">
              <label className="form-label">IAA Fees</label>
              <input className="form-input" name="iaa_fees" placeholder="0.00" type="number" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Tax, Reg & Insurance</label>
              <input className="form-input" name="tax_reg_insurance" placeholder="0.00" type="number" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Your Bid</label>
              <input className="form-input" name="actual_bid" placeholder="0.00" type="number" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Total IAA Cost</label>
              <input className="form-input" name="iaa_cost" placeholder="0.00" type="number" onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Calculated */}
        {(targetSellPrice || totalCost || maxBid) && (
          <>
            <p className="section-title">Calculated</p>
            <div className="stats-grid">
              {targetSellPrice && (
                <div className="stat-box">
                  <div className="stat-label">Target Sell Price</div>
                  <div className="stat-value accent">${parseFloat(targetSellPrice).toLocaleString()}</div>
                </div>
              )}
              {totalCost && (
                <div className="stat-box">
                  <div className="stat-label">Est. Total Cost</div>
                  <div className="stat-value">${parseFloat(totalCost).toLocaleString()}</div>
                </div>
              )}
              {maxBid && (
                <div className="stat-box">
                  <div className="stat-label">Max Bid</div>
                  <div className={`stat-value ${parseFloat(maxBid) > 0 ? 'green' : 'red'}`}>
                    ${parseFloat(maxBid).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ marginTop: '24px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1rem' }}>
            Save Car
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddCar