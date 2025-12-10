import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hero from "./components/Hero";
import CreateEvents from "./pages/organizer/CreateEvents";
import TicketPurchase from "./pages/TicketPurchase";

import SearchResults from "./pages/SearchResults";
import EventDetails from "./pages/EventDetails";
import MyEvents from './pages/organizer/MyEvents'
import { ToastContainer } from 'react-toastify';
import EditEvent from "./pages/organizer/EditEvent";
import Overview from "./pages/dashboard/Overview";
import DashboardLayout from "./layouts/DashboardLayout";
import OrganizerRoute from "./components/OrganizerRoute";
import CreateTicket from "./pages/organizer/createTicket";

import { useNavigate } from "react-router-dom";
import { setNavigate } from "./utils/apiClient";
import { useEffect } from "react";
import TicketsList from "./pages/organizer/TicketList";
import Checkout from "./pages/Checkout";
import GuestCheckout from "./pages/GuestCheckout";
import EventsPage from "./pages/EventsPage";
import Footer from "./components/Footer";
import PaymentSuccess from "./pages/PaymentSuccessPage";



function App() {
  const navigate = useNavigate()
  useEffect(()=> {
    setNavigate(navigate)
  }, [navigate])
  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer
        position="top-right" // Where toasts appear
        autoClose={5000} // Close after 5 seconds
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" 
        />
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
      <Route path="/my-events" element={<MyEvents />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/guest-checkout" element={<GuestCheckout />} />
      <Route path="/edit-event/:id" element={<EditEvent />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      

      <Route  element={<OrganizerRoute />}>
        <Route path="/organizer"  element={<DashboardLayout />}>
        <Route index element={<Overview/>}/>
        <Route path="dashboard" element={<Overview/>}/>
        <Route path="create-event" element={<CreateEvents/>}/>
        <Route path="/organizer/create-ticket/:eventId" element={<CreateTicket/>}/>
        <Route path="my-events" element={<MyEvents/>}/>
        <Route path="/organizer/events/:eventId/tickets" element={<TicketsList/>}/>
        
        </Route>
      </Route>


      
        
        
      </Routes> 
      </main>

      <Footer/>
    </div>
  );
}

export default App;
