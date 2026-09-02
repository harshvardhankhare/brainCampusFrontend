// src/pages/dashboard/AdminOptions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, BookOpen, Settings, BarChart } from 'lucide-react';
import styles from './AdminOptions.module.css';

const AdminOptions = () => {
  const navigate = useNavigate();

  const adminCards = [
    {
      id: 'staff',
      title: 'Manage Staff',
      description: 'Add, edit, or remove staff members and manage their roles.',
      icon: Users,
      color: '#4f46e5',
      path: '/dashboard/staff',
    },
    {
      id: 'roles',
      title: 'Roles & Permissions',
      description: 'Configure user roles and access permissions.',
      icon: Shield,
      color: '#7c3aed',
      path: '/dashboard/roles', // not implemented yet
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure school details, academic years, and more.',
      icon: Settings,
      color: '#0ea5e9',
      path: '/dashboard/settings', // not implemented yet
    },
    {
      id: 'reports',
      title: 'Admin Reports',
      description: 'View audit logs, user activity, and administrative reports.',
      icon: BarChart,
      color: '#f59e0b',
      path: '/dashboard/reports', // not implemented yet
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Manage your institution's administrative settings and modules.</p>
      </div>
      <div className={styles.cardGrid}>
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={styles.card}
              onClick={() => navigate(card.path)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.cardIcon} style={{ backgroundColor: card.color }}>
                <Icon size={28} color="white" />
              </div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDescription}>{card.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardAction}>Manage →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOptions;