const fs = require('fs');

function categorizeContent(contents) {
    const categories = {};
    // 强化匹配规则：必须以"我要爆料"开头，且包含完整大学名称
    const pattern = /^我要爆料[：\s]*([^\s]+大学)/; // 支持中文冒号和空格
    
    contents.forEach(content => {
        const firstLine = content.split('\n')[0];
        const match = pattern.exec(firstLine);
        if (match && match[1]) {
            const university = match[1]
                .replace(/[^\u4e00-\u9fa5]/g, '') // 过滤非汉字字符
                .replace(/大学$/, '') + '大学';    // 确保以"大学"结尾
            
            if (!categories[university]) {
                categories[university] = [];
            }
            // 保留原始内容，但去除爆料前缀
            const cleanContent = content.replace(pattern, university + '：');
            categories[university].push(cleanContent);
        }
    });

    return categories;
}
function saveToFile(data, filename) {
    fs.writeFileSync(filename, JSON.stringify(data, null, 4), 'utf-8');
}

if (require.main === module) {
    const contents = JSON.parse(process.argv[2]);
    const categorizedContents = categorizeContent(contents);
    saveToFile(categorizedContents, 'categorized_contents.json');
    console.log("分类结果已保存到 categorized_contents.json 文件中");
}// JavaScript source code
module.exports = {
  categorizeContent,
  saveToFile
};
