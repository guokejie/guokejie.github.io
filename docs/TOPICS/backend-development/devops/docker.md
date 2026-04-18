# Docker 教程

## Dockerfile

### 什么是 Dockerfile

Dockerfile 是一种文本文件，它包含了构建某个镜像的所有指令；Dockerfile 也是上述文件的官方推荐文件名。为了区分不同镜像的 Dockerfile，推荐使用不同目录分类存储。比如 `/redis/Dockerfile`。

Dockerfile 文件所在的目录，我们称为上下文目录，镜像所需的所有文件均保存在该位置。

### Dockerfile 文件指令汇总

- `FROM`：指定基础镜像
- `MAINTAINER`：维护者信息（作者邮箱、镜像版本等，已被 `LABEL` 替代）
- `RUN`：运行指定的命令
- `ADD/COPY`：将本地文件添加到镜像中（`ADD` 能自动解压拷贝的压缩包、还能直接请求下载 URL）
- `WORKDIR`：设置当前工作目录
- `VOLUME`：创建数据卷挂载点
- `EXPOSE`：声明运行容器时监听的端口
- `ENV`：设置环境变量
- `CMD`：容器启动时默认执行的命令（会被运行的 `command` 覆盖）
- `ENTRYPOINT`：容器启动时运行的启动命令（不会被运行的 `command` 覆盖）

---

## 实践——如何使用 Docker 部署 MySQL

我们平时开发一些项目的时候需要安装数据库，在安装数据库时我们需要用到 MySQL。每次都要从网站上去下载，然后再进行一系列繁琐的配置，而且比较占内存。因此有了 Docker 以后就非常方便，也很容易管理。同时我们的本地也可以支持开多个数据库，非常适合开发的场景。

### 安装 Docker

使用如下命令安装 Docker：

```bash
# 安装 docker
brew install docker

# 验证是否安装成功
docker -v
```

### 安装数据库 MySQL

使用如下命令来安装 MySQL：

```bash
# 下载 mysql 镜像
docker pull mysql

# 显示所有本地镜像
docker image
```

### 启动 MySQL 镜像

```bash
docker run \
-p 3306:3306 \
--name my_mysql \
-e MYSQL_ROOT_PASSWORD=123456 \
-d \
mysql
```

- `docker run`：创建并启动一个 Docker 容器
- `-p 3306:3306`：把本机的端口（左边）映射到容器内的端口（右边）
- `--name my_mysql`：给容器起名字（给你自己运行的镜像起名）
- `-e MYSQL_ROOT_PASSWORD`：设置环境变量
- `-d`：后台运行
- `mysql`：使用的镜像名称（指定你要运行的哪个镜像）

使用下面的命令可以查看当前正在运行中的容器：

```bash
# 查看当前运行中的容器
docker ps -a
```

输出结果：

```text
CONTAINER ID   IMAGE          COMMAND    CREATED          STATUS          PORTS                               NAMES
438a62d51c16   mysql:latest   "mysqld"   27 seconds ago   Up 26 seconds   0.0.0.0:3306->3306/tcp, 33060/tcp   my_mysql
```

```bash
# 删除运行中的实例
docker rm -f my_mysql

# 删除镜像
docker rmi mysql
```

### 验证容器是否成功启动

```bash
docker exec -it my_mysql mysql -uroot -p123456
```

见到如下输出则说明成功启动：

```text
mysql>
```

- `docker exec`：进入一个正在运行的容器
- `-it`：交互式终端
- `my_mysql`：容器名
- `mysql`：容器里要执行的命令

使用图形化界面验证容器是否成功启动，见到如下界面说明我们的容器已经成功启动起来了。

---

## 数据挂载

### 创建一些测试的数据库和表

```sql
-- 创建数据库
CREATE DATABASE db_demo;

-- 使用当前数据库
USE db_demo;

-- 创建用户表
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(20),
  age INT
);

-- 插入一条数据
INSERT INTO user(name, age) VALUES ('zhangsan', 20);
```

### 验证数据是否能查到

```sql
mysql> use db_demo;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> select * from user;
+----+----------+------+
| id | name     | age  |
+----+----------+------+
|  1 | zhangsan |   20 |
+----+----------+------+
1 row in set (0.002 sec)
```

使用下面的命令删除容器：

```bash
# 删除容器
docker rm -f my_mysql
```

输出如下结果则表示删除成功：

```text
my_mysql
```

此时容器已经没了，接下来我们使用同样的启动方式启动我们的容器，观察一下数据是否还存在。

```bash
# 运行容器
docker run \
-p 3306:3306 \
--name my_mysql \
-e MYSQL_ROOT_PASSWORD=123456 \
-v ~/mysql_data:/var/lib/mysql \
-d \
mysql
```

再次进入 MySQL，然后验证数据是否存在：

```bash
# 再次进入 mysql
docker exec -it my_mysql mysql -uroot -p123456

# 再次查询数据
USE db_demo;
SELECT * FROM user;
```

挂载完全生效！删容器数据不会丢失！

写到这里我突然冒出了一个想法，能否多个容器都挂载同一个目录。答案当然是可以的，但是不要这么做。这样可能会出现多个进程读取同一个目录，会造成冲突。
