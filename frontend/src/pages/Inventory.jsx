import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, Download, Package, CheckCircle, AlertTriangle, DollarSign, Edit2, Trash2, MoreVertical } from 'lucide-react'
import { inventoryAPI } from '../api'
import MedicineModal from '../components/MedicineModal'

const STATUS_MAP = {
  active: 'Active',
  low_stock: 'Low Stock',
  expired: 'Expired',
  out_of_stock: 'Out of Stock'
}

export default function Inventory() {
  const [overview, setOverview] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editMedicine, setEditMedicine] = useState(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (categoryFilter) params.category = categoryFilter
      const [ovRes, medRes, catRes] = await Promise.all([
        inventoryAPI.getOverview(),
        inventoryAPI.getMedicines(params),
        inventoryAPI.getCategories()
      ])
      setOverview(ovRes.data)
      setMedicines(medRes.data)
      setCategories(catRes.data)
    } catch {
      setError('Failed to load inventory. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, categoryFilter])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine?')) return
    try {
      await inventoryAPI.deleteMedicine(id)
      fetchAll()
    } catch {
      alert('Failed to delete medicine')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await inventoryAPI.updateStatus(id, status)
      fetchAll()
    } catch {
      alert('Failed to update status')
    }
  }

  const formatCurrency = (v) => `₹${Number(v).toLocaleString('en-IN')}`

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Pharmacy CRM</div>
          <div className="page-subtitle">Manage inventory, sales, and purchase orders</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary"><Download size={14} /> Export</button>
          <button className="btn btn-primary" onClick={() => { setEditMedicine(null); setShowModal(true) }}>
            <Plus size={14} /> Add Medicine
          </button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {overview && (
        <div className="inv-overview">
          <div className="inv-overview-item">
            <div className="inv-overview-label"><Package size={14} color="#3b82f6" /> Total Items</div>
            <div className="inv-overview-value">{overview.total_items}</div>
          </div>
          <div className="inv-overview-item">
            <div className="inv-overview-label"><CheckCircle size={14} color="#10b981" /> Active Stock</div>
            <div className="inv-overview-value">{overview.active_stock}</div>
          </div>
          <div className="inv-overview-item">
            <div className="inv-overview-label"><AlertTriangle size={14} color="#f59e0b" /> Low Stock</div>
            <div className="inv-overview-value">{overview.low_stock}</div>
          </div>
          <div className="inv-overview-item">
            <div className="inv-overview-label"><DollarSign size={14} color="#8b5cf6" /> Total Value</div>
            <div className="inv-overview-value" style={{ fontSize: 22 }}>{formatCurrency(overview.total_value)}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Complete Inventory</span>
          <div className="filter-row">
            <div className="search-bar">
              <Search size={14} color="var(--text-muted)" />
              <input
                placeholder="Search medicines..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ height: 36 }}
            >
              <option value="">All Status</option>
              {Object.entries(STATUS_MAP).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ height: 36 }}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn btn-secondary btn-sm"><Filter size={13} /> Filter</button>
            <button className="btn btn-secondary btn-sm"><Download size={13} /> Export</button>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading inventory...</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Generic Name</th>
                  <th>Category</th>
                  <th>Batch No</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                  <th>Cost Price</th>
                  <th>MRP</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.length === 0 ? (
                  <tr>
                    <td colSpan={11}>
                      <div className="empty-state">
                        <div className="empty-state-icon">🏷️</div>
                        No medicines found
                      </div>
                    </td>
                  </tr>
                ) : medicines.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 500 }}>{m.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{m.generic_name || '—'}</td>
                    <td>{m.category || '—'}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{m.batch_no || '—'}</td>
                    <td>{m.expiry_date ? String(m.expiry_date).slice(0, 10) : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                    <td>{m.cost_price ? formatCurrency(m.cost_price) : '—'}</td>
                    <td>{m.mrp ? formatCurrency(m.mrp) : '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{m.supplier || '—'}</td>
                    <td>
                      <span className={`status-badge status-${m.status}`}>
                        {STATUS_MAP[m.status] || m.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => { setEditMedicine(m); setShowModal(true) }}
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => handleDelete(m.id)}
                          title="Delete"
                          style={{ color: 'var(--accent-red)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <MedicineModal
          medicine={editMedicine}
          onSuccess={() => { setShowModal(false); fetchAll() }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
