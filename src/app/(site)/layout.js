import Footer from "../components/frontend/Footer";
import Navbar from "../components/frontend/Navbar";
import Topbar from "../components/frontend/Topbar";



export default function HomeLayout({ children }) {
  return (
    <>
      <Topbar />
      <Navbar />
      {children}
      <Footer />
    </>


  );
}
