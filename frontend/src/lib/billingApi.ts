import { api } from './api'
import { Invoice, Order, Customer } from '@/store/adminStore'

// Invoice API functions
export const invoiceApi = {
  // Get all invoices
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ invoices: any[]; pagination: any }>('/invoices', params),

  // Create new invoice - backend expects specific structure
  create: (invoiceData: any) =>
    api.post<any>('/invoices', invoiceData),

  // Update invoice
  update: (id: string, updates: any) =>
    api.put<any>(`/invoices/${id}`, updates),

  // Delete invoice
  delete: (id: string) =>
    api.delete(`/invoices/${id}`),

  // Get single invoice
  getById: (id: string) =>
    api.get<any>(`/invoices/${id}`),

  // Resend WhatsApp
  resendWhatsApp: (id: string) =>
    api.post(`/invoices/${id}/resend-whatsapp`),

  // Get GST summary
  getGSTSummary: (params?: { month?: number; year?: number }) =>
    api.get<any>('/invoices/gst-summary', params)
}

// Order API functions  
export const orderApi = {
  // Get all orders (admin)
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<{ orders: any[]; pagination: any }>('/orders', params),

  // Update order status
  updateStatus: (id: string, status: string) =>
    api.put<any>(`/orders/${id}/status`, { status }),

  // Delete order
  delete: (id: string) =>
    api.delete(`/orders/${id}`),

  // Get single order
  getById: (id: string) =>
    api.get<any>(`/orders/${id}`)
}

// Customer API functions
export const customerApi = {
  // Get all customers
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ customers: any[]; pagination: any }>('/customers', params),

  // Create customer
  create: (customerData: any) =>
    api.post<any>('/customers', customerData),

  // Update customer
  update: (id: string, updates: any) =>
    api.put<any>(`/customers/${id}`, updates),

  // Delete customer
  delete: (id: string) =>
    api.delete(`/customers/${id}`),

  // Get single customer
  getById: (id: string) =>
    api.get<any>(`/customers/${id}`)
}

// Admin functions
export const adminApi = {
  // Clear all billing data
  clearBillingData: () =>
    api.delete('/admin/clear-billing-data'),

  // Get dashboard stats
  getDashboardStats: () =>
    api.get<{
      invoices: { total: number; totalAmount: number; totalGst: number };
      orders: Record<string, number>;
      customers: number;
    }>('/admin/dashboard-stats')
}

// Utility function to handle API errors
export const handleApiError = (error: any) => {
  console.error('API Error:', error)
  let errorMessage = 'An unexpected error occurred'
  
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message
  } else if (error.response?.status === 404) {
    errorMessage = 'Item not found'
  } else if (error.response?.status === 401) {
    errorMessage = 'Unauthorized access'
  } else if (error.response?.status === 403) {
    errorMessage = 'Forbidden action'
  } else if (error.message) {
    errorMessage = error.message
  }
  
  throw new Error(errorMessage)
}