
import { createI18n } from "vue-i18n";
import en from './en'
import zhCn from "./zhCn";

const i18n = createI18n({
  //这里是语种的持久化，刷新也存在
  locale:localStorage.getItem('language') || 'zhCn', // 默认是中文
  fallbackLocale: 'en', // 语言切换的时候是英文
  globalInjection:true,//全局配置
  legacy:false,//vue3写法
  messages:{en,zhCn}//本地message，也就是你需要做国际化的语种

})

export default i18n
