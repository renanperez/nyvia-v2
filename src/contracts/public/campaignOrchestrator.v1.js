/**
 * @typedef {Object} CampaignOrchestratorInputV1
 * @property {string} briefing
 * @property {string} persona
 * @property {string} objetivo
 * @property {string[]=} keywords
 */

/**
 * @typedef {Object} KeywordItem
 * @property {string} term
 * @property {"exact"|"phrase"|"broad"} matchType
 */

/**
 * @typedef {Object} AdCopyItem
 * @property {"Meta Ads"|"Google Search"} channel
 * @property {string} headline
 * @property {string=} primaryText
 * @property {string=} description
 * @property {string=} path
 * @property {string} cta
 */

/**
 * @typedef {Object} CampaignPlanV1
 * @property {string} briefing
 * @property {string} persona
 * @property {string} objetivo
 * @property {KeywordItem[]} keywords
 * @property {AdCopyItem[]} adCopies
 * @property {{ total:number, allocation: {channel:string, percent:number}[] }} budget
 * @property {string[]} kpis
 * @property {{ etapa:number, descricao:string, outputRef?:string }[]} etapas
 */

/**
 * @typedef {Object} CampaignOrchestratorOutputV1
 * @property {"success"} status
 * @property {"mock"|"openai"} source
 * @property {CampaignPlanV1} campaignPlan
 * @property {any[]=} logs
 */
export {};
// src/contracts/campaignOrchestrator.v1.js
// Esse é contrato (público/externo)
// Não deve ser alterado sem uma boa razão.
