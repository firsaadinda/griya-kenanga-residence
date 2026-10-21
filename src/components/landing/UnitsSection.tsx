"use client";

import {
  UnitDetailInteractiveShowcase,
  UNIT_TYPES_DATA,
} from "@/components/units/UnitDetailInteractiveShowcase";

export interface UnitsSectionProps {
  id?: string;
  selectedTypeId?: "standar" | "ac" | "studio";
  onSelectTypeId?: (typeId: "standar" | "ac" | "studio") => void;
}

export function UnitsSection({
  id = "units-section",
  selectedTypeId,
  onSelectTypeId,
}: UnitsSectionProps) {
  return (
    <UnitDetailInteractiveShowcase
      id={id}
      selectedTypeId={selectedTypeId}
      onSelectTypeId={onSelectTypeId}
    />
  );
}

export { UnitDetailInteractiveShowcase, UNIT_TYPES_DATA };
export type {
  UnitTypeData,
  PhotoDetailItem,
} from "@/components/units/UnitDetailInteractiveShowcase";
