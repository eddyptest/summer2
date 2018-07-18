var express = require("express"); 
var app = express();
var session = require('express-session');

var http = require('http');
var fs = require('fs');
var mysql = require('mysql');


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("views")); // allow access to content of views folder
app.use(express.static("scripts")); // allow access to scripts folder
app.use(express.static("images")); // allow access to images folder
app.use(session({secret: 'eddy'})); // allow access to session module

app.set("view engine", "jade");
//app.set('views', './views');


//database connect

const db = mysql.createConnection({   //allows database..SQL..to connect to app

  host     : 'den1.mysql2.gear.host',
  user     : 'eddy1',
  password : 'Vf7DWju-R_Qq',
  database :'eddy1'

});

db.connect((err) => {
  if(err){
    throw err
    
  }
  
  console.log("Database Connected")  
});

//end database connect


var books = require("./models/books.json"); // allow the app to access the products.json file

const nodemailer = require('nodemailer');

// This function calls the index viwe when somebody goes to the site route.
app.get('/', function(req, res) {
  res.render("landing");
  console.log("Landing page now rendered"); // the log function is used to output data to the terminal. 
  });

//get function for login page rendering

app.get('/landing', function(req, res){
			 res.render("landing");
	     console.log("landing page rendered");
			 
			 });

app.get('/login', function(req, res){
			 res.render("login");
	     console.log("login page rendered");
			 
			 });



//get function to render the contact failure page 
app.get('/contact-failure', function(req, res) {
       res.render("contact-failure");              
       console.log("Contact failure rendered");
       });

app.get('/layout', function(req, res) {
       res.render("layout");              
       console.log("layout rendered");
       });

app.get('/contact', function(req, res) {
       res.render("contact");              
       console.log("contact rendered");
       });

app.get('/home', function(req, res) {
       res.render("home");              
       console.log("home rendered");
       });

// This function calls the products page when somebody calls the products page
app.get('/bookshop' , function(req, res){
  res.render("bookshop.jade", 
             {books:books} // Inside the {} option we call the products variable from line 10 above 
            ); 
  console.log("Bookshop is rendered");
  
  
})



//create user database in url
app.get('/createuserdb', function(req, res) {
  let sql = 'CREATE TABLE user ( id int NOT NULL AUTO_INCREMENT PRIMARY KEY, name varchar(255), password varchar(255));'
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res); 
    
  });
  res.send("user created");
  });


app.post('/login', function(req, res) {
  var whichOne = req.body.username;
  
   let sql2 = 'SELECT password FROM user WHERE name= "'+whichOne+'"'
   let query = db.query(sql2, (err, res2) => {
    if(err) throw err;
    console.log(res2);
    
    var passx= res2[0].password
    console.log("You logged in with " + passx);
    req.session.email = passx;
  
    if(passx == "Password"){
    console.log("Logged in with: " + passx);
    
   res.redirect("/home");
   
  }
   
  });
 
  });




// This function calls the show individual products page
app.get('/show/:name' , function(req, res){
	
	
	// create a function to filter the products data
	function findProd(which) {
    return which.name === req.params.name;
}
	
	console.log(books.filter(findProd)); // log the split filter based on the check age function 
 indi = books.filter(findProd); // filter the products and declare the filtered data as a sepreate variable
	
  res.render("show",
             {indi:indi} // Inside the {} option we call the products variable from line 10 above
						); 
	
	
  console.log("Individual page now loaded");
  
  
})

//code to edit books

app.get('/edit/:name', function(req, res){
	
	console.log("edit page Shown");
		
	function chooseProd(indOne){
		return indOne.name === req.params.name;	
		}
	
	var indOne = books.filter(chooseProd);
	
	res.render("edit",
						{indOne:indOne}
						);
	
	console.log(indOne);
	});


app.post('/edit/:name', function(req, res){
	var json = JSON.stringify(books);
	
	var keyToFind = req.params.name; // call name from the url
			
			// var str = products;
			
			var data = books;
			var index = data.map(function(book) {return book.name;}).indexOf(keyToFind)
			
			var x = req.body.newname;
			var z = req.body.newprice;
			var w = req.body.newimage;
			
			books.splice(index, 1 , {name: x, price: z , image: w} );
			
			json = JSON.stringify(books, null, 4);
			
			fs.writeFile('./models/books.json', json, 'utf8'); // Writing the data back to the file
	
	
// 	fs.readFile('./model/products.json', 'utf8', function readFileCallback(err, data1){
// 		if (err){
// 			console.log("something Went Wrong");
// 		} else {
			
			
			
// 		}
		
// 	})
	res.redirect("/bookshop");
});




// POST route from contact form
app.post('/hello', function (req, res) {
  let mailOpts, smtpTrans;
  smtpTrans = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'eddytestp@gmail.com',
      pass: 'Eddytestp123'
    }
  });
  mailOpts = {
    from: req.body.name + ' &lt;' + req.body.email + '&gt;',
    to: 'eddytestp@gmail.com',
    subject: 'New message from Bookstore',
    text: `${req.body.name} (${req.body.email}) says: ${req.body.message}`
  };
  smtpTrans.sendMail(mailOpts, function (error, response) {
    if (error) {
      res.render('contact-failure');
    }
    else {
      res.render('contact-success');
    }
  });
});

app.get('/contact-success', function(req, res) {
       res.render("contact-success");              
       console.log("Contact success rendered");
       });


app.get('/contact-failure', function(req, res) {
       res.render("contact-failure");              
       console.log("Contact failure rendered");
       });

















app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
console.log("server running");
  
});
