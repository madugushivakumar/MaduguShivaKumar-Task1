const courseService = require('../services/course.service');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

class CourseController {
  async getCourses(req, res, next) {
    try {
      const courses = await courseService.getCoursesForUser(req.user);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { courses, count: courses.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCourses(req, res, next) {
    try {
      const courses = await courseService.getAllCourses();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { courses, count: courses.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCourseById(req, res, next) {
    try {
      const course = await courseService.getCourseById(req.params.id, req.user);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req, res, next) {
    try {
      const course = await courseService.createCourse(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Course created successfully.',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req, res, next) {
    try {
      const course = await courseService.updateCourse(req.params.id, req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Course updated successfully.',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req, res, next) {
    try {
      await courseService.deleteCourse(req.params.id, req.user.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Course deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  async enrollStudent(req, res, next) {
    try {
      const result = await courseService.enrollStudent(req.params.id, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEnrolledStudents(req, res, next) {
    try {
      const students = await courseService.getEnrolledStudents(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { students, count: students.length },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CourseController();
