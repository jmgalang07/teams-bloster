import { FISH_TYPE_OPTIONS } from '../utils/siteUtils';

export default function FilterBar({
  filters,
  onChange,
  onReset,
  options,
  hideWater = false,
  hideMember = false,
}) {
  return (
    <section className="filter-panel">
      <div className="filter-grid">
        <label className="field">
          <span>Buscar</span>
          <input
            type="text"
            name="query"
            placeholder="Ej: Orellana, koi, barbo, krill..."
            value={filters.query}
            onChange={onChange}
          />
        </label>

        {!hideMember && (
          <label className="field">
            <span>Pescador</span>
            <select name="memberId" value={filters.memberId} onChange={onChange}>
              <option value="all">Todos</option>
              {options.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {!hideWater && (
          <label className="field">
            <span>Escenario</span>
            <select name="waterId" value={filters.waterId} onChange={onChange}>
              <option value="all">Todos</option>
              {options.waters.map((water) => (
                <option key={water.id} value={water.id}>
                  {water.shortName}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="field">
          <span>Tipo de pez</span>
          <select name="carpType" value={filters.carpType} onChange={onChange}>
            <option value="all">Todos</option>
            {FISH_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Cebo</span>
          <select name="baitId" value={filters.baitId} onChange={onChange}>
            <option value="all">Todos</option>
            {options.baits.map((bait) => (
              <option key={bait.id} value={bait.id}>
                {bait.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Ordenar</span>
          <select name="sortBy" value={filters.sortBy} onChange={onChange}>
            <option value="date-desc">Mas recientes</option>
            <option value="weight-desc">Mayor peso</option>
            <option value="weight-asc">Menor peso</option>
            <option value="name">Pescador</option>
            <option value="water">Escenario</option>
          </select>
        </label>
      </div>

      <div className="filter-actions">
        <button className="button button-secondary button-small" type="button" onClick={onReset}>
          Limpiar filtros
        </button>
      </div>
    </section>
  );
}
