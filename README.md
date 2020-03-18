## 前端框架

这是一个基于cocos creator的前端框架

### ccc版本

v **2.3.1**

### 包括并不仅限于以下列举的内容  

- [音频管理器](assets/common/scripts/audio_manager/AudioMgr.ts)

- [WYSIWYG的bezier编辑器](assets/common/scripts/bezier)

- [简易的DI(依赖注入)系统](assets/common/scripts/DI/DI.ts)

- [通用状态机模型](assets/common/scripts/state_machine/StateMachine.ts)

- [lazy-update框架](assets/common/scripts/display/Display.ts)
  - 自我驱动的界面刷新机制

- [数据绑定框架](assets/common/scripts/display/DataBinding.ts)
  - 数据驱动的界面刷新机制

- [热更新系统](assets/common/scripts/hot_update)
  - 基于通用状态机模型的热更新管理系统

- [基于WebSocket和通用状态机模型实现的网络管理器](assets/common/scripts/net/NetStateMachine.ts)
  - 连接
  - 断开
  - 自动重连
  - 自动重定向

- [Http封装](assets/common/scripts/net/Http.ts)

- [弹框系统](assets/common/scripts/popup_manager)
  - 低耦合
  - 易于使用
  - 高度可定制（无论弹窗的形态或者进出场动画）

- [网络协议分发](assets/common/scripts/protocol_dispatch/ProtocolDelegate.ts)
  - 易于装卸
  - 易于多播

- [通用性强的UI组件](#通用UI组件)

- ~~可能用的上的shader效果~~ <a href="#note1" id="note1ref"><sup>1</sup></a>

### 通用UI组件

包括并不限于:

- [全屏拉伸](assets/common/scripts/ui_component/FitScreen.ts)

- [手势识别器](assets/common/scripts/ui_component/GestureRecognizer.ts)

- [虚拟列表](assets/common/scripts/ui_component/ListView.ts)

- [另一种虚拟列表实现](assets/common/scripts/ui_component/TableView.ts)

- [网络图片装载器](assets/common/scripts/ui_component/ImgViewerPopup.ts)

- [通用选项卡](assets/common/scripts/ui_component/Tabbar.ts)

- [通用提示框](assets/common/scripts/ui_component/TipsPopup.ts)

- [通用等待框](assets/common/scripts/ui_component/WaitingPopup.ts)

- [通用确认框](assets/common/scripts/ui_component/MsgBoxPopup.ts)

### 一些有用的工具函数

- [流程控制](assets/common/scripts/Flow.ts)

- [bezier工具函数](assets/common/scripts/bezier/BezierUtils.ts)

- [七七八八的工具函数](assets/common/scripts/Utils.ts)

- [全局事件监听系统](assets/common/scripts/SYEventManager.ts)

### 说明

<a id="note1" href="#note1ref"><sup>1</sup></a>因ccc的材质系统升级，已经失效，待适配新系统后再提供
