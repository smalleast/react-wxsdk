import React from 'react';
import {ReduxAppBase} from 'next-react-redux';

import {DetailStatus, BiddingList} from 'components/scripts/index';
import ApiService from 'components/services/api';
import store from 'store';
import Wxsdk from 'react-wxsdk';

export default class extends ReduxAppBase {

  static initialState() {
    return {
      memory: {
        initialData: {
          tes: 123,
          age: 100,
          items: []
        },
        myInitial: 0,
        sum: 0
      },
      local:{
        test:200,
        store:0,
        items:[
          {key:1}
        ]
      },
      session:{
        smalleast:'session test..'
      }
    }
  }

  componentDidMount(){
    store.remove('userInfo');
    ApiService.getWeixinShareSign_100(Wxsdk.param()).then((resp)=>{
      Wxsdk.config(resp,{debug:false,optionMenu:false});
      this.attachWxReadyEvents();
    },function (error) {
      alert('error:'+nx.stringify(error));
    });
  }

  attachWxReadyEvents(){
    Wxsdk.ready(()=>{
      Wxsdk.share({
        title: '互联网之子',
        desc: '在长大的过程中，我才慢慢发现，我身边的所有事，别人跟我说的所有事，那些所谓本来如此，注定如此的事，它们其实没有非得如此，事情是可以改变的。更重要的是，有些事既然错了，那就该做出改变。',
        link: 'http://movie.douban.com/subject/25785114/',
        imgUrl: 'http://demo.open.weixin.qq.com/jssdk/images/p2166127561.jpg',
        trigger: function (res) {
          // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
          alert('用户点击发送给朋友');
        },
        success: function (res) {
          alert('已分享');
        },
        cancel: function (res) {
          alert('已取消');
        },
        fail: function (res) {
          alert(JSON.stringify(res));
        }
      });
    });
  }

  _onClick() {
    const {actions} = ReduxAppBase;
    let {test} = ReduxAppBase.local(['test']);
    test++;
    actions.local({test: test})
  }

  _click2(){
    Wxsdk.chooseImage({
      count: 6, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // alert(nx.stringify(res.localIds));

        Wxsdk.syncUploadImages(res.localIds,{
          isShowProgressTips: 1
        }).then((result)=>{
          alert('result:->'+nx.stringify(result))
        });
        //var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
      }
    });
  }

  render() {
    const {test} = ReduxAppBase.local(['test']);
    return (
      <div className="blank-module-view">
        member-list....{test}
        <button style={{
          width:'100%',
          height:'50px',
          background:'#00f',
        }} onClick={this._click2.bind(this)}>选图片</button>
        <button className="dc-button" onClick={this._onClick.bind(this)}>TEST</button>
      </div>
    );
  }
}
