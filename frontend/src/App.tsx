import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hero from "./components/Hero";
import CreateEvents from "./pages/CreateEvents";
import TicketPurchase from "./pages/TicketPurchase";
import PrivateRoute from "./components/PrivateRoute"
import DashboardLayout from './dashboard/DashboardLayout';

import DashboardPage from './dashboard/pages/DashboardPage';



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
      <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />} />
          
      </Route>
      <Route path="events" element={<DashboardPage />} />
      
        
        
      </Routes>
    </div>
  );
}

export default App;
