'use client'

import { useState, useEffect } from 'react'
import { Phone, Mail, Calendar, Tag, MessageSquare, Trash2, Check, X, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Consultation {
  id: string
  name: string
  email: string
  phone: string
  category: string
  message: string
  status: string
  createdAt: string
  notes?: string
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/custom-jewellery`)
      const data = await response.json()
      if (data.success) {
        setConsultations(data.data)
      }
    } catch (error) {
      console.error('Error fetching consultations:', error)
      toast.error('Failed to load consultations')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/custom-jewellery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Status updated successfully')
        fetchConsultations()
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const deleteConsultation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this consultation?')) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/custom-jewellery/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Consultation deleted')
        fetchConsultations()
      }
    } catch (error) {
      console.error('Error deleting consultation:', error)
      toast.error('Failed to delete consultation')
    }
  }

  const filteredConsultations = filter === 'all' 
    ? consultations 
    : consultations.filter(c => c.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'inprogress': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom Jewellery Consultations</h1>
          <p className="text-gray-600">Manage customer consultation requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'contacted', 'inprogress', 'completed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-[#C9A84C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span className="ml-2 text-xs">
                    ({consultations.filter(c => c.status === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-900">{consultations.length}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-yellow-800">
              {consultations.filter(c => c.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-700">Pending</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-purple-800">
              {consultations.filter(c => c.status === 'inprogress').length}
            </div>
            <div className="text-sm text-purple-700">In Progress</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-800">
              {consultations.filter(c => c.status === 'completed').length}
            </div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
        </div>

        {/* Consultations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A84C]"></div>
            <p className="mt-4 text-gray-600">Loading consultations...</p>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No consultations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <div key={consultation.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{consultation.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        {consultation.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        {consultation.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        {new Date(consultation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(consultation.status)}`}>
                      {consultation.status}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Tag size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="text-gray-600">{consultation.category}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare size={16} className="text-gray-400 mt-1" />
                      <p className="text-gray-700 text-sm leading-relaxed">{consultation.message}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <button
                    onClick={() => updateStatus(consultation.id, 'contacted')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Phone size={16} />
                    Contacted
                  </button>
                  <button
                    onClick={() => updateStatus(consultation.id, 'inprogress')}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors flex items-center gap-2"
                  >
                    <Clock size={16} />
                    In Progress
                  </button>
                  <button
                    onClick={() => updateStatus(consultation.id, 'completed')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Check size={16} />
                    Completed
                  </button>
                  <button
                    onClick={() => updateStatus(consultation.id, 'cancelled')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteConsultation(consultation.id)}
                    className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
