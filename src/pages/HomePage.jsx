import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import SectionHeading from '../components/SectionHeading';
import MemberCard from '../components/MemberCard';
import CaptureCard from '../components/CaptureCard';
import WaterCard from '../components/WaterCard';
import StatStrip from '../components/StatStrip';
import { useSiteData } from '../context/SiteDataContext';
import {
  buildLookup,
  formatWeight,
  getMemberStats,
  getMostUsedBaitId,
  getOverallStats,
  getTopBaitsForMember,
  getTopWaters,
} from '../utils/siteUtils';

export default function HomePage() {
  const { members, catches, baits, waters, siteMeta } = useSiteData();

  const baitsById = buildLookup(baits);
  const watersById = buildLookup(waters);
  const membersById = buildLookup(members);
  const overallStats = getOverallStats(catches);
  const bestCatch = overallStats.bestCatch;
  const mostUsedBaitId = getMostUsedBaitId(catches);
  const topWaterId = getTopWaters(catches)[0]?.[0];

  const featuredCatches = [...catches]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  const activeMembersCount = new Set(
    catches.map((capture) => capture.memberId).filter(Boolean)
  ).size;

  const activeWatersCount = new Set(
    catches.map((capture) => capture.waterId).filter(Boolean)
  ).size;

  const usedBaitsCount = new Set(
    catches.map((capture) => capture.baitId).filter(Boolean)
  ).size;

  const averageWeightKg =
    catches.length > 0
      ? catches.reduce((sum, capture) => sum + (Number(capture.weightKg) || 0), 0) / catches.length
      : 0;

  return (
    <>
      <Hero
        eyebrow="Carpfishing crew · Calamonte"
        title={siteMeta.name}
        description="Web del equipo para guardar capturas, revisar escenarios y consultar cebos y marcas desde un mismo sitio. Tambien podeis subir fotos y mantener la informacion al dia desde el panel."
        primaryAction={{ to: '/capturas', label: siteMeta.ctaPrimary }}
        secondaryAction={{ to: '/panel', label: 'Subir captura' }}
        stats={[
          {
            label: 'Capturas registradas',
            value: overallStats.total,
            helper: 'Archivo general del equipo',
          },
          {
            label: 'Escenarios',
            value: waters.length,
            helper: 'Charcas, embalses y rios del equipo',
          },
          {
            label: 'Mayor captura',
            value: bestCatch ? formatWeight(bestCatch.weightKg) : '--',
            helper: bestCatch ? membersById[bestCatch.memberId]?.name : 'Sin datos',
          },
          {
            label: 'Escenario top',
            value: topWaterId ? watersById[topWaterId]?.shortName : '--',
            helper: 'Mas actividad registrada',
          },
        ]}
      />

      <section className="section">
        <div className="site-container">
          <StatStrip
            items={[
              {
                label: 'Pescadores activos',
                value: activeMembersCount,
                helper: 'Con capturas registradas',
              },
              {
                label: 'Escenarios pescados',
                value: activeWatersCount,
                helper: 'Aguas con actividad real',
              },
              {
                label: 'Cebos en uso',
                value: usedBaitsCount,
                helper: 'Presentes en las sesiones',
              },
              {
                label: 'Peso medio',
                value: catches.length ? formatWeight(averageWeightKg) : '--',
                helper: 'Media general del equipo',
              },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <SectionHeading
            overline="El equipo"
            title="Cuatro perfiles, una misma pasion"
            text="Cada pescador tiene su pagina propia, sus cebos favoritos y el detalle completo de sus capturas."
          />

          <div className="grid grid-members">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                stats={getMemberStats(member.id, catches)}
                favoriteBaits={getTopBaitsForMember(member.id, catches)
                  .map((baitId) => baitsById[baitId])
                  .filter(Boolean)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="site-container">
          <SectionHeading
            overline="Capturas destacadas"
            title="Ultimas fotos y mejores momentos"
            text="La galeria mezcla las capturas base con las que cargueis desde el formulario del panel."
          />

          <div className="grid grid-captures">
            {featuredCatches.map((capture) => (
              <CaptureCard
                key={capture.id}
                capture={capture}
                member={membersById[capture.memberId]}
                water={watersById[capture.waterId]}
                bait={baitsById[capture.baitId]}
              />
            ))}
          </div>

          <div className="section-cta">
            <Link className="button button-primary" to="/capturas">
              Ver todas las capturas
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <SectionHeading
            overline="Escenarios"
            title="Charcas, rios, embalses y viajes del equipo"
            text="Los escenarios base y los nuevos que anadais desde el panel comparten la misma ficha y la misma estetica."
          />

          <div className="grid grid-waters">
            {waters.slice(0, 4).map((water) => (
              <WaterCard
                key={water.id}
                water={water}
                catchesInWater={catches.filter((capture) => capture.waterId === water.id)}
              />
            ))}
          </div>

          <div className="section-cta">
            <Link className="button button-secondary" to="/charcas">
              Explorar todos los escenarios
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}