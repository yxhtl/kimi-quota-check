# Kimi Quota Check

本地中英双语静态 MVP。`index.html` 为英文，`zh.html` 为中文。

功能：根据使用入口、Code 套餐类型和提示文字，给出额度规则与官方核对入口。判断不了时明确保留未知或指出输入矛盾。

不连接账号、不接收密钥、不保存选择、不调用模型或收集统计。规则核验日期和来源列在页面底部。

## 验证

```sh
node --test tests/rules.test.cjs
node --check app.js
```

可以直接打开 `zh.html` 查看；也可以使用任意静态 HTTP 服务预览。无依赖、无构建步骤。

## 发布

源码仓库：https://github.com/yxhtl/kimi-quota-check 。GitHub Pages 使用 main 分支的 docs/，只发布七个公开资源，不发布测试、README 或工具。

英文：https://yxhtl.github.io/kimi-quota-check/
中文：https://yxhtl.github.io/kimi-quota-check/zh.html

先运行 `bash release.sh` 预检；用 `bash release.sh --push "中文提交说明"` 提交推送。新文件在 `--` 后逐个点名。脚本只允许本项目固定远端和 main 分支，不强推、不自动重试。推送成功后仍须核对 Pages 构建提交及线上文件。

2026年10月25日发布前已复核官方会员和报错规则。本次不接入 GSC、GA4 或其他统计服务。
