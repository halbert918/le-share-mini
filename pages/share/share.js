// pages/share/share.js
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxRequest = require('../../utils/wxRequest.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    countPic:9,       //上传图片最大数量
    showImgUrl: "",   //路径拼接，一般上传返回的都是文件名，
    uploadImgUrl:'',  //图片的上传的路径
    min: 0,
    max: 500,
    content: '',

    canPost: false,
    curId: '',
    isEdit: false,  //默认新增
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.editArticle(options.id)
    }
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 初始化编辑页
  editArticle(id) {
    const that = this

    var getArticleRequest = wxRequest.getRequest(Api.getMyArticleByID(id))
    getArticleRequest.then(response => {
      if (response.code === '200') {
        this.setData({
          curId: id,
          isEdit: true,
          canPost: true,
          textValue:  response.data.content,
        })
        var images = response.data.images
        if (images && images.length > 0) {
          var imageUrls = [].concat(images.map(function (item) {
            return item.imageUrl
          }))
          // 初始化组件images
          var uploadCom = that.selectComponent('#uploadImage');
          uploadCom.setData({
            detailPics: imageUrls
          })
        }
      }
    })
  },

  inputs: function (e) {
    var value = e.detail.value;
    var len = parseInt(value.length);
    if (len > this.data.max) return;

    this.setData({
      currentWordNumber: len,
      canPost: true,
      content: value
    });
    // if(this.data.currentWordNumber == 20){
    //   wx.showModal({
    //     title: '提示',
    //     content: '您输入的次数已达上限',
    //   })
    // }
  },
  //监听组件事件，返回的结果
  myEventListener:function(e){
    console.log("上传的图片结果集合")
    console.log(e.detail.picsList)
  },

  //获取textarea
  bindTextAreaBlur: function(e) {
    this.setData({
      content: e.detail.value
    }) 
  }, 

   // 发布文章
  postArticle() {
    const that = this
    var uploadCom = this.selectComponent('#uploadImage');

    var article = {
      title: '',
      type: 1,  // 1:动态
      content: that.data.content,
      images: uploadCom.data.detailPics
    }

    var postArticleRequest
    if (that.data.isEdit) { // 编辑
      postArticleRequest = wxRequest.putRequest(Api.putArticle(that.data.curId), article)
    } else {                // 新增
      postArticleRequest = wxRequest.postRequest(Api.postArticle(), article)
    }
    // var postArticleRequest = wxRequest.postRequest(Api.postArticle(), article)
    postArticleRequest.then(response => {
      if (response.code === '200') {
        that.showSuccessTips('发布成功')
        wx.switchTab({
          url: '/pages/module/sub-module',
        })
      } else {
        return that.showErrorTips(response.message)
      }
    }).catch(function (response) {
      console.log(response);
      that.setData({
        showerror: "block",
        floatDisplay: "none"
      });
    }).finally(function () { });
    
  },

  // 取消-返回首页
  onCancle() {
    if (this.data.content == '') {
      wx.switchTab({
        url: '/pages/module/sub-module',
      })
    } else{
      wx.showModal({
        content: '确定放弃当前编辑内容？',
        showCancel: true,//是否显示取消按钮
        cancelColor:'skyblue',//取消文字的颜色
        confirmColor: 'skyblue',//确定文字的颜色
        success: function (res) {
           if (res.cancel) {
              //点击取消,默认隐藏弹框
           } else {
              //点击确定
              wx.switchTab({
                url: '/pages/module/sub-module',
              })
           }
        }
      })
    }
  },

  // 错误提示
  showErrorTips(message){
    wx.showToast({
      title: message,
      image: '../../images/cry80.png',
      duration: 2000
    })
    return false
  },
  // 成功提示
  showSuccessTips(message){
    wx.showToast({
      title: message,
      duration: 2000
    })
    return true
  },
})