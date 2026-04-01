---
title: 用 github + Vercel 搭建一个 Clarity 主题的个人博客
description: 记录一下自己花了大半天才搭建好的博客。
date: 2026-04-01 16:55:27
updated: 2026-04-01 21:50:27
image: https://img.yanxisishi.top/images/2026/04/1999.png
categories: [技术]
tags: [搭建博客]

---

## 0. 前言

大一上我就一直想搭建一个自己的博客来着，也动手搭建过一次，~~但是当时搭建的好丑啊~~，原博客也基本没有更新过，现在大一下了决定重启这个计划。

以下是基于 **Clarity + Vercel + Cloudflare R2 图床** 的博客搭建过程

## 1. 博客本体部署

我的博客是复刻的[纸鹿姐的主题](https://github.com/L33Z22L11/blog-v3)，太喜欢这种简约而不简单的感觉了，看着好干净，给前端大手子跪了orz。

在 GitHub 上找到博客主题后，点击 **Fork** 复制到自己的 GitHub 账号下。

我是把博客本体部署在了 WSL2 上面，用 vscode 连接进行管理，下列的命令在终端执行即可。

### 1.1 安装 Node.js

更新软件包列表：

```bash
sudo apt update
```

安装 nvm，以管理 Node.js 版本：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# 刷新环境变量
source ~/.bashrc
```

使用 nvm 安装最新 LTS（长期支持）版本：

```bash
nvm install --lts
nvm use --lts
```

验证 Node.js 和 npm 安装是否成功：

```bash
node -v
npm -v
# 预计回显版本号
```

### 1.2 克隆博客源码

如果前面已经成功 Fork 了心仪的博客主题到自己的 GitHub 账号，接下来就可以直接在终端进行克隆。

```bash
# 克隆 Fork 后的博客仓库
git clone https://github.com/GitHub用户名/blog-v3.git
# 进入项目目录
cd blog-v3
```

### 1.3 安装  pnpm

 启用 corepack 并安装 pnpm：

```bash
# corepack enable 能读取当前项目目录下的 package.json 文件，根据里面 "packageManager" 字段声明的版本号，动态且自动地下载并切换到该项目所需的精确 pnpm 版本。
corepack enable
```

验证 pnpm 安装是否成功：

```bash
pnpm -v
```

安装项目所需的所有依赖包：

```bash
pnpm install
# 或者 pnpm i
```

### 1.4 初始化配置

在纸鹿姐的源码中贴心提供了初始化项目配置，可以把刚刚直接照搬的博客本体初始化，比如纸鹿姐的文章、头像、链接...这些都会被归零，然后替换成example之类的。

```bash
pnpm init-project
```

### 1.5 创建文章

创建文章在纸鹿姐的源码中也做了快捷操作：

```bash
pnpm new
```

然后在终端会出现一个交互式的界面，最后按照框架生成文件并自动打开 vscode 进行编辑。

但我更习惯用 typora 编辑md文件（typora 还是在 Windows 主机上），这时需要修改源码：

假设 typora.exe 文件所在路径为"D:\yanxi\Typora\Typora.exe"，在博客文件中找到`blog-v3/scripts/new-blog.ts`，把最后部分的代码修改为

```ts
// #region 打开 Typora
const s = spinner()
s.start('正在打开 Typora...')
exec(`"/mnt/d/yanxi/Typora/Typora.exe" $(wslpath -w "${mdPath}")`, (error) => {
    if (!error)
        return
    s.stop('⚠️ 无法打开 Typora')
    log.error(error.message)
    process.exit(1)
})
s.stop('⌨️ 已通过 Typora 打开文件')
// #endregion

outro(`🎉 开始书写吧！`)
```

注：该主题博客中的md文件的名字是路径的一部分，补药用中文！！！

### 1.6 博客更新

1. 运行开发环境：

   ```bash
   pnpm dev
   ```

   在本地 `localhost:3000` 实时看效果，改了代码立马刷新。

2. 构建生产环境：

   ```bash
   # 将博客项目从 Vue 代码和 Markdown 文件进行编译打包
   pnpm generate
   # 本地 localhost:3000 预览生产环境
   pnpm preview
   ```

3. 同步到 GitHub ：

   ```bash
   # 将所有改动添加到暂存区
   git add .
   # 提交改动并添加备注
   git commit -m "博客更新ing"
   # 推送到远程 GitHub 仓库
   git push
   ```

### 1.7 检测友链状态

```bash
pnpm check:feed # 检测某友链 / 任意 URL 的托管商及可访问性
pnpm check:feed/all # 检测所有友链可访问性并生成报告
```

## 2. Vercel 托管

通过部署博客本体，现在已经可以在本地浏览自己的博客了，但是为了能让别人访问，需要一个静态网站托管平台，我选择的 Vercel ， Vercel 免费且适配 Github。

### 2.1 关联 GitHub

1. 访问 [Vercel 官网](https://vercel.com/)，并使用 GitHub 账号授权登录。
2. 进入控制台(Dashboard)后，点击右上角的 **Add New...**，选择 **Project**。
3. 在左侧的 Import Git Repository 列表中，找到刚才 Fork 并推送了最新代码的 `blog-v3` 仓库，点击 **Import**。

### 2.2 简单部署

Vercel 会自动识别出这是一个 Nuxt 项目，大部分配置都可以保持默认。

直接点击 **Deploy** 按钮。部署成功后就能得到一个`.vercel.app` 结尾的免费测试域名，可以直接被外部访问，~~但这域名好掉价啊...~~

## 3. 域名配置

买一个好看点的域名取悦自己~

### 3.1 购买域名

本来想在 Cloudflare 买一个`.com`域名的，但是 paypal 支付的时候一直卡着没动静，就放弃了。最后是在[阿里云](https://www.aliyun.com/)买的一个`.top`域名（`.top`确实便宜，`.com`要八十多，`.top`只要十几）

但是国内域名购买也麻烦（之前完全不知道qwq），要各种验证、实名和审查的来着。

### 3.2 域名托管

将域名托管给 Cloudflare ，方便后续 Cloudflare R2 免费图床能绑定自己的域名。

1. 注册并登录 [Cloudflare](https://www.cloudflare.com/) ，点击 **添加站点**，输入刚买的域名（如`yanxisishi.top`），套餐选择底部的 **Free**。
2. CF 会扫描现有的 DNS 记录，直接点击继续。然后 CF 会分配两个名称服务器（Nameservers，例如 `xxx.ns.cloudflare.com`）。
3. 回到阿里云的“域名控制台”，找到自己的域名，点击 **修改 DNS 服务器**，把阿里云默认的 DNS 删掉，填入 CF 刚才给的两个 NS 地址。

### 3.3 解析子域名（配置 CNAME 记录）

域名成功托管给 Cloudflare 后，我又创建了一个子域名（如`blog.yanxisishi.top`）来作为博客的入口，同时还要让 Vercel 能解析

1. 在 Cloudflare 对应域名的控制台左侧菜单找到 **DNS** -> **记录**。
2. 点击 **添加记录**，类型选择 **CNAME**。
3. **名称**填入想要的子域名前缀（比如填 `blog`，访问地址就是 `blog.yanxisishi.top`）。
4. 回到 Vercel 控制台，点击右上角的`Add Existing`，输入博客入口链接后保存并启用。

注：添加这条 CNAME 记录时，最右边那个代理状态（Proxy status）的橙色小云朵，需要点灰它，不然 CF 的证书和 Vercel 的证书可能会发生冲突，导致 Vercel 证书申请失败。

## 4. 图床搭建

博客或者各种笔记中的图片怎么储存一直是个问题，我更倾向于搭建图床，尤其是用 

Cloudflare R2 搭建图床，每月10 GB存储和1000万次读取，一个个人博客根本用不完。

### 4.1 创建 R2 存储桶

在 Cloudflare 左侧菜单找到 `R2`。首次使用可能需要绑定一张外币信用卡或 PayPal 作为身份验证（只要不超出免费额度是不会扣费的）。 

点击 `创建存储桶`，名字随便取一个，比如 `blog-images`。

### 4.2 绑定子域名

绑定子域名可以让图片链接好看点，依旧取悦自己~

进入刚建好的存储桶，点击 `设置` -> `公开访问` -> `自定义域` -> `连接域`。输入想要的二级域名，比如 `img.yanxisishi.top`。一路点击继续，CF 会自动配置好相应的 DNS 记录。

### 4.3 绑定 PicList

每次上传图片都要登录 Cloudflare 的话太麻烦了，可以用 **[PicList](https://piclist.cn/)** 进行绑定，更加方便图片上传、管理和链接复制。

1. 退回到 R2 的概览页面，在右侧找到并点击 **管理 R2 API 令牌**。

2. 点击右上角的 **创建 API 令牌**。

3. 在“权限”那一栏，选择**对象读和写**。如果不选这个，PicList 会没有写入权限。

4. 点击创建后，屏幕上会显示出三个信息：

   + **访问密钥 ID (Access Key ID)**
   + **机密访问密钥 (Secret Access Key)**
   + 刚才创建的具体存储桶的 **S3 API 终结点 (Endpoint)**。 

   复制并保存下来。

5. 打开 PicList ，在左侧找到 **图床 -> AWS S3**，点击新增配置：

   * **应用密钥 ID (AccessKeyId)**: 填入刚才获取的“访问密钥 ID”。

   * **应用密钥 (SecretAccessKey)**: 填入“机密访问密钥”。 
   * **存储桶名 (Bucket)**: 填入你刚才创建的桶名，比如 `blog`。
   * **自定义节点 (Endpoint)**: 填入 S3 API 终结点链接（注意去掉链接末尾可能带有的桶名称，只保留到 `.com` 即可）。 
   * **区域 (Region)**: 填 `auto`。 
   * **自定义域名**: 填入绑定的二级域名，比如 `https://img.yanxisishi.top`。 
   * **路径拼接规则**: 如果想让图片按年月归档，可以填 `{year}/{month}/{md5}.{ext}`。

   配置好上面的基础信息后，向下滑动到高级设置区域：

   1. **权限节点 (ACL)**：**选 `private`**。
   2. **启用 s3ForcePathStyle**：选择 **Yes**。
   3. **开启 pathStyleAccess 时，是否要禁用最终生成 URL 中添加 bucket 前缀**：选为 **Yes**。

   全部配置无误后，点击“确认”保存，并将其设为默认图床。

### 4.4 绑定 Typora

虽然按上面的操作配置完上传图片到图床已经很方便了，但是还有更懒狗的配置。

1. 打开 Typora，进入菜单栏的 文件 -> 偏好设置 -> 图像。在下面的“上传服务”中，下拉菜单**直接选择 PicList**。在“PicList 路径”中，点击文件夹图标，找到电脑上安装好的 PicList.exe 路径并选中。

2. 点击下方的“验证图片上传选项”，如果弹出的窗口显示成功上传就OK了。

3. 把最上面的那个下拉菜单，从“无特殊操作”改为 **“上传图片”**。之后只要截图 Ctrl+V 粘贴，PicList 就会在后台把图片传到 R2 图床，Typora 里的本地路径自动变成域名的链接。

至于有没有这个必要吧，看个人喜好喽~

## 5. 总结

嗯，第一次发博客，总感觉有很多地方可以优化或者改的，但说不上来。不管了，再给纸鹿姐跪一个orz。
