import React, { Suspense } from "react";
import {
  useRoutes,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import DamagePaymentForm from "./components/payment/DamagePaymentForm";
// Import tempo-routes dynamically to avoid initialization issues
import routes from "tempo-routes";
import RentCar from "./components/RentCar";
import TravelPage from "./pages/TravelPage";
import ModelDetailPage from "./pages/ModelDetailPage";
import PaymentDetailsPage from "./pages/PaymentDetailsPage";
import PaymentFormPage from "./pages/PaymentFormPage";
import BookingPage from "./pages/BookingPage";
import BookingForm from "./components/booking/BookingForm";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLayout from "./components/admin/AdminLayout";
import StaffPage from "./components/admin/StaffPage";
import CustomerManagement from "./components/admin/CustomerManagement";
import DriverManagement from "./components/admin/DriverManagement";
import CarsManagement from "./components/admin/CarsManagement";
import Payments from "./components/admin/Payments";
import BookingManagement from "./components/admin/BookingManagement";
import InspectionManagement from "./components/admin/InspectionManagement";
import ChecklistManagement from "./components/admin/ChecklistManagement";
import DamageManagement from "./components/admin/DamageManagement";
import VehicleInventory from "./components/admin/VehicleInventory";
import AirportTransferPage from "./pages/AirportTransferPage";
import { useAuth } from "./hooks/useAuth";

// Define window.__TEMPO_ROUTES__ to avoid undefined errors
declare global {
  interface Window {
    __TEMPO_ROUTES__?: any[];
  }
}

function App() {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  // Protected route component
  const ProtectedRoute = ({
    children,
    requiredRole,
  }: {
    children: JSX.Element;
    requiredRole?: string;
  }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }

    if (requiredRole && userRole !== requiredRole) {
      console.log(
        `Access denied: User role ${userRole} does not match required role ${requiredRole}`,
      );
      return <Navigate to="/" />;
    }

    return children;
  };

  return (
    <div className="min-h-screen w-full">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <p>Loading...</p>
          </div>
        }
      >
        {/* Conditionally render either tempoRoutes or manual Routes */}
        {import.meta.env.VITE_TEMPO ? (
          <>
            {/* Use tempo-routes for storyboards */}
            {useRoutes([
              {
                path: "/",
                element: <TravelPage />,
              },
              {
                path: "/rentcar",
                element: <RentCar />,
              },
              ...routes,
            ])}

            <Routes>
              {/* Payment Routes - Define these first for higher priority */}
              <Route path="/payment/form/:id" element={<PaymentFormPage />} />
              <Route path="/payment/form/:id/*" element={<PaymentFormPage />} />
              <Route path="/payment/:id" element={<PaymentDetailsPage />} />
              <Route
                path="/damage-payment/:bookingId"
                element={<DamagePaymentForm />}
              />

              <Route path="/" element={<TravelPage />} />
              <Route path="/home" element={<RentCar />} />
              <Route path="/rentcar" element={<RentCar />} />
              <Route path="/models/:modelName" element={<ModelDetailPage />} />
              <Route
                path="/models/:modelName/*"
                element={<ModelDetailPage />}
              />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/booking/:vehicle_id" element={<BookingPage />} />
              <Route path="/booking/:vehicleId" element={<BookingForm />} />
              <Route
                path="/booking/model/:model_name"
                element={<BookingPage />}
              />
              <Route
                path="/airport-transfer"
                element={<AirportTransferPage />}
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="customers" element={<CustomerManagement />} />
                <Route path="drivers" element={<DriverManagement />} />
                <Route path="cars" element={<CarsManagement />} />
                <Route path="payments" element={<Payments />} />
                <Route path="bookings" element={<BookingManagement />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="inspections" element={<InspectionManagement />} />
                <Route path="checklist" element={<ChecklistManagement />} />
                <Route path="damages" element={<DamageManagement />} />
                <Route
                  path="vehicle-inventory"
                  element={<VehicleInventory />}
                />
              </Route>

              {/* Allow Tempo routes to capture /tempobook paths */}
              <Route path="/tempobook/*" element={<div />} />
            </Routes>
          </>
        ) : (
          <Routes>
            {/* Payment Routes - Define these first for higher priority */}
            <Route path="/payment/form/:id" element={<PaymentFormPage />} />
            <Route path="/payment/form/:id/*" element={<PaymentFormPage />} />
            <Route path="/payment/:id" element={<PaymentDetailsPage />} />
            <Route
              path="/damage-payment/:bookingId"
              element={<DamagePaymentForm />}
            />

            <Route path="/" element={<TravelPage />} />
            <Route path="/rentcar" element={<RentCar />} />
            <Route path="/models/:modelName" element={<ModelDetailPage />} />
            <Route path="/models/:modelName/*" element={<ModelDetailPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking/:vehicle_id" element={<BookingPage />} />
            <Route path="/booking/:vehicleId" element={<BookingForm />} />
            <Route
              path="/booking/model/:model_name"
              element={<BookingPage />}
            />
            <Route path="/airport-transfer" element={<AirportTransferPage />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="drivers" element={<DriverManagement />} />
              <Route path="cars" element={<CarsManagement />} />
              <Route path="payments" element={<Payments />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="inspections" element={<InspectionManagement />} />
              <Route path="checklist" element={<ChecklistManagement />} />
              <Route path="damages" element={<DamageManagement />} />
              <Route path="vehicle-inventory" element={<VehicleInventory />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </Suspense>
    </div>
  );
}

export default App;
