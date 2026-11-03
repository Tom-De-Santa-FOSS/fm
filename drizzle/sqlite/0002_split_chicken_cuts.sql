UPDATE products
SET name = 'Simple Cut Chicken',
    description = 'Simple cut chicken, 1 kg.',
    ai_keywords = 'poultry murghi chicken simple cut pieces'
WHERE id = 1 AND name = 'Biryani / Karahi Cut Chicken';

INSERT INTO products (id, name, tag, description, image_url, price_rs, unit, available, ai_keywords)
VALUES
  (19, 'Karahi Cut Chicken', 'Chicken', 'Karahi cut chicken, 1 kg.', 'https://images.freshmarketpakistan.com/chicken-karahi-cut.jpg', 600, 'kg', 1, 'poultry murghi chicken karahi curry pieces'),
  (20, 'Biryani Cut Chicken', 'Chicken', 'Biryani cut chicken, 1 kg.', 'https://images.freshmarketpakistan.com/chicken-biryani-cut.webp', 600, 'kg', 1, 'poultry murghi chicken biryani pieces')
ON CONFLICT(id) DO NOTHING;
