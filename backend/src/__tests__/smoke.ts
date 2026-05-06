import { describe, it, expect } from 'vitest';
import { AI_TOOLS, isAiTool, getAiTool, getPurchaseOptions, BUNDLES, DAY_PASS, TIER_MULTIPLIERS } from '../registry/aiTools';
import { parseVevitAuth } from '../middleware/auth';

describe('AI Tool Registry', () => {
  it('should have all expected AI tools', () => {
    expect(Object.keys(AI_TOOLS)).toHaveLength(15);
  });

  it('isAiTool returns true for known tools', () => {
    expect(isAiTool('translate')).toBe(true);
    expect(isAiTool('ai-chat')).toBe(true);
    expect(isAiTool('pdf-merge')).toBe(false);
  });

  it('getAiTool returns definition', () => {
    const tool = getAiTool('ai-chat');
    expect(tool).toBeDefined();
    expect(tool!.freeLimit).toBe(20);
    expect(tool!.extraCostXp).toBe(15);
  });

  it('tier multipliers are correct', () => {
    expect(TIER_MULTIPLIERS.free).toBe(1);
    expect(TIER_MULTIPLIERS.bronze).toBe(2);
    expect(TIER_MULTIPLIERS.silver).toBe(5);
    expect(TIER_MULTIPLIERS.gold).toBe(Infinity);
  });

  it('bundles exist for each category', () => {
    expect(BUNDLES).toHaveLength(3);
    const categories = BUNDLES.map(b => b.category);
    expect(categories).toContain('text');
    expect(categories).toContain('vision');
    expect(categories).toContain('pdf');
  });

  it('day pass is defined', () => {
    expect(DAY_PASS.xpCost).toBe(400);
    expect(DAY_PASS.durationHours).toBe(24);
  });

  it('purchase options include credit, bundle, day-pass', () => {
    const opts = getPurchaseOptions('ai-chat', 500);
    expect(opts).toHaveLength(3);
    expect(opts[0].key).toBe('credit:ai-chat');
    expect(opts[1].key).toBe('bundle:text-10');
    expect(opts[2].key).toBe('day-pass');
    expect(opts.every(o => o.affordable)).toBe(true);
  });

  it('purchase options mark unaffordable correctly', () => {
    const opts = getPurchaseOptions('ai-chat', 5);
    expect(opts[0].affordable).toBe(false);
  });
});

describe('Auth cookie parsing', () => {
  it('parses valid vevit_auth cookie', () => {
    const data = { id: 'abc-123', nickname: 'TestUser', tier: 'free' };
    const encoded = encodeURIComponent(JSON.stringify(data));
    const result = parseVevitAuth(encoded);
    expect(result).toEqual(data);
  });

  it('returns null for invalid cookie', () => {
    expect(parseVevitAuth('not-valid-json')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseVevitAuth('')).toBeNull();
  });
});