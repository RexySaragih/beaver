/**
 * Model Configuration for Diagram Analysis
 *
 * This file previously allowed switching between different models for diagram analysis.
 * All Xenova/transformers-based models have been removed as per project update.
 */

export interface ModelConfig {
  name: string;
  type: string;
  description: string;
  available: boolean;
  recommended: boolean;
}

export const AVAILABLE_MODELS: ModelConfig[] = [];

export function getRecommendedModel(): ModelConfig {
  throw new Error('No available models found for diagram analysis. Local transformers-based models are no longer supported.');
}

export function getModelConfig(modelName: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(model => model.name === modelName);
}

export function listAvailableModels(): ModelConfig[] {
  return AVAILABLE_MODELS.filter(model => model.available);
}

export function listAllModels(): ModelConfig[] {
  return AVAILABLE_MODELS;
} 