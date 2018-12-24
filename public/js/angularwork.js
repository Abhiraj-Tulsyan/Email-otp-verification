console.log('workinng')

formApp=angular.module('formApp', []);

formApp.controller('formController', ['$scope','$http','$location', function($scope,$http,$location)
{
$scope.username='';
$scope.email='';
$scope.password='';
$scope.otpsent=false;
$scope.confPassword='';
$scope.userOtp=''
$scope.warning=''
$scope.phoneNumber=''
$scope.otpWarning=''

$scope.resendOtp=function()
{
	$http.post('/phoneVerification2', { phoneNumber:$scope.phoneNumber}).then(function(data){
console.log(data)
$scope.otpsent=true;
$scope.userOtp=''
	
}).catch(function(data){
	console.log(data)
	$scope.otpWarning='The phone number cant be validated'
})


}


$scope.verifyOtp=function()
{
	console.log('verify')

$http.post('/otpVerification', {otpcode:$scope.userOtp , phoneNumber:$scope.phoneNumber}).then(function(data){

alert('otp has been verified')
$scope.otpsent=false
console.log('otp has been verified')


}).catch(function(data){
console.log('could not verify otp try again')


})



}


$scope.passwordChecker=function()
{
if($scope.password!=$scope.confPassword)
{
	$scope.warning='error:password do not match'
	$scope.password='';
	$scope.confPassword=''
}
else
{
	$scope.warning=''
	console.log('everything went well')
	
$http.post('/register',{ 

username:$scope.username,
password:$scope.password,
email:$scope.email,
phoneNumber:$scope.phoneNumber


}).then(function(data)
{
	
	
	if(data.status==200)
	{
		$scope.warning="Email has been sent for verification"
	}
	
console.log($scope.warning)


$http.post('/phoneVerification', { phoneNumber:$scope.phoneNumber}).then(function(data){
console.log(data)
$scope.otpsent=true;
	
}).catch(function(data){
	if(data.status==405)
	{
		$scope.warning='phone no. does not exist'
		$scope.email='';
		$scope.phoneNumber='';
		$scope.password='';
		$scope.confPassword=''
		$scope.email=''
	}
})

	console.log(data)
	console.log('returned back in browser')
}).catch(function(data)
{
	console.log(data)
if(data.status==400)
	{
		$scope.warning='Error:Email already exists'
	}
	if(data.status=408)
	{
		$scope.warning='Error: phone number already exists'
	}
	if(data.status==404)
	{
		$scope.warning='Some error occured'
	}
	console.log($scope.warning)
})







}

}
}])



formApp.controller('secondController', ['$scope','$http', function($scope,$http)
{
	$scope.emailSentMessage=''
	$scope.email=''
	$scope.password=''
	$scope.phoneNumber=''
	$scope.userSignedIn=false
	$scope.totalVerified=false;
	$scope.showVerifyEmail=false
	$scope.showVerifyPhone=false
$scope.signinshow=true
$scope.otpsent=false
$scope.userOpt=''
$scope.username=''










$scope.resendOtp=function()
{
	$http.post('/phoneVerification2', { phoneNumber:$scope.phoneNumber}).then(function(data){
console.log(data)
$scope.otpsent=true;
$scope.userOtp=''
	
}).catch(function(data){
	console.log(data)
	$scope.otpWarning='The phone number cant be validated'
})


}


$scope.verifyOtp=function()
{
	console.log('verify')

$http.post('/otpVerification', {otpcode:$scope.userOtp , phoneNumber:$scope.phoneNumber}).then(function(data){

$scope.showVerifyPhone=false
console.log('otp has been verified')
	

}).catch(function(data){
console.log('could not verify otp try again')


})



}



$scope.phoneVerifyAgain=function()
{

		$http.post('/phoneVerification2', { phoneNumber:$scope.phoneNumber}).then(function(data){
console.log(data)
$scope.otpsent=true;
$scope.userOtp=''
$scope.showVerifyPhone=false

	
}).catch(function(data){
	console.log(data)
	$scope.otpWarning='The phone number cant be validated'
})
}

$scope.emailVerifyAgain=function()
{
	$http.post('/emailSending',{email:$scope.email}).then(function(){
$scope.emailSentMessage='Email has been sent.Please check and verify'
$scope.showVerifyEmail=false

	}).catch(function(){
		$scope.emailErrorMessage='Some Problem sending email'
	})
}



$scope.analyze=function(user)
{

$scope.signinshow=false
$scope.message=''
console.log(user)
$scope.phoneNumber=user.phoneNumber;
$scope.email=user.email
$scope.username=user.username
console.log('reached here')
if(user.email_verified===true&&user.phone_verified===true)
{
	$scope.totalVerified=true;
	return
}

	if(user.email_verified===false)
	{
		$scope.showVerifyEmail=true;
	}
if(user.phone_verified===false)
{
	$scope.showVerifyPhone=true;
}


}

$scope.checking=function()
{
	console.log($scope.email)
	console.log($scope.phoneNumber)
	if($scope.password.length<8)
	{
		$scope.message='password must be minimum of 8 length'
		return
	}
if($scope.email.length>0&&$scope.phoneNumber.length>0)
{
	$scope.message='PLease enter one in email or phoneNumber'
	return
}


	if($scope.email.length>0)
	{
		$http.post('/signbyemail',{email:$scope.email,password:$scope.password}).then(function(data)
		{

$scope.analyze(data.data)
		}).catch(function(data)
		{
$scope.message='Wrong Credentials'
		})


	}
 if($scope.phoneNumber.length>0)
{
	$http.post('/signbyphone', { phoneNumber:$scope.phoneNumber, password:$scope.password}).then(function(data)
	{
$scope.analyze(data.data)
	}).catch(function(data)
	{
$scope.message='Wrong Credentials'
	})
}
if($scope.email.length==0&&$scope.phoneNumber.length==0)
{
	$scope.message='please enter email/password for signing in'
	return 
}
}


}])