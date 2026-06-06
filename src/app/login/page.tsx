import LoginForm from './login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Winding Treasury</h1>
        <p className="mt-1 text-sm text-zinc-600">Masuk dengan email dan password</p>
        <LoginForm />
      </div>
    </main>
  )
}
