// @ts-check

/**
 * @typedef {import("../generated/api").CartTransformRunInput} CartTransformRunInput
 * @typedef {import("../generated/api").CartTransformRunResult} CartTransformRunResult
 */

/**
 * @type {CartTransformRunResult}
 */
const BUNDLE_QTY_DISCOUNTS = {
  7: 15,
  4: 10,
  3: 5,
};

/**
 * @param {CartTransformRunInput} input
 * @returns {CartTransformRunResult}
 */
export function cartTransformRun(input) {
  const operations = [];
  const match = 'set';

  for (const line of input.cart.lines) {
    const productTitle = (line.merchandise?.product?.title ?? '').toLowerCase();
    const quantities = Object.keys(BUNDLE_QTY_DISCOUNTS).reverse();

    if (productTitle.includes(match)) {
      for (const tier of quantities) {
        if (line.quantity >= tier) {
          const discount = BUNDLE_QTY_DISCOUNTS[tier];
          const newPrice = line.cost.amountPerQuantity.amount * ((100 - discount) / 100);

          operations.push({
            lineUpdate: {
              cartLineId: line.id,
              price: {
                adjustment: {
                  fixedPricePerUnit: {
                    amount: newPrice
                  }
                }
              }
            }
          });

          break;
        }
      }
    }
  }

  return {
    operations
  };
}
