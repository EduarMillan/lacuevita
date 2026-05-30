import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface CategorySeed {
  name: string;
  slug: string;
  icon?: string;
  children?: Omit<CategorySeed, "children">[];
}

const categories: CategorySeed[] = [
  {
    name: "Compra y Venta",
    slug: "compra-venta",
    icon: "shopping_bag",
    children: [
      { name: "Celulares y Accesorios", slug: "celulares-accesorios", icon: "smartphone" },
      { name: "Computadoras", slug: "computadoras", icon: "computer" },
      { name: "Tabletas", slug: "tabletas", icon: "tablet" },
      { name: "Electrodomésticos", slug: "electrodomesticos", icon: "kitchen" },
      { name: "TV y Video", slug: "tv-video", icon: "tv" },
      { name: "Audio y Sonido", slug: "audio-sonido", icon: "headphones" },
      { name: "Consolas y Videojuegos", slug: "consolas-videojuegos", icon: "sports_esports" },
      { name: "Cámaras y Fotografía", slug: "camaras-fotografia", icon: "photo_camera" },
      { name: "Muebles y Decoración", slug: "muebles-decoracion", icon: "chair" },
      { name: "Ropa y Calzado", slug: "ropa-calzado", icon: "checkroom" },
      { name: "Relojes y Joyería", slug: "relojes-joyeria", icon: "watch" },
      { name: "Deportes y Fitness", slug: "deportes-fitness", icon: "fitness_center" },
      { name: "Instrumentos Musicales", slug: "instrumentos-musicales", icon: "piano" },
      { name: "Libros y Revistas", slug: "libros-revistas", icon: "menu_book" },
      { name: "Bebés y Niños", slug: "bebes-ninos", icon: "child_care" },
      { name: "Mascotas y Animales", slug: "mascotas-animales", icon: "pets" },
      { name: "Herramientas", slug: "herramientas", icon: "construction" },
      { name: "Materiales de Construcción", slug: "materiales-construccion", icon: "hardware" },
      { name: "Arte y Antigüedades", slug: "arte-antiguedades", icon: "palette" },
      { name: "Salud y Belleza", slug: "salud-belleza", icon: "spa" },
      { name: "Otros", slug: "compra-venta-otros", icon: "category" },
    ],
  },
  {
    name: "Vehículos",
    slug: "vehiculos",
    icon: "directions_car",
    children: [
      { name: "Autos", slug: "autos", icon: "directions_car" },
      { name: "Motos", slug: "motos", icon: "two_wheeler" },
      { name: "Camiones y Buses", slug: "camiones-buses", icon: "local_shipping" },
      { name: "Piezas y Accesorios", slug: "piezas-accesorios-vehiculos", icon: "build" },
      { name: "Bicicletas", slug: "bicicletas", icon: "pedal_bike" },
      { name: "Embarcaciones", slug: "embarcaciones", icon: "sailing" },
      { name: "Otros Vehículos", slug: "otros-vehiculos", icon: "commute" },
    ],
  },
  {
    name: "Vivienda",
    slug: "vivienda",
    icon: "home",
    children: [
      { name: "Venta de Casas", slug: "venta-casas", icon: "house" },
      { name: "Venta de Apartamentos", slug: "venta-apartamentos", icon: "apartment" },
      { name: "Alquiler de Casas", slug: "alquiler-casas", icon: "home_work" },
      { name: "Alquiler de Apartamentos", slug: "alquiler-apartamentos", icon: "domain" },
      { name: "Habitaciones", slug: "habitaciones", icon: "bed" },
      { name: "Permutas", slug: "permutas", icon: "swap_horiz" },
      { name: "Terrenos y Fincas", slug: "terrenos-fincas", icon: "landscape" },
      { name: "Locales Comerciales", slug: "locales-comerciales", icon: "storefront" },
      { name: "Oficinas", slug: "oficinas", icon: "business" },
      { name: "Garajes y Parqueos", slug: "garajes-parqueos", icon: "garage" },
    ],
  },
  {
    name: "Empleos",
    slug: "empleos",
    icon: "work",
    children: [
      { name: "Ofertas de Empleo", slug: "ofertas-empleo", icon: "work_outline" },
      { name: "Busco Empleo", slug: "busco-empleo", icon: "person_search" },
      { name: "Trabajo Remoto", slug: "trabajo-remoto", icon: "laptop" },
      { name: "Prácticas y Pasantías", slug: "practicas-pasantias", icon: "school" },
      { name: "Trabajo Freelance", slug: "trabajo-freelance", icon: "edit" },
    ],
  },
  {
    name: "Servicios",
    slug: "servicios",
    icon: "handyman",
    children: [
      { name: "Reparación y Mantenimiento", slug: "reparacion-mantenimiento", icon: "build" },
      { name: "Clases y Cursos", slug: "clases-cursos", icon: "school" },
      { name: "Diseño y Tecnología", slug: "diseno-tecnologia", icon: "design_services" },
      { name: "Transporte y Mudanzas", slug: "transporte-mudanzas", icon: "local_shipping" },
      { name: "Salud y Bienestar", slug: "salud-bienestar", icon: "health_and_safety" },
      { name: "Eventos y Entretenimiento", slug: "eventos-entretenimiento", icon: "celebration" },
      { name: "Servicios Legales", slug: "servicios-legales", icon: "gavel" },
      { name: "Contabilidad y Finanzas", slug: "contabilidad-finanzas", icon: "account_balance" },
      { name: "Servicios del Hogar", slug: "servicios-hogar", icon: "cleaning_services" },
      { name: "Fotografía y Video", slug: "fotografia-video", icon: "videocam" },
      { name: "Otros Servicios", slug: "otros-servicios", icon: "more_horiz" },
    ],
  },
  {
    name: "Electrónica",
    slug: "electronica",
    icon: "devices",
    children: [
      { name: "Componentes y Piezas", slug: "componentes-piezas", icon: "memory" },
      { name: "Redes y Conectividad", slug: "redes-conectividad", icon: "router" },
      { name: "Impresoras y Escáners", slug: "impresoras-escaners", icon: "print" },
      { name: "Almacenamiento", slug: "almacenamiento", icon: "storage" },
      { name: "Software y Licencias", slug: "software-licencias", icon: "code" },
      { name: "Accesorios de Electrónica", slug: "accesorios-electronica", icon: "cable" },
    ],
  },
  {
    name: "Comunidad",
    slug: "comunidad",
    icon: "groups",
    children: [
      { name: "Actividades y Eventos", slug: "actividades-eventos", icon: "event" },
      { name: "Voluntariado", slug: "voluntariado", icon: "volunteer_activism" },
      { name: "Perdidos y Encontrados", slug: "perdidos-encontrados", icon: "search" },
      { name: "Donaciones", slug: "donaciones", icon: "redeem" },
      { name: "Trueques", slug: "trueques", icon: "swap_horiz" },
    ],
  },
];

async function main() {
  console.log("Seeding categories...");

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, order: i },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        order: i,
      },
    });

    if (cat.children) {
      for (let j = 0; j < cat.children.length; j++) {
        const child = cat.children[j];
        await prisma.category.upsert({
          where: { slug: child.slug },
          update: { name: child.name, icon: child.icon, order: j, parentId: parent.id },
          create: {
            name: child.name,
            slug: child.slug,
            icon: child.icon,
            order: j,
            parentId: parent.id,
          },
        });
      }
    }
  }

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
