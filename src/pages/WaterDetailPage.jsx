import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Hero from '../components/Hero';
import SectionHeading from '../components/SectionHeading';
import FilterBar from '../components/FilterBar';
import CaptureCard from '../components/CaptureCard';
import EmptyState from '../components/EmptyState';
import StatStrip from '../components/StatStrip';
import { useSiteData } from '../context/SiteDataContext';
import {
  buildLookup,
  filterCatches,
  formatWeight,
  getBestCatch,
  getMostUsedBaitId,
  getOverallStats,
  getWaterCatches,
  sortCatches,
  uniqueYears,
} from '../utils/siteUtils';

export default function WaterDetailPage() {
  const { waterId } = useParams();
  const { members, waters, baits, catches } = useSiteData();

  const membersById = useMemo(() => buildLookup(members), [members]);
  const watersById = useMemo(() => buildLookup(waters), [waters]);
  const baitsById = useMemo(() => buildLookup(baits), [baits]);
  const water = watersById[waterId];

  const defaultFilters = {
    query: '',
    memberId: 'all',
    waterId,
    baitId: 'all',
    carpType: 'all',
    year: 'all',
    minWeight: '',
    maxWeight: '',
    sortBy: 'date-desc',
  };

  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [waterId]);

  if (!water) {
    return (
      <section className="section">
        <div className="site-container">
          <EmptyState
            title="No encontramos ese escenario"
            text="Vuelve a la pagina de escenarios para abrir una ficha valida."
          />
        </div>
      </section>
    );
  }

  const catchesInWater = getWaterCatches(catches, waterId);
  const filteredCatches = sortCatches(
    filterCatches({
      catches: catchesInWater,
      membersById,
      watersById,
      baitsById,
      filters,
    }),
    filters.sortBy,
  );

  const bestCatch = getBestCatch(catchesInWater);
  const topBaitId = getMostUsedBaitId(catchesInWater);
  const fishStats = getOverallStats(catchesInWater);
  const visitedMembers = [...new Set(catchesInWater.map((item) => item.memberId))]
    .map((memberKey) => membersById[memberKey])
    .filter(Boolean);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value, waterId }));
  };

  return (
    <>
      <Hero
        eyebrow={`${water.type} · ${water.province}`}
        title={water.name}
        description={`${water.description} Aqui puedes revisar capturas por pescador y filtrar por peso, tipo de pez o cebo.`}
        compact
        backgroundImage={water.image}
        primaryAction={{ to: '/charcas', label: 'Volver a escenarios' }}
        secondaryAction={{ to: '/panel', label: 'Anadir captura' }}
        stats={[
          { label: 'Capturas', value: catchesInWater.length, helper: 'Registradas aqui' },
          {
            label: 'Mejor peso',
            value: bestCatch ? formatWeight(bestCatch.weightKg) : '--',
            helper: bestCatch ? membersById[bestCatch.memberId]?.name : 'Sin datos',
          },
          { label: 'Koi', value: fishStats.koiCount, helper: 'Nuevo tipo disponible' },
          {
            label: 'Otras especies',
            value: fishStats.barboCount + fishStats.pezGatoCount,
            helper: 'Barbos y pez gato',
          },
        ]}
      />

      <section className="section">
        <div className="site-container">
          <StatStrip
            items={[
              { label: 'Conocida por', value: water.knownFor, helper: water.type },
              { label: 'Mejor temporada', value: water.bestSeason, helper: 'Dato editable' },
              { label: 'Dificultad', value: water.difficulty, helper: 'Orientativa' },
              {
                label: 'Cebo mas repetido',
                value: topBaitId ? baitsById[topBaitId]?.name : '--',
                helper: 'Segun los datos visibles',
              },
            ]}
          />
        </div>
      </section>

      <section className="section section-alt">
        <div className="site-container water-detail-grid">
          <div className="info-card scenic-card">
            <h3>Descripcion del lugar</h3>
            <p>{water.notes}</p>
            <div className="chip-row">
              {water.tags.map((tag) => (
                <span className="chip" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            {water.website ? (
              <div className="section-cta">
                <a
                  className="button button-secondary button-small"
                  href={water.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver web o mapa
                </a>
              </div>
            ) : null}
          </div>

          <div className="info-card scenic-card">
            <h3>Pescadores que han tocado agua aqui</h3>
            <div className="mini-profile-list">
              {visitedMembers.map((member) => (
                <Link className="mini-profile" key={member.id} to={`/pescadores/${member.id}`}>
                  <span>{member.name}</span>
                  <small>{member.role}</small>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <SectionHeading
            overline="Capturas en este escenario"
            title={`Resultados de ${water.shortName}`}
            text="Filtra por pescador, peso, tipo de pez, cebo o temporada para comparar mejor las sesiones."
          />

          <FilterBar
            filters={filters}
            onChange={handleChange}
            onReset={() => setFilters(defaultFilters)}
            options={{ members, waters, baits, years: uniqueYears(catchesInWater) }}
            hideWater
          />

          {filteredCatches.length === 0 ? (
            <EmptyState
              title="No hay capturas con esos filtros"
              text="Quita algun filtro para recuperar mas resultados dentro de este escenario."
            />
          ) : (
            <div className="grid grid-captures">
              {filteredCatches.map((capture) => (
                <CaptureCard
                  key={capture.id}
                  capture={capture}
                  member={membersById[capture.memberId]}
                  water={water}
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
