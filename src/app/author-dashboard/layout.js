import Navbar from '../components/frontend/Navbar';
import AuthorTopbar from '../components/dashbaord/Topbar';
import Footer from '../components/frontend/Footer';

export const metadata = {
  title: "Author workspace | Nobel Books",
  description: "Write, review, publish, and manage your books.",
};

export default function AuthorLayout({ children }) {
  return (
    <>
      <AuthorTopbar />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
