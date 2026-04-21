import Hero from '../components/Hero';
import SectionHeading from '../components/SectionHeading';
import BrandCard from '../components/BrandCard';
import { useSiteData } from '../context/SiteDataContext';

export default function BrandsPage() {
  const { brands } = useSiteData();

  return (
    <>
      <Hero
        eyebrow="Catalogo informativo"
        title="Marcas de carpfishing"
        description="Ahora las tarjetas enlazan a la pagina web de cada marca desde la imagen, el nombre y el boton final."
        compact
        backgroundImage="images/logo.png"
        stats={[
  { label: 'Marcas en catálogo', value: brands.length, helper: 'Fabricantes y referencias destacadas' },
  { label: 'Consulta online', value: 'Disponible', helper: 'Enlace a web oficial o página de referencia' },
]}
      />

      <section className="section">
        <div className="site-container">
          <SectionHeading
            overline="Informacion editable"
            title="Catalogo integrado con la estetica de la web"
            text="Cada marca lleva nombre, logo, descripcion, productos destacados y un enlace para ampliar informacion fuera de la web."
          />

          <div className="grid grid-brands">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
