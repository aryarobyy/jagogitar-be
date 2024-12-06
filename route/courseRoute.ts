import { Router } from "express";
import { editeCourse, getAllCourse, getCourse, postCourse } from "../controller/courseController";

const courseRouter = Router()

courseRouter.post('/post', postCourse)
courseRouter.get('/all', getAllCourse)
courseRouter.get('/:courseId', getCourse)
courseRouter.put('/:courseId', editeCourse)

export default courseRouter