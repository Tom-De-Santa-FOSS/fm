UPDATE products
SET image_url = 'https://images.freshmarketpakistan.com/chicken-simple-cut-square.webp'
WHERE id = 1 AND image_url IN (
  'https://images.freshmarketpakistan.com/chicken-biryani-karahi.jpg',
  'https://images.freshmarketpakistan.com/chicken-simple-cut-square.png'
);

UPDATE products
SET image_url = 'https://images.freshmarketpakistan.com/chicken-boneless-cubes.webp'
WHERE id = 2 AND image_url = 'https://images.freshmarketpakistan.com/chicken-boneless-cubes.png';

UPDATE products
SET image_url = 'https://images.freshmarketpakistan.com/chicken-boneless-breast.webp'
WHERE id = 3 AND image_url = 'https://images.freshmarketpakistan.com/chicken-boneless-breast.png';

UPDATE products
SET image_url = 'https://images.freshmarketpakistan.com/chicken-whole.webp'
WHERE id = 4 AND image_url = 'https://images.freshmarketpakistan.com/chicken-whole.png';

UPDATE products
SET image_url = 'https://images.freshmarketpakistan.com/chicken-tikka-chest.webp'
WHERE id = 5 AND image_url = 'https://images.freshmarketpakistan.com/chicken-tikka-chest.png';

UPDATE products
SET image_url = 'https://images.freshmarketpakistan.com/chicken-karahi-cut.webp'
WHERE id = 19 AND image_url = 'https://images.freshmarketpakistan.com/chicken-karahi-cut.png';

UPDATE products
SET image_url = 'https://images.freshmarketpakistan.com/chicken-biryani-cut.webp'
WHERE id = 20 AND image_url = 'https://images.freshmarketpakistan.com/chicken-biryani-cut.png';
