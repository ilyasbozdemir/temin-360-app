import { describe, it, expect } from 'vitest';
import { resolveMemberVisibility } from '../services/memberVisibilityResolver';

describe('memberVisibilityResolver — Current Behavior Test Suite', () => {
  describe('1. Member Special Exceptions (Üyeye Özel İstisnalar)', () => {
    it('should respect single document exception in array format', () => {
      const member = {
        id: 1,
        gorev: 'Üye',
        exceptions: [
          { target: 'harcama-talimati', durum: 'show' as const },
          { target: 'muayene-kabul-tutanagi', durum: 'hide' as const }
        ]
      };

      const resShow = resolveMemberVisibility(member, 'harcama-talimati');
      expect(resShow.gorunur).toBe(true);
      expect(resShow.source).toBe('member_exception');

      const resHide = resolveMemberVisibility(member, 'muayene-kabul-tutanagi');
      expect(resHide.gorunur).toBe(false);
      expect(resHide.source).toBe('member_exception');
    });

    it('should respect exceptions in object dictionary format', () => {
      const member = {
        id: 2,
        gorev: 'Üye',
        exceptions: {
          'harcama-talimati': 'show' as const,
          'muayene-kabul-tutanagi': 'hide' as const
        }
      };

      const resShow = resolveMemberVisibility(member, 'harcama-talimati');
      expect(resShow.gorunur).toBe(true);
      expect(resShow.source).toBe('member_exception');

      const resHide = resolveMemberVisibility(member, 'muayene-kabul-tutanagi');
      expect(resHide.gorunur).toBe(false);
      expect(resHide.source).toBe('member_exception');
    });

    it('should respect tag/group exceptions (tag:olur_onay)', () => {
      const member = {
        id: 3,
        gorev: 'Üye',
        exceptions: [
          { target: 'tag:olur_onay', durum: 'show' as const },
          { target: 'tag:piyasa_arastirma', durum: 'hide' as const }
        ]
      };

      const resOlur = resolveMemberVisibility(member, 'harcama-talimati');
      expect(resOlur.gorunur).toBe(true);
      expect(resOlur.source).toBe('group_exception');

      const resPiyasa = resolveMemberVisibility(member, 'piyasa-fiyat-arastirma-tutanagi');
      expect(resPiyasa.gorunur).toBe(false);
      expect(resPiyasa.source).toBe('group_exception');
    });
  });

  describe('2. belgeSablonIds (Allowed Template IDs / Allowlist)', () => {
    it('should hide member if belgeSablonIds is empty array', () => {
      const member = {
        id: 4,
        gorev: 'Üye',
        belgeSablonIds: []
      };

      const res = resolveMemberVisibility(member, 'harcama-talimati');
      expect(res.gorunur).toBe(false);
      expect(res.source).toBe('member_exception');
    });

    it('should show member if target template is in belgeSablonIds list', () => {
      const member = {
        id: 5,
        gorev: 'Üye',
        belgeSablonIds: ['harcama-talimati', 'piyasa-fiyat-arastirma-tutanagi']
      };

      const resMatch = resolveMemberVisibility(member, 'harcama-talimati');
      expect(resMatch.gorunur).toBe(true);
      expect(resMatch.source).toBe('member_exception');

      const resNoMatch = resolveMemberVisibility(member, 'muayene-kabul-tutanagi');
      expect(resNoMatch.gorunur).toBe(false);
      expect(resNoMatch.source).toBe('member_exception');
    });

    it('should support wildcard "*" or "all" in belgeSablonIds', () => {
      const member = {
        id: 6,
        gorev: 'Üye',
        belgeSablonIds: ['*']
      };

      const res = resolveMemberVisibility(member, 'muayene-kabul-tutanagi');
      // Should fall through to template rule or fallback
      expect(res.source).not.toBe('member_exception');
    });

    it('should parse JSON string in belge_sablon_ids', () => {
      const member = {
        id: 7,
        gorev: 'Üye',
        belge_sablon_ids: JSON.stringify(['harcama-talimati'])
      };

      const resMatch = resolveMemberVisibility(member, 'harcama-talimati');
      expect(resMatch.gorunur).toBe(true);

      const resNoMatch = resolveMemberVisibility(member, 'muayene-kabul-tutanagi');
      expect(resNoMatch.gorunur).toBe(false);
    });
  });

  describe('3. Legacy Scope Support (belge_kapsami & hedef_belgeler)', () => {
    it('should handle belge_kapsami = "gizli"', () => {
      const member = {
        id: 8,
        gorev: 'Üye',
        belge_kapsami: 'gizli'
      };

      const res = resolveMemberVisibility(member, 'harcama-talimati');
      expect(res.gorunur).toBe(false);
      expect(res.source).toBe('member_exception');
    });

    it('should handle belge_kapsami = "ozel" with hedef_belgeler list', () => {
      const member = {
        id: 9,
        gorev: 'Üye',
        belge_kapsami: 'ozel',
        hedef_belgeler: ['harcama-talimati']
      };

      const resMatch = resolveMemberVisibility(member, 'harcama-talimati');
      expect(resMatch.gorunur).toBe(true);

      const resNoMatch = resolveMemberVisibility(member, 'muayene-kabul-tutanagi');
      expect(resNoMatch.gorunur).toBe(false);
    });

    it('should handle group scope like piyasa_arastirma', () => {
      const member = {
        id: 10,
        gorev: 'Üye',
        belge_kapsami: 'piyasa_arastirma'
      };

      const resMatch = resolveMemberVisibility(member, 'piyasa-fiyat-arastirma-tutanagi');
      expect(resMatch.gorunur).toBe(true);

      const resNoMatch = resolveMemberVisibility(member, 'muayene-kabul-tutanagi');
      expect(resNoMatch.gorunur).toBe(false);
    });
  });

  describe('4. Priority Rules & Role Conflicts', () => {
    it('should give member exception higher priority over role visibility hide policy', () => {
      // Harcama Yetkilisi is hidden in piyasa-fiyat-arastirma-tutanagi by template policy.
      // But if member has explicit exception 'show' for that template:
      const memberWithException = {
        id: 11,
        gorev: 'Harcama Yetkilisi',
        exceptions: [{ target: 'piyasa-fiyat-arastirma-tutanagi', durum: 'show' as const }]
      };

      const res = resolveMemberVisibility(memberWithException, 'piyasa-fiyat-arastirma-tutanagi');
      expect(res.gorunur).toBe(true);
      expect(res.source).toBe('member_exception');
    });

    it('should enforce template hide policy when no explicit member exception exists', () => {
      const member = {
        id: 12,
        gorev: 'Harcama Yetkilisi'
      };

      const res = resolveMemberVisibility(member, 'piyasa-fiyat-arastirma-tutanagi');
      expect(res.gorunur).toBe(false);
      expect(res.source).toBe('template_rule');
    });
  });

  describe('5. Input Handling & Edge Cases', () => {
    it('should handle null or undefined member safely', () => {
      const resNull = resolveMemberVisibility(null, 'harcama-talimati');
      expect(resNull.gorunur).toBe(false);
      expect(resNull.source).toBe('fallback');

      const resUndefined = resolveMemberVisibility(undefined, 'harcama-talimati');
      expect(resUndefined.gorunur).toBe(false);
      expect(resUndefined.source).toBe('fallback');
    });

    it('should handle array of document IDs input', () => {
      const member = {
        id: 13,
        gorev: 'Üye',
        belgeSablonIds: ['harcama-talimati']
      };

      const res = resolveMemberVisibility(member, ['idare-onay-belgesi', 'harcama-talimati']);
      expect(res.gorunur).toBe(true);
    });

    it('should default to fallback show when no rules or exceptions match', () => {
      const legacyMember = {
        ad_soyad: 'Ahmet Yılmaz',
        unvan: 'Memur'
      };

      const res = resolveMemberVisibility(legacyMember, 'harcama-talimati');
      expect(res.gorunur).toBe(true);
      expect(res.source).toBe('fallback');
    });
  });
});
