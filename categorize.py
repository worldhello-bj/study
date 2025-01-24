import re
from collections import defaultdict
import json
import sys

def categorize_content(contents):
    categories = defaultdict(list)
    pattern = re.compile(r'^(.*大学)')

    for content in contents:
        first_line = content.split('\n')[0]
        match = pattern.match(first_line)
        if match:
            university = match.group(1)
            categories[university].append(content)
    
    return categories

def save_to_file(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    contents = json.loads(sys.argv[1])
    categorized_contents = categorize_content(contents)
    save_to_file(categorized_contents, 'categorized_contents.json')
    print("分类结果已保存到 categorized_contents.json 文件中")





