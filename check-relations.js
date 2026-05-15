const data = require('./page/lanhu-mcp-assets/designs/fb8d01d5-25d5-4e4f-91af-35ba5ada9aaa_raw.json');
const artboard = data.artboard;
const popup = artboard.layers.find(l => l.name === '容器 2647');

// 获取所有文本选项
const texts = popup.layers.filter(l => l.type === 'textLayer' && l.name !== '选择关系');
console.log('=== 设计稿中的关系选项 ===');
texts.forEach(t => {
  console.log('名称:', t.name, '| 位置:', JSON.stringify(t.frame), '| fontWeight:', t.text?.style?.font?.fontWeight);
});
