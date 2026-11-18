import type { ReactNode } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import authReducer from '../redux/authSlice';

export function renderWithProviders(
  ui: ReactNode,
  { route = '/', user = null, initialized = true }: { route?: string; user?: unknown; initialized?: boolean } = {},
) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user, loading: false, initialized },
    },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>,
    ),
  };
}
