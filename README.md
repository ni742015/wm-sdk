# Weimob SDK

微盟SDK，包含token生成及管理功能（如token失效会自动刷新）API封装以及消息中间件。


## Requirement

- NODE >= 7.6.0

## Installation

```
npm install wm-sdk
```

## Usage

### API使用示例
1. 基础示例
```js
const Api = require('wm-sdk')
const config = {
    client_id: 'XXXX',
    client_secret: 'XXXX',
    authorize_type: 'code', // authorization_code refresh_token
    payload: 'XXXX' // code refresh_token
}

const api = new Api(config)

api.getAccessToken(console.log)

// 获取订单
api
	.invoke('youzan.trades.sold.get', {
		version: '4.0.0',
		data: { page_no: 1, page_size: 5, status: 'TRADE_SUCCESS' }
	})
	.then(res => {
		console.log('youzan.trades.sold.get', res)
	})
```

2. 多进程
当多进程时，token需要全局维护，以下为保存token的接口：

```js
const Api = require('wm-sdk')
const config = {
  client_id: 'XXXX',
  client_secret: 'XXXX',
  authorize_type: 'code', // silent authorization_code refresh_token
  payload: 'XXXX' // grant_id redirect_uri refresh_token
}

const api = new Api(config, async function () {
  // 传入一个获取全局token的方法
  var txt = await fs.readFile('access_token.txt', 'utf8');
  return JSON.parse(txt);
}, async function (token) {
  // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
  // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
  await fs.writeFile('access_token.txt', JSON.stringify(token));
})

api.getAccessToken(console.log)
```

注建议先用code做一次授权,之后都统一用refresh_token的方式
例:
```
api = new Api({...config.wm, grant_type:'authorization_code', payload: code})
const token = await api.getAccessToken()
console.log('token', token)
business_id = token.business_id

await bus.models.authInfo.findOneAndUpdate(
  { business_id },
  token,
  {
    new: true,
    upsert: true
  })

api = new Api({...config.wm, grant_type:'refresh_token', payload: token.refresh_token}, getToken, saveToken)

```

### Middleware使用示例

```
const {middleware} = require('wm-sdk')
middleware({...config, url_perfix: 'wmpush'}, async function (res, message) {
	console.log(res, message)
})
```

## Help

Email: 421225824@qq.com

## License

MIT