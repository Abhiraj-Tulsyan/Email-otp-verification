

var request=require('request')
const path = require("path");

var express=require('express')
var session=require('express-session')
var nodemailer=require('nodemailer')
var app=express();
var {User}=require('./models/userMode.js')
var bodyParser=require('body-parser')
var mongoose=require('mongoose')
var cookieParser=require('cookie-parser')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
 app.use(bodyParser.json());
app.use(session({secret: "Its a very big secret"}));

// mongoose.createConnection('mongodb://codeit2218:codeit123@ds239692.mlab.com:39692/codeit')
mongoose.connect('mongodb://localhost/user-data').then(function()
{
    console.log('database connected')
})



let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'your mail',
        pass: 'your email password'
    }
});




var checkingUser=function(req,res,next)
{
User.findOne({ email:req.body.email}, function(err,user)
{
    if(user)
    {
       
        console.log('user already exists')
        res.sendStatus(400)
    }
    else{
        next();
    }
})

}


var checkingPhone=function(req,res,next)
{
User.findOne({ phoneNumber:req.body.phoneNumber}, function(err,user)
{
    if(user)
    {
       
        console.log('user already exists')
        res.sendStatus(408)
    }
    else{
        next();
    }
})

}

app.post('/register', checkingUser ,checkingPhone, function(req,res)
{
    console.log(req.body)





var rand=Math.floor((Math.random() * 100000000000) + 1);

var user=new User({
    username:req.body.username,
    email:req.body.email,
    password:req.body.password,
    phoneNumber:req.body.phoneNumber,
    token:rand,
  })




user.save().then(function(err,user)
{
    if(err)
    {
        console.log(err)
        return
    }

})

let mailOptions = {
    from: 'webpaper73@gmail.com',
    to: req.body.email,
    subject: 'Confirm Account',
    text: 'Click this link to confirm your account ' + ' http://localhost:3000/verify/' + rand +'/' +req.body.email+'/'    
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
         console.log(error.message);
         res.sendStatus(404)
    }
    else{
    console.log('success');
    res.sendStatus(200)
    }
});
})

app.post('/emailSending' , function(req,res)
{
    var rand=Math.floor((Math.random() * 100000000000) + 1);
User.findOne({email:req.body.email}, function(err,user){
    if(err){

    }
else{
user.token=rand;
user.save();
let mailOptions = {
    from: 'webpaper73@gmail.com',
    to: req.body.email,
    subject: 'Confirm Account',
    text: 'Click this link to confirm your account ' + ' http://localhost:3000/verify/' + rand +'/' +req.body.email+'/'    
};


transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
         console.log(error.message);
         res.sendStatus(404)
    }
    else{
    console.log('success');
    res.sendStatus(200)
    }
});

}


})

})


app.post('/phoneVerification2', function(req,res)
{
console.log(req.body)
var options=
{
    method:"POST",
    url:'https://api.authy.com/protected/json/phones/verification/start',
    headers:
    {
        'X-Authy-API-Key': 'KCgbABrJ2BPS93HHz3SViq4UVPdol0DS'
    },
    body:
    {
"via": "sms",
 "phone_number": req.body.phoneNumber,
  "country_code": "91",
  "code_length": "6",
  "locale": "en"
    },
json:true

}

request(options,function(err,response,body)
{
console.log(body)

if(body.success==true)
{
User.findOne({phoneNumber:req.body.phoneNumber}, function(err,user)
{
user.phoneNumber=req.body.phoneNumber

})


    res.sendStatus(200)
    return;
}
else{
res.sendStatus(400)
   
}


})


})















app.post('/phoneVerification', function(req,res)
{

var options=
{
    method:"POST",
    url:'https://api.authy.com/protected/json/phones/verification/start',
    headers:
    {
        'X-Authy-API-Key': 'KCgbABrJ2BPS93HHz3SViq4UVPdol0DS'
    },
    body:
    {
"via": "sms",
 "phone_number": req.body.phoneNumber,
  "country_code": "91",
  "code_length": "6",
  "locale": "en"
    },
json:true

}

request(options,function(err,response,body)
{

if(body.success==true)
{

    res.sendStatus(200)
    return;
}
else{

User.findOneAndDelete({phoneNumber:req.body.phoneNumber} ,function(err,user)
{
    console.log('reached here')
    if(err){console.log(err)}
    console.log(user)
    res.sendStatus(405)
    return;
})
   
}


})


})



app.get('/', function(req,res)
{
    res.render('index.ejs')
} )
















app.get('/verify/:id/:email' , function(req,res)
{
User.findOne({email:req.params.email}, function(err,user)
{
if(user.token==req.params.id)
{
user.email_verified=true;
user.save()

res.redirect('/')
}
else{
   
res.redirect('/')
}


})

    console.log(req.params)
})


app.get('/loginpage', function(req,res)
{
    console.log(req.session)
if(req.session.email!=null&&req.session.phone!=null)
{
    res.render('login.ejs')
}
else
{
    res.redirect('/')
}

})

app.get('/signin', function(req,res)
{
console.log("reached in sigin")
res.render('signin.ejs')

})

app.post('/signbyemail', function(req,res)
{
    
    console.log('reached here')
User.findOne({email:req.body.email}, function(err, user)
{
    
if(user)
{

     user.comparePassword(req.body.password, function(err, isMatch) {
        if (err) res.sendStatus(400)
        else
        {
         if(isMatch)
         {
             req.session.email=user.email
             req.session.phone=user.phoneNumber
             req.session.verified=true
        res.send(user)
        console.log('Password123:', isMatch);
         }
         else{
             res.sendStatus(400)
         }
        } // -&gt; Password123: true
    });

   
   
}
else{
    console.log(err)
    res.sendStatus(400)
}


})


})

app.post('/signbyphone', function(req,res)
{
    console.log('reached here')
User.findOne({phoneNumber:req.body.phoneNumber}, function(err, user)
{
    
if(user)
{

     user.comparePassword(req.body.password, function(err, isMatch) {
        if (err) res.sendStatus(400)
        else
        {
         if(isMatch)
         {
             req.session.email=user.email
             req.session.verified=true
             req.session.phone=user.phoneNumber
        res.send(user)
      
         }
         else{
             res.sendStatus(400)
         }
        } // -&gt; Password123: true
    });

   
   
}
else{
    console.log(err)
    res.sendStatus(400)
}


})


})




app.post('/otpVerification',function(req,res)
{
    console.log(req.body)
options={
    
    method:'GET',
    url:'https://api.authy.com/protected/json/phones/verification/check',
    headers:
    {
 'X-Authy-API-Key': 'KCgbABrJ2BPS93HHz3SViq4UVPdol0DS'
    },
qs:
{
 'phone_number': req.body.phoneNumber,
    'country_code': '91',
    'verification_code':req.body.otpcode,
}

}

request(options,function(err,response,body)
{
    console.log('reached here in verfication')
    console.log(body)
    tempBody=JSON.parse(body);
    if(tempBody.success==true)
    {
        console.log('verified bro')
User.findOne({phoneNumber:req.body.phoneNumber}, function(err,user)
{

user.phone_verified=true;
user.save()

})

res.sendStatus(200)
    }
else{
    res.sendStatus(400)
}



})





})



app.listen('3000', function()
{
    console.log('server has started')
})