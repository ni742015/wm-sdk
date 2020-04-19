const crypto = require('crypto')

module.exports = function(
  { client_id, client_secret, url_perfix = 'wmpush' },
  cb
) {
  return async function(ctx, next) {
    // console.log('ctx.url', ctx.url, ctx.url.lastIndexOf(url_perfix))
    if (ctx.url.split('/').pop() === url_perfix) {

      const { test, id, msg_body, sign } = ctx.request.body
      // 先返回请求，避免重复推送
      const body = JSON.stringify({ "code": { "errcode": 0, "errmsg": "success" } })
      ctx.set('Content-Type', 'application/json')
      ctx.status = 200
      ctx.length = body.length
      ctx.res.end(body)
    
      if (!test) {
        const md5 = crypto.createHash('md5')
        let msgSign = md5.update(client_id + id + client_secret).digest('hex')
        if (sign !== msgSign) {
          throw new Error('wmsdk Error: invalid sign')
        }
      }

      let message = decodeURIComponent(msg_body)
      // console.log('message', message)

      if (message.indexOf('{') === 0) {
        message = JSON.parse(message)
      }

      cb && cb(ctx.request.body, message)

      await next()
    } else {
      await next()
    }
  }
}
