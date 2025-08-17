/* eslint-disable @typescript-eslint/no-var-requires */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // Certifique-se de que o bcryptjs está instalado

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando processo de seed...');

  // --- Seeding do Administrador ---
  const adminEmail = process.env.ADMIN_EMAIL || "admin@abrasel.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "abrasel123";

  const hashedPasswordAdmin = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPasswordAdmin, role: "ADMIN" },
    create: { name: "Administrador", email: adminEmail, password: hashedPasswordAdmin, role: "ADMIN" },
  });

  console.log(`✔ Admin pronto: ${adminEmail}`);

  // --- Seeding de Usuários de Exemplo --- // LINHA CORRIGIDA
  console.log('👥 Inserindo usuários de exemplo...');

  const exampleUsers = [
    {
      name: 'Ana Clara',
      email: 'ana.clara@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'SP',
      city: 'São Paulo',
      createdAt: new Date('2025-08-14T18:50:43.994Z'),
    },
    {
      name: 'Bruno Silva',
      email: 'bruno.silva@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'RJ',
      city: 'Rio de Janeiro',
      createdAt: new Date('2025-08-13T18:50:43.994Z'),
    },
    {
      name: 'Carlos Eduardo',
      email: 'carlos.eduardo@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'MG',
      city: 'Belo Horizonte',
      createdAt: new Date('2025-08-12T18:50:43.994Z'),
    },
    {
      name: 'Daniela Souza',
      email: 'daniela.souza@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'RS',
      city: 'Porto Alegre',
      createdAt: new Date('2025-08-11T18:50:43.994Z'),
    },
    {
      name: 'Eduardo Lima',
      email: 'eduardo.lima@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'PR',
      city: 'Curitiba',
      createdAt: new Date('2025-08-10T18:50:43.994Z'),
    },
    {
      name: 'Fernanda Alves',
      email: 'fernanda.alves@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'SC',
      city: 'Florianópolis',
      createdAt: new Date('2025-08-09T18:50:43.994Z'),
    },
    {
      name: 'Gabriel Rocha',
      email: 'gabriel.rocha@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'BA',
      city: 'Salvador',
      createdAt: new Date('2025-08-08T18:50:43.994Z'),
    },
    {
      name: 'Helena Martins',
      email: 'helena.martins@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'PE',
      city: 'Recife',
      createdAt: new Date('2025-08-07T18:50:43.994Z'),
    },
    {
      name: 'Igor Fernandes',
      email: 'igor.fernandes@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'CE',
      city: 'Fortaleza',
      createdAt: new Date('2025-08-06T18:50:43.994Z'),
    },
    {
      name: 'Juliana Santos',
      email: 'juliana.santos@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'GO',
      city: 'Goiânia',
      createdAt: new Date('2025-08-05T18:50:43.994Z'),
    },
    {
      name: 'Kaique Moreira',
      email: 'kaique.moreira@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'SP',
      city: 'São Paulo',
      createdAt: new Date('2025-08-04T18:50:43.994Z'),
    },
    {
      name: 'Larissa Ribeiro',
      email: 'larissa.ribeiro@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'RJ',
      city: 'Rio de Janeiro',
      createdAt: new Date('2025-08-03T18:50:43.994Z'),
    },
    {
      name: 'Marcos Vinicius',
      email: 'marcos.vinicius@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'MG',
      city: 'Belo Horizonte',
      createdAt: new Date('2025-08-02T18:50:43.994Z'),
    },
    {
      name: 'Natália Carvalho',
      email: 'natalia.carvalho@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'RS',
      city: 'Porto Alegre',
      createdAt: new Date('2025-08-01T18:50:43.994Z'),
    },
    {
      name: 'Otávio Nunes',
      email: 'otavio.nunes@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'PR',
      city: 'Curitiba',
      createdAt: new Date('2025-07-31T18:50:43.994Z'),
    },
    {
      name: 'Priscila Moraes',
      email: 'priscila.moraes@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'SC',
      city: 'Florianópolis',
      createdAt: new Date('2025-07-30T18:50:43.994Z'),
    },
    {
      name: 'Ricardo Barros',
      email: 'ricardo.barros@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'BA',
      city: 'Salvador',
      createdAt: new Date('2025-07-29T18:50:43.994Z'),
    },
    {
      name: 'Sabrina Costa',
      email: 'sabrina.costa@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'PE',
      city: 'Recife',
      createdAt: new Date('2025-07-28T18:50:43.994Z'),
    },
    {
      name: 'Thiago Teixeira',
      email: 'thiago.teixeira@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'CE',
      city: 'Fortaleza',
      createdAt: new Date('2025-07-27T18:50:43.994Z'),
    },
    {
      name: 'Vitória Mendes',
      email: 'vitoria.mendes@example.com',
      password: await bcrypt.hash('senha123', 10),
      role: 'USER',
      state: 'GO',
      city: 'Goiânia',
      createdAt: new Date('2025-07-26T18:50:43.994Z'),
    },
  ];

  // Para evitar o erro "Unknown argument skipDuplicates" e garantir a unicidade,
  // podemos iterar e usar `upsert` para cada usuário de exemplo.
  // Isso garante que se o seed for executado várias vezes, ele não duplicará
  // usuários baseados no email, mas os atualizará se já existirem.
  for (const user of exampleUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: user.password,
        role: user.role,
        state: user.state,
        city: user.city,
        // Você pode decidir se quer atualizar `createdAt` ou mantê-lo
        // createdAt: user.createdAt,
      },
      create: user,
    });
  }

  console.log(`✅ ${exampleUsers.length} usuários de exemplo inseridos/atualizados.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o processo de seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🏁 Processo de seed finalizado.');
  });