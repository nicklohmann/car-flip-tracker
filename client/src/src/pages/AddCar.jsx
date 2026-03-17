import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function AddCar() {
  const navigate = useNavigate()
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

  const handleSubmit = e => {
    e.preventDefault()
    axios.post('http://localhost:5000/api/cars', form)
      .then(() => navigate('/'))
      .catch(err => console.error(err))
  }

  const targetSellPrice = form.kbb_trade_in ? (form.kbb_trade_in * 0.95).toFixed(2) : '—'
  const totalCost = form.iaa_cost && form.repair_estimate && form.contingency
    ? (parseFloat(form.iaa_cost) + parseFloat(form.repair_estimate) + parseFloat(form.contingency)).toFixed(2)
    : '—'
  const maxBid = form.kbb_trade_in && form.repair_estimate && form.contingency && form.iaa_fees && form.tax_reg_insurance
    ? (form.kbb_trade_in * 0.95 - parseFloat(form.repair_estimate) - parseFloat(form.contingency) - parseFloat(form.iaa_fees) - parseFloat(form.tax_reg_insurance)).toFixed(2)
    : '—'

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h1>Add New Car</h1>
      <button onClick={() => navigate('/')}>← Back</button>
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>

        <h3>Car Info</h3>
        <input name="make" placeholder="Make (e.g. Chevy)" onChange={handleChange} /><br />
        <input name="model" placeholder="Model (e.g. Equinox)" onChange={handleChange} /><br />
        <input name="year" placeholder="Year" type="number" onChange={handleChange} /><br />
        <input name="vin" placeholder="VIN" onChange={handleChange} /><br />
        <input name="mileage" placeholder="Mileage" type="number" onChange={handleChange} /><br />

        <select name="drivetrain" onChange={handleChange}>
          <option value="AWD">AWD</option>
          <option value="FWD">FWD</option>
        </select><br />

        <select name="title_status" onChange={handleChange}>
          <option value="salvage">Salvage</option>
          <option value="rebuilt">Rebuilt</option>
          <option value="clear">Clear</option>
        </select><br />

        <input name="damage_type" placeholder="Damage type (e.g. front)" onChange={handleChange} /><br />

        <h3>Valuation</h3>
        <input name="kbb_trade_in" placeholder="KBB Good Trade-In" type="number" onChange={handleChange} /><br />
        <input name="kbb_private" placeholder="KBB Private Party" type="number" onChange={handleChange} /><br />
        <input name="iaa_acv" placeholder="IAA ACV" type="number" onChange={handleChange} /><br />

        <h3>Costs</h3>
        <input name="repair_estimate" placeholder="Repair Estimate" type="number" onChange={handleChange} /><br />
        <input name="contingency" placeholder="Contingency Buffer" type="number" onChange={handleChange} /><br />
        <input name="labor_hours" placeholder="Labor Hours" type="number" onChange={handleChange} /><br />
        <input name="labor_rate" placeholder="Labor Rate ($/hr)" type="number" onChange={handleChange} defaultValue="50" /><br />
        <input name="iaa_fees" placeholder="IAA Fees" type="number" onChange={handleChange} /><br />
        <input name="tax_reg_insurance" placeholder="Tax, Reg & Insurance" type="number" onChange={handleChange} /><br />
        <input name="actual_bid" placeholder="Your Bid" type="number" onChange={handleChange} /><br />
        <input name="iaa_cost" placeholder="Total IAA Cost" type="number" onChange={handleChange} /><br />

        <h3>Calculated</h3>
        <p>Target Sell Price (95% KBB trade): <strong>${targetSellPrice}</strong></p>
        <p>Estimated Total Cost: <strong>${totalCost}</strong></p>
        <p>Max Bid: <strong>${maxBid}</strong></p>

        <br />
        <button type="submit">Save Car</button>
      </form>
    </div>
  )
}

export default AddCar