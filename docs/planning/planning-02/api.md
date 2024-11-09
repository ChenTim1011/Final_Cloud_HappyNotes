### 目前功能需要的 API 列表

### **白板相關 API (Whiteboard)**

1. **GET /api/whiteboards/**
    - **描述**: 根據白板 ID 獲取單個白板的詳細訊息。
    - **輸出**: 返回單個白板的 `_id`、`title`、`position` 和 `cards`（卡片 ID 列表）。
2. **POST /api/whiteboards**
    - **描述**: 建立新白板，並在資料庫中保存其位置和名稱。
    - **輸入**: 包含 `title` 和 `position`（`x`、`y` 坐標）。
    - **輸出**: 返回建立的白板詳細訊息（包括 ID）。
3. **PUT /api/whiteboards/**
    - **描述**: 更新白板的位置或名稱。
    - **輸入**: `title` 或 `position`（`x`、`y` 坐標）。
    - **輸出**: 返回更新後的白板訊息。
4. **DELETE /api/whiteboards/**
    - **描述**: 刪除指定 ID 的白板，並刪除所有關聯的卡片。
    - **輸出**: 成功或失敗的訊息。
  
### **卡片相關 API (Card)**

1. **GET /api/whiteboards/cards**
    - **描述**: 根據白板 ID 獲取該白板中的所有卡片。
    - **輸出**: 返回所有卡片的 `_id`、`content`、`position` 等訊息。
2. **POST /api/whiteboards/cards**
    - **描述**: 在指定白板中建立新卡片。
    - **輸入**: `content`（卡片內容）和 `position`（`x`、`y` 坐標）。
    - **輸出**: 返回建立的卡片詳細訊息。
3. **PUT /api/cards/**
    - **描述**: 更新卡片的內容或位置。
    - **輸入**: `content` 或 `position`（`x`、`y` 坐標）。
    - **輸出**: 返回更新後的卡片詳細訊息。
4. **DELETE /api/cards/**
    - **描述**: 刪除指定 ID 的卡片。
    - **輸出**: 成功或失敗的訊息。

### **卡片操作 API (Card Manipulation)**

1. **POST /api/cards/:cardId/duplicate**
    - **描述**: 複製指定的卡片並建立新卡片。
    - **輸入**: `cardId`（卡片 ID）。
    - **輸出**: 返回新建立的卡片詳細訊息。
2. **PUT /api/cards/:cardId/resize**
    - **描述**: 更新指定卡片的大小。
    - **輸入**: `width` 和 `height`（新尺寸）。
    - **輸出**: 返回更新後的卡片詳細訊息。
3. **PUT /api/cards/:cardId/move**
    - **描述**: 移動指定的卡片至新位置。
    - **輸入**: `x` 和 `y`（新位置坐標）。
    - **輸出**: 返回更新後的卡片詳細訊息。
4. **PUT /api/cards/:cardId/lock**
    - **描述**: 鎖定或解鎖指定的卡片。
    - **輸入**: `locked`（布爾值，表示是否鎖定）。
    - **輸出**: 返回更新後的卡片狀態。
5. **PUT /api/cards/:cardId/pin**
    - **描述**: 標記或取消標記指定的卡片。
    - **輸入**: `pinned`（布爾值，表示是否標記）。
    - **輸出**: 返回更新後的卡片詳細訊息。

### **文本編輯功能 API (Text Editing)**

1. **PUT /api/cards/:cardId/content**
    - **描述**: 更新卡片的文本內容。
    - **輸入**: `content`（新文本內容）。
    - **輸出**: 返回更新後的卡片內容。
2. **PUT /api/cards/:cardId/format**
    - **描述**: 更改卡片文本的格式，例如標題、清單、字體樣式等。
    - **輸入**: `style`（包含標題、清單、字體等格式的參數）。
    - **輸出**: 返回更新後的格式化文本內容。
3. **POST /api/cards/:cardId/insert-link**
    - **描述**: 在文本中插入超連結。
    - **輸入**: `url`（超連結網址）和 `text`（顯示文字）。
    - **輸出**: 返回更新後的卡片內容。
4. **PUT /api/cards/:cardId/code-block**
    - **描述**: 將文本格式更改為程式碼區塊。
    - **輸入**: `language`（程式碼語言）。
    - **輸出**: 返回更新後的卡片內容。
5. **PUT /api/cards/:cardId/markdown**
    - **描述**: 支援 Markdown 格式轉換，將普通文本轉換為 Markdown 格式。
    - **輸入**: `markdownContent`（Markdown 格式內容）。
    - **輸出**: 返回轉換後的內容。

### **卡片管理 API (Card Management)**

1. **POST /api/cards//tag**
    - **描述**: 將標籤新增至指定卡片。
    - **輸入**: `tag`（標籤名稱）。
    - **輸出**: 返回更新後的卡片標籤資訊。
2. **DELETE /api/cards//tag**
    - **描述**: 移除指定卡片的特定標籤。
    - **輸入**: `tag`（標籤名稱）。
    - **輸出**: 成功或失敗的訊息。
3. **GET /api/cards/search**
    - **描述**: 根據關鍵字搜尋符合的卡片。
    - **輸入**: `keyword`（關鍵字）。
    - **輸出**: 返回匹配卡片的列表，包括 `_id`、`content` 等。
4. **PUT /api/cards//sort**
    - **描述**: 對指定白板內的卡片進行排序。
    - **輸入**: `sortBy`（排序條件，例如 `created_at` 或 `title`）。
    - **輸出**: 返回排序後的卡片列表。  

### **登入登出 API (Authentication)**

1. **POST /api/auth/login**
    - **描述**: 使用帳號密碼登入。
    - **輸入**: `username`、`password`。
    - **輸出**: 返回用戶資訊和認證 token。
2. **POST /api/auth/register**
    - **描述**: 註冊新帳號。
    - **輸入**: `username`、`password`、`email`。
    - **輸出**: 成功註冊的訊息。
3. **POST /api/auth/logout**
    - **描述**: 登出當前用戶。
    - **輸出**: 成功或失敗的訊息。
4. **POST /api/auth/reset-password**
    - **描述**: 請求密碼重置。
    - **輸入**: `email`。
    - **輸出**: 發送重置密碼郵件的訊息。
5. **POST /api/auth/auto-login**
    - **描述**: 使用保存的認證資訊自動登入。
    - **輸入**: `token`（可選，根據保存狀態）。
    - **輸出**: 返回用戶資訊。

### **PDF 功能 API (PDF Features)**

1. **POST /api/cards/export-pdf**
    - **描述**: 將指定卡片內容匯出為 PDF。
    - **輸出**: PDF 文件下載鏈接或文件。
2. **POST /api/pdf/import**
    - **描述**: 將 PDF 嵌入至白板，成為一個新的卡片。
    - **輸入**: `pdfFile`（PDF 文件）。
    - **輸出**: 返回新卡片的詳細訊息。
3. **POST /api/pdf/annotate**
    - **描述**: 對 PDF 內容進行註記或做筆記。
    - **輸入**: `annotations`（註記內容，包含位置和文字）。
    - **輸出**: 返回包含註記的更新後的 PDF。

### **延伸功能 API (Advanced Features)**

1. **POST /api/cards/version**
    - **描述**: 建立卡片的版本記錄，保存當前狀態。
    - **輸出**: 返回版本 ID 和建立時間。
2. **GET /api/cards/versions**
    - **描述**: 獲取指定卡片的版本歷史。
    - **輸出**: 返回版本列表，包括版本 ID 和時間戳。
3. **PUT /api/cards/version/**
    - **描述**: 恢復卡片到指定的版本。
    - **輸入**: `versionId`（版本 ID）。
    - **輸出**: 返回恢復後的卡片內容。
4. **POST /api/whiteboards/collaborate**
    - **描述**: 建立或加入一個共同編輯白板會話。
    - **輸入**: `boardId`（白板 ID）、`userId`。
    - **輸出**: 返回協作會話訊息。
5. **PUT /api/cards/remote-edit**
    - **描述**: 支援遠端即時編輯卡片。
    - **輸入**: `content`（更新內容）。
    - **輸出**: 返回即時更新後的卡片內容。

