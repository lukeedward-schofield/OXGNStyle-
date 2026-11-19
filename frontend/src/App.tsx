import { Route, Routes } from 'react-router'
import { GuestRoute, ProtectedRoute } from './auth/RouteGuards'
import AppLayout from './components/AppLayout'
import CatalogPage from './pages/CatalogPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductPage from './pages/ProductPage'
import MeasurementsPage from './pages/MeasurementsPage'
import TryOnPage from './pages/TryOnPage'
import StyleLabPage from './pages/StyleLabPage'

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/measurements" element={<MeasurementsPage />} />
          <Route path="/try-on" element={<TryOnPage />} />
          <Route path="/style-lab" element={<StyleLabPage />} />
        </Route>
      </Route>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
    </Routes>
  )
}