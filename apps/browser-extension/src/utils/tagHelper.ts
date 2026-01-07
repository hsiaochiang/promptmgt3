import { WOSLevel, WOSPrefix } from '../types';

const LEVEL_PREFIX_MAP: Record<WOSLevel, WOSPrefix> = {
  'L1': WOSPrefix.Intent,
  'L2': WOSPrefix.Structure,
  'L3': WOSPrefix.Project,
};

/**
 * 格式化 WOS 標籤
 * @param type 層級 (L1, L2, L3)
 * @param value 標籤值
 * @returns 格式化後的字串 (例如: "Intent:Coding")
 * 
 * @example
 * formatWOSTag('L1', 'Coding') // returns "Intent:Coding"
 */
export function formatWOSTag(type: WOSLevel, value: string): string {
  const prefix = LEVEL_PREFIX_MAP[type];
  return `${prefix}:${value}`;
}