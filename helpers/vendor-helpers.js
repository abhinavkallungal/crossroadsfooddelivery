var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;
var moment = require("moment");

module.exports = {
  doLogin: (vendorData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collections.VENDOR_COLLECTIONS)
        .findOne({ Name: vendorData.Name });
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
 

  getVendorsDetail: (vendorId) => {
    return new Promise(async (resolve, reject) => {
        let VendorsDetail = await db.get().collection(collections.VENDOR_COLLECTIONS).find({ _id: objectId(vendorId) }).toArray()
        resolve(VendorsDetail[0])
    })
  },


  updateProfile:(vendorId, vendorDetails) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collections.VENDOR_COLLECTIONS).updateOne({ _id: objectId(vendorId) }, {
            $set: {
                Name: vendorDetails.Name,
                Place: vendorDetails.Place,
                EmailId: vendorDetails.EmailId,
                PhoneNumber: vendorDetails.PhoneNumber, 
            }
        }).then((response) => {
            resolve(response)
        })
    })
},

checkPassword:(vendorId,oldPassword)=>{
    return new Promise (async(resolve,reject)=>{
      let response={};
      let admin = await db.get().collection(collections.VENDOR_COLLECTIONS)
        .findOne({ _id: objectId(vendorId) });
      if (admin) {
        bcrypt.compare(oldPassword,admin.Password).then((status) => {
          if (status) {
           
            response.status = true;
            resolve(response);
          } else {
          
            resolve({ status: false });
          }
        });
      }else {
        
        resolve({ status: false });
      }
    })
},

resetPassword:(vendorId,newPassword)=>{
    return new Promise (async(resolve ,reject)=>{
     newPassword = await bcrypt.hash(newPassword, 10);
      await db.get().collection(collections.VENDOR_COLLECTIONS).updateOne({_id:objectId(vendorId)}, {
       $set: {
           Password: newPassword
       }
     }).then()
     resolve()
    })
},
   

  getAllCategorys: () => {
    return new Promise(async (resolve, reject) => {
      let Categorys = await db
        .get()
        .collection(collections.CATEGORY_COLLECTIONS)
        .find()
        .toArray();
      console.log(Categorys);
      resolve(Categorys);
    });
  },
  getVendorsOrder: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      let vendorOrder = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $unwind: "$products",
          },
          {
            $match: { "products._id": objectId(vendorId) },
          },
          {
            $sort: { date: -1 },
          },
          {
            $project: {
              _id: 1,
              paymentMethod: 1,
              products: 1,
              date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
              deliveryDetails: 1,
            },
          },
        ])
        .toArray();
      console.log("vendorOrder", vendorOrder);
      resolve(vendorOrder);
    });
  },
  getOrderDetails: (orderId, vendorId) => {
    return new Promise(async (resolve, reject) => {
      let OrderDetails = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $match: { "products._id": objectId(vendorId) },
          },
        ])
        .toArray();
      console.log("vendorOrder", OrderDetails);
      resolve(OrderDetails[0]);
    });
  },
  getOrderproducts: (orderId, vendorId) => {
    return new Promise(async (resolve, reject) => {
      let Orderproducts = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $unwind: "$products.items",
          },
          {
            $match: { "products._id": objectId(vendorId) },
          },
          {
            $project: {
              _id: 0,
              item: "$products.items.item",
              quantity: "$products.items.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      console.log("vendorOrder", Orderproducts);
      resolve(Orderproducts);
    });
  },
  updateOrderStatus: (orderId, status, vendorId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTIONS)
        .updateOne(
          {
            _id: objectId(orderId),
            "products._id": objectId(vendorId),
          },
          {
            $set: { "products.$.status": status },
          }
        );
    });
  },
  //for chart
  getBestSellingProducts: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      let bestSelling = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $unwind: "$products",
          },
          {
            $match: {
              $and: [
                { "products._id": objectId(vendorId) },
                { "products.status": "Delivered" },
              ],
            },
          },
          {
            $unwind: "$products.items",
          },
          {
            $project: {
              _id: null,
              item: "$products.items.item",
              quantity: "$products.items.quantity",
            },
          },
          {
            $group: {
              _id: "$item",
              total: { $sum: "$quantity" },
            },
          },
          {
            $sort: { total: -1 },
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
              total: 1,
            },
          },
          {
            $limit: 5,
          },
        ])
        .toArray();
      console.log("bestSelling", bestSelling);
      resolve(bestSelling);
    });
  },

  // for sales page selection box and dashboard
  getSalesReport: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      let sales = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $unwind: "$products",
          },
          {
            $match: {
              $and: [
                { "products._id": objectId(vendorId) },
                { "products.status": "Delivered" },
              ],
            },
          },
          {
            $sort: { date: -1 },
          },
          {
            $project: {
              orderId: "$_id",
              vendorId: "$products._id",
              price: "$products.totalPrice",
              date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
              paymentMethod: "$paymentMethod",
            },
          },
        ])
        .toArray();
      console.log("sales", sales);
      resolve(sales);
    });
  },
  //for sales page
  getThisMonthSalesReport: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      let thismonth = new Date().getMonth() + 1;
      let thisyear = new Date().getFullYear();
      thisMonthSales = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $unwind: "$products",
          },
          {
            $match: {
              $and: [
                { "products._id": objectId(vendorId) },
                { "products.status": "Delivered" },
              ],
            },
          },
          {
            $project: {
              _id: null,
              orderId: "$_id",
              month: { $month: "$date" },
              year: { $year: "$date" },
              vendorId: "$products._id",
              price: "$products.totalPrice",
              date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
              paymentMethod: "$paymentMethod",
            },
          },
          {
            $match: { $and: [{ year: thisyear }, { month: thismonth }] },
          },
          {
            $sort: { date: -1 },
          },
        ])
        .toArray();
      console.log("sales", thisMonthSales, "thisyear", thisyear);
      resolve(thisMonthSales);
    });
  },
  //for sales page
  getThisDaySalesReport: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      let thisday = new Date().getUTCDate();
      let thismonth = new Date().getMonth() + 1;
      let thisyear = new Date().getFullYear();
      console.log(thisday, thismonth, thisyear);
      let thisDaySales = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $unwind: "$products",
          },
          {
            $match: {
              $and: [
                { "products._id": objectId(vendorId) },
                { "products.status": "Delivered" },
              ],
            },
          },
          {
            $project: {
              _id: null,
              orderId: "$_id",
              day: { $dayOfMonth: "$date" },
              month: { $month: "$date" },
              year: { $year: "$date" },
              vendorId: "$products._id",
              price: "$products.totalPrice",
              date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
              paymentMethod: "$paymentMethod",
            },
          },
          {
            $match: {
              $and: [
                { year: thisyear },
                { month: thismonth },
                { day: thisday },
              ],
            },
          },
        ])
        .toArray();
      console.log("sales", thisDaySales);
      resolve(thisDaySales);
    });
  },

  //for chart
  getDaySales: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      let sales = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $sort: { date: -1 },
          },
          {
            $unwind: "$products",
          },
          {
            $match: {
              $and: [
                { "products._id": objectId(vendorId) },
                { "products.status": "Delivered" },
              ],
            },
          },
          {
            $project: {
              toatlAmount: "$toatlAmount",
              date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
            },
          },
          {
            $group: {
              _id: "$date",
              total: { $sum: "$toatlAmount" },
            },
          },
          {
            $limit: 3,
          },
        ])
        .toArray();
      console.log("", sales);
      resolve(sales);
    });
  },

  monthlyWiseSales: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      let monthlyWiseSales = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $unwind: "$products",
          },
          {
            $match: {
              $and: [
                { "products._id": objectId(vendorId) },
                { "products.status": "Delivered" },
              ],
            },
          },
          {
            $group: {
              _id: { $month: "$date" },
              total: { $sum: "$toatlAmount" },
            },
          },
          {
            $sort: { _id: -1 },
          },
          {
            $limit: 2,
          },
        ])
        .toArray();
      console.log("monthlyWiseSales", monthlyWiseSales);
      resolve(monthlyWiseSales);
    });
  },

  todayEarnings: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      today = moment(new Date()).format("DD-MM-YYYY");

      let sales = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $unwind: "$products",
          },
          {
            $match: {
              $and: [
                { "products._id": objectId(vendorId) },
                { "products.status": "Delivered" },
              ],
            },
          },
          {
            $set: {
              date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
            },
          },
          {
            $match: { date: today },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$toatlAmount" },
            },
          },
          {
            $project: {
              total: 1,
            },
          },
        ])
        .toArray();
      if (sales.length > 0) {
        console.log("total", sales, "today", today);
        resolve(sales[0].total);
      } else {
        console.log("today", today);
        let total = 0;
        resolve(total);
      }
    });
  },
  thisMonthEarnings: (VendorId) => {
    return new Promise(async (resolve, reject) => {
      let thismonth = new Date().getMonth() + 1;
      let thisMonhtEarnings = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $unwind: "$products",
          },
          {
            $match: {
              $and: [
                { "products._id": objectId(vendorId) },
                { "products.status": "Delivered" },
              ],
            },
          },
          {
            $group: {
              _id: { $month: "$date" },
              total: { $sum: "$toatlAmount" },
            },
          },
          {
            $match: { _id: thismonth },
          },
        ])
        .toArray();
      if (thisMonhtEarnings.length > 0) {
        resolve(thisMonhtEarnings[0].total);
      } else {
        let total = 0;
        resolve(total);
      }
    });
  },

  totalEarnings: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      let totalEarnings = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $unwind: "$products",
          },
          {
            $match: {
              $and: [
                { "products._id": objectId(vendorId) },
                { "products.status": "Delivered" },
              ],
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$toatlAmount" },
            },
          },
        ])
        .toArray();
      if (totalEarnings.length > 0) {
        resolve(totalEarnings[0].total);
      } else {
        let total = 0;
        resolve(total);
      }
    });
  },
  totalOrder: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      let totalOrder = await db
        .get()
        .collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $unwind: "$products",
          },
          {
            $match: {
              $and: [
                { "products._id": objectId(vendorId) },
                { "products.status": "Delivered" },
              ],
            },
          },
          {
            $count: "totalOrder",
          },
        ])
        .toArray();
      if (totalOrder.length > 0) {
        resolve(totalOrder[0].totalOrder);
      } else {
        let totalOrder = 0;
        resolve(totalOrder);
      }
    });
  },
};
