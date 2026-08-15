/**
 * Script tạo thêm 10 sản phẩm mới (20 biến thể) cho ShopFake
 * 
 * ═══ DANH MỤC MỚI (sẽ tạo tự động) ═══
 * - Mũ / Nón
 * - Giày / Dép
 * - Túi xách
 * 
 * ═══ THUỘC TÍNH ĐÃ CÓ (tái sử dụng) ═══
 * ─── Attr 1: Màu sắc ───
 *   1=Be, 2=Cam, 3=Đen, 4=Đỏ, 5=Hồng, 6=Nâu, 7=Trắng, 8=Vàng, 9=Xám, 10=Xanh dương
 * ─── Attr 3: Size quần áo ───
 *   13=XS, 14=S, 15=M, 16=L, 17=XL, 18=Freesize
 * ─── Attr 4: Size giày ───
 *   31=41, 32=43, 33=44
 * ─── Attr 5: Size phụ kiện ───
 *   34=PK XS, 35=PK S, 36=PK M, 37=PK L, 38=PK XL
 * ─── Attr 6: Chất liệu ───
 *   39=Cotton 100%, 40=Da Bò Thật
 * 
 * ═══ THUỘC TÍNH MỚI (sẽ tạo tự động) ═══
 * ─── Attr mới: Size giày nữ ───  (sẽ tạo value: 36, 37, 38, 39)
 * ─── Attr mới: Kiểu dáng ───     (sẽ tạo value: Snapback, Bucket, Tote, Crossbody)
 */

const BASE = "https://shoppe-fake-427087851138.asia-southeast1.run.app/api/v1";

// ─── Helper Functions ───────────────────────────────────────────────────────

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "gucci@admin.vip", password: "123123" }),
  });
  const data = await res.json();
  return data.data?.token;
}

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

async function apiPost(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let result;
  try { result = JSON.parse(text); } catch { result = text; }
  return { status: res.status, result };
}

async function apiGet(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: authHeaders(token),
  });
  return res.json();
}

// Delay giữa các request
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔑 Đang đăng nhập Admin...");
  const token = await login();
  if (!token) {
    console.error("❌ Không thể đăng nhập!");
    process.exit(1);
  }
  console.log("✅ Đăng nhập thành công!\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // BƯỚC 1: Tạo danh mục mới
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("📂 Bước 1: Tạo danh mục mới...\n");

  const newCategories = [
    { name: "Mũ / Nón", description: "Mũ lưỡi trai, nón bucket, mũ beret và các loại mũ thời trang" },
    { name: "Giày / Dép", description: "Giày sneaker, giày cao gót, dép sandal và các loại giày dép thời trang" },
    { name: "Túi xách", description: "Túi tote, túi đeo chéo, balo thời trang và các loại túi xách" },
  ];

  const categoryIds = {};
  for (const cat of newCategories) {
    const r = await apiPost("/categories", cat, token);
    if (r.status >= 200 && r.status < 300) {
      // Lấy ID từ response
      const id = r.result?.data?.id || r.result?.id;
      categoryIds[cat.name] = id;
      console.log(`  ✅ Danh mục "${cat.name}" → ID: ${id}`);
    } else {
      console.log(`  ⚠️ Danh mục "${cat.name}" → ${r.status}: ${JSON.stringify(r.result)}`);
      // Nếu đã tồn tại, thử tìm ID từ danh sách hiện có
    }
    await delay(200);
  }

  // Lấy lại toàn bộ danh mục để có ID chính xác
  console.log("\n📋 Lấy danh sách danh mục hiện có...");
  const catRes = await apiGet("/categories?pageIndex=1&pageSize=100", token);
  const allCategories = catRes?.data?.items || catRes?.items || [];
  
  for (const cat of allCategories) {
    console.log(`  📂 ID=${cat.id} → "${cat.name}"`);
    // Map lại ID
    if (cat.name.includes("Mũ") || cat.name.includes("Nón")) categoryIds["Mũ / Nón"] = cat.id;
    if (cat.name.includes("Giày") || cat.name.includes("Dép")) categoryIds["Giày / Dép"] = cat.id;
    if (cat.name.includes("Túi")) categoryIds["Túi xách"] = cat.id;
  }

  console.log("\n📌 Category IDs:", categoryIds);

  // ═══════════════════════════════════════════════════════════════════════════
  // BƯỚC 2: Tạo thuộc tính mới (Attribute + Values)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n🏷️ Bước 2: Tạo thuộc tính mới...\n");

  // Tạo Attribute "Size giày nữ"
  const attrGiayNu = await apiPost("/attributes", { name: "Size giày nữ", slug: "size-giay-nu" }, token);
  const attrGiayNuId = attrGiayNu.result?.data?.id || attrGiayNu.result?.id;
  console.log(`  ✅ Attribute "Size giày nữ" → ID: ${attrGiayNuId}`);
  await delay(200);

  // Tạo Attribute "Kiểu dáng"
  const attrKieuDang = await apiPost("/attributes", { name: "Kiểu dáng", slug: "kieu-dang" }, token);
  const attrKieuDangId = attrKieuDang.result?.data?.id || attrKieuDang.result?.id;
  console.log(`  ✅ Attribute "Kiểu dáng" → ID: ${attrKieuDangId}`);
  await delay(200);

  // Tạo Values cho "Size giày nữ": 36, 37, 38, 39
  const giayNuValues = {};
  for (const size of ["36", "37", "38", "39"]) {
    if (!attrGiayNuId) { console.log(`  ⚠️ Bỏ qua value "${size}" vì không có attrId`); continue; }
    const r = await apiPost("/attribute-values", { attributeId: attrGiayNuId, valueText: size, slug: `giay-nu-${size}` }, token);
    const id = r.result?.data?.id || r.result?.id;
    giayNuValues[size] = id;
    console.log(`  ✅ Value "Size giày nữ: ${size}" → ID: ${id}`);
    await delay(200);
  }

  // Tạo Values cho "Kiểu dáng": Snapback, Bucket, Tote, Crossbody
  const kieuDangValues = {};
  for (const kd of ["Snapback", "Bucket", "Tote", "Crossbody"]) {
    if (!attrKieuDangId) { console.log(`  ⚠️ Bỏ qua value "${kd}" vì không có attrId`); continue; }
    const r = await apiPost("/attribute-values", { attributeId: attrKieuDangId, valueText: kd, slug: kd.toLowerCase() }, token);
    const id = r.result?.data?.id || r.result?.id;
    kieuDangValues[kd] = id;
    console.log(`  ✅ Value "Kiểu dáng: ${kd}" → ID: ${id}`);
    await delay(200);
  }

  // Lấy lại toàn bộ attribute values để có ID chính xác
  console.log("\n📋 Lấy lại danh sách attribute values...");
  const valRes = await apiGet("/attribute-values?pageIndex=1&pageSize=200", token);
  const allValues = valRes?.data?.items || valRes?.items || [];
  
  // Re-map IDs từ tên
  for (const v of allValues) {
    const text = v.valueText;
    if (v.attribute?.name === "Size giày nữ" || v.attributeId === attrGiayNuId) {
      if (["36", "37", "38", "39"].includes(text)) giayNuValues[text] = v.id;
    }
    if (v.attribute?.name === "Kiểu dáng" || v.attributeId === attrKieuDangId) {
      if (["Snapback", "Bucket", "Tote", "Crossbody"].includes(text)) kieuDangValues[text] = v.id;
    }
  }

  console.log("📌 giayNuValues:", giayNuValues);
  console.log("📌 kieuDangValues:", kieuDangValues);

  // ═══════════════════════════════════════════════════════════════════════════
  // BƯỚC 3: Tạo 10 sản phẩm mới
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n🛍️ Bước 3: Tạo 10 sản phẩm mới...\n");

  // Tìm categoryId cho các danh mục đã tồn tại
  const existingCatMap = {};
  for (const cat of allCategories) {
    existingCatMap[cat.name] = cat.id;
  }

  const newProducts = [
    // ── 3 sản phẩm Mũ / Nón ──
    {
      categoryId: categoryIds["Mũ / Nón"],
      name: "Mũ lưỡi trai snapback unisex",
      brand: "Urban Cap",
      description: "Mũ lưỡi trai phong cách đường phố, chất liệu vải kaki cao cấp, khóa điều chỉnh phía sau, phù hợp mọi size đầu.",
      slug: "mu-luoi-trai-snapback-unisex",
    },
    {
      categoryId: categoryIds["Mũ / Nón"],
      name: "Mũ bucket vải canvas thời trang",
      brand: "SunShade",
      description: "Mũ bucket form rộng che nắng tốt, chất liệu canvas dày dặn, thiết kế đơn giản dễ phối đồ.",
      slug: "mu-bucket-vai-canvas",
    },
    {
      categoryId: categoryIds["Mũ / Nón"],
      name: "Mũ beret len Pháp vintage",
      brand: "Parisian",
      description: "Mũ beret phong cách Pháp cổ điển, chất liệu len mềm giữ ấm, phù hợp đi chơi đi cafe đi du lịch.",
      slug: "mu-beret-len-phap-vintage",
    },

    // ── 3 sản phẩm Giày / Dép ──
    {
      categoryId: categoryIds["Giày / Dép"],
      name: "Giày sneaker nam thể thao basic",
      brand: "StepFlex",
      description: "Giày sneaker đế êm nhẹ, thiết kế basic dễ phối, phù hợp đi học đi làm đi chơi, đế cao su chống trượt.",
      slug: "giay-sneaker-nam-the-thao-basic",
    },
    {
      categoryId: categoryIds["Giày / Dép"],
      name: "Giày cao gót nữ mũi nhọn công sở",
      brand: "Elegant",
      description: "Giày cao gót 7cm mũi nhọn thanh lịch, chất liệu da PU cao cấp, đệm êm bên trong, phù hợp đi làm sự kiện.",
      slug: "giay-cao-got-nu-mui-nhon",
    },
    {
      categoryId: categoryIds["Giày / Dép"],
      name: "Dép sandal quai chéo nam nữ",
      brand: "CloudWalk",
      description: "Dép sandal quai chéo đế đúc siêu nhẹ, chống nước, phù hợp đi biển đi dạo, đế êm chân không đau.",
      slug: "dep-sandal-quai-cheo-nam-nu",
    },

    // ── 2 sản phẩm Túi xách ──
    {
      categoryId: categoryIds["Túi xách"],
      name: "Túi tote canvas đi học đi làm",
      brand: "CarryAll",
      description: "Túi tote canvas dày dặn chứa được laptop 14 inch, thiết kế tối giản, quai vai chắc chắn, có ngăn phụ bên trong.",
      slug: "tui-tote-canvas-di-hoc-di-lam",
    },
    {
      categoryId: categoryIds["Túi xách"],
      name: "Túi đeo chéo mini da PU nữ",
      brand: "MiniChic",
      description: "Túi đeo chéo mini form nhỏ gọn, chất liệu da PU mềm mại, dây đeo điều chỉnh được, đủ chỗ cho điện thoại ví chìa khóa.",
      slug: "tui-deo-cheo-mini-da-pu-nu",
    },

    // ── 1 sản phẩm Quần short (dùng danh mục "Quần dài" hoặc tạo mới nếu cần) ──
    {
      categoryId: existingCatMap["Quần Jogger"] || existingCatMap["Quần dài"] || 5,
      name: "Quần short thể thao nam nhanh khô",
      brand: "DryFit",
      description: "Quần short thể thao chất liệu polyester nhanh khô, có túi kéo khóa, co giãn thoải mái khi vận động.",
      slug: "quan-short-the-thao-nam-nhanh-kho",
    },

    // ── 1 sản phẩm Áo thun graphic nữ ──
    {
      categoryId: existingCatMap["Áo nữ"] || 4,
      name: "Áo thun nữ in hình retro Y2K",
      brand: "RetroVibe",
      description: "Áo thun nữ form rộng in hình phong cách Y2K retro, chất cotton 100% mềm mại thoáng mát, cực hot trend.",
      slug: "ao-thun-nu-in-hinh-retro-y2k",
    },
  ];

  const productIds = {};
  for (const p of newProducts) {
    const r = await apiPost("/products", p, token);
    const id = r.result?.data?.id || r.result?.id;
    productIds[p.slug] = id;
    if (r.status >= 200 && r.status < 300) {
      console.log(`  ✅ Product "${p.name}" → ID: ${id}`);
    } else {
      console.log(`  ❌ Product "${p.name}" → ${r.status}: ${JSON.stringify(r.result)}`);
    }
    await delay(200);
  }

  // Lấy lại toàn bộ products để có ID chính xác
  console.log("\n📋 Lấy lại danh sách products...");
  const prodRes = await apiGet("/products?pageIndex=1&pageSize=200", token);
  const allProducts = prodRes?.data?.items || prodRes?.items || [];
  for (const p of allProducts) {
    if (p.slug && !productIds[p.slug]) {
      productIds[p.slug] = p.id;
    }
    // Also match by name for fallback
    const matchingNew = newProducts.find(np => np.name === p.name);
    if (matchingNew) {
      productIds[matchingNew.slug] = p.id;
    }
  }
  console.log("📌 Product IDs:", productIds);

  // ═══════════════════════════════════════════════════════════════════════════
  // BƯỚC 4: Tạo 20 biến thể
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n🎨 Bước 4: Tạo 20 biến thể...\n");

  // Attribute value IDs cũ (tái sử dụng):
  // Màu: 1=Be, 2=Cam, 3=Đen, 5=Hồng, 6=Nâu, 7=Trắng, 9=Xám, 10=Xanh dương
  // Size quần áo: 14=S, 15=M, 16=L, 17=XL, 18=Freesize
  // Size giày: 31=41, 32=43, 33=44
  // Size PK: 36=PK M, 37=PK L
  // Chất liệu: 39=Cotton 100%

  const PID = (slug) => productIds[slug];
  const GN = (size) => giayNuValues[size]; // Size giày nữ
  const KD = (kd) => kieuDangValues[kd];   // Kiểu dáng

  const variants = [
    // ── #27: Mũ lưỡi trai snapback unisex ──
    { productId: PID("mu-luoi-trai-snapback-unisex"), variantName: "Snapback - Đen - Freesize", price: 179000, stockQuantity: 80, sku: "SNAP-27-DEN-FREE", weightGrams: 120, valueIds: [3, 18, KD("Snapback")] },
    { productId: PID("mu-luoi-trai-snapback-unisex"), variantName: "Snapback - Trắng - Freesize", price: 179000, stockQuantity: 65, sku: "SNAP-27-TRANG-FREE", weightGrams: 120, valueIds: [7, 18, KD("Snapback")] },

    // ── #28: Mũ bucket vải canvas thời trang ──
    { productId: PID("mu-bucket-vai-canvas"), variantName: "Bucket canvas - Đen - Freesize", price: 199000, stockQuantity: 55, sku: "BUCK-28-DEN-FREE", weightGrams: 150, valueIds: [3, 18, KD("Bucket")] },
    { productId: PID("mu-bucket-vai-canvas"), variantName: "Bucket canvas - Be - Freesize", price: 199000, stockQuantity: 48, sku: "BUCK-28-BE-FREE", weightGrams: 150, valueIds: [1, 18, KD("Bucket")] },

    // ── #29: Mũ beret len Pháp vintage ──
    { productId: PID("mu-beret-len-phap-vintage"), variantName: "Beret len - Đen - Freesize", price: 229000, stockQuantity: 40, sku: "BERE-29-DEN-FREE", weightGrams: 100, valueIds: [3, 18] },
    { productId: PID("mu-beret-len-phap-vintage"), variantName: "Beret len - Nâu - Freesize", price: 229000, stockQuantity: 35, sku: "BERE-29-NAU-FREE", weightGrams: 100, valueIds: [6, 18] },

    // ── #30: Giày sneaker nam thể thao basic ──
    { productId: PID("giay-sneaker-nam-the-thao-basic"), variantName: "Sneaker basic - Trắng - Size 41", price: 650000, stockQuantity: 45, sku: "SNKR-30-TRANG-41", weightGrams: 700, valueIds: [7, 31] },
    { productId: PID("giay-sneaker-nam-the-thao-basic"), variantName: "Sneaker basic - Đen - Size 43", price: 650000, stockQuantity: 38, sku: "SNKR-30-DEN-43", weightGrams: 720, valueIds: [3, 32] },

    // ── #31: Giày cao gót nữ mũi nhọn công sở ──
    { productId: PID("giay-cao-got-nu-mui-nhon"), variantName: "Cao gót mũi nhọn - Đen - Size 37", price: 720000, stockQuantity: 30, sku: "HEEL-31-DEN-37", weightGrams: 500, valueIds: [3, GN("37")] },
    { productId: PID("giay-cao-got-nu-mui-nhon"), variantName: "Cao gót mũi nhọn - Hồng - Size 38", price: 720000, stockQuantity: 25, sku: "HEEL-31-HONG-38", weightGrams: 510, valueIds: [5, GN("38")] },

    // ── #32: Dép sandal quai chéo nam nữ ──
    { productId: PID("dep-sandal-quai-cheo-nam-nu"), variantName: "Sandal quai chéo - Đen - Size 41", price: 250000, stockQuantity: 90, sku: "SAND-32-DEN-41", weightGrams: 350, valueIds: [3, 31] },
    { productId: PID("dep-sandal-quai-cheo-nam-nu"), variantName: "Sandal quai chéo - Nâu - Size 43", price: 250000, stockQuantity: 75, sku: "SAND-32-NAU-43", weightGrams: 360, valueIds: [6, 32] },

    // ── #33: Túi tote canvas đi học đi làm ──
    { productId: PID("tui-tote-canvas-di-hoc-di-lam"), variantName: "Tote canvas - Đen", price: 285000, stockQuantity: 60, sku: "TOTE-33-DEN", weightGrams: 400, valueIds: [3, KD("Tote")] },
    { productId: PID("tui-tote-canvas-di-hoc-di-lam"), variantName: "Tote canvas - Be", price: 285000, stockQuantity: 50, sku: "TOTE-33-BE", weightGrams: 400, valueIds: [1, KD("Tote")] },

    // ── #34: Túi đeo chéo mini da PU nữ ──
    { productId: PID("tui-deo-cheo-mini-da-pu-nu"), variantName: "Crossbody mini - Đen", price: 350000, stockQuantity: 42, sku: "XBOD-34-DEN", weightGrams: 250, valueIds: [3, KD("Crossbody")] },
    { productId: PID("tui-deo-cheo-mini-da-pu-nu"), variantName: "Crossbody mini - Hồng", price: 350000, stockQuantity: 35, sku: "XBOD-34-HONG", weightGrams: 250, valueIds: [5, KD("Crossbody")] },

    // ── #35: Quần short thể thao nam nhanh khô ──
    { productId: PID("quan-short-the-thao-nam-nhanh-kho"), variantName: "Short thể thao - Đen - Size 30", price: 199000, stockQuantity: 85, sku: "SHRT-35-DEN-30", weightGrams: 180, valueIds: [3, 21] },
    { productId: PID("quan-short-the-thao-nam-nhanh-kho"), variantName: "Short thể thao - Xám - Size 32", price: 199000, stockQuantity: 70, sku: "SHRT-35-XAM-32", weightGrams: 185, valueIds: [9, 23] },

    // ── #36: Áo thun nữ in hình retro Y2K ──
    { productId: PID("ao-thun-nu-in-hinh-retro-y2k"), variantName: "Áo thun Y2K - Trắng - Size M - Cotton", price: 239000, stockQuantity: 75, sku: "Y2K-36-TRANG-M", weightGrams: 200, valueIds: [7, 15, 39] },
    { productId: PID("ao-thun-nu-in-hinh-retro-y2k"), variantName: "Áo thun Y2K - Đen - Size L - Cotton", price: 239000, stockQuantity: 65, sku: "Y2K-36-DEN-L", weightGrams: 210, valueIds: [3, 16, 39] },
  ];

  let success = 0;
  let failed = 0;

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    
    if (!v.productId) {
      console.log(`  ❌ [${i + 1}/${variants.length}] ${v.sku} → Không có productId!`);
      failed++;
      continue;
    }

    // Filter out undefined/null valueIds
    const cleanValueIds = (v.valueIds || []).filter(id => id !== undefined && id !== null);

    const params = new URLSearchParams();
    cleanValueIds.forEach(id => params.append("valueIds", id.toString()));

    const body = {
      productId: v.productId,
      variantName: v.variantName,
      price: v.price,
      stockQuantity: v.stockQuantity,
      sku: v.sku,
      weightGrams: v.weightGrams,
    };

    const url = `${BASE}/variants?${params.toString()}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let result;
      try { result = JSON.parse(text); } catch { result = text; }

      if (res.status >= 200 && res.status < 300) {
        success++;
        console.log(`  ✅ [${i + 1}/${variants.length}] ${v.sku} → OK`);
      } else {
        failed++;
        console.log(`  ❌ [${i + 1}/${variants.length}] ${v.sku} → ${res.status}: ${JSON.stringify(result)}`);
      }
    } catch (err) {
      failed++;
      console.log(`  ❌ [${i + 1}/${variants.length}] ${v.sku} → Error: ${err.message}`);
    }
    await delay(300);
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`📊 KẾT QUẢ TỔNG HỢP:`);
  console.log(`  📂 Danh mục mới: 3 (Mũ/Nón, Giày/Dép, Túi xách)`);
  console.log(`  🏷️ Thuộc tính mới: 2 (Size giày nữ, Kiểu dáng)`);
  console.log(`  🛍️ Sản phẩm mới: 10`);
  console.log(`  🎨 Biến thể: ${success} thành công, ${failed} thất bại (tổng: ${variants.length})`);
  console.log(`${"═".repeat(60)}`);
}

main();
