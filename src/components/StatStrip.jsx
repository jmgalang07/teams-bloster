export default function StatStrip({ items }) {
  return (
    <div className="stat-strip">
      {items.map((item) => (
        <article className="stat-strip-card" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.helper ? <small>{item.helper}</small> : null}
        </article>
      ))}
    </div>
  );
}
