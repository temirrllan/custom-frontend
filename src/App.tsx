import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalog from "./pages/Catalog";
import CostumeDetails from "./pages/CostumeDetails";
import BookingForm from "./pages/BookingForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/costume/:id" element={<CostumeDetails />} />
        <Route path="/book/:id" element={<BookingForm />} />
      </Routes>
    </BrowserRouter>
  );
}
