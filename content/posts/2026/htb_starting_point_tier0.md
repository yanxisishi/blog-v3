---
title: Hack The Box流程基础和Tier 0全WP
description: 记录一下第一次做渗透相关的靶场。
date: 2026-05-26 21:01:22
updated: 2026-05-26 21:01:22
image: https://img.yanxisishi.top/images/2026/05/q2-33VVv2dyPgO12Yy73oW3fLwgO2niHsBYomLAWKJg.
categories: [渗透]
tags: [渗透, HTB]
---

## 前言

1. 国内无法直连 HTB，需要科学上网。
2. 整篇攻击步骤均在 kali wsl2 中完成。
3. Tier 0 只有前 4 题免费，后续要用 vip 专用的 vpn，需要自行更换。

还有感谢兔娘师傅提供帮助~

## HTB 流程基础（以 Meow 为例）

### 1. 登录 HTB 后的入口

登录 Hack The Box 之后，首页主要能看到五个入口：

![image-20260520220340613](https://img.yanxisishi.top/images/2026/05/image-20260520220340613.png)

```txt
HTB Academy：课程学习区，用来系统学习网络安全知识和考证内容
HTB Labs：靶机练习区，也是主要打靶的地方
HTB LetsDefend：偏蓝队防守方向，用来练习安全分析、事件响应等内容
HTB CTF：比赛入口，可以参加或举办 CTF 比赛
HTB Enterprise Platform：企业团队训练平台，个人入门暂时用不到
```

有一定网安基础并更偏向关于渗透的实战练习，优先选择 HTB Labs。

### 2. 进入 HTB Labs

进入 Labs 之后，左边会看到很多模块，比如：

![image-20260520221204859](https://img.yanxisishi.top/images/2026/05/image-20260520221204859.png)

其中：

```
Starting Point / 起点
Machines / 机器
Sherlocks / 夏洛克
Challenges / 挑战
```

想优先熟悉 HTB 打靶流程，可以选择 `Starting Point`，这是 HTB 的新手引导区，用来熟悉最基本的打靶流程。

### 3. 连接 HTB VPN

HTB 的靶机不是公网环境，不能直接访问，需要先通过 VPN 接入 HTB 的内网。

点击右上角的：

```
Connect / 连接
```

然后选择：

```txt
Starting Point / 起点
OpenVPN
UDP 1337（连不上 vpn 也可以尝试换成 TCP 443）
```

接着下载 HTB 给的 `.ovpn` 配置文件。

这个 `.ovpn` 文件是 HTB 给的 VPN 连接配置，里面包含了要连接的 VPN 服务器、证书、密钥等信息。

### 4. Kali 中启动 VPN

如果 Kali 没有安装 `openvpn`，需要先安装：

```bash
sudo apt update
sudo apt install -y openvpn
```

然后进入保存 `.ovpn` 文件的目录，执行：

```bash
sudo openvpn starting_points_us-starting-point-1-dhcp.ovpn
```

注意后续操作中这个终端不要关，这个终端就是当前的 VPN 连接，关掉之后 VPN 也会断开。

### 5. 启动机器

VPN 连接成功后，回到 HTB 页面，选择 Starting Point 里的第一台机器 `Meow`，进去后点击：

```txt
Spawn Machine
```

启动成功后，HTB 会给一个靶机 IP，例如：

```txt
10.129.206.147
```

这个 IP 就是后面要攻击的目标。

### 6. 提交任务

Starting Point 不是一开始就直接提交 flag，而是会先给出一些引导任务。

1. 任务 1：

   ```txt
   What does the acronym VM stand for?
   VM 这个缩写代表什么？
   ```

   回答：

   ```txt
   Virtual Machine
   虚拟机，一种通过软件模拟出的、具备完整硬件系统功能的计算机系统。
   ```

2. 任务 2：

   ```txt
   What tool do we use to interact with the operating system in order to issue commands via the command line, such as the one to start our VPN connection? It's also known as a console or shell.
   我们使用什么工具与操作系统交互，以便通过命令行发出命令，例如启动 VPN 连接的命令？它也被称为控制台或 shell。
   ```

   回答：

   ```txt
   Terminal
   终端
   ```

3. 任务 3：

   ```txt
   What service do we use to form our VPN connection into HTB labs?
   我们使用什么服务来建立与HTB实验室的VPN连接？
   ```

   回答：

   ```txt
   openvpn
   ```

4. 任务 4：

   ```txt
   What tool do we use to test our connection to the target with an ICMP echo request?
   我们使用什么工具来测试与目标设备的 ICMP 回显请求连接？
   ```

   回答：

   ```txt
   ping
   ```

5. 任务 5：

   ```txt
   What is the name of the most common tool for finding open ports on a target?
   查找目标系统上开放端口最常用的工具叫什么名字？
   ```

   回答：

   ```txt
   nmap
   ```

6. 任务 6：

   ```txt
   What service do we identify on port 23/tcp during our scans?
   我们在扫描过程中，在 23/tcp 端口上识别出了什么服务？
   ```

   回答：

   ```txt
   telnet
   一种早期的网络远程登录协议，允许用户通过 TCP/IP 网络连接到远程计算机，并提供基于文本的命令行界面来执行操作。
   ```

7. 任务 7：

   ```txt
   What username is able to log into the target over telnet with a blank password?
   哪个用户名可以使用空密码通过 telnet 登录到目标主机？
   ```

   回答：

   ```txt
   root
   ```

8. 任务 8：

   ```txt
   Submit root flag
   ```

   暂不回答。

### 7. 攻击流程（telnet）

重新打开一个 Kali 终端，注意不要关闭前面运行 `openvpn` 的终端。

先使用 `nmap` 扫描目标开放了哪些端口：

```bash
nmap -sV 10.129.206.147
```

其中：

```txt
nmap：端口扫描工具
-sV：识别端口对应的服务和版本
```

扫描结果：

```txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-20 22:20 +0800
Nmap scan report for 10.129.206.147
Host is up (0.25s latency).
Not shown: 999 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
23/tcp open  telnet  Linux telnetd
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 79.79 seconds
```

1. 第一行：

   ```txt
   Nmap scan report for 10.129.206.147
   ```

   扫描的目标 IP 是 `10.129.206.147`。

2. 第二行：

   ```txt
   Host is up (0.25s latency).
   ```

   目标主机在线，延迟大概 0.25 s。

3. 第三行：

   ```txt
   Not shown: 999 closed tcp ports (reset)
   ```

   默认扫了 1000 个常见 TCP 端口，其中 999 个是关闭的。

4. **第四行和第五行（重点）：**

   ```txt
   PORT   STATE SERVICE VERSION
   23/tcp open  telnet  Linux telnetd
   ```

   意思是：

   ```txt
   23/tcp：开放的是 23 端口，协议是 TCP
   open：端口开放
   telnet：服务是 telnet
   Linux telnetd：目标运行的是 Linux 上的 telnet 服务
   ```

   这就和平时做的 Web 题目拉开区别了，毕竟没有开放 `80/http` 端口。

5. 第六行：

   ```txt
   Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
   ```

   表示 nmap 根据服务特征判断目标系统是 Linux；后面的 `CPE` 是标准化的产品标识信息，可以理解为 Linux 内核相关标识。

既然开放了 telnet，下一步就尝试直接连：

```bash
telnet 10.129.206.147
```

连接后提示输入用户名：

```
  █  █         ▐▌     ▄█▄ █          ▄▄▄▄
  █▄▄█ ▀▀█ █▀▀ ▐▌▄▀    █  █▀█ █▀█    █▌▄█ ▄▀▀▄ ▀▄▀
  █  █ █▄█ █▄▄ ▐█▀▄    █  █ █ █▄▄    █▌▄█ ▀▄▄▀ █▀█

Meow login:
```

这里输入 `root` 可以用空密码通过 telnet 登录，接着进入目标机器进行远程命令执行。

+ 先用： 

  ```bash
  ls
  ```

  查看当前目录，返回 `flag.txt` 和 `snap`。

+ 再用：

  ```bash
  cat flag.txt
  ```

  读取 flag.txt，得到 `b40abdfe23665f766f9c61ecba8a4c19`，这就是第一台机器的 flag。

## Tier 0 其余 WP

### Fawn（FTP）

1. 任务 1：

   ```txt
   What does the 3-letter acronym FTP stand for?
   FTP这三个字母的缩写代表什么？
   ```

   回答：

   ```txt
   File Transfer Protocol
   文件传输协议，是一种用于在网络上传输文件的协议。
   ```

2. 任务 2：

   ```txt
   Which port does the FTP service listen on usually?
   FTP 服务通常监听哪个端口？
   ```

   回答：

   ```txt
   21
   ```

3. 任务 3：

   ```txt
   FTP sends data in the clear, without any encryption. What acronym is used for a later protocol designed to provide similar functionality to FTP but securely, as an extension of the SSH protocol?
   FTP以明文形式发送数据，不进行任何加密。后来出现了一种协议，旨在提供与FTP类似的功能，但更加安全，它是SSH协议的扩展，该协议的缩写是什么？
   ```

   回答：

   ```txt
   SFTP
   ```

4. 任务 4：

   ```txt
   What is the command we can use to send an ICMP echo request to test our connection to the target?
   我们可以使用什么命令发送 ICMP 回显请求来测试与目标的连接？
   ```

   回答：

   ```txt
   ping
   ```

5. 任务 5：

   ```txt
   From your scans, what version is FTP running on the target?
   根据扫描结果，目标主机上运行的是哪个版本的FTP？
   ```

   先用 nmap 扫描主机端口：

   ```bash
   nmap -sV 10.129.206.195
   ```

   得到：

   ```txt
   PORT   STATE SERVICE VERSION
   21/tcp open  ftp     vsftpd 3.0.3
   Service Info: OS: Unix
   ```

   所以回答：

   ```txt
   vsftpd 3.0.3
   ```

6. 任务 6：

   ```txt
   From your scans, what OS type is running on the target?
   根据扫描结果，目标设备运行的是哪种操作系统？
   ```

   根据上一个任务的扫描结果，回答：

   ```txt
   Unix
   ```

7. 任务 7：

   ```txt
   What is the command we need to run in order to display the 'ftp' client help menu?
   要显示“ftp”客户端的帮助菜单，我们需要运行什么命令？
   ```

   回答：

   ```txt
   ftp -?
   ```

8. 任务 8：

   ```txt
   What is username that is used over FTP when you want to log in without having an account?
   当您想在没有帐户的情况下通过 FTP 登录时，使用的用户名是什么？
   ```

   回答：

   ```txt
   anonymous
   ```

9. 任务 9：

   ```txt
   What is the response code we get for the FTP message 'Login successful'?
   对于“登录成功”的 FTP 消息，我们得到的响应代码是什么？
   ```

   回答：

   ```txt
   230
   ```

10. 任务 10：

    ```txt
    There are a couple of commands we can use to list the files and directories available on the FTP server. One is dir. What is the other that is a common way to list files on a Linux system.
    我们可以使用几个命令来列出FTP服务器上可用的文件和目录。一个是dir命令。另一个是Linux系统上常用的文件列表命令是什么？
    ```

    回答：

    ```txt
    ls
    ```

11. 任务 11：

    ```txt
    What is the command used to download the file we found on the FTP server?
    用来下载我们在FTP服务器上找到的文件的命令是什么？
    ```

    回答：

    ```txt
    get
    ```

12. 任务 12：

    ```txt
    Submit root flag
    ```

    先用 ftp 协议连接主机：

    ```bash
    ftp 10.129.206.195
    ```

    提示输入账号名：

    ```txt
    Name (10.129.206.195:kali): 
    ```

    这里输入 `anonymous` 就行了，后续的密码直接留空按回车，返回 230 登录成功的响应代码，说明已成功进入 FTP 客户端环境：

    + 先在 `ftp>` 里面输入：

      ```bash
      ls
      ```

      或

      ```bash
      dir
      ```

      查看当前目录，返回结果有：

      ```txt
      -rw-r--r--    1 0        0              32 Jun 04  2021 flag.txt
      ```

    + 因为现在在 FTP 客户端环境里，不是在远程服务器的 shell 里。

      FTP 常用命令是：

      ```
      ls      查看远程目录
      get     下载远程文件
      put     上传文件
      bye     退出
      ```

      这里需要把 flag.txt 下载到本地 kali，在 `ftp>` 里面输入：

      ```bash
      get flag.txt
      ```

    + 接着在 `ftp>` 里面输入：

      ```bash
      bye
      ```

      退出 FTP。

    回到 kali 终端，输入：

    ```bash
    cat flag.txt
    ```

    得到 flag 为 `035db21c881520061c53e0536e44f815`。

### Dancing（SMB）

1. 任务 1：

   ```txt
   What does the 3-letter acronym SMB stand for?
   SMB这三个字母的缩写代表什么？
   ```

   回答：

   ```txt
   Server Message Block
   服务器消息块，是一种网络文件共享协议。
   ```

2. 任务 2：

   ```txt
   What port does SMB use to operate at?
   SMB协议使用哪个端口运行？
   ```

   回答：

   ```txt
   445
   ```

3. 任务 3：

   ```txt
   What is the service name for port 445 that came up in our Nmap scan?
   我们在 Nmap 扫描中发现的 445 端口的服务名称是什么？
   ```

   先 nmap 扫描端口;

   ```bash
   nmap -sV 10.129.206.230 
   ```

   得到：

   ```txt
   PORT     STATE SERVICE       VERSION
   135/tcp  open  msrpc         Microsoft Windows RPC
   139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
   445/tcp  open  microsoft-ds?
   5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
   Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
   ```

   所以回答：

   ```txt
   microsoft-ds
   ```

4. 任务 4：

   ```txt
   What is the 'flag' or 'switch' that we can use with the smbclient utility to 'list' the available SMB shares on Dancing?
   我们可以使用 smbclient 工具的哪个“标志”或“开关”来“列出”Dancing 上可用的 SMB 共享？
   ```

   回答：

   ```txt
   -L
   ```

5. 任务 5：

   ```txt
   How many shares are there on Dancing?
   Dancing 这台机器上有多少个 SMB 共享资源（shares）
   ```

   需要用 smbclient 工具：

   ```bash
   smbclient -L //10.129.206.230/ -N
   ```

   参数意思：

   ```txt
   -L   列出目标机器的共享列表
   -N   不使用密码，匿名登录
   ```

   得到：

   ```txt
           Sharename       Type      Comment
           ---------       ----      -------
           ADMIN$          Disk      Remote Admin
           C$              Disk      Default share
           IPC$            IPC       Remote IPC
           WorkShares      Disk      
   ```

   所以回答：

   ```txt
   4
   ```

6. 任务 6：

   ```txt
   What is the name of the share we are able to access in the end with a blank password?
   最后，我们不用密码就能访问哪个共享文件夹？
   ```

   回答：

   ```txt
   WorkShares
   ```

7. 任务 7：

   ```txt
   What is the command we can use within the SMB shell to download the files we find?
   在 SMB shell 中，我们可以使用什么命令来下载找到的文件？
   ```

   回答：

   ```txt
   get
   ```

8. 任务 8：

   ```txt
   Submit root flag
   ```

   先用 smbclient 工具进 `WorkShares` 共享：

   ```bash
   smbclient //10.129.206.230/WorkShares -N
   ```

   进入后在 `smb: \> ` 输入：

   ```bash
   ls
   ```

   或;

   ```bash
   dir
   ```

   返回得到两个目录 Amy.J 和 James.P，进去一个个看。

   先在 `smb: \> ` 输入：

   ```bash
   cd James.P
   ```

   进入 `smb: \James.P\>` 后输入：

   ```bash
   ls
   ```

   返回结果找到 flag.txt。

   再在 `smb: \James.P\>` 中输入：

   ```bash
   get flag.txt
   ```

   下载到本地。

   然后在 `smb: \James.P\>` 中输入：

   ```bash
   exit
   ```

   退出 SMB，回到 kali 终端，输入：

   ```bash
   cat flag.txt
   ```

   得到 flag 为 `5f61c10dffbc77a704d76016a22f1664`。

### Redeemer（Redis）

1. 任务 1：

   ```txt
   Which TCP port is open on the machine?
   机器上哪个 TCP 端口是开放的？
   ```

   用 nmap 扫描端口：

   ```bash
   nmap -sV 10.129.136.187
   ```

   得到：

   ```bash
   All 1000 scanned ports on 10.129.136.187 are in ignored states.
   Not shown: 1000 closed tcp ports (reset)
   ```

   说明默认扫描的前 1000 个常见 TCP 端口里没有开放端口。

   这题需要扫全部端口：

   ```bash
   nmap -p- 10.129.136.187
   ```

   其中：

   + `-p-`：表示扫描全部 TCP 端口，也就是 1-65535，等价于 `-p1-65535`。

   但效果不佳，一直卡住没动静（其实是速度太慢了，想具体感受进度的话可以在运行命令的时候按回车），可以改成：

   ```bash
   nmap -Pn -sS -T4 --min-rate 5000 -p- 10.129.136.187
   ```

   其中：

   + `-Pn`（可选）：跳过主机发现（不先 ping），直接假设目标在线。

   + `-sS`（可选）：SYN 半开放扫描，只发起握手不完成，速度快。
   + `-T4`：扫描速度模板，T0~T5：T3 默认，T4 较快，T5 很激进。
   + `--min-rate 5000`：最低发包速率，每秒至少发送 5000 个探测包。

   得到：

   ```txt
   PORT     STATE SERVICE
   6379/tcp open  redis
   ```

   所以回答：

   ```txt
   6379
   ```

2. 任务 2：

   ```txt
   Which service is running on the port that is open on the machine?
   机器上打开的端口正在运行哪个服务？
   ```

   根据上题结果回答：

   ```txt
   redis
   ```

3. 任务 3：

   ```txt
   What type of database is Redis? Choose from the following options: (i) In-memory Database, (ii) Traditional Database
   Redis
   是什么类型的数据库？请从以下选项中选择：（i）内存数据库，（ii）传统数据库
   ```

   回答：

   ```txt
   In-memory Database
   内存数据库
   ```

4. 任务 4：

   ```txt
   Which command-line utility is used to interact with the Redis server? Enter the program name you would enter into the terminal without any arguments.
   哪个命令行工具用于与 Redis 服务器交互？请输入您在终端中输入的程序名称（不带任何参数）。
   ```

   回答：

   ```txt
   redis-cli
   ```

5. 任务 5：

   ```txt
   Which flag is used with the Redis command-line utility to specify the hostname?
   在 Redis 命令行工具中，使用哪个标志来指定主机名？
   ```

   回答：

   ```txt
   -h
   ```

6. 任务 6：

   ```txt
   Once connected to a Redis server, which command is used to obtain the information and statistics about the Redis server?
   连接到 Redis 服务器后，使用哪个命令可以获取有关 Redis 服务器的信息和统计信息？
   ```

   回答：

   ```txt
   info
   ```

7. 任务 7：

   ```txt
   What is the version of the Redis server being used on the target machine?
   目标机器上使用的 Redis 服务器版本是什么？
   ```

   根据先前结果知道了开放的是 6379 的端口，继续用 nmap 的 `-sV` 参数探测服务版本：

   ```bash
   nmap -Pn -sV -p6379 10.129.136.187
   ```

   得到：

   ```txt
   PORT     STATE SERVICE VERSION
   6379/tcp open  redis   Redis key-value store 5.0.7
   ```

   所以回答：

   ```txt
   5.0.7
   ```

   也可以直接连 Redis：

   ```bash
   redis-cli -h 10.129.136.187 -p 6379
   ```

   进入 `10.129.136.187:6379>` 中，输入：

   ```bash
   info
   ```

   找到：

   ```txt
   # Server
   redis_version:5.0.7
   ```

   或者直接输入：

   ```bash
   info server
   ```

   会更加精准。

8. 任务 8：

   ```txt
   Which command is used to select the desired database in Redis?
   在 Redis 中，使用哪个命令来选择所需的数据库？
   ```

   回答：

   ```txt
   select
   ```

9. 任务 9：

   ```txt
   How many keys are present inside the database with index 0?
   数据库中索引为 0 的键有多少个？
   ```

   先前在进入 `10.129.136.187:6379>` 并输入：

   ```bash
   info
   ```

   后得到的信息中能看到：

   ```txt
   # Keyspace
   db0:keys=4,expires=0,avg_ttl=0
   ```

   或者直接输入：

   ```bash
   info keyspace
   ```

   会更加精准。

   所以回答：

   ```txt
   4
   ```

   或者先在 `10.129.136.187:6379>` 中输入：

   ```bash
   select 0
   ```

   切换至 0 号库（但其实默认连接索引为 0 的数据库），然后在 `10.129.136.187:6379>` 中输入：

   ```bash
   dbsize
   ```

   返回：

   ```txt
   (integer) 4
   ```

10. 任务 10：

    ```txt
    Which command is used to obtain all the keys in a database?
    哪个命令可以用来获取数据库中的所有键？
    ```

    回答：

    ```txt
    keys *
    ```

11. 任务 11：

    ```txt
    Submit root flag
    ```

    先连 Redis：

    ```bash
    redis-cli -h 10.129.136.187 -p 6379
    ```

    进入 `10.129.136.187:6379>` 中，输入：

    ```bash
    keys *
    ```

    返回：

    ```txt
    1) "temp"
    2) "numb"
    3) "flag"
    4) "stor"
    ```

    先用 `type` 命令确定 flag 的类型：

    ```bash
    type flag
    ```

    返回：

    ```txt
    string
    ```

    接着直接用 `get` 命令获取指定键（Key）的字符串（String）值。：

    ```bash
    get flag
    ```

    返回：

    ```txt
    "03e1d2b376c37ab3f5319922053953eb"
    ```

    所以 flag 就是 `03e1d2b376c37ab3f5319922053953eb`。

###  Explosion（RDP）

1. 任务 1：

   ```txt
   What does the 3-letter acronym RDP stand for?
   RDP这三个字母的缩写代表什么？
   ```

   回答：

   ```txt
   Remote Desktop Protocol
   远程桌面协议，允许用户通过网络连接，图形化地远程控制另一台 Windows 电脑或服务器。
   ```

2. 任务 2：

   ```txt
   What is a 3-letter acronym that refers to interaction with the host through a command line interface?
   用三个字母组成的缩写词来表示通过命令行界面与主机进行交互的缩写是什么？
   ```

   根据上题结果回答：

   ```txt
   CLI
   代表 Command Line Interface（命令行界面）
   ```

3. 任务 3：

   ```txt
   What about graphical user interface interactions?
   那么图形用户界面交互呢？
   ```

   回答：

   ```txt
   GUI
   用户通过鼠标、触控或键盘等外设，直观地操作屏幕上的窗口、图标、按钮等可视化元素，从而与系统进行信息交换的过程。
   ```

4. 任务 4：

   ```txt
   What is the name of an old remote access tool that came without encryption by default and listens on TCP port 23?
   一款默认情况下不加密、监听 TCP 端口 23 的旧式远程访问工具叫什么名字？
   ```

   回答：

   ```txt
   telnet
   ```

5. 任务 5：

   ```txt
   What is the name of the service running on port 3389 TCP?
   运行在 TCP 端口 3389 上的服务名称是什么？
   ```

   需要用 nmap 扫一下 3389 的端口：

   ```bash
   nmap -p3389 10.129.1.108
   ```

   得到：

   ```txt
   PORT     STATE    SERVICE
   3389/tcp filtered ms-wbt-server
   ```

   > 这里显示 filtered，可能是网络/VPN 状态不稳定；后续以 xfreerdp 实际能否连接为准。
   >
   > 网好的时候就能得到：
   >
   > ```txt
   > PORT     STATE SERVICE
   > 3389/tcp open  ms-wbt-server
   > ```

   所以回答：

   ```txt
   ms-wbt-server
   指 Microsoft Web-Based Terminal Server，是微软的 RDP（Remote Desktop Protocol，远程桌面协议）服务。
   ```

6. 任务 6：

   ```txt
   What is the switch used to specify the target host's IP address when using xfreerdp?
   使用 xfreerdp 时，用于指定目标主机 IP 地址的开关是什么？
   ```

   回答：

   ```txt
   /v:
   ```

7. 任务 7：

   ```txt
   What username successfully returns a desktop projection to us with a blank password?
   哪个用户名能够成功返回一个桌面投影，且密码为空？
   ```

   用 `xfreerdp` 工具连接靶机，优先尝试 `Administrator` 的用户名和空密码：

   ```bash
   xfreerdp /v:10.129.1.108 /u:Administrator
   ```

   如果终端上遇到了：

   ```txt
   Do you trust the above certificate? (Y/T/N) 
   ```

   输入一个 `Y` 并回车即可，或者把命令改成：

   ```bash
   xfreerdp /v:10.129.1.108 /u:Administrator /p:"" /cert:ignore
   ```

   接着弹出一个远程桌面：

   ![image-20260521201348075](https://img.yanxisishi.top/images/2026/05/image-20260521201348075.png)

   所以回答：

   ```txt
   Administrator
   ```

8. 任务 8：

   ```txt
   Submit root flag
   ```

   flag 就在远程桌面里。

### Preignition（http）

1. 任务 1：

   ```txt
   Directory Brute-forcing is a technique used to check a lot of paths on a web server to find hidden pages. Which is another name for this? (i) Local File Inclusion, (ii) dir busting, (iii) hash cracking.
   目录暴力破解是一种用于检查Web服务器上大量路径以查找隐藏页面的技术。它的另一个名称是什么？（i）本地文件包含，（ii）目录破坏，（iii）哈希破解。
   ```

   回答：

   ```txt
   dir busting
   ```

2. 任务 2：

   ```txt
   What switch do we use for nmap's scan to specify that we want to perform version detection?
   我们使用 nmap 扫描命令的哪个开关来指定要执行版本检测？
   ```

   根据上题结果回答：

   ```txt
   -sV
   ```

3. 任务 3：

   ```txt
   What does Nmap report is the service identified as running on port 80/tcp?
   Nmap 报告显示，在 80/tcp 端口上运行的服务是什么？
   ```

   nmap 扫一下 80 端口：

   ```bash
   nmap -p80 10.129.1.109 
   ```

   得到：

   ```txt
   PORT   STATE SERVICE
   80/tcp open  http
   ```

   所以回答：

   ```txt
   http
   ```

4. 任务 4：

   ```txt
   What server name and version of service is running on port 80/tcp?
   端口 80/tcp 上运行的服务器名称和服务版本是什么？
   ```

   加上 `-sV` 参数后用 nmap 扫一下 80 端口：

   ```txt
   nmap -sV -p80 10.129.1.109 
   ```

   得到：

   ```txt
   PORT   STATE SERVICE VERSION
   80/tcp open  http    nginx 1.14.2
   ```

   所以回答：

   ```txt
   nginx 1.14.2
   ```

5. 任务 5：

   ```txt
   What switch do we use to specify to Gobuster we want to perform dir busting specifically?
   我们应该使用哪个开关来向 Gobuster 指定我们要执行目录销毁操作？
   ```

   回答：

   ```txt
   dir
   ```

6. 任务 6：

   ```txt
   When using gobuster to dir bust, what switch do we add to make sure it finds PHP pages?
   使用 gobuster 进行目录搜索时，需要添加什么开关才能确保它能找到 PHP 页面？
   ```

   回答：

   ```txt
   -x php
   ```

7. 任务 7：

   ```txt
   What page is found during our dir busting activities?
   在我们的目录搜索活动中，发现了哪个页面？
   ```

   这里习惯用的 dirsearch 扫目录：

   ```bash
   dirsearch -u http://10.129.1.109 -e php
   ```

   + `-e`：全称 `--extensions`，用于指定后缀。

   扫出来了 `admin.php`。

8. 任务 8：

   ```txt
   What is the HTTP status code reported by Gobuster for the discovered page?
   Gobuster 为发现的页面报告的 HTTP 状态代码是什么？
   ```

   回答：

   ```txt
   200
   ```

9. 任务 9：

   ```txt
   Submit root flag
   ```

   用 curl 看一下 `http://10.129.1.109/admin.php` 的源码：

   ```bash
   curl http://10.129.1.109/admin.php
   ```

   返回：

   ```html
   <!DOCTYPE html>
   <html>
   <title>Admin Console</title>
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <link rel="stylesheet" href="w3.css">
   <body class="w3-container" style="background-color:#F6F6F6;">
   
   <h2 align="center">Admin Console Login</h2>
   
   
   <div id="id01" class="w3-container">
     <form method="post">
     <div class="w3-modal-content w3-card-8 w3-animate-zoom" style="max-width:600px">
       <div class="w3-container">
         <div class="w3-section">
           <label><b>Username</b></label>
           <input class="w3-input w3-border w3-hover-border-black w3-margin-bottom" type="text" placeholder="Enter Username" name="username">
   
           <label><b>Password</b></label>
           <input class="w3-input w3-border w3-hover-border-black" type="password" placeholder="Enter Password" name="password">
           
           <input type="submit" class="w3-btn w3-btn-block w3-green w3-section" value="Login">
         </div>
       </div>
     </div>
     </form>
   </div>
               
   </body>
   </html>
   ```

   此处的要 POST 提交 `username` 和 `password` 的表单，本题的 password 可以用弱密码字典爆破出来是 `admin`，所以提交：

   ```bash
   curl -d "username=admin&password=admin" -X POST http://10.129.1.109/admin.php
   ```

   返回：

   ```html
   <!DOCTYPE html>
   <html>
   <title>Admin Console</title>
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <link rel="stylesheet" href="w3.css">
   <body class="w3-container" style="background-color:#F6F6F6;">
   
   <h2 align="center">Admin Console Login</h2>
   
   <h4 style='text-align:center'>Congratulations! Your flag is: 6483bee07c1c1d57f14e5b0717503c73</h4>
   ```

   flag 就是 `6483bee07c1c1d57f14e5b0717503c73`。

### Mongod（mongod）

1. 任务 1：

   ```txt
   How many TCP ports are open on the machine?
   这台机器上打开了多少个 TCP 端口？
   ```

   用 namap 扫全部端口：

   ```bash
   nmap -T4 --min-rate 5000 -p- 10.129.4.60
   ```

   得到：

   ```txt
   PORT      STATE SERVICE
   22/tcp    open  ssh
   27017/tcp open  mongod
   ```

   所以回答：

   ```txt
   2
   ```

2. 任务 2：

   ```txt
   Which service is running on port 27017 of the remote host?
   远程主机上的 27017 端口正在运行哪个服务？
   ```

   根据上题结果去详细扫一下 mongod 端口：

   ```bash
   nmap -sV -p27017 10.129.4.60
   ```

   得到：

   ```txt
   PORT      STATE SERVICE VERSION
   27017/tcp open  mongodb MongoDB 3.6.8
   ```

   所以回答：

   ```txt
   MongoDB 3.6.8
   ```

3. 任务 3：

   ```txt
   What type of database is MongoDB? (Choose: SQL or NoSQL)
   MongoDB 是什么类型的数据库？（选择：SQL 或 NoSQL）
   ```

   回答：

   ```txt
   NoSQL
   ```

4. 任务 4：

   ```txt
   What command is used to launch the interactive MongoDB shell from the terminal?
   从终端启动交互式 MongoDB shell 需要使用什么命令？
   ```

   回答：

   ```txt
   mongosh
   旧版 MongoDB 常用 mongo，新版客户端叫 mongosh。本题靶机版本较老，后面实际使用旧版 mongo 客户端连接。
   ```

5. 任务 5：

   ```txt
   What is the command used for listing all the databases present on the MongoDB server? (No need to include a trailing ;)
   列出 MongoDB 服务器上所有数据库的命令是什么？（无需在末尾添加分号 ;）
   ```

   回答：

   ```txt
   show dbs
   ```

6. 任务 6：

   ```txt
   What is the command used for listing out the collections in a database? (No need to include a trailing ;)
   列出数据库中所有集合的命令是什么？（无需在末尾添加分号 ;）
   ```

   回答：

   ```txt
   show collections
   ```

7. 任务 7：

   ```txt
   What command is used to dump the content of all the documents within the collection named flag?
   要导出名为 flag 的集合中所有文档的内容，应该使用什么命令？
   ```

   回答：

   ```txt
   db.flag.find()
   ```

   意思是：

   ```txt
   db        当前正在使用的数据库
   flag      当前数据库里的 flag 集合，类似 SQL 里的表
   find()    查询文档，不加条件就是查询全部
   ```

8. 任务 8：

   ```txt
   Submit root flag
   ```

   先用 `mongosh` 命令连接目标靶机：

   ```bash
   mongosh mongodb://10.129.4.60:27017
   ```

   但是连不上，因为靶机 MongoDB 3.6.8 版本太老了，kali 中的 mongosh 2.8.3 太新了，这里可以用 Docker 跑旧版 mongo 客户端：

   ```bash
   docker run --rm -it --network host mongo:4.4 mongo --host 10.129.4.60 --port 27017
   ```

   但还是失败了，应该是 Docker 里面连不上本地 kali 中的 vpn，可以先把 Docker 里的旧版 mongo 客户端复制出来：

   ```bash
   rm -f mongo44
   rm -rf mongo44-libs
   mkdir -p mongo44-libs
   
   cid=$(docker create mongo:4.4)
   
   docker cp "$cid":/usr/bin/mongo ./mongo44
   docker cp "$cid":/usr/lib/x86_64-linux-gnu/libcrypto.so.1.1 ./mongo44-libs/
   docker cp "$cid":/usr/lib/x86_64-linux-gnu/libssl.so.1.1 ./mongo44-libs/
   
   docker rm "$cid"
   
   chmod +x ./mongo44
   ```

   然后直接在 Kali 本机跑：

   ```bash
   LD_LIBRARY_PATH="$PWD/mongo44-libs" ./mongo44 --host 10.129.4.60 --port 27017
   ```

   进去后列出 MongoDB 服务器上所有数据库：

   ```bash
   show dbs
   ```

   返回：

   ```txt
   admin                  0.000GB
   config                 0.000GB
   local                  0.000GB
   sensitive_information  0.000GB
   users                  0.000GB
   ```

   接着进入 `sensitive_information` 库：

   ```bash
   use sensitive_information
   ```

   然后看集合：

   ```bash
   show collections
   ```

   返回：

   ```txt
   flag
   ```

   读取 flag：

   ```bash
   db.flag.find()
   ```

   返回：

   ```txt
   { "_id" : ObjectId("630e3dbcb82540ebbd1748c5"), "flag" : "1b6e6fb359e7c40241b6d431427ba6ea" }
   ```

### Synced（rsync）

1. 任务 1：

   ```txt
   What is the default port for rsync?
   rsync 的默认端口是什么？
   ```

   回答：

   ```txt
   873
   ```

2. 任务 2：

   ```txt
   How many TCP ports are open on the remote host?
   远程主机上打开了多少个 TCP 端口？
   ```

   扫一下全部端口：

   ```bash
   nmap -T4 --min-rate 5000 -p- 10.129.228.37
   ```

   得到：

   ```txt
   PORT    STATE SERVICE
   873/tcp open  rsync
   ```

   所以回答：

   ```txt
   1
   ```

3. 任务 3：

   ```txt
   What is the protocol version used by rsync on the remote machine?
   远程机器上 rsync 使用的协议版本是什么？
   ```

   详细扫一下 873 端口：

   ```bash
   nmap -sV -p873 10.129.228.37
   ```

   得到：

   ```txt
   PORT    STATE SERVICE VERSION
   873/tcp open  rsync   (protocol version 31)
   ```

   所以回答：

   ```txt
   31
   ```

4. 任务 4：

   ```txt
   What is the most common command name on Linux to interact with rsync?
   在Linux系统中，与rsync交互最常用的命令名称是什么？
   ```

   回答：

   ```txt
   rsync
   ```

5. 任务 5：

   ```txt
   What credentials do you have to pass to rsync in order to use anonymous authentication? anonymous:anonymous, anonymous, None, rsync:rsync
   要使用匿名身份验证，需要向 rsync 传递哪些凭据？anonymous:anonymous, anonymous, None, rsync:rsync
   ```

   回答：

   ```txt
   None
   ```

6. 任务 6：

   ```txt
   What is the option to only list shares and files on rsync? (No need to include the leading -- characters)
   如何只列出 rsync 的共享文件夹和文件？（无需包含开头的 -- 字符）
   ```

   回答：

   ```txt
   --list-only
   ```

7. 任务 7：

   ```txt
   Submit root flag
   ```

   先列出 rsync 模块：

   ```bash
   rsync rsync://10.129.228.37/
   ```

   返回：

   ```txt
   public          Anonymous Share
   ```

   然后列出 `public` 共享里的文件：

   ```bash
   rsync --list-only rsync://10.129.228.37/public/
   ```

   返回：

   ```txt
   drwxr-xr-x          4,096 2022/10/25 06:02:23 .
   -rw-r--r--             33 2022/10/25 05:32:03 flag.txt
   ```

   下载 `flag.txt` 到当前目录：

   ```bash
   rsync rsync://10.129.228.37/public/flag.txt .
   ```

   最后本地读取：

   ```bash
   cat flag.txt
   ```

   得到 `72eaf5344ebb84908ae543a719830519`。
