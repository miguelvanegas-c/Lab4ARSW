export function getBlueprint(author, name) {
    return fetch(`${API_BASE}/api/blueprints/${author}/${name}`).then(r=>r.json())
}

