var mongoose=require('mongoose')
var bcrypt = require('bcrypt')
var SALT_WORK_FACTOR = 10;
var userSchema=new mongoose.Schema({
username:String,
email:{type:String,unique:true},
password:{type:String, required:true},
phoneNumber:{type:String,unique:true},
token:Number,
email_verified:{type:Boolean,default:false},
phone_verified:{type:Boolean, default:false},
})







userSchema.pre('save', function(next) {
    var user = this;
 console.log('step 2')
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

console.log('step 3')
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var User=mongoose.model('User', userSchema)
module.exports=
{
    User:User
}