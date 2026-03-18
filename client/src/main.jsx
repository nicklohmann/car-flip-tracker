import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import CarList from './pages/CarList.jsx'
import CarDetail from './pages/CarDetail.jsx'
import AddCar from './pages/AddCar.jsx'
import './index.css'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CarList />} />
        <Route path="/cars/:id" element={<CarDetail />} />
        <Route path="/add" element={<AddCar />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)