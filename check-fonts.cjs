const data = require('./page/lanhu-mcp-assets/designs/fb8d01d5-25d5-4e4f-91af-35ba5ada9aaa_raw.json');
const popup = data.artboard.layers.find(l => l.name === '容器 2647');
const texts = popup.layers.filter(l => l.type === 'textLayer' && l.name !== '选择关系');
console.log('=== 设计稿选项字体样式 ===');
texts.forEach(t => {
  if (t.text?.style?.font) {
    console.log(t.name + ':', JSON.stringify({
      fontSize: t.text.style.font.size,
      fontWeight: t.text.style.font.fontWeight,
      fontType: t.text.style.font.type,
      lineHeight: t.text.style.font.lineHeight,
      color: t.text.style.color
    }));
  }
});
