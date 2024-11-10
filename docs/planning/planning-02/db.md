### 使用 NoSQL 的小組，也請去研究使用該種資料庫的 best practices<br>
#### best practices參考資料 : https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/<br>
  1. **MongoDB Schema 設計的重要性**：良好的 Schema 設計對於 MongoDB 資料庫的擴展性、效能和成本控制至關重要。MongoDB 的 Schema 設計與傳統關聯式資料庫不同，它強調根據應用需求設計 Schema，而非遵循固定的正規化模式。
  2. **嵌入 (Embedding) vs. 引用 (Referencing)**：
      - **嵌入**：適用於需要快速讀取、資料不會無限制增長的情況，可以在一個文件中取得所有相關資料，避免使用 `$lookup`。
      - **引用**：適合需要獨立查詢子文件、子文件數量可能過多的情境，使用 `$lookup` 操作類似於 SQL 的 JOIN。
  3. **常見資料關係模型**：
      - **一對一 (One-to-One)**：可使用嵌入模式。
      - **一對少 (One-to-Few)**：建議嵌入，適合存放小量關聯資料。
      - **一對多 (One-to-Many)**：依情況嵌入或引用，如果關聯數量龐大建議使用引用。
      - **一對極多 (One-to-Squillions)**：避免嵌入，建議使用引用，避免文件大小超過限制。
      - **多對多 (Many-to-Many)**：建議使用引用，能有效管理雙向關聯的資料量。
  4. **設計原則與規則**：
      - **規則 1**：優先考慮嵌入，除非有特殊需求。
      - **規則 2**：若需單獨查詢子文件，考慮使用引用。
      - **規則 3**：避免使用 `$lookup`，但在需要時不必害怕使用。
      - **規則 4**：避免無限制增長的陣列，若關聯數量大，應使用引用。
      - **規則 5**：Schema 設計應配合應用程式的查詢模式，以滿足查詢和更新需求。
  5. **總結**：MongoDB Schema 設計應根據具體應用的資料存取模式來決定，不拘泥於正規化。利用嵌入與引用的搭配，可以設計出符合需求的高效能 Schema。<br>
#### Schema設計:
前端、後端以及資料庫的命名規則是 smallcamelcase <br>
```js
// User Collection
{
    userName: { type: String, required: true },
    userPassword: { type: String, required: true },
    email: { type: String, required: true },
    whiteboards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Whiteboard' }],
    activityLog: [
        {
            logId: { type: mongoose.Schema.Types.ObjectId },
            action: { type: String }, // e.g., "new", "delete", "edit"
            timestamp: { type: Date, default: Date.now },
            entityType: { type: String }, // e.g., "card", "board"
            entityId: { type: mongoose.Schema.Types.ObjectId },
            detail: { type: String }
        }
    ],
    tags: [
        {
            tagName: { type: String },
            cardIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }]
        }
    ]
}
```
```js
// Whiteboard Collection
{
  whiteboardTitle: { type: String, default: "New Whiteboard" },
  isPrivate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  dimensions: {
    width: { type: Number, default: 200 },
    height: { type: Number, default: 150 },
  },

  cards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      default: [],
    },
  ], // reference to Card's _id , to store the many-to-many relation about cards.
}
```
```js
// Card Collection
{
    cardTitle: { type: String, default: "New Card" },
    content: { type: mongoose.Schema.Types.Mixed, default: "New Note" },
    dueDate: { type: Date, default: null },
    tag: { type: String, default: "" },
    foldOrNot: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    comments: { type: [String], default: [] }, // comment -> comments
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
    },
    dimensions: {
        width: { type: Number, default: 200 },
        height: { type: Number, default: 150 },
    },
    connection: [
        {
            toNoteId: mongoose.Schema.Types.ObjectId,
            position: Number, // 0:up, 1:right, 2:down, 3:left
        },
    ],
    connectionBy: [
        {
            toNoteId: mongoose.Schema.Types.ObjectId,
            position: Number, // 0:up, 1:right, 2:down, 3:left
        },
    ],
}
```
#### 設計說明

1. **User 集合**：包含使用者基本資料（名稱、密碼、email）以及活動紀錄。活動紀錄記錄了使用者對不同實體（如卡片、白板）的操作。
2. **WhiteBoard 集合**：代表白板的集合。`is_private` 表示白板的隱私狀態。`position` 用於設置白板的位置（x, y 座標）。每個白板可以有多張卡片，因此使用 `cards` 陣列引用卡片的 `_id`。
3. **Card 集合**：卡片為最小的單位，包含標題、內容、建立及更新時間、到期日期、標籤、摺疊狀態、位置（x, y 座標），以及卡片的長度和寬度。`comments` 嵌入在卡片裡面
4. **多對多關係**：白板與卡片之間為多對多關係，每個白板可以包含多張卡片，每張卡片也可同時存在於多個白板中，透過 `cards` 陣列的引用實現。

卡片之間為多對多關係

- 當您要建立兩張卡片的關聯時，您只需將對方的 `ObjectId` 添加到 `related_cards` 陣列中。
- 例如，如果 `Card A` 與 `Card B` 有關聯，則您可以將 `Card B` 的 `_id` 放入 `Card A` 的 `related_cards` 陣列，反之亦然。
- 這種方式適合卡片之間的關聯數量不多的情況。

#### 優缺點

- **優點**：直接在文件中建立關聯，查詢某張卡片的關聯卡片時只需要查詢一次。
- **缺點**：隨著關聯數量的增長，陣列可能會變得過大。若有非常多的關聯卡片，不建議使用這種方法。

#### 1. **嵌入與引用的選擇**

- **嵌入**：在 `activity_log` 和 `comments` 等欄位中，我們選擇嵌入的方式，這樣可以直接在查詢使用者或卡片時獲取相關操作紀錄或評論。嵌入的優點是可以減少查詢次數，使資料讀取更快速、直觀。
- **引用**：`boards` 與 `cards` 使用了引用來設置多對多關係，這樣每個白板可以包含多張卡片，而每張卡片也能同時屬於多個白板。引用的方式可以避免卡片在多個白板間被重複嵌入，減少冗餘並降低維護難度。

#### 2. **多對多關係的處理**

- 多對多關係在 MongoDB 中並不直接支持，因此在  whiteboard 和 `Card` 之間使用了引用的方式。這樣的設計不僅節省儲存空間，也避免了過多的資料重複。使用 `ObjectId` 來建立卡片和白板的關聯，讓這些關係靈活且可擴展，未來若要新增、移除卡片或變更其屬於的白板，只需更新對應的 `_id` 引用即可。

#### 3. **卡片的長度與寬度設計**

- 由於卡片的長寬是 Whiteboard 介面中調整的重要參數，因此我們特別將它設為 `dimensions` 欄位，用於儲存 `width` 和 `height`。這樣設計的目的是讓每張卡片都可以個別設定長寬，以滿足不同顯示需求。未來若要在前端實現自適應調整或動態渲染，這樣的結構可以提供彈性。

#### 4. **位置座標的設置**

- 每個白板和卡片都設置了 `position`（x, y 座標），這是因為這些物件需要在視覺化介面上進行位置管理。將位置資料保存在文件中，方便在白板上動態調整每個卡片的擺放和顯示。同時，位置資料的結構化存放可以在查詢或排序時更高效地獲取，適合用於地圖或白板應用中的視覺定位。

#### 5. **活動紀錄的嵌入**

- 在 `User` 文件中，我們使用嵌入的方式將 `activity_log` 記錄進來，這樣的設計是基於 MongoDB 單一文檔的 ACID 特性。這使得所有的活動記錄（例如卡片的建立、更新等）可以作為一個原子操作來保存，確保資料一致性，也方便查看每個使用者的完整操作歷史。