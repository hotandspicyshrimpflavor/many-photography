# Many's Photography — PRD Draft v0.1

> ⚠️ DRAFT — Pending user confirmation before full PRD

---

## 阶段一：项目背景

### 问题

Many (photographer) needs a professional, award-winning website to:
1. Showcase photography work in a memorable, interactive way
2. Give clients a private portal to access and download their photos/videos
3. Protect his author/copyright rights while delivering work
4. Handle large file delivery (photos + videos for clients)

### 目标

Build a photography business website that:
- **Wows clients** — interactive spinning wheel portfolio, immersive galleries
- **Is functional** — client portal with secure token-based login, download system
- **Protects rights** — watermark, no direct image URLs, limited download quality options
- **Is professional** — award-winning aesthetic, fast, reliable

---

## 阶段二：用户故事（草案）

```
US-01：作为访客，我想体验沉浸式互动作品集
US-02：作为潜在客户，我想了解 Many 的风格和服务
US-03：作为客户，我想凭唯一凭证登录查看和下载我的作品
US-04：作为 Many，我想安全地交付作品并保护我的版权
US-05：作为网站管理员，我想管理客户账户和作品交付状态
```

---

## 阶段三：大纲（待确认）

请确认以下拆分是否准确，有无遗漏或需要合并的故事：

```
US-01：访客体验互动作品集
  ├─ F-01-1：首页 3D  spinning wheel 作品展示
  ├─ F-01-2：作品分类（婚纱/商业/写真/视频等）
  ├─ F-01-3：详情页灯箱 + 缩放
  └─ F-01-4：获奖页面 / 荣誉展示

US-02：潜在客户了解服务
  ├─ F-02-1：服务介绍页面
  ├─ F-02-2：定价页面
  ├─ F-02-3：联系 / 预约表单
  └─ F-02-4：博客 / 作品故事

US-03：客户私密门户
  ├─ F-03-1：Token 生成规则（姓名+首拍日期）
  ├─ F-03-2：Token 登录页面（无密码）
  ├─ F-03-3：客户作品画廊
  ├─ F-03-4：单张 / 批量下载系统
  └─ F-03-5：邮件通知 Token

US-04：版权保护
  ├─ F-04-1：图片动态水印
  ├─ F-04-2：禁用右键 / 禁止拖拽
  ├─ F-04-3：缩略图低质量 + 大图需登录
  ├─ F-04-4：下载可选质量（网络用 vs 打印用）
  └─ F-04-5：法务声明页面（版权政策）

US-05：管理后台
  ├─ F-05-1：客户管理（添加/编辑/停用）
  ├─ F-05-2：作品上传与客户绑定
  ├─ F-05-3：Token 状态管理（有效/已使用/已过期）
  ├─ F-05-4：交付记录与审计日志
  └─ F-05-5：下载通知与统计
```

---

请确认：
1. 用户故事拆分是否合理？
2. 功能点是否覆盖所有需求？
3. 有无遗漏场景？
