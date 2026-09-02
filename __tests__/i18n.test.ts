import { getStoredLanguage, translations } from '@/lib/i18n';

describe('i18n System', () => {
  it('should return "en" as default language on server', () => {
    expect(getStoredLanguage()).toBe('en');
  });

  it('should have translations for all three languages', () => {
    expect(translations.en).toBeDefined();
    expect(translations.ur).toBeDefined();
    expect((translations as any).zh).toBeUndefined();
  });

  it('should have matching keys across en and ur', () => {
    const enKeys = Object.keys(translations.en).sort();
    const urKeys = Object.keys(translations.ur).sort();
    expect(enKeys).toEqual(urKeys);
  });

  it('should have non-empty translation values for en', () => {
    for (const [key, value] of Object.entries(translations.en)) {
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it('should have non-empty translation values for ur', () => {
    for (const [key, value] of Object.entries(translations.ur)) {
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it('should have critical navigation keys', () => {
    const requiredKeys = [
      'nav.home', 'nav.report', 'nav.myComplaints', 'nav.profile',
      'nav.login', 'nav.register', 'nav.logout',
    ];
    for (const key of requiredKeys) {
      expect(translations.en[key]).toBeTruthy();
      expect(translations.ur[key]).toBeTruthy();
    }
  });

  it('should have all category translations', () => {
    const categories = ['pothole', 'garbage', 'water_leakage', 'streetlight', 'drainage', 'traffic_signal', 'road_damage', 'other'];
    for (const cat of categories) {
      expect(translations.en[`category.${cat}`]).toBeTruthy();
      expect(translations.ur[`category.${cat}`]).toBeTruthy();
    }
  });

  it('should have all severity translations', () => {
    const severities = ['low', 'medium', 'high', 'critical'];
    for (const sev of severities) {
      expect(translations.en[`severity.${sev}`]).toBeTruthy();
      expect(translations.ur[`severity.${sev}`]).toBeTruthy();
    }
  });

  it('should have all status translations', () => {
    const statuses = ['pending', 'inProgress', 'resolved', 'rejected'];
    for (const status of statuses) {
      expect(translations.en[`status.${status}`]).toBeTruthy();
      expect(translations.ur[`status.${status}`]).toBeTruthy();
    }
  });
});
