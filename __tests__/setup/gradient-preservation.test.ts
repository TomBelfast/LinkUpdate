import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Gradient Preservation Tests', () => {
  const cssFile = path.join(process.cwd(), 'app/globals.css')
  let cssContent: string

  beforeAll(() => {
    cssContent = fs.readFileSync(cssFile, 'utf-8')
  })

  it('should have all required gradient classes defined', () => {
    const requiredGradients = [
      'gradient-button',
      'edit-gradient', 
      'delete-gradient',
      'copy-gradient',
      'share-gradient',
      'user-logged-gradient',
      'auth-panel-gradient',
      'uploading-gradient',
      'loading-border'
    ]

    requiredGradients.forEach(className => {
      expect(cssContent).toMatch(new RegExp(`\\.${className}\\s*\\{`))
      console.log(`✅ Found gradient class: .${className}`)
    })
  })

  it('should preserve exact gradient color values', () => {
    // Test main gradient colors
    const mainGradientColors = [
      '#ff6b6b', // red
      '#ffd93d', // yellow  
      '#6c5ce7'  // purple
    ]

    mainGradientColors.forEach(color => {
      expect(cssContent).toContain(color)
      console.log(`✅ Color preserved: ${color}`)
    })

    // Test edit gradient (green)
    const editColors = ['#4ade80', '#22c55e', '#86efac']
    editColors.forEach(color => {
      expect(cssContent).toContain(color)
    })

    // Test delete gradient (red)
    const deleteColors = ['#ef4444', '#dc2626', '#fca5a5']
    deleteColors.forEach(color => {
      expect(cssContent).toContain(color)
    })
  })

  it('should have hover and animation effects', () => {
    // Test hover effects
    expect(cssContent).toMatch(/\.gradient-button:hover\s*\{/)
    expect(cssContent).toContain('transform: translateY(-2px)')
    expect(cssContent).toContain('box-shadow: 0 5px 15px')
    
    // Test active effects
    expect(cssContent).toMatch(/\.gradient-button:active\s*\{/)
    expect(cssContent).toContain('transform: translateY(0)')

    // Test animations
    expect(cssContent).toContain('@keyframes gradient')
    expect(cssContent).toContain('animation: gradient 15s ease infinite')

    console.log('✅ All hover and animation effects preserved')
  })

  it('should support dark mode variants', () => {
    expect(cssContent).toMatch(/\.dark\s+\.gradient-button/)
    expect(cssContent).toMatch(/\.dark\s+\.user-logged-gradient/)
    expect(cssContent).toMatch(/\.dark\s+\.auth-panel-gradient/)
    
    console.log('✅ Dark mode variants preserved')
  })

  it('should have accessibility features', () => {
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)')
    expect(cssContent).toMatch(/animation:\s*none/)
    expect(cssContent).toMatch(/transition:\s*none/)
    
    console.log('✅ Accessibility (reduced motion) support preserved')
  })

  it('should count gradient usage in components', () => {
    const componentDir = path.join(process.cwd(), 'components')
    const appDir = path.join(process.cwd(), 'app')
    
    let gradientUsageCount = 0
    
    // Count in components
    if (fs.existsSync(componentDir)) {
      const componentFiles = fs.readdirSync(componentDir, { recursive: true })
        .filter(file => file.toString().endsWith('.tsx'))
      
      componentFiles.forEach(file => {
        const filePath = path.join(componentDir, file.toString())
        const content = fs.readFileSync(filePath, 'utf-8')
        const matches = content.match(/gradient-button|edit-gradient|delete-gradient/g)
        if (matches) {
          gradientUsageCount += matches.length
        }
      })
    }
    
    // Count in app directory
    if (fs.existsSync(appDir)) {
      const appFiles = getAllTsxFiles(appDir)
      
      appFiles.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf-8')
        const matches = content.match(/gradient-button|edit-gradient|delete-gradient/g)
        if (matches) {
          gradientUsageCount += matches.length
        }
      })
    }
    
    console.log(`📊 Total gradient usage count: ${gradientUsageCount}`)
    expect(gradientUsageCount).toBeGreaterThan(40) // Znaleźliśmy 47 użyć - to dużo!
  })

  it('should preserve border-box gradient technique', () => {
    expect(cssContent).toContain('background: linear-gradient(#000, #000) padding-box,')
    expect(cssContent).toContain('border-box')
    expect(cssContent).toContain('border: 4px solid transparent')
    
    console.log('✅ Advanced border-box gradient technique preserved')
  })
})

function getAllTsxFiles(dir: string): string[] {
  const files: string[] = []
  
  const items = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files.push(...getAllTsxFiles(fullPath))
    } else if (item.isFile() && item.name.endsWith('.tsx')) {
      files.push(fullPath)
    }
  }
  
  return files
}