var express = require('express');
var app = express();
var fortune = require('./lib/fortune.js');

var handlebars = require('express3-handlebars').create({
  defaultLayout: 'main',
  helpers: {
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.use(function (req, res, next) {
  res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
  next();
});


app.use(function (req, res, next) {
  if (!res.locals.partials) {
    res.locals.partials = {};
  }
  res.locals.partials.weather = fortune.getWeatherData();
  next();
})

app.use(require('body-parser')());

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/about', function (req, res) {
  res.render('about', {
    fortune: fortune.getFortune(),
    pageTestScript: '/qa/tests-about.js'
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
})

app.get('/greeting', function (req, res) {
  res.status('about', {
    message: 'welcome',
    style: req.query.style,
    userid: req.cookie.userid,
    username: req.session.username
  });
})

app.get('/test', function (req, res) {
  res.type('text/plain');
  res.send('this is a test');
})

app.post('/process-contact', function (req, res) {
  console.log('Received contact from ' + req.body.name + ' <' + req.body.email + '>');

  try {
    //save to db
    return res.xhr ? res.render({ success: true }) : res.redirect(303, '/thank-you');
  } catch (ex) {
    return res.xhr ? res.json({ error: 'Database error.' }) : res.redirect(303, '/database-error');
  }
})

app.get('/newsletter', function (req, res) {
  res.render('newsletter', { csrf: 'CSRF token goes here' });
})

app.post('/process', function (req, res) {
  // console.log(`Form (from queryString): ${req.query.form}`);
  // console.log(`CSRF token (from hidden form field): ${req.body._csrf}`);
  // console.log(`Name (from visible form field): ${req.body.name}`);
  // console.log(`Email (from visible form field): ${req.body.email}`);
  // res.redirect(303, '/thank-you');
  if(req.xhr || req.accepts('json,html') === 'json'){
    //如果发生错误，应该发送{error:'error description'}
    res.send({success:true});
  }else{
    //如果发生错误，应该重定向到错误页面
    res.redirect(303,'/thank-you');
  }
})

app.get('/thank-you', function (req, res) {
  res.render('thank-you:)');
})

app.get('/api/tours', function (req, res) {
  var tours = fortune.getTours();
  var toursXml = '<?xml version="1.0"?><tours>' + tours.map(function (p) {
    return '<tour price="' + p.price + '" id="' + p.id + '">' + p.name + '</tour>';
  }).join('') + '</tours>';
  var toursText = tours.map(function (p) {
    return p.id + ': ' + p.name + ' (' + p.price + ')';
  }).join('\n');
  res.format({
    'application/json': function () { res.json(tours) },
    'application/xml': function () { res.type('application/xml'); res.send(toursXml); },
    'text/plain': function () { res.type('text/plain'); res.send(toursXml); }
  });
});

app.put('/api/tour/:id', function (req, res) {
  var p = tours.some(function (p) { return p.id === req.params.id });
  if (p) {
    if (req.query.name) {
      p.name = req.query.name;
    }
    if (req.query.price) {
      p.price = req.query.price
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
  })
});


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

app.listen(app.get('port'), function () {
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
