'use client';
import Link from 'next/link';
import {COLORS} from '@/lib/constants';

export default function AuthError(){
  return(
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',backgroundColor:COLORS.gray50}}>
      <div style={{backgroundColor:'white',padding:'2rem',borderRadius:'8px',width:'100%',maxWidth:'400px',boxShadow:'0 4px 6px rgba(0,0,0,0.1)',textAlign:'center'}}>
        <h1 style={{color:'#DC2626',marginBottom:'1rem'}}>❌ Erro na Autenticação</h1>
        <p style={{color:COLORS.gray600,marginBottom:'1.5rem'}}>Houve um problema ao fazer login. Tente novamente.</p>
        <Link href="/auth/signin" style={{display:'inline-block',backgroundColor:COLORS.primary,color:'white',padding:'0.75rem 1.5rem',borderRadius:'4px',textDecoration:'none',fontWeight:'bold'}}>Voltar ao Login</Link>
      </div>
    </div>
  );
}