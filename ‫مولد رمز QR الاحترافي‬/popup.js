let qrOptions = {
    width: 200, height: 200, data: "https://google.com",
    dotsOptions: { color: "#000000", type: "square" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "square", color: "#000000" },
    cornersDotOptions: { type: "square", color: "#000000" }
};

const qrCode = new QRCodeStyling(qrOptions);

document.addEventListener('DOMContentLoaded', async () => {
    // رسم الـ QR
    const container = document.getElementById("qr-container");
    if (container) qrCode.append(container);

    // جلب الرابط الحالي
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            document.getElementById('url-input').value = tab.url;
            updateQR(tab.url);
        }
    } catch (e) { console.log("Extension context error"); }

    // --- ربط الأحداث خارجياً (CSP Safe) ---

    // 1. التبويبات
    const tabs = { 'btn-link': 'tab-link', 'btn-style': 'tab-style', 'btn-color': 'tab-color' };
    Object.keys(tabs).forEach(btnId => {
        document.getElementById(btnId).addEventListener('click', function() {
            // إزالة النشاط من الجميع
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // تفعيل الزر والمحتوى المطلوب
            this.classList.add('active');
            document.getElementById(tabs[btnId]).classList.add('active');
        });
    });

    // 2. تحديث الرابط
    document.getElementById('url-input').addEventListener('input', (e) => updateQR(e.target.value));

    // 3. أزرار النمط
    document.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            document.querySelectorAll(`.opt-btn[data-type="${type}"]`).forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            
            const val = this.dataset.val;
            if (type === 'dots') qrOptions.dotsOptions.type = val;
            if (type === 'cornersSquare') qrOptions.cornersSquareOptions.type = val;
            if (type === 'cornersDot') qrOptions.cornersDotOptions.type = val;
            qrCode.update(qrOptions);
        });
    });

    // 4. الألوان
    document.getElementById('dot-color').addEventListener('input', (e) => {
        qrOptions.dotsOptions.color = e.target.value;
        qrOptions.cornersSquareOptions.color = e.target.value;
        qrOptions.cornersDotOptions.color = e.target.value;
        qrCode.update(qrOptions);
    });

    document.getElementById('bg-color').addEventListener('input', (e) => {
        qrOptions.backgroundOptions.color = e.target.value;
        qrCode.update(qrOptions);
    });

    // 5. زر التحميل بدقة 1080
    document.getElementById('download-btn').addEventListener('click', () => {
        const originalWidth = qrOptions.width;
        const originalHeight = qrOptions.height;
        qrCode.update({ width: 1080, height: 1080 });
        qrCode.download({ name: "my-qr-code-1080", extension: "png" }).then(() => {
            setTimeout(() => qrCode.update({ width: originalWidth, height: originalHeight }), 500);
        });
    });
});

function updateQR(data) {
    if (!data || data.trim() === "") return;
    qrOptions.data = data;
    qrCode.update(qrOptions);
}