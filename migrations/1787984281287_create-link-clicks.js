export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("link_clicks", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    link_id: {
      type: "bigint",
      notNull: true,
      references: "links(id)",
      onDelete: "CASCADE",
    },

    clicked_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("link_clicks", "link_id");
};

export const down = (pgm) => {
  pgm.dropTable("link_clicks");
};