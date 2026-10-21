# Sổ tay Pickleball – trang web tra cứu

Trang web tạo từ tài liệu Google Docs "Lịch trình luyện tập pickleball từ cơ bản đến nâng cao": 23 mục, 34 hình minh họa, có tìm kiếm, lọc theo trình độ, mục lục và sub-tab chiến thuật.

## Cấu trúc thư mục

```
pickleball/
├── build.py                  # Ghép nội dung + giao diện → trang web
├── content/
│   ├── noi-dung.html         # TOÀN BỘ NỘI DUNG (chữ, bảng, danh sách)
│   └── images/               # 34 hình minh họa (hinh-1.png, hinh-3a.png, ...)
├── src/
│   ├── template.html         # Giao diện: CSS, JavaScript, thanh tìm kiếm, mục lục
│   └── sim.js                # Mô phỏng hoạt hình 10 chiến thuật (kịch bản + bộ vẽ)
└── dist/
    └── so-tay-pickleball.html  # Kết quả build: 1 file, mở bằng trình duyệt là xem được
```

## Muốn sửa gì thì sửa ở đâu

| Muốn sửa | File | Ghi chú |
|---|---|---|
| Chữ, bảng, danh sách, thêm/xóa mục | `content/noi-dung.html` | Tiêu đề phải giữ dạng `<h3>16. Tên mục</h3>`, `<h4>16.9. Tên tiểu mục</h4>` |
| Thay hình | `content/images/` | Giữ nguyên tên file, hoặc đổi `src="images/..."` trong `noi-dung.html` |
| Thêm hình mới | `content/noi-dung.html` | `<figure><img src="images/ten-hinh.png" alt="..."><figcaption>Hình ...</figcaption></figure>` |
| Màu sắc | `src/template.html` | Các biến `--court` (xanh sân), `--ball` (vàng bóng), `--bg`... ở đầu thẻ `<style>`; khối `@media (prefers-color-scheme: dark)` là màu giao diện tối |
| Font chữ | `src/template.html` | Dòng `fonts.googleapis.com` và biến `--font-display`, `--font-body` |
| Tên trang, câu giới thiệu | `src/template.html` | Thẻ `<title>`, phần `class="hero"` |
| Nhãn trình độ của từng mục | `build.py` | `SEC_LV` (mục), `SUB14` (kỹ thuật 14.x), hàm `sub_lv` (chiến thuật 16.x) |
| Nhóm chiến thuật trong mục lục | `build.py` | `GROUP16` |
| Kịch bản mô phỏng (vị trí người, đường bóng, chú thích từng bước) | `src/sim.js` | Biến `SC`; toạ độ tính bằng feet, x = 0→44 (vạch cuối mình → vạch cuối đối thủ), y = 0→20 (biên trái → biên phải của đội mình) |
| Mô phỏng gắn vào tiểu mục nào | `build.py` | Biến `SIMS` (ví dụ `'s16-9': 'speedup'`) |

Ký hiệu trình độ: `cb` = Cơ bản, `tc` = Trung cấp, `nc` = Nâng cao, `td` = Thi đấu.

## Cách build

Cần Python 3 (không cần cài thêm thư viện).

```
cd D:\XGame\pickleball
python build.py
```

Sau đó mở `dist\so-tay-pickleball.html` bằng trình duyệt để xem.

## Đưa lên mạng

- Trang hiện đã được publish trên Claude (link riêng tư). Muốn cập nhật link đó, nhờ Claude publish lại file `dist/so-tay-pickleball.html`.
- Hoặc tự host: `dist/so-tay-pickleball.html` là trang tĩnh một file, có thể đưa lên GitHub Pages, Netlify, Vercel, Firebase Hosting... (đổi tên thành `index.html` nếu cần).

## Lưu ý

- Nguồn nội dung gốc là Google Docs. Nếu sửa trên Google Docs thì cần xuất lại `content/noi-dung.html` (nhờ Claude làm), nếu không hai bản sẽ lệch nhau.
- Nếu `build.py` báo "Không tìm thấy hình", kiểm tra lại tên file trong `content/images/`.

## Chạy nhanh

- **Git Bash / WSL / macOS / Linux:** `./run.sh` (hoặc `./run.sh 9000` để đổi cổng)
- **Windows (không có Git Bash):** nháy đúp `run.bat`

Script sẽ build trang, mở trình duyệt tại `http://localhost:8000/so-tay-pickleball.html` và in địa chỉ để xem trên điện thoại cùng Wi-Fi. Bấm `Ctrl+C` để dừng.
