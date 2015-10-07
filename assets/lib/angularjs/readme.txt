angular 在ie8及ie8以上浏览器中遇到问题小结
虽然angular 1.3及以上版本都放弃了对ie8的支持，但是鉴于国内ie8浏览器市场份额（百度统计近30%），有时候我们还是需要支持ie8的

angular要支持ie8需要做什么

angular developer guide 给了我们一些建议
https://code.angularjs.org/1.2.27/docs/guide/ie

引入html5shiv，支持ie下自定义标签
引入es5-shim，扩展es5新特性
做到以上这些，angular基本可以支持ie8了，但是还会有一些细节问题，可能就需要具体问题具体对待了。