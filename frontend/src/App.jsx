import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AssignmentsPage from './pages/AssignmentsPage';
import GroupsPage from './pages/GroupsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GroupListPage from './pages/GroupListPage';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import AdminAssignmentListPage from './pages/AdminAssignmentListPage';
import CreateAssignmentPage from './pages/CreateAssignmentPage';
import EditAssignmentPage from './pages/EditAssignmentPage';
import AssignmentDetailsPage from './pages/AssignmentDetailsPage';
import StudentAssignmentListPage from './pages/StudentAssignmentListPage';
import StudentAssignmentDetailsPage from './pages/StudentAssignmentDetailsPage';
import AdminGroupListPage from './pages/AdminGroupListPage';
import AdminGroupDetailsPage from './pages/AdminGroupDetailsPage';
import AdminSubmissionsPage from './pages/AdminSubmissionsPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="groups" element={<GroupsPage />} />

            {/* Course Details (Accessible by Students, Professors, and Admins) */}
            <Route
              path="courses/:id"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'PROFESSOR']}>
                  <CourseDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Student Portal */}
            <Route
              path="student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Student Group Management */}
            <Route
              path="student/groups"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <GroupListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/groups/create"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <CreateGroupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/groups/:id"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'PROFESSOR']}>
                  <GroupDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Student Coursework & Two-Step Submission Confirmation */}
            <Route
              path="student/assignments"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentAssignmentListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/assignments/:id"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentAssignmentDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/assignments/:id/success"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentAssignmentDetailsPage forceSuccessView={true} />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin & Professor Portal */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PROFESSOR']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PROFESSOR']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Faculty Assignment Management */}
            <Route
              path="admin/assignments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PROFESSOR']}>
                  <AdminAssignmentListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/assignments/create"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PROFESSOR']}>
                  <CreateAssignmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/assignments/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PROFESSOR']}>
                  <EditAssignmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/assignments/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PROFESSOR']}>
                  <AssignmentDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Progress Tracking & Monitoring */}
            <Route
              path="admin/groups"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PROFESSOR']}>
                  <AdminGroupListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/groups/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PROFESSOR']}>
                  <AdminGroupDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/submissions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PROFESSOR']}>
                  <AdminSubmissionsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
