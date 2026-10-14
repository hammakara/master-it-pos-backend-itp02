import express from 'express'
import { Roles } from '../middlewares/permission.middleware.js'
import { addPayment, create, getAll, getOne, updatePurchaseStatus } from '../controllers/purchase.controller.js'
const router = express.Router()
router.post('/',Roles("manager"), create)
router.get('/',Roles("manager"), getAll)
router.get('/:id',Roles("manager"), getOne)
router.put('/updatePurchaseStatus/:id',Roles("manager"), updatePurchaseStatus)
router.put('/addPayment/:id',Roles("manager"),addPayment)
// router.delete('/:id',Roles("manager"), remove)


export default router