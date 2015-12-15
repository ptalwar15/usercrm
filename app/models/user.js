var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

/**
 * User Schema
 *
 * created a unique index for username, username cannot be duplicated
 * select:false, If we query a list of users or a single user, password will not be displayed, unless it is explicitely called
 */
var userSchema = new Schema({
	name: String,
	username: {type: String,required:true,index:{unique:true}},
	password: {type:String,required:true,select:true}
});

//hash the password before the user is saved, pre: will ensure our password is hashed before we save the user to the dbs
userSchema.pre('save', function(next){
	var user = this;

	//hash the password only if the password has been changed
	if(!user.isModified('password')) return next();

	//generate the hash
	bcrypt.hash(user.password,null,null,function(err,hash){
		if(err) return next(err);

		user.password = hash;
		next();
	});
});

userSchema.methods.comparePassword = function(password) {
	var user = this;

	return bcrypt.compareSync(password,user.password);
};

//return the model
module.exports = mongoose.model('User',userSchema);