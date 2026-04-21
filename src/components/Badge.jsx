import { getFishTypeMeta } from '../utils/siteUtils';

export default function Badge({ type = 'neutral', children }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

export function CarpTypeBadge({ carpType }) {
  const meta = getFishTypeMeta(carpType);
  return <Badge type={meta.badge}>{meta.label}</Badge>;
}
