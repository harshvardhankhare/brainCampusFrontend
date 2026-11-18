import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import StudentRegister from './StudentRegister';
import api from '../../api/axios';
import { renderWithProviders } from '../../test/renderWithProviders';

vi.mock('../../api/axios', () => ({ default: { post: vi.fn() } }));
const app = () => <Routes><Route path="/student-register" element={<StudentRegister />} /><Route path="/login" element={<h1>Sign in</h1>} /></Routes>;

describe('StudentRegister', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates required fields and the minimum password length', () => {
    renderWithProviders(app(), { route: '/student-register' });
    expect(screen.getByLabelText('School code')).toBeRequired();
    expect(screen.getByLabelText('Student email')).toBeRequired();
    expect(screen.getByLabelText('Password')).toHaveAttribute('minLength', '8');
  });

  it('submits registration details and shows success with a sign in link', async () => {
    vi.mocked(api.post).mockResolvedValue({} as never);
    const user = userEvent.setup();
    renderWithProviders(app(), { route: '/student-register' });
    await user.type(screen.getByLabelText('School code'), 'NORTH1');
    await user.type(screen.getByLabelText('Student email'), 'learner@school.edu');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: /create student account/i }));
    expect(await screen.findByRole('heading', { name: 'Account created' })).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith('/auth/student-register', { schoolCode: 'NORTH1', email: 'learner@school.edu', password: 'secret123' });
    await user.click(screen.getByRole('link', { name: 'Go to student sign in' }));
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows API errors and leaves the form available for correction', async () => {
    vi.mocked(api.post).mockRejectedValue({ response: { data: { message: 'Email already registered' } } });
    const user = userEvent.setup();
    renderWithProviders(app(), { route: '/student-register' });
    await user.type(screen.getByLabelText('School code'), 'NORTH1');
    await user.type(screen.getByLabelText('Student email'), 'learner@school.edu');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: /create student account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email already registered');
    expect(screen.getByLabelText('Student email')).toBeInTheDocument();
  });
});
