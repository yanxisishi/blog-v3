---
title: VS Code 的 Git 图形化操作技巧
description: 写给新手的一篇关于使用 VS Code 图形化操作 Git 的博客。
date: 2026-10-17 18:00:00
updated: 2026-10-20 16:23:00
image: https://img.yanxisishi.top/images/2026/10/【哲风壁纸】乡村-动漫风景-夕阳.jpg
categories: [技术]
tags: [Git, VS Code, Git Graph, 学习笔记]
---

前一篇 [Git + GitHub 学习笔记](https://blog.yanxisishi.top/2026/git-github-notes) 主要记录常用的 Git 命令，这篇用 VS Code 进行更简单方便的图形化操作。

## 1. 准备一个练习目录

### 1.1 安装 Git 并检查

VS Code 自带 Git 界面，但仍需要系统中可以运行 Git。在终端检查：

```powershell
git --version
```

有版本号输出就可以继续。没有安装的话，先从 [Git 官网](https://git-scm.com/downloads) 安装，再重新打开 VS Code。

### 1.2 创建 work，使用 code . 打开

进入自己准备放练习项目的目录，执行：

```powershell
mkdir work
cd work
code .
```

`.` 表示当前目录，所以 `code .` 的意思就是用 VS Code 打开当前文件夹。如果 `work` 已经存在，直接进入它即可。

这次实际练习的位置是：

```text
D:\tan33\aaaa\work
```

打开后可以在菜单 **终端 → 新建终端** 里检查当前位置和 Git 版本。后面就在这个目录中准备示例文件。

[![用 VS Code 打开 work 并检查 Git 版本](https://img.yanxisishi.top/images/2026/10/vscode-git-01-open-folder-b38433f36f97.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-01-open-folder-b38433f36f97.png)

`code` 无法识别时，也可以先打开 VS Code，再使用 **文件 → 打开文件夹**，选中这个 `work`。

### 1.3 几个经常用到的入口

| 入口 | 快捷键（Windows / Linux） | 作用 |
| --- | --- | --- |
| 资源管理器 | `Ctrl + Shift + E` | 新建、打开和查看项目文件 |
| 源代码管理 | `Ctrl + Shift + G` | 查看改动、暂存、提交 |
| 命令面板 | `Ctrl + Shift + P` | 搜索 Git 操作和其他命令 |
| 集成终端 | `` Ctrl + ` `` | 必要时查看命令结果或处理配置 |
| 扩展 | `Ctrl + Shift + X` | 搜索和安装 Git Graph |
| 左下角分支名 | 点击即可 | 查看当前分支、创建和切换分支 |

后面提到“运行 `Git: ...`”时，就是打开命令面板搜索它。中文界面也可以搜索英文命令名，例如 `Git: Create Branch`，再确认列表里的操作。

## 2. 初始化仓库

点击左侧分叉形状的 **源代码管理** 图标。如果当前目录还没有仓库，会看到 **初始化仓库**。

[![在源代码管理中初始化仓库](https://img.yanxisishi.top/images/2026/10/vscode-git-02-initialize-repository-cf563358c7bc.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-02-initialize-repository-cf563358c7bc.png)

点击它，相当于在当前目录执行：

```bash
git init
```

VS Code 会在 `work` 中建立 `.git` 目录。这个目录保存版本管理数据，资源管理器通常会把它隐藏起来，不需要为了确认初始化成功专门把它显示出来。

初始化后，左下角会出现分支名，源代码管理面板也会出现提交输入框。

**初始化仓库** 和下面的 **发布到 GitHub** 是不同的操作。先做本地练习，点击“初始化仓库”就够了。

本文使用 `main` 作为主分支。如果你的界面显示 `master`，后面操作中的 `main` 换成自己的分支名即可。

## 3. 准备示例文件，认识 U 和更改列表

### 3.1 新建几个文件

在左侧资源管理器中新建下面四个文件：

```text
work/
├── .gitignore
├── index.html
├── old.txt
└── README.md
```

`index.html` 写一个简单页面，后面用它演示差异和冲突：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Git 练习页</title>
  <style>
    body {
      background: #ffffff;
      color: #222222;
      font-family: sans-serif;
      padding: 40px;
    }
  </style>
</head>
<body>
  <h1>我的 Git 练习页</h1>
  <p>今天学习 VS Code 的 Git 操作。</p>
  <ul>
    <li>查看差异</li>
    <li>暂存并提交</li>
  </ul>
</body>
</html>
```

`README.md` 随便写几行项目说明，`old.txt` 写一句“这是一份稍后会删除的旧说明”。`.gitignore` 先写：

```gitignore
*.log
.env
cache/
```

它会让 Git 忽略匹配的日志、环境配置和缓存目录，后面再看具体效果。

### 3.2 文件为什么变成绿色，还带着 U

保存这些文件后，切到源代码管理，会在 **更改** 下看到它们：

[![新文件出现在更改列表并带有 U](https://img.yanxisishi.top/images/2026/10/vscode-git-03-untracked-files-2d8376f3076f.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-03-untracked-files-2d8376f3076f.png)

这里的 `U` 是 **Untracked，未跟踪**。Git 看到了新文件，但它还没有进入暂存区。

绿色只是界面提示；判断文件处于哪一步，还要看字母以及它位于“更改”还是“暂存的更改”下面。

## 4. 暂存并完成第一次提交

### 4.1 鼠标移到文件上，点击加号

把鼠标移到 **更改** 列表中的 `index.html` 上，右侧会显示几个按钮。点击 **`+` 暂存更改**。

[![点击文件右侧加号暂存](https://img.yanxisishi.top/images/2026/10/vscode-git-04-stage-a-file-454fff5f3cdc.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-04-stage-a-file-454fff5f3cdc.png)

这一步相当于：

```bash
git add index.html
```

暂存后，`index.html` 会移动到 **暂存的更改** 下，其他文件仍留在 **更改** 下：

[![暂存的更改与更改分别显示不同文件](https://img.yanxisishi.top/images/2026/10/vscode-git-05-staged-and-unstaged-27decf3912ff.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-05-staged-and-unstaged-27decf3912ff.png)

两块列表可以这样理解：

| 列表 | 这次提交会不会包含它 |
| --- | --- |
| 更改 | 还没有准备进这次提交的改动 |
| 暂存的更改 | 已经为这次提交准备好的改动 |

新文件暂存后通常从 `U` 变成 `A`，表示准备添加到版本记录中。

### 4.2 暂存剩下的文件

如果这几个文件都准备一起提交，可以把鼠标移到 **更改** 这一组的标题上，点击组标题右侧的 `+`，一次暂存这一组全部文件。

也可以打开命令面板，运行 `Git: Stage All Changes`（暂存所有更改）。

项目较大时不要直接养成“全选提交”的习惯，先看列表里有没有日志、临时文件和不该上传的配置。

### 4.3 写说明，再点击提交

在上方输入框中填写：

```text
初始化练习项目
```

确认四个文件都在 **暂存的更改** 中，再点击 **提交**。

[![填写提交说明并提交已经暂存的文件](https://img.yanxisishi.top/images/2026/10/vscode-git-06-first-commit-message-e47380d120cf.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-06-first-commit-message-e47380d120cf.png)

等价于：

```bash
git commit -m "初始化练习项目"
```

提交完成后，改动列表会清空，下方图表中出现这条提交记录：

[![第一次提交完成，图表中出现提交记录](https://img.yanxisishi.top/images/2026/10/vscode-git-07-first-commit-complete-9a77992a449b.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-07-first-commit-complete-9a77992a449b.png)

列表清空表示当前没有需要提交的改动，项目文件仍然在目录里。

**记一下：** `Ctrl + S` 保存文件；`+` 暂存；“提交”形成本地版本。这三个动作要分清。

### 4.4 第一次提交提示没有用户名和邮箱

如果出现 `Please tell me who you are`，在终端设置提交信息：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

它们用于标记提交作者，不是 GitHub 的登录凭据。只想给当前练习仓库设置时，去掉 `--global`，并在项目目录执行。

## 5. 文件上的颜色、字母和小标记

### 5.1 做出三种变化

第一次提交后，再做下面几件事，并保存文件：

1. 修改 `index.html` 的标题和背景色。
2. 删除页面里的说明段落，再给列表增加一项。
3. 新建 `notes.md`，写几行笔记。
4. 删除已经提交过的 `old.txt`。
5. 新建 `debug.log`，写一行日志。

这次把标题改成 `VS Code Git 图形化练习`，背景色改成 `#f5f7ff`，列表里新增“认识 Git Graph”。

### 5.2 资源管理器里的绿色、黄色和灰色

[![资源管理器中的文件颜色与编辑器行号旁的修改标记](https://img.yanxisishi.top/images/2026/10/vscode-git-08-explorer-colors-ba09cfc68e6f.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-08-explorer-colors-ba09cfc68e6f.png)

在本文使用的深色主题中，常见显示如下：

| 颜色或外观 | 常见含义 | 例子 |
| --- | --- | --- |
| 绿色 | 新文件、准备新增的文件 | 新建的 `notes.md` |
| 黄色或偏橙色 | 已跟踪文件发生修改 | 修改过的 `index.html` |
| 灰色 | 被忽略的文件 | 匹配 `*.log` 的 `debug.log` |
| 红色、删除线等 | 删除或冲突相关状态，要结合列表判断 | 源代码管理中的 `old.txt` |
| 文件夹名字变色 | 文件夹里面包含有变化的文件 | 不代表整个文件夹都是新增 |

主题可以更改颜色，扩展也能添加装饰。**看颜色快速定位，看字母和所在分组确认状态。**

### 5.3 M、U、D、A、R 分别是什么意思

[![源代码管理中同时出现 M、U 和 D](https://img.yanxisishi.top/images/2026/10/vscode-git-09-m-u-d-status-e9a032abc0a9.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-09-m-u-d-status-e9a032abc0a9.png)

| 标记 | 含义 | 常见场景 |
| --- | --- | --- |
| `M` | Modified，已修改 | 修改了 Git 已经跟踪的文件 |
| `U` | Untracked，未跟踪 | 新建文件，还没有暂存 |
| `A` | Added，已添加 | 新文件已加入暂存区 |
| `D` | Deleted，已删除 | 删除了已跟踪文件，准备记录这次删除 |
| `R` | Renamed，已重命名 | Git 识别出文件发生了重命名 |

重命名识别会受内容相似度和当前视图影响，有时会先看到一个删除和一个新增。遇到合并冲突时，要看 **合并的更改** 分组和冲突提示，不要只凭颜色猜。

### 5.4 编辑器左侧的绿条、蓝条和红色标记

打开修改后的文件，看行号旁边的窄条：

- **绿色条**：新增的行。
- **蓝色条**：原有行被修改。
- **红色小标记**：这里删除过内容；删除的行本身已经不在当前文件里。

点击这些标记可以查看对应变化，也能看到还原等操作。它们表示的是文件内部哪些行发生了变化，和资源管理器里整个文件的颜色不是同一个层次。

## 6. 查看差异，再决定提交哪些内容

### 6.1 从更改列表打开 diff

点击 **更改** 下的 `index.html`，会打开差异编辑器：

[![并排查看 index.html 的修改前后内容](https://img.yanxisishi.top/images/2026/10/vscode-git-10-diff-editor-920b18d6992e.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-10-diff-editor-920b18d6992e.png)

在当前并排视图中，左侧是比较基准，右侧是当前版本。红色背景标出旧内容，绿色背景标出新内容。

这里的红色表示“被移除的旧内容”，不代表语法报错。修改一行时，通常会同时看到一条红色旧行和一条绿色新行。

比较基准取决于从哪里打开文件：

| 打开的位置 | 通常比较的内容 |
| --- | --- |
| 更改 | 工作区与暂存区之间的差异 |
| 暂存的更改 | 暂存区与当前提交之间的差异 |
| 历史中的某条提交 | 该提交与其父提交之间的差异，合并提交等情况要看比较对象 |

如果窗口比较窄，可能显示为上下交错的内联差异。也可以在差异编辑器右上角的更多操作中切换布局。

### 6.2 只暂存一个改动块

这次标题、背景色、说明段落和列表都改了，但假设只想先准备提交标题。

把鼠标移到标题变化旁边，在中间的操作栏点击 **`+` 暂存块**。不要点旁边的还原箭头。

[![在差异编辑器中只暂存标题所在的改动块](https://img.yanxisishi.top/images/2026/10/vscode-git-11-stage-one-block-78be1230df40.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-11-stage-one-block-78be1230df40.png)

如果一块里还混着其他改动，可以在右侧选中需要的行，右键选择 **暂存所选范围**，或运行 `Git: Stage Selected Ranges`。

这样，同一个文件的不同修改就可以分成不同提交。

### 6.3 为什么同一个文件在两块列表里都有

只暂存标题后，左侧会同时出现两个 `index.html`：

[![同一个文件同时具有已暂存和未暂存的修改](https://img.yanxisishi.top/images/2026/10/vscode-git-12-same-file-two-lists-f75cb4d8f362.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-12-same-file-two-lists-f75cb4d8f362.png)

上面的 `index.html` 代表已经暂存的标题修改，下面的代表背景色、段落和列表等尚未暂存的修改。

再点击 **暂存的更改** 中的 `index.html`，右侧只显示已经准备提交的标题变化：

[![从暂存列表检查本次提交真正包含的差异](https://img.yanxisishi.top/images/2026/10/vscode-git-13-review-staged-diff-80a16783f12e.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-13-review-staged-diff-80a16783f12e.png)

另一个常见原因是：先暂存文件，然后继续编辑并保存。暂存区保留的是点击 `+` 那一刻的内容，后来的编辑不会自动跟进去，需要再次暂存。

所以提交前最好点开 **暂存的更改** 检查一次，确认这一版到底包含什么。

## 7. 取消暂存、放弃修改和忽略文件

### 7.1 点击减号，只取消暂存

把鼠标移到 **暂存的更改** 下的文件上，点击 **`-` 取消暂存更改**：

[![点击减号取消暂存](https://img.yanxisishi.top/images/2026/10/vscode-git-14-unstage-0e24b3cc5c39.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-14-unstage-0e24b3cc5c39.png)

这会把准备提交的内容移回 **更改**，编辑好的文件内容仍然保留。它不是撤销代码修改。

在已经有提交的仓库里，对应操作可以理解为：

```bash
git restore --staged index.html
```

这次取消暂存后，把 `index.html`、`notes.md` 和 `old.txt` 的删除一起暂存，再提交为：

```text
调整练习页面并添加笔记
```

接下来的分支练习从这个干净状态继续。

### 7.2 放弃更改，会恢复文件内容

假设刚提交完，又临时把页面标题改错了。保存后，`index.html` 会重新出现在 **更改** 中。

先点开确认只有这次误改，再点击文件右侧的回转箭头 **放弃更改**，或右键文件选择同名操作：

[![文件右侧的放弃更改入口](https://img.yanxisishi.top/images/2026/10/vscode-git-15-discard-changes-714f9e2e0c35.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-15-discard-changes-714f9e2e0c35.png)

确认后，文件会恢复到暂存区中的版本；没有暂存变化时，就是当前提交对应的内容。这个动作会丢弃选中的工作区修改，和“取消暂存”要分开记。

未跟踪的新文件还没有提交版本可供恢复，对它执行“放弃”可能会删除文件。练习时用临时文件，不要拿刚写完的未提交笔记随手试。

### 7.3 为什么 debug.log 没进更改列表

因为之前的 `.gitignore` 包含：

```gitignore
*.log
.env
cache/
```

资源管理器里的 `debug.log` 会变灰，也不会进入 Git 的新增文件列表。这适合日志、缓存和本机配置等内容。

`.gitignore` 自己应该提交，团队成员才能使用同一套忽略规则。

**已经被跟踪的文件不会因为写进 `.gitignore` 就自动停止跟踪。** 如果确实需要停止跟踪并保留本地文件，可以在确认路径后使用：

```bash
git rm --cached 文件名
```

然后提交这次变化。它也不会清除旧提交中已经存在的内容。

## 8. 创建、切换和合并分支

### 8.1 点击左下角分支名

点击左下角的 `main`，会打开分支选择器：

[![从左下角打开分支选择器](https://img.yanxisishi.top/images/2026/10/vscode-git-16-branch-picker-2f4d23c1751d.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-16-branch-picker-2f4d23c1751d.png)

这里既可以选择已有分支，也可以选择 **创建新分支...**。已有分支点击后就会切换过去，工作区内容也会按目标分支更新。

切换前先看源代码管理中有没有未提交的改动。没有冲突的修改有时会跟着切换过去；可能覆盖现有内容时，Git 会阻止切换。先提交或暂存到 stash，再切换更容易判断当前状态。

### 8.2 创建 feature/title

选择 **创建新分支...**，输入：

```text
feature/title
```

也可以运行 `Git: Create Branch`。默认从当前提交创建，并切换到新分支。

[![输入新分支名 feature/title](https://img.yanxisishi.top/images/2026/10/vscode-git-17-create-branch-b6c2a638785f.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-17-create-branch-b6c2a638785f.png)

创建成功后，确认左下角变成 `feature/title`。在这个分支把页面里的 `<h1>` 改成：

```html
<h1>用 VS Code 管理 Git</h1>
```

暂存并提交，说明写：

```text
在功能分支调整页面标题
```

[![确认当前分支并提交功能分支的标题修改](https://img.yanxisishi.top/images/2026/10/vscode-git-18-feature-branch-a46f75f2c01a.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-18-feature-branch-a46f75f2c01a.png)

### 8.3 切回 main，准备合并

再次点击左下角分支名，选择 `main`。刚才功能分支的标题修改会从当前工作区里消失，回到 `main` 的内容；提交记录仍在 `feature/title` 上。

为了练习冲突，这次特意在 `main` 中把同一行改成：

```html
<h1>我的 Git 图形化学习笔记</h1>
```

暂存并提交，说明写“在 main 调整页面标题”。这样两条分支都从同一个旧版本出发，分别修改了同一行。

合并时，**先切到接收修改的目标分支**。这里希望把 `feature/title` 合进 `main`，所以先确认左下角是 `main`，再运行 `Git: Merge...`，选择 `feature/title`。

[![在 main 中选择要合并的 feature/title](https://img.yanxisishi.top/images/2026/10/vscode-git-19-merge-branch-47da3e4ebc58.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-19-merge-branch-47da3e4ebc58.png)

平时双方修改没有冲突时，Git 可以直接合并。这次故意修改同一行，用来观察 VS Code 的冲突界面。

## 9. 处理一次真实的合并冲突

### 9.1 冲突出在哪里

合并之后，源代码管理会出现 **合并更改**，`index.html` 旁边出现冲突标记。普通文本编辑器里可以看到：

```html
<<<<<<< HEAD
  <h1>我的 Git 图形化学习笔记</h1>
=======
  <h1>用 VS Code 管理 Git</h1>
>>>>>>> feature/title
```

这不是 HTML 代码的一部分，而是 Git 插入的冲突标记。Git 需要我们决定这一行最后保留什么。

[![出现合并冲突后查看冲突标记和处理入口](https://img.yanxisishi.top/images/2026/10/vscode-git-20-merge-conflict-bca43f68e44c.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-20-merge-conflict-bca43f68e44c.png)

这个场景里：

- **当前更改（Current）**：当前所在的 `main` 的内容。
- **传入的更改（Incoming）**：准备合进来的 `feature/title` 的内容。

这是普通 merge 场景的对应关系。以后遇到 rebase，不要直接把 Current 理解成“我写的”，要重新看清界面标出的提交与分支。

普通文本编辑器中有 **采用当前更改、采用传入的更改、保留双方更改、比较变更** 等入口。

“保留双方”会同时保留两段文字，不会替我们判断业务逻辑。例如这里可能留下两个 `<h1>`，通常还需要手动整理。

### 9.2 使用三方合并编辑器

点击 **在合并编辑器中解决**。也可以从“合并更改”中打开冲突文件，某些版本会直接进入这个界面。

[![三方合并编辑器中的传入、当前和结果区域](https://img.yanxisishi.top/images/2026/10/vscode-git-21-three-way-merge-83b5e214f1ef.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-21-three-way-merge-83b5e214f1ef.png)

这次界面的上方两块分别显示 **传入** 和 **当前**，下方显示最终的 **结果**。布局可以调整，按区域标题认内容就可以。

本次决定使用功能分支的标题，点击 **接受 传入**，或点击传入区域顶部的 **接受所有传入更改**。如果两边都要保留，也可以继续编辑结果区域，写成自己想要的最终代码。

[![选择传入内容后检查结果并完成合并](https://img.yanxisishi.top/images/2026/10/vscode-git-22-merge-result-9d222e3d013d.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-22-merge-result-9d222e3d013d.png)

处理完所有冲突后，检查结果里只剩一个正确标题，点击 **完成合并**。

### 9.3 解决完冲突，还要完成合并提交

“完成合并”会保存结果，并把这个文件标记为已解决。在当前版本中，文件会进入暂存区，源代码管理中的 **继续** 按钮可以继续完成合并。

如果使用普通文本编辑器处理冲突，则要自己保存文件，再暂存它。检查项目中不再有 `<<<<<<<`、`=======` 和 `>>>>>>>` 这样的冲突标记后，填写说明并提交：

```text
合并 feature/title 并解决标题冲突
```

整个过程可以记成：

```text
看清两边内容 → 编辑最终结果 → 保存 → 标记解决 / 暂存 → 完成合并提交
```

后面在 Git Graph 里会看到两条历史线通过这个合并提交连起来。

如果发现合并选错了分支，且还没有完成提交，可以运行 `Git: Abort Merge` 放弃这次合并，再重新开始。不要通过删除 `.git` 解决冲突。

## 10. 临时离开当前任务：Stash

### 10.1 什么时候需要它

写了一半的内容还不适合提交，但又想切换分支处理另一件事，可以先把这些改动放进 **Stash**。

这里先在 `notes.md` 追加一句“分支练习还没整理完”，再新建一个 `draft.md`，写一点未完成的草稿。

打开命令面板，搜索 `Git: Stash`：

[![从命令面板选择包含未跟踪文件的 Stash](https://img.yanxisishi.top/images/2026/10/vscode-git-23-stash-commands-64751552808e.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-23-stash-commands-64751552808e.png)

| 操作 | 保存哪些内容 |
| --- | --- |
| `Git: Stash` | 已跟踪文件的未提交改动 |
| `Git: Stash (Include Untracked)` | 同时保存新建、尚未跟踪的文件 |
| `Git: Stash Staged` | 只保存已经暂存的改动 |

这次有新建的 `draft.md`，因此选择 **Stash (Include Untracked)**，说明写“临时保存笔记草稿”。被 `.gitignore` 忽略的日志不会因此一起保存。

保存成功后，这些改动会从当前工作区移走，源代码管理恢复干净，才继续切换分支处理其他任务。

### 10.2 恢复之前的草稿

回来后先确认自己位于希望恢复改动的分支，再运行 `Git: Pop Stash...`，选择刚才那条记录：

[![从 Stash 列表中选回临时保存的笔记草稿](https://img.yanxisishi.top/images/2026/10/vscode-git-24-pop-stash-dcab7473136f.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-24-pop-stash-dcab7473136f.png)

恢复后，`notes.md` 和 `draft.md` 会重新出现在更改列表中：

[![恢复 Stash 后，已修改的笔记和未跟踪的草稿重新出现](https://img.yanxisishi.top/images/2026/10/vscode-git-25-stash-restored-f7131467f0ca.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-25-stash-restored-f7131467f0ca.png)

两个恢复命令的区别：

- **Apply Stash**：恢复改动，保留这条 stash。
- **Pop Stash**：恢复成功后，移除这条 stash。

恢复时也可能冲突。如果 Pop 没能顺利完成，要先检查冲突和 stash 列表，不能假设它已经被删除。

完成草稿后，把这两个文件正常暂存并提交，说明写“补充笔记和草稿说明”。Stash 只是临时存放改动，重要进度还是用明确的提交记录下来。

## 11. 使用 Git Graph 看懂提交历史

### 11.1 安装和打开

点击左侧 **扩展**，搜索 `Git Graph`，确认发布者是 **mhutchie**，再安装。

[![扩展面板中的 Git Graph 和发布者信息](https://img.yanxisishi.top/images/2026/10/vscode-git-26-git-graph-extension-af9ca4e29c39.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-26-git-graph-extension-af9ca4e29c39.png)

截图中已经安装，所以显示的是管理、禁用或卸载等按钮。

打开方式有几种：

- 点击底部状态栏中的 **Git Graph**。
- 在源代码管理工具栏点击 Git Graph 图标。
- 打开命令面板，运行 **Git Graph: View Git Graph (git log)**。

Git Graph 是额外的扩展。VS Code 自带的源代码管理 **图表** 也能看历史，两者不是同一个入口。日常暂存和提交用自带界面就可以；这次用 Git Graph 重点观察分支关系和提交内容。

### 11.2 一张图里看哪些东西

[![Git Graph 展示提交、分支标签和合并关系](https://img.yanxisishi.top/images/2026/10/vscode-git-27-git-graph-history-13107f5dbd60.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-27-git-graph-history-13107f5dbd60.png)

| 图里的内容 | 含义 |
| --- | --- |
| 圆点 | 一条提交记录 |
| 圆点之间的线 | 提交与父提交之间的关系 |
| 提交说明 | 当时填写的消息，说明这个版本做了什么 |
| Author | 提交作者 |
| Commit | 提交编号，界面通常显示前几位 |
| `main`、`feature/title` 标签 | 这些分支当前指向的提交 |
| 当前分支的强调标记 | 当前检出的分支，和左下角分支名一起确认 |

Git Graph 的线条颜色用于帮助区分路径，和前面文件名上的绿色、黄色没有对应关系。不能把绿色的历史线理解成“新增代码”。

可以从下往上回看这个项目：初始化 → 调整页面 → 两个分支分别修改标题 → 解决冲突并合并 → 继续补充笔记。

这次普通合并产生了一条有 **两个父提交** 的合并记录，所以图里能看到两条线汇合。其他项目如果用了快进合并、squash 或 rebase，图形未必长成同样的样子。

### 11.3 点击提交，查看这一版改了哪些文件

点击“调整练习页面并添加笔记”这条提交，Git Graph 会展开说明、编号、父提交和文件列表：

[![展开 Git Graph 中一条提交的详细信息](https://img.yanxisishi.top/images/2026/10/vscode-git-28-commit-details-1ea43e85bd3a.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-28-commit-details-1ea43e85bd3a.png)

再点击其中的 `index.html`，会打开该版本的差异：

[![从 Git Graph 打开历史提交中的文件差异](https://img.yanxisishi.top/images/2026/10/vscode-git-29-history-diff-5a4c05ddabfb.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-29-history-diff-5a4c05ddabfb.png)

这适合排查“这个标题是什么时候改的”“这个文件为什么被删除了”。先找到提交，再看文件差异，比只盯着当前代码容易还原上下文。

### 11.4 右键菜单里的常用操作

在提交或分支标签上右键，可以看到相应的操作菜单：

[![Git Graph 中提交的右键菜单](https://img.yanxisishi.top/images/2026/10/vscode-git-30-git-graph-menu-d1ebcb4c5c29.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-30-git-graph-menu-d1ebcb4c5c29.png)

不同位置的菜单不同，常见操作包括：

| 操作 | 作用 |
| --- | --- |
| Create Branch | 从该提交建立分支 |
| Checkout Branch | 切换到所选分支 |
| Merge into current branch | 把所选分支合入当前分支 |
| Compare / 选中另一条提交比较 | 比较两个版本之间的变化 |
| Revert Commit | 新增一条提交，撤销所选提交带来的改动 |
| Cherry Pick Commit | 把所选提交的改动应用到当前分支 |
| Reset current branch to this Commit | 移动当前分支指针，具体是否保留改动取决于模式 |

刚开始可以先熟悉查看、比较、创建和切换分支。执行 Merge 或 Cherry Pick 前，确认当前分支；执行 Reset 前，先分清 soft、mixed、hard。

直接检出某条提交可能进入 **分离 HEAD** 状态。只是查看历史内容时可以使用；准备继续修改时，先在这个位置创建分支，把后续提交留在明确的分支上。

### 11.5 只看一个文件的历史：时间线

在资源管理器选中 `index.html`，展开下方 **时间线**，可以查看这个文件的提交记录和本地保存记录。

[![时间线中查看 index.html 的历史记录](https://img.yanxisishi.top/images/2026/10/vscode-git-31-file-timeline-9350724f200e.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-31-file-timeline-9350724f200e.png)

时间线里的 Git 记录来自仓库提交；本地历史记录来自编辑器的本地保存机制。两者来源不同，本地历史不能替代 Git 提交和远程备份。

## 12. 提交错了以后怎么撤销

### 12.1 撤销刚刚的本地提交

前面刚提交了“补充笔记和草稿说明”。假设发现说明或提交范围不合适，还没有推送，可以打开命令面板，运行：

```text
Git: Undo Last Commit
```

也可以在源代码管理的更多操作菜单里寻找“撤销上次提交”。

[![撤销最近一次提交后，文件变化回到暂存区](https://img.yanxisishi.top/images/2026/10/vscode-git-32-undo-last-commit-54fdd53717a9.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-32-undo-last-commit-54fdd53717a9.png)

在本次练习中，最近那条提交从当前分支顶端移走，文件改动回到 **暂存的更改**，文件内容仍然保留。随后可以取消某些文件的暂存、继续修改、重新填写说明，再提交一次。

这次确认内容正确后，重新提交“补充笔记和草稿说明”，让仓库回到干净状态。

### 12.2 已经推送的提交优先用 Revert

如果别人已经基于你的提交继续工作，通常用 **Revert Commit** 添加一条新的撤销记录，让历史继续向前。

可以在 Git Graph 中找到普通提交，右键选择 **Revert Commit**，再检查撤销后的差异并按提示完成。撤销也可能遇到冲突；合并提交还涉及选择主线，不要直接拿它当第一次 Revert 练习对象。

| 想做的事 | 对应入口 |
| --- | --- |
| 这次不想提交某个改动 | 暂存区文件右侧 `-` |
| 不要某个工作区修改 | 更改中文件右侧“放弃更改” |
| 撤销最近一个尚未推送的本地提交 | Undo Last Commit |
| 用新的记录抵消一个已经共享的普通提交 | Revert Commit |
| 把分支指针移动到旧位置 | Reset，先判断模式和共享情况 |

不要把这些都混成一个“回滚”按钮。

## 13. 已有远程仓库时，怎么同步

### 13.1 先知道自己有没有远程仓库

前面的 `work` 是本地练习仓库，所以会看到 **发布 Branch** 等提示。这不是提交失败，而是当前分支还没有发布到远程。

如果打开的是从 GitHub 克隆下来的项目，一般已经配置了 `origin`。也可以在终端查看：

```bash
git remote -v
```

如果手里已经有一个仓库的 HTTPS 或 SSH 地址，可以打开命令面板运行 **Git: Clone**，粘贴地址，选择保存仓库的父目录。克隆完成后，按提示打开新文件夹，源代码管理就会接管它。这个流程相当于 `git clone`，和在空目录中“初始化仓库”是两种不同的起点。

已有远程地址时，可从命令面板运行 `Git: Add Remote...`，输入地址并命名为 `origin`；“发布分支”则用于建立远程分支及其跟踪关系。新建 GitHub 仓库、复制 HTTPS/SSH 地址和登录认证放到 GitHub 那篇继续记录。

### 13.2 Fetch、Pull、Push 和同步更改

在源代码管理右上角的 **更多操作 `...`** 中，可以找到拉取、推送及远程相关操作。命令面板也能直接搜索：

[![命令面板中可查找抓取、拉取和推送等远程操作](https://img.yanxisishi.top/images/2026/10/vscode-git-33-remote-commands-7dae6adc991d.png)](https://img.yanxisishi.top/images/2026/10/vscode-git-33-remote-commands-7dae6adc991d.png)

| 操作 | 作用 |
| --- | --- |
| Fetch / 抓取 | 更新远程跟踪信息，方便先查看服务器上的变化；不会直接把它合入当前工作区 |
| Pull / 拉取 | 抓取后把远程变化整合进当前分支，具体用 merge 还是 rebase 取决于配置或所选操作 |
| Push / 推送 | 把本地提交发送到远程仓库 |
| Sync Changes / 同步更改 | VS Code 先拉取，再推送；不是单独的“上传” |

如果拉取出现冲突，先完成冲突处理，再继续同步。推送被拒绝时，先看提示、抓取远程并检查双方提交，通常需要先整合远程的新提交。

状态栏可能显示 `↓`、`↑` 和数字，分别提示相对上游的传入、传出提交数量。比如 `↓2 ↑1` 表示当前显示的信息中有两个传入提交、一个待推送提交；这些数字依赖最近一次抓取，未抓取时不保证是服务器最新状态。

这里先学会找到入口和分清动作，远程实操在下一篇结合 GitHub 仓库继续做。
