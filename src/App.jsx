import "./App.css";
import AllRoutes from "./routes/AllRoutes";
import Header from "./components/Header";
import Card from "./components/Card";
import Footer from "./components/Footer";
import { Movielist } from "./pages";

function App() {
  return (
    <div>
      <Header />
      <AllRoutes />
      <Footer />
    </div>
  );
}

export default App;