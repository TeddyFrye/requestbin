import MainPage from "./components/MainPage";
import BasketPage from "./components/BasketPage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/web" replace />} />
        <Route path="/index.html" element={<Navigate to="/web" replace />} />
        <Route path="/web" element={<MainPage />} />
        <Route path="/web/:id" element={<BasketPage />} />
      </Routes>
    </Router>
  );
}

export default App;
