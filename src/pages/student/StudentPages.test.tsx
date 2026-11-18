import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { StudentFees, StudentHome, StudentProfile } from './StudentPages';
import api from '../../api/axios';
import { renderWithProviders } from '../../test/renderWithProviders';

vi.mock('../../api/axios', () => ({ default: { get: vi.fn() } }));

describe('student portal pages', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the student name, class details, and quick access links on home', () => {
    renderWithProviders(<StudentHome />, { user: { role: 'STUDENT', student: { firstName: 'Asha', className: '8', section: 'B', academicYear: '2026-27' } } });
    expect(screen.getByRole('heading', { name: /Good to see you, Asha/ })).toBeInTheDocument();
    expect(screen.getByText('Class 8')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View profile/ })).toHaveAttribute('href', '/student-dashboard/profile');
    expect(screen.getByRole('link', { name: /View fee details/ })).toHaveAttribute('href', '/student-dashboard/fees');
  });

  it('renders known profile fields and a fallback for missing details', () => {
    renderWithProviders(<StudentProfile />, { user: { student: { firstName: 'Asha', lastName: 'Rao', email: 'asha@school.edu', className: '8' } } });
    expect(screen.getByRole('heading', { name: 'Asha Rao' })).toBeInTheDocument();
    expect(screen.getByText('asha@school.edu')).toBeInTheDocument();
    expect(screen.getAllByText('Not added yet').length).toBeGreaterThan(0);
  });

  it('explains when the student account has no linked student record', () => {
    renderWithProviders(<StudentFees />, { user: { role: 'STUDENT' } });
    expect(screen.getByRole('heading', { name: 'Fee records will show here' })).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('summarizes paid, partial, and pending fees from the API', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [
      { id: 1, description: 'Tuition', amount: 1000, paid: true, academicYear: '2026-27' },
      { id: 2, feeType: 'LAB_FEE', amount: 500, paidAmount: 200 },
      { id: 3, amount: 300 },
    ] } } as never);
    renderWithProviders(<StudentFees />, { user: { studentId: 'student-1' } });
    expect(await screen.findByText('Tuition')).toBeInTheDocument();
    expect(screen.getByText('₹1,800')).toBeInTheDocument();
    expect(screen.getByText('₹1,200')).toBeInTheDocument();
    expect(screen.getByText('₹600')).toBeInTheDocument();
    expect(screen.getByText('Partial')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/student-fees/student/student-1');
  });

  it('shows a useful message when fee loading fails', async () => {
    vi.mocked(api.get).mockRejectedValue({ response: { data: { message: 'Fees are temporarily unavailable' } } });
    renderWithProviders(<StudentFees />, { user: { studentId: 42 } });
    expect(await screen.findByText('Fees are temporarily unavailable')).toBeInTheDocument();
  });
});
