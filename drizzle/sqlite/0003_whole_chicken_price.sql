UPDATE products
SET price_rs = 900,
    description = CASE
      WHEN description = 'Whole chicken at Rs 600 per kg. Final price depends on its weight.'
      THEN 'Whole chicken at Rs 900 per kg. Final price depends on its weight.'
      ELSE description
    END
WHERE id = 4;
