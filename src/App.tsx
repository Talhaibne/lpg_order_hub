import { Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import AdminRoute from "@/features/admin/components/AdminRoute";
import PolicyModal from "@/components/PolicyModal";
import Landing from "./pages/Landing.jsx";
import Login from "@/features/auth/pages/Login.jsx";
import Signup from "@/features/auth/pages/Signup.jsx";
import Order from "@/features/order/pages/Order.jsx";
import Orders from "@/features/order/pages/Orders.jsx";
import EditProfile from "@/features/user/pages/EditProfile.jsx";
import AdminOrders from "@/features/admin/pages/AdminOrders.jsx";
import OrderHistory from "@/features/admin/pages/OrderHistory.jsx";
import CancelledOrders from "@/features/admin/pages/CancelledOrders.jsx";
import AdminProducts from "@/features/admin/pages/AdminProducts.jsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PolicyModal />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/order"
              element={
                <ProtectedRoute>
                  <Order />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/order-history"
              element={
                <AdminRoute>
                  <OrderHistory />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/cancelled-orders"
              element={
                <AdminRoute>
                  <CancelledOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
