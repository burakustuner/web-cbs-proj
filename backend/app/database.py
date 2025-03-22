import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    return psycopg2.connect(
        host="db",             # docker-compose içindeki servis adı
        port="5432",
        database="gisdb",
        user="gisuser",
        password="gispass",
        cursor_factory=RealDictCursor
    )
