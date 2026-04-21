import { Link } from 'react-router-dom';
import { assetPath, formatWeight } from '../utils/siteUtils';

export default function MemberCard({ member, stats, favoriteBaits = [] }) {
  return (
    <article className="info-card member-card">
      <div className="member-card-image">
        <img src={assetPath(member.image)} alt={member.name} />
      </div>

      <div className="member-card-body">
        <span className="card-kicker">{member.role}</span>
        <h3>{member.name}</h3>
        <p>{member.intro}</p>

        <div className="member-stats-grid">
          <div>
            <span>Capturas</span>
            <strong>{stats.total}</strong>
          </div>
          <div>
            <span>Mejor peso</span>
            <strong>{formatWeight(stats.bestWeight)}</strong>
          </div>
          <div>
            <span>Koi</span>
            <strong>{stats.koiCount}</strong>
          </div>
          <div>
            <span>Otras especies</span>
            <strong>{stats.barboCount + stats.pezGatoCount}</strong>
          </div>
        </div>

        <div className="chip-row">
          {favoriteBaits.map((bait) => (
            <span className="chip" key={bait.id}>
              {bait.name}
            </span>
          ))}
        </div>

        <Link className="button button-secondary button-small" to={`/pescadores/${member.id}`}>
          Ver perfil
        </Link>
      </div>
    </article>
  );
}
