'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { COLORS } from '@/lib/constants';

export default function DashboardNav() {
  const { data: session } = useSession();
  return (
    <nav style={{width:'250px',backgroundColor:COLORS.secondary,color:'white',padding:'1.5rem',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <h1 style={{fontSize:'1.5rem',marginBottom:'2rem',fontWeight:'bold'}}>FormFlow</h1>
      <ul style={{listStyle:'none',padding:0,flex:1}}>
        <li style={{marginBottom:'1rem'}}><Link href="/dashboard" style={{color:'white',textDecoration:'none'}}>📊 Dashboard</Link></li>
        <li style={{marginBottom:'1rem'}}><Link href="/forms" style={{color:'white',textDecoration:'none'}}>📋 Formulários</Link></li>
        <li style={{marginBottom:'1rem'}}><Link href="/teams" style={{color:'white',textDecoration:'none'}}>👥 Times</Link></li>
      </ul>
      {session?.user && (<div style={{borderTop:'1px solid rgba(255,255,255,0.2)',paddingTop:'1rem'}}><p style={{fontSize:'0.875rem',marginBottom:'0.5rem'}}>{session.user.email}</p><button onClick={()=>signOut({redirect:true,callbackUrl:'/auth/signin'})} style={{width:'100%',padding:'0.5rem',backgroundColor:COLORS.primary,color:'white',border:'none',borderRadius:'4px',cursor:'pointer',fontSize:'0.875rem'}}>Sair</button></div>)}
    </nav>
  );
}