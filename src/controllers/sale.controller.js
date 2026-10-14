import { calculatePaymentStatus } from '../helpers/calculatePaymentStatus.js'
import {generateInvoiceNumber}  from './counter.controller.js'
import Product from '../models/Product.js'
import Sale from '../models/Sale.js'
export const createSale = async(req ,res ,next)=>{
    try {
        const {customer,items,paidAmount=0} = req.body
        if(!items|| items.length===0){
            return res.status(400).json({
                success:false,
                error:"Sale must contain at least one product"
            })    
        }

        const paymentAmount = Number(paidAmount)
        const saleItems = []
        let totalAmount = 0
        // check product and calculate total
        for(const item of items){
            const product = await Product.findById(item.product)
            if(!product)return res.status(404).json({success:false,error:`Product not found ${item.product}`})
            // validte quantity
            const quantity = Number(item.quantity)
            // check stock product
            if(product.currentStock <quantity){
                return res.status(400).json({
                    success:false,
                    error:`Insufficient stock for ${product.name} avaliable ${product.currentStock}`
                })
            }
            const salePrice = Number(product.salePrice)
            const total = quantity *salePrice


            totalAmount+=total
            saleItems.push({
                product:product._id,
                quantity,
                price:salePrice,
                total
            })
        }
        // calculate due amount
        const dueAmount = Math.max(0,totalAmount-paymentAmount)
        // calculate change amount
        const changeAmount = Math.max(0,paymentAmount-totalAmount)
        const paymentStatus = calculatePaymentStatus(totalAmount,paymentAmount)
        const invoiceNumber = await generateInvoiceNumber()
        // save data
        const sale = await Sale.create({
            user:req.user._id,
            customer: customer || null,
            invoiceNumber,
            items:saleItems,
            totalAmount,
            paidAmount:paymentAmount,
            dueAmount,
            changeAmount,
            paymentStatus
        })
        for(const item of saleItems){
            await Product.findByIdAndUpdate(item.product,{
                $inc:{
                    currentStock:-item.quantity
                }
            })
        }
        const saleData = await Sale.findById(sale._id)
                                    .populate("user","username role")
                                    .populate("customer","name phone")
                                    .populate("items.product","name salePrice")
        res.status(201).json({
            success:true,
            result:saleData 
        })
    } catch (error) {
        next(error)
    }
}
export const getAll = async (req, res, next) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 1
        const skip = (page - 1) * limit
        const searchQuery = {}
        if (req.query.search) {
            searchQuery['$or'] = [
                {
                    invoiceNumber: { $regex: req.query.search, $options: 'i' }
                },

            ]
        }
        const result = await Sale.find(searchQuery) 
                                    .populate("user","username role")
                                    .populate("customer","name phone")
                                    .populate("items.product","name salePrice")
            .limit(limit)
            .skip(skip).sort({ createdAt: -1 })
        const totalRecord = await Sale.countDocuments()
        res.status(200).json({
            success: true,
            result: result,
            totalPage: Math.ceil(totalRecord / limit)
        })
    } catch (error) {
        next(error)
    }
}


export const getOne = async (req, res, next) => {
    try {
        const result = await Sale.findById(req.params.id)
                                    .populate("user","username role")
                                    .populate("customer","name phone")
                                    .populate("items.product","name salePrice")
        if (!result) return res.status(404).json({ success: false, error: "Sale not found!" })
        res.status(200).json({
            success: true,
            result: result
        })
    } catch (error) {
        next(error)
    }
}



export const addPayment = async(req,res,next)=>{
    try {
        const id = req.params.id
        const {paidAmount} = req.body
        // find sales
        const sale = await Sale.findById(id)
        if(sale.paymentStatus==="paid")return res.status(400).json({success:false,message:"ready paid!"})
        if(!sale) return res.status(404).json({success:false,error:"Sale not Found!"})
        const totalAmount = sale.totalAmount
        const newPaidAmount = sale.paidAmount + paidAmount
        const newDueAmount = Math.max(0,totalAmount-newPaidAmount)
        const changeAmount= Math.max(0,newPaidAmount-totalAmount) 
        const paymentStatus = calculatePaymentStatus(totalAmount,newPaidAmount)
        const updateSale = await Sale.findByIdAndUpdate(id,{
            paidAmount:newPaidAmount,
            dueAmount:newDueAmount,
            changeAmount:changeAmount,
            paymentStatus:paymentStatus
        },{new:true})
        res.status(200).json({
            success:true,
            result :updateSale
        })
    } catch (error) {
        next(error)
    }
}

