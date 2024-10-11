import { setTableRowSelected } from './../../../../utils/ruoyi';
// prettier-ignore
import { listData, getData, delData, addData, updateData } from "@/api/system/dict/data";
import { listType, getDataType } from "@/api/system/dict/type";
import { ElForm, ElTable } from "element-plus";
import { ref, getCurrentInstance, onMounted } from "vue";

export default () => {
	const { proxy } = getCurrentInstance() as any;
	// 遮罩层
	const loading = ref<boolean>(true);
	// 选中数组
	const ids = ref<any>();
	// 非单个禁用
	const single = ref<boolean>(true);
	// 非多个禁用
	const multiple = ref<boolean>(true);
	// 显示搜索条件
	const showSearch = ref<boolean>(true);
	// 总条数
	const total = ref<number>(0);
	// 字典表格数据
	const dataList = ref<any>();
	// 默认字典类型
	const defaultDictType = ref<string>("");
	// 弹出层标题
	const title = ref<string>("");
	// 是否显示弹出层
	const open = ref<boolean>(false);
	// 状态数据字典
	const statusOptions = ref<any>();
	// 类型数据字典
	const typeOptions = ref<any>();
    // 日期范围
	const dateRange = ref<any>();
	// 查询参数
	const queryParams = ref<any>({
		pageNum: 1,
		pageSize: 10,
		dictName: undefined,
		dictType: undefined,
		status: undefined,
	});
	// 表单参数
	const form = ref<any>();
	const formRef = ref<InstanceType<typeof ElForm>>();
	const queryFormRef = ref<InstanceType<typeof ElForm>>();
    const pageTableRef = ref<InstanceType<typeof ElTable>>();
	// 表单校验
	const rules = {
		dictLabel: [
			{
				required: true,
				message: "数据标签不能为空",
				trigger: "blur",
			},
		],
		dictValue: [
			{
				required: true,
				message: "数据键值不能为空",
				trigger: "blur",
			},
		],
		dictSort: [
			{
				required: true,
				message: "数据顺序不能为空",
				trigger: "blur",
			},
		],
	};

	/** 查询字典类型详细 */
	const getType = (dictId: string) => {
		getDataType(dictId).then((response: any) => {
			queryParams.value.dictType = response.data.dictType;
			defaultDictType.value = response.data.dictType;
			getList();
		});
	};
	/** 查询字典类型列表 */
	const getTypeList = () => {
		listType().then((response: any) => {
			typeOptions.value = response.rows;
		});
	};
	/** 查询字典数据列表 */
	const getList = () => {
		loading.value = true;
		listData(proxy.addDateRange(queryParams.value, dateRange.value)).then((response: any) => {
			dataList.value = response.rows;
			total.value = parseInt(response.total);
			loading.value = false;
		});
	};
	// 数据状态字典翻译
	const statusFormat = (row: any) => {
		return proxy.selectDictLabel(statusOptions.value, row.status);
	};

    /**
     * 取消表格选中
     */
     const cleanSelect = () => {
        proxy.cleanTableSelection(pageTableRef);
    };

	// 取消按钮
	const cancel = () => {
		open.value = false;
		reset();
        cleanSelect();
	};
	// 表单重置
	const reset = () => {
		form.value = {
			dictCode: undefined,
			dictLabel: undefined,
			dictValue: undefined,
			dictSort: 0,
			status: "0",
			remark: undefined,
		};
		proxy.resetForm(formRef);
	};
	/** 搜索按钮操作 */
	const handleQuery = () => {
		queryParams.value.pageNum = 1;
		getList();
	};
	/** 重置按钮操作 */
	const resetQuery = () => {
        dateRange.value = [];
		proxy.resetForm(queryFormRef);
		queryParams.value.dictType = defaultDictType.value;
		handleQuery();
	};
	/** 新增按钮操作 */
	const handleAdd = () => {
		reset();
		title.value = "添加字典数据";
		form.value.dictType = queryParams.value.dictType;
		open.value = true;
	};
	// 多选框选中数据
	const handleSelectionChange = (selection: any) => {
		ids.value = selection.map((item: any) => item.dictCode);
		single.value = selection.length != 1;
		multiple.value = !selection.length;
	};
	/** 修改按钮操作 */
	const handleUpdate = (row: any) => {
		reset();
		const dictCode = row.dictCode || ids.value;
		getData(dictCode).then((response) => {
			response.data.dictSort = parseInt(response.data.dictSort);
			form.value = response.data;
			title.value = "修改字典数据";
            // 设置当前行选中
            proxy.setTableRowSelected(pageTableRef, row, true);
			open.value = true;
		});
	};
	/** 提交按钮 */
	const submitForm = () => {
		formRef.value?.validate((valid: boolean) => {
			if (valid) {
				if (form.value.dictCode != undefined) {
					updateData(form.value).then((response: any) => {
						if (response.code === 200) {
							proxy.$modal.msgSuccess("修改成功");
							open.value = false;
							getList();
						}
					});
				} else {
					addData(form.value).then((response: any) => {
						if (response.code === 200) {
							proxy.$modal.msgSuccess("新增成功");
							open.value = false;
							getList();
						}
					});
				}
			}
		});
	};
	/** 删除按钮操作 */
	const handleDelete = (row: any) => {
		const dictCodes = row.dictCode || ids.value;
        proxy.setTableRowSelected(pageTableRef, row, true);
		// prettier-ignore
		proxy.$modal.confirm('是否确认删除字典编码为"' + dictCodes + '"的数据项?', "警告")
        .then(() => {
            return delData(dictCodes);
        })
        .then((response: any) => {
            if (response.code === 200) {
                getList();
                proxy.$modal.msgSuccess("删除成功");
            }
        })
        .catch(() => {
            cleanSelect();
            console.log("取消了删除");
        });
	};
	/** 导出按钮操作 */
	const handleExport = () => {
		// prettier-ignore
		proxy.download('/system/dict/data/exportByStream', {...queryParams}, `字典数据信息${new Date().getTime()}.xlsx`);
	};

	onMounted(() => {
		const dictId = proxy.$route.params && proxy.$route.params.dictId;
		getType(dictId);
		getTypeList();
		proxy.getDicts("sys_normal_disable").then((response: any) => {
			statusOptions.value = response.data;
		});
	});

	// prettier-ignore
	return {
        loading, single, multiple, showSearch, total, dataList, title, open, statusOptions, typeOptions, dateRange, queryParams, form, formRef, 
        queryFormRef, rules, pageTableRef, getList, statusFormat, cancel, handleQuery, resetQuery, handleSelectionChange, handleAdd, handleUpdate, 
        submitForm, handleDelete, handleExport, cleanSelect, 
    };
};
