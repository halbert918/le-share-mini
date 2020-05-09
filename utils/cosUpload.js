var COS = require('./cos/cos-wx-sdk-v5');
var Api = require('./api.js');
var wxRequest = require('./wxRequest.js')


var Bucket = 'le-share-1300839762';
var Region = 'ap-guangzhou';

var getAuthorization = function(options, callback) {
  // 格式一、（推荐）后端通过获取临时密钥给到前端，前端计算签名
  // 服务端 JS 和 PHP 例子：https://github.com/tencentyun/cos-js-sdk-v5/blob/master/server/
  // 服务端其他语言参考 COS STS SDK ：https://github.com/tencentyun/qcloud-cos-sts-sdk
  var getRequest = wxRequest.getRequest(Api.getCosTmpSecret());
  getRequest.then(response => {
    console.log("respo = ", response)
    if (response.code === '200') {
      var data = response.data;
      var credentials = data && data.credentials;
      if (!data || !credentials) return console.error('credentials invalid');

      Bucket = data.bucket
      Region = data.region

      callback({
          TmpSecretId: credentials.tmpSecretId,
          TmpSecretKey: credentials.tmpSecretKey,
          XCosSecurityToken: credentials.sessionToken,
          StartTime: data.startTime, // 时间戳，单位秒，如：1580000000，建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
          ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000900
      });
    }
  })
  // wx.request({
  //     method: 'GET',
  //     url: Api.getCosTmpSecret(), // 服务端签名，参考 server 目录下的两个签名例子
  //     dataType: 'json',
  //     success: function(result) {
  //         console.log("cosResult = ", result)
  //         var data = result.data;
  //         var credentials = data && data.credentials;
  //         if (!data || !credentials) return console.error('credentials invalid');
  //         callback({
  //             TmpSecretId: credentials.tmpSecretId,
  //             TmpSecretKey: credentials.tmpSecretKey,
  //             XCosSecurityToken: credentials.sessionToken,
  //             StartTime: data.startTime, // 时间戳，单位秒，如：1580000000，建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
  //             ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000900
  //         });
  //     }
  // });
};

var cos = new COS({
  // path style 指正式请求时，Bucket 是在 path 里，这样用途相同园区多个 bucket 只需要配置一个园区域名
  getAuthorization: getAuthorization,
});

// 回调统一处理函数
var requestCallback = function(err, data) {
  console.log(err || data);
  if (err && err.error) {
      wx.showModal({
          title: '返回错误',
          content: '请求失败：' + (err.error.Message || err.error) + '；状态码：' + err.statusCode,
          showCancel: false
      });
  } else if (err) {
      wx.showModal({
          title: '请求出错',
          content: '请求出错：' + err + '；状态码：' + err.statusCode,
          showCancel: false
      });
  } else {
      wx.showToast({
          title: '请求成功',
          icon: 'success',
          duration: 3000
      });
  }
};

function upload(filename, filePath, callback) {
  cos.postObject({
    Bucket: Bucket,
    Region: Region,
    Key: filename,
    FilePath: filePath,
    onProgress: function (info) {
        console.log(JSON.stringify(info));
    }
  }, 
  function (err, data) {
    console.log(err || data);
    if (data) {
      callback(data)
    }
  });
}

module.exports = {
  upload: upload,
}