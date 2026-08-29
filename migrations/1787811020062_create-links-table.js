export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("links", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    short_code: {
      type: "varchar(10)",
      notNull: true,
      unique: true,
    },

    long_url: {
      type: "text",
      notNull: true,
    },

    owner_id: {
      type: "varchar(64)",
      notNull: false,
    },

    click_count: {
      type: "bigint",
      notNull: true,
      default: 0,
    },

    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },

    expires_at: {
      type: "timestamp",
      notNull: false,
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable("links");
};