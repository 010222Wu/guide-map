// pages/home/home.js

//调用list页面所需信息
var listData = require('../../data/list.js');

// setData的常见错误使用方法
// https://developers.weixin.qq.com/miniprogram/dev/framework/performance/tips.html


// listItem 说不定可以优化

// hintMessage 也可以优化


//不是用于页面渲染的数据放置此处、优化小程序性能

//用于获取屏幕信息 适配屏幕大小
var windowHeight = 0;
//监听list是否展开
var isListUnfold = true
//调取微信内置地图时、传入的参数
var navigateName;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    //状态栏和标题栏的高度
    statusBarHeight: 0,
    titleBarHeight: 0,
    //菜单、地图、提示语、列表高度
    menuHeight: 0,
    mapHeight: 0,
    hintHeight: 0,
    listHeight: 0,
    //用于标记当前id是否展开
    selectedMenu: '快递点',
    // 这里的lon、lat默认为中南大学南校区文法楼
    longitude: 112.936395,
    latitude: 28.160311,
    //地图缩放级别
    scale: 18,
    //存放list信息
    list: [],
    //存放list-item信息
    listItem: [],
    //提示语信息
    hintMessage: '',
    //将地图中选中的marker对应的地点在list中显现
    toView: '',
    arrsrc: '../../img/arrDown.png',
    //用于菜单栏点击变色
    id: '',
    //用于打开关于我们界面
    isAboutShown: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('onLoad--------------------->');
    this.setData({
      list: listData.init,
      listItem: listData.kuaididian[0].content,
      hintMessage: '共有' + listData.kuaididian[0].total + '个' + listData.kuaididian[0].head
    })
    //获取小程序实例，访问app.js中的函数
    this.app = getApp();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(e) {
    console.log('onReady--------------------->');
    this.mapCtx = wx.createMapContext('myMap')
    this.includePoints()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(e) {
    console.log('onShow--------------------->');
    this.getWindowHeight();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /** 
   * 获取用户设备屏幕高度
   */
  getWindowHeight: function() {
    var that = this
    wx.getSystemInfo({
      success: function(res) {
        var statusBarHeight = res.statusBarHeight;
        var titleBarHeight;
        // 确定titleBar高度（区分安卓和苹果
        if (wx.getSystemInfoSync().system.indexOf('iOS') > -1) {
          titleBarHeight = 44
        } else {
          titleBarHeight = 48
        }
        windowHeight = res.windowHeight - statusBarHeight - titleBarHeight
        that.setData({
          statusBarHeight: statusBarHeight,
          titleBarHeight: titleBarHeight,
          // setMapHeight
          menuHeight: windowHeight * 0.06,
          hintHeight: windowHeight * 0.07 - 1, //  for border-bottom: 1px
          listHeight: windowHeight * 0.38,
          mapHeight: windowHeight * 0.49,
          arrsrc: '../../img/arrDown.png',
        })
      },
    })
  },

  scopeSetting: function() {
    var that = this;
    wx.getSetting({
      success(res) {
        //地理位置
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success(res) {
              that.moveToLocation();
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '定位失败，你未开启定位权限，点击开启定位权限',
                success: function(res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: function(res) {
                        if (res.authSetting['scope.userLocation']) {
                          that.moveToLocation();
                        } else {
                          console.log('用户未同意地理位置权限')
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        } else {
          that.moveToLocation();
        }
      }
    })
  },

  /**
   * 请求用户所在地理位置、并移动到地图中心
   */
  moveToLocation: function () {
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          scale: 16,
        })
      },
    })
  },

  /**
   * 选择门类
   */
  selectMenu: function (e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    if (this.data.selectedMenu == id) {
      return;
    } else {
      this.data.selectedMenu = id
    }
    var listItem = listData[name][0]
    this.changeHintMessage(listItem)
    this.setData({
      listItem: listItem.content,
      selectedMenu: this.data.selectedMenu,
      id: '',
    })
    this.includePoints()
  },

  /**
   * 改动提示信息
   */
  changeHintMessage: function (e) {
    this.setData({
      hintMessage: '共有' + e.total + '个' + e.head,
    })
  },

  /**
   * 缩放比例使得标点能全部显现
   */
  includePoints: function() {
    var that = this
    this.mapCtx.includePoints({
      padding: [80],
      points: this.data.listItem
    })
  },

  /**
   * 选取目的地、获取经纬度
   */
  selectDestination: function(e) {
    var that = this
    var locationId = e.target.id
    if (locationId != undefined) {
      that.setData({
        id: locationId
      })
    }
    var locations = this.data.listItem
    let index
    for (index in locations) {
      if (locationId == locations[index].id) {
        that.setData({
          latitude: locations[index].latitude,
          longitude: locations[index].longitude,
          scale: 18,
        })
        navigateName = locations[index].title
        return;
      }
    }
  },

  /** 
   *点击地图时列表失去聚焦
   */
  outFocus: function() {
    this.setData({
      id: ''
    })
  },

  /**
   * 得到scroll—view的id 实现scrll-into-view的功能
   */
  getDestinationId: function(e) {
    if (!this.data.isAboutShown) {
      if (!isListUnfold){
        this.setData({
          toView: e.markerId,
          id: e.markerId,
          listHeight: windowHeight * 0.38,
          mapHeight: windowHeight * 0.49,
          arrsrc: '../../img/arrDown.png',
        })
      }
      isListUnfold = !isListUnfold
    } else {
      this.setData({
        toView: e.markerId,
        id: e.markerId,
        listHeight: windowHeight * 0.38,
        mapHeight: windowHeight * 0.49,
        isAboutShown: false
      })
    }
  },

  /**
   * 改变列表的状态
   */
  changeListStatus: function () {
    if (this.data.isAboutShown) {
      return
    }
    if (isListUnfold) {
      this.setData({
        listHeight: 0,
        mapHeight: windowHeight * 0.87,
        arrsrc: '../../img/arrUp.png',
      })
    } else {
      this.setData({
        listHeight: windowHeight * 0.38,
        mapHeight: windowHeight * 0.49,
        arrsrc: '../../img/arrDown.png',
      })
    }
    isListUnfold = !isListUnfold
    if (this.data.id == '') {
      // 这里延时调用includePoints是因为上面的setData的mapHeight改变有点慢
      // 若不延时 则导致includePoints的padding错误
      // 但延时处理也有瑕疵
      // 如果mapHeight的更新速度仍然小于延时时间 则padding也有误
      setTimeout(function () {
        this.includePoints()
      }.bind(this), 40);
    }
  },

  /**
   * 调取导航界面、并获取相关数据
   */
  navigate: function(e) {
    //调用 selectDestination()解决参数没有更新的问题
    this.selectDestination(e)
    console.log(e)
    var that = this
    wx.openLocation({ //​使用微信内置地图查看位置。
      latitude: that.data.latitude,
      longitude: that.data.longitude,
      name: that.data.selectedMenu,
      address: navigateName
    })
    this.setData({
      id: ''
    })
  },

  /**
   * open the about us page
   */
  aboutUs: function () {
    if (!this.data.isAboutShown) {
      this.setData({
        isAboutShown: true,
      })
      if (!isListUnfold) {
        isListUnfold = true
        this.setData({
          listHeight: windowHeight * 0.38,
          mapHeight: windowHeight * 0.49,
          arrsrc: '../../img/arrDown.png',
        })
      }
      //延时展现容器2，做到瀑布流的效果
      setTimeout(function () {
        this.app.show(this, 'slide_up_text', 1)
      }.bind(this), 100);
      setTimeout(function () {
        this.app.show(this, 'slide_up_text1', 1)
      }.bind(this), 300);
    } else {
      this.app.show(this, 'slide_up_text', 0)
      this.app.show(this, 'slide_up_text1', 0)
      setTimeout(function () {
        this.setData({
          isAboutShown: false
        })
      }.bind(this), 600);
    }
  },

	/**
	 * 复制QQ号到剪贴板
	 */
  copyQQ: function () {
    wx.setClipboardData({
      data: '2420538090',
    })
  },
})