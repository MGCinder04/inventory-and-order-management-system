import { useEffect, useState, useCallback } from 'react'
import { Pencil, Trash2, Users } from 'lucide-react'
import { customersApi } from '../api/customers'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'
import { AnimatedButton } from '../components/AnimatedButton'
import { PageLoader } from '../components/PageLoader'
import { TypewriterText } from '../components/TypewriterText'
import { PhoneInput } from '../components/PhoneInput'
import { useToast } from '../hooks/useToast'
import { useSearch } from '../hooks/useSearch'
import { isValidEmail, buildPhoneValidationError } from '../utils/validators'

const PAGE_SIZE = 20
const CUSTOMER_DELETE_FALLBACK_ERROR = 'Failed to delete customer'

const EMPTY_CREATE_FORM = { full_name: '', email: '', phone: '' }
const EMPTY_EDIT_FORM = { full_name: '', phone: '' }

export default function Customers() {
  const { addToast } = useToast()
  const { searchQuery, setSearchQuery, clearSearch } = useSearch()
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM)
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const loadCustomers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await customersApi.list({ limit: PAGE_SIZE, offset, search: searchQuery || undefined })
      setCustomers(response.data.items)
      setTotal(response.data.total)
    } catch {
      addToast('Failed to load customers', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [offset, searchQuery, addToast])

  useEffect(() => { setOffset(0) }, [searchQuery])
  useEffect(() => { loadCustomers() }, [loadCustomers])

  function openCreateModal() {
    setEditingCustomer(null); setCreateForm(EMPTY_CREATE_FORM)
    setEmailError(''); setPhoneError(''); setShowModal(true)
  }
  function openEditModal(c) {
    setEditingCustomer(c); setEditForm({ full_name: c.full_name, phone: c.phone })
    setEmailError(''); setPhoneError(''); setShowModal(true)
  }
  function closeModal() { setShowModal(false); setEditingCustomer(null); setEmailError(''); setPhoneError('') }

  function extractDigitsAfterCode(fullPhone) { return fullPhone.replace(/^\+\d{1,4}/, '') }

  async function handleSubmit(e) {
    e.preventDefault()
    setEmailError(''); setPhoneError('')

    if (editingCustomer) {
      const phoneErr = buildPhoneValidationError(extractDigitsAfterCode(editForm.phone))
      if (phoneErr) { setPhoneError(phoneErr); return }
      setIsSaving(true)
      try {
        await customersApi.update(editingCustomer.id, { full_name: editForm.full_name.trim(), phone: editForm.phone })
        addToast('Customer updated'); closeModal(); loadCustomers()
      } catch (error) {
        addToast(error.response?.data?.detail || 'Failed to update customer', 'error')
      } finally { setIsSaving(false) }
    } else {
      if (!isValidEmail(createForm.email)) { setEmailError('Please enter a valid email address'); return }
      const phoneErr = buildPhoneValidationError(extractDigitsAfterCode(createForm.phone))
      if (phoneErr) { setPhoneError(phoneErr); return }
      setIsSaving(true)
      try {
        await customersApi.create({ full_name: createForm.full_name.trim(), email: createForm.email.trim().toLowerCase(), phone: createForm.phone })
        addToast('Customer created'); closeModal(); loadCustomers()
      } catch (error) {
        addToast(error.response?.data?.detail || 'Failed to create customer', 'error')
      } finally { setIsSaving(false) }
    }
  }

  async function handleDelete(customer) {
    if (!window.confirm(`Delete "${customer.full_name}"?`)) return
    try {
      await customersApi.remove(customer.id)
      addToast('Customer deleted'); loadCustomers()
    } catch (error) {
      addToast(error.response?.data?.detail || CUSTOMER_DELETE_FALLBACK_ERROR, 'error')
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <TypewriterText text="Customers" speed={60} />
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{total} registered</p>
        </div>
        <AnimatedButton onClick={openCreateModal}>Add Customer</AnimatedButton>
      </div>

      <div className="w-72">
        <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={clearSearch} placeholder="Search by name or email…" />
      </div>

      <div className="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#141516] border-b border-gray-200 dark:border-white/[0.06]">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Phone</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {isLoading ? (
              <tr><td colSpan={4}><PageLoader message="Loading customers…" /></td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={4}>
                <EmptyState icon={Users} title="No customers found"
                  description={searchQuery ? 'Try a different search term.' : 'Add your first customer.'} />
              </td></tr>
            ) : customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150">
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{c.full_name}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.email}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEditModal(c)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={offset === 0} onClick={() => setOffset((p) => Math.max(0, p - PAGE_SIZE))} className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">Previous</button>
            <button disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset((p) => p + PAGE_SIZE)} className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">Next</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content bg-white dark:bg-[#1e2029] rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
              <h2 className="font-bold text-gray-900 dark:text-white">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={closeModal} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {editingCustomer ? (
                <>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input value={editingCustomer.email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed after creation.</p>
                  </div>
                  <div>
                    <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                    <input required value={editForm.full_name} onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))} className={inputClass} placeholder="Full name" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
                    <PhoneInput key={editingCustomer.id} initialValue={editingCustomer.phone} onChange={(ph) => setEditForm((f) => ({ ...f, phone: ph }))} error={phoneError} required />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                    <input required value={createForm.full_name} onChange={(e) => setCreateForm((f) => ({ ...f, full_name: e.target.value }))} className={inputClass} placeholder="Full name" />
                  </div>
                  <div>
                    <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                    <input required type="email" value={createForm.email}
                      onChange={(e) => { setCreateForm((f) => ({ ...f, email: e.target.value })); if (emailError) setEmailError('') }}
                      className={`${inputClass} ${emailError ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="name@example.com" />
                    {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
                    <PhoneInput key="create" initialValue="" onChange={(ph) => { setCreateForm((f) => ({ ...f, phone: ph })); if (phoneError) setPhoneError('') }} error={phoneError} required />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className={secondaryButtonClass}>Cancel</button>
                <AnimatedButton type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : editingCustomer ? 'Update' : 'Create'}</AnimatedButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const labelClass = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1'
const inputClass = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a2038] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400'
const secondaryButtonClass = 'px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 rounded-full text-sm font-semibold transition-colors'
