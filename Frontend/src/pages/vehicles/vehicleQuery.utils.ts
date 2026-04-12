import type { Vehicle } from "../../types/vehicle";

const dateFields = new Set(["data_referencia_documentacao"]);

function formatBrazilianDate(value: unknown) {
  if (!value) return "-";

  const stringValue = String(value);
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(stringValue);

  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  return stringValue;
}

export function formatVehicleValue(vehicle: Vehicle, field: string) {
  if (field === "municipality_name") {
    return vehicle.municipality_name || vehicle.cod_municipio || "-";
  }

  const value = (vehicle as Record<string, unknown>)[field];

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (dateFields.has(field)) {
    return formatBrazilianDate(value);
  }

  return String(value);
}
