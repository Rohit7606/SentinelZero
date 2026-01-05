// Sahayak Shield - Final Flow (Receipt on Page -> View Why -> New Tab)
console.log("Sahayak Shield: Final Flow Loaded.");

// --- GLOBAL VARIABLES ---
var keystrokeTimes = [];
var lastKeyTime = 0;
var pressTimer = null;
var isHeavyMode = false;
var realButton = null;
var pasteCount = 0;
var backspaceCount = 0;

// --- 1. THE KNOWN BLACKLIST (Hard Block) ---
const MULE_DATABASE = new Set([
    "888888888", "666666666", 
    "987654321", "123123123", "111112222", "555556666",
    "100000001", "100000002"
]);

// --- 2. ML MODEL SIMULATION (Soft Block) ---
function runMLPrediction(accNum) {
    if (!accNum || accNum.length < 3) return "Normal";
    for (let i = 0; i < accNum.length - 2; i++) {
        let a = parseInt(accNum[i]);
        let b = parseInt(accNum[i+1]);
        let c = parseInt(accNum[i+2]);
        if (b === a + 1 && c === b + 1) return "Mule";
    }
    return "Normal";
}

// --- BEHAVIORAL TRACKING ---
function trackKeystroke(e) {
    var now = Date.now();
    if (e.inputType === 'deleteContentBackward') backspaceCount++;
    if (e.inputType === 'insertFromPaste') pasteCount++;
    if (lastKeyTime !== 0 && e.inputType !== 'insertFromPaste' && e.inputType !== 'deleteContentBackward') {
        var diff = now - lastKeyTime;
        if (diff < 2000 && diff > 10) keystrokeTimes.push(diff);
    }
    lastKeyTime = now;
}

function getAverageTypingSpeed() {
    if (!keystrokeTimes || keystrokeTimes.length === 0) return 150;
    var sum = keystrokeTimes.reduce((a, b) => a + b, 0);
    return sum / keystrokeTimes.length;
}

// --- MAIN LOGIC ---
function initExtension() {
    realButton = document.getElementById('bank-submit-btn');
    if (!realButton) {
        realButton = document.querySelector('button[type="submit"]') || document.querySelector('.btn-primary');
        if (!realButton) return;
    }

    var inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.addEventListener('input', trackKeystroke));

    realButton.style.display = 'none';

    var heavyBtn = document.createElement('button');
    heavyBtn.innerHTML = '<div class="sahayak-fill-bar"></div><span class="sahayak-btn-text">Secure Pay</span>';
    heavyBtn.className = 'sahayak-btn'; 
    heavyBtn.id = 'sahayak-secure-btn';
    heavyBtn.type = 'button'; 
    realButton.parentNode.insertBefore(heavyBtn, realButton);

    // --- CLICK HANDLER ---
    heavyBtn.addEventListener('mousedown', async function(e) {
        e.preventDefault();

        if (isHeavyMode) {
            startLongPress(heavyBtn);
            return;
        }

        var txtSpan = heavyBtn.querySelector('.sahayak-btn-text');
        txtSpan.innerText = "Analyzing Risk...";
        
        var accountInput = document.getElementById('account-input');
        var accVal = accountInput ? accountInput.value : "";
        var amountInput = document.getElementById('amount-input');
        var amtVal = amountInput ? amountInput.value : "50000";
        var avgSpeed = getAverageTypingSpeed();

        await new Promise(r => setTimeout(r, 800));

        // --- LAYER 1: HARD BLOCK (Mule DB) ---
        if (MULE_DATABASE.has(accVal)) {
            // DIRECTLY SHOW RECEIPT ON PAGE (No Hold)
            showReceiptModal(amtVal, "CRITICAL: Account listed in Mule Database", 5, "Extreme", "Kaggle Fraud Dataset", true);
            return;
        }

        // --- LAYER 2: SOFT BLOCK (ML) ---
        var mlPrediction = runMLPrediction(accVal);
        if (mlPrediction === "Mule") {
            // Activate Hold Button
            activateHeavyMode(heavyBtn, amtVal, "Risk: Mule Account Detected (Pattern Match)", 45, "High", "Pattern Recognition ML");
            return;
        }

        // --- LAYER 3: BEHAVIORAL ---
        if (pasteCount > 0 && avgSpeed < 50) {
            activateHeavyMode(heavyBtn, amtVal, "High Value Copy-Paste (Mule Risk)", 120, "Normal", "Behavioral Engine");
            return;
        }
        if (backspaceCount > 5) {
            activateHeavyMode(heavyBtn, amtVal, "High Hesitation (Coercion Risk)", 365, "Normal", "Behavioral Engine");
            return;
        }

        // SAFE
        txtSpan.innerText = "Approved";
        setTimeout(() => realButton.click(), 200);
    });

    heavyBtn.addEventListener('mouseup', function() { if (isHeavyMode) cancelLongPress(heavyBtn); });
    heavyBtn.addEventListener('mouseleave', function() { if (isHeavyMode) cancelLongPress(heavyBtn); });
}

// --- HEAVY BUTTON HELPERS ---
function activateHeavyMode(btn, balance, reason, metaAge, metaVelocity, metaSource) {
    isHeavyMode = true;
    btn.className = 'sahayak-btn sahayak-btn-heavy'; 
    btn.querySelector('.sahayak-btn-text').innerText = "Hold to Confirm";
    
    // Store data for the callback
    btn.dataset.balance = balance;
    btn.dataset.reason = reason;
    btn.dataset.metaAge = metaAge;
    btn.dataset.metaVelocity = metaVelocity;
    btn.dataset.metaSource = metaSource;
}

function startLongPress(btn) {
    var fillBar = btn.querySelector('.sahayak-fill-bar');
    if (fillBar) fillBar.style.width = "100%";
    
    pressTimer = setTimeout(function() {
        // Show Receipt Modal on the current page
        showReceiptModal(btn.dataset.balance, btn.dataset.reason, btn.dataset.metaAge, btn.dataset.metaVelocity, btn.dataset.metaSource, false);
    }, 3000); 
}

function cancelLongPress(btn) {
    clearTimeout(pressTimer);
    var fillBar = btn.querySelector('.sahayak-fill-bar');
    if (fillBar) {
        fillBar.style.transition = 'width 0.2s ease'; 
        fillBar.style.width = "0%";
        setTimeout(function() { fillBar.style.transition = 'width 3s linear'; }, 200);
    }
}

// --- RECEIPT MODAL LOGIC (ON PAGE) ---
function showReceiptModal(balance, reason, metaAge, metaVelocity, metaSource, isHardBlock) {
    if (document.getElementById('sahayak-receipt-modal')) return;

    var modal = document.createElement('div');
    modal.id = 'sahayak-receipt-modal';
    
    var randomBalance = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
    var ageColor = (metaAge < 30) ? "#d32f2f" : "green";
    
    var statusMessage = '';
    var buttonHtml = '';

    if (isHardBlock) {
        // --- HARD BLOCK UI ---
        statusMessage = `<div style="color: #d32f2f; font-weight: bold; margin-top: 10px; font-size: 18px;">🚫 BLOCKED</div>
                         <div style="font-size: 12px; color: #555; margin-top: 5px;">Transaction stopped for your safety.</div>`;
        
        // "VIEW WHY" Button -> Opens Dashboard in New Tab
        buttonHtml = `<button class="btn-cancel" style="width:100%; background:#d32f2f; color:white; border-radius:4px; font-weight:bold;" id="receipt-view-btn">VIEW WHY ↗</button>`;
    } else {
        // --- SOFT BLOCK UI ---
        statusMessage = `<div>If you proceed, your balance will be:</div><div class="future-balance">₹${randomBalance}</div>`;
        buttonHtml = `<button class="btn-cancel" id="receipt-abort-btn">Abort</button>
                      <button class="btn-proceed" id="receipt-pay-btn">Ignore & Pay</button>`;
    }

    modal.innerHTML = `
        <div class="receipt-paper">
            <div class="receipt-header" style="background:#333; color:white; padding:10px; margin:-25px -25px 15px -25px; border-radius:5px 5px 0 0;">
                🛡️ Sahayak Intelligence Report
            </div>
            <div style="text-align:left; font-size:12px; color:#666; margin-bottom:5px;">Target Analysis:</div>
            <div style="background:#f4f4f4; padding:10px; border-radius:5px; text-align:left; font-size:13px; border-left:4px solid ${ageColor};">
                <div><strong>Account Age:</strong> <span style="color:${ageColor}">${metaAge} Days</span></div>
                <div><strong>Velocity:</strong> ${metaVelocity}</div>
                <div><strong>Source:</strong> ${metaSource}</div>
            </div>
            <div class="receipt-risk-text">${reason}</div>
            <div class="receipt-divider" style="border-bottom:1px dashed #ccc; margin:15px 0;"></div>
            ${statusMessage}
            <div class="receipt-actions">${buttonHtml}</div>
        </div>
    `;
    
    document.body.appendChild(modal);

    // --- EVENT LISTENERS ---
    
    if (isHardBlock) {
        // "VIEW WHY" -> Save Data & Open New Tab
        document.getElementById('receipt-view-btn').onclick = function() {
            // Prepare Data for Dashboard
            const receiptData = { balance, reason, metaAge, metaVelocity, metaSource, timestamp: Date.now() };
            localStorage.setItem('sahayak_receipt_data', JSON.stringify(receiptData));
            localStorage.setItem('sahayak_trigger_graph', 'true'); // Trigger Red Alert
            
            // Open Dashboard in New Tab
            window.open('dashboard.html', '_blank');
            
            // Close Modal on this page
            modal.remove();
            
            // Reset Button style
            var btn = document.getElementById('sahayak-secure-btn');
            btn.className = 'sahayak-btn';
            btn.querySelector('.sahayak-btn-text').innerText = "Secure Pay";
        };
    } else {
        // Soft Block Handlers
        document.getElementById('receipt-abort-btn').onclick = function() { 
            modal.remove(); 
            isHeavyMode = false;
            var btn = document.getElementById('sahayak-secure-btn');
            btn.className = 'sahayak-btn';
            btn.querySelector('.sahayak-btn-text').innerText = "Secure Pay";
        };
        document.getElementById('receipt-pay-btn').onclick = function() { 
            realButton.click(); 
            modal.remove(); 
        };
    }
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initExtension); } else { initExtension(); }