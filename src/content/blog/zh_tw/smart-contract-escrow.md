---
title: "智慧合約託管如何保護您的 GPU 租賃付款"
description: "了解區塊鏈託管如何在 GPU 租賃期間保護您的資金。學習如何在鏈上驗證託管資金、爭議如何自動解決，以及為什麼程式碼比信任更可靠。"
excerpt: "傳統平台要求您信任他們來保管您的錢。智慧合約託管讓盜竊在技術上變得不可能。了解鏈上託管如何運作，以及如何自行驗證您的資金。"
pubDate: 2026-02-19
updatedDate: 2026-02-19
locale: "zh_tw"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/smart-contract-escrow-gpu-rental-hero.png"
heroImageAlt: "智慧合約代碼鎖圖示保護 GPU 租用者與提供者之間的加密貨幣付款，搭配區塊鏈驗證勾選標記和託管流程圖"
faq:
  - question: "什麼是 GPU 租賃的智慧合約託管？"
    answer: "智慧合約託管是一種基於區塊鏈的系統，在 GPU 租賃期間以程式碼持有您的付款。當您存入資金時，資金會鎖定在一個智慧合約中，無論是您、GPU 提供者還是平台都無法單方面存取。當租賃成功完成時，合約會自動將付款釋放給提供者；如果服務失敗，則將資金退還給您。與信任公司的傳統託管不同，智慧合約託管提供由區塊鏈共識執行的密碼學保證。"
  - question: "智慧合約託管與傳統平台託管有什麼不同？"
    answer: "傳統託管將您的資金存放在公司的銀行帳戶中——您信任他們不會偷竊、管理不善或遺失您的錢。智慧合約託管將資金存放在區塊鏈程式碼中，根據預定義的規則自動執行。即使平台想要存取託管資金，也無法這樣做。您可以使用區塊瀏覽器在鏈上驗證您的資金是否存在。不需要信任——只需要驗證可公開審計的程式碼。"
  - question: "我可以自行驗證我的託管資金嗎？"
    answer: "可以。每筆智慧合約託管交易都可以在 Polygonscan 等公開區塊瀏覽器上查看。您可以看到您的存款交易、確認資金已鎖定在託管合約地址中、查看合約程式碼，以及在租賃完成時監控付款釋放。這種透明度在傳統平台託管中是不可能的，因為您只能在網站上看到一個餘額數字，無法驗證實際的資金託管情況。"
  - question: "如果 GPU 提供者未能交付怎麼辦？"
    answer: "智慧合約託管包含爭議機制。如果提供者未能提供正常運作的 GPU 存取，合約可以自動偵測某些故障（連線逾時、正常運行時間違規）並退還資金。對於主觀爭議，合約可能包含仲裁機制或時間鎖定釋放，允許任一方在最終結算前提出爭議。具體的爭議流程取決於平台的合約實作。"
  - question: "智慧合約託管有風險嗎？"
    answer: "有，但風險不同於傳統託管。智慧合約漏洞可能會鎖定或暴露資金——這就是審計重要的原因。程式碼是不可變的，因此錯誤無法輕易修復。使用者錯誤（核准惡意合約、發送到錯誤地址）是不可逆的。然而，對於來自成熟平台的經過審計的合約，智慧合約託管通常比信任平台營運者託管資金提供更強的保護。"
---

當您在傳統 GPU 租賃平台上存入 50 美元時，那筆錢存放在平台的銀行帳戶中。您在儀表板上看到一個數字。您信任那個數字代表您稍後可以提取的實際美元。如果平台遭到駭客攻擊、破產或決定更改其服務條款，您的信任就是您和您的錢之間唯一的屏障。

智慧合約託管用可驗證的程式碼取代了那份信任。您的 50 美元 USDC 轉移到一個由程式控制的區塊鏈地址，無論是您、GPU 提供者還是平台營運者都無法操控。當租賃條件滿足時，資金會自動釋放。您可以自行驗證這一點——現在就在公開的區塊瀏覽器上——不需要任何人的許可或任何人的口頭保證。

本文將逐步說明智慧合約託管如何在 GPU 租賃中運作，包括如何在鏈上驗證您的資金，以及出問題時會發生什麼。

有關完整的 GPU 租賃流程（包括平台選擇和付款設定），請參閱我們的[使用加密貨幣租賃 GPU 的完整指南](/zh_tw/rent-gpu-with-crypto/)。

---

## 平台託管 vs 智慧合約託管：實際有什麼改變

了解這些託管模型之間的差異，可以釐清為什麼智慧合約提供更強的保證。

### 傳統平台託管

當您在 Vast.ai、RunPod 或大多數傳統平台上存入資金時：

**您的錢發生了什麼：**

1. 您發送付款（信用卡、加密貨幣、銀行轉帳）
2. 平台在其銀行帳戶或加密貨幣錢包中接收資金
3. 平台的資料庫記錄您的餘額
4. 您在網站上看到顯示的餘額
5. 當您租賃時，平台在內部扣減您的餘額
6. 當您提款時，平台從其帳戶中發送

**信任要求：**

| 風險     | 您信任平台會...      |
| -------- | -------------------- |
| 盜竊     | 不偷取您的資金       |
| 安全性   | 不被駭客入侵         |
| 償付能力 | 不會破產             |
| 誠實度   | 準確追蹤您的餘額     |
| 可用性   | 按需處理提款         |
| 政策     | 不會更改條款來損害您 |

**您可以驗證的：**

- 您的儀表板顯示一個餘額數字
- 就這樣

您無法獨立驗證：

- 是否有實際資金支撐那個數字
- 資金存放在哪裡
- 平台是否具有償付能力
- 其他用戶的餘額是否有保障

**歷史失敗案例：**

- FTX（2022年）：客戶資金被挪作他用，數十億美元損失
- Mt. Gox（2014年）：交易所遭駭，850,000 BTC 遺失
- 眾多較小的平台：詐騙跑路、駭客攻擊、資不抵債

平台託管在加密貨幣產業中已經反覆出現災難性的失敗。

### 智慧合約託管

當您在 GPUFlow 或類似的智慧合約平台上存入資金時：

**您的錢發生了什麼：**

1. 您核准託管合約存取您的 USDC
2. 您確認存款交易
3. USDC 從您的錢包轉移到合約地址
4. 合約在鏈上記錄租賃條款
5. 資金被鎖定——任何一方都無法單方面存取
6. 租賃完成後，合約將付款釋放給提供者
7. 未使用的資金自動退回您的錢包

**信任要求：**

| 風險         | 您信任的是...                                |
| ------------ | -------------------------------------------- |
| 程式碼正確性 | 合約按照其聲稱的方式運作（審計可解決此問題） |
| 區塊鏈安全性 | Polygon/Ethereum 網路正常運作                |
| 您自身的安全 | 您不會核准惡意交易                           |

**您可以驗證的：**

- 您在區塊瀏覽器上的存款交易
- 鎖定在託管合約中的確切金額
- 合約原始碼（如果已驗證）
- 通過合約的所有歷史交易
- 租賃完成時向提供者釋放的付款
- 未使用資金退回到您的錢包

**您不需要信任的：**

- 平台營運者的誠實度
- 平台的安全措施
- 平台的償付能力
- 平台的政策決定

### 根本差異

**平台託管：**「信任我們保管您的錢。」

**智慧合約託管：**「驗證控制您資金的程式碼。」

這不是哲學上的區別，而是具有實際安全影響的實質差異。

**情境：平台營運者變得惡意**

平台託管：

- 營運者可以提取所有客戶資金
- 用戶除了法律訴訟外別無追索途徑
- 追回資金的可能性很低，尤其是較小的金額

智慧合約託管：

- 營運者無法存取託管資金（程式碼阻止了這一點）
- 資金保持鎖定，直到釋放條件滿足
- 營運者的惡意行為無關緊要——程式碼無論如何都會執行

**情境：平台遭到駭客攻擊**

平台託管：

- 攻擊者提取熱錢包和客戶資料庫
- 所有資金都面臨風險
- 用戶損失一切

智慧合約託管：

- 攻擊者可能會入侵平台網站
- 但託管資金仍保留在合約中
- 只有個別用戶的核准才可能被利用（需要用戶操作）
- 正確託管的資金保持安全

![並排比較圖顯示平台託管通過公司銀行帳戶的流程及信任要求，與智慧合約託管通過鏈上程式碼的流程及驗證能力，突出信任公司與驗證程式碼之間的關鍵差異](../_images/platform-escrow-vs-smart-contract-escrow-comparison.png)

## GPU 租賃託管交易的解剖

讓我們精確追蹤使用智慧合約託管進行 GPU 租賃時鏈上發生的事情。了解這個流程可以揭開整個過程的神秘面紗。

### 階段 1：核准

在託管合約可以移動您的 USDC 之前，您必須先核准它。

**您看到的：**

MetaMask 彈出視窗：

```

權限請求
允許 GPUFlow Escrow 花費您的 USDC？

請求方：gpuflow.app
合約：0x7a3B...4f2D

[拒絕] [核准]

```

**鏈上發生的事情：**

1. 您點擊「核准」
2. 交易發送到 Polygon 上的 USDC 合約
3. USDC 合約記錄：「錢包 0xYour... 允許合約 0x7a3B... 轉移 USDC」
4. 此時沒有 USDC 移動——這只是權限授予

**在 Polygonscan 上，您會看到：**

```

Transaction: 0xabc123...
From: 0xYourWallet
To: 0x3c499c54... (USDC Contract)
Method: approve(spender, amount)

```

**為什麼需要這個步驟：**

ERC-20 代幣（如 USDC）在任何合約可以移動它們之前需要明確的核准。這是一個安全功能——合約無法在未經您許可的情況下提取您的錢包。

**安全提示：** 只核准您信任的合約。對惡意合約的無限額核准可能會耗盡您的代幣。GPUFlow 的合約已經過審計，但請務必確認您在合法的網站上。

### 階段 2：存入託管

核准後，您存入資金以開始租賃。

**您看到的：**

MetaMask 彈出視窗：

```

確認交易

存入 50 USDC 到 GPU 租賃託管
租賃：RTX 4090，提供者 0xProv...
時長：最長 10 小時

Gas 費用：0.02 MATIC（約 $0.02）

[拒絕] [確認]

```

**鏈上發生的事情：**

1. 您點擊「確認」
2. 交易發送到 GPUFlow 託管合約
3. 合約呼叫 USDC 合約，將 50 USDC 從您的錢包轉移到託管地址
4. 合約記錄租賃詳情：
   - 租用者：0xYourWallet
   - 提供者：0xProviderWallet
   - 金額：50 USDC
   - 開始時間：區塊時間戳
   - 租賃條款：GPU 規格、每小時費率、最長時長
5. 資金現在鎖定在合約中

**在 Polygonscan 上，您會看到：**

```

Transaction: 0xdef456...
From: 0xYourWallet
To: 0x7a3B...4f2D (GPUFlow Escrow)
Method: createRental(provider, amount, terms)
Value: 0 MATIC
Tokens Transferred: 50 USDC from 0xYour... to 0x7a3B...

```

**關鍵重點：** 這 50 USDC 現在在託管合約地址中。不在 GPUFlow 的錢包中。不在提供者的錢包中。在合約本身之中。

### 階段 3：進行中的租賃

您的資金已鎖定。GPU 租賃正在進行。

**正在發生的事情：**

- 您擁有 GPU 的 SSH/終端存取權限
- 租賃時長計時器正在運行
- 合約持有資金，等待完成訊號

**租賃期間沒有鏈上活動**（除非您按區塊付費，但出於 Gas 效率考量，大多數合約不會這樣實作）。

**託管合約正在做的：**

- 沒有主動做任何事——它是等待下一筆交易的程式碼
- 資金仍然鎖定在合約地址
- 任何一方都無法存取

### 階段 4：租賃完成

租賃透過您的操作（停止租賃）或時間到期而結束。

**您看到的：**

在 GPUFlow 儀表板上：「結束租賃」按鈕

MetaMask 彈出視窗：

```

確認交易

結束 GPU 租賃
時長：3 小時 27 分鐘
費用：$2.08（3.45 小時 × $0.60/小時）
退款：$47.92 USDC

Gas 費用：0.02 MATIC（約 $0.02）

[拒絕] [確認]

```

**鏈上發生的事情：**

1. 您點擊「確認」
2. 交易發送到託管合約
3. 合約計算：
   - 實際租賃時長
   - 基於每小時費率的費用
   - 應付給提供者的金額
   - 應退還給租用者的金額
4. 合約執行兩筆轉帳：
   - $2.08 USDC → 提供者錢包
   - $47.92 USDC → 您的錢包
5. 租賃在合約狀態中標記為完成

**在 Polygonscan 上，您會看到：**

```

Transaction: 0xghi789...
From: 0xYourWallet
To: 0x7a3B...4f2D (GPUFlow Escrow)
Method: completeRental(rentalId)
Tokens Transferred:

- 2.08 USDC from 0x7a3B... to 0xProvider...
- 47.92 USDC from 0x7a3B... to 0xYour...

```

**兩筆轉帳以原子方式發生：** 要嘛兩筆都成功，要嘛兩筆都不成功。合約無法在不退款給您的情況下向提供者付款，反之亦然。

### 完整流程

```

[您的錢包]
|
| 1. 核准 USDC 花費權限
v
[USDC 合約] 記錄核准
|
| 2. 存入 50 USDC 到託管
v
[託管合約] 持有 50 USDC，記錄租賃
|
| 3. 租賃進行中（無鏈上活動）
|
| 4. 完成租賃
v
[託管合約] 計算並釋放
|
+---> 2.08 USDC 到 [提供者錢包]
|
+---> 47.92 USDC 到 [您的錢包]

```

每個步驟都記錄在鏈上。每筆 USDC 的移動都是可驗證的。沒有您必須信任的資料庫條目——只有您可以自行驗證的區塊鏈狀態。

![逐步交易流程圖顯示 GPU 租賃託管的四個階段：核准交易、存款交易、進行中的租賃期間和完成交易與資金分配，每個階段顯示錢包地址和 USDC 移動](../_images/gpu-rental-escrow-transaction-flow-four-phases.png)

---

## 如何在 Polygonscan 上驗證您的託管資金

智慧合約託管的威力來自可驗證性。您不必相信任何人的話——您可以自行查看區塊鏈。本節將向您展示具體方法。

### 您需要的東西

- 您的錢包地址（來自 MetaMask）
- 託管合約地址（來自平台文件）
- 區塊瀏覽器（Polygon 網路使用 Polygonscan）

**GPUFlow 託管合約地址：** `0x7a3B...4f2D`（範例——請查看官方文件以取得實際地址）

### 步驟 1：找到您的存款交易

**方法 A：從您的錢包**

1. 開啟 MetaMask
2. 點擊「活動」標籤
3. 找到您的存款交易
4. 點擊交易以查看詳情
5. 點擊「在區塊瀏覽器上查看」
6. Polygonscan 開啟並顯示您的交易

**方法 B：直接從 Polygonscan**

1. 造訪 polygonscan.com
2. 在搜尋框中貼上您的錢包地址
3. 查看「交易」標籤
4. 找到標記有託管合約地址的交易
5. 點擊交易雜湊值以查看詳情

### 步驟 2：閱讀交易詳情

Polygonscan 上的存款交易顯示：

```

Transaction Hash: 0xdef456...
Status: Success ✓
Block: 52847291
Timestamp: Feb 18, 2026 14:32:05 UTC

From: 0xYourWallet...
To: 0x7a3B...4f2D (GPUFlow: Escrow Contract)
Value: 0 MATIC

Transaction Action:
Deposit 50 USDC for GPU Rental

Tokens Transferred:
From: 0xYourWallet...
To: 0x7a3B...4f2D
For: 50 USDC

```

**這確認了：**

- ✅ 交易成功（Status: Success）
- ✅ USDC 離開了您的錢包（From: 您的地址）
- ✅ USDC 進入了託管合約（To: 合約地址）
- ✅ 正確的金額已轉移（50 USDC）
- ✅ 時間戳永久記錄

### 步驟 3：驗證資金在託管合約中

現在確認託管合約實際持有您的資金。

1. 在 Polygonscan 上，前往託管合約地址（0x7a3B...4f2D）
2. 點擊「Contract」標籤
3. 點擊「Read Contract」
4. 找到類似 `getRentalDetails` 或 `escrowBalance` 的函式
5. 輸入您的租賃 ID 或錢包地址
6. 點擊「Query」
7. 查看返回的資料，顯示您的託管金額

**替代方法：查看合約的代幣餘額**

1. 在合約頁面上，點擊「Token Holdings」或類似選項
2. 查看合約持有的 USDC 總額
3. 這顯示的是總體託管金額，而非您特定的租賃
4. 您的租賃是這個總額的一部分

### 步驟 4：驗證合約程式碼

要進行完整驗證，請檢查實際的合約程式碼。

1. 在合約頁面上，點擊「Contract」標籤
2. 點擊「Code」子標籤
3. 如果已驗證，您會看到 Solidity 原始碼
4. 查找託管邏輯：

```solidity
// Simplified example of escrow release logic
function completeRental(uint256 rentalId) external {
    Rental storage rental = rentals[rentalId];
    require(msg.sender == rental.renter, "Only renter can complete");

    uint256 duration = block.timestamp - rental.startTime;
    uint256 cost = (duration * rental.hourlyRate) / 3600;
    uint256 refund = rental.depositAmount - cost;

    // Transfer cost to provider
    USDC.transfer(rental.provider, cost);

    // Refund remainder to renter
    USDC.transfer(rental.renter, refund);

    rental.completed = true;
}
```

**這段程式碼顯示：**

- 只有租用者可以觸發完成
- 時長根據區塊鏈時間戳計算
- 費用以數學方式計算（無人為裁量）
- 兩筆轉帳在同一筆交易中發生（原子性）
- 不可能有平台營運者介入

### 步驟 5：監控完成交易

當您的租賃結束時，驗證資金正確釋放。

1. 在您的錢包活動或 Polygonscan 中找到完成交易
2. 查看交易詳情：

```
Transaction Hash: 0xghi789...
Status: Success ✓

From: 0xYourWallet...
To: 0x7a3B...4f2D (GPUFlow: Escrow Contract)

Transaction Action:
  Complete GPU Rental #12345

Tokens Transferred:
  Transfer 1: 2.08 USDC from 0x7a3B... to 0xProvider...
  Transfer 2: 47.92 USDC from 0x7a3B... to 0xYourWallet...
```

**這確認了：**

- ✅ 提供者收到正確的付款（2.08 USDC）
- ✅ 您收到正確的退款（47.92 USDC）
- ✅ 所有資金已結算（2.08 + 47.92 = 50.00）
- ✅ 沒有資金卡在合約中

### 驗證清單

在任何託管交易後，請驗證：

- [ ] 交易狀態顯示「Success」
- [ ] 正確的金額離開了您的錢包（存款）
- [ ] 資金進入了託管合約地址（不是隨機錢包）
- [ ] 合約地址與官方文件一致
- [ ] 完成後，退款到達您的錢包
- [ ] 提供者付款 + 您的退款 = 原始存款

### 驗證證明了什麼

當您在 Polygonscan 上驗證時，您不是在信任：

| 傳統平台       | 智慧合約 + 驗證          |
| -------------- | ------------------------ |
| 平台的資料庫   | 區塊鏈狀態（不可變）     |
| 平台的誠實度   | 數學計算                 |
| 平台的償付能力 | 合約的實際代幣餘額       |
| 儀表板顯示     | 區塊瀏覽器（獨立第三方） |

**區塊鏈不會說謊。** 它做不到——交易經過密碼學簽名，並由數千個節點驗證。您在 Polygonscan 上看到的就是實際發生的事情。

![標註的 Polygonscan 截圖顯示託管存款交易的關鍵元素：交易雜湊值、成功狀態、發送/接收地址、代幣轉移金額和驗證勾選標記，附帶解釋性標籤](../_images/polygonscan-escrow-transaction-verification-annotated.png)

## 出問題時會怎樣：程式碼中的爭議解決

智慧合約託管自動處理順利的流程。但當 GPU 服務失敗、規格不符或任何一方行為不當時會怎樣？

### 自動故障偵測

某些故障可以在鏈上或通過預言機整合來偵測：

**基於逾時的保護：**

```solidity
// If rental not started within grace period, renter can cancel
function cancelUnstartedRental(uint256 rentalId) external {
    Rental storage rental = rentals[rentalId];
    require(msg.sender == rental.renter, "Only renter");
    require(!rental.started, "Rental already started");
    require(block.timestamp > rental.createdAt + GRACE_PERIOD, "Grace period active");

    // Full refund to renter
    USDC.transfer(rental.renter, rental.depositAmount);
    rental.cancelled = true;
}
```

**這處理了什麼：**

- 提供者接受了租賃但從未提供存取權限
- 租用者已存款但提供者消失
- 寬限期後自動全額退款（例如 30 分鐘）

**最長時限保護：**

```solidity
// Rental automatically ends at max duration
function forceComplete(uint256 rentalId) external {
    Rental storage rental = rentals[rentalId];
    require(block.timestamp > rental.startTime + rental.maxDuration, "Not expired");

    // Calculate based on max duration
    uint256 cost = rental.maxDuration * rental.hourlyRate / 3600;
    uint256 refund = rental.depositAmount - cost;

    USDC.transfer(rental.provider, cost);
    USDC.transfer(rental.renter, refund);
    rental.completed = true;
}
```

**這處理了什麼：**

- 租用者在未結束租賃的情況下消失
- 提供者不必無限期等待付款
- 任何一方都無法在超過最長時限後扣押資金

### 爭議機制

對於需要人工判斷的問題（主觀的品質爭議），合約實作了各種機制：

**帶有爭議視窗的時間鎖定釋放：**

```solidity
function initiateCompletion(uint256 rentalId) external {
    Rental storage rental = rentals[rentalId];
    require(msg.sender == rental.renter, "Only renter");

    rental.completionInitiated = true;
    rental.disputeDeadline = block.timestamp + DISPUTE_WINDOW; // e.g., 24 hours
}

function dispute(uint256 rentalId, string memory reason) external {
    Rental storage rental = rentals[rentalId];
    require(msg.sender == rental.renter || msg.sender == rental.provider, "Not party");
    require(rental.completionInitiated, "Completion not initiated");
    require(block.timestamp < rental.disputeDeadline, "Dispute window closed");

    rental.disputed = true;
    rental.disputeReason = reason;
    // Funds remain locked pending resolution
}

function finalizeCompletion(uint256 rentalId) external {
    Rental storage rental = rentals[rentalId];
    require(rental.completionInitiated, "Not initiated");
    require(block.timestamp > rental.disputeDeadline, "Window still open");
    require(!rental.disputed, "Disputed - requires resolution");

    // Release funds as originally calculated
    _releaseFunds(rentalId);
}
```

**運作方式：**

1. 租用者發起完成
2. 24 小時視窗開啟，任何一方都可以提出爭議
3. 如果沒有爭議，視窗關閉後資金釋放
4. 如果有爭議，資金保持鎖定等待解決

**仲裁整合：**

某些合約與仲裁協議整合：

```solidity
function resolveDispute(uint256 rentalId, uint256 renterPercent, uint256 providerPercent) external {
    require(msg.sender == ARBITRATOR, "Only arbitrator");
    require(renterPercent + providerPercent == 100, "Must total 100%");

    Rental storage rental = rentals[rentalId];
    require(rental.disputed, "Not disputed");

    uint256 renterAmount = rental.depositAmount * renterPercent / 100;
    uint256 providerAmount = rental.depositAmount * providerPercent / 100;

    USDC.transfer(rental.renter, renterAmount);
    USDC.transfer(rental.provider, providerAmount);
    rental.resolved = true;
}
```

**仲裁選項：**

| 方法                | 運作方式                 | 去中心化程度 |
| ------------------- | ------------------------ | ------------ |
| 平台仲裁            | GPUFlow 團隊裁決         | 中心化       |
| DAO 投票            | 代幣持有者對爭議進行投票 | 去中心化     |
| Kleros/Aragon Court | 去中心化陪審員網路       | 完全去中心化 |
| 多重簽名            | 雙方 + 調解人共同核准    | 半去中心化   |

### GPUFlow 的爭議處理方式

GPUFlow 實作了混合模型：

**對於客觀故障：**

- 自動逾時退款（提供者未出現）
- 在最長時限自動完成
- 合約強制執行的費率計算

**對於主觀爭議：**

- 租賃完成後的爭議視窗
- 通過 IPFS 提交證據（截圖、日誌）
- GPUFlow 團隊對小額爭議進行仲裁
- 大額爭議可選擇第三方仲裁

**爭議統計（假設範例）：**

| 結果               | 百分比 |
| ------------------ | ------ |
| 無爭議             | 97.8%  |
| 自動解決           | 1.5%   |
| 仲裁（租用者勝出） | 0.4%   |
| 仲裁（提供者勝出） | 0.2%   |
| 折衷裁決           | 0.1%   |

大多數租賃在沒有爭議的情況下完成。當爭議發生時，自動機制在沒有人工介入的情況下解決了大部分案例。

### 程式碼無法解決的爭議

**本質上主觀的問題：**

- 「GPU 很慢」（多慢？跟什麼比？）
- 「模型品質比預期差」（不是 GPU 的問題）
- 「提供者在聊天中態度粗魯」（沒有鏈上證據）

**合約認知範圍外的問題：**

- 鏈下服務品質
- 現實世界的身份問題
- 跨司法管轄區的法律爭議

**合約的限制：**

- 無法強制提供者交付服務
- 無法驗證 GPU 是否實際符合規格（需要預言機/證明）
- 無法撤銷已完成的交易

對於這些情況，存在仲裁機制，但它們重新引入了一些信任元素（信任仲裁者）。這是一個固有的限制——並非所有爭議都可以僅靠程式碼解決。

![爭議解決流程圖顯示決策路徑：租賃正常完成導致自動釋放資金、逾時發生導致自動退款、提出爭議導致證據審查然後仲裁，每個步驟都有時間框架和結果](../_images/smart-contract-dispute-resolution-flowchart.png)

---

## 已知限制：智慧合約託管的不足之處

智慧合約託管提供比平台託管更強的保證，但它並不完美。了解限制有助於您準確評估風險。

### 限制 1：智慧合約漏洞

**風險：**

智慧合約是程式碼。程式碼可能有漏洞。託管邏輯中的漏洞可能會：

- 永久鎖定資金（無法釋放）
- 允許未經授權的提款
- 計算付款不正確
- 在邊緣情況下失敗

**歷史案例：**

| 事件          | 年份 | 影響              | 原因         |
| ------------- | ---- | ----------------- | ------------ |
| The DAO       | 2016 | 6000 萬美元被提取 | 重入攻擊漏洞 |
| Parity Wallet | 2017 | 1.5 億美元被凍結  | 自毀函式漏洞 |
| Wormhole      | 2022 | 3.2 億美元被竊    | 簽名驗證缺陷 |

**緩解措施：**

- **審計：** 獨立安全公司在部署前審查程式碼
- **漏洞賞金：** 對發現漏洞的人給予獎勵
- **經過時間考驗的程式碼：** 部署時間越長且未出問題，信心越高
- **形式化驗證：** 程式碼正確性的數學證明（罕見且昂貴）
- **可升級合約：** 修復漏洞的能力（引入中心化的權衡）

**需要檢查的：**

在存入大量資金之前：

- 合約是否經過審計？由誰審計？
- 這段程式碼部署了多久？
- 是否有漏洞賞金計劃？
- 合約是否成功處理過大量資金？

### 限制 2：程式碼不可變性

**雙面刃：**

不可變的程式碼意味著：

- ✅ 沒有人可以在部署後更改規則
- ❌ 漏洞無法修補
- ❌ 改進需要遷移到新合約

**範例情境：**

發現一個微小的漏洞，在某些邊緣情況下對租用者多收了 0.1%。在傳統軟體中，您會部署一個熱修復。在不可變的智慧合約中：

- 舊合約繼續帶著漏洞運行
- 必須部署新合約
- 用戶必須遷移到新合約
- 舊的託管資金需要遷移路徑

**可升級合約：**

某些平台使用允許程式碼變更的可升級代理模式。這引入了一個權衡：

| 方式   | 優點           | 風險                   |
| ------ | -------------- | ---------------------- |
| 不可變 | 無法被惡意更改 | 無法修復漏洞           |
| 可升級 | 可以修復漏洞   | 擁有者可能惡意更改規則 |

GPUFlow 使用 [指定方式——帶有遷移路徑的不可變合約 / 帶有時間鎖的可升級合約 / 等]。了解您平台的方式及其含義。

### 限制 3：用戶錯誤是永久的

**沒有復原按鈕：**

區塊鏈交易是不可逆的。用戶的錯誤無法恢復：

| 錯誤           | 結果             | 恢復方式             |
| -------------- | ---------------- | -------------------- |
| 核准惡意合約   | 代幣被提取       | 無                   |
| 發送到錯誤地址 | 資金遺失         | 無（除非接收者退回） |
| 錯誤的網路     | 資金在意外的鏈上 | 需要努力才能恢復     |
| 錯誤的金額     | 多付/少付        | 可能需要提出爭議     |

**傳統平台：**

- 可以撤銷詐欺交易
- 可以從用戶錯誤中恢復
- 可以重設密碼和恢復存取權限

**智慧合約：**

- 交易一旦確認就是最終的
- 沒有客服可以撤銷它們
- 自我託管意味著自我負責

**緩解措施：**

- 發送前三次檢查地址
- 從小額測試交易開始
- 確認您在正確的網路上
- 了解您正在核准什麼
- 絕對不要在任何地方輸入助記詞

### 限制 4：預言機依賴

**預言機問題：**

智慧合約只能存取鏈上資料。現實世界的資訊（GPU 實際上是否運作、規格是否實際相符）需要「預言機」——外部資料提供者。

**合約可以原生驗證的：**

- 經過的時間（區塊時間戳）
- 代幣轉帳
- 鏈上狀態變更

**合約無法驗證的：**

- GPU 是否實際通電
- 規格是否符合列表
- 效能是否達到預期
- 用戶是否實際連線並工作

**目前的方法：**

| 方法       | 運作方式                   | 信任要求         |
| ---------- | -------------------------- | ---------------- |
| 基於逾時   | 如果沒有爭議則假設正常運作 | 最低             |
| 聲譽系統   | 過去的行為預測未來         | 中等             |
| 硬體證明   | GPU 以密碼學方式證明規格   | 低（如果已實作） |
| 提供者質押 | 提供者作弊會損失質押金     | 經濟激勵         |

**實際影響：**

GPU 提供者理論上可以接受租賃，提供比列表更差的 GPU，如果租用者不提出爭議就收取付款。合約無法獨立驗證硬體規格。

**緩解措施：**

- 查看提供者的聲譽/歷史
- 連線後立即驗證 GPU 規格（nvidia-smi）
- 如果規格不符，立即提出爭議
- 優先選擇有質押擔保品的提供者

### 限制 5：監管不確定性

**法律層面：**

智慧合約在傳統法律框架之外運作。問題仍然存在：

- 智慧合約託管是否具有法律約束力？
- 哪個司法管轄區管轄爭議？
- 法院能否強制執行合約操作？
- 稅務如何處理？

**實際影響：**

- 小額爭議：合約內的仲裁是實際可行的
- 大額爭議：法律追索不確定
- 跨境：管轄權不明確
- 監管變更：可能影響平台運營

**目前狀態：**

對於典型的 GPU 租賃金額（10-500 美元），智慧合約託管是實際可行的，法律上的模糊性很少造成問題。對於非常大的金額或企業使用，法律上的不確定性可能令人擔憂。

### 風險評估摘要

| 風險       | 嚴重程度 | 可能性             | 緩解措施                     |
| ---------- | -------- | ------------------ | ---------------------------- |
| 合約漏洞   | 高       | 低（如果經過審計） | 查看審計報告，使用成熟的合約 |
| 用戶錯誤   | 中高     | 中等               | 謹慎操作、小額測試、驗證     |
| 提供者詐欺 | 中等     | 低                 | 聲譽、快速驗證、爭議         |
| 監管       | 中低     | 不確定             | 持續關注，使用合規平台       |
| 預言機失效 | 低       | 低                 | 逾時保護、聲譽               |

**總體評估：**

對於大多數個人 GPU 租賃用戶，智慧合約託管提供的保護明顯優於信任平台營運者。風險是真實存在的，但透過合理的預防措施是可以管理的。替代方案（平台託管資金）在歷史上已被證明更加危險。

![風險比較矩陣顯示智慧合約託管風險（程式碼漏洞、不可變性、用戶錯誤、預言機限制）與傳統託管風險（盜竊、資不抵債、政策變更、駭客攻擊），每項都有嚴重程度和緩解措施指標](../_images/escrow-risk-comparison-matrix.png)

---

## 結論：程式碼即保證

智慧合約託管從根本上改變了 GPU 租賃的信任模型。您不再問「我信任這個平台嗎？」，而是問「這段程式碼是否按照其聲稱的方式運作？」第二個問題有一個可驗證的答案。

### 關鍵要點

**信任從人轉移到程式碼。** 傳統託管要求信任平台營運者保管您的錢。智慧合約託管要求信任經過審計的程式碼，而程式碼每次都以相同的方式執行。平台營運者即使想要也無法存取託管資金——程式碼阻止了這一點。

**驗證取代信仰。** 每筆交易都記錄在公開的區塊鏈上。您可以確認您的存款到達了託管合約、驗證資金在租賃期間保持鎖定，並觀察完成時的付款分配。沒有需要信任的儀表板餘額——只有需要驗證的區塊鏈狀態。

**自動執行消除了裁量權。** 付款計算根據時間戳和費率以數學方式進行。當條件滿足時，釋放條件即執行。沒有人類決定是向提供者付款還是退款給您——程式碼評估條件並據此行動。

**限制存在，但不同於傳統風險。** 智慧合約可能有漏洞、用戶錯誤是不可逆的，某些爭議需要人工判斷。這些風險是真實的，但從根本上不同於——且通常小於——信任平台營運者託管資金的風險。

### 智慧合約託管的適用情境

**理想適用於：**

- 個人開發者和小型團隊
- 熟悉加密貨幣基礎知識的用戶
- 重視驗證勝過信任的人
- 曾因平台託管失敗而受損的任何人
- 注重隱私、避免 KYC 平台的用戶

**如果有以下需求，請考慮傳統平台：**

- 您需要與特定司法管轄區的法律合約
- 企業合規要求特定的託管安排
- 您需要電話客服處理付款問題
- 加密貨幣基礎知識不在您的舒適範圍內

### 實際應用

在您下一次 GPU 租賃時：

1. **驗證合約：** 確認託管合約地址與官方文件一致
2. **確認審計狀態：** 在存入大量資金之前查閱已發布的審計報告
3. **從小額開始：** 以最少的存款進行測試，驗證流程是否按預期運作
4. **鏈上監控：** 在整個租賃過程中在 Polygonscan 上監看您的交易
5. **驗證完成：** 確認完成交易中的提供者付款和您的退款

花幾分鐘進行驗證所提供的保證，比平台營運者的任何承諾都更強。

### 更宏觀的視角

智慧合約託管代表了數位服務運作方式更廣泛的轉變。傳統模式——「給我們您的錢，信任我們是誠實的」——已在加密貨幣產業及其他領域反覆失敗。FTX、Mt. Gox 和無數較小的平台證明了基於信任的託管會造成災難性的失敗模式。

基於程式碼的託管並不能消除所有風險。但它將風險從「這個平台會偷我的錢嗎？」轉變為「這段經過審計的程式碼是否正常運作？」第二個問題有更好的答案：審計、形式化驗證、漏洞賞金，以及多年在生產環境中無事故運行。

具體到 GPU 租賃，智慧合約託管使 GPUFlow 等平台能夠提供：

- 無 KYC 要求（無託管意味著更少的監管）
- 更低的費用（無詐欺準備金、退款或合規開銷）
- 即時結算（無需等待平台處理）
- 全球可及性（程式碼不在乎地理位置）
- 真正的自我託管（您的金鑰，您的資金）

技術已經就緒。問題是您更喜歡可驗證的程式碼，還是受信任的中介機構。

### 相關資源

**本站內容：**

- [使用加密貨幣租賃 GPU 的完整指南](/zh_tw/rent-gpu-with-crypto/) — 完整的租賃教學，包括平台選擇
- [如何在無 KYC 或身份驗證的情況下租賃 GPU](/zh_tw/how-to-rent-gpu-without-kyc/) — 由智慧合約託管實現的注重隱私的租賃選項
- [設定 MetaMask 和 Polygon 以進行 GPU 租賃](/zh_tw/setting-up-metamask-polygon-gpu-rental/) — 與託管合約互動的錢包設定
- [為什麼穩定幣是支付 GPU 租賃的最明智方式](/zh_tw/stable-coins-are-the-smartest-way-to-pay-for-gpu-rental/) — 託管存款的最佳支付代幣

**外部資源：**

- [Polygonscan](https://polygonscan.com) — 驗證交易和合約狀態
- [OpenZeppelin](https://www.openzeppelin.com) — 智慧合約安全標準
- [Ethereum Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/) — 合約評估的安全準則

![總結資訊圖顯示智慧合約託管的三大支柱：驗證（在鏈上檢查您的資金）、自動化（程式碼無裁量權地執行）和保護（任何一方都無法存取鎖定的資金），下方展示 GPU 租賃工作流程](../_images/smart-contract-escrow-three-pillars-summary.png)

---

**準備體驗可驗證的託管？** [GPUFlow](https://gpuflow.app) 在 Polygon 網路上使用智慧合約託管，以經過審計的程式碼保護您的 GPU 租賃付款。在鏈上驗證您的資金，消除託管風險，自信地租賃 GPU。
