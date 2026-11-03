export interface Product {
  available: boolean;
  tag: string;
  description: string;
  id: number;
  image_url: string;
  name: string;
  price_rs: number;
  unit: "kg" | "loaf" | "bunch" | "dozen" | `${number}g`;
}

export const minimumOrderRs = 1000;

// Prices are in rupees. Add a new object with a unique id to add a product.
export const products: Product[] = [
  {
    available: true,
    description: "Biryani cut or karahi cut, 1 kg.",
    id: 1,
    image_url:
      "https://images.freshmarketpakistan.com/chicken-biryani-karahi.jpg",
    name: "Biryani / Karahi Cut Chicken",
    price_rs: 600,
    tag: "Chicken",
    unit: "kg",
  },
  {
    available: true,
    description: "Boneless chicken cut into cubes, 1 kg.",
    id: 2,
    image_url:
      "https://images.freshmarketpakistan.com/chicken-boneless-cubes.jpg",
    name: "Boneless Chicken Cubes",
    price_rs: 1000,
    tag: "Chicken",
    unit: "kg",
  },
  {
    available: true,
    description: "Boneless chicken breast, 1 kg.",
    id: 3,
    image_url:
      "https://images.freshmarketpakistan.com/chicken-boneless-breast.jpg",
    name: "Boneless Chicken Breast",
    price_rs: 1000,
    tag: "Chicken",
    unit: "kg",
  },
  {
    available: true,
    description:
      "Whole chicken at Rs 600 per kg. Final price depends on its weight.",
    id: 4,
    image_url: "https://images.freshmarketpakistan.com/chicken-whole.jpg",
    name: "Whole Chicken",
    price_rs: 600,
    tag: "Chicken",
    unit: "kg",
  },
  {
    available: true,
    description: "Chicken tikka chest cut at Rs 600 per kg.",
    id: 5,
    image_url: "https://images.freshmarketpakistan.com/chicken-tikka-chest.jpg",
    name: "Chicken Tikka Chest Cut",
    price_rs: 600,
    tag: "Chicken",
    unit: "kg",
  },
  {
    available: true,
    description: "12 large eggs.",
    id: 6,
    image_url: "https://images.freshmarketpakistan.com/eggs.jpg",
    name: "Eggs",
    price_rs: 280,
    tag: "Eggs",
    unit: "dozen",
  },
  {
    available: true,
    description: "Fresh tomatoes (Tamatar), 1 kg. Price may change daily.",
    id: 7,
    image_url: "https://images.freshmarketpakistan.com/tomatoes.jpg",
    name: "Tomatoes (Tamatar)",
    price_rs: 200,
    tag: "Vegetables",
    unit: "kg",
  },
  {
    available: true,
    description: "Fresh onions (Piyaz), 1 kg. Price may change daily.",
    id: 8,
    image_url: "https://images.freshmarketpakistan.com/onions.jpg",
    name: "Onions (Piyaz)",
    price_rs: 200,
    tag: "Vegetables",
    unit: "kg",
  },
  {
    available: true,
    description: "Fresh potatoes (Aloo), 1 kg. Price may change daily.",
    id: 9,
    image_url: "https://images.freshmarketpakistan.com/potatoes.jpg",
    name: "Potatoes (Aloo)",
    price_rs: 200,
    tag: "Vegetables",
    unit: "kg",
  },
  {
    available: true,
    description:
      "Fresh green chillies (Hari Mirch), 500 g. Price may change daily.",
    id: 10,
    image_url: "https://images.freshmarketpakistan.com/green-chillies.jpg",
    name: "Green Chillies (Hari Mirch)",
    price_rs: 100,
    tag: "Vegetables",
    unit: "500g",
  },
  {
    available: true,
    description: "Fresh ginger (Adrak), 250 g. Price may change daily.",
    id: 12,
    image_url:
      "https://images.freshmarketpakistan.com/ginger-adrak-magnific.jpg",
    name: "Ginger (Adrak)",
    price_rs: 130,
    tag: "Vegetables",
    unit: "250g",
  },
  {
    available: true,
    description: "Fresh garlic (Lehsan), 250 g. Price may change daily.",
    id: 13,
    image_url:
      "https://images.freshmarketpakistan.com/garlic-lehsan-producemarketguide.png",
    name: "Garlic (Lehsan)",
    price_rs: 130,
    tag: "Vegetables",
    unit: "250g",
  },
  {
    available: true,
    description: "Fresh coriander (Dhania), one bunch. Price may change daily.",
    id: 14,
    image_url:
      "https://images.freshmarketpakistan.com/coriander-dhania-apnaugao.jpg",
    name: "Coriander (Dhania)",
    price_rs: 150,
    tag: "Vegetables",
    unit: "bunch",
  },
  {
    available: true,
    description: "Fresh green peas (Mutter), 500 g. Price may change daily.",
    id: 15,
    image_url: "https://images.freshmarketpakistan.com/green-peas-mutter.jpg",
    name: "Green Peas (Mutter)",
    price_rs: 210,
    tag: "Vegetables",
    unit: "500g",
  },
  {
    available: true,
    description: "Fresh mint (Podina), one bunch. Price may change daily.",
    id: 16,
    image_url:
      "https://images.freshmarketpakistan.com/mint-podina-unsplash.jpg",
    name: "Mint (Podina)",
    price_rs: 30,
    tag: "Vegetables",
    unit: "bunch",
  },
  {
    available: true,
    description: "Fresh lemons (Nimbu), 250 g. Price may change daily.",
    id: 17,
    image_url:
      "https://images.freshmarketpakistan.com/lemons-nimbu-woodstock.jpg",
    name: "Lemons (Nimbu)",
    price_rs: 130,
    tag: "Vegetables",
    unit: "250g",
  },
  {
    available: true,
    description: "Sliced bread, one loaf.",
    id: 11,
    image_url: "https://images.freshmarketpakistan.com/bread-dabalroti.jpg",
    name: "Bread (Dabalroti)",
    price_rs: 150,
    tag: "Bakery",
    unit: "loaf",
  },
  {
    available: true,
    description: "Crisp rusk (Pape), 250 g.",
    id: 18,
    image_url:
      "https://images.freshmarketpakistan.com/rusk-pape-floursandfrostings.jpg",
    name: "Rusk (Pape)",
    price_rs: 120,
    tag: "Bakery",
    unit: "250g",
  },
];

export const searchProducts = (query: string, tag: string | null) =>
  products.filter(
    (product) =>
      (!tag || product.tag === tag) &&
      `${product.name} ${product.tag} ${product.description}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
  );

export const productQuantityLimit = (product: Product): number =>
  product.available ? 10 : 0;

export const isVariableWeight = (product: Product) =>
  product.id === 4 || product.id === 5;

// Quantity remains a multiple of the catalog's priced unit, including in saved baskets.
export const productWeightGrams = (product: Product): number | null => {
  if (isVariableWeight(product)) {
    return null;
  }

  if (product.unit === "kg") {
    return 1000;
  }

  return product.unit.endsWith("g") ? Number(product.unit.slice(0, -1)) : null;
};

export const productQuantityStep = (product: Product) => {
  const grams = productWeightGrams(product);

  return grams === null ? 1 : 250 / grams;
};

export const isProductQuantity = (product: Product, quantity: number) => {
  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    quantity > productQuantityLimit(product)
  ) {
    return false;
  }

  return Number.isInteger(quantity / productQuantityStep(product));
};

export const productLineTotal = (product: Product, quantity: number) =>
  isVariableWeight(product)
    ? 0
    : Math.round(product.price_rs * quantity * 100) / 100;
