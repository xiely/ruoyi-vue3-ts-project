import { getlist } from '@/api/system/logininfor';
// prettier-ignore
import { listUser, getUser, delUser, addUser, updateUser, resetUserPwd, changeUserStatus} from "@/api/system/user";
import { getToken } from "@/utils/auth";
import { treeselect } from "@/api/system/dept";
import { ref, getCurrentInstance, watch, toRefs, nextTick, } from "vue";
import { ElForm, ElTable, ElUpload, FormItemRule } from "element-plus";
const baseURL = import.meta.env.VITE_APP_BASE_API;

export default () => {
	const { proxy } = getCurrentInstance() as any;
	// 遮罩层
	const loading = ref<boolean>(true);
	// 选中数组
	let ids = ref<any>([]);

	const deptTreeRef = ref<any>();
	const queryFormRef = ref<InstanceType<typeof ElForm>>();
	const formRef = ref<InstanceType<typeof ElForm>>();
    const pageTableRef = ref<InstanceType<typeof ElTable>>();
	// prettier-ignore
	const { sys_normal_disable, sys_user_sex } = proxy.useDict("sys_normal_disable", "sys_user_sex");

	// 非单个禁用
	const single = ref<boolean>(true);
	// 非多个禁用
	const multiple = ref<boolean>(true);
	// 显示搜索条件
	const showSearch = ref<boolean>(true);
	// 总条数
	const total = ref<number>(0);
	// 用户表格数据
	const userList = ref<any>();
	// 弹出层标题
	const title = ref<string>("");
	// 部门树选项
	const deptOptions = ref<any>();
	// 是否显示弹出层
	const open = ref<boolean>(false);
	// 部门名称
	const deptName = ref<any>(undefined);
	// 默认密码
	const initPassword = ref<any>(undefined);
	// 日期范围
	const dateRange = ref<string>("");
	// 岗位选项
	const postOptions = ref<any>();
	// 角色选项
	const roleOptions = ref<any>();
	// 表单参数
	const form = ref<any>();
	const defaultProps = {
		children: "children",
		label: "label",
	};
    const uploadRef = ref<InstanceType<typeof ElUpload>>();
	// 用户导入参数
	const upload = ref<any>({
		// 是否显示弹出层（用户导入）
		open: false,
		// 弹出层标题（用户导入）
		title: "",
		// 是否禁用上传
		isUploading: false,
		// 是否更新已经存在的用户数据
		updateSupport: 0,
		// 设置上传的请求头部
		headers: { Authorization: "Bearer " + getToken() },
		// 上传的地址
		url: baseURL + "/system/user/importData",
	});
	// 查询参数
	const queryParams = ref<any>({
		pageNum: 1,
		pageSize: 10,
		userName: undefined,
		phonenumber: undefined,
		status: undefined,
		deptId: undefined,
		sex: undefined,
	});
	// 列信息
	const columns = [
		{ key: 0, label: `用户编号`, visible: true },
		{ key: 1, label: `用户名称`, visible: true },
		{ key: 2, label: `用户昵称`, visible: true },
		{ key: 3, label: `部门`, visible: true },
		{ key: 4, label: `手机号码`, visible: true },
		{ key: 5, label: `状态`, visible: true },
		{ key: 6, label: `创建时间`, visible: true },
	];
	// 表单校验
	const rules = ref<any>({
		userName: [
			{
				required: true,
				message: "用户名称不能为空",
				trigger: "blur",
			},
		],
		nickName: [
			{
				required: true,
				message: "用户昵称不能为空",
				trigger: "blur",
			},
		],
		password: [
			{
				required: true,
				message: "用户密码不能为空",
				trigger: "blur",
			},
		],
		email: [
			{
				type: "email",
				message: "'请输入正确的邮箱地址",
				trigger: ["blur", "change"],
			},
		],
		phonenumber: [
			{
				pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
				message: "请输入正确的手机号码",
				trigger: "blur",
			},
		],
	});

	//const { rules } = toRefs(validate) as any;

	watch(deptName, (val) => {
		// 根据名称筛选部门树
		proxy.$refs["deptTreeRef"].filter(val);
	});

	/** 查询用户列表 */
	const getPageList = () => {
        // TODO 查询之前先清空列表(不清空可能会因为数据缓存影响)
        userList.value = [];
		loading.value = true;
		listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(
			(response: any) => {
				userList.value = response.rows;
				total.value = parseInt(response.total);
				loading.value = false;
			}
		);
	};
	/** 查询部门下拉树结构 */
	const getTreeselect = () => {
		treeselect().then((response: any) => {
			deptOptions.value = response.data;
		});
	};
	// 筛选节点
	const filterNode = (value: any, data: any) => {
		if (!value) return true;
		return data.label.indexOf(value) !== -1;
	};
	// 节点单击事件
	const handleNodeClick = (data: { id: any }) => {
		queryParams.value.deptId = data.id;
		getPageList();
	};

    const updateUserStatus = async (userId: string, val: string) => {
        const text = val === "0" ? "启用" : "停用";
        await changeUserStatus(userId, val).then((response: any) => {
            if (response.code === 200) {
                proxy.$modal.msgSuccess(text + "成功");
                getPageList();
            }
        });
    }

	/**
     * 用户状态修改
     * 
     * @param val 当前选中的值
     * @param row 当前的行数据
     */
	const handleStatusChange = async (val: any, row: any) => {
        proxy.setTableRowSelected(pageTableRef, row, true);
		const text = val === "0" ? "启用" : "停用";
		// prettier-ignore
		await proxy.$modal.confirm('确认要"' + text + '""' + row.userName + '"用户吗?',"警告")
            .then(() => {
                updateUserStatus(row.userId, val);
            })
            .catch(() => {
                proxy.setTableRowSelected(pageTableRef, row, false);
                row.status = row.status === "0" ? "1" : "0";
                return;
            });
        //updateUserStatus(row.userId, val);   
	};
	// 取消按钮
	const cancel = () => {
		open.value = false;
		reset();
	};
	// 表单重置
	const reset = () => {
		form.value = {
			userId: undefined,
			deptId: undefined,
			userName: undefined,
			nickName: undefined,
			password: undefined,
			phonenumber: undefined,
			email: undefined,
			sex: undefined,
			status: "0",
			remark: undefined,
			postIds: [],
			roleIds: [],
		};
		proxy.resetForm(formRef);
	};
	/** 搜索按钮操作 */
	const handleQuery = () => {
		total.value = 0;
		queryParams.value.pageNum = 1;
		getPageList();
	};
	/** 重置按钮操作 */
	const resetQuery = () => {
		//proxy.resetForm("queryFormRef");
		//proxy.$refs.queryFormRef.resetFields();
		// 表单重置并且移除校验结果(el-form-item必须有prop与表单里文本框v-model对应)
		queryFormRef.value?.resetFields();
		dateRange.value = "";
		total.value = 0;
		handleQuery();
	};

    const statusChange = (val: any) => {
        console.log("group选中的值", val);
    };
	// 多选框选中数据
	const handleSelectionChange = (selection: any) => {
		ids.value = selection.map((item: { userId: any }) => item.userId);
		single.value = selection.length != 1;
		multiple.value = !selection.length;
	};

	const getUserBaseInfo = (dialogTitle: string, userId?: any) => {
		if (userId) {
			getUser(userId).then((response: any) => {
				if (response.code === 200) {
					const data = response.data;
                    form.value = response.data.data;
					postOptions.value = data.posts;
					roleOptions.value = data.roles;
                    form.value.postIds = data.postIds;
				    form.value.roleIds = data.roleIds;
                    /* form.value = {
                        userId: formData.userId,
                        userName: formData.userName,
                        nickName: formData.nickName,
                        deptId: formData.deptId,
                        phonenumber: formData.phonenumber,
                        email: formData.email,
                        sex: formData.sex,
                        status: formData.status,
                        postIds: data.postIds,
                        roleIds: data.roleIds,
                        password: ""
                    } */
                    title.value = dialogTitle;
					open.value = true;
				}
			});
		} else {
			getUser(null).then((response: any) => {
				if (response.code === 200) {
					const data = response.data;
					postOptions.value = data.posts;
					roleOptions.value = data.roles;
					title.value = dialogTitle;
					open.value = true;
				}
			});
		}
	};

	/** 新增按钮操作 */
	const handleAdd = () => {
		reset();
		getTreeselect();
	
		getUserBaseInfo("添加用户", null);
	};
	/** 修改按钮操作 */
	const handleUpdate = (row: any) => {
        proxy.setTableRowSelected(pageTableRef, row, true);
		reset();
		getTreeselect();
		const userId = row.userId || ids.value[0];
		getUserBaseInfo("修改用户", userId);
	};
	/** 重置密码按钮操作 */
	const handleResetPwd = async (row: { userName: string; userId: any }) => {
        proxy.setTableRowSelected(pageTableRef, row, true);
		// prettier-ignore
		await proxy.$modal.prompt('请输入"' + row.userName + '"的新密码', "提示")
            .then(({ value }: any)  => {
                resetUserPwd(row.userId, value).then((response: any) => {
                    if (response.code === 200) {
                        getPageList();
                        proxy.setTableRowSelected(pageTableRef, row, false);
                        proxy.$modal.msgSuccess("修改成功，新密码是：" + value);
                    }
                });
            })
            .catch(() => {
                proxy.setTableRowSelected(pageTableRef, row, false);
                console.log("密码重置取消");
            });
	};
	/** 提交按钮 */
	const submitForm = () => {
		formRef.value?.validate((valid: boolean) => {
			if (valid) {
				if (form.value.userId) {
					updateUser(form.value).then((response: any) => {
						if (response.code === 200) {
                            proxy.$modal.msgSuccess("修改成功");
                            getPageList();
                            open.value = false;
                        }
					});
				} else {
					addUser(form.value).then((response: any) => {
						if (response.code === 200) {
                            proxy.$modal.msgSuccess("新增成功");
                        }
					}).finally(() => {
                        getPageList();
                        open.value = false;
                    });
				}
			}
		});
	};
    const cleanSelect = () => {
        proxy.cleanTableSelection(pageTableRef);
    };
	/** 删除按钮操作 */
	const handleDelete = (row: any) => {
		const userIds = row.userId || ids;
		let isAdmin = false;
		if (userIds instanceof Array) {
			userIds.forEach((item) => {
				if (item === "1") {
					isAdmin = true;
					return;
				}
			});
		}

		if (isAdmin) {
			proxy.$modal.msgError("超级管理员不允许删除");
			return;
		}

		if (userIds === "1") {
			proxy.$modal.msgError("超级管理员不允许删除");
			return;
		}
        proxy.setTableRowSelected(pageTableRef, row, true);
		// prettier-ignore
		proxy.$modal.confirm('是否确认删除用户编号为"' + userIds + '"的数据项?', "警告")
            .then(() => {
                return delUser(userIds);
            })
            .then((response: any) => {
                if (response.code === 200) {
                    getPageList();
                    proxy.$modal.msgSuccess("删除成功");
                }
            }).catch(() => {
                cleanSelect();
                console.log("取消了删除");
            });
	};
	/** 导出按钮操作 */
	const handleExport = () => {
		proxy.download(
			"/system/user/exportByStream",
			{ ...queryParams.value },
			`用户数据${new Date().getTime()}.xlsx`
		);
	};
	/** 导入按钮操作 */
	const handleImport = () => {
		upload.value.title = "用户导入";
		upload.value.open = true;
	};
    /**
     * 清除上传控件选中文件
     */
     const cleanUploadRef = () => {
        uploadRef.value?.clearFiles();
        upload.value.updateSupport = 0;
    };
	/** 下载模板操作 */
	const importTemplate = () => {
		proxy.download(
			"system/user/importTemplate",
			{},
			`user_template_${new Date().getTime()}.xlsx`
		);
	};
	// 文件上传中处理
	const handleFileUploadProgress = (event: any, file: any, fileList: any) => {
		upload.value.isUploading = true;
	};
	// 文件上传成功处理
	const handleFileSuccess = (response: any, file: any, fileList: any) => {
		upload.value.open = false;
		upload.isUploading = false;
		// proxy.$refs.upload.clearFiles();
        cleanUploadRef();
		proxy.$alert(response.msg, "导入结果", {
			dangerouslyUseHTMLString: true,
		});
		getPageList();
	};
	// 提交上传文件
	const submitFileForm = () => {
		proxy.$refs.upload.submit();
	};

    const checkSelected  = (row: any) => {
        // 设置不可选中
        return !row.admin;
    };

	getPageList();
	getTreeselect();
	// proxy.getDicts("sys_normal_disable").then((response: { data: any }) => {
	// 	statusOptions.value = response.data;
	// });
	// proxy.getDicts("sys_user_sex").then((response: { data: any }) => {
	// 	sexOptions.value = response.data;
	// });
	proxy
		.getConfigKey("sys.user.initPassword")
		.then((response: { msg: any }) => {
			initPassword.value = response.msg;
		});

	// prettier-ignore
	return {
        loading, queryFormRef, formRef, sys_normal_disable, deptTreeRef, single, multiple, showSearch, total, userList, title, deptOptions, open, 
        deptName, dateRange, sys_user_sex, postOptions, roleOptions, form, defaultProps, upload, queryParams, columns, rules, pageTableRef, uploadRef,
        getPageList, filterNode, handleNodeClick, handleStatusChange,  cancel, handleQuery, resetQuery, handleSelectionChange, statusChange,
        handleAdd, handleUpdate, handleResetPwd, submitForm, handleDelete, handleExport, handleImport, importTemplate, handleFileUploadProgress, 
        handleFileSuccess, submitFileForm, checkSelected, cleanSelect, cleanUploadRef
    };
};
