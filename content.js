// 创建浮动面板
const panel = document.createElement('div');
panel.className = 'template-panel';
document.body.appendChild(panel);

// 缩小/还原按钮
const toggleButton = document.createElement('button');
toggleButton.textContent = '—'; // 初始为缩小按钮
toggleButton.style.position = 'absolute';
toggleButton.style.top = '5px';
toggleButton.style.right = '5px';
toggleButton.style.background = 'transparent';
toggleButton.style.color = '#0078d4';
toggleButton.style.border = 'none';
toggleButton.style.fontSize = '16px';
toggleButton.style.cursor = 'pointer';
panel.appendChild(toggleButton);

// 保存模板按钮
const saveButton = document.createElement('button');
saveButton.textContent = '保存模板';
panel.appendChild(saveButton);

// 模板选择下拉菜单
const templateSelect = document.createElement('select');
const defaultOption = document.createElement('option');
defaultOption.textContent = '选择模板';
defaultOption.value = '';
templateSelect.appendChild(defaultOption);
panel.appendChild(templateSelect);

// 删除模板按钮
const deleteButton = document.createElement('button');
deleteButton.textContent = '删除模板';
deleteButton.style.background = '#dc3545';
deleteButton.disabled = true; // 初始禁用
panel.appendChild(deleteButton);

// 载入按钮
const loadButton = document.createElement('button');
loadButton.textContent = '载入模板';
loadButton.className = 'load-button';
loadButton.disabled = true; // 初始禁用
panel.appendChild(loadButton);

// 面板内容容器
const panelContent = document.createElement('div');
panelContent.appendChild(saveButton);
panelContent.appendChild(templateSelect);
panelContent.appendChild(deleteButton);
panelContent.appendChild(loadButton);
panel.appendChild(panelContent);

// 加载已保存模板到下拉菜单
function loadTemplates() {
  chrome.storage.local.get('templates', (result) => {
    const templates = result.templates || {};
    templateSelect.innerHTML = ''; // 清空下拉菜单
    templateSelect.appendChild(defaultOption.cloneNode(true));
    for (const name in templates) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      templateSelect.appendChild(option);
    }
  });
}

// 保存模板逻辑
saveButton.addEventListener('click', () => {
  const templateName = prompt('请输入模板名称：');
  if (templateName) {
    const inputs = document.querySelectorAll('input, textarea');
    const data = {};
    inputs.forEach(input => {
      if (input.name) {
        if (input.type === 'radio') {
          if (input.checked) {
            data[input.name] = input.value;
          }
        } else {
          data[input.name] = input.value;
        }
      }
    });
    chrome.storage.local.get('templates', (result) => {
      const templates = result.templates || {};
      templates[templateName] = data;
      chrome.storage.local.set({ templates }, () => {
        loadTemplates();
        alert('模板已保存！');
      });
    });
  }
});

// 选择模板时启用载入和删除按钮
templateSelect.addEventListener('change', () => {
  const selected = templateSelect.value !== '';
  loadButton.disabled = !selected;
  deleteButton.disabled = !selected;
});

// 删除模板逻辑
deleteButton.addEventListener('click', () => {
  const templateName = templateSelect.value;
  if (templateName && confirm(`确认删除模板 "${templateName}" 吗？`)) {
    chrome.storage.local.get('templates', (result) => {
      const templates = result.templates || {};
      delete templates[templateName];
      chrome.storage.local.set({ templates }, () => {
        loadTemplates();
        templateSelect.value = '';
        loadButton.disabled = true;
        deleteButton.disabled = true;
        alert('模板已删除！');
      });
    });
  }
});

// 点击载入按钮填充表单
loadButton.addEventListener('click', () => {
  const templateName = templateSelect.value;
  if (templateName) {
    chrome.storage.local.get('templates', (result) => {
      const templates = result.templates || {};
      const data = templates[templateName];
      if (data) {
        for (const key in data) {
          const input = document.querySelector(`input[name="${key}"], textarea[name="${key}"]`);
          if (input) {
            if (input.type === 'radio') {
              const radioInputs = document.querySelectorAll(`input[name="${key}"]`);
              radioInputs.forEach(radio => {
                if (radio.value === data[key]) {
                  radio.checked = true;
                }
              });
            } else {
              input.value = data[key];
            }
          }
        }
        alert('模板已载入！');
      }
    });
  }
});

// 缩小/还原面板
toggleButton.addEventListener('click', () => {
  if (panelContent.style.display === 'none') {
    panelContent.style.display = 'block';
    toggleButton.textContent = '—';
    panel.style.width = '240px';
  } else {
    panelContent.style.display = 'none';
    toggleButton.textContent = '+';
    panel.style.width = '40px';
  }
});

// 初始化加载模板
loadTemplates();    