const data = require('./page/lanhu-mcp-assets/designs/fb8d01d5-25d5-4e4f-91af-35ba5ada9aaa_raw.json');
const popup = data.artboard.layers.find(l => l.name === '容器 2647');
const texts = popup.layers.filter(l => l.type === 'textLayer');
console.log('=== 设计稿中的关系选项 ===');
texts.forEach(t => {
  console.log('名称:', t.name, '| 位置:', JSON.stringify(t.frame));
});
