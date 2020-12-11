var db = require('../config/connection')
var collections = require('../config/collections')
var objectId=require('mongodb').ObjectID
//=> product add to database
module.exports = {

    addProduct: (product, callback) => {

        db.get().collection(collections.PRODUCT_COLLECTIONS).insertOne(product).then((data) => {
            console.log(data);
            callback(data.ops[0]._id)
        })


    },


    //=> product get from database
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.PRODUCT_COLLECTIONS).find().toArray()
            resolve(products)

        })
    },

    getvendorProducts: (VendorId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.PRODUCT_COLLECTIONS).find({VendorId:VendorId}).toArray()
            resolve(products)

        })
    },



    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTIONS).removeOne({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },


    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTIONS).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },


    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTIONS).updateOne({ _id: objectId(proId) }, {
                $set: {
                    Name: proDetails.Name,
                    Description: proDetails.Description,
                    Price: proDetails.Price,
                    Category: proDetails.Category
                }
            }).then((response) => {
                resolve()
            })


        })
    }
}
