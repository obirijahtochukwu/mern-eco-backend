const express = require('express') 
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer =  require('multer');
const path =  require("path");
const User = require("./model/user.js");
const Products = require("./model/products.js");
const items = require("./products.js");

const secret = 'secret123';

const url = "mongodb+srv://obirijatochukwu:obj123,.@cluster0.o5mdo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const URL = process.env.MONGODB_URL

 mongoose.connect(url, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then(()=>{
  console.log('database conneted')
  }
).catch((err)=> console.log(err));

const app = express();
app.use(cookieParser());
app.use(bodyParser.json({extended:true}));
app.use(cors({
  origin: 'https://ecommerce-obj.netlify.app',
  methods: "GET, POST, PATCH, DELETE",
  credentials:true,
}))
app.use('/image', express.static('image'));

app.get('/user', (req, res) => {
  if (!req.cookies.token) {
    return res.json({});
  }
  const payload = jwt.verify(req.cookies.token, secret);
  User.findById(payload.id)
    .then(userInfo => {
      if (!userInfo) {
        return res.json({});
      }
      res.json(userInfo);
    });
});

app.post('/signup', (req, res) => {
    const {name,email,password} = req.body;
    User.findOne({email:email}, (err, user)=>{
      if (user) {
      res.send({message: 'user already exist', user})
      }
      else {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = new User({password:hashedPassword,email, name});
        user.save().then(userInfo => {
          jwt.sign({id:userInfo._id,email:userInfo.email, name:userInfo.name}, secret, (err,token) => {
            if (err) {
              console.log(err);
              res.sendStatus(500);
            } else {
              res.cookie('token', token).json({id:userInfo._id,email:userInfo.email,name:userInfo.name, cart: userInfo.cart});
            }
          });
        });
      }
    })
});

app.post('/login', (req, res) => {
  const {email,password} = req.body;
  User.findOne({email})
    .then(userInfo => {
      if (!userInfo) {
        return res.sendStatus(401);
      }
      const passOk = bcrypt.compareSync(password, userInfo.password);
      if (passOk) {
        jwt.sign({id:userInfo._id,email},secret, (err,token) => {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            res.cookie('token', token).json({id:userInfo._id,email:userInfo.email, cart: userInfo.cart});
          }
        });
      } else {
        res.sendStatus(401);
      }
    })
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').send();
});

app.get('/products',(req, res) => {
  res.json(items);
});

app.get('/product/:id',async (req, res) => {
  Products.findOne({ _id:new mongoose.Types.ObjectId(req.params.id)},(err, product)=>{
    if (err) {
      console.log(err)
    }
    else{
      res.json(product);
    }
  });
});

app.get('/cart', (req, res)=>{
  if (!req.cookies.token) {
    return res.json([]);
  } else {
    const payload = jwt.verify(req.cookies.token, secret);
    User.findOne({ _id:new mongoose.Types.ObjectId(payload.id)}).then((user)=>{
      if (!req.cookies.token) {
        return res.json([]);
      }
      res.json(user.cart);
    });
  }
});

app.patch('/addcart', (req, res)=>{
  const cart = req.body.cart
  const payload = jwt.verify(req.cookies.token, secret);
  User.findOneAndUpdate({ _id:new mongoose.Types.ObjectId(payload.id)}, {
    cart
  }, {
    new: true
  }).then((cart)=>{
    res.json(cart.cart)
  })
})


app.listen(process.env.PORT || 4000, '0.0.0.0' , ()=>{
  console.log('server runnin on port 4000')
});