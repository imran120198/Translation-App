import { ToastContainer } from "react-toastify";
import "./App.css";
import Navbar from "./Components/Navbar";
import { Translator } from "./Components/Translator";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Translator />
      <ToastContainer />
    </div>
  );
}

export default App;
