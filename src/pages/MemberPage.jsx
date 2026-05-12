import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Hero from '../components/Hero';
import SectionHeading from '../components/SectionHeading';
import CaptureCard from '../components/CaptureCard';
import EmptyState from '../components/EmptyState';
import StatStrip from '../components/StatStrip';
import { CarpTypeBadge } from '../components/Badge';
import { useSiteData } from '../context/SiteDataContext';
import {
  assetPath,
  buildLookup,
  formatDate,
  formatWeight,
  getMemberCatches,
  getMemberStats,
  sortCatches,
} from '../utils/siteUtils';

export default function MemberPage() {
  const { memberId } = useParams();
  const { members, waters, baits, catches } = useSiteData();

  const membersById = useMemo(() => buildLookup(members), [members]);
  const watersById = useMemo(() => buildLookup(waters), [waters]);
  const baitsById = useMemo(() => buildLookup(baits), [baits]);

  const member = membersById[memberId];
  const memberCatches = member ? sortCatches(getMemberCatches(catches, memberId), 'date-desc') : [];
  const memberStats = member ? getMemberStats(memberId, catches) : null;

  if (!member) {
    return (
      <section className="section">
        <div className="site-container">
          <EmptyState
            title="No encontramos ese perfil"
            text="Vuelve al inicio para elegir uno de los pescadores del equipo."
          />
        </div>
      </section>
    );
  }

  const favoriteBaits = member.favoriteBaitIds.map((baitId) => baitsById[baitId]).filter(Boolean);
  const mostVisitedWaters = [...new Set(memberCatches.map((capture) => capture.waterId))]
    .map((waterId) => watersById[waterId])
    .filter(Boolean);

  return (
    <>
      <Hero
        eyebrow={`Perfil · ${member.role}`}
        title={member.name}
        description={member.intro}
        primaryAction={{ to: '/capturas', label: 'Ver todas las capturas' }}
        secondaryAction={{ to: '/panel', label: 'Subir una nueva' }}
        compact
        backgroundImage={member.image}
        stats={[
          { label: 'Capturas', value: memberStats.total, helper: 'Base + formulario' },
          {
            label: 'Mejor peso',
            value: formatWeight(memberStats.bestWeight),
            helper: 'PB personal',
          },
          { label: 'Koi', value: memberStats.koiCount, helper: 'Nuevo tipo disponible' },
          {
            label: 'Otras especies',
            value: memberStats.barboCount + memberStats.pezGatoCount,
            helper: 'Barbos y pez gato',
          },
        ]}
      />

      <section className="section">
        <div className="site-container">
          <StatStrip
            items={[
              {
                label: 'Escenarios habituales',
                value: mostVisitedWaters.length,
                helper: mostVisitedWaters.map((water) => water.shortName).join(' · '),
              },
              {
                label: 'Ultima captura',
                value: memberCatches[0] ? watersById[memberCatches[0].waterId]?.shortName : '--',
                helper: memberCatches[0] ? formatDate(memberCatches[0].date) : 'Sin datos',
              },
              {
                label: 'Cebos favoritos',
                value: favoriteBaits.length,
                helper: favoriteBaits.map((bait) => bait.name).join(' · '),
              },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <SectionHeading
            overline="Cebos favoritos"
            title={`Las referencias mas repetidas de ${member.name}`}
            text="Cada tarjeta mantiene la misma estetica y se apoya en los cebos ya existentes en la web."
          />

          <div className="grid grid-baits">
            {favoriteBaits.map((bait) => (
              <article className="info-card bait-card" key={bait.id}>
                <div className="bait-card-image">
                  <img src={assetPath(bait.image)} alt={bait.name} />
                </div>
                <div className="bait-card-body">
                  <span className="card-kicker">{bait.category}</span>
                  <h3>{bait.name}</h3>
                  <p>{bait.description}</p>
                  <div className="chip-row">
                    <span className="chip">{bait.style}</span>
                    <span className="chip">{member.name}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="site-container">
          <SectionHeading
            overline="Galeria personal"
            title={`Capturas de ${member.name}`}
            text="Aqui se mezclan las capturas base con las que subais desde el panel."
          />

          {memberCatches.length === 0 ? (
            <EmptyState
              title="No hay capturas cargadas"
              text="Sube una nueva desde el panel para completar este perfil."
            />
          ) : (
            <div className="grid grid-captures">
              {memberCatches.map((capture) => (
                <CaptureCard
                  key={capture.id}
                  capture={capture}
                  member={member}
                  water={watersById[capture.waterId]}
                  bait={baitsById[capture.baitId]}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <SectionHeading
            overline="Escenarios relacionados"
            title={`Donde suele moverse ${member.name}`}
            text="Pulsa en cualquier escenario para ver la ficha completa y sus capturas."
          />

          <div className="location-links">
            {mostVisitedWaters.map((water) => (
              <Link className="location-link" key={water.id} to={`/charcas/${water.id}`}>
                <div>
                  <strong>{water.shortName}</strong>
                  <span>
                    {water.type} · {water.province}
                  </span>
                </div>
                <CarpTypeBadge
                  carpType={
                    memberCatches.find((capture) => capture.waterId === water.id)?.carpType ??
                    'common'
                  }
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
