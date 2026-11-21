INSERT INTO taxonomies (name, slug, type, description) VALUES
  ('Uncategorized', 'uncategorized', 'category', 'Default category')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO settings (key, value) VALUES
  ('site_title', 'NextPress'),
  ('site_tagline', 'AI-first content platform'),
  ('admin_email', 'admin@example.com'),
  ('posts_per_page', '10'),
  ('default_category', 'uncategorized')
ON CONFLICT (key) DO NOTHING;
