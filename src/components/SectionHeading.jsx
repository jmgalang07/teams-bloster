export default function SectionHeading({ overline, title, text, align = 'left' }) {
  return (
    <div className={`section-heading align-${align}`}>
      {overline ? <span className="eyebrow">{overline}</span> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
