from fastapi import FastAPI
from .database import get_connection
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI"}

@app.get("/ping-db")
def ping_db():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        cursor.close()
        conn.close()
        return {"status": "ok", "db_version": version}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
@app.get("/cities")
def get_cities():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                id,
                name,
                population,
                ST_AsGeoJSON(geom)::json AS geometry
            FROM cities;
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        # GeoJSON FeatureCollection formatına çevir
        features = []
        for row in rows:
            features.append({
                "type": "Feature",
                "geometry": row["geometry"],
                "properties": {
                    "id": row["id"],
                    "name": row["name"],
                    "population": row["population"]
                }
            })

        return JSONResponse({
            "type": "FeatureCollection",
            "features": features
        })

    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/roads")
def get_roads():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                id,
                name,
                ST_AsGeoJSON(geom)::json AS geometry
            FROM roads;
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        # GeoJSON FeatureCollection formatına çevir
        features = []
        for row in rows:
            features.append({
                "type": "Feature",
                "geometry": row["geometry"],
                "properties": {
                    "id": row["id"],
                    "name": row["name"]
                }
            })

        return JSONResponse({
            "type": "FeatureCollection",
            "features": features
        })

    except Exception as e:
        return {"status": "error", "message": str(e)}
    
@app.get("/regions")
def get_regions():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                id,
                name,
                ST_AsGeoJSON(geom)::json AS geometry
            FROM regions;
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        # GeoJSON FeatureCollection formatına çevir
        features = []
        for row in rows:
            features.append({
                "type": "Feature",
                "geometry": row["geometry"],
                "properties": {
                    "id": row["id"],
                    "name": row["name"]
                }
            })

        return JSONResponse({
            "type": "FeatureCollection",
            "features": features
        })

    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    