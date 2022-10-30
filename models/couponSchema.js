const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    couponCode: {
        type: String,
        require: true,
        unique: true
    },
    discount: {
        type: Number,
        require: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    maxLimit: {
        type: Number,
        require: true
    },
    minPurchase: {
        type: Number,
        require: true
    },
    expDate: {
        type: Date,
        require: true
    },
    usedUsers:[
        {
            userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'user',
               
            }
        }
        
    ]
}, { timestamps: true })
module.exports = mongoose.model("coupon", couponSchema);