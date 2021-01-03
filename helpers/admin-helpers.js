var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require('mongodb').ObjectID
var moment = require('moment')

module.exports = {
    doSignup: (adminData) => {
        return new Promise(async (resolve, reject) => {
            adminData.Password = await bcrypt.hash(adminData.Password, 10);
            db.get().collection(collections.ADMIN_COLLECTIONS).insertOne(adminData)
                .then((data) => {
                    console.log(data.ops)
                    resolve(data.ops);
                });
        });
    },


    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            let user = await db
                .get()
                .collection(collections.ADMIN_COLLECTIONS)
                .findOne({ Email: adminData.Email });
            if (user) {
                bcrypt.compare(adminData.Password, user.Password).then((status) => {
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
    updateProfile:(adminId, adminDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ADMIN_COLLECTIONS).updateOne({ _id: objectId(adminId) }, {
                $set: {
                    Fname: adminDetails.Fname,
                    Sname: adminDetails.Sname,
                    Email: adminDetails.Email,
                    MobileNo: adminDetails.MobileNo, 
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    
    checkPassword:(adminId,oldPassword)=>{
        return new Promise (async(resolve,reject)=>{
          let response={};
          let admin = await db.get().collection(collections.ADMIN_COLLECTIONS)
            .findOne({ _id: objectId(adminId) });
          if (admin) {
            bcrypt.compare(oldPassword,admin.Password).then((status) => {
              if (status) {
                console.log("login success");
                response.status = true;
                resolve(response);
              } else {
                console.log("login failed 1");
                resolve({ status: false });
              }
            });
          }else {
            console.log("login failed 2");
            resolve({ status: false });
          }
        })
    },

    resetPassword:(adminId,newPassword)=>{
        return new Promise (async(resolve ,reject)=>{
         newPassword = await bcrypt.hash(newPassword, 10);
          await db.get().collection(collections.ADMIN_COLLECTIONS).updateOne({_id:objectId(adminId)}, {
           $set: {
               Password: newPassword
           }
         }).then(response)
         resolve(response)
        })
    },
        
       
       
    getEnquiries: () => {
        return new Promise(async (resolve, reject) => {
            let enquiries = await db.get().collection(collections.ENQUIRIES_COLLECTIONS).aggregate([
                {
                    $sort: { Date: -1 }
                },
            ]).toArray()
            console.log(enquiries);
            resolve(enquiries)
        })
    },


    addVendor: (vendorData) => {
        return new Promise(async (resolve, reject) => {
            let Name = await db.get().collection(collections.VENDOR_COLLECTIONS).findOne({ Name: vendorData.Name })
            if (Name) {
                console.log("if");
                resolve({ status: true });
            } else {
                console.log("else");
                vendorData.Password = await bcrypt.hash(vendorData.Password, 10);
                db.get().collection(collections.VENDOR_COLLECTIONS).insertOne(vendorData)
                    .then((data) => {
                        status = false;
                        console.log(data.ops)
                        resolve(data.ops);
                    });
            }

        });
    },



    getAllVendors: () => {
        return new Promise(async (resolve, reject) => {
            let vendors = await db.get().collection(collections.VENDOR_COLLECTIONS).find().toArray()
            resolve(vendors)

        })
    },
    editVendor: (vendorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDOR_COLLECTIONS).findOne({ _id: objectId(vendorId) }).then((vendorDetails) => {
                resolve(vendorDetails)
            })
        })
    },
    updateVendor: (vendorId, vendorDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDOR_COLLECTIONS).updateOne({ _id: objectId(vendorId) }, {
                $set: {
                    Name: vendorDetails.Name,
                    Place: vendorDetails.Place,
                    PhoneNumber: vendorDetails.PhoneNumber,
                    EmailId: vendorDetails.EmailId,
                    Status: vendorDetails.Status
                }
            }).then((response) => {
                resolve()
            })


        })
    },
    deleteVendor: (vendorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDOR_COLLECTIONS).removeOne({ _id: objectId(vendorId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collections.USER_COLLECTIONS).find().toArray()
            resolve(users)

        })
    },
    addUser: (userData) => {
        return new Promise(async (resolve, reject) => {

            let Email = await db.get().collection(collections.USER_COLLECTIONS).findOne({ Email: userData.Email })
            if (Email) {
                console.log("if")
                resolve({ status: true });
            } else {
                console.log("else");
                userData.Password = await bcrypt.hash(userData.Password, 10);
                db.get().collection(collections.USER_COLLECTIONS).insertOne(userData)
                    .then((data) => {
                        status = false;
                        resolve(data.ops[0]);
                    });
            }
        });
    },

    editUsers: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTIONS).findOne({ _id: objectId(userId) }).then((userDetails) => {
                resolve(userDetails)
            })
        })
    },

    updateUser: (userId, userDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTIONS).updateOne({ _id: objectId(userId) }, {
                $set: {
                    Email: userDetails.Email,
                    Status: userDetails.Status,
                    Mobile: userDetails.Mobile,
                }
            }).then((response) => {
                resolve()
            })


        })
    },

    addCategory: (categoryData) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTIONS).insertOne(categoryData)
                .then((data) => {
                    console.log(data.ops)
                    resolve(data.ops);
                });
        });
    },
    getAllCategorys: () => {
        return new Promise(async (resolve, reject) => {
            let Categorys = await db.get().collection(collections.CATEGORY_COLLECTIONS).find().toArray()
            resolve(Categorys)

        })
    },
    editCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTIONS).findOne({ _id: objectId(categoryId) }).then((categoryDetails) => {
                resolve(categoryDetails)
            })
        })
    },
    updateCategory: (categoryId, categoryDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTIONS).updateOne({ _id: objectId(categoryId) }, {
                $set: {
                    Category: categoryDetails.Category,
                    Commission: categoryDetails.Commission,
                }
            }).then((response) => {
                resolve(response)
            })


        })
    },
    deletecategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTIONS).removeOne({ _id: objectId(categoryId) }).then((response) => {
                resolve(response)
            })
        })
    },


    getSalesReport: () => {
        return new Promise(async (resolve, reject) => {
            sales = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $unwind: "$products",
                },
                {
                    $match: { "products.status": "Delivered" },
                },
                {
                    $sort: { date: -1 }
                },
                {
                    $project: {
                        orderId: "$_id",
                        vendorId: "$products._id",
                        price: "$products.totalPrice",
                        date: { "$dateToString": { "format": "%d-%m-%Y", "date": "$date" } },
                        paymentMethod: "$paymentMethod"
                    },
                },

                {
                    $lookup: {
                        from: collections.VENDOR_COLLECTIONS,
                        localField: "vendorId",
                        foreignField: "_id",
                        as: "vendor",
                    },
                },
                {
                    $project: {
                        orderId: 1,
                        vendorId: 1,
                        price: 1,
                        date: 1,
                        paymentMethod: 1,
                        vendorName: { $arrayElemAt: ["$vendor.Name", 0] },
                    },
                },


            ]).toArray()
            console.log("sales", sales);
            resolve(sales)
        })
    },
    getThisMonthSalesReport: () => {
        return new Promise(async (resolve, reject) => {
            let thismonth = new Date().getMonth() + 1
            let thisyear = new Date().getFullYear()
            thisMonthSales = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $unwind: "$products",
                },
                {
                    $project: {
                        _id:null,
                        orderId: "$_id",
                        month:{ $month: "$date" },
                        year:{ $year: "$date" },
                        vendorId: "$products._id",
                        price: "$products.totalPrice",
                        date: { "$dateToString": { "format": "%d-%m-%Y", "date": "$date" } },
                        paymentMethod: "$paymentMethod"
                    },
                },
                {
                    $match:{ $and: [ { year: thisyear }, { month: thismonth} ] }
                },
                {
                    $lookup: {
                        from: collections.VENDOR_COLLECTIONS,
                        localField: "vendorId",
                        foreignField: "_id",
                        as: "vendor",
                    },
                },
                {
                    $project: {
                        orderId: 1,
                        vendorId: 1,
                        price: 1,
                        date: 1,
                        paymentMethod: 1,
                        vendorName: { $arrayElemAt: ["$vendor.Name", 0] },
                    },
                },
                {
                    $sort: { date: -1 }
                },
                

            ]).toArray()
            console.log("sales", thisMonthSales,"thisyear",thisyear);
            resolve(thisMonthSales)
        })
    },

    getThisDaySalesReport: () => {
        return new Promise(async (resolve, reject) => {
            let thisday = new Date().getUTCDate()
            let thismonth = new Date().getMonth() + 1
            let thisyear = new Date().getFullYear()
            thisMonthSales = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $unwind: "$products",
                },
                {
                    $project: {
                        _id:null,
                        orderId: "$_id",
                        day:{$dayOfMonth:"$date"},
                        month:{ $month: "$date" },
                        year:{ $year: "$date" },
                        vendorId: "$products._id",
                        price: "$products.totalPrice",
                        date: { "$dateToString": { "format": "%d-%m-%Y", "date": "$date" } },
                        paymentMethod: "$paymentMethod"
                    },
                },
                {
                    $match:{ $and: [ { year: thisyear }, { month: thismonth},{ day: thisday} ] }
                },
                {
                    $lookup: {
                        from: collections.VENDOR_COLLECTIONS,
                        localField: "vendorId",
                        foreignField: "_id",
                        as: "vendor",
                    },
                },
                {
                    $project: {
                        orderId: 1,
                        vendorId: 1,
                        price: 1,
                        date: 1,
                        paymentMethod: 1,
                        vendorName: { $arrayElemAt: ["$vendor.Name", 0] },
                    },
                },
               
                

            ]).toArray()
            console.log("sales", thisMonthSales,);
            resolve(thisMonthSales)
        })
    },

    thisMonthSales: () => {
        return new Promise(async (resolve, reject) => {
            let thismonth = new Date().getMonth() + 1
            let thisMonhtSales = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $group: {
                        _id: { $month: "$date" },
                        total: { $sum: "$toatlAmount" }
                    }
                },
                {
                    $match: { "_id": thismonth }
                }
            ]).toArray()
            console.log("thisMonhtSales", thisMonhtSales);
            resolve(thisMonhtSales[0].total)
        })
    },
    getBestSellingProducts: () => {
        return new Promise(async (resolve, reject) => {
            let bestSelling = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $unwind: "$products",
                },
                {
                    $unwind: "$products.items",
                },
                {
                    $project: {
                        _id: null,
                        item: "$products.items.item",
                        quantity: "$products.items.quantity"
                    },
                },
                {
                    $group: {
                        _id: "$item",
                        total: { $sum: "$quantity" }

                    }
                },
                {
                    $sort: { total: -1 }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTIONS,
                        localField: "_id",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                {
                    $project: {
                        _id: 0,
                        product: { $arrayElemAt: ["$product.Name", 0] },
                        total: 1
                    },
                },
                {
                    $limit: 5
                }


            ]).toArray()
            console.log("bestSelling", bestSelling);
            resolve(bestSelling)
        })
    },
    getDaySales: () => {
        return new Promise(async (resolve, reject) => {
            let sales = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $project: {
                        toatlAmount: "$toatlAmount",
                        date: { "$dateToString": { "format": "%d-%m-%Y", "date": "$date" } },

                    },
                },
                {
                    $group: {
                        _id: "$date",
                        total: { $sum: "$toatlAmount" }
                    }
                },
                {
                    $limit: 3
                }
            ]).toArray()
            console.log("bestSelling", sales);
            resolve(sales)
        })
    },
    todaySales: () => {
        return new Promise(async (resolve, reject) => {
            today = moment(new Date()).format('DD-MM-YYYY');

            let sales = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $set: { date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } } }
                },
                {
                    $match: { "date": today }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$toatlAmount" }
                    }
                },
                {
                    $project: {
                        total: 1,

                    },
                },
            ]).toArray()
            if (sales.length > 0) {
                console.log("total", sales, "today", today);
                resolve(sales[0].total)
            } else {
                console.log("today", today);
                let total = 0
                resolve(total)
            }

        })
    },

    monthlyWiseSales: () => {
        return new Promise(async (resolve, reject) => {
            let monthlyWiseSales = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $group: {
                        _id: { $month: "$date" },
                        total: { $sum: "$toatlAmount" }
                    }
                },
                {
                    $sort: { _id: -1 }
                },
                {
                    $limit: 2
                }
            ]).toArray()
            console.log("monthlyWiseSales", monthlyWiseSales);
            resolve(monthlyWiseSales)
        })
    },

    totalEarnings: () => {
        return new Promise(async (resolve, reject) => {
            let totalEarnings = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$toatlAmount" }
                    }
                },
            ]).toArray()
            console.log(totalEarnings);
            resolve(totalEarnings[0].total)

        })
    },
    totalOrder: () => {
        return new Promise(async (resolve, reject) => {
            let totalOrder = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $count: "totalOrder"
                }
            ]).toArray()
            console.log(totalOrder);
            resolve(totalOrder[0].totalOrder)

        })
    }





};


