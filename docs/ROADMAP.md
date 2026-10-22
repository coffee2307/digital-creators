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
- [x] CI build và workflow triển khai website tĩnh bằng GitHub Pages.

## Phase 2 — Ba cảnh tương tác theo từng trang
- [x] Trang chủ: Rubik 3×3 thực sự gồm cubie/sticker 3D; chuỗi xoay đảo ngược từ scramble đến solved phụ thuộc thanh cuộn.
- [x] Trang Giới thiệu: tranh sơn dầu *The Starry Night* hiện lên theo các nét cọ điều khiển bằng cuộn trang.
- [x] Trang Hoạt động: thành phố khối lắp ghép 3D với instancing, mái, cửa kính, công viên và các khu nhà xuất hiện từng tầng theo cuộn.
- [x] Bỏ nền hình tròn trang trí trên hai trang Giới thiệu và Hoạt động.
- [x] Tách tải các cảnh theo trang, giữ React + Vite + Three.js chạy trên hosting tĩnh.
- [x] Creative Playground, reveal theo cuộn, hỗ trợ giảm chuyển động.
- [ ] Tối ưu tốc độ tải ban đầu, kiểm thử thiết bị GPU yếu và đánh giá Lighthouse.
- [x] Poster Hero dùng CSS 3D xoay Rubik và các badge theo chuột, tránh tải thêm WebGL.
- [ ] Tối ưu texture, frame time khi cuộn tranh và kiểm thử trên máy thật.
- [ ] Kiểm thử trải nghiệm cuộn bằng trackpad, chuột và điện thoại thực tế.

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
