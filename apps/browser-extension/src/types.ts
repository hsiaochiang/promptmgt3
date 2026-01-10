/**
 * WOS (Work Operating System) Tagging Protocol
 * L1: Intent (意圖)
 * L2: Structure (結構/框架)
 * L3: Project (專案)
 */
export enum WOSPrefix {
  Intent = 'Intent',
  Structure = 'Structure',
  Project = 'Project',
}

export type WOSLevel = 'L1' | 'L2' | 'L3';

/**
 * Extension 內部的 Prompt 資料結構
 */
export interface Prompt {
  id?: string;
  title: string;
  body: string;
  tags: string[];
  projectId: string; // 必須關聯到一個專案

  // UI 表單欄位，送出前會被轉換
  models?: string[];
  sourceUrl?: string;

  // 額外中繼資料容器
  metadata?: PromptMetadata;
}

/**
 * 用於 API Payload 的中繼資料介面
 * 包含 models, source_url 等尚未被後端正式 Schema 支援的欄位
 */
export interface PromptMetadata {
  models?: string[];
  source_url?: string;
  [key: string]: any;
}

export interface CreatePromptPayload {
  title: string;
  body: string;
  tags?: string[];
  sourceUrl?: string; // URL of the page being clipped
}