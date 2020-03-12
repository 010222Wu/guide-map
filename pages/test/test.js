// pages/new/new.js

//调用list页面所需信息
var listData = require('../../data/list.js');

// toasjdfk
var toView;
var widths;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 手机页面高度
    windowHeight: 0,
    statusBarHeight: 0,
    titleBarHeight: 0,
    mapHeight: 0,
    menu: [],
    listItem: null,
    scale: 18,
    // 这里的lon、lat默认为中南大学南校区文法楼
    longitude: 112.936395,
    latitude: 28.160311,
    // 弹窗
    show: true,
    toView: '',
    srollLeft: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let name = listData.init[0].varName
    this.getWindowHeight();
    this.setData({
      menu: listData.init,
      listItem: listData[name][0].content,
      toView: listData[name][0].content[0].id,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取menu-item宽度信息
    const query = wx.createSelectorQuery()
    query.selectAll('.menu-item').boundingClientRect()
    query.exec(function (res) {
      widths = new Array(res[0].length)
      for (let i = 0; i < widths.length; i++) {
        widths[i] = res[0][i].left
      }
    })
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

  /**
   * 获取页面的高度
   */
  getWindowHeight: function () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        var statusBarHeight = res.statusBarHeight;
        var titleBarHeight;
        // 确定titleBar高度（区分安卓和苹果
        if (wx.getSystemInfoSync().system.indexOf('iOS') > -1) {
          titleBarHeight = 44
        } else {
          titleBarHeight = 48
        }
        var contentHeight = res.windowHeight - statusBarHeight - titleBarHeight
        console.log('windowHeight: ' + res.windowHeight)
        that.setData({
          windowHeight: res.windowHeight,
          statusBarHeight: statusBarHeight,
          titleBarHeight: titleBarHeight,
          mapHeight: contentHeight - 32,  // menuBar: 32px
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },

  /**
   * 更新列表
   */
  updateList: function (e) {
    let index = e.currentTarget.dataset.index
    let name = this.data.init[index].varName
    this.setData({
      listItem: listData[name][0].content,
      toView: listData[name][0].content[0].id,
      scrollLeft: widths[index - 1],
      show: true,
    })
  },

  onClose: function () {
    this.setData({
      show: false
    })
  },

  tapMarker: function (e) {
    toView = e.markerId
    this.setData({
      show: true,
    })
  },

  scrollIntoView: function () {
    this.setData({
      toView: toView,
    })
  },

  selectDestination: function (e) {
    let index = e.currentTarget.dataset.index
    let item = this.data.listItem[index]
    this.setData({
      longitude: item.longitude,
      latitude: item.latitude,
      toView: item.id,
      scale: 18,
      show: false,
    })
  }
})