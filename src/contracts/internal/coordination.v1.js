/**
 * @typedef {Object} CoordinationRequestV1
 * @property {string} briefing
 * @property {string} persona
 * @property {string} objetivo
 * @property {string[]=} keywords
 */

/**
 * @typedef {Object} CoordinationResultV1
 * // Estrutura interna pode divergir no futuro.
 * // Por ora, mantenha igual ao CampaignOrchestratorOutputV1.campaignPlan
 * @property {string} briefing
 * @property {string} persona
 * @property {string} objetivo
 * @property {{ term:string, matchType:"exact"|"phrase"|"broad" }[]} keywords
 * @property {{ channel:"Meta Ads"|"Google Search", headline:string, primaryText?:string, description?:string, path?:string, cta:string }[]} adCopies
 * @property {{ total:number, allocation:{channel:string, percent:number}[] }} budget
 * @property {string[]} kpis
 * @property {{ etapa:number, descricao:string, outputRef?:string }[]} etapas
 */
export {};
// src/contracts/internal/coordination.v1.js
// Esse é contrato interno/canônico (p/ comunicação entre agentes)
// Não deve ser exposto externamente.
