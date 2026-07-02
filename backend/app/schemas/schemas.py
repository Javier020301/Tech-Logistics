from pydantic import BaseModel, Field
from typing import List


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LPRequest(BaseModel):
    objective_type: str = Field(..., pattern="^(max|min)$")
    variables: List[str] = Field(..., min_length=1)
    objective_coeffs: List[float]
    constraints: List[dict]


class LPResponse(BaseModel):
    objective_value: float
    variables: dict
    reduced_costs: dict
    shadow_prices: dict
    slack: dict
    optimality_ranges: dict
    status: str


class GraphicalRequest(BaseModel):
    objective_type: str = Field(..., pattern="^(max|min)$")
    variables: List[str] = Field(..., min_length=2, max_length=2)
    objective_coeffs: List[float]
    constraints: List[dict]


class GraphicalResponse(BaseModel):
    objective_value: float
    solution_point: dict
    plot_base64: str
    status: str
