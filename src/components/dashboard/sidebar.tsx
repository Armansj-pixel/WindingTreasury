import Link from 'next/link'

const menus = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/users', label: 'Anggota' },
]

export default function Sidebar() {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-6">
        <h1 className="text-lg font-bold">Winding Treasury</h1>
        <p className="text-sm text-zinc-500">Admin Panel</p>
      </div>

      <nav className="space-y-2">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            {menu.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
