"use strict";
window.begin = function() {
    // Check if IP was set
    localStorage.setItem("ip", "127.0.0.1");
    if (localStorage.getItem('modules') == null) localStorage.setItem('modules', '[{ "name": "@foxreis/tizentube", "type": "npm" }]');
    if (localStorage.getItem('failedStartupAttempts') == null) localStorage.setItem('failedStartupAttempts', '0');
    connect();
}