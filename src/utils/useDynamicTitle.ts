import defaultSettings from "@/settings";
import useSettingsStore  from "@/store/modules/settings";

/**
 * 动态修改标题
 */
 const useDynamicTitle = () => {
	const settingsStore = useSettingsStore();
	if (settingsStore.dynamicTitle) {
		document.title = settingsStore.title + " - " + defaultSettings.title;
	} else {
		document.title = settingsStore.title;
	}
};

export default useDynamicTitle;