# Digital Creators — Không gian sáng tạo số

Website tĩnh dành cho dự án **đề xuất thành lập CLB Sáng tạo số**. Thiết kế sáng, pastel dịu mắt; hình học 3D tương tác trên desktop và hỗ trợ thiết bị yếu.

**Source:** https://github.com/coffee2307/digital-creators  
**Địa chỉ sau khi kích hoạt GitHub Pages:** https://coffee2307.github.io/digital-creators/

## Công nghệ

- Vite + React 19 + TypeScript + React Router (HashRouter).
- Three.js + React Three Fiber + Drei: 3D sinh bằng geometry, không tải model của PeachWeb.
- Lucide icons; CSS thuần.
- Không backend, API, database, VPS, cookies tài khoản hoặc thu thập dữ liệu.
- Đăng ký là **bản mô phỏng thuần frontend**; nút gửi chỉ hiển thị xác nhận và xóa dữ liệu nhập, không truyền đi đâu.

## Chạy trên máy tính

Cài Node.js 22 hoặc cao hơn.

```bash
npm install
npm run dev
```

Mở http://localhost:5173. Kiểm tra bản production:

```bash
npm run build
npm run preview
```

## Đăng lên GitHub Pages miễn phí

1. Repo phải ở trạng thái **Public** (đang là Public). GitHub Free hỗ trợ Pages trên public repo.
2. Vào **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` tự build và deploy khi có commit mới vào `main` (hoặc chạy thủ công tại Actions → Deploy to GitHub Pages → Run workflow).
4. Sau khi workflow báo thành công, mở **https://coffee2307.github.io/digital-creators/**.

Do repo chạy tại `/digital-creators/`, Vite chỉ dùng `base: '/digital-creators/'` khi build cho Pages. Router dạng dấu # giải quyết refresh trang con trên static hosting, ví dụ: `/digital-creators/#/gioi-thieu`. Không cần quy tắc server-side rewrite.

## Các trang

- `/#/` — Trang chủ: trải nghiệm 3D, lĩnh vực sáng tạo, hoạt động dự kiến.
- `/#/gioi-thieu` — Lý do thành lập, mục tiêu và đối tượng tham gia.
- `/#/hoat-dong` — Bốn nhóm hoạt động **dự kiến**.
- `/#/dang-ky` — Form mô phỏng không lưu dữ liệu.

## Quy chuẩn và kế hoạch

Xem `docs/DESIGN_SYSTEM.md` và `docs/ROADMAP.md`. Trước khi có quyết định thành lập, các nội dung tuyệt đối không được mô tả như hoạt động đã diễn ra. Không tự ý đăng thông tin cá nhân học sinh.

PeachWeb (https://peachweb.io/) chỉ được dùng tham khảo cách kể chuyện/không gian 3D, không sao chép giao diện hoặc tài nguyên có bản quyền. Three.js và React Three Fiber dùng mã nguồn mở theo giấy phép tương ứng.
