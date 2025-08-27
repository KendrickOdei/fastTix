import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hero from "./components/Hero";
import CreateEvents from "./pages/CreateEvents";
import TicketPurchase from "./pages/TicketPurchase";


import DashboardPage from './dashboard/pages/DashboardPage';
import SearchResults from "./pages/SearchResults";
import EventDetails from "./pages/EventDetails";
import MyEvents from './pages/MyEvents'
import { ToastContainer } from 'react-toastify';
import EditEvent from "./pages/EditEvent";


function App() {
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
      
      <Route path="events" element={<DashboardPage />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/event-details/:id" element={<EventDetails />} />
      <Route path="/my-events" element={<MyEvents />} />
      <Route path="/edit-event/:id" element={<EditEvent />} />


      
        
        
      </Routes>
    </div>
  );
}

export default App;
