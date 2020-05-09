// pages/module/sub-module.js
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var Auth = require('../../utils/auth.js');
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'

var app = getApp();

var pageCount = config.getPageCount;

var webSiteName = config.getWebsiteName;
var domain =config.getDomain;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    postsList: [],
    isLastPage: false,
    page: 1,
    categories: 0,
    showerror: 'none',
    type: 1, // 动态

    webSiteName:webSiteName,
    domain:domain,
    isLoading: false,

    openid: "",
    isLoginPopup: false,
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    // 获取内容列表
    self.fetchPostsData(self.data)


    Auth.setUserInfoData(self);
    Auth.checkLogin(self);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var self = this;
    self.setData({
      showerror: "none",
      showallDisplay: "block",
      displaySwiper: "none",
      floatDisplay: "none",
      isLastPage: false,
      page: 1,
    });
    this.fetchPostsData(self.data);

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("==============")

    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    } else {
      console.log('最后一页');
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //加载分页
  loadMore: function (e) {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      this.fetchPostsData(self.data);
    } else {
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },

  // 获取文章信息
  fetchPostsData: function (data) {
    var self = this;
    if (!data.search) data.search = '';
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };    
    
    self.setData({ 
      isLoading: true,
    })

    // 动态
    data.categories = 1

    // 下拉刷新以此为条件，防止数据重复
    data.prevId = function() {
      if(self.data.postsList) {
        var len = self.data.postsList.length
        // 获取最后一条文章ID
        return len > 1 ? self.data.postsList[len - 1].id : ''
      }
      return ''
    }()

    var getPostsRequest = wxRequest.getRequest(Api.getArticles(data));
    getPostsRequest
      .then(response => {
        console.log("response", response.data)
        if (response.code === '200') {
          if (response.data) {
            if (response.data.length < pageCount) {
              self.setData({
                isLastPage: true,
                isLoading: false
              });
            }    
            self.setData({
              floatDisplay: "block",    
              postsList: self.data.postsList.concat(response.data.map(function (item) {

                var strdate = item.createTime
                if (item.category_name != null) {

                  item.categoryImage = "../../images/category.png";
                } else {
                  item.categoryImage = "";
                }

                if (item.content.length >= 120) {
                  item.content = item.content.substr(0, 120) + "..."
                }

                item.mutilImage = true; // 默认已多图样式展示
                item.post_medium_image = '';

                item.createTime = util.getDateDiff(strdate);
                return item;
              })),
            });
            
          } else {
            if (response.data.code == "rest_post_invalid_page_number") {
              self.setData({
                isLastPage: true,
                isLoading: false
              });
              wx.showToast({
                title: '没有更多内容',
                mask: false,
                duration: 1500
              });
            } else {
              wx.showToast({
                title: response.message,
                duration: 1500
              })
            }
          }
        }
      })
      .catch(function (response) {
        if (data.page == 1) {
          self.setData({
            showerror: "block",
            floatDisplay: "none"
          });

        } else {
          wx.showModal({
            title: '加载失败',
            content: '加载数据失败,请重试.',
            showCancel: false,
          });
          self.setData({
            page: data.page - 1
          });
        }
      })
      .finally(function (response) {
        wx.hideLoading();
        self.setData({ isLoading: false })
        wx.stopPullDownRefresh();
      });
  },

  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
    console.log("id = ", e.currentTarget.id)
    var id = e.currentTarget.id,
    
    url = '../detail/detail?id=' + id + '&type=1';
    wx.navigateTo({
      url: url
    })
  },

  // toShare: function (e) {
  //   wx.navigateTo({
  //     url: '../share/share'
  //   })
  // },

  toShare: function (e) {
    var self = this
    if (!self.data.openid) {
      Auth.checkSession(self, 'isLoginNow');
      return
    }
    wx.navigateTo({
      url: '../share/share'
    })
  },

  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, '0');;
    // 登陆后跳转到分享页
    wx.navigateTo({
      url: '../share/share'
    })
  },
  closeLoginPopup() {
    this.setData({ isLoginPopup: false });
  },
  openLoginPopup() {
    this.setData({ isLoginPopup: true });
  },
  confirm: function () {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  },

})