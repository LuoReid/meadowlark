var express = require('express');
var app = express();

switch (app.get('env')) {
  case 'development':
    app.use(require('morgan')('dev'));
    break;
  case 'production':
    app.use(
      require('express-logger')({ path: __dirname + '/log/requests.log' })
    );
    break;
}

var fortune = require('./lib/fortune.js');

var handlebars = require('express3-handlebars').create({
  defaultLayout: 'main',
  helpers: {
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
  },
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

var Vacation = require('./models/vacation.js');

app.set('port', process.env.PORT || 3000);

//var connect = require('connect')();
//app.use(connect.compress);
// gzip/deflate outgoing responses
// var compression = require('compression');
// app.use(compression());

app.use(express.static(__dirname + '/public'));

app.use(function (req, res, next) {
  res.locals.showTests =
    app.get('env') !== 'production' && req.query.test === '1';
  next();
});

app.use(function (req, res, next) {
  if (!res.locals.partials) {
    res.locals.partials = {};
  }
  res.locals.partials.weather = fortune.getWeatherData();
  next();
});

app.use(function (req, res, next) {
  console.log(`processing request for "${req.url}"...`);
  next();
});

app.use(require('body-parser')());

// var cartValidation = require('./lib/cartValidation.js');
// app.use(cartValidation.checkWaivers);
// app.use(cartValidation.checkGuestCounts);

app.use(function (req, res, next) {
  var domain = require('domain').create();
  domain.on('error', function (err) {
    console.error('DOMAIN ERROR CAUGHT\n', err.stack);
    try {
      setTimeout(function () {
        console.error('Failsafe shutdown.');
        process.exit(1);
      }, 5000);

      var worker = require('cluster').worker;
      if (worker) {
        worker.disconnect();
      }
      server.close();

      try {
        next(err);
      } catch (error) {
        console.error('Express error mechanism failed.\n', err.stack);
        res.statusCode = 500;
        res.setHeader('content-type', 'text/plain');
        res.end('Server error.');
      }
    } catch (err) {
      console.error('Unable to send 500 response.\n', err.stack);
    }
  });
  domain.add(req);
  domain.add(res);
  domain.run(next);
});

var MongoSessionStore = requrie('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: credentials.mongo.connectionString });
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({ store: sessionStore }));

app.get('/', function (req, res) {
  //req.session.cart = {};
  var cluster = require('cluster');
  if (cluster.isWorker) {
    console.log('Worker %d received request', cluster.worker.id);
  }
  res.render('home');
});

app.get('/about', function (req, res) {
  var monster = req.cookies.monster;
  var signedMonster = req.signedCookies.monster;
  console.warn('req cookie:', monster, signedMonster);
  res.render('about', {
    fortune: fortune.getFortune(),
    pageTestScript: '/qa/tests-about.js',
  });
});

app.get('/tours/hood-river', function (req, res) {
  res.render('tours/hood-river');
});

app.get('/tours/oregon-coast', function (req, res) {
  res.render('tours/oregon-coast');
});

app.get('/tours/request-group-rate', function (req, res) {
  res.render('tours/request-group-rate');
});

app.get('/headers', function (req, res) {
  res.set('Content-Type', 'text/plain');
  var s = '';
  for (var name in req.headers) {
    s += name + ': ' + req.headers[name] + '\n';
  }
  res.send(s);
});

app.get('/greeting', function (req, res) {
  res.status('about', {
    message: 'welcome',
    style: req.query.style,
    userid: req.cookie.userid,
    username: req.session.username,
  });
});

app.get('/test', function (req, res) {
  res.type('text/plain');
  res.send('this is a test');
});

app.post('/process-contact', function (req, res) {
  console.log(
    'Received contact from ' + req.body.name + ' <' + req.body.email + '>'
  );

  try {
    //save to db
    return res.xhr
      ? res.render({ success: true })
      : res.redirect(303, '/thank-you');
  } catch (ex) {
    return res.xhr
      ? res.json({ error: 'Database error.' })
      : res.redirect(303, '/database-error');
  }
});

app.get('/newsletter', function (req, res) {
  res.render('newsletter', { csrf: 'CSRF token goes here' });
});
app.post('/newsletter', function (req, res) {
  var name = req.body.name || '',
    email = req.body.email | '';
  const VALID_EMAIL_REGEX = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
  if (!email.match(VALID_EMAIL_REGEX)) {
    if (req.xhr) return res.json({ error: 'Invalid name email address.' });
    req.session.flash = {
      type: 'danger',
      intro: 'Database error!',
      message: 'There was a database error; please try again later.',
    };
    return res.redirect(303, '/newsletter/archive');
  }
  if (req.xhr) return res.json({ success: true });
  req.session.flash = {
    type: 'success',
    intro: 'Thank you!',
    message: 'You have now been signed up for the newsletter.',
  };
  return res.redirect(303, '/newsletter/archive');
});

app.post('/process', function (req, res) {
  // console.log(`Form (from queryString): ${req.query.form}`);
  // console.log(`CSRF token (from hidden form field): ${req.body._csrf}`);
  // console.log(`Name (from visible form field): ${req.body.name}`);
  // console.log(`Email (from visible form field): ${req.body.email}`);
  // res.redirect(303, '/thank-you');
  if (req.xhr || req.accepts('json,html') === 'json') {
    //如果发生错误，应该发送{error:'error description'}
    res.send({ success: true });
  } else {
    //如果发生错误，应该重定向到错误页面
    res.redirect(303, '/thank-you');
  }
});

app.get('/thank-you', function (req, res) {
  res.render('thank-you');
});

app.get('/api/tours', function (req, res) {
  var tours = fortune.getTours();
  var toursXml = `<?xml version="1.0"?><tours>${tours
    .map(function (p) {
      return `<tour price="${p.price}" id="${p.id}'">${p.name}</tour>`;
    })
    .join('')}</tours>`;
  var toursText = tours
    .map(function (p) {
      return p.id + ': ' + p.name + ' (' + p.price + ')';
    })
    .join('\n');
  res.format({
    'application/json': function () {
      res.json(tours);
    },
    'application/xml': function () {
      res.type('application/xml');
      res.send(toursXml);
    },
    'text/plain': function () {
      res.type('text/plain');
      res.send(toursXml);
    },
  });
});

app.put('/api/tour/:id', function (req, res) {
  var p = tours.some(function (p) {
    return p.id === req.params.id;
  });
  if (p) {
    if (req.query.name) {
      p.name = req.query.name;
    }
    if (req.query.price) {
      p.price = req.query.price;
    }
    res.json({ success: true });
  } else {
    res.json({ error: 'No such tour exists.' });
  }
});

app.delete('/api/tour/:id', function (req, res) {
  var i;
  for (var i = tours.length - 1; i >= 0; i--) {
    if (tours[i].id === req.params.id) {
      break;
    }
  }
  if (i >= 0) {
    tours.splice(i, 1);
    res.json({ success: true });
  } else {
    res.json({ error: 'No such tour exists.' });
  }
});

app.get('/jquerytest', function (req, res) {
  res.render('jquerytest');
});

app.get('/nursery-rhyme', function (req, res) {
  res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme', function (req, res) {
  res.json({
    animal: 'squirrel',
    bodyPart: 'tail',
    adjective: 'bushy',
    noun: 'heck',
  });
});

app.get('/contest/vacation-photo', function (req, res) {
  var now = new Date();
  res.render('contest/vacation-photo', {
    year: now.getFullYear(),
    month: now.getMonth(),
  });
});

var dataDir = __dirname + '/data';
var vacationPhotoDir = dataDir + '/vacation-photo';
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);
function saveContestEntry(contestName, email, year, month, photoPath) {
  //todo
}

var mongoose = requrie('mongoose')
var opts = {
  server: {
    socketOptions: { keepAlive: 1 }
  }
}
switch (app.get('env')) {
  case 'development':
    mongoose.connect(credentials.mongo.development.connectionString, opts);
    break;
  case 'production':
    mongoose.connect(credentials.mongo.production.connectionString, opts);
    break;
  default:
    throw new Error('Unknown execution environment:' + app.get('env'));
}
var Vacation = requrie('./models/vacation.js');

app.post('/contest/vacation-photo/:year/:month', function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if (err) {
      return res.redirect(303, '/error');
    }
    if (err) {
      res.session.flash = {
        type: 'danger',
        intro: 'Oops!',
        message:
          'There was an error processing your submission. Please try again.',
      };
      return res.redirect(303, '/contest/vacation-photo');
    }
    var photo = files.photo;
    var dir = vacationPhotoDir + '/' + Date.now();
    var path = dir + '/' + photo.name;
    fs.mkdirSync(dir);
    fs.renameSync(photo.path, dir + '/' + photo.name);
    saveContestEntry(
      'vacation-photo',
      fields.email,
      req.params.year,
      req.params.month,
      path
    );
    req.session.flash = {
      type: 'success',
      intro: 'Good luck!',
      message: 'You have been entered into the contest.',
    };
    return res.redirect(303, '/contest/vacation-photo/entries');
    // console.log('received fields:');
    // console.log(fields);
    // console.log('received files:');
    // console.log(files);
    // res.redirect(303, '/thank-you');
  });
});

var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');
// var mailTransport = nodemailer.createTransport('SMTP', {
//   service: 'Gmail',
//   auth: {
//     xoauth2: xoauth2.createXOAuth2Generator({
//       user: credentials.gmail.user,
//       pass: credentials.gmail.password,
//     }),
//   },
// });
// mailTransport.sendMail(
//   {
//     from: '"Luo.Reid" <info@tongjiao.xyz>',
//     to: 'long.read@qq.com, "pxiaozei" <pxiaoxei@qq.com>',
//     subject: 'Your Meadowlark Travel Tour',
//     html:
//       '<h1>Meadowlark Travel</h1>\n<p>Thanks for book your trip width Meadowlark Travel. <b>We look forward to your visit!</b></p>',
//     text:
//       'Thank you for booking your trip with Meadowlark Travel. We look forward to your visit!',
//     generateTextFormHtml: true,
//   },
//   function(err) {
//     if (err) {
//       console.error('Unable to send email: ' + error);
//     }
//   }
// );

const VALID_EMAIL_REGEX = /^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/;

app.post('/cart/checkout', function (req, res) {
  var cart = req.session.cart;
  if (!cart) {
    next(new Error('Cart does not exist.'));
  }
  var name = req.body.name || '',
    email = req.body.email || '';
  if (!email.match(VALID_EMAIL_REGEX)) {
    return res.next(new Error('Invalid email address.'));
  }
  cart.number = Math.random()
    .toString()
    .replace(/^0\.0*/, '');
  cart.billing = { name: name, email: email };
  res.render('email/cart-thank-you', { layout: null, cart: cart }, function (
    err,
    html
  ) {
    if (err) {
      console.log('error in email template');
      email.sendError('error in email template');
    }
    // mailTransport.sendMail(
    //   {
    //     from: '"Meadowlark Travel" info@meadowlarktravel.com',
    //     to: cart.billing.email,
    //     subject: 'Thank you for Book your Trip with Meadowlark',
    //     html: html,
    //     generateTextFormHtml: true,
    //   },
    //   function(err) {
    //     if (err) {
    //       console.error('Unable to send confirmation:' + err.stack);
    //     }
    //   }
    // );
  });
  var emailService = require('./lib/email.js')(credentials);
  emailService.send(
    'luo.reid@gmail.com',
    'Hood River tours on sale today!',
    "Get 'em while they're hot!"
  );
  res.render('cart-thank-you', { cart: cart });
});

app.get('/fail', function (req, res) {
  throw new Error('Nope!');
});
app.get('/epic-fail', function (req, res) {
  process.nextTick(function () {
    throw new Error('Kaboom!');
  });
});

var dataDir = __dirname + '/data';
var vacationPhotoDir = dataDir + '/vacation-photo';
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);
function saveContestEntry(contestName, email, year, month, photoPath) {
  //todo
}



app.get('/vacations', function (req, res) {
  Vacation.find({ available: true }, function (err, vacations) {
    var context = {
      vacations: vacations.map(function (vacation) {
        return {
          sku: vacation.sku,
          name: vacation.name,
          description: vacation.description,
          price: vacation.getDisplayPrice(),
          inSeason: vacation.inSeason,
        }
      })
    }
    return res.render('vacations', context);
  })
})

var VacationInSeasonListener = require('./models/vacationInSeasonListener.js');
app.get('/notify-me-when-in-season', function (req, res) {
  res.render('notify-me-when-in-season', { sku: req.query.sku });
})
app.post('/notify-me-when-in-season', function (req, res) {
  VacationInSeasonListener.update({ email: req.body.email }, { $push: { skus: req.body.sku } }, { upsert: true }, function (err) {
    if (err) {
      console.error(err.stack);
      res.session.flash = {
        type: 'danger',
        intro: 'Ooops!',
        message: 'There was an error processing your request.'
      }
      return res.redirect(303, '/vacations');
    }
    req.session.flash = {
      type: 'success',
      intro: 'Thank you!',
      message: 'You will be notified when this vacation is in season.',
    }
    return res.redirect(303, '/vacations');
  })
})

app.disable('x-powered-by');

app.use(function (req, res) {
  res.status(404);
  res.render('404');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

// app.listen(app.get('port'), function() {
//   console.log(
//     `Express started in ${app.get('env')} mode on http://localhost:${app.get(
//       'port'
//     )}; press Ctrl-C to terminate.`
//   );
// });

// app.enable('trust proxy');

var http = require('http');
var server = http.createServer(app).listen(app.get('port'), function () {
  console.log(
    `Express started in ${app.get('env')} mode on http://localhost:${app.get(
      'port'
    )};press Ctrl-C to terminate.`
  );
});
function startServer() {
  http.createServer(app).listen(app.get('port'), function () {
    console.log(
      `Express started in ${app.get('env')} mode on http://localhost:${app.get(
        'port'
      )};press Ctrl-C to terminate.`
    );
  });
}
if (require.main === module) {
  startServer();
} else {
  module.exports = startServer;
}
