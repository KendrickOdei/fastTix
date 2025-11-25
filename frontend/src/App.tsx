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



function App() {
  const navigate = useNavigate()
  useEffect(()=> {
    setNavigate(navigate)
  }, [navigate])
  return (
    <div>
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
        theme="light" // or "dark", "colored"
        />
      <Navbar />
      <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/create-event" element={<CreateEvents />} />
      <Route path="/event/:id/purchase" element={<TicketPurchase />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/event-details/:id" element={<EventDetails />} />
      <Route path="/my-events" element={<MyEvents />} />
      <Route path="/edit-event/:id" element={<EditEvent />} />

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
    </div>
  );
}

export default App;
