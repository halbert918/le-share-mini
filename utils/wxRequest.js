var md5 = require('./md5.js');
var config = require('./config.js');


function wxPromisify(fn) {
    return function (obj = {}) {
        return new Promise((resolve, reject) => {
            obj.success = function (res) {
                //成功
                wx.hideNavigationBarLoading()
                resolve(res.data)
                
            }
            obj.fail = function (res) {
                //失败
                reject(res)
                wx.hideNavigationBarLoading()
                console.log(res)
            }
            fn(obj)
        })
    }
}
//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
    let P = this.constructor;
    wx.hideNavigationBarLoading()
    return this.then(
        value => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(() => { throw reason })
    );
};
/**
 * 微信请求get方法
 * url
 * data 以对象的格式传入
 */
function getRequest(url, data) {
    var getRequest = wxPromisify(wx.request);
    wx.showNavigationBarLoading()
    return getRequest({
        url: url,
        method: 'GET',
        data: data,
        header: getHeader(),
    })
}


/**
 * 微信请求post方法封装
 * url
 * data 以对象的格式传入
 */
function postRequest(url, data) {
    var postRequest = wxPromisify(wx.request)
    wx.showNavigationBarLoading()
    return postRequest({
        url: url,
        method: 'POST',
        data: data,
        header: getHeader(),
    })
}

function putRequest(url, data) {
    var postRequest = wxPromisify(wx.request)
    wx.showNavigationBarLoading()
    return postRequest({
        url: url,
        method: 'PUT',
        data: data,
        header: getHeader(),
    
    })
}

function deleteRequest(url, data) {
    var postRequest = wxPromisify(wx.request)
    wx.showNavigationBarLoading()
    return postRequest({
        url: url,
        method: 'DELETE',
        data: data,
        header: getHeader(),
    
    })
}

function getHeader() {
    let openid = wx.getStorageSync('openid');
    let userId = wx.getStorageSync('loginUserId');

    if (!openid || openid == '') {
        openid = 'anonymous'
    }

    var timestamp = new Date().getTime();
    var nonce = genNonce();

    let mac = "openid=" + openid + " userId=" + userId;
    mac += " timestamp=" + timestamp;
    mac += " nonce=" + nonce;

    let sign = md5.md5(config.SECRETKEY + mac);
    mac += " sign=" + sign;
    
    return {
        'Authentication': 'Mac ' + mac,
        "content-type": "application/json"
    }
}

// 随机数
function genNonce() { 
    var num = ""; 
    for(var i = 0; i < 6; i++) { 
        num += Math.floor(Math.random()*10); 
    } 
    return num
}

module.exports = {
    postRequest: postRequest,
    getRequest: getRequest,
    putRequest: putRequest,
    deleteRequest: deleteRequest
}