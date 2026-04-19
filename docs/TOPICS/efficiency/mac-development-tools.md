# Mac 开发工具



## oh-my-zsh

### 介绍
&nbsp;&nbsp;当我们和操作系统交互时，要首先输入命令。然后操作系统理解命令，最后返回结果，中间的媒介就是Shell。它是一个命令行解释器。<br>
&nbsp;&nbsp;1989年bash被开发出来，并且被安装在大部分的Linux发行版和MacOS中。bash是shell的一种实现，提供丰富的命令行编辑功能和脚本编程能力。<br>
&nbsp;&nbsp;我们在写shell脚本时，第一行一般会写一个#/bin/bash，这段脚本就是由Bash去执行的。1990年zsh被创造出来，它的目标是成为终极shell。原先Zsh一直不温不火，有两个转折点改变了它。一个是ohmyzsh项目的出现，另一点是苹果将MacOS的默认shell改成了zsh。我们可以把bash和zsh理解为shell的实现类。zsh相比于bash的优点就是功能多，可以更容易定制化。ohmyzsh就是zsh的管理框架，让zsh变得更容易安装，并且带了大量的主题和插件。
### 安装oh-my-zsh
```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

我们可以在配置`.zshrc`中修改自己的配置，这里推荐几个插件：
```bash
# 查看配置文件
vim ~/.zshrc
```

- git：会高亮显示分支（默认）
- zsh-autosuggestions：会显示历史敲过的命令，按右键就会自动补全
```bash
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions# 重新生效配置文件
source ~/.zshrc
```
- zsh-syntax-highlighting：语法高亮
```bash
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
# 重新生效配置文件
source ~/.zshrc
```

