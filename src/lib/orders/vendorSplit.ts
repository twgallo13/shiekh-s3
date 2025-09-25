/**
 * Orders Vendor Split Logic - Development Only
 * Pure client helper for splitting orders across vendors
 * Uses mock vendor data and cost calculations
 */

export interface OrderLine {
  sku: string;
  qty: number;
  vendorId?: string;
  unitCost?: number;
  description?: string;
}

export interface VendorInfo {
  id: string;
  name: string;
  leadTimeDays: number;
  baseCost: number;
  shippingCost: number;
  preferred: boolean;
  reliability: number; // 0-1 scale
}

export interface VendorSplitGroup {
  vendorId: string;
  vendorName: string;
  lines: OrderLine[];
  totalQuantity: number;
  totalCost: number;
  landedCost: number;
  leadTimeDays: number;
  rationale: string;
}

export interface VendorSplitProposal {
  originalLines: OrderLine[];
  splitGroups: VendorSplitGroup[];
  totalSavings: number;
  totalLandedCost: number;
  averageLeadTime: number;
  rationale: string;
}

// Mock vendor database (dev-only)
const MOCK_VENDORS: Record<string, VendorInfo> = {
  'VENDOR-001': {
    id: 'VENDOR-001',
    name: 'TechSupply Pro',
    leadTimeDays: 3,
    baseCost: 1.0,
    shippingCost: 15.00,
    preferred: true,
    reliability: 0.95
  },
  'VENDOR-002': {
    id: 'VENDOR-002',
    name: 'ElectroMax Solutions',
    leadTimeDays: 5,
    baseCost: 0.85,
    shippingCost: 12.00,
    preferred: false,
    reliability: 0.88
  },
  'VENDOR-003': {
    id: 'VENDOR-003',
    name: 'Global Components Inc',
    leadTimeDays: 7,
    baseCost: 0.75,
    shippingCost: 20.00,
    preferred: false,
    reliability: 0.82
  },
  'VENDOR-004': {
    id: 'VENDOR-004',
    name: 'Premium Parts Co',
    leadTimeDays: 2,
    baseCost: 1.15,
    shippingCost: 25.00,
    preferred: true,
    reliability: 0.98
  },
  'VENDOR-005': {
    id: 'VENDOR-005',
    name: 'Budget Electronics',
    leadTimeDays: 10,
    baseCost: 0.65,
    shippingCost: 8.00,
    preferred: false,
    reliability: 0.75
  }
};

// Mock SKU to vendor mapping (dev-only)
const MOCK_SKU_VENDORS: Record<string, string[]> = {
  'SKU-ELEC-001': ['VENDOR-001', 'VENDOR-002', 'VENDOR-004'],
  'SKU-ELEC-002': ['VENDOR-001', 'VENDOR-003', 'VENDOR-005'],
  'SKU-ELEC-003': ['VENDOR-002', 'VENDOR-004', 'VENDOR-005'],
  'SKU-ELEC-004': ['VENDOR-001', 'VENDOR-003', 'VENDOR-004'],
  'SKU-ELEC-005': ['VENDOR-002', 'VENDOR-005'],
  'SKU-COMP-001': ['VENDOR-001', 'VENDOR-004'],
  'SKU-COMP-002': ['VENDOR-002', 'VENDOR-003'],
  'SKU-COMP-003': ['VENDOR-001', 'VENDOR-005'],
  'SKU-COMP-004': ['VENDOR-003', 'VENDOR-004'],
  'SKU-COMP-005': ['VENDOR-002', 'VENDOR-005']
};

/**
 * Calculate landed cost for a vendor
 */
function calculateLandedCost(vendor: VendorInfo, lines: OrderLine[]): number {
  const totalQuantity = lines.reduce((sum, line) => sum + line.qty, 0);
  const baseCost = lines.reduce((sum, line) => {
    const lineCost = (line.unitCost || 0) * vendor.baseCost;
    return sum + (lineCost * line.qty);
  }, 0);
  
  // Shipping cost is fixed per vendor, amortized across quantity
  const shippingPerUnit = vendor.shippingCost / Math.max(totalQuantity, 1);
  
  return baseCost + (shippingPerUnit * totalQuantity);
}

/**
 * Get candidate vendors for a SKU
 */
function getCandidateVendors(sku: string): VendorInfo[] {
  const vendorIds = MOCK_SKU_VENDORS[sku] || ['VENDOR-001']; // Default fallback
  return vendorIds.map(id => MOCK_VENDORS[id]).filter(Boolean);
}

/**
 * Score vendor for a line item
 */
function scoreVendor(vendor: VendorInfo, lines: OrderLine[]): number {
  const landedCost = calculateLandedCost(vendor, lines);
  const leadTimeScore = 1 / (vendor.leadTimeDays + 1); // Lower lead time = higher score
  const costScore = 1 / (landedCost + 1); // Lower cost = higher score
  const preferredBonus = vendor.preferred ? 1.2 : 1.0;
  const reliabilityScore = vendor.reliability;
  
  // Weighted scoring: cost (40%), lead time (30%), reliability (20%), preferred (10%)
  return (costScore * 0.4 + leadTimeScore * 0.3 + reliabilityScore * 0.2) * preferredBonus;
}

/**
 * Generate vendor split proposal for order lines
 */
export function generateVendorSplitProposal(orderLines: OrderLine[]): VendorSplitProposal {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Vendor split is only available in development mode');
  }

  const splitGroups: VendorSplitGroup[] = [];
  const processedLines = new Set<string>();
  
  // Group lines by SKU for vendor analysis
  const linesBySku = orderLines.reduce((acc, line, index) => {
    const key = `${line.sku}-${index}`; // Include index to handle duplicate SKUs
    if (!acc[line.sku]) {
      acc[line.sku] = [];
    }
    acc[line.sku].push({ ...line, _key: key });
    return acc;
  }, {} as Record<string, (OrderLine & { _key: string })[]>);

  // Process each SKU group
  for (const [sku, lines] of Object.entries(linesBySku)) {
    if (lines.some(line => processedLines.has(line._key))) continue;
    
    const candidateVendors = getCandidateVendors(sku);
    if (candidateVendors.length === 0) continue;
    
    // Score all vendors for this SKU
    const vendorScores = candidateVendors.map(vendor => ({
      vendor,
      score: scoreVendor(vendor, lines)
    }));
    
    // Sort by score (highest first)
    vendorScores.sort((a, b) => b.score - a.score);
    
    // Create split group for the best vendor
    const bestVendor = vendorScores[0].vendor;
    const landedCost = calculateLandedCost(bestVendor, lines);
    
    const group: VendorSplitGroup = {
      vendorId: bestVendor.id,
      vendorName: bestVendor.name,
      lines: lines.map(({ _key, ...line }) => line),
      totalQuantity: lines.reduce((sum, line) => sum + line.qty, 0),
      totalCost: lines.reduce((sum, line) => sum + (line.unitCost || 0) * line.qty, 0),
      landedCost,
      leadTimeDays: bestVendor.leadTimeDays,
      rationale: generateRationale(bestVendor, vendorScores)
    };
    
    splitGroups.push(group);
    lines.forEach(line => processedLines.add(line._key));
  }
  
  // Calculate totals
  const totalLandedCost = splitGroups.reduce((sum, group) => sum + group.landedCost, 0);
  const originalCost = orderLines.reduce((sum, line) => sum + (line.unitCost || 0) * line.qty, 0);
  const totalSavings = originalCost - totalLandedCost;
  const averageLeadTime = splitGroups.reduce((sum, group) => sum + group.leadTimeDays, 0) / splitGroups.length;
  
  return {
    originalLines: orderLines,
    splitGroups,
    totalSavings,
    totalLandedCost,
    averageLeadTime,
    rationale: generateOverallRationale(splitGroups, totalSavings, averageLeadTime)
  };
}

/**
 * Generate rationale for vendor selection
 */
function generateRationale(vendor: VendorInfo, allScores: Array<{ vendor: VendorInfo; score: number }>): string {
  const reasons: string[] = [];
  
  // Check if it's the lowest cost
  const costRank = allScores
    .sort((a, b) => a.vendor.baseCost - b.vendor.baseCost)
    .findIndex(score => score.vendor.id === vendor.id) + 1;
  
  if (costRank === 1) {
    reasons.push('lowest landed cost');
  }
  
  // Check if it's the fastest
  const speedRank = allScores
    .sort((a, b) => a.vendor.leadTimeDays - b.vendor.leadTimeDays)
    .findIndex(score => score.vendor.id === vendor.id) + 1;
  
  if (speedRank === 1) {
    reasons.push('shortest lead time');
  }
  
  // Check if it's preferred
  if (vendor.preferred) {
    reasons.push('preferred vendor');
  }
  
  // Check reliability
  if (vendor.reliability > 0.9) {
    reasons.push('high reliability');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'best overall score';
}

/**
 * Generate overall rationale for the split
 */
function generateOverallRationale(groups: VendorSplitGroup[], savings: number, avgLeadTime: number): string {
  const reasons: string[] = [];
  
  if (savings > 0) {
    reasons.push(`$${savings.toFixed(2)} cost savings`);
  }
  
  if (avgLeadTime <= 5) {
    reasons.push('fast delivery');
  }
  
  const preferredCount = groups.filter(g => {
    const vendor = MOCK_VENDORS[g.vendorId];
    return vendor?.preferred;
  }).length;
  
  if (preferredCount > 0) {
    reasons.push(`${preferredCount} preferred vendor${preferredCount > 1 ? 's' : ''}`);
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'optimized vendor selection';
}

/**
 * Validate vendor split proposal
 */
export function validateVendorSplitProposal(proposal: VendorSplitProposal): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!proposal.splitGroups || proposal.splitGroups.length === 0) {
    errors.push('No vendor groups found');
  }
  
  if (proposal.splitGroups) {
    for (const group of proposal.splitGroups) {
      if (!group.vendorId || !group.vendorName) {
        errors.push('Invalid vendor information in group');
      }
      
      if (!group.lines || group.lines.length === 0) {
        errors.push('Empty vendor group');
      }
      
      if (group.totalQuantity <= 0) {
        errors.push('Invalid quantity in vendor group');
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get all available vendors (for UI dropdowns)
 */
export function getAllVendors(): VendorInfo[] {
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }
  
  return Object.values(MOCK_VENDORS);
}

/**
 * Get vendor by ID
 */
export function getVendorById(vendorId: string): VendorInfo | null {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return MOCK_VENDORS[vendorId] || null;
}

/**
 * Calculate cost impact of vendor change
 */
export function calculateVendorChangeImpact(
  originalGroup: VendorSplitGroup,
  newVendorId: string
): { costChange: number; leadTimeChange: number; impact: string } {
  if (process.env.NODE_ENV !== 'development') {
    return { costChange: 0, leadTimeChange: 0, impact: 'Not available' };
  }
  
  const newVendor = MOCK_VENDORS[newVendorId];
  if (!newVendor) {
    return { costChange: 0, leadTimeChange: 0, impact: 'Invalid vendor' };
  }
  
  const newLandedCost = calculateLandedCost(newVendor, originalGroup.lines);
  const costChange = newLandedCost - originalGroup.landedCost;
  const leadTimeChange = newVendor.leadTimeDays - originalGroup.leadTimeDays;
  
  let impact = '';
  if (costChange < 0) {
    impact += `Saves $${Math.abs(costChange).toFixed(2)}`;
  } else if (costChange > 0) {
    impact += `Costs $${costChange.toFixed(2)} more`;
  }
  
  if (leadTimeChange < 0) {
    impact += impact ? ', ' : '';
    impact += `${Math.abs(leadTimeChange)} days faster`;
  } else if (leadTimeChange > 0) {
    impact += impact ? ', ' : '';
    impact += `${leadTimeChange} days slower`;
  }
  
  if (!impact) {
    impact = 'No significant change';
  }
  
  return { costChange, leadTimeChange, impact };
}
