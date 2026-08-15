/**
 * Script tạo 52 biến thể (2 biến thể / sản phẩm) cho 26 sản phẩm trên ShopFake
 * 
 * Dữ liệu thuộc tính (Attribute Values):
 * ─── Attr 1: Màu sắc ───
 *   1=Be(Beige), 2=Cam, 3=Đen, 4=Đỏ, 5=Hồng, 6=Nâu, 7=Trắng, 8=Vàng, 9=Xám, 10=Xanh dương
 * ─── Attr 2: Màu sắc Phụ kiện ───
 *   11=Bạc(Silver), 12=Vàng(Gold)
 * ─── Attr 3: Size quần áo ───
 *   13=XS, 14=S, 15=M, 16=L, 17=XL, 18=Freesize
 * ─── Attr 4: Size giày ───
 *   31=41, 32=43, 33=44
 * ─── Attr 5: Size phụ kiện ───
 *   34=PK XS, 35=PK S, 36=PK M, 37=PK L, 38=PJ XL
 * ─── Attr 6: Chất liệu ───
 *   39=Cotton 100%, 40=Da Bò Thật
 * ─── Attr 7: Size Quần Áo số ───
 *   19=28, 20=29, 21=30, 22=31, 23=32, 24=34, 25=36, 26=37, 27=38, 28=39, 29=40, 30=42
 */

const BASE = "https://shoppe-fake-427087851138.asia-southeast1.run.app/api/v1";

// ─── 26 sản phẩm × 2 biến thể ─────────────────────────────────────────────
// Mỗi entry: { productId, variantName, price, stockQuantity, sku, weightGrams, valueIds }
const variants = [
  // ─── #1: Dây nịt nam da bò khóa hợp kim (Phụ kiện) ───
  { productId: 1, variantName: "Dây nịt da bò - Đen - Da Bò Thật", price: 450000, stockQuantity: 35, sku: "BELT-01-DEN", weightGrams: 250, valueIds: [3, 40] },         // Đen + Da Bò Thật
  { productId: 1, variantName: "Dây nịt da bò - Nâu - Da Bò Thật", price: 450000, stockQuantity: 28, sku: "BELT-01-NAU", weightGrams: 250, valueIds: [6, 40] },         // Nâu + Da Bò Thật

  // ─── #2: Áo Hoodie tai gấu dễ thương (Áo hoodie) ───
  { productId: 2, variantName: "Hoodie tai gấu - Hồng - Size M", price: 389000, stockQuantity: 42, sku: "HOOD-02-HONG-M", weightGrams: 450, valueIds: [5, 15] },       // Hồng + M
  { productId: 2, variantName: "Hoodie tai gấu - Trắng - Size L", price: 389000, stockQuantity: 38, sku: "HOOD-02-TRANG-L", weightGrams: 460, valueIds: [7, 16] },      // Trắng + L

  // ─── #3: Áo thun Oversize Cotton Basic (Unisex) ───
  { productId: 3, variantName: "Áo thun Oversize - Đen - Size L - Cotton", price: 259000, stockQuantity: 120, sku: "TSHIRT-03-DEN-L", weightGrams: 220, valueIds: [3, 16, 39] },    // Đen + L + Cotton
  { productId: 3, variantName: "Áo thun Oversize - Trắng - Size XL - Cotton", price: 259000, stockQuantity: 95, sku: "TSHIRT-03-TRANG-XL", weightGrams: 230, valueIds: [7, 17, 39] }, // Trắng + XL + Cotton

  // ─── #4: Quần Jean ống rộng vintage (Quần Jean) ───
  { productId: 4, variantName: "Quần Jean vintage - Xanh dương - Size 30", price: 549000, stockQuantity: 55, sku: "JEAN-04-XANH-30", weightGrams: 650, valueIds: [10, 21] },  // Xanh dương + 30
  { productId: 4, variantName: "Quần Jean vintage - Đen - Size 32", price: 549000, stockQuantity: 48, sku: "JEAN-04-DEN-32", weightGrams: 660, valueIds: [3, 23] },            // Đen + 32

  // ─── #5: Hoodie in hình graphic (Áo hoodie) ───
  { productId: 5, variantName: "Hoodie graphic - Đen - Size L", price: 520000, stockQuantity: 60, sku: "HOOD-05-DEN-L", weightGrams: 500, valueIds: [3, 16] },            // Đen + L
  { productId: 5, variantName: "Hoodie graphic - Xám - Size XL", price: 520000, stockQuantity: 45, sku: "HOOD-05-XAM-XL", weightGrams: 520, valueIds: [9, 17] },          // Xám + XL

  // ─── #6: Áo dù khoác ngoài trơn màu (Áo dù) ───
  { productId: 6, variantName: "Áo dù trơn - Đen - Size M", price: 320000, stockQuantity: 75, sku: "AODU-06-DEN-M", weightGrams: 280, valueIds: [3, 15] },                // Đen + M
  { productId: 6, variantName: "Áo dù trơn - Xanh dương - Size L", price: 320000, stockQuantity: 62, sku: "AODU-06-XANH-L", weightGrams: 290, valueIds: [10, 16] },       // Xanh dương + L

  // ─── #7: Áo croptop dài tay ôm body (Áo nữ) ───
  { productId: 7, variantName: "Croptop dài tay - Đen - Size S", price: 189000, stockQuantity: 88, sku: "CROP-07-DEN-S", weightGrams: 150, valueIds: [3, 14] },            // Đen + S
  { productId: 7, variantName: "Croptop dài tay - Trắng - Size M", price: 189000, stockQuantity: 72, sku: "CROP-07-TRANG-M", weightGrams: 150, valueIds: [7, 15] },        // Trắng + M

  // ─── #8: Áo khoác blazer kẻ sọc thời trang (Áo khoác) ───
  { productId: 8, variantName: "Blazer kẻ sọc - Đen - Size M", price: 750000, stockQuantity: 30, sku: "BLZR-08-DEN-M", weightGrams: 600, valueIds: [3, 15] },              // Đen + M
  { productId: 8, variantName: "Blazer kẻ sọc - Xám - Size L", price: 750000, stockQuantity: 25, sku: "BLZR-08-XAM-L", weightGrams: 620, valueIds: [9, 16] },              // Xám + L

  // ─── #9: Quần ống rộng suông thun gân (Quần dài) ───
  { productId: 9, variantName: "Quần suông thun gân - Đen - Size 30", price: 299000, stockQuantity: 65, sku: "PANT-09-DEN-30", weightGrams: 350, valueIds: [3, 21] },      // Đen + 30
  { productId: 9, variantName: "Quần suông thun gân - Be - Size 32", price: 299000, stockQuantity: 52, sku: "PANT-09-BE-32", weightGrams: 360, valueIds: [1, 23] },         // Be + 32

  // ─── #10: Áo sơ mi flannel kẻ sọc (Áo Nam) ───
  { productId: 10, variantName: "Flannel kẻ sọc - Đỏ - Size L - Cotton", price: 420000, stockQuantity: 40, sku: "FLNL-10-DO-L", weightGrams: 320, valueIds: [4, 16, 39] },   // Đỏ + L + Cotton
  { productId: 10, variantName: "Flannel kẻ sọc - Xanh dương - Size XL - Cotton", price: 420000, stockQuantity: 35, sku: "FLNL-10-XANH-XL", weightGrams: 330, valueIds: [10, 17, 39] }, // Xanh dương + XL + Cotton

  // ─── #11: Chân váy xếp ly ngắn tennis (Váy / đầm) ───
  { productId: 11, variantName: "Váy tennis xếp ly - Trắng - Size S", price: 235000, stockQuantity: 50, sku: "SKRT-11-TRANG-S", weightGrams: 180, valueIds: [7, 14] },     // Trắng + S
  { productId: 11, variantName: "Váy tennis xếp ly - Đen - Size M", price: 235000, stockQuantity: 45, sku: "SKRT-11-DEN-M", weightGrams: 185, valueIds: [3, 15] },          // Đen + M

  // ─── #12: Áo dù thể thao 2 lớp (Áo dù) ───
  { productId: 12, variantName: "Áo dù 2 lớp - Đen - Size L", price: 385000, stockQuantity: 55, sku: "AODU-12-DEN-L", weightGrams: 350, valueIds: [3, 16] },               // Đen + L
  { productId: 12, variantName: "Áo dù 2 lớp - Xám - Size XL", price: 385000, stockQuantity: 42, sku: "AODU-12-XAM-XL", weightGrams: 360, valueIds: [9, 17] },             // Xám + XL

  // ─── #13: Áo khoác phao béo giữ ấm (Áo khoác) ───
  { productId: 13, variantName: "Áo phao béo - Đen - Size L", price: 890000, stockQuantity: 30, sku: "PUFF-13-DEN-L", weightGrams: 700, valueIds: [3, 16] },                // Đen + L
  { productId: 13, variantName: "Áo phao béo - Be - Size XL", price: 890000, stockQuantity: 22, sku: "PUFF-13-BE-XL", weightGrams: 720, valueIds: [1, 17] },                 // Be + XL

  // ─── #14: Quần tây nữ lưng cao công sở (Quần dài) ───
  { productId: 14, variantName: "Quần tây nữ - Đen - Size 28", price: 359000, stockQuantity: 48, sku: "TRSR-14-DEN-28", weightGrams: 380, valueIds: [3, 19] },              // Đen + 28
  { productId: 14, variantName: "Quần tây nữ - Xám - Size 30", price: 359000, stockQuantity: 40, sku: "TRSR-14-XAM-30", weightGrams: 390, valueIds: [9, 21] },              // Xám + 30

  // ─── #15: Áo len cardigan dáng dài (Áo len) ───
  { productId: 15, variantName: "Cardigan dáng dài - Be - Size M", price: 499000, stockQuantity: 35, sku: "CRDG-15-BE-M", weightGrams: 400, valueIds: [1, 15] },             // Be + M
  { productId: 15, variantName: "Cardigan dáng dài - Nâu - Size L", price: 499000, stockQuantity: 30, sku: "CRDG-15-NAU-L", weightGrams: 420, valueIds: [6, 16] },           // Nâu + L

  // ─── #16: Áo hoodie khóa zip (Áo hoodie) ───
  { productId: 16, variantName: "Hoodie zip - Đen - Size M", price: 459000, stockQuantity: 66, sku: "HZIP-16-DEN-M", weightGrams: 480, valueIds: [3, 15] },                  // Đen + M
  { productId: 16, variantName: "Hoodie zip - Xám - Size L", price: 459000, stockQuantity: 54, sku: "HZIP-16-XAM-L", weightGrams: 490, valueIds: [9, 16] },                  // Xám + L

  // ─── #17: Áo dù phản quang đi đêm (Áo dù) ───
  { productId: 17, variantName: "Áo dù phản quang - Đen - Size M", price: 410000, stockQuantity: 45, sku: "AOPQ-17-DEN-M", weightGrams: 310, valueIds: [3, 15] },            // Đen + M
  { productId: 17, variantName: "Áo dù phản quang - Xám - Size L", price: 410000, stockQuantity: 38, sku: "AOPQ-17-XAM-L", weightGrams: 320, valueIds: [9, 16] },            // Xám + L

  // ─── #18: Áo croptop nữ tập gym yoga (Áo nữ) ───
  { productId: 18, variantName: "Croptop gym - Đen - Size S", price: 199000, stockQuantity: 90, sku: "GYMCR-18-DEN-S", weightGrams: 120, valueIds: [3, 14] },                 // Đen + S
  { productId: 18, variantName: "Croptop gym - Hồng - Size M", price: 199000, stockQuantity: 78, sku: "GYMCR-18-HONG-M", weightGrams: 125, valueIds: [5, 15] },               // Hồng + M

  // ─── #19: Áo jean cá tính (Áo khoác) ───
  { productId: 19, variantName: "Áo jean - Xanh dương - Size M", price: 580000, stockQuantity: 40, sku: "JJKT-19-XANH-M", weightGrams: 550, valueIds: [10, 15] },            // Xanh dương + M
  { productId: 19, variantName: "Áo jean - Đen - Size L", price: 580000, stockQuantity: 35, sku: "JJKT-19-DEN-L", weightGrams: 560, valueIds: [3, 16] },                      // Đen + L

  // ─── #20: Quần Jogger thun thể thao nam (Quần Jogger) ───
  { productId: 20, variantName: "Jogger thể thao - Đen - Size 32", price: 289000, stockQuantity: 70, sku: "JOGG-20-DEN-32", weightGrams: 330, valueIds: [3, 23] },            // Đen + 32
  { productId: 20, variantName: "Jogger thể thao - Xám - Size 30", price: 289000, stockQuantity: 58, sku: "JOGG-20-XAM-30", weightGrams: 320, valueIds: [9, 21] },            // Xám + 30

  // ─── #21: Áo sơ mi nữ công sở cổ nơ (Áo nữ) ───
  { productId: 21, variantName: "Sơ mi cổ nơ - Trắng - Size S", price: 345000, stockQuantity: 42, sku: "SOMI-21-TRANG-S", weightGrams: 200, valueIds: [7, 14] },             // Trắng + S
  { productId: 21, variantName: "Sơ mi cổ nơ - Hồng - Size M", price: 345000, stockQuantity: 38, sku: "SOMI-21-HONG-M", weightGrams: 210, valueIds: [5, 15] },               // Hồng + M

  // ─── #22: Áo hoodie nỉ lót bông dày (Áo hoodie) ───
  { productId: 22, variantName: "Hoodie nỉ lót bông - Đen - Size L", price: 510000, stockQuantity: 50, sku: "HNIE-22-DEN-L", weightGrams: 550, valueIds: [3, 16] },          // Đen + L
  { productId: 22, variantName: "Hoodie nỉ lót bông - Xám - Size XL", price: 510000, stockQuantity: 40, sku: "HNIE-22-XAM-XL", weightGrams: 570, valueIds: [9, 17] },        // Xám + XL

  // ─── #23: Áo dù chống nước trượt gió (Áo dù) ───
  { productId: 23, variantName: "Áo dù chống nước - Đen - Size L", price: 450000, stockQuantity: 48, sku: "WIND-23-DEN-L", weightGrams: 300, valueIds: [3, 16] },             // Đen + L
  { productId: 23, variantName: "Áo dù chống nước - Xanh dương - Size XL", price: 450000, stockQuantity: 36, sku: "WIND-23-XANH-XL", weightGrams: 310, valueIds: [10, 17] }, // Xanh dương + XL

  // ─── #24: Áo khoác da dài nữ mùa đông (Áo khoác) ───
  { productId: 24, variantName: "Áo khoác da nữ - Đen - Size M - Da Bò Thật", price: 1290000, stockQuantity: 18, sku: "LTHR-24-DEN-M", weightGrams: 900, valueIds: [3, 15, 40] },   // Đen + M + Da Bò Thật
  { productId: 24, variantName: "Áo khoác da nữ - Nâu - Size L - Da Bò Thật", price: 1290000, stockQuantity: 15, sku: "LTHR-24-NAU-L", weightGrams: 920, valueIds: [6, 16, 40] },   // Nâu + L + Da Bò Thật

  // ─── #25: Áo thun polo nam thể thao (Áo Nam) ───
  { productId: 25, variantName: "Polo thể thao - Trắng - Size M - Cotton", price: 299000, stockQuantity: 80, sku: "POLO-25-TRANG-M", weightGrams: 230, valueIds: [7, 15, 39] },   // Trắng + M + Cotton
  { productId: 25, variantName: "Polo thể thao - Đen - Size L - Cotton", price: 299000, stockQuantity: 72, sku: "POLO-25-DEN-L", weightGrams: 240, valueIds: [3, 16, 39] },       // Đen + L + Cotton

  // ─── #26: Găng tay giữ ấm (Phụ kiện) ───
  { productId: 26, variantName: "Găng tay giữ ấm - Đen - PK M", price: 159000, stockQuantity: 55, sku: "GLOV-26-DEN-PKM", weightGrams: 80, valueIds: [3, 36] },              // Đen + PK M
  { productId: 26, variantName: "Găng tay giữ ấm - Xám - PK L", price: 159000, stockQuantity: 48, sku: "GLOV-26-XAM-PKL", weightGrams: 85, valueIds: [9, 37] },              // Xám + PK L
];

// ─── Runner ─────────────────────────────────────────────────────────────────

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "gucci@admin.vip", password: "123123" }),
  });
  const data = await res.json();
  return data.data?.token;
}

async function createVariant(v, token) {
  const params = new URLSearchParams();
  v.valueIds.forEach(id => params.append("valueIds", id.toString()));

  const body = {
    productId: v.productId,
    variantName: v.variantName,
    price: v.price,
    stockQuantity: v.stockQuantity,
    sku: v.sku,
    weightGrams: v.weightGrams,
  };

  const url = `${BASE}/variants?${params.toString()}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let result;
  try { result = JSON.parse(text); } catch { result = text; }

  return { status: res.status, sku: v.sku, result };
}

async function main() {
  console.log("🔑 Đang đăng nhập Admin...");
  const token = await login();
  if (!token) {
    console.error("❌ Không thể đăng nhập! Kiểm tra lại tài khoản.");
    process.exit(1);
  }
  console.log("✅ Đăng nhập thành công!\n");

  console.log(`🚀 Bắt đầu tạo ${variants.length} biến thể...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    try {
      const r = await createVariant(v, token);
      if (r.status >= 200 && r.status < 300) {
        success++;
        console.log(`✅ [${i + 1}/${variants.length}] ${v.sku} → OK`);
      } else {
        failed++;
        console.log(`❌ [${i + 1}/${variants.length}] ${v.sku} → ${r.status}: ${JSON.stringify(r.result)}`);
      }
    } catch (err) {
      failed++;
      console.log(`❌ [${i + 1}/${variants.length}] ${v.sku} → Error: ${err.message}`);
    }
    // Delay 200ms giữa mỗi request để không overwhelm server
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n📊 Kết quả: ${success} thành công, ${failed} thất bại (tổng: ${variants.length})`);
}

main();

