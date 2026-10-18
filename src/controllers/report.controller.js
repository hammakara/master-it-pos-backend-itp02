import Customer from "../models/Customer.js"
import Purchase from "../models/Purchase.js"
import Sale from "../models/Sale.js"
import Supplier from "../models/Supplier.js"

export const generateReport  = async(req ,res , next)=>{
    try {
        // 1.Get revenue today
        const startToday = new Date(new Date().setHours(0,0,0,0))
        const endToday = new Date(new Date().setHours(23,59,59,999))
        const totalSales = await Sale.find({
            createdAt:{
                $gte:startToday,$lte:endToday
            }
        },{totalAmount:1})
        // 2. Total due Sales
        const dueSale = await Sale.find({
            paymentStatus:"due"
        },{
            dueAmount:1
        })
        // 3. total due purchases
        const duePurchase = await Purchase.find({
            paymentStatus:"due"
        },{
            dueAmount:1
        })
        //4. monthly sales
        const startMonth = new Date(new Date().getFullYear(),new Date().getMonth(),1).setHours(0,0,0,0)
        const endMonth = new Date(new Date().getFullYear(),new Date().getMonth()+1,0).setHours(23,59,59,999)
        const monthlySales = await Sale.find({
            createdAt:{$gte:startMonth,$lte:endMonth}
        },{totalAmount:1})
        // count customers
        const customers = await Customer.countDocuments()
        // count suppliers
        const suppliers = await Supplier.countDocuments()
        res.status(200).json({
            success:true,
            result :{
                totalSales:totalSales.reduce((sum,sale)=>sum + sale.totalAmount,0),
                totalDueSale:dueSale.reduce((sum,sale)=>sum+sale.dueAmount,0),
                totalDuePurchases:duePurchase.reduce((sum,pur)=>sum+pur.dueAmount,0),
                monthlySales:monthlySales.reduce((sum,sale)=>sum +sale.totalAmount,0),
                totalCustomer:customers,
                totalSuppliers:suppliers
            }
        })

    } catch (error) {
        next(error)
    }
}

export const report30days = async(req ,res , next)=>{
    try{
        
    }catch(err){
        next(err)
    }
}
export const stockReport = async(req ,res , next)=>{
    try{

    }catch(err){
        next(err)
    }
}
