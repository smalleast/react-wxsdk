(function () {

  var global = window || this;
  var nx = global.nx || require('next-js-core2');
  var wx = global.wx = global.wx || require('wechat-jssdk');
  var Q = global.Q || require('q');
  var Qqueue = nx.Qqueue || require('next-qqueue');

  var generatedApiList = [
    //basic:
    'ready',
    'checkJsApi',
    'error',
    //share api:
    'onMenuShareTimeline',
    'onMenuShareAppMessage',
    'onMenuShareQQ',
    'onMenuShareWeibo',
    'onMenuShareQZone',

    //about images:
    'chooseImage',
    'previewImage',
    'uploadImage',
    'downloadImage',
    'getLocalImgData',

    //back to wechat:
    'closeWindow',

    //hide/showOptionMenu
    'hideOptionMenu',
    'showOptionMenu',

    //start/stopRecord
    'startRecord',
    'stopRecord',
    'onVoiceRecordEnd',
    'openLocation',
    'getLocation',
    'scanQRCode',
    'chooseWXPay',
    'openAdreess'
  ];


  var Wxsdk = nx.declare('nxWxsdk', {
    statics: {
      VERSION: '1.2.0',
      wx: wx,
      SHARE_TAYPES: ['Timeline', 'AppMessage', 'QQ', 'Weibo', 'QZone'],
      defaults: {
        debug: true,
        jsApiList: [
          'onMenuShareTimeline', 'onMenuShareAppMessage',
          'onMenuShareQQ', 'onMenuShareQZone',
          'onMenuShareWeibo',

          'chooseImage',
          'previewImage',
          'uploadImage',
          'downloadImage',
          'getLocalImgData',

          'closeWindow',
          'hideOptionMenu',
          'showOptionMenu',

          'openLocation',
          'getLocation',

          'scanQRCode',
          'chooseWXPay',

          'openAdreess'
        ]
      },
      __config: null,
      param: function () {
        return {
          url: global.location.href.split('#')[0]
        };
      },
      updateTitle: function (inTitle) {
        var body = document.getElementsByTagName('body')[0];
        document.title = inTitle;
        var iframe = document.createElement("iframe");
        iframe.setAttribute("src", "favicon.ico");
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'absolute';
        iframe.style.zIndex = -1;

        iframe.addEventListener('load', __loadFn);

        function __loadFn() {
          setTimeout(function () {
            iframe.removeEventListener('load', __loadFn);
            document.body.removeChild(iframe);
          }, 0);
        }

        document.body.appendChild(iframe);
      },
      initialize: function (inOptions) {
        this.__config = inOptions;
        switch (true) {
          case nx.isBoolean(inOptions.optionMenu):
            wx.ready(function () {
              Wxsdk.optionMenu(inOptions.optionMenu);
            });
            break;
        }
      },
      config: function (inSignOptions, inOptions) {
        var options = nx.mix(Wxsdk.defaults, inSignOptions, inOptions);
        Wxsdk.initialize(options);
        if (typeof wx != 'undefined') {
          wx.config(options);
        } else {
          nx.error('Must import this wx api script: <script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js" charset="utf-8"></script>')
        }
      },
      share: function (inOptions, inTypes) {
        var types = inTypes || Wxsdk.SHARE_TAYPES;
        types.forEach(function (item) {
          var api = 'onMenuShare' + item;
          wx[api](inOptions);
        });
      },
      optionMenu: function (inVisible) {
        return inVisible ? wx.showOptionMenu() : wx.hideOptionMenu();
      },

      //wx.chooseImage:
      syncChooseImage: function (inOptions) {
        var options = nx.mix({
          count: 9,
          sizeType: ['original', 'compressed'],
          sourceType: ['album', 'camera']
        }, inOptions);
        return Wxsdk.__wrapToQPromise('chooseImage', options);
      },
      //wx.downloadImage:
      syncDownloadImage: function (inOptions) {
        return Wxsdk.__wrapToQPromise('downloadImage', inOptions);
      },

      //wx.getLocalImgData:
      syncGetLocalImageData: function (inOptions) {
        return Wxsdk.__wrapToQPromise('getLocalImgData', inOptions);
      },
      syncGetLocalImageDatas: function (inLocalIds, inOptions) {
        var optionList = Wxsdk.__makeOptionList(inLocalIds, inOptions);
        return Qqueue.queue(optionList, Wxsdk.syncGetLocalImageData);
      },

      //wx.uploadImage
      syncUploadImage: function (inOptions) {

        var options = nx.mix({
          isShowProgressTips: 1
        }, inOptions);
        return Wxsdk.__wrapToQPromise('uploadImage', options);
      },
      syncUploadImages: function (inLocalIds, inOptions) {
        var optionList = Wxsdk.__makeOptionList(inLocalIds, inOptions);
        return Qqueue.queue(optionList, Wxsdk.syncUploadImage);
      },

      //chooseImage && getLocalImageData
      syncChooseImageWithData: function (inChooseOptions, inImageOptions) {
        var deferred = Q.defer();
        Wxsdk.syncChooseImage(inChooseOptions).then(function (response) {
          Wxsdk.syncGetLocalImageDatas(response.localIds, inImageOptions).then(function (result) {
            var localDatas = result.map(function (item) {
              return item.localData;
            });

            deferred.resolve({
              localIds: response.localIds,
              localDatas: result
            });
          }, function (err) {
            deferred.reject(err);
          })
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      // choose && upload:
      syncChooseImageDataToUpload: function (inChooseOptions, inUploadOptions) {
        var deferred = Q.defer();
        Wxsdk.syncChooseImageWithData(inChooseOptions).then(function (response) {
          Wxsdk.syncUploadImages(response.localIds, inUploadOptions).then(function (result) {
            result.forEach(function (item, index) {
              item.localData = response.localDatas[index];
            });
            deferred.resolve(result);
          }, function (error) {
            deferred.reject(error);
          });
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      syncChooseImageToUpload: function (inChooseOptions, inUploadOptions) {
        var deferred = Q.defer();
        Wxsdk.syncChooseImage(inChooseOptions).then(function (response) {
          var localIds = response.localIds;
          inUploadOptions.choosedCallback && inUploadOptions.choosedCallback(localIds);
          Wxsdk.syncUploadImages(localIds, inUploadOptions).then(function (result) {
            var newImages = result.map(function (item, index) {
              return nx.mix(item, {localId: localIds[index]});
            });
            deferred.resolve(newImages);
          }, function (err) {
            deferred.reject(err);
          });
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      __wrapToQPromise: function (inApi, inOptions) {
        var deferred = Q.defer();
        wx[inApi](
          nx.mix(inOptions, {
            success: function (response) {
              deferred.resolve(response);
            },
            fail: function (error) {
              deferred.reject(error);
            }
          })
        );
        return deferred.promise;
      },
      __makeOptionList: function (inLocalIds, inOptions) {
        var optionList = [];
        inLocalIds.forEach(function (localId) {
          var option = nx.mix({}, inOptions, {localId: localId});
          optionList.push(option);
        });
        return optionList;
      }
    }
  });

  //generate wx basic api:
  generatedApiList.forEach(function (item) {
    nx.defineStatic(Wxsdk, item, wx[item]);
  });


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Wxsdk;
  }

}());
