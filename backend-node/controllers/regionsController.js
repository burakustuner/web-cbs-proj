const db = require('../config/database.js');

const getRegions = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        name,
        ST_AsGeoJSON(geom)::json AS geometry
      FROM regions;
    `);

    const features = result.rows.map((row) => ({
      type: "Feature",
      geometry: row.geometry,
      properties: {
        id: row.id,
        name: row.name
      }
    }));

    res.json({
      type: "FeatureCollection",
      features: features
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = { getRegions };
