"""Tạo trang web Sổ tay Pickleball.

Chạy:  python build.py
Kết quả: dist/so-tay-pickleball.html (một file duy nhất, đã nhúng sẵn hình)
"""
import re, html, base64, os

ROOT = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(ROOT, 'content', 'noi-dung.html')
IMAGES = os.path.join(ROOT, 'content')
TEMPLATE = os.path.join(ROOT, 'src', 'template.html')
SIMJS = os.path.join(ROOT, 'src', 'sim.js')
# Mô phỏng hoạt hình gắn vào tiểu mục chiến thuật (id tiểu mục -> tên kịch bản trong src/sim.js)
SIMS = {'s16-2': 'return', 's16-3': 'drop3', 's16-4': 'transition', 's16-8': 'dinkWide', 's16-9': 'speedup',
        's16-13': 'poach', 's16-14': 'stack', 's16-15': 'shake', 's16-16': 'erne', 's16-17': 'atp',
        's1-3': 'serveOrder', 's16-22': 'fullPoint', 's16-12': 'rope', 's16-19': 'weak', 's17-6': 'singles',
        's16-11': 'hands', 's16-23': 'banger'}
OUT_DIR = os.path.join(ROOT, 'dist')
OUT = os.path.join(OUT_DIR, 'so-tay-pickleball.html')

s = open(CONTENT, encoding='utf-8').read().replace('<meta charset="utf-8">', '')

# Nhúng hình (content/images/*.png) vào trang dưới dạng data URI
def _inline(m):
    path = os.path.join(IMAGES, m.group(1))
    if not os.path.exists(path):
        print('  ! Không tìm thấy hình:', m.group(1))
        return m.group(0)
    data = base64.b64encode(open(path, 'rb').read()).decode()
    return 'src="data:image/png;base64,' + data + '"'
s = re.sub(r'src="(images/[^"]+\.png)"', _inline, s)
toks = re.split(r'(<h[1-5]>.*?</h[1-5]>)', s)

# ---------- level tags ----------
CB, TC, NC, TD = 'cb', 'tc', 'nc', 'td'
SEC_LV = {
    '1': [CB, TD], '2': [CB], '3': [CB, TC], '4': [CB, TC, NC, TD], '5': [CB], '6': [TC],
    '7': [NC], '8': [NC, TD], '9': [TC, NC], '10': [CB, TC, NC], '11': [CB, TC], '12': [CB, TC],
    '13': [CB, TC], '15': [TC, NC], '17': [NC], '18': [NC], '19': [TD, NC], '20': [TD],
    '21': [TC], '22': [TC, TD], '23': [CB, TC, NC, TD],
}
SUB14 = {'1': [CB], '2': [CB], '3': [CB], '4': [TC], '5': [TC], '6': [CB], '7': [CB], '8': [NC], '9': [NC],
         '10': [TC], '11': [TC], '12': [TC], '13': [NC], '14': [NC], '15': [CB, TC, NC]}

def sub_lv(sec, sub):
    if sec == '14':
        return SUB14.get(sub, [CB, TC, NC])
    if sec == '16':
        n = int(sub)
        lv = [TC] if n <= 12 else [NC]
        if n in (1, 2, 20, 21, 23, 26):
            lv = lv + [TD]
        return lv
    return SEC_LV.get(sec, [CB, TC, NC, TD])

def slug_num(t):
    m = re.match(r'^(\d+(?:\.\d+)*)\.\s', t)
    return m.group(1) if m else None

def strip_tags(x):
    return re.sub(r'<[^>]+>', '', x)

# ---------- build tree ----------
title = ''
parts = []  # {title, id, intro, secs}
cur_part = cur_sec = cur_sub = None
gi = 0
def add_body(h):
    if cur_sub is not None:
        cur_sub['body'] += h
    elif cur_sec is not None:
        cur_sec['intro'] += h
    elif cur_part is not None:
        cur_part['intro'] += h

i = 0
while i < len(toks):
    t = toks[i]
    m = re.match(r'<(h[1-5])>(.*?)</h[1-5]>', t)
    if not m:
        if t.strip():
            add_body(t)
        i += 1
        continue
    lvl, txt = m.group(1), html.unescape(m.group(2))
    if lvl == 'h1':
        title = txt
    elif lvl == 'h2':
        cur_part = {'title': txt, 'intro': '', 'secs': [], 'id': 'p%d' % len(parts)}
        parts.append(cur_part); cur_sec = cur_sub = None
    elif lvl == 'h3':
        num = slug_num(txt)
        gi += 1
        sid = 's' + num if num else 'g%d' % gi
        cur_sec = {'title': txt, 'num': num, 'id': sid, 'intro': '', 'subs': []}
        cur_part['secs'].append(cur_sec); cur_sub = None
    elif lvl == 'h4':
        num = slug_num(txt)
        sid = 's' + num.replace('.', '-')
        cur_sub = {'title': txt, 'num': num, 'id': sid, 'body': ''}
        cur_sec['subs'].append(cur_sub)
    elif lvl == 'h5':
        num = slug_num(txt)
        sid = 's' + num.replace('.', '-') if num else ''
        add_body('<h5 id="%s">%s</h5>' % (sid, html.escape(txt)))
    i += 1

# ---------- render ----------
GROUP16 = {}
for g, nums in [('Giao bóng và trả giao bóng', [1, 2, 3]), ('Lên lưới và hướng bóng', [4, 5, 6, 7]),
                ('Tấn công ở lưới', [8, 9, 10]), ('Phòng thủ', [11, 25]),
                ('Phối hợp đánh đôi', [12, 13, 14, 15, 24]), ('Cú đặc biệt', [16, 17]),
                ('Đọc trận và ra quyết định', [18, 19, 20, 21, 23, 26]), ('Tổng hợp', [22])]:
    for n in nums:
        GROUP16[n] = g
LVNAME = {CB: 'Cơ bản', TC: 'Trung cấp', NC: 'Nâng cao', TD: 'Thi đấu'}
def chips(lv):
    return '<span class="lv">' + ''.join('<span class="chip %s">%s</span>' % (l, LVNAME[l]) for l in lv) + '</span>'

def split_title(t):
    num = slug_num(t)
    if num:
        return num, t[len(num) + 1:].strip()
    return '', t

out = []
for p in parts:
    is_guide = p['id'] == 'p0'
    ptitle = p['title']
    m = re.match(r'^(PHẦN [IVX]+|PHỤ LỤC)\s*(?:–\s*)?(.*)$', ptitle)
    if m and m.group(2):
        eyebrow, pname = 'Phần ' + m.group(1).split()[1], m.group(2).capitalize()
    elif m:
        eyebrow, pname = '', 'Phụ lục'
    else:
        eyebrow, pname = '', 'Hướng dẫn và tóm tắt nhanh'
    out.append('<section class="part%s" id="%s" data-title="%s">' % (' guide' if is_guide else '', p['id'], html.escape(pname)))
    out.append('<header class="part-head">%s<h2>%s</h2></header>' % ('<span class="eyebrow">%s</span>' % eyebrow if eyebrow else '', html.escape(pname)))
    for sec in p['secs']:
        num, name = split_title(sec['title'])
        if is_guide:
            lv = [CB, TC, NC, TD]
        elif sec['subs'] and sec['num'] in ('14', '16'):
            lv = sorted({x for sb in sec['subs'] for x in sub_lv(sec['num'], sb['num'].split('.')[1])}, key=[CB, TC, NC, TD].index)
        else:
            lv = SEC_LV.get(sec['num'], [CB, TC, NC, TD])
        tabbed = eyebrow == 'Phần IV' and len(sec['subs']) > 1
        out.append('<article class="sec%s" id="%s" data-lv="%s">' % (' tabbed' if tabbed else '', sec['id'], ' '.join(lv)))
        out.append('<header class="sec-head">%s<h3>%s</h3>%s</header>' % (
            '<span class="num">%s</span>' % num if num else '', html.escape(name), '' if is_guide else chips(lv)))
        if sec['intro'].strip():
            out.append('<div class="blk intro" data-lv="%s">%s</div>' % (' '.join(lv), sec['intro']))
        for sb in sec['subs']:
            snum, sname = split_title(sb['title'])
            slv = sub_lv(sec['num'], snum.split('.')[1]) if sec['num'] in ('14', '16') else lv
            grp = GROUP16.get(int(snum.split('.')[1]), '') if sec['num'] == '16' else ''
            out.append('<details class="blk sub" id="%s" data-lv="%s" data-group="%s" open><summary><span class="num">%s</span><h4>%s</h4></summary><div class="sub-body">%s</div></details>' % (
                sb['id'], ' '.join(slv), grp, snum, html.escape(sname), ('<div class="sim" data-sim="%s"></div>' % SIMS[sb['id']] if sb['id'] in SIMS else '') + sb['body']))
        out.append('</article>')
    out.append('</section>')

content = '\n'.join(out)
# tidy tables / figures
content = content.replace('Mở mục lục bên trái (biểu tượng danh sách) để chuyển nhanh giữa các mục.', 'Dùng mục lục bên trái (trên điện thoại là nút Mục lục), ô tìm kiếm và bộ lọc trình độ ở thanh trên cùng để tra cứu nhanh.').replace('Tài liệu chia làm', 'Sổ tay chia làm')
content = content.replace('<i>Phân tích:</i>', '<span class="tag">Phân tích</span>')

tpl = open(TEMPLATE, encoding='utf-8').read()
page = tpl.replace('{{CONTENT}}', content).replace('{{SIM}}', open(SIMJS, encoding='utf-8').read())
os.makedirs(OUT_DIR, exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(page)
print('Đã tạo', OUT, '-', sum(len(p['secs']) for p in parts), 'mục,', len(page) // 1024, 'KB')
