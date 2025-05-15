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


function App() {
  return (
    <div>
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


      
        
        
      </Routes>
    </div>
  );
}

export default App;
