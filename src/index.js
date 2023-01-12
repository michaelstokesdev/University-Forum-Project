const argon2 = require('argon2');
const express = require('express');
const session = require('express-session') ;
const { v4 : uuidv4 } = require('uuid');

//create database connection
const mongoose = require('mongoose');

const server = '127.0.0.1:27017';
const database = 'uni-forum';

class Database {
  constructor() {
    this._connect()
  }
  
  _connect() {
     mongoose.connect(`mongodb://${server}/${database}`)
       .then(() => {
         console.log('Database connected')
       })
       .catch(err => {
         console.error('Database connection failed')
       })
  }
}

const db = new Database();

const userSchema = new mongoose.Schema({
  userName: {type:String, required: true, unique: true},
  passwordHash: {type: String, required: true},
  dateRegistered: {type: Date, required:true, default: new Date()},
  admin: {type:Boolean, required: true, default: false},
  posts: {type:Array, required:true, default:[]},
});

const postSchema = new mongoose.Schema({
  id: String,
  date: Date,
  title: String,
  content: String,
  author: String,
  replies: {type:Array, required:true, default:[]}
});


const userModel = mongoose.model('Users', userSchema, 'Users');
const postModel = mongoose.model('Posts', postSchema, 'Posts');

//create express app and set up template engine 
const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//setup sessions with token
//cryptographically random secret would be used in production
app.use(session({
  secret: "76r@P3ftPLCem&&okDoJ@vD8*J!nz#ZkMKo%LcWWMEvztUGhXg@XguX4rr%qQos&",
  saveUninitialized: true,
  resave: false
}));

//route for index page, pass user data if logged in
app.get('/', async (req, res) => {
  let sess = req.session;

  let recentPosts = await postModel.find({}).sort({date: -1}).limit(10);
  if(sess.userData){
    res.render('pages/index', {userData: sess.userData, posts: recentPosts});
    return;
  }
  res.render('pages/index', {posts: recentPosts});
  return;
});

//login routes and logic
app.get('/login', (req, res) => {
    if(req.session.userData){
      res.redirect('/');
      return;
    }
    res.render('pages/login');

});

app.post('/login', async (req, res) => {
  if(req.session.userData){
    res.send("already_logged_in");
    return;
  }
  let userString = req.body.username;
  let passString = req.body.password;
  let userData = await userModel.findOne({userName: userString});
  if(userData != null){
    let passwordMatches = await argon2.verify(userData.passwordHash, passString);
    if(passwordMatches){
      req.session.userData = userData;
      res.send("success");
      return;
    }
    else{
      res.send("wrong_pass");
      return;
    }
  }
  else{
    res.send("invalid_user");
    return;
  }
});

//registration routes and logic
app.get('/register', (req, res) => {
  if(req.session.userData){
    res.redirect('/');
    return;
  }
  res.render('pages/register')
});

app.post('/register', async (req, res) => {
  let userString = req.body.username;
  let passString = req.body.password;

  if(passString.length < 8 || typeof(passString) != "string"){
    res.send("password_too_short")
    return;
  }

  let hashedPass = await argon2.hash(passString);
  try{
    await userModel.create({
      userName: userString,
      passwordHash: hashedPass
    });
  }
  catch(err){
    console.log(err.code);
    if(err.code == 11000){
      res.send("duplicate_user")
      return;
    }
  }
  res.send('success')
  return;
});

//new post route and logic
app.post('/new-post', async (req, res) => {
  let sess = req.session;
  if(!sess.userData){
    res.end();
    return;
  }

  let postTitle = req.body.title;
  let postContent = req.body.content;
  let currentDate = new Date();
  let postId = uuidv4();

  try{
    await postModel.create({
      id: postId,
      date: currentDate,
      title: postTitle,
      content: postContent,
      author: sess.userData.userName
    });
  }
  catch(err){
    console.log(err);
  }


  res.redirect('/');
});

app.get('/new-post', async (req, res) => {
  let sess = req.session;
  if(!sess.userData){
    res.redirect('/');
    return;
  }
  
  res.render('pages/new-post.ejs', {userData: sess.userData});
  return;
});

//post page route
app.get('/post/:id', async (req,res) => {
  let sess = req.session;
  let postData = await postModel.findOne({id: req.params.id})
  if(postData != null){
    if(sess.userData){
      res.render('pages/post', {postData: postData, userData:sess.userData});
      return;
    }
    else{
      res.render('pages/post', {postData: postData});
      return;
    }
    
  }
  else{
    res.redirect('/');
    return;
  }
});

//reply post route
app.post('/reply', async (req,res) => {
  let sess = req.session;

  if(sess.userData){
    let postData = await postModel.findOne({id: req.body.id});
    if(postData != null){
      postData.replies.push({author: sess.userData.userName, content: req.body.reply, date: new Date()})
      postData.save();
      res.send("success");
    }
    else{
      res.send("invalid_post");
    }
  }
  else{
    res.send("not_logged_in");
  }
  return;
});


//delete selected post if logged in user is an admin
app.post('/delete-post', async (req, res) => {
  let sess = req.session;

  if(sess.userData){
    if(!sess.userData.admin){
      res.send("user_not_admin");
      return;
    }

    let postDeleteRes = await postModel.deleteOne({id: req.body.id});
    if(postDeleteRes.acknowledged && postDeleteRes.deletedCount == 1){
      res.send("success");
      return;
    }
    else{
      res.send("delete_failed");
      return;
    }

  }
  else{
    res.send("not_logged_in");
    return;
  }
});


//delete selected user if logged in user is an admin 
app.post('/delete-user', async (req, res) => {
  let sess = req.session;

  if(sess.userData){
    if(!sess.userData.admin){
      res.send("user_not_admin");
      return;
    }

    let userDeleteRes = await userModel.deleteOne({id: req.body.id});
    let postDeleteRes = await postModel.deleteMany({author: req.body.id});
    if(userDeleteRes.acknowledged && userDeleteRes.deletedCount == 1 && postDeleteRes.acknowledged && postDeleteRes.deletedCount == 1){
      res.send("success");
      return;
    }
    else{
      res.send("delete_failed");
      return;
    }

  }
  else{
    res.send("not_logged_in");
    return;
  }
});

//logout route - destroy session and redirect to index
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.send('logged_out');
  return;
});

app.use('/static', express.static('static'));

app.listen(8000);