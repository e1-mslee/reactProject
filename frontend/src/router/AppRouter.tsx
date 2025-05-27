import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../views/Dashboard/Dashboard';
import EmployeeManagement from '../views/EmployeeManagement/EmployeeManagement';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeManagement />} />
      </Routes>
    </BrowserRouter>
  )
}