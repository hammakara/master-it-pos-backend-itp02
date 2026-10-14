import express from 'express'
import { Roles } from '../middlewares/permission.middleware.js'
import { addPayment, createSale, getAll, getOne } from '../controllers/sale.controller.js'
const router = express.Router()


router.post('/',Roles("manager","cashier"),createSale)
router.get('/',Roles("manager","cashier"),getAll)
router.get('/:id',Roles("manager","cashier"),getOne)
router.put('/:id/addPayment',Roles("manager","cashier"),addPayment)

export default router