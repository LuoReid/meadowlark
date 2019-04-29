var app = require('express')();

app.use(function(req, res, next) {
  console.log('\n\nALLWAYS');
  next();
});

app.get('/a', function(req, res) {
  console.log('/a: 路由终止');
  res.send('a');
});

app.get('/a', function(req, res) {
  console.log('/a: 永远不会调用');
});

app.get('/b', function(req, res, next) {
  console.log('/b: 路由未终止');
  next();
});

app.use(function(req, res, next) {
  console.log('sometimes');
  next();
});

app.get('/b', function(req, res, next) {
  console.log('/b (part 2): throw error');
  throw new Error('b 失败');
});

app.use('/b', function(err, req, res, next) {
  console.log('/b 检查到错误并传递');
  next(err);
});

app.get('/c', function(err, req, res, next) {
  console.log('/c: 检测到错误但不传递');
  next();
});

app.use(function(err, req, res, next) {
  console.log('检测到未处理的错误：' + err.message);
  res.send('500 - 服务器错误');
});

app.use(function(req, res) {
  console.log('未处理的路由');
  res.send('404 - not found');
});

app.listen(3000, function() {
  console.log('listen port 3000');
});
