import { useState } from 'react'
import { BlurOverlay } from '@/layout/BlurOverlay/BlurOverlay'
import { Header } from '@/layout/Header/Header'
import { Sidebar } from '@/layout/Sidebar/Sidebar'
import { Wallet } from '@/pages/Wallet/Wallet'
import { Management } from '@/pages/Management/Management'
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
      {activeId==='home' && <h1>Home</h1>}
      {activeId==='wallet' && <Wallet />}
      {activeId==='management' && <Management />}
      </main>
      </div>
    </>
  )
}