export default function form_field({ name, label, type = 'text', value, update, auto_complete, error, disabled }) {
    return <div className="form_field"><label htmlFor={name}>{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={(event) => update(event.target.value)} autoComplete={auto_complete} disabled={disabled} required aria-invalid={Boolean(error)} aria-describedby={error ? `${name}_error` : undefined} />
        {error && <p className="field_error" id={`${name}_error`}>{error}</p>}
    </div>;
}
