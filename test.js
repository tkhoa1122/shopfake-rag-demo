const text = 'Mình gợi ý vài món quần áo phù hợp để tập thể dục hằng ngày: | Sản phẩm | Giá | Đặc điểm | Tình trạng | |---|---:|---|---| | Quần Jogger thun thể thao nam | 259.000 VND | Thoải mái vận động | Còn 18 | | Áo croptop nữ tập gym yoga | 334.000 VND | Co giãn tối đa | Còn 66 |';
let processed = text.replace(/\\n/g, '\n');
processed = processed.replace(/\|\s+\|/g, '|\n|');
processed = processed.replace(/([^\n|])\s+(\|.*\|)/, '$1\n\n$2');
console.log(processed);
