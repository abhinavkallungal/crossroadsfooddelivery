var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId=require('mongodb').ObjectID


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


    addVendor: (vendorData) => {
        return new Promise(async (resolve, reject) => {
            let Name = await db.get().collection(collections.VENDOR_COLLECTIONS).findOne({ Name: vendorData.Name})
            if(Name){
                console.log("if");
                resolve({ status: true });
            }else{
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
    getAllVendors:()=>{
        return new Promise(async(resolve,reject)=>{
            let vendors=await db.get().collection(collections.VENDOR_COLLECTIONS).find().toArray()
            resolve(vendors)

        })
    },
    editVendor:(vendorId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.VENDOR_COLLECTIONS).findOne({_id:objectId(vendorId)}).then((vendorDetails)=>{
                resolve(vendorDetails)
            })
        })   
    },
    updateVendor:(vendorId,vendorDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.VENDOR_COLLECTIONS).updateOne({_id:objectId(vendorId)},{
               $set:{
                   Name:vendorDetails.Name,
                   Place:vendorDetails.Place,
                   PhoneNumber:vendorDetails.PhoneNumber,
                   EmailId:vendorDetails. EmailId
               } 
            }).then((response)=>{
                resolve()
            })

            
        })
    },
    deleteVendor:(vendorId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.VENDOR_COLLECTIONS).removeOne({_id:objectId(vendorId)}).then((response)=>{
                 resolve(response)
            })
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collections.USER_COLLECTIONS).find().toArray()
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

    editUsers:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTIONS).findOne({_id:objectId(userId)}).then((userDetails)=>{
                resolve(userDetails)
            })
        })   
    },

    updateUser:(userId,userDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTIONS).updateOne({_id:objectId(userId)},{
               $set:{
                   Email:userDetails.Email,
                   Status:userDetails.Status,
                   Mobile:userDetails.Mobile,
               } 
            }).then((response)=>{
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
    getAllCategorys:()=>{
        return new Promise(async(resolve,reject)=>{
            let Categorys=await db.get().collection(collections.CATEGORY_COLLECTIONS).find().toArray()
            resolve(Categorys)

        })
    },
    editCategory:(categoryId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTIONS).findOne({_id:objectId(categoryId)}).then((categoryDetails)=>{
                resolve(categoryDetails)
            })
        })   
    },
    updateCategory:(categoryId,categoryDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTIONS).updateOne({_id:objectId(categoryId)},{
               $set:{
                   Category:categoryDetails.Category,
                   Commission:categoryDetails.Commission,
               } 
            }).then((response)=>{
                resolve(response)
            })

            
        })
    },
    deletecategory:(categoryId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTIONS).removeOne({_id:objectId(categoryId)}).then((response)=>{
                 resolve(response)
            })
        })
    },

};
