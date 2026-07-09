import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App.jsx'

const mockUsers = [
  { id: 1, name: 'Alice', email: 'alice@test.com' },
  { id: 2, name: 'Bob', email: 'bob@test.com' },
]

describe('App', () => {
  it('shows loading then renders users on status 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve(mockUsers),
      }),
    )

    render(<App />)
    expect(screen.getByText('Loading...')).toBeTruthy()

    await waitFor(() => {
      expect(screen.getByText('Alice — alice@test.com')).toBeTruthy()
    })
    expect(screen.getByText('Bob — bob@test.com')).toBeTruthy()
  })

  it('shows error on non-200 status code', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 500,
        ok: false,
      }),
    )

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Request failed: Status 500')).toBeTruthy()
    })
  })

  it('shows error on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    )

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Request failed: Network error')).toBeTruthy()
    })
  })
})
