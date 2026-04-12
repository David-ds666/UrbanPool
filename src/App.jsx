import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

import Landing from "./pages/Home/Landing";
import SearchRide from "./pages/Search/SearchRide";
import RideResults from "./pages/Ride/RideResults";
import RideWithMap from "./pages/Ride/RideWithMap";
import Booking from "./pages/Booking/Booking";
import ReserveBooking from "./pages/Booking/ReserveBooking";
import IntercityBooking from "./pages/Booking/IntercityBooking";
import CourierBooking from "./pages/Booking/CourierBooking";
import RentalBooking from "./pages/Booking/RentalBooking";
import BikeBooking from "./pages/Booking/BikeBooking";
import AirportBooking from "./pages/Booking/AirportBooking";
import CityBooking from "./pages/Booking/CityBooking";
import Help from "./pages/Help/Help";
import HelpArticle from "./pages/Help/HelpArticle";

import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";

import RideLayout from "./layouts/RideLayout";
import RideHome from "./pages/Ride/RideHome";
import Airport from "./pages/Ride/Airport";
import Cities from "./pages/Ride/Cities";
import CarpoolResults from "./pages/Ride/CarpoolResults";
import OfferRide from "./pages/Ride/OfferRide";

/* ── Service detail pages ── */
import RideService from "./pages/Services/RideService";
import ReserveService from "./pages/Services/ReserveService";
import IntercityService from "./pages/Services/IntercityService";
import CourierService from "./pages/Services/CourierService";
import RentalsService from "./pages/Services/RentalsService";
import BikeService from "./pages/Services/BikeService";

/* ── Sidebar Pages ── */
/* ── Sidebar Pages ── */
import Profile from "./pages/Sidebar/Profile";
import Notifications from "./pages/Sidebar/Notifications";
import Wallet from "./pages/Sidebar/Wallet";
import MyRides from "./pages/Sidebar/MyRides";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminRidesTable from "./pages/Admin/AdminRidesTable";
import AdminUsers from "./pages/Admin/AdminUsers";
import SurgeControl from "./pages/Admin/SurgeControl";

/* ── Driver Pages ── */
import DriverLayout from "./layouts/DriverLayout";
import DriverDashboard from "./pages/Driver/DriverDashboard";
import DriverActiveRides from "./pages/Driver/DriverActiveRides";
import DriverEarnings from "./pages/Driver/DriverEarnings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= ADMIN PAGES ================= */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/rides" element={<AdminRidesTable />} />
          <Route path="/admin/surge" element={<SurgeControl />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        {/* ================= DRIVER PORTAL ================= */}
        <Route element={<DriverLayout />}>
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/driver/active-rides" element={<DriverActiveRides />} />
          <Route path="/driver/earnings" element={<DriverEarnings />} />
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/search" element={<SearchRide />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/reserve-booking" element={<ReserveBooking />} />
          <Route path="/intercity-booking" element={<IntercityBooking />} />
          <Route path="/courier-booking" element={<CourierBooking />} />
          <Route path="/rental-booking" element={<RentalBooking />} />
          <Route path="/bike-booking" element={<BikeBooking />} />
          <Route path="/airport-booking" element={<AirportBooking />} />
          <Route path="/city-booking" element={<CityBooking />} />
          <Route path="/help" element={<Help />} />
          <Route path="/help/:categoryId/:faqIndex" element={<HelpArticle />} />

          {/* ── New Detail Pages ── */}
          <Route path="/ride" element={<RideHome />} />
          <Route path="/ride/airport" element={<Airport />} />
          <Route path="/ride/cities" element={<Cities />} />


          {/* ── Service detail pages ── */}
          <Route path="/ride/ride" element={<RideService />} />
          <Route path="/ride/reserve" element={<ReserveService />} />
          <Route path="/ride/intercity" element={<IntercityService />} />
          <Route path="/ride/courier" element={<CourierService />} />
          <Route path="/ride/rentals" element={<RentalsService />} />
          <Route path="/ride/bike" element={<BikeService />} />

          {/* ── Sidebar Features ── */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/my-rides" element={<MyRides />} />
        </Route>

        <Route element={<RideLayout />}>
          <Route path="/results" element={<RideResults />} />
          <Route path="/carpool/search" element={<CarpoolResults />} />
          <Route path="/carpool/offer" element={<OfferRide />} />
          <Route path="/ride/:type" element={<RideWithMap />} />
        </Route>


        {/* ================= AUTH PAGES (NO NAVBAR) ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* ================= FUTURE PROTECTED APP ================= */}
        <Route element={<AppLayout />}>
          <Route path="/app" element={<h2>App Home</h2>} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;