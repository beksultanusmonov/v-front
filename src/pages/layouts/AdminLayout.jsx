import { Outlet } from 'react-router-dom'
import AdminDashboard from '../../components/dashboard/AdminDashboard'

function AdminLayout() {
  return <AdminDashboard>{(context) => <Outlet context={context} />}</AdminDashboard>
}

export default AdminLayout
