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
            vendorData.Password = await bcrypt.hash(vendorData.Password, 10);
            db.get().collection(collections.VENDOR_COLLECTIONS).insertOne(vendorData)
                .then((data) => {
                    console.log(data.ops)
                    resolve(data.ops);
                });
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

};
