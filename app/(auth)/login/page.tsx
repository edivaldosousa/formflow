'use client';

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
