import { render, screen, fireEvent } from '@testing-library/react'
import { FileUploadZone } from '../file-upload-zone'

describe('FileUploadZone Component', () => {
  const mockOnUpload = jest.fn()

  beforeEach(() => {
    mockOnUpload.mockClear()
  })

  it('renders upload zone with text', () => {
    render(<FileUploadZone onUpload={mockOnUpload} />)
    expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument()
  })

  it('displays upload icon', () => {
    render(<FileUploadZone onUpload={mockOnUpload} />)
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument()
  })

  it('shows accepted file types when maxSize is specified', () => {
    render(
      <FileUploadZone 
        onUpload={mockOnUpload} 
        maxSize={5 * 1024 * 1024} 
        accept={{ 'image/*': ['.png', '.jpg'] }} 
      />
    )
    expect(screen.getByText(/max 5 mb/i)).toBeInTheDocument()
  })

  it('handles file drop', async () => {
    render(<FileUploadZone onUpload={mockOnUpload} />)
    
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    const input = screen.getByTestId('file-input')
    
    fireEvent.change(input, { target: { files: [file] } })
    
    expect(mockOnUpload).toHaveBeenCalledWith([file])
  })

  it('handles multiple file drops when multiple is enabled', async () => {
    render(<FileUploadZone onUpload={mockOnUpload} multiple />)
    
    const file1 = new File(['hello'], 'hello.png', { type: 'image/png' })
    const file2 = new File(['world'], 'world.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input')
    
    fireEvent.change(input, { target: { files: [file1, file2] } })
    
    expect(mockOnUpload).toHaveBeenCalledWith([file1, file2])
  })

  it('can be disabled', () => {
    render(<FileUploadZone onUpload={mockOnUpload} disabled />)
    const input = screen.getByTestId('file-input')
    expect(input).toBeDisabled()
  })

  it('shows error message when file is too large', async () => {
    render(<FileUploadZone onUpload={mockOnUpload} maxSize={1024} />)
    
    const largeFile = new File(['a'.repeat(2000)], 'large.txt', { type: 'text/plain' })
    const input = screen.getByTestId('file-input')
    
    fireEvent.change(input, { target: { files: [largeFile] } })
    
    expect(screen.getByText(/file is too large/i)).toBeInTheDocument()
  })

  it('displays custom placeholder text', () => {
    render(
      <FileUploadZone 
        onUpload={mockOnUpload} 
        placeholder="Upload your documents here" 
      />
    )
    expect(screen.getByText('Upload your documents here')).toBeInTheDocument()
  })
})
