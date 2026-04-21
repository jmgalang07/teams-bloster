import { useMemo, useState } from "react";
import Hero from "../components/Hero";
import SectionHeading from "../components/SectionHeading";
import WaterCard from "../components/WaterCard";
import EmptyState from "../components/EmptyState";
import { useSiteData } from "../context/SiteDataContext";

const defaultFilters = {
  query: "",
  type: "all",
  province: "all",
};

export default function WatersPage() {
  const { waters, catches } = useSiteData();
  const [filters, setFilters] = useState(defaultFilters);

  const provinces = useMemo(
    () =>
      [...new Set(waters.map((water) => water.province))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [waters],
  );
  const types = useMemo(
    () =>
      [...new Set(waters.map((water) => water.type))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [waters],
  );

  const filteredWaters = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return waters.filter((water) => {
      const haystack = [
        water.name,
        water.shortName,
        water.description,
        water.knownFor,
        water.type,
        water.province,
        water.tags.join(" "),
        water.notes,
      ]
        .join(" ")
        .toLowerCase();

      if (query && !haystack.includes(query)) {
        return false;
      }

      if (filters.type !== "all" && water.type !== filters.type) {
        return false;
      }

      if (filters.province !== "all" && water.province !== filters.province) {
        return false;
      }

      return true;
    });
  }, [filters, waters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <>
      <Hero
        eyebrow="Escenarios"
        title="Charcas, pantanos y rios del equipo"
        description="Cada escenario tiene su tarjeta, su descripcion y una ficha detallada con capturas, cebos y pescadores relacionados."
        compact
        backgroundImage="images/logo.png"
        stats={[
          {
            label: "Escenarios documentados",
            value: waters.length,
            helper: "Charcas, embalses y rios seleccionados",
          },
          {
            label: "Tipos de agua",
            value: types.length,
            helper: types.join(" · "),
          },
          {
            label: "Capturas relacionadas",
            value: catches.length,
            helper: "Asociadas a fichas y escenarios",
          },
        ]}
      />

      <section className="section">
        <div className="site-container">
          <SectionHeading
            overline="Busqueda local"
            title="Encuentra cualquier escenario"
            text="Puedes escribir el nombre de una charca o buscar por tipo de escenario, provincia o palabras clave."
          />

          <section className="filter-panel filter-panel-waters">
            <div className="filter-grid filter-grid-waters">
              <label className="field">
                <span>Buscar escenario</span>
                <input
                  type="text"
                  name="query"
                  placeholder="Ej: Orellana, rio, royal..."
                  value={filters.query}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Tipo</span>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleChange}
                >
                  <option value="all">Todos</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Provincia</span>
                <select
                  name="province"
                  value={filters.province}
                  onChange={handleChange}
                >
                  <option value="all">Todas</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </label>

              <div className="filter-actions">
                <button
                  className="button button-secondary button-small"
                  type="button"
                  onClick={() => setFilters(defaultFilters)}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </section>

          {filteredWaters.length === 0 ? (
            <EmptyState
              title="No hay escenarios con esa busqueda"
              text="Prueba con otra palabra o quita algun filtro para ver mas opciones."
            />
          ) : (
            <div className="grid grid-waters">
              {filteredWaters.map((water) => (
                <WaterCard
                  key={water.id}
                  water={water}
                  catchesInWater={catches.filter(
                    (capture) => capture.waterId === water.id,
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
