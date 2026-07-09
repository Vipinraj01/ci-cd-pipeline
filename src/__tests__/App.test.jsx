import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App.jsx'

describe('App component', () => {
  it('renders the heading', () => {
    render(<App />)
    expect(screen.getByText('Get started')).toBeTruthy()
  })

  it('renders the counter button', () => {
    render(<App />)
    expect(screen.getByText(/Count is/i)).toBeTruthy()
  })
})
