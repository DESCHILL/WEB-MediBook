export function catalog_error(status, code, message) {
    return Object.assign(new Error(message), { status, code });
}

export function create_catalog_service(repository) {
    async function list_specialties() { return repository.list_specialties(); }
    return { list_specialties };
}
