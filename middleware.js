'use strict';

var crypto = require('crypto');

module.exports = function (_ref, cb) {
  var client_id = _ref.client_id,
      client_secret = _ref.client_secret,
      _ref$url_perfix = _ref.url_perfix,
      url_perfix = _ref$url_perfix === undefined ? 'wmpush' : _ref$url_perfix;

  return async function (ctx, next) {
    // console.log('ctx.url', ctx.url, ctx.url.lastIndexOf(url_perfix))
    if (ctx.url.split('/').pop() === url_perfix) {
      var _ctx$request$body = ctx.request.body,
          test = _ctx$request$body.test,
          id = _ctx$request$body.id,
          msg_body = _ctx$request$body.msg_body,
          sign = _ctx$request$body.sign;
      // 先返回请求，避免重复推送

      var body = JSON.stringify({ "code": { "errcode": 0, "errmsg": "success" } });
      ctx.set('Content-Type', 'application/json');
      ctx.status = 200;
      ctx.length = body.length;
      ctx.res.end(body);

      if (!test) {
        var md5 = crypto.createHash('md5');
        var msgSign = md5.update(client_id + id + client_secret).digest('hex');
        if (sign !== msgSign) {
          throw new Error('wmsdk Error: invalid sign');
        }
      }

      var message = decodeURIComponent(msg_body);
      // console.log('message', message)

      if (message.indexOf('{') === 0) {
        message = JSON.parse(message);
      }

      cb && cb(ctx.request.body, message);

      await next();
    } else {
      await next();
    }
  };
};