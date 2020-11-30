var db =require('../config/connection')
var collections=require('../config/collections')
//=> product add to database
module.exports={

    addProduct:(product,callback)=>{

        db.get().collection(collections.PRODUCT_COLLECTIONS).insertOne(product).then((data)=>{
            console.log(data);
            callback(data.ops[0]._id)
        })


    },

    
    //=> product get from database
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collections.PRODUCT_COLLECTIONS).find().toArray()
            resolve(products)

        })
    }
}
