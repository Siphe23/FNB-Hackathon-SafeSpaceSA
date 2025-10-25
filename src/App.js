import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WELLCOME/Welcome";

function App() {
  return (
    <Router>
      <Routes>
  <Route path="/" element={<WelcomePage />} />
</Routes>

    </Router>
  );
}

export default App;
