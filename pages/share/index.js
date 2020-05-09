var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxRequest = require('../../utils/wxRequest.js')
Page({
  data: {
    formats: {},
    readOnly: false,
    placeholder: '请开始你的分享...',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false, 
    title: '',
    canPost: false
  },
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  onLoad() {
    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    this.setData({ isIOS})
    const that = this
    this.updatePosition(0)
    let keyboardHeight = 0
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          }
        })
      }, duration)

    })
  },
  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const { windowHeight, platform } = wx.getSystemInfoSync()
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
    this.setData({ editorHeight, keyboardHeight })
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const { statusBarHeight, platform } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
    }).exec()
  },
  blur() {
    this.editorCtx.blur()
  },
  format(e) {
    let { name, value } = e.target.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)

  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({ formats })
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        console.log('insert divider success')
      }
    })
  },
  clear() {
    this.editorCtx.clear({
      success: function (res) {
        console.log("clear success")
      }
    })
  },
  removeFormat() {
    this.editorCtx.removeFormat()
  },
  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    })
  },
  insertImage() {
    const that = this
    wx.chooseImage({
      count: 1,
      success: function (res) {
        that.editorCtx.insertImage({
          src: res.tempFilePaths[0],
          data: {
            image: 'image'
          },
          width: '80%',
          success: function () {
            console.log('insert image success')
          }
        })
      }
    })
  },

  onBindinput: function(e) {
  
  },

  // 获取title
  inputTitle:function(e) {
    this.setData({
      title: e.detail.value,
      canPost: true
    })
  },

  // 取消-返回首页
  onCancle() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  // 发布文章
  postArticle() {
    const that = this
    that.editorCtx.getContents({
      success: function(res) {
        console.log(res)
        if (that.data.title === '') {
          return that.showErrorTips('请输入文章标题')
        }
        if (res.text && res.text.trim().length == 0) {
          return that.showErrorTips('请输入文章内容')
        }
        // 初始化数据
        var article = {
          title: that.data.title,
          type: 0,  // 0:文章
          content: res.html,
          images: function() {
            let images = []
            const delta = res.delta
            if (delta && delta.ops) {
              let index = 0;
              delta.ops.map(e => {
                if (e.insert && e.insert.image) {
                  images.push(e.insert.image)
                  if (++index > 3) {    //只存储3张图片用于首页列表展示
                    return images
                  }
                }
              })
            }
            return images
          }()
        }
        console.log("article = ", article)
        var postArticleRequest = wxRequest.postRequest(Api.postArticle(), article)
        postArticleRequest.then(response => {
          if (response.code === '200') {
            return that.showSuccessTips('发布成功')
          } else {
            
          }
          console.log("response = ", response)
        }).catch(function (response) {
          console.log(response);
          self.setData({
            showerror: "block",
            floatDisplay: "none"
          });
        }).finally(function () { });
      },
    })
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
  }
})
