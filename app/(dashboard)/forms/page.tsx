'use client';
import Link from 'next/link';
import { COLORS } from '@/lib/constants';

export default function FormsPage() {
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem'}}>
        <h1 style={{color:COLORS.secondary,fontSize:'2rem',fontWeight:'bold'}}>Meus Formulários</h1>
        <Link href="/forms/create" style={{backgroundColor:COLORS.primary,color:'white',padding:'0.75rem 1.5rem',borderRadius:'6px',textDecoration:'none',fontWeight:'bold'}}>
          ✨ Novo Formulário
        </Link>
      </div>
      
      <div style={{backgroundColor:'white',borderRadius:'8px',padding:'2rem',border:`1px solid ${COLORS.gray200}`,textAlign:'center'}}>
        <p style={{color:COLORS.gray500,fontSize:'1.125rem'}}>Nenhum formulário criado ainda</p>
        <p style={{color:COLORS.gray400}}>Clique no botão acima para criar seu primeiro formulário</p>
      </div>
    </div>
  );
}