# Digital Creators · Không gian sáng tạo số

Website giới thiệu đề xuất thành lập **CLB Sáng tạo số**. Định hướng giao diện sáng, pastel dịu mắt, kết hợp các thành phần WebGL 3D tương tác lấy cảm hứng từ immersive storytelling.

## Chạy trên máy

Yêu cầu: Node.js 22+.

```bash
npm install
npm run dev
```

Truy cập http://localhost:5173. Kiểm tra bản production bằng `npm run build` và `npm run preview`.

## Trang
- `/`: Giới thiệu chung và các lĩnh vực sáng tạo.
- `/gioi-thieu`: Lý do thành lập, mục tiêu và đối tượng.
- `/hoat-dong`: Bốn nhóm hoạt động **dự kiến**.
- `/dang-ky`: Biểu mẫu **mô phỏng**. Không gửi dữ liệu tới máy chủ, không lưu localStorage.

## Kiến trúc
Vite, React 19, TypeScript, React Router và React Three Fiber / Drei / Three.js. 3D được tạo bằng geometry trực tiếp, không tải tài nguyên hay mô hình độc quyền. Icon sử dụng Lucide.

## Triển khai
Cloudflare Pages: build command `npm run build`, output `dist`. File `public/_redirects` hỗ trợ SPA trên nền tảng triển khai tương thích. Với Vercel/Netlify, cần áp dụng quy tắc rewrite tương đương nếu không nhận `_redirects`. Chưa có backend.

## Thiết kế & kế hoạch
Xem `docs/DESIGN_SYSTEM.md` và `docs/ROADMAP.md`. Khuyến nghị giữ nguyên việc thông báo trạng thái CLB đang được đề xuất cho tới khi được nhà trường xác nhận. Không công khai thông tin cá nhân học sinh.

## Tham khảo
PeachWeb: https://peachweb.io/ (tham khảo hướng trải nghiệm, **không** sao chép nội dung/tài sản).
R3F: https://github.com/pmndrs/react-three-fiber (MIT).
Drei: https://github.com/pmndrs/drei (MIT).

