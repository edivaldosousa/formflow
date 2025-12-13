'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/lib/constants';

export default function CreateTeamPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    // TODO: Implementar criação de time via API
    console.log('Criando time:', name);
    setTimeout(() => {
      router.push('/teams');
    }, 1000);
  };

  return (
    <div>
      <h1 style={{color:COLORS.secondary,fontSize:'2rem',fontWeight:'bold',marginBottom:'2rem'}}>
        Criar Novo Time
      </h1>
      
      <form onSubmit={handleCreate} style={{maxWidth:'600px',backgroundColor:'white',padding:'2rem',borderRadius:'8px',border:`1px solid ${COLORS.gray200}`}}>
        <div style={{marginBottom:'1.5rem'}}>
          <label style={{display:'block',marginBottom:'0.5rem',fontWeight:'bold',color:COLORS.gray700}}>
            Nome do Time
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Marketing"
            required
            style={{width:'100%',padding:'0.75rem',border:`1px solid ${COLORS.gray300}`,borderRadius:'4px',fontSize:'1rem',boxSizing:'border-box'}}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !name.trim()}
          style={{width:'100%',padding:'0.75rem',backgroundColor:loading?COLORS.gray400:COLORS.primary,color:'white',border:'none',borderRadius:'4px',fontWeight:'bold',cursor:loading?'not-allowed':'pointer'}}
        >
          {loading ? 'Criando...' : 'Criar Time'}
        </button>
      </form>
    </div>
  );
}