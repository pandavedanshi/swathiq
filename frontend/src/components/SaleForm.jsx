import { useState } from "react"
import { salesAPI } from "../api"

export default function SaleForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({ customer_name: "", total_amount: "", payment_mode: "Cash" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.total_amount) return setError("Total amount is required")
    try {
      setLoading(true)
      await salesAPI.createSale({
        customer_name: form.customer_name || "Walk-in Customer",
        total_amount: parseFloat(form.total_amount),
        payment_mode: form.payment_mode
      })
      onSuccess()
    } catch { setError("Failed to create sale") }
    finally { setLoading(false) }
  }

  return (
    <div className="sale-form">
      <div className="sale-form-title">Make a Sale</div>
      <div className="sale-form-sub">Select medicines from inventory</div>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input className="form-input" placeholder="Patient ID / Customer Name" style={{ flex: 1 }} value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} />
          <select className="form-select" value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })}>
            <option>Cash</option><option>Card</option><option>UPI</option>
          </select>
          <input className="form-input" type="number" placeholder="Total Amount (₹)" style={{ width: 160 }} value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })} />
          <button type="submit" className="btn btn-blue" disabled={loading}>{loading ? "Creating..." : "Bill"}</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  )
}