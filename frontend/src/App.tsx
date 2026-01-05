import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hero from "./components/Hero";
import CreateEvents from "./pages/dashboard/organizer/CreateEvents";
import TicketPurchase from "./pages/TicketPurchase";
import SearchResults from "./pages/SearchResults";
import EventDetails from "./pages/EventDetails";
import MyEvents from './pages/dashboard/organizer/MyEvents'
import { ToastContainer } from 'react-toastify';
import EditEvent from "./pages/dashboard/organizer/EditEvent";
import Overview from "./pages/dashboard/Overview";
import DashboardLayout from "./pages/dashboard/layouts/DashboardLayout";
import OrganizerRoute from "./components/OrganizerRoute";
import CreateTicket from "./pages/dashboard/organizer/createTicket";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "./utils/apiClient";
import { useEffect } from "react";
import TicketsList from "./pages/dashboard/organizer/TicketList";
import Checkout from "./pages/Checkout";
import GuestCheckout from "./pages/GuestCheckout";
import EventsPage from "./pages/EventsPage";
import Footer from "./components/Footer";
import PaymentSuccess from "./pages/PaymentSuccessPage";
import ScrollToTop from "./components/ScrollToTop";
import AdminRoutes from "./pages/admin-dashboard/routes/AdminRoutes";
import AdminLayout from "./pages/admin-dashboard/layouts/AdminLayout";
import Dashboard from "./pages/admin-dashboard/Dashboard";
import UserManagement from "./pages/admin-dashboard/admin/UserManagement";

function App() {
  const navigate = useNavigate()
  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" 
      />
      <ScrollToTop/>
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/create-event" element={<CreateEvents />} />
          <Route path="/event/:id/purchase" element={<TicketPurchase />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/event-details/:id" element={<EventDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/guest-checkout" element={<GuestCheckout />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          
          {/* Organizer routes */}
          <Route element={<OrganizerRoute />}>
            <Route path="/organizer" element={<DashboardLayout />}>
              <Route index element={<Overview/>}/>
              <Route path="dashboard" element={<Overview/>}/>
              <Route path="create-event" element={<CreateEvents/>}/>
              <Route path="/organizer/create-ticket/:eventId" element={<CreateTicket/>}/>
              <Route path="my-events" element={<MyEvents/>}/>
              <Route path="/organizer/events/:eventId/tickets" element={<TicketsList/>}/>
            </Route>
          </Route>

          {/* Admin routes - MOVED OUTSIDE organizer routes */}
          <Route element={<AdminRoutes />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />  {/* ← ADD THIS */}

              {/* Add more admin routes here */}
            </Route>
          </Route>
        </Routes> 
      </main>
      <Footer/>
    </div>
  );
}

export default App;