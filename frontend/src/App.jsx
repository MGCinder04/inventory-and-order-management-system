import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { SidebarProvider } from './context/SidebarContext'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Inventory from './pages/Inventory'
import Analytics from './pages/Analytics'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-transition">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <SidebarProvider>
            <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0b0f]">
              <Sidebar />
              <div className="flex flex-col flex-1 min-w-0">
                <Navbar />
                <main className="flex-1 overflow-auto">
                  <AnimatedRoutes />
                </main>
              </div>
            </div>
          </SidebarProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
