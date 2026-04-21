import Hero from "../components/Hero";
import SectionHeading from "../components/SectionHeading";
import BrandCard from "../components/BrandCard";
import { useSiteData } from "../context/SiteDataContext";

export default function CebosPage() {
  const { cebos } = useSiteData();

  return (
    <>
      <Hero
        eyebrow="Catalogo informativo"
        title="Cebos de carpfishing"
        description="He dejado tambien los cebos con enlace directo para que al pulsar en la imagen o en el boton se abra su web."
        compact
        backgroundImage="images/logo.png"
        stats={[
          {
            label: "Selección de cebos",
            value: cebos.length,
            helper: "Marcas reconocidas y visibles",
          },
          {
            label: "Enlaces verificados",
            value: "Online",
            helper: "Salida directa a su página de referencia",
          },
        ]}
      />

      <section className="section">
        <div className="site-container">
          <SectionHeading
            overline="Informacion editable"
            title="Catalogo de cebos integrado con la misma estetica"
            text="Cada tarjeta incluye descripcion, especialidad, productos destacados y acceso directo a su pagina web."
          />

          <div className="grid grid-brands">
            {cebos.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
