import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do B.aesthetics...')

  // ── Admin Master ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin12345', 12)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@b-aesthetics.app' },
    update: {},
    create: {
      email: 'admin@b-aesthetics.app',
      password: adminPassword,
      name: 'Administrador B.aesthetics',
    },
  })
  console.log('✅ Admin criado:', admin.email)

  // ── Loja de exemplo ────────────────────────────────────────────────────────
  const storePassword = await bcrypt.hash('senha12345', 12)
  const store = await prisma.store.upsert({
    where: { email: 'ana@lashstudio.com' },
    update: {},
    create: {
      email: 'ana@lashstudio.com',
      password: storePassword,
      name: 'Lash Studio Ana',
      ownerName: 'Ana Silva',
      slug: 'lash-studio-ana',
      phone: '11999999999',
      address: 'Rua das Flores, 123 — Pinheiros, São Paulo/SP',
      businessHours: 'Seg–Sex: 9h às 19h · Sáb: 9h às 16h',
      description: 'Especialista em volume russo e design de olhar',
      isActive: true,
    },
  })
  console.log('✅ Loja criada:', store.name)

  // ── Serviços ───────────────────────────────────────────────────────────────
  const servicesData = [
    { name: 'Lash Clássico', description: 'Fio a fio para um olhar natural e elegante', duration: 120, price: 120, order: 0 },
    { name: 'Volume Russo', description: 'Máximo volume com fios super-leves', duration: 180, price: 220, order: 1 },
    { name: 'Manutenção', description: 'Reposição e ajuste dos fios existentes', duration: 60, price: 80, order: 2 },
    { name: 'Design de Sobrancelha', description: 'Henna + design personalizado', duration: 45, price: 65, order: 3 },
  ]

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { id: `seed-${store.id}-${s.order}` },
      update: {},
      create: { id: `seed-${store.id}-${s.order}`, storeId: store.id, ...s, isActive: true },
    })
  }
  console.log(`✅ ${servicesData.length} serviços criados`)

  // ── Agendamentos de exemplo ──────────────────────────────────────────────
  const services = await prisma.service.findMany({ where: { storeId: store.id } })
  const now = new Date()
  const appointmentsData = [
    { clientName: 'Mariana Costa', clientPhone: '11988887777', serviceId: services[1].id, price: 220, status: 'COMPLETED' as const, daysAgo: 2 },
    { clientName: 'Juliana Reis', clientPhone: '11977776666', serviceId: services[0].id, price: 120, status: 'COMPLETED' as const, daysAgo: 5 },
    { clientName: 'Carla Mendes', clientPhone: '11966665555', serviceId: services[2].id, price: 80, status: 'PENDING' as const, daysAgo: -1 },
    { clientName: 'Patrícia Lima', clientPhone: '11955554444', serviceId: services[3].id, price: 65, status: 'CANCELLED' as const, daysAgo: 1 },
  ]

  for (const a of appointmentsData) {
    const date = new Date(now)
    date.setDate(date.getDate() - a.daysAgo)
    await prisma.appointment.create({
      data: {
        storeId: store.id, serviceId: a.serviceId, clientName: a.clientName,
        clientPhone: a.clientPhone, price: a.price, scheduledAt: date, status: a.status,
      },
    })
  }
  console.log(`✅ ${appointmentsData.length} agendamentos criados`)

  // ── Despesas de exemplo ───────────────────────────────────────────────────
  await prisma.expense.createMany({
    data: [
      { storeId: store.id, description: 'Compra de cílios fio a fio', amount: 180, date: new Date(), category: 'Insumos' },
      { storeId: store.id, description: 'Aluguel do espaço', amount: 600, date: new Date(), category: 'Aluguel' },
    ],
  })
  console.log('✅ Despesas criadas')

  console.log('\n🎉 Seed concluído!')
  console.log('   Admin: admin@b-aesthetics.app / admin12345')
  console.log('   Loja:  ana@lashstudio.com / senha12345')
  console.log('   Catálogo: /lash-studio-ana')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
