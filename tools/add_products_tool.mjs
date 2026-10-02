/**
 * Tool thêm sản phẩm và biến thể chuẩn hóa cho ShopFake
 * 
 * Quy tắc chuẩn:
 * 1. Sử dụng thuộc tính có sẵn trên hệ thống (Size, Color, Color EX, Size EX)
 * 2. TUYỆT ĐỐI KHÔNG đưa size hoặc màu sắc vào description của sản phẩm
 *    (vì thuộc tính đã được lưu riêng ở bảng VariantAttributeValues).
 * 3. Mỗi sản phẩm tạo đúng 2 biến thể (5 sản phẩm = 10 biến thể)
 * 4. Tự động tải ảnh và liên kết ảnh cho từng biến thể thông qua /images/upload
 */

import fs from 'fs';
import path from 'path';

const BASE = 'https://shoppefake-545163055657.asia-southeast1.run.app/api/v1';

// ─── Danh mục thuộc tính có sẵn trên Server ──────────────────────────────
// Size (Attr ID: 1): M(1), L(2), XL(3), XXL(4), S(21)
// Color (Attr ID: 2): Trắng(5), Đen(6), Be(7), Đỏ(8), Tím(9), Xám(10), Xanh đậm(11), Xanh lục(12), Xanh ngọc(13), Xanh chuối(14), Cam(15), Xanh Dương(18), Vàng(19), Navy(22)
// Color EX (Attr ID: 3): Đỏ rượu(16), Rêu(17), Bạc(20)
// Size EX (Attr ID: 4): 9(23), 10(24)

// ─── Dữ liệu 5 sản phẩm (10 biến thể) ──────────────────────────────────
export const sampleProducts = [
  {
    name: "Áo Polo Nam Phối Cổ Dệt Bo Cotton CVC Cao Cấp",
    categoryId: 1, // Áo thun
    brand: "POLOMAN",
    description: "Áo polo nam được may từ chất liệu cotton CVC cao cấp dệt tổ ong dày dặn, có khả năng co giãn 4 chiều và thấm hút mồ hôi vượt trội. Thiết kế cổ áo dệt bo tinh tế, đường may đôi chắc chắn giữ form áo luôn phẳng phiu sau nhiều lần giặt. Phom regular-fit vừa vặn, tôn dáng người mặc, phù hợp cho môi trường công sở lịch lãm hoặc dạo phố năng động.",
    variants: [
      {
        variantName: "Trắng - M",
        price: 289000,
        stockQuantity: 50,
        sku: "POLO-TRANG-M",
        weightGrams: 220,
        valueIds: [1, 5], // Size M (1), Color Trắng (5)
        imageUrl: "https://res.cloudinary.com/shuppe/image/upload/v1790143350/products/kcraokdsczz23vwtxhpt.webp"
      },
      {
        variantName: "Đen - L",
        price: 289000,
        stockQuantity: 50,
        sku: "POLO-DEN-L",
        weightGrams: 220,
        valueIds: [2, 6], // Size L (2), Color Đen (6)
        imageUrl: "https://res.cloudinary.com/shuppe/image/upload/v1790143381/products/z3dsgahrskfrejnxlfax.webp"
      }
    ]
  },
  {
    name: "Áo Khoác Bomber Gió 2 Lớp Chống Thấm Nước Streetwear",
    categoryId: 4, // Áo khoác
    brand: "NOWSAIGON",
    description: "Áo khoác bomber thiết kế 2 lớp với lớp ngoài là vải dù polyeste trượt nước cao cấp, chống bám bụi và cản gió hiệu quả; lớp lót trong bằng lụa mềm mại tạo cảm giác thông thoáng khi vận động. Bo cổ tay và gấu áo dệt thun co giãn đàn hồi tốt. Trang bị khóa kéo kim loại YKK trơn tru cùng 2 túi hông có nắp bấm an toàn tiện lợi để điện thoại, ví tiền.",
    variants: [
      {
        variantName: "Be - L",
        price: 420000,
        stockQuantity: 40,
        sku: "BOMB-BE-L",
        weightGrams: 350,
        valueIds: [2, 7], // Size L (2), Color Be (7)
        imageUrl: "https://res.cloudinary.com/shuppe/image/upload/v1790065028/products/uq8wekv9ucmtzhkricgi.webp"
      },
      {
        variantName: "Đen - XL",
        price: 420000,
        stockQuantity: 40,
        sku: "BOMB-DEN-XL",
        weightGrams: 360,
        valueIds: [3, 6], // Size XL (3), Color Đen (6)
        imageUrl: "https://res.cloudinary.com/shuppe/image/upload/v1790056711/products/ecf44jcdynigrqvdiusa.webp"
      }
    ]
  },
  {
    name: "Quần Kaki Nam Dáng Suông Ống Đứng Regular Fit Co Giãn",
    categoryId: 6, // Quần kaki
    brand: "ROUTINE",
    description: "Quần dài kaki nam thiết kế ống đứng hiện đại mang lại diện mạo thanh lịch, chỉn chu. Chất liệu vải kaki cotton pha sợi spandex tạo độ co giãn nhẹ, bề mặt vải chải kỹ mềm mịn, không gây bí bách khi ngồi làm việc lâu. Cạp quần may lót chống bai gião, đường chỉ may kỹ càng ở đáy và gấu quần. Dễ dàng phối cùng áo sơ mi, polo hoặc áo thun cho phong cách smart-casual.",
    variants: [
      {
        variantName: "Xám - M",
        price: 380000,
        stockQuantity: 45,
        sku: "KAKI-XAM-M",
        weightGrams: 400,
        valueIds: [1, 10], // Size M (1), Color Xám (10)
        imageUrl: "https://res.cloudinary.com/shuppe/image/upload/v1790056540/products/jsmycrwadtqntr8lvc7a.webp"
      },
      {
        variantName: "Đen - L",
        price: 380000,
        stockQuantity: 55,
        sku: "KAKI-DEN-L",
        weightGrams: 420,
        valueIds: [2, 6], // Size L (2), Color Đen (6)
        imageUrl: "https://res.cloudinary.com/shuppe/image/upload/v1790059537/products/szxklgdy1qpoji7uzhtj.webp"
      }
    ]
  },
  {
    name: "Chân Váy Chữ A Công Sở Lưng Cao Xếp Ly Dáng Dài",
    categoryId: 8, // Váy / Đầm
    brand: "CHICLAND",
    description: "Chân váy dáng chữ A lưng cao tôn dáng thon gọn và che khuyết điểm hiệu quả. Chất liệu tuyết mưa cao cấp có độ rủ tự nhiên, đứng form, không nhăn nhàu và giữ nếp ly sắc nét suốt cả ngày. Thiết kế có khóa kéo giọt lệ chìm phía sau cùng lớp lót bảo hộ bên trong kín đáo, an tâm khi di chuyển. Lựa chọn hoàn hảo cho các quý cô công sở và dự tiệc nhẹ.",
    variants: [
      {
        variantName: "Trắng - S",
        price: 350000,
        stockQuantity: 35,
        sku: "VAY-TRANG-S",
        weightGrams: 280,
        valueIds: [21, 5], // Size S (21), Color Trắng (5)
        imageUrl: "https://res.cloudinary.com/shuppe/image/upload/v1790059564/products/jdziqgrarq0xqphict5w.webp"
      },
      {
        variantName: "Be - M",
        price: 350000,
        stockQuantity: 40,
        sku: "VAY-BE-M",
        weightGrams: 290,
        valueIds: [1, 7], // Size M (1), Color Be (7)
        imageUrl: "https://res.cloudinary.com/shuppe/image/upload/v1790055228/products/hlewclzkftm8kxvvio7y.webp"
      }
    ]
  },
  {
    name: "Mũ Lưỡi Trai Nón Két Thêu Nổi Chữ Basic Năng Động",
    categoryId: 12, // Mũ & Nón
    brand: "MLB CREW",
    description: "Mũ lưỡi trai phong cách cổ điển với form nón cứng cáp, đường cong vành mũ chuẩn giúp che chắn nắng tốt và tạo nét thon gọn cho khuôn mặt. Chất liệu 100% cotton canvas dệt sợi chéo thoáng mát, thấm hút mồ hôi. Khóa cài kim loại phía sau mạ bóng dễ dàng nới chỉnh độ rộng theo vòng đầu. Chi tiết thêu nổi 3D tinh xảo ở mặt trước tạo điểm nhấn cá tính.",
    variants: [
      {
        variantName: "Đen",
        price: 195000,
        stockQuantity: 60,
        sku: "CAP-DEN-01",
        weightGrams: 120,
        valueIds: [6], // Color Đen (6)
        imageUrl: "https://res.cloudinary.com/shuppe/image/upload/v1790064793/products/plveig1hzhlc2l5ehs8v.webp"
      },
      {
        variantName: "Navy",
        price: 195000,
        stockQuantity: 60,
        sku: "CAP-NAVY-02",
        weightGrams: 120,
        valueIds: [22], // Color Navy (22)
        imageUrl: "https://res.cloudinary.com/shuppe/image/upload/v1790143531/products/ydnwvp9hgbovflhlcp2u.webp"
      }
    ]
  }
];

// ─── Kiểm tra mô tả không chứa từ khóa size hoặc màu ───────────────────
export function validateNoAttributesInDescription(description) {
  const forbiddenPatterns = [
    /\bsize\b/i,
    /\bkích cỡ\b/i,
    /\bmàu sắc\b/i,
    /\bmàu đen\b/i,
    /\bmàu trắng\b/i,
    /\bmàu be\b/i,
    /\bmàu đỏ\b/i,
    /\bmàu tím\b/i,
    /\bmàu xám\b/i,
    /\bmàu vàng\b/i,
    /\bmàu cam\b/i,
    /\bmàu navy\b/i,
    /\bcó \d+ màu\b/i,
    /\bsize [smlx]+/i
  ];

  const matched = [];
  for (const p of forbiddenPatterns) {
    if (p.test(description)) {
      matched.push(p.toString());
    }
  }
  return {
    valid: matched.length === 0,
    matched
  };
}

// ─── Đăng nhập Admin lấy JWT ──────────────────────────────────────────
async function getAdminToken() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gucci@admin.vip', password: '123123' })
  });
  const data = await res.json();
  const token = data.data?.token || data.token;
  if (!token) throw new Error('Không thể đăng nhập tài khoản Admin');
  return token;
}

// ─── Hàm thực thi thêm sản phẩm và biến thể ─────────────────────────────
export async function addProductsAndVariants(productsToAdd = sampleProducts) {
  console.log('🚀 Đang bắt đầu tool thêm sản phẩm & biến thể chuẩn hóa...');
  const token = await getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const results = [];

  for (let i = 0; i < productsToAdd.length; i++) {
    const prod = productsToAdd[i];
    console.log(`\n────────────────────────────────────────────────────────────`);
    console.log(`📦 [${i + 1}/${productsToAdd.length}] Sản phẩm: "${prod.name}" (Danh mục ID: ${prod.categoryId})`);

    // Kiểm tra tính hợp lệ của description
    const descCheck = validateNoAttributesInDescription(prod.description);
    if (!descCheck.valid) {
      console.warn(`⚠️ Cảnh báo: Description chứa từ khóa thuộc tính (${descCheck.matched.join(', ')}). Vui lòng lược bỏ!`);
    } else {
      console.log(`✅ Description chuẩn: Không chứa size hoặc màu sắc.`);
    }

    // 1. Tạo sản phẩm
    const productPayload = {
      categoryId: prod.categoryId,
      name: prod.name,
      brand: prod.brand,
      description: prod.description,
      slug: prod.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    };

    const prodRes = await fetch(`${BASE}/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(productPayload)
    });

    const prodData = await prodRes.json();
    const createdProduct = prodData.data || prodData;
    const productId = createdProduct.id;

    if (!productId) {
      console.error(`❌ Tạo sản phẩm thất bại:`, prodData);
      continue;
    }
    console.log(`🎉 Tạo sản phẩm thành công! Product ID = ${productId}`);

    const addedVariants = [];

    // 2. Tạo 2 biến thể cho sản phẩm
    for (const v of prod.variants) {
      // Build query string cho valueIds
      const params = new URLSearchParams();
      (v.valueIds || []).forEach(valId => params.append('valueIds', valId.toString()));

      const variantPayload = {
        productId: productId,
        variantName: v.variantName,
        price: v.price,
        stockQuantity: v.stockQuantity,
        sku: v.sku,
        weightGrams: v.weightGrams
      };

      const varRes = await fetch(`${BASE}/variants?${params.toString()}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(variantPayload)
      });

      const varData = await varRes.json();
      const variantId = varData.data?.id || varData.id || varData;

      if (!variantId) {
        console.error(`  ❌ Lỗi tạo biến thể "${v.variantName}":`, varData);
        continue;
      }
      console.log(`  ✨ Tạo biến thể "${v.variantName}" thành công! Variant ID = ${variantId} | SKU = ${v.sku} | ValueIds = [${v.valueIds.join(', ')}]`);

      // 3. Tải và upload ảnh cho biến thể (nếu có imageUrl)
      if (v.imageUrl) {
        try {
          const imgFetch = await fetch(v.imageUrl);
          const arrayBuf = await imgFetch.arrayBuffer();
          const blob = new Blob([arrayBuf], { type: 'image/webp' });

          const formData = new FormData();
          formData.append('Image', blob, `${v.sku}.webp`);
          formData.append('ProductId', productId.toString());
          formData.append('VariantId', variantId.toString());

          const imgRes = await fetch(`${BASE}/images/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });

          if (imgRes.ok) {
            console.log(`    🖼️ Đã upload và gán ảnh biến thể ${v.sku} thành công!`);
          } else {
            const imgErr = await imgRes.text();
            console.warn(`    ⚠️ Không thể upload ảnh cho biến thể ${v.sku}:`, imgErr);
          }
        } catch (e) {
          console.warn(`    ⚠️ Lỗi khi tải ảnh từ URL:`, e.message);
        }
      }

      addedVariants.push({
        variantId,
        variantName: v.variantName,
        sku: v.sku,
        price: v.price,
        valueIds: v.valueIds
      });
    }

    results.push({
      productId,
      productName: prod.name,
      variantsCount: addedVariants.length,
      variants: addedVariants
    });
  }

  console.log(`\n============================================================`);
  console.log(`🏁 HOÀN TẤT: Đã thêm ${results.length} sản phẩm với tổng cộng ${results.reduce((s, p) => s + p.variantsCount, 0)} biến thể.`);
  return results;
}

// Thực thi nếu chạy trực tiếp
if (process.argv[1]?.endsWith('add_products_tool.mjs')) {
  addProductsAndVariants().catch(console.error);
}
