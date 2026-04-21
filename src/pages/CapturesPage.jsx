import { useMemo, useState } from 'react';
import Hero from '../components/Hero';
import SectionHeading from '../components/SectionHeading';
import FilterBar from '../components/FilterBar';
import CaptureCard from '../components/CaptureCard';
import EmptyState from '../components/EmptyState';
import { useSiteData } from '../context/SiteDataContext';
import {
  buildLookup,
  filterCatches,
  formatWeight,
  getBestCatch,
  getOverallStats,
  sortCatches,
  uniqueYears,
} from '../utils/siteUtils';

const defaultFilters = {
  query: '',
  memberId: 'all',
  waterId: 'all',
  baitId: 'all',
  carpType: 'all',
  year: 'all',
  minWeight: '',
  maxWeight: '',
  sortBy: 'date-desc',
};

export default function CapturesPage() {
  const { members, waters, baits, catches } = useSiteData();
  const [filters, setFilters] = useState(defaultFilters);

  const membersById = useMemo(() => buildLookup(members), [members]);
  const watersById = useMemo(() => buildLookup(waters), [waters]);
  const baitsById = useMemo(() => buildLookup(baits), [baits]);

  const filteredCatches = useMemo(
    () =>
      sortCatches(
        filterCatches({
          catches,
          membersById,
          watersById,
          baitsById,
          filters,
        }),
        filters.sortBy,
      ),
    [baitsById, catches, filters, membersById, watersById],
  );

  const bestCatch = getBestCatch(filteredCatches);
  const filteredStats = getOverallStats(filteredCatches);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <>
      <Hero
        eyebrow="Galeria + filtros"
        title="Todas las capturas del equipo"
        description="Filtra por peso, tipo de pez, pescador, escenario y cebo. Aqui ya aparecen tambien las fotos que cargueis desde el panel."
        compact
        backgroundImage="images/logo.png"
        stats={[
          { label: 'Resultados', value: filteredCatches.length, helper: 'Filtrado en tiempo real' },
          { label: 'Royales', value: filteredStats.royalCount, helper: 'En la seleccion actual' },
          { label: 'Koi', value: filteredStats.koiCount, helper: 'Nuevo tipo disponible' },
          {
            label: 'Otras especies',
            value: filteredStats.barboCount + filteredStats.pezGatoCount,
            helper: 'Barbos y pez gato',
          },
          {
            label: 'Mayor peso',
            value: bestCatch ? formatWeight(bestCatch.weightKg) : '--',
            helper: bestCatch ? watersById[bestCatch.waterId]?.shortName : 'Sin resultado',
          },
        ]}
      />

      <section className="section">
        <div className="site-container">
          <SectionHeading
            overline="Buscador de sesiones"
            title="Filtra por lo que te interese"
            text="Puedes combinar filtros para ver grandes capturas, un solo escenario, un pescador concreto o el cebo que mejor funciona."
          />

          <FilterBar
            filters={filters}
            onChange={handleChange}
            onReset={() => setFilters(defaultFilters)}
            options={{ members, waters, baits, years: uniqueYears(catches) }}
          />

          {filteredCatches.length === 0 ? (
            <EmptyState
              title="No hay resultados con esos filtros"
              text="Prueba a quitar algun filtro o a revisar si la captura sigue dentro del escenario y pescador seleccionados."
            />
          ) : (
            <div className="grid grid-captures">
              {filteredCatches.map((capture) => (
                <CaptureCard
                  key={capture.id}
                  capture={capture}
                  member={membersById[capture.memberId]}
                  water={watersById[capture.waterId]}
                  bait={baitsById[capture.baitId]}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
