export type SortDirection = "asc" | "desc";

function normalizeComparableValue(value: unknown) {
  const stringValue = String(value ?? "").trim();
  if (!stringValue) {
    return { type: "empty" as const, value: "" };
  }

  const normalizedNumber = Number(stringValue.replace(/\./g, "").replace(",", "."));
  if (!Number.isNaN(normalizedNumber) && /^-?\d[\d.,/:-]*$/.test(stringValue) && !stringValue.includes("/")) {
    return { type: "number" as const, value: normalizedNumber };
  }

  const normalizedDate = Date.parse(stringValue);
  if (!Number.isNaN(normalizedDate)) {
    return { type: "date" as const, value: normalizedDate };
  }

  return { type: "text" as const, value: stringValue.toLowerCase() };
}

export function compareMixedValues(left: unknown, right: unknown) {
  const normalizedLeft = normalizeComparableValue(left);
  const normalizedRight = normalizeComparableValue(right);

  if (normalizedLeft.type === "empty" && normalizedRight.type === "empty") {
    return 0;
  }

  if (normalizedLeft.type === "empty") {
    return 1;
  }

  if (normalizedRight.type === "empty") {
    return -1;
  }

  if (normalizedLeft.type === normalizedRight.type) {
    if (normalizedLeft.value < normalizedRight.value) {
      return -1;
    }

    if (normalizedLeft.value > normalizedRight.value) {
      return 1;
    }

    return 0;
  }

  return String(normalizedLeft.value).localeCompare(String(normalizedRight.value), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

export function sortCollectionByField<T extends Record<string, unknown>>(
  items: T[],
  fieldName: string,
  direction: SortDirection,
) {
  const directionFactor = direction === "asc" ? 1 : -1;

  return [...items].sort((leftItem, rightItem) => {
    const comparison = compareMixedValues(leftItem[fieldName], rightItem[fieldName]);
    return comparison * directionFactor;
  });
}
