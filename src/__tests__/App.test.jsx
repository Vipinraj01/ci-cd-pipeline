import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App.jsx'

describe('App', () => {
  it('returns status 200 and renders the header correctly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve([]),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeTruthy()
    })

    expect(mockFetch).toHaveBeenCalledOnce()
    const response = await mockFetch.mock.results[0].value
    expect(response.status).toBe(200)
    expect(screen.getByText('Users').tagName).toBe('H1')
  })
})
