var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId=require('mongodb').ObjectID;


module.exports = {
    
    doLogin: (vendorData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            let user = await db
                .get()
                .collection(collections.VENDOR_COLLECTIONS)
                .findOne({  Name: vendorData.Name });
            if (user) {
                bcrypt.compare(vendorData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        console.log("login failed 1");
                        resolve({ status: false });
                    }
                });
            } else {
                console.log("login failed 2");
                resolve({ status: false });
            }
        });
    },

    getAllCategorys:()=>{
        return new Promise(async(resolve,reject)=>{
            let Categorys=await db.get().collection(collections.CATEGORY_COLLECTIONS).find().toArray()
            console.log(Categorys)
            resolve(Categorys)

        })
    },
    getVendorsOrder:(vendorId)=>{
        return new Promise(async(resolve,reject)=>{
            let vendorOrder=await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                  $unwind: "$products",
                },
                {
                 $match: { "products._id": objectId(vendorId) },
                },
                { 
                    $sort : { date : -1 }
                },
                {
                    $project: {
                        _id: 1,
                        paymentMethod:1,
                        products:1,
                        date:{ "$dateToString": { "format": "%d-%m-%Y", "date": "$date" } },
                        deliveryDetails:1
                      },
                },
                
              ]).toArray()
              console.log("vendorOrder",vendorOrder);
              resolve(vendorOrder)
        })
    },
    getOrderDetails:(orderId,vendorId)=>{
        return new Promise(async(resolve,reject)=>{
            let OrderDetails=await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                 $match: { "_id": objectId(orderId) },
                },
                {
                  $unwind: "$products",
                },
                {
                 $match: { "products._id": objectId(vendorId) },
                },
               
              ]).toArray()
              console.log("vendorOrder",OrderDetails);
              resolve(OrderDetails[0])
        })
    },
    updateOrderStatus:(orderId,status, vendorId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTIONS).updateOne(
                { 
                  "_id" : objectId(orderId), 
                  "products._id" : objectId(vendorId) 
                 },
                { 
                  $set : { "products.$.status" : status } 
                },
                
              )
        })
    },
    getSalesReport:(vendorId)=>{
        return new Promise(async(resolve,reject)=>{
           let sales =await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $unwind: "$products",
                  },
                  {
                    $match: { $and: [ { "products._id": objectId(vendorId) }, { "products.status":"Delivered" } ] }
                  },
                  { 
                      $sort : { date : -1 }
                  },
                  {
                      $project: {
                        orderId: "$_id",
                        vendorId:"$products._id",
                        price:"$products.totalPrice",
                        date:{ "$dateToString": { "format": "%d-%m-%Y", "date": "$date" } },
                        paymentMethod:"$paymentMethod"
                      },
                  }
                  
            ]).toArray()
              console.log("sales", sales);
              resolve(sales)
        })
    }

  

};
