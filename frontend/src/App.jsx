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

            {/* Protected Student Portal */}
            <Route
              path="student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Phase 4: Student Group Management */}
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
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                  <GroupDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Phase 6: Student Coursework & Two-Step Submission Confirmation */}
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

            {/* Protected Admin Portal */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Phase 5: Professor/Admin Assignment Management */}
            <Route
              path="admin/assignments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminAssignmentListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/assignments/create"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <CreateAssignmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/assignments/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <EditAssignmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/assignments/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AssignmentDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Phase 7: Progress Tracking & Monitoring */}
            <Route
              path="admin/groups"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminGroupListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/groups/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminGroupDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/submissions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
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
