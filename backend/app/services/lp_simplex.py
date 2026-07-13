import pulp


def solve_simplex(objective_type, variables, objective_coeffs, constraints):
    prob = pulp.LpProblem("Simplex", pulp.LpMaximize if objective_type == "max" else pulp.LpMinimize)
    x = {v: pulp.LpVariable(v, lowBound=0) for v in variables}
    prob += pulp.lpSum([objective_coeffs[i] * x[variables[i]] for i in range(len(variables))])

    for c in constraints:
        coeffs = [float(v) for v in c["coeffs"]]
        rhs = float(c["rhs"])
        sense = c.get("sense", "<=")
        expr = pulp.lpSum([coeffs[i] * x[variables[i]] for i in range(len(variables))])
        if sense == "<=":
            prob += expr <= rhs
        elif sense == ">=":
            prob += expr >= rhs
        else:
            prob += expr == rhs

    solver = pulp.PULP_CBC_CMD(msg=False)
    prob.solve(solver)

    status = pulp.LpStatus[prob.status]
    if prob.status not in (pulp.LpStatusOptimal,):
        return {
            "status": status,
            "objective_value": None,
            "variables": {v: 0 for v in variables},
            "reduced_costs": {v: 0 for v in variables},
            "shadow_prices": {},
            "slack": {},
            "optimality_ranges": {},
        }

    obj_value = pulp.value(prob.objective)
    var_values = {v: pulp.value(x[v]) for v in variables}
    reduced_costs = {v: x[v].dj if hasattr(x[v], 'dj') and x[v].dj is not None else 0 for v in variables}

    shadow_prices = {}
    slack = {}
    for name, c in prob.constraints.items():
        shadow_prices[str(c)] = c.pi if c.pi is not None else 0
        slack[str(c)] = c.slack if c.slack is not None else 0

    return {
        "status": status,
        "objective_value": obj_value,
        "variables": var_values,
        "reduced_costs": reduced_costs,
        "shadow_prices": shadow_prices,
        "slack": slack,
        "optimality_ranges": {},
    }
