import io
import base64
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pulp


def solve_graphical(objective_type, variables, objective_coeffs, constraints):
    x = {v: pulp.LpVariable(v, lowBound=0) for v in variables}
    prob = pulp.LpProblem("Graphical", pulp.LpMaximize if objective_type == "max" else pulp.LpMinimize)
    prob += pulp.lpSum([objective_coeffs[i] * x[variables[i]] for i in range(2)])

    for c in constraints:
        coeffs = [float(v) for v in c["coeffs"]]
        rhs = float(c["rhs"])
        sense = c.get("sense", "<=")
        expr = pulp.lpSum([coeffs[i] * x[variables[i]] for i in range(2)])
        if sense == "<=":
            prob += expr <= rhs
        elif sense == ">=":
            prob += expr >= rhs
        else:
            prob += expr == rhs

    solver = pulp.PULP_CBC_CMD(msg=False)
    prob.solve(solver)

    status = pulp.LpStatus[prob.status]
    if prob.status != pulp.LpStatusOptimal:
        return {"status": status, "objective_value": None, "solution_point": {}, "plot_base64": ""}

    obj_value = pulp.value(prob.objective)
    sol = {v: pulp.value(x[v]) for v in variables}

    fig, ax = plt.subplots(figsize=(8, 6))
    x_vals = np.linspace(0, max(10, sol[variables[0]] * 1.5), 400)

    colors = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"]
    for i, c in enumerate(constraints):
        coeffs = c["coeffs"]
        rhs = c["rhs"]
        if coeffs[1] != 0:
            y_vals = (rhs - coeffs[0] * x_vals) / coeffs[1]
            label = f"{coeffs[0]}x₁ + {coeffs[1]}x₂ ≤ {rhs}" if c.get("sense", "<=") == "<=" else f"{coeffs[0]}x₁ + {coeffs[1]}x₂ ≥ {rhs}"
            ax.plot(x_vals, y_vals, label=label, color=colors[i % len(colors)])
            ax.fill_between(x_vals, 0, y_vals, alpha=0.05, color=colors[i % len(colors)])
        else:
            ax.axvline(x=rhs / coeffs[0], color=colors[i % len(colors)], linestyle="--")

    ax.plot(sol[variables[0]], sol[variables[1]], "ro", markersize=10, label=f"Óptimo ({sol[variables[0]]:.2f}, {sol[variables[1]]:.2f})")
    ax.set_xlabel(variables[0])
    ax.set_ylabel(variables[1])
    ax.set_title(f"Método Gráfico - PL\nValor Óptimo: {obj_value:.2f}")
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_xlim(0, max(10, sol[variables[0]] * 1.5))
    ax.set_ylim(0, max(10, sol[variables[1]] * 1.5))

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=100, bbox_inches="tight")
    plt.close(fig)
    plot_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {
        "status": status,
        "objective_value": obj_value,
        "solution_point": sol,
        "plot_base64": plot_base64,
    }
