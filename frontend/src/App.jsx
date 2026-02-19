import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { lazy } from "react";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
const Dashboard = lazy(() => import("./pages/Dashboard"))
const CategoryPage = lazy(() => import("./pages/Category/CategoryPage"))
const CategoryDetailPage = lazy(() => import("./pages/Category/CategoryDetailPage"))
const LocationPage = lazy(() => import("./pages/Location/LocationPage"))
const LocationDetailPage = lazy(() => import("./pages/Location/LocationDetailPage"))
const StatusPage = lazy(() => import("./pages/Status/StatusPage"))
const SupplierPage = lazy(() => import("./pages/Supplier/SupplierPage"))
const StatusDetailPage = lazy(() => import("./pages/Status/StatusDetailPage"))
const AssetListPage = lazy(() => import("./pages/Asset/AssetListPage"))
const AssetFormPage = lazy(() => import("./pages/Asset/AssetFormPage"))
const AssetDetailPage = lazy(() => import("./pages/Asset/AssetDetailPage"))
const LoanListPage = lazy(() => import("./pages/LoanAsset/LoanListPage"))
const LoanFormPage = lazy(() => import("./pages/LoanAsset/LoanFormPage"))
const LoanDetailPage = lazy(() => import("./pages/LoanAsset/LoanDetailPage"))
const MaintenanceListPage = lazy(() => import("./pages/Maintenance/MaintenanceListPage"))
const MaintenanceFormPage = lazy(() => import("./pages/Maintenance/MaintenanceFormPage"))
const MaintenanceDetailPage = lazy(() => import("./pages/Maintenance/MaintenanceDetailPage"))

// Dashboard
// function Dashboard() {
//   const userName = sessionStorage.getItem("user_name");

//   return (
//     <Layout>
//       <h1 className="text-2xl font-bold mb-4 dark:text-white">
//         Main Dashboard
//       </h1>
//       <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
//         Welcome, {userName}. You're safe here.
//       </div>
//     </Layout>
//   );
// }

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/categories/:id" element={<CategoryDetailPage />} />
          <Route path="/locations" element={<LocationPage />} />
          <Route path="/locations/:id" element={<LocationDetailPage />} />
          <Route path="/statuses" element={<StatusPage />} />
          <Route path="/statuses/:id" element={<StatusDetailPage />} />
          <Route path="/suppliers" element={<SupplierPage />} />
          <Route path="/assets" element={<AssetListPage />} />
          <Route path="/assets/create" element={<AssetFormPage />} />
          <Route path="/assets/:id/edit" element={<AssetFormPage />} />
          <Route path="/assets/:id" element={<AssetDetailPage />} />
          <Route path="/loans" element={<LoanListPage />} />
          <Route path="/loans/create" element={<LoanFormPage />} />
          <Route path="/loans/:id" element={<LoanDetailPage />} />
          <Route path="/maintenances" element={<MaintenanceListPage />} />
          <Route path="/maintenance/create" element={<MaintenanceFormPage />} />
          <Route path="/maintenance/:id" element={<MaintenanceDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
