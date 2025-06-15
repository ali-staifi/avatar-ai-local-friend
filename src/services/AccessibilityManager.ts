
export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private announcements: HTMLElement | null = null;
  private highContrastMode = false;
  private reducedMotion = false;

  private constructor() {
    this.createAriaLiveRegion();
    this.detectUserPreferences();
    this.setupFocusManagement();
  }

  public static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  private createAriaLiveRegion(): void {
    this.announcements = document.createElement('div');
    this.announcements.setAttribute('aria-live', 'polite');
    this.announcements.setAttribute('aria-atomic', 'true');
    this.announcements.style.position = 'absolute';
    this.announcements.style.left = '-10000px';
    this.announcements.style.width = '1px';
    this.announcements.style.height = '1px';
    this.announcements.style.overflow = 'hidden';
    document.body.appendChild(this.announcements);
  }

  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (this.announcements) {
      this.announcements.setAttribute('aria-live', priority);
      this.announcements.textContent = message;
      console.log('📢 Annonce accessibilité:', message);
    }
  }

  public setHighContrastMode(enabled: boolean): void {
    this.highContrastMode = enabled;
    document.documentElement.classList.toggle('high-contrast', enabled);
    localStorage.setItem('high-contrast-mode', enabled.toString());
    this.announce(enabled ? 'Mode contraste élevé activé' : 'Mode contraste élevé désactivé');
  }

  public getHighContrastMode(): boolean {
    return this.highContrastMode;
  }

  public setReducedMotion(enabled: boolean): void {
    this.reducedMotion = enabled;
    document.documentElement.classList.toggle('reduced-motion', enabled);
    localStorage.setItem('reduced-motion', enabled.toString());
  }

  public getReducedMotion(): boolean {
    return this.reducedMotion;
  }

  private detectUserPreferences(): void {
    // Détecter les préférences système
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.setReducedMotion(true);
    }

    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.setHighContrastMode(true);
    }

    // Charger les préférences sauvegardées
    const savedHighContrast = localStorage.getItem('high-contrast-mode');
    if (savedHighContrast) {
      this.setHighContrastMode(savedHighContrast === 'true');
    }

    const savedReducedMotion = localStorage.getItem('reduced-motion');
    if (savedReducedMotion) {
      this.setReducedMotion(savedReducedMotion === 'true');
    }
  }

  private setupFocusManagement(): void {
    // Améliorer la visibilité du focus
    const style = document.createElement('style');
    style.textContent = `
      .focus-visible {
        outline: 3px solid var(--focus-color, #2563eb) !important;
        outline-offset: 2px !important;
      }
      
      .high-contrast {
        --focus-color: #ffff00;
        --bg-primary: #000000;
        --text-primary: #ffffff;
        --border-color: #ffffff;
      }
      
      .high-contrast * {
        background-color: var(--bg-primary) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-color) !important;
      }
      
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }

  public manageFocus(element: HTMLElement): void {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  public createSkipLink(targetId: string, text: string): HTMLElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded';
    return skipLink;
  }
}

export const accessibilityManager = AccessibilityManager.getInstance();
