import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { customersApi } from '../api/customers'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'
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
      const response = await customersApi.list({
        limit: PAGE_SIZE,
        offset,
        search: searchQuery || undefined,
      })
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
    setEditingCustomer(null)
    setCreateForm(EMPTY_CREATE_FORM)
    setEmailError('')
    setPhoneError('')
    setShowModal(true)
  }

  function openEditModal(customer) {
    setEditingCustomer(customer)
    setEditForm({ full_name: customer.full_name, phone: customer.phone })
    setEmailError('')
    setPhoneError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingCustomer(null)
    setEmailError('')
    setPhoneError('')
  }

  function extractPhoneDigitsAfterCode(fullPhone) {
    return fullPhone.replace(/^\+\d{1,4}/, '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setEmailError('')
    setPhoneError('')

    if (editingCustomer) {
      const phoneDigits = extractPhoneDigitsAfterCode(editForm.phone)
      const phoneValidationError = buildPhoneValidationError(phoneDigits)
      if (phoneValidationError) {
        setPhoneError(phoneValidationError)
        return
      }
      setIsSaving(true)
      try {
        await customersApi.update(editingCustomer.id, {
          full_name: editForm.full_name.trim(),
          phone: editForm.phone,
        })
        addToast('Customer updated successfully')
        closeModal()
        loadCustomers()
      } catch (error) {
        addToast(error.response?.data?.detail || 'Failed to update customer', 'error')
      } finally {
        setIsSaving(false)
      }
    } else {
      if (!isValidEmail(createForm.email)) {
        setEmailError('Please enter a valid email address')
        return
      }
      const phoneDigits = extractPhoneDigitsAfterCode(createForm.phone)
      const phoneValidationError = buildPhoneValidationError(phoneDigits)
      if (phoneValidationError) {
        setPhoneError(phoneValidationError)
        return
      }
      setIsSaving(true)
      try {
        await customersApi.create({
          full_name: createForm.full_name.trim(),
          email: createForm.email.trim().toLowerCase(),
          phone: createForm.phone,
        })
        addToast('Customer created successfully')
        closeModal()
        loadCustomers()
      } catch (error) {
        addToast(error.response?.data?.detail || 'Failed to create customer', 'error')
      } finally {
        setIsSaving(false)
      }
    }
  }

  async function handleDelete(customer) {
    if (!window.confirm(`Delete "${customer.full_name}"? This cannot be undone.`)) return
    try {
      await customersApi.remove(customer.id)
      addToast('Customer deleted')
      loadCustomers()
    } catch (error) {
      addToast(error.response?.data?.detail || CUSTOMER_DELETE_FALLBACK_ERROR, 'error')
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <button onClick={openCreateModal} className="button">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="w-72">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={clearSearch}
          placeholder="Search by name or email…"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Phone</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={4}><EmptyState title="Loading customers…" /></td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    icon={Users}
                    title="No customers found"
                    description={searchQuery ? 'Try a different search term.' : 'Add your first customer to get started.'}
                  />
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                    {customer.full_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{customer.email}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{customer.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(customer)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {currentPage} of {totalPages} — {total} customers</span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset((prev) => Math.max(0, prev - PAGE_SIZE))}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {editingCustomer ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {editingCustomer ? (
                <>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      value={editingCustomer.email}
                      disabled
                      className={`${inputClass} opacity-50 cursor-not-allowed`}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Email address cannot be changed after creation.
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                    <input
                      required
                      value={editForm.full_name}
                      onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                      className={inputClass}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
                    <PhoneInput
                      key={editingCustomer.id}
                      initialValue={editingCustomer.phone}
                      onChange={(phone) => setEditForm((f) => ({ ...f, phone }))}
                      error={phoneError}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                    <input
                      required
                      value={createForm.full_name}
                      onChange={(e) => setCreateForm((f) => ({ ...f, full_name: e.target.value }))}
                      className={inputClass}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="email"
                      value={createForm.email}
                      onChange={(e) => {
                        setCreateForm((f) => ({ ...f, email: e.target.value }))
                        if (emailError) setEmailError('')
                      }}
                      className={`${inputClass} ${emailError ? 'border-red-400 focus:ring-red-400' : ''}`}
                      placeholder="name@example.com"
                    />
                    {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
                    <PhoneInput
                      key="create"
                      initialValue=""
                      onChange={(phone) => {
                        setCreateForm((f) => ({ ...f, phone }))
                        if (phoneError) setPhoneError('')
                      }}
                      error={phoneError}
                      required
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className={secondaryButtonClass}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="button">
                  {isSaving ? 'Saving…' : editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
const inputClass =
  'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400'
const secondaryButtonClass =
  'px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium transition-colors'
