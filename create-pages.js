const fs = require('fs');
const path = require('path');

// 1. Criar diretórios
const dirs = [
  'app/(auth)/login',
  'app/(auth)/register',
  'app/(dashboard)',
  'app/(dashboard)/dashboard',
  'app/(dashboard)/forms',
  'app/(dashboard)/settings',
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 2. Criar page.tsx para login
fs.writeFileSync('app/(auth)/login/page.tsx', `'use client';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <p className="text-gray-600 text-center">Login não está implementado ainda.</p>
        <a href="/dashboard" className="mt-4 block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Ir para Dashboard
        </a>
      </div>
    </div>
  );
}
`);

// 3. Criar page.tsx para register
fs.writeFileSync('app/(auth)/register/page.tsx', `'use client';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Cadastro</h1>
        <p className="text-gray-600 text-center">Cadastro não está implementado ainda.</p>
        <a href="/login" className="mt-4 block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Voltar ao Login
        </a>
      </div>
    </div>
  );
}
`);

// 4. Criar layout.tsx para dashboard
fs.writeFileSync('app/(dashboard)/layout.tsx', `export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">FormFlow</h1>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
`);

// 5. Criar page.tsx para dashboard
fs.writeFileSync('app/(dashboard)/dashboard/page.tsx', `'use client';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Meus Formulários</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-gray-600 text-sm">Formulários criados</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Submissões</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-gray-600 text-sm">Total de respostas</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Meus Times</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="text-gray-600 text-sm">Times disponíveis</p>
        </div>
      </div>

      <a href="/forms" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Criar Novo Formulário
      </a>
    </div>
  );
}
`);

// 6. Criar page.tsx para forms
fs.writeFileSync('app/(dashboard)/forms/page.tsx', `'use client';

export default function FormsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Meus Formulários</h2>
        <a href="/forms/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Novo Formulário
        </a>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600 mb-4">Você ainda não criou nenhum formulário</p>
        <a href="/forms/new" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Criar Primeiro Formulário
        </a>
      </div>
    </div>
  );
}
`);

// 7. Criar page.tsx para settings
fs.writeFileSync('app/(dashboard)/settings/page.tsx', `'use client';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Configurações</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Perfil</h3>
        <p className="text-gray-600">As configurações de perfil serão implementadas em breve.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Preferências</h3>
        <p className="text-gray-600">As preferências serão implementadas em breve.</p>
      </div>
    </div>
  );
}
`);
