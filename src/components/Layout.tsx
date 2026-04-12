import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import EnvironmentBanner from './EnvironmentBanner'

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <EnvironmentBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
