const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const pool = require('../database');
const { isAuthenticated } = require('../helpers/auth');


router.get('/users/signin', async(req, res)=>{
    res.render('users/signin');
}); 
//Edit
router.get('/users/profile/:id', isAuthenticated,  async (req, res) => {
    const user = await User.findById(req.params.id).lean();
    res.render('users/profile', {user});
});

router.put('/users/edit-user/:id', isAuthenticated, async (req, res)=>{
    const {name, email} = req.body;
    await User.findByIdAndUpdate(req.params.id, {name, email});
    req.flash('success_msg', 'Account updated successfully');
    res.redirect('/notes');
});

router.delete('/users/delete/:id', isAuthenticated,  async (req, res) => {
    let id_user = req.params.id;
    let procedure = `CALL eliminar_por_user(?)`;
    await User.findByIdAndDelete(id_user);
    pool.query(procedure, [id_user]);
    res.redirect('/');
});

//method for login
router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/signin',
    failureFlash: true
}));

//Method for register
router.get('/users/signup', (req, res) =>{
    res.render('users/signup');
});

router.post('/users/signup', async (req, res) =>{
    const {name, email, password, confirm_password} = req.body;
    const errors = [];
    if(name.length <= 2){
        errors.push({text: 'Please enter a valid name'});
    }
    if(password != confirm_password){
        errors.push({text: 'Password do not match'})
    }
    if(password.length <= 4){
        errors.push({text: 'Password must be at leats 4 characters'})
    }
    if(errors.length > 0){
        res.render('users/signup', {errors, name, email, password, confirm_password})
    }else{
        //Validar que el correo no sea repetido 
        const emailUser = await User.findOne({email: email});
        if(emailUser){
            req.flash('error_msg', 'The The email is already in use');
            res.redirect('/users/signup');
        }
        const newUser = new User({name, email, password});
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        req.flash('success_msg', 'You are registered');
        res.redirect('/users/signin');
    }
});



router.get('/users/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { 
        return next(err); 
        }
      res.redirect('/');
    });
  });

module.exports = router;