import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import './App.css';
import Login from "./pages/Login";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; 
import CategoryPage from "./pages/Category/CategoryPage";
import LocationPage from "./pages/Location/LocationPage";
import LocationDetailPage from "./pages/Location/LocationDetailPage";
import StatusPage from "./pages/Status/StatusPage";
import SupplierPage from "./pages/Supplier/SupplierPage";

// Dashboard
function Dashboard() {
    const userName = sessionStorage.getItem("user_name");

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4 dark:text-white">Main Dashboard</h1>
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                Welcome, {userName}. You're safe here.
            </div>
        </Layout>
    );
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/locations" element={<LocationPage />} />
            <Route path="/locations/:id" element={<LocationDetailPage />} />
            <Route path="/statuses" element={<StatusPage />} />
            <Route path="/suppliers" element={<SupplierPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
};

export default App;
