import express from 'express'
import cookieParser from 'cookie-parser'
import { errorHandler } from './helpers/error-handler.js'
import categoryRoute from './routes/category.route.js'
import customerRoute from './routes/customer.route.js'
import supplierRoute from './routes/supplier.route.js'
import uploadRoute from './routes/upload.route.js'
import productRoute from './routes/product.route.js'
import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'
import { protect } from './middlewares/auth.middleware.js'
import { Roles } from './middlewares/permission.middleware.js'
import purchaseRoute from './routes/purchase.route.js'
import saleRoute from './routes/sale.route.js'
import reportRoute from './routes/report.route.js'
const app = express()
app.use(express.json())
app.use(cookieParser())

// routes
app.use('/api/customers',protect, customerRoute)
app.use('/api/suppliers',protect, supplierRoute)
app.use('/api/upload',protect, uploadRoute)
app.use('/api/products',protect,productRoute)
app.use('/api/categories',protect, categoryRoute)
app.use('/api/users',protect,Roles("manager"),userRoute)
app.use('/api/auth',authRoute)
app.use('/api/purchases',protect,purchaseRoute)
app.use('/api/sales',protect,saleRoute)
app.use('/api/reports',protect,reportRoute)


app.use(errorHandler)
export default app

