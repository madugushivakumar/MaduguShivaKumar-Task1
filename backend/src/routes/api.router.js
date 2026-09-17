const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const groupRoutes = require('./group.routes');
const assignmentRoutes = require('./assignment.routes');
const submissionRoutes = require('./submission.routes');
const adminRoutes = require('./admin.routes');
const analyticsRoutes = require('./analytics.routes');

const apiRouter = express.Router();

// Health Check routes
apiRouter.use('/health', healthRoutes);

// Authentication & Authorization routes
apiRouter.use('/auth', authRoutes);

// Student Group Management routes
apiRouter.use('/groups', groupRoutes);

// Assignment Management routes
apiRouter.use('/assignments', assignmentRoutes);

// Submission Confirmation routes
apiRouter.use('/submissions', submissionRoutes);

// Admin Monitoring & Progress routes
apiRouter.use('/admin', adminRoutes);

// Admin Analytics routes
apiRouter.use('/analytics', analyticsRoutes);

module.exports = apiRouter;
