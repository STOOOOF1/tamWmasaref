// يولّد ملفي PDF (المذكرة والملخص) من مصادر HTML بخط تجوال المحلي
// التشغيل من جذر المستودع: node files/src/build.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const OUT = path.join(SRC, '..');
const font = fs.readFileSync(path.join(SRC, '../../assets/fonts/Tajawal-Medium.ttf')).toString('base64');

const footer = (label) => `
<style>@font-face{font-family:TJ;src:url(data:font/ttf;base64,${font})}</style>
<div dir="rtl" style="font-family:TJ;font-size:8px;color:#5b6a6c;width:100%;padding:0 15mm;display:flex;justify-content:space-between;align-items:center">
<span>${label}</span>
<span style="color:#94661c">أُعدّ بواسطة الذكاء الاصطناعي · المرجع الشرائح الأصلية</span>
<span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
</div>`;

const jobs = [
  ['memo.html', 'مذكرة-التمويل-الإسلامي-المدمجة.pdf', 'مذكرة التمويل الإسلامي (مدمجة بالذكاء الاصطناعي)'],
  ['summary.html', 'ملخص-التمويل-الإسلامي.pdf', 'ملخص التمويل الإسلامي'],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [src, out, label] of jobs) {
    if (!fs.existsSync(path.join(SRC, src))) continue;
    await page.goto('file://' + path.join(SRC, src));
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: path.join(OUT, out), format: 'A4', printBackground: true, preferCSSPageSize: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: footer(label),
    });
    console.log('built', out);
  }
  await browser.close();
})();
