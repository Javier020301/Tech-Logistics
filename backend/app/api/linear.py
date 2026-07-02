from fastapi import APIRouter, Depends
from app.schemas.schemas import LPRequest, LPResponse, GraphicalRequest, GraphicalResponse
from app.api.deps import get_current_admin
from app.services.lp_simplex import solve_simplex
from app.services.lp_graphical import solve_graphical

router = APIRouter(prefix="/linear", tags=["linear"], dependencies=[Depends(get_current_admin)])


@router.post("/simplex", response_model=LPResponse)
async def simplex(req: LPRequest):
    return solve_simplex(req.objective_type, req.variables, req.objective_coeffs, req.constraints)


@router.post("/graphical", response_model=GraphicalResponse)
async def graphical(req: GraphicalRequest):
    return solve_graphical(req.objective_type, req.variables, req.objective_coeffs, req.constraints)
