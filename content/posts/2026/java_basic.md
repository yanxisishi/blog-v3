---
title: Java 简单语法速成
description: 为后续Java反序列化基础的学习做点铺垫。
date: 2026-05-25 18:02:06
updated: 2026-05-25 18:02:06
image: https://img.yanxisishi.top/images/2026/05/%E7%88%B1%E6%9D%80%E5%AE%9D%E8%B4%9D.jpg
categories: [Java Sec]
tags: [Java, Web, Security]
---

## 0. 前言

+ 目标：能看懂 `Serializable`、`ObjectInputStream`、`readObject`、`HashMap`、`URLDNS`、反射、动态代理和类加载这些内容。

## 1. Java 概览

Java 代码最常见的单位是“类”。

一个简单的 Java 代码：

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("hello");
    }
}
```

代码逻辑整体理解为：

```text
定义一个 Hello 类
  -> 里面有 main 方法
  -> 程序从 main 开始执行
  -> 打印 hello
```

Java 程序从源码到运行，大概是：

```text
Hello.java 源码
  -> javac 编译
  -> Hello.class 字节码
  -> JVM 运行
```

一些常见名词：

| 名词     | 意思                                  |
| -------- | ------------------------------------- |
| JDK      | Java 开发工具包，包含编译器和运行环境 |
| JRE      | Java 运行环境                         |
| JVM      | Java 虚拟机，负责运行 `.class` 字节码 |
| `.java`  | Java 源码文件                         |
| `.class` | 编译后的字节码文件                    |

Java 程序运行的不是源码，而是 `.class` 字节码；类加载器会把字节码加载进 JVM。

## 2. 程序结构

### 2.1 文件与类名

一个 `.java` 文件里最多只能有一个 `public` 顶级类，并且文件名要和这个 `public` 类名一致。

```java
public class Person {
}
```

文件名一般要叫 `Person.java`。

### 2.2 程序入口

```java
public static void main(String[] args) {
}
```

这是 Java 程序入口。运行某个类时，JVM 会从它的 `main` 方法开始。

| 关键词          | 意义                       |
| --------------- | -------------------------- |
| `public`        | 这个方法外部可以访问       |
| `static`        | 不需要先创建对象就能调用   |
| `void`          | 没有返回值                 |
| `main`          | 程序入口方法名             |
| `String[] args` | 命令行参数，暂时可以先忽略 |

### 2.3 语句

Java 语句通常以分号结尾：

```java
System.out.println("hello");
```

意思是打印一行文字。

### 2.4 代码块

花括号 `{}` 表示一段代码属于哪里：

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("hello");
    }
}
```

结构是：

```text
Hello 类 {
    main 方法 {
        打印 hello
    }
}
```

## 3. 包与导入

### 3.1 包名（Package Name）

Java 用包名组织类，例如：

```java
java.io.ObjectInputStream
```

可以理解成：

```text
java 标准库
  -> io 输入输出包
  -> ObjectInputStream 类
```

`java.io` 中的 `io` 是 Input/Output，意思是输入/输出。

### 3.2 导入语句（import）

如果不写 `import`，可以写完整类名：

```java
java.io.FileInputStream fis = new java.io.FileInputStream("ser.bin");
```

写了 `import` 后，可以用短名字：

```java
import java.io.FileInputStream;

FileInputStream fis = new FileInputStream("ser.bin");
```

### 3.3 常用包

| 包名                | 常见内容                                          |
| ------------------- | ------------------------------------------------- |
| `java.lang`         | 基础类，如 `String`、`System`、`Object`，自动导入 |
| `java.io`           | 文件、输入输出流、对象流                          |
| `java.util`         | 集合、日期、工具类，如 `HashMap`、`ArrayList`     |
| `java.lang.reflect` | 反射相关，如 `Method`、`Field`、`Constructor`     |
| `java.net`          | 网络相关，如 `URL`、`InetAddress`                 |

反序列化里会经常遇到：

| 代码                                 | 类型 | 作用                                                     |
| ------------------------------------ | ---- | -------------------------------------------------------- |
| `import java.io.ObjectInputStream;`  | 类   | 对象输入流，用来从字节流里读回 Java 对象。               |
| `import java.io.ObjectOutputStream;` | 类   | 对象输出流，用来把 Java 对象写成字节。                   |
| `import java.io.Serializable;`       | 接口 | 序列化标记接口，一个类要实现它才可以被 Java 原生序列化。 |
| `import java.util.HashMap;`          | 类   | key-value 映射表。                                       |
| `import java.net.URL;`               | 类   | 表示一个网址。                                           |
| `import java.lang.reflect.Field;`    | 类   | 反射里的字段对象，可以用它读取或修改对象字段。           |

## 4. 变量与类型

变量就是给一个值起名字。

```java
int age = 22;
String name = "aa";
```

+ `int age = 22;`：定义整数变量 `age`，值是 `22`。
+ `String name = "aa";`：定义字符串变量 `name`，值是 `"aa"`。

格式：`类型 变量名 = 值;`

### 4.1 基本类型

| 类型      | 意思       | 示例                   |
| --------- | ---------- | ---------------------- |
| `int`     | 整数       | `int age = 22;`        |
| `long`    | 更大的整数 | `long id = 1L;`        |
| `double`  | 小数       | `double price = 3.14;` |
| `boolean` | 真/假      | `boolean ok = true;`   |
| `char`    | 单个字符   | `char c = 'A';`        |
| `byte`    | 一个字节   | `byte b = 1;`          |

### 4.2 引用类型

除了基本类型，很多都是引用类型。

```java
String name = "aa";
Person p = new Person("aa", 22);
```

+ `String name = "aa";`：定义字符串变量 `name`。
+ `Person p = new Person("aa", 22);`：创建一个 `Person` 对象，让变量 `p` 指向它。

引用类型变量里保存的不是对象本身，可以理解成保存“指向对象的位置”。

### 4.3 空值（null）

```java
Person p = null;
```

+ `null` 表示这个变量现在没有指向任何对象。
+ `Person p = null;`：有 `p` 这个变量，但它暂时没有对象。

如果对 `null` 调用方法：

```java
p.toString();
```

会报 `NullPointerException`，因为 `p` 没有指向真实对象，不能调用方法。

### 4.4 字符串（String）

```java
String s = "hello";
```

+ `String` 是字符串类型。
+ `String s = "hello";`：定义字符串变量 `s`，值是 `"hello"`。

字符串拼接：

```java
String s = "name=" + name + ", age=" + age;
```

在 `toString()` 中经常看到这种写法。
这里的 `+` 是字符串拼接；如果 `name` 是 `"aa"`、`age` 是 `22`，结果就是 `name=aa, age=22`。

### 4.5 数组（Array）

数组表示“一组同类型的数据”。

```java
String[] args = {"aa", "bb"};
byte[] data = {1, 2, 3};
```

+ `String[]`：字符串数组，一组字符串。
+ `byte[]`：字节数组，一组字节。
+ `args[0]`：取数组里的第 1 个元素。

例如：

```java
public static void main(String[] args)
```

这里的 `String[] args` 是命令行参数数组，入门阶段知道它是“传给程序的一组字符串”就够了。

### 4.6 类型转换（Type Casting）

类型转换就是把一个对象按另一个更具体的类型使用。

```java
Object obj = ois.readObject();
Person p = (Person) obj;
```

+ `Object`：最宽泛的对象类型。
+ `(Person) obj`：把 `obj` 当成 `Person` 使用。
+ 如果 `obj` 实际不是 `Person`，会报 `ClassCastException`。

## 5. 类与对象

### 5.1 类和对象（Classes and Objects）

类是模板，对象是根据模板创建出来的具体东西。

```java
public class Person {
    String name;
    int age;
}
```

`Person` 是类。

```java
Person p = new Person();
```

`p` 是一个 `Person` 类型的引用变量，它指向一个 `Person` 对象。

类和对象的关系理解：

```text
Person 类：规定人有 name 和 age
Person 对象：具体某个人，比如 name=aa, age=22
```

### 5.2 字段（Field）

字段就是对象里保存的数据：

```java
public class Person {
    String name;
    int age;
}
```

这里 `name` 和 `age` 就是字段。

访问字段：

```java
p.name = "aa";
p.age = 22;
```

### 5.3 方法（Method）

方法就是对象或类能做的事情：

```java
public void sayHello() {
    System.out.println("hello");
}
```

调用方法：

```java
p.sayHello();
```

### 5.4 方法结构（Method Structure）

```java
public String getName() {
    return name;
}
```

拆开看：

| 部分           | 意思                   |
| -------------- | ---------------------- |
| `public`       | 外部可以访问           |
| `String`       | 返回值类型             |
| `getName`      | 方法名                 |
| `()`           | 参数列表，这里没有参数 |
| `return name;` | 返回 `name`            |

没有返回值时用 `void`：

```java
public void printName() {
    System.out.println(name);
}
```

## 6. 对象创建

### 6.1 创建对象（new）

`new` 用来创建对象：

```java
Person p = new Person("aa", 22);
```

创建一个 `Person` 对象，参数是 `"aa"` 和 `22`，变量名是 `p`。

### 6.2 构造函数（Constructor）

构造函数负责创建对象时初始化字段。

```java
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

构造函数特点：

- 名字和类名一样。
- 没有返回值类型。
- `new Person(...)` 时自动调用。

### 6.3 当前对象（this）

`this` 表示“当前这个对象”。

```java
this.name = name;
```

左边 `this.name` 是对象自己的字段，右边 `name` 是传进来的参数。

### 6.4 默认构造函数（Default Constructor）

如果没有写任何构造函数，Java 会给一个默认无参构造函数：

```java
public Person() {
}
```

但如果已经写了：

```java
public Person(String name, int age) {
}
```

Java 就不会自动补无参构造函数。

这个点和反序列化有关：某些父类没有实现 `Serializable` 时，反序列化需要调用父类无参构造函数。

## 7. 修饰符

### 7.1 公共访问（public）

`public` 表示外部可以访问：

```java
public class Person {
    public void sayHello() {
    }
}
```

### 7.2 私有访问（private）

`private` 表示只能在当前类内部访问：

```java
private String name;
```

外部不能直接：

```java
p.name = "aa";
```

但反射可以绕过 private：

```java
field.setAccessible(true);
```

所以 Java 反序列化里可以看到反射修改私有字段。

### 7.3 静态成员（static）

`static` 表示属于类本身，不属于某个具体对象。

```java
public class Counter {
    public static int count = 0;
}
```

访问：

```java
Counter.count;
```

不是：

```java
new Counter().count;
```

`main` 方法是 static，所以程序启动时不需要先创建对象。

和序列化的关系：

- 普通字段属于对象，会被序列化。
- `static` 字段属于类，不属于某个对象，默认不参与对象序列化。

### 7.4 不可变修饰（final）

`final` 表示不能再改。

变量：

```java
final int x = 1;
```

方法：

```java
public final void run() {
}
```

类：

```java
public final class User {
}
```

常见组合：

```java
private static final long serialVersionUID = 1L;
```

可以理解为：

```text
这是 Person 类自己的、固定不变的、序列化版本号。
```

### 7.5 访问范围

| 修饰符      | 大概意思               |
| ----------- | ---------------------- |
| `public`    | 哪里都能访问           |
| `protected` | 自己、同包、子类能访问 |
| 不写        | 同一个包里能访问       |
| `private`   | 只有当前类能访问       |

## 8. 方法基础

### 8.1 参数（Parameter）

```java
public void say(String msg) {
    System.out.println(msg);
}
```

调用：

```java
say("hello");
```

`"hello"` 会传给参数 `msg`。

### 8.2 返回值（Return Value）

```java
public int add(int a, int b) {
    return a + b;
}
```

调用：

```java
int result = add(1, 2);
```

`result` 是 `3`。

### 8.3 无返回值（void）

`void` 表示没有返回值：

```java
public void print(String msg) {
    System.out.println(msg);
}
```

### 8.4 方法重载（Method Overloading）

同一个类里，方法名一样，但参数不同，叫重载。

```java
public void exec(String command) {
}

public void exec(String[] command) {
}
```

反序列化中会看到 `Runtime.exec` 有很多重载：

```java
exec(String command)
exec(String[] cmdarray)
exec(String command, String[] envp)
exec(String[] cmdarray, String[] envp, File dir)
```

反射调用方法时，要写清楚参数类型，否则可能找不到想调用的那个重载。

## 9. 异常处理（Exception Handling）

异常就是程序运行时出错。

例如：

- 文件不存在。
- 类型转换失败。
- 反序列化类不匹配。
- 访问空对象。

### 9.1 抛出异常（throws）

```java
public static void serialize(Object obj) throws Exception {
}
```

`throws Exception` 表示：

这个方法可能出错，先把异常交给外层处理。

示例代码里经常为了简洁直接写 `throws Exception`。

### 9.2 捕获异常（try/catch）

更完整的写法是自己处理异常：

```java
try {
    Object obj = ois.readObject();
} catch (Exception e) {
    e.printStackTrace();
}
```

`try` 里放正常代码，出错时进入 `catch`。

### 9.3 常见异常

| 异常                       | 常见原因                          |
| -------------------------- | --------------------------------- |
| `ClassNotFoundException`   | 反序列化时本地找不到对应类        |
| `IOException`              | 文件读写、网络、流处理出错        |
| `NotSerializableException` | 对象没有实现 `Serializable`       |
| `InvalidClassException`    | `serialVersionUID` 或类结构不兼容 |
| `NullPointerException`     | 对 `null` 调用字段或方法          |
| `ClassCastException`       | 强制类型转换失败                  |

## 10. 继承与接口

### 10.1 继承（extends）

继承表示一个类基于另一个类扩展。

```java
public class Student extends Person {
}
```

可以理解为：

```text
Student 是一种 Person
```

Java 中一个类只能直接继承一个父类。

### 10.2 接口（interface）

接口规定“应该有什么能力”，但不一定直接写具体实现。

```java
public interface Runnable {
    void run();
}
```

实现接口：

```java
public class Task implements Runnable {
    public void run() {
        System.out.println("running");
    }
}
```

### 10.3 序列化接口（Serializable）

`Serializable` 是一个很特殊的接口，它里面没有方法。

```java
public class Person implements Serializable {
}
```

它的作用是“打标记”：

```text
这个类允许被 Java 原生序列化。
```

如果一个类没有这个标记，`ObjectOutputStream.writeObject` 会拒绝序列化它。

### 10.4 动态代理（Dynamic Proxy）

JDK 动态代理只能代理接口。

```java
Proxy.newProxyInstance(loader, interfaces, handler)
```

其中 `interfaces` 就是代理对象要实现的一组接口。

动态代理的核心意义：

```text
调用代理对象的任意接口方法
  -> 都会进入 InvocationHandler.invoke(...)
```

所以接口是理解动态代理的前置知识。

## 11. Object 方法

### 11.1 根类（Object）

Java 中普通类最终都会继承自 `java.lang.Object`。

也就是说：

```text
Person 也是 Object
HashMap 也是 Object
URL 也是 Object
```

所以很多方法所有对象都有：

- `toString()`
- `equals(...)`
- `hashCode()`
- `getClass()`

### 11.2 字符串表示（toString）

打印对象时，Java 会调用它：

```java
System.out.println(person);
```

等价感觉：

```java
System.out.println(person.toString());
```

自定义：

```java
public String toString() {
    return "Person{name='" + name + "', age=" + age + "}";
}
```

### 11.3 相等判断（equals）

`equals` 用来判断两个对象是否“相等”。

```java
a.equals(b)
```

默认可能是判断是不是同一个对象。很多类会重写它，比如 `String` 判断内容是否相同。

### 11.4 哈希值（hashCode）

`hashCode` 返回一个整数，用于哈希表快速定位。

```java
int h = obj.hashCode();
```

反序列化学习里它非常重要，因为 URLDNS 链中有：

```text
HashMap.readObject()
  -> HashMap.hash()
  -> key.hashCode()
  -> URL.hashCode()
  -> DNS 查询
```

也就是说，`hashCode()` 不是一个无关小方法，它可能成为反序列化链条中的自动触发点。

### 11.5 重写标记（@Override）

```java
@Override
public String toString() {
    return "...";
}
```

`@Override` 表示这个方法是在重写父类或接口的方法。

它不是必须写，但写了之后编译器会检查是不是真的重写成功了。

## 12. 泛型与集合

### 12.1 泛型（Generics）

```java
HashMap<String, Integer> map = new HashMap<>();
```

尖括号里的：

`String, Integer` 表示 key 是字符串，value 是整数。

### 12.2 列表（List）

`List` 像一个有顺序的列表：

```java
List<String> names = new ArrayList<>();
names.add("aa");
names.add("bb");
```

结构：

```text
0 -> aa
1 -> bb
```

### 12.3 映射（Map）

`Map` 是 key-value 映射：

```java
Map<String, Integer> ages = new HashMap<>();
ages.put("aa", 22);
ages.put("bb", 23);
```

结构：

```text
aa -> 22
bb -> 23
```

取值：

```java
int age = ages.get("aa");
```

### 12.4 哈希映射（HashMap）

`HashMap` 是最常见的 `Map` 实现。

它会用 key 的 `hashCode()` 来计算存放位置。

粗略流程：

```text
map.put(key, value)
  -> 计算 key.hashCode()
  -> 根据 hash 找位置
  -> 保存 key/value
```

反序列化时，`HashMap` 要重建内部结构，也会重新计算 key 的 hash：

```text
HashMap.readObject()
  -> 读出 key/value
  -> hash(key)
  -> key.hashCode()
```

这就是 URLDNS 链为什么选 `HashMap` 的原因。

### 12.5 包装类型

泛型里不能直接写基本类型：

```java
HashMap<String, int> // 错
```

要写包装类型：

```java
HashMap<String, Integer> // 对
```

常见对应关系：

| 基本类型  | 包装类型  |
| --------- | --------- |
| `int`     | `Integer` |
| `long`    | `Long`    |
| `boolean` | `Boolean` |
| `double`  | `Double`  |
| `byte`    | `Byte`    |

## 13. IO 与对象流

### 13.1 数据流（Streams）

流可以理解成“数据通道”。

写文件：

```text
程序 -> 流 -> 文件
```

读文件：

```text
文件 -> 流 -> 程序
```

### 13.2 输入与输出（Input/Output）

| 名字     | 方向                     |
| -------- | ------------------------ |
| `Input`  | 输入到程序里，通常是读   |
| `Output` | 从程序输出出去，通常是写 |

### 13.3 文件流（File Streams）

写文件：

```java
FileOutputStream fos = new FileOutputStream("a.bin");
```

读文件：

```java
FileInputStream fis = new FileInputStream("a.bin");
```

它们处理的是原始字节。

### 13.4 对象流（Object Streams）

对象流用于 Java 原生序列化。

写对象：

```java
ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.bin"));
oos.writeObject(obj);
oos.close();
```

读对象：

```java
ObjectInputStream ois = new ObjectInputStream(new FileInputStream("ser.bin"));
Object obj = ois.readObject();
ois.close();
```

方向：

```text
序列化：
Java 对象
  -> ObjectOutputStream
  -> FileOutputStream
  -> ser.bin

反序列化：
ser.bin
  -> FileInputStream
  -> ObjectInputStream
  -> Java 对象
```

### 13.5 流的嵌套

这个嵌套写法是：

```java
new ObjectOutputStream(new FileOutputStream("ser.bin"))
```

`ObjectOutputStream` 负责把对象变成字节，`FileOutputStream` 负责把字节写进文件。

## 14. 序列化流程

### 14.1 可序列化类（Serializable Class）

```java
import java.io.Serializable;

public class Person implements Serializable {
    private static final long serialVersionUID = 1L;

    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String toString() {
        return "Person{name='" + name + "', age=" + age + "}";
    }
}
```

其中：

```java
implements Serializable
```

表示 `Person` 可以被序列化。

### 14.2 序列化（Serialization）

```java
ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.bin"));
oos.writeObject(new Person("aa", 22));
oos.close();
```

创建 `Person` 对象，用 `writeObject` 序列化，保存到 `ser.bin`。

### 14.3 反序列化（Deserialization）

```java
ObjectInputStream ois = new ObjectInputStream(new FileInputStream("ser.bin"));
Object obj = ois.readObject();
ois.close();
```

打开 `ser.bin`，用 `readObject` 读回对象。

### 14.4 readObject 入口

反序列化漏洞的核心入口经常就是：

```java
ois.readObject();
```

因为它不只是“读数据”，它会恢复整个对象图，并且可能自动触发：

- 类自己的 `readObject`。
- 集合类的重建逻辑。
- 代理类逻辑。
- 某些对象的 `hashCode`、`compare`、`readResolve` 等方法。

所以以后看到 `readObject()`，要立刻想到：

```text
这里可能会触发对象里的代码逻辑。
```

## 15. 反射基础（Reflection）

### 15.1 调用方式

普通调用：

```java
p.sayHello();
```

反射调用：

```java
Method method = p.getClass().getMethod("sayHello");
method.invoke(p);
```

普通调用是“写代码时就知道调用谁”。

反射是“运行时再根据名字找类、字段、方法”。

### 15.2 类对象（Class）

每个类被 JVM 加载后，都会有一个 `Class` 对象描述它。

获取方式：

```java
Class<?> c1 = Person.class;
Class<?> c2 = person.getClass();
Class<?> c3 = Class.forName("Person");
```

`Class` 对象里有：

- 类名。
- 字段。
- 方法。
- 构造函数。
- 父类。
- 接口。

### 15.3 字段对象（Field）

`Field` 表示字段。

```java
Field f = Person.class.getDeclaredField("name");
f.setAccessible(true);
f.set(person, "bb");
```

这表示：

```text
找到 Person 的 name 字段
  -> 允许访问 private
  -> 把 person 的 name 改成 bb
```

URLDNS 链里就会用反射改 `URL` 对象的私有字段 `hashCode`。

### 15.4 方法对象（Method）

`Method` 表示方法。

```java
Method m = Person.class.getDeclaredMethod("sayHello");
m.setAccessible(true);
m.invoke(person);
```

这表示：

```text
找到 sayHello 方法
  -> 允许访问
  -> 对 person 调用它
```

### 15.5 构造器（Constructor）

`Constructor` 表示构造函数。

```java
Constructor<Person> c = Person.class.getDeclaredConstructor(String.class, int.class);
Person p = c.newInstance("aa", 22);
```

这表示：

```text
找到 Person(String, int) 构造函数
  -> 用它创建对象
```

### 15.6 访问控制（setAccessible）

```java
member.setAccessible(true);
```

表示绕过 Java 语言层面的访问限制。

它可以用于：

- 访问 private 字段。
- 调用 private 方法。
- 调用 private 构造函数。

反序列化链中经常需要反射，是因为攻击者要把对象内部状态调成某种特殊样子，而这些字段往往是 private。

## 16. 类加载基础（Class Loading）

### 16.1 加载时机

源码不是直接运行的。大致流程：

```text
.java
  -> 编译
  -> .class
  -> 类加载器加载
  -> JVM 使用这个类
```

### 16.2 静态代码块（static block）

```java
public class Evil {
    static {
        System.out.println("static block");
    }
}
```

`static {}` 是静态代码块，类初始化时执行。

这对安全学习很重要，因为某些链会通过“加载并初始化类”触发代码。

### 16.3 实例初始化（instance initialization）

```java
public class Demo {
    static {
        System.out.println("static");
    }

    {
        System.out.println("instance");
    }

    public Demo() {
        System.out.println("constructor");
    }
}
```

第一次执行：

```java
new Demo();
```

输出顺序是：

```text
static
instance
constructor
```

记住：

- 类初始化触发 `static {}`。
- 对象实例化触发实例代码块和构造函数。

### 16.4 类初始化（class initialization）

```java
Class.forName("Demo");
```

默认会加载并初始化类，所以可能触发静态代码块。

不初始化的写法：

```java
Class.forName("Demo", false, loader);
```

### 16.5 类加载器（ClassLoader）

```java
loader.loadClass("Demo");
```

通常只加载，不主动初始化。

看类加载代码时，要区分：

```text
只是加载类
还是加载并初始化类
还是创建对象实例
```
