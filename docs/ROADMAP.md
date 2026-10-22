# Digital Creators — Kế hoạch phát triển

## Mục tiêu
Website tiếng Việt cho CLB Sáng tạo số trong giai đoạn đề xuất thành lập; sáng, pastel trung hòa và dễ đọc, tương tác 3D nhưng không đánh đổi tốc độ/khả năng tiếp cận.

## Phase 1 — Foundation (bản khởi tạo)
- [x] React + Vite + TypeScript + React Router.
- [x] Bốn trang: Trang chủ, Giới thiệu, Hoạt động, Đăng ký.
- [x] Nội dung đúng tính chất *dự kiến*, không ngụ ý CLB đã hoạt động.
- [x] 3D tạo bằng hình học Three.js, không sao chép tài nguyên PeachWeb.
- [x] Form demo: không gửi / không lưu dữ liệu thật.
- [x] Responsive, hạn chế chuyển động, fallback thiết bị thiếu WebGL.
- [x] CI build và cấu hình SPA Cloudflare Pages.

## Phase 2 — Immersive story (đã triển khai nền tảng 2.5D)
- [x] Hành trình cuộn 4 chương: cá chép minh họa SVG gốc di chuyển/đổi hướng/đổi tỷ lệ theo scroll thực, không phải video chạy tự động.
- [x] Creative Playground: đổi màu tức thì, phát/tạm dừng motion, minh họa code.
- [x] IntersectionObserver reveal từng phần tử; người chọn giảm chuyển động vẫn đọc được đủ 4 chương.
- [ ] Nâng từ 2.5D lên mô hình 3D GLB/GLTF chân thực hơn nếu thực sự cải thiện trải nghiệm và giữ FPS.
- [ ] Tương tác riêng cho 5 lĩnh vực (design/video/web/code/content).
- [ ] Điều hướng camera theo ngữ cảnh và mobile scene tối giản.
- [ ] Asset GLB/GLTF tự tạo có texture nén, progressive loading.
- [ ] Hiệu ứng âm thanh tùy chọn và tắt mặc định.

## Phase 3 — Nội dung và hệ thống quản trị
- [ ] Thư viện dự án thật khi CLB hình thành, có phê duyệt nội dung.
- [ ] CMS tối giản cho người quản lý; tránh nêu các hoạt động chưa diễn ra như đã hoàn thành.
- [ ] Nếu chuyển sang tuyển thành viên thực: backend có xác thực, chống spam và chính sách dữ liệu học sinh.

## Phase 4 — QA & launch
- [ ] Lighthouse mobile mục tiêu >= 90 performance/accessibility (đo trước khi tuyên bố đạt).
- [ ] Kiểm tra Chrome/Firefox/Safari + thiết bị cấu hình thấp.
- [ ] Kiểm tra bàn phím, screen reader, prefers-reduced-motion.
- [ ] Domain, favicon/logo chuẩn thức và kiểm duyệt nội dung bởi giáo viên/phụ trách.

## Quy tắc
Không đưa danh sách học sinh/thông tin liên hệ vào nguồn công khai. Không sử dụng logo/hình của PeachWeb nếu không được cấp phép. Phiên bản đầu hoạt động tĩnh, chi phí lưu trữ dự kiến bằng 0 trên static hosting phù hợp.
