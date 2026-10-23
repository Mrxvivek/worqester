import { StorageService } from "./storage";
import { AuthService } from "./auth";

let lastClickTime = 0;
let lastClickedText = "";

export class ActivityTracker {
  private static instanceStarted = false;

  static init() {
    if (this.instanceStarted || typeof window === "undefined") return;
    this.instanceStarted = true;

    // Track clicks on meaningful UI elements
    window.addEventListener(
      "click",
      (e) => {
        try {
          const user = AuthService.getStoredUser();
          if (!user) return;

          const target = e.target as HTMLElement | null;
          if (!target) return;

          // Find closest button or link or interactive element
          const interactive = target.closest("button, a, [role='button'], input[type='submit'], select");
          if (!interactive) return;

          const text = (interactive.textContent || interactive.getAttribute("aria-label") || interactive.getAttribute("title") || "").trim();
          if (!text || text.length > 50) return;

          const now = Date.now();
          // Debounce repeated clicks within 1.5 seconds on same element
          if (now - lastClickTime < 1500 && lastClickedText === text) return;
          lastClickTime = now;
          lastClickedText = text;

          StorageService.addAuditLog({
            userName: user.name,
            userRole: user.role,
            action: "User Click",
            entityType: "UI Element",
            entityName: text.substring(0, 30),
            details: `Clicked "${text}" button/action`,
          });
        } catch {}
      },
      { capture: true, passive: true }
    );

    // Track page unload / logout disconnect
    window.addEventListener("beforeunload", () => {
      try {
        const user = AuthService.getStoredUser();
        const token = AuthService.getToken();
        if (!user || !token) return;

        const payload = JSON.stringify({
          action: "Session Exit",
          entityType: "AuthSession",
          entityName: user.email,
          details: `User closed browser tab or disconnected from workspace`,
        });

        if (typeof fetch === "function") {
          fetch("/api/settings/audit-logs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        } else if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/settings/audit-logs", blob);
        }
      } catch {}
    });
  }

  static trackNavigation(view: string, subView?: string) {
    const user = AuthService.getStoredUser();
    if (!user) return;

    StorageService.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: "View Navigation",
      entityType: "Module",
      entityName: view.toUpperCase(),
      details: `Switched to ${view} view ${subView ? `(${subView})` : ""}`,
    });
  }
}
