import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Inventory from './pages/Inventory'
import Analytics from './pages/Analytics'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <Navbar />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:orderId" element={<OrderDetail />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/analytics" element={<Analytics />} />
                </Routes>
              </main>
            </div>
          </div>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
