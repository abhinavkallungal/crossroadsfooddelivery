var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require('mongodb').ObjectID
const config = require("../config/config");
const client = require("twilio")(config.accountSID, config.authToken);
const Razorpay = require("razorpay")
const crypto = require('crypto');
const { resolve } = require("path");
const { response } = require("express");
var instance = new Razorpay({
  key_id: 'rzp_test_GyVJAdzPLcnbjg',
  key_secret: 'L23H9XwK9v1B9XsD9vArpHXm',
});


module.exports = {
  doSignup: (userData) => {
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
      let user = await db.get().collection(collections.USER_COLLECTIONS)
        .findOne({ Email: userData.Email });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
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
  getUserStatus: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ _id: objectId(userId) })
      if (user.Status === "active") {
        resolve({ UserStatus: "active" })
      } else {
        resolve({ UserStatus: "block" })
      }
    })
  },
  doemailvalidation: (Email) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTIONS)
        .findOne({ Email: Email })
      if (user) {
        resolve({ emailavailability: false });
      } else {
        resolve({ emailavailability: true });
      }

    })
  },
  doMobileValidation: (mobile) => {
    console.log(mobile);
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTIONS)
        .findOne({ Mobile: mobile })
      if (user) {
        console.log(user);
        resolve({ available: true });
      } else {
        resolve({ available: false });
      }

    })
  },

  doSendOtp: (MobileNumber) => {
    return new Promise(async (resolve, reject) => {
      client.verify
        .services("VA8cd480f75d3e7d3f45949aa50a1f305f")
        .verifications.create({
          to: MobileNumber,
          channel: "sms",
        })
        .then((response) => {
          console.log(response);
          resolve(response)

        });
    })
  },

  doVerifyOtp: (MobileNumber, Otp) => {
    return new Promise(async (resolve, reject) => {

      let response = {};
      let user = await db.get().collection(collections.USER_COLLECTIONS)
        .findOne({ Mobile: MobileNumber });
      console.log(user);
      if (user) {
        client.verify
          .services("VA8cd480f75d3e7d3f45949aa50a1f305f")
          .verificationChecks
          .create({
            to: MobileNumber,
            code: Otp
          }).then((data) => {
            console.log(data.status);
            if (data.status === "approved") {
              console.log("login success");
              response.user = user;
              response.status = true;
              console.log(response.user, response.status)
              resolve(response);
            } else {
              console.log("login failed 1");
              resolve({ status: false });
            }
          });
      }

    })
  },
  updateProfile:(userId, userDetails) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collections.USER_COLLECTIONS).updateOne({ _id: objectId(userId) }, {
            $set: {
                Fname: userDetails.Fname,
                Sname: userDetails.Sname,
                Email: userDetails.Email,
                MobileNo: userDetails.MobileNo, 
            }
        }).then((response) => {
            resolve()
        })
    })
   },
   checkPassword:(userId,oldPassword)=>{
    return new Promise (async(resolve,reject)=>{
      let response={};
      let user = await db.get().collection(collections.USER_COLLECTIONS)
        .findOne({ _id: objectId(userId) });
      if (user) {
        bcrypt.compare(oldPassword,user.Password).then((status) => {
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

  resetPassword:(userId,newPassword)=>{
   return new Promise (async(resolve ,reject)=>{
    newPassword = await bcrypt.hash(newPassword, 10);
     await db.get().collection(collections.USER_COLLECTIONS).updateOne({_id:objectId(userId)}, {
      $set: {
          Password: newPassword
      }
    }).then(response)
    resolve(response)
   })
   },
   
  addEnquiery:(enquiery)=>{
    return new Promise (async (resolve,reject)=>{
      db.get().collection(collections.ENQUIRIES_COLLECTIONS).insertOne(enquiery)
      .then((data)=>{
        resolve(data.ops[0]);
      })
    })
  },
  getAllVendors:()=>{
    return new Promise(async(resolve,reject)=>{
        let vendors=await db.get().collection(collections.VENDOR_COLLECTIONS).find({Status:"Active"}).toArray()
        resolve(vendors)
    })
},
  checkCartAvaiable: (userId) => {
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collections.CART_COLLECTIONS)
        .findOne({ user: objectId(userId) });
        console.log("userCart")
      resolve(userCart)
    })
  },

  addToCart: (proId, vendorId, userId) => {
    console.log(proId);
    console.log(vendorId);
    console.log(userId);
    let proObj = {
      item: objectId(proId),
      quantity: 1,

    };
    let vendorObj = {
      vendorId: objectId(vendorId),
      cartItems: [proObj],
    }

    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collections.CART_COLLECTIONS)
        .findOne({ user: objectId(userId) });

      if (userCart) {
        console.log("cart exist")
        let vendorExist = userCart.cart.findIndex((cart) => cart.vendorId == vendorId)
        console.log(vendorExist);
        if (vendorExist != -1) {
          console.log("cart and vendor exist")
          let cart = userCart.cart
          console.log("cart", cart);
          let vendor = cart.find((vendorId) => vendorId === vendorId)
          console.log("vendor", vendor);
          let cartItems = vendor.cartItems
          console.log("cartItems", cartItems);
          let item = cartItems.find((cartItems) => cartItems.item == proId)
          console.log("item", item);
          let proExist = userCart.cart[vendorExist].cartItems.findIndex((cartItems) => cartItems.item == proId)
          console.log("proExist", proExist);
          product = userCart.cart[vendorExist].cartItems[proExist]
          console.log("product", product);
          // let proExist = vendor.products.findIndex((product) => product.item == proId);
          console.log(item);
          if (proExist != -1) {
            console.log("cart ,vendor and product exist ")
             db.get().collection(collections.CART_COLLECTIONS).updateOne(
              { 
                "user" : objectId(userId), 
                "cart.vendorId" : objectId(vendorId), 
                "cart.cartItems.item" : objectId(proId) },
              { 
                $inc:  { "cart.$[v].cartItems.$[p].quantity" : 1 } 
              },
              { arrayFilters: [  { "v.vendorId": objectId(vendorId)},{ "p.item": objectId(proId)} ], multi: true}

             )
          } else {
            console.log("cart ,vendor exist   product not  exist ")
            db.get()
              .collection(collections.CART_COLLECTIONS)
              .updateOne(
                { user: objectId(userId), "cart.vendorId": objectId(vendorId) },
                {
                  $push: { "cart.$.cartItems": proObj },
                }
              )
              .then((response) => {
                resolve();
              });
          }
        } else {
          console.log("cart  exist vendor and  product not  exist ")
          db.get().collection(collections.CART_COLLECTIONS)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { cart: vendorObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }

      } else {
        console.log("cart, vendor and  product not  exist ")
        let cartObj = {
          user: objectId(userId),
          cart: [vendorObj],
        };
        db.get().collection(collections.CART_COLLECTIONS).insertOne(cartObj)
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
      count = await db.get().collection(collections.CART_COLLECTIONS).aggregate([
        {
          $match: { user: objectId(userId) },
        },
        {
          $unwind: "$cart",
        },
        {
          $project: {
            _id: 1,
            user:1,
            cartItems:"$cart.cartItems"
          },
        },
        {
          $unwind: "$cartItems",
        },
        {
          $count: "cartItems"
        }
      ]).toArray()
      console.log("count", count);
      count=count[0].cartItems
    }
      resolve(count);
    
    })
  
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collections.CART_COLLECTIONS)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$cart",
          },
          {
            $unwind: "$cart.cartItems",
          },
          {
            $project: {
              _id:0,
              item: "$cart.cartItems.item",
              quantity: "$cart.cartItems.quantity",
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
        console.log("cartItems",cartItems);
      resolve(cartItems);
      console.log(cartItems);
    });
  },
  getTotelAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = 0;
      let cart = await db.get().collection(collections.CART_COLLECTIONS)
        .findOne({ user: objectId(userId) });
      if (cart) {
       total = await db.get().collection(collections.CART_COLLECTIONS).aggregate([
        {
          $match: { user: objectId(userId) },
        },
        {
          $unwind: "$cart",
        },
        {
          $unwind: "$cart.cartItems",
        },
        {
          $project: {
            _id:0,
            item: "$cart.cartItems.item",
            quantity: "$cart.cartItems.quantity",
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
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$quantity", "$products.Price"] } }

          }
        }
      ])
        .toArray();
       console.log(total[0].total);
      total=total[0].total
      
     }
      resolve(total);

    });
  },
  changeProductQuantity: (details) => {
    console.log(details);
    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)

    return new Promise((resolve, reject) => {
      if (details.count === -1 && details.quantity === 1) {
        db.get().collection(collections.CART_COLLECTIONS)
        .updateOne(
          { 
            "user" : objectId(details.user)
          }, 
          { 
             $pull: { "cart.$[v].cartItems": { item: objectId(details.product)} } 

          },
          { 
            arrayFilters: [  { "v.vendorId":objectId(details.vendorId),} ], multi: true
          }
          ).then((response) => {
            resolve({ removeProduct: true });
          })
      } else {
        db.get().collection(collections.CART_COLLECTIONS).updateOne(
          { 
            "user" : objectId(details.user), 
            "cart.vendorId" : objectId(details.vendorId), 
            "cart.cartItems.item" :objectId(details.product) },
          { 
            $inc:  { "cart.$[v].cartItems.$[p].quantity" : details.count } 
          },
          { arrayFilters: [  { "v.vendorId":objectId(details.vendorId),},{ "p.item": objectId(details.product)} ], multi: true}

         )
         resolve({ removeProduct: false }); 
      }

    });
  },
  getvendorPrice: (userId) => {
    return new Promise(async (resolve, reject) => {
      // let products= await db.get().collection(collections.CART_COLLECTIONS).findOne({user:objectId(userId)})
      let vendorPrice= await db.get().collection(collections.CART_COLLECTIONS).aggregate([
        {
          $match: { user: objectId(userId) },
        },
        {
          $unwind: "$cart",
        },
       
        {
          $unwind: "$cart.cartItems",
        },
        {
          $project: {
            _id:0,
            item: "$cart.cartItems.item",
            quantity: "$cart.cartItems.quantity",
            vendorId:"$cart.vendorId"
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
            vendorId:1,
            products: { $arrayElemAt: ["$products", 0] },
            status:"test"
          }
        },
        {
          $group: {
            _id:  "$vendorId",
            totalPrice: { $sum: { $multiply: ["$quantity", "$products.Price"] } },
            items: {$push:{quantity:'$quantity',item:'$item'}}
          },  
        },
        {
          $project: {
            _id: 1,
            totalPrice: 1,
            status:"placed",
            items:1
            
          }
        },
        
         
      ]).toArray();
       console.log("vendorPrice",vendorPrice);
      resolve(vendorPrice)
    })
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      // let products= await db.get().collection(collections.CART_COLLECTIONS).findOne({user:objectId(userId)})
      let products= await db.get().collection(collections.CART_COLLECTIONS).aggregate([
        {
          $match: { user: objectId(userId) },
        },
        
         
      ]).toArray();
       console.log("products",products);
      resolve(products[0].cart)
    })
  },
  placeOrder: (order, total,vendorPrice) => {
    return new Promise((resolve, reject) => {
      let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
      let orderObj = {

        userId: objectId(order.userId),
        paymentMethod: order['payment-method'],
        products: vendorPrice,
        toatlAmount: total,
        date: new Date(),
        status: status,
        deliveryDetails: {
          FirstName: order.firstName,
          LastName: order.lastName,
          Email: order.Email,
          Address: order.Address,
          Address2: order.Address2,
          Zip: order.zip,
          Mobile: order.Mobile

        },

      }
      db.get().collection(collections.ORDER_COLLECTIONS).insertOne(orderObj).then((response) => {
        db.get().collection(collections.CART_COLLECTIONS).removeOne({ user: objectId(order.userId) })
        console.log("order id is =" + response.ops[0]._id);
        resolve(response.ops[0]._id)
      })
    })

  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
        {
          $match: { userId: objectId(userId) },
        },
        {
          $unwind: "$products",
        },
      ]).toArray()
       
      console.log(orders);
      resolve(orders);
    })
  },
  getOrderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db.get().collection(collections.ORDER_COLLECTIONS)
        .find({ _id: objectId(orderId) }).toArray()
      console.log(order);
      resolve(order);
    })
  },
  getOrderProduct: (orderId,vendorId) => {
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
            $match: { "products._id": objectId(vendorId) },
          },
          {
            $unwind: "$products.items",
          },
          {
            $project: {
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
      console.log(orderItems);
      resolve(orderItems);
    });
  },
  generateRazorpay: (orderId, totalPrice) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalPrice * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId
      };
      instance.orders.create(options, function (err, order) {
        console.log("new order", order);
        resolve(order)
      });
    })

  },
  verifyRazorpay: (details) => {
    return new Promise((resolve, reject) => {
      let hmac = crypto.createHmac('sha256', "L23H9XwK9v1B9XsD9vArpHXm")
      hmac.update(details['Payment[razorpay_order_id]'] + '|' + details['Payment[razorpay_payment_id]']);
      hmac = hmac.digest('hex')
      if (hmac === details['Payment[razorpay_signature]']) {
        resolve()
      } else {
        reject()
      }
    })

  },
  changePayementStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collections.ORDER_COLLECTIONS).updateOne({ _id: objectId(orderId) },
        {
          $set: {
            status: 'placed'
          }
        }
      ).then(() => {
        resolve()
      })
    })
  }

};








// .updateOne(
//   {},
//   { $inc: { "cart.$[vendorId].questions.$[score]": 2 } },
//   { arrayFilters: [ {vendorId:objectId(vendorId)} , { "score": { $gte: 8 } } ], multi: true},
//   {user: objectId(userId), "cart.vendorId":objectId(vendorId),"cartItems.item":objectId(proId)},
//   {
//     $inc: { "cart.cartItems.item.$quantity": 1 },
//   }
// ).then((response) => {
//   resolve();
// });




// .updateOne(
//   { 
//     "user" : objectId(userId), 
//     "cart.vendorId" :objectId(vendorId), 
//     "cart.cartItems.item" : userCart.cart[vendorExist].cartItems[proExist]},
//   { 
//     $set : { "cart.$.cartItems.$$.quantity" : 30 } 
//   },
//   false,
//   true
// )
// .aggregate([
//   {
//     $match: { user: objectId(userId) },
//   },
//   {
//     $unwind: "$cart",
//   },
//   {
//     $match: { "cart.vendorId": objectId(vendorId) },
//   },
//   {
//     $unwind: "$cart.cartItems",
//   },
//   {
//     $match: { "cart.cartItems.item": objectId(proId) },
//   },
//   {
//     $project: {
//       _id: 0,
//       item: "$cart.cartItems.item",
//       quantity: "$cart.cartItems.quantity"
//     },
//   },
//   {
//     $set: { "quantity": { $sum: ["$quantity", 1] } }
//   },
//   { $push: { item: "$cart.cartItems.item", quantity: "$quantity" } }

// ]).toArray()