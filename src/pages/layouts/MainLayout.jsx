import { Outlet } from 'react-router-dom'
import DashboardShell from '../../components/dashboard/DashboardShell'

function MainLayout() {
  return <DashboardShell>{(context) => <Outlet context={context} />}</DashboardShell>
}

export default MainLayout
