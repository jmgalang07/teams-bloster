-- Seed data migrated from the original Team's Bloster project

begin;

insert into public.site_settings (key, value) values

  ('site_meta', '{"name":"Team''s Bloster","tagline":"Capturas, cebos y escenarios con alma de carpfishing","intro":"Web estatica del grupo para guardar nuestras mejores carpas, revisar cebos favoritos y ordenar sesiones por pescador y escenario.","ctaPrimary":"Ver capturas","ctaSecondary":"Explorar charcas"}'::jsonb)

on conflict (key) do update set value = excluded.value;

insert into public.fish_types (id, label, badge, sort_order) values

  ('royal'::public.carp_type, 'Royal', 'royal', 1),
  ('common'::public.carp_type, 'Comun', 'common', 2),
  ('koi'::public.carp_type, 'Koi', 'koi', 3),
  ('barbo'::public.carp_type, 'Barbo', 'barbo', 4),
  ('pez-gato'::public.carp_type, 'Pez gato', 'pez-gato', 5)

on conflict (id) do update set label=excluded.label, badge=excluded.badge, sort_order=excluded.sort_order;

insert into public.water_type_options (id, label, sort_order) values

  ('embalse', 'Embalse', 1),
  ('charca', 'Charca', 2),
  ('rio', 'Rio', 3),
  ('canal', 'Canal', 4),
  ('lago', 'Lago', 5),
  ('pais-zona', 'Pais / zona', 6)

on conflict (id) do update set label=excluded.label, sort_order=excluded.sort_order;

insert into public.water_difficulty_options (id, label, sort_order) values

  ('baja', 'Baja', 1),
  ('baja-media', 'Baja / media', 2),
  ('media', 'Media', 3),
  ('media-alta', 'Media / alta', 4),
  ('alta', 'Alta', 5)

on conflict (id) do update set label=excluded.label, sort_order=excluded.sort_order;

insert into public.baits (id, name, category, style, description, image, source, sort_order) values

  ('scopex-squid', 'Scopex & Squid', 'Boilie', 'Dulce / pescado', 'Boilie polivalente para sesiones largas y peces desconfiados.', 'storage://team-assets/images/baits/scopex-squid.svg', 'seed'::public.source_type, 1),
  ('krill-red', 'Krill Red', 'Boilie', 'Alta atraccion', 'Mezcla intensa para agua fria y escenarios de peces grandes.', 'storage://team-assets/images/baits/krill-red.svg', 'seed'::public.source_type, 2),
  ('tigernut-cream', 'Tiger Nut Cream', 'Particula / boilie', 'Dulce y cremosa', 'Muy efectiva en charcas y orillas con actividad constante.', 'storage://team-assets/images/baits/tigernut-cream.svg', 'seed'::public.source_type, 3),
  ('pineapple-pop', 'Pineapple Pop-Up', 'Pop-up', 'Acida / visual', 'Perfecta para montajes snowman y presentaciones muy visibles.', 'storage://team-assets/images/baits/pineapple-pop.svg', 'seed'::public.source_type, 4),
  ('monster-crab', 'Monster Crab', 'Boilie', 'Marina / especiada', 'Clasico de confianza para peces seleccionados y fondales duros.', 'storage://team-assets/images/baits/monster-crab.svg', 'seed'::public.source_type, 5),
  ('sweet-corn-cloud', 'Sweet Corn Cloud', 'Particula', 'Dulce / nube', 'Muy buena para pescar rapido y activar la zona con poco tiempo.', 'storage://team-assets/images/baits/sweet-corn-cloud.svg', 'seed'::public.source_type, 6),
  ('pink-fruity', 'Pink Fruity', 'Pop-up', 'Frutal / visual', 'Opcion ligera y muy marcada para cebados cortos y limpios.', 'storage://team-assets/images/baits/pink-fruity.svg', 'seed'::public.source_type, 7),
  ('tiger-xtreme', 'Tiger Xtreme', 'Particula premium', 'Nuez / especias', 'Gran opcion para escenarios presionados donde manda la confianza.', 'storage://team-assets/images/baits/tiger-xtreme.svg', 'seed'::public.source_type, 8)

on conflict (id) do update set name=excluded.name, category=excluded.category, style=excluded.style, description=excluded.description, image=excluded.image, source=excluded.source, sort_order=excluded.sort_order;

insert into public.members (id, name, role, intro, image, accent, source, sort_order) values

  ('juanma', 'Juanma', 'Estratega de largas sesiones', 'Paciente, muy fino con el montaje y siempre pendiente de la lectura del agua. Le gustan las sesiones largas y ajustar el cebo con mimo.', 'storage://team-assets/images/members/juanma.jpeg', 'teal', 'seed'::public.source_type, 1),
  ('dani', 'Dani', 'Movilidad y pesca de respuesta', 'Rapido para localizar actividad y muy resolutivo cuando toca cambiar de plan. Saca partido a charcas medias y escenarios tecnicos.', 'storage://team-assets/images/members/dani.jpeg', 'sand', 'seed'::public.source_type, 2),
  ('alvaro', 'Alvaro', 'Buscador de peces grandes', 'Le van los retos, los embalses grandes y los montajes sobrios. Siempre busca una vuelta mas para sacar la captura del dia.', 'storage://team-assets/images/members/alvaro.jpeg', 'blue', 'seed'::public.source_type, 3),
  ('vima', 'Vima', 'Detalle, ritmo y constancia', 'Muy ordenado con los cebados y con mucha fe en los patrones repetibles. Cuando da con la clave, acumula capturas con regularidad.', 'storage://team-assets/images/members/vima.jpeg', 'green', 'seed'::public.source_type, 4)

on conflict (id) do update set name=excluded.name, role=excluded.role, intro=excluded.intro, image=excluded.image, accent=excluded.accent, source=excluded.source, sort_order=excluded.sort_order;

insert into public.waters (id, name, short_name, type, province, description, known_for, best_season, difficulty, image, tags, notes, website, source, sort_order) values

  ('orellana', 'Embalse de Orellana', 'Orellana', 'Embalse', 'Badajoz', 'Escenario grande y muy visual para sesiones largas, con posibilidades de sacar royales y comunes de mucho porte.', 'Grandes royales y pesca de distancia', 'Primavera y otono', 'Media / alta', 'storage://team-assets/images/waters/orellana.png', ARRAY['grandes peces','sesiones largas','royales']::text[], 'Buen escenario para trabajar zonas de grava, entradas de viento y cebados medidos.', '', 'seed'::public.source_type, 1),
  ('proserpina', 'Embalse de Proserpina', 'Proserpina', 'Embalse', 'Badajoz', 'Agua muy conocida y comoda para plantear jornadas tecnicas, ideal para jugar con pop-ups y presentaciones limpias.', 'Pesca tecnica y cebados cortos', 'Primavera', 'Media', 'storage://team-assets/images/waters/proserpina.png', ARRAY['tecnica','orillas limpias','pop-up']::text[], 'Muy interesante para sesiones cortas bien planteadas y lectura visual del escenario.', '', 'seed'::public.source_type, 2),
  ('don-benito', 'Charca Don Benito', 'Don Benito', 'Charca', 'Badajoz', 'Escenario comodo para pescar rapido, mover cebos dulces y buscar actividad constante a media distancia.', 'Carpas activas y pesca agil', 'Primavera y verano', 'Baja / media', 'storage://team-assets/images/waters/don-benito.png', ARRAY['rapida','dulce','charca']::text[], 'Las mezclas de maiz, particulas y cebos dulces suelen funcionar muy bien cuando el pez se mueve.', '', 'seed'::public.source_type, 3),
  ('valverde', 'Charca Valverde', 'Valverde', 'Charca', 'Badajoz', 'Zona entretenida para montar pescas tacticas y trabajar peces de media entidad con cebos visibles y precisos.', 'Sesiones cortas y royales activas', 'Invierno y primavera', 'Media', 'storage://team-assets/images/waters/valverde.jpeg', ARRAY['royal','charca','sesiones cortas']::text[], 'Ideal para insistir con montajes visuales y cebados muy controlados.', '', 'seed'::public.source_type, 4),
  ('don-tello', 'Don Tello', 'Don Tello', 'Rio', 'Badajoz', 'Escenario cambiante, perfecto para leer corrientes, buscar pasos de carpas y apostar por cebos de mucha confianza.', 'Comunes fuertes y pesca cambiante', 'Primavera y otono', 'Alta', 'storage://team-assets/images/waters/don-tello.jpeg', ARRAY['rio','corriente','comunes']::text[], 'La movilidad, el posicionamiento y el trabajo del cebo marcan mucho la diferencia.', '', 'seed'::public.source_type, 5),
  ('sierra-brava', 'Embalse de Sierra Brava', 'Sierra Brava', 'Embalse', 'Caceres', 'Agua grande, potente y con posibilidades de sacar peces muy serios, especialmente cuando se acierta con la zona.', 'Big fish y jornadas maraton', 'Otono e invierno', 'Alta', 'storage://team-assets/images/waters/sierra-brava.png', ARRAY['big fish','embalse','larga distancia']::text[], 'Conviene cebar con precision y mantener una estrategia consistente de varias horas.', '', 'seed'::public.source_type, 6),
  ('las-tijeras', 'Las Tijeras', 'Las Tijeras', 'Charca', 'Badajoz', 'Escenario recogido y muy practico para sesiones cortas, con zonas limpias donde destacan las presentaciones visibles.', 'Jornadas rapidas y montajes visuales', 'Primavera y otono', 'Media', 'storage://team-assets/images/logo.png', ARRAY['sesion corta','charca','visual']::text[], 'Buena opcion para trabajar puestos concretos con cebado medido y montajes limpios.', '', 'seed'::public.source_type, 7),
  ('gijo', 'Gijo', 'Gijo', 'Rio', 'Badajoz', 'Tramo cambiante para leer actividad, aprovechar pasos de pez y sacar partido a cebos de mucha confianza.', 'Pesca de paso y movilidad', 'Primavera', 'Alta', 'storage://team-assets/images/logo.png', ARRAY['rio','movilidad','paso de pez']::text[], 'Conviene observar mucho el escenario y ajustar rapido tanto el puesto como la presentacion.', '', 'seed'::public.source_type, 8),
  ('portugal', 'Portugal', 'Portugal', 'Pais / zona', 'Portugal', 'Escenario general para viajes, sesiones fuera de Extremadura y capturas registradas en aguas portuguesas.', 'Viajes y escenarios internacionales', 'Todo el ano', 'Media', 'storage://team-assets/images/logo.png', ARRAY['portugal','viaje','internacional']::text[], 'Pensado para guardar capturas y jornadas cuando solo quieras indicar que la sesion fue en Portugal.', '', 'seed'::public.source_type, 9),
  ('horno-tejero', 'Horno Tejero', 'Horno Tejero', 'Embalse', 'Badajoz', '', 'Grandes peces', 'Primavera y otono', 'Alta', 'storage://team-assets/images/uploads/waters/horno-tejero.jpg', ARRAY[]::text[], '', '', 'custom'::public.source_type, 10)

on conflict (id) do update set name=excluded.name, short_name=excluded.short_name, type=excluded.type, province=excluded.province, description=excluded.description, known_for=excluded.known_for, best_season=excluded.best_season, difficulty=excluded.difficulty, image=excluded.image, tags=excluded.tags, notes=excluded.notes, website=excluded.website, source=excluded.source, sort_order=excluded.sort_order;

delete from public.member_favorite_baits;

insert into public.member_favorite_baits (member_id, bait_id, sort_order) values

  ('juanma', 'scopex-squid', 1),
  ('juanma', 'tiger-xtreme', 2),
  ('juanma', 'pineapple-pop', 3),
  ('dani', 'krill-red', 1),
  ('dani', 'sweet-corn-cloud', 2),
  ('dani', 'monster-crab', 3),
  ('alvaro', 'pink-fruity', 1),
  ('alvaro', 'krill-red', 2),
  ('alvaro', 'tigernut-cream', 3),
  ('vima', 'pineapple-pop', 1),
  ('vima', 'scopex-squid', 2),
  ('vima', 'monster-crab', 3)

on conflict (member_id, bait_id) do update set sort_order=excluded.sort_order;

delete from public.member_home_waters;

insert into public.member_home_waters (member_id, water_id, sort_order) values

  ('juanma', 'orellana', 1),
  ('juanma', 'don-tello', 2),
  ('juanma', 'sierra-brava', 3),
  ('dani', 'don-benito', 1),
  ('dani', 'valverde', 2),
  ('dani', 'proserpina', 3),
  ('alvaro', 'sierra-brava', 1),
  ('alvaro', 'orellana', 2),
  ('alvaro', 'proserpina', 3),
  ('vima', 'valverde', 1),
  ('vima', 'orellana', 2),
  ('vima', 'sierra-brava', 3)

on conflict (member_id, water_id) do update set sort_order=excluded.sort_order;

insert into public.catches (id, member_id, water_id, bait_id, carp_type, weight_kg, caught_on, rig, image, notes, source, sort_order) values

  ('c2', 'juanma', 'proserpina', 'tiger-xtreme', 'royal'::public.carp_type, 9, '2025-05-08'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/c-juanma-proserpina-1.jpeg', 'Captura en paso de corriente con mucha lectura del escenario.', 'seed'::public.source_type, 1),
  ('c3', 'juanma', 'don-benito', 'krill-red', 'common'::public.carp_type, 9, '2024-11-21'::date, 'Bottom bait', 'storage://team-assets/images/catches/c-juanma-charca-don-benito-1.jpeg', 'Picada lenta tras cebado progresivo en una zona profunda.', 'seed'::public.source_type, 2),
  ('c4', 'juanma', 'las-tijeras', 'pineapple-pop', 'royal'::public.carp_type, 7, '2024-04-14'::date, 'Chod ligero', 'storage://team-assets/images/catches/c-juanma-lasTijeras-1.jpeg', 'Sesion corta con montaje muy visible y fondo limpio.', 'seed'::public.source_type, 3),
  ('c5', 'juanma', 'sierra-brava', 'pineapple-pop', 'common'::public.carp_type, 5, '2024-04-14'::date, 'Chod ligero', 'storage://team-assets/images/catches/c-juanma-sierra-brava-1.png', 'Sesion corta con montaje muy visible y fondo limpio.', 'seed'::public.source_type, 4),
  ('c28', 'juanma', 'sierra-brava', 'pineapple-pop', 'common'::public.carp_type, 4, '2024-04-14'::date, 'Chod ligero', 'storage://team-assets/images/catches/c-juanma-sierra-brava-2.png', 'Sesion corta con montaje muy visible y fondo limpio.', 'seed'::public.source_type, 5),
  ('c6', 'dani', 'don-benito', 'sweet-corn-cloud', 'common'::public.carp_type, 12, '2025-06-17'::date, 'D-rig corto', 'storage://team-assets/images/catches/c-dani-don-benito-1.jpeg', 'Respuesta rapida a media distancia con mezcla dulce y nube.', 'seed'::public.source_type, 6),
  ('c17', 'dani', 'don-benito', 'sweet-corn-cloud', 'common'::public.carp_type, 10, '2025-06-20'::date, 'D-rig corto', 'storage://team-assets/images/catches/c-dani-charca-don-benito-1.jpeg', 'Respuesta rapida a media distancia con mezcla dulce y nube.', 'seed'::public.source_type, 7),
  ('c18', 'dani', 'don-benito', 'sweet-corn-cloud', 'comun'::public.carp_type, 8, '2025-06-20'::date, 'D-rig corto', 'storage://team-assets/images/catches/c-dani-charca-don-benito-2.jpeg', 'Respuesta rapida a media distancia con mezcla dulce y nube.', 'seed'::public.source_type, 8),
  ('c19', 'dani', 'don-benito', 'sweet-corn-cloud', 'comun'::public.carp_type, 10, '2025-06-20'::date, 'D-rig corto', 'storage://team-assets/images/catches/c-dani-charca-don-benito-3.jpeg', 'Respuesta rapida a media distancia con mezcla dulce y nube.', 'seed'::public.source_type, 9),
  ('c22', 'dani', 'don-benito', 'sweet-corn-cloud', 'royal'::public.carp_type, 10, '2025-06-20'::date, 'D-rig corto', 'storage://team-assets/images/catches/c-dani-don-benito-2.jpeg', 'Respuesta rapida a media distancia con mezcla dulce y nube.', 'seed'::public.source_type, 10),
  ('c7', 'dani', 'valverde', 'tigernut-cream', 'common'::public.carp_type, 11, '2024-10-06'::date, 'Snowman', 'storage://team-assets/images/catches/c-dani-valverde-1.jpeg', 'Picada al amanecer con actividad pegada a la orilla.', 'seed'::public.source_type, 11),
  ('c20', 'dani', 'valverde', 'tigernut-cream', 'royal'::public.carp_type, 9, '2024-10-06'::date, 'Snowman', 'storage://team-assets/images/catches/c-dani-valverde-2.jpeg', 'Picada al amanecer con actividad pegada a la orilla.', 'seed'::public.source_type, 12),
  ('c21', 'dani', 'valverde', 'tigernut-cream', 'common'::public.carp_type, 8, '2024-10-06'::date, 'Snowman', 'storage://team-assets/images/catches/c-dani-valverde-3.jpeg', 'Picada al amanecer con actividad pegada a la orilla.', 'seed'::public.source_type, 13),
  ('c30', 'dani', 'don-tello', 'tiger-xtreme', 'pez-gato'::public.carp_type, 10, '2025-05-08'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/pg-dani-don-tello-1.jpeg', 'Captura en paso de corriente con mucha lectura del escenario.', 'seed'::public.source_type, 14),
  ('c29', 'dani', 'don-tello', 'tiger-xtreme', 'common'::public.carp_type, 7, '2025-05-08'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/c-dani-don-tello-1.jpeg', 'Captura en paso de corriente con mucha lectura del escenario.', 'seed'::public.source_type, 15),
  ('c10', 'alvaro', 'don-tello', 'monster-crab', 'common'::public.carp_type, 9, '2024-07-18'::date, 'Hair rig largo', 'storage://team-assets/images/catches/c-alvaro-don-tello-1.jpeg', 'Captura en una orilla tomada con el agua muy viva.', 'seed'::public.source_type, 16),
  ('c32', 'alvaro', 'valverde', 'tigernut-cream', 'common'::public.carp_type, 11, '2024-10-06'::date, 'Snowman', 'storage://team-assets/images/catches/c-alvaro-valverde-1.jpeg', 'Picada al amanecer con actividad pegada a la orilla.', 'seed'::public.source_type, 17),
  ('c31', 'alvaro', 'don-benito', 'sweet-corn-cloud', 'royal'::public.carp_type, 7, '2024-05-30'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/c-alvaro-charca-don-benito-1.jpeg', 'Muy efectiva la mezcla dulce con pesca rapida de tarde.', 'seed'::public.source_type, 18),
  ('c33', 'alvaro', 'don-benito', 'sweet-corn-cloud', 'common'::public.carp_type, 6, '2024-05-30'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/c-alvaro-charca-don-benito-2.jpeg', 'Muy efectiva la mezcla dulce con pesca rapida de tarde.', 'seed'::public.source_type, 19),
  ('c34', 'alvaro', 'don-benito', 'sweet-corn-cloud', 'common'::public.carp_type, 7, '2024-05-30'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/c-alvaro-charca-don-benito-3.png', 'Muy efectiva la mezcla dulce con pesca rapida de tarde.', 'seed'::public.source_type, 20),
  ('c15', 'vima', 'don-benito', 'sweet-corn-cloud', 'common'::public.carp_type, 11, '2024-05-30'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/c-vima-charca-don-benito-1.png', 'Muy efectiva la mezcla dulce con pesca rapida de tarde.', 'seed'::public.source_type, 21),
  ('c13', 'vima', 'don-benito', 'sweet-corn-cloud', 'common'::public.carp_type, 12, '2024-05-30'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/c-vima-charca-don-benito-2.png', 'Muy efectiva la mezcla dulce con pesca rapida de tarde.', 'seed'::public.source_type, 22),
  ('c16', 'vima', 'don-tello', 'tiger-xtreme', 'common'::public.carp_type, 7, '2025-05-08'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/c-vima-don-tello-1.jpeg', 'Captura en paso de corriente con mucha lectura del escenario.', 'seed'::public.source_type, 23),
  ('c23', 'vima', 'don-tello', 'tiger-xtreme', 'pez-gato'::public.carp_type, 10, '2025-05-08'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/pg-vima-don-tello-1.jpeg', 'Captura en paso de corriente con mucha lectura del escenario.', 'seed'::public.source_type, 24),
  ('c26', 'vima', 'don-benito', 'tiger-xtreme', 'barbo'::public.carp_type, 9, '2025-05-08'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/c-vima-charca-don-benito-3.png', 'Captura en paso de corriente con mucha lectura del escenario.', 'seed'::public.source_type, 25),
  ('c24', 'vima', 'gijo', 'tiger-xtreme', 'common'::public.carp_type, 10, '2025-05-08'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/c-vima-gijo-1.jpeg', 'Captura en paso de corriente con mucha lectura del escenario.', 'seed'::public.source_type, 26),
  ('c25', 'vima', 'gijo', 'tiger-xtreme', 'common'::public.carp_type, 7.5, '2025-05-08'::date, 'Hair rig clasico', 'storage://team-assets/images/catches/c-vima-gijo-2.jpeg', 'Captura en paso de corriente con mucha lectura del escenario.', 'seed'::public.source_type, 27)

on conflict (id) do update set member_id=excluded.member_id, water_id=excluded.water_id, bait_id=excluded.bait_id, carp_type=excluded.carp_type, weight_kg=excluded.weight_kg, caught_on=excluded.caught_on, rig=excluded.rig, image=excluded.image, notes=excluded.notes, source=excluded.source, sort_order=excluded.sort_order;

insert into public.brands (id, name, specialty, known_for, featured_products, description, image, url, source, sort_order) values

  ('korda', 'Korda', 'Terminal tackle y estrategia', 'Montajes, accesorios y material tecnico', ARRAY['Anzuelos','Lead clips','Accesorios de montaje']::text[], 'Marca muy reconocida por su enfoque tecnico, material de montaje y filosofia de pesca muy cuidada.', 'storage://team-assets/images/brands/korda.png', 'https://kordatackle.com', 'seed'::public.source_type, 1),
  ('nash', 'Nash', 'Equipamiento integral', 'Bivvies, ropa, luggage y tackle', ARRAY['Bivvies','Mochilas','Boilies']::text[], 'Catalogo muy amplio para el carp angler que busca desde equipamiento hasta cebos y textil.', 'storage://team-assets/images/brands/nash.png', 'https://nashtackle.co.uk', 'seed'::public.source_type, 2),
  ('fox', 'Fox', 'Canas, soportes y material completo', 'Rod pods, canas y accesorios', ARRAY['Canas','Rod pods','Alarmas']::text[], 'Marca muy extendida por ofrecer soluciones completas para sesiones de diferente nivel y presupuesto.', 'storage://team-assets/images/brands/fox.png', 'https://www.foxint.com', 'seed'::public.source_type, 3),
  ('ridgemonkey', 'RidgeMonkey', 'Accesorios inteligentes', 'Cocina de session y gadgets utiles', ARRAY['Sartenes','Luces','Power packs']::text[], 'Muy apreciada por accesorios practicos que mejoran la comodidad durante las jornadas largas.', 'storage://team-assets/images/brands/ridgemonkey.png', 'https://ridgemonkey.co.uk', 'seed'::public.source_type, 4),
  ('sonik', 'Sonik', 'Material con gran equilibrio calidad/precio', 'Canas, alarmas y equipamiento', ARRAY['Canas','Alarmas','Sillas']::text[], 'Buena opcion para montar un equipo funcional y moderno sin renunciar a una estetica cuidada.', 'storage://team-assets/images/brands/sonik.png', 'https://www.soniksports.com', 'seed'::public.source_type, 5),
  ('shimano', 'Shimano', 'Carretes y mecanica', 'Carretes robustos y suaves', ARRAY['Carretes','Canas','Accesorios']::text[], 'Referente para muchos pescadores cuando buscan carretes fiables y una sensacion de trabajo muy fina.', 'storage://team-assets/images/brands/shimano.png', 'https://fish.shimano.com/es-ES', 'seed'::public.source_type, 6),
  ('ultimate', 'Ultimate', 'Material accesible y equipamiento completo', 'Canas, carretes, rod pods y accesorios', ARRAY['Canas','Carretes','Rod pods']::text[], 'Ultimate es una marca conocida por ofrecer equipamiento variado y funcional, muy interesante para pescadores que buscan montar un equipo completo con buena relacion calidad/precio.', 'storage://team-assets/images/brands/ultimate.png', 'https://ultimateangling.com/en', 'seed'::public.source_type, 7),
  ('solar-tackle', 'Solar Tackle', 'Accesorios tecnicos y equipamiento premium', 'Rod pods, bankware, soportes y accesorios de gran fiabilidad', ARRAY['Rod pods','Bankware','Accesorios']::text[], 'Solar Tackle es una marca muy valorada en carpfishing por la calidad de sus acabados, la resistencia de sus materiales y su enfoque tecnico, es ideal para pescadores que buscan soluciones duraderas y fiables para sesiones exigentes.', 'storage://team-assets/images/brands/solar-tackle.png', 'https://tiendacarpfishing.es/collections/solar', 'seed'::public.source_type, 8),
  ('avidcarp', 'Avid Carp', 'Tackle moderno y funcional', 'Equipamiento, montajes y accesorios practicos', ARRAY['Accesorios','Bolsas','Terminal tackle']::text[], 'Avid Carp destaca por un catalogo moderno, orientado a pescadores que quieren material funcional y bien resuelto.', 'storage://team-assets/images/brands/avidcarp.png', 'https://www.avidcarp.com', 'seed'::public.source_type, 9),
  ('daiwa', 'Daiwa', 'Carretes y canas', 'Mecanica de calidad y material contrastado', ARRAY['Carretes','Canas','Accesorios']::text[], 'Daiwa es una marca muy respetada por su trabajo en carretes y canas, con productos muy apreciados por pescadores de distintos niveles.', 'storage://team-assets/images/brands/daiwa.png', 'https://www.daiwa.com', 'seed'::public.source_type, 10),
  ('prologic', 'Prologic', 'Equipamiento completo', 'Canas, alarmas, luggage y accesorios', ARRAY['Canas','Alarmas','Bolsas']::text[], 'Prologic ofrece una gama amplia para montar un equipo completo, con propuestas funcionales y una estetica muy reconocible.', 'storage://team-assets/images/brands/prologic.png', 'https://www.prologicfishing.com', 'seed'::public.source_type, 11),
  ('ngt', 'NGT', 'Accesorios y equipamiento asequible', 'Material practico y buena relacion calidad/precio', ARRAY['Rod pods','Sillas','Accesorios']::text[], 'NGT es habitual entre pescadores que buscan material funcional y accesible para montar o ampliar equipo sin complicarse.', 'storage://team-assets/images/brands/ngt.png', 'https://ngtonline.co.uk', 'seed'::public.source_type, 12)

on conflict (id) do update set name=excluded.name, specialty=excluded.specialty, known_for=excluded.known_for, featured_products=excluded.featured_products, description=excluded.description, image=excluded.image, url=excluded.url, source=excluded.source, sort_order=excluded.sort_order;

insert into public.bait_brands (id, name, specialty, featured_products, description, image, url, source, sort_order) values

  ('proelitebaits', 'Proelitebaits', 'Boilies equilibrados y cebos técnicos', ARRAY['Boilies','Pop Ups','Hookbaits','Pellets']::text[], 'Marca conocida en el mundo del carpfishing por ofrecer cebos bien trabajados, pensados para pescadores que buscan confianza y regularidad en sus sesiones.', 'storage://team-assets/images/cebos/proelitebaits.png', 'https://proelitebaits.com', 'seed'::public.source_type, 1),
  ('mainabaits', 'Maina Baits', 'Boilies artesanales y cebos naturales', ARRAY['Boilies','Pop Ups','Hookbaits','Liquids']::text[], 'Maina Baits es una marca española centrada en el desarrollo de cebos artesanales para carpfishing, con una filosofía basada en ingredientes naturales y recetas probadas en escenarios reales.', 'storage://team-assets/images/cebos/mainabaits.png', 'https://mainabaits.com/', 'seed'::public.source_type, 2),
  ('luxurybaits', 'Luxurybaits', 'Cebos premium y atracción intensa', ARRAY['Boilies premium','Dumbells','Liquids','Wafters']::text[], 'Luxurybaits destaca por una propuesta cuidada, con cebos pensados para escenarios exigentes y pescadores que valoran tanto la calidad como la presentación.', 'storage://team-assets/images/cebos/luxurybaits.png', 'https://luxurybaits.com/', 'seed'::public.source_type, 3),
  ('dsabaits', 'Dsabaits', 'Versatilidad y rendimiento', ARRAY['Boilies','Pastas','Pellets','Stick mix']::text[], 'Dsabaits apuesta por cebos orientados al rendimiento, con mezclas atractivas y opciones versátiles para distintas épocas del año y diferentes masas de agua.', 'storage://team-assets/images/cebos/dsabaits.png', 'https://dsabaits.com/', 'seed'::public.source_type, 4),
  ('kromquality', 'Kromquality', 'Calidad constante y cebos de confianza', ARRAY['Boilies','Pop Ups','Aditivos','Groundbait']::text[], 'Kromquality transmite una línea de trabajo centrada en la consistencia del producto y en ofrecer soluciones fiables para sesiones rápidas o campañas largas.', 'storage://team-assets/images/cebos/kromquality.png', 'https://www.coletascarp.com/index.php/brand/krom-quality/', 'seed'::public.source_type, 5),
  ('superbaits', 'Superbaits', 'Atracción rápida y eficacia', ARRAY['Boilies rápidos','Pellets','Wafters','Boosters']::text[], 'Superbaits es una opción interesante para quienes buscan cebos efectivos, directos y pensados para generar respuesta rápida sin renunciar a una buena base nutricional.', 'storage://team-assets/images/cebos/superbaits.png', 'https://www.santanacarp.com/fabricante/superbaits/', 'seed'::public.source_type, 6),
  ('peralbaits', 'Peralbaits', 'Cebos adaptables para carpfishing', ARRAY['Boilies','Hookbaits','Remojos','Spod mix']::text[], 'Peralbaits ofrece una selección enfocada en la pesca de carpa, con productos que combinan atractivo, practicidad y una propuesta adaptable a distintos estilos de pesca.', 'storage://team-assets/images/cebos/peralbaits.png', 'https://peralbaits.es/', 'seed'::public.source_type, 7)

on conflict (id) do update set name=excluded.name, specialty=excluded.specialty, featured_products=excluded.featured_products, description=excluded.description, image=excluded.image, url=excluded.url, source=excluded.source, sort_order=excluded.sort_order;

insert into public.assets (bucket, path, public_url, source_path, entity_type, entity_id, kind, mime_type, metadata) values

  ('team-assets', 'images/uploads/waters/horno-tejero.jpg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/uploads/waters/horno-tejero.jpg', 'public/data/project-overrides.json', 'water', 'horno-tejero', 'image', 'image/jpeg', '{"alt":"Horno Tejero"}'::jsonb),
  ('team-assets', 'images/waters/orellana.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/waters/orellana.png', 'images/waters/orellana.png', 'water', 'orellana', 'image', 'image/png', '{"alt":"Embalse de Orellana"}'::jsonb),
  ('team-assets', 'images/waters/proserpina.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/waters/proserpina.png', 'images/waters/proserpina.png', 'water', 'proserpina', 'image', 'image/png', '{"alt":"Embalse de Proserpina"}'::jsonb),
  ('team-assets', 'images/waters/don-benito.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/waters/don-benito.png', 'images/waters/don-benito.png', 'water', 'don-benito', 'image', 'image/png', '{"alt":"Charca Don Benito"}'::jsonb),
  ('team-assets', 'images/waters/valverde.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/waters/valverde.jpeg', 'images/waters/valverde.jpeg', 'water', 'valverde', 'image', 'image/jpeg', '{"alt":"Charca Valverde"}'::jsonb),
  ('team-assets', 'images/waters/don-tello.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/waters/don-tello.jpeg', 'images/waters/don-tello.jpeg', 'water', 'don-tello', 'image', 'image/jpeg', '{"alt":"Don Tello"}'::jsonb),
  ('team-assets', 'images/waters/sierra-brava.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/waters/sierra-brava.png', 'images/waters/sierra-brava.png', 'water', 'sierra-brava', 'image', 'image/png', '{"alt":"Embalse de Sierra Brava"}'::jsonb),
  ('team-assets', 'images/logo.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/logo.png', 'images/logo.png', 'water', 'las-tijeras', 'image', 'image/png', '{"alt":"Las Tijeras"}'::jsonb),
  ('team-assets', 'images/catches/c-juanma-proserpina-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-juanma-proserpina-1.jpeg', 'images/catches/c-juanma-proserpina-1.jpeg', 'capture', 'c2', 'image', 'image/jpeg', '{"alt":"c2"}'::jsonb),
  ('team-assets', 'images/catches/c-juanma-charca-don-benito-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-juanma-charca-don-benito-1.jpeg', 'images/catches/c-juanma-charca-don-benito-1.jpeg', 'capture', 'c3', 'image', 'image/jpeg', '{"alt":"c3"}'::jsonb),
  ('team-assets', 'images/catches/c-juanma-lasTijeras-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-juanma-lasTijeras-1.jpeg', 'images/catches/c-juanma-lasTijeras-1.jpeg', 'capture', 'c4', 'image', 'image/jpeg', '{"alt":"c4"}'::jsonb),
  ('team-assets', 'images/catches/c-juanma-sierra-brava-1.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-juanma-sierra-brava-1.png', 'images/catches/c-juanma-sierra-brava-1.png', 'capture', 'c5', 'image', 'image/png', '{"alt":"c5"}'::jsonb),
  ('team-assets', 'images/catches/c-juanma-sierra-brava-2.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-juanma-sierra-brava-2.png', 'images/catches/c-juanma-sierra-brava-2.png', 'capture', 'c28', 'image', 'image/png', '{"alt":"c28"}'::jsonb),
  ('team-assets', 'images/catches/c-dani-don-benito-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-dani-don-benito-1.jpeg', 'images/catches/c-dani-don-benito-1.jpeg', 'capture', 'c6', 'image', 'image/jpeg', '{"alt":"c6"}'::jsonb),
  ('team-assets', 'images/catches/c-dani-charca-don-benito-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-dani-charca-don-benito-1.jpeg', 'images/catches/c-dani-charca-don-benito-1.jpeg', 'capture', 'c17', 'image', 'image/jpeg', '{"alt":"c17"}'::jsonb),
  ('team-assets', 'images/catches/c-dani-charca-don-benito-2.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-dani-charca-don-benito-2.jpeg', 'images/catches/c-dani-charca-don-benito-2.jpeg', 'capture', 'c18', 'image', 'image/jpeg', '{"alt":"c18"}'::jsonb),
  ('team-assets', 'images/catches/c-dani-charca-don-benito-3.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-dani-charca-don-benito-3.jpeg', 'images/catches/c-dani-charca-don-benito-3.jpeg', 'capture', 'c19', 'image', 'image/jpeg', '{"alt":"c19"}'::jsonb),
  ('team-assets', 'images/catches/c-dani-don-benito-2.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-dani-don-benito-2.jpeg', 'images/catches/c-dani-don-benito-2.jpeg', 'capture', 'c22', 'image', 'image/jpeg', '{"alt":"c22"}'::jsonb),
  ('team-assets', 'images/catches/c-dani-valverde-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-dani-valverde-1.jpeg', 'images/catches/c-dani-valverde-1.jpeg', 'capture', 'c7', 'image', 'image/jpeg', '{"alt":"c7"}'::jsonb),
  ('team-assets', 'images/catches/c-dani-valverde-2.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-dani-valverde-2.jpeg', 'images/catches/c-dani-valverde-2.jpeg', 'capture', 'c20', 'image', 'image/jpeg', '{"alt":"c20"}'::jsonb),
  ('team-assets', 'images/catches/c-dani-valverde-3.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-dani-valverde-3.jpeg', 'images/catches/c-dani-valverde-3.jpeg', 'capture', 'c21', 'image', 'image/jpeg', '{"alt":"c21"}'::jsonb),
  ('team-assets', 'images/catches/pg-dani-don-tello-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/pg-dani-don-tello-1.jpeg', 'images/catches/pg-dani-don-tello-1.jpeg', 'capture', 'c30', 'image', 'image/jpeg', '{"alt":"c30"}'::jsonb),
  ('team-assets', 'images/catches/c-dani-don-tello-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-dani-don-tello-1.jpeg', 'images/catches/c-dani-don-tello-1.jpeg', 'capture', 'c29', 'image', 'image/jpeg', '{"alt":"c29"}'::jsonb),
  ('team-assets', 'images/catches/c-alvaro-don-tello-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-alvaro-don-tello-1.jpeg', 'images/catches/c-alvaro-don-tello-1.jpeg', 'capture', 'c10', 'image', 'image/jpeg', '{"alt":"c10"}'::jsonb),
  ('team-assets', 'images/catches/c-alvaro-valverde-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-alvaro-valverde-1.jpeg', 'images/catches/c-alvaro-valverde-1.jpeg', 'capture', 'c32', 'image', 'image/jpeg', '{"alt":"c32"}'::jsonb),
  ('team-assets', 'images/catches/c-alvaro-charca-don-benito-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-alvaro-charca-don-benito-1.jpeg', 'images/catches/c-alvaro-charca-don-benito-1.jpeg', 'capture', 'c31', 'image', 'image/jpeg', '{"alt":"c31"}'::jsonb),
  ('team-assets', 'images/catches/c-alvaro-charca-don-benito-2.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-alvaro-charca-don-benito-2.jpeg', 'images/catches/c-alvaro-charca-don-benito-2.jpeg', 'capture', 'c33', 'image', 'image/jpeg', '{"alt":"c33"}'::jsonb),
  ('team-assets', 'images/catches/c-alvaro-charca-don-benito-3.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-alvaro-charca-don-benito-3.png', 'images/catches/c-alvaro-charca-don-benito-3.png', 'capture', 'c34', 'image', 'image/png', '{"alt":"c34"}'::jsonb),
  ('team-assets', 'images/catches/c-vima-charca-don-benito-1.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-vima-charca-don-benito-1.png', 'images/catches/c-vima-charca-don-benito-1.png', 'capture', 'c15', 'image', 'image/png', '{"alt":"c15"}'::jsonb),
  ('team-assets', 'images/catches/c-vima-charca-don-benito-2.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-vima-charca-don-benito-2.png', 'images/catches/c-vima-charca-don-benito-2.png', 'capture', 'c13', 'image', 'image/png', '{"alt":"c13"}'::jsonb),
  ('team-assets', 'images/catches/c-vima-don-tello-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-vima-don-tello-1.jpeg', 'images/catches/c-vima-don-tello-1.jpeg', 'capture', 'c16', 'image', 'image/jpeg', '{"alt":"c16"}'::jsonb),
  ('team-assets', 'images/catches/pg-vima-don-tello-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/pg-vima-don-tello-1.jpeg', 'images/catches/pg-vima-don-tello-1.jpeg', 'capture', 'c23', 'image', 'image/jpeg', '{"alt":"c23"}'::jsonb),
  ('team-assets', 'images/catches/c-vima-charca-don-benito-3.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-vima-charca-don-benito-3.png', 'images/catches/c-vima-charca-don-benito-3.png', 'capture', 'c26', 'image', 'image/png', '{"alt":"c26"}'::jsonb),
  ('team-assets', 'images/catches/c-vima-gijo-1.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-vima-gijo-1.jpeg', 'images/catches/c-vima-gijo-1.jpeg', 'capture', 'c24', 'image', 'image/jpeg', '{"alt":"c24"}'::jsonb),
  ('team-assets', 'images/catches/c-vima-gijo-2.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/catches/c-vima-gijo-2.jpeg', 'images/catches/c-vima-gijo-2.jpeg', 'capture', 'c25', 'image', 'image/jpeg', '{"alt":"c25"}'::jsonb),
  ('team-assets', 'images/members/juanma.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/members/juanma.jpeg', 'images/members/juanma.jpeg', 'member', 'juanma', 'image', 'image/jpeg', '{"alt":"Juanma"}'::jsonb),
  ('team-assets', 'images/members/dani.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/members/dani.jpeg', 'images/members/dani.jpeg', 'member', 'dani', 'image', 'image/jpeg', '{"alt":"Dani"}'::jsonb),
  ('team-assets', 'images/members/alvaro.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/members/alvaro.jpeg', 'images/members/alvaro.jpeg', 'member', 'alvaro', 'image', 'image/jpeg', '{"alt":"Alvaro"}'::jsonb),
  ('team-assets', 'images/members/vima.jpeg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/members/vima.jpeg', 'images/members/vima.jpeg', 'member', 'vima', 'image', 'image/jpeg', '{"alt":"Vima"}'::jsonb),
  ('team-assets', 'images/baits/scopex-squid.svg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/baits/scopex-squid.svg', 'images/baits/scopex-squid.svg', 'bait', 'scopex-squid', 'image', 'image/svg+xml', '{"alt":"Scopex & Squid"}'::jsonb),
  ('team-assets', 'images/baits/krill-red.svg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/baits/krill-red.svg', 'images/baits/krill-red.svg', 'bait', 'krill-red', 'image', 'image/svg+xml', '{"alt":"Krill Red"}'::jsonb),
  ('team-assets', 'images/baits/tigernut-cream.svg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/baits/tigernut-cream.svg', 'images/baits/tigernut-cream.svg', 'bait', 'tigernut-cream', 'image', 'image/svg+xml', '{"alt":"Tiger Nut Cream"}'::jsonb),
  ('team-assets', 'images/baits/pineapple-pop.svg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/baits/pineapple-pop.svg', 'images/baits/pineapple-pop.svg', 'bait', 'pineapple-pop', 'image', 'image/svg+xml', '{"alt":"Pineapple Pop-Up"}'::jsonb),
  ('team-assets', 'images/baits/monster-crab.svg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/baits/monster-crab.svg', 'images/baits/monster-crab.svg', 'bait', 'monster-crab', 'image', 'image/svg+xml', '{"alt":"Monster Crab"}'::jsonb),
  ('team-assets', 'images/baits/sweet-corn-cloud.svg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/baits/sweet-corn-cloud.svg', 'images/baits/sweet-corn-cloud.svg', 'bait', 'sweet-corn-cloud', 'image', 'image/svg+xml', '{"alt":"Sweet Corn Cloud"}'::jsonb),
  ('team-assets', 'images/baits/pink-fruity.svg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/baits/pink-fruity.svg', 'images/baits/pink-fruity.svg', 'bait', 'pink-fruity', 'image', 'image/svg+xml', '{"alt":"Pink Fruity"}'::jsonb),
  ('team-assets', 'images/baits/tiger-xtreme.svg', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/baits/tiger-xtreme.svg', 'images/baits/tiger-xtreme.svg', 'bait', 'tiger-xtreme', 'image', 'image/svg+xml', '{"alt":"Tiger Xtreme"}'::jsonb),
  ('team-assets', 'images/brands/korda.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/brands/korda.png', 'images/brands/korda.png', 'brand', 'korda', 'image', 'image/png', '{"alt":"Korda"}'::jsonb),
  ('team-assets', 'images/brands/nash.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/brands/nash.png', 'images/brands/nash.png', 'brand', 'nash', 'image', 'image/png', '{"alt":"Nash"}'::jsonb),
  ('team-assets', 'images/brands/fox.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/brands/fox.png', 'images/brands/fox.png', 'brand', 'fox', 'image', 'image/png', '{"alt":"Fox"}'::jsonb),
  ('team-assets', 'images/brands/ridgemonkey.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/brands/ridgemonkey.png', 'images/brands/ridgemonkey.png', 'brand', 'ridgemonkey', 'image', 'image/png', '{"alt":"RidgeMonkey"}'::jsonb),
  ('team-assets', 'images/brands/sonik.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/brands/sonik.png', 'images/brands/sonik.png', 'brand', 'sonik', 'image', 'image/png', '{"alt":"Sonik"}'::jsonb),
  ('team-assets', 'images/brands/shimano.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/brands/shimano.png', 'images/brands/shimano.png', 'brand', 'shimano', 'image', 'image/png', '{"alt":"Shimano"}'::jsonb),
  ('team-assets', 'images/brands/ultimate.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/brands/ultimate.png', 'images/brands/ultimate.png', 'brand', 'ultimate', 'image', 'image/png', '{"alt":"Ultimate"}'::jsonb),
  ('team-assets', 'images/brands/solar-tackle.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/brands/solar-tackle.png', 'images/brands/solar-tackle.png', 'brand', 'solar-tackle', 'image', 'image/png', '{"alt":"Solar Tackle"}'::jsonb),
  ('team-assets', 'images/brands/avidcarp.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/brands/avidcarp.png', 'images/brands/avidcarp.png', 'brand', 'avidcarp', 'image', 'image/png', '{"alt":"Avid Carp"}'::jsonb),
  ('team-assets', 'images/brands/daiwa.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/brands/daiwa.png', 'images/brands/daiwa.png', 'brand', 'daiwa', 'image', 'image/png', '{"alt":"Daiwa"}'::jsonb),
  ('team-assets', 'images/brands/prologic.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/brands/prologic.png', 'images/brands/prologic.png', 'brand', 'prologic', 'image', 'image/png', '{"alt":"Prologic"}'::jsonb),
  ('team-assets', 'images/brands/ngt.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/brands/ngt.png', 'images/brands/ngt.png', 'brand', 'ngt', 'image', 'image/png', '{"alt":"NGT"}'::jsonb),
  ('team-assets', 'images/cebos/proelitebaits.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/cebos/proelitebaits.png', 'images/cebos/proelitebaits.png', 'bait_brand', 'proelitebaits', 'image', 'image/png', '{"alt":"Proelitebaits"}'::jsonb),
  ('team-assets', 'images/cebos/mainabaits.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/cebos/mainabaits.png', 'images/cebos/mainabaits.png', 'bait_brand', 'mainabaits', 'image', 'image/png', '{"alt":"Maina Baits"}'::jsonb),
  ('team-assets', 'images/cebos/luxurybaits.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/cebos/luxurybaits.png', 'images/cebos/luxurybaits.png', 'bait_brand', 'luxurybaits', 'image', 'image/png', '{"alt":"Luxurybaits"}'::jsonb),
  ('team-assets', 'images/cebos/dsabaits.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/cebos/dsabaits.png', 'images/cebos/dsabaits.png', 'bait_brand', 'dsabaits', 'image', 'image/png', '{"alt":"Dsabaits"}'::jsonb),
  ('team-assets', 'images/cebos/kromquality.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/cebos/kromquality.png', 'images/cebos/kromquality.png', 'bait_brand', 'kromquality', 'image', 'image/png', '{"alt":"Kromquality"}'::jsonb),
  ('team-assets', 'images/cebos/superbaits.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/cebos/superbaits.png', 'images/cebos/superbaits.png', 'bait_brand', 'superbaits', 'image', 'image/png', '{"alt":"Superbaits"}'::jsonb),
  ('team-assets', 'images/cebos/peralbaits.png', '{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-assets/images/cebos/peralbaits.png', 'images/cebos/peralbaits.png', 'bait_brand', 'peralbaits', 'image', 'image/png', '{"alt":"Peralbaits"}'::jsonb)

on conflict (bucket, path) do update set public_url=excluded.public_url, source_path=excluded.source_path, entity_type=excluded.entity_type, entity_id=excluded.entity_id, kind=excluded.kind, mime_type=excluded.mime_type, metadata=excluded.metadata;

commit;