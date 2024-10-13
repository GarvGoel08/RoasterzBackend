const mongoose = require('mongoose');
const { Schema } = mongoose;

const CouponSchema = new Schema({
    couponCode: {
        type: String,
        require: true
    },
    couponDiscount: {
        type: Number,
        require: true
    }
});

module.exports = (mongoose.model('Coupon', CouponSchema));