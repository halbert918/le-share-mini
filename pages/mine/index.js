
import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js');
var app = getApp();
var webSiteName= config.getWebsiteName;
var domain =config.getDomain

const pageCount = config.getPageCount;
Page({

  data: {    
    readLogs: [],
    topBarItems: [
        // id name selected 选中状态
        { id: '0', name: '文章', key: 'article', selected: true },
        { id: '1', name: '评论', key: 'comment', selected: false },
        { id: '2', name: '点赞', key: 'like', selected: false },
        { id: '3', name: '收藏', key: 'collect', selected: false},
        { id: '4', name: '关注', key: 'follow', selected: false },
        { id: '5', name: '粉丝', key: 'fans', selected: false },
        // { id: '6', name: '言论', selected: false }
    ],
    tab: '1',
    showerror: "none",
    shownodata: "none",
    showMessage: '',
    subscription:"",
    userInfo:{},
    userLevel:{},
    openid:'',
    isLoginPopup: false ,
    webSiteName:webSiteName,
    domain:domain,
    page: 1,
    isLastPage: false,
    templateKey: 'comment',

    isShowModal: false,
    popupHeight: '100rpx',
    popupTitle: '', 
    curArtId: '',       //当前操作的文章ID
    curArtType: 0,      //当前操作文章类型，默认为文章
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
    var self = this;     
    self.fetchPostsData('0');
    Auth.setUserInfoData(self); 
    Auth.checkLogin(self);
  },

  onReady: function () {
    var self = this;   
    Auth.checkSession(self,'isLoginNow');
  },
  agreeGetUser:function(e) {
    let self= this;
    Auth.checkAgreeGetUser(e,app,self,'0');        
  }, 

  refresh:function(e){
    var self=this;
    if (self.data.openid) {
        var args={};
        var userInfo=e.detail.userInfo;
        args.openid=self.data.openid;
        args.avatarUrl=userInfo.avatarUrl;
        args.nickname =userInfo.nickName;
        var url = Api.getUpdateUserInfo();        
        var postUpdateUserInfoRequest = wxRequest.postRequest(url, args);
        postUpdateUserInfoRequest.then(res => {
            if (res.data.status == '200') {
                    var userLevel= res.data.userLevel;                            
                    wx.setStorageSync('userInfo',userInfo);                           
                    wx.setStorageSync('userLevel',userLevel);                            
                    self.setData({userInfo:userInfo});
                    self.setData({userLevel:userLevel});
                    wx.showToast({
                        title: res.data.message,
                        icon: 'success',
                        duration: 900,
                        success: function () {
                        }
                    })   
            } else{               
                wx.showToast({
                    title: res.data.message,
                    icon: 'success',
                    duration: 900,
                    success: function () {
                    }
                })
            }
        });
    } else {
        Auth.checkSession(self,'isLoginNow');
        
    }
           
  },

  exit:function(e) {
    Auth.logout(this);
    wx.reLaunch({
        url: '../index/index'
      })
  },
  clear:function(e) {
    Auth.logout(this); 
  },

  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id;
    var itemtype = e.currentTarget.dataset.itemtype;
    var url ="";
    if (itemtype=="1")
    {
        url = '../list/list?categoryID=' + id;
    }
    else
    {
        url = '../detail/detail?id=' + id;

    }
      
    wx.navigateTo({
      url: url
    })
  },
  onTapTag: function (e) {
      var self = this;
      var tab = e.currentTarget.id;
      var topBarItems = self.data.topBarItems;
      // 切换topBarItem 
      for (var i = 0; i < topBarItems.length; i++) {
          if (tab == topBarItems[i].id) {
              topBarItems[i].selected = true;
          } else {
              topBarItems[i].selected = false;
          }
      }
      self.setData({
          topBarItems: topBarItems,
          tab: tab

      })
      if (tab !== 0) {
          this.fetchPostsData(tab);
      } else {
          this.fetchPostsData("1");
      }
  },
  onShareAppMessage: function () {
      var title = "分享我在“" + config.getWebsiteName + "浏览、评论、点赞、鼓励的文章";
      var path = "pages/readlog/readlog";
      return {
          title: title,
          path: path,
          success: function (res) {
              // 转发成功
          },
          fail: function (res) {
              // 转发失败
          }
      }
  },
  fetchPostsData: function (tab) {
      self = this;
      self.setData({
          showerror: 'none',
          shownodata:'none'
      }); 
     var count =0;
     var openid = "";
     if(tab =='0') {
        if (self.data.openid) {
          var openid = self.data.openid;
        } else {
           Auth.checkSession(self,'isLoginNow');
           return;
        }
      }
      if (tab == '-1') {
          self.setData({
              readLogs: (wx.getStorageSync('readLogs') || []).map(function (log) {
                  count++;
                  return log;
              }),
              templateKey: 'log'
          });
          if (count == 0) {
              self.setData({
                  shownodata: 'block'
              });
          }
      } else if (tab == '0') {
          self.setData({
            page: 1,
            isLastPage: false,
            readLogs: [],
            templateKey: 'article'
        });
        self.getMyArticles()
      } else if (tab == '1') {
        self.setData({
            page: 1,
            isLastPage: false,
            readLogs: [],
            templateKey: 'comment'
        });
        self.getMyComments()
      } else if (tab == '2') {
        self.setData({
            page: 1,
            isLastPage: false,
            readLogs: [],
            templateKey: 'like'
        });
        self.getMyLikes()
      } else if (tab == '3') {
        self.setData({
            page: 1,
            isLastPage: false,
            readLogs: [],
            templateKey: 'collect'
        });
        self.getMyCollects();
      } else if (tab == '4') {
        self.setData({
            page: 1,
            isLastPage: false,
            readLogs: [],
            templateKey: 'follow'
        });
        self.getMyFollows() 
     } else if (tab == '5') {
        self.setData({
            page: 1,
            isLastPage: false,
            readLogs: [],
            templateKey: 'fans'
        });
        self.getMyFans() 
      } else if (tab == '6'){
          self.setData({
              readLogs: []
          });
          var getNewComments = wxRequest.getRequest(Api.getNewComments());
          getNewComments.then(response => {
              if (response.statusCode == 200) {
                  self.setData({
                      readLogs: self.data.readLogs.concat(response.data.map(function (item) {
                          count++;
                          item[0] = item.post;
                          item[1] = util.removeHTML(item.content.rendered + '(' + item.author_name + ')');
                          item[2] = "0";
                          return item;
                      }))
                  });
                  if (count == 0) {
                      self.setData({
                          shownodata: 'block'
                      });
                  }

              }
              else {
                  console.log(response);
                  self.setData({
                      showerror: 'block'
                  });

              }
          }).catch(function () {
              console.log(response);
              self.setData({
                  showerror: 'block'
              });

          })
      }
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

    //加载分页
    loadMore: function (e) {
        var self = this;
        if (!self.data.isLastPage) {
            self.setData({
                page: self.data.page + 1
            });
            this.getMyComments();
        } else {
            wx.showToast({
                title: '没有更多内容',
                mask: false,
                duration: 1000
            });
        }
    },
    onReachBottom: function () {
        var self = this;
        if (!self.data.isLastPage) {
          self.setData({
            page: self.data.page + 1
          });
          this.doRequestNextPage();
        } else {
          console.log('最后一页');
        }
    
    },
    doRequestNextPage: function() {
        if (this.data.templateKey == 'comment') {
            this.getMyComments()
        } else if (this.data.templateKey == 'like') {
            this.getMyLikes()
        } else if (this.data.templateKey == 'article') {
            this.getMyArticles()
        } else if (this.data.templateKey == 'follow') {
            this.getMyFollows()
        } else if (this.data.templateKey == 'like') {
            this.getMyLikes()
        }
    },
    // 获取我发布的文章
    getMyArticles: function() {
        var offset = (self.data.page - 1) * pageCount
        this.doRequest(Api.getMyArticles(offset, pageCount))
    },
    // 获取我的评论
    getMyComments: function() {
        var offset = (self.data.page - 1) * pageCount
        this.doRequest(Api.getMyComments(offset, pageCount))
    },
    // 获取我的点赞文章
    getMyLikes: function() {
        var offset = (self.data.page - 1) * pageCount
        this.doRequest(Api.getMyLikes(offset, pageCount))
    },
    // 获取我的收藏文章
    getMyCollects: function() {
        var offset = (self.data.page - 1) * pageCount
        this.doRequest('')
    },
     // 获取我的收藏文章
     getMyFollows: function() {
        var offset = (self.data.page - 1) * pageCount
        this.doRequest(Api.getMyFollows(offset, pageCount))
    },
     // 获取我的收藏文章
     getMyFans: function() {
        var offset = (self.data.page - 1) * pageCount
        this.doRequest(Api.getMyFans(offset, pageCount))
    },

    doRequest: function(url) {
        var getResult = wxRequest.getRequest(url);
        getResult.then(response => {
            if (response.code == '200') {
                if (response.data.length < pageCount) {
                    self.setData({
                        isLastPage: true
                    });
                }
                self.setData({
                    readLogs: self.data.readLogs.concat(response.data)
                });
                if (self.data.readLogs && self.data.readLogs.length == 0) {
                    self.setData({
                        shownodata: 'block',
                        showMessage: '你还没有相关的记录哟～'
                    });
                }
            } else {
                self.setData({
                    shownodata: 'block',
                    showMessage: response.message,
                });
            }
        }).catch(function (response) {
            console.log(response)
            self.setData({
                shownodata: 'block',
                showMessage: '查询数据异常,请稍后再试',
            });
        });
    },

    onClickfollowBy: function (e) {
        var self = this;
        if (self.data.openid) {
          var req = {
            followby: e.target.dataset.followby
          }
          var url = ''
          if (e.target.dataset.status == '0') {
            url = Api.postUnFollowUrl() // 取消关注
          } else {
            url = Api.postFollowUrl()   // 关注
          }
          var postRequest = wxRequest.postRequest(url, req);
          postRequest
            .then(response => {
              if (response.code == '200') {
                self.setData({
                    readLogs: self.data.readLogs.map(v => {
                      return e.target.dataset.fid === v.id ? {...v, status: v.status == 0 ? 1 : 0} : v
                    })
                });
              }
            })
        } else {
          Auth.checkSession(self, 'isLoginNow');
        }
    },

    // 跳转至查看文章详情
    redictDetail: function (e) {
        // console.log('查看文章');
        console.log("id = ", e)
        var id = e.currentTarget.dataset.artid
        var type = e.currentTarget.dataset.type
        if (id !== '0') {
            wx.navigateTo({
                url: '/pages/detail/detail?id=' + id + "&type=" + type
            }) 
        }
        
    },

    // 长按事件
    handleLongPress: function(e) {    
        this.setData({ 
            curArtId: '',
        })

        var artId = e.currentTarget.dataset.artid;
        var artType = e.currentTarget.dataset.type;
        var title = ''
        for (var i in self.data.readLogs) {
            var article = self.data.readLogs[i]
            console.log(article, artId)
            if (article.id === artId) {
                if (article.type == 0) {
                    title = article.title
                } else {
                    title = article.content
                }
                break
            }
        }
        if (title.length > 15) {
            title = title.substr(0, 15) + "..."
        }
        this.setData({ 
            isShowModal: !this.data.isShowModal,
            popupHeight: "60px",
            popupTitle: title,
            curArtId: artId,
            curArtType: artType,
        })
    },

    // 删除我的文章
    delete: function(e) {
        var self = this;
        var artId = e.currentTarget.dataset.id;
        if (self.data.openid) {
            var deleteReequest = wxRequest.deleteRequest(Api.deleteArticle(artId));
            deleteReequest
              .then(response => {
                if (response.code == '200') {
                    var articles = self.data.readLogs
                    for (let i = 0; i < articles.length; i++) {
                        if (articles[i].id === artId) {
                            articles.splice(i,1); // 删除数据
                            break;
                        }
                    }
                    self.setData({
                        isShowModal: false,
                        readLogs: articles
                    });

                }
              })
          } else {
            Auth.checkSession(self, 'isLoginNow');
          }
    },
    //更新我的文章
    update: function(e) {
        var artId = e.currentTarget.dataset.id;
        var artType = e.currentTarget.dataset.type;
        if (artType == 0) {
            this.redictEdit('../write/index?id=' + artId)
        } else {
            this.redictEdit('../share/share?id=' + artId)
        }
       
    },

    // 跳转至编辑页面
    redictEdit: function(url) {
        var that = this;
        wx.navigateTo({
            url: url,
            success: function() {
                that.setData({
                    isShowModal: false,
                })
            }
        })
    },

    closeModal: function () {
        var that = this;
        setTimeout(function() {
          that.setData({
            isShowModal: false,
          })
        }, 720) //先执行下滑动画，再隐藏模块 
    },
})