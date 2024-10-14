<template>
	<!-- <el-select @change="handleSelect" v-model="curLanguage" placeholder="Select" style="width: 240px">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select> -->
	<el-dropdown class="vab-language" @command="handleSelect">
		<!-- <el-button type="primary">
        Dropdown List<el-icon class="el-icon--right"><arrow-down /></el-icon>
      </el-button> -->
	  <svg-icon icon-class="text" style="font-size: 20px;"/>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zhCn">中文简体</el-dropdown-item>
        <el-dropdown-item command="en">English</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed, getCurrentInstance } from "vue";


const i18n = useI18n()
const { proxy } = getCurrentInstance() as any;
const options = [
	{ label: "中文", value: "zhCn" },
	{ label: "Endlish", value: "en" },
]
//储存语种并进行切换
const handleSelect = (v: any) => {
	console.log("VVVVVVVVV")
	localStorage.setItem('language', v)
	i18n.locale.value = v
	const content = v == 'zhCn' ? '当前语种为中文' : 'The current language is English';
	proxy.$message.warning(content);
};

// 计算当前语种
const curLanguage = computed(() => {
	return i18n.locale.value
})

</script>
<style scoped lang="less">
.arco-btn {
	position: absolute;
	right: 10px;
	top: 5px;
}

.arco-dropdown-open .arco-icon-down {
	transform: rotate(180deg);
}
</style>

