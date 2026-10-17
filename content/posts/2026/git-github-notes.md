---
title: Git + GitHub 学习笔记
description: 刷到了一个不错的 Git 学习视频，正好做一份笔记系统地记录下 Git 相关知识。
date: 2026-10-12 13:38:22
updated: 2026-10-17 14:42:22
image: 
categories: [技术]
tags: [Git, GitHub, 学习笔记]
---

**原视频链接：**[马克的技术工作坊《一个视频学会 Git + GitHub》](https://www.douyin.com/video/7692381361302179072)，视频一共 1 小时 49 分 36 秒。

## 1. Git 和 GitHub

+ Git 是安装在电脑上的版本管理软件。项目做到一个阶段，就可以留下一个版本；后续改坏了，可以恢复之前保存的状态。

+ GitHub 是网站，可以接收项目代码及其版本记录，还能用来分享源码和开展协作。

因此，保存一个本地版本和上传到 GitHub 是两个动作。先理解本地版本如何形成，后面才容易理解上传的到底是什么。

![Git 与 GitHub 的分工](https://img.yanxisishi.top/images/2026/10/git-github-01-git-github-faec80f86b.jpg)

## 2. 安装 Git

Windows 从 Git 网站下载安装程序，按安装向导完成后打开 Git Bash。在终端用一个命令检查：

```bash
git --version
```

实际运行：

```console
$ git --version
git version 2.51.2.windows.1
```

能输出版本号就说明 Git 已经可以运行了，再继续后面的操作。让 AI 帮忙安装也是一样，最后自己检查一下。

## 3. 初始化仓库和第一次提交

### 3.1 先让 Git 管理项目

这里用一个简单的待办网页 `yanxisishi-todo` 作为例子，最初只有两个文件：`index.html` 保存待办页面代码，`README.md` 保存项目说明。它们都是可以用文本编辑器修改的文件。

项目文件先在编辑器里修改并保存，再执行 Git 命令。

下面把示例项目所在目录统一写作 `~/git-demo`。终端结果来自临时仓库的实际运行；自己练习时，提交编号、时间和改动行数会有所不同。

先进入项目目录，再初始化仓库：

```bash
cd ~/git-demo/yanxisishi-todo
git init
git status
```

实际运行：

```console
$ cd ~/git-demo/yanxisishi-todo

$ git init
Initialized empty Git repository in ~/git-demo/yanxisishi-todo/.git/

$ git status
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	README.md
	index.html

nothing added to commit but untracked files present (use "git add" to track)
```

`cd` 用来切换目录；`git init` 在当前项目中创建 `.git` 目录，准备版本管理所需的数据；`git status` 查看仓库当前状态。

本文示例主分支为 `master`。如果你的 `git status` 显示 `main`，后续命令里的 `master` 都相应替换为 `main`。

刚初始化时，“空仓库”意味着还没有提交记录，不代表 `.git` 目录里什么文件都没有。示例中两个项目文件会出现在 `Untracked files` 下：Git 看到了它们，但还没有开始跟踪其内容。

### 3.2 三个位置分别负责什么

| 位置 | 作用 | 与下一个位置的关系 |
| --- | --- | --- |
| 工作区 | 实际打开、编辑的项目文件 | 用 `git add` 选择要暂存的内容 |
| 暂存区 | 为下一次提交准备的内容 | 用 `git commit` 形成一次提交 |
| 提交历史 | 已保存的版本记录 | 后续可以查看、比较或恢复 |

保存下来的一个版本叫 **commit**，也就是“提交”。后面说的提交历史，就是这些 commit 组成的记录。

暂存区的作用是选择“这一次到底提交什么”。例如，先只保存已经可用的 `index.html`，把尚未写完的 `README.md` 留在工作区。项目变大之后，也可以逐步挑出同一个功能涉及的 HTML、JavaScript 和 CSS，准备好再一起提交。

![工作区、暂存区和提交历史](https://img.yanxisishi.top/images/2026/10/git-github-02-three-areas-c41550bef1.jpg)

### 3.3 设置提交人的信息

第一次提交前，先设置提交人的名字和邮箱：

```bash
git config --global user.name "yanxisishi"
git config --global user.email "yanxisishi@gmail.com"
```

实际运行：

```console
$ git config --global user.name "yanxisishi"

$ git config --global user.email "yanxisishi@gmail.com"
```

这两个配置会写进提交记录，用来说明是谁提交的。`--global` 表示这台电脑上的其他项目也使用这份配置。

注意：这一步只是设置提交信息，和登录 GitHub 是两回事。

### 3.4 暂存并提交页面

```bash
git add index.html
git status
git commit -m "添加待办页面"
git log
```

实际运行：

```console
$ git add index.html

$ git status
On branch master

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   index.html

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	README.md

$ git commit -m "添加待办页面"
[master (root-commit) c380c36] 添加待办页面
 1 file changed, 58 insertions(+)
 create mode 100644 index.html

$ git log
commit c380c368fead5136eff3db9d67f73a58251d8bd9 (HEAD -> master)
Author: yanxisishi <yanxisishi@gmail.com>
Date:   Tue Oct 13 17:15:13 2026 +0800

    添加待办页面
```

`git add index.html` 之后，文件会进入 `Changes to be committed`，表示已经准备提交。`git commit` 根据暂存区形成一次提交；`-m` 后面写这次修改的说明，方便以后回看。

`git log` 可以看到提交编号、提交人、时间和说明，看完按 `q` 退出。再次运行 `git status`，已经与保存状态一致的 `index.html` 不再出现在改动列表中；尚未跟踪的 `README.md` 仍会被列出。

### 3.5 再保存一次项目说明

补完 `README.md` 的后续计划后，再走一遍流程：

```bash
git add README.md
git commit -m "添加项目说明"
git log
```

实际运行：

```console
$ git add README.md

$ git commit -m "添加项目说明"
[master 833ad39] 添加项目说明
 1 file changed, 5 insertions(+)
 create mode 100644 README.md

$ git log
commit 833ad395129cecb15c479981eca649c3248b1d4b (HEAD -> master)
Author: yanxisishi <yanxisishi@gmail.com>
Date:   Tue Oct 13 17:15:16 2026 +0800

    添加项目说明

commit c380c368fead5136eff3db9d67f73a58251d8bd9
Author: yanxisishi <yanxisishi@gmail.com>
Date:   Tue Oct 13 17:15:13 2026 +0800

    添加待办页面
```

这样历史里就有两个版本了。之后的操作也是这个节奏：完成一部分内容，暂存相关文件，写清说明，再提交。

**记一下：** 编辑器中的“保存文件”改变工作区；`git add` 准备下一次提交；`git commit` 才留下一个可供后续回看的版本记录。

## 4. 回滚与撤销

### 4.1 回滚前：先判断改动处于哪个阶段

同样是把待办页面改成深色，可能处在三个阶段：只修改了文件，已经执行 `git add`，或者已经执行 `git commit`。三个阶段对应不同的处理方式。

![回滚的三个场景](https://img.yanxisishi.top/images/2026/10/git-github-03-three-rollbacks-d0da725ede.jpg)

| 当前状态 | 处理方式 |
| --- | --- |
| 只在工作区 | `git restore` 恢复文件 |
| 已经暂存，但没有提交 | 先 `git restore --staged` 取消暂存；若还要丢弃改动，再 `git restore` |
| 已经提交成 commit | 用 `git reset` 回到指定位置，或用 `git revert` 追加一个撤销提交 |

所以回滚前先跑一次 `git status`，看清改动在哪一步，再选命令。不然几个“撤销”放在一起很容易混。

### 4.2 尚未暂存：撤销工作区修改

假设把页面改成深色并保存，但还没有执行 `git add`。此时 `git status` 把 `index.html` 列在 `Changes not staged for commit` 下。

想先看改了什么，用：

```bash
git status
git diff
```

实际运行：

```console
$ git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")

$ git diff
diff --git a/index.html b/index.html
index b8a5406..72cd078 100644
--- a/index.html
+++ b/index.html
@@ -5,8 +5,8 @@
 <title>yanxisishi 待办</title>
 <style>
 body {
-    background: #ffffff;
-    color: #222222;
+    background: #202020;
+    color: #eeeeee;
 }
 .completed .due-date { text-decoration: line-through; }
 .completed .task-text { text-decoration: line-through; }
```

这里会显示背景和文字颜色的变化：带减号的部分是被替换的内容，带加号的部分是加入的内容。确认不想要这些改动后，恢复文件：

```bash
git restore index.html
git status
```

实际运行：

```console
$ git restore index.html

$ git status
On branch master
nothing to commit, working tree clean
```

页面回到原来的浅色样式，状态变为 `working tree clean`。这里的 `working tree` 可以理解为工作区。

查看差异时，可以用 `j` 向下一行、`k` 向上一行、`f` 向下一页、`b` 向上一页，按 `q` 退出。

恢复多个文件可以用 `git restore index.html README.md`，恢复当前目录范围内的修改可以用 `git restore .`，两种写法按需选择，成功时通常没有输出。

在这个例子里，暂存区没有新的改动，因此恢复后与最近保存的提交一致。`restore` 会改变工作区文件内容，执行前要确定这些未提交修改确实不再需要。

### 4.3 已暂存未提交：取消暂存

再次把页面改成深色并保存，执行 `git add index.html` 后，改动进入暂存区。要取消暂存，执行：

```bash
git restore --staged index.html
git status
```

实际运行：

```console
$ git restore --staged index.html

$ git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

取消当前目录范围内的暂存内容可以用点号，与上面的单文件写法按需选择：

```bash
git restore --staged .
git status
```

实际运行：

```console
$ git restore --staged .

$ git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

执行后，文件从“准备提交”变回“修改尚未暂存”。**页面还是深色的**，因为取消暂存没有把工作区的修改一起丢掉。

如果目标是彻底放弃这次深色主题修改，还需要再执行：

```bash
git restore index.html
git status
```

实际运行：

```console
$ git restore index.html

$ git status
On branch master
nothing to commit, working tree clean
```

两步的作用可以这样区分：

| 命令 | 改变什么 | 工作区中的修改还在吗 |
| --- | --- | --- |
| `git restore --staged index.html` | 取消该文件的暂存 | 在 |
| `git restore index.html` | 恢复工作区文件 | 相应修改被覆盖 |

如果只是选错了本次提交的内容，做到取消暂存这一步即可；如果连修改本身也不要，才继续恢复工作区。

### 4.4 已经提交：reset 回退与 revert 撤销

#### 4.4.1 HEAD 表示当前位置

以下 `reset` 和 `revert` 示例都从“深色主题已经提交”的状态单独演示，互为不同处理方式。

如果深色主题已经提交成一个 commit，就要处理提交历史了。查看日志时，最新提交旁边可以看到 `HEAD`。

在这段直线提交历史中：`HEAD` 是当前提交，`HEAD~1` 是前一个，`HEAD~2` 再往前一个。目标也可以通过提交编号指定。

![HEAD 与前面的提交](https://img.yanxisishi.top/images/2026/10/git-github-04-head-4a38d32f88.jpg)

#### 4.4.2 reset：把当前分支退回指定位置

例如，退回前一个提交，并让文件也一起恢复：

```bash
git reset --hard HEAD~1
git status
```

实际运行：

```console
$ git reset --hard HEAD~1
HEAD is now at 833ad39 添加项目说明

$ git status
On branch master
nothing to commit, working tree clean
```

执行后，当前分支回到深色主题之前的提交，工作区页面也恢复为浅色。这次操作同时改变了当前提交位置、暂存区和工作区。

`reset` 有三种模式，区别主要在暂存区和工作区是否一起恢复：

| 模式 | 当前分支指向的提交 | 暂存区 | 工作区 |
| --- | --- | --- | --- |
| `--hard` | 回到目标提交 | 恢复为目标状态 | 恢复为目标状态 |
| `--mixed` | 回到目标提交 | 恢复为目标状态 | 保留原有内容 |
| `--soft` | 回到目标提交 | 保留原有内容 | 保留原有内容 |

![reset 三种模式](https://img.yanxisishi.top/images/2026/10/git-github-05-reset-modes-1e0f26a014.jpg)

下面比较另外两种模式，同样从深色主题已提交的状态开始：

```bash
git reset --mixed HEAD~1
git status
```

这段从“深色主题已经提交”的状态单独执行，用来比较 reset 模式。

实际运行：

```console
$ git reset --mixed HEAD~1
Unstaged changes after reset:
M	index.html

$ git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

```bash
git reset --soft HEAD~1
git status
```

这段从“深色主题已经提交”的状态单独执行，用来比较 reset 模式。

实际运行：

```console
$ git reset --soft HEAD~1

$ git status
On branch master
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   index.html
```

这三条是不同选择。`--hard` 会覆盖相应的工作区内容；如果还想保留修改，只调整提交状态，就需要考虑另外两种模式。

另外记住两点：`--mixed` 是默认模式；如果刚提交完就发现需要修改后重新提交，`--mixed` 或 `--soft` 可以撤回提交位置，同时留下修改继续处理。使用 `--hard` 前，先通过 `git status` 检查其他尚未提交的改动，因为它们也可能被覆盖。

#### 4.4.3 revert：保留原来的记录，再添加一次撤销

`revert` 的做法是：原来的深色主题提交还留在历史中，另外增加一个反向修改，让页面重新变成浅色。

```bash
git revert HEAD
git log --oneline
```

下面保留默认撤销说明，完成编辑器的保存退出步骤后得到实际返回。

实际运行：

```console
$ git revert HEAD
[master 042d150] Revert "添加深色主题"
 Date: Tue Oct 13 17:15:52 2026 +0800
 1 file changed, 2 insertions(+), 2 deletions(-)

$ git log --oneline
042d150 (HEAD -> master) Revert "添加深色主题"
af6433b 添加深色主题
833ad39 添加项目说明
c380c36 添加待办页面
```

![revert 增加一条提交](https://img.yanxisishi.top/images/2026/10/git-github-06-revert-ee498164d1.jpg)

*原视频 00:41:00：保留深色主题的提交，通过后续的新提交抵消其效果。*

执行后可能打开提交说明编辑器，里面已经写好要撤销哪一次提交。如果打开的是 Vim，可以保留默认说明，按 `Esc`，输入 `:wq` 并回车，保存退出。再看 `git log`，可以看到新增的 `Revert ...` 记录；原来的深色主题记录仍然存在。

**两者的关键区别：** `reset` 改变当前分支指向的历史位置；`revert` 在现有历史后面增加一条提交。不要仅凭页面都变回浅色，就把它们当作相同的操作。

## 5. 用 .gitignore 忽略文件

假设项目里有一个只记私人笔记的 `notes.txt`，不准备提交，它会出现在 `Untracked files` 下。

解决方法是在项目中创建 `.gitignore`，把要忽略的文件写进去。例如：

```gitignore
notes.txt
.DS_Store
```

保存后再看状态，`notes.txt` 不再出现；新建的 `.gitignore` 自己仍会出现。`.gitignore` 本身也要提交，让忽略规则跟着项目一起保存：

```bash
git add .gitignore
git commit -m "添加 .gitignore"
git status
```

实际运行：

```console
$ git add .gitignore

$ git commit -m "添加 .gitignore"
[master 924fc03] 添加 .gitignore
 1 file changed, 2 insertions(+)
 create mode 100644 .gitignore

$ git status
On branch master
nothing to commit, working tree clean
```

这一段针对的是尚未被跟踪的文件：笔记仍在本地，只是不再被反复提示为待处理的新文件。

## 6. 创建和切换分支

### 6.1 为什么要开分支

待办项目接下来要增加截止日期、保存截止时间、标记过期事项。这些改动可能需要好几次提交才能完成。如果全部直接放进主分支，主分支在开发途中就可能处于功能不完整的状态。 

可以把分支理解为一条提交路线：稳定的 `master` 暂时留在原处，截止日期功能沿自己的路线增加提交；功能完成后，再合回主分支。

图中的分支名还可以理解为一个指向提交位置的标记。在某条分支上提交新版本后，那个分支名会跟着移到新位置；刚创建分支时，新旧分支指向同一次提交，所以文件不会立即出现变化。

![分支隔离未完成的功能](https://img.yanxisishi.top/images/2026/10/git-github-07-branch-2c8f77839a.jpg)

### 6.2 创建、查看和切换分支

从主分支创建截止日期功能分支。下面几种写法选一种即可，先看创建后再切换：

```bash
git branch feature/due-date
git branch
git switch feature/due-date
git branch
```

实际运行：

```console
$ git branch feature/due-date

$ git branch
  feature/due-date
* master

$ git switch feature/due-date
Switched to branch 'feature/due-date'

$ git branch
* feature/due-date
  master
```

`git branch` 不带分支名时列出分支，星号表示当前所在的分支。创建分支本身没有自动切换过去。

也可以一步完成创建与切换：

```bash
git switch -c feature/due-date
```

实际运行：

```console
$ git switch -c feature/due-date
Switched to a new branch 'feature/due-date'
```

常见的旧写法是：

```bash
git checkout -b feature/due-date
```

实际运行：

```console
$ git checkout -b feature/due-date
Switched to a new branch 'feature/due-date'
```

这里的 `feature/` 是分支命名习惯，用来表明这是一个功能分支。分支名可以自行选择。

### 6.3 分支里的日常操作依然是 add 和 commit

在 `feature/due-date` 上修改页面，依次完成截止日期输入、保存逻辑和过期提醒，每个阶段用 `git add`、`git commit` 保存。查看提交历史：

```bash
git log --oneline
```

实际运行：

```console
$ git log --oneline
d9b8f28 (HEAD -> feature/due-date) 添加过期提醒
061b6d3 保存截止日期
8c63d15 添加截止日期输入
924fc03 (master) 添加 .gitignore
042d150 Revert "添加深色主题"
af6433b 添加深色主题
833ad39 添加项目说明
c380c36 添加待办页面
```

切回主分支：

```bash
git switch master
```

实际运行：

```console
$ git switch master
Switched to branch 'master'
```

再次打开页面，会回到主分支原有的内容；功能分支的新增提交仍留在功能分支。分支解决的就是“新功能还没完成，但稳定版本仍要能用”的问题。

## 7. 合并分支

截止日期功能完成后，切回主分支，再合并：

```bash
git switch master
git merge feature/due-date
git log --oneline
```

实际运行：

```console
$ git switch master
Already on 'master'

$ git merge feature/due-date
Updating 924fc03..d9b8f28
Fast-forward
 index.html | 9 +++++++--
 1 file changed, 7 insertions(+), 2 deletions(-)

$ git log --oneline
d9b8f28 (HEAD -> master, feature/due-date) 添加过期提醒
061b6d3 保存截止日期
8c63d15 添加截止日期输入
924fc03 添加 .gitignore
042d150 Revert "添加深色主题"
af6433b 添加深色主题
833ad39 添加项目说明
c380c36 添加待办页面
```

这里的方向很关键：**当前所在的 `master` 接收 `feature/due-date` 的改动。** 合并完成后，查看页面可以看到截止日期功能；查看日志，两个分支名可以指向同一个最新提交。

功能合并完成后，可以删除不再需要的分支：

```bash
git branch -d feature/due-date
```

实际运行：

```console
$ git branch -d feature/due-date
Deleted branch feature/due-date (was d9b8f28).
```

这一步清理的是分支名，已合入主分支的功能和提交仍然在。

这里有两种合并情况：

| 合并前的历史关系 | 合并结果 |
| --- | --- |
| 主分支还停在功能分支出发的位置，功能分支已经向前推进 | 可以直接把主分支向前移动，称为 Fast-forward，快进合并 |
| 两条路线各自增加了提交 | 需要汇合两边的历史，可能产生一个新的合并提交 |

不要用“有没有冲突”来判断是不是快进合并。快进说的是提交历史能否直接向前移动；冲突说的是具体代码能否自动整合。下面的例子刚好同时展示了历史分叉与代码冲突。

分叉后的合并需要一个新的合并提交。没有冲突时，Git 可以自动完成；下一节的例子因为冲突而停下，需要先处理文件，再手动执行 `git commit` 完成合并。

## 8. 解决合并冲突

### 8.1 冲突是怎么出现的

以两个从同一版本开始开发的功能为例：

| 分支 | 要做的功能 |
| --- | --- |
| `feature/sort` | 新增排序按钮，按截止日期排序，并支持反向排序 |
| `feature/complete-all` | 新增全部完成按钮，实现逻辑并根据状态禁用按钮 |

接着第 7 节的状态，先从 `master` 创建 `feature/sort`，完成排序功能并提交；再切回 `master` 创建 `feature/complete-all`，完成全部完成功能并提交。两条分支从同一个版本分别开发，再依次合并。

先把排序分支合入 `master`，没有问题。再合并全部完成分支时，双方都在页面上“添加按钮”的附近修改了代码，Git 无法确定应该留下哪一边，于是提示 `CONFLICT`。

```bash
git switch master
git merge feature/sort
git merge feature/complete-all
git status
```

实际运行：

```console
$ git switch master
Switched to branch 'master'

$ git merge feature/sort
Updating d9b8f28..81ec281
Fast-forward
 index.html | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git merge feature/complete-all
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.

$ git status
On branch master
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

这里表示先合并排序，再合并全部完成。出现冲突后先停下来处理，再继续提交。

### 8.2 看懂冲突标记

打开发生冲突的 `index.html`，会看到冲突标记。省略具体 HTML 后，结构可以简化看成：

```text
<<<<<<< HEAD
当前分支中的排序按钮代码
=======
待合入分支中的全部完成按钮代码
>>>>>>> feature/complete-all
```

`<<<<<<< HEAD` 到 `=======` 是当前分支的内容；分隔线之后到 `>>>>>>>` 是另一边的内容。

![HTML 中的冲突标记](https://img.yanxisishi.top/images/2026/10/git-github-08-conflict-a4c4a53587.jpg)

这个例子需要同时保留两个功能，因此留下排序和全部完成的按钮代码及对应逻辑，再删除 `<<<<<<<`、`=======`、`>>>>>>>` 这些标记。处理冲突就是把文件编辑成最终想要的样子，而不是机械地选择“只要上半段”或“只要下半段”。

### 8.3 修改文件并告诉 Git 已处理

确认冲突文件已保存，再暂存并完成合并。`git commit` 如果打开提交说明编辑器，可以保留默认的合并说明并保存退出；使用 Vim 时仍是按 `Esc`，输入 `:wq` 并回车。

```bash
git add index.html
git commit
git status
```

实际运行：

```console
$ git add index.html

$ git commit
[master 79cee29] Merge branch 'feature/complete-all'

$ git status
On branch master
nothing to commit, working tree clean
```

`git add` 把处理好的文件标为已解决；随后完成合并提交。完成后再打开页面，检查排序和全部完成功能是否都能使用。

这一段可以按三个动作记：**读冲突 → 编辑出最终内容 → 暂存并完成合并。** 终端的 `git status` 也会提示后续要执行的步骤。

## 9. Rebase 变基

### 9.1 为什么要移动“地基”

**本节单独演示：从排序已合入 `master`、全部完成分支尚未合并的状态开始。**

还是用排序和全部完成的例子：全部完成分支开始开发时，主分支还没有排序功能；后来排序功能已经进入主分支，全部完成分支依然从较早的位置出发。

Rebase 理解为“更换地基”：把功能分支上的那几个提交，重新接到主分支较新的位置上。

下图虚线是原来的位置，实线是换到新基础之后的位置。

![Rebase 更换基础提交](https://img.yanxisishi.top/images/2026/10/git-github-10-rebase-b85028a209.jpg)

### 9.2 在功能分支上执行 rebase

假设全部完成分支还没有合入主分支，现在想先让它跟上主分支的进度：

```bash
git switch feature/complete-all
git rebase master
```

实际运行：

```console
$ git switch feature/complete-all
Switched to branch 'feature/complete-all'

$ git rebase master
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Rebasing (1/1)
error: could not apply 6ad871b... 添加全部完成按钮和逻辑
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
hint: You can instead skip this commit: run "git rebase --skip".
hint: To abort and get back to the state before "git rebase", run "git rebase --abort".
hint: Disable this message with "git config set advice.mergeConflict false"
Could not apply 6ad871b... # 添加全部完成按钮和逻辑
```

这表示当前功能分支以 `master` 为新的基础。它与前面的 `git merge` 方向不同：合并时先站在主分支上接收功能；变基时先站在功能分支上调整自己的基础。

图上看起来像把整条分支挪过去，实际过程是：Git 会把功能分支上的提交逐个在新基础上重新应用。因此，一次变基可能在其中某一次提交处暂停，解决后再继续处理剩余提交。

### 9.3 变基时遇到冲突

如果两个按钮的位置依然冲突，就编辑 `index.html`，保留需要的代码，删除冲突标记并保存。这里冲突标记中的 `HEAD` 对应新的基础，也就是已经包含排序功能的主分支；另一边是正在重新应用的全部完成提交。处理完后执行：

```bash
git add index.html
git rebase --continue
git status
```

实际运行：

```console
$ git add index.html

$ git rebase --continue
[detached HEAD c939f76] 添加全部完成按钮和逻辑
 1 file changed, 3 insertions(+), 1 deletion(-)
Successfully rebased and updated refs/heads/feature/complete-all.

$ git status
On branch feature/complete-all
nothing to commit, working tree clean
```

这里接的是 `git rebase --continue`，不是前面合并冲突时的 `git commit`。如果打开提交说明编辑器，保留原说明并保存退出；如果还有冲突，就继续按提示处理。

完成后，再回主分支合并：

```bash
git switch master
git merge feature/complete-all
```

实际运行：

```console
$ git switch master
Switched to branch 'master'

$ git merge feature/complete-all
Updating 81ec281..c939f76
Fast-forward
 index.html | 4 +++-
 1 file changed, 3 insertions(+), 1 deletion(-)
```

![继续变基后再快进合并](https://img.yanxisishi.top/images/2026/10/git-github-11-rebase-continue-7245290715.jpg)

变基完成后，功能分支已接到主分支后面，因此主分支能够直接向前移动。

**记一下：** Rebase 没有让冲突自动消失；它把“在较新基础上整合功能”的工作提前放到功能分支上完成。

功能开发时间较长时，可以及时跟进主分支的新进展，让不兼容和冲突尽早暴露，同时把尚未完成的功能继续留在自己的分支上。

## 10. Stash 暂存未完成的工作

### 10.1 问题出在尚未提交的改动

从 `master` 创建 `feature/clear-completed` 开发清空已完成功能。按钮已经提交，后续逻辑写到一半、尚未提交时，需要临时修复“截止日期被加上删除线”的样式问题。

这时切回主分支，Git 可能提示本地修改会被覆盖。逻辑还没写完，又不想为了临时切换就正式提交，可以先用 Stash 收起来：

```bash
git stash
git status
```

实际运行：

```console
$ git stash
Saved working directory and index state WIP on feature/clear-completed: 50287b5 添加清空已完成按钮

$ git status
On branch feature/clear-completed
nothing to commit, working tree clean
```

![Stash 临时存放改动](https://img.yanxisishi.top/images/2026/10/git-github-12-stash-e6c419a8ba.jpg)

Stash 可以理解为一个临时存放未完成工作的地方。本例收起已跟踪文件的修改后，工作区恢复干净，就可以转去处理临时任务。普通 `git stash` 不包含新建且尚未跟踪的文件。

返回信息里有两个词：`index` 指暂存区，`WIP` 是 Work in Progress，即正在进行中的工作。这一例子主要画了工作区的改动，但 Stash 也会处理已跟踪文件在暂存区里的未提交改动。

### 10.2 修完问题，再回原分支取回

切回 `master`，创建 `hotfix/due-strikethrough` 修复截止日期的删除线样式，提交并合入主分支。修完后，回到原来的功能分支取回改动：

```bash
git switch feature/clear-completed
git stash pop
```

实际运行：

```console
$ git switch feature/clear-completed
Switched to branch 'feature/clear-completed'

$ git stash pop
On branch feature/clear-completed
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
Dropped refs/stash@{0} (e4798bff72200c62548f80e2f6030d15aefdf8eb)
```

取回后继续完成清空逻辑，再暂存、提交并合回主分支。

这一段的完整节奏是：**临时收起 → 切换处理急事 → 回来取回 → 继续原来的开发。** 如果要长期并行维护多个任务，反复收起和取出就不那么方便，下一节的 Worktree 更适合这个场景。

## 11. Worktree 多目录开发

### 11.1 和 Stash 解决的问题有什么不同

从 `master` 创建 `feature/export`，导出按钮已提交、逻辑还没写完时，又需要开发统计功能。这次另开一个工作目录，原目录继续保留导出的开发状态。

| 方式 | 适合的场景 |
| --- | --- |
| Stash | 临时中断一下，过一会儿回来接着做 |
| Worktree | 多个任务各有自己的目录，可以并行推进 |

![多个工作区，共享提交历史](https://img.yanxisishi.top/images/2026/10/git-github-13-worktree-6a7586f1c9.jpg)

这也解释了它和复制项目目录的区别：Worktree 让多个目录仍属于同一个仓库，不会因为多开了目录，就变成彼此独立的版本历史。

### 11.2 创建统计功能的工作目录

命令拆成“新分支、目录、起点”来看：

```bash
git worktree add -b feature/stats "../yanxisishi-todo-stats" master
```

实际运行：

```console
$ git worktree add -b feature/stats "../yanxisishi-todo-stats" master
Preparing worktree (new branch 'feature/stats')
HEAD is now at 58d0f01 Merge branch 'feature/clear-completed'
```

| 部分 | 作用 |
| --- | --- |
| `git worktree add` | 新建一个工作目录 |
| `-b feature/stats` | 同时创建统计功能分支 |
| `"../yanxisishi-todo-stats"` | 指定新目录的位置 |
| `master` | 从主分支当前的提交出发 |

这里的统计目录与 `yanxisishi-todo` 是同级目录。原目录继续保留导出功能的开发状态，新目录单独做统计功能。

![Worktree 命令的组成](https://img.yanxisishi.top/images/2026/10/git-github-14-worktree-command-1cd97ec75b.jpg)

先在原目录列出当前工作目录，再进入统计目录查看分支：

```bash
git worktree list
cd "../yanxisishi-todo-stats"
git branch
```

实际运行：

```console
$ git worktree list
~/git-demo/yanxisishi-todo        ead87c5 [feature/export]
~/git-demo/yanxisishi-todo-stats  58d0f01 [feature/stats]

$ cd "../yanxisishi-todo-stats"

$ git branch
  feature/complete-all
+ feature/export
  feature/sort
* feature/stats
  master
```

如果其他项目中的中文路径显示成转义形式，可以设置：

```bash
git config --global core.quotepath false
```

实际运行：

```console
$ git config --global core.quotepath false
```

这一步改变路径的显示方式，不是在移动或重命名目录。

在统计目录运行 `git branch` 时，星号标出当前分支，而导出分支前面的加号表示它正在另一个 Worktree 中使用。

### 11.3 在新目录提交，原目录也能看到历史

在统计目录修改 `index.html`，添加待办总数和已完成数的显示，保存后提交：

```bash
git add index.html
git commit -m "显示待办统计"
```

实际运行：

```console
$ git add index.html

$ git commit -m "显示待办统计"
[feature/stats 66f6e24] 显示待办统计
 1 file changed, 1 insertion(+), 1 deletion(-)
```

统计功能完成后，在统计目录里切回 `master`，合并统计分支，再删除用完的分支：

```bash
git switch master
git merge feature/stats
git branch -d feature/stats
```

实际运行：

```console
$ git switch master
Switched to branch 'master'

$ git merge feature/stats
Updating 58d0f01..66f6e24
Fast-forward
 index.html | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git branch -d feature/stats
Deleted branch feature/stats (was 66f6e24).
```

原目录中的导出开发还留在原处。明确切回原目录，再查看 `master` 的日志，也能看到刚才在另一个目录完成的统计提交：

```bash
cd "../yanxisishi-todo"
git log master --oneline
```

实际运行：

```console
$ cd "../yanxisishi-todo"

$ git log master --oneline
66f6e24 (master) 显示待办统计
58d0f01 Merge branch 'feature/clear-completed'
85ffbc3 完成清空已完成逻辑
24bce6a 修复截止日期删除线
50287b5 添加清空已完成按钮
c939f76 (feature/complete-all) 添加全部完成按钮和逻辑
81ec281 (feature/sort) 添加排序按钮和逻辑
d9b8f28 添加过期提醒
061b6d3 保存截止日期
8c63d15 添加截止日期输入
924fc03 添加 .gitignore
042d150 Revert "添加深色主题"
af6433b 添加深色主题
833ad39 添加项目说明
c380c36 添加待办页面
```

### 11.4 完成后清理临时工作目录

统计功能已提交，回到原目录后移除统计工作目录：

```bash
git worktree remove "../yanxisishi-todo-stats"
git worktree list
```

实际运行：

```console
$ git worktree remove "../yanxisishi-todo-stats"

$ git worktree list
~/git-demo/yanxisishi-todo  ead87c5 [feature/export]
```

临时目录被移除后，已经写入共用仓库的提交仍然能查到。删除工作目录和删除提交历史，是两件不同的事。

这里用 `git worktree remove` 清理，因为 Git 还保存着这个工作目录的相关记录。它同时处理目录和记录；直接把文件夹扔进废纸篓，只移除了文件夹。

之后回到原目录继续完成导出逻辑，再提交、合入 `master` 并删除导出分支。

## 12. 连接 GitHub

### 12.1 Git 在本机，GitHub 在远程

前面的存档、回滚和分支操作都是在电脑上完成的。接下来要把代码和版本记录放到 GitHub，需要先让 GitHub 能验证这台电脑的连接。

这里使用 SSH Key：本机保存私钥和公钥，把公钥添加到 GitHub。私钥留在本机，用于连接时的身份验证。

![本机私钥与 GitHub 公钥](https://img.yanxisishi.top/images/2026/10/git-github-15-ssh-f55639035e.jpg)

### 12.2 生成 SSH Key，并添加公钥

```bash
ssh-keygen -t ed25519 -C "yanxisishi@gmail.com"
```

下面节选一次演示密钥生成的返回，指纹每次生成都会不同。

实际运行：

```console
The key fingerprint is:
SHA256:z5lZJZ4H2ZGiXYTJ1CwoUSpFOBJHq0DUNTX2BI8t9xM yanxisishi@gmail.com
```

`-t ed25519` 指定密钥类型，`-C` 后面是标识说明。接下来按提示选择保存位置和私钥口令。

生成后有两个文件：`id_ed25519` 是私钥，`id_ed25519.pub` 是公钥。

使用默认保存路径时，可以这样显示公钥内容：

```bash
cat ~/.ssh/id_ed25519.pub
```

下面是演示公钥，实际生成的内容每次都会不同。

实际运行：

```console
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFFXoztgGpx/0KfVjFnXi99df+PL3fVZqfwiC5uRNn4h yanxisishi@gmail.com
```

复制的是 `.pub` 文件的内容，私钥留在本机。把公钥内容添加到 GitHub 的 **Settings → SSH and GPG keys → New SSH key**，然后用下面的命令测试连接：

```bash
ssh -T git@github.com
```

本次用演示密钥测试，连接在身份认证前被关闭，所以这段返回不能判断公钥是否配置正确。遇到这种情况先检查网络，再重新测试。

连接测试的实际返回：

```console
Connection closed by 198.18.0.45 port 22
```

首次连接时会出现确认提示；连接成功后，终端会显示认证成功的消息。

### 12.3 创建远程仓库

在 GitHub 上新建仓库，选择公开或私有，并复制它的 SSH 地址。这里的示例仓库名用 `yanxisishi-todo`。

因为本地已经有项目，这里创建空远程仓库，不勾选额外添加 README、.gitignore 或许可证文件，之后直接推送已有内容。

创建完成后会显示几组命令。这里选择“推送现有仓库”对应的操作。

### 12.4 关联地址，再第一次推送

```bash
git remote add origin git@github.com:yanxisishi/yanxisishi-todo.git
git push -u origin master
```

为实际复现推送返回，这里把示例远程地址临时映射到本地裸仓库 yanxisishi-todo.git，所以下面的 To 显示本地路径。没有向 GitHub 新建或上传仓库；接入自己的 GitHub 后，To 会显示实际远程地址。

实际运行：

```console
$ git remote add origin git@github.com:yanxisishi/yanxisishi-todo.git

$ git push -u origin master
branch 'master' set up to track 'origin/master'.
To ~/git-demo/yanxisishi-todo.git
 * [new branch]      master -> master
```

第一条给远程仓库地址起名为 `origin`；第二条把本地 `master` 推送过去，并设置后续使用的关联关系。

![关联远程仓库并推送](https://img.yanxisishi.top/images/2026/10/git-github-16-push-e29ddbcdb0.jpg)

注意 GitHub 页面给出的命令可能用 `main`，这里本地分支用的是 `master`。推送时分支名要和本地实际情况对应，不要把示例命令直接照搬。

实际推送到 GitHub 后，GitHub 能看到项目文件，也能打开提交列表，看到此前各阶段的版本记录。

仓库首页会显示 README 的内容，可以把项目介绍、使用方法和后续计划写进去。

### 12.5 之后的更新：add → commit → push

例如，更新 `README.md` 后，再暂存、提交、推送：

```bash
git add README.md
git commit -m "更新项目说明"
git push
```

下面继续使用同一个本地演示远程仓库记录返回。

实际运行：

```console
$ git add README.md

$ git commit -m "更新项目说明"
[master a8a5578] 更新项目说明
 1 file changed, 3 insertions(+)

$ git push
To ~/git-demo/yanxisishi-todo.git
   f72842e..a8a5578  master -> master
```

首次推送已经设置了关联，所以后续在这个分支上可以直接执行 `git push`。

![暂存、提交、推送](https://img.yanxisishi.top/images/2026/10/git-github-17-add-commit-push-297fe9b4be.jpg)

本地 `commit` 完成后，远程还不会自动更新；需要 `push` 才把新增提交传过去。

### 12.6 重新取得项目：clone

在项目外的新目录里执行克隆，再进入下载得到的项目目录：

```bash
git clone git@github.com:yanxisishi/yanxisishi-todo.git "yanxisishi-todo"
cd "yanxisishi-todo"
```

下面仍从同一个本地演示远程仓库克隆。

实际运行：

```console
$ git clone git@github.com:yanxisishi/yanxisishi-todo.git "yanxisishi-todo"
Cloning into 'yanxisishi-todo'...
done.

$ cd "yanxisishi-todo"
```

命令中的最后一个参数是本地目录名。下载完成后，项目文件可以重新打开运行，仓库的版本记录也一起取回。

## 13. 命令速查

| 想做什么 | 对应命令 | 需要留意的区别 |
| --- | --- | --- |
| 检查 Git 安装 | `git --version` | 看是否输出版本号 |
| 初始化当前目录 | `git init` | 在项目目录内执行 |
| 看当前状态 | `git status` | 先判断改动在哪个阶段 |
| 看工作区差异 | `git diff` | 状态列表不等于具体差异 |
| 把文件放进暂存区 | `git add index.html` | 还没有形成提交 |
| 形成一次提交 | `git commit -m "说明"` | 保存的是为这次提交准备的内容 |
| 看历史 | `git log` / `git log --oneline` | 后者紧凑显示 |
| 放弃工作区修改 | `git restore index.html` | 会改变工作区内容 |
| 取消暂存 | `git restore --staged index.html` | 工作区修改仍在 |
| 连工作区一起退回 | `git reset --hard HEAD~1` | 会覆盖相应的未提交改动 |
| 撤回提交，留下修改 | `git reset --mixed HEAD~1` / `git reset --soft HEAD~1` | 区别是暂存区是否保留 |
| 增加一次撤销提交 | `git revert HEAD` | 保留原提交，另加反向提交 |
| 查看分支 | `git branch` | 星号表示当前分支 |
| 创建并切换分支 | `git switch -c feature/due-date` | 单独 `git branch 名称` 只创建 |
| 切换到已有分支 | `git switch master` | 确认未完成的改动如何处理 |
| 合入功能 | `git merge feature/due-date` | 先切到接收改动的分支 |
| 给功能分支换基础 | `git rebase master` | 在功能分支上执行 |
| 继续处理中的变基 | `git rebase --continue` | 先编辑冲突文件并 `git add` |
| 临时收起未完成工作 | `git stash` | 用于临时中断 |
| 取回临时工作 | `git stash pop` | 回原分支继续开发 |
| 列出工作目录 | `git worktree list` | 多目录仍共用仓库历史 |
| 建立另一个工作目录 | `git worktree add -b 新分支 目标目录 master` | 分清新分支、目录、起点 |
| 移除完成任务的工作目录 | `git worktree remove 目标目录` | 先处理好该目录里的工作 |
| 删除已合并分支 | `git branch -d 分支名` | 与移除工作目录是两步操作 |
| 连接并上传到 GitHub | `git remote add origin 远程地址`，再 `git push -u origin master` | 第一次需要配置远程与关联 |
| 上传后续提交 | `git push` | 本地提交后还要推送 |
| 从远程取得仓库 | `git clone 远程地址 本地目录` | 得到项目与版本历史 |

**用 yanxisishi-todo 过一遍操作顺序：**

1. 项目有了可用页面：初始化仓库，分别保存页面和说明。
2. 颜色改坏了：按工作区、暂存区、已提交三个阶段选择回滚方式。
3. 有不想提交的笔记：把规则写进 `.gitignore`。
4. 新增截止日期：在功能分支完成后合入主分支。
5. 排序与全部完成都改到同一位置：处理冲突，保留两边需要的功能。
6. 另起一次尚未合并的场景：用 Rebase 让功能分支跟上主分支，处理冲突后继续。
7. 逻辑写到一半，临时要修样式：Stash 收起，修完回来取回。
8. 导出没写完，还要开发统计：Worktree 为另一个任务提供独立目录。
9. 要把本地历史保存到远程：配置 SSH、公钥和仓库地址，再提交、推送；需要时用 Clone 取回。

复习时就按这个顺序过一遍：先把本地版本保存明白，再看怎么恢复、怎么分开做多个任务，最后把提交推到远程。

**原视频时间索引：**

想回看某个操作时，可以按这个表找：

| 时间 | 内容 | 本文位置 |
| --- | --- | --- |
| 00:00:00 | 开场：Git 与 GitHub | 第 1 节 |
| 00:01:20 | 使用 AI 安装 Git | 第 2 节 |
| 00:02:01 | Windows 手动安装 | 第 2 节 |
| 00:03:14 | macOS 手动安装 | 第 2 节 |
| 00:04:49 | 如何存档 | 第 3 节 |
| 00:19:43 | 回滚的三种场景 | 第 4.1 节 |
| 00:21:51 | 改动只在工作区 | 第 4.2 节 |
| 00:27:30 | 改动已进暂存区 | 第 4.3 节 |
| 00:32:43 | 改动已经提交 | 第 4.4 节 |
| 00:44:49 | 用 .gitignore 忽略文件 | 第 5 节 |
| 00:49:00 | 什么是分支 | 第 6 节 |
| 00:52:54 | 创建分支 | 第 6 节 |
| 00:59:32 | 合并分支 | 第 7 节 |
| 01:00:55 | 处理合并冲突 | 第 8 节 |
| 01:09:55 | 两次合并的区别 | 第 7、8 节 |
| 01:12:20 | Rebase | 第 9 节 |
| 01:19:24 | Stash | 第 10 节 |
| 01:28:03 | Worktree | 第 11 节 |
| 01:37:23 | GitHub 配置与使用 | 第 12 节 |

## 14. 删除仓库与远程关联

### 14.1 删除本地 Git 仓库

如果不想再用 Git 管理 `yanxisishi-todo`，只需删除项目根目录里的 **`.git` 文件夹**。页面、README 等项目文件会留在原处。

**在文件夹里操作：** 打开 `yanxisishi-todo`，找到并删除 `.git` 文件夹。看不到它时，先在文件管理器中开启显示隐藏项目。注意 `.git` 和 `.gitignore` 是两个不同的文件名。

**在 Git Bash 中操作：** 进入项目根目录，确认要删除的是这个项目的 `.git` 文件夹，再执行：

```bash
git status
rm -rf .git
git status
```

在临时仓库中实际运行：

```console
$ git status
On branch master
nothing to commit, working tree clean

$ rm -rf .git

$ git status
fatal: not a git repository (or any of the parent directories): .git
```

`-r` 表示删除整个文件夹，`-f` 表示不逐项询问；成功时没有输出。两种删除方式的结果一样：本地提交历史、分支、暂存区和远程地址配置随 `.git` 消失，已经推送到 GitHub 的远程仓库不受影响。这些本地记录不能靠 `git reset` 找回。

这里针对的是 `.git` 为目录的普通仓库。第 11 节创建的附加 Worktree 应用 `git worktree remove` 清理。如果项目位于另一个 Git 仓库内，删除后运行 `git status` 可能显示上层仓库，而不是示例中的报错。

### 14.2 解除远程仓库关联

如果本地项目还要继续使用 Git，只是不再连接第 12 节设置的 GitHub 仓库，可以删除名为 `origin` 的远程关联：

```bash
git remote -v
git remote remove origin
git remote -v
```

在已设置示例 `origin` 地址的临时仓库中实际运行：

```console
$ git remote -v
origin	git@github.com:yanxisishi/yanxisishi-todo.git (fetch)
origin	git@github.com:yanxisishi/yanxisishi-todo.git (push)

$ git remote remove origin

$ git remote -v
```

最后没有输出，表示这个示例仓库已没有远程关联。本地文件和提交仍在，GitHub 上的仓库也仍在；与 `origin` 对应的远程跟踪记录会一起移除。以后要重新推送，可以按第 12.4 节再次添加远程地址。如果第 14.1 节已经删除了 `.git`，关联也随之消失，无须再执行这一节的命令。

### 14.3 删除 GitHub 上的远程仓库

如果想删除 GitHub 上的 `yanxisishi/yanxisishi-todo` 仓库，需要在 GitHub 网页中操作：

1. 打开自己有管理权限的仓库，进入 **Settings（设置）**。
2. 在 **General（常规）** 页面下方找到 **Danger Zone（危险区域）**，点击 **Delete this repository（删除此仓库）**。
3. 阅读页面提示，按要求输入仓库名称并确认删除。

这会删除 GitHub 上的仓库；本地项目文件和已有提交不会自动消失，本地保存的 `origin` 地址也不会自动移除。若还想清理这个地址，按第 14.2 节操作。删除前确认仓库名称及需要保留的数据；具体页面步骤可对照 [GitHub 官方说明](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository)。

