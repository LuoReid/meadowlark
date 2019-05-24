var User = require('../models/user.js'),
  passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy;
passport.serializeUser(function (user, done) {
  done(null, user._id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    if (err || !user) return done(err, null);
    done(null, user);
  });
});

module.exports = function (app, options) {
  if (!options.successRedirect)
    options.successRedirect = '/account';
  if (!options.failureRedirect)
    options.failureRedirect = '/login';

  return {
    init: function () {
      var env = app.get('env');
      var config = options.providers;
      passport.use(new FacebookStrategy({
        clientID: config.facebook[env].appId,
        clientSecret: config.facebook[env].appSecret,
        callbackURL: '/auth/facebook/callback',
      }, function (accessToken, refreshToken, profile, done) {
        var authId = 'facebook' + profile.id;
        User.findOne({ authId: authId }, function (err, user) {
          if (err) return done(err, null);
          if (user) return done(null, user);
          user = new User({
            authId: authId,
            name: profile.displayName,
            created: Date.now(),
            role: 'customer',
          });
          user.save(function (err) {
            if (err) return done(err, null);
            done(null, user);
          });
        });
      }));
      passport.use(new GoogleStrategy({
        returnURL: 'https://' + host + '/auth/google/return',
        realm: 'https://' + host + '/',
      }, function (identifier, profile, done) {
        var authId = 'google:' + identifier;
        User.findOne({ authId: authId }, function (err, user) {
          if (err) return done(err, null);
          if (user) return done(null, user);
          user = new User({
            authId: authId,
            name: profile.displayName,
            created: Date.now(),
            role: 'customer',
          });
          user.save(function (err) {
            if (err) return done(err, null);
            done(null, user);
          });
        });
      }));
      app.use(passport.initialize());
      app.use(passport.session());
    },
    registerRoutes: function () {
      app.get('/auth/facebook', function (req, res, next) {
        passport.authenticate('facebook', {
          callbackURL: '/auth/facebook/callback?redirect' + encodeURIComponent(req.query.redirect),
        })(req, res, next);
      });
      app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { failureRedirect: options.failureRedirect }, function (req, res) {
          res.redirect(303, req.query.redirect || options.successRedirect);
        })
      );
      app.get('/auth/google', function (req, res, next) {
        passport.authenticate('google', {
          callbackURL: '/auth/google/callback?redirect=' + encodeURIComponent(req.query.redirect),
        })(req, res.next);
      });
      app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: options.failureRedirect },
          function (req, res) {
            res.redirect(303, req.query.redirect || options.successRedirect);
          })
      );
    }
  }
}