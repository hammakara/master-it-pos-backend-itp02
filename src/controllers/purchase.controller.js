import { calculatePaymentStatus } from "../helpers/calculatePaymentStatus.js"
import Product from '../models/Product.js'
import Purchase from "../models/Purchase.js"
export const create = async(req ,res ,next)=>{
    try {

        const {totalCost,items,purchaseStatus} = req.body
        const paymentStatus = calculatePaymentStatus(totalCost,0)
        // auto update stock product if purchaseStatus=="received" 
        if(purchaseStatus=="received"){
            for(const item of items){
                const product = await Product.findById(item.product)
                product.currentStock = (product.currentStock || 0 ) + item.quantity
                await product.save()
            }
        }

        // insert data 
        const result = await Purchase.create({
            ...req.body,
            user:req.user._id,
            items,
            dueAmount:totalCost,
            paymentStatus,
            purchaseStatus
        })
        res.status(201).json({
            success:true,
            result : result
        })
    } catch (error) {
        next(error)
    }
}


export const getAll = async (req, res, next) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 5
        const skip = (page - 1) * limit
        const searchQuery = {}
        if (req.query.search) {
            searchQuery['$or'] = [
                {
                    invoiceNumber: { $regex: req.query.search, $options: 'i' }
                }
            ]
        }
        const result = await Purchase.find(searchQuery)
            .populate("user","username role")
            .populate("supplier","name phone")
            .populate({
                path:"items",
                populate:{
                    path:"product",
                    select:"name image_url"
                }
            })
            .limit(limit)
            .skip(skip).sort({ createdAt: -1 })
        const totalRecord = await Purchase.countDocuments()

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
        const result = await Purchase.findById(req.params.id)
            .populate("user","username role")
            .populate("supplier","name phone")
            .populate({
                path:"items",
                populate:{
                    path:"product",
                    select:"name image_url"
                }
            })
        if (!result) return res.status(404).json({ success: false, error: "Purchase not found!" })
        res.status(200).json({
            success: true,
            result: result
        })
    } catch (error) {
        next(error)
    }
}
export const updatePurchaseStatus = async(req,res,next)=>{
    try {
        const id = req.params.id
        const {purchaseStatus} = req.body
        // find purchase 
        const result = await Purchase.findById(id)
        if(!result) return res.status(404).json({success:false,error:"Purhcase record not found!"})
        
        if(result.purchaseStatus=="received"){
            return res.status(400).json({
                success:false,
                error:"Purchase status is ready received!"
            })
        }
        //purchaseStatus=="receiveupdatePurchaseStatusd"
        if(purchaseStatus==="received"){
            for(const item of result.items){
                const product = await Product.findById(item.product)
                product.currentStock = (product.currentStock || 0 ) + item.quantity
                await product.save()
            }
        }
        const  newDoc = await Purchase.findByIdAndUpdate(id,{purchaseStatus})   
        res.status(200).json({
            success:true,
            result :newDoc
        })        
    } catch (error) {
        next(error)
    }
}
export const addPayment = async(req,res,next)=>{
    try {
        const id = req.params.id
        const {paidAmount} = req.body
        // find purchase 
        const purchase = await Purchase.findById(id)
        if(!purchase) return res.status(404).json({success:false,error:"Purchase not Found!"})
        const totalCost = purchase.totalCost
        const newPaidAmount = purchase.paidAmount + paidAmount
        const newDueAmount = Math.max(0,totalCost-newPaidAmount)
        const changeAmount= Math.max(0,newPaidAmount-totalCost) 
        const paymentStatus = calculatePaymentStatus(totalCost,newPaidAmount)
        const updatePurchase = await Purchase.findByIdAndUpdate(id,{
            paidAmount:newPaidAmount,
            dueAmount:newDueAmount,
            changeAmount:changeAmount,
            paymentStatus:paymentStatus
        },{new:true})
        console.log(paymentStatus)
        res.status(200).json({
            success:true,
            result :updatePurchase
        })
    } catch (error) {
        next(error)
    }
}

