const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const bcrypt = require("bcrypt");
// const helper = require("../helpers/helper");

const find = require('../db/find_in_passprt');

// Set up the Passport strategy:
passport.use(
  new LocalStrategy(function (username, password, done) {   
    find.findByUsername(username, async (err, user) => { // Look up user in the db  
      const matchedPassword = await bcrypt.compare(password, user.password);
      if(err) return done(err);            // перевіряє, чи знайдено помилку. If there's an error in db lookup,return err callback function
      if(!user) return done(null, false);  // якщо НЕ знайдено жодного користувача, done()зворотний виклик з аргументами, які показують, що помилки НЕ було і НЕ знайдено ЖОДНОГО користувача.
      if(!matchedPassword) return done(null, false);        // перевіряє, чи знайдено користувача, але пароль недійсний.
      return done(null, user)             // Повертає done()функцію зворотного виклику з аргументами, які показують, що помилки НЕ було, і користувача знайдено.
    });
  })
);
// Serialize a user
passport.serializeUser((user, done) => {
  done(null, user.user_id);              // доступ до id - req.session.passport.user = {id: 'xyz'}
});
// Deserialize a user
passport.deserializeUser((id, done) => {  
  find.findById(id, function (err, user) { // id -який використовується для пошуку користувача в Базі Даних
  if (err) return done(err); 
  done(null, user);
  });
});

