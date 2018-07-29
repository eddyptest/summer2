var express = require("express"); 
var app = express();
var session = require('express-session');
var passport = require("passport");

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


//get functions for all pages

app.get('/landing', function(req, res){
			 res.render("landing");
	     console.log("landing page rendered");
			 });

app.get('/login', function(req, res){
			 res.render("login");
	     console.log("login page rendered");
			 });

app.get('/contact-success', function(req, res) {
       res.render("contact-success");              
       console.log("Contact success rendered");
       });

app.get('/contact-failure', function(req, res) {
       res.render("contact-failure");              
       console.log("Contact failure rendered");
       });

app.get('/layout2', function(req, res) {
       res.render("layout2");              
       console.log("layout2 rendered");
       });

app.get('/contact', function(req, res) {
       res.render("contact");              
       console.log("contact rendered");
       });

app.get('/home', function(req, res) {
       res.render("home");              
       console.log("home rendered");
       });

app.get('/insertuser', function(req, res) {
       res.render("register");              
       console.log("register rendered");
       });

// This function calls the products page when somebody calls the products page
app.get('/bookshop' , function(req, res){
  res.render("bookshop.jade", 
             {books:books} // Inside the {} option we call the products variable from line 10 above 
            ); 
  console.log("Bookshop is rendered");
  
  
})

//add a book

// Function to call the add product page

app.get('/add-book', function(req, res){
			 res.render("add-book");
	     console.log("book add page");
			 
			 });


// Function to create a new product

app.post('/add-book', function(req, res){
	var count = Object.keys(books).length; // Tells us how many products we have
	console.log(count);
	
	// This will look for the current largest id
	
	function getMax(books , id) {
		var max
		for (var i=0; i<books.length; i++) {
			if(!max || parseInt(books[i][id]) > parseInt(max[id]))
				max = books[i];
			
		}
		return max;
	}
	
	var maxPpg = getMax(books, "id");
	newId = maxPpg.id + 1;
	console.log(newId);
	
	// create a new product based on what we have in our form on the add page 
	
	var book = {
		name: req.body.name, 
		id: newId, // this is the variable created above
		activity: req.body.sport,
		price: req.body.price,
		image: req.body.image
	};
	
	var json  = JSON.stringify(books); // Convert from object to string
	
	fs.readFile('./models/books.json', 'utf8', function readFileCallback(err, data){
							if (err){
		console.log("Something Went Wrong");
	 }else {
		books.push(book); // add the information from the above variable
		json = JSON.stringify(books, null , 4); // converted back to JSON
		fs.writeFile('./models/books.json', json, 'utf8'); // Write the file back
		
	}});
	res.redirect("/bookshop")
});




//create user database in url
app.get('/createuserdb', function(req, res) {
  let sql = 'CREATE TABLE user ( id int NOT NULL AUTO_INCREMENT PRIMARY KEY, name varchar(255), password varchar(255));'
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res); 
    
  });
  res.send("user created");
  });

app.post('/insertuser', function(req, res) {

let sql = 'INSERT INTO user (name, password) VALUES ("'+req.body.username+'", "'+req.body.password+'")';

let query = db.query(sql, (err, res) => {

if(err) throw err;

console.log(res);


});
res.redirect("/login");

//res.send("new user inserted to db");

});


//log in code

app.post('/login', function(req, res) {
  //var x12 = '"eddy"'
  //var x13 = "SELECT * FROM user WHERE Name LIKE " + x12
  //let sql = x13
  var whichOne = req.body.username; //check for password
  
   let sql = 'SELECT password FROM user WHERE name= "'+whichOne+'"'
  let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    console.log(res1);
    
    var passx= res1[0].password
    console.log("You logged in with " + passx);
    req.session.user = passx;
  
    if(passx == req.body.password){
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




app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
console.log("server running");
  
});
