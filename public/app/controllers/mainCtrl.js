angular.module('mainCtrl',[])

.controller('mainController',function($rootScope,$route,$location,Auth){

	var vm = this;

	//get info if a person is logged in
	vm.loggedIn = Auth.isLoggedIn();

	//check to see if user is logged in on every request
	$rootScope.$on('$routeChangeStart', function() {
		vm.loggedIn = Auth.isLoggedIn();
		//get user info on route change
		Auth.getUser().then(function(response){
				vm.user = response.data;
				//console.log(vm.user);
		});
	});

	//function to handle login form
	vm.doLogin = function() {
		vm.processing = true;
		Auth.login(vm.loginData.username,vm.loginData.password)
			.success(function(data){
				vm.processing = false;
				//if a user successfully logs in, redirect to users page
				if(data.success)
					$location.path('/users');
				else {
					vm.error = data.message;
					vm.loginData.password="";
				}
		});
	};

	// function to handle logging out
   vm.doLogout = function() {
     Auth.logout();
     // reset all user info
     vm.user = {};
     $location.path('/login');
   };

	
});