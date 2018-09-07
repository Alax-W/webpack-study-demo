const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const  copyWebpackPlugin= require("copy-webpack-plugin");//集中抽离静态文件的插件，需要安装并引入
const entryPath = require('./webpack_config/entry_webpack.js');
if(process.env.type != 'build'){
   var website = {
      publicPath:'http://localhost:1516/'
   };//用于解决分离css后，css文件路径不正确问题
}else if (process.env.type == 'build'){
   var website = {
      publicPath:'http://xxx.com/'
   };//用于解决分离css后，css文件路径不正确问题
}
// const website = {
//    publicPath:'http://localhost:1516/'
// };//用于解决分离css后，css文件路径不正确问题
const uglify = require('uglifyjs-webpack-plugin');//压缩插件（不需要安装）
const htmlPlugin = require('html-webpack-plugin');//打包src下的html（需要安装）
const extractTextPlugin = require('extract-text-webpack-plugin');//分离出css文件到指定目录，不再放到引入的js文件中，该demo为不再放在entry.js中（需要下载该插件）
const PurifyCSSPlugin = require("purifycss-webpack");//自动判断为使用的css插件，需要安装同时引入node的glob注意必须配合extract-text-webpack-plugin这个插件
module.exports = {
   //打包后方便调试的devtool配置
   //四种模式1.source-map（最好但打包慢） 2.cheap-module-source-map(调试只能到行不能到具体字符) 3.eval-source-map（有安全隐患，生产时注意去掉） 4.cheap-module-eval-source-map（最快，缺点同3）
   //理论大型项目用source-map，小型项目：eval-source-map
   devtool: 'eval-source-map',//开发必备，上线打包时一定要去掉
   //入口文件的配置index.html
   // entry:{
   //    //里面的entry,entry2是可以随便写的
   //    entry:'./src/entry.js',
   //    entry2:'./src/entry2.js',
   //    //index:'./src/css/index.css',
   //    //index_less:'./src/css/index_less.less'
   // },
   //把入口单独文件即模块化的写法
   //新建entry_webpack.js文件并引入
   entry: entryPath.path,
   //出口文server件的配置
   output:{
      //打包后的路劲
      path: path.resolve(__dirname,'dist'),
      //打包后的名称
      filename: '[name].js',
      //用于解决css分离后，静态资源路径不正确问题；
      publicPath: website.publicPath
   },
   //模块
   module: {
      rules:[{
         //匹配.css后缀的文件用（use）制定loader
         test:/\.css$/,
         //不需要分离css的写法
         //use:['style-loader','css-loader']

         //需要分离css的写法
         // use:extractTextPlugin.extract({
         //    fallback:'style-loader',
         //    use:'css-loader'
         // })

         //自动添加css前缀，需要安装postcss-loader和autoprefixer
         // npm i -D postcss-loader autoprexer
         //根目录配置postcss.config.js

         //不分离css加前缀
         // use: [
         //    {
         //       loader: "style-loader"
         //    }, {
         //       loader: "css-loader",
         //       options: {
         //          modules: true
         //       }
         //    }, {
         //       loader: "postcss-loader"
         //    }
         // ]

         //分离css加前缀
         use: extractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
               { loader: 'css-loader', options: { importLoaders: 1 } },
               'postcss-loader'
            ]
         })

         //自动判断没使用的css不打包
         //安装purifyCSS-webpack插件和它的一个purify-css包
         //npm i -D purifycss-webpack purify-css
         //需要检查html故在webpack.config.js头部引入glob
         //const glob = `require`('glob');同时引入purifycss-webpack插件
         //const PurifyCSSPlugin = `require`("purifycss-webpack");
         //配置plugins选项如下

      },{
         //匹配png|jpg|gif|svg后缀的图片用（use）制定loader
         test:/\.(png|jpg|gif|svg)$/,
         use:[
            //图片转换为base64
            //url-loader已经包含file-loader
            {
               loader: "url-loader",
               options:{
                  //是把小于500B的文件打成Base64的格式
                  limit:500,
                  //大于500B的图片放到指定的目录下
                  outputPath:'images/'
               }
            },
            //不转换为base64（个人理解）
            //  {
            //     loader: "file-loader",
            //     options: {
            //        name: 'images/[name].[ext]?[hash]'
            //     }
            //  },
         ]
      },{
         //解决使用<img>标签引入图片的loader
         //(后面的i干什么用的我也不知道)
         test:/\.(htm|html)$/i,
         use:['html-withimg-loader']
      },{
         //用于打包less的loader
         //注：需要安装less服务和less-loader,style-loader,css-loader
         // npm i -D less
         //npm i -D less-loader
         test:/\.less$/,
         //不需要分离less的配置
         // use:[{
         //    loader: "style-loader"
         // },{
         //    loader: "css-loader"
         // },{
         //    loader: "less-loader"
         // }]
         // //需要分离less的配置
         use:extractTextPlugin.extract({
            use:[{
               loader: "css-loader"
            },{
               loader: "less-loader"
            }],
            fallback:"style-loader"
         })
      },{
         //用于打包sass的loader
         //注：需要安装node-sass服务和sass-loader,style-loader,css-loader
         // npm i -D node-sass
         //npm i -D sass-loader
         test:/\.scss$/,
         //不需要分离sass的配置
         // use:[{
         //    loader: "style-loader"
         // },{
         //    loader: "css-loader"
         // },{
         //    loader: "sass-loader"
         // }]
         // //需要分离sass的配置
         use:extractTextPlugin.extract({
            use:[{
               loader: "css-loader"
            },{
               loader: "sass-loader"
            }],
            fallback:"style-loader"
         })
      },{
         test:/\.(jsx|js)$/,
         //检查js的Bable
         //解析es6的babel-preset-es2015包和解析JSX的babel-preset-react包
         //npm i -D babel-core babel-loader babel-preset-es2015 babel-preset-react
         //不用.babelrc配置的写法
         // use:{
         //    loader:'babel-loader',
         //    options:{
         //       presets:['es2015','react']
         //    }
         // },
         //用.babelrc配置的写法
         //根目录新建.babelrc配置
         use:{
            loader:'babel-loader',
         },
         //取代babel-preset-es2015用babel-preset-env
         //安装babel-preset-env
         //npm i-D babel-preset-env
         //修改.babelrc配置为 presets:["react","env"]
         //排除目录
         exclude:/node_modules/
      }
      //webpack1.和webpack2.要引入•	var json =require('../config.json');需要下载json-loader
        //webpack3.X就可以直接引入使用
      ]
   },
   //插件
   plugins:[
      //在使用devServer（npm run server即热部署时）时不要压缩，压缩时生成环境才要
      //压缩插件
      //new uglify(),
      //打包html插件
      new htmlPlugin({
           minify:{
              //去掉属性的双引号
              removeAttributeOuotes:true
           },
           //避免缓存
           hash:true,
           //打包的html的路径和文件名称
           template:'./src/index.html'
        }
      ),
      //分离css文件插件到dist/css下。默认时放到引入该index.css即entry.js中
      //当在每个入口js都有import入css文件或多个css入口时分离多个css文件
      new extractTextPlugin('css/[name].css'),
      //new extractTextPlugin('css/index.css')
      //检查未使用的css插件
      //注意必须配合extract-text-webpack-plugin这个插件
      new PurifyCSSPlugin({
         paths: glob.sync(path.join(__dirname, 'src/*.html')),
      }),
      //引入第三方js库时方法
      //1.在入口文件中使用import()如：import $ from 'jquery';这种方法不管有没有到该第三方库，都会被打包
      //2.使用webpack自带的插件，故需要引入webpack。实际用不到该第三放插件就不会打包进去。
      // 头部引入	const webpack = require('webpack');
      //new webpack.ProvidePlugin({
      //       $:"jquery"
      //  })
      //以上两种方法都会打包第三方插件进自己的js中，故需要抽离第三方js类库
      //第一步入口配置如下
      //entry:{
      //   entry:'./src/entry.js',
      //  jquery:'jquery'//多个就写多个
      //},
     //第二步引入插件optimize
     new webpack.optimize.CommonsChunkPlugin({
	    //name对应入口文件中的名字，我们起的是jQuery
        //自己安装下jquery，来查看效果 npm i --save  jquery
	    name:['jquery'],
	    //把文件打包到哪里，是一个路径。如果不写，直接打到根目录下吧。
	    filename:"assets/js/[name].js",
	   // 最小打包的文件模块数，这里直接写2就好
	   minChunks:2
	}),

     //静态资源集中抽离，比如开发文档啊，代码中未使用的图片但是又需要存档的
     //安装插件
     //npm i -D copy-webpack-plugin
     //引入进来
     //	const  copyWebpackPlugin= require("copy-webpack-plugin");
	new copyWebpackPlugin([{
	   //从哪个文件夹取静态资源
	        from:__dirname+'/src/public',
       //放到哪里去
	        to:'./public'
	    }]),

//添加版权和开发者的插件
      new webpack.BannerPlugin('Alew-W版权所有')
   ],

//开发服务功能（热部署）
   devServer:{
      //设置基本目录
      contentBase: path.resolve(__dirname,'dist'),
      //服务器IP地址//最好写具体ip
      host: 'localhost',
      //服务器的端口号
      port:1516,
      //服务器是否开启压缩
      compress:true
   },
   //watch的配置
   watchOptions:{
      //检测修改的时间，以毫秒为单位
      poll:1500,
      //防止重复保存而发生重复编译错误。这里设置的500是半秒内重复保存，不进行打包操作
      aggregateTimeout:500,
      //不监听的目录
      ignored:/node_modules/
   }

}