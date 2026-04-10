---
title: 前端学习：环境配置和 HTML 详解
description: 关于我第一次系统地学习前端...
date: 2026-04-07 16:35:41
updated: 2026-04-07 16:35:41
image: https://img.yanxisishi.top/images/2026/04/6dae7b1c04bf85bf7590d55e116d1333_720.png
categories: [前端]
tags: [前端]
---

## 0. 前言

虽然我不是主攻前端，但好学爱学，欸嘿。

这两年，AI发展比想象中要快得多，网上都流传着**前端已死**的噩耗，实际情况我并不清楚，但我认为在现在去简单学习些前端知识也是挺有意义的，无论是对于web安全，还是对于个人审美。

本篇内容主要是基于 vscode 对前端三件套 HTML 、CSS 和 JavaScript 中的 **HTML** 的初步学习。

## 1. 前端简介

前端(Front-End)，通常指的是用户在浏览器中能直接看到、并与之进行交互的界面部分。当我们在浏览器输入网址并访问时，服务器会返回一系列代码文件，浏览器负责解析这些文件并渲染出最终的网页。

前端的基础技术主要由三个部分构成：**HTML**（负责页面结构）、**CSS**（负责样式排版）和 **JavaScript**（负责动态逻辑与交互）。

随着技术的发展，现代前端早已不再局限于编写简单的静态页面。为了应对复杂的业务需求和提升开发效率，前端领域诞生了各种现代化的**前端框架（如 Vue、React 等）**。这些框架允许开发者以模块化、组件化的方式构建复杂的单页应用（SPA）。

同时，前端工程化也日益成熟，配合 Node.js 以及各类打包构建工具（如 Webpack、Vite 等），前端代码在部署前往往会经过编译、压缩和混淆。

## 2. vscode 环境配置

在学习编程知识前，第一步往往是工具和环境的配置，我比较习惯用 vscode 编译，cursor或者trae的配置也差不多。

### 2.1 常用快捷键

+ **快速创建文件**

  用 vscode 打开一个文件夹后，鼠标左键双击空白区域就会创建文件并可以输入文件名了。

+ **快速生成html通用模板**

  在代码区输入一个英文感叹号`!`，然后按下`Tab`或者回车，就会自动生成：

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
  </head>
  <body>
      
  </body>
  </html>
  ```

+ **快速生成标签对**

  像`<p></p>`、`<h1></h1>`等这样的标签对，在 vscode 中直接输入`p`、`h1`等在按回车即可生成。

+ **自动换行**

  ![image-20260403181058455](https://img.yanxisishi.top/images/2026/04/image-20260403181058455.png)

  假如遇到上图中所有文字挤在一行导致无法在代码区完整浏览所有文字，可以使用快捷键`Alt`+`z`，就变成了下图：

  ![image-20260403182955405](https://img.yanxisishi.top/images/2026/04/image-20260403182955405.png)
  
+ **竖向框选代码**

  如果只是纯粹长按鼠标左键来框选代码，会导致多余的空格也被框选。

  ![image-20260409102004722](https://img.yanxisishi.top/images/2026/04/image-20260409102004722.png)

  但是如果按住滚轮进行框选，就能精准地竖向框选代码了。

  ![image-20260409102201779](https://img.yanxisishi.top/images/2026/04/image-20260409102201779.png)

### 2.2 便捷插件

+ **Live Server**

  在 vscode 左侧的扩展中查找 Live Server 并安装，在代码区右键并选择`Open with Live Serve`后就会弹出一个浏览器页面预览本地html文件。
  
+ **Auto Rename Tag**

  可以同步修改开始标签和结束标签。

### 2.3 常用设置

+ **保存自动格式化代码**

  `ctrl` + `,` 进入 vscode 的设置界面，搜索`Format On Save`，出现的第一个选项打勾即可。

  ![image-20260403174407308](https://img.yanxisishi.top/images/2026/04/image-20260403174407308.png)

  这个设置的好处是，假如编译时遇到如下代码：

  ```html
  <body>
      <p>这是第一个段落</p>
          <p>这是第二个段落</p>
              <p>这是第三个段落</p>
  </body>
  ```

  按下`ctrl` + `s`保存后，代码会自动格式化变成：

  ```html
  <body>
      <p>这是第一个段落</p>
      <p>这是第二个段落</p>
      <p>这是第三个段落</p>
  </body>
  ```

## 3. HTML

### 3.1 HTML 定义

**HTML(Hypertext Markup Language，超文本标记语言)**，是一种用来告知浏览器如何组织页面的**标记语言**，通过一系列的标签（也称元素）来定义文本、图像、链接等等。

### 3.2 HTML 标签

HTML 标签是构成 HTML 页面的基本单元，用于告诉浏览器如何处理标签内部的内容。标签由尖括号包围关键词构成，通常分为两类：

- **双标签（闭合标签）：** 包含开始标签和结束标签，内容写在两者之间。结束标签比开始标签多一个斜杠 `/`。例如：

  ```html
  <h1>这是一个一级标题</h1>
  ```

  ```html
  <p>这是一个段落</p>
  ```

  ```html
  <a href="#">这是一个超链接</a>
  ```

- **单标签（自闭合标签）：** 没有内容的标签，只有开始标签，不需要结束标签。例如：

  ```html
  <input type="text">
  <img src="avatar.png">
  <br>
  <hr>
  ```

**区别：单标签用于没有内容的元素，双标签用于有内容的元素**

### 3.3 HTML 属性

属性用于为 HTML 标签提供**附加信息**或**控制标签的外观和行为**。

**基本语法：**

```html
<开始标签 属性名="属性值"></开始标签>
```

**语法规范：**

1. 属性必须写在**开始标签**中（单标签写在标签名后，双标签写在首个标签内）。
2. 属性通常采取**键值对**的形式，即 `属性名="属性值"`。
3. 一个标签可以拥有多个属性，属性之间没有严格的先后顺序要求，但多个属性之间必须用**空格**分隔。

**代码示例：**

```html
<input type="password" placeholder="请输入密码" maxlength="16">
```

在这个示例中，`type`、`placeholder` 和 `maxlength` 都是 `<input>` 标签的属性，它们共同规定了这是一个带有提示文字且限制了最大输入长度的密码输入框。

**特点：**

属性名称不区分大小写，属性值对大小写敏感。

```html
<img src="example.jpg" alt="">
<img SRC="example.jpg" alt="">
<img src="EXAMPLE.jpg" alt="">
<!-- 前两者一样，第三个与前两个不一样 -->
```

**适用于大多数HTML元素的属性：**

| 属性      | 描述                                               |
| --------- | -------------------------------------------------- |
| **class** | 为HTML元素定义一个或多个类名（类名从样式文件引入） |
| **id**    | 定义元素唯一的id                                   |
| **style** | 规定元素的行内样式                                 |

### 3.4 HTML 文档

在 vscode 的代码区输入`!`后回车，生成：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>
```

接下来逐个解析这个 HTML 文档各部分含义：

1. **文档类型**

   ```html
   <!DOCTYPE html>
   ```

   **HTML5 的文档类型声明**，告诉浏览器当前页面是使用 HTML5 规范编写的。

2. **html 元素**

   ```html
   <html lang="en">
       ...
   </html>
   ```

   `<html>` 元素。这个元素包裹了页面中所有的内容，有时被称为**根元素**。

   在HTML中，**lang用于声明网页的主要语言**，帮助浏览器、搜索引擎等正确处理页面内容。

   + en 代表英语，这意味着该页面的主要语言是英语。
   + zh-CN 代表是中文。

3. **head 元素**

   ```html
   <head>
       ...
   </head>
   ```

   **头部元素**。包含了文档的元(meta)数据。主要保存供机器处理的信息，而非人类可读信息。

4. **字符集**

   ```html
   <meta charset="UTF-8">
   ```

   **该文档的字符集设置为UTF-8**。

   UTF-8包括绝大多数人类书面语言的大多数字符。
   有了这个设置，页面现在可以处理它可能包含的任何文本内容，如果不加这句话可能会引起乱码。

5. **移动端页面适配**

   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

   开发者能确保**网页在移动设备上以最佳状态呈现**，提升用户浏览体验。

6. **title 元素**

   ```html
   <title>Document</title>
   ```

   这**设置了页面的标题**，也就是出现在该页面加载的浏览器标签中的内容。例如下图标签页上显示`Document`。

   ![image-20260403190843827](https://img.yanxisishi.top/images/2026/04/image-20260403190843827.png)

7. **body 元素**

   ```html
   <body>
       ...
   </body>
   ```

   **包含了页面所有显示在页面上的内容**，包括文本、图片、视频、游戏、可播放音频轨道等等。

### 3.5 标签关系

HTML 标签之间主要存在两种关系：嵌套关系（父子关系）和并列关系（兄弟关系）。

**嵌套关系（父子关系）** 一个标签包含在另一个标签内部。外层的标签称为父元素，内层的标签称为子元素。

**并列关系（兄弟关系）** 两个标签拥有同一个父元素，且处于同一层级，它们之间就是并列关系。

```html
<div>
    <h1>这是一个一级标题</h1>
    <p>这是一个段落</p>
</div>
```

在这个代码中：

- `<div>` 是 `<h1>` 和 `<p>` 的父标签。
- `<h1>` 和 `<p>` 是 `<div>` 的子标签，它们之间是嵌套关系。
- `<h1>` 和 `<p>` 处于同一层级，它们之间是并列关系。

### 3.6 常用标签 top1（基本标签）

#### 1. 标题标签

```html
<h1>一级标题标签</h1>
<h2>二级标题标签</h2>
<h3>三级标题标签</h3>
<h4>四级标题标签</h4>
```

![image-20260405152007706](https://img.yanxisishi.top/images/2026/04/image-20260405152007706.png)

+ 显示特点：标题文字加粗显示，且每行只显示一个。
+ h1 唯一：最好只对每个页面使用一次`<h1>`。
+ 层次性：争取每页使用不超过三个不同类型的标题标签。

#### 2. 段落标签

```html
<p>这是段落1</p>
<p>这是段落2</p>
```

![image-20260405153101728](https://img.yanxisishi.top/images/2026/04/image-20260405153101728.png)

+ 每行只显示一个，文字显示不开会自动换行，段落的相关样式需要用 CSS 设置

#### 3. 强调与重要性标签

有语义版:

```html
更改文本样式：
<strong>字体加粗</strong>;
<em>斜体</em>;
<ins>下划线</ins>;
<del>删除线</del>
```

无语义版：

```html
更改文本样式：
<b>字体加粗</b>;
<i>斜体</i>;
<u>下划线</u>;
<s>删除线</s>
```

![image-20260405155206486](https://img.yanxisishi.top/images/2026/04/image-20260405155206486.png)

+ 如果想要更改字体大小需要用 CSS 设置。

#### 4. 注释标签

```html
<!-- 这里是一段注释内容 -->
```

快捷键：`ctrl` + `/`

+ 注释内容不会显示在网页上。
+ 可以跨越多行。

#### 5. 换行与分割线标签

在排版时，有两个非常常用的**单标签**（自闭合标签），专门用于基础的格式控制。

**换行标签 `<br>`**

用于在不新建段落的情况下强制文本换行。`<br>` 是 break 的缩写。普通的段落 `<p>` 之间会有较大的默认垂直间距，而使用 `<br>` 换行则间距紧凑。

**水平分割线标签 `<hr>`**

用于在页面中生成一条水平线。`<hr>` 是 horizontal rule 的缩写。通常用来在视觉上分隔不同主题的内容或版块。

```html
这是一句话
这是一句话
<br>
这是一句话
<hr>
这是一句话
```

![image-20260409132755224](https://img.yanxisishi.top/images/2026/04/image-20260409132755224.png)

### 3.7 标签分类

在 HTML 中，标签根据其展示形式主要分为两种元素类别：**块级元素**和**内联元素**。分类不同决定着展示形式不一样。

注：元素的这种分类并不是绝对不可更改的，在后续学习 CSS 时，完全可以通过 `display` 属性来改变它们的显示模式。

1. **块级元素**
   + **排版特点：** 块级元素会独占一行。
   + **嵌套规则：** 块级元素可以嵌套其他的块级元素或内联元素。
   + **常见标签：** `<div>`、`<p>`、`<h1>` ~ `<h6>` 等。

2. **内联元素（行内元素）**
   + **排版特点：** 可以一行放置多个，不会独占一行，宽度由其包含的内容本身决定，通常与文本一起混合使用。
   + **嵌套规则：** 内联元素**不能**嵌套块级元素，只能嵌套其他的内联元素或纯文本。
   + **常见标签：** `<a>`、`<strong>`、`<em>`、`<span>` 等。

以下是**排版特点**的区分示例：

```html
<h1>这是一个块级元素（一级标题）</h1>
<p>这是一个块级元素（段落）</p>

<strong>这是一个内联元素（加粗）</strong><strong>这是一个内联元素（加粗）</strong>
<em>这是一个内联元素（斜体）</em>
```

![image-20260407151227219](https://img.yanxisishi.top/images/2026/04/image-20260407151227219.png)

以下是**嵌套规则**的区分示例：

```html
<p>
    <strong>这是一个块级标签（p 段落标签）中的内联标签（strong 加粗标签）</strong>
</p>

<strong>
    <p>这是一个内联标签（strong 加粗标签）中的块级标签（p 段落标签）</p>
</strong>
```

![image-20260407153058669](https://img.yanxisishi.top/images/2026/04/image-20260407153058669.png)

虽然浏览器中正常显示了，**但这是一种极不规范的错误写法**，能正常显示只是现在的浏览器更加智能，容错性更高。

**特殊情况**：

虽然块级元素通常可以嵌套其他元素，但**`<p>`（段落标签）里面不能嵌套其他的块级元素**（如 `<div>`、`<h1>` 等）。`<p>` 标签的内部主要用于放置文字相关的内联元素。

如果源码是在 `<p>` 中嵌套了块级元素，浏览器在解析时会自动进行纠错。

假设源码是这样：

```html
<p>
	<h1>p 标签中的 h1 标签</h1>
</p>
```

放入浏览器并打开 F12 开发者工具查看 Elements（元素）面板时，会发现浏览器并没有按照嵌套关系渲染，而是强行将其拆解成了这样：

```html
<p></p>
<h1>p 标签中的 h1 标签</h1>
<p></p>
```

![image-20260407152358249](https://img.yanxisishi.top/images/2026/04/image-20260407152358249.png)

浏览器遇到 `<p>` 内部的 `<h1>` 时，会自动闭合前面的 `<p>`，并在最后又单独生成一个空的 `<p></p>`。

### 3.8 常用标签 top2（基础标签）

#### 1. 图像标签

**场景：** 在网页中显示图片。

**语法：**

```html
<img src="" alt="">
```

**特点：** 单标签（空元素），默认包含两个属性：**src** 和 **alt**

+ **src** 属性：指向要插入到页面的图像地址。
+ **alt** 属性：备选文案，用于在图片无法显示或者因为网速慢情况下显示的文字。

**关于属性：**

1. 属性采取**键值对**形式（属性="值"）。
2. 属性之间没有必要的先后顺序，但是属性之间必须有**空格分隔**。

```html
<img src="https://img.yanxisishi.top/images/2026/04/6dae7b1c04bf85bf7590d55e116d1333_720.png" alt="牧濑红莉栖">
<hr>
<img src="" alt="牧濑红莉栖">
```

![image-20260407155328795](https://img.yanxisishi.top/images/2026/04/image-20260407155328795.png)

**图像标签的其他属性：**

|  属性  |                作用                 |
| :----: | :---------------------------------: |
| width  | 设置图片**宽度**（但建议 CSS 修改） |
| height | 设置图片**高度**（但建议 CSS 修改） |
| title  | **图像标题**，鼠标悬停时显示的文本  |

```html
<img src="https://img.yanxisishi.top/images/2026/04/6dae7b1c04bf85bf7590d55e116d1333_720.png" alt="牧濑红莉栖">
<img src="https://img.yanxisishi.top/images/2026/04/6dae7b1c04bf85bf7590d55e116d1333_720.png" alt="牧濑红莉栖" width="800">
<img src="https://img.yanxisishi.top/images/2026/04/6dae7b1c04bf85bf7590d55e116d1333_720.png" alt="牧濑红莉栖" width="800" height="800">
<img src="https://img.yanxisishi.top/images/2026/04/6dae7b1c04bf85bf7590d55e116d1333_720.png" alt="牧濑红莉栖" title="牧濑红莉栖">
```

![image-20260407160727017](https://img.yanxisishi.top/images/2026/04/image-20260407160727017.png)

注：一般情况下，宽度和高度只需要修改其一，剩下那个会等比例缩放。

**常见的图片格式：**

- **jpeg / jpg：** 采用有损压缩技术，图片放大缩小可能会变得模糊或产生锯齿，不支持透明背景。
  - **适用场景：** 色彩丰富的摄影照片、普通的网页配图（非透明背景）。
- **png：** 采用无损压缩，最大特点是支持透明度（Alpha通道）。
  - **适用场景：** 网站 Logo、网页小图标、需要背景透明的图像。
- **gif：** 支持动画，最多支持 256 色（索引色），支持简单的透明背景。
  - **适用场景：** 简单的动图、表情包、色彩单调的图形。
- **webp：** 由 Google 开发的现代图片格式。它同时支持有损/无损压缩、透明度以及动画，同等画质下体积比 jpg/png 更小。
  - **适用场景：** 现代网页的图片全面优化（淘宝等大型网站已广泛使用，用于替代旧格式提升加载速度）。
- **avif：** 一种基于 AV1 视频编码的新型现代图片格式。支持极高的压缩率和 HDR，压缩效率甚至优于 WebP。
  - **适用场景：** 面向未来的网页极限优化，需要高性能压缩的场景（如 B站、京东等在使用）。

**图片格式选择：**

- **网页优化：** 优先使用 WebP / AVIF（在浏览器兼容的情况下），备选 JPEG / PNG。
- **透明图像：** 静态透明图使用 PNG，动态透明图使用 WebP。
- **动画展示：** 现代网页推荐 WebP，简单的老式动画使用 GIF。
- **其他格式：** 实际开发中还会接触到其他格式，比如常用于矢量图标的 SVG（无限放大不失真），以及苹果设备常用的 HEIC 等。

**关于路径：** 

在 HTML 中，路径用于指定文件（如图像、样式表或其他网页）的位置。在编写代码时，通常会根据文件所在的位置选择使用**相对路径**或**绝对路径**。

1. **相对路径**

   以**当前文件所在位置**为起点，去寻找目标文件的路径。这是实际开发中最常用的方式。

   - **同一级目录：** 目标文件与当前 HTML 文件在同一个文件夹内。
     - 写法：直接写目标文件名，或者使用 `./` 开头。
     - 示例：`<img src="profile.png">` 或 `<img src="./profile.png">`
   - **下一级目录：** 目标文件在当前 HTML 文件所在文件夹的子文件夹内。
     - 写法：子文件夹名称加上 `/`。
     - 示例：`<img src="images/logo.png">`（表示进入当前目录下的 `images` 文件夹寻找 `logo.png`）
   - **上一级目录：** 目标文件在当前 HTML 文件所在文件夹的外面一层。
     - 写法：使用 `../` 表示跳出当前文件夹，回到上一级。
     - 示例：`<img src="../background.png">`

2. **绝对路径**

   指目标文件在计算机或网络上的绝对、完整的位置。

   - **本地盘符路径：** 直接指向电脑硬盘上的某个绝对位置。

     - 写法：如 `D:\frontend_project\images\avatar.png`

     - **注：** 不推荐在前端代码中使用。

       首先，项目换一台电脑或者部署到服务器上后，盘符和目录结构改变会导致路径立刻失效。

       其次，如果使用 vscode 的 Live Server 插件预览网页，盘符路径是无法正常加载的。

   - **网络绝对路径：** 目标文件在互联网上的完整 URL 地址。

     - 写法：如 `https://www.example.com/assets/img/banner.jpg`
     - 应用场景：引用外部图床的图片、调用公共 CDN 的静态资源等。

#### 2. 视频标签

**场景：** 在网页中嵌入并播放视频。 

**语法：**

```html
<video src=""></video> 
```

**特点：** 双标签。和图片标签类似，视频标签也拥有一系列控制其播放行为和外观的属性。

**核心属性：**

- **src 属性：** 指向要播放的视频文件地址（可以使用我们上面学过的相对路径或绝对路径）。
- **controls 属性：** 向用户显示播放控件（如播放/暂停按钮、进度条、音量控制等）。如果没有这个属性，视频在页面上只会像一张静态图片一样，用户无法操作。
- **width / height 属性：** 设置视频播放器的宽度和高度。与图片类似，一般建议只设置其中一个，另一个会自动等比例缩放。（当然，实际开发中更推荐使用 CSS 来控制尺寸）。
- **poster 属性：** 视频封面图（海报）。在视频尚未下载完成，或者用户点击播放之前，显示的占位图片。

**HTML5 属性简写规则：** 在 HTML5 规范中，有一些属性表示“开启”或“关闭”某种状态（布尔属性）。**如果属性的名称（键）和属性的值相等，那么可以省略属性值，直接只写属性名即可。** 例如：原本应该写成 `controls="controls"`，在 HTML5 中可以直接简写为 `controls`。接下来的几个控制播放状态的属性同理。

- **autoplay 属性：** 视频在就绪后马上自动播放。
  - **注：** 现代浏览器（如 Chrome、Edge 等）为了防止网页突然发出声音吓到用户，**默认会拦截带有声音的自动播放视频**。因此，如果想让 `autoplay` 正常生效，通常必须配合下面的 `muted` 属性一起使用。
- **muted 属性：** 视频默认静音播放。
- **loop 属性：** 视频播放结束后，自动循环重新播放。

~~视频没法截屏了，试试纸鹿姐的妙妙组件~~

::tab{:tabs='["组件","语法"]'}
#tab1

下面是没有用 controls 属性的视频标签，居然没有播放控件：

<video src="https://img.yanxisishi.top/videos/PixPin_2026-04-07_17-04-16.mp4" width="780"></video>

#tab2

下面是没有用 controls 属性的视频标签，居然没有播放控件：

```html
<video src="https://img.yanxisishi.top/videos/PixPin_2026-04-07_17-04-16.mp4" width="780"></video>
```

::

::tab{:tabs='["组件","语法"]'}
#tab1

下面是用了 controls 属性的视频标签，有了播放控件：

<video src="https://img.yanxisishi.top/videos/PixPin_2026-04-07_17-04-16.mp4" width="780" controls></video>

#tab2

下面是用了 controls 属性的视频标签，有了播放控件：

```html
<video src="https://img.yanxisishi.top/videos/PixPin_2026-04-07_17-04-16.mp4" width="780" controls></video>
```

::

::tab{:tabs='["组件","语法"]'}
#tab1

下面是只用了 autoplay 属性的视频标签，并没有自动播放：

<video src="https://img.yanxisishi.top/videos/PixPin_2026-04-07_17-04-16.mp4" width="780" controls autoplay></video>

#tab2

下面是只用了 autoplay 属性的视频标签，并没有自动播放：

```html
<video src="https://img.yanxisishi.top/videos/PixPin_2026-04-07_17-04-16.mp4" width="780" controls autoplay></video>
```

::

::tab{:tabs='["组件","语法"]'}
#tab1

下面是同时用了 autoplay 属性和 muted 属性的视频标签，自动播放了而且静音：

<video src="https://img.yanxisishi.top/videos/PixPin_2026-04-07_17-04-16.mp4" width="780" controls autoplay muted></video>

#tab2

下面是同时用了 autoplay 属性和 muted 属性的视频标签，自动播放了而且静音：

```html
<video src="https://img.yanxisishi.top/videos/PixPin_2026-04-07_17-04-16.mp4" width="780" controls autoplay muted></video>
```

::

::tab{:tabs='["组件","语法"]'}
#tab1

下面是用了 loop 属性的视频标签，播放完后又重新播放了：

<video src="https://img.yanxisishi.top/videos/PixPin_2026-04-07_17-04-16.mp4" width="780" controls autoplay muted loop></video>

#tab2

下面是用了 loop 属性的视频标签，播放完后又重新播放了：

```html
<video src="https://img.yanxisishi.top/videos/PixPin_2026-04-07_17-04-16.mp4" width="780" controls autoplay muted loop></video>
```

::

::tab{:tabs='["组件","语法"]'}
#tab1

下面是用了 poster 属性的视频标签，给原视频插入了别的图片作为封面：

<video src="https://img.yanxisishi.top/videos/PixPin_2026-04-07_17-04-16.mp4" width="780" controls poster="https://img.yanxisishi.top/images/2026/04/11月的肖邦.jpg"></video>

#tab2

下面是用了 poster 属性的视频标签，给原视频插入了别的图片作为封面：

```html
<video src="https://img.yanxisishi.top/videos/PixPin_2026-04-07_17-04-16.mp4" width="780" controls poster="https://img.yanxisishi.top/images/2026/04/11月的肖邦.jpg"></video>
```

::

**关于常见视频格式以及兼容性：**

- **MP4：** 兼容性最好，支持 IE、Chrome、Firefox、Safari、Opera 等主流浏览器，实际开发中首选。
- **WebM / Ogg：** 虽然也是常见格式，但不支持 IE 和 Safari 浏览器。

**视频标签兼容性写法：** 

由于不同的浏览器对视频格式的解码器支持不同（目前最常见且兼容性最好的是 MP4，但也存在 WebM 和 Ogg 格式），为了保证视频能在尽可能多的浏览器中正常播放，HTML5 我们在 `<video>` 标签内部嵌套多个 `<source>` 标签来提供不同格式的视频源。

```html
<video controls>
    <source src="video.mp4" type="video/mp4">
    <source src="video.ogg" type="video/ogg">
    <source src="video.webm" type="video/webm">
    <p>您的浏览器不支持 HTML 5 Video 标签，请升级浏览器。</p>
</video>
```

特点：

1. 将 `src` 属性放在几个单独的 `<source>` 元素当中，这些元素分别指向各自的资源。
2. 浏览器会从上到下检查 `<source>` 元素，并且**播放第一个与其自身相匹配的媒体**。
3. 每个 `<source>` 元素都含有 `type` 属性，浏览器会通过检查这个属性来**迅速跳过那些不支持的格式**。如果你没有添加 `type` 属性，浏览器会尝试加载每一个文件，直到找到一个能正确播放的格式，这样会消耗掉大量的时间和资源。

**开发中的常见写法：** 

在现在的企业级开发中（比如 OPPO、VIVO、小米、京东等官网），常见的写法主要有两种：

- **精简版（比如 oppo、vivo 等）：** 直接使用 MP4 格式，加上封面。

```html
<video src="video.mp4" poster=""></video>
```

- **严谨版（比如 小米、京东 等）：** 使用兼容性写法，并且加上兜底的提示文字。

```html
<video autoplay poster="">
    <source src="video.mp4" type="video/mp4">
    <p>您的浏览器不支持 HTML 5 Video 标签，请升级浏览器。</p>
</video>
```

#### 3. 音频标签

**场景：** 在网页中嵌入并播放音频文件（如背景音乐、音效等）。 

**语法：**

```html
<audio src=""></audio>
```

**特点：** 双标签。音频标签 `<audio>` 的用法和视频标签 `<video>` 极其相似，很多属性都是通用的。

**核心属性：**

- **src 属性：** 指向要播放的音频文件地址。
- **controls 属性：** 向用户显示播放控件（播放/暂停、进度条、音量等）。**注意：如果音频标签既没有设置 `controls`，也没有依靠代码使其播放，那么它在网页中是完全不可见的。**
- **loop 属性：** 音频播放结束后，自动循环播放。
- **autoplay 属性：**
  - 理论上，加上 `autoplay` 属性后音频会在就绪时自动播放。
  - **实际情况：** 现代浏览器（尤其是 Chrome 和 Safari）为了极大地提升用户体验，防止用户一打开网页就被突如其来的巨大声音吓到，**已经严格禁止了音频的自动播放**。
  - 视频能自动播放是因为可以加 `muted`（静音）属性，但音频如果静音了就失去了意义。因此，在现在的实际开发中，如果想要实现音乐的自动播放，单纯靠 HTML 的 `autoplay` 属性通常是无效的，往往需要借助 JavaScript，在用户与页面发生了第一次交互（比如点击了页面的任意位置）之后，再通过 JS 代码触发音频的播放。

::tab{:tabs='["组件","语法"]'}
#tab1

或许现在需要来点音乐？

<audio src="https://img.yanxisishi.top/audios/Bad%20Apple!!.mp3" controls></audio>

#tab2

或许现在需要来点音乐？

```html
<audio src="https://img.yanxisishi.top/audios/Bad%20Apple!!.mp3" controls></audio>
```

::

**关于常见音频格式以及兼容性：**

- **MP3：** 绝对的王者，兼容性最好，支持 IE9+ 以及所有现代主流浏览器。**实际开发中的首选。**
- **Wav：** 音质好但体积较大，IE 浏览器不支持。
- **Ogg：** 开源格式，IE 和 Safari 浏览器不支持。

**音频标签兼容性写法：** 

和视频一样，为了照顾那些不支持某些格式的浏览器（或者古董浏览器），音频标签也推荐使用 `<source>` 标签进行兼容性处理。

```html
<audio controls>
    <source src="audio.mp3" type="audio/mp3">
    <source src="audio.ogg" type="audio/ogg">
    <p>您的浏览器不支持 HTML 5 Audio 标签，请升级浏览器。</p>
</audio>
```

#### 4. 超链接标签

**场景：** 在网页中实现点击跳转，可以跳转到互联网上的其他网页、项目内的其他文件，或者当前页面的某个特定位置。 

**语法：**

```html
<a href="跳转目标路径">显示的文本或网页元素</a>
```

**特点：** 双标签（`<a>` 是 anchor 锚的缩写）。默认情况下，浏览器中的超链接文本带有下划线，且未点击过通常显示为蓝色，点击过后显示为紫色。

**核心属性：**

- **href 属性：** (Hypertext Reference，超文本引用) 定义链接到的目标，比如其他网页的url、文件的路径、电子邮箱地址、手机号等。
- **title 属性：** 提示文本属性。当用户的鼠标指针悬停在超链接上时，会自动弹出一个小提示框，显示该属性所设置的文字内容。通常用于对链接目标进行额外的补充说明。
- **target 属性：** 用于指定链接页面的打开方式。
  - `_self`：（默认值）在当前窗口或标签页中直接跳转，原页面会被覆盖。
  - `_blank`：保留当前页面，在一个全新的窗口或标签页中打开新页面。

::tab{:tabs='["组件","语法"]'}
#tab1

这是没有 target 属性（或者 target 属性值为 `_self`）的超链接，会覆盖当前页面：

<a href="https://blog.yanxisishi.top/">欢迎来到我的博客</a>

#tab2

这是没有 target 属性（或者 target 属性值为 `_self`）的超链接，会覆盖当前页面：

```html
<a href="https://blog.yanxisishi.top/">欢迎来到我的博客</a>
```

::

::tab{:tabs='["组件","语法"]'}
#tab1

这是 target 属性值为 `_blank` 的超链接，不会覆盖当前页面：

<a href="https://blog.yanxisishi.top/" target="_blank">欢迎来到我的博客</a>

#tab2

这是 target 属性值为 `_blank` 的超链接，不会覆盖当前页面：

```html
<a href="https://blog.yanxisishi.top/" target="_blank">欢迎来到我的博客</a>
```

::

**超链接的常见分类：**

1. **内部链接**
   网站内部页面之间的相互跳转，通常使用相对路径。

   ::tab{:tabs='["组件","语法"]'}
   #tab1

   跳转到主页去了

   <a href="../../">博客主页</a>

   #tab2

   跳转到主页去了

   ```html
   <a href="../../">博客主页</a>
   ```

   ::

2. **外部链接** 

   跳转到其他网站（非本站）的链接，必须使用完整的网络绝对路径（包含 `http://` 或 `https://`）。

   ::tab{:tabs='["组件","语法"]'}
   #tab1

   跳转到 Github 去了

   <a href="https://github.com/yanxisishi">这是我的 Github</a>

   #tab2

   跳转到 Github 去了

   ```html
   <a href="https://github.com/yanxisishi">这是我的 Github</a>
   ```

   ::

3. **空链接** 

   当编写页面时，如果某个超链接的具体跳转目标地址还没有确定，需要使用占位符。

   - `href="#"`：点击后页面默认会跳转到当前页面的顶部。
   - `href="javascript:;"` 或 `href="javascript:void(0);"`：真正的死链接，点击后页面不会有任何滚动或跳转反应。

   ::tab{:tabs='["组件","语法"]'}
   #tab1

   跳到页面顶部去了

   <a href="#">回到页面顶部</a>

   什么都没有发生...

   <a href="javascript:;">没有任何反应</a>

   #tab2

   跳到页面顶部去了

   ```html
   <a href="#">回到页面顶部</a>
   ```

   什么都没有发生...

   ```html
   <a href="javascript:;">没有任何反应</a>
   ```

   ::

4. **网页元素链接** 

   在网页中，不仅文字可以点击，各种网页元素（如图像、表格、区块等）都可以添加超链接。只需用 `<a>` 标签包裹住目标元素即可。

   ::tab{:tabs='["组件","语法"]'}
   #tab1

   点一下图片会跳转到主页去

   <a href="../../">
       <img src="https://img.yanxisishi.top/images/2026/03/1ebc23b8f8e871461e1664bce4587095.png" alt="" width="200">
   </a>

   #tab2

   点一下图片会跳转到主页去

   ```html
   <a href="../../">
       <img src="https://img.yanxisishi.top/images/2026/03/1ebc23b8f8e871461e1664bce4587095.png" alt="" width="200">
   </a>
   ```

   ::

5. **锚点链接** 

   点击链接可以快速定位到**当前页面**的某个具体位置。这在篇幅较长的文章（如网页侧边栏的目录结构）中非常实用。 

   使用步骤：

   + **步骤一：** 给目标位置的标签添加一个 `id` 属性（`id` 属性作为标识符，在同一个页面内必须是唯一的）。
   + **步骤二：** 在 `<a>` 标签的 `href` 属性中，填入 `#` 加上目标标签的 `id` 值。

   ```html
   <p>
       <a href="#1">1. 这是段落一</a><br>
       <a href="#2">2. 这是段落二</a><br>
       <a href="#3">3. 这是段落三</a><br>
       <a href="#4">4. 这是段落四</a><br>
       <a href="#5">5. 这是段落五</a><br>
       <a href="#6">6. 这是段落六</a><br>
   </p>
   
   <h2 id="1">1. 这是段落一</h2>
   <p>
       这是段落一的内容。段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一
   </p>
   <h2 id="2">2. 这是段落二</h2>
   <p>
       这是段落二的内容。段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二
   </p>
   <h2 id="3">3. 这是段落三</h2>
   <p>
       这是段落三的内容。段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三段落三
   </p>
   <h2 id="4">4. 这是段落四</h2>
   <p>
       这是段落四的内容。段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四段落四
   </p>
   <h2 id="5">5. 这是段落五</h2>
   <p>
       这是段落五的内容。段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五段落五
   </p>
   <h2 id="6">6. 这是段落六</h2>
   <p>
       这是段落六的内容。段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六段落六
   </p>
   ```

   ![image-20260407200758574](https://img.yanxisishi.top/images/2026/04/image-20260407200758574.png)

   只要点击对应的链接即可迅速跳转至所对应的段落。

   但是快速地跳转可能缺乏一定的美感，此时可**以用 CSS 做出滑动效果**，只需在代码最前端加上下面的代码：

   ```html
   <style>
       html {
           scroll-behavior: smooth;
       }
   </style>
   ```

   此时再次点击超链接就会是滑动至所对应的段落，而不是快速跳转。


### 3.9 常用标签 top3（布局标签）

#### 1. 网站结构标签（语义化标签）

网页的外观虽然多种多样，但大概都包含这几个固定的大块区域：页眉、导航栏、主内容、侧边栏、页脚等。

在以前，开发者通常会使用大量的 `<div>` 标签来划分这些区域。虽然能实现排版，但代码里全是 `<div>`，可读性较差。为了解决这个问题，HTML5 引入了一系列**结构标签（语义化标签）**。它们在页面上的默认显示效果和普通的块级元素一样，但它们的名字直接表明了这块区域的作用，让代码结构更清晰。

常用的网站结构标签及其作用如下：

- `<header>`：网页页眉（头部）。
- `<main>`：网页的主要内容。**注：每个页面中处于可见状态的 `<main>` 标签只能有一个。**
- `<nav>`：导航栏。
- `<article>`：文章相关内容。
- `<section>`：页面的分块/独立区块。
- `<aside>`：侧边栏。
- `<footer>`：页面页脚（底部）。

**兼容性：** 这些 HTML5 新增的标签会受到部分老旧浏览器兼容性问题的影响。在实际开发中，**PC 端**需要根据公司的具体兼容性需求来决定是否使用，而在**移动端**开发中则可以放心大胆地使用。

```html
<h2>网页结构标签</h2>
<header>网页头部标签</header>
<nav>导航栏标签</nav>
<main>
    <aside>侧边栏标签</aside>
    <article>主要内容区域标签</article>
</main>
<footer>页面底部标签</footer>
<section>区块标签</section>
```

![image-20260408134306164](https://img.yanxisishi.top/images/2026/04/image-20260408134306164.png)

#### 2. 无语义标签

在实际的开发中，有两个无语义标签本身不能向浏览器说明内部内容的含义，纯粹是为了排版和包裹内容而存在。

**div 标签**

- **块级元素：** 默认独占一行，前后会自动换行。
- **容器作用：** 通常用于网页的布局结构，作为包裹其他元素的容器。
- **嵌套规则：** 内部可以包含其他的块级元素或行内元素。
- **语义：** 默认没有语义。

**span 标签**

- **行内元素：** 不会换行，仅包裹内容的一部分，多个 `span` 可以并排显示在一行。
- **局部操作：** 通常用于对一段文本或行内元素进行局部的样式修改或配合 JavaScript 进行操作。
- **语义：** 默认没有语义。

```html
<div>这是一个 div 标签</div>
<div>这是一个 div 标签</div>
<span>这是一个 span 标签</span>
<span>这是一个 span 标签</span>
```

![image-20260409094841493](https://img.yanxisishi.top/images/2026/04/image-20260409094841493.png)

#### 3. 列表标签

在网页中，经常需要整齐地排列一系列相关联的信息，比如新闻列表、商品分类、网站底部的服务说明等。使用列表标签可以使页面布局更加整齐、规范。

HTML 中的列表主要分为三大类：**无序列表**、**有序列表**和**描述列表（自定义列表）**。

**1. 无序列表（ul）**

- **特点：** 列表项之间没有固定的先后顺序，浏览器默认会在每个列表项前面加上一个小黑圆点。
- **实际开发地位：** 极其常用。绝大多数网页的导航栏、商品列表、新闻列表等，底层都是用无序列表配合 CSS 样式做出来的。
- **语法与规范：**
  - `<ul>` 标签定义无序列表的容器。`<ul>` 标签里面**只能**包含 `<li>` 标签，不能直接写文本或放置其他标签。
  - `<li>` 标签定义具体的列表选项。`<li>` 标签里面可以放入段落、图片、链接甚至再嵌套一个 `<ul>`。

**2. 有序列表（ol）**

- **特点：** 列表项之间有严格的先后顺序，浏览器默认会在前面生成数字序号（1, 2, 3...）。
- **实际开发地位：** 了解即可。在实际的网页布局中极少使用，因为默认样式很难看，即使需要顺序，通常也会用其他标签配合 CSS 来替代实现。
- **语法与规范：**
  - `<ol>` 标签定义有序列表的容器。
  - 嵌套规范与无序列表完全一致：`<ol>` 内部只能放 `<li>`，而 `<li>` 里面可以放任何元素。

**3. 描述列表 / 自定义列表（dl）**

- **特点：** 用于标记一组项目及其相关描述。
- **实际开发地位：** 非常常用。最经典的场景就是各个大型网站最底部的帮助中心和页脚链接区域，通常就是用描述列表来排版的。
- **语法与规范：**
  - `<dl>` 标签定义列表的容器。`<dl>` 里面只能包含 `<dt>` 和 `<dd>`。
  - `<dt>` 定义被描述的术语（通常作为小标题，显示为左对齐或加粗）。通常结构是一个 `<dt>` 对应多个 `<dd>`。
  - `<dd>` 包含术语的定义或描述（默认显示为缩进形式）。`<dd>` 里面可以放任何 HTML 元素。

```html
<h2>1. 无序列表</h2>
<ul>
    <li>无序列表 1</li>
    <li>无序列表 2</li>
    <li>无序列表 3</li>
    <li>无序列表 4</li>
</ul>
<h2>2. 有序列表</h2>
<ol>
    <li>有序列表 1</li>
    <li>有序列表 2</li>
    <li>有序列表 3</li>
    <li>有序列表 4</li>
</ol>
<h2>3. 描述列表（自定义列表）</h2>
<dl>
    <dt>描述对象 1</dt>
    <dd>特点 1</dd>
    <dd>特点 2</dd>
    <dt>描述对象 2</dt>
    <dd>特点 1</dd>
    <dd>特点 2</dd>
</dl>
```

![image-20260409101113805](https://img.yanxisishi.top/images/2026/04/image-20260409101113805.png)

#### 4. 表格标签

**场景：** 在网页中以行和列的形式整齐地展示数据，比如成绩单、财务报表、用户列表等。在早期的 HTML 中，表格甚至被用来做网页布局，但现在已经废弃这种做法，表格回归了其展示数据的本质。

**基本语法：** 表格的构建主要依赖三个核心标签：

- `<table>`：定义一个表格的容器。
- `<tr>`：(Table Row) 定义表格中的一行，必须嵌套在 `<table>` 内。
- `<td>`：(Table Data) 定义表格中的单元格（列），必须嵌套在 `<tr>` 内。
- `<th>`：(Table Header Cell) 定义表头单元格，通常位于表格的第一行或第一列，浏览器默认会将 `<th>` 中的文字**加粗并居中**显示。

**常用属性（了解即可）：** 在现代开发中，表格的样式（边框、宽高、对齐）都会交给 CSS 来处理。但 HTML 表格也自带一些基础属性：

- `border`：设置表格边框的宽度（如 `border="1"`）。

```html
<table>
    <tr>
        <th>列标题 1</th>
        <th>列标题 2</th>
        <th>列标题 3</th>
    </tr>
    <tr>
        <td>元素 1</td>
        <td>元素 2</td>
        <td>元素 3</td>
    </tr>
    <tr>
        <td>元素 4</td>
        <td>元素 5</td>
        <td>元素 6</td>
    </tr>
    <tr>
        <td>元素 7</td>
        <td>元素 8</td>
        <td>元素 9</td>
    </tr>
</table>

<table border="1">
    <tr>
        <th>列标题 1</th>
        <th>列标题 2</th>
        <th>列标题 3</th>
    </tr>
    <tr>
        <td>元素 1</td>
        <td>元素 2</td>
        <td>元素 3</td>
    </tr>
    <tr>
        <td>元素 4</td>
        <td>元素 5</td>
        <td>元素 6</td>
    </tr>
    <tr>
        <td>元素 7</td>
        <td>元素 8</td>
        <td>元素 9</td>
    </tr>
</table>
```

![image-20260409103132891](https://img.yanxisishi.top/images/2026/04/image-20260409103132891.png)

**表格结构标签：** 为了让表格的语义更加清晰，通常会将表格划分为三个部分：表头、表体和表脚。

- `<thead>`：表格的头部区域，内部包含表头行。
- `<tbody>`：表格的主体区域，包含核心数据。
- `<tfoot>`：表格的底部区域，常用于统计或汇总（实际使用较少）。

```html
<table border="1">
    <thead>
        <tr>
            <th>姓名</th>
            <th>成绩</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>张三</td>
            <td>100</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>90</td>
        </tr>
        <tr>
            <td>王五</td>
            <td>95</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td>平均分</td>
            <td>95</td>
        </tr>
    </tfoot>
</table>
```

![image-20260409103827395](https://img.yanxisishi.top/images/2026/04/image-20260409103827395.png)

**合并单元格：**

表格开发中很少使用合并，会导致表格难以维护，且可能影响响应式适配（尤其是移动端）。

- `rowspan="n"`：跨行合并（纵向合并 n 个单元格）。
- `colspan="n"`：跨列合并（横向合并 n 个单元格）。

```html
<table border="1">
    <tr>
        <th>姓名</th>
        <th>年龄</th>
        <th>性别</th>
    </tr>
    <tr>
        <td>张三</td>
        <td>18</td>
        <td rowspan="2">男</td>
    </tr>
    <tr>
        <td>李四</td>
        <td>19</td>
    </tr>
    <tr>
        <td>王五</td>
        <td>18</td>
        <td>女</td>
    </tr>
    <tr>
        <th colspan="3">日期：04-01</th>
    </tr>
</table>
```

![image-20260409105438790](https://img.yanxisishi.top/images/2026/04/image-20260409105438790.png)

#### 5. 表单标签

**场景：** 表单是用于**收集用户输入数据**，并将数据提交到后端进行处理的区域。在网页中，诸如用户登录/注册、搜索框、问卷调查、订单支付、文件上传等场景，底层统统离不开表单。

一个完整的表单通常由三个核心部分组成：**表单容器**、**表单控件**和**辅助标签**。

1. **表单容器 `<form>`**

   `<form>` 标签用于定义表单的范围，包裹所有表单控件。

   **核心属性：**

   - `action`：定义了在提交表单时，应该把收集到的数据送给谁（通常是后端的 URL 地址）去处理。目前如果不涉及数据交互，可以暂且留空（`action=""`）或写 `#`。
   - `method`：指定表单数据的提交方式。
     - `GET`：数据会直接暴露附加在 URL 后面（如 `?id=1&name=admin`），适合获取数据，不安全，且有长度限制。
     - `POST`：数据封装在 HTTP 请求体中传输，适合提交敏感数据或大量数据（如密码、文件）。

   ```html
   <form action="login.php" method="POST">
   </form>
   ```

2. **表单控件**

   表单控件是真正负责与用户交互的元素。为了应对各种不同的输入场景，HTML 提供了四种最常用的表单控件：

   `input` 表单、`textarea` 表单、`select` 下拉表单和 `button` 按钮。

   1. **表单控件 - input 表单**

      输入标签 `<input>` 是最常用的表单元素之一。它可以创建文本输入框、密码框、单选框、复选框等。

      `type`属性定义了输入框的类型：

      | **type 属性值** | **控件类型** | **描述与说明**                                            |
      | --------------- | ------------ | --------------------------------------------------------- |
      | `text`          | 单行文本框   | 默认的单行文本输入框。                                    |
      | `password`      | 密码框       | 输入字符会被掩码（如星号或圆点）隐藏。                    |
      | `radio`         | 单选框       | **注**：多个单选框的 `name` 必须一致才能实现互斥。        |
      | `checkbox`      | 复选框       | 允许选择多个选项。                                        |
      | `file`          | 文件域       | 用于选择文件上传。（常是安全测试中文件上传漏洞的入口）。  |
      | `submit`        | 提交按钮     | 点击将表单数据提交到 `action` 地址。                      |
      | `reset`         | 重置按钮     | 点击清空表单内的所有输入。                                |
      | `button`        | 普通按钮     | 默认无功能，通常配合 JS 使用。                            |
      | `hidden`        | 隐藏域       | 页面不可见，但随表单提交（常用于传 token 或隐藏标识符）。 |

      除了 `type` 属性， `<input>` 还有很多其他常见属性。

      对于 `text` 单行文本框和 `password` 密码框等，有以下常见属性：

      | **属性名**     | **描述与说明**                                               |
      | -------------- | ------------------------------------------------------------ |
      | `placeholder`  | 占位符。输入框为空时的灰色提示文字。                         |
      | `value`        | 输入框的默认初始值。与 placeholder（灰色提示）不同，value 是实打实的文本内容，用户可以直接修改它。 |
      | `name`         | 控件名称。后端通过此名称提取对应数据（`name=value`）。       |
      | `maxlength`    | 限制最多可输入的字符数量。                                   |
      | `accesskey`    | 规定获取该元素焦点的快捷键。                                 |
      | `autocomplete` | 自动完成（`on`/`off`）。涉及敏感输入时常强制设为 `off` 防泄露。 |
      | `disabled`     | 禁用控件（变灰且不可操作）。**注：提交时不发送此数据。**     |
      | `readonly`     | 只读状态（不可改但可复制）。**注：提交时依然正常发送数据。** |
      | `required`     | 必填校验。若为空，提交时浏览器会拦截并提示。                 |

      ::tab{:tabs='["组件","语法"]'}
      #tab1

      <form action="">
          <ul>
              <li>
                  这是没有使用 placeholder 属性的单行文本框：
                  <br>
                  <input type="text" name="username">
              </li>
              <li>
                  这是使用了 placeholder 属性的单行文本框：
                  <br>
                  <input type="text" name="username" placeholder="请输入用户名">
              </li>
              <li>
                  这是使用了 value 属性的单行文本框，默认值是 admin：
                  <br>
                  <input type="text" name="username" value="admin">
              </li>
              <li>
                  这是使用了 maxlength 属性的单行文本框，最大长度是 10：
                  <br>
                  <input type="text" name="username" placeholder="请输入用户名" maxlength="10">
              </li>
              <li>
                  这是使用了 accesskey 属性的单行文本框，快捷键是 alt + j：
                  <br>
                  <input type="text" name="username" placeholder="请输入用户名" accesskey="j">
              </li>
              <li>
                  这是使用了 autocomplete 属性的单行文本框：
                  <br>
                  <input type="text" name="username" placeholder="请输入用户名" autocomplete="off">
              </li>
              <li>
                  这是使用了 disabled 属性的单行文本框：
                  <br>
                  <input type="text" name="username" placeholder="请输入用户名" disabled autocomplete="off">
              </li>
              <li>
                  这是使用了 readonly 属性的单行文本框：
                  <br>
                  <input type="text" name="username" placeholder="请输入用户名" readonly autocomplete="off">
              </li>
          </ul>
      </form>

      #tab2

      ```html
      <form action="">
          <ul>
              <li>
                  这是没有使用 placeholder 属性的单行文本框：
                  <br>
                  <input type="text" name="username">
              </li>
              <li>
                  这是使用了 placeholder 属性的单行文本框：
                  <br>
                  <input type="text" name="username" placeholder="请输入用户名">
              </li>
              <li>
                  这是使用了 value 属性的单行文本框，默认值是 admin：
                  <br>
                  <input type="text" name="username" value="admin">
              </li>
              <li>
                  这是使用了 maxlength 属性的单行文本框，最大长度是 10：
                  <br>
                  <input type="text" name="username" placeholder="请输入用户名" maxlength="10">
              </li>
              <li>
                  这是使用了 accesskey 属性的单行文本框，快捷键是 alt + j：
                  <br>
                  <input type="text" name="username" placeholder="请输入用户名" accesskey="j">
              </li>
              <li>
                  这是使用了 autocomplete 属性的单行文本框：
                  <br>
                  <input type="text" name="username" placeholder="请输入用户名" autocomplete="off">
              </li>
              <li>
                  这是使用了 disabled 属性的单行文本框：
                  <br>
                  <input type="text" name="username" placeholder="请输入用户名" disabled autocomplete="off">
              </li>
              <li>
                  这是使用了 readonly 属性的单行文本框：
                  <br>
                  <input type="text" name="username" placeholder="请输入用户名" readonly autocomplete="off">
              </li>
          </ul>
      </form>
      ```

      ::

      ::tab{:tabs='["组件","语法"]'}
      #tab1

      <form action="">
          <ul>
              <li>
                  这是没有使用 placeholder 属性的密码框：
                  <br>
                  <input type="password" name="password" autocomplete="off">
              <li>
                  这是使用了 placeholder 属性的密码框：
                  <br>
                  <input type="password" name="password" placeholder="请输入密码" autocomplete="off">
              </li>
              <li>
                  这是使用了 value 属性的密码框，默认值是 123456：
                  <br>
                  <input type="password" name="password" value="123456" autocomplete="off">
              </li>
          </ul>
      </form>

      #tab2

      ```html
      <form action="">
          <ul>
              <li>
                  这是没有使用 placeholder 属性的密码框：
                  <br>
                  <input type="password" name="password" autocomplete="off">
              <li>
                  这是使用了 placeholder 属性的密码框：
                  <br>
                  <input type="password" name="password" placeholder="请输入密码" autocomplete="off">
              </li>
              <li>
                  这是使用了 value 属性的密码框，默认值是 123456：
                  <br>
                  <input type="password" name="password" value="123456" autocomplete="off">
              </li>
          </ul>
      </form>
      ```

      ::

      对于 `radio` 单选框和 `checkbox` 复选框有：

      | **属性名** | **描述与说明**                                               |
      | ---------- | ------------------------------------------------------------ |
      | `value`    | 控件的值。**注**：这是实际提交给后端的底层数据。             |
      | `name`     | 控件名称。**注**：同组单选框的 `name` 必须完全相同才能实现互斥。 |
      | `checked`  | 默认选中状态。布尔属性，直接加上即可生效。                   |
      | `id`       | 唯一标识符。最常配合 `<label>` 标签使用，以扩大点击范围。    |

      ::tab{:tabs='["组件","语法"]'}
      #tab1

      <form action="">
          <ul>
              <li>
                  这是没有使用 checked 属性的单选按钮(name="sex")：
                  <br>
                  <input type="radio" name="sex" value="male"> 男
                  <input type="radio" name="sex" value="female"> 女
              </li>
              <li>
                  这是使用了 checked 属性的单选按钮，默认选中男(name="gender" ，与上面的例子使用不同的 name ，防止冲突)：
                  <br>
                  <input type="radio" name="gender" value="male" checked> 男
                  <input type="radio" name="gender" value="female"> 女
              </li>
          </ul>
      </form>
      #tab2
      
      ```html
      <form action="">
          <ul>
              <li>
                  这是没有使用 checked 属性的单选按钮(name="sex")：
                  <br>
                  <input type="radio" name="sex" value="male"> 男
                  <input type="radio" name="sex" value="female"> 女
              </li>
              <li>
                  这是使用了 checked 属性的单选按钮，默认选中男(name="gender" ，与上面的例子使用不同的 name ，防止冲突)：
                  <br>
                  <input type="radio" name="gender" value="male" checked> 男
                  <input type="radio" name="gender" value="female"> 女
              </li>
          </ul>
      </form>
      ```
      
      ::
      
      ::tab{:tabs='["组件","语法"]'}
      #tab1
      
      <form action="">
          <ul>
              <li>
                  这是没有使用 checked 属性的复选框：
                  <br>
                  <input type="checkbox" name="hobby" value="reading"> 唱
                  <input type="checkbox" name="hobby" value="sports"> 跳
                  <input type="checkbox" name="hobby" value="music"> rap
              </li>
              <li>
                  这是使用了 checked 属性的复选框，默认选中唱和 rap：
                  <br>
                  <input type="checkbox" name="hobby" value="reading" checked> 唱
                  <input type="checkbox" name="hobby" value="sports"> 跳
                  <input type="checkbox" name="hobby" value="music" checked> rap
              </li>
          </ul>
      </form>
      
      #tab2
      
      ```html
      <form action="">
          <ul>
              <li>
                  这是没有使用 checked 属性的复选框：
                  <br>
                  <input type="checkbox" name="hobby" value="reading"> 唱
                  <input type="checkbox" name="hobby" value="sports"> 跳
                  <input type="checkbox" name="hobby" value="music"> rap
              </li>
              <li>
                  这是使用了 checked 属性的复选框，默认选中唱和 rap：
                  <br>
                  <input type="checkbox" name="hobby" value="reading" checked> 唱
                  <input type="checkbox" name="hobby" value="sports"> 跳
                  <input type="checkbox" name="hobby" value="music" checked> rap
              </li>
          </ul>
      </form>
      ```
      
      ::
      
      对于 `file` 文件域有：
      
      | **属性名** | **描述与说明**                                               |
      | ---------- | ------------------------------------------------------------ |
      | `multiple` | 多文件上传。布尔属性，加上后用户可以在选择窗口按住 Ctrl 或 Shift 一次性选取多个文件。 |
      | `accept`   | 限制弹出的文件选择框中允许选取的文件类型（如 `accept="image/png, .zip"`）。 |
      
      ::tab{:tabs='["组件","语法"]'}
      #tab1
      
      <form action="">
          <ul>
              <li>
                  这是没有使用 multiple 属性的文件域：
                  <br>
                  <input type="file" name="file">
              </li>
              <li>
                  这是使用了 multiple 属性的文件域，可以选择多个文件：
                  <br>
                  <input type="file" name="file" multiple>
              </li>
              <li>
                  这是使用了 accept 属性的文件域，只能选择图片文件：
                  <br>
                  <input type="file" name="file" accept="image/*">
              </li>
          </ul>
      </form>
      
      #tab2
      
      ```html
      <form action="">
          <ul>
              <li>
                  这是没有使用 multiple 属性的文件域：
                  <br>
                  <input type="file" name="file">
              </li>
              <li>
                  这是使用了 multiple 属性的文件域，可以选择多个文件：
                  <br>
                  <input type="file" name="file" multiple>
              </li>
              <li>
                  这是使用了 accept 属性的文件域，只能选择图片文件：
                  <br>
                  <input type="file" name="file" accept="image/*">
              </li>
          </ul>
      </form>
      ```
      
      ::
      
   2. **表单控件 - textarea 表单**
   
      `<textarea>` HTML元素是一个多行纯文本编辑控件，适用于允许用户输入大量自由格式文本的场景，例如评论或反馈表单。
   
      textarea多行文本框也称为文本域。双标签，和 `input` 不同，`textarea` 更适合承载较长文本内容。
   
      对于 `textarea` 文本域有：
      
      | **属性名**    | **描述与说明**                                          |
      | ------------- | ------------------------------------------------------- |
      | `name`        | 控件名称。提交表单时，后端通过该名称获取对应数据。      |
      | `rows`        | 规定文本域可见行数（高度）。                            |
      | `cols`        | 规定文本域可见列数（宽度，实际开发中通常交给 CSS 控制）。 |
      | `placeholder` | 占位提示文字，在文本域为空时显示。                      |
      
      **注：** 文本域 textarea 利用 CSS 来设定样式，比如宽高边框等。
      
      ::tab{:tabs='["组件","语法"]'}
      #tab1
      
      <form action="">
          <ul>
              <li>
                  这是基础留言框：
                  <br>
                  <textarea name="message" rows="5" cols="40" placeholder="请输入留言内容"></textarea>
              </li>
          </ul>
      </form>
      
      #tab2
      
      ```html
      <form action="">
          <ul>
              <li>
                  这是基础留言框：
                  <br>
                  <textarea name="message" rows="5" cols="40" placeholder="请输入留言内容"></textarea>
              </li>
          </ul>
      </form>
      ```
      
      ::
   
   3. **表单控件 - select 下拉表单**
   
      HTML `<select>` 元素表示一个提供选项菜单的控件，在网页中从固定选项中选择一个结果（如城市、学历、职业等）。
   
      ```html
      <select name="">
          <option value="">选项文本</option>
      </select>
      ```
      
      `<select>` 元素是容器， `<option>` 是每一个选项标签，每个选项要跟一个值。
   
      **注：** 因为 `select` 很难修改为好看的效果，大部分下列表可以通过其他标签模拟实现。
   
      对于 `select` 下拉表单有：
   
      | **属性名** | **描述与说明**                                            |
      | ---------- | --------------------------------------------------------- |
      | `name`     | 下拉框名称。提交表单时，后端通过该名称获取对应数据。      |
      | `value`    | 选项值。用户选择后，真正提交给后端的是该值。              |
      | `selected` | 默认选中状态。加在某个 `<option>` 上后，该项会默认被选中。 |
      | `disabled` | 禁用状态。加在某个 `<option>` 上后，该项不可被选择。       |
   
      ::tab{:tabs='["组件","语法"]'}
      #tab1
      
      <form action="">
          <ul>
              <li>
                  这是基础下拉框：
                  <br>
                  <select name="city">
                      <option value="">请选择城市</option>
                      <option value="beijing" selected>北京</option>
                      <option value="shanghai">上海</option>
                      <option value="guangzhou" disabled>广州（暂不可选）</option>
                  </select>
              </li>
          </ul>
      </form>
      
      #tab2
   
      ```html
      <form action="">
          <ul>
              <li>
                  这是基础下拉框：
                  <br>
                  <select name="city">
                      <option value="">请选择城市</option>
                      <option value="beijing" selected>北京</option>
                      <option value="shanghai">上海</option>
                      <option value="guangzhou" disabled>广州（暂不可选）</option>
                  </select>
              </li>
          </ul>
      </form>
      ```
      
      ::
      
   4. **表单控件 - button 按钮**
   
      **场景：** 在表单中触发提交、重置或普通操作时使用按钮。
   
      **语法：**
   
      ```html
      <button type="submit">按钮文本</button>
      ```
   
      **特点：** 双标签，可在按钮内放文本或其他行内内容；如果不写 `type`，默认是 `submit`。
   
      对于 `button` 按钮有：
   
      | **属性名** | **描述与说明**                                      |
      | ---------- | --------------------------------------------------- |
      | `type`     | 按钮类型，常用值为 `submit`、`reset`、`button`。    |
      | `name`     | 按钮名称。与表单提交配合时可作为字段名使用。        |
      | `value`    | 按钮值。按钮参与提交时，提交给后端的是该值。        |
      | `disabled` | 禁用状态。加上后按钮不可点击。                      |
   
      ::tab{:tabs='["组件","语法"]'}
      #tab1

      <form action="">
          <ul>
              <li>
                  这是 submit 提交按钮：
                  <br>
                  <button type="submit" name="action" value="submit">提交</button>
              </li>
              <li>
                  这是 reset 重置按钮：
                  <br>
                  <button type="reset" name="action" value="reset">重置</button>
              </li>
              <li>
                  这是 button 普通按钮：
                  <br>
                  <button type="button" name="action" value="normal">普通按钮</button>
              </li>
              <li>
                  这是被 disabled 禁用的按钮：
                  <br>
                  <button type="button" name="action" value="disabled" disabled>禁用按钮</button>
              </li>
          </ul>
      </form>
      #tab2
      
      ```html
      <form action="">
          <ul>
              <li>
                  这是 submit 提交按钮：
                  <br>
                  <button type="submit" name="action" value="submit">提交</button>
              </li>
              <li>
                  这是 reset 重置按钮：
                  <br>
                  <button type="reset" name="action" value="reset">重置</button>
              </li>
              <li>
                  这是 button 普通按钮：
                  <br>
                  <button type="button" name="action" value="normal">普通按钮</button>
              </li>
              <li>
                  这是被 disabled 禁用的按钮：
                  <br>
                  <button type="button" name="action" value="disabled" disabled>禁用按钮</button>
              </li>
          </ul>
      </form>
      ```
      
      ::
   
3. **辅助标签 `<label>`**

   `<label>` 表示用户界面中某个元素的说明。提升可访问性（点击标签可聚焦输入框）。
   
   两种使用方式：
   
   1. 利用 for 和 id 相关联
   
      ::tab{:tabs='["组件","语法"]'}
      #tab1
   
      <label for="male">男</label>
      <input type="radio" id="male" name="sex" value="male">
      <br>
      <label for="female">女</label>
      <input type="radio" id="female" name="sex" value="female">
   
      #tab2
   
      ```html
      <label for="male">男</label>
      <input type="radio" id="male" name="sex" value="male">
      <br>
      <label for="female">女</label>
      <input type="radio" id="female" name="sex" value="female">
      ```
   
      ::
   
   2. 直接包含
   
      ::tab{:tabs='["组件","语法"]'}
      #tab1
   
      <label>男
      	<input type="radio" id="male" name="sex" value="male">
      </label>
      <br>
      <label>女
      	<input type="radio" id="female" name="sex" value="female">
      </label>
   
      #tab2
   
      ```html
      <label>男
      	<input type="radio" id="male" name="sex" value="male">
      </label>
      <br>
      <label>女
      	<input type="radio" id="female" name="sex" value="female">
      </label>
      ```
   
      ::
   
   点击男或女的标签后同样可以选中单选框。

### 3.10 字符实体

字符实体是一段以**连字号(&)开头**、以**分号(;)结尾**的文本(字符串)。常用于显示保留字符和不可见字符（如“不换行空格”） 

在 HTML 中，如果直接输入 `<` 或 `>`，浏览器可能会将其误认为是标签的开始或结束。为了正常显示这些字符，就需要使用字符实体。

**常见字符实体：**

| 显示结果 | 描述                            | 实体名称（最常用） | 实体编号 |
| :------: | :------------------------------ | :----------------- | :------- |
|  (空格)  | 不换行空格 (Non-breaking space) | `&nbsp;`           | `&#160;` |
|   `<`    | 小于号 (Less than)              | `&lt;`             | `&#60;`  |
|   `>`    | 大于号 (Greater than)           | `&gt;`             | `&#62;`  |
|   `&`    | 和号 (Ampersand)                | `&amp;`            | `&#38;`  |
|   `"`    | 双引号 (Double quote)           | `&quot;`           | `&#34;`  |
|   `'`    | 单引号 (Single quote)           | `&apos;`           | `&#39;`  |
|   `¥`    | 人民币/日元 (Yen)               | `&yen;`            | `&#165;` |
|   `©`    | 版权 (Copyright)                | `&copy;`           | `&#169;` |
|   `®`    | 注册商标 (Registered trademark) | `&reg;`            | `&#174;` |
|   `×`    | 乘号 (Multiplication)           | `&times;`          | `&#215;` |
|   `÷`    | 除号 (Division)                 | `&divide;`         | `&#247;` |

**注**：实体名称对大小写敏感。

::tab{:tabs='["组件","语法"]'}
#tab1

你                                                好
<br>
你&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;好

#tab2

```html
你                                                好
<br>
你&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;好
```

::

### 3.11 HTML 综合使用

```html
<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>个人主页</title>
</head>

<body>

    <header>
        <h1>欢迎来到我的主页</h1>
        <p>这是我学习 HTML 后编写的一个综合页面。</p>
        <nav>
            <a href="#profile">个人资料</a> |
            <a href="#hobbies">我的爱好</a> |
            <a href="#contact">联系留言</a>
        </nav>
    </header>
    <hr>

    <main>
        <section id="profile">
            <h2>关于我</h2>
            <table border="1" cellspacing="0" cellpadding="8">
                <tr>
                    <td rowspan="3">
                        <img src="https://img.yanxisishi.top/images/2026/03/1ebc23b8f8e871461e1664bce4587095.png"
                            alt="我的头像" width="100">
                    </td>
                    <th>昵称</th>
                    <td>康可</td>
                </tr>
                <tr>
                    <th>身份</th>
                    <td>大一学生</td>
                </tr>
                <tr>
                    <th>座右铭</th>
                    <td><em>能玩是福！</em></td>
                </tr>
            </table>
        </section>

        <section id="hobbies">
            <h2>我的爱好</h2>
            <ul>
                <li><strong>听歌：</strong> 好像什么都听？</li>
                <li><strong>技术探索：</strong>
                    <ol>
                        <li>学习各种有趣的编程语言</li>
                        <li>研究美观的前端页面排版</li>
                    </ol>
                </li>
            </ul>
        </section>
        <hr>

        <section id="contact">
            <h2>给我留言</h2>
            <form action="#" method="POST">
                <p>
                    <label for="username">你的称呼：</label>
                    <input type="text" id="username" name="username" placeholder="请输入昵称" required>
                </p>

                <p>
                    性别：
                    <label><input type="radio" name="gender" value="male" checked> 男</label>
                    <label><input type="radio" name="gender" value="female"> 女</label>
                    <label><input type="radio" name="gender" value="secret"> 保密</label>
                </p>

                <p>
                    <label for="city">来自哪里：</label>
                    <select id="city" name="city">
                        <option value="">请选择城市</option>
                        <option value="beijing">北京</option>
                        <option value="shanghai">上海</option>
                        <option value="guangzhou">广州</option>
                        <option value="other">其他</option>
                    </select>
                </p>

                <p>
                    你是怎么发现这里的：
                    <label><input type="checkbox" name="source" value="search"> 搜索引擎</label>
                    <label><input type="checkbox" name="source" value="friend"> 朋友推荐</label>
                    <label><input type="checkbox" name="source" value="random"> 随缘路过</label>
                </p>

                <p>
                    <label for="message">留言内容：</label><br>
                    <textarea id="message" name="message" rows="5" cols="45" placeholder="想对我说点什么..."></textarea>
                </p>

                <p>
                    <button type="submit">发送留言</button>
                    <button type="reset">重新填写</button>
                </p>
            </form>
        </section>
    </main>
    <br>

    <footer>
        <hr>
        <p>&copy; 康可</p>
    </footer>

</body>

</html>
```

## 4. HTML 标签速查

### 4.1 文档与网页结构

| **标签**  | **类型** | **描述**                                   |
| --------- | -------- | ------------------------------------------ |
| `<html>`  | 双标签   | 网页的根元素，包裹所有内容                 |
| `<head>`  | 双标签   | 网页头部，包含元数据、标题、引入外部文件等 |
| `<meta>`  | 单标签   | 设置网页的字符集、视口等元数据             |
| `<title>` | 双标签   | 网页的标题（显示在浏览器标签页上）         |
| `<body>`  | 双标签   | 网页主体，包含所有在页面上可见的内容       |

### 4.2 语义化布局（HTML5 新增）

| **标签**    | **类型** | **描述**                   |
| ----------- | -------- | -------------------------- |
| `<header>`  | 双标签   | 定义页面或区块的头部/页眉  |
| `<nav>`     | 双标签   | 定义导航链接区域           |
| `<main>`    | 双标签   | 定义文档的主要内容（唯一） |
| `<section>` | 双标签   | 定义文档中的独立区块/小节  |
| `<aside>`   | 双标签   | 定义侧边栏或附属信息       |
| `<article>` | 双标签   | 定义独立、完整的文章内容   |
| `<footer>`  | 双标签   | 定义页面或区块的底部/页脚  |

### 4.3 文本排版与基础标签

| **标签**        | **类型**      | **描述**                             |
| --------------- | ------------- | ------------------------------------ |
| `<h1>` - `<h6>` | 双标签 (块级) | 标题，从大到小排列，`<h1>` 权重最高  |
| `<p>`           | 双标签 (块级) | 段落标签，前后会自动换行             |
| `<br>`          | 单标签        | 强制换行                             |
| `<hr>`          | 单标签        | 水平分割线                           |
| `<div>`         | 双标签 (块级) | 无语义的区块容器，常用于 CSS 布局    |
| `<span>`        | 双标签 (内联) | 无语义的行内容器，常用于局部文字修改 |
| `<strong>`      | 双标签 (内联) | 文本加粗（带有强调语义）             |
| `<em>`          | 双标签 (内联) | 文本斜体（带有强调语义）             |

### 4.4 链接与多媒体

| **标签**  | **类型**      | **描述**                                                  |
| --------- | ------------- | --------------------------------------------------------- |
| `<a>`     | 双标签 (内联) | 超链接标签（核心属性：`href`、`target`）                  |
| `<img>`   | 单标签        | 图像标签（核心属性：`src`、`alt`）                        |
| `<video>` | 双标签        | 视频播放标签（常用属性：`controls`、`autoplay`、`muted`） |
| `<audio>` | 双标签        | 音频播放标签（常用属性：`controls`）                      |

### 4.5 列表与表格

| **标签**                 | **类型**      | **描述**                                     |
| ------------------------ | ------------- | -------------------------------------------- |
| `<ul>`                   | 双标签 (块级) | 无序列表的外部容器                           |
| `<ol>`                   | 双标签 (块级) | 有序列表的外部容器                           |
| `<li>`                   | 双标签 (块级) | 列表项（必须嵌套在 `ul` 或 `ol` 中）         |
| `<dl>` / `<dt>` / `<dd>` | 双标签        | 描述列表 / 术语 / 描述内容                   |
| `<table>`                | 双标签        | 表格的外部容器                               |
| `<tr>` / `<th>` / `<td>` | 双标签        | 表格行 / 表头单元格（加粗居中） / 普通单元格 |

### 4.6 表单收集

| **标签**     | **类型** | **描述**                                                     |
| ------------ | -------- | ------------------------------------------------------------ |
| `<form>`     | 双标签   | 表单容器，用于提交数据（属性：`action`、`method`）           |
| `<input>`    | 单标签   | 最核心的输入控件（由 `type` 属性决定是文本、密码、单选框等） |
| `<textarea>` | 双标签   | 多行文本输入域                                               |
| `<select>`   | 双标签   | 下拉菜单的外部容器                                           |
| `<option>`   | 双标签   | 下拉菜单中的具体选项                                         |
| `<button>`   | 双标签   | 按钮（由 `type` 决定是提交 `submit` 还是普通按钮 `button`）  |
| `<label>`    | 双标签   | 控件的辅助说明标签（扩大点击范围）                           |

## 5. 后记

这篇博客可能有点长了，但前端学习并没有这么复杂，这些笔记其实只需看一遍后理解即可，这么长的笔记只是方便我日后查询。
