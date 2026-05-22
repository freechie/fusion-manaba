export const testFixtures = {
  category: {
    id: 90000,
    name: "E2E Pastries",
    slug: "e2e-pastries",
  },
  availableProduct: {
    id: 90001,
    name: "E2E Available Guava Pastry",
    slug: "e2e-available-guava-pastry",
    description: "A fixture that is available to route and browser tests.",
    price: "4.25",
    isAvailable: true,
  },
  unavailableProduct: {
    id: 90002,
    name: "E2E Hidden Pastry",
    slug: "e2e-hidden-pastry",
    description: "A fixture that must stay unavailable to shoppers.",
    price: "8.50",
    isAvailable: false,
  },
} as const;
