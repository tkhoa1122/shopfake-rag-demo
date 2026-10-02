/**
 * Tool thêm 20 sản phẩm mới và 40 biến thể chuẩn hóa cho ShopFake
 * 
 * Quy tắc:
 * 1. Tái sử dụng thuộc tính có sẵn trên hệ thống (Size, Color, Color EX, Size EX)
 * 2. TUYỆT ĐỐI KHÔNG đưa size hoặc màu sắc vào description của sản phẩm
 * 3. Mỗi sản phẩm có đúng 2 biến thể (20 sản phẩm x 2 = 40 biến thể)
 * 4. Tự động tải và gán ảnh biến thể lên server qua /images/upload
 */

import fs from 'fs';

const BASE = 'https://shoppefake-545163055657.asia-southeast1.run.app/api/v1';

// Danh sách ảnh mẫu Cloudinary sẵn có trên hệ thống
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
  "https://res.cloudinary.com/shuppe/image/upload/v1790056763/products/jod6pgfasmyckps84w4f.webp"
];

// 20 sản phẩm mới (40 biến thể)
export const twentyProducts = [
  // 1. Áo sơ mi nam
  {
    name: "Áo Sơ Mi Nam Dài Tay Sợi Bamboo Chống Nhăn Kháng Khuẩn",
    categoryId: 2, // Áo sơ mi
    brand: "AN PHUOC",
    description: "Áo sơ mi dài tay dệt từ sợi tre tự nhiên kết hợp sợi microfiber cho bề mặt vải mềm mịn, thoáng khí và có khả năng kháng khuẩn tự nhiên. Khả năng chống nhăn ưu việt giúp giữ form áo phẳng phiu suốt cả ngày làm việc mà không cần là ủi nhiều. Cổ áo đứng form cổ điển, vạt áo lượn nhẹ dễ dàng sơ vin cùng quần âu hoặc quần kaki.",
    variants: [
      {
        variantName: "Trắng - M",
        price: 450000,
        stockQuantity: 60,
        sku: "SM-BAMBOO-TRANG-M",
        weightGrams: 230,
        valueIds: [1, 5], // Size M (1), Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[0]
      },
      {
        variantName: "Xanh Dương - L",
        price: 450000,
        stockQuantity: 60,
        sku: "SM-BAMBOO-XD-L",
        weightGrams: 230,
        valueIds: [2, 18], // Size L (2), Color Xanh Dương (18)
        imageUrl: SAMPLE_IMAGES[1]
      }
    ]
  },

  // 2. Áo sơ mi nữ lụa
  {
    name: "Áo Sơ Mi Nữ Cổ Thắt Nơ Lụa Hàn Dáng Thanh Lịch",
    categoryId: 2, // Áo sơ mi
    brand: "IVY MODA",
    description: "Áo sơ mi lụa tơ tằm nhân tạo với độ rủ óng ả mềm mại, không gây kích ứng da và tạo cảm giác mát mẻ khi mặc. Điểm nhấn là dải nơ thắt điệu đà ở cổ cùng tay bồng bo chun nhẹ nhàng tôn vinh vẻ nữ tính, yêu kiều. Phù hợp phối cùng chân váy bút chì hoặc quần tây công sở trong các dịp hội họp trang trọng.",
    variants: [
      {
        variantName: "Be - S",
        price: 390000,
        stockQuantity: 40,
        sku: "SM-LUA-BE-S",
        weightGrams: 180,
        valueIds: [21, 7], // Size S (21), Color Be (7)
        imageUrl: SAMPLE_IMAGES[2]
      },
      {
        variantName: "Trắng - M",
        price: 390000,
        stockQuantity: 40,
        sku: "SM-LUA-TRANG-M",
        weightGrams: 180,
        valueIds: [1, 5], // Size M (1), Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[3]
      }
    ]
  },

  // 3. Áo polo thể thao nam
  {
    name: "Áo Polo Thể Thao Nam Vải Cá Sấu Poly Spandex Siêu Nhẹ",
    categoryId: 3, // Áo polo
    brand: "COOLMATE",
    description: "Áo polo thể thao ứng dụng công nghệ dệt MaxCool giúp sợi vải khô nhanh, tản nhiệt tức thì và thấm hút mồ hôi tối ưu khi vận động mạnh. Đường may 4 kim tinh xảo giảm thiểu tối đa ma sát lên da. Thiết kế cổ bẻ dệt rib phối sọc tinh tế mang lại vẻ ngoài trẻ trung, năng động khi chơi thể thao hoặc đi cà phê cuối tuần.",
    variants: [
      {
        variantName: "Navy - L",
        price: 269000,
        stockQuantity: 70,
        sku: "POLO-COOL-NAVY-L",
        weightGrams: 210,
        valueIds: [2, 22], // Size L (2), Color Navy (22)
        imageUrl: SAMPLE_IMAGES[4]
      },
      {
        variantName: "Xám - XL",
        price: 269000,
        stockQuantity: 70,
        sku: "POLO-COOL-XAM-XL",
        weightGrams: 220,
        valueIds: [3, 10], // Size XL (3), Color Xám (10)
        imageUrl: SAMPLE_IMAGES[5]
      }
    ]
  },

  // 4. Áo polo croptop nữ
  {
    name: "Áo Polo Nữ Dáng Cắt Ngắn Phối Cổ Dệt Phong Cách Retro",
    categoryId: 3, // Áo polo
    brand: "YODY",
    description: "Áo polo dáng croptop hiện đại dệt từ sợi cotton chải kỹ mềm mịn, co giãn nhẹ và thông thoáng. Cổ áo bo dệt cổ điển kết hợp hàng cúc ngọc trai tạo điểm nhấn cổ điển pha chút phóng khoáng. Thích hợp mix cùng quần jeans ống rộng cạp cao hoặc chân váy tennis để tạo phong cách trẻ trung, tôn dáng eo thon.",
    variants: [
      {
        variantName: "Trắng - S",
        price: 220000,
        stockQuantity: 50,
        sku: "POLO-CROP-TRANG-S",
        weightGrams: 160,
        valueIds: [21, 5], // Size S (21), Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[6]
      },
      {
        variantName: "Vàng - M",
        price: 220000,
        stockQuantity: 50,
        sku: "POLO-CROP-VANG-M",
        weightGrams: 170,
        valueIds: [1, 19], // Size M (1), Color Vàng (19)
        imageUrl: SAMPLE_IMAGES[7]
      }
    ]
  },

  // 5. Quần jean nam vintage
  {
    name: "Quần Jean Nam Ống Suông Rộng Phong Cách Vintage Denim",
    categoryId: 5, // Quần jean
    brand: "LEVIS",
    description: "Quần bò nam chất liệu denim 12oz bền bỉ dệt dày dặn, áp dụng kỹ thuật wash enzyme hiện đại tạo hiệu ứng bạc màu tự nhiên và mềm mại cho sợi vải. Form dáng ống suông thẳng rộng rãi giúp che khuyết điểm chân, đem lại sự thoải mái tối đa trong mọi chuyển động thường ngày. Đường chỉ may dằn chắc chắn chuẩn phong cách vintage.",
    variants: [
      {
        variantName: "Xanh Dương - M",
        price: 520000,
        stockQuantity: 45,
        sku: "JEAN-SUONG-XD-M",
        weightGrams: 550,
        valueIds: [1, 18], // Size M (1), Color Xanh Dương (18)
        imageUrl: SAMPLE_IMAGES[8]
      },
      {
        variantName: "Đen - L",
        price: 520000,
        stockQuantity: 45,
        sku: "JEAN-SUONG-DEN-L",
        weightGrams: 560,
        valueIds: [2, 6], // Size L (2), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[9]
      }
    ]
  },

  // 6. Quần jean nữ ống loe
  {
    name: "Quần Jean Nữ Cạp Cao Ống Loe Tôn Dáng Co Giãn Đàn Hồi",
    categoryId: 5, // Quần jean
    brand: "GENVIET",
    description: "Quần jean ống loe thiết kế cạp cao ôm sát vòng eo và tôn trọn đường cong hông, phần ống loe nhẹ từ gối xuống giúp đôi chân trông dài và thon gọn hơn. Chất liệu denim pha cotton sợi thun đàn hồi cao giúp cử động linh hoạt mà không sợ bai dão sau khi giặt. Dễ dàng kết hợp với áo croptop hoặc áo sơ mi kiểu.",
    variants: [
      {
        variantName: "Xanh đậm - S",
        price: 480000,
        stockQuantity: 50,
        sku: "JEAN-LOE-XDAM-S",
        weightGrams: 480,
        valueIds: [21, 11], // Size S (21), Color Xanh đậm (11)
        imageUrl: SAMPLE_IMAGES[10]
      },
      {
        variantName: "Đen - M",
        price: 480000,
        stockQuantity: 50,
        sku: "JEAN-LOE-DEN-M",
        weightGrams: 490,
        valueIds: [1, 6], // Size M (1), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[11]
      }
    ]
  },

  // 7. Quần short kaki nam túi hộp
  {
    name: "Quần Short Kaki Nam Túi Hộp Đa Năng Phong Cách Safari",
    categoryId: 7, // Quần short
    brand: "DIRTYCOINS",
    description: "Quần soóc kaki dày dặn thiết kế túi hộp hai bên hông tiện dụng để ví, chìa khóa hoặc điện thoại, đậm chất dạo phố năng động. Lưng thun co giãn phía sau kết hợp đỉa cài thắt lưng giúp người mặc tùy chỉnh độ ôm vừa vặn theo ý muốn. Vải kaki wash mềm, không cọ xát gây rát da khi hoạt động ngoài trời.",
    variants: [
      {
        variantName: "Be - M",
        price: 290000,
        stockQuantity: 60,
        sku: "SHORT-BOX-BE-M",
        weightGrams: 310,
        valueIds: [1, 7], // Size M (1), Color Be (7)
        imageUrl: SAMPLE_IMAGES[12]
      },
      {
        variantName: "Đen - L",
        price: 290000,
        stockQuantity: 60,
        sku: "SHORT-BOX-DEN-L",
        weightGrams: 320,
        valueIds: [2, 6], // Size L (2), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[13]
      }
    ]
  },

  // 8. Quần short thể thao 2 lớp
  {
    name: "Quần Short Thể Thao Nam 2 Lớp Chạy Bộ Tập Gym Co Giãn",
    categoryId: 7, // Quần short
    brand: "REEBOK",
    description: "Quần đùi chạy bộ thiết kế 2 lớp chuyên dụng: lớp ngoài là vải gió siêu nhẹ thoáng khí có xẻ tà tăng tầm vận động, lớp lót trong thun co giãn ôm đùi chống trầy xước và hỗ trợ cơ bắp khi chạy bộ hoặc nâng tạ. Trang bị túi zip khóa kéo tiện lợi phía sau và dải phản quang an toàn khi tập luyện vào ban đêm.",
    variants: [
      {
        variantName: "Xám - L",
        price: 240000,
        stockQuantity: 55,
        sku: "SHORT-GYM-XAM-L",
        weightGrams: 220,
        valueIds: [2, 10], // Size L (2), Color Xám (10)
        imageUrl: SAMPLE_IMAGES[14]
      },
      {
        variantName: "Đen - XL",
        price: 240000,
        stockQuantity: 55,
        sku: "SHORT-GYM-DEN-XL",
        weightGrams: 230,
        valueIds: [3, 6], // Size XL (3), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[15]
      }
    ]
  },

  // 9. Áo blazer nam
  {
    name: "Áo Khoác Blazer Nam Công Sở 2 Khuy Cổ Điển Lịch Lãm",
    categoryId: 4, // Áo khoác
    brand: "ADAM STORE",
    description: "Áo vest blazer nam may đo chuẩn form theo phom dáng người Việt, đệm vai nhẹ tự nhiên tạo vẻ bệ vệ và chỉn chu. Vải dạ pha sợi poly cao cấp giữ nếp phẳng, bề mặt vải lì không bám bụi. Bên trong lót lụa cao cấp êm ái cùng hệ thống túi ngực tiện dụng. Hoàn hảo khi kết hợp với áo sơ mi và quần âu trong các buổi đàm phán hoặc sự kiện.",
    variants: [
      {
        variantName: "Navy - L",
        price: 850000,
        stockQuantity: 30,
        sku: "BLAZER-NAVY-L",
        weightGrams: 650,
        valueIds: [2, 22], // Size L (2), Color Navy (22)
        imageUrl: SAMPLE_IMAGES[16]
      },
      {
        variantName: "Đen - XL",
        price: 850000,
        stockQuantity: 30,
        sku: "BLAZER-DEN-XL",
        weightGrams: 670,
        valueIds: [3, 6], // Size XL (3), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[17]
      }
    ]
  },

  // 10. Cardigan len nữ
  {
    name: "Áo Khoác Cardigan Len Nữ Dệt Kim Thừng Dáng Rộng Dày Dặn",
    categoryId: 4, // Áo khoác
    brand: "MIXXO",
    description: "Áo khoác len cardigan dệt kiểu vặn thừng dày dặn mang phong cách vintage ấm áp. Chất len sợi hữu cơ không bai xù, giữ ấm tuyệt đối trong thời tiết se lạnh đầu đông. Thiết kế cổ chữ V sâu phối hàng cúc bản to mạ đồng cổ kính, vạt áo bo gấu dày dặn. Thích hợp khoác ngoài váy hoa nhí hoặc áo cổ lọ.",
    variants: [
      {
        variantName: "Be - S",
        price: 420000,
        stockQuantity: 40,
        sku: "CARD-LEN-BE-S",
        weightGrams: 450,
        valueIds: [21, 7], // Size S (21), Color Be (7)
        imageUrl: SAMPLE_IMAGES[18]
      },
      {
        variantName: "Trắng - M",
        price: 420000,
        stockQuantity: 40,
        sku: "CARD-LEN-TRANG-M",
        weightGrams: 460,
        valueIds: [1, 5], // Size M (1), Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[19]
      }
    ]
  },

  // 11. Đầm xòe cổ vuông dự tiệc
  {
    name: "Đầm Xòe Nữ Cổ Vuông Tay Phồng Dự Tiệc Duyên Dáng",
    categoryId: 8, // Váy / Đầm
    brand: "ELISE",
    description: "Thiết kế đầm xòe cổ vuông thanh thoát khoe trọn xương quai xanh quyến rũ, kết hợp phần tay phồng nhẹ nhàng tạo cảm giác quý phái, đài các. Thân váy may 2 lớp với chất liệu tơ voan óng ánh bề mặt và lót habutai mềm mượt bên trong. Khóa kéo giọt nước chìm lưng tinh tế. Phù hợp cho những buổi tiệc nhẹ, hẹn hò hoặc dạo phố cuối tuần.",
    variants: [
      {
        variantName: "Đỏ - S",
        price: 650000,
        stockQuantity: 35,
        sku: "DAM-XOE-DO-S",
        weightGrams: 350,
        valueIds: [21, 8], // Size S (21), Color Đỏ (8)
        imageUrl: SAMPLE_IMAGES[20]
      },
      {
        variantName: "Trắng - M",
        price: 650000,
        stockQuantity: 35,
        sku: "DAM-XOE-TRANG-M",
        weightGrams: 360,
        valueIds: [1, 5], // Size M (1), Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[21]
      }
    ]
  },

  // 12. Váy yếm kaki
  {
    name: "Váy Yếm Kaki Nữ Dáng Suông Phối Túi Trước Trẻ Trung",
    categoryId: 8, // Váy / Đầm
    brand: "GUMAC",
    description: "Váy yếm kaki dáng suông cá tính mang phong cách dạo phố trẻ trung. Chất liệu vải kaki thun dệt chéo dày dặn vừa phải, không bai dão. Dây yếm có khuy kim loại cài chắc chắn và có thể điều chỉnh độ dài linh hoạt theo chiều cao. Phía trước ngực có túi ốp rộng rãi. Dễ dàng mix cùng áo thun ngắn tay hoặc áo len tăm bên trong.",
    variants: [
      {
        variantName: "Be - S",
        price: 310000,
        stockQuantity: 45,
        sku: "YEM-BE-S",
        weightGrams: 380,
        valueIds: [21, 7], // Size S (21), Color Be (7)
        imageUrl: SAMPLE_IMAGES[22]
      },
      {
        variantName: "Đen - M",
        price: 310000,
        stockQuantity: 45,
        sku: "YEM-DEN-M",
        weightGrams: 390,
        valueIds: [1, 6], // Size M (1), Color Đen (6)
        imageUrl: SAMPLE_IMAGES[23]
      }
    ]
  },

  // 13. Pijama lụa satin
  {
    name: "Bộ Đồ Ngủ Pijama Lụa Satin Dài Tay Cao Cấp Sang Trọng",
    categoryId: 9, // Đồ lót & Đồ ngủ
    brand: "VICTORIA",
    description: "Bộ pijama mặc nhà may từ chất liệu lụa satin thượng hạng mềm mướt như làn mây, mang đến cảm giác thư thái và nâng niu làn da sau ngày dài làm việc. Đường viền may nẹp cẩn thận dọc cổ áo và gấu tay. Quần cạp chun co giãn êm ái, không hằn siết lên bụng. Đường may đôi chắc chắn, giặt không xù lông hay bay màu.",
    variants: [
      {
        variantName: "Xanh ngọc - M",
        price: 380000,
        stockQuantity: 50,
        sku: "PIJAMA-XNGOC-M",
        weightGrams: 300,
        valueIds: [1, 13], // Size M (1), Color Xanh ngọc (13)
        imageUrl: SAMPLE_IMAGES[24]
      },
      {
        variantName: "Tím - L",
        price: 380000,
        stockQuantity: 50,
        sku: "PIJAMA-TIM-L",
        weightGrams: 310,
        valueIds: [2, 9], // Size L (2), Color Tím (9)
        imageUrl: SAMPLE_IMAGES[25]
      }
    ]
  },

  // 14. Giày sneaker đệm khí
  {
    name: "Giày Sneaker Thể Thao Cổ Thấp Đế Đệm Khí Trợ Lực Êm Ái",
    categoryId: 10, // Giày dép
    brand: "BITIS HUNTER",
    description: "Giày sneaker phong cách đường phố với thân giày dệt công nghệ sợi bay thoáng khí tối ưu, ôm sát bàn chân mà không gây hầm bí. Phần đế giữa tích hợp đệm khí trợ lực đàn hồi cao giúp phân bổ đều trọng lượng cơ thể và giảm chấn thương khi vận động liên tục. Mặt đế cao su chống trượt với các rãnh bám sâu an toàn trong mọi điều kiện thời tiết.",
    variants: [
      {
        variantName: "Trắng",
        price: 690000,
        stockQuantity: 40,
        sku: "SNK-AIR-TRANG",
        weightGrams: 750,
        valueIds: [5], // Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[26]
      },
      {
        variantName: "Đen",
        price: 690000,
        stockQuantity: 40,
        sku: "SNK-AIR-DEN",
        weightGrams: 750,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[27]
      }
    ]
  },

  // 15. Balo laptop chống nước
  {
    name: "Balo Laptop Chống Nước Đa Năng Có Cổng Sạc USB Thông Minh",
    categoryId: 11, // Túi xách & Balo
    brand: "TIGERNU",
    description: "Balo thời trang công sở và du lịch tích hợp ngăn đệm chống sốc dày bảo vệ máy tính xách tay an toàn trước các va đập. Vải Oxford mật độ cao trượt nước hoàn hảo, ngăn thấm nước khi gặp mưa rào bất chợt. Quai đeo trợ lực hình chữ S ôm sát vai kết hợp đệm lưng thoát khí tổ ong tạo cảm giác nhẹ nhàng khi đeo lâu. Trang bị cổng cáp sạc USB tiện dụng bên hông.",
    variants: [
      {
        variantName: "Xám",
        price: 420000,
        stockQuantity: 50,
        sku: "BALO-LAP-XAM",
        weightGrams: 680,
        valueIds: [10], // Color Xám (10)
        imageUrl: SAMPLE_IMAGES[28]
      },
      {
        variantName: "Đen",
        price: 420000,
        stockQuantity: 50,
        sku: "BALO-LAP-DEN",
        weightGrams: 680,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[29]
      }
    ]
  },

  // 16. Túi xách nữ đeo chéo
  {
    name: "Túi Xách Nữ Đeo Chéo Khóa Kim Loại Mạ Vàng Dáng Hộp",
    categoryId: 11, // Túi xách & Balo
    brand: "CHARLES KEITH",
    description: "Túi xách đeo chéo thiết kế dáng hộp cứng cáp sang trọng làm từ chất liệu da PU vi sợi cao cấp vân chìm tinh xảo, chống trầy xước và dễ vệ sinh lau chùi. Nắp gập phối khóa bấm kim loại mạ sáng bóng chống gỉ sét. Dây đeo phối xích kim loại và đoạn đệm vai êm ái, có thể tùy chỉnh độ dài để đeo vai hoặc đeo chéo linh hoạt.",
    variants: [
      {
        variantName: "Trắng",
        price: 490000,
        stockQuantity: 40,
        sku: "TUI-HOP-TRANG",
        weightGrams: 420,
        valueIds: [5], // Color Trắng (5)
        imageUrl: SAMPLE_IMAGES[30]
      },
      {
        variantName: "Đen",
        price: 490000,
        stockQuantity: 40,
        sku: "TUI-HOP-DEN",
        weightGrams: 420,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[31]
      }
    ]
  },

  // 17. Mũ bucket vải canvas
  {
    name: "Mũ Bucket Nón Tai Bèo Hai Mặt Vải Cotton Canvas Dày Dặn",
    categoryId: 12, // Mũ & Nón
    brand: "KANGOL",
    description: "Mũ bucket phong cách hip-hop năng động may từ vải canvas 100% cotton sợi dày dặn, thấm hút mồ hôi và che nắng toàn diện cho khuôn mặt và gáy. Thiết kế thông minh cho phép đội được cả 2 mặt tiện lợi. Vành nón may nhiều đường chỉ chần gia cố giữ form đứng, không bị rũ gãy khi gặp gió lớn. Có thể gấp gọn cất vào túi xách hoặc balo.",
    variants: [
      {
        variantName: "Be",
        price: 180000,
        stockQuantity: 60,
        sku: "BUCKET-BE",
        weightGrams: 110,
        valueIds: [7], // Color Be (7)
        imageUrl: SAMPLE_IMAGES[32]
      },
      {
        variantName: "Đen",
        price: 180000,
        stockQuantity: 60,
        sku: "BUCKET-DEN",
        weightGrams: 110,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[33]
      }
    ]
  },

  // 18. Thắt lưng da bò thật
  {
    name: "Thắt Lưng Nam Da Bò Thật Khóa Tự Động Hợp Kim Cao Cấp",
    categoryId: 13, // Thắt lưng & Phụ kiện
    brand: "LEATHERMAN",
    description: "Dây nịt nam chế tác từ da bò nguyên tấm 2 lớp dẻo dai, càng dùng lâu bề mặt da càng bóng đẹp tự nhiên mà không lo nứt gãy hay bong tróc. Mặt khóa làm từ hợp kim đúc nguyên khối mạ titan chống xước, cơ chế khóa răng cưa tự động thông minh giúp điều chỉnh độ dài dây chính xác đến từng milimet mà không cần bấm lỗ thủ công.",
    variants: [
      {
        variantName: "Đen",
        price: 320000,
        stockQuantity: 70,
        sku: "BELT-AUTO-DEN",
        weightGrams: 200,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[34]
      },
      {
        variantName: "Bạc",
        price: 320000,
        stockQuantity: 70,
        sku: "BELT-AUTO-BAC",
        weightGrams: 200,
        valueIds: [20], // Color Bạc (20)
        imageUrl: SAMPLE_IMAGES[35]
      }
    ]
  },

  // 19. Kính mát UV400
  {
    name: "Kính Mát Thời Trang Gọng Vuông Chống Tia UV400 Polarized",
    categoryId: 15, // Kính mắt
    brand: "RAYBAN",
    description: "Kính râm gọng vuông phong cách unisex hiện đại, tròng kính phân cực Polarized chuẩn UV400 cản 99% tia cực tím có hại và chống chói lóa hiệu quả khi lái xe dưới trời nắng gắt. Gọng kính làm từ chất liệu nhựa Acetate siêu bền nhẹ, có cốt kim loại gia cường bên trong càng kính. Bản lề chốt 3 chân chắc chắn, êm ái khi đóng mở.",
    variants: [
      {
        variantName: "Đen",
        price: 350000,
        stockQuantity: 55,
        sku: "KINH-MAT-DEN",
        weightGrams: 80,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[36]
      },
      {
        variantName: "Bạc",
        price: 350000,
        stockQuantity: 55,
        sku: "KINH-MAT-BAC",
        weightGrams: 80,
        valueIds: [20], // Color Bạc (20)
        imageUrl: SAMPLE_IMAGES[37]
      }
    ]
  },

  // 20. Đồng hồ quartz sapphire
  {
    name: "Đồng Hồ Nam Dây Da Quartz Chống Nước Mặt Kính Sapphire",
    categoryId: 16, // Đồng hồ
    brand: "CASIO",
    description: "Đồng hồ đeo tay phong cách tối giản lịch lãm dành cho phái mạnh. Mặt kính sapphire nguyên khối chống trầy xước vượt trội trước các va quẹt thường ngày. Bộ máy Quartz chuẩn xác từ Nhật Bản hoạt động bền bỉ, tiết kiệm năng lượng. Khả năng chống nước 5ATM an tâm rửa tay, đi mưa. Dây da dập vân cá sấu may chỉ viền tinh xảo, mềm mại khi đeo.",
    variants: [
      {
        variantName: "Đen",
        price: 890000,
        stockQuantity: 30,
        sku: "WATCH-CLASSIC-DEN",
        weightGrams: 120,
        valueIds: [6], // Color Đen (6)
        imageUrl: SAMPLE_IMAGES[38]
      },
      {
        variantName: "Bạc",
        price: 890000,
        stockQuantity: 30,
        sku: "WATCH-CLASSIC-BAC",
        weightGrams: 120,
        valueIds: [20], // Color Bạc (20)
        imageUrl: SAMPLE_IMAGES[39]
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

export async function addBatchProducts(productsToAdd = twentyProducts) {
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

if (process.argv[1]?.endsWith('add_20_products_40_variants.mjs')) {
  addBatchProducts().catch(console.error);
}
