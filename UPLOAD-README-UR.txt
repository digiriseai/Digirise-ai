DigiRise — صرف نئی تبدیلیاں اپلوڈ کرنے کی فائلیں

اس پیکج میں صرف ضروری اپڈیٹ فائلیں ہیں۔ Backup فولڈر یا باقی ویب سائٹ دوبارہ اپلوڈ کرنے کی ضرورت نہیں۔

GitHub میں اپنے موجودہ project کے اندر یہ فائلیں اسی path پر Replace/Add کریں:
1) index.html  → root میں
2) worker.js   → root میں
3) wrangler.jsonc → root میں (صرف اگر آپ کی موجودہ config میں assets directory ./public اور private/general-store.html کی Text rule موجود نہ ہو)
4) public/index.html → public فولڈر میں
5) private/general-store.html → private فولڈر میں (اگر پہلے سے یہی نئی package والی فائل موجود ہے تو دوبارہ اپلوڈ ضروری نہیں)

اہم: فولڈر کے نام lowercase رکھیں: public اور private۔ پرانے Public/Private فولڈرز کو فوراً delete نہ کریں؛ پہلے نئی deployment کامیاب ہونے کی تصدیق کریں۔

نئی تبدیلیاں:
• Top-left menu میں صرف چار فیچرز۔
• Desktop پر بائیں طرف تقریباً ایک تہائی حصہ: چاروں فیچرز کی معلومات۔
• فیچر پر mouse رکھنے سے معلومات کا مربع preview؛ موبائل پر menu کھول کر فیچر منتخب کریں۔
• درمیان میں articles، video links اور image links کی feed۔
• Newest first / Previous first اور feature filter؛ ایک وقت میں زیادہ سے زیادہ 10 پوسٹس۔
• غیر ضروری Computer/Foundations course cards ہٹا دیے گئے۔
• جنرل سٹور کا لنک /owner-login?next=/owner-store پر جاتا ہے۔

General Store کی سیکیورٹی:
Cloudflare Worker Secrets میں STORE_PASSWORD اور کم از کم 32 حروف کا SESSION_SECRET سیٹ ہونا لازمی ہے۔ ان secrets کے بغیر login page وضاحتی پیغام دکھائے گا، لیکن private store نہیں کھلے گا۔ سیکیورٹی ختم کرکے public store کھولنا درست نہیں۔

لائیو سائٹ خودکار طور پر اپڈیٹ نہیں ہوئی؛ یہ فائلیں GitHub میں upload/commit کرنے اور Cloudflare deployment مکمل ہونے کے بعد ہی تبدیلیاں لائیو ہوں گی۔
