import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import {
  invoiceApi,
  orderApi,
  customerApi,
  adminApi,
  handleApiError,
} from "@/lib/billingApi";

// ── Types ─────────────────────────────────────────────────────────────────
export type AdminRole =
  | "customer"
  | "sales_staff"
  | "inventory_manager"
  | "store_manager"
  | "admin"
  | "super_admin";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";
export type CustomerTier = "bronze" | "silver" | "gold" | "platinum";
export type ProductStatus = "active" | "out_of_stock" | "draft";
export type LogType =
  | "auth"
  | "order"
  | "product"
  | "billing"
  | "settings"
  | "crm"
  | "inventory";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  status: "active" | "inactive";
  joined: string;
  lastLogin: string;
  avatar: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  metal: string;
  weight: string;
  price: number;
  stock: number;
  status: ProductStatus;
  rating: number;
  sales: number;
  description?: string;
  images?: string[];
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  payment: string;
  address?: string;
  notes?: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

// A single line item on an invoice. Multiple of these can exist per
// invoice (multi-item billing). `category`/`subCategory` come from the
// Gold/Silver taxonomy in billing/page.tsx; `metalType` records which of
// the two lists it was picked from.
export interface InvoiceLineItem {
  metalType: "Gold" | "Silver";
  category: string;
  subCategory?: string;
  purity: string;
  netWeight: string;
  goldRate: number;
  makingCharges: number;
  price: number;
}

export interface Invoice {
  id: string;
  order?: string;
  customer: string;
  email?: string;
  phone?: string;
  hallmarkId?: string;
  // Full multi-item breakdown. When present, this is the source of truth
  // for what's shown on the invoice and how totals are calculated.
  items?: InvoiceLineItem[];
  // Legacy/convenience single-item fields, kept for the invoices table
  // and for invoices created before multi-item support existed. Always
  // mirror items[0] for invoices that have `items` set.
  category?: string;
  metal?: string;
  purity?: string;
  netWeight?: string;
  price?: number;
  goldRate?: number;
  makingCharges?: number;
  amount: number;
  gst: number;
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  discount?: number;
  // Display-only field ("Less URD"). Shown on the invoice exactly like the
  // other amount lines, but intentionally never read by any amount/GST/
  // total calculation anywhere in this file — it is cosmetic only.
  lessURD?: number;
  paymentHistory?: Array<{
    amount: number;
    date: string;
    mode: string;
    notes?: string;
  }>;
  status: InvoiceStatus;
  date: string;
  due: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  metal: string;
  stock: number;
  minStock: number;
  maxStock: number;
  value: number;
  location: string;
  lastUpdated: string;
  trend: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  totalSpend: number;
  orders: number;
  tier: CustomerTier;
  lastVisit: string;
  birthday: string;
  tags: string[];
  notes?: string;
}

export interface AuditLog {
  id: number;
  type: LogType;
  action: string;
  user: string;
  role: string;
  ip: string;
  time: string;
  details: string;
}

export interface GoldRates {
  "24K": string;
  "22K": string;
  "18K": string;
  "14K": string;
}

interface BackendOrder {
  orderNumber?: string;
  _id?: string;
  id?: string;
  customerName?: string;
  customer?: string;
  customerEmail?: string;
  email?: string;
  customerPhone?: string;
  phone?: string;
  items?: OrderItem[];
  totalAmount?: number;
  total?: number;
  status?: string;
  createdAt?: string;
  paymentMode?: string;
  payment?: string;
}

interface BackendInvoice {
  invoiceNumber?: string;
  _id: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  totalAmount?: number;
  status?: string;
  createdAt?: string;
  notes?: string;
  items?: Array<{
    purity?: string;
    netWeight?: number;
    goldRate?: number;
    makingCharges?: number;
  }>;
}

interface BackendCustomer {
  _id?: string;
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  totalPurchases?: number;
  segment?: string;
  updatedAt?: string;
  dateOfBirth?: string;
  tags?: string[];
}

// ── Initial Data ──────────────────────────────────────────────────────────
const initialUsers: AdminUser[] = [
  {
    id: 1,
    name: "Rajesh Sharma",
    email: "rajesh@ratanjewellers.com",
    role: "super_admin",
    status: "active",
    joined: "Jan 2022",
    lastLogin: "2 hrs ago",
    avatar: "RS",
    phone: "+91 98765 43210",
  },
  {
    id: 2,
    name: "Priya Mehta",
    email: "priya@ratanjewellers.com",
    role: "admin",
    status: "active",
    joined: "Mar 2023",
    lastLogin: "1 day ago",
    avatar: "PM",
    phone: "+91 87654 32109",
  },
];

const initialProducts: Product[] = [];

const SEED_PRODUCT_IDS = new Set([
  "RJ001",
  "RJ002",
  "RJ003",
  "RJ004",
  "RJ005",
  "RJ006",
  "RJ007",
  "RJ008",
]);

const stripSeedProducts = (products: Product[] | undefined) =>
  (products ?? []).filter((product) => !SEED_PRODUCT_IDS.has(product.id));

const initialOrders: Order[] = [
  {
    id: "RJ-4821",
    customer: "Demo Customer",
    email: "demo@example.com",
    phone: "+91 98765 43210",
    items: [
      {
        name: "Gold Chain",
        qty: 1,
        price: 50000,
      },
    ],
    total: 50000,
    status: "delivered",
    date: "13 Jun 2026",
    payment: "UPI",
  },
];

const initialInvoices: Invoice[] = [
  {
    id: "INV-2049",
    customer: "Demo Customer",
    phone: "+91 98765 43210",
    amount: 50000,
    gst: 1500,
    total: 51500,
    status: "paid",
    date: "13 Jun 2026",
    due: "—",
    category: "Necklaces",
    metal: "22K Gold",
    purity: "916",
    netWeight: "8.5",
    goldRate: 14525,
    makingCharges: 10,
    price: 5000,
  },
];

const initialInventory: InventoryItem[] = [];

const initialCustomers: Customer[] = [
  {
    id: "CRM-001",
    name: "Demo Customer",
    phone: "+91 98765 43210",
    email: "demo@example.com",
    city: "Pune",
    totalSpend: 50000,
    orders: 1,
    tier: "gold",
    lastVisit: "13 Jun 2026",
    birthday: "15 May 1990",
    tags: ["VIP"],
  },
];

const initialLogs: AuditLog[] = [
  {
    id: 1,
    type: "auth",
    action: "Admin login",
    user: "Rajesh Sharma",
    role: "Super Admin",
    ip: "192.168.1.10",
    time: "04 Jun 2026, 10:24 AM",
    details: "Logged in from Chrome/Windows",
  },
];

// ── Store ─────────────────────────────────────────────────────────────────
interface AdminStore {
  users: AdminUser[];
  products: Product[];
  orders: Order[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  customers: Customer[];
  auditLogs: AuditLog[];
  goldRates: GoldRates;
  currentRole: AdminRole;

  loading: {
    invoices: boolean;
    orders: boolean;
    customers: boolean;
  };

  addUser: (u: Omit<AdminUser, "id">) => void;
  updateUser: (id: number, data: Partial<AdminUser>) => void;
  deleteUser: (id: number) => void;
  toggleUserStatus: (id: number) => void;

  addProduct: (p: Omit<Product, "id" | "rating" | "sales">) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  clearSeedProducts: () => void;

  addOrder: (o: Omit<Order, "id" | "date">) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  updateOrder: (id: string, data: Partial<Order>) => void;
  deleteOrder: (id: string) => Promise<void>;
  fetchOrders: () => Promise<void>;

  addInvoice: (inv: Omit<Invoice, "id">) => Promise<void>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  fetchInvoices: () => Promise<void>;
  generateInvoiceForOrder: (orderId: string) => void;
  sendInvoiceEmail: (id: string) => Promise<void>;
  exportInvoicePDF: (id: string) => void;

  addInventoryItem: (item: Omit<InventoryItem, "id" | "lastUpdated">) => void;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  addCustomer: (c: Omit<Customer, "id">) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => Promise<void>;
  fetchCustomers: () => Promise<void>;
  addCustomerTag: (id: string, tag: string) => void;
  removeCustomerTag: (id: string, tag: string) => void;

  updateGoldRates: (rates: GoldRates) => void;

  setCurrentRole: (role: AdminRole) => void;

  addLog: (log: Omit<AuditLog, "id" | "time">) => void;

  resetAll: () => void;

  clearAllBillingData: () => Promise<void>;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      users: initialUsers,
      products: initialProducts,
      orders: initialOrders,
      invoices: initialInvoices,
      inventory: initialInventory,
      customers: initialCustomers,
      auditLogs: initialLogs,
      goldRates: {
        "24K": "14525",
        "22K": "13314",
        "18K": "10893",
        "14K": "8349",
      },
      currentRole: "super_admin",

      loading: {
        invoices: false,
        orders: false,
        customers: false,
      },

      // ── Users ──────────────────────────────────────────────────────────
      addUser: (userData) => {
        const newUser: AdminUser = {
          ...userData,
          id: Date.now(),
        };

        set((s) => ({
          users: [...s.users, newUser],
        }));

        get().addLog({
          type: "auth",
          action: "New user created",
          user: "Admin",
          role: "Admin",
          ip: "—",
          details: `${newUser.name} (${newUser.role})`,
        });

        toast.success(`User "${newUser.name}" created`);
      },

      updateUser: (id, data) => {
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        }));

        toast.success("User updated");
      },

      deleteUser: (id) => {
        const user = get().users.find((u) => u.id === id);

        set((s) => ({
          users: s.users.filter((u) => u.id !== id),
        }));

        get().addLog({
          type: "auth",
          action: "User deleted",
          user: "Admin",
          role: "Admin",
          ip: "—",
          details: `Deleted: ${user?.name}`,
        });

        toast.success("User deleted");
      },

      toggleUserStatus: (id) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id
              ? {
                  ...u,
                  status: u.status === "active" ? "inactive" : "active",
                }
              : u,
          ),
        }));

        toast.success("User status updated");
      },

      // ── Products ───────────────────────────────────────────────────────
      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: `RJ${String(Date.now()).slice(-3)}`,
          rating: 0,
          sales: 0,
        };

        set((s) => ({
          products: [newProduct, ...s.products],
        }));

        get().addLog({
          type: "product",
          action: "Product added",
          user: "Admin",
          role: "Admin",
          ip: "—",
          details: `Added: ${newProduct.name}`,
        });

        toast.success(`"${newProduct.name}" added`);
      },

      updateProduct: (id, data) => {
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...data } : p,
          ),
        }));

        toast.success("Product updated");
      },

      deleteProduct: (id) => {
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
        }));

        toast.success("Product deleted");
      },

      clearSeedProducts: () => {
        const cleaned = stripSeedProducts(get().products);

        if (cleaned.length !== get().products.length) {
          set({
            products: cleaned,
          });
        }
      },

      // ── Orders ─────────────────────────────────────────────────────────
      fetchOrders: async () => {
        try {
          set((s) => ({
            loading: {
              ...s.loading,
              orders: true,
            },
          }));

          const result = await orderApi.getAll();

          const frontendOrders: Order[] = (result.orders || []).map(
            (order: BackendOrder) => ({
              id: order.orderNumber || order._id || order.id || "",

              customer:
                order.customerName || order.customer || "Unknown Customer",

              email: order.customerEmail || order.email || "",

              phone: order.customerPhone || order.phone || "",

              items: order.items || [],

              total: order.totalAmount || order.total || 0,

              status: (order.status || "pending").toLowerCase() as OrderStatus,

              date: order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }),

              payment: order.paymentMode || order.payment || "Unknown",
            }),
          );

          set((s) => ({
            orders: frontendOrders,
            loading: {
              ...s.loading,
              orders: false,
            },
          }));
        } catch (error) {
          handleApiError(error);

          set((s) => ({
            loading: {
              ...s.loading,
              orders: false,
            },
          }));
        }
      },

      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: `RJ-${4822 + get().orders.length}`,
          date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        };

        set((s) => ({
          orders: [newOrder, ...s.orders],
        }));

        get().addLog({
          type: "order",
          action: "New order created",
          user: "Admin",
          role: "Admin",
          ip: "—",
          details: `${newOrder.id} for ${newOrder.customer}`,
        });

        toast.success(`Order ${newOrder.id} created`);
      },

      updateOrderStatus: async (id, status) => {
        try {
          await orderApi.updateStatus(id, status.toUpperCase());

          set((s) => ({
            orders: s.orders.map((o) =>
              o.id === id
                ? {
                    ...o,
                    status,
                  }
                : o,
            ),
          }));

          get().addLog({
            type: "order",
            action: "Order status updated",
            user: "Admin",
            role: "Admin",
            ip: "—",
            details: `${id} → ${status}`,
          });

          toast.success(`Order ${id} → ${status}`);
        } catch (error) {
          handleApiError(error);
        }
      },

      updateOrder: (id, data) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  ...data,
                }
              : o,
          ),
        }));

        toast.success("Order updated");
      },

      deleteOrder: async (id) => {
        try {
          await orderApi.delete(id);

          set((s) => ({
            orders: s.orders.filter((o) => o.id !== id),
          }));

          get().addLog({
            type: "order",
            action: "Order deleted",
            user: "Admin",
            role: "Admin",
            ip: "—",
            details: `Deleted order ${id}`,
          });

          toast.success(`Order ${id} deleted`);
        } catch (error) {
          handleApiError(error);
        }
      },

      // ── Invoices ───────────────────────────────────────────────────────
      fetchInvoices: async () => {
        try {
          set((s) => ({
            loading: { ...s.loading, invoices: true },
          }));

          const result = await invoiceApi.getAll();

          console.log("=== FETCH INVOICES DEBUG ===");
          console.log("Raw backend response:", result.invoices?.[0]);
          console.log("Total invoices:", result.invoices?.length);

          const frontendInvoices: Invoice[] = (result.invoices || []).map(
            (invoice: any) => {
              const total = invoice.totalAmount || 0;
              const paid = invoice.amountPaid || 0;
              const correctBalance = Math.max(total - paid, 0);

              const validStatuses = ["paid", "pending", "overdue", "draft"];

              const backendStatus: InvoiceStatus | null =
                validStatuses.includes(invoice.status)
                  ? (invoice.status as InvoiceStatus)
                  : null;

              const mapped: Invoice = {
                id: invoice.invoiceNumber || invoice._id,
                customer: invoice.customerName || "Unknown Customer",
                email: invoice.customerEmail || "",
                phone: invoice.customerPhone || "",
                hallmarkId: invoice.hallmarkId || "",
                amount: invoice.subtotal || 0,
                gst: (invoice.cgst || 0) + (invoice.sgst || 0),
                total: total,
                amountPaid: paid,
                balanceDue: correctBalance,
                discount: invoice.discountAmount || 0,
                paymentHistory: invoice.paymentHistory || [],

                // IMPORTANT:
                // Keep backend status when it is valid.
                // Do not recalculate/automatically change it from balance.
                status:
                  backendStatus || (correctBalance <= 0 ? "paid" : "pending"),

                date: invoice.createdAt
                  ? new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : new Date().toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }),

                due: "—",

                // Display-only value, stashed inside `notes` (the schema has no
                // dedicated column for it). Never fed back into any total/GST
                // calculation.
                lessURD: invoice.notes?.includes("Less URD:")
                  ? parseFloat(
                      invoice.notes.split("Less URD: ")[1]?.split(",")[0],
                    ) || undefined
                  : undefined,

                // Full multi-item breakdown, reconstructed from the backend's
                // generic items array. `name` was composed on creation as
                // "Category - SubCategory (Gold/Silver)" — split it back apart
                // for display. Older, pre-multi-item invoices simply won't match
                // this pattern and fall back to the raw name as the category.
                items: (invoice.items || []).map((it: any) => {
                  const nameMatch = (it.name || "").match(
                    /^(.*?)(?:\s*\(([^)]+)\))?$/,
                  );
                  const namePart = (nameMatch?.[1] || it.name || "").trim();
                  const metalPart = (nameMatch?.[2] || "").trim();
                  const [category, subCategory] = namePart.includes(" - ")
                    ? [
                        namePart.split(" - ")[0].trim(),
                        namePart.split(" - ").slice(1).join(" - ").trim(),
                      ]
                    : [namePart, undefined];
                  return {
                    metalType: (metalPart === "Silver" ? "Silver" : "Gold") as
                      | "Gold"
                      | "Silver",
                    category,
                    subCategory,
                    purity: it.purity || "",
                    netWeight: (it.netWeight ?? 0).toString(),
                    goldRate: it.goldRate || 0,
                    makingCharges: it.makingCharges || 0,
                    price: it.stoneCharges || 0,
                  };
                }),

                // Legacy/table-view convenience fields — mirror the first item so
                // the invoices table (which only has room for one row per
                // invoice) still shows something sensible. A "+N more" suffix on
                // category hints that there's more than one item.
                category: invoice.items?.[0]?.name
                  ? invoice.items[0].name +
                    (invoice.items.length > 1
                      ? ` (+${invoice.items.length - 1} more)`
                      : "")
                  : undefined,
                metal: undefined,
                purity: invoice.items?.[0]?.purity,
                netWeight: invoice.items?.[0]?.netWeight?.toString(),
                goldRate: invoice.items?.[0]?.goldRate,
                makingCharges: invoice.items?.[0]?.makingCharges,
                price: invoice.items?.[0]?.stoneCharges || 0,
              };

              return mapped;
            },
          );

          /*
           * IMPORTANT:
           * Do NOT blindly replace the current Zustand invoices.
           *
           * Existing local invoice values are preserved when the backend
           * response does not contain the latest value.
           */
          set((s) => {
            const currentInvoices = s.invoices;

            const mergedInvoices = frontendInvoices.map((serverInvoice) => {
              const localInvoice = currentInvoices.find(
                (local) => local.id === serverInvoice.id,
              );

              if (!localInvoice) {
                return serverInvoice;
              }

              return {
                ...serverInvoice,

                // Preserve the current UI/state values.
                // Backend values are still used for the rest of the invoice.
                status: localInvoice.status,
                amountPaid: localInvoice.amountPaid,
                balanceDue: localInvoice.balanceDue,
                paymentHistory: localInvoice.paymentHistory,
              };
            });

            return {
              invoices: mergedInvoices,
              loading: {
                ...s.loading,
                invoices: false,
              },
            };
          });
        } catch (error) {
          console.error("Failed to fetch invoices:", error);
          handleApiError(error);

          set((s) => ({
            loading: {
              ...s.loading,
              invoices: false,
            },
          }));
        }
      },

      addInvoice: async (invData) => {
        try {
          const backendData = {
            customerName: invData.customer,
            customerPhone: invData.phone || "",
            customerEmail: invData.email || "",
            hallmarkId: invData.hallmarkId || "",
            paymentMode: "CASH",

            status: invData.status,

            // One backend item per line item entered in the create-invoice
            // form. `name` bakes in Category/SubCategory/Metal since the
            // backend item schema has no dedicated columns for them —
            // fetchInvoices splits this string back apart on reload.
            items: (invData.items && invData.items.length > 0
              ? invData.items
              : [
                  {
                    metalType: "Gold" as const,
                    category: "Jewellery Item",
                    subCategory: "",
                    purity: "22KT(916)",
                    netWeight: "0",
                    goldRate: 7069,
                    makingCharges: 0,
                    price: 0,
                  },
                ]
            ).map((item) => ({
              name: `${item.category || "Jewellery Item"}${item.subCategory ? " - " + item.subCategory : ""} (${item.metalType})`,
              purity: item.purity || "—",
              netWeight: parseFloat(item.netWeight || "0") || 0,
              goldRate: item.goldRate || 0,
              makingCharges: item.makingCharges || 0,
              stoneCharges: item.price || 0,
              cgstRate: 1.5,
              sgstRate: 1.5,
              quantity: 1,
            })),

            discountAmount: invData.discount || 0,
            oldGoldExchange: 0,

            amountPaid: invData.amountPaid || 0,

            balanceDue:
              invData.balanceDue !== undefined
                ? invData.balanceDue
                : invData.total,

            paymentHistory: invData.paymentHistory || [],

            // "Less URD" has no dedicated backend column — it's a display-only
            // value, so it's stashed in `notes` purely so it survives a
            // page refresh. It is never read into subtotal/GST/discount/
            // total math anywhere.
            notes: invData.lessURD ? `Less URD: ${invData.lessURD}` : "",
          };

          const result = await invoiceApi.create(backendData);

          const newInvoice = result.data;

          const frontendInvoice: Invoice = {
            id: newInvoice.invoiceNumber,

            customer: newInvoice.customerName,

            email: newInvoice.customerEmail || "",

            phone: newInvoice.customerPhone,

            hallmarkId: newInvoice.hallmarkId || invData.hallmarkId || '',

            amount: newInvoice.subtotal,

            gst: (newInvoice.cgst || 0) + (newInvoice.sgst || 0),

            total: newInvoice.totalAmount,

            amountPaid: newInvoice.amountPaid || invData.amountPaid || 0,

            balanceDue:
              newInvoice.balanceDue !== undefined
                ? newInvoice.balanceDue
                : invData.balanceDue !== undefined
                  ? invData.balanceDue
                  : invData.total,

            discount:
              newInvoice.discountAmount !== undefined
                ? newInvoice.discountAmount
                : invData.discount || 0,

            paymentHistory:
              newInvoice.paymentHistory || invData.paymentHistory || [],

            status: invData.status || "paid",

            date: new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),

            due: "—",

            // Store the full itemized breakdown exactly as entered — no
            // need to wait for a refetch, we already have it.
            items: invData.items,

            // Legacy/table-view convenience fields, mirroring item 1.
            category: invData.items?.[0]
              ? `${invData.items[0].category}${invData.items[0].subCategory ? " - " + invData.items[0].subCategory : ""}${invData.items.length > 1 ? ` (+${invData.items.length - 1} more)` : ""}`
              : undefined,

            metal: invData.items?.[0]?.metalType,

            purity: invData.items?.[0]?.purity,

            netWeight: invData.items?.[0]?.netWeight,

            goldRate: invData.items?.[0]?.goldRate,

            makingCharges: invData.items?.[0]?.makingCharges,

            price: invData.items?.[0]?.price,

            lessURD: invData.lessURD,
          };

          set((s) => ({
            invoices: [frontendInvoice, ...s.invoices],
          }));

          get().addLog({
            type: "billing",
            action: "Invoice created",
            user: "Admin",
            role: "Admin",
            ip: "—",
            details: `${frontendInvoice.id} — ₹${frontendInvoice.total.toLocaleString("en-IN")} (Paid: ₹${frontendInvoice.amountPaid?.toLocaleString("en-IN") || 0})`,
          });

          toast.success(`Invoice ${frontendInvoice.id} created`);
        } catch (error) {
          handleApiError(error);
        }
      },

      updateInvoice: async (id, data) => {
        try {
          console.log("=== UPDATE INVOICE DEBUG ===");

          console.log("Invoice ID:", id);

          console.log("Update data being sent:", data);

          const response = await invoiceApi.update(id, data);

          console.log("Update response received:", response);

          if (response && response.data) {
            const updatedInvoice = response.data;

            console.log("Updated invoice from backend:", {
              amountPaid: updatedInvoice.amountPaid,

              balanceDue: updatedInvoice.balanceDue,

              status: updatedInvoice.status,
            });

            set((s) => ({
              invoices: s.invoices.map((i) => {
                if (i.id === id) {
                  const updated = {
                    ...i,

                    amountPaid:
                      updatedInvoice.amountPaid !== undefined
                        ? updatedInvoice.amountPaid
                        : data.amountPaid,

                    balanceDue:
                      updatedInvoice.balanceDue !== undefined
                        ? updatedInvoice.balanceDue
                        : data.balanceDue,

                    status: updatedInvoice.status || data.status,

                    paymentHistory:
                      updatedInvoice.paymentHistory || i.paymentHistory,
                  };

                  console.log("Updated invoice in state:", {
                    id: updated.id,

                    amountPaid: updated.amountPaid,

                    balanceDue: updated.balanceDue,

                    status: updated.status,
                  });

                  return updated;
                }

                return i;
              }),
            }));
          } else {
            console.log("No response.data, using fallback update");

            set((s) => ({
              invoices: s.invoices.map((i) =>
                i.id === id
                  ? {
                      ...i,
                      ...data,
                    }
                  : i,
              ),
            }));
          }

          get().addLog({
            type: "billing",
            action: "Invoice updated",
            user: "Admin",
            role: "Admin",
            ip: "—",
            details: `${id} - Payment updated`,
          });
        } catch (error) {
          console.error("Update invoice error:", error);

          handleApiError(error);

          throw error;
        }
      },

      updateInvoiceStatus: async (id, status) => {
        try {
          await invoiceApi.update(id, {
            status,
          });

          set((s) => ({
            invoices: s.invoices.map((i) =>
              i.id === id
                ? {
                    ...i,
                    status,
                  }
                : i,
            ),
          }));

          toast.success(`Invoice marked as ${status}`);
        } catch (error) {
          handleApiError(error);
        }
      },

      deleteInvoice: async (id) => {
        try {
          await invoiceApi.delete(id);

          set((s) => ({
            invoices: s.invoices.filter((i) => i.id !== id),
          }));

          get().addLog({
            type: "billing",
            action: "Invoice deleted",
            user: "Admin",
            role: "Admin",
            ip: "—",
            details: `Deleted invoice ${id}`,
          });
        } catch (error) {
          handleApiError(error);
          throw error;
        }
      },

      generateInvoiceForOrder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);

        if (!order) return;

        const existing = get().invoices.find((i) => i.order === orderId);

        if (existing) {
          toast.error("Invoice already exists for this order");
          return;
        }

        const gst = Math.round(order.total * 0.03);

        get().addInvoice({
          order: orderId,
          customer: order.customer,
          phone: order.phone,
          amount: order.total,
          gst,
          total: order.total + gst,
          status: "pending",
          date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          due: new Date(Date.now() + 10 * 86400000).toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            },
          ),
        });
      },

      sendInvoiceEmail: async (id) => {
        try {
          await invoiceApi.resendWhatsApp(id);

          get().addLog({
            type: "billing",
            action: "Invoice emailed",
            user: "Admin",
            role: "Admin",
            ip: "—",
            details: `${id} sent to customer`,
          });

          toast.success(`Invoice emailed to customer`);
        } catch (error) {
          handleApiError(error);
        }
      },

      exportInvoicePDF: (id) => {
        const inv = get().invoices.find((i) => i.id === id);
        if (!inv) return;

        // Multi-item breakdown. Falls back to a single synthesized line
        // from the legacy flat fields for invoices created before
        // multi-item support existed.
        const lineItems =
          inv.items && inv.items.length > 0
            ? inv.items
            : [
                {
                  metalType: (inv.metal as "Gold" | "Silver") || "Gold",
                  category: inv.category || "Jewellery Item",
                  subCategory: "",
                  purity: inv.purity || "",
                  netWeight: inv.netWeight || "0",
                  goldRate: inv.goldRate || 0,
                  makingCharges: inv.makingCharges || 0,
                  price: inv.price || 0,
                },
              ];

        // Recompute every line from scratch — same fix as the
        // create-invoice form — so making charges are folded into each
        // item's subtotal BEFORE GST, then all items are summed for the
        // invoice-level subtotal/GST/total.
        const computedLines = lineItems.map((item) => {
          const netWeight = parseFloat(item.netWeight || "0") || 0;
          const goldRate = item.goldRate || 0;
          const makingChargesPct = item.makingCharges || 0;
          const lineBase = Math.round(netWeight * goldRate);
          const makingAmt = Math.round((lineBase * makingChargesPct) / 100);
          const additional = item.price || 0;
          const lineSubtotal = lineBase + makingAmt + additional;
          return {
            ...item,
            netWeight,
            goldRate,
            makingChargesPct,
            additional,
            lineSubtotal,
          };
        });

        const subtotal = computedLines.reduce(
          (sum, l) => sum + l.lineSubtotal,
          0,
        );
        const totalNetWeight = computedLines.reduce(
          (sum, l) => sum + l.netWeight,
          0,
        );
        const gst = Math.round(subtotal * 0.03);
        const cgst = Math.round(gst / 2);
        const sgst = gst - cgst;
        const discount = inv.discount || 0;
        const total = Math.max(subtotal + gst - discount, 0);
        const amountPaid = inv.amountPaid || 0;
        const balanceDue = Math.max(total - amountPaid, 0);

        // Converts a rupee amount to words, Indian numbering (lakh/crore),
        // matching the "Rs: ... Rupees Only" line on a traditional invoice.
        const numberToWords = (num: number): string => {
          const a = [
            "",
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine",
            "Ten",
            "Eleven",
            "Twelve",
            "Thirteen",
            "Fourteen",
            "Fifteen",
            "Sixteen",
            "Seventeen",
            "Eighteen",
            "Nineteen",
          ];
          const b = [
            "",
            "",
            "Twenty",
            "Thirty",
            "Forty",
            "Fifty",
            "Sixty",
            "Seventy",
            "Eighty",
            "Ninety",
          ];
          const twoDigits = (n: number): string => {
            if (n < 20) return a[n];
            return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
          };
          const threeDigits = (n: number): string => {
            if (n < 100) return twoDigits(n);
            return (
              a[Math.floor(n / 100)] +
              " Hundred" +
              (n % 100 ? " " + twoDigits(n % 100) : "")
            );
          };
          if (num === 0) return "Zero";
          let n = Math.round(num);
          const crore = Math.floor(n / 10000000);
          n %= 10000000;
          const lakh = Math.floor(n / 100000);
          n %= 100000;
          const thousand = Math.floor(n / 1000);
          n %= 1000;
          const hundred = n;
          let words = "";
          if (crore) words += threeDigits(crore) + " Crore ";
          if (lakh) words += threeDigits(lakh) + " Lakh ";
          if (thousand) words += threeDigits(thousand) + " Thousand ";
          if (hundred) words += threeDigits(hundred);
          return words.trim();
        };

        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${inv.id} - Ratan Jewellers</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; font-size: 12px; }
    .invoice-container { max-width: 900px; margin: 0 auto; border: 1.5px solid #000; }
    .jurisdiction { text-align: center; font-size: 10px; padding: 4px; border-bottom: 1px solid #000; color: #555; }
    .top-banner { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #3a0d0d 0%, #0D0700 60%); padding: 18px 22px; }
    .top-banner .company-name { font-size: 28px; font-weight: 800; color: #F0C14B; letter-spacing: 0.5px; }
    .top-banner .company-sub { font-size: 10px; color: #e8cf9a; margin-top: 4px; }
    .phone-pill { display: inline-flex; align-items: center; gap: 6px; background: #fff; color: #7a1f1f; font-weight: 700; font-size: 11px; padding: 4px 12px; border-radius: 14px; margin-top: 10px; }
    .banner-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .bis-badge { background: #fff; border-radius: 8px; padding: 5px 9px; display: flex; align-items: center; justify-content: center; }
    .bis-badge img { height: 40px; width: auto; display: block; }
    .invoice-tag { font-family: monospace; font-weight: 800; font-size: 15px; color: #F0C14B; }
    .invoice-title { text-align: center; font-weight: bold; font-size: 13px; padding: 4px; border-bottom: 1px solid #000; letter-spacing: 1px; }
    .meta-row { display: flex; border-bottom: 1px solid #000; }
    .meta-col { flex: 1; padding: 8px 12px; font-size: 11px; line-height: 1.6; }
    .meta-col.right { border-left: 1px solid #000; }
    .meta-label { color: #555; display: inline-block; width: 90px; }
    table.items { width: 100%; border-collapse: collapse; }
    table.items th, table.items td { border: 1px solid #000; padding: 6px 5px; font-size: 10.5px; text-align: center; }
    table.items th { background: #f3f4f6; font-weight: 700; }
    table.items td.particulars { text-align: left; }
    table.items tfoot td { font-weight: 700; background: #fafafa; }
    .bottom-section { display: flex; border-top: 1px solid #000; }
    .words-col { flex: 1.4; padding: 10px 14px; font-size: 11px; border-right: 1px solid #000; }
    .totals-col { flex: 1; padding: 0; }
    .totals-col table { width: 100%; border-collapse: collapse; }
    .totals-col td { padding: 5px 10px; font-size: 11px; border-bottom: 1px solid #ddd; }
    .totals-col td.label { color: #333; }
    .totals-col td.val { text-align: right; }
    .totals-col tr.net-payable td { font-weight: 800; font-size: 13px; border-top: 1.5px solid #000; background: #fafafa; }
    .signature-row { display: flex; justify-content: space-between; padding: 30px 16px 14px; }
    .signature-row div { font-size: 11px; }
    .status-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #4ADE80; background: rgba(255,255,255,0.08); padding: 2px 8px; border-radius: 10px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="top-banner">
      <div>
        <div class="company-name">RATAN JEWELLERS</div>
        <div class="company-sub">Shop No 1: Tidke Complex, Arjuni &nbsp;|&nbsp; Shop No 2: Main Bus Stop, Paraswada</div>
        <div class="phone-pill">📞&nbsp;+91 75075 10948</div>
      </div>
      <div class="banner-right">
        <div class="bis-badge"><img src="${window.location.origin}/bis-logo.png" alt="BIS"/></div>
        <div class="invoice-tag">${inv.id}</div>
        <div class="status-tag">${inv.status}</div>
      </div>
    </div>
    <div class="jurisdiction">SUBJECT TO TIRORA JURISDICTION &nbsp;|&nbsp; Email: info@ratanjeweller.in</div>

    <div class="invoice-title">TAX INVOICE</div>

    <div class="meta-row">
      <div class="meta-col">
        <div><span class="meta-label">Name</span>${inv.customer}</div>
        <div><span class="meta-label">Mobile No</span>${inv.phone || "—"}</div>
        <div><span class="meta-label">Email</span>${inv.email || "—"}</div>
      </div>
      <div class="meta-col right">
        <div><span class="meta-label">GSTIN No.</span>27AESPU9905N1ZA</div>
        <div><span class="meta-label">HM Lic. No.</span>HM/C-7490069821</div>
        <div><span class="meta-label">Invoice No.</span>${inv.id}</div>
        <div><span class="meta-label">Date & Time</span>${inv.date}</div>
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>HSN Code</th>
          <th>Particulars</th>
          <th>HUID</th>
          <th>Purity</th>
          <th>Pcs</th>
          <th>Gross Wt</th>
          <th>Net Wt</th>
          <th>Rate Per Gm</th>
          <th>Making</th>
          <th>Hallmark<br>Charges</th>
          <th>Taxable Amt</th>
        </tr>
      </thead>
      <tbody>
        ${computedLines
          .map(
            (l) => `
        <tr>
          <td>71131900</td>
          <td class="particulars">${l.category}${l.subCategory ? ` - ${l.subCategory}` : ""} (${l.metalType})</td>
          <td>${inv.hallmarkId || "—"}</td>
          <td>${l.purity || "—"}</td>
          <td>1</td>
          <td>${l.netWeight || "—"}</td>
          <td>${l.netWeight || "—"}</td>
          <td>${l.goldRate ? l.goldRate.toLocaleString("en-IN") : "—"}</td>
          <td>${l.makingChargesPct ? `${l.makingChargesPct}%` : "—"}</td>
          <td>${l.additional ? l.additional.toLocaleString("en-IN") : "0.00"}</td>
          <td>${l.lineSubtotal.toLocaleString("en-IN")}.00</td>
        </tr>`,
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5"></td>
          <td>${totalNetWeight || "—"}</td>
          <td>${totalNetWeight || "—"}</td>
          <td colspan="4">Subtotal: ${subtotal.toLocaleString("en-IN")}.00</td>
        </tr>
      </tfoot>
    </table>

    <div class="bottom-section">
      <div class="words-col">
        <div style="margin-bottom:8px;"><strong>Rs:</strong> ${numberToWords(total)} Rupees Only</div>
        <div style="color:#555;">Narration: By ${amountPaid > 0 ? "Cash/UPI" : "Pending"}</div>
        ${inv.hallmarkId ? `<div style="margin-top:8px;color:#4338CA;font-weight:700;">BIS Hallmark: ${inv.hallmarkId}</div>` : ""}
        <div style="margin-top:10px;font-size:10.5px;color:#444;line-height:1.6;">
          <strong>NOTE:</strong><br>
          916 EXCHANGE 100% 916 RETURNS 916<br>
          750 EXCHANGE 100% 750 RETURNS 750<br>
          833 EXCHANGE 100% 833 RETURNS 833
        </div>
      </div>
      <div class="totals-col">
        <table>
          <tr><td class="label">ADD CGST 1.5%</td><td class="val">${cgst.toLocaleString("en-IN")}.00</td></tr>
          <tr><td class="label">ADD SGST 1.5%</td><td class="val">${sgst.toLocaleString("en-IN")}.00</td></tr>
          <tr><td class="label">Less Discount</td><td class="val" style="color:${discount > 0 ? "#DC2626" : "#333"};">${discount > 0 ? "-" + discount.toLocaleString("en-IN") + ".00" : "0.00"}</td></tr>
          <tr><td class="label">Less URD</td><td class="val"></td></tr>
          <tr><td class="label">Amount Paid</td><td class="val" style="color:#059669;">${amountPaid.toLocaleString("en-IN")}.00</td></tr>
          <tr><td class="label">Balance Due</td><td class="val" style="color:${balanceDue > 0 ? "#DC2626" : "#059669"};">${balanceDue.toLocaleString("en-IN")}.00</td></tr>
          <tr class="net-payable"><td>Net Payable</td><td class="val">₹${total.toLocaleString("en-IN")}.00</td></tr>
        </table>
      </div>
    </div>

    <div class="signature-row">
      <div>Customer Signature</div>
      <div>For M/S RATAN JEWELLERS</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>`;

        const w = window.open("", "_blank");
        if (w) {
          w.document.write(html);
          w.document.close();
        }

        toast.success(`Invoice ${inv.id} ready for print`);
      },

      // ── Inventory ──────────────────────────────────────────────────────
      addInventoryItem: (itemData) => {
        const newItem: InventoryItem = {
          ...itemData,
          id: `INV-${String(Date.now()).slice(-3)}`,
          lastUpdated: "just now",
        };

        set((s) => ({
          inventory: [newItem, ...s.inventory],
        }));

        toast.success(`"${newItem.name}" added to inventory`);
      },

      updateInventoryItem: (id, data) => {
        set((s) => ({
          inventory: s.inventory.map((i) =>
            i.id === id
              ? {
                  ...i,
                  ...data,
                  lastUpdated: "just now",
                }
              : i,
          ),
        }));

        toast.success("Inventory updated");
      },

      deleteInventoryItem: (id) => {
        const item = get().inventory.find((i) => i.id === id);

        set((s) => ({
          inventory: s.inventory.filter((i) => i.id !== id),
        }));

        toast.success(`"${item?.name}" removed`);
      },

      // ── Customers ──────────────────────────────────────────────────────
      fetchCustomers: async () => {
        try {
          set((s) => ({
            loading: {
              ...s.loading,
              customers: true,
            },
          }));

          const customersResponse = await customerApi.getAll();

          const frontendCustomers: Customer[] = (
            customersResponse?.customers || []
          ).map((customer: any) => ({
            id: customer.id || customer._id || "",

            name: customer.name || "Unknown Customer",

            phone: customer.phone || "",

            email: customer.email || "",

            city: customer.city || "",

            totalSpend: customer.totalSpend || 0,

            orders: customer.orders || 0,

            tier: (customer.segment?.toLowerCase() || "bronze") as CustomerTier,

            lastVisit: customer.updatedAt
              ? new Date(customer.updatedAt).toLocaleDateString("en-IN")
              : "Not Available",

            birthday: customer.birthday
              ? new Date(customer.birthday).toLocaleDateString("en-IN")
              : "Not Available",

            tags: customer.tags || [],
          }));

          set((s) => ({
            customers: frontendCustomers,

            loading: {
              ...s.loading,
              customers: false,
            },
          }));
        } catch (error) {
          console.error(error);

          set((s) => ({
            loading: {
              ...s.loading,
              customers: false,
            },
          }));
        }
      },

      addCustomer: (customerData) => {
        const newCustomer: Customer = {
          ...customerData,
          id: `CRM-${String(Date.now()).slice(-3)}`,
        };

        set((s) => ({
          customers: [newCustomer, ...s.customers],
        }));

        toast.success(`Customer "${newCustomer.name}" added`);
      },

      updateCustomer: (id, data) => {
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...data,
                }
              : c,
          ),
        }));

        toast.success("Customer updated");
      },

      deleteCustomer: async (id) => {
        try {
          await customerApi.delete(id);

          const c = get().customers.find((c) => c.id === id);

          set((s) => ({
            customers: s.customers.filter((c) => c.id !== id),
          }));

          toast.success(`Customer "${c?.name}" deleted`);
        } catch (error) {
          handleApiError(error);
        }
      },

      addCustomerTag: (id, tag) => {
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id
              ? {
                  ...c,
                  tags: [...new Set([...c.tags, tag])],
                }
              : c,
          ),
        }));

        toast.success(`Tag "${tag}" added`);
      },

      removeCustomerTag: (id, tag) => {
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id
              ? {
                  ...c,
                  tags: c.tags.filter((t) => t !== tag),
                }
              : c,
          ),
        }));
      },

      // ── Gold Rates ─────────────────────────────────────────────────────
      updateGoldRates: (rates) => {
        set({
          goldRates: rates,
        });

        toast.success("Gold rates updated");
      },

      // ── Settings ──────────────────────────────────────────────────────
      setCurrentRole: (role) =>
        set({
          currentRole: role,
        }),

      // ── Audit Log ─────────────────────────────────────────────────────
      addLog: (logData) => {
        const newLog: AuditLog = {
          ...logData,
          id: Date.now(),
          time: new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        set((s) => ({
          auditLogs: [newLog, ...s.auditLogs],
        }));
      },

      // ── Reset Store ───────────────────────────────────────────────────
      resetAll: () => {
        set({
          products: [],
          orders: [],
          invoices: [],
          inventory: [],
          customers: [],
          auditLogs: [],
          goldRates: {
            "24K": "14525",
            "22K": "13314",
            "18K": "10893",
            "14K": "8349",
          },
          currentRole: "super_admin",

          loading: {
            invoices: false,
            orders: false,
            customers: false,
          },
        });

        toast.success("Dashboard reset successfully");
      },

      // ── Clear Data ─────────────────────────────────────────────────────
      clearAllBillingData: async () => {
        try {
          await adminApi.clearBillingData();

          set({
            orders: [],
            invoices: [],
            customers: [],
            auditLogs: initialLogs.slice(0, 3),
          });

          get().addLog({
            type: "settings",
            action: "Billing data cleared",
            user: "Admin",
            role: "Admin",
            ip: "—",
            details: "All orders, invoices, and customers cleared globally",
          });

          toast.success("All billing data cleared globally");
        } catch (error) {
          handleApiError(error);
        }
      },
    }),

    {
      name: "ratan-admin-store",

      version: 2,

      migrate: (persistedState, version) => {
        const state = persistedState as
          | {
              products?: Product[];
            }
          | undefined;

        if (!state) return persistedState;

        if (version < 2) {
          state.products = [];
        }

        return state;
      },

      onRehydrateStorage: () => (state) => {
        if (!state?.products?.length) return;

        const cleaned = stripSeedProducts(state.products);

        if (cleaned.length !== state.products.length) {
          useAdminStore.setState({
            products: cleaned,
          });
        }
      },

      partialize: (s) => ({
        users: s.users,
        products: s.products,
        orders: s.orders,
        invoices: s.invoices,
        inventory: s.inventory,
        customers: s.customers,
        auditLogs: s.auditLogs,
        goldRates: s.goldRates,
        currentRole: s.currentRole,
      }),
    },
  ),
);
