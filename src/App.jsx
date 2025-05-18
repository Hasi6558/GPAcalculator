import { Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./assets/components/Dashboard";
import AddCources from "./assets/components/AddCources";
import Statistics from "./assets/components/Statistics";


function App() {  

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/add-courses/:year" element={<AddCources />} />
      <Route path="/statistics" element={<Statistics />} />
    </Routes>
  );
}

export default App;
