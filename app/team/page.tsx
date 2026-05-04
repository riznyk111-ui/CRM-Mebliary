"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { TeamTable, TeamMember } from "@/components/team-table"

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Олександр Коваленко",
    role: "manager",
    phone: "+380 67 123 45 67",
    email: "o.kovalenko@mebliary.ua",
    salary: 35000,
    salaryType: "fixed",
    status: "active",
    hireDate: "2023-03-15",
    projectsCompleted: 48,
    totalEarnings: 420000,
  },
  {
    id: "2",
    name: "Іван Петренко",
    role: "installer",
    phone: "+380 50 234 56 78",
    email: "i.petrenko@mebliary.ua",
    salary: 0,
    salaryType: "percentage",
    percentageRate: 70,
    status: "active",
    hireDate: "2023-05-20",
    projectsCompleted: 67,
    totalEarnings: 892000,
  },
  {
    id: "3",
    name: "Микола Шевченко",
    role: "installer",
    phone: "+380 63 345 67 89",
    email: "m.shevchenko@mebliary.ua",
    salary: 0,
    salaryType: "percentage",
    percentageRate: 70,
    status: "active",
    hireDate: "2023-08-10",
    projectsCompleted: 52,
    totalEarnings: 685000,
  },
  {
    id: "4",
    name: "Андрій Мельник",
    role: "designer",
    phone: "+380 97 456 78 90",
    email: "a.melnyk@mebliary.ua",
    salary: 28000,
    salaryType: "fixed",
    status: "active",
    hireDate: "2023-02-01",
    projectsCompleted: 85,
    totalEarnings: 336000,
  },
  {
    id: "5",
    name: "Василь Бондаренко",
    role: "driver",
    phone: "+380 66 567 89 01",
    email: "v.bondarenko@mebliary.ua",
    salary: 18000,
    salaryType: "fixed",
    status: "active",
    hireDate: "2024-01-15",
    projectsCompleted: 0,
    totalEarnings: 72000,
  },
  {
    id: "6",
    name: "Сергій Ткаченко",
    role: "installer",
    phone: "+380 93 678 90 12",
    email: "s.tkachenko@mebliary.ua",
    salary: 0,
    salaryType: "percentage",
    percentageRate: 70,
    status: "inactive",
    hireDate: "2022-11-20",
    projectsCompleted: 124,
    totalEarnings: 1456000,
  },
]

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)

  const handleAddMember = (memberData: Omit<TeamMember, "id" | "projectsCompleted" | "totalEarnings">) => {
    const newMember: TeamMember = {
      ...memberData,
      id: Date.now().toString(),
      projectsCompleted: 0,
      totalEarnings: 0,
    }
    setMembers([...members, newMember])
  }

  const handleUpdateMember = (updatedMember: TeamMember) => {
    setMembers(members.map((m) => (m.id === updatedMember.id ? updatedMember : m)))
  }

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader title="Команда" />
      <main className="flex-1 p-6">
        <TeamTable
          members={members}
          onAddMember={handleAddMember}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
        />
      </main>
    </div>
  )
}
