-- Create hm_collections table for user-defined hymn lists
CREATE TABLE hm_collections (
  id         SERIAL PRIMARY KEY,
  user_id    INT          NOT NULL,
  name       VARCHAR(255) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT hm_collections_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create hm_collection_hymns join table
CREATE TABLE hm_collection_hymns (
  id            SERIAL PRIMARY KEY,
  collection_id INT          NOT NULL,
  hymn_id       INT          NOT NULL,
  created_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT hm_collection_hymns_collection_id_fkey
    FOREIGN KEY (collection_id) REFERENCES hm_collections(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT hm_collection_hymns_hymn_id_fkey
    FOREIGN KEY (hymn_id) REFERENCES hm_hymns(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX hm_collection_hymns_collection_id_hymn_id_key
  ON hm_collection_hymns(collection_id, hymn_id);
