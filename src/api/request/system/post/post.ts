import { ref, getCurrentInstance, onMounted } from "vue";
// prettier-ignore
import { listPost, getPost, delPost, addPost, updatePost, exportPost } from "@/api/system/post";
import { ElForm, ElTable } from "element-plus";

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
	// 岗位表格数据
	const postList = ref<any>();
	// 弹出层标题
	const title = ref<string>("");
	// 是否显示弹出层
	const open = ref<boolean>(false);
	// 状态数据字典
	const statusOptions = ref<any>();
	// 查询参数
	const queryParams = ref({
		pageNum: 1,
		pageSize: 10,
		postCode: undefined,
		postName: undefined,
		status: undefined,
	});
	const dateRange = ref<any>();
	// 表单参数
	const form = ref<any>();
	const formRef = ref<InstanceType<typeof ElForm>>();
	const queryFormRef = ref<InstanceType<typeof ElForm>>();
    const pageTableRef = ref<InstanceType<typeof ElTable>>();
	// 表单校验
	const rules = ref({
		postName: [
			{
				required: true,
				message: "岗位名称不能为空",
				trigger: "blur",
			},
		],
		postCode: [
			{
				required: true,
				message: "岗位编码不能为空",
				trigger: "blur",
			},
		],
		postSort: [
			{
				required: true,
				message: "岗位顺序不能为空",
				trigger: "blur",
			},
		],
	});

	/** 查询岗位列表 */
	const getList = async () => {
		loading.value = true;
        // prettier-ignore
		await listPost(proxy.addDateRange(queryParams.value, dateRange.value)
		).then((response: any) => {
			postList.value = response.rows;
			total.value = parseInt(response.total);
			loading.value = false;
		});
	};
	// 岗位状态字典翻译
	const statusFormat = (row: any) => {
		return proxy.selectDictLabel(statusOptions.value, row.status);
	};
    const cleanSelect = () => {
        pageTableRef.value?.clearSelection();
    };
	// 取消按钮
	const cancel = () => {
		reset();
        cleanSelect();
        open.value = false;
	};
	// 表单重置
	const reset = () => {
		form.value = {
			postId: undefined,
			postCode: undefined,
			postName: undefined,
			postSort: 0,
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
		handleQuery();
	};
	// 多选框选中数据
	const handleSelectionChange = (selection: any) => {
		ids.value = selection.map((item: any) => item.postId);
		single.value = selection.length != 1;
		multiple.value = !selection.length;
	};
	/** 新增按钮操作 */
	const handleAdd = () => {
		reset();
		title.value = "添加岗位";
        open.value = true;
	};
	/** 修改按钮操作 */
	const handleUpdate = async (row: any) => {
		reset();
		const postId = row.postId || ids.value;
		await getPost(postId).then((response: any) => {
            response.data.postSort = parseInt(response.data.postSort);
			form.value = response.data;
			title.value = "修改岗位";
            proxy.setTableRowSelected(pageTableRef, row, true);
            open.value = true;
		});
	};
	/** 提交按钮 */
	const submitForm = async () => {
		await formRef.value?.validate((valid) => {
			if (valid) {
				if (form.value.postId !== undefined) {
					updatePost(form.value)
						.then((response: any) => {
							if (response.code === 200) {
								proxy.$modal.msgSuccess("修改成功");
							}
						})
						.finally(() => {
							open.value = false;
							getList();
						});
				} else {
					addPost(form.value)
						.then((response: any) => {
							if (response.code === 200) {
								proxy.$modal.msgSuccess("新增成功");
							}
						})
						.finally(() => {
							open.value = false;
							getList();
						});
				}
			}
		});
	};
	/** 删除按钮操作 */
	const handleDelete = async (row: any) => {
		const postIds = row.postId || ids.value;
        proxy.setTableRowSelected(pageTableRef, row, true);
		// prettier-ignore
		await proxy.$modal.confirm('是否确认删除岗位编号为"' + postIds + '"的数据项?', "警告")
			.then(() => {
				return delPost(postIds);
			})
			.then((response: any) => {
				if (response.code === 200) {
					proxy.$modal.msgSuccess("删除成功");
					getList();
				}
			})
			.catch(() => {
                cleanSelect();
				console.log("取消了删除");
			});
	};
	/** 导出按钮操作 */
	const handleExport = async () => {
		/* const queryParams = this.queryParams;
                this.$confirm('是否确认导出所有岗位数据项?', "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
                }).then(function() {
                return exportPost(queryParams);
                }).then(response => {
                this.download(response.msg);
                }) */
		// prettier-ignore
		await proxy.download('/system/post/exportByStream', {...queryParams}, `岗位信息${new Date().getTime()}.xlsx`);
	};

	onMounted(() => {
		getList();
		proxy.getDicts("sys_normal_disable").then((response: { data: any }) => {
			statusOptions.value = response.data;
		});
	});

	// prettier-ignore
	return {
        loading, single, multiple, showSearch, total, postList, title, open, queryParams, queryFormRef, form, dateRange, formRef, rules, pageTableRef, 
        statusOptions, getList, statusFormat, cancel, handleQuery, resetQuery, handleSelectionChange, handleAdd, handleUpdate, submitForm, 
        handleDelete, handleExport, cleanSelect,
    };
};
