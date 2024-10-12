<template>
	<div class="app-container home">
	  <el-container style=" border: 1px solid #eee">
		<el-aside width="300px">
		  <el-menu>
			<div class="search-input">

			  <el-input
				  v-model="searhKey"
				  placeholder="请输入关键字"
				  class="input-with-select"
				  >
				  <template #append>
					  <el-button icon="Search" @click="fuzzyRetrieval"/>
				  </template>
				  </el-input>
			</div>

			<el-menu-item-group v-if="cameraList.length" style="margin-top: 20px">
			  <el-menu-item
				v-for="(item, index) in cameraList"
				:key="index"
				:index="item.cameraIndexCode"
			  >
				<div
				  @dblclick="videoDetails(item.cameraIndexCode)"
				  @click="cameraIndexCode = item.cameraIndexCode"
				  :title="item.cameraName"
				  class="cameraName-list"
				>
				  {{ item.cameraName }}
				</div>
			  </el-menu-item>
			</el-menu-item-group>

			<el-empty v-else description="暂无数据"></el-empty>
		  </el-menu>
		</el-aside>

		<el-container>
		  <el-header>
			<div>
			  <el-button type="primary" plain @click="stopAllPreview()">停止所有预览</el-button>
			  <el-button type="primary" plain @click="stopAllPlayBack()">停止所有回放</el-button>
			</div>
			<div>
			  <el-radio-group v-model="radioType" @change="changeVideoType" style="margin-right:10px;vertical-align: middle;">
				  <el-radio-button label="实时预览" value="0" />
				  <el-radio-button label="录像回放" value="1" />
			  </el-radio-group>
			  <el-date-picker
			  style="z-index: 99999;"
			  v-model="playbackTime"
			  type="datetimerange"
			  range-separator="至"
			  start-placeholder="开始日期"
			  end-placeholder="结束日期"
			  :disabled="radioType === '0'"
			  @focus="focusEvent"
			  @blur="blurEvent"
			  @change="videoDetails(cameraIndexCode)"

			  />
			</div>
		  </el-header>

		  <el-main>
			<div id="video_home" ref="videoHome"></div>
		  </el-main>
		</el-container>
	  </el-container>

	  <div
			id="drive-input"
			v-if="!isDrive"
			class="flex items-center justify-center mt16 w-full"
		  >
			<label
			  class="cursor-pointer w-full p-4 transition ease-in-out delay-150 bg-slate-200 dark:bg-[#262626] rounded-2 shadow border border-white justify-start items-center gap-3 inline-flex"
			>
			  <input type="checkbox" class="checkbox" />
			  <span
				class="dark:text-[#F2F2F2] text-gray-8 break-words overflow-y-auto grow"
				>这是一个示例</span
			  >
			</label>
		  </div>


	</div>
  </template>

  <script lang="ts" setup>
  import { driver } from 'driver.js';
  import 'driver.js/dist/driver.css';
  import { getCurrentInstance, nextTick, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
  import { SIGNATURE, SECRET, VIDEO_IP, VIDEO_PORT, APPKEY } from "@/utils/basicStaticData"
  import request from "@/utils/request";

  interface cameralItem {
	  cameraIndexCode: string;
	  cameraName: string

  }
  const { proxy } = getCurrentInstance() as any;
  //监控站点列表数据
  let cameraList: cameralItem[] = reactive([]);
  //监控站点列表数据 备用
  let cameraList_standby = reactive([]);
  //预览与回放的切换
  const radioType = ref("0");
  //搜索框绑定的值
  const searhKey = ref("");      //日期输入框
  const playbackTime = ref([]);
  //当前用户点击的 监控点编号
  const cameraIndexCode = ref("");      //视频窗口初始的固定宽度
  const idWidth = ref(0);      //视频窗口初始的固定高度
  const idHeight = ref("");
  const videoHome: any = ref(null);
  const value1 = ref([
  ])
  let initCount = 0;
  let pubKey = "";
  let oWebControl: any = null; //webc插件的实例对象

  declare let WebControl: any;
  declare let JSEncrypt: any


  watch(searhKey, (newValue: any, oldValue: any) => {
	  if (!newValue) {
		  cameraList = cameraList_standby;
	  }
  })
  const isDrive = ref(Boolean(sessionStorage.getItem('todo-driver')))


  const driverObj = driver({
	  showProgress: true,
	  allowClose: true,
	  onDestroyed: () => {
		  isDrive.value = true
		  sessionStorage.setItem('todo-driver', 'true')
	  },

	  steps: [
		  {
			  popover: {
				  title: '首次使用向导',
				  description: '欢迎来到本系统，接下来将为你介绍使用方式',
				  nextBtnText: '下一步',
				  prevBtnText: '前一步',
			  },
		  },
		  {
			  element: '#screenfull',
			  popover: {
				  title: '全屏展示',
				  description: '点击切换全屏展示',
				  nextBtnText: '下一步',
				  prevBtnText: '前一步',
			  },
		  },
		  {
			  element: '#drive-help',
			  popover: {
				  title: '操作提示',
				  description: '点击显示操作提示',
				  nextBtnText: '下一步',
				  prevBtnText: '前一步',
			  },
		  },
		  {
			  element: '#drive-input',
			  popover: {
				  title: '事项',
				  description: '单击完成该事项',
				  prevBtnText: '前一步',
				  nextBtnText: '下一步',
				  side: 'bottom',
				  align: 'center',
			  },
		  },
		  {
			  element: '#drive-trash',
			  popover: {
				  title: '删除',
				  description: '单击移除该事项',
				  prevBtnText: '前一步',
				  nextBtnText: '完成',
				  side: 'bottom',
				  align: 'center',
				  onNextClick: () => {
					  isDrive.value = true
					  sessionStorage.setItem('todo-driver', 'true')
					  driverObj.moveNext()
				  },
			  },
		  },
	  ],
  })

  onMounted(() => {
	  if (!isDrive.value) {
		  console.log("AAAAAAAAAAAAAAA")
		  driverObj.drive()
	  }

	  nextTick(() => {
		  //视频窗口初始的固定宽度,当前屏幕父元素的宽度
		  //   console.log(proxy.refs.videoHome, "RRRRRRRRRRRR")
		  console.log(videoHome.value.clientHeight, "WWWWWWWWW")
		  idWidth.value = videoHome.value.clientWidth;
		  idHeight.value = videoHome.value.clientHeight;
		  // 初始化web插件
		  initPlugin();

		  // 监听浏览器的变化
		  monitoringWindow();
	  });
	  //查询监控列表
	  // getCamerasList();
  })

  onBeforeUnmount(() => {
	  oWebControl.JS_HideWnd();
  });

  function dateFocus() {
	  oWebControl.JS_HideWnd();
	  console.log("dateFocus")
  }

  function visibleChange() {
	  console.log("visibleChange")
  }

  /**
	   * 分页查询查询的监控列表
	   *
	   */
  async function getCamerasList() {
	  const res = await request({
		  url: "artemis/api/resource/v1/cameras",
		  headers: {
			  "x-ca-signature": SIGNATURE,
		  },
		  method: "POST",
		  data: {
			  pageNo: 1,
			  pageSize: 460,
		  },
	  });
	  const {
		  data: { list },
	  } = res.data;
	  cameraList = list;
	  cameraList_standby = list;
  }

  /**
   * 创建WebControl实例与启动插件
   */
  function initPlugin() {
	  oWebControl = new WebControl({
		  szPluginContainer: "video_home", //指定容器id
		  iServicePortStart: 15900, //指定起止端口号，建议使用该值
		  iServicePortEnd: 15900,
		  cbConnectSuccess: () => {
			  //实例创建成功后需要启动服务
			  oWebControl
				  .JS_StartService("window", {
					  dllPath: "./VideoPluginConnect.dll",
				  })
				  .then(
					  () => {
						  oWebControl.JS_SetWindowControlCallback({
							  // 设置消息回调
							  cbIntegrationCallBack: cbIntegrationCallBack(),
						  });

						  oWebControl
							  .JS_CreateWnd("video_home", idWidth.value, idHeight.value)
							  .then(() => {
								  //JS_CreateWnd创建视频播放窗口，宽高可设定
								  init(); //创建播放实例成功后初始化
							  });
					  },
					  function () { }
				  );
		  },
		  cbConnectError: function () {
			  oWebControl = null;
			  console.error("插件未启动，正在尝试启动，请稍候...")
			  WebControl.JS_WakeUp("VideoWebPlugin://"); //程序未启动时执行error函数，采用wakeup来启动程序
			  initCount++;
			  if (initCount < 3) {
				  setTimeout(() => {
					  initPlugin();
				  }, 3000);
			  } else {
				  console.error("插件启动失败，请检查插件是否安装！")
			  }
		  },
	  });
  }

  /**
   * 海康视频插件初始化，用于为之后的回放，预览视频做准备
   */
  function init() {
	  // 获取公钥
	  getPubKey(() => {
		  var appkey = APPKEY; //综合安防管理平台提供的appkey，必填
		  var secret = setEncrypt(SECRET); //综合安防管理平台提供的secret，必填
		  var ip = VIDEO_IP; //综合安防管理平台IP地址，必填
		  var playMode = Number(radioType.value); //初始播放模式：0-预览，1-回放
		  var port = VIDEO_PORT; //综合安防管理平台端口，若启用HTTPS协议，默认443
		  var snapDir = "D:\\SnapDir"; //抓图存储路径
		  var videoDir = "D:\\VideoDir"; //紧急录像或录像剪辑存储路径
		  var layout = "2x2"; //playMode指定模式的布局
		  var enableHTTPS = 1; //是否启用HTTPS协议与综合安防管理平台交互，这里总是填1
		  var encryptedFields = "secret"; //加密字段，默认加密领域为secret
		  var showToolbar = 1; //是否显示工具栏，0-不显示，非0-显示
		  var showSmart = 0; //是否显示智能信息（如配置移动侦测后画面上的线框），0-不显示，非0-显示
		  var buttonIDs =
			  "0,16,256,257,258,259,260,512,513,514,515,516,517,768,769"; //自定义工具条按钮
		  var reconnectTimes = 2; // 重连次数，回放异常情况下有效
		  //var reconnectTime = 4;  // 每次重连的重连间>=reconnectTime

		  //  ****** 请自行修改以上变量值********

		  oWebControl
			  .JS_RequestInterface({
				  funcName: "init",
				  argument: JSON.stringify({
					  appkey: appkey, //API网关提供的appkey
					  secret: secret, //API网关提供的secret
					  ip: ip, //API网关IP地址
					  playMode: playMode, //播放模式（决定显示预览还是回放界面）
					  port: port, //端口
					  snapDir: snapDir, //抓图存储路径
					  videoDir: videoDir, //紧急录像或录像剪辑存储路径
					  layout: layout, //布局
					  enableHTTPS: enableHTTPS, //是否启用HTTPS协议
					  encryptedFields: encryptedFields, //加密字段
					  showToolbar: showToolbar, //是否显示工具栏
					  showSmart: showSmart, //是否显示智能信息
					  buttonIDs: buttonIDs, //自定义工具条按钮
					  reconnectTimes: reconnectTimes, //重连次数
					  //reconnectDuration：reconnectTime           //重连间隔
				  }),
			  })
			  .then(() => {
				  // 初始化后resize一次，规避firefox下首次显示窗口后插件窗口未与DIV窗口重合问题
				  oWebControl.JS_Resize(idWidth.value, idHeight.value);
			  });
	  });
  }

  /**
   * 监控视频实时预览
   * @param {String} cameraIndexCode 监控站点的编号
   */
  function videoPreview(cameraIndexCode: string) {
	  oWebControl.JS_RequestInterface({
		  funcName: "startPreview",
		  argument: JSON.stringify({
			  cameraIndexCode, //监控点编号，必填
			  streamMode: 0, //主子码流标识：0-主码流，1-子码流，选填
			  transMode: 1, // 传输协议：0-UDP，1-TCP，选填
			  gpuMode: 0, //是否启用 GPU 硬解，0-不启用，1-启用，选填
			  // wndId: playback_wind, // 播放窗口序号（在 2x2 以上布局下可指定播放窗口）选填
		  }),
	  });
  }

  /**
   * 监控视频回放
   * @param {String} cameraIndexCode 监控站点的编号
   * @param {Number} startTimeStamp 录像查询开始时间戳，单位：秒
   * @param {Number} endTimeStamp 录像查询结束时间戳，单位：秒
   */
  function video_Playback(cameraIndexCode: string, startTimeStamp: number, endTimeStamp: number) {
	  oWebControl.JS_RequestInterface({
		  funcName: "startPlayback",
		  argument: JSON.stringify({
			  cameraIndexCode, //监控点编号，必填
			  startTimeStamp, // 录像查询开始时间戳，单位：秒
			  endTimeStamp, // 录像查询结束时间戳，单位：秒
			  recordLocation: 1, // 录像存储类型 0-中心存储 1-设备存储
			  transMode: 1, // 传输协议 ，0-UDP 1-TCP
			  gpuMode: 0, // 是否开启 GPU 硬解，0-不开启 1-开
			  // wndId: playback_wind, // 播放窗口序号（在 2x2 以上布局下可指定播放窗口）选填
		  }),
	  });
  }
  // 获取公钥
  function getPubKey(callback: Function) {
	  oWebControl
		  .JS_RequestInterface({
			  funcName: "getRSAPubKey",
			  argument: JSON.stringify({
				  keyLength: 1024,
			  }),
		  })
		  .then(function (oData: any) {
			  // console.log(oData);
			  if (oData.responseMsg.data) {
				  pubKey = oData.responseMsg.data;
				  callback();
			  }
		  });
  }

  // RSA加密
  function setEncrypt(value: any) {
	  var encrypt = new JSEncrypt();
	  encrypt.setPublicKey(pubKey);
	  return encrypt.encrypt(value);
  }

  // 推送消息
  function cbIntegrationCallBack() {
	  // console.log(55555, JSON.stringify(oData));
  }

  /**
   * 用户点击左侧监控列表，调用安防平台接口，获取视频流
   * @param {*} cameraIndexCode 当前点击的监控列表的唯一值，用于接口传参
   */
  function videoDetails(cameraIndexCode: string) {
	  if (radioType.value === "0") {
		  videoPreview(cameraIndexCode);
	  } else {
		  // 判断是否填写了回放时间
		  if (!playbackTime.value.length) {
			  proxy.$message.warning("请选择回放时间");
			  return;
		  }
		  const startDate = new Date(playbackTime.value[0])
		  const startTimeStamp = startDate.getTime();
		  const endDate = new Date(playbackTime.value[1])
		  const endTimeStamp = endDate.getTime();
		  video_Playback(
			  cameraIndexCode,
			  Number(startTimeStamp) / 1000,
			  Number(endTimeStamp) / 1000
		  );
	  }
  }

  /**
   * 对监控列表进行模糊检索
   */
  function fuzzyRetrieval() {
	  const new_CameraList = cameraList_standby.filter((item: any) => {
		  return item.cameraName.indexOf(searhKey.value) > -1 ? true : false;
	  });
	  cameraList = new_CameraList;
  }

  /**
   * 时间输入框focus事件
   */
  function focusEvent() {
	  oWebControl.JS_Resize(idWidth.value - 650, idHeight.value);
  }

  /**
   * 时间输入框blur事件
   */
  function blurEvent() {
	  oWebControl.JS_Resize(idWidth.value, idHeight.value);
  }

  /**
   * 回放与预览的切换事件
   */
  function changeVideoType() {
	  console.log("AAAAAAAAAAAAAAAAAA")

	  // 先销毁 在创建,如果不这么做，只是单纯调用this.init()方法修改里面的预览和回放的参数值是行不通的
	  oWebControl.JS_Disconnect().then(() => {
		  initPlugin();
	  });
  }
  /**
   * 监听浏览器窗口变化，以及关闭标签页变化，并对插件做出处理
   */
  function monitoringWindow() {
	  // 标签关闭
	  // $(window).unload(function () {
	  // 	if (oWebControl != null) {
	  // 		oWebControl.JS_HideWnd(); // 先让窗口隐藏，规避插件窗口滞后于浏览器消失问题
	  // 		oWebControl.JS_Disconnect().then(
	  // 			function () { },
	  // 			function () { }
	  // 		);
	  // 	}
	  // 	// 监听resize事件，使插件窗口尺寸跟随DIV窗口变化
	  // 	$(window).resize(() => {
	  // 		if (oWebControl != null) {
	  // 			oWebControl.JS_Resize(
	  // 				$("#video_home").width(),
	  // 				$("#video_home").height()
	  // 			);
	  // 		}
	  // 	});
	  // });
  }

  // 停止全部预览
  function stopAllPreview() {
	  console.log("stopAllPreview")
	  oWebControl.JS_RequestInterface({
		  funcName: "stopAllPreview"
	  });
  }

  // 停止所有回放
  function stopAllPlayBack() {
	  console.log("stopAllPlayBack")
	  oWebControl.JS_RequestInterface({
		  funcName: "stopAllPlayback"
	  });

  }
  </script>

  <style scoped lang="scss">
  .home {
	  blockquote {
		  padding: 10px 20px;
		  margin: 0 0 20px;
		  font-size: 17.5px;
		  border-left: 5px solid #eee;
	  }

	  hr {
		  margin-top: 20px;
		  margin-bottom: 20px;
		  border: 0;
		  border-top: 1px solid #eee;
	  }

	  .col-item {
		  margin-bottom: 20px;
	  }

	  ul {
		  padding: 0;
		  margin: 0;
	  }

	  font-family: "open sans",
	  "Helvetica Neue",
	  Helvetica,
	  Arial,
	  sans-serif;
	  font-size: 13px;
	  color: #676a6c;
	  overflow-x: hidden;

	  ul {
		  list-style-type: none;
	  }

	  h4 {
		  margin-top: 0px;
	  }

	  h2 {
		  margin-top: 10px;
		  font-size: 26px;
		  font-weight: 100;
	  }

	  p {
		  margin-top: 10px;

		  b {
			  font-weight: 700;
		  }
	  }

	  .update-log {
		  ol {
			  display: block;
			  list-style-type: decimal;
			  margin-block-start: 1em;
			  margin-block-end: 1em;
			  margin-inline-start: 0;
			  margin-inline-end: 0;
			  padding-inline-start: 40px;
		  }
	  }
  }
  </style>
  <style lang="scss" scoped>
  #video_home {
	  width: 100%;
	  height: 75vh;
	  border: 1px solid red;
  }

  .cameraName-list {
	  width: 100%;
	  overflow: hidden;
	  text-overflow: ellipsis;
	  -webkit-user-select: none;
	  /*webkit浏览器*/
	  -moz-user-select: none;
	  /*火狐*/
	  -ms-user-select: none;
	  /*IE10*/
	  user-select: none;
  }

  .el-main {
	  padding: 0.3vh;
  }

  .el-header {
	  background-color: #fff;

	  display: flex;
	  align-items: center;
	  justify-content: space-between;
  }

  ::v-deep .el-radio-button__inner,
  .el-radio-group {
	  vertical-align: baseline;
  }

  .search-input {
	  width: 100%;
	  margin: 0px auto;
	  padding: 10px;
	  // display: flex;
	  // align-items: center;
	  // justify-content: center;
	  // position: fixed;
	  // z-index: 99;
	  // box-shadow: 0px 5px 5px #d6d2d2;
  }

  .serachButton {
	  font-size: 15px;
	  padding: 7px 11px;
	  background-color: #ecf1f8;
  }
  </style>



