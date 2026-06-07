// ==========================================================================
// ArcaSin - Arca Continental
// Frontend Javascript Engine
// ==========================================================================

// Global state variables
let currentPoints = 350;
let isSubstitutionAccepted = false;
let skuChartInstance = null;
let cediChartInstance = null;
let currentIncidenceAnalytics = {
    cedis: '3804',
    sustituto: 'Coca - Cola Sin Azúcar, Botella Pet 1.50 L, 8 Piezas',
    porcentaje: '70.6'
};
let tapitasDiscount = 0.00;
let scannedTapitas = {
    dorada: 0,
    roja: 0,
    verde: 0
};

// Shopping Cart state variables
let cartQuantities = {
    coke_orig: 0,
    coke_zero: 0,
    sprite: 0,
    fanta_orange: 0,
    fanta_grape: 0,
    ciel: 0,
    powerade: 0,
    del_valle: 0
};
const productPrices = {
    coke_orig: 17.00,
    coke_zero: 16.00,
    sprite: 16.00,
    fanta_orange: 16.00,
    fanta_grape: 16.00,
    ciel: 14.00,
    powerade: 25.00,
    del_valle: 15.00
};
const productNames = {
    coke_orig: 'Coca-Cola Original (600ml)',
    coke_zero: 'Coca-Cola Sin Azúcar (600ml)',
    sprite: 'Sprite Limón-Lima (600ml)',
    fanta_orange: 'Fanta Naranja (600ml)',
    fanta_grape: 'Fanta Uva (600ml)',
    ciel: 'Agua Ciel Purificada (1L)',
    powerade: 'Powerade Frutas Tropicales (1L)',
    del_valle: 'Jugo Del Valle Durazno (413ml)'
};
const productEmojis = {
    coke_orig: '🥤',
    coke_zero: '🔴',
    sprite: '🍋',
    fanta_orange: '🍊',
    fanta_grape: '🍇',
    ciel: '💧',
    powerade: '⚡',
    del_valle: '🧃'
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    // 1. Session state validation
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "/login";
        return;
    }

    // 2. Load and display logged user profile details in sidebar
    const username = localStorage.getItem("username") || "";
    const userRole = localStorage.getItem("userRole") || "tendero";
    const customerName = localStorage.getItem("customerName") || "Cliente";

    const userNameEl = document.getElementById("logged-user-name");
    const userRoleEl = document.getElementById("logged-user-role");
    
    if (userNameEl) userNameEl.textContent = customerName;
    if (userRoleEl) {
        const roleLabels = {
            'admin': 'Administrador AC',
            'operator': 'Operador de CEDI / Ruta',
            'tendero': 'Tendero / Cliente'
        };
        userRoleEl.textContent = roleLabels[userRole] || userRole;
    }

    const tenderoWelcomeEl = document.getElementById("tendero-welcome");
    if (tenderoWelcomeEl) {
        tenderoWelcomeEl.textContent = customerName;
    }

    // 3. Bind Logout Event
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userRole");
            localStorage.removeItem("username");
            localStorage.removeItem("customerName");
            window.location.href = "/login";
        });
    }

    // Bind Database Reset Event
    const btnReset = document.getElementById("btn-reset-db");
    if (btnReset) {
        btnReset.addEventListener("click", () => {
            resetDatabase();
        });
    }

    // Bind Chat Product Select Event
    const chatProductSelect = document.getElementById("chat-product-select");
    if (chatProductSelect) {
        chatProductSelect.addEventListener("change", (e) => {
            handleChatProductChange(e.target.value);
        });
    }

    // Bind Incidence Product Select Event to reload analytics
    const incProductSelect = document.getElementById("inc-product");
    if (incProductSelect) {
        incProductSelect.addEventListener("change", () => {
            loadIncidenceAnalytics();
        });
    }

    // Bind Substitution Accept Button Event
    const btnAcceptSub = document.getElementById("btn-accept-substitution");
    if (btnAcceptSub) {
        btnAcceptSub.addEventListener("click", () => {
            acceptSubstitution();
        });
    }

    // Bind Image Preview for Incidences
    const incPhoto = document.getElementById("inc-photo");
    const previewContainer = document.getElementById("inc-photo-preview-container");
    const previewImg = document.getElementById("inc-photo-preview");
    if (incPhoto) {
        incPhoto.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (previewImg) previewImg.src = event.target.result;
                    if (previewContainer) previewContainer.style.display = "block";
                };
                reader.readAsDataURL(file);
            } else {
                if (previewContainer) previewContainer.style.display = "none";
                if (previewImg) previewImg.src = "";
            }
        });
    }

    // Load Initial State
    loadState();
    
    // Render initial rewards catalog (Season 1)
    renderRewardsCatalog(1);
    
    // Start Live Urgency Countdown
    startUrgencyCountdown();
});

// ----------------- STATE & API LOADER -----------------

function loadState() {
    const username = localStorage.getItem("username") || "8927240000000";
    fetch(`/api/state?username=${username}`)
        .then(res => res.json())
        .then(data => {
            currentPoints = data.points;
            isSubstitutionAccepted = data.is_accepted;
            
            // Save order ID for session use
            localStorage.setItem("pedido_id", data.pedido_id);
            
            // Update UI elements
            const pointsEl = document.getElementById("tendero-points");
            if (pointsEl) pointsEl.textContent = currentPoints;
            
            // Update reward buttons disabled/enabled status based on points
            updateRewardButtons();
            
            // Render fichitas wallet if container is present
            renderFichitasWallet();
            
            // Initialize chat feed message with dynamic order ID
            const feed = document.getElementById("chat-feed");
            if (feed) {
                let initialHTML = `
                    <div class="chat-bubble bot">
                        <strong>Asistente Virtual:</strong> ¡Hola! Estoy revisando tu orden programada ID: <strong>${data.pedido_id}</strong>. ¿Qué producto deseas validar de tu pedido de mañana?
                    </div>
                `;
                if (isSubstitutionAccepted) {
                    initialHTML += `
                        <div class="chat-bubble bot">
                            <strong>Asistente:</strong> Aprobación de sustitución registrada para el Pedido: <strong>${data.pedido_id}</strong>. Recibirás 2 Multi-empaques de 1.00 L (12 Litros Totales).
                        </div>
                    `;
                }
                feed.innerHTML = initialHTML;
            }
            
            // Reload context depending on current visible view
            const activeRole = localStorage.getItem("userRole") || "tendero";
            switchView(activeRole);
            if (activeRole === "tendero") {
                updateCartUI();
            }
        })
        .catch(err => console.error("Error loading state:", err));
}

function switchView(role) {
    // Hide all views
    document.querySelectorAll(".role-view").forEach(view => {
        view.classList.add("hidden");
    });

    // Show selected view
    if (role === "tendero") {
        document.getElementById("view-tendero").classList.remove("hidden");
    } else if (role === "operator") {
        document.getElementById("view-operator").classList.remove("hidden");
        loadOperatorView();
    } else if (role === "admin") {
        document.getElementById("view-admin").classList.remove("hidden");
        loadAdminDashboard();
    }
}

function resetDatabase() {
    if (confirm("¿Seguro que deseas restablecer los datos locales? Esto limpiará las incidencias y aceptaciones.")) {
        fetch("/api/reset", { method: "POST" })
            .then(res => res.json())
            .then(data => {
                alert(data.msg);
                const pedidoId = localStorage.getItem("pedido_id") || "8927240000000000000";
                
                // Clear chat feed to initial state
                const chatFeed = document.getElementById("chat-feed");
                if (chatFeed) {
                    chatFeed.innerHTML = `
                        <div class="chat-bubble bot">
                            <strong>Asistente Virtual:</strong> ¡Hola! Estoy revisando tu orden programada ID: <strong>${pedidoId}</strong>. ¿Qué producto deseas validar de tu pedido de mañana?
                        </div>
                    `;
                }
                document.getElementById("chat-product-select").value = "";
                document.getElementById("chat-alert-box").classList.add("hidden");
                
                // Reload
                loadState();
            })
            .catch(err => console.error("Error resetting db:", err));
    }
}

// ----------------- TENDERO WORKSPACE (MOBILE) -----------------

function switchMobileTab(tabName) {
    // Toggle active tab buttons
    const buttons = document.querySelectorAll("#view-tendero .workspace-tabs .op-tab-btn");
    buttons.forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("onclick") === `switchMobileTab('${tabName}')`) {
            btn.classList.add("active");
        }
    });

    // Toggle active tab content pane
    document.querySelectorAll("#view-tendero .mobile-tab-pane").forEach(pane => {
        pane.classList.remove("active");
    });
    
    if (tabName === "chat") {
        document.getElementById("m-tab-chat").classList.add("active");
    } else if (tabName === "incidencias") {
        document.getElementById("m-tab-incidencias").classList.add("active");
        
        // Sync incidence product selection with chat product selection
        const chatSelect = document.getElementById("chat-product-select");
        const incProductSelect = document.getElementById("inc-product");
        if (chatSelect && incProductSelect) {
            if (chatSelect.selectedIndex > 0) {
                const chatVal = chatSelect.value;
                const valueMapping = {
                    'coke': 'Coca - Cola',
                    'sprite': 'Sprite Lima Limón',
                    'fanta': 'Fanta Uva',
                    'ciel': 'Ciel Agua Purificada'
                };
                if (valueMapping[chatVal]) {
                    incProductSelect.value = valueMapping[chatVal];
                }
            }
        }
        
        loadIncidenceAnalytics();
    } else if (tabName === "premios") {
        document.getElementById("m-tab-premios").classList.add("active");
    } else if (tabName === "fichitas") {
        document.getElementById("m-tab-fichitas").classList.add("active");
        renderFichitasWallet();
    } else if (tabName === "diagnostico") {
        document.getElementById("m-tab-diagnostico").classList.add("active");
    } else if (tabName === "soporte") {
        document.getElementById("m-tab-soporte").classList.add("active");
    }
}

function loadIncidenceAnalytics() {
    const incProductSelect = document.getElementById("inc-product");
    let selectedProductName = "Coca - Cola"; // Default fallback
    
    if (incProductSelect) {
        selectedProductName = incProductSelect.value.trim();
    }
    
    // Reset success box when switching/loading
    const successBox = document.getElementById("inc-success-box");
    if (successBox) successBox.classList.add("hidden");

    const username = localStorage.getItem("username") || "8927240000000";

    fetch(`/api/incidence/analytics?producto=${encodeURIComponent(selectedProductName)}&username=${username}`)
        .then(res => res.json())
        .then(data => {
            currentIncidenceAnalytics.cedis = data.cedis;
            currentIncidenceAnalytics.sustituto = data.sustituto;
            currentIncidenceAnalytics.porcentaje = data.porcentaje;
            
            const analCedis = document.getElementById("inc-anal-cedis");
            const analSub = document.getElementById("inc-anal-sub");
            const analPct = document.getElementById("inc-anal-pct");
            
            if (analCedis) analCedis.textContent = `CEDI ${data.cedis}`;
            if (analSub) analSub.textContent = data.sustituto;
            if (analPct) analPct.textContent = `${data.porcentaje}%`;
        })
        .catch(err => {
            console.error("Error loading incidence analytics:", err);
            // Fallback UI
            const analCedis = document.getElementById("inc-anal-cedis");
            const analSub = document.getElementById("inc-anal-sub");
            const analPct = document.getElementById("inc-anal-pct");
            
            if (analCedis) analCedis.textContent = "CEDI 3804";
            if (analSub) analSub.textContent = "Coca - Cola Sin Azúcar, Botella Pet 1.50 L, 8 Piezas";
            if (analPct) analPct.textContent = "70.6%";
        });
}

function appendChatBubble(sender, text) {
    const chatFeed = document.getElementById("chat-feed");
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerHTML = sender === "bot" ? `<strong>Asistente:</strong> ${text}` : text;
    chatFeed.appendChild(bubble);
    
    // Auto scroll chat
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

function handleChatProductChange(val) {
    const alertBox = document.getElementById("chat-alert-box");
    if (alertBox) alertBox.classList.add("hidden");
    
    if (val === "") return;
    
    // Get product name
    const option = document.querySelector(`#chat-product-select option[value="${val}"]`);
    const prodName = option ? option.textContent : val;
    
    // 1. Append User bubble
    appendChatBubble("user", `Quiero consultar disponibilidad de ${prodName}`);
    
    // 2. Append Bot bubble with choice buttons
    const choiceMsg = `¿Qué deseas realizar para <strong>${prodName}</strong>?
    <div style="margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn-primary" onclick="handleChatSelectAction('${val}', 'stock')" style="padding: 8px 16px; font-size: 0.85rem; font-weight: 700; cursor: pointer; width: auto; font-family: inherit; border-radius: 6px;">🔍 Ver stock</button>
        <button class="btn-secondary" onclick="handleChatSelectAction('${val}', 'analytics')" style="padding: 8px 16px; font-size: 0.85rem; font-weight: 700; cursor: pointer; width: auto; font-family: inherit; border-radius: 6px; border: 1px solid var(--coca-red); color: var(--coca-red); background-color: white;">📊 Ver lógica analítica</button>
    </div>`;
    
    appendChatBubble("bot", choiceMsg);
}

window.handleChatSelectAction = function(val, action) {
    const option = document.querySelector(`#chat-product-select option[value="${val}"]`);
    const prodName = option ? option.textContent : val;
    const alertBox = document.getElementById("chat-alert-box");
    
    if (action === 'stock') {
        appendChatBubble("user", `🔍 Ver stock de ${prodName}`);
        
        if (val === "coke") {
            if (isSubstitutionAccepted) {
                appendChatBubble("bot", "Ya has aprobado la sustitución por presentación de 1.00 L para esta orden. ¡Tus litros están asegurados!");
                if (alertBox) alertBox.classList.add("hidden");
            } else {
                if (alertBox) alertBox.classList.add("hidden");
                
                const empatheticMsg = `¡Hola! Notamos que el producto que buscas no tiene stock suficiente en este momento en el CEDI para armar tu ruta. ¡Pero no te preocupes, tu negocio no se va a quedar sin producto! Nuestro sistema ha calculado una alternativa ideal para rescatar tu orden.
                <div style="margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn-primary" onclick="showSubstitutionProposal()" style="padding: 8px 16px; font-size: 0.85rem; font-weight: 700; cursor: pointer; width: auto; font-family: inherit; border-radius: 6px;">📦 Ver propuesta de sustitución</button>
                </div>`;
                
                appendChatBubble("bot", empatheticMsg);
            }
        } else {
            appendChatBubble("bot", `¡Validado! Contamos con suficiente inventario para <strong>${prodName}</strong>. Se cargará tu pedido original sin mermas ni sustitutos.`);
            if (alertBox) alertBox.classList.add("hidden");
        }
    } else if (action === 'analytics') {
        appendChatBubble("user", `📊 Ver lógica analítica de ${prodName}`);
        showChatAnalyticsForProduct(val);
    }
};

function showChatAnalyticsForProduct(val) {
    const alertBox = document.getElementById("chat-alert-box");
    if (alertBox) alertBox.classList.add("hidden");
    
    const valueMapping = {
        'coke': 'Coca - Cola',
        'sprite': 'Sprite Lima Limón',
        'fanta': 'Fanta Uva',
        'ciel': 'Ciel Agua Purificada'
    };
    const productName = valueMapping[val] || val;
    const username = localStorage.getItem("username") || "8927240000000";
    
    fetch(`/api/incidence/analytics?producto=${encodeURIComponent(productName)}&username=${username}`)
        .then(res => res.json())
        .then(data => {
            const msg = `📊 <strong>Lógica de Analítica Real (df_resultados)</strong>:<br>
            • <strong>CEDIS del Producto:</strong> CEDI ${data.cedis}<br>
            • <strong>Sustituto Sugerido por Histórico:</strong> ${data.sustituto}<br>
            • <strong>Porcentaje de Recurrencia:</strong> ${data.porcentaje}%`;
            appendChatBubble("bot", msg);
        })
        .catch(err => {
            console.error("Error loading chat analytics:", err);
            const msg = `📊 <strong>Lógica de Analítica Real (df_resultados)</strong>:<br>
            • <strong>CEDIS del Producto:</strong> CEDI 3810<br>
            • <strong>Sustituto Sugerido por Histórico:</strong> Coca - Cola, Botella Pet 2.00 L Retornable, 8 Piezas<br>
            • <strong>Porcentaje de Recurrencia:</strong> 35%`;
            appendChatBubble("bot", msg);
        });
}

window.showSubstitutionProposal = function() {
    const alertBox = document.getElementById("chat-alert-box");
    if (alertBox) {
        updateChatAlertText();
        alertBox.classList.remove("hidden");
        
        const rewardInfo = getNextRewardDetails(currentPoints);
        const remaining = parseInt(localStorage.getItem("countdown_target_time") || 0) - Date.now();
        let alertMsg;
        if (remaining > 0) {
            alertMsg = `⏳ ¡Reto Express con Caducidad! Tus puntos acumulados de este ciclo expiran en <span class="live-countdown" style="font-family: monospace; font-weight: 800; background-color: rgba(230,0,0,0.1); padding: 2px 6px; border-radius: 4px;">48:00:00</span>. Actualmente tienes ${currentPoints} puntos y estás a solo ${rewardInfo.puntos_faltantes} puntos de desbloquear tu ${rewardInfo.siguiente_premio}. ¡No dejes que tus puntos caduquen! Si aceptas nuestra sugerencia de sustitución inteligente por litraje equivalente en este pedido, te regalaremos 50 Puntos Rescate extra para que canjees tu premio hoy mismo antes de que termine el contador. 🎁`;
        } else {
            alertMsg = `⏳ ¡Ciclo Express Terminado! El catálogo se ha renovado con los premios de la nueva temporada. ¡Sigue acumulando! Actualmente tienes ${currentPoints} puntos y estás a solo ${rewardInfo.puntos_faltantes} puntos de desbloquear tu ${rewardInfo.siguiente_premio}. 🎁`;
        }
        appendChatBubble("bot", alertMsg);
        
        const chatFeed = document.getElementById("chat-feed");
        if (chatFeed) {
            chatFeed.scrollTop = chatFeed.scrollHeight;
        }
    }
};

window.showChatAnalytics = function() {
    const val = document.getElementById("chat-product-select").value || "coke";
    showChatAnalyticsForProduct(val);
};

function acceptSubstitution() {
    const username = localStorage.getItem("username") || "8927240000000";
    const pedidoId = localStorage.getItem("pedido_id") || "8927240000000000000";

    fetch("/api/tendero/accept", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, pedido_id: parseFloat(pedidoId) })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                isSubstitutionAccepted = true;
                
                // Trigger HTML5 Canvas Confetti animation!
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.8 }
                });
                
                appendChatBubble("bot", "¡Sustitución Inteligente Aceptada! Hemos asegurado tus litros de Coca-Cola en presentación de 1.00 L. +50 pts acumulados.");
                document.getElementById("chat-alert-box").classList.add("hidden");
                
                // Update state points
                loadState();
            } else {
                alert(data.msg);
            }
        })
        .catch(err => console.error("Error accepting sub:", err));
}

function submitIncidence(e) {
    e.preventDefault();
    
    const prod = document.getElementById("inc-product").value;
    const comments = document.getElementById("inc-comments").value;
    const photoInput = document.getElementById("inc-photo");
    const hasPhoto = photoInput && photoInput.files.length > 0;
    
    if (!hasPhoto) {
        alert("⚠️ Por favor, adjunta una fotografía como evidencia para proceder con la aprobación automática del reembolso.");
        return;
    }
    
    // Simulate AI vision analysis step
    alert("🔍 Analizando imagen con Visión por Computadora...");
    
    fetch("/api/tendero/incidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            producto: prod,
            comentarios: comments,
            foto_cargada: "Sí"
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const successBox = document.getElementById("inc-success-box");
            const successText = document.getElementById("inc-success-text");
            if (successBox && successText) {
                successText.innerHTML = `✅ Análisis de Datos Operativos Exitoso: El producto original pertenece al CEDIS ${currentIncidenceAnalytics.cedis}. Basado en nuestro histórico real, el sustituto sugerido por el sistema es ${currentIncidenceAnalytics.sustituto}. El algoritmo detecta que este cambio tiene un ${currentIncidenceAnalytics.porcentaje}% de tasa de aceptación en este canal comercial. Reporte de merma automatizado con Folio: AC-2026-RE.`;
                successBox.classList.remove("hidden");
            }
            
            // Reset form and hide preview
            document.getElementById("form-incidence").reset();
            const previewContainer = document.getElementById("inc-photo-preview-container");
            if (previewContainer) previewContainer.style.display = "none";
            
            // Reload metrics if dashboard is open
            loadAdminDashboard();
        }
    })
    .catch(err => console.error("Error submitting merma:", err));
}

function redeemReward(cost, rewardName) {
    if (currentPoints < cost) {
        alert("Puntos insuficientes.");
        return;
    }
    
    const username = localStorage.getItem("username") || "8927240000000";
    fetch("/api/tendero/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            cost: cost,
            reward_name: rewardName,
            username: username
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(`¡Canjeaste ${rewardName} con éxito!`);
            loadState(); // reload points balance
        }
    })
    .catch(err => console.error("Error redeeming:", err));
}

// ----------------- OPERATOR WORKSPACE -----------------

function switchOperatorTab(tabName) {
    const buttons = document.querySelectorAll("#view-operator .workspace-tabs .op-tab-btn");
    buttons.forEach(btn => {
        btn.classList.remove("active");
    });
    
    if (tabName === "picking") {
        if (buttons[0]) buttons[0].classList.add("active");
    } else if (tabName === "ruta") {
        if (buttons[1]) buttons[1].classList.add("active");
    }

    document.querySelectorAll(".op-tab-pane").forEach(pane => {
        pane.classList.remove("active");
    });
    
    if (tabName === "picking") {
        document.getElementById("op-tab-picking").classList.add("active");
    } else if (tabName === "ruta") {
        document.getElementById("op-tab-ruta").classList.add("active");
    }
}

function loadOperatorView() {
    fetch("/api/state")
        .then(res => res.json())
        .then(data => {
            const isAccepted = data.is_accepted;
            const container = document.getElementById("picking-alert-container");
            const subBadge = document.getElementById("picking-sub-badge");
            const statusBadge = document.getElementById("picking-status-badge");
            
            if (isAccepted) {
                container.innerHTML = `
                    <div class="operator-alert-banner success">
                        <h4>✓ Modificación Pre-Aprobada: Cargar 2 Multi-empaques de 1.00 L</h4>
                        <p>El cliente <strong>Abarrotes Don Pepe (CEDI 3804 - Pedido: 8927240000000000000)</strong> aceptó el sustituto equivalente de 1.00 L. Cargar 2 multi-empaques de 6 piezas (12 L Totales).</p>
                    </div>
                `;
                subBadge.textContent = "Aprobada (1.00 L)";
                subBadge.className = "badge-status green";
                statusBadge.textContent = "Listo para Ruta";
                statusBadge.className = "badge-status green";
            } else {
                container.innerHTML = `
                    <div class="operator-alert-banner warning">
                        <h4>⚠️ Alerta de Alistamiento: Esperando Confirmación del Cliente</h4>
                        <p>El pedido <strong>8927240000000000000 (CEDI 3804)</strong> para Coca - Cola clásica tiene riesgo de desabasto. Esperando aprobación de sustituto en la app móvil de la tienda.</p>
                    </div>
                `;
                subBadge.textContent = "En Espera";
                subBadge.className = "badge-status yellow";
                statusBadge.textContent = "Retenido";
                statusBadge.className = "badge-status yellow";
            }
        });
}

// ----------------- ADMIN DASHBOARD (ANALYTICS) -----------------

function loadAdminDashboard() {
    // Load Metrics
    fetch("/api/admin/metrics")
        .then(res => res.json())
        .then(data => {
            document.getElementById("metric-gmv").textContent = new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }).format(data.gmv_rescued);
            
            document.getElementById("metric-saved-rate").textContent = `${data.saved_percentage.toFixed(2)}%`;
            document.getElementById("metric-complaints").textContent = data.complaints_resolved.toLocaleString();
        })
        .catch(err => console.error("Error loading admin metrics:", err));

    // Load Live Incidencias Feed
    fetch("/api/incidencias")
        .then(res => res.json())
        .then(records => {
            const container = document.getElementById("incidencias-rows-container");
            const emptyState = document.getElementById("incidencias-empty-state");
            container.innerHTML = "";
            
            if (records.length === 0) {
                emptyState.classList.remove("hidden");
            } else {
                emptyState.classList.add("hidden");
                records.forEach(row => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td><strong>${row.IncidenciaID}</strong></td>
                        <td>${row.Producto}</td>
                        <td>"${row.Comentarios}"</td>
                        <td><span class="badge-status gray">${row.FotoCargada}</span></td>
                        <td>${row.Fecha}</td>
                        <td><span class="badge-status green">Recibido en CEDI</span></td>
                    `;
                    container.appendChild(tr);
                });
            }
        })
        .catch(err => console.error("Error loading incidencias:", err));

    // Load Chart Data
    fetch("/api/admin/charts")
        .then(res => res.json())
        .then(data => {
            drawSKUChart(data.top_skus);
            drawCEDIChart(data.cedis_alerts);
        })
        .catch(err => console.error("Error loading charts data:", err));
}

function drawSKUChart(topSkus) {
    const ctx = document.getElementById("chart-sku").getContext("2d");
    
    // Destroy previous instance to avoid visual glitching
    if (skuChartInstance) {
        skuChartInstance.destroy();
    }

    const labels = topSkus.map(item => item.SKU);
    const counts = topSkus.map(item => item.Casos);

    skuChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de Incidentes',
                data: counts,
                backgroundColor: [
                    '#E60000', // Deep Red for Coca-Cola
                    '#FF4D4D',
                    '#FF8080',
                    '#FFA6A6',
                    '#FFCCCC'
                ],
                borderRadius: 5,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Outfit' } }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { family: 'Outfit', weight: 'bold' } }
                }
            }
        }
    });
}

function drawCEDIChart(cedisAlerts) {
    const ctx = document.getElementById("chart-cedis").getContext("2d");

    if (cediChartInstance) {
        cediChartInstance.destroy();
    }

    const labels = cedisAlerts.map(item => `CEDI ${item.CEDIS}`);
    const counts = cedisAlerts.map(item => item.Alertas);

    // Apply color highlights: 3804, 3810, 3501 are critical red, others gray
    const colors = cedisAlerts.map(item => {
        const cediCode = String(item.CEDIS).trim();
        if (['3804', '3810', '3501'].includes(cediCode)) {
            return '#E60000'; // Coca-Cola corporate Red
        }
        return '#A0AEC0'; // Light Gray for normal
    });

    cediChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Volumen de Alertas',
                data: counts,
                backgroundColor: colors,
                borderRadius: 5,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Outfit' } }
                },
                y: {
                    grid: { color: '#EDF2F7' },
                    ticks: { font: { family: 'Outfit' } }
                }
            }
        }
    });
}

// ==========================================
// Gamification and Urgencia Helper Functions
// ==========================================

const CATALOGS = {
    1: [
        { id: 'btn-redeem-vasos', icon: '🥤', name: 'Vasos Retro', desc: 'Vidrio labrado vintage original', cost: 100 },
        { id: 'btn-redeem-hielera', icon: '🧊', name: 'Mini Hielera', desc: 'Hielera metálica coleccionable', cost: 200 },
        { id: 'btn-redeem-camiones', icon: '🚛', name: 'Camiones a Escala', desc: 'Réplica Arca Continental metálica', cost: 300 }
    ],
    2: [
        { id: 'btn-redeem-vasos', icon: '🔊', name: 'Bocina Bluetooth', desc: 'Sonido HD inalámbrico portátil', cost: 100 },
        { id: 'btn-redeem-hielera', icon: '🏖️', name: 'Silla Playera ARCA', desc: 'Silla plegable premium de descanso', cost: 200 },
        { id: 'btn-redeem-camiones', icon: '⛺', name: 'Toldo Promocional', desc: 'Toldo Arca Continental impermeable', cost: 300 }
    ]
};

let currentSeason = 1;

function renderRewardsCatalog(season) {
    currentSeason = season;
    const container = document.getElementById("rewards-grid-container");
    if (!container) return;

    const items = CATALOGS[season];
    let html = '';
    items.forEach(item => {
        html += `
            <div class="reward-item-card" style="flex-direction: column; padding: 25px; text-align: center; justify-content: space-between; min-height: 250px;">
                <span class="reward-item-icon" style="font-size: 3.5rem; display: block; margin-bottom: 10px;">${item.icon}</span>
                <div class="reward-item-info">
                    <h5 style="font-size: 1.1rem; margin-bottom: 5px;">${item.name}</h5>
                    <p style="font-size: 0.82rem; margin-bottom: 8px;">${item.desc}</p>
                    <span class="reward-item-cost" style="font-size: 1.15rem;">🪙 ${item.cost} pts</span>
                </div>
                <button id="${item.id}" class="btn-redeem btn-primary" style="width: 100%; margin-top: 15px;" onclick="redeemReward(${item.cost}, '${item.name}')">Canjear Premio</button>
            </div>
        `;
    });
    container.innerHTML = html;
    updateRewardButtons(); // re-verify disabled states
}

function getNextRewardDetails(points) {
    const catalog = CATALOGS[currentSeason];
    if (points < 100) {
        return {
            siguiente_premio: catalog[0].name,
            meta: 100,
            puntos_faltantes: 100 - points
        };
    } else if (points < 200) {
        return {
            siguiente_premio: catalog[1].name,
            meta: 200,
            puntos_faltantes: 200 - points
        };
    } else {
        return {
            siguiente_premio: catalog[2].name,
            meta: 300,
            puntos_faltantes: Math.max(0, 300 - points)
        };
    }
}

function updateRewardButtons() {
    const btnVasos = document.getElementById("btn-redeem-vasos");
    const btnHielera = document.getElementById("btn-redeem-hielera");
    const btnCamiones = document.getElementById("btn-redeem-camiones");

    if (btnVasos) btnVasos.disabled = currentPoints < 100;
    if (btnHielera) btnHielera.disabled = currentPoints < 200;
    if (btnCamiones) btnCamiones.disabled = currentPoints < 300;
}

function updateChatAlertText() {
    const chatAlertText = document.getElementById("chat-alert-text");
    if (chatAlertText) {
        const rewardInfo = getNextRewardDetails(currentPoints);
        const remaining = parseInt(localStorage.getItem("countdown_target_time") || 0) - Date.now();
        
        if (remaining > 0) {
            chatAlertText.innerHTML = `⏳ ¡Reto Express con Caducidad! Tus puntos acumulados de este ciclo expiran en <span class="live-countdown" style="font-family: monospace; font-weight: 800; background-color: rgba(230,0,0,0.1); padding: 2px 6px; border-radius: 4px;">48:00:00</span>. Actualmente tienes ${currentPoints} puntos y estás a solo ${rewardInfo.puntos_faltantes} puntos de desbloquear tu ${rewardInfo.siguiente_premio}. ¡No dejes que tus puntos caduquen! Si aceptas nuestra sugerencia de sustitución inteligente por litraje equivalente en este pedido, te regalaremos 50 Puntos Rescate extra para que canjees tu premio hoy mismo antes de que termine el contador. 🎁`;
        } else {
            chatAlertText.innerHTML = `⏳ ¡Ciclo Express Terminado! El catálogo se ha renovado con los premios de la nueva temporada. ¡Sigue acumulando! Actualmente tienes ${currentPoints} puntos y estás a solo ${rewardInfo.puntos_faltantes} puntos de desbloquear tu ${rewardInfo.siguiente_premio}. 🎁`;
        }
    }
}

// Live Countdown Timer Engine
let countdownInterval = null;
function startUrgencyCountdown() {
    let targetTime = localStorage.getItem("countdown_target_time");
    if (!targetTime) {
        targetTime = Date.now() + 48 * 60 * 60 * 1000;
        localStorage.setItem("countdown_target_time", targetTime);
    } else {
        targetTime = parseInt(targetTime);
        if (targetTime < Date.now()) {
            targetTime = Date.now() + 48 * 60 * 60 * 1000;
            localStorage.setItem("countdown_target_time", targetTime);
        }
    }

    const tick = () => {
        const remaining = targetTime - Date.now();
        let formattedTime = "00:00:00";
        if (remaining > 0) {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            if (currentSeason !== 1) {
                renderRewardsCatalog(1);
            }
            
            document.querySelectorAll(".live-countdown").forEach(el => {
                el.textContent = formattedTime;
            });
        } else {
            if (countdownInterval) clearInterval(countdownInterval);
            
            if (currentSeason !== 2) {
                renderRewardsCatalog(2);
            }
            
            const premiosBanner = document.getElementById("premios-urgency-banner");
            if (premiosBanner) {
                premiosBanner.style.backgroundColor = "#D4EDDA";
                premiosBanner.style.color = "#155724";
                premiosBanner.style.borderLeft = "4px solid #28A745";
                premiosBanner.textContent = "⏳ ¡Ciclo Express Terminado! El catálogo se ha renovado con los premios de la nueva temporada. ¡Sigue acumulando!";
            }
            
            const headerWarning = document.getElementById("urgency-warning-header");
            if (headerWarning) {
                headerWarning.textContent = "⏳ ¡Ciclo Express Terminado! Nueva Temporada Activa.";
                headerWarning.style.color = "#28A745";
            }
            
            updateChatAlertText();
        }
    };

    if (countdownInterval) clearInterval(countdownInterval);
    tick();
    countdownInterval = setInterval(tick, 1000);
}

function renderFichitasWallet() {
    const container = document.getElementById("fichitas-wallet-container");
    if (!container) return;
    
    // Original totals or basic data
    const pedidoId = localStorage.getItem("pedido_id") || "8927240000000000000";
    const originalTotal = 2450.00;
    let subDiscount = isSubstitutionAccepted ? 10.00 : 0.00;
    let finalTotal = originalTotal - tapitasDiscount - subDiscount;
    if (finalTotal < 0) finalTotal = 0;
    
    // Update the Summary Card UI
    const pedIdEl = document.getElementById("tapitas-pedido-id");
    const origTotalEl = document.getElementById("tapitas-original-total");
    const scannedDiscountEl = document.getElementById("tapitas-scanned-discount");
    const subDiscountRow = document.getElementById("tapitas-sub-discount-row");
    const finalTotalEl = document.getElementById("tapitas-final-total");
    
    if (pedIdEl) pedIdEl.textContent = pedidoId;
    if (origTotalEl) origTotalEl.textContent = `$${originalTotal.toFixed(2)} MXN`;
    if (scannedDiscountEl) scannedDiscountEl.textContent = `-$${tapitasDiscount.toFixed(2)} MXN`;
    if (subDiscountRow) {
        if (isSubstitutionAccepted) {
            subDiscountRow.classList.remove("hidden");
        } else {
            subDiscountRow.classList.add("hidden");
        }
    }
    if (finalTotalEl) finalTotalEl.textContent = `$${finalTotal.toFixed(2)} MXN`;
    
    let html = '';
    
    // 1. Tapa Dorada ($10)
    let doradaQty = scannedTapitas.dorada;
    html += `
        <div style="border: 1px solid ${doradaQty > 0 ? '#C3E6CB' : 'var(--border-color)'}; background-color: ${doradaQty > 0 ? '#D4EDDA' : '#F8F9FA'}; padding: 15px; border-radius: 10px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-sm); opacity: ${doradaQty > 0 ? '1' : '0.6'}; transition: all 0.3s;">
            <span style="font-size: 2.5rem; filter: ${doradaQty > 0 ? 'none' : 'grayscale(100%)'};">🪙</span>
            <div>
                <h5 style="color: ${doradaQty > 0 ? '#155724' : 'var(--text-secondary)'}; font-size: 0.95rem; margin-bottom: 2px; font-weight: 700;">Tapa Dorada</h5>
                <p style="color: ${doradaQty > 0 ? '#155724' : 'var(--text-secondary)'}; font-size: 0.78rem; margin: 0;"><b>Valor:</b> $10.00 MXN</p>
                <span class="badge-status ${doradaQty > 0 ? 'green' : 'gray'}" style="font-size: 0.65rem; margin-top: 5px; display: inline-block;">
                    ${doradaQty > 0 ? `Digitalizadas: ${doradaQty} (-$${(doradaQty*10).toFixed(2)})` : 'Sin registrar'}
                </span>
            </div>
        </div>
    `;
    
    // 2. Tapa Roja ($5)
    let rojaQty = scannedTapitas.roja;
    html += `
        <div style="border: 1px solid ${rojaQty > 0 ? '#C3E6CB' : 'var(--border-color)'}; background-color: ${rojaQty > 0 ? '#D4EDDA' : '#F8F9FA'}; padding: 15px; border-radius: 10px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-sm); opacity: ${rojaQty > 0 ? '1' : '0.6'}; transition: all 0.3s;">
            <span style="font-size: 2.5rem; filter: ${rojaQty > 0 ? 'none' : 'grayscale(100%)'};">🔴</span>
            <div>
                <h5 style="color: ${rojaQty > 0 ? '#155724' : 'var(--text-secondary)'}; font-size: 0.95rem; margin-bottom: 2px; font-weight: 700;">Tapa Roja</h5>
                <p style="color: ${rojaQty > 0 ? '#155724' : 'var(--text-secondary)'}; font-size: 0.78rem; margin: 0;"><b>Valor:</b> $5.00 MXN</p>
                <span class="badge-status ${rojaQty > 0 ? 'green' : 'gray'}" style="font-size: 0.65rem; margin-top: 5px; display: inline-block;">
                    ${rojaQty > 0 ? `Digitalizadas: ${rojaQty} (-$${(rojaQty*5).toFixed(2)})` : 'Sin registrar'}
                </span>
            </div>
        </div>
    `;
    
    // 3. Tapa Verde ($2)
    let verdeQty = scannedTapitas.verde;
    html += `
        <div style="border: 1px solid ${verdeQty > 0 ? '#C3E6CB' : 'var(--border-color)'}; background-color: ${verdeQty > 0 ? '#D4EDDA' : '#F8F9FA'}; padding: 15px; border-radius: 10px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-sm); opacity: ${verdeQty > 0 ? '1' : '0.6'}; transition: all 0.3s;">
            <span style="font-size: 2.5rem; filter: ${verdeQty > 0 ? 'none' : 'grayscale(100%)'};">🟢</span>
            <div>
                <h5 style="color: ${verdeQty > 0 ? '#155724' : 'var(--text-secondary)'}; font-size: 0.95rem; margin-bottom: 2px; font-weight: 700;">Tapa Verde</h5>
                <p style="color: ${verdeQty > 0 ? '#155724' : 'var(--text-secondary)'}; font-size: 0.78rem; margin: 0;"><b>Valor:</b> $2.00 MXN</p>
                <span class="badge-status ${verdeQty > 0 ? 'green' : 'gray'}" style="font-size: 0.65rem; margin-top: 5px; display: inline-block;">
                    ${verdeQty > 0 ? `Digitalizadas: ${verdeQty} (-$${(verdeQty*2).toFixed(2)})` : 'Sin registrar'}
                </span>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

window.simulateTapitasScan = function() {
    const btnScan = document.getElementById("btn-scan-tapitas");
    const scanAnim = document.getElementById("scan-animation-container");
    
    if (!btnScan || !scanAnim) return;
    
    // Disable button and show scan animation
    btnScan.disabled = true;
    btnScan.textContent = "⌛ Escaneando Tapitas...";
    scanAnim.classList.remove("hidden");
    
    setTimeout(() => {
        // Hide scan animation and reset button
        scanAnim.classList.add("hidden");
        btnScan.disabled = false;
        btnScan.textContent = "📸 Escanear Tapitas Recibidas";
        
        // Randomly scan a combination of tapitas:
        // We will scan:
        // - 1 Tapa Dorada ($10)
        // - 1 Tapa Roja ($5)
        // - 2 Tapas Verdes ($2 x 2 = $4)
        // Total value = $19.00 MXN
        scannedTapitas.dorada += 1;
        scannedTapitas.roja += 1;
        scannedTapitas.verde += 2;
        
        const scanValue = 19.00;
        tapitasDiscount += scanValue;
        
        // Trigger Canvas Confetti
        confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.8 }
        });
        
        // Custom popup notification
        alert("¡Escaneo Exitoso!\n\nSe detectaron: 1 Tapa Dorada ($10), 1 Tapa Roja ($5) y 2 Tapas Verdes ($4).\nSe ha aplicado un descuento de $19.00 MXN directamente a tu pedido.");
        
        // Re-render wallet and update summary card
        renderFichitasWallet();
        updateCartUI();
        
    }, 1800);
};

window.changeProductQty = function(productKey, delta) {
    if (cartQuantities[productKey] === undefined) return;
    cartQuantities[productKey] = Math.max(0, cartQuantities[productKey] + delta);
    
    const qtyInput = document.getElementById(`qty-${productKey}`);
    if (qtyInput) {
        qtyInput.value = cartQuantities[productKey];
    }
    updateCartUI();
};

window.updateCartUI = function() {
    const container = document.getElementById("cart-items-container");
    if (!container) return;

    let subtotal = 0;
    let hasItems = false;
    let html = "";

    for (const key in cartQuantities) {
        const qty = cartQuantities[key];
        if (qty > 0) {
            hasItems = true;
            const itemTotal = qty * productPrices[key];
            subtotal += itemTotal;
            html += `
                <div class="cart-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(0,0,0,0.05);">
                    <span style="font-weight: 600; color: var(--text-primary);">${productEmojis[key]} ${qty}x ${productNames[key]}</span>
                    <span style="font-weight: 700; color: var(--coca-red);">$${itemTotal.toFixed(2)} MXN</span>
                </div>
            `;
        }
    }

    if (!hasItems) {
        container.innerHTML = `<div class="cart-empty-msg">Tu carrito está vacío. Agrega productos más vendidos a tu orden.</div>`;
    } else {
        container.innerHTML = html;
    }

    // Update Totals
    const subtotalEl = document.getElementById("cart-subtotal");
    const scannedDiscountEl = document.getElementById("cart-tapitas-discount");
    const subDiscountRow = document.getElementById("cart-sub-discount-row");
    const finalTotalEl = document.getElementById("cart-total");

    let subDiscount = isSubstitutionAccepted ? 10.00 : 0.00;
    let finalTotal = subtotal - tapitasDiscount - subDiscount;
    if (finalTotal < 0) finalTotal = 0;

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)} MXN`;
    if (scannedDiscountEl) scannedDiscountEl.textContent = `-$${tapitasDiscount.toFixed(2)} MXN`;
    if (subDiscountRow) {
        if (isSubstitutionAccepted) {
            subDiscountRow.classList.remove("hidden");
        } else {
            subDiscountRow.classList.add("hidden");
        }
    }
    if (finalTotalEl) finalTotalEl.textContent = `$${finalTotal.toFixed(2)} MXN`;
};

window.confirmAndSubmitOrder = function() {
    let totalQty = 0;
    for (const key in cartQuantities) {
        totalQty += cartQuantities[key];
    }
    
    if (totalQty === 0) {
        alert("⚠️ Tu carrito está vacío. Por favor, selecciona al menos un producto para enviar al CEDI.");
        return;
    }
    
    if (cartQuantities.coke_orig > 0 && !isSubstitutionAccepted) {
        // Trigger Virtual Assistant alert
        alert("⚠️ Alerta de Desabasto: Hemos detectado un posible desabasto para tu pedido de Coca-Cola. Por favor, revisa y acepta la Sustitución Inteligente propuesta en el Asistente Virtual para proceder.");
        
        // Select Coca-Cola in chat product select
        const chatProductSelect = document.getElementById("chat-product-select");
        if (chatProductSelect) {
            chatProductSelect.value = "coke";
            // Dispatch change event to trigger the chat flow
            chatProductSelect.dispatchEvent(new Event('change'));
        }
        
        // Ensure showSubstitutionProposal is called to open the alert box
        setTimeout(() => {
            showSubstitutionProposal();
        }, 300);
        
        return;
    }
    
    // Calculate final payable amount
    let subtotal = 0;
    for (const key in cartQuantities) {
        subtotal += cartQuantities[key] * productPrices[key];
    }
    let subDiscount = isSubstitutionAccepted ? 10.00 : 0.00;
    let finalTotal = subtotal - tapitasDiscount - subDiscount;
    if (finalTotal < 0) finalTotal = 0;
    
    // Checkout simulation success
    confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
    });
    
    alert(`🎉 ¡Pedido enviado con éxito al CEDI!\n\nTu orden ha sido confirmada y enviada para picking.\nTotal Neto a Cobrar: $${finalTotal.toFixed(2)} MXN.\n\n¡Gracias por comprar con Arca Continental! 🥤✨`);
    
    // Clear cart and reset inputs
    for (const key in cartQuantities) {
        cartQuantities[key] = 0;
        const qtyInput = document.getElementById(`qty-${key}`);
        if (qtyInput) qtyInput.value = "0";
    }
    
    updateCartUI();
};

window.handleImageError = function(img, emoji) {
    const container = img.parentNode;
    if (container) {
        container.innerHTML = `<div class="fallback-image-box" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #F1F5F9; border-radius: 8px; font-size: 2.8rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">${emoji}</div>`;
    }
};
