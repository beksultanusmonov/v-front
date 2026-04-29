import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomeLayout from './pages/layouts/HomeLayout'
import MainLayout from './pages/layouts/MainLayout'
import RegisterLayout from './pages/layouts/RegisterLayout'
import AllVacancyPage from './pages/main/AllVacancyPage'
import MyVacancyPage from './pages/main/MyVacancyPage'
import ProfilePage from './pages/main/ProfilePage'
import VacancyDetailPage from './pages/main/VacancyDetailPage'
import EmployeeResumePage from './pages/main/EmployeeResumePage'
import EmployeeCoursesPage from './pages/main/EmployeeCoursesPage'
import EmployeeCourseDetailPage from './pages/main/EmployeeCourseDetailPage'
import AboutPage from './pages/AboutPage'
import CoursesPage from './pages/CoursesPage'
import FaqPage from './pages/FaqPage'
import PageNotFound from './pages/PageNotFound'
import { ThemeProvider } from './theme/ThemeContext'

const routes = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'vacancies', element: <AllVacancyPage basePath="/vacancies" /> },
      { path: 'vacancies/:vacancyId', element: <VacancyDetailPage basePath="/vacancies" /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'faq', element: <FaqPage /> },
    ],
  },
  {
    path: '/accaunt',
    element: <RegisterLayout />,
    children: [
      { index: true, element: <Navigate to="register" replace /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
  {
    path: '/main',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="all-vacancy" replace /> },
      { path: 'all-vacancy', element: <AllVacancyPage basePath="/main/all-vacancy" /> },
      { path: 'all-vacancy/:vacancyId', element: <VacancyDetailPage basePath="/main/all-vacancy" /> },
      { path: 'my-vacancy', element: <MyVacancyPage /> },
      { path: 'resume', element: <EmployeeResumePage /> },
      { path: 'courses', element: <EmployeeCoursesPage /> },
      { path: 'courses/:courseId', element: <EmployeeCourseDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '*',
    element: <PageNotFound />,
  },
])

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={routes} />
    </ThemeProvider>
  )
}

export default App