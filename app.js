require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser= require('body-parser');
const encrypt = require('mongoose-encryption');
const ejs = require('ejs');
const app = express();
const Schema = mongoose.Schema;
const PORT = process.env.PORT || 9090;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

mongoose.connect(process.env.DB, {useNewUrlParser:true, useUnifiedTopology:true});

const userSchema = new Schema({
    email:{
        type:String,
        required:[true, 'Email harus diisi']
    },
    password:{
        type:String,
        required:[true, 'Password harus diisi']
    }
});

const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });


const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.render('home');
})
app.get('/login', (req, res) => {
    res.render('login', {
        error:false
    });
})
app.get('/register', (req, res) => {
    res.render('register', {
        error:false
    });
})
app.get('/secret', (req, res) => {
    res.render('secrets');
})

app.post('/register', (req,res) => {
    const {email, password} = req.body;
    const user = new User({ email, password })
    user.save(err => {
        if(err){
            res.render('register', {
                error:true,
                error_message:err
            })
        }else{
            res.render('secrets');
        }
    });
})

app.post('/login', (req, res) => {
    const {email, password} = req.body;
    User.findOne({email}, (err, result) => {
        if(err){
            console.log(err);
        }else{
            if(result){
                if(result.password === password){
                    res.render('secrets');
                }else{
                    res.render('login', {
                        error:true,
                        error_message: 'Password salah'
                    });
                }
            }else{
                res.render('login', {
                    error:true,
                    error_message: 'Email tidak ditemukan'
                });
            }
        }
    })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));