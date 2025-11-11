/**
 * JobSearchForm Component Tests
 * RED Phase - TDD
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JobSearchForm } from '@/components/forms/JobSearchForm';

// Mock fetch
global.fetch = jest.fn();

describe('JobSearchForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form with input and button', () => {
    render(<JobSearchForm />);
    
    expect(screen.getByPlaceholderText(/career page url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search jobs/i })).toBeInTheDocument();
  });

  it('should have AI filter checkbox', () => {
    render(<JobSearchForm />);
    
    expect(screen.getByLabelText(/ai\/ml jobs only/i)).toBeInTheDocument();
  });

  it('should display loading state while searching', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ jobs: [], company: 'Test' })
      }), 100))
    );

    render(<JobSearchForm />);
    
    const input = screen.getByPlaceholderText(/career page url/i);
    const button = screen.getByRole('button', { name: /search jobs/i });
    
    fireEvent.change(input, { target: { value: 'https://jobs.lever.co/spotify' } });
    fireEvent.click(button);
    
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });

  it('should call API with correct URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        jobs: [
          {
            title: 'AI Engineer',
            company: 'Spotify',
            location: 'Stockholm',
            url: 'https://jobs.lever.co/spotify/ai'
          }
        ],
        company: 'Spotify'
      })
    });

    render(<JobSearchForm />);
    
    const input = screen.getByPlaceholderText(/career page url/i);
    const button = screen.getByRole('button', { name: /search jobs/i });
    
    fireEvent.change(input, { target: { value: 'https://jobs.lever.co/spotify' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/scrape',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            url: 'https://jobs.lever.co/spotify',
            filterAI: false
          })
        })
      );
    });
  });

  it('should call onJobsFound callback with results', async () => {
    const mockJobs = [
      {
        title: 'AI Engineer',
        company: 'Spotify',
        location: 'Stockholm',
        url: 'https://jobs.lever.co/spotify/ai'
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobs: mockJobs, company: 'Spotify' })
    });

    const onJobsFound = jest.fn();
    render(<JobSearchForm onJobsFound={onJobsFound} />);
    
    const input = screen.getByPlaceholderText(/career page url/i);
    const button = screen.getByRole('button', { name: /search jobs/i });
    
    fireEvent.change(input, { target: { value: 'https://jobs.lever.co/spotify' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(onJobsFound).toHaveBeenCalledWith(mockJobs, 'Spotify', true);
    });
  });

  it('should apply AI filter when checkbox is checked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobs: [], company: 'Spotify' })
    });

    render(<JobSearchForm />);
    
    const input = screen.getByPlaceholderText(/career page url/i);
    const checkbox = screen.getByLabelText(/ai\/ml jobs only/i);
    const button = screen.getByRole('button', { name: /search jobs/i });
    
    fireEvent.change(input, { target: { value: 'https://jobs.lever.co/spotify' } });
    fireEvent.click(checkbox);
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/scrape',
        expect.objectContaining({
          body: JSON.stringify({
            url: 'https://jobs.lever.co/spotify',
            filterAI: true
          })
        })
      );
    });
  });

  it('should display error message on API failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to scrape' })
    });

    render(<JobSearchForm />);
    
    const input = screen.getByPlaceholderText(/career page url/i);
    const button = screen.getByRole('button', { name: /search jobs/i });
    
    fireEvent.change(input, { target: { value: 'https://invalid-url' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to scrape/i)).toBeInTheDocument();
    });
  });

  it('should validate URL format before submitting', () => {
    render(<JobSearchForm />);
    
    const input = screen.getByPlaceholderText(/career page url/i);
    const button = screen.getByRole('button', { name: /search jobs/i });
    
    fireEvent.change(input, { target: { value: 'invalid-url' } });
    fireEvent.click(button);
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should disable button while loading', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ jobs: [], company: 'Test' })
      }), 100))
    );

    render(<JobSearchForm />);
    
    const input = screen.getByPlaceholderText(/career page url/i);
    const button = screen.getByRole('button', { name: /search jobs/i });
    
    fireEvent.change(input, { target: { value: 'https://jobs.lever.co/spotify' } });
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
  });
});

