const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(new LocalStrategy({
    usernameField: 'email'   
    //done sirve para terminar el proceso de autenticacion
}, async (email, password, done) => {
    const user = await User.findOne({email: email});
    if(!user){
        // null: No hay ningun error
        // false: No hay ningun usuario 
        // Mensaje
        return done(null, false, {message: 'No user found'});
    }else{
        const match = await user.matchPassword(password);
        if(match){
            return done(null, user)
        }else{
            return done(null, false, {message: 'Incorrect password'});
        }
    }
}));
passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((id, done)=>{
    User.findById(id, (err, user)=>{
        done(err, user);
    })
})