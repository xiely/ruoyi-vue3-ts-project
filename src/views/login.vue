<template>

        <div class="login">
			<div class="login-right-tool">
				<ChangeLan></ChangeLan>
			</div>
            <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                class="login-form"
            >
                <h3 class="title">硫酸灌车自动取样管理系统</h3>
                <el-form-item prop="username">
                    <el-input
                        v-model="loginForm.username"
                        type="text"
                        auto-complete="off"
                        :placeholder="$t('请输入用户名')"
                    >
                        <template #prefix>
                            <svg-icon
                                icon-class="user"
                                class="el-input__icon input-icon"
                            />
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        auto-complete="off"
                        :placeholder="$t('请输入密码')"
                        @keyup.enter="handleLogin"
                    >
                        <template #prefix>
                            <svg-icon
                                icon-class="password"
                                class="el-input__icon input-icon"
                            />
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="code">
                    <el-input
                        v-model="loginForm.code"
                        auto-complete="off"
                        :placeholder="$t('验证码')"
                        style="width: 55%"
                        @keyup.enter="handleLogin"
                    >
                        <template #prefix
                            ><svg-icon
                                icon-class="validCode"
                                class="el-input__icon input-icon"
                        /></template>
                    </el-input>
                    <div class="login-code">
                        <img
                            :src="codeUrl"
                            @click="getCode()"
                            class="login-code-img"
                            title="看不清？点击更换"
                        />
                    </div>
                </el-form-item>
                <el-checkbox
                    v-model="loginForm.rememberMe"
                    style="margin: 0px 0px 25px 0px"
                    >{{ $t('记住密码') }}</el-checkbox
                >
                <el-form-item style="width: 100%">
                    <el-button
                        :loading="loading"
                        type="primary"
                        size="large"
                        style="width: 100%"
                        @click.native="handleLogin"
                    >
                        <span v-if="!loading">{{ $t('登录') }}</span>
                        <span v-else>{{ $t('登 录 中') }}...</span>
                    </el-button>
                </el-form-item>
            </el-form>
            <!--  底部  -->
        </div>

</template>

<script lang="ts" name="Login" setup>
import Login from "@/api/request/login";
import ChangeLan from '@/components/tabLang/index.vue'

const {
    loginFormRef, loginForm, loginRules, codeUrl, loading, getCode, handleLogin
} = Login();

</script>

<style lang="scss" scoped>
.login-right-tool{
	position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px;
    background: var(--el-color-white);
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
}
.login {
	padding-left: 80vh;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	// background-image: url("../assets/images/login-background.jpg");
	background-image: url("../assets/images/login-background.png");
	background-size: 100%  100%;
}

.title {
	margin: 0px auto 30px auto;
	text-align: center;
	color: #707070;
}

.login-form {
	border-radius: 6px;
	background: #ffffff;
	width: 400px;
	padding: 25px 25px 5px 25px;

	.el-input {
		height: 38px;

		input {
			height: 38px;
		}
	}

	.input-icon {
		height: 39px;
		width: 14px;
		margin-left: 2px;
	}
}

.login-tip {
	font-size: 13px;
	text-align: center;
	color: #bfbfbf;
}

.login-code {
	width: 33%;
	height: 38px;
	float: right;

	img {
		cursor: pointer;
		vertical-align: middle;
        margin: 0 0 0 30%;
	}
}

.el-login-footer {
	height: 40px;
	line-height: 40px;
	position: fixed;
	bottom: 0;
	width: 100%;
	text-align: center;
	color: #fff;
	font-family: Arial;
	font-size: 12px;
	letter-spacing: 1px;
}

.login-code-img {
	height: 38px;
}
</style>
