CREATE VIRTUAL TABLE products_fts USING fts5(
  name, tag, ai_keywords, description,
  content='products', content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'
);

CREATE VIRTUAL TABLE products_vocab USING fts5vocab(products_fts, 'col');

CREATE TRIGGER products_ai AFTER INSERT ON products BEGIN
  INSERT INTO products_fts(rowid, name, tag, ai_keywords, description)
  VALUES (new.id, new.name, new.tag, new.ai_keywords, new.description);
END;

CREATE TRIGGER products_ad AFTER DELETE ON products BEGIN
  INSERT INTO products_fts(products_fts, rowid, name, tag, ai_keywords, description)
  VALUES ('delete', old.id, old.name, old.tag, old.ai_keywords, old.description);
END;

CREATE TRIGGER products_au AFTER UPDATE ON products BEGIN
  INSERT INTO products_fts(products_fts, rowid, name, tag, ai_keywords, description)
  VALUES ('delete', old.id, old.name, old.tag, old.ai_keywords, old.description);
  INSERT INTO products_fts(rowid, name, tag, ai_keywords, description)
  VALUES (new.id, new.name, new.tag, new.ai_keywords, new.description);
END;

INSERT INTO products_fts(products_fts) VALUES ('rebuild');
