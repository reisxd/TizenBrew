"use strict";
window.begin = function() {
    // Check if IP was set
    localStorage.setItem("ip", "127.0.0.1");
    if (localStorage.getItem('modules') == null) localStorage.setItem('modules', '[]');
    if (localStorage.getItem("ip") == null) {
        // Set IP by prompt
        selectedItem.innerHTML = `
        <div class="has-mb-12">
            <h5 class="has-text-light">Set Server IP</h5>
            <label class="label">Server IP:</label>
            <input type="text" class="input" placeholder="192.168.1.3" id="ip">
        </div>
        `;
        // Focus on input
        const input = document.getElementById("ip");
        input.focus();
        input.onblur = () => {
            // Set IP
            localStorage.setItem("ip", input.value);
            alert("Set IP to " + input.value);
            // Reload page
            window.location.reload();
        }
    } else {
        connect();
    }
}