import express from 'express'
import { Roles } from '../middlewares/permission.middleware.js'
import { generateReport } from '../controllers/report.controller.js'
const router = express.Router()

router.get('/general',Roles("manager"),generateReport)

export default router