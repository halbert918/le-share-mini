// templates/components/popup/popup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowPopup: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: 'tilte'
    },
    height: {
      type: String,
      value: '500'
      //value: '80%'
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击蒙版关闭模态框
    closeMasking: function () {
      this.setData({
        isShowPopup: false
      })
      this.triggerEvent('close', {})
    }
  }
})
