<template>
  <div class="app-container home">
    <el-row :gutter="20">
      欢迎
    </el-row>

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
import { onMounted, ref } from 'vue';


const isDrive = ref(Boolean(sessionStorage.getItem('todo-driver')))


const driverObj = driver({
  showProgress: true,
  allowClose: true,
  onDestroyed: () => {
    isDrive.value = true
    sessionStorage.set('todo-driver', true)
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
})
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

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
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

