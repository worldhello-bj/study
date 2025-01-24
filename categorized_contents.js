const fs = require('fs');

function categorizeContent(contents) {
    const categories = {};
    const pattern = /^(.*��ѧ)/;

    contents.forEach(content => {
        const firstLine = content.split('\n')[0];
        const match = pattern.exec(firstLine);
        if (match) {
            const university = match[1];
            if (!categories[university]) {
                categories[university] = [];
            }
            categories[university].push(content);
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
    console.log("�������ѱ��浽 categorized_contents.json �ļ���");
}// JavaScript source code
