# Group7 Final Project - HappyNote



## Demo Video

[![Demo videol](https://img.youtube.com/vi/52FKj3UIpSw/0.jpg)](https://www.youtube.com/watch?v=52FKj3UIpSw)



### 小組作業連結 : [Planning](https://github.com/ChenTim1011/Final_HappyNotes/tree/main/docs/planning)

## Project Description

當前市面上的許多筆記軟體大多是傳統的層層資料夾管理方式。而我們想開發基於卡片和白板的設計，
能將學習內容拆解為各個知識卡片，並全部展現在一個版面上，讓不同的卡片彼此連結，激發更多想法。我們非常喜歡這樣的知識管理方式。
然而，像 Heptabase 這樣的軟體需要付費。我們在想，能不能開發一個免費版本，雖然功能不會那麼全面，但可以實現核心功能，並客製化我們想要的功能。

## Project Information

- **Meeting Time**: Every Saturday 10:00 a.m.
- **Project management**: [Trello](https://trello.com/invite/b/67033f60a26893dfa64c5d10/ATTI7e6091e4ec54997cf3b21f247b1f34b13114AF69/cloud-group-7)

<br>
<details>
  <summary>Team Member</summary>
  
- 資訊四 陳睿廷 組長

- 資訊碩一 蘇廷翔

- 資訊四 陳鎮成

- 資訊二 柯智鈞
  
</details><br>

<details>
  <summary>Team consensus</summary>

   ### 1. 技術選型
  - **前端建立工具**：Vite
  - **前端 UI 工具**：[shadcn/ui](https://ui.shadcn.com/)
  - **前端技術**：HTML、CSS、JavaScript、React
  -   **後端技術**：Node.js、Express、Nginx
-   **資料庫**：MongoDB（大家想嘗試看看）


  ### 2. 決定 repo 是其他人 fork 出去

  ### 3. 統一使用 merge 合併

  ### 4. Git Branching Model

我們決定採用以下分支模式：

  主要分支：main (穩定版本)，develop (開發中功能)

  功能分支：從 develop 開分支開發新功能，完成後合併回 develop。

  發佈分支：從 develop 開分支，準備新版本的發佈。

  修補分支：從 main 開分支用於緊急修復，修復後合併至 main 和 develop。
  
  開發時先 main，develop，feature 三個分支為主 


### 5. Commit 規範
  
- `feat`: 新功能
- `fix`: 修補 bug
- `refactor`: 重構，不涉及功能或 bug 修正
- `build`: 更改建置系統或外部依賴
- `chore`: 依賴更新，無關 src 或 test 文件修改
- `perf`: 改善效能
- `test`: 新增/更新測試
- `revert`: 還原先前的 commit
- `docs`: 文件更新
- `style`: 程式碼格式修正（如移除空白、調整縮排）

### 6. Coding Style

  ### 1. 縮排與行長

- **縮排**：使用 4 個空格。
- **行長**：保持每行 80 到 100 個字元。

### 2. 變數命名

- 使用駝峰命名法（camelCase），變數名稱應具語義。

```jsx
let totalCost = 0;
function calculateTotal() { /* ... */ }
```

### 3. 常數命名

- 使用大寫字母和底線命名常數。

```jsx
const MAX_LIMIT = 100;

```

### 4. 使用嚴格模式

- 在程式開頭使用 `"use strict";`。

```jsx
"use strict";

```

### 5. 使用 `const` 和 `let` 代替 `var`

- **const** 用於不可變變數，**let** 用於區域變數。

```jsx
const PI = 3.14;
let count = 0;

```

### 6. 分號

- 每行結尾都應加上分號。

```jsx
let x = 5;
let y = 10;

```

### 7. 函式定義

- 儘量使用箭頭函式 (arrow functions)，保持函式小而精簡。

```jsx
const add = (a, b) => a + b;

```

### 8. 陣列與物件

- 使用物件和陣列字面量定義。

```jsx
const person = {
  name: 'John',
  age: 30,
  city: 'New York'
};

const numbers = [1, 2, 3, 4, 5];

```

### 9. 條件判斷

- 使用嚴格相等符號 (`===`)。

```jsx
if (a === b) { /* ... */ }

```

### 10. 字串處理

- 儘量使用模板字串（Template Literals）。

```jsx
const name = 'Alice';
console.log(`Hello, ${name}!`);

```

### 11. 解構賦值

- 使用解構賦值提取物件或陣列的值。

```jsx
const { name, age } = person;
const [first, second] = numbers;

```

### 12. 註解

- 善用單行註解和多行註解來說明程式邏輯。

```jsx
// 單行註解
/* 多行註解 */

```

### 13. 避免巢狀過深

- 將過度巢狀的程式碼抽取為小函式，提升可讀性。

### 14. 錯誤處理

- 使用 `try/catch` 進行錯誤處理，避免崩潰。

```jsx
try {
  // 程式碼
} catch (error) {
  console.error(error);
}

```

  
</details>


