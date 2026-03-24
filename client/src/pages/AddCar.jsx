import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

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

  const [conditions, setConditions] = useState({
    notRunning: false,
    needsTires: false,
    airbagDeployed: false,
    numAirbags: 1,
    needsOilChange: false,
    needsPaint: false
  })

  const conditionAddonCost = (
    (conditions.notRunning ? 125 : 0) +
    (conditions.needsTires ? 500 : 0) +
    (conditions.airbagDeployed ? 250 + (conditions.numAirbags * 100) : 0) +
    (conditions.needsOilChange ? 50 : 0)
    (conditions.needsPaint ? 30 : 0)
  )

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDecodeVin = async () => {
    if (!vinInput) return
    setDecoding(true)
    try {
      const res = await api.get(
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
    const totalRepair = (parseFloat(form.repair_estimate) || 0) + conditionAddonCost
    api.post('/api/cars', { ...form, repair_estimate: totalRepair })
      .then(() => navigate('/'))
      .catch(err => console.error(err))
  }

  const baseRepair = parseFloat(form.repair_estimate) || 0
  const totalRepairEstimate = baseRepair + conditionAddonCost

  const targetSellPrice = form.kbb_trade_in ? (form.kbb_trade_in * 0.95).toFixed(2) : null
  const totalCost = form.iaa_cost && form.contingency
    ? (parseFloat(form.iaa_cost) + totalRepairEstimate + parseFloat(form.contingency)).toFixed(2)
    : null
  const maxBid = form.kbb_trade_in && form.contingency && form.iaa_fees && form.tax_reg_insurance
    ? (form.kbb_trade_in * 0.95 - totalRepairEstimate - parseFloat(form.contingency) - parseFloat(form.iaa_fees) - parseFloat(form.tax_reg_insurance)).toFixed(2)
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
        <button className="btn btn-primary" onClick={handleDecodeVin} disabled={decoding}>
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

        {/* Condition Flags */}
        <p className="section-title">Condition</p>
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={conditions.notRunning}
                onChange={e => setConditions({ ...conditions, notRunning: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
              />
              <span>
                <span style={{ fontWeight: 600 }}>Not Running</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '8px' }}>+$125 (battery)</span>
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={conditions.needsTires}
                onChange={e => setConditions({ ...conditions, needsTires: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
              />
              <span>
                <span style={{ fontWeight: 600 }}>Needs New Tires</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '8px' }}>+$500</span>
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={conditions.needsPaint}
                  onChange={e => setConditions({ ...conditions, needsPaint: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                />
                <span>
                  <span style={{ fontWeight: 600 }}>Needs Paint</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '8px' }}>+$30</span>
                </span>
              </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={conditions.needsOilChange}
                onChange={e => setConditions({ ...conditions, needsOilChange: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
              />
              <span>
                <span style={{ fontWeight: 600 }}>Needs Oil/Fluids</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '8px' }}>+$50</span>
              </span>
            </label>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={conditions.airbagDeployed}
                  onChange={e => setConditions({ ...conditions, airbagDeployed: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                />
                <span>
                  <span style={{ fontWeight: 600 }}>Airbags Deployed</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '8px' }}>+$250 reset, +$100/airbag</span>
                </span>
              </label>
              {conditions.airbagDeployed && (
                <div style={{ marginTop: '10px', marginLeft: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>How many airbags?</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max="10"
                    value={conditions.numAirbags}
                    onChange={e => setConditions({ ...conditions, numAirbags: parseInt(e.target.value) || 1 })}
                    style={{ width: '80px' }}
                  />
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    = ${250 + (conditions.numAirbags * 100)} total
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
              {conditionAddonCost > 0 && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  + ${conditionAddonCost} condition add-ons = <span style={{ color: 'var(--accent)' }}>${totalRepairEstimate} total</span>
                </div>
              )}
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