from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from mock_data import get_mock_topology

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/resources")
def get_resources(region: str = Query(default="ap-northeast-2")):
    return get_mock_topology(region)
