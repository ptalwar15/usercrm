var User = require('../models/user.js');
var jwt = require('jsonwebtoken');
var config = require('../../config.js');

var superSecret = config.secret;

module.exports = function(app,express) { 
	var apiRouter = express.Router(); 	// get an instance of the express Router
 apiRouter.post('/authenticate',function(req,res){
 	//find the user
 	//select the name,username and password expliticly
 	User.findOne({
 		username: req.body.username
 	}).select('name username password').exec(function(err,user){
 		if(err) throw err;

 		//no user with that username was found
 		if(!user) {
 			res.json({
 				success: false,
 				message: 'Authentication failed.  User not found'
 			});
 		} else if(user) {
 			var validPassword = user.comparePassword(req.body.password);
 			if(!validPassword){
 				res.json({success:false,message:'Authentication failed.  Wrong password.'})
 			} else {
 				//if user is found and password is right
 				//create a token
 				var token = jwt.sign({
 					name: user.name,
 					username: user.username
 				},superSecret,{expiresInMinutes: 1440 
 				});

 				// return the information including token as JSON
         	 res.json({
	           success: true,
	           message: 'Enjoy your token!',
	           token: token
        	 });
 			}
 		}
 	})
 })

 // middleware to use for all requests
 apiRouter.use(function(req, res, next) {
 	// do logging
 	console.log('Somebody just came to our app!');
 
	// check header or url parameters or post parameters for token
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];
 
    // decode token
    if (token) {
 
     // verifies secret and checks exp, if successful we will take out the information in the token pass it along ot 'decoded'
     jwt.verify(token, superSecret, function(err, decoded) {      
       if (err) {
         return res.status(403).send({ 
             success: false, 
           message: 'Failed to authenticate token.' 
         });    
       } else {
         // if everything is good, save to request for use in other routes
         req.decoded = decoded;   
 
         next();
 
       } 
     });
 
   } else {
 
     // if there is no token
     // return an HTTP response of 403 (access forbidden) and an error message
     return res.status(403).send({ 
       success: false, 
       message: 'No token provided.' 
     });
     
   }
 

});

// test route to make sure everything is working 
// (accessed at GET http://localhost:8080/api)
apiRouter.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});
//on routes that end in /users
//============================================
apiRouter.route('/users')
	.post(function(req,res){
		//Create a new instance of the user model
		var user = new User();

		//set the user's information coming from the request
		user.name = req.body.name;
		user.username = req.body.username;
		user.password = req.body.password;

		//save the user and check for errors
		user.save(function(err){
			if(err) {
				if(err.code == 11000) {
					return res.json({success:false,message:'username already exists'});
				}
				else
					res.send(err);
			}

			res.json({message:'User Created'});
		});
	})
	.get(function(req,res){
		User.find(function(err,users){
			if(err) res.send(err);
			res.json(users);
		})
	});
//====================================================
//
//on route that end in /users/:user_id
//=====================================================
apiRouter.route('/users/:user_id')
	.get(function(req,res){
		User.findById(req.params.user_id,function(err,user){
			if(err) res.send(err);
			res.json(user);
		})
	})
	.put(function(req,res){
		User.findById(req.params.user_id,function(err,user){
			if(err) res.send(err);

			//update the user's info only if it was sent in body(if it has actually changed)
			if(req.body.name) user.name = req.body.name;
			if(req.body.username) user.username = req.body.username;
			if(req.body.password) user.password = req.body.password;

			user.save(function(err){
				if(err) res.send(err);
				res.json({message:'User has been updated'});
			})
		})
	})
	.delete(function(req,res){
		console.log(req.params.user_id);
		User.remove({_id:req.params.user_id},function(err,user){
			console.log(user);
			if(err) res.send(err);
			res.json({message:'Successfully removed User from Database'})
		})
	});
	// api endpoint to get user information
 	apiRouter.get('/me', function(req, res) {
   		res.send(req.decoded);
 	});

 	return apiRouter;

}