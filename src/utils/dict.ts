import useDictStore from "@/store/modules/dict";
import { getDicts } from "@/api/system/dict/data";
import { ref, toRefs } from "vue";

/**
 * 获取字典数据
 */
const useDict = (...args: any[]) => {
	const res = ref({});
	return (() => {
		args.forEach((dictType) => {
			res.value[dictType] = [];
			const dicts = useDictStore().getDict(dictType);
			if (dicts) {
				res.value[dictType] = dicts;
			} else {
				getDicts(dictType).then((resp) => {
					res.value[dictType] = resp.data.map(
						(p: {
							dictLabel: any;
							dictValue: any;
							listClass: any;
							cssClass: any;
						}) => ({
							label: p.dictLabel,
							value: p.dictValue,
							elTagType: p.listClass,
							elTagClass: p.cssClass,
						})
					);
					useDictStore().setDict(dictType, res.value[dictType]);
				});
			}
		});
		return toRefs(res.value);
	})();
};

export default useDict;
