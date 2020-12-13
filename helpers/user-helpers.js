var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require('mongodb').ObjectID




module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {

      let email = await db.get().collection(collections.USER_COLLECTIONS).findOne({ Email: userData.Email })
      if (email) {
        console.log("if")
        resolve({ status: true });
      } else {
        console.log("else");
        userData.password = await bcrypt.hash(userData.password, 10);
        db.get().collection(collections.USER_COLLECTIONS).insertOne(userData)
          .then((data) => {
            // console.log(data.ops)
            status = false;
            resolve(data.ops[0]);
          });
      }



    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get().collection(collections.USER_COLLECTIONS)
        .findOne({ Email: userData.Email });
      if (user) {
        bcrypt.compare(userData.Password, user.password).then((status) => {
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
  doemailvalidation: (Email) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTIONS)
        .findOne({ Email:Email })
      if (user) {
        resolve({ emailavailability: false });
      } else {
        resolve({ emailavailability: true });
      }

    })


  },
  doMobileValidation: (mobile) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTIONS)
        .findOne({ mobileno:mobile })
      if (user) {
        resolve({ available: true });
      } else {
        resolve({ available: false });
      }

    })


  },
  checkCartAvaiable:(userId) =>{
   return new Promise(async (resolve,reject) =>{
    let userCart = await db.get().collection(collections.CART_COLLECTIONS)
    .findOne({ user: objectId(userId) });
    resolve(userCart)
   })
  },

  addToCart: (proId,c) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collections.CART_COLLECTIONS)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex((product) => product.item == proId
        );
        console.log(proExist);
        if (proExist != -1) {
          db.get().collection(collections.CART_COLLECTIONS)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            ),
            then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collections.CART_COLLECTIONS)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collections.CART_COLLECTIONS)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db.get().collection(collections.CART_COLLECTIONS)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  getCartProducts:(userId)=>{
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collections.CART_COLLECTIONS)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
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
      
      resolve(cartItems);
    });
  },
  getTotelAmount:(userId)=>{


  
    return new Promise(async (resolve, reject) => {
      let total = await db.get().collection(collections.CART_COLLECTIONS).aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              products: { $arrayElemAt: ["$products", 0] },
            }
          },
          {
            $group:{
              _id:null,
              total:0,
              total:{$sum:{$multiply:["$quantity","$products.Price"]}}
              
            }
          }
        ])
        .toArray();
        console.log("total"+total);
      resolve(total[0].total);
      
    });
  },
  changeProductQuantity: ( details) => {
    details.count=parseInt(details.count)
    details.quantity=parseInt(details.quantity)

    return new Promise((resolve, reject) => {
     if(details.count==-1 && details.quantity==1){
        db.get().collection(collections.CART_COLLECTIONS)
        .updateOne({_id:objectId(details.cart)},
          {
            $pull: { products:{item:objectId(details.product)}}
          }
        ).then((response) => {
          resolve({removeProduct:true});
        })
     }else{
        db.get().collection(collections.CART_COLLECTIONS)
        .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
        {
            $inc:{"products.$.quantity":details.count}
        }
        ).then((response)=>{
            
            resolve({status:true})
        })
     }
      
    });
  },
  getCartProductList:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let products= await db.get().collection(collections.CART_COLLECTIONS).findOne({user:objectId(userId)})
      resolve({products})
    })
  },
  placeOrder:(order,products,total)=>{
    return new Promise((resolve,reject)=>{
        console.log(order,products,total);
        let status=order['payment-method']==='COD'?'placed':'pending'
        let orderObj={
          deliveryDetails:{
            FirstName:order.firstName,
            LastName:order.lastName,
            Email:order.Email,
            Address:order.Address,
            Address2:order.Address2,
            Zip:order.zip,
            Mobile:order.Mobile

          },
          userId:objectId(order.userId),
          paymentMethod:order['payment-method'],
          products:products,
          toatlAmount:total,
          date:new Date(),
          status:status

        }
        db.get().collection(collections.ORDER_COLLECTIONS).insertOne(orderObj).then((response)=>{
          db.get().collection(collections.CART_COLLECTIONS).removeOne({user:objectId(order.userId)})
          console.log("order id is ="+response.ops[0]._id);
          resolve(response.ops[0]._id)
        })
    })

  },
  getUserOrders:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let orders=await db.get().collection(collections.ORDER_COLLECTIONS)
        .find({userId:objectId(userId)}).toArray()
        console.log(orders);
        resolve(orders);
    })
  },
  getOrderProduct:(orderId)=>{
    return new Promise(async (resolve, reject) => {
      let orderItems = await db.get().collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
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
      console.log(orderItems);
      resolve(orderItems);
    });
  },





};






