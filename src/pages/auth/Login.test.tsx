import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './Login';
import api from '../../api/axios';
import { renderWithProviders } from '../../test/renderWithProviders';

vi.mock('../../api/axios', () => ({ default: { post: vi.fn(), get: vi.fn() } }));
const Location = () => <output data-testid="location">{useLocation().pathname}</output>;
const app = () => <><Routes><Route path="/login" element={<Login />} /><Route path="/dashboard" element={<h1>Staff dashboard</h1>} /><Route path="/student-dashboard" element={<h1>Student dashboard</h1>} /></Routes><Location /></>;

describe('Login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires school code, email, and password', () => {
    renderWithProviders(app(), { route: '/login' });
    expect(screen.getByLabelText('School Code')).toBeRequired();
    expect(screen.getByLabelText('Email Address')).toBeRequired();
    expect(screen.getByLabelText('Password')).toBeRequired();
  });

  it('submits credentials and sends staff to the staff dashboard', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { accessToken: 'token-1', user: { role: 'ADMIN' } } } } as never);
    const user = userEvent.setup();
    renderWithProviders(app(), { route: '/login' });
    await user.type(screen.getByLabelText('School Code'), 'NORTH1');
    await user.type(screen.getByLabelText('Email Address'), 'staff@school.edu');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await screen.findByRole('heading', { name: 'Staff dashboard' });
    expect(api.post).toHaveBeenCalledWith('/auth/login', { schoolCode: 'NORTH1', email: 'staff@school.edu', password: 'secret123' });
    expect(localStorage.getItem('token')).toBe('token-1');
  });

  it('loads the current user when login response omits it and routes student accounts', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { accessToken: 'student-token' } } } as never);
    vi.mocked(api.get).mockResolvedValue({ data: { data: { role: 'STUDENT' } } } as never);
    const user = userEvent.setup();
    renderWithProviders(app(), { route: '/login' });
    await user.type(screen.getByLabelText('School Code'), 'NORTH1');
    await user.type(screen.getByLabelText('Email Address'), 'learner@school.edu');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await screen.findByRole('heading', { name: 'Student dashboard' });
    expect(api.get).toHaveBeenCalledWith('/auth/me');
  });

  it('shows the server error on failed login and allows retry', async () => {
    vi.mocked(api.post).mockRejectedValue({ response: { data: { message: 'School code is invalid' } } });
    const user = userEvent.setup();
    renderWithProviders(app(), { route: '/login' });
    await user.type(screen.getByLabelText('School Code'), 'BAD');
    await user.type(screen.getByLabelText('Email Address'), 'person@school.edu');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(await screen.findByText('School code is invalid')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled());
  });
});
