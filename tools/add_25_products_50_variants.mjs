/**
 * Tool thêm 25 sản phẩm mới và 50 biến thể chuẩn hóa cho ShopFake
 * Tránh trùng lặp với các sản phẩm đã có.
 * 
 * Quy tắc:
 * 1. Tái sử dụng thuộc tính có sẵn trên hệ thống (Size, Color, Color EX, Size EX)
 * 2. TUYỆT ĐỐI KHÔNG đưa size hoặc màu sắc vào description của sản phẩm
 * 3. Mỗi sản phẩm có đúng 2 biến thể (25 sản phẩm x 2 = 50 biến thể)
 * 4. Tự động tải và gán ảnh biến thể lên server qua /images/upload
 */

const BASE = 'https://shoppefake-545163055657.asia-southeast1.run.app/api/v1';

// Danh sách ảnh mẫu Cloudinary sẵn có trên hệ thống để gán cho các biến thể
const SAMPLE_IMAGES = [
  "https://res.cloudinary.com/shuppe/image/upload/v1790823873/products/dhnu9jowxe3bokosg44t.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790823871/products/txegjsxyec07ddko0yk2.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790823869/products/iowgjbjp40mvqkyivzpx.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790823868/products/sstbgeogu53qvci2ztg2.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790823866/products/uqtpiibict8o83leztay.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790823865/products/iys21bgd1jszvalvdpcv.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790823863/products/lhqgdlssw9fuch3snayd.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790823861/products/nu6ot5ptxfq1bnmueo8h.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790823859/products/kzbtxvnt8g0gqk4zlc6f.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790823857/products/xsnr31dbyokqa9fw59sz.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790150303/products/kkrcxuokqtr9jfjuwuty.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790143569/products/esuy2ymiebmqybwwqrgd.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790143531/products/ydnwvp9hgbovflhlcp2u.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790143381/products/z3dsgahrskfrejnxlfax.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790143350/products/kcraokdsczz23vwtxhpt.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790065659/products/t33ikqwd9xj4eyjtbrs6.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790065630/products/hjprquofckxqj33qesdr.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790065479/products/jxpkbv1sqqh7xbo0sbkz.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790065449/products/vakpaimkqvoth7vi2wda.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790065358/products/cpinrouidnk6ximunt36.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790065298/products/csk5936fasvtlc08ywny.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790065189/products/g9wbzogi7ncisw2q8gbz.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790065165/products/vyxbq5kjgndx7gg5gdky.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790065028/products/uq8wekv9ucmtzhkricgi.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790064963/products/n2n7hcajwnyyc2yzdtj3.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790064825/products/jmbqgppy7zqzpoxnoiuw.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790064793/products/plveig1hzhlc2l5ehs8v.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790064678/products/acjb4nbd6rs5j6zrlfgg.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790064652/products/nwh4tdpvc8zscjrtkkle.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790064442/products/bbyj9en6l3vjc4qdwl42.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790064420/products/w1xnf9k03og1ydean2ys.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790064307/products/puyortbpspilisg7ny2z.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790064281/products/txuipbgdqgaqk9n8qhba.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790064130/products/mytrpfabue4fbs1gvvr1.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790064076/products/qmhgrumidklhjrjpohuc.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790063942/products/r9p0aveivmee2dqxsni5.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790063902/products/vv2vldbsvpkys1v8oz92.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790059564/products/jdziqgrarq0xqphict5w.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790059537/products/szxklgdy1qpoji7uzhtj.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790056763/products/jod6pgfasmyckps84w4f.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790056711/products/ecf44jcdynigrqvdiusa.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790056540/products/jsmycrwadtqntr8lvc7a.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790056480/products/qygky0mx2rvu5erjlyxq.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790055478/products/hkdo4q6ck4fkk8cyescf.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790055444/products/f1vxduoh2boccetnjpvd.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790055289/products/nuvvlogsmz5mgwwusipt.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790055228/products/hlewclzkftm8kxvvio7y.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790053785/products/afdmgu2qne6zbrr1btuf.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790053558/products/ivevgnrktjkgkwlxffoy.webp",
  "https://res.cloudinary.com/shuppe/image/upload/v1790053506/products/xpuexbsth3tpioouyhq2.webp"
];

// Danh sách 25 sản phẩm hoàn toàn mới (50 biến thể)
export const twentyFiveProducts = [
  // 1. Áo thun nam
  {
    name: "Áo Thun Nam Cổ Tròn Cotton 100% Kháng Khuẩn Thoáng Khí",
    categoryId: 1, // Áo thun
    brand: "TEELAB",
    description: "Áo phông nam dệt từ 100% sợi bông cotton tự nhiên định lượng 250gsm dày dặn, thấm hút mồ hôi tốt và êm ái với làn da nhạy cảm. Công nghệ dệt sợi chải kỹ hạn chế xù lông và bai gião cổ sau nhiều lần giặt. Phom áo suông rộng unisex năng động, dễ phối cùng quần short hoặc quần jeans dạo phố.",
    variants: [
      {
        variantName: "Trắng - M",
        price: 189000,
        stockQuantity: 60,
        sku: "TSHIRT-COTTON-TRANG-M",
        weightGrams: 220,
        valueIds: [1, 5], // Size M (1), Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[0]
      },
      {
        variantName: "Đen - L",
        price: 189000,
        stockQuantity: 60,
        sku: "TSHIRT-COTTON-DEN-L",
        weightGrams: 220,
        valueIds: [2, 6], // Size L (2), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[1]
      }
    ]
  },

  // 2. Áo thun nữ ôm body
  {
    name: "Áo Thun Nữ Cổ Tim Ôm Body Chất Bozip Co Giãn Tôn Dáng",
    categoryId: 1, // Áo thun
    brand: "CHARM",
    description: "Áo thun ôm sát body thiết kế cổ tim khoe khéo xương quai xanh thanh mảnh. Chất liệu vải thun bozip gân tăm co giãn 4 chiều ôm trọn đường cong cơ thể mà vẫn mang lại cảm giác thoải mái, dễ chịu. Đường viền may cuốn biên tỉ mỉ. Thích hợp mặc lót trong áo blazer hoặc sơ vin cùng quần ống rộng cạp cao.",
    variants: [
      {
        variantName: "Be - S",
        price: 149000,
        stockQuantity: 50,
        sku: "TSHIRT-BODY-BE-S",
        weightGrams: 160,
        valueIds: [21, 7], // Size S (21), Color Be (7)
        imageUrl: SAMPLE_IMAGES[2]
      },
      {
        variantName: "Xám - M",
        price: 149000,
        stockQuantity: 50,
        sku: "TSHIRT-BODY-XAM-M",
        weightGrams: 160,
        valueIds: [1, 10], // Size M (1), Color Xám (10)
        imageUrl: SAMPLE_IMAGES[3]
      }
    ]
  },

  // 3. Áo thun in typography
  {
    name: "Áo Thun Unisex In Họa Tiết Typography Nghệ Thuật Oversize",
    categoryId: 1, // Áo thun
    brand: "BAD HABITS",
    description: "Áo phông tay lỡ form rộng mang hơi thở đường phố hiện đại. Họa tiết typography mặt sau được in kỹ thuật số công nghệ cao, màu sắc sắc nét và không bị nứt vỡ khi giặt máy. Vải cotton mềm mát, độ rủ tự nhiên giúp tôn phong cách phóng khoáng và cá tính của giới trẻ.",
    variants: [
      {
        variantName: "Đen - L",
        price: 250000,
        stockQuantity: 40,
        sku: "TSHIRT-TYPO-DEN-L",
        weightGrams: 240,
        valueIds: [2, 6], // Size L (2), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[4]
      },
      {
        variantName: "Xanh Dương - XL",
        price: 250000,
        stockQuantity: 40,
        sku: "TSHIRT-TYPO-XD-XL",
        weightGrams: 250,
        valueIds: [3, 18], // Size XL (3), Color Xanh Dương (18)
        imageUrl: SAMPLE_IMAGES[5]
      }
    ]
  },

  // 4. Áo sơ mi nam cổ tàu
  {
    name: "Áo Sơ Mi Nam Cổ Tàu Vải Đũi Linen Mát Mẻ Mùa Hè",
    categoryId: 2, // Áo sơ mi
    brand: "OWEN",
    description: "Áo sơ mi nam cổ trụ phong cách tối giản thanh lịch. Chất liệu đũi pha linen dệt thưa tự nhiên tạo độ thông thoáng tuyệt đối, giải nhiệt cơ thể tối đa trong những ngày hè oi bức. Hàng cúc vỏ ốc tinh tế cùng phom suông nhẹ nhàng đem lại nét phóng khoáng, mộc mạc khi phối cùng quần short đũi hoặc quần chinos.",
    variants: [
      {
        variantName: "Trắng - M",
        price: 360000,
        stockQuantity: 45,
        sku: "SM-LINEN-TRANG-M",
        weightGrams: 200,
        valueIds: [1, 5], // Size M (1), Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[6]
      },
      {
        variantName: "Be - L",
        price: 360000,
        stockQuantity: 45,
        sku: "SM-LINEN-BE-L",
        weightGrams: 210,
        valueIds: [2, 7], // Size L (2), Color Be (7)
        imageUrl: SAMPLE_IMAGES[7]
      }
    ]
  },

  // 5. Áo sơ mi nữ kẻ sọc
  {
    name: "Áo Sơ Mi Nữ Kẻ Sọc Dáng Rộng Tay Dài Phong Cách Hàn Quốc",
    categoryId: 2, // Áo sơ mi
    brand: "SIXDO",
    description: "Áo sơ mi nữ phom rộng kẻ sọc dọc tinh tế tạo hiệu ứng thon gọn cho vóc dáng. Chất vải thô poplin mềm mại, đứng form và hạn chế nhăn nhúm hiệu quả. Thiết kế túi ốp ngực trẻ trung cùng phần vạt sau dài hơn vạt trước tạo nét cá tính, có thể mặc buông hoặc sơ vin nửa vạt thời thượng.",
    variants: [
      {
        variantName: "Xanh Dương - S",
        price: 320000,
        stockQuantity: 55,
        sku: "SM-KE-XD-S",
        weightGrams: 190,
        valueIds: [21, 18], // Size S (21), Color Xanh Dương (18)
        imageUrl: SAMPLE_IMAGES[8]
      },
      {
        variantName: "Xám - M",
        price: 320000,
        stockQuantity: 55,
        sku: "SM-KE-XAM-M",
        weightGrams: 190,
        valueIds: [1, 10], // Size M (1), Color Xám (10)
        imageUrl: SAMPLE_IMAGES[9]
      }
    ]
  },

  // 6. Áo polo nam khóa kéo cổ zip
  {
    name: "Áo Polo Nam Cổ Zip Kéo Khóa Kim Loại Hiện Đại Smart Casual",
    categoryId: 3, // Áo polo
    brand: "ARISTINO",
    description: "Áo polo nam cách tân với khóa kéo kim loại thay cho hàng cúc truyền thống, tạo điểm nhấn nam tính và hiện đại. Vải pima cotton thượng hạng dệt mắt chim siêu nhỏ cho cảm giác mượt mà, đàn hồi và bền màu vượt trội. Bo tay ôm nhẹ bắp tay khoe vẻ khỏe khoắn, lịch lãm trong môi trường công sở lẫn tiệc nhẹ.",
    variants: [
      {
        variantName: "Đen - L",
        price: 399000,
        stockQuantity: 50,
        sku: "POLO-ZIP-DEN-L",
        weightGrams: 230,
        valueIds: [2, 6], // Size L (2), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[10]
      },
      {
        variantName: "Navy - XL",
        price: 399000,
        stockQuantity: 50,
        sku: "POLO-ZIP-NAVY-XL",
        weightGrams: 240,
        valueIds: [3, 22], // Size XL (3), Color Navy (22)
        imageUrl: SAMPLE_IMAGES[11]
      }
    ]
  },

  // 7. Áo khoác gió thể thao nam
  {
    name: "Áo Khoác Gió Nam Thể Thao Chống Nước Chống Tia Cực Tím",
    categoryId: 4, // Áo khoác
    brand: "CANFA",
    description: "Áo khoác gió thông minh sử dụng chất liệu vải micro polyester phủ màng PU chống nước mưa phùn và cản gió hiệu quả. Bề mặt vải trơn láng chống bám bụi bẩn, tích hợp chỉ số chống nắng UPF 50+ bảo vệ da khi đi ngoài trời. Thiết kế mũ trùm đầu có dây rút gọn gàng, hai túi khóa zip bảo đảm an toàn cho đồ dùng cá nhân.",
    variants: [
      {
        variantName: "Xám - L",
        price: 299000,
        stockQuantity: 65,
        sku: "GIO-UV-XAM-L",
        weightGrams: 280,
        valueIds: [2, 10], // Size L (2), Color Xám (10)
        imageUrl: SAMPLE_IMAGES[12]
      },
      {
        variantName: "Xanh đậm - XL",
        price: 299000,
        stockQuantity: 65,
        sku: "GIO-UV-XDAM-XL",
        weightGrams: 290,
        valueIds: [3, 11], // Size XL (3), Color Xanh đậm (11)
        imageUrl: SAMPLE_IMAGES[13]
      }
    ]
  },

  // 8. Áo khoác denim nam
  {
    name: "Áo Khoác Jean Nam Dáng Cổ Điển Denim Dày Dặn 4 Túi",
    categoryId: 4, // Áo khoác
    brand: "BLUE EXCHANGE",
    description: "Áo khoác bò nam phom regular fit chuẩn mực với chất liệu denim 14oz dệt vân chéo dày dặn, có khả năng giữ ấm và cản gió tốt. Cúc kim loại dập nổi thương hiệu chắc chắn, 2 túi ốp nắp gập trước ngực cùng 2 túi xẻ hông tiện lợi. Kỹ thuật mài rách nhẹ tạo nét bụi bặm phong trần đặc trưng của phong cách đường phố.",
    variants: [
      {
        variantName: "Xanh Dương - M",
        price: 490000,
        stockQuantity: 40,
        sku: "JEAN-JKT-XD-M",
        weightGrams: 650,
        valueIds: [1, 18], // Size M (1), Color Xanh Dương (18)
        imageUrl: SAMPLE_IMAGES[14]
      },
      {
        variantName: "Đen - L",
        price: 490000,
        stockQuantity: 40,
        sku: "JEAN-JKT-DEN-L",
        weightGrams: 670,
        valueIds: [2, 6], // Size L (2), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[15]
      }
    ]
  },

  // 9. Quần jean nam rách gối
  {
    name: "Quần Jean Nam Rách Gối Xước Nhẹ Cá Tính Phom Slim Fit",
    categoryId: 5, // Quần jean
    brand: "GENVIET",
    description: "Quần bò nam phom slim-fit ôm vừa vặn dọc theo chân giúp vóc dáng cao ráo hơn. Kỹ thuật cào xước thủ công tại đầu gối và đùi tạo điểm nhấn phá cách, trẻ trung. Vải denim co giãn nhẹ tạo cảm giác thoải mái khi di chuyển hoặc ngồi lái xe. Đáy quần may chỉ gia cố chịu lực cao, không lo bục chỉ.",
    variants: [
      {
        variantName: "Xanh đậm - M",
        price: 470000,
        stockQuantity: 50,
        sku: "JEAN-RACH-XDAM-M",
        weightGrams: 520,
        valueIds: [1, 11], // Size M (1), Color Xanh đậm (11)
        imageUrl: SAMPLE_IMAGES[16]
      },
      {
        variantName: "Đen - L",
        price: 470000,
        stockQuantity: 50,
        sku: "JEAN-RACH-DEN-L",
        weightGrams: 530,
        valueIds: [2, 6], // Size L (2), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[17]
      }
    ]
  },

  // 10. Quần jean nữ ống rộng retro
  {
    name: "Quần Jean Nữ Ống Rộng Suông Dài Cạp Cao Phong Cách Retro",
    categoryId: 5, // Quần jean
    brand: "DAISY",
    description: "Quần jean nữ ống suông rộng mang phong cách hoài cổ thập niên 90. Cạp quần cao ngang rốn ôm gọn eo và định hình vòng hai thon gọn, ống quần dài chạm gót tạo hiệu ứng kéo dài chân miên man. Chất denim cotton mềm đã qua xử lý giặt mềm, không thô ráp khi tiếp xúc trực tiếp với da.",
    variants: [
      {
        variantName: "Xanh Dương - S",
        price: 395000,
        stockQuantity: 50,
        sku: "JEAN-RETRO-XD-S",
        weightGrams: 470,
        valueIds: [21, 18], // Size S (21), Color Xanh Dương (18)
        imageUrl: SAMPLE_IMAGES[18]
      },
      {
        variantName: "Trắng - M",
        price: 395000,
        stockQuantity: 50,
        sku: "JEAN-RETRO-TRANG-M",
        weightGrams: 480,
        valueIds: [1, 5], // Size M (1), Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[19]
      }
    ]
  },

  // 11. Quần âu nam công sở
  {
    name: "Quần Tây Quần Âu Nam Phom Slim Hàn Quốc Vải Chống Nhăn",
    categoryId: 6, // Quần kaki
    brand: "VIETTEN",
    description: "Quần âu nam công sở may từ vải tuyết hàn cao cấp dệt sợi nhân tạo có độ bóng nhẹ sang trọng, giữ ly quần sắc nét suốt ngày dài mà không lo nhăn nhàu. Cạp quần thiết kế nới chun ẩn thông minh co giãn nhẹ nhàng khi ngồi tiệc. Dễ dàng mix cùng áo sơ mi và giày da cho diện mạo chuẩn quý ông thành đạt.",
    variants: [
      {
        variantName: "Đen - M",
        price: 410000,
        stockQuantity: 55,
        sku: "AU-SLIM-DEN-M",
        weightGrams: 390,
        valueIds: [1, 6], // Size M (1), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[20]
      },
      {
        variantName: "Xám - L",
        price: 410000,
        stockQuantity: 55,
        sku: "AU-SLIM-XAM-L",
        weightGrams: 400,
        valueIds: [2, 10], // Size L (2), Color Xám (10)
        imageUrl: SAMPLE_IMAGES[21]
      }
    ]
  },

  // 12. Quần kaki nữ baggy
  {
    name: "Quần Kaki Nữ Ống Lửng Baggy Cạp Thun Lưng Sau Năng Động",
    categoryId: 6, // Quần kaki
    brand: "NEM FASHION",
    description: "Quần kaki baggy nữ với phom dáng xếp ly nhẹ ở hông và thuôn dần về gấu quần giúp che khuyết điểm đùi to hiệu quả. Chất kaki thun cotton co giãn nhẹ, thấm hút mồ hôi tốt. Lưng thun phía sau tạo sự vừa vặn dễ chịu khi vận động cả ngày. Thích hợp cho cả môi trường công sở lẫn các buổi hẹn hò cà phê.",
    variants: [
      {
        variantName: "Be - S",
        price: 340000,
        stockQuantity: 50,
        sku: "BAGGY-KAKI-BE-S",
        weightGrams: 330,
        valueIds: [21, 7], // Size S (21), Color Be (7)
        imageUrl: SAMPLE_IMAGES[22]
      },
      {
        variantName: "Đen - M",
        price: 340000,
        stockQuantity: 50,
        sku: "BAGGY-KAKI-DEN-M",
        weightGrams: 340,
        valueIds: [1, 6], // Size M (1), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[23]
      }
    ]
  },

  // 13. Quần short jean nữ
  {
    name: "Quần Short Jean Nữ Cạp Cao Rách Gấu Phối Túi Trước Tôn Dáng",
    categoryId: 7, // Quần short
    brand: "LENA",
    description: "Quần soóc bò nữ thiết kế cạp cao tôn eo và khoe trọn đôi chân thon dài. Phần gấu quần cắt tua rua tự nhiên phối cào rách tinh tế tạo phong cách trẻ trung, năng động cho mùa hè. Chất liệu denim dày dặn không bai dão, đường may vắt sổ kép cẩn thận. Dễ dàng kết hợp cùng áo thun phom rộng hoặc áo hai dây mát mẻ.",
    variants: [
      {
        variantName: "Trắng - S",
        price: 210000,
        stockQuantity: 60,
        sku: "SHORT-JEAN-TRANG-S",
        weightGrams: 250,
        valueIds: [21, 5], // Size S (21), Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[24]
      },
      {
        variantName: "Xanh Dương - M",
        price: 210000,
        stockQuantity: 60,
        sku: "SHORT-JEAN-XD-M",
        weightGrams: 260,
        valueIds: [1, 18], // Size M (1), Color Xanh Dương (18)
        imageUrl: SAMPLE_IMAGES[25]
      }
    ]
  },

  // 14. Đầm maxi đi biển
  {
    name: "Đầm Maxi Đi Biển Voan Hoa Nhí Thắt Nơ Lưng Duyên Dáng",
    categoryId: 8, // Váy / Đầm
    brand: "MARC FASHION",
    description: "Váy đầm maxi dài thướt tha dệt từ vải voan cát mềm nhẹ, bồng bềnh theo từng bước chân khi dạo biển. Thiết kế dây nơ thắt lưng phía sau giúp tùy chỉnh vòng eo thon gọn, tà váy xòe rộng bay bổng trong gió. Váy được lót lớp lụa habutai kín đáo bên trong. Lựa chọn tuyệt vời cho các chuyến du lịch, nghỉ dưỡng.",
    variants: [
      {
        variantName: "Vàng - S",
        price: 460000,
        stockQuantity: 40,
        sku: "MAXI-VOAN-VANG-S",
        weightGrams: 360,
        valueIds: [21, 19], // Size S (21), Color Vàng (19)
        imageUrl: SAMPLE_IMAGES[26]
      },
      {
        variantName: "Đỏ - M",
        price: 460000,
        stockQuantity: 40,
        sku: "MAXI-VOAN-DO-M",
        weightGrams: 370,
        valueIds: [1, 8], // Size M (1), Color Đỏ (8)
        imageUrl: SAMPLE_IMAGES[27]
      }
    ]
  },

  // 15. Chân váy bút chì
  {
    name: "Chân Váy Bút Chì Công Sở Xẻ Tà Trước Tôn Dáng Lưng Cao",
    categoryId: 8, // Váy / Đầm
    brand: "EVA DE EVA",
    description: "Chân váy bút chì dáng ôm tôn trọn đường cong hông và vòng ba quyến rũ của phái đẹp. Chi tiết xẻ tà tinh tế phía trước vừa tạo điểm nhấn thanh lịch vừa giúp người mặc bước đi uyển chuyển, linh hoạt. Chất liệu tuyết mưa cao cấp đứng form, dày dặn, không lộ viền và hạn chế tối đa nhăn xù.",
    variants: [
      {
        variantName: "Đen - S",
        price: 360000,
        stockQuantity: 45,
        sku: "VAY-BUTCHI-DEN-S",
        weightGrams: 270,
        valueIds: [21, 6], // Size S (21), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[28]
      },
      {
        variantName: "Be - M",
        price: 360000,
        stockQuantity: 45,
        sku: "VAY-BUTCHI-BE-M",
        weightGrams: 280,
        valueIds: [1, 7], // Size M (1), Color Be (7)
        imageUrl: SAMPLE_IMAGES[29]
      }
    ]
  },

  // 16. Áo choàng ngủ kimono
  {
    name: "Áo Choàng Ngủ Nữ Kimono Lụa Viền Ren Quyến Rũ Sang Trọng",
    categoryId: 9, // Đồ lót & Đồ ngủ
    brand: "LACE SECRET",
    description: "Áo choàng kimono phòng ngủ sang trọng may từ chất liệu lụa bóng mềm mịn màng, vuốt ve làn da sau mỗi giờ tắm thư giãn. Viền ren thêu hoa tinh xảo ở cổ tay và vạt áo mang lại nét gợi cảm, quý phái. Kèm dây đai lưng thắt nơ tiện lợi. Sản phẩm cao cấp phù hợp làm quà tặng ý nghĩa cho phái đẹp.",
    variants: [
      {
        variantName: "Trắng - S",
        price: 450000,
        stockQuantity: 35,
        sku: "ROBE-LUA-TRANG-S",
        weightGrams: 290,
        valueIds: [21, 5], // Size S (21), Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[30]
      },
      {
        variantName: "Đỏ - M",
        price: 450000,
        stockQuantity: 35,
        sku: "ROBE-LUA-DO-M",
        weightGrams: 300,
        valueIds: [1, 8], // Size M (1), Color Đỏ (8)
        imageUrl: SAMPLE_IMAGES[31]
      }
    ]
  },

  // 17. Quần boxer nam
  {
    name: "Quần Lót Nam Boxer Modal Gỗ Sồi Kháng Khuẩn Co Giãn 4 Chiều",
    categoryId: 9, // Đồ lót & Đồ ngủ
    brand: "ONOFF",
    description: "Quần boxer nam dệt từ sợi modal chiết xuất từ thân cây gỗ sồi tự nhiên, mang lại bề mặt vải siêu mềm mướt và khả năng thấm hút cao gấp 2 lần so với cotton thông thường. Bản đai lưng dệt thun micro mềm mại không hằn cấn lên da bụng. Đáy quần 2 lớp kháng khuẩn tự nhiên, thông thoáng tối đa cả ngày.",
    variants: [
      {
        variantName: "Đen - L",
        price: 120000,
        stockQuantity: 80,
        sku: "BOXER-MODAL-DEN-L",
        weightGrams: 90,
        valueIds: [2, 6], // Size L (2), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[32]
      },
      {
        variantName: "Xám - XL",
        price: 120000,
        stockQuantity: 80,
        sku: "BOXER-MODAL-XAM-XL",
        weightGrams: 95,
        valueIds: [3, 10], // Size XL (3), Color Xám (10)
        imageUrl: SAMPLE_IMAGES[33]
      }
    ]
  },

  // 18. Giày lười nam da bò
  {
    name: "Giày Lười Loafer Nam Da Bò Dập Vân Cá Tính Đế Khâu Cao Cấp",
    categoryId: 10, // Giày dép
    brand: "TAMAS",
    description: "Giày tây không dây lười nam thiết kế mũi quả hạnh thanh lịch. Thân giày gia công từ da bò nguyên tấm xử lý nhiệt bề mặt chống trầy xước và tạo độ bóng mờ sang trọng. Phần lót trong đệm mút hoạt tính khử mùi êm ái khi mang chân trần. Đế cao su đúc nguyên khối được khâu chỉ viền gia cố chống trơn trượt tối ưu.",
    variants: [
      {
        variantName: "Đen",
        price: 850000,
        stockQuantity: 35,
        sku: "LOAFER-BO-DEN",
        weightGrams: 750,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[34]
      },
      {
        variantName: "Bạc",
        price: 850000,
        stockQuantity: 35,
        sku: "LOAFER-BO-BAC",
        weightGrams: 750,
        valueIds: [20], // Color Bạc (20)
        imageUrl: SAMPLE_IMAGES[35]
      }
    ]
  },

  // 19. Giày cao gót nữ
  {
    name: "Giày Cao Gót Nữ Mũi Nhọn Gót Vuông 5cm Da Mềm Công Sở",
    categoryId: 10, // Giày dép
    brand: "JODAN",
    description: "Giày cao gót nữ thiết kế gót vuông cao 5cm vững chãi, tạo sự tự tin và thoải mái cho quý cô di chuyển cả ngày mà không lo đau mỏi chân. Mũi nhọn thon gọn kéo dài tỉ lệ bàn chân. Chất liệu da nhân tạo cao cấp bề mặt mượt mà dễ vệ sinh lau chùi. Mặt đế rãnh chống trượt an toàn trên nền gạch hoa.",
    variants: [
      {
        variantName: "Be",
        price: 420000,
        stockQuantity: 40,
        sku: "HEELS-VUONG-BE",
        weightGrams: 550,
        valueIds: [7], // Color Be (7)
        imageUrl: SAMPLE_IMAGES[36]
      },
      {
        variantName: "Đen",
        price: 420000,
        stockQuantity: 40,
        sku: "HEELS-VUONG-DEN",
        weightGrams: 550,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[37]
      }
    ]
  },

  // 20. Túi tote canvas cỡ lớn
  {
    name: "Túi Tote Vải Canvas Cỡ Lớn Đi Học Đi Làm Có Khóa Kéo Miệng",
    categoryId: 11, // Túi xách & Balo
    brand: "TOTEMALL",
    description: "Túi canvas phong cách tối giản mộc mạc với khoang chứa siêu rộng rãi đựng vừa laptop 15.6 inch, sách vở và tài liệu A4. Chất liệu vải mộc cotton dệt sợi dày dặn chịu lực tới 15kg. Miệng túi có khóa kéo zip bảo vệ đồ dùng an toàn bên trong, kèm ngăn phụ nhỏ đựng chìa khóa, điện thoại. Quai đeo may dằn chỉ chữ X chắc chắn.",
    variants: [
      {
        variantName: "Trắng",
        price: 150000,
        stockQuantity: 70,
        sku: "TOTE-CANVAS-TRANG",
        weightGrams: 280,
        valueIds: [5], // Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[38]
      },
      {
        variantName: "Đen",
        price: 150000,
        stockQuantity: 70,
        sku: "TOTE-CANVAS-DEN",
        weightGrams: 280,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[39]
      }
    ]
  },

  // 21. Mũ len beanie
  {
    name: "Mũ Len Beanie Nữ Dệt Kim Sợi Dày Giữ Ấm Phong Cách Ulzzang",
    categoryId: 12, // Mũ & Nón
    brand: "CHERRY SHOP",
    description: "Mũ len trùm đầu phong cách Hàn Quốc dệt từ sợi len acrylic xốp nhẹ, giữ ấm vùng đầu và tai hoàn hảo trong những ngày đông giá rét. Thiết kế vành lật dày dặn ôm nhẹ không gây đau đầu hay ép xẹp tóc. Phom mũ tròn phồng tự nhiên tôn khuôn mặt nhỏ nhắn, dễ dàng mix-match cùng áo phao hoặc áo dạ dáng dài.",
    variants: [
      {
        variantName: "Be",
        price: 120000,
        stockQuantity: 60,
        sku: "BEANIE-LEN-BE",
        weightGrams: 100,
        valueIds: [7], // Color Be (7)
        imageUrl: SAMPLE_IMAGES[40]
      },
      {
        variantName: "Xám",
        price: 120000,
        stockQuantity: 60,
        sku: "BEANIE-LEN-XAM",
        weightGrams: 100,
        valueIds: [10], // Color Xám (10)
        imageUrl: SAMPLE_IMAGES[41]
      }
    ]
  },

  // 22. Ví nam da thật dáng ngang
  {
    name: "Ví Nam Dáng Ngang Da Thật Nhỏ Gọn Nhiều Ngăn Đựng Thẻ",
    categoryId: 13, // Thắt lưng & Phụ kiện
    brand: "GIOVANNI",
    description: "Ví tiền nam gấp đôi dáng ngang làm từ da bò hạt nguyên miếng dẻo dai, đường may viền tỉ mỉ bằng chỉ sáp bền bỉ không tưa rách. Thiết kế thông minh tối ưu không gian chứa với 2 ngăn lớn đựng tiền mặt, 1 ngăn khóa zip kín đáo và 8 khe cắm thẻ ATM, căn cước gọn gàng mà không làm cộm túi quần khi bỏ vào.",
    variants: [
      {
        variantName: "Đen",
        price: 380000,
        stockQuantity: 50,
        sku: "WALLET-BO-DEN",
        weightGrams: 120,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[42]
      },
      {
        variantName: "Navy",
        price: 380000,
        stockQuantity: 50,
        sku: "WALLET-BO-NAVY",
        weightGrams: 120,
        valueIds: [22], // Color Navy (22)
        imageUrl: SAMPLE_IMAGES[43]
      }
    ]
  },

  // 23. Lắc tay bạc ý cỏ 4 lá
  {
    name: "Lắc Tay Bạc Ý 925 Sợi Mảnh Phối Mặt Cỏ Bốn Lá May Mắn",
    categoryId: 14, // Trang sức
    brand: "PNJ SILVER",
    description: "Vòng tay chế tác từ bạc Ý tiêu chuẩn 925 sáng bóng phủ lớp xi bạch kim chống xỉn màu và giữ độ sáng lấp lánh lâu dài. Mặt lắc tay hình cỏ bốn lá đính đá CZ nhân tạo khúc xạ ánh sáng lấp lánh theo từng cử động cổ tay. Dây lắc có mắt xích phụ tiện lợi để nới rộng hoặc thu nhỏ phù hợp kích cỡ cổ tay người đeo.",
    variants: [
      {
        variantName: "Bạc",
        price: 490000,
        stockQuantity: 35,
        sku: "LAC-BAC-925-BAC",
        weightGrams: 20,
        valueIds: [20], // Color Bạc (20)
        imageUrl: SAMPLE_IMAGES[44]
      },
      {
        variantName: "Trắng",
        price: 490000,
        stockQuantity: 35,
        sku: "LAC-BAC-925-TRANG",
        weightGrams: 20,
        valueIds: [5], // Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[45]
      }
    ]
  },

  // 24. Gọng kính titan
  {
    name: "Gọng Kính Cận Titan Tròn Kim Loại Siêu Nhẹ Không Gỉ Sét",
    categoryId: 15, // Kính mắt
    brand: "OWNDAYS",
    description: "Gọng kính cận phom tròn thanh mảnh chế tác từ chất liệu hợp kim Titanium nguyên chất siêu nhẹ chỉ 8 gram, không gây áp lực lên sống mũi và vành tai khi đeo suốt cả ngày. Khả năng chống oxy hóa tuyệt đối, không phai màu hay kích ứng da khi đổ mồ hôi. Bản lề ốc siết chắc chắn, ve mũi silicon mềm mại có thể uốn chỉnh.",
    variants: [
      {
        variantName: "Bạc",
        price: 520000,
        stockQuantity: 40,
        sku: "GONG-TITAN-BAC",
        weightGrams: 50,
        valueIds: [20], // Color Bạc (20)
        imageUrl: SAMPLE_IMAGES[46]
      },
      {
        variantName: "Đen",
        price: 520000,
        stockQuantity: 40,
        sku: "GONG-TITAN-DEN",
        weightGrams: 50,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[47]
      }
    ]
  },

  // 25. Đồng hồ nữ dây lưới mặt đính đá
  {
    name: "Đồng Hồ Nữ Dây Kim Loại Lưới Mặt Tròn Đính Đá Pha Lê Tinh Tế",
    categoryId: 16, // Đồng hồ
    brand: "DANIEL WELLINGTON",
    description: "Đồng hồ nữ phong cách thời trang đương đại với viền mặt số mỏng đính đá pha lê Swarovski phản chiếu ánh sáng lộng lẫy. Dây đeo dạng lưới thép không gỉ 316L mềm mại ôm sát cổ tay, khóa gập trượt dễ dàng điều chỉnh kích cỡ mà không cần cắt mắt dây. Máy Quartz chính xác, mặt kính khoáng cứng cường lực chống va đập.",
    variants: [
      {
        variantName: "Bạc",
        price: 1250000,
        stockQuantity: 30,
        sku: "WATCH-LUOI-BAC",
        weightGrams: 90,
        valueIds: [20], // Color Bạc (20)
        imageUrl: SAMPLE_IMAGES[48]
      },
      {
        variantName: "Đen",
        price: 1250000,
        stockQuantity: 30,
        sku: "WATCH-LUOI-DEN",
        weightGrams: 90,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[49]
      }
    ]
  }
];

// Hàm kiểm tra mô tả
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

export async function addBatchProducts(productsToAdd = twentyFiveProducts) {
  console.log(`🚀 Bắt đầu thêm ${productsToAdd.length} sản phẩm và ${productsToAdd.length * 2} biến thể chuẩn hóa...`);
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

    const descCheck = validateNoAttributesInDescription(prod.description);
    if (!descCheck.valid) {
      console.warn(`⚠️ Cảnh báo: Description chứa từ khóa (${descCheck.matched.join(', ')}).`);
    } else {
      console.log(`✅ Description chuẩn: Không chứa size hoặc màu sắc.`);
    }

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

    for (const v of prod.variants) {
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

if (process.argv[1]?.endsWith('add_25_products_50_variants.mjs')) {
  addBatchProducts().catch(console.error);
}
