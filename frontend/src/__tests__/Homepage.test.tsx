import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Homepage from '../pages/Homepage';

describe('Homepage', () => {
  it('renders main headings', () => {
    render(
      <MemoryRouter>
        <Homepage />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/LLM Security Demo/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Interactive Vulnerability Demonstrations/i })).toBeInTheDocument();
  });
});