// @ts-check

/**
 * @typedef {import("../generated/api").CartTransformRunInput} CartTransformRunInput
 * @typedef {import("../generated/api").CartTransformRunResult} CartTransformRunResult
 */

const FREE_ITEM_MAP = {
  "gid://shopify/ProductVariant/50708418724155": "gid://shopify/ProductVariant/50708419313979",
  "gid://shopify/ProductVariant/50708418789691": "gid://shopify/ProductVariant/50708419281211",
};

/**
 * @param {CartTransformRunInput} input
 * @returns {CartTransformRunResult}
 */
export function cartTransformRun(input) {
  const operations = [];
  const parentQtyMap = {};

  for (const line of input.cart.lines) {
    const merch = line.merchandise;

    if (merch.__typename !== "ProductVariant") {
      continue;
    }

    if (FREE_ITEM_MAP[merch.id]) {
      parentQtyMap[merch.id] = (parentQtyMap[merch.id] || 0) + line.quantity;
    }
  }

  for (const [parentId, giftId] of Object.entries(FREE_ITEM_MAP)) {
    const parentQty = parentQtyMap[parentId] || 0;

    if (parentQty === 0) {
      continue;
    }

    const giftLine = input.cart.lines.find((line) => line.merchandise.__typename === "ProductVariant" && line.merchandise.id === giftId);

    if (giftLine) {
      if (giftLine.quantity !== parentQty) {
        operations.push({
          type: "update_line",
          id: giftLine.id,
          quantity: parentQty,
        });
      }
    } else {
      operations.push({
        type: "add_line",
        merchandiseId: giftId,
        quantity: parentQty,
      });
    }
  }

  return {
    operations
  };
}
