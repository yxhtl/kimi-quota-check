# Kimi Quota Check

本地中英双语静态 MVP。`index.html` 为英文，`zh.html` 为中文。

功能：根据使用入口、Code 套餐类型和提示文字，给出额度规则与官方核对入口。判断不了时明确保留未知或指出输入矛盾。

不连接 Kimi 账号、不接收密钥、不保存选择、不调用模型。规则核验日期和来源列在页面底部。正式站使用独立 GA4 统计页面访问和每页首次有效使用，不上传产品、套餐、症状或结果；本地预览不发送统计。

## 验证

```sh
node --test tests/rules.test.cjs
node --check app.js
```

可以直接打开 `zh.html` 查看；也可以使用任意静态 HTTP 服务预览。无依赖、无构建步骤。

## 发布

源码仓库：https://github.com/yxhtl/kimi-quota-check 。GitHub Pages 使用 main 分支的 docs/，只发布八个公开资源，不发布测试、README 或工具。

英文：https://yxhtl.github.io/kimi-quota-check/
中文：https://yxhtl.github.io/kimi-quota-check/zh.html

先运行 `bash release.sh` 预检；用 `bash release.sh --push "中文提交说明"` 提交推送。新文件在 `--` 后逐个点名。脚本只允许本项目固定远端和 main 分支，不强推、不自动重试。推送成功后仍须核对 Pages 构建提交及线上文件。

2026年10月25日发布前已复核官方会员和报错规则。

## GSC 与 GA4

2026年10月26日开始接入。GSC 使用本项目 URL 前缀和 HTML 标签验证；站点地图为正式地址下的 sitemap.xml。所有权验证、站点地图处理和收录是不同状态，以后台核验结果为准。

独立 GA4 资源 560757838，网页数据流 16202689351，测量 ID G-ZXSFM7Q37X，报告时区为东八区。增强测量已关闭，代码关闭广告个性化与 Google signals，Cookie 前缀 kimi_quota 且路径限于 /kimi-quota-check/。自定义事件仅 check_start，每页首次有效提交发送一次，不携带所选内容。网址及来源网址去除查询参数与片段。标准页面访问之外，GA4 仍可能发送会话、首次访问等自动事件。

配置和源码不能证明后台收件；需在此资源的 Realtime（实时）或 DebugView（调试视图）看到 page_view 和 check_start 才能确认。调试时给正式页面添加 ?analytics_debug=1，测试访问不当作真实用户。
