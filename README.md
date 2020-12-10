## pineapple 菠萝

> 一个基于 svg 的图标管理和组件化方案

<p align="left>

![](https://github.com/famanoder/pineapple/blob/dev/flow-chart.jpg?raw=true)
</p>

该项目是一个整合了 svg 图标使用和管理的全流程解决方案，除了一般意义的组件外，还包括图标的管理平台、自动同步机制、按需引用机制、基于管理平台的图标数据的集成机制等；

基于 svg 的图标组件，大家可能并不陌生，社区上也有各种实现版本，该方案里提供的组件，也是借鉴了社区上的一些成熟的方案做了进一步的封装，当然，既然是一个整合性方案，组件肯定不是重点，组件只是其中的重要组成部分；

有了组件，咱们就能在项目开发中愉快的耍了吗？

No !

当前基于 svg 的图标库，基本上存在两大痛点：

1. 图标的自动同步：这个依赖于图标文件的托管方式，有的使用 git 仓库来托管图标文件，那么当图标有更新时，则需要重新构建图标并发布相关的 npm 包，步骤略繁琐；或者是把图标文件寄存于组件库，那么当图标有更新时，则需要更新整个库；那么，是否有一种方式可以做到让项目依赖的图标能够自动同步呢？

2. 项目图标的按需引用：使用第三方的图标平台，比如类似 iconfont 的平台，可以自己选图标导出，基本上不存在图标冗余的问题，该方式除了使用他的的 CDN 也不能满足咱们在项目中自动同步图标的需求；其他方案，如果图标是跟随组件发布的，那么按需使用图标将是个大难题；所以，如何能让图标能够自然的按项目需要引用呢？


使用该方案的整体工作流程分为两步：

1. 管理平台，在这里可以新建一个项目，然后导入需要使用的 svg 图标，当然也能对图标进行增删改查等操作；
2. 项目中使用，在管理平台上的项目都有一个唯一标识 alias，通过这个标识符，可以在项目中使用时只拉取该项目下的图标，避免引入项目以外的图标；

为了使图标组件和图标数据集分离，并且能够保证数据有更新后，项目里能够即时同步，我们提供了一个 webpack loader，将项目的 alias 传入该 loader，即可实现管理平台上图标有更新后，无需重新构建和发布组件包即可使用到最新的图标；

以上，我们通过一个管理平台来统一托管我们业务项目中使用到的图标文件，根据项目划分，各自独立管理；接着通过一个 webpack loader，来打通项目和管理平台，即按项目拉取指定的图标数据给图标组件消费；从而实现了项目里按需引用图标并且能够自动同步最新图标的目的；

### Install

```js
npm i pineapple@latest
```

### 组件的使用

* **基本用法**

```js
import Vue from 'vue';
import SvgIcon from 'pineapple';

Vue.use(SvgIcon);
```

> 默认的图标组件名称是 svg-icon，可以通过 tagName 自定义组件名

```html
<template>
  <svg-icon
    name="icon"
    color="red green">
  </svg-icon>
</template>
```

* Plugin Props

| 名称 | 类型 | 默认值 | 说明 |
| ----- | ----- | ----- | ----- |
| svgIcons | object | - | svg数据集 |
| tagName | string | svg-icon | 组件名 |
| isStroke | boolean | false | 默认使用描边样式 |
| defaultWidth | string | - | 默认宽 |
| defaultHeight | string | - | 默认高 |

* Component Props

| 名称 | 类型 | 默认值 | 说明 |
| ----- | ----- | ----- | ----- |
| rotate | number | false | 旋转角度 |
| spin | boolean | false | 是否添加旋转动画，实现loading效果 |
| icon | string | - | 图标名称 |
| name | string | - | 图标名称 |
| width | string | - | 图标宽 |
| height | string | - | 图标高 |
| scale | number | - | 放大倍数 |
| fill | boolean | true | 使用填充样式 |
| color | string | - | 颜色 |
| title | string | - | 标题 |
| original | boolean | - | 是否使用图标的原色 |

由于组件默认不携带图标，所以通过上面的方式，在页面上会什么也看不到，下面就通过配置 loader 拉取我们项目中的图标数据，当然前提是已经在图标管理平台上上传了该项目的图标；

### 使用 webpack loader 自动同步图标数据集

修改 webpack 配置，参考：

> 复制粘贴即可，一般情况下只需修改 projects

```js
rules: [
  {
    test: /\.js$/,
    loader: 'pineapple/babel-sync-svg-icons-loader',
    options: {
      requestUri: 'http://locale.server',
      projects: 'demo'
    }
  }
]
```

以上，重启项目后，便可以直接使用管理平台上的图标了，由于 loader 中默认开启了缓存，所以管理平台上图标有更新时，还需要重启一下项目才能使用最新的，如果想实时同步，配置 cacheResponse 为 false 即可；

相关配置参数：

| 名称 | 类型 | 默认值 | 说明 |
| ----- | ----- | ----- | ----- |
| requestUri | string | - | 拉取图标数据集的接口 |
| projects | string | common | 项目 alias，多个用逗号隔开 |
| cacheResponse | boolean | true | 是否缓存已拉取过来的图标数据集，为 true 时，当图标有更新后，需要重启应用 |

使用 loader 同步图标只是咱们首推的方式，但并不是唯一的方式，使用 loader 最大的好处是一劳永逸，一次配置后便可自动同步图标；

### 使用 svg2js 生成的 svg 数据集

支持使用包自带的 svg2js 命令将本地的 svg 文件转换成组件可用的数据集；

```js
svg2js assets/svgs --outFile svgs.js
```

### 使用 pull-svg 拉取管理平台上的图标数据

支持使用包自带的 pull-svg 命令拉取管理平台上的图标数据；

```js
pull-svg --projects demo --outFile svgs.js
```

### 使用生成的数据集

```js
import Vue from 'vue';
import SvgIcon from 'pineapple';
import SvgIcons from 'assets/js/svgs.js';

Vue.use(SvgIcon, {
  tagName: 'xxx-icon',
  svgIcons: SvgIcons
});
```

### 集成并优化 svg

优化 svg 信息，删除多余节点，压缩 svg 体积，并将节点信息转为 js，方便统一管理和进一步的优化工作；

```js
const { SvgOptimize } = require('pineapple/scripts/svgo');
const svgo = new SvgOptimize({/* svgo options */});

(async () => {
  /**
   * svgInfo: {
   *  name: string;
   *  data: string;
   *  viewBox: string;
   *  width: number;
   *  height: number;
   * }
   */
  const svgInfo = await svgo.build('svg-filename', 'svg-content');
})();
```
