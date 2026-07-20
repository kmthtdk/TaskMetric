# Report Consolidation — Tài liệu tính năng

> Hợp nhất nhiều bản báo cáo tiến độ (mỗi người một file) thành **một file duy
> nhất, chia theo từng người**, mở ra là một **Team overview** rồi drill-down vào
> full report của từng người. Chạy hoàn toàn offline trong trình duyệt.

Tài liệu này mô tả **đầy đủ** cách tính năng hoạt động: cách dùng, mô hình dữ liệu,
luồng xử lý `extractReports`, **bộ adapter cấu trúc lạ** `adaptForeign` (kèm bảng
ánh xạ đầy đủ), cách mở rộng, build lại công cụ, và giới hạn.

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Khái niệm cốt lõi](#2-khái-niệm-cốt-lõi)
3. [Các file liên quan](#3-các-file-liên-quan)
4. [Hướng dẫn sử dụng](#4-hướng-dẫn-sử-dụng)
5. [Data contract — báo cáo được lưu ở đâu](#5-data-contract--báo-cáo-được-lưu-ở-đâu)
6. [Luồng đọc file: `extractReports`](#6-luồng-đọc-file-extractreports)
7. [Schema báo cáo (data model)](#7-schema-báo-cáo-data-model)
8. [Adapter cấu trúc lạ: `adaptForeign`](#8-adapter-cấu-trúc-lạ-adaptforeign)
9. [Chuẩn hoá giá trị](#9-chuẩn-hoá-giá-trị)
10. [Số liệu trên Team overview](#10-số-liệu-trên-team-overview)
11. [Mở rộng adapter](#11-mở-rộng-adapter)
12. [Build & tái tạo](#12-build--tái-tạo)
13. [Sample fixtures](#13-sample-fixtures)
14. [Bảo mật & offline](#14-bảo-mật--offline)
15. [Giới hạn đã biết](#15-giới-hạn-đã-biết)
16. [Troubleshooting](#16-troubleshooting)
17. [Tham chiếu hàm nội bộ](#17-tham-chiếu-hàm-nội-bộ)

---

## 1. Tổng quan

Ứng dụng vốn là **đa dự án** (`store.projects[]`): một file có thể chứa nhiều báo
cáo và chuyển đổi qua lại. Tính năng hợp nhất tận dụng điều đó — **mỗi người = một
project** — và thêm 3 mảnh:

| Mảnh | Vai trò |
|---|---|
| **Merge import** (`extractReports` + `mergeReportFiles`) | Đọc dữ liệu báo cáo từ các file `.html`/`.json` rồi thêm mỗi báo cáo thành một project |
| **Schema adapter** (`adaptForeign`) | Ánh xạ báo cáo có **cấu trúc/field khác** về schema chuẩn của app |
| **Team overview** (`renderTeam`/`openTeam`) | Màn hình tổng quan mỗi người một thẻ → bấm để mở full report |

Hai đường dùng:
- **Trong app**: `index.html` → *Import data → Merge report files*.
- **Công cụ riêng**: `consolidator.html` (kéo-thả), sinh tự động từ `index.html`.

Kết quả xuất ra là **một file HTML tự chứa** (bake mọi dữ liệu + media của cả nhóm),
mở ra vào thẳng Team overview.

---

## 2. Khái niệm cốt lõi

- **Project = người.** Danh sách người chính là `store.projects`. Tên project lấy
  từ `meta.presenter` (hoặc `department`/`projectCode`, hoặc tên file). Đổi tên bằng
  nút Rename ở sidebar.
- **Data contract.** Mọi file export mang dữ liệu ở dạng JSON trong thẻ
  `<script id="savedData" type="application/json">…</script>`. Combine đọc chính khối
  này, **không** phụ thuộc layout HTML xung quanh.
- **Schema chuẩn.** Một báo cáo là object có `meta` + các mảng `timeline`,
  `workstreams`, `risks`, `kpis`, `lessons`, `charts`, `media`, `deck` (xem §7).
- **Adapter.** File không đúng schema chuẩn (field/nesting khác) vẫn được **map**
  về schema chuẩn nếu nhận diện được (xem §8). File không có dữ liệu báo cáo nào →
  **bỏ qua kèm thông báo**.

---

## 3. Các file liên quan

| File | Vai trò |
|---|---|
| `index.html` | App chính; chứa `extractReports`, `adaptForeign`, Team overview, merge import |
| `consolidator.html` | Công cụ kéo-thả độc lập (build sẵn) |
| `scripts/consolidator.template.html` | UI của công cụ + **bản sao** `extractReports`/`adaptForeign` |
| `scripts/build-consolidator.js` | Nhúng `index.html` (base64) vào template → `consolidator.html` |
| `scripts/make-samples.js` | Sinh 3 sample fixture trong `samples/` |
| `samples/*.html` | Dữ liệu test (xem §13) |

> ⚠️ `extractReports` + `adaptForeign` tồn tại **ở 2 nơi** (app và template công cụ).
> Khi sửa logic, phải sửa **cả hai** rồi chạy lại `build-consolidator.js` (xem §12).

---

## 4. Hướng dẫn sử dụng

### 4.1 Người viết report — export

Trong app, mỗi người dùng một trong hai:
- **Save as file (.html)** — file tự chứa (data + media), mở ra là report thật.
- **Export data → JSON** — file `.json` gọn nhẹ (không kèm media lớn).

> Nên điền **Presented by** (tên) để thẻ trong Team overview hiển thị đúng người.

### 4.2 Cách 1 — Hợp nhất trong app

1. Mở `index.html`.
2. **Import data → Merge report files (.html / .json)**.
3. Chọn **nhiều file** cùng lúc → mỗi báo cáo thành một project.
4. Team overview tự mở. Đổi tên/xoá project ở sidebar nếu cần.
5. **Save as file (.html)** → file hợp nhất (`consolidated-report-standalone.html`).

### 4.3 Cách 2 — `consolidator.html`

1. Mở `consolidator.html`.
2. **Kéo-thả** (hoặc bấm chọn) các file `.html`/`.json`.
3. Danh sách người hiện ra — đổi tên, sắp thứ tự, xoá.
4. **Export merged report (.html)** → `consolidated-report.html`.

### 4.4 Team overview

Mỗi người một thẻ hiển thị: tên, **% tiến độ tổng**, thanh progress, tối đa 3 KPI
đầu, **trạng thái** (`statusLabel`), và **số rủi ro** `X open · Y high risk`
(xem §10). Bấm thẻ → mở full report của người đó; nút **Team** ở topbar để quay lại.

Overview **tự mở** khi file có > 1 người; nút Team ẩn khi chỉ 1 người.

### 4.5 Lưu file hợp nhất

`saveStandalone()` bake **toàn bộ** `store.projects` (mọi người) vào khối `savedData`
của một bản copy app, rồi tải xuống. Khi mở lại, `loadStore()` đọc `projects[]` →
> 1 người → vào Team overview. File đơn (1 người) mở thẳng report.

---

## 5. Data contract — báo cáo được lưu ở đâu

Combine gom **candidate JSON** từ một file theo thứ tự:

1. Nếu toàn bộ nội dung file bắt đầu bằng `{` hoặc `[` → parse cả file (đường `.json`).
2. **Mọi** khối `<script … type="application/json" …>…</script>` trong file (regex,
   cờ `g`, không phân biệt hoa thường) — không chỉ `id="savedData"`.

Mỗi candidate có thể ở một trong các dạng:
- `{ projects: [ { name, data }, … ] }` — file đã hợp nhất (nhiều người).
- `{ schemaVersion, data: { …report… } }` — một báo cáo.
- `{ …report… }` — object báo cáo trực tiếp.
- Một **cấu trúc lạ** bất kỳ → thử adapter (§8).

> Ký tự `<` trong JSON được escape thành `<` khi bake, nên không có `</script>`
> lọt vào giữa khối và không phá cấu trúc HTML.

---

## 6. Luồng đọc file: `extractReports`

`extractReports(text, fname) → [{ name, data, adapted? }]`

```
1. Gom candidates (xem §5).
2. PASS NATIVE — với mỗi candidate:
     • nếu có projects[] mà mỗi phần tử có data.meta + Array data.timeline
       → push từng người; nếu thêm được ai → return.
     • nếu (candidate.data || candidate) có .meta + Array .timeline
       → push 1 người → return.
3. PASS FOREIGN — với mỗi candidate:
     • ad = adaptForeign(candidate.data || candidate)
     • nếu ad != null → push { name, data: ad, adapted: true } → return.
4. return [] (không có dữ liệu báo cáo → file bị bỏ qua).
```

- **Ưu tiên native trước**, adapter chỉ chạy khi không có schema chuẩn.
- **Đặt tên người**: `data.meta.presenter || department || projectCode`, nếu trống
  thì lấy **tên file** (bỏ đuôi, bỏ hậu tố `-standalone`, tiền tố `report-`).
- Khi hợp nhất, `mergeReportFiles`/consolidator gọi `coerceData()` (app) làm sạch:
  clamp `pct` về 0–100, ép `status` ∈ {done,active,wait}, ép `impact/likelihood` ∈
  {low,med,high} (map `severity` nếu thiếu `impact`), và **`ensureIds`** bù `id`.

---

## 7. Schema báo cáo (data model)

Một `data` báo cáo (schema `SCHEMA = 2`):

| Khối | Kiểu | Field chính |
|---|---|---|
| `meta` | object | `projectCode, logo, eyebrow, titleLead, titleAccent, subtitle, presenter, department, period, updatedDate, startDate, endDate, statusLabel` |
| `kpis[]` | array | `id, label, value, suffix, sub, tone(''/up/warn), icon` |
| `timeline[]` | array | `id, idx, title, dateStart, dateEnd, pct(0–100), status(done/active/wait), icon, note, side{…}` |
| `workstreams[]` | array | `id, name, sub, pct, tone(ok/active/warn/bad)` |
| `risks[]` | array | `id, impact(low/med/high), likelihood(low/med/high), status, title, desc, owner, due` |
| `lessons[]` | array | `id, category(well/improve/know), title, text` |
| `charts[]` | array | `id, title, type(bar/hbar/line/donut), source(workstreams/timeline/kpis/risks)` |
| `media[]` | array | `id, type(image/video), title, caption, src(data URI)` |
| `deck[]` | array | thứ tự/bật-tắt slide khi trình chiếu |

`timeline[].side` là callout cạnh phải: `{type:'stat'|'highlight'|'strategy'|'lesson'|'progress', …}`.

Nguồn chuẩn của schema: `DEFAULT_DATA` và `coerceData()` trong `index.html`.

---

## 8. Adapter cấu trúc lạ: `adaptForeign`

`adaptForeign(root) → data | null`

Mục tiêu: nhận một object **cấu trúc lạ** (field/nesting khác) và dựng ra `data`
đúng schema. Trả `null` nếu không tìm được nội dung báo cáo.

### 8.1 Chọn "head" (khối chứa thông tin chung)

`head = root.report | root.project | root.summary | root` (object đầu tiên có tồn tại).

### 8.2 Bảng ánh xạ field (đầy đủ)

**`meta`** (đọc từ `head`, riêng `title` fallback thêm ở `root`):

| Field đích | Field nguồn (alias, ưu tiên trái→phải) |
|---|---|
| `titleLead` / `titleAccent` | `programme, program, project, name, title, initiative` → tách từ cuối làm accent |
| `presenter` | `owner, author, presenter, reporter, lead, pm, manager` |
| `department` | `org, department, team, group, function, division, unit` |
| `period` | `reportingPeriod, period, sprint, week, cycle, quarter` |
| `updatedDate` | `asOf, asof, date, updated, reportDate` |
| `subtitle` | `summary, description, desc, overview, objective, goal` |
| `projectCode` | `code, id, key, tag` (fallback `titleLead`, cắt 24 ký tự) |
| `statusLabel` | `health, status, rag, state` → `_health()` |
| `startDate` | `head.window\|timeframe\|dates\|duration` → `.start\|from\|begin` |
| `endDate` | …như trên → `.end\|to\|finish\|due` |

**`timeline[]`** ← mảng đầu tiên trong: `timeline, sprints, milestones, phases, stages, iterations, roadmap`

| Field đích | Nguồn |
|---|---|
| `idx` | `idx, code, no, order, id` (fallback số thứ tự, cắt 4) |
| `title` | `title, name, label, phase, sprint, stage` |
| `pct` | `pct, percent, progress, completion, complete, done` (`_num`) |
| `status` | `status, state, phase` → `_stat()` |
| `note` | `note, goal, summary, desc` |
| `dateStart`/`dateEnd` | `dateStart\|start\|from` / `dateEnd\|end\|to`; hoặc từ object `window`/`dates`; hoặc **tách chuỗi** `"A – B"` |

**`workstreams[]`** ← mảng đầu tiên trong: `workstreams, epics, modules, streams, components, tracks, features, deliverables`

| Field đích | Nguồn |
|---|---|
| `name` | `name, epic, module, stream, title, component, deliverable` |
| `pct` | `pct, percent, progress, completion`; **nếu thiếu** → `done/total*100` (done ← `done, completed, complete`; total ← `total, count, of, planned`) |
| `sub` | `sub, detail, note`; nếu thiếu → `"done/total"` |
| `tone` | `health, tone, status, rag`: green/ok/good→`ok`, red/off/bad/crit→`bad`, amber/warn/attention/risk→`warn`, else `active` |

**`risks[]`** ← ghép `(risks\|risk` **hoặc** `raid.risks)` + `(issues\|blockers\|impediments` **hoặc** `raid.issues)`

| Field đích | Nguồn |
|---|---|
| `title` | `title, summary, name, risk, issue` |
| `desc` | `desc, description, detail, mitigation, plan` |
| `impact` | `impact, severity, sev` → `_lvl()` |
| `likelihood` | `likelihood, probability, prob, chance` → `_lvl()` |
| `status` | `status, state` (mặc định `Open`) |
| `owner` | `owner, assignee, lead` |
| `due` | `due, target, deadline, date, eta` |

**`kpis[]`** ← mảng đầu tiên trong: `kpis, metrics, measures, indicators, stats`

| Field đích | Nguồn |
|---|---|
| `label` | `label, metric, name, kpi, measure` |
| `value` | `value, current, val, count, actual` (`_num`) |
| `suffix` | `"/ " + target` nếu có `target\|goal\|of\|max`, else `unit\|suffix` |
| `sub` | `sub, note, caption, trend` |

**`lessons[]`** ← `retro, retrospective, lessons, learnings`

- Nếu là **object**: `good\|well\|wentWell`→`well`; `improve\|bad\|toImprove`→`improve`; `keep\|know\|learn\|actions`→`know`.
- Nếu là **array**: `category` ← `category\|type` qua `_cat()`.
- `title` ← `_lt` (`title, name, point, text, summary`; hoặc chính chuỗi; cắt 80).
- `text` ← `_lx` (`text, desc, detail, note, description`).

### 8.3 Field cố định trong output adapter

- `charts` → `[hbar/workstreams, donut/risks]` (biểu đồ mặc định vẽ từ dữ liệu người đó).
- `media` → `[]`.
- `deck` → **không set** (khi mở, `coerceData` cấp deck mặc định, `syncDeck` chỉnh lại).

### 8.4 Field bị bỏ qua

Mọi key không khớp alias (vd `financials`, `team`, `schema`, `budget`, …) **bị bỏ
qua** — không lỗi, chỉ không hiển thị.

### 8.5 Điều kiện chấp nhận / bỏ qua

Trả về `data` **chỉ khi** có ít nhất một trong `timeline / workstreams / risks /
kpis` không rỗng. Ngược lại trả `null` → file bị bỏ qua (báo "skipped").

### 8.6 Ví dụ thực tế (đã kiểm chứng)

`samples/sample-ai-platform.html` dùng schema `report / sprints / epics / raid /
kpis / retro` (không có `timeline`, `workstreams`, `impact/likelihood`). Adapter map:

- `sprints` → `timeline` (`completion`→`pct`, `state`→`status`, `"Jan 05 – Feb 13"`→ 2 ngày)
- `epics` → `workstreams` (`done/total`→`pct`, `health`→`tone`)
- `raid.risks + raid.issues` → `risks` (`impact` H/M/L, `probability`→`likelihood`)
- `metrics`→`kpis`, `retro.good/improve/keep`→`lessons`
- `financials`, `team` → bỏ qua

Kết quả: overview hiển thị **57% · At Risk · 4 open · 3 high risk** đúng số liệu.

---

## 9. Chuẩn hoá giá trị

| Hàm | Quy tắc |
|---|---|
| `_num(v)` | `parseFloat` sau khi bỏ mọi ký tự ngoài `0-9 . -` (vd `"99.9%"`→`99.9`) |
| `_lvl(v,default)` | bắt đầu `h`/`3`/chứa `crit`/`sev` → `high`; `l`/`1` → `low`; `m`/`2` → `med`; else `default` |
| `_stat(v)` | chứa `done\|complet\|closed\|finish\|resolv\|ship` → `done`; `progress\|active\|doing\|wip\|ongoing\|current\|start` → `active`; else `wait` |
| `_health(v)` | `green\|track\|ok\|good\|healthy` → **On Track**; `red\|off\|crit` → **Off Track**; `amber\|yellow\|risk\|watch\|attention` → **At Risk**; else viết hoa chữ đầu |
| `_cat(v)` | `well\|good\|keep` → `well`; `improv\|bad\|worse` → `improve`; else `know` |

Sau adapter, `coerceData()` còn siết thêm: `clamp` pct 0–100, ép `status`/`impact`/
`likelihood` về tập hợp hợp lệ, và `ensureIds` bù id (`^[A-Za-z0-9_-]+$`).

---

## 10. Số liệu trên Team overview

| Chỉ số | Công thức |
|---|---|
| **Overall %** (`pOverall`) | trung bình `clamp(pct)` của mọi `timeline`; 0 nếu rỗng |
| **Open risks** (`pOpenRisks`) | số risk có `status` **không** khớp `/clos\|resolv\|done\|complete/i` |
| **High risks** (`pHighRisks`) | số risk có `riskSeverity === 'high'` |

`riskSeverity(r)` = `LVL[impact] × LVL[likelihood]` với `low=1, med=2, high=3`;
kết quả `≥6 → high`, `≥3 → med`, còn lại `low`.

---

## 11. Mở rộng adapter

Khi gặp một schema lạ mà adapter chưa map (vd người ta dùng `deliverySlices` thay
`sprints`):

1. Mở `adaptForeign` trong **`index.html`**.
2. Thêm alias vào đúng danh sách `_firstArr(root, [...])` hoặc `_pick(obj, [...])`.
   Ví dụ: `_firstArr(root,['timeline','sprints',…,'deliverySlices'])`.
3. Nếu là cách tính mới (vd `%` nằm ở `ratioDone`), thêm vào danh sách field `pct`.
4. **Sao chép y hệt** thay đổi sang `scripts/consolidator.template.html`.
5. Chạy `node scripts/build-consolidator.js` để rebuild `consolidator.html`.
6. Test: thêm một sample vào `scripts/make-samples.js` rồi verify.

> Nguyên tắc: adapter map theo **bí danh field**, **không đoán** từ HTML tự do.
> Dữ liệu phải ở dạng JSON (trong `<script type="application/json">` hoặc file `.json`).

---

## 12. Build & tái tạo

```bash
# Dùng Node 22 (better-sqlite3 không liên quan ở đây, nhưng giữ nhất quán toolchain)
# Rebuild công cụ kéo-thả sau khi sửa index.html hoặc adapter:
node scripts/build-consolidator.js      # index.html -> consolidator.html (nhúng base64)

# Sinh lại 3 sample fixture:
node scripts/make-samples.js            # -> samples/*.html
```

- `build-consolidator.js` đọc `index.html`, mã hoá **base64 (UTF-8)** làm "khuôn"
  xuất, thay vào placeholder `__APP_B64__` của template → `consolidator.html`. Nhờ
  vậy file hợp nhất do công cụ xuất ra **luôn khớp** thiết kế app hiện tại.
- Vì `extractReports`/`adaptForeign` nằm ở **2 nơi**, luôn build lại sau khi sửa.

---

## 13. Sample fixtures

| File | Đặc điểm | Mục đích test |
|---|---|---|
| `samples/sample-mobile-app.html` | Bản export đầy đủ (bake vào `index.html`) | Đường native, file thật |
| `samples/sample-datacenter.html` | Layout riêng tối giản; schema **lỏng** (`severity` thay `impact`, thiếu `id`) | Đọc theo `savedData` bất kể layout; coerce |
| `samples/sample-ai-platform.html` | Program dashboard, **schema lạ hoàn toàn** | Adapter `adaptForeign` |

Sinh lại bằng `node scripts/make-samples.js`.

---

## 14. Bảo mật & offline

- **Offline tuyệt đối**: đọc file bằng `FileReader`, không upload, không gọi mạng.
- **Chống XSS**: mọi giá trị render qua `esc()`. Dữ liệu import (kể cả JSON độc)
  không thực thi được script — `media.src` nằm trong thuộc tính đã escape.
- **Chống vỡ khối script**: khi bake, `<` → `<` nên không có `</script>` lọt vào.
- **Escape formula CSV** vẫn áp dụng ở phần export CSV của app.

---

## 15. Giới hạn đã biết

- Adapter map theo **bí danh phổ biến**; schema quá lạ cần thêm alias (§11).
- Cần dữ liệu **JSON** (script `application/json` hoặc file `.json`). Báo cáo viết
  tay bằng HTML tự do **không** có khối dữ liệu → bị bỏ qua.
- **Chưa dedupe** người trùng — thêm 2 lần sẽ ra 2 project (xoá thủ công).
- Adapter bỏ qua các phần app không có mô hình (financials, team, sub-tasks…).
- File hợp nhất kèm media base64 có thể **lớn**; `localStorage` có hạn (app cảnh báo
  và khuyên dùng Save as file).

---

## 16. Troubleshooting

| Hiện tượng | Nguyên nhân / xử lý |
|---|---|
| File bị "skipped (no report data)" | Không có khối `savedData`/`application/json` hợp lệ, hoặc adapter không nhận diện → thêm alias (§11) hoặc export lại bằng app |
| Người bị trùng | Đã thêm 2 lần → xoá bớt project ở sidebar |
| Tên người sai/trống | Thiếu `presenter` → đặt "Presented by" trước khi export, hoặc Rename sau khi merge |
| Số liệu người "adapted" lệch | Kiểm tra field nguồn có đúng alias không; xem `adapted=true` và log dữ liệu |
| `consolidator.html` không map schema lạ | Bản cũ chưa có adapter → rebuild (`build-consolidator.js`) |
| Overview không tự mở | File chỉ có 1 người (đúng hành vi); dùng nút **Team** nếu >1 |

---

## 17. Tham chiếu hàm nội bộ

Tất cả trong `index.html` (và bản sao trong `scripts/consolidator.template.html`):

| Hàm | Nhiệm vụ |
|---|---|
| `extractReports(text, fname)` | Đọc → trả `[{name, data, adapted?}]` |
| `adaptForeign(root)` | Map cấu trúc lạ → `data` schema chuẩn, hoặc `null` |
| `_num, _pick, _firstArr, _lvl, _stat, _health, _cat, _lt, _lx` | Helper chuẩn hoá / lấy field theo alias |
| `mergeReportFiles(files)` | (app) đọc nhiều file → `store.projects`, mở overview |
| `coerceData(d)` / `ensureIds(d)` | (app) làm sạch & bù id khi nạp |
| `pOverall / pOpenRisks / pHighRisks` | (app) số liệu thẻ overview |
| `renderTeam / openTeam / closeTeam / teamOpen` | (app) Team overview |
| `saveStandalone()` | (app) bake toàn bộ store → file hợp nhất |
| `b64ToText` / `exportMerged` | (consolidator) giải mã khuôn & xuất file |

---

*Xem thêm:* `README.md` (tổng quan app & quy trình), `scripts/*` (build & sample).
