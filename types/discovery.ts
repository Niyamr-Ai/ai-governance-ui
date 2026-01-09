// src/types/discovery.ts
export interface BaseDiscoveredAIAsset  {
    id: string;
    detected_name: string;
    detected_vendor?: string;
    source_type: string;
    confidence_score: "low" | "medium" | "high";
    environment?: string;
    shadow_status: "potential" | "confirmed" | "resolved";
    linked_system_id?: string;
  }

  
  // src/types/discovery.ts
export interface DiscoveredAIAssetWithTimestamps
extends BaseDiscoveredAIAsset {
discovered_at: string;
last_seen_at: string;
created_at: string;
updated_at: string;
}
