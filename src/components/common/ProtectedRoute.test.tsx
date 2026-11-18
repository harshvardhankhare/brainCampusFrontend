import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute, { isStudentRole } from './ProtectedRoute';
import { renderWithProviders } from '../../test/renderWithProviders';

const Location = () => <output data-testid="location">{useLocation().pathname}</output>;
const routes = (area: 'staff' | 'student') => (
  <>
    <Routes>
      <Route path="/login" element={<p>Login page</p>} />
      <Route path="/dashboard" element={<p>Staff dashboard</p>} />
      <Route path="/student-dashboard" element={<p>Student dashboard</p>} />
      <Route path="/private" element={<ProtectedRoute area={area}><p>Private content</p></ProtectedRoute>} />
    </Routes>
    <Location />
  </>
);

describe('ProtectedRoute', () => {
  it('shows a loading state until auth initialization completes', () => {
    renderWithProviders(routes('staff'), { route: '/private', initialized: false });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('sends unauthenticated visitors to login', () => {
    renderWithProviders(routes('staff'), { route: '/private' });
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('keeps a staff user in the staff area', () => {
    renderWithProviders(routes('staff'), { route: '/private', user: { role: 'ADMIN' } });
    expect(screen.getByText('Private content')).toBeInTheDocument();
  });

  it('redirects students away from staff routes and staff away from student routes', () => {
    const staffRoute = renderWithProviders(routes('staff'), { route: '/private', user: { role: ' student ' } });
    expect(screen.getByText('Student dashboard')).toBeInTheDocument();
    staffRoute.unmount();

    renderWithProviders(routes('student'), { route: '/private', user: { role: 'TEACHER' } });
    expect(screen.getByText('Staff dashboard')).toBeInTheDocument();
  });

  it('recognizes the student role without case or whitespace sensitivity', () => {
    expect(isStudentRole(' student ')).toBe(true);
    expect(isStudentRole('teacher')).toBe(false);
    expect(isStudentRole(undefined)).toBe(false);
  });
});
