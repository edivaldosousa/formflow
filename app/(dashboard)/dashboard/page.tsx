'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { COLORS } from '@/lib/constants';
import { useEffect, useState } from 'react';

const StatCard = ({ title, value, icon }: any) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    border: `1px solid ${COLORS.gray200}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: COLORS.secondary }}>
      {value}
    </div>
    <div style={{ fontSize: '0.875rem', color: COLORS.gray500 }}>
      {title}
    </div>
  </div>
);

export default function DashboardPage() {
  const { data: session } = useSession();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return <div>Carregando...</div>;

  return (
    <div>
      <h1 style={{ color: COLORS.secondary, marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>
        Bem-vindo ao FormFlow
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard title="Meus Formulários" value="0" icon="📋" />
        <StatCard title="Submissões" value="0" icon="📬" />
        <StatCard title="Meus Times" value="0" icon="👥" />
      </div>

      <Link href="/forms/create" style={{
        display: 'inline-block',
        backgroundColor: COLORS.primary,
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '1rem'
      }}>
        ✨ Criar Novo Formulário
      </Link>
    </div>
  );
}
