var Customer = require('../models/customer.js');
var customerViewModel = require('../viewModels/customer.js');

exports = {
  registerRoutes: function (app) {
    app.get('/customer/:id', this.home);
    app.get('/customer/:id/preferences', this.preferences);
    app.get('/orders/:id', this.orders);
    app.post('/customer/:id/update', this.ajaxUpdate);
  },
  home: function (req, res, next) {
    var customer = Customer.findById(req.params.id);
  },
  preferences: function (req, res, next) {
    var customer = Customer.findById(req.params.id);
    if (!customer) return next();
    res.render('customer/preferences', customerViewModel(customer));
  },
  orders: function (req, res, next) {
    var customer = Customer.findById(req.params.id);
    if (!customer) return next();
    res.render('customer/preferences', customerViewModel(customer));
  },
  ajaxUpdate: function (req, res) {
    var customer = Customer.findById(req.params.id);
    if (!customer) return res.json({ error: 'Invalid ID.' });
    if (req.body.firstName) {
      if (typeof req.body.firstName !== 'string' || req.body.firstName.trim() === '')
        return res.json({ error: 'Invalid name.' });
      customer.firstName = req.body.firstName;
    }
    //...
    customer.save();
    return res.json({ success: true });
  }
}