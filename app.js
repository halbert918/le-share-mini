/*
 * 
 * WordPres版微信小程序
 * author: jianbo
 * organization: 守望轩  www.watch-life.net
 * github:    https://github.com/iamxjb/winxin-app-watch-life.net
 * 技术支持微信号：iamxjb
 * Copyright (c) 2017 https://www.watch-life.net All rights reserved.
 * 
 */

var Mock = require("./utils/mock/WxMock.js"); 

App({
    
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 小程序主动更新
    this.updateManager();
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },/*小程序主动更新
    */
  updateManager() {
    if (!wx.canIUse('getUpdateManager')) {
      return false;
    }
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
    });
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '有新版本',
        content: '新版本已经准备好，即将重启',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      });
    });
    updateManager.onUpdateFailed(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败',
        showCancel: false
      })
    });
  },
  globalData: {
    userInfo: null,
    openid: '',
    isGetUserInfo: false,
    isGetOpenid: false

  }
})

// mock 头部轮播图
Mock.mock('post/swipe', {
  "code": 200,
  "data": {
    "code": '200',
    "posts": [{
      "id": 1,
      "type": 1,
      "post_full_image": "/images/logo700.png",
      "post_title": "测试新闻标题",
      "appid": "xxxxx",
      "url": "http://www.baidu.com"
    }, {
      "id": 2,
      "type": 2,
      "post_full_image": "/images/logo.png",
      "post_title": "测试",
      "appid": "xxxxx",
      "url": "http://www.baidu.com"
    }]
  }
})

// mock
Mock.mock('category/ids', {
  "statusCode": 200,
  "data": {
    "code": 200,
    "data": {
      "status": '200',
      "Ids": 0
    }
  }
})

// mock获取文章列表
Mock.mock('http://127.0.0.1:80891/articles?offset=1&limit=10', {
  "statusCode": 200,
  "data": {
    "code": "200",
    "data": [{
      "id": 1111,
      "post_medium_image": "",
      "title": "简单聊聊老罗直播",
      "createTime": "2020-04-15",
      "commentCount": 20,
      "likeCount": 150,
      "viewCount": 1209, 
      "images": [{
        "artId": 1252247377595732000,
        "imageUrl": "http://tmp/wx66406035197f18d9.o6zAJsyJ0CdFX-GtZm_esZVVNLiI.2E0V5rzrRBnEbc8c8b6f4c58dc458feeb1284558a5b9.png"
        },{
          "artId": 1252247377595732000,
          "imageUrl": "http://tmp/wx66406035197f18d9.o6zAJsyJ0CdFX-GtZm_esZVVNLiI.2E0V5rzrRBnEbc8c8b6f4c58dc458feeb1284558a5b9.png"
          },{
            "artId": 1252247377595732000,
            "imageUrl": "http://tmp/wx66406035197f18d9.o6zAJsyJ0CdFX-GtZm_esZVVNLiI.2E0V5rzrRBnEbc8c8b6f4c58dc458feeb1284558a5b9.png"
      }]
    },{
      "id": 1112,
      "post_medium_image": "",
      "title": "简单聊聊老罗直播简单聊聊老",
      "createTime": "2020-04-15",
      "commentCount": 20,
      "likeCount": 150,
      "viewCount": 1209,"images": [{
        "artId": 1252247377595732000,
        "imageUrl": "/images/entry-home.png"
        },{
          "artId": 1252247377595732000,
          "imageUrl": "/images/logo-icon.png"
          },{
            "artId": 1252247377595732000,
            "imageUrl": "/images/logo.png"
      }]
    },{
      "id": 1113,
      "post_medium_image": "",
      "title": "简单聊聊老罗直播",
      "createTime": "2020-04-15",
      "commentCount": 20,
      "likeCount": 150,
      "viewCount": 1209, 
    },{
      "id": 1115,
      "post_medium_image": "",
      "title": "简单聊聊老罗直播",
      "createTime": "2020-04-15",
      "commentCount": 20,
      "likeCount": 150,
      "viewCount": 1209, 
    },{
      "id": 1116,
      "post_medium_image": "",
      "title": "简单聊聊老罗直播",
      "createTime": "2020-04-15",
      "commentCount": 20,
      "likeCount": 150,
      "viewCount": 1209, 
    }]
  }
  
})

// mock 获取是否开启评论
Mock.mock('options/enableComment', {
  "statusCode": 200,
  "data": {
    "code": 200,
    "data": {
      "enableComment": '1'
    }
  }
})

// mock 获取文章内容页数据
Mock.mock('posts/1111', {
  "code": 200,
  "data": {
    "category_name": '杂谈',
    "title": {
      "rendered": "工作项列表接口，自动化规则开发"
    },
    "content": {
      "rendered": "hidden和wx:if都是微信小程序中通过条件来判断是否渲染该代码块的控制属性，通过布尔值(true/false)来控制组件的显示和隐藏，基本用法也很简单：hidden和wx:if都是微信小程序中通过条件来判断是否渲染该代码块的控制属性，通过布尔值(true/false)来控制组件的显示和隐藏"
    },
    "date": "2020-04-15",
    "total_comments": 13,
    "like_count": 32,
    "excitationAd": 0, //=1会加载广告
    "postImageUrl": "",
    "link": "",    //TODO
    "audios": []  //音频
  }
})

// mock 获取文章评论
Mock.mock('comment/getcomments?postid=1111&limit=10&page=1&order=desc', {
  "statusCode": 200,
  "data": {
    "comments": [{
      "id": 1111,
      "author_name": "yinbohe",
      "userid": "yinbohe",
      "formId": 1,
      "date": "2020-04-15",
      "content": "深度好文，收藏",
      "author_url": "/images/like.png"
    }],
    "message": "评论测试"
  }
})

