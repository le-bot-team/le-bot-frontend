const data = require('./page/lanhu-mcp-assets/designs/fb8d01d5-25d5-4e4f-91af-35ba5ada9aaa_raw.json');
const popup = data.artboard.layers.find(l => l.name === '容器 2647');

// 获取所有矩形（卡片）
const cards = popup.layers.filter(l => l.type === 'shapeLayer');
console.log('=== 设计稿卡片尺寸 ===');
cards.forEach(c => {
  console.log(c.name + ':', JSON.stringify({
    frame: c.frame,
    borderRadius: c.radius,
    border: c.style.borders,
    fill: c.style.fills
  }));
});
