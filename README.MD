# next-wxsdk
> Better wechat jssdk based on next toolkit.

## source author
+ https://github.com/afeiship/next-wxsdk

## resources:
+ http://203.195.235.76/jssdk/
+ https://github.com/kriskowal/q
+ https://mp.weixin.qq.com/wiki

## size:
+ [ default size ]: all files 3.52 kB
+ [ minimize size ]: all files 1.87 kB

## apilist:
+ import next-wxsdk package:
```javascript
import Wxsdk from 'next-wxsdk';
```

+ Get config from server side:
```javascript
ApiService.getWeixinShareSign({ url: window.location.href.split('#')[0] }).then((resp)=>{
  Wxsdk.config(nx.mix(resp,{debug:false}));
  this.attachWxReadyEvents();
},function (error) {
  alert('error:'+nx.stringify(error));
});


//attachWxReadyEvents:
Wxsdk.ready(()=>{
  this.share();
});


//share:
Wxsdk.share({
  title: '互联网之子',
  desc: '在长大的过程中，我才慢慢发现，我身边的所有事，别人跟我说的所有事，那些所谓本来如此，注定如此的事，它们其实没有非得如此，事情是可以改变的。更重要的是，有些事既然错了，那就该做出改变。',
  link: 'http://movie.douban.com/subject/25785114/',
  imgUrl: 'http://demo.open.weixin.qq.com/jssdk/images/p2166127561.jpg',
  success: function (res) {
    alert('已分享');
  }
});


//click button to show wx upload:
_click2(){
    Wxsdk.chooseImage({
      count: 6, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        Wxsdk.syncUploadImages(res.localIds,{
          isShowProgressTips: 1
        }).then((result)=>{
          alert('result:->'+nx.stringify(result))
          //var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
        });
      }
    });
  }
```
+ Or you can use `Wxsdk.wx` directly:
```javascript
 Wxsdk.wx.chooseCard(YOUR_OPTIONS);
```
## todos:
+ [ ] remove wechat-jssdk instead of onlline sdk1.2.0;
+ [ ] use Promise solution instead of $q
+ [ ] optimze CONST file
