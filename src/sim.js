/* Mô phỏng chiến thuật pickleball (hoạt hình trên canvas).
   Toạ độ tính bằng feet: x = 0 (vạch cuối đội mình, bên trái) → 44 (vạch cuối đối thủ);
   y = 0 (biên trên = bên TRÁI của đội mình) → 20 (biên dưới = bên PHẢI của đội mình).
   Lưới ở x = 22, vạch kitchen ở x = 15 và x = 29.
   Mỗi kịch bản: start (vị trí ban đầu) + steps. Mỗi bước có:
     t     : chú thích của bước
     p     : vị trí mới của người chơi ở cuối bước { A:[x,y], ... }
     b     : đường bóng { f:[x,y], to:[x,y], h: độ cao tối đa (ft), via:[x,y] (đường cong), k:'atk' (cú tấn công), bounce:true }
     hl    : vùng cần chú ý { e:[x,y,rx,ry] } hoặc { r:[x0,y0,x1,y1] }, kèm l: nhãn
     d     : thời lượng (ms), mặc định 1500
*/
(function () {
  const OUR = '#ef6c00', OPP = '#6a1b9a';
  const K = { A: OUR, B: OUR, X: OPP, Y: OPP };
  const NETX = 22;

  const SC = {
    'serveOrder': {
      title: 'Thứ tự giao bóng và cách gọi điểm (đánh đôi)',
      start: { A: [-1, 15], B: [-1, 5], X: [45, 5], Y: [45, 15] }, score: '0 – 0 – 2', srv: 'A',
      steps: [
        { t: 'Đầu game, đội A–B giao trước và chỉ có 1 người giao. A đứng ô phải, gọi “0 – 0 – 2” rồi giao chéo.', b: { f: [-0.4, 14.6], to: [37, 5], h: 7, bounce: true } },
        { t: 'Đội A–B thắng điểm. A đổi ô sang trái với B (đội nhận không đổi ô).', p: { A: [-1, 5], B: [-1, 15] }, sc: '1 – 0 – 2' },
        { t: 'A giao tiếp từ ô trái, gọi “1 – 0 – 2”.', b: { f: [-0.4, 5.4], to: [37, 15], h: 7, bounce: true } },
        { t: 'Đội A–B thua điểm. Vì đây là người giao duy nhất của lượt đầu game nên đổi giao (side-out).', hl: { r: [29, 0, 44, 20], l: 'Side-out: X–Y giao' }, sc: 'X–Y: 0 – 1 – 1', srv: 'X' },
        { t: 'Người đứng ô phải của X–Y (X) là người giao 1, gọi “0 – 1 – 1”.', b: { f: [44.6, 5.4], to: [7, 15], h: 7, bounce: true } },
        { t: 'X–Y thua điểm: chuyển sang người giao 2 là Y, giao từ ô Y đang đứng, gọi “0 – 1 – 2”.', b: { f: [44.6, 14.6], to: [7, 5], h: 7, bounce: true }, sc: 'X–Y: 0 – 1 – 2', srv: 'Y' },
        { t: 'X–Y thua tiếp: side-out, đội A–B giao lại. Người đang đứng ô phải (B) là người giao 1, gọi “1 – 0 – 1”.', b: { f: [-0.4, 14.6], to: [37, 5], h: 7, bounce: true }, sc: '1 – 0 – 1', srv: 'B' }
      ]
    },
    'fullPoint': {
      title: 'Phân tích một điểm hoàn chỉnh (14 cú)',
      start: { A: [-1, 16], B: [14.3, 5], X: [45, 5], Y: [45, 15] },
      steps: [
        { t: 'Cú 1: X giao sâu vào A.', b: { f: [44.5, 5.4], to: [3, 15.6], h: 7, bounce: true } },
        { t: 'Cú 2: A trả bổng, sâu vào trái tay X rồi lên lưới.', b: { f: [-0.4, 15.8], to: [41, 8.6], h: 11, bounce: true }, p: { A: [14.3, 15], X: [43, 8] }, d: 1900 },
        { t: 'Cú 3: X drop bằng trái tay nhưng hơi cao. X và Y bắt đầu tiến lên.', b: { f: [42.6, 8.4], to: [15.4, 8.4], h: 6 }, p: { B: [14.3, 8], X: [36, 7], Y: [36, 14] }, d: 1700 },
        { t: 'Cú 4: bóng ngang thắt lưng, B roll volley xuống chân Y đang tiến lên.', b: { f: [15, 8.4], to: [34, 14.3], h: 1.2, k: 'atk', bounce: true }, p: { Y: [34, 14.3] }, d: 1000 },
        { t: 'Cú 5: Y phải nâng bóng lên, vào giữa.', b: { f: [33.6, 14.3], to: [17, 11], h: 3.6, bounce: true }, p: { B: [14.3, 5], X: [29.7, 5], Y: [29.7, 15] } },
        { t: 'Cú 6: bóng chỉ ngang lưới nên A chưa đập, mà dink vào trái tay Y.', b: { f: [14.9, 14.4], to: [25.5, 17], h: 2.4, bounce: true } },
        { t: 'Cú 7–10: A và Y dink qua lại, A tiếp tục nhắm trái tay Y.', b: { f: [29.2, 16.5], to: [18, 15.5], h: 2.4, bounce: true } },
        { t: 'Cú 11: X dịch vào giữa, chực poach để cứu đồng đội.', b: { f: [14.9, 15], to: [25.5, 17], h: 2.4, bounce: true }, p: { X: [29.7, 9] } },
        { t: 'Cú 12: A dink vào biên ngoài của Y, xa tầm với của X.', b: { f: [29.2, 16.6], to: [18, 15.6], h: 2.4, bounce: true }, d: 1100 },
        { t: '', b: { f: [14.9, 15.2], to: [25.6, 18.8], h: 2.4, bounce: true } },
        { t: 'Cú 13: áp lực tích lũy, Y dink trả cao, ngang ngực B.', b: { f: [29.3, 18.3], to: [15.6, 7], h: 3.6 } },
        { t: 'Cú 14: B speed-up dọc biên phải của đối thủ, vào chỗ X vừa bỏ trống. Ghi điểm.', b: { f: [15, 7], to: [31, 1.5], h: 1, k: 'atk', bounce: true }, hl: { e: [31, 2, 2.4, 2], l: 'Chỗ X bỏ trống' }, d: 900 }
      ]
    },
    'rope': {
      title: 'Di chuyển như có sợi dây nối hai người',
      start: { A: [14.3, 15], B: [14.3, 5], X: [29.7, 5], Y: [29.7, 15] }, rope: ['A', 'B'],
      steps: [
        { t: 'X dink chéo góc rộng ra biên phía A. A dịch ra biên, B dịch theo vào giữa.', b: { f: [29.1, 5.6], to: [17, 19.3], h: 2.6, bounce: true }, p: { A: [14.3, 18.3], B: [14.3, 11] } },
        { t: 'A đánh trả. Khe giữa đã có B che; góc xa phía trên tạm để trống vì đối thủ rất khó đánh tới.', b: { f: [14.8, 18.2], to: [25, 15], h: 2.4, bounce: true }, hl: { r: [3, 0, 15, 4], l: 'Góc xa: khó đánh tới' } },
        { t: 'Y đánh vào giữa: B đã đứng sẵn và xử lý.', b: { f: [29.2, 15], to: [15.3, 11], h: 2.6 } },
        { t: 'Cả hai dịch về lại vị trí cân bằng, khoảng cách luôn khoảng 2,5–3 m.', b: { f: [15, 11], to: [25, 8], h: 2.4, bounce: true }, p: { A: [14.3, 15], B: [14.3, 5] } }
      ]
    },
    'weak': {
      title: 'Khai thác người yếu hơn',
      start: { A: [14.3, 15], B: [14.3, 5], X: [29.7, 5], Y: [29.7, 15] },
      steps: [
        { t: 'Y yếu hơn, X mạnh và hay poach. Đội A dink liên tục vào Y.', b: { f: [14.9, 14.6], to: [25, 15.5], h: 2.4, bounce: true } },
        { t: 'Y dink trả.', b: { f: [29.2, 15.3], to: [18, 14.5], h: 2.4, bounce: true }, d: 1200 },
        { t: 'Đến quả thứ 4, X dịch dần vào giữa, chực poach.', b: { f: [14.9, 14.6], to: [25, 15], h: 2.4, bounce: true }, p: { X: [29.7, 9] } },
        { t: 'A dink vào biên ngoài của Y, xa tầm với của X.', b: { f: [29.2, 15], to: [18, 14.6], h: 2.4, bounce: true }, d: 1100 },
        { t: '', b: { f: [14.9, 14.8], to: [25.6, 18.6], h: 2.4, bounce: true } },
        { t: 'Y dink trả hơi cao về phía B.', b: { f: [29.3, 18.2], to: [15.6, 7.8], h: 3.4 } },
        { t: 'B speed-up dọc biên phải của đối thủ, vào chỗ X vừa bỏ trống.', b: { f: [15, 7.8], to: [31, 1.5], h: 1, k: 'atk', bounce: true }, hl: { e: [31, 2, 2.4, 2], l: 'Chỗ X bỏ trống' }, d: 900 }
      ]
    },
    'singles': {
      title: 'Một điểm đánh đơn',
      start: { A: [-1, 15], X: [45, 5] },
      steps: [
        { t: 'A giao sâu, góc rộng vào thuận tay X, kéo X ra ngoài biên.', b: { f: [-0.4, 14.6], to: [40, 1], h: 7, bounce: true }, p: { X: [43.5, -0.6] } },
        { t: 'X trả về giữa, hơi ngắn. A bước vào trong sân.', b: { f: [43.5, -0.2], to: [10, 10.5], h: 7, bounce: true }, p: { A: [8.5, 11] }, d: 1700 },
        { t: 'A drive dọc dây sang góc còn lại (khoảng trống lớn nhất), rồi lên lưới, đứng lệch về phía đó.', b: { f: [9, 10.6], to: [40, 17.5], h: 1.8, k: 'atk', bounce: true }, p: { A: [14.3, 14], X: [41.5, 16] }, d: 1500 },
        { t: 'X chạy sang, cố passing dọc dây.', b: { f: [41.5, 16.6], to: [15.4, 17.4], h: 2 }, p: { A: [14.3, 16.8] } },
        { t: 'A đã chặn sẵn, vô lê chéo vào góc trống. X không kịp chạy về.', b: { f: [15, 17.2], to: [33, 1.5], h: 1, k: 'atk', bounce: true }, hl: { e: [33, 2, 3, 2.2], l: 'Góc trống' }, d: 900 }
      ]
    },
    'hands': {
      title: 'Đấu vô lê nhanh: counter rồi kết thúc',
      start: { A: [14.3, 15], B: [14.3, 5], X: [29.7, 5], Y: [29.7, 15] },
      steps: [
        { t: 'X speed-up vào vai A.', b: { f: [29, 5.6], to: [15.3, 14.3], h: 1.2, k: 'atk' }, d: 800 },
        { t: 'Vợt A đã ở trước ngực: A counter ngay, đánh xuống chân X.', b: { f: [15, 14.4], to: [29.5, 5.8], h: 0.7, k: 'atk' }, d: 800 },
        { t: 'X phải block từ dưới lên, bóng bay cao.', b: { f: [29.2, 6], to: [16, 8.5], h: 6.5 } },
        { t: 'B đập kết thúc vào khe giữa.', b: { f: [15, 8.4], to: [31, 10], h: 1, k: 'atk', bounce: true }, d: 800 },
        { t: 'Nhớ: bóng tới thấp hơn ngực thì đừng counter, hãy block mềm hoặc reset.', hl: { r: [14, 2, 15.5, 18], l: 'Vợt luôn trước ngực' } }
      ]
    },
    'banger': {
      title: 'Gặp người đánh mạnh: để bóng ra và block mềm',
      start: { A: [14.3, 15], B: [14.3, 5], X: [43.5, 6], Y: [43.5, 15] },
      steps: [
        { t: 'X drive cú thứ 3 rất mạnh; bóng bay ngang vai B và vẫn đang bay lên.', b: { f: [43.2, 6.2], to: [-3, 6.5], h: 4.5, bounce: true }, p: { B: [14.3, 3.4] }, d: 1300 },
        { t: 'B không đánh, nghiêng người tránh. Bóng rơi ra ngoài vạch cuối, đội A ghi điểm.', hl: { e: [-2.6, 6.5, 1.6, 1.6], l: 'Ra ngoài' } },
        { t: 'Điểm sau, X drive thấp hơn, vào chân A.', b: { f: [43.2, 14.2], to: [15.6, 14.8], h: 1.6, k: 'atk' }, p: { B: [14.3, 5], X: [43.5, 14], Y: [43.5, 6] }, d: 1100 },
        { t: 'A block mềm vào kitchen. X phải chạy lên và đánh bóng từ dưới lên.', b: { f: [15, 14.8], to: [25, 13], h: 2.4, bounce: true }, p: { X: [27.5, 12.6] }, d: 1600 },
        { t: 'X nâng bóng cao.', b: { f: [27.4, 12.6], to: [15.6, 7], h: 5.5 } },
        { t: 'B đập kết thúc.', b: { f: [15, 7], to: [33, 3.5], h: 1, k: 'atk', bounce: true }, d: 800 }
      ]
    },
    'return': {
      title: 'Trả giao bóng và lên lưới',
      start: { A: [-1, 16], B: [14.3, 5], X: [45, 5], Y: [45, 15] },
      steps: [
        { t: 'X giao chéo, sâu vào ô của A.', b: { f: [44.5, 5.4], to: [3, 15.6], h: 7, bounce: true } },
        { t: 'A trả bổng, sâu vào trái tay X (bóng chậm, nhiều thời gian).', b: { f: [-0.4, 15.8], to: [41, 8.6], h: 11, bounce: true }, p: { A: [8, 15.4], X: [43, 8] }, d: 1900 },
        { t: 'Trong lúc bóng bay, A chạy thẳng lên vạch kitchen. X phải chờ bóng nảy rồi mới đánh.', p: { A: [14.3, 15] }, d: 1000 },
        { t: 'X đánh cú thứ 3 từ cuối sân; A và B đã đứng sẵn ở lưới.', b: { f: [42.5, 8.4], to: [19.5, 11], h: 6, bounce: true }, p: { Y: [44, 15] } },
        { t: 'Đội A chiếm lưới trước, đội X vẫn còn ở cuối sân.', hl: { r: [14, 2, 15.5, 18], l: 'Đội A ở lưới' } }
      ]
    },
    'drop3': {
      title: 'Third-shot drop',
      start: { A: [-1, 15], B: [-1, 5], X: [44, 5.5], Y: [29.7, 15] },
      steps: [
        { t: 'X trả giao bóng sâu về A rồi chạy lên lưới.', b: { f: [44, 5.5], to: [2, 14], h: 9, bounce: true }, p: { X: [30.5, 5.5] }, d: 1800 },
        { t: 'A đánh third-shot drop: bóng vồng, điểm cao nhất ở sân mình, rơi vào kitchen đối thủ.', b: { f: [-0.4, 14.4], to: [25.5, 9], h: 6.5, bounce: true }, p: { A: [5, 14.5], B: [5, 5.5] }, d: 1800 },
        { t: 'Bóng nảy thấp, Y phải đánh từ dưới lên, bóng chậm.', b: { f: [26.5, 9.3], to: [12, 10], h: 3, bounce: true }, p: { Y: [27, 10.5], A: [9, 14.5], B: [9, 5.5] } },
        { t: 'A, B dừng split step rồi tiến tiếp; B dink lại vào kitchen.', b: { f: [11.5, 9.5], to: [25, 7], h: 3, bounce: true }, p: { A: [14.3, 15], B: [14.3, 5], Y: [29.7, 15] } },
        { t: 'Cả bốn người ở lưới: điểm chuyển sang thế dink cân bằng.', hl: { r: [14, 1, 30, 19], l: 'Thế dink' } }
      ]
    },
    'transition': {
      title: 'Đi từng bước qua vùng chuyển tiếp',
      start: { A: [1, 15], B: [1, 5], X: [29.7, 5], Y: [29.7, 15] },
      steps: [
        { t: 'A drop vào kitchen; A và B tiến khoảng 3 bước.', b: { f: [1.5, 14.6], to: [25, 12], h: 6, bounce: true }, p: { A: [6, 15], B: [6, 5] }, hl: { r: [5, 0, 15, 20], l: 'Vùng chuyển tiếp' } },
        { t: 'X dink vào chân A. A dừng lại, split step (không chạy khi đối thủ đang đánh).', b: { f: [28.5, 6], to: [7, 14.6], h: 3, bounce: true } },
        { t: 'A reset nhẹ vào giữa kitchen.', b: { f: [6.6, 14.6], to: [25, 10], h: 3.5, bounce: true } },
        { t: 'A và B tiến thêm 2 bước. Y vô lê nhẹ xuống chân B.', b: { f: [29, 14], to: [10.6, 5.6], h: 2.5, bounce: true }, p: { A: [10, 15], B: [10, 5] } },
        { t: 'B block mềm vào kitchen, cả hai tới vạch kitchen mà không mất điểm.', b: { f: [10.6, 5.5], to: [25, 7], h: 3, bounce: true }, p: { A: [14.3, 15], B: [14.3, 5] } }
      ]
    },
    'dinkWide': {
      title: 'Dink kéo rộng rồi đánh vào khe giữa',
      start: { A: [14.3, 15], B: [14.3, 5], X: [29.7, 5], Y: [29.7, 15] },
      steps: [
        { t: 'A dink chéo góc rộng, kéo X ra sát biên.', b: { f: [14.9, 14.4], to: [24.5, 1], h: 2.6, bounce: true }, p: { X: [29, 1.4] } },
        { t: 'X với người dink trả lại, bóng hơi cao.', b: { f: [28.5, 1.6], to: [17.5, 13], h: 3.4, bounce: true } },
        { t: 'Khe giữa X và Y mở ra.', hl: { e: [30, 8.5, 2.4, 3.6], l: 'Khe giữa' } },
        { t: 'A speed-up vào khe giữa. Hai đối thủ đều không kịp.', b: { f: [15, 14], to: [33, 8.5], h: 1.3, k: 'atk' } }
      ]
    },
    'speedup': {
      title: 'Speed-up đúng lúc',
      start: { A: [14.3, 15], B: [14.3, 5], X: [29.7, 5], Y: [29.7, 15] },
      steps: [
        { t: 'A và X dink chéo với nhau.', b: { f: [14.9, 14.4], to: [24, 6.5], h: 2.5, bounce: true } },
        { t: 'Y (đối diện A) không tham gia chuỗi dink, dần thả lỏng và hạ vợt.', b: { f: [28.9, 5.8], to: [18, 13.5], h: 2.5, bounce: true } },
        { t: 'A dink chéo tiếp.', b: { f: [14.9, 14.4], to: [24, 6], h: 2.5, bounce: true }, d: 1200 },
        { t: 'X dink hơi cao, bóng nảy ngang gối A (đèn xanh).', b: { f: [28.9, 5.8], to: [16, 14.2], h: 3.6, bounce: true } },
        { t: 'A speed-up thẳng vào vai thuận tay của Y.', b: { f: [15, 14.4], to: [29.4, 14.1], h: 1.2, k: 'atk' }, d: 800 },
        { t: 'Y gập tay, chỉ block được bóng lên cao.', b: { f: [29.2, 14.1], to: [16, 7], h: 7 } },
        { t: 'B đập xuống chân X.', b: { f: [15, 6.8], to: [30.5, 5.7], h: 0.8, k: 'atk', bounce: true }, d: 800 }
      ]
    },
    'poach': {
      title: 'Poach: cướp bóng và đổi vị trí',
      start: { A: [14.3, 15], B: [14.3, 5], X: [29.7, 5], Y: [29.7, 15] },
      steps: [
        { t: 'A và X dink chéo nhiều quả.', b: { f: [14.9, 14.4], to: [24, 6.5], h: 2.5, bounce: true } },
        { t: 'X dink chéo, hơi cao. B bắt đầu cắt ngang vào giữa.', b: { f: [28.9, 5.8], to: [15.2, 10.4], h: 3.2 }, p: { B: [14.3, 10.2] } },
        { t: 'B vô lê xuống chân Y; A lùi nhẹ và đổi sang bên trái.', b: { f: [15, 10.3], to: [31, 16], h: 1, k: 'atk', bounce: true }, p: { A: [12.5, 6.5] }, d: 1000 },
        { t: 'Đổi vị trí xong: B che bên phải, A che bên trái.', p: { A: [14.3, 5], B: [14.3, 15] } }
      ]
    },
    'stack': {
      title: 'Stack khi giao bóng (A thuận phải, B thuận trái)',
      start: { A: [-1, -1.6], B: [-1, 4], X: [29.7, 5], Y: [45, 15] },
      steps: [
        { t: 'Đội A có điểm lẻ, B phải giao từ ô trái. A đứng ngoài biên, sát B.', hl: { r: [-2.5, -3, 0.5, 6], l: 'Cùng một bên' } },
        { t: 'B giao chéo.', b: { f: [-0.4, 4.4], to: [37, 15], h: 7, bounce: true } },
        { t: 'Ngay sau khi giao: B chạy sang phải, A vào bên trái.', b: { f: [44.5, 15], to: [4, 11], h: 9, bounce: true }, p: { B: [1, 15], A: [1, 5], Y: [36, 15] }, d: 1900 },
        { t: 'Kết quả: thuận tay của cả A và B đều quay vào giữa sân.', hl: { r: [-1, 8, 4, 12], l: 'Hai thuận tay ở giữa' } }
      ]
    },
    'shake': {
      title: 'Shake-and-bake',
      start: { A: [-1, 15], B: [-1, 5], X: [29.7, 5], Y: [33, 15] },
      steps: [
        { t: 'Y trả giao bóng hơi ngắn, nảy cao về phía A.', b: { f: [40, 15], to: [5, 15], h: 7, bounce: true }, p: { Y: [29.7, 15], A: [3, 15] } },
        { t: 'A drive mạnh vào khe giữa. Ngay khi A vung, B lao lên.', b: { f: [3.4, 14.6], to: [29.3, 10], h: 1.6, k: 'atk' }, p: { B: [12.5, 8] }, d: 1100 },
        { t: 'X block lên, bóng chậm.', b: { f: [29, 9.6], to: [14.6, 8.4], h: 4 } },
        { t: 'B đã sát lưới, vô lê kết thúc xuống chân Y.', b: { f: [13.4, 8.1], to: [31, 16.4], h: 1, k: 'atk', bounce: true }, p: { A: [7, 15] }, d: 900 }
      ]
    },
    'erne': {
      title: 'Erne',
      start: { A: [14.3, 16.5], B: [14.3, 6], X: [29.7, 5], Y: [29.7, 15.5] },
      steps: [
        { t: 'A dink dọc dây cho Y.', b: { f: [14.9, 16.6], to: [25, 17.3], h: 2.5, bounce: true } },
        { t: 'Y dink trả dọc dây, sát biên.', b: { f: [29.1, 16.2], to: [18.5, 18.6], h: 2.5, bounce: true } },
        { t: 'A dink dọc dây lần nữa, rồi bước ra ngoài biên.', b: { f: [14.8, 17], to: [25, 17.5], h: 2.5, bounce: true }, p: { A: [14.4, 21.2] } },
        { t: 'A đi vòng ngoài góc kitchen (không chạm kitchen). B dịch vào che giữa.', p: { A: [18, 21.4], B: [14.3, 10] }, hl: { r: [15, 15, 22, 20], l: 'Kitchen' } },
        { t: 'Y lại dink dọc dây theo thói quen. A vô lê ngay sát lưới, xuống khe giữa.', b: { f: [29.1, 16.4], to: [18.5, 20.8], h: 2.2 }, d: 1100 },
        { t: '', b: { f: [18.6, 20.8], to: [31.5, 10.5], h: 1, k: 'atk', bounce: true }, d: 800 }
      ]
    },
    'atp': {
      title: 'ATP: đánh vòng ngoài cột lưới',
      start: { A: [14.3, 15], B: [14.3, 6], X: [29.7, 5], Y: [29.7, 15] },
      steps: [
        { t: 'X dink chéo quá rộng, bóng nảy ra ngoài biên.', b: { f: [29.1, 4.6], to: [18.6, -1.5], h: 2.5, bounce: true }, p: { B: [17, -2.6] }, d: 1600 },
        { t: 'B chạy theo ra ngoài sân, để bóng xuống thấp.', b: { f: [18.6, -1.5], to: [17.8, -3.1], h: 0.8 }, d: 800 },
        { t: 'B đánh thấp, song song lưới, vòng ngoài cột lưới vào sân đối thủ.', b: { f: [17.8, -3.1], to: [33, 2.5], via: [22, -6], h: 0.9, k: 'atk', bounce: true }, d: 1300 },
        { t: 'Bóng hợp lệ dù không đi qua phía trên lưới.', hl: { e: [22, -1, 1.4, 1.4], l: 'Cột lưới' } }
      ]
    }
  };

  function build(el) {
    const sc = SC[el.dataset.sim]; if (!sc || el._simInit) return; el._simInit = true;
    // tính sẵn vị trí đầu mỗi bước
    const starts = [Object.assign({}, sc.start)];
    sc.steps.forEach((s, i) => { const n = Object.assign({}, starts[i]); if (s.p) Object.assign(n, s.p); starts.push(n); });
    el.innerHTML = '<div class="sim-head"><span class="sim-tag">Mô phỏng</span><b></b></div>' +
      '<div class="sim-stage"><canvas></canvas></div>' +
      '<div class="sim-bar"><button type="button" class="sim-play" aria-label="Phát"></button>' +
      '<button type="button" class="sim-prev" aria-label="Bước trước">‹</button><button type="button" class="sim-next" aria-label="Bước sau">›</button>' +
      '<button type="button" class="sim-reset" aria-label="Xem lại từ đầu">↺</button>' +
      '<div class="sim-dots"></div><button type="button" class="sim-speed" aria-label="Tốc độ">1×</button></div>' +
      '<p class="sim-cap" aria-live="polite"></p>';
    el.querySelector('.sim-head b').textContent = sc.title;
    const cv = el.querySelector('canvas'), g = cv.getContext('2d'), cap = el.querySelector('.sim-cap');
    const playBtn = el.querySelector('.sim-play'), dots = el.querySelector('.sim-dots'), spBtn = el.querySelector('.sim-speed');
    const N = sc.steps.length;
    for (let i = 0; i < N; i++) { const d = document.createElement('button'); d.type = 'button'; d.className = 'sim-dot'; d.setAttribute('aria-label', 'Bước ' + (i + 1)); d.addEventListener('click', () => { stop(); goto(i, 1); }); dots.appendChild(d); }
    let step = 0, prog = 0, playing = false, speed = 1, raf = 0, last = 0, hold = 0;
    const speeds = [1, 1.5, 0.5];

    // ----- vẽ -----
    let W = 0, H = 0, S = 1;
    const X0 = -4, Y0 = -4.5, LW = 52, LH = 29;
    const P = (x, y) => [(x - X0) * S, (y - Y0) * S];
    function size() { const r = el.querySelector('.sim-stage').clientWidth || 600; const dpr = window.devicePixelRatio || 1; W = r; H = r * LH / LW; S = W / LW; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + 'px'; g.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); }
    function court() {
      g.fillStyle = '#3f8f5f'; g.fillRect(0, 0, W, H);
      const a = P(0, 0); g.fillStyle = '#2f6fb3'; g.fillRect(a[0], a[1], 44 * S, 20 * S);
      const k = P(15, 0); g.fillStyle = '#5b9be0'; g.fillRect(k[0], k[1], 14 * S, 20 * S);
      g.strokeStyle = '#fff'; g.lineWidth = Math.max(1.5, S * 0.12); g.strokeRect(a[0], a[1], 44 * S, 20 * S);
      g.beginPath(); [[15, 0, 15, 20], [29, 0, 29, 20], [0, 10, 15, 10], [29, 10, 44, 10]].forEach(([x1, y1, x2, y2]) => { g.moveTo(...P(x1, y1)); g.lineTo(...P(x2, y2)); }); g.stroke();
      g.strokeStyle = '#111'; g.lineWidth = Math.max(3, S * 0.25); g.beginPath(); g.moveTo(...P(NETX, -1)); g.lineTo(...P(NETX, 21)); g.stroke();
      g.fillStyle = '#111';[[NETX, -1], [NETX, 21]].forEach(p => { g.beginPath(); g.arc(...P(...p), Math.max(3, S * 0.3), 0, 7); g.fill(); });
    }
    function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
    function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function ballAt(b, t) {
      let p; if (b.via) { const u = 1 - t; p = [u * u * b.f[0] + 2 * u * t * b.via[0] + t * t * b.to[0], u * u * b.f[1] + 2 * u * t * b.via[1] + t * t * b.to[1]]; } else p = lerp(b.f, b.to, t);
      return { p, h: 4 * (b.h || 1) * t * (1 - t) };
    }
    function path(b, alpha, upto) {
      g.save(); g.globalAlpha = alpha; g.strokeStyle = b.k === 'atk' ? '#ff1744' : '#ffeb3b'; g.lineWidth = Math.max(2, S * 0.14); g.setLineDash(b.k === 'atk' ? [] : [S * 0.5, S * 0.35]);
      g.beginPath(); for (let i = 0; i <= 40; i++) { const t = upto * i / 40; const q = ballAt(b, t).p; const s = P(...q); i ? g.lineTo(...s) : g.moveTo(...s); } g.stroke(); g.restore();
    }
    function player(id, p) {
      const s = P(...p), r = Math.max(9, S * 0.75);
      g.beginPath(); g.arc(s[0], s[1] + r * 0.25, r, 0, 7); g.fillStyle = 'rgba(0,0,0,.18)'; g.fill();
      g.beginPath(); g.arc(s[0], s[1], r, 0, 7); g.fillStyle = K[id]; g.fill(); g.lineWidth = 2; g.strokeStyle = '#fff'; g.stroke();
      g.fillStyle = '#fff'; g.font = '700 ' + Math.round(r * 1.05) + 'px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(id, s[0], s[1] + 1);
    }
    function label(t, x, y) {
      g.font = '600 ' + Math.max(11, Math.round(S * 0.62)) + 'px system-ui,sans-serif'; const w = g.measureText(t).width + 12, h = Math.max(18, S * 0.95);
      g.fillStyle = 'rgba(255,255,255,.94)'; g.beginPath(); g.roundRect ? g.roundRect(x - w / 2, y - h / 2, w, h, 5) : g.rect(x - w / 2, y - h / 2, w, h); g.fill();
      g.fillStyle = '#1a1a1a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, x, y + 1);
    }
    function highlight(hl, a) {
      g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(255,23,68,.22)'; g.strokeStyle = '#ff1744'; g.lineWidth = 2; g.setLineDash([6, 5]);
      let lx, ly;
      if (hl.e) { const c = P(hl.e[0], hl.e[1]); g.beginPath(); g.ellipse(c[0], c[1], hl.e[2] * S, hl.e[3] * S, 0, 0, 7); g.fill(); g.stroke(); lx = c[0]; ly = c[1] - hl.e[3] * S - S * 0.9; }
      if (hl.r) { const a1 = P(hl.r[0], hl.r[1]), a2 = P(hl.r[2], hl.r[3]); g.beginPath(); g.rect(a1[0], a1[1], a2[0] - a1[0], a2[1] - a1[1]); g.fill(); g.stroke(); lx = (a1[0] + a2[0]) / 2; ly = Math.max(a1[1] - S * 0.9, S * 0.8); }
      g.setLineDash([]); if (hl.l) label(hl.l, lx, ly); g.restore();
    }
    function stateAt(key) { let v = sc[key]; for (let i = 0; i <= Math.min(step, N - 1); i++) if (sc.steps[i][key]) v = sc.steps[i][key]; return v; }
    function draw() {
      if (!W) return; g.clearRect(0, 0, W, H); court();
      const s = sc.steps[Math.min(step, N - 1)], t = step >= N ? 1 : prog;
      // đường bóng các bước trước
      for (let i = Math.max(0, step - 2); i < Math.min(step, N); i++) if (sc.steps[i].b) path(sc.steps[i].b, 0.35, 1);
      if (step < N && s.hl) highlight(s.hl, Math.min(1, t * 3));
      // người chơi
      const from = starts[Math.min(step, N)], to = starts[Math.min(step + 1, N)], e = ease(t);
      const cur = {}; Object.keys(from).forEach(id => { cur[id] = lerp(from[id], to[id] || from[id], e); });
      if (sc.rope) { const a = P(...cur[sc.rope[0]]), b = P(...cur[sc.rope[1]]); g.save(); g.strokeStyle = '#ffab00'; g.lineWidth = Math.max(2, S * 0.16); g.setLineDash([S * 0.4, S * 0.3]); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.restore(); }
      const srv = stateAt('srv'); if (srv && cur[srv]) { const c = P(...cur[srv]); g.beginPath(); g.arc(c[0], c[1], Math.max(14, S * 1.15), 0, 7); g.strokeStyle = '#ffeb3b'; g.lineWidth = 3; g.stroke(); }
      Object.keys(from).forEach(id => {
        const a = from[id], b = to[id] || a;
        if (a[0] !== b[0] || a[1] !== b[1]) { g.save(); g.strokeStyle = 'rgba(255,255,255,.75)'; g.setLineDash([5, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(...P(...a)); g.lineTo(...P(...lerp(a, b, e))); g.stroke(); g.restore(); }
        player(id, lerp(a, b, e));
      });
      // bóng
      if (step < N && s.b) {
        path(s.b, 0.9, t); const q = ballAt(s.b, t), sp = P(...q.p);
        g.beginPath(); g.ellipse(sp[0] + q.h * S * 0.35, sp[1] + q.h * S * 0.35, S * 0.35, S * 0.22, 0, 0, 7); g.fillStyle = 'rgba(0,0,0,.28)'; g.fill();
        const by = sp[1] - q.h * S * 0.45, br = Math.max(4, S * (0.32 + q.h * 0.03));
        g.beginPath(); g.arc(sp[0], by, br, 0, 7); g.fillStyle = '#ffeb3b'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#333'; g.stroke();
        if (s.b.bounce && t > 0.97) { const bp = P(...s.b.to); g.beginPath(); g.arc(bp[0], bp[1], S * 0.6, 0, 7); g.strokeStyle = '#ffeb3b'; g.lineWidth = 2; g.stroke(); }
      }
      const score = stateAt('sc') || sc.score; if (score) { g.font = '700 ' + Math.max(12, Math.round(S * 0.8)) + 'px system-ui,sans-serif'; const tx = 'Gọi điểm: ' + score; const w = g.measureText(tx).width + 16, h = Math.max(22, S * 1.3); g.fillStyle = 'rgba(17,17,17,.82)'; g.fillRect(8, 8, w, h); g.fillStyle = '#ffeb3b'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(tx, 16, 8 + h / 2 + 1); }
      if (step >= N) { const lastHl = sc.steps[N - 1].hl; if (lastHl) highlight(lastHl, 1); }
    }
    // ----- điều khiển -----
    function caption() {
      let i = Math.min(step, N - 1); while (i > 0 && !sc.steps[i].t) i--;
      cap.textContent = (i + 1) + '/' + N + '. ' + sc.steps[i].t;
      [...dots.children].forEach((d, j) => { d.classList.toggle('on', j === Math.min(step, N - 1)); d.classList.toggle('done', j < step); });
      playBtn.textContent = playing ? '❚❚' : (step >= N ? '↻' : '▶'); playBtn.setAttribute('aria-label', playing ? 'Tạm dừng' : 'Phát');
    }
    function goto(i, p) { step = Math.max(0, Math.min(N, i)); prog = p; if (step >= N) prog = 1; caption(); draw(); }
    function tick(now) {
      if (!playing) return; const dt = Math.min(64, now - (last || now)); last = now;
      if (hold > 0) { hold -= dt; if (hold <= 0) { if (step + 1 >= N) { step = N; playing = false; caption(); draw(); return; } step++; prog = 0; caption(); } }
      else { const d = (sc.steps[step].d || 1500) / speed; prog = Math.min(1, prog + dt / d); if (prog >= 1) hold = (sc.steps[step].t ? 650 : 120) / speed; }
      draw(); raf = requestAnimationFrame(tick);
    }
    function play() { if (step >= N) goto(0, 0); playing = true; last = 0; caption(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
    function stop() { playing = false; cancelAnimationFrame(raf); caption(); }
    playBtn.addEventListener('click', () => playing ? stop() : play());
    el.querySelector('.sim-prev').addEventListener('click', () => { stop(); goto(step >= N ? N - 1 : Math.max(0, step - (prog >= 1 ? 1 : 0) - (prog < 1 && step > 0 ? 1 : 0)), 1); });
    el.querySelector('.sim-next').addEventListener('click', () => { stop(); goto(prog < 1 ? step : step + 1, 1); });
    el.querySelector('.sim-reset').addEventListener('click', () => { stop(); goto(0, 0); });
    spBtn.addEventListener('click', () => { speed = speeds[(speeds.indexOf(speed) + 1) % speeds.length]; spBtn.textContent = speed + '×'; });
    new ResizeObserver(size).observe(el.querySelector('.sim-stage'));
    // trạng thái ban đầu: vị trí xuất phát, bước 1 chưa chạy
    goto(0, 0); size();
    // dừng khi cuộn ra khỏi màn hình
    new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting && playing) stop(); })).observe(el);
  }
  function scan(root) { (root || document).querySelectorAll('.sim[data-sim]').forEach(build); }
  scan();
  // nội dung có thể được dựng lại khi tìm kiếm → khởi tạo lại mô phỏng
  new MutationObserver(ms => { if (ms.some(m => m.addedNodes.length)) scan(); }).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
})();
