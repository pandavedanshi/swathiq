import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { inventoryAPI } from '../api'

const defaultForm = {
  name: '', generic_name: '', category: '', batch_no: '',
  expiry_date: '', quantity: '', cost_price: '', mrp: '',
  supplier: '', status: 'active'
}

export default function MedicineModal({ medicine, onSuccess, onClose }) {
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const isEdit = !!medicine

  useEffect(() => {
    if (medicine) {
      setForm({
        name: medicine.name || '',
        generic_name: medicine.generic_name || '',
        category: medicine.category || '',
        batch_no: medicine.batch_no || '',
        expiry_date: medicine.expiry_date ? medicine.expiry_date.slice(0, 10) : '',
        quantity: medicine.quantity ?? '',
        cost_price: medicine.cost_price ?? '',
        mrp: medicine.mrp ?? '',
        supplier: medicine.supplier || '',
        status: medicine.status || 'active'
      })
    }
  }, [medicine])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) return setError('Medicine name is required')
    try {
      setLoading(true)
      const payload = {
        ...form,
        quantity: parseInt(form.quantity) || 0,
        cost_price: parseFloat(form.cost_price) || 0,
        mrp: parseFloat(form.mrp) || 0,
        expiry_date: form.expiry_date || null
      }
      if (isEdit) await inventoryAPI.updateMedicine(medicine.id, payload)
      else await inventoryAPI.addMedicine(payload)
      onSuccess()
    } catch {
      setError('Failed to save medicine')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? 'Edit Medicine' : 'Add New Medicine'}</div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            {[
              { label: 'Medicine Name *', key: 'name', placeholder: 'e.g. Paracetamol 650mg' },
              { label: 'Generic Name', key: 'generic_name', placeholder: 'e.g. Acetaminophen' },
              { label: 'Category', key: 'category', placeholder: 'e.g. Analgesic' },
              { label: 'Batch No', key: 'batch_no', placeholder: 'e.g. PCM-2024-0892' },
              { label: 'Expiry Date', key: 'expiry_date', type: 'date' },
              { label: 'Quantity', key: 'quantity', type: 'number', placeholder: '0' },
              { label: 'Cost Price (₹)', key: 'cost_price', type: 'number', step: '0.01', placeholder: '0.00' },
              { label: 'MRP (₹)', key: 'mrp', type: 'number', step: '0.01', placeholder: '0.00' },
              { label: 'Supplier', key: 'supplier', placeholder: 'e.g. MediSupply Co.' },
            ].map(({ label, key, type = 'text', placeholder, step }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input
                  className="form-input form-input-full"
                  type={type}
                  step={step}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={set(key)}
                />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select form-input-full" value={form.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="low_stock">Low Stock</option>
                <option value="expired">Expired</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
