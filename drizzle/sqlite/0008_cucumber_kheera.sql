INSERT INTO products (id, name, tag, description, image_url, price_rs, unit, available, ai_keywords)
VALUES (21, 'Cucumber (Kheera)', 'Vegetables', 'Fresh cucumber (Kheera), 1 kg. Price may change daily.', 'https://images.freshmarketpakistan.com/cucumber-kheera.jpg', 80, 'kg', 1, 'kheera khira cucumber vegetable salad')
ON CONFLICT(id) DO NOTHING;
