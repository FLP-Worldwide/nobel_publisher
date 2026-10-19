import AdminShell from "./AdminShell";
export const metadata = { title: "Administration | Nobel Books" };
export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
