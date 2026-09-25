import { useState } from 'react'
import { BlurOverlay } from '@/layout/BlurOverlay/BlurOverlay'
import { Header } from '@/layout/Header/Header'
import { Sidebar } from '@/layout/Sidebar/Sidebar'
import { Home } from '@/features/home/Home'
import { Wallet } from '@/features/dashboard/Wallet'
import { Management } from '@/features/management/Management'
import styles from './App.module.css'

export default function App() {
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [activeId, setActiveId] = useState('home')

  return (
    <>
      <Header />
      <BlurOverlay isVisible={sidebarHovered}/>
      <div className={styles.app}>
      <Sidebar 
        activeId={activeId}
        onSelect={setActiveId}
        onHoverChange={setSidebarHovered}
      />
      <main className={styles.content}>
      {activeId==='home' && <Home />}
      {activeId==='wallet' && <Wallet />}
      {activeId==='management' && <Management />}
      </main>
      </div>
    </>
  )
}